/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * AudioContext
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.9
 */
;define(function AC(require, exports, module){
    var Listener        = require("mod/se/listener");
    var HandleStack     = Listener.HandleStack;

    //@see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
    var AudioContext = (function(){
        var vendors = ["webkit", "moz", "ms", "O", ""];
        var size = vendors.length;
        var key = "AudioContext";
        var vendor = null;
        var ac = null;

        for(var i = 0; i < size; i++){
            vendor = vendors[i];

            ac = vendor + key;

            if(ac in window){
                return window[ac];
            }
        }

        return undefined;
    })();

    var _AudioContext = function(name){
        this.name = name;
        this.audioContext = AudioContext ? new AudioContext(): undefined;
        this.support = undefined !== this.audioContext;
        this.audioList = [
            //{
            //  type            音频类型， remote - 远程链接  local - 本地文件
            //  name            音频名称
            //  url             音频地址 或 本地音频文件(File对象)
            //  ------------------------------------------------------------
            //  buffer          音频解码后的buffer数据，由接口赋值更新
            //  audioContext    AudioContext实例引用，由接口赋值更新
            //  source          音频解码出来的数据源，由接口赋值更新
            //}
        ];
        this.total = 0;
        this.loaded = 0;

        this.playing = undefined;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onsupport: null,
            onplaybefore: null,
            onplayafter: null,
            onnotfound: null,
            ondataloadbefore: null,
            ondataloadsuccess: null,
            ondataloaderror: null,
            ondataloaddone: null,
            ondataloadprogress: null,
            ondecodecomplete: null,
            ondecodesuccess: null,
            ondecodefail: null
        }, this.handleStack);

        if(!this.supported()){
            console.warn("Your browser/device not support AudioContext!");
        }
    };

    _AudioContext.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec: function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set: function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove: function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get: function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear: function(){
            this.listener.clear();
        },
        getHandleStack: function(){
            return this.handleStack;
        },
        supported: function(){
            return this.support === true;
        },
        clearAudioList: function(){
            this.audioList.length = 0;
            this.audioList = [];
            this.total = 0;
        },
        setAudioList: function(audioList){
            this.clearAudioList();
            this.audioList = [].concat(audioList || []);
            this.total = this.audioList.length;
        },
        getAudioList: function(){
            return [].concat(this.audioList);
        },
        concatAudioList: function(audioList, isStart){
            var list = this.getAudioList();

            if(true === isStart){
                list = (audioList || []).concat(list);
            }else{
                list = list.concat[audioList || []];
            }

            this.setAudioList(list);
        },
        getAudioData: function(index){
            var list = this.getAudioList();
            var size = this.total;

            if(index >= 0 && index < size){
                return list[index] || null;
            }

            return null;
        },
        addAudioData: function(audio){
            var list = this.getAudioList();

            list.push(audio);

            this.setAudioList(list);
        },
        insertAudioData: function(index, audio, isAfter){
            var list = this.getAudioList();
            var size = this.total;

            if(index >= 0 && index < size){
                if(true === isAfter){
                    list.splice(index + 1, 0, audio);
                }else{
                    list.splice(index, 0, audio);
                }

                this.setAudioList(list);
            }else{
                this.addAudioData(audio);
            }
        },
        updateAudioData: function(index, audio){
            var list = this.getAudioList();
            var size = this.total;

            if(index >= 0 && index < size){
                list.splice(index, 1, audio);

                this.setAudioList(list);
            }
        },
        removeAudioData: function(index){
            var list = this.getAudioList();
            var size = this.total;

            if(index >= 0 && index < size){
                list.splice(index, 1);

                this.setAudioList(list);
            }
        },
        checkLoadDone: function(){
            var done = this.loaded >= this.total;

            if(true === done){
                this.exec("dataloaddone", []);
            }else{
                this.exec("dataloadprogress", [this.loaded, this.total]);
            }
        },
        load: function(){
            this.exec("support", [this.supported(), this.audioContext]);
            
            if(this.supported()){
                this.exec("dataloadbefore", [this.audioContext]);
                this.loaded = 0;
                this.loadAudioBuffer(0);
            }
        },
        loadAudioBuffer: function(index){
            var ins = this;
            var ctx = ins.audioContext;
            var audio = ins.getAudioData(index);
            var next = ins.getAudioData(index + 1);

            if(audio){ //有音频文件
                if(!audio.buffer){ //没有数据
                    if("local" === audio.type){
                        var fileReader = new FileReader();

                        fileReader.onload = function(e){
                            ins.exec("dataloadsuccess", [e, ctx, index]);
                            ins.loaded++;
                            ins.checkLoadDone();
                            ins.decode(e.target.result, index, next);
                        }
                        fileReader.onerror = function(e){
                            ins.exec("dataloaderror", [e, ctx, index]);
                            ins.loaded++;
                            ins.checkLoadDone();
                        }

                        fileReader.readAsArrayBuffer(audio.url);
                    }else{
                        var xhr = new XMLHttpRequest();

                        xhr.open("GET", audio.url, true);

                        xhr.responseType = "arraybuffer";

                        xhr.onload = function(e){
                            ins.exec("dataloadsuccess", [e, ctx, index]);
                            ins.loaded++;
                            ins.checkLoadDone();
                            ins.decode(xhr.response, index, next);
                        };
                        xhr.onerror = function(e){
                            ins.exec("dataloaderror", [e, ctx, index]);
                            ins.loaded++;
                            ins.checkLoadDone();
                        }

                        xhr.send();
                    }
                }else{ //有数据，已解码
                    ins.loaded++;
                    ins.checkLoadDone();

                    ins.loadAudioBuffer(index + 1); //加载下一个
                }
            }
        },
        decode: function(data, index, next){
            var ins = this;
            var ctx = ins.audioContext;

            ctx.decodeAudioData(data, function success(buffer){
                var source = ctx.createBufferSource();

                source.buffer = buffer;

                ins.update(index, buffer, ctx, null);

                ins.exec("decodesuccess", [null, ctx, index]);
                
                if(next){
                    ins.loadAudioBuffer(index + 1);
                }else{
                    ins.exec("decodecomplete", [null, ctx]);
                }
            }, function fail(e){
                ins.update(index, null, null, null);

                ins.exec("decodefail", [e, ctx, index]);

                if(next){
                    ins.loadAudioBuffer(index + 1);
                }else{
                    ins.exec("decodecomplete", [e, ctx]);
                }
            });
        },
        update: function(index, buffer, ctx, source){
            var audio = this.getAudioData(index);

            if(audio){
                audio.buffer = buffer || null;
                audio.audioContext = ctx || null;
                audio.source = source || null;

                this.updateAudioData(index, audio);
            }
        },
        play: function(index, when){
            index = index || 0;
            when = when || 0;

            var audio = this.getAudioData(index);
            var source = null;

            if(audio && audio.buffer && audio.audioContext){
                this.playing = true;

                source = audio.audioContext.createBufferSource();
                
                this.update(index, audio.buffer, audio.audioContext, source);

                //实现 conntect 
                this.exec("playbefore", [index]);

                source.buffer = audio.buffer;
                source.start(when);

                this.exec("playafter", [index]);
            }
        },
        stop: function(index, when){
            index = index || 0;
            when = when || 0;

            var audio = this.getAudioData(index);
            var source = null;

            if(audio && audio.source){
                this.playing = false;

                source = audio.source;
                source.stop(when);
            }
        },
        pause: function(index){
            if(undefined === this.playing || false === this.playing){
                this.play(index, this.audioContext.currentTime);
            }else{
                this.stop(index, this.audioContext.currentTime);
            }
        },
        close: function(){
            var ctx = this.audioContext;

            if(ctx && ctx.close){
                this.playing = false;

                ctx.close();
            }
        },
        resume: function(){
            var ctx = this.audioContext;

            if(ctx && ctx.resume && ctx.state === 'suspended'){
                this.playing = true;

                ctx.resume();
            }
        },
        suspend: function(){
            var ctx = this.audioContext;

            if(ctx && ctx.suspend && ctx.state === 'running'){
                this.playing = false;

                ctx.suspend();
            }
        },
        destroy: function(){
            this.close();
            this.clear();
            this.clearAudioList();
            this.audioContext = null;
            this.loaded = 0;
            this.playing = undefined;

            //清除缓存
            var name = this.name;
            if(name in _AudioContext.Cache){
                _AudioContext.Cache[name] = null;

                delete _AudioContext.Cache[name];
            }
        }
    };

    _AudioContext.Cache = {};
    _AudioContext.newInstance = function(name){
        var ac = _AudioContext.Cache[name] || (_AudioContext.Cache[name] = new _AudioContext(name));

        return {
            context: ac.audioContext,
            set: function(type, option){
                ac.set(type, option);

                return this;
            },
            getHandleStack: function(){
                return ac.getHandleStack();
            },
            supported: function(){
                return ac.supported();
            },
            clearAudioList: function(){
                ac.clearAudioList();

                return this;
            },
            setAudioList: function(audioList){
                ac.setAudioList(audioList);

                return this;
            },
            getAudioList: function(){
                return ac.getAudioList();
            },
            concatAudioList: function(audioList, isStart){
                ac.concatAudioList(audioList, isStart);

                return this;
            },
            getAudioData: function(index){
                return ac.getAudioData(index);
            },
            addAudioData: function(audio){
                ac.addAudioData(audio);

                return this;
            },
            insertAudioData: function(index, audio, isAfter){
                ac.insertAudioData(index, audio, isAfter);

                return this;
            },
            updateAudioData: function(index, audio){
                ac.updateAudioData(index, audio);

                return this;
            },
            removeAudioData: function(index){
                ac.removeAudioData(index);

                return this;
            },
            load: function(list){
                ac.load(list);

                return this;
            },
            play: function(index, when){
                ac.play(index, when);

                return this;
            },
            stop: function(index, when){
                ac.stop(index, when);

                return this;
            },
            pause: function(index){
                ac.pause(index);

                return this;
            },
            close: function(){
                ac.close();

                return this;
            },
            resume: function(){
                ac.resume();

                return this;
            },
            suspend: function(){
                ac.suspend();

                return this;
            },
            destroy: function(){
                ac.destroy();

                return this;
            }
        };
    };
    _AudioContext.getInstance = function(name){
        if(name in _AudioContext.Cache){
            return _AudioContext.newInstance(name);
        }

        return null;
    };

    var _pub = {
        "version": "R17B0917",
        newInstance: function(name){
            return _AudioContext.newInstance(name);
        },
        getInstance: function(name){
            return _AudioContext.getInstance(name);
        },
        destroy: function(name){
            if(name){
                var ins = this.getInstance(name);

                if(ins){
                    ins.destroy();
                }
            }else{
                for(var n in _AudioContext.Cache){
                    if(_AudioContext.Cache.hasOwnProperty(n)){
                        this.destroy(n);
                    }
                }
            }
        }
    };

    module.exports = _pub;
});
