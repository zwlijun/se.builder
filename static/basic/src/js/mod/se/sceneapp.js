/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * sceneapp模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.10
 */
;define(function(require, exports, module){
    var Listener      = require("mod/se/listener");
    var Util          = require("mod/se/util");
    var Scene         = require("mod/sa/scene");
    var Style         = require("mod/se/css");
    var HandleStack   = Listener.HandleStack;

    var SCROLL = window["SCROLL"] = {
        "VERTICAL": "vertical",
        "HORIZONTAL": "horizontal"
    };

    var ADAPTOR = window["ADAPTOR"] = {
        "HEIGHT": "height",
        "WIDTH": "width",
        "CONTAIN": "contain",
        "COVER": "cover"
    };

    var ADAPTOR_MODE = window["ADAPTOR_MODE"] = {
        "META": "meta",
        "SCALE": "scale"
    };


    var _SceneApp = function(){
        var root = document.documentElement;
        var oApp = $(root);

        this.root = root;
        this.app = oApp;
        this.view = oApp.find(".webapp-view");
        this.appKey = oApp.attr("data-appkey");

        var outerSelector = ".outerbox";
        var innerSelector = ".innerbox";
        
        var sectionSelector = ".webapp-view>section";
        var visibleSectionSelector = '.webapp-view>section[data-display="visible"]';

        var outerboxSelector = sectionSelector + ">" + outerSelector;
        var innerboxSelector = outerboxSelector + ">" + innerSelector;
        var visibleOuterBoxSelector = visibleSectionSelector + ">" + outerSelector;
        var visibleInnerBoxSelector = visibleOuterBoxSelector + ">" + innerSelector;

        this.Scene = null;

        this.modules = $(sectionSelector);
        this.outerboxes = $(outerboxSelector)
        this.innerboxes = $(innerboxSelector);
        this.visibleModules = $(visibleSectionSelector);
        this.visibleOuterboxes = $(visibleOuterBoxSelector);
        this.visibleInnerboxes = $(visibleInnerBoxSelector);

        this.scroll = oApp.attr("data-scroll") || SCROLL.VERTICAL;

        this.design = (function(str){
            var items = str.split("/");
            var width = Number(items[0]);
            var height = Number(items[1]);
            var _flag = true;

            if(isNaN(width)){
                width = 640;
            }

            if(isNaN(height)){
                height = 1008;
            }

            return {
                "width": _flag ? width : Math.round(width / 2),
                "height": _flag ? height : Math.round(height / 2)
            };
        })(oApp.attr("data-design") || "640/1008");

        this.adaptor = oApp.attr("data-adaptor") || ADAPTOR.HEIGHT;
        this.adaptorMode = oApp.attr("data-adaptor-mode") || ADAPTOR_MODE.SCALE;

        this.sceneShiftRatio = Number(oApp.attr("data-scene-shift") || .2);
        this.sceneShift = 50;

        this.touchEnabled = ("true" === (oApp.attr("data-touch") || "true"));
        this.sceneLoop = ("true" === (oApp.attr("data-scene-loop") || "true"));

        this.delta = (function(str){
            return Number(str);
        })(oApp.attr("data-scale-delta") || "0.001");

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onload: null,                //已加载完成
            oncreatebefore : null,       //开始创建应用前的回调
            oncreate: null,              //
            onresize : null,             //窗口大小重置{Function callback, Array args, Object context}
            onorientationchange : null,  //横竖屏切换
            onupdate : null,             //应用尺寸更新
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

    _SceneApp.prototype = {
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
        layout : function(name, node, view, handler){
            $.each(node, function(index, item){
                var tmp = $(item);

                tmp.css({
                    "width": (view.width + "px").replace("%px", "%"),
                    "height": (view.height + "px").replace("%px", "%")
                });

                Util.execHandler(handler, [index, tmp]);

                tmp = null;
            });
        },
        calc : function(){
            var _ins = this;
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var design = _ins.design;
            var designWidth = design.width;
            var designHeight = design.height;
            var deviceRatio = width / height;
            var designRatio = designWidth / designHeight;
            var ratio = 1; 
            var adaptorMode = _ins.adaptorMode;

            switch(_ins.adaptor){
                case ADAPTOR.CONTAIN:
                    ratio = deviceRatio > designRatio ? height / designHeight : width / designWidth; 
                break;
                case ADAPTOR.COVER:
                    ratio = deviceRatio > designRatio ? width / designWidth : height / designHeight;
                break;
                case ADAPTOR.WIDTH:
                    ratio = width / designWidth;
                break;
                case ADAPTOR.HEIGHT:
                default:
                    ratio = height / designHeight;
                break;
            }

            //缩放比例
            this.scaleRatio = ratio;
            this.deltaRatio = ratio + this.delta;

            this.sceneShift = this.sceneShiftRatio * (SCROLL.HORIZONTAL == this.scroll ? width : height);

            //视窗大小
            this.viewSize = {
                "width": width,
                "height": height
            };

            //设计大小
            this.designSize = {
                "width": designWidth,
                "height": designHeight
            };

            this.update();
        },
        update : function(){
            var _ins = this;
            
            //视窗大小
            var v = _ins.viewSize;

            //设计大小
            var iv = _ins.designSize;
           
            _ins.layout("view", _ins.view, {
                "width": "100%",
                "height": "100%"
            }, null);
            _ins.layout("module", _ins.modules, {
                "width": "100%",
                "height": "100%"
            }, null);
            _ins.layout("outerbox", _ins.outerboxes, {
                "width": "100%",
                "height": "100%"
            }, null);
            _ins.layout("innerbox", _ins.innerboxes, iv, {
                callback: function(index, box, view, ratio){
                    var node = $(box);
                    var adaptorMode = this.adaptorMode;
                    
                    node.css({
                        position: "absolute",
                        overflow: "hidden",
                        left: "50%",
                        top: "50%",
                        margin: "-" + (view.height / 2) + "px 0 0 -" + (view.width / 2) + "px"
                    });

                    //if(ADAPTOR_MODE.SCALE === adaptorMode){
                        Style.css(node, "transform-origin", "center center 0");
                        Style.css(node, "transform", "scale(" + ratio + ", " + ratio + ")");
                    //}
                },
                args: [iv, _ins.deltaRatio],
                context: _ins
            });

            _ins.exec("update", [_ins.scaleRatio, _ins.deltaRatio, v, iv]);
        },
        resize : function(){
            this.calc();
        },
        create: function(name, filter){
            this.Scene = Scene.createScene(name, this.sceneLoop, this.touchEnabled);

            this.Scene.setTouchDuration(this.sceneShift);

            this.exec("createbefore", []);

            console.info(name)

            //-----------------------------------------------------------------------
            this.Scene.set("block", {
                callback: function(e, blockType){
                    this.exec("block", [e, blockType]);
                },
                context: this
            }).set("touchstart", {
                callback: function(outIndex){
                    this.exec("touchstart", [outIndex]);
                },
                context: this
            }).set("touchend", {
                callback: function(outIndex, inIndex){
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

                    this.exec("end", [options]);
                },
                context: this
            }).set("iteration", {
                callback: function(options){
                    this.exec("iteration", [options]);
                },
                context: this
            }).lookup(true === filter ? this.visibleModules : this.modules, {
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

            $(window).on("resize", "", this, function(e){
                var data = e.data;

                data.exec("resize", [e]);
            }).on("orientationchange", "", this, function(e){
                var data = e.data;
                
                data.exec("orientationchange", [e]);
            });

            this.exec("create", []);
        }
    };

    _SceneApp.Cache = {};

    module.exports = {
        "version": "R15B1112",
        "createSceneApp": function(name){
            var sa = _SceneApp.Cache[name] || (_SceneApp.Cache[name] = new _SceneApp());

            return {
                "appKey" : sa.appKey,
                "mode" : sa.mode,
                "scroll" : sa.scroll,
                "design": sa.design,
                "root" : sa.root,
                "app": sa.app,
                "view": sa.view,
                "modules" : sa.modules,
                "outerboxes" : sa.outerboxes,
                "innerboxes" : sa.innerboxes,
                "visibleModules" : sa.visibleModules,
                "visibleOuterboxes": sa.visibleOuterboxes,
                "visibleInnerboxes": sa.visibleInnerboxes,
                "adaptor": {
                    "type": sa.adaptor,
                    "mode": sa.adaptorMode  
                },
                "layout" : {
                    "scale": sa.scaleRatio,
                    "delta": sa.deltaRatio,
                    "view": sa.viewSize,
                    "design": sa.designSize
                },
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
                "resize" : function(){
                    sa.resize();

                    this["layout"] = {
                        "scale": sa.scaleRatio,
                        "delta": sa.deltaRatio,
                        "view": sa.viewSize,
                        "design": sa.designSize
                    };

                    return this;
                },
                "create": function(name, filter){
                    this.resize();

                    sa.create(name, filter);

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
    }
});