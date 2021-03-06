/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Screen 动画
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.9
 */
;define(function (require, exports, module){
    var Util           = require("mod/se/util");
    var Listener       = require("mod/se/listener");
    var Style          = require("mod/se/css");
    var KeyFrames      = require("mod/sa/keyframes");
    var Settings       = require("mod/conf/scene/settings");
    var HandleStack    = Listener.HandleStack;
    var SCREEN_ANIMATE = Settings.SCREEN_ANIMATE;
    var DEFAULT_CONF   = Settings.DEFAULT_ANIMATION_PROPERTIES;  
    var KEY_FRAMES     = Settings.KEY_FRAMES;

    var touch      = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var endEvent   = touch ? "touchend"   : "mouseup";
    var moveEvent  = touch ? "touchmove"  : "mousemove";

    /**
     * 全屏动画
     * @param  {String} type   [全屏动画类型]
     * @param  {String} mode   [全屏动画方式，水平、垂直]
     * @param  {String} action [全屏动画动作]
     * @param  {[type]} dir    [全屏动画方向]
     */
    var _ScreenAnimate = function(type, mode, action, dir){
        this.type = type || SCREEN_ANIMATE.Types.SCREEN;
        this.mode = mode || SCREEN_ANIMATE.MODE.Y;
        this.action = action || SCREEN_ANIMATE.ACTION.IN;
        this.dir = dir || SCREEN_ANIMATE.DIR.UP;
        this.identity = "SA-" + Util.GUID();
        this.options = null;
        this.animation = null;
        this.keyFrames = KeyFrames.createKeyFrames(this.identity);

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onstartbefore: null, // [node]
            onstart: null,       // [e, type, target, animationName, elapsedTime]
            onend: null,         // [e, type, target, animationName, elapsedTime]
            oniteration: null    // [e, type, target, animationName, elapsedTime]
        }, this.handleStack);
    };

    _ScreenAnimate.prototype = {
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
        /**
         * 获取事件回调栈
         * @return {Object} [description]
         */
        getHandleStack : function(){
            return this.handleStack;
        },
        /**
         * 创建CSS3 Animation规则
         * @param Object options {duration, timing-function, delay, direction, iteration-count, fill-mode, play-state}
         * 
         */
        createAnimation: function(options){
            options = options || {};

            var styles = [];
            var value = null;

            this.options = options;

            styles.push("-o-animation-name: " + this.identity);
            styles.push("-ms-animation-name: " + this.identity);
            styles.push("-moz-animation-name: " + this.identity);
            styles.push("-webkit-animation-name: " + this.identity);
            styles.push("animation-name: " + this.identity);

            for(var key in DEFAULT_CONF){
                if(DEFAULT_CONF.hasOwnProperty(key)){
                    // console.info(key + ': ' + options[key])
                    value = options[key] || DEFAULT_CONF[key];

                    styles.push("-o-animation-" + key + ": " + value);
                    styles.push("-ms-animation-" + key + ": " + value);
                    styles.push("-moz-animation-" + key + ": " + value);
                    styles.push("-webkit-animation-" + key + ": " + value);
                    styles.push("animation-" + key + ": " + value);
                }
            }

            this.animation = styles.join("; ");

            return this
        },
        /**
         * 获取动画属性
         * @param  {String} key [key]
         * @return {Object}     [description]
         */
        getAnimationProperty: function(key){
            if("name" == key){
                return this.identity;
            }
            return this.options[key] || DEFAULT_CONF[key] || null;
        },
        /**
         * 监听事件
         * @param  {Node}   target [目标节点]
         * @return {[type]}        [description]
         */
        listen: function(target){
            var flag = target.attr("data-screen-animate-listen");

            // if("1" == flag){
            //     return this;
            // }

            var events = [
                "webkitAnimationStart", 
                "mozAnimationStart", 
                "MSAnimationStart", 
                "oanimationstart", 
                "animationstart",
                "webkitAnimationEnd", 
                "mozAnimationEnd", 
                "MSAnimationEnd", 
                "oanimationend", 
                "animationend",
                "webkitAnimationIteration", 
                "mozAnimationIteration", 
                "MSAnimationIteration", 
                "oanimationiteration", 
                "animationiteration"
            ];

            target.on(events.join(" "), "", this, function(e){
                e.stopPropagation();
                e.preventDefault();

                //[e, target, animationName, elapsedTime]
                var data = e.data;
                var type = e.type;

                type = type.toLowerCase();
                type = type.replace(/^(webkit|moz|ms|o)/, "");

                // console.info("scene.sa.listen: " + type);

                if(type in data){
                    data[type].apply(data, [e, type]);
                }

                if("animationend" == type){
                    target.off(events.join(" "), "");
                }
            });

            target.attr("data-screen-animate-listen", "1");

            return this;
        },
        /**
         * 动画开始
         * @param  {[type]} e    [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        animationstart: function(e, type){
            var target = e.currentTarget;
            var origin = e.originalEvent || {};
            var animationName = e.animationName || origin.animationName;
            var elapsedTime = e.elapsedTime || origin.elapsedTime;

            this.exec("start", [e, type, target, animationName, elapsedTime]);
        },
        /**
         * 动画结束
         * @param  {[type]} e    [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        animationend: function(e, type){
            var target = e.currentTarget;
            var origin = e.originalEvent || {};
            var animationName = e.animationName || origin.animationName;
            var elapsedTime = e.elapsedTime || origin.elapsedTime;

            this.exec("end", [e, type, target, animationName, elapsedTime]);
        },
        /**
         * 动画执行时
         * @param  {[type]} e    [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        animationiteration: function(e, type){
            var target = e.currentTarget;
            var origin = e.originalEvent || {};
            var animationName = e.animationName || origin.animationName;
            var elapsedTime = e.elapsedTime || origin.elapsedTime;

            var $node = $(target);
            var iteration = Number($node.attr("data-screen-animate-iteration") || 1);
            var iterationCount = this.getAnimationProperty("iteration-count");

            $node.attr("data-screen-animate-iteration", iteration + 1);

            if(iterationCount === "infinite" && iteration === 3){
                $node.trigger("animationend");
            }

            this.exec("iteration", [e, type, target, animationName, elapsedTime]);
        },
        /**
         * 克隆动画帧
         * @return {Object} [动画帧]
         */
        getKeyFramesClone: function(){
            var keyframes = {};
            var type = this.type;
            var mode = this.mode;
            var action = this.action;
            var dir = this.dir;

            var tmp = null;

            if(!(type in KEY_FRAMES)){
                return null;
            }

            tmp = KEY_FRAMES[type];

            if(!(mode in tmp)){
                return null;
            }
            
            tmp = tmp[mode];

            if(!(action in tmp)){
                return null;
            }

            tmp = tmp[action];

            if(!(dir in tmp)){
                return null;
            }

            tmp = tmp[dir];

            return $.extend(keyframes, tmp);
        },
        /**
         * 克隆外部的样式
         * @return {Object} [description]
         */
        getExtraStylesClone: function(){
            var keyframes = {};
            var type = this.type;
            var mode = this.mode;

            var tmp = null;
            var extra = null;
            var ret = {
                "self": "",
                "parent": "",
                "grandfather": ""
            };

            if(!(type in KEY_FRAMES)){
                return ret;
            }

            tmp = KEY_FRAMES[type];

            if(!(mode in tmp)){
                return ret;
            }
            
            tmp = tmp[mode];

            if(!("extra" in tmp)){
                tmp = null;

                return ret;
            }

            extra = tmp["extra"];

            var parser = function(conf){
                if(!conf){
                    return "";
                }

                var tmp = [];

                for(var key in conf){
                    if(conf.hasOwnProperty(key)){
                        //tmp.push(Style.getRealPropertyName(key) + ": " + conf[key]);
                        tmp.push(Style.getVendorStyles(key, conf[key]).join(""));
                    }
                }

                return tmp.join("");
            };

            ret = {
                "self": parser(extra["self"] || null),
                "parent": parser(extra["parent"] || null),
                "grandfather": parser(extra["grandfather"] || null)
            };

            tmp = null;
            extra = null;

            return ret;
        },
        /**
         * 创建关键帧
         * @return {_ScreenAnimate} [description]
         */
        createKeyFrames: function(){
            var keyFrames = this.keyFrames;

            if(keyFrames.existed()){
                return this;
            }

            var frames = this.getKeyFramesClone();

            keyFrames.clear();

            for(var key in frames){
                if(frames.hasOwnProperty(key)){
                    keyFrames.push(key, frames[key]);
                }
            }

            keyFrames.print();

            return this;
        },
        /**
         * 配置
         * @param  {String} selector [目标节点的选择器]
         * @param  {Object} options  [配置选项]
         * @return {Boolean}         [true/false]
         */
        configure: function(selector, options){
            var node = $(selector);
            var dom = node.get(0);

            if(!dom){
                return false;
            }

            if(!dom.hasAttribute("data-screen-source-style")){
                dom.setAttribute("data-screen-source-style", dom.style.cssText);
            }

            this.listen(node)
                .createKeyFrames()
                .createAnimation(options);

            return true;
        },
        /**
         * 恢复
         * @param  {Node}   node [目标节点]
         */
        restore: function(node){
            var dom = node ? node.get(0) : null;
            var cssText = "";
            var renderStyles = "";
            var tmp = ""

            if(!dom || !dom.hasAttribute("data-screen-source-style")){
                return 0;
            }

            cssText = dom.getAttribute("data-screen-source-style") || "";
            renderStyles = dom.getAttribute("data-screen-render-style") || "";

            tmp = cssText + "; " + renderStyles;
            tmp = tmp.replace(/[\s ]+/g, "").replace(/;+/g, ";");

            dom.style.cssText = tmp;
        },
        /**
         * 播放动画
         * @param  {Node}   node [目标节点]
         */
        play: function(node){
            var dom = node ? node.get(0) : null;
            var styles = this.animation;
            var cssText = "";
            var renderStyles = "";
            var tmp = "";
            var extra = null;
            var parent = null;
            var grandfather = null;

            if(!dom || ! styles || !dom.hasAttribute("data-screen-source-style")){
                return 0;
            }

            parent = node.parent()[0] || document.body;
            grandfather = $(parent).parent()[0] || document.documentElement;
            extra = this.getExtraStylesClone();

            cssText = dom.getAttribute("data-screen-source-style") || "";
            renderStyles = dom.getAttribute("data-screen-render-style") || "";

            tmp = cssText + "; " + extra.self + renderStyles + ";" + styles;
            tmp = tmp.replace(/[\s ]+/g, "").replace(/;+/g, ";");

            if(!parent.hasAttribute("data-screen-source-style")){
                parent.setAttribute("data-screen-source-style", parent.style.cssText);
            }

            if(extra.parent){
                // console.info(extra.parent)
                parent.setAttribute("style", extra.parent + parent.getAttribute("data-screen-source-style"));
            }

            if(!grandfather.hasAttribute("data-screen-source-style")){
                grandfather.setAttribute("data-screen-source-style", grandfather.style.cssText);
            }

            if(extra.grandfather){
                grandfather.setAttribute("style", extra.grandfather  + grandfather.getAttribute("data-screen-source-style"));
            }

            this.exec("startbefore", [node]);

            dom.setAttribute("style", tmp);
        },
        /**
         * 更新动画的播放状态
         * @param  {Node/NodeList} target    [目标对象]
         * @param  {String}        playState [播放状态]
         */
        updatePlayState: function(target, playState){
            var dom = null;

            if(target && target.length > 0){
                for(var i = 0; i < target.length; i++){
                    dom = target[i];

                    dom.style.OAnimationPlayState = playState;
                    dom.style.msAnimationPlayState = playState;
                    dom.style.MozAimationPlayState = playState;
                    dom.style.webkitAnimationPlayState = playState;
                    dom.style.animationPlayState = playState;
                }
            }
        },
        /**
         * 暂停
         * @param  {[type]} target [description]
         * @return {[type]}        [description]
         */
        pause: function(target){
            this.updatePlayState(target, "paused");
        },
        /**
         * 恢复
         * @param  {[type]} target [description]
         * @return {[type]}        [description]
         */
        resume: function(target){
            this.updatePlayState(target, "running");
        }
    }

    _ScreenAnimate.Cache = {};

    _ScreenAnimate.createScreenAnimate = function(type, mode, action, dir){
        type = type || SCREEN_ANIMATE.Types.SCREEN;
        mode = mode || SCREEN_ANIMATE.MODE.UP;
        action = action || SCREEN_ANIMATE.ACTION.IN;
        dir = dir || SCREEN_ANIMATE.DIR.Y;

        var key = type + mode + action + dir;

        var sa = _ScreenAnimate.Cache[key] || (_ScreenAnimate.Cache[key] = new _ScreenAnimate(type, mode, action, dir));

        return {
            "version": "R15B0930",
            /**
             * 设置回调
             * @param String type 类型
             * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
             */
            "set": function(type, option){
                sa.set(type, option);

                return this;
            },
            /**
             * 获取回调
             * @param String type 类型
             * @return Object on
             */
            "get": function(type){
                return sa.get(type);
            },
            /**
             * 移除回调
             * @param String type 类型
             */
            "remove": function(type){
                sa.remove(type);

                return this;                
            },
            /**
             * 执行回调函数
             * @param String type 类型
             * @param Array args 消息
             * @return * result 返回值
             */
            "exec": function(type, args){
                sa.exec(type, args);

                return this;
            },
            /**
             * 清除所有回调
             */
            "clear": function(){
                sa.clear();

                return this;
            },
            /**
             * 获取事件回调栈
             * @return {Object} [description]
             */
            "getHandleStack": function(){
                return sa.getHandleStack();
            },
            /**
             * 获取动画属性
             * @param  {String} key [key]
             * @return {Object}     [description]
             */
            "getAnimationProperty": function(name){
                return sa.getAnimationProperty(name);
            },
            /**
             * 获取关键帧对象
             * @return {Object} [description]
             */
            "getKeyFramesObject": function(){
                return sa.keyFrames;
            },
            /**
             * 获取动画唯一标识
             * @return {[type]} [description]
             */
            "getAnimationIdentity": function(){
                return sa.identity;
            },
            /**
             * 配置
             * @param  {String} selector [目标节点的选择器]
             * @param  {Object} options  [配置选项]
             * @return {Boolean}         [true/false]
             */
            "configure": function(selector, options){
                sa.configure(selector, options);

                return this;
            },
            /**
             * 恢复
             * @param  {Node}   node [目标节点]
             */
            "restore": function(target){
                sa.restore(target);

                return this;
            },
            /**
             * 播放动画
             * @param  {Node}   node [目标节点]
             */
            "play": function(target){
                sa.play(target);

                return this;
            },
            /**
             * 暂停
             * @param  {[type]} target [description]
             * @return {[type]}        [description]
             */
            "pause": function(target){
                sa.pause(target);

                return this;
            },
            /**
             * 恢复
             * @param  {[type]} target [description]
             * @return {[type]}        [description]
             */
            "resume": function(target){
                sa.resume(target);

                return this;
            }
        }
    };

    /**
     * 场景解析
     * @param  {String} key      [key]
     * @param  {String} selector [目标对象的selector]
     */
    var _SceneParser = function(key, selector){
        this.key = key;
        this.screen = $(selector);
        this.settings = this.parse();

        var Y = SCREEN_ANIMATE.MODE.Y;
        var X = SCREEN_ANIMATE.MODE.X;
        var IN = SCREEN_ANIMATE.ACTION.IN;
        var OUT = SCREEN_ANIMATE.ACTION.OUT;
        var UP = SCREEN_ANIMATE.DIR.UP;
        var DOWN = SCREEN_ANIMATE.DIR.DOWN;
        var inSetting = this.settings[IN];
        var outSetting = this.settings[OUT];
        var inType = inSetting ? inSetting.type : undefined;
        var outType = outSetting ? outSetting.type : undefined;

        this.ScreenAnimate = {
            "y": {
                "in": {
                    "up": undefined !== inType ? _ScreenAnimate.createScreenAnimate(inType, Y, IN, UP) : null,
                    "down": undefined !== inType ? _ScreenAnimate.createScreenAnimate(inType, Y, IN, DOWN) : null
                },
                "out": {
                    "up": undefined !== outType ? _ScreenAnimate.createScreenAnimate(outType, Y, OUT, UP) : null,
                    "down": undefined !== outType ? _ScreenAnimate.createScreenAnimate(outType, Y, OUT, DOWN) : null
                }
            },
            "x": {
                "in": {
                    "up": undefined !== inType ? _ScreenAnimate.createScreenAnimate(inType, X, IN, UP) : null,
                    "down": undefined !== inType ? _ScreenAnimate.createScreenAnimate(inType, X, IN, DOWN) : null
                },
                "out": {
                    "up": undefined !== outType ? _ScreenAnimate.createScreenAnimate(outType, X, OUT, UP) : null,
                    "down": undefined !== outType ? _ScreenAnimate.createScreenAnimate(outType, X, OUT, DOWN) : null
                }
            }
        };
    };

    _SceneParser.prototype = {
        // data-scene-in="push.y#duration,timing-function,delay,direction,iteration-count,fill-mode,play-state"
        // data-scene-out="push.y#duration,timing-function,delay,direction,iteration-count,fill-mode,play-state"
        /**
         * 解析
         * @return {Object} [description]
         */
        parse: function(){
            var node = this.screen;
            var dataIn = node.attr("data-scene-in") || "";
            var dataOut = node.attr("data-scene-out") || "";
            
            var parser = function(action, str){
                if(!str){
                    return null;
                }

                var dotIndex = str.indexOf(".");
                var hashIndex = str.indexOf("#");

                if(dotIndex == -1 || hashIndex == -1){
                    return null;
                }

                var type = str.substring(0, dotIndex);
                var mode = str.substring(dotIndex + 1, hashIndex);
                var properties = str.substring(hashIndex + 1);
                var items = properties.split(/[,\s ]+/);
                var size = items.length;
                var item = null;
                var tmp = {
                    "duration": "1s", 
                    "timing-function": "ease", 
                    "delay": "0s", 
                    "direction": "normal", 
                    "iteration-count": "1", 
                    "fill-mode": "both", 
                    "play-state": "running"
                };
                var durationSet = false;

                var isTime = function(str){
                    var n = Number(str.replace(/(ms|s)$/, ""));

                    if(isNaN(n)){
                        return false;
                    }

                    return true;
                };

                var isTimingFunctoin = function(str){
                    //Possible values: cubic-bezier(), steps(), linear, ease, ease-in, ease-out, east-in-out, step-start-step-end
                    var p = /^(cubic\-bezier[\s ]*\([^\(\)]+\)|steps[\s ]*\([^\(\)]+\)|ease|ease\-in|ease\-out|east\-in\-out|step\-start\-step\-end)$/;

                    return p.test(str);
                };

                var isIterationCount = function(str){
                    if(str == "infinite" || /^[0-9]+$/.test(str)){
                        return true;
                    }

                    return false;
                };

                var isDirection = function(str){
                    var p = /^(reverse|alternate|alternate\-reverse)$/;

                    return p.test(str);
                };

                var isFillMode = function(str){
                    var p = /^(forwards|backwards|both)$/;

                    return p.test(str);
                };

                var isPlayState = function(str){
                    var p = /^(running|paused)$/;

                    return p.test(str);
                };

                for(var i = 0; i < size; i++){
                    item = items[i];

                    if(isTime(item)){
                        if(!durationSet){
                            durationSet = true;
                            tmp["duration"] = item;
                        }else{
                            tmp["delay"] = item;
                        }
                    }

                    if(isTimingFunctoin(item)){
                        tmp["timing-function"] = item;
                    }

                    if(isIterationCount(item)){
                        tmp["iteration-count"] = item;
                    }

                    if(isDirection(item)){
                        tmp["direction"] = item;
                    }

                    if(isFillMode(item)){
                        tmp["fill-mode"] = item;
                    }

                    if(isPlayState(item)){
                        tmp["play-state"] = item;
                    }
                }

                return {
                    "type": type,
                    "mode": mode,
                    "action": action,
                    "properties": tmp
                };
            };

            return {
                "in": parser("in", dataIn),
                "out": parser("out", dataOut)
            };
        },
        /**
         * 获取全屏动画
         * @param  {Node}   node     [description]
         * @param  {Object} settings [description]
         * @param  {String} dir      [description]
         * @return {ScreenAnimate}   [description]
         */
        getScreenAnimate: function(node, settings, dir){
            if(!settings){
                return null;
            }
            
            var mode = settings.mode;
            var action = settings.action;

            var sa = this.ScreenAnimate[mode][action][dir];

            if(sa){
                sa.configure(node, settings.properties);
            }

            return sa;
        }       
    };

    _SceneParser.Cache = {};

    _SceneParser.getSceneParser = function(key, selector){
        var ss = _SceneParser.Cache[key] || (_SceneParser.Cache[key] = new _SceneParser(key, selector));

        return ss;
    };

    /**
     * 场景动画
     * @param  {Boolean} enableLoop  [是否启动循环滑屏]
     * @param  {[type]}  enableTouch [是否启动touch]
     */
    var _Scene = function(enableLoop, enableTouch){
        this.enableLoop = (enableLoop === true || undefined === enableLoop);
        this.enableTouch = (enableTouch === true || undefined === enableTouch);

        this.index = 0;
        this.lastIndex = 0;
        this.items = [];
        this.nodes = [];
        this.size = 0;
        this.locked = false;
        this.forceLocked = false;
        this.forceBackLocked = false;
        this.forceForwardLocked = false;

        this.touchDuration = 10;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
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

    _Scene.prototype = {
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
        /**
         * 获取回调栈
         * @return {[type]} [description]
         */
        getHandleStack : function(){
            return this.handleStack;
        },
        /**
         * 设置场景的索引
         * @param {[type]} index [description]
         */
        setIndex: function(index){
            this.index = index;
        },
        /**
         * 获取场景的索引
         * @return {[type]} [description]
         */
        getIndex: function(){
            return this.index;
        },
        /**
         * 获取最后一个场景的索引
         * @return {[type]} [description]
         */
        getLastIndex: function(){
            return this.lastIndex;
        },
        /**
         * 获取场景个数
         * @return {[type]} [description]
         */
        getSize: function(){
            return this.size;
        },
        /**
         * 设置是否允许循环
         * @param {[type]} loop [description]
         */
        setLoop: function(loop){
            this.enableLoop = (loop === true);
        },
        /**
         * 设置是否启动TOUCH
         * @param {[type]} touch [description]
         */
        setTouch: function(touch){
            this.enableTouch = (touch === true);
        },
        /**
         * 设置是否锁定场景
         * @param {[type]} locked [description]
         */
        setLocked: function(locked){
            this.locked = (locked === true);
        },
        /**
         * 设置是否强制锁定场景
         * @param {[type]} locked [description]
         */
        setForceLocked: function(locked){
            this.forceLocked = (locked === true);
        },
        /**
         * 设置是否强制锁定回退
         * @param {[type]} locked [description]
         */
        setForceBackLocked: function(locked){
            this.forceBackLocked = (locked === true);
        },
        /**
         * 设置是否强制锁定前滑
         * @param {[type]} locked [description]
         */
        setForceForwardLocked: function(locked){
            this.forceForwardLocked = (locked === true);
        },
        /**
         * 获取是否启动循环
         * @return {Boolean} [description]
         */
        isEnableLoop: function(){
            return this.enableLoop;
        },
        /**
         * 获取是否启动touch
         * @return {Boolean} [description]
         */
        isEnableTouch: function(){
            return this.enableTouch;
        },
        /**
         * 获取是否被锁定
         * @return {Boolean} [description]
         */
        isLocked: function(){
            return this.locked;
        },
        /**
         * 获取是否被强制锁定
         * @return {Boolean} [description]
         */
        isForceLocked: function(){
            return this.forceLocked;
        },
        /**
         * 获取是否被强制锁定回退
         * @return {Boolean} [description]
         */
        isForceBackLocked: function(){
            return this.forceBackLocked;
        },
        /**
         * 获取是否被被强制锁定前滑
         * @return {Boolean} [description]
         */
        isForceForwardLocked: function(){
            return this.forceForwardLocked;
        },
        /**
         * 释放锁定
         * @return {[type]} [description]
         */
        releaseLock: function(){
            this.setLocked(false);
        },
        /**
         * 释放强制锁定
         * @return {[type]} [description]
         */
        releaseForceLock: function(){
            this.setForceLocked(false);
        },
        /**
         * 释放强制锁定回退
         * @return {[type]} [description]
         */
        releaseForceBackLock: function(){
            this.setForceBackLocked(false);
        },
        /**
         * 释放强制锁定前滑
         * @return {[type]} [description]
         */
        releaseForceForwardLock: function(){
            this.setForceForwardLocked(false);
        },
        /**
         * 设置触摸距离
         * @param {Number} duration [距离]
         */
        setTouchDuration: function(duration){
            this.touchDuration = duration;
        },
        /**
         * 获取真实的滑动信息
         * @param  {Number} x0 [起始点x]
         * @param  {Number} y0 [起始点y]
         * @param  {Number} x1 [结束点x]
         * @param  {Number} y1 [结束点y]
         * @return {Object}    [description]
         */
        getRealSwipeInfo: function(x0, y0, x1, y1){
            var dx = x0 - x1;
            var dy = y0 - y1;
            var adx = Math.abs(dx);
            var ady = Math.abs(dy);

            var isHorizontal = adx > ady;
            var isVertical = adx < ady;
            var isOrigin = adx == ady;

            return {
                "mode": (isOrigin ? "ORIGIN" : (isHorizontal ? SCREEN_ANIMATE.MODE.X : SCREEN_ANIMATE.MODE.Y)),
                "dir": (isOrigin ? "ORIGIN" : ((isHorizontal && dx > 0) || (isVertical && dy > 0) ? SCREEN_ANIMATE.DIR.UP : SCREEN_ANIMATE.DIR.DOWN)),
                "dx": dx,
                "dy": dy,
                "adx": adx,
                "ady": ady
            };
        },
        /**
         * 监听
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        listen: function(node){
            // var ss = this.getSceneScreenItem(this.getIndex());

            if(node.length == 0){
                return 0;
            }

            var flag = node.attr("data-scene-screen-listen");

            if("1" == flag){
                return ;
            }

            node.on(startEvent, "", this, function(e){
                //e.preventDefault();
                // e.stopPropagation();

                var data = e.data;
                var type = e.type;

                if("mousedown" == type){
                    type = "touchstart";
                }

                console.info("scene.screen.listen: " + e.type);

                if(type in data){
                    data[type].apply(data, [e, node]);
                }
            }).on(moveEvent, "", this, function(e){
                var data = e.data;
                var type = e.type;

                if(true === data._started){
                    if("mousemove" == type){
                        type = "touchmove";
                    }

                    console.info("scene.screen.listen: " + e.type);

                    if(type in data){
                        data[type].apply(data, [e, node]);
                    }
                }
            }).on(endEvent, "", this, function(e){
                var data = e.data;
                var type = e.type;

                if("mouseup" == type){
                    type = "touchend";
                }

                console.info("scene.screen.listen: " + e.type);

                if(type in data){
                    data[type].apply(data, [e, node]);
                }
            });

            node.attr("data-scene-screen-listen", "1");

            return this;
        },
        /**
         * 触屏开始
         * @param  {[type]} e    [description]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        touchstart: function(e, node){
            if(true !== this.enableTouch){
                console.info("block: enableTouch/" + this.enableTouch);
                this.exec("block", [e, "touch"]);
                return 0;
            }

            if(true === this.locked){
                console.info("block: locked/" + (this.locked));
                this.exec("block", [e, "locked"]);
                return 0;
            }

            if(true === this.forceLocked){
                console.info("block: forceLocked/" + (this.forceLocked));
                this.exec("block", [e, "force"]);
                return 0;
            }

            if(true === this._moving){
                console.info("block: moving/" + this._moving);
                this.exec("block", [e, "moving"]);
                return 0;
            }

            e = (("changedTouches" in e) ? e.changedTouches[0] : e);

            this._started = true;
            this._moving = undefined;
            this._startX = e.pageX;
            this._startY = e.pageY;
            this._dir = undefined;

            this.exec("touchstart", [this.getIndex()]);
        },
        /**
         * 触屏滑动
         * @param  {[type]} e    [description]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        touchmove: function(e, node){
            if(true !== this.enableTouch){
                console.info("block: enableTouch/" + this.enableTouch);
                this.exec("block", [e, "touch"]);
                return 0;
            }

            if(true === this.locked){
                console.info("block: locked/" + (this.locked));
                this.exec("block", [e, "locked"]);
                return 0;
            }

            if(true === this.forceLocked){
                console.info("block: forceLocked/" + (this.forceLocked));
                this.exec("block", [e, "force"]);
                return 0;
            }

            if(true === this._moving){
                console.info("block: moving/" + this._moving);
                this.exec("block", [e, "moving"]);
                return 0;
            }

            e = (("changedTouches" in e) ? e.changedTouches[0] : e);

            this._moveX = e.pageX;
            this._moveY = e.pageY;

            var swipeInfo = this.getRealSwipeInfo(this._startX, this._startY, this._moveX, this._moveY);
            var sceneScreen = this.getSceneScreenItem(this.getIndex());
            var settings = sceneScreen.settings;
            var mode = settings["out"].mode;
            var shift = 0;
            var dir = 0;
            var duration = 0;

            dir = SCREEN_ANIMATE.DIR.DOWN == swipeInfo.dir ? 1 : -1;
            if(SCREEN_ANIMATE.MODE.X == mode && SCREEN_ANIMATE.MODE.X == swipeInfo.mode){ // 水平
                shift = swipeInfo.dx;
                duration = swipeInfo.adx;
            }else if(SCREEN_ANIMATE.MODE.Y == mode && SCREEN_ANIMATE.MODE.Y == swipeInfo.mode){ // 垂直
                shift = swipeInfo.dy;
                duration = swipeInfo.ady;
            }else{
                shift = 0;
                dir = 0;
                duration = 0;
            }

            // dir = shift < 0 ? -1 : (shift > 0 ? 1 : 0);
            // duration = Math.abs(shift);

            this._moving = false;
            this._dir = undefined;

            if(duration > this.touchDuration && dir !== 0){
                console.info(swipeInfo)
                this._moving = true;
                this._dir = dir;

                node.trigger(endEvent);
            }
        },
        /**
         * 触屏结束
         * @param  {[type]} e    [description]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        touchend: function(e, node){
            if(true === this.enableTouch){
                if(true === this.locked){
                    console.info("block: locked/" + (this.locked));
                    this.exec("block", [e, "locked"]);
                    return 0;
                }

                if(true === this.forceLocked){
                    console.info("block: forceLocked/" + (this.forceLocked));
                    this.exec("block", [e, "force"]);
                    return 0;
                }

                if(true !== this._moving){
                    this.exec("block", [e, "staying"]);
                    return 0;
                }

                if(undefined === this._dir || 0 === this._dir){
                    this.exec("block", [e, "lose"]);
                    return 0;
                }

                e = (("changedTouches" in e) ? e.changedTouches[0] : e);

                this._started = undefined;
                this._moving = false;

                if(-1 === this._dir){ // up / left
                    if(true === this.forceForwardLocked){
                        console.info("block: forward/" + (this.forceForwardLocked));
                        this._moving = false;
                        this._dir = undefined;
                        this.exec("block", [e, "forward"]);
                        return 0;
                    }
                    this.turn(-1, 1);
                }else if(1 === this._dir){ // down / right
                    if(true === this.forceBackLocked){
                        console.info("block: back/" + (this.forceBackLocked));
                        this._moving = false;
                        this._dir = undefined;
                        this.exec("block", [e, "back"]);
                        return 0;
                    }
                    this.turn(1, 1);
                }
            }else{
                this._moving = false;
                this._dir = undefined;
            }
        },
        /**
         * 设置渲染样式
         * @param {Node}   node    [目标节点]
         * @param {String} cssText [样式文本]
         */
        setRenderStyle: function(node, cssText){
            node.attr("data-screen-render-style", cssText);
        },
        /**
         * 获取样式
         * @param  {Node}   node    [目标节点]
         * @return {String}         [样式文本]
         */
        getRenderStyle: function(node){
            return node.attr("data-screen-render-style") || "";
        },
        /**
         * 翻页
         * @param  {Number} dir  [方向]
         * @param  {Number} step [步长]
         */
        turn: function(dir, step){
            var outIndex = this.getIndex();
            var inIndex = outIndex + step;
            var sceneScreen = this.getSceneScreenItem(outIndex);
            var settings = sceneScreen.settings;
            var loop = this.enableLoop;
            var UP = SCREEN_ANIMATE.DIR.UP;
            var DOWN = SCREEN_ANIMATE.DIR.DOWN;
            var OUT = SCREEN_ANIMATE.ACTION.OUT;
            var IN = SCREEN_ANIMATE.ACTION.IN;

            var _dir = UP;

            if(-1 === dir){
                _dir = UP;
                inIndex = outIndex + step;

                if(inIndex > this.lastIndex){
                    if(true === loop){
                        inIndex = (inIndex - this.lastIndex - 1);
                    }else{
                        inIndex = this.lastIndex;
                    }
                }
            }else if(1 === dir){
                _dir = DOWN;
                inIndex = outIndex - step;

                if(inIndex < 0){
                    if(true === loop){
                        inIndex = (inIndex + this.lastIndex + 1);
                    }else{
                        inIndex = 0;
                    }
                }
            }

            console.info("in: " + inIndex + "; out: " + outIndex + "; dir: " + dir);

            if(outIndex !== inIndex){
                this.exec("render", [OUT, settings[OUT], outIndex, inIndex]);
                this.exec("render", [IN, settings[IN], outIndex, inIndex]);

                this.gotoAndPlay(outIndex, OUT, _dir);
                this.gotoAndPlay(inIndex, IN, _dir);

                // Util.delay(50, {
                //     callback: function(elapsedTime, _out, _in, __dir){
                //         this.gotoAndPlay(_out, SCREEN_ANIMATE.ACTION.OUT, __dir);
                //         this.gotoAndPlay(_in, SCREEN_ANIMATE.ACTION.IN, __dir);
                //     },
                //     args: [outIndex, inIndex, _dir],
                //     context: this
                // });
            }else{
                this._moving = false;
                this._dir = undefined;
            }

            this.exec("touchend", [outIndex, inIndex]);
        },
        /**
         * 跳转到指定的场景并播放动画
         * @param  {[type]} index  [description]
         * @param  {[type]} action [description]
         * @param  {[type]} dir    [description]
         * @return {[type]}        [description]
         */
        gotoAndPlay: function(index, action, dir){
            console.info("gotoAndPlay: " + index + "/" + action + "/" + dir)

            var ss = this.getSceneScreenItem(index);
            var sn = this.getSceneScreenNode(index);

            if(ss){
                var settings = ss.settings;
                var setting = settings[action];
                var sa = ss.getScreenAnimate(sn.node, setting, dir);
                var ctx = {
                    "scene": this,
                    "sa": sa
                };

                if(sa){ //有配置
                    sa.set("startbefore", {
                        callback: function(node, index, action, settings){
                            var options = {
                                "node": node,
                                "index": index,
                                "action": action,
                                "settings": settings,
                                "sa": this.sa
                            };

                            this.scene.exec("startbefore", [options]);
                        },
                        args: [index, action, setting],
                        context: ctx
                    }).set("start", {
                        callback: function(e, type, target, animationName, elapsedTime, index, action, settings){
                            var options = {
                                "e": e,
                                "type": type,
                                "target": target,
                                "animationName": animationName,
                                "elapsedTime": elapsedTime,
                                "index": index,
                                "action": action,
                                "settings": settings,
                                "sa": this.sa
                            };

                            this.scene.exec("start", [options]);
                        },
                        args: [index, action, setting],
                        context: ctx
                    }).set("end", {
                        callback: function(e, type, target, animationName, elapsedTime, index, action, settings){
                            var options = {
                                "e": e,
                                "type": type,
                                "target": target,
                                "animationName": animationName,
                                "elapsedTime": elapsedTime,
                                "index": index,
                                "action": action,
                                "settings": settings,
                                "sa": this.sa
                            };

                            if(SCREEN_ANIMATE.ACTION.IN == action){
                                this.scene.setIndex(index);

                                this.scene._moving = false;
                                this.scene._dir = undefined;
                            }

                            this.scene.exec("end", [options]);
                        },
                        args: [index, action, setting],
                        context: ctx
                    }).set("iteration", {
                        callback: function(e, type, target, animationName, elapsedTime, index, action, settings){
                            var options = {
                                "e": e,
                                "type": type,
                                "target": target,
                                "animationName": animationName,
                                "elapsedTime": elapsedTime,
                                "index": index,
                                "action": action,
                                "settings": settings,
                                "sa": this.sa
                            };

                            this.scene.exec("iteration", [options]);
                        },
                        args: [index, action, setting],
                        context: ctx
                    }).play(sn.node);
                }
            }
        },
        /**
         * 跳转到指定的场景
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        go: function(index){
            var lastIndex = this.getLastIndex();
            var modIndex = index % lastIndex;
            var realIndex = (index > 0 && (index % lastIndex === 0) ? lastIndex : modIndex);
            var step = realIndex - this.getIndex();

            var dir = step < 0 ? 1 : -1;

            this.exec("touchstart", [this.getIndex()]);
            this.turn(dir, Math.abs(step));
        },
        /**
         * 跳转到下一个场景
         * @return {Function} [description]
         */
        next: function(){
            this.exec("touchstart", [this.getIndex()]);
            this.turn(-1, 1);
        },
        /**
         * 跳转到上一个场景
         * @return {[type]} [description]
         */
        prev: function(){
            this.exec("touchstart", [this.getIndex()]);
            this.turn(1, 1);
        },
        /**
         * 清除所有场景
         * @return {[type]} [description]
         */
        clearSceneScreen: function(){
            this.items.length = 0;
            this.items = [];
            this.index = 0;
            this.lastIndex = 0;
            this.size = 0;
        },
        /**
         * 添加场景
         * @param {[type]} key      [description]
         * @param {[type]} selector [description]
         */
        addSceneScreen: function(key, selector){
            var _node = $(selector);
            var ss = _SceneParser.getSceneParser(key, selector);
            var node = {"key": key, "node": _node};

            this.nodes.push(node);
            this.items.push(ss);
            this.size = this.items.length;
            this.lastIndex = this.size - 1;

            this.listen(node.node);
        },
        /**
         * 移除指定的场景
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        removeSceneScreen: function(index){
            if(this.size > 0 && index >= 0 && index <= this.lastIndex){
                this.items.splice(index, 1);
                this.nodes.splice(index, 1);
                this.size = this.items.length;
                this.lastIndex = Math.max(this.size - 1, 0);
            }
        },
        /**
         * 获取指定的场景项目
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        getSceneScreenItem: function(index){
            if(this.size > 0 && index >= 0 && index <= this.lastIndex){
                return this.items[index];
            }

            return null;
        },
        /**
         * 查找指定的场景项目
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        findSceneScreenItem: function(key){
            var index = this.findSceneScreenIndex(key);

            return this.getSceneScreenItem(index);
        },
        /**
         * 获取所有的场景项目
         * @return {[type]} [description]
         */
        getSceneScreenItems: function(){
            return this.items || [];
        },
        /**
         * 获取指定的场景节点
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        getSceneScreenNode: function(index){
            if(this.size > 0 && index >= 0 && index <= this.lastIndex){
                return this.nodes[index];
            }

            return null;
        },
        /**
         * 查找指定的场景节点
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        findSceneScreenNode: function(key){
            var index = this.findSceneScreenIndex(key);

            return this.getSceneScreenNode(index);
        },
        /**
         * 获取所有场景节点
         * @return {[type]} [description]
         */
        getSceneScreenNodes: function(){
            return this.nodes || [];
        },
        /**
         * 查找指定的场景索引
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        findSceneScreenIndex: function(key){
            var nodes = this.getSceneScreenNodes();
            var size = nodes.length;

            for(var i = 0; i < size; i++){
                if(nodes[i].key === key){
                    return i;
                }
            }

            return -1;
        },
        /**
         * 备份样式
         * @param  {[type]} dom [description]
         * @return {[type]}     [description]
         */
        backup: function(dom){
            if(!dom.hasAttribute("data-screen-source-style")){
                dom.setAttribute("data-screen-source-style", dom.style.cssText);
            }
        },
        /**
         * 设备样式
         * @param  {[type]} dom [description]
         * @param  {[type]} map [description]
         * @return {[type]}     [description]
         */
        source: function(dom, map){
            var tmp = document.createElement("div");
            var backup = dom.getAttribute("data-screen-source-style") || "";

            tmp.style.cssText = backup;

            $(tmp).css(map);

            dom.setAttribute("data-screen-source-style", tmp.style.cssText);
        },
        /**
         * 查找并添加场景
         * @param  {[type]} selector [description]
         * @param  {[type]} handle   [description]
         * @return {[type]}          [description]
         */
        lookup: function(selector, handle){
            var objs = $(selector);
            var _this = this;

            objs.each(function(index, item){
                _this.backup(item);
                _this.addSceneScreen(item.getAttribute("data-screen-id"), item);

                Util.execHandler(handle, [index, item]);
            });
        }
    };

    _Scene.Cache = {};

    module.exports = {
        "version": "R17B0817",
        "createScene": function(name, enableLoop, enableTouch){
            var s = _Scene.Cache[name] || (_Scene.Cache[name] = new _Scene(enableLoop, enableTouch));

            return {
                "set": function(type, option){
                    s.set(type, option);

                    return this;
                },
                "get": function(type){
                    return s.get(type);
                },
                "remove": function(type){
                    s.remove(type);

                    return this;                
                },
                "exec": function(type, args){
                    s.exec(type, args);

                    return this;
                },
                "clear": function(){
                    s.clear();

                    return this;
                },
                "getHandleStack": function(){
                    return s.getHandleStack();
                },
                "setIndex": function(index){
                    s.setIndex(index);

                    return this;
                },
                "getIndex": function(){
                    return s.getIndex();
                },
                "getLastIndex": function(){
                    return s.getLastIndex();
                },
                "getSize": function(){
                    return s.getSize();
                },
                "isEnableTouch": function(){
                    return s.isEnableTouch();
                },
                "isEnableLoop": function(){
                    return s.isEnableLoop();
                },
                "isLocked": function(){
                    return s.isLocked();
                },
                "isForceLocked": function(){
                    return s.isForceLocked();
                },
                "isForceBackLocked": function(){
                    return s.isForceBackLocked();
                },
                "isForceForwardLocked": function(){
                    return s.isForceForwardLocked();
                },
                "setLoop": function(loop){
                    s.setLoop(loop);

                    return this;
                },
                "setTouch": function(touch){
                    s.setTouch(touch);

                    return this;
                },
                "setLocked": function(locked){
                    s.setLocked(locked);

                    return this;
                },
                "setForceLocked": function(locked){
                    s.setForceLocked(locked);

                    return this;
                },
                "setForceBackLocked": function(locked){
                    s.setForceBackLocked(locked);

                    return this;
                },
                "setForceForwardLocked": function(locked){
                    s.setForceForwardLocked(locked);

                    return this;
                },
                "releaseLock": function(){
                    s.releaseLock();

                    return this;
                },
                "releaseForceLock": function(){
                    s.releaseForceLock();

                    return this;
                },
                "releaseForceBackLock": function(){
                    s.releaseForceBackLock();

                    return this;
                },
                "releaseForceForwardLock": function(){
                    s.releaseForceForwardLock();

                    return this;
                },
                "setTouchDuration": function(duration){
                    s.setTouchDuration(duration);

                    return this;
                },
                "clearSceneScreen": function(){
                    s.clearSceneScreen();

                    return this;
                },
                "addSceneScreen": function(key, selector){
                    s.addSceneScreen(key, selector);

                    return this;
                },
                "removeSceneScreen": function(index){
                    s.removeSceneScreen(index);

                    return this;
                },
                "lookup": function(selector, handle){
                    s.lookup(selector, handle);

                    return this;
                },
                "getSceneScreenItem": function(index){
                    return s.getSceneScreenItem(index);
                },
                "findSceneScreenItem": function(key){
                    return s.findSceneScreenItem(key);
                },
                "getSceneScreenItems": function(){
                    return s.getSceneScreenItems();
                },
                "getSceneScreenNode": function(index){
                    return s.getSceneScreenNode(index);
                },
                "findSceneScreenNode": function(key){
                    return s.findSceneScreenNode(key);
                },
                "getSceneScreenNodes": function(){
                    return s.getSceneScreenNodes();
                },
                "findSceneScreenIndex": function(key){
                    return s.findSceneScreenIndex(key);
                },
                "go": function(index){
                    s.go(index);

                    return this;
                },
                "next": function(){
                    s.next();

                    return this;
                },
                "prev": function(){
                    s.prev();

                    return this;
                },
                "setRenderStyle": function(node, cssText){
                    s.setRenderStyle(node, cssText);

                    return this;
                },
                "getRenderStyle": function(node){
                    return s.getRenderStyle(node);
                },
                "source": function(dom, styleMap){
                    s.source(dom, styleMap);

                    return this;
                }
            };
        }
    }
});