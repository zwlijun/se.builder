/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 媒体模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function Media(require, exports, module){
    var Util                = require("mod/se/util");
    var Listener            = require("mod/se/listener");
    var HandleStack         = Listener.HandleStack;

    var MediaType = window["MediaType"] = {
        "AUDIO": "audio",
        "VIDEO": "video"
    };



    var MediaMIME = {
        conf: function(){
            return {
                "MP3":  {type: "/mpeg", "codec": {"audio":"",          "video":""}},
                "MP4":  {type: "/mp4",  "codec": {"audio":"mp4a.40.5", "video":"avc1.4D401E, mp4a.40.2"}},
                "OGG":  {type: "/ogg",  "codec": {"audio":"vorbis",    "video":"theora, vorbis"}},
                "WAV":  {type: "/wav",  "codec": {"audio":"",          "video":""}},
                "WEBM": {type: "/webm", "codec": {"audio":"",          "video":"vp8.0, vorbis"}}
            };
        },
        parse : function(type, src){
            var p = /\.(mp3|mp4|ogg|wav|webm)(\?.*)?$/gi;
            var result = null;
            var format = null;
            var mime = null;
            var conf = MediaMIME.conf();

            if(null != (result = p.exec(src))){
                format = result[1].toUpperCase();
                mime = conf[format];
                mime.type = type + mime.type;

                return mime;
            }else{
                console.error(" the media type is not supported, source(" + src + ")");
                return null;
            }
        }
    };

    //event order:
    //1. loadstart
    //2. durationchange
    //3. loadedmetadata
    //4. loadeddata
    //5. progress
    //6. canplay
    //7. canplaythrough

    var _Media = function(target, type, name){
        this.type = type || MediaType.AUDIO;
        this.src = null;
        this.name = name || "se_" + this.type + "_" + Util.GUID();
        this.target = $(target);
        this.mediaKey = Util.GUID();
        this.mime =  "";
        this.mediaNode = null;
        this.mediaDOM = null;

        this.listen = false;
        this.handleStack = new HandleStack();
        this.events = {
            onabort: null,                  //在退出时运行的脚本。
            oncanplay: null,                //当文件就绪可以开始播放时运行的脚本（缓冲已足够开始时）。
            oncanplaythrough: null,         //当媒介能够无需因缓冲而停止即可播放至结尾时运行的脚本。
            ondurationchange: null,         //当媒介长度改变时运行的脚本。
            onemptied: null,                //当发生故障并且文件突然不可用时运行的脚本（比如连接意外断开时）。
            onended: null,                  //当媒介已到达结尾时运行的脚本（可发送类似“感谢观看”之类的消息）。
            onerror: null,                  //当在文件加载期间发生错误时运行的脚本。
            onloadeddata: null,             //当媒介数据已加载时运行的脚本。
            onloadedmetadata: null,         //当元数据（比如分辨率和时长）被加载时运行的脚本。
            onloadstart: null,              //在文件开始加载且未实际加载任何数据前运行的脚本。
            onpause: null,                  //当媒介被用户或程序暂停时运行的脚本。
            onplay: null,                   //当媒介已就绪可以开始播放时运行的脚本。
            onplaying: null,                //当媒介已开始播放时运行的脚本。
            onprogress: null,               //当浏览器正在获取媒介数据时运行的脚本。
            onratechange: null,             //每当回放速率改变时运行的脚本（比如当用户切换到慢动作或快进模式）。
            onreadystatechange: null,       //每当就绪状态改变时运行的脚本（就绪状态监测媒介数据的状态）。
            onseeked: null,                 //当 seeking 属性设置为 false（指示定位已结束）时运行的脚本。
            onseeking: null,                //当 seeking 属性设置为 true（指示定位是活动的）时运行的脚本。
            onstalled: null,                //在浏览器不论何种原因未能取回媒介数据时运行的脚本。
            onsuspend: null,                //在媒介数据完全加载之前不论何种原因终止取回媒介数据时运行的脚本。
            ontimeupdate: null,             //当播放位置改变时（比如当用户快进到媒介中一个不同的位置时）运行的脚本。
            onvolumechange: null,           //每当音量改变时（包括将音量设置为静音）时运行的脚本。
            onwaiting: null                 //当媒介已停止播放但打算继续播放时（比如当媒介暂停已缓冲更多数据）运行脚本
        };
        this.listner = new Listener(this.events, this.handleStack);

        //-----------------------------------------------
        this.insert();
    };

    _Media.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listner.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listner.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listner.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listner.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listner.clear();
        },
        getHandleStack: function(){
            return this.handleStack;
        },
        dataset: {
            _dataset: {
                "attributes": {},
                "properties": {}
            },
            set: function(type, name, value){
                this._dataset[type][name] = value;
            },
            get: function(type, name){
                if(name in this._dataset[type]){
                    return this._dataset[type][name];
                }

                return undefined;
            },
            remove: function(type, name){
                if(name in this._dataset[type]){
                    delete this._dataset[type][name];
                }
            },
            render: function(media){
                var attrs = this._dataset["attributes"];
                var props = this._dataset["properties"];

                media.setAttributes(attrs);
                media.setProperties(props);
            }
        },
        getMediaDOM: function(){
            if(null === this.mediaDOM){
                this.mediaNode = $("#" + this.name);

                if(this.mediaNode && this.mediaNode.length > 0){
                    this.mediaDOM = this.mediaNode[0];
                }else{
                    this.mediaDOM = null;
                    this.mediaNode = null;
                }
            }

            return this.mediaDOM;
        },
        getMediaName: function(){
            return this.name;
        },
        setMediaKey: function(key){
            this.mediaKey = key;
        },
        getMediaKey: function(){
            return this.mediaKey;
        },
        getEvents: function(){
            var list = [];

            for(var e in this.events){
                if(this.events.hasOwnProperty(e)){
                    list.push(e.substr(2));
                }
            }

            return list;
        },
        setAttribute : function(name, value){
            var dom = this.getMediaDOM();

            if(dom){
                dom.setAttribute(name, value);
                this.dataset.set("attributes", name, value);
            }
        },
        getAttribute : function(name){
            var dom = this.getMediaDOM();

            if(dom){
                return dom.getAttribute(name);
            }else{
                return null;
            }
        },
        removeAttribute: function(name){
            var dom = this.getMediaDOM();

            if(dom){
                dom.removeAttribute(name);
                this.dataset.remove("attributes", name);
            }
        },
        hasAttribute: function(name){
            var dom = this.getMediaDOM();

            if(dom){
                return dom.hasAttribute(name);
            }

            return false;
        },
        setAttributes: function(attributes){
            for(var name in attributes){
                if(attributes.hasOwnProperty(name)){
                    this.setAttribute(name, attributes[name]);
                }
            }
        },
        setProperty: function(name, value){
            var dom = this.getMediaDOM();

            if(dom){
                dom[name] = value;
                this.dataset.set("properties", name, value);
            }
        },
        getProperty: function(name){
            var dom = this.getMediaDOM();

            if(dom){
                return dom[name];
            }

            return null;
        },
        setProperties: function(properties){
            for(var name in properties){
                if(properties.hasOwnProperty(name)){
                    this.setProperty(name, properties[name]);
                }
            }
        },
        eventHook: function(e){
            var data = e.data;
            var name = data.getMediaName();
            var key = data.getMediaKey();

            var type = e.type;

            data.exec(type, [e, data.getMediaDOM(), key, name]);
        },
        on : function(){
            var events = this.getEvents();

            if(!this.mediaNode || this.mediaNode.length === 0){
                this.listen = false;

                return 0;
            }

            if(false === this.listen){
                this.mediaNode.on(events.join(" "), "", this, this.eventHook);
                this.listen = true;
            }
        },
        addTextTrack : function(kind, label, language){
            var dom = this.getMediaDOM();

            if(dom){
                return dom.addTextTrack(kind, label, language);
            }else{
                return null;
            }
        },
        canPlayType : function(type){
            var dom = this.getMediaDOM();

            if(dom){
                return dom.canPlayType(type);
            }else{
                return false;
            }
        },
        load : function(){
            var dom = this.getMediaDOM();

            if(dom){
                dom.load();
            }
        },
        play : function(){
            var dom = this.getMediaDOM();

            if(dom){
                dom.play();
            }
        },
        pause : function(){
            var dom = this.getMediaDOM();

            if(dom){
                dom.pause();
            }
        },
        stop : function(){
            this.pause();

            var dom = this.getMediaDOM();

            if(dom){
                dom.currentTime = 0;
            }
        },
        isPaused: function(){
            var dom = this.getMediaDOM();

            if(dom){
                return dom.paused;
            }else{
                return true;
            }
        },
        cancelBubble : function(e){
            e.stopPropagation();
        },
        setMediaSource: function(source){
            this.src = source;

            this.mime = MediaMIME.parse(this.type, this.src);

            if(this.mime && this.canPlayType(this.mime.type)){
                this.setAttribute("src", this.src);
            }else{
                console.error("the media dose not support this MIME type(" + this.mime.type + ")");

                this.destory();
            }
        },
        insert : function(){
            var html = '<' + this.type + ' id="' + this.name + '"></' + this.type + '>';

            if(this.target.length > 0){
                if(!this.getMediaDOM()){
                    this.target.append($(html));

                    this.mediaNode = $("#" + this.name);

                    if(true === this.bubble){
                        this.mediaNode.on("touchstart", this.cancelBubble)
                                      .on("touchend", this.cancelBubble);
                    }

                    this.on();
                }
            }else{
                this.mediaNode = null;
            }
        },
        restore: function(source){
            if(!this.mediaNode || !this.mediaDOM){
                this.insert();
                this.dataset.render(this);

                source = source || this.src;

                if(source){
                    this.setMediaSource(source);
                }
            }
        },
        destory: function(){
            if(this.mediaNode && this.mediaNode.length > 0){
                this.mediaNode.remove();
                this.mediaNode = null;
                this.mediaDOM = null;
            }
        }
    };

    _Media.Cache = {};

    var _pub = {
        "version": "R15B1014",
        getMedia : function(target, type, name){
            var ins = _Media.Cache[name] || (_Media.Cache[name] = new _Media(target, type, name));

            return {
                "set" : function(type, options){
                    ins.set(type, options);

                    return this;
                },
                "exec" : function(type, args){
                    return ins.exec(type, args);
                },
                "remove" : function(type){
                    ins.remove(type);

                    return this;
                },
                "get" : function(type){
                    return ins.get(type);
                },
                "clear" : function(){
                    ins.clear();

                    return this;
                },
                "getHandleStack" : function(){
                    return ins.getHandleStack();
                },
                getMediaDOM: function(){
                    return ins.getMediaDOM();
                },
                getMediaName: function(){
                    return ins.getMediaName();
                },
                setMediaKey: function(key){
                    ins.setMediaKey(key);

                    return this;
                },
                getMediaKey: function(){
                    return ins.getMediaKey();
                },
                setAttribute : function(name, value){
                    ins.setAttribute(name, value);

                    return this;
                },
                setAttributes : function(attributes){
                    ins.setAttributes(attributes);

                    return this;
                },
                getAttribute : function(name){
                    return ins.getAttribute(name);
                },
                removeAttribute: function(name){
                    ins.removeAttribute(name);

                    return this;
                },
                hasAttribute: function(name){
                    return ins.hasAttribute(name);
                },
                setProperty : function(name, value){
                    ins.setProperty(name, value);

                    return this;
                },
                getProperty : function(name){
                    return ins.getProperty(name);
                },
                setProperties: function(properties){
                    ins.setProperties(properties);

                    return this;
                },
                addTextTrack : function(kind, label, language){
                    return ins.addTextTrack(kind, label, language);
                },
                canPlayType : function(type){
                    return ins.canPlayType(type);
                },
                load : function(){
                    ins.load();

                    return this;
                },
                play : function(){
                    ins.play();

                    return this;
                },
                pause : function(){
                    ins.pause();

                    return this;
                },
                stop: function(){
                    ins.stop();

                    return this;
                },
                isPaused: function(){
                    return ins.isPaused();
                },
                setMediaSource: function(source){
                    ins.setMediaSource(source);

                    return this;
                },
                restore: function(source){
                    ins.restore(source);

                    return this;
                },
                destory: function(){
                    ins.destory();

                    return this;
                }
            };
        }
    };

    module.exports = _pub;
});