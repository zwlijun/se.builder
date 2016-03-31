/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 场景相册
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.11
 */
;define(function(require, exports, module){
                        require("mod/zepto/touch");
    var Listener      = require("mod/se/listener");
    var Util          = require("mod/se/util");
    var Scene         = require("mod/sa/scene");
    var Style         = require("mod/se/css");
    var Timer         = require("mod/se/timer");
    var HandleStack   = Listener.HandleStack;

    //Object options
    //options::name  名称，唯一值
    //options::root  相册父级容器  Node|String 
    //options::album 相集容器 {box: ".widget-album-images", item: "li", desc: "li > div"}
    //options::dot   轮播点 {box: ".widget-album-dots", item: "li"}
    //options::autoplay 是否自动播放 true/false
    //options::duration  播放时长(s)
    //options::interval  间隔周期(s)
    var GetDefaultOptions = function(){
        return {
            "name": Util.GUID(),
            "root": "body",
            "effect": "slider",
            "dir": "x",
            "album": {
                "box": ".widget-album-images",
                "item": "li",
                "desc": "li > div"
            },
            "dot": {
                "box": ".widget-album-dots",
                "item": "li"
            },
            "autoplay": true,
            "duration": "1",
            "interval": "4"
        };
    };
    var _SceneAlbum = function(options){
        this.options = $.extend(true, GetDefaultOptions(), options || {});
        this.root = null;
        this.images = null;
        this.dots = null;
        this.Scene = null;
        this.sceneLoop = true;
        this.touchEnabled = true;
        this.sceneShift = 10;
        this.timer = null;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onempty: null,
            oncreatebefore : null,       //开始创建应用前的回调
            oncreate: null,              //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            onlookup: null,
            onblock: null,       // [type]
            ontouchstart: null,
            ontouchend: null,
            onrender: null,
            onstartbefore: null, // [node, inddex, settings, ScreenAnimate]
            onstart: null,       // [e, type, target, animationName, elapsedTime, index, settings, ScreenAnimate]
            onend: null,         // [e, type, target, animationName, elapsedTime, index, settings, ScreenAnimate]
            oniteration: null    // [e, type, target, animationName, elapsedTime, index, settings, ScreenAnimate]
        }, this.handleStack);
    };

    _SceneAlbum.prototype = {
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
        getHandleStack : function(){
            return this.handleStack;
        },
        setAlbumSize: function(width, height){
            var opts = this.options;
            var root =  $(opts.root);

            root.css({
                "width": width + "px",
                "height": height + "px"
            });
        },
        create: function(name){
            var opts = this.options;

            this.root =  $(opts.root);
            this.images = this.root.find(opts.album.box).find(opts.album.item);
            this.dots = this.root.find(opts.dot.box).find(opts.dot.item);

            if(!this.images || this.images.length == 0){
                this.exec("empty", ["images"]);
                return 0;
            }

            this.images.attr("data-scene-in", opts.effect + "." + opts.dir + "#" + opts.duration + "s ease")
                       .attr("data-scene-out", opts.effect + "." + opts.dir + "#" + opts.duration + "s ease");

            this.Scene = Scene.createScene(name, this.sceneLoop, this.touchEnabled);
            this.Scene.setTouchDuration(this.sceneShift);

            this.exec("createbefore", []);

            //-----------------------------------------------------------------------
            this.Scene.set("block", {
                callback: function(e, blockType){
                    this.exec("block", [e, blockType]);
                },
                context: this
            }).set("touchstart", {
                callback: function(outIndex){
                    this.pause();

                    this.exec("touchstart", [outIndex]);
                },
                context: this
            }).set("touchend", {
                callback: function(outIndex, inIndex){
                    this.resume();

                    this.exec("touchend", [outIndex, inIndex]);
                },
                context: this
            }).set("render", {
                callback: function(action, settings, outIndex, inIndex){
                    if(SCREEN_ANIMATE.ACTION.OUT == action){
                        var outScreen = this.Scene.getSceneScreenNode(outIndex);
                        var inScreen = this.Scene.getSceneScreenNode(inIndex);
                        var nodes = this.Scene.getSceneScreenNodes();
                        var size = this.Scene.getSize();

                        for(var i = 0; i < size; i++){
                            nodes[i].node.css("zIndex", 1).css("opacity", 1).addClass("hide");
                        }

                        inScreen.node.removeClass("hide").css("zIndex", 3).css("opacity", 0);
                        outScreen.node.removeClass("hide").css("zIndex", 2);

                        this.Scene.setRenderStyle(inScreen.node, "z-index: " + 3);
                        this.Scene.setRenderStyle(outScreen.node, "z-index: " + 2);
                    }

                    this.exec("render", [action, settings, outIndex, inIndex]);
                },
                context: this
            }).set("startbefore", {
                callback: function(options){
                    this.exec("startbefore", [options]);
                },
                context: this
            }).set("start", {
                callback: function(options){
                    this.exec("start", [options]);
                },
                context: this
            }).set("end", {
                callback: function(options){
                    var node = this.Scene.getSceneScreenNode(options.index);

                    options.sa.restore(node.node);

                    // console.info("end: " + options.action + "/" + options.index);

                    if(SCREEN_ANIMATE.ACTION.OUT == options.action){
                        node.node.addClass("hide");
                    }

                    if(SCREEN_ANIMATE.ACTION.IN == options.action){
                        var dots = this.dots;

                        if(dots && dots.length > 0){
                            dots.removeClass("on");
                            $(dots.get(options.index)).addClass("on");
                        }
                    }

                    this.exec("end", [options]);
                },
                context: this
            }).set("iteration", {
                callback: function(options){
                    this.exec("iteration", [options]);
                },
                context: this
            }).lookup(this.images, {
                callback: function(index, item){
                    if(this.Scene.getIndex() === index){
                        $(item).removeClass("hide");
                    }

                    this.exec("lookup", [index, item]);
                },
                context: this
            });

            if(this.Scene.getSize() <= 1){
                this.Scene.setTouch(false);
            }

            this.exec("create", []);

            if(true === opts.autoplay){
                this.autoplay();
            }else{
                this.pause();
            }
        },
        autoplay: function(){
            var opts = this.options;
            this.timer = Timer.getTimer(opts.name, Timer.toFPS(Number(opts.interval) * 1000), {
                callback: function(_t){
                    this.next();
                },
                context: this.Scene,
                args: []
            });

            this.resume();
        },
        pause: function(){
            if(this.timer){
                this.timer.stop();
            }
        },
        resume: function(){
            if(this.timer){
                this.timer.start();
            }
        }
    };

    _SceneAlbum.Cache = {};

    module.exports = {
        "version": "R16B0124",
        "createSceneAlbum": function(name, options){
            var sa = _SceneAlbum.Cache[name] || (_SceneAlbum.Cache[name] = new _SceneAlbum(options));

            return {
                "exec" : function(type, args){
                    sa.exec(type, args);

                    return this;
                },
                "set" : function(type, option){
                    sa.set(type, option);

                    return this;
                },
                "remove" : function(type){
                    sa.remove(type);

                    return this;
                },
                "get" : function(type){
                    return sa.get(type);
                },
                "clear" : function(){
                    sa.clear();

                    return this;
                },
                "getHandleStack" : function(){
                    return sa.getHandleStack();
                },
                "create": function(name){
                    sa.create(name);

                    return this;
                },
                "autoplay": function(){
                    sa.autoplay();

                    return this;
                },
                "pause": function(){
                    sa.pause();

                    return this;
                },
                "resume": function(){
                    sa.resume();

                    return this;
                },
                "setAlbumSize": function(width, height){
                    sa.setAlbumSize(width, height);

                    return this;
                },  
                //----------------------------------------------
                "setIndex": function(index){
                    sa.Scene.setIndex(index);

                    return this;
                },
                "getIndex": function(){
                    return sa.Scene.getIndex();
                },
                "getLastIndex": function(){
                    return sa.Scene.getLastIndex();
                },
                "getSize": function(){
                    return sa.Scene.getSize();
                },
                "isEnableTouch": function(){
                    return sa.Scene.isEnableTouch();
                },
                "isEnableLoop": function(){
                    return sa.Scene.isEnableLoop();
                },
                "isLocked": function(){
                    return sa.Scene.isLocked();
                },
                "isForceLocked": function(){
                    return sa.Scene.isForceLocked();
                },
                "isForceBackLocked": function(){
                    return sa.Scene.isForceBackLocked();
                },
                "isForceForwardLocked": function(){
                    return sa.Scene.isForceForwardLocked();
                },
                "setLoop": function(loop){
                    sa.Scene.setLoop(loop);

                    return this;
                },
                "setTouch": function(touch){
                    sa.Scene.setTouch(touch);

                    return this;
                },
                "setLocked" : function(locked){
                    sa.Scene.setLocked(locked);

                    return this;
                },
                "setForceLocked": function(locked){
                    sa.Scene.setForceLocked(locked);

                    return this;
                },
                "setForceBackLocked": function(locked){
                    sa.Scene.setForceBackLocked(locked);

                    return this;
                },
                "setForceForwardLocked": function(locked){
                    sa.Scene.setForceForwardLocked(locked);

                    return this;
                },
                "releaseLock": function(){
                    sa.Scene.releaseLock();

                    return this;
                },
                "releaseForceLock": function(){
                    sa.Scene.releaseForceLock();

                    return this;
                },
                "releaseForceBackLock": function(){
                    sa.Scene.releaseForceBackLock();

                    return this;
                },
                "releaseForceForwardLock": function(){
                    sa.Scene.releaseForceForwardLock();

                    return this;
                },
                "setTouchDuration": function(duration){
                    sa.Scene.setTouchDuration(duration);

                    return this;
                },
                "clearSceneScreen": function(){
                    sa.Scene.clearSceneScreen();

                    return this;
                },
                "addSceneScreen": function(key, selector){
                    sa.Scene.addSceneScreen(key, selector);

                    return this;
                },
                "removeSceneScreen": function(index){
                    sa.Scene.removeSceneScreen(index);

                    return this;
                },
                "lookup": function(selector, handle){
                    sa.Scene.lookup(selector, handle);

                    return this;
                },
                "getSceneScreenItem": function(index){
                    return sa.Scene.getSceneScreenItem(index);
                },
                "getSceneScreenItems": function(){
                    return sa.Scene.getSceneScreenItems();
                },
                "getSceneScreenNode": function(index){
                    return sa.Scene.getSceneScreenNode(index);
                },
                "getSceneScreenNodes": function(){
                    return sa.Scene.getSceneScreenNodes();
                },
                "go": function(index){
                    sa.Scene.go(index);

                    return this;
                },
                "next": function(){
                    sa.Scene.next();

                    return this;
                },
                "prev": function(){
                    sa.Scene.prev();

                    return this;
                },
                "setRenderStyle": function(node, cssText){
                    sa.Scene.setRenderStyle(node, cssText);

                    return this;
                },
                "getRenderStyle": function(node){
                    return sa.Scene.getRenderStyle(node);
                },
                "source": function(dom, styleMap){
                    sa.Scene.source(dom, styleMap);

                    return this;
                }
            };
        }
    };
});