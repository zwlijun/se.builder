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
    var Listener      = require("mod/se/listener");

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

    var _AudioContext = function(){
        this.context = AudioContext ? new AudioContext() : undefined;
        this.support = undefined !== this.context;
        this.audioList = [];
        this.size = 0;
        this.playing = undefined;

        this.listener = new Listener({
            onsupport: null,
            onerror: null,
            onplaybefore: null,
            onload: null,
            oncomplete: null,
            ondecodesuccess: null,
            ondecodefail: null
        });

        // if(!this.context){
        //     throw new Error("you browser/device not support AudioContext!");
        // }
    };

    _AudioContext.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listener.clear();
        },
        load: function(audioList){
            this.audioList = audioList; //{name, url, buffer, context}
            this.size = this.audioList.length;

            if(this.support){
                this.loadAudioBuffer(0);
            }

            this.exec("support", [this.audioList, this.context, this.support]);
        },
        loadAudioBuffer : function(index){
            var xhr = new XMLHttpRequest();
            var ins = this;
            var ctx = ins.context;
            var audio = this.audioList[index];
            var next = this.audioList[index + 1];

            if(audio && !audio.buffer && !audio.source){
                xhr.open("GET", audio.url, true);

                xhr.responseType = "arraybuffer";

                xhr.onload = function(e){
                    ins.exec("load", [e, ctx]);
                    ins.decode(xhr.response, index, next);
                };
                xhr.onerror = function(e){
                    ins.exec("error", [e, ctx]);
                }

                xhr.send();
            }else{
                ins.exec("load", [null, ctx]);
                ins.exec("decodesuccess", [null, ctx, ins.audioList[index]]);

                if(next){
                    ins.loadAudioBuffer(index + 1);
                }else{
                    ins.exec("complete", [null, ctx, ins.audioList]);
                }
            }
        },
        decode : function(data, index, next){
            var ins = this;
            var ctx = ins.context;

            ctx.decodeAudioData(data, function success(buffer){
                var source = ctx.createBufferSource();

                source.buffer = buffer;

                ins.update(index, buffer, ctx, null);

                ins.exec("decodesuccess", [null, ctx, ins.audioList[index]]);
                
                if(next){
                    ins.loadAudioBuffer(index + 1);
                }else{
                    ins.exec("complete", [null, ctx, ins.audioList]);
                }
            }, function fail(e){
                ins.update(index, null, null, null);

                ins.exec("decodefail", [e, ctx, ins.audioList[index]]);

                if(next){
                    ins.loadAudioBuffer(index + 1);
                }else{
                    ins.exec("complete", [null, ctx, ins.audioList]);
                }
            });
        },
        update : function(index, buffer, ctx, source){
            this.audioList[index].buffer = buffer || null;
            this.audioList[index].context = ctx || null;
            this.audioList[index].source = source || null;
        },
        play : function(index, when){
            var conf = this.audioList[index||0];
            var source = null;

            if(conf.buffer && conf.context){
                this.playing = true;

                source = conf.context.createBufferSource();
                source.buffer = conf.buffer;

                this.update(index||0, conf.buffer, conf.context, source);

                this.exec("playbefore", [conf, source]);

                source.start(when || 0);
            }
        },
        stop : function(index, when){
            var conf = this.audioList[index||0];
            var source = conf.source;

            if(source){
                this.playing = false;

                source.stop(when || 0);
            }
        },
        pause : function(index){
            if(undefined === this.playing || false === this.playing){
                this.play(index, this.context.currentTime);
            }else{
                this.stop(index, this.context.currentTime);
            }
        }
    };

    _AudioContext.Cache = {};

    var _pub = {
        getAudioContext : function(name){
            var ac = _AudioContext[name] || (_AudioContext[name] = new _AudioContext());

            return {
                context: ac.context,
                set : function(type, option){
                    ac.set(type, option);

                    return this;
                },
                load : function(list){
                    ac.load(list);

                    return this;
                },
                play : function(index, when){
                    ac.play(index, when);

                    return this;
                },
                stop : function(index, when){
                    ac.stop(index, when);

                    return this;
                },
                pause : function(index){
                    ac.pause(index);

                    return this;
                }
            }
        }
    };

    module.exports = _pub;
});
