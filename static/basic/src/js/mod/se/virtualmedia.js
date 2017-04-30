/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 虚拟媒体模块
 * 单例调度，主要用于X5内核多音频控件播放问题
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function (require, exports, module){
    var Media               = require("mod/se/media");
    var Util                = require("mod/se/util");

    var MediaType = window["MediaType"];

    var VirtualMedia = function(target, type, name){
        this.target = target;
        this.type = type || MediaType.AUDIO;
        this.name = name;
        this.media = Media.getMedia(target, type, name);
        this.mediaHandleStack = this.media.getHandleStack();

        this.currentMedia = null;
    };
    VirtualMedia.AudioPool = {
        // events: []
        // name: null
        // currentTime: 0
        // playState: play | pause | stop
        // trigger: auto | user
        // source: *.mp3
        // loop: true
        // autoplay: true
        // preload: true
        // control: false
        // button: null
        // toggle: play
    };
    VirtualMedia.AudioPool.size = 0;
    VirtualMedia.VideoPool = {
        // events: []
        // name: null
        // currentTime: 0
        // playState: play | pause | stop
        // trigger: auto | user
        // source: *.mp4
        // loop: true
        // autoplay: true
        // preload: true
        // control: false
        // button: null
        // toggle: play
    };
    VirtualMedia.VideoPool.size = 0;

    VirtualMedia.prototype = {
        isAudio: function(){
            return (MediaType.AUDIO == this.type);
        },
        put: function(name, options){
            options["name"] = name;

            if(this.isAudio()){
                VirtualMedia.AudioPool[name] = options;
                VirtualMedia.AudioPool.size++;
            }else{
                VirtualMedia.VideoPool[name] = options;
                VirtualMedia.VideoPool.size++;
            }
        },
        get: function(name){
            var pool = this.isAudio() ? VirtualMedia.AudioPool : VirtualMedia.VideoPool;

            if(name in pool){
                return pool[name];
            }

            return null;
        },
        remove: function(name){
            if(this.isAudio()){
                if(name in VirtualMedia.AudioPool){
                    VirtualMedia.AudioPool[name] = null;

                    VirtualMedia.AudioPool.size--;

                    delete VirtualMedia.AudioPool[name];

                    if(VirtualMedia.AudioPool.size <= 0){
                        this.clear();
                    }
                }
            }else{
                if(name in VirtualMedia.VideoPool){
                    VirtualMedia.VideoPool[name] = null;

                    VirtualMedia.VideoPool.size--;

                    delete VirtualMedia.VideoPool[name];

                    if(VirtualMedia.VideoPool.size <= 0){
                        this.clear();
                    }
                }
            }
        },
        update: function(name, options){
            var media = this.get(name);

            if(!media){
                this.put(name, options);
            }else{
                this.put(name, $.extend(media, options));
            }
        },
        clear: function(){
            if(this.isAudio()){
                VirtualMedia.AudioPool = {};
                VirtualMedia.AudioPool.size = 0;
            }else{
                VirtualMedia.VideoPool = {};
                VirtualMedia.VideoPool.size = 0;
            }

            this.setCurrentMedia(null);
        },
        save: function(name, state, isAuto){
            var current = this.getCurrentMedia();

            if(!current){
                return 0;
            }

            var media = this.media;
            var opts = {
                currentTime: media.getProperty("currentTime"),
                playState: state || "pause",
                trigger: isAuto ? "auto" : "user"
            };

            this.update(current.name, opts);

            if(opts.playState !== "play" && current.button){
                current.button.removeClass(current.toggle || "play");
            }
        },
        resetMediaListener: function(events){
            var media = this.media;
            var handleStack = media.getHandleStack();
            var e = null;
            var _t = null;

            media.clear();
            handleStack.removeAll();

            for(var key in events){
                if(events.hasOwnProperty(key)){
                    e = events[key];
                    _t = Object.prototype.toString.call(e);

                    if(_t == "[object Array]"){
                        for(var i = 0, size = e.length; i < size; i++){
                            if(0 === i){
                                media.set(key, e[i]);
                            }else{
                                handleStack.add({
                                    "type": key,
                                    "data": e[i]
                                });
                            }
                        }
                    }else if(_t == "[object Object]"){
                        media.set(key, e);
                    }
                }
            }
        },
        updateMediaAttribute: function(name, value){
            if(true === value){
                this.media.setAttribute(name, name);
            }else{
                this.media.removeAttribute(name);
            }
        },
        updateMediaSource: function(source){
            this.media.setMediaSource(source);
        },
        removeMediaSource: function(){
            this.media.setAttribute("src", "#")
                      .removeAttribute("src");
        },
        updateMediaTime: function(state, time){
            var t = 0;
            if("pause" == state){
                t = time;
            }

            this.media.setProperty("currentTime", t);
        },
        setCurrentMedia: function(virtualMedia){
            this.currentMedia = virtualMedia;
        },
        getCurrentMedia: function(){
            return this.currentMedia;
        },
        isPaused: function(){
            var current = this.getCurrentMedia();

            if(current && ("play" != current.playState)){
                return true;
            }

            return false;
        },
        restore: function(name){
            var vm = this.get(name);
            var media = this.media;

            if(!vm){
                return 0;
            }

            if(vm.trigger == "auto" && vm.playState != "play"){
                this.play(name);
            }
        },
        play: function(name){
            var current = this.getCurrentMedia();
            var vm = this.get(name);
            var media = this.media;

            if(!vm){
                return 0;
            }

            if(current && (current.name == name && current.playState == "play")){
                return 0;
            }

            if(!current || (current && current.name != name)){
                this.resetMediaListener(vm.events);
                this.updateMediaAttribute("loop", true === vm.loop);
                this.updateMediaAttribute("autoplay", true === vm.autoplay);
                this.updateMediaAttribute("preload", true === vm.preload);
                this.updateMediaAttribute("controls", true === vm.control);

                this.save(name, "pause", true);
            }

            this.updateMediaSource(vm.source);

            var mevent = {
                "type": "loadedmetadata",
                "data": {
                    callback: function(e, mediaDOM, key, name, vm){
                        this.updateMediaTime(vm.playState, vm.currentTime);
                    },
                    args: [vm],
                    context: this
                }
            };
            this.mediaHandleStack.remove(mevent);
            this.mediaHandleStack.add(mevent);
            media.play();

            this.update(name, {
                "playState": "play"
            });

            if(vm.button){
                vm.button.addClass(vm.toggle || "play");
            }

            this.setCurrentMedia(this.get(name));
        },
        pause: function(name){
            var vm = this.get(name);
            var media = this.media;

            if(!vm){
                return 0;
            }

            media.pause();
            this.save(name, "pause", false);
            this.removeMediaSource();
            this.setCurrentMedia(this.get(name));

            if(vm.button){
                vm.button.removeClass(vm.toggle || "play");
            }
        },
        stop: function(name){
            var vm = this.get(name);
            var media = this.media;

            if(!vm){
                return 0;
            }

            media.stop();
            this.save(name, "stop", false);   
            this.removeMediaSource();
            this.setCurrentMedia(this.get(name));

            if(vm.button){
                vm.button.removeClass(vm.toggle || "play");
            }
        },
        toggle: function(name){
            var current = this.getCurrentMedia();
            var vm = this.get(name);
            var media = this.media;

            if(!vm){
                return 0;
            }

            if(current && current.name == name && vm.playState == "play"){
                this.pause(name);
            }else{
                this.play(name);
            }
        },
        is: function(name){
            var cur = this.getCurrentMedia();

            if(cur && cur.name == name){
                return true;
            }

            return false;
        },
        not: function(name){
            var cur = this.getCurrentMedia();

            return !this.is(name);
        },
        playing: function(){
            var cur = this.getCurrentMedia();

            if(cur && cur.playState == "play"){
                return true;
            }

            return false;
        }
    };

    VirtualMedia.Cache = {};

    module.exports = {
        "version": "R17B0430.01",
        "createVirtualMedia": function(target, type, name){
            var vm = VirtualMedia.Cache[name] || (VirtualMedia.Cache[name] = new VirtualMedia(target, type, name));

            return {
                "put": function(name, options){
                    vm.put(name, options);

                    return this;
                },
                "get": function(name){
                    return vm.get(name);
                },
                "remove": function(name){
                    vm.remove(name);

                    return this;
                },
                "clear": function(){
                    vm.clear();

                    return this;
                },
                "update": function(name, options){
                    vm.update(name, options);

                    return this;
                },
                "getCurrentMedia": function(){
                    return vm.getCurrentMedia();
                },
                "getCurrentNativeMedia": function(){
                    return vm.media;
                },
                "getMediaHandleStack": function(){
                    return vm.mediaHandleStack;
                },
                "isPaused": function(){
                    return this.isPaused();
                },
                "play": function(name){
                    vm.play(name);

                    return this;
                },
                "pause": function(name){
                    vm.pause(name);

                    return this;
                },
                "stop": function(name){
                    vm.stop(name);

                    return this;
                },
                "restore": function(name){
                    vm.restore(name);

                    return this;
                },
                "toggle": function(name){
                    vm.toggle(name);

                    return this;
                },
                "is": function(name){
                    return vm.is(name);
                },
                "not": function(name){
                    return vm.not(name);
                },
                "playing": function(){
                    return vm.playing();
                }
            };
        }
    };
});