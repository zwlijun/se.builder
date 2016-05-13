/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Swiper模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.03
 */
;define(function(require, exports, module){
    var Listener        = require("mod/se/listener");
    var Util            = require("mod/se/util");
    var Style           = require("mod/se/css");
    var Timer           = require("mod/se/timer");

    var HandleStack     = Listener.HandleStack;

    var _document = document;
    var _window = window;

    var supportTouch    = ("ontouchstart" in window);
    var startEvent = supportTouch ? "touchstart.swiper" : "mousedown.swiper";
    var endEvent   = supportTouch ? "touchend.swiper"   : "mouseup.swiper";
    var moveEvent  = supportTouch ? "touchmove.swiper"  : "mousemove.swiper";

    var SwiperSchema = {
        name: "swiper",
        navigator: {
            go: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var index = Number(args[1] || 0);
                var swiper = _Swiper.getSwiper(name);

                if(!swiper){
                    return 0;
                }

                index = isNaN(index) ? 0 : index;

                swiper.go(index);
            },
            next: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var swiper = _Swiper.getSwiper(name);

                if(!swiper){
                    return 0;
                }

                swiper.next();
            },
            prev: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var swiper = _Swiper.getSwiper(name);

                if(!swiper){
                    return 0;
                }

                swiper.prev();
            },
            play: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var swiper = _Swiper.getSwiper(name);

                if(!swiper){
                    return 0;
                }

                swiper.play();
            },
            pause: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];
                var swiper = _Swiper.getSwiper(name);

                if(!swiper){
                    return 0;
                }

                swiper.pause();
            }
        }
    };

    var _BASE_CLASSNAME = [
        "mod-swiper"
    ];

    var _CONTROL_CLASSNAME = [
        "x", 
        "y", 
        "goto-after", 
        "goto-before"
    ]

    var _TYPE_CLASSNAME = [
        "slider", 
        "cube", 
        "draw", 
        "fade", 
        "scale"
    ];

    //DOM Options
    //data-swiper-type      :: 类型 [slider | scale | fade | draw | cube]
    //data-swiper-mode      :: 模式 [x | y | free]
    //data-swiper-distance  :: 滑屏距离（手指滑动多少个PX后触发切换）[number]
    //data-swiper-dots      :: 滑屏定位点或缩略图 [none | static | bottom | right]
    //data-swiper-width     :: 宽度 -1: 100% [number]
    //data-swiper-height    :: 高度 [number]
    //data-swiper-control   :: 是否显示控制箭头 [0 | 1]
    //data-swiper-autoplay  :: 是否自动播放 [0 | 1]
    //data-swiper-loop      :: 是否循环播放 [0 | 1]
    //data-swiper-interval  :: 自动播放时间隔周期 [number]，单位ms
    //data-swiper-duration  :: 滑屏切换时间 [number]，单位s
    //data-swiper-timing    :: 滑屏过渡效果 [ease | ease-in | ease-out | ease-in-out | cubic-bezier(n,n,n,n) | linear]
    //data-swiper-delay     :: 滑屏延迟时长 [number]，单位s
    //data-swiper-unit      :: 尺寸单位 [% | em | px | pt| rem | ex | pc | in | cm | mm]
    var GetDefaultOptions = function(){
        return {
            "type": "slider",                   //类型 [slider | ...]
            "mode": "x",                        //模式 [x | y | free]
            "distance": 50,                     //滑屏距离（手指滑动多少个PX后触发切换）
            "dots": "none",                     //滑屏定位点或缩略图 [none | static | bottom | right]
            "width": -1,                        //宽度 -1: 100%
            "height": 400,                      //高度
            "control": false,                   //控制器
            "autoplay": false,                  //是否自动播放
            "loop": true,                       //是否循环
            "interval": 4000,                   //自动播放时间隔周期
            "duration": 1,                      //滑屏时长 [n]s
            "timing": "ease",                   //滑屏过渡类型 [ease | ease-in | ease-out | ease-in-out | cubic-bezier(n,n,n,n) | linear]
            "delay": 0,                         //滑屏延迟时长 [n]s
            "unit": "px"                        //尺寸单位 [% | em | px | pt| rem | ex | pc | in | cm | mm]
        };
    };

    var ParseDOMOptions = function(selector, useDefault){
        var attrs = [
            {"name": "type", "dataType": "string", "defaultValue": "slider"},
            {"name": "mode", "dataType": "string", "defaultValue": "x"},
            {"name": "distance", "dataType": "number", "defaultValue": "50"},
            {"name": "dots", "dataType": "string", "defaultValue": "none"},
            {"name": "width", "dataType": "number", "defaultValue": "-1"},
            {"name": "height", "dataType": "number", "defaultValue": "400"},
            {"name": "control", "dataType": "boolean", "defaultValue": "0"},
            {"name": "autoplay", "dataType": "boolean", "defaultValue": "0"},
            {"name": "loop", "dataType": "boolean", "defaultValue": "1"},
            {"name": "interval", "dataType": "number", "defaultValue": "4000"},
            {"name": "duration", "dataType": "number", "defaultValue": "1"},
            {"name": "timing", "dataType": "string", "defaultValue": "ease"},
            {"name": "delay", "dataType": "number", "defaultValue": "0"},
            {"name": "unit", "dataType": "string", "defaultValue": "px"}
        ];
        var size = attrs.length;
        var node = $(selector);
        var opts = {};
        var attr = null;
        var value = null;

        if(node.length === 0){
            return null;
        }

        for(var i = 0; i < size; i++){
            attr = attrs[i];

            value = node.attr("data-swiper-" + attr.name);

            if(!value){
                if(true !== useDefault){
                    continue;
                }

                value = attr.defaultValue;
            }

            if("number" == attr.dataType){
                value = Number(value);

                if(isNaN(value)){
                    value = Number(attr.defaultValue);
                }

                opts[attr.name] = value;
            }else if("boolean" == attr.dataType){
                opts[attr.name] = ("1" === value);
            }else{
                opts[attr.name] = value;
            }
        }

        return opts;
    };

    var emit = function(type, str){
        var console = window.console || {};
        
        if(type in console){
            console[type](str);
        }
    };

    var _Swiper = function(name, options){
        this.name = name;
        this.opts = $.extend(
            GetDefaultOptions(), 
            options || {}, 
            ParseDOMOptions('[data-swiper="' + name + '"]', false) || {}
        );

        this.viewport = null;
        this.body = null;
        this.footer = null;
        this.dots = null;
        this.controller = null;
        this.index = 0;
        this.lastIndex = 0;
        this.nextIndex = 0;
        this.items = [];
        this.size = 0;

        this._enabled = true;
        this._locked = false;
        this._forceLocked = false;
        this._forwardLocked = false;
        this._backwardLocked = false;
        this._playing = false;
        this._enterstart = false;
        this._exitstart = false;
        this._enterend = false;
        this._exitend = false;
        this._startX = 0;
        this._startY = 0;
        this._moveX = 0;
        this._moveY = 0;
        this._stopX = 0;
        this._stopY = 0;
        this._dir = 0;
        this._dynamicMode = null;
        this._forceIndex = -1;
        this._timer = Timer.getTimer("timer_" + name);

        this.realtime = {};

        this.isbind = false;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onnotfound: null,           //[]
            oncreatebefore: null,       //[]
            oncreate: null,             //[]
            onblock: null,              //[type]
            onstart: null,              //[target]
            onend: null,                //[target]
            onenterstart: null,          //[target]
            onenterend: null,           //[target]
            onexitstart: null,          //[target]
            onexitend: null             //[target]
        }, this.handleStack);

        startEvent += "_" + name;
        moveEvent += "_" + name;
        endEvent += "_" + name;
    };

    _Swiper.prototype = {
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
        /**
         * 设置或获取options
         * @return {[type]} [description]
         */
        options: function(){
            var args = arguments;
            var size = args.length;
            var options = this.opts;

            if(1 === size){
                var v = args[0];
                var vt = Object.prototype.toString.call(v);

                if("[object String]" == vt){
                    return options[v];
                }

                if("[object Object]" == vt){
                    this.opts = $.extend(options, v);
                }
            }else if(2 === size){
                var key = args[0];
                var value = args[1];

                this.opts[key] = value;
            }
        },
        setNextIndex: function(index){
            if(true === this.options("loop")){
                if(index < 0){
                    index = this.getLastIndex();
                }else if(index > this.getLastIndex()){
                    index = 0;
                }
            }

            this.nextIndex = index;
        },
        getNextIndex: function(){
            return this.nextIndex;
        },
        setIndex: function(index){
            var nIndex = Number(index);

            if(isNaN(nIndex)){
                nIndex = 0;
            }else{
                nIndex = Math.min(Math.max(nIndex, 0), this.getLastIndex());
            }

            this.index = nIndex;
        },
        getIndex: function(){
            return this.index;
        },
        getLastIndex: function(){
            return this.lastIndex;
        },
        getItems: function(){
            return this.items;
        },
        getSize: function(){
            return this.size;
        },
        getItem: function(index){
            var items = this.getItems();
            var item = null;

            if(this.getSize() > 0 && index >= 0 && index <= this.getLastIndex()){
                item = items[index];
            }

            return item;
        },
        getCurrentItem: function(){
            var index = this.getIndex();

            return this.getItem(index);
        },
        isEnabled: function(){
            return this._enabled;
        },
        isLocked: function(){
            return this._locked;
        },
        isForceLocked: function(){
            return this._forceLocked;
        },
        isForwardLocked: function(){
            return this._forwardLocked;
        },
        isBackwardLocked: function(){
            return this._backwardLocked;
        },
        setEnabled: function(enabled){
            this._enabled = true === enabled;
        },
        setLocked: function(locked){
            this._locked = true === locked;
        },
        setForceLocked: function(locked){
            this._forceLocked = true === locked;
        },
        setForwardLocked: function(locked){
            this._forwardLocked = true === locked;
        },
        setBackwardLocked: function(locked){
            this._backwardLocked = true === locked;
        },
        playing: function(){
            var args = arguments;
            var size = args.length;

            if(1 == size){
                this._playing = true === args[0];
            }else{
                return this._playing;
            }
        },
        getRealType: function(type){
            if("random" == type){
                type = _TYPE_CLASSNAME[Math.floor(Math.random() * _TYPE_CLASSNAME.length)];
            }

            return type;
        },
        findViewport: function(swiper){
            this.viewport = swiper;
            this.body = swiper.children(".mod-swiper-body");
            this.items = this.body.children(".mod-swiper-item");
            this.controller = swiper.children(".mod-swiper-control");
            this.footer = swiper.children(".mod-swiper-footer");
            this.dots = this.footer.children(".mod-swiper-dots");

            this.size = this.items.length;
            this.lastIndex = Math.max(this.size - 1, 0);

            this.listen();
        },
        createViewport: function(){
            var viewport = this.viewport;
            var data = {
                swiper: this
            };
            if(true !== this.isbind){
                viewport.on(startEvent, data, function(e){
                    var data = e.data;
                    var swiper = data.swiper;

                    if(!swiper.isEnabled()){
                        swiper.exec("block", ["enabled"]);
                        emit("info", "block#enabled");
                        return ;
                    }

                    if(swiper.isLocked()){
                        swiper.exec("block", ["locked"]);
                        emit("info", "block#locked");
                        return ;
                    }

                    if(swiper.isForceLocked()){
                        swiper.exec("block", ["forceLocked"]);
                        emit("info", "block#forceLocked");
                        return ;
                    }

                    if(swiper.playing()){
                        swiper.exec("block", ["playing"]);
                        emit("info", "block#playing");
                        return ;
                    }

                    var event = (("changedTouches" in e) ? e.changedTouches[0] : e);

                    swiper.playing(false);
                    swiper._startX = event.pageX;
                    swiper._startY = event.pageY;
                    swiper._dir = 0;

                    $(_document).on(moveEvent, data, swiper.move);
                    $(_document).on(endEvent, data, swiper.end);
                });

                this.isbind = true;
            }
        },
        listen: function(){
            var items = this.getItems();
            var size = this.getSize();
            var item = null;
            var flag = null;

            var animation = [
                "webkitAnimationStart", 
                "mozAnimationStart", 
                "MSAnimationStart", 
                "oanimationstart", 
                "animationstart",
                "webkitAnimationEnd", 
                "mozAnimationEnd", 
                "MSAnimationEnd", 
                "oanimationend", 
                "animationend"
            ];
            var data = {
                swiper: this
            };

            var body = this.body;

            flag = body.attr("data-swiper-listen");

            if("1" != flag){
                body.on(animation.join(" "), data, function(e){
                    e.stopPropagation();
                    e.preventDefault();

                    var data = e.data;
                    var type = e.type;
                    var swiper = data.swiper;

                    type = type.toLowerCase();
                    type = type.replace(/^(webkit|moz|ms|o)/, "");

                    if(type in swiper){
                        swiper[type].apply(swiper, [e, type]);
                    }
                });
                body.attr("data-swiper-listen", "1");
            }

            for(var i = 0; i < size; i++){
                item = $(this.getItem(i));
                flag = item.attr("data-swiper-listen");

                if("1" == flag){
                    continue;
                }

                item.on(animation.join(" "), data, function(e){
                    e.stopPropagation();
                    e.preventDefault();

                    var data = e.data;
                    var type = e.type;
                    var swiper = data.swiper;

                    type = type.toLowerCase();
                    type = type.replace(/^(webkit|moz|ms|o)/, "");

                    if(type in swiper){
                        swiper[type].apply(swiper, [e, type]);
                    }
                });

                item.attr("data-swiper-listen", "1");
            }
        },
        move: function(e){
            var data = e.data;
            var swiper = data.swiper;

            if(!swiper.isEnabled()){
                swiper.exec("block", ["enabled"]);
                emit("info", "block#enabled");
                return ;
            }

            if(swiper.isLocked()){
                swiper.exec("block", ["locked"]);
                emit("info", "block#locked");
                return ;
            }

            if(swiper.isForceLocked()){
                swiper.exec("block", ["forceLocked"]);
                emit("info", "block#forceLocked");
                return ;
            }

            var event = (("changedTouches" in e) ? e.changedTouches[0] : e);

            var startX = swiper._startX;
            var startY = swiper._startY;
            var moveX = swiper._moveX = event.pageX;
            var moveY = swiper._moveY = event.pageY;
            var offsetX = moveX - startX;
            var offsetY = moveY - startY;
            var absOffsetX = Math.abs(offsetX);
            var absOffsetY = Math.abs(offsetY);
            var distance = swiper.options("distance");

            var currentItem = swiper.getCurrentItem();
            var currentNode = $(currentItem);
            var _type = swiper.getRealType(currentNode.attr("data-swiper-type") || swiper.options("type"));
            var _mode = currentNode.attr("data-swiper-mode") || swiper.options("mode");
            var _duration = currentNode.attr("data-swiper-duration") || swiper.options("duration");
            var _timing = currentNode.attr("data-swiper-timing") || swiper.options("timing");
            var _delay = currentNode.attr("data-swiper-delay") || swiper.options("delay");

            swiper.realtime = {
                "type": _type,
                "mode": _mode,
                "duration": _duration,
                "timing": _timing,
                "delay": _delay
            };

            var mode = _mode;

            if("x" == mode){
                if(absOffsetX < distance){
                    swiper.exec("block", ["distance"]);
                    emit("info", "block#distance(" + absOffsetX + "," + distance + ")");
                    return ;
                }

                swiper._dynamicMode = "x";
                swiper._dir = offsetX < 0 ? 1 /* after/next */ : -1 /* before/prev */
            }else if("y" == mode){
                if(absOffsetY < distance){
                    swiper.exec("block", ["distance"]);
                    emit("info", "block#distance(" + absOffsetY + "," + distance + ")");
                    return ;
                }

                swiper._dynamicMode = "y";
                swiper._dir = offsetY < 0 ? 1 /* after/next */ : -1 /* before/prev */
            }else{ // free
                if(absOffsetX == absOffsetY || (absOffsetX < distance && absOffsetY < distance)){
                    swiper.exec("block", ["distance"]);
                    emit("info", "block#distance(" + absOffsetX + "," + absOffsetY + "," + distance + ")");
                    return ;
                }

                if(absOffsetX > absOffsetY){
                    swiper._dynamicMode = "x";
                    swiper._dir = offsetX < 0 ? 1 /* after/next */ : -1 /* before/prev */
                }else if(absOffsetX < absOffsetY){
                    swiper._dynamicMode = "y";
                    swiper._dir = offsetY < 0 ? 1 /* after/next */ : -1 /* before/prev */
                }
            }

            if(swiper._dir == 1){
                if(swiper.isForwardLocked()){
                    swiper.exec("block", ["forwardLocked"]);
                    emit("info", "block#forwardLocked");

                    return ;
                }
                if(true !== swiper.options("loop") && swiper.getIndex() === swiper.getLastIndex()){
                    swiper.exec("block", ["last"]);
                    emit("info", "block#last");

                    return ;
                }
            }

            if(swiper._dir == -1){
                if(swiper.isBackwardLocked()){
                    swiper.exec("block", ["backwardLocked"]);
                    emit("info", "block#backwardLocked");

                    return ;
                }

                if(true !== swiper.options("loop") && swiper.getIndex() === 0){
                    swiper.exec("block", ["first"]);
                    emit("info", "block#first");

                    return ;
                }
            }

            //todo
            swiper.playing(true);
        },
        end: function(e){
            var data = e.data;
            var swiper = data.swiper;

            $(_document).off(moveEvent);
            $(_document).off(endEvent);

            if(!swiper.isEnabled()){
                swiper.exec("block", ["enabled"]);
                emit("info", "block#enabled");
                return ;
            }

            if(swiper.isLocked()){
                swiper.exec("block", ["locked"]);
                emit("info", "block#locked");
                return ;
            }

            if(swiper.isForceLocked()){
                swiper.exec("block", ["forceLocked"]);
                emit("info", "block#forceLocked");
                return ;
            }

            if(!swiper.playing()){
                swiper.exec("block", ["stop"]);
                emit("info", "block#stop");
                return ;
            }

            swiper.playing(false);
            swiper._enterstart = false;
            swiper._exitstart = false;

            var realtime = swiper.realtime;
            var _dir = swiper._dir;
            var _dynamicMode = swiper._dynamicMode;

            var className = [];
            var viewport = swiper.viewport;
            var aniamtions = {
                "animationDuration": realtime.duration + "s",
                "animationTimingFunction": realtime.timing,
                "animationDelay": realtime.delay + "s"
            };

            className.push(realtime.type);
            className.push(_dynamicMode);
            className.push(_dir == 1 ? "goto-after" : "goto-before");

            Style.map(swiper.body, aniamtions);
            Style.map(swiper.getItems(), aniamtions);

            _Swiper.Settings.invoke(realtime.type, "render", [swiper, _dynamicMode]);

            viewport.removeClass(_CONTROL_CLASSNAME.join(" "))
                    .removeClass(_TYPE_CLASSNAME.join(" "))
                    .addClass(className.join(" "));

            // viewport[0].className = className.join(" ");
        },
        animationstart: function(e, type){
            var target = e.currentTarget;
            var $node = $(target);
            var realtime = this.realtime;

            this.setForceLocked(true);

            if("cube" == realtime.type){
                this.exec("start", [target]);
            }else{
                this._enterend = false;
                this._exitend = false;

                if(!this._enterstart && !this._exitstart){
                    this.exec("start", [target]);
                }

                if($node.hasClass("current")){
                    this._enterstart = true;
                    this.exec("exitstart", [target]);
                }
                if($node.hasClass("maybe")){
                    this._exitstart = true;
                    this.exec("enterstart", [target]);
                }
            }

            this.setNextIndex(this.getIndex() + this._dir);
        },
        animationend: function(e, type){
            var target = e.currentTarget;
            var $node = $(target);
            var realtime = this.realtime;

            _Swiper.Settings.invoke(realtime.type, "restore", [this])

            if("cube" == realtime.type){
                this.setForceLocked(false);
            }else{
                if($node.hasClass("current")){
                    this._exitend = true;
                    this.exec("exitend", [target]);
                }
                if($node.hasClass("maybe")){
                    this._enterend = true;
                    this.exec("enterend", [target]);
                }

                this.setForceLocked(!(this._exitend && this._enterend));
            }

            if(!this.isForceLocked()){
                this.setIndex(this.getNextIndex());

                this.render();

                this.exec("end", [target]);
            }
        },
        initDots: function(){
            var dots = this.options("dots");

            var dotItmes = this.dots.children("li");
            var size = dotItmes.length;
            console.info(size)

            for(var i = 0; i < size; i++){
                $(dotItmes[i]).attr("data-action-tap", "swiper://navigator/go#" + this.name + "," + i)
                              .attr("data-action-mouseover", "swiper://navigator/pause#" + this.name)
                              .attr("data-action-mouseout", "swiper://navigator/play#" + this.name);
            }

            this.viewport.addClass("dots-float-" + dots);
            this.footer.removeClass("hide");
        },
        updateDots: function(){
            if("none" == this.options("dots")){
                return ;
            }

            var dotItems = this.dots.children("li");

            dotItems.removeClass("on");
            $(dotItems.get(this.getIndex())).addClass("on");
        },
        initControl: function(){
            var control = this.options("control");

            this.controller.addClass("hide");
        },
        sizeof: function(type, _set){
            var swiper = this;
            var width = swiper.options("width");
            var height = swiper.options("height");
            var unit = swiper.options("unit");
            var widthUnit = unit;
            var heightUnit = unit;
            var body = swiper.body;
            var viewport = swiper.viewport;
            var current = body.find(".mod-swiper-item.current");
            var after = body.find(".mod-swiper-item.maybe.after");
            var before = body.find(".mod-swiper-item.maybe.before");
            var dom = null;
            var rect = null;

            switch(type){
                case "body":
                    dom = body[0];
                break;
                case "after":
                    dom = after[0];
                break;
                case "before":
                    dom = before[0];
                break;
                default:
                    dom = current[0];
                break;
            }
            rect = Util.getBoundingClientRect(dom);
            
            widthUnit = width <= 0 ? "px" : unit;
            heightUnit = height <= 0 ? "px": unit;

            width = width <= 0 ? rect.width : width;
            height = height <= 0 ? rect.height : height;
            
            if(false !== _set){
                var obj = {
                    "width": width + widthUnit,
                    "height": height + heightUnit
                };
                body.css(obj);
                viewport.css(obj);
            }

            return {
                "width": width,
                "height": height,
                "unit": {
                    "width": widthUnit,
                    "height": heightUnit
                }
            };
        },
        render: function(){
            var items = this.getItems();
            var size = this.getSize();
            var index = this.getIndex();
            var prevIndex = index - 1;
            var nextIndex = index + 1;
            var item = null;

            if(prevIndex < 0){
                prevIndex = this.getLastIndex();
            }
            if(nextIndex > this.getLastIndex()){
                nextIndex = 0;
            }

            // this.viewport[0].className = "mod-swiper dots-float-" + this.options("dots");
            this.viewport.removeClass(_CONTROL_CLASSNAME.join(" "));

            for(var i = 0; i < size; i++){
                item = this.getItem(i);

                item.className = "mod-swiper-item impossible";

                if(prevIndex === i){
                    item.className = "mod-swiper-item maybe before";
                }
                if(nextIndex === i){
                    item.className = "mod-swiper-item maybe after";
                }
                if(index === i){
                    item.className = "mod-swiper-item current";
                }
            }

            this.updateDots();
        },
        run: function(_dir){
            var swiper = this;
            var currentItem = swiper.getCurrentItem();
            var currentNode = $(currentItem);
            var _type = swiper.getRealType(currentNode.attr("data-swiper-type") || swiper.options("type"));
            var _mode = currentNode.attr("data-swiper-mode") || swiper.options("mode");
            var _duration = currentNode.attr("data-swiper-duration") || swiper.options("duration");
            var _timing = currentNode.attr("data-swiper-timing") || swiper.options("timing");
            var _delay = currentNode.attr("data-swiper-delay") || swiper.options("delay");

            var _dynamicMode = "free" == _mode ? swiper.options("mode") : _mode;

            var className = [];
            var viewport = swiper.viewport;
            var aniamtions = {
                "animationDuration": _duration + "s",
                "animationTimingFunction": _timing,
                "animationDelay": _delay + "s"
            };

            swiper.realtime = {
                "type": _type,
                "mode": _mode,
                "duration": _duration,
                "timing": _timing,
                "delay": _delay
            };

            swiper._dir = _dir;
            swiper._dynamicMode = _dynamicMode;
            swiper._enterstart = false;
            swiper._exitstart = false;

            className.push(_type);
            className.push(_dynamicMode);
            className.push(_dir == 1 ? "goto-after" : "goto-before");

            Style.map(swiper.body, aniamtions);
            Style.map(swiper.getItems(), aniamtions);

            _Swiper.Settings.invoke(_type, "render", [swiper, _dynamicMode]);

            viewport.removeClass(_CONTROL_CLASSNAME.join(" "))
                    .removeClass(_TYPE_CLASSNAME.join(" "))
                    .addClass(className.join(" "));

            // viewport[0].className = className.join(" ");
        },
        next: function(){
            var swiper = this;
            var index = swiper.getIndex();
            var lastIndex = swiper.getLastIndex();

            if(swiper.isLocked()){
                swiper.exec("block", ["locked"]);
                emit("info", "block#locked");
                return ;
            }

            if(swiper.isForceLocked()){
                swiper.exec("block", ["forceLocked"]);
                emit("info", "block#forceLocked");
                return ;
            }

            if(true !== swiper.options("loop") && index === lastIndex){
                swiper.exec("block", ["last"]);
                emit("info", "block#last");
                return ;
            }

            swiper.run(1);
        },
        prev: function(){
            var swiper = this;
            var index = swiper.getIndex();

            if(swiper.isLocked()){
                swiper.exec("block", ["locked"]);
                emit("info", "block#locked");
                return ;
            }

            if(swiper.isForceLocked()){
                swiper.exec("block", ["forceLocked"]);
                emit("info", "block#forceLocked");
                return ;
            }

            if(true !== swiper.options("loop") && index === 0){
                swiper.exec("block", ["first"]);
                emit("info", "block#first");
                return ;
            }

            swiper.run(-1);
        },
        go: function(index){
            var swiper = this;
            var currentIndex = swiper.getIndex();
            var prevIndex = currentIndex - 1;
            var nextIndex = currentIndex + 1;
            var dir = 0;
            var tmpIndex = currentIndex;
            var lastIndex = swiper.getLastIndex();

            index = index % swiper.getSize();

            if(index < 0){
                index += swiper.getSize();
            }

            if(swiper.isLocked()){
                swiper.exec("block", ["locked"]);
                emit("info", "block#locked");
                return ;
            }

            if(swiper.isForceLocked()){
                swiper.exec("block", ["forceLocked"]);
                emit("info", "block#forceLocked");
                return ;
            }

            if(index === currentIndex){
                swiper.exec("block", ["stay"]);
                emit("info", "block#stay");
                return ;
            }

            if(index > currentIndex){
                dir = 1;
                nextIndex = index;

                if(nextIndex > lastIndex){
                    nextIndex = 0;
                }

                tmpIndex = nextIndex - 1;

                if(tmpIndex < 0){
                    tmpIndex = lastIndex;
                }

                prevIndex = tmpIndex - 1;

                if(prevIndex < 0){
                    prevIndex = lastIndex;
                }

                console.info("A", prevIndex, nextIndex, tmpIndex)

                swiper.setIndex(tmpIndex)
            }else{
                dir = -1;
                prevIndex = index;
                
                if(prevIndex < 0){
                    prevIndex = lastIndex;
                }

                tmpIndex = prevIndex + 1;

                if(tmpIndex > lastIndex){
                    tmpIndex = 0;
                }

                nextIndex = tmpIndex + 1;

                if(nextIndex > lastIndex){
                    nextIndex = 0;
                }

                console.info("B", prevIndex, nextIndex, tmpIndex)

                swiper.setIndex(tmpIndex);
            }

            var items = swiper.getItems();
            var size = swiper.getSize();

            for(var i = 0; i < size; i++){
                item = swiper.getItem(i);

                item.className = "mod-swiper-item impossible";

                if(prevIndex === i){
                    item.className = "mod-swiper-item maybe before";
                }
                if(nextIndex === i){
                    item.className = "mod-swiper-item maybe after";
                }
                if(currentIndex === i){
                    item.className = "mod-swiper-item current";
                }
            }

            swiper.run(dir);
        },
        create: function(){
            var name = this.name;
            var swiper = $('[data-swiper="' + name + '"]');

            if(swiper.length == 0){
                emit("error", "the swiper `" + name + "` not found");
                this.exec("notfound", []);
                return ;
            }

            this.exec("createbefore", []);

            this.findViewport(swiper);
            this.initDots();
            this.initControl();
            this.render();
            this.sizeof();

            if(this.size <= 1){
                this.exec("create", []);
                return ;
            }

            this.createViewport();
            this.exec("create", []);

            // for test
            // _Swiper.Settings.invoke("cube", "render", [this, "x"])

            if(true === this.options("autoplay")){
                this.play();
            }
        },
        play: function(){
            var timer = this._timer;
            var interval = this.options("interval");
            
            timer.setTimerFPS(Timer.toFPS(interval));

            timer.setTimerHandler({
                callback: function(_timer){
                    this.next();
                },
                context: this
            });

            timer.start();
        },
        pause: function(){
            var timer = this._timer;
            timer.stop();
        }
    };

    _Swiper.Settings = {
        cube: {
            render: function(swiper, mode){
                var body = swiper.body;
                var current = body.find(".mod-swiper-item.current");
                var after = body.find(".mod-swiper-item.maybe.after");
                var before = body.find(".mod-swiper-item.maybe.before");
                var sizeof = swiper.sizeof();

                var unit = sizeof.unit;
                var width = sizeof.width;
                var height = sizeof.height;

                if("y" == mode){
                    //front
                    Style.css(current, "transform", "translateZ(" + (height / 2) + unit.height + ")");
                    //bottom
                    Style.css(after, "transform", "rotateX(-90deg) translateZ(" + (height / 2) + unit.height + ")");
                    //top
                    Style.css(before, "transform", "rotateX(90deg) translateZ(" + (height / 2) + unit.height + ")");
                }else{
                    //front
                    Style.css(current, "transform", "translateZ(" + (width / 2) + unit.width + ")");
                    //right
                    Style.css(after, "transform", "rotateY(90deg) translateZ(" + (width / 2) + unit.width + ")");
                    //left
                    Style.css(before, "transform", "rotateY(-90deg) translateZ(" + (width / 2) + unit.width + ")");
                }
            },
            restore: function(swiper){
                var body = swiper.body;
                var current = body.find(".mod-swiper-item.current");
                var after = body.find(".mod-swiper-item.maybe.after");
                var before = body.find(".mod-swiper-item.maybe.before");

                var obj = {
                    "transform": "initial"
                };

                Style.map(current, obj);
                Style.map(after, obj);
                Style.map(before, obj);
            }
        },
        invoke: function(type, methodName, args){
            if(type in _Swiper.Settings){
                if(methodName in _Swiper.Settings[type]){
                    _Swiper.Settings[type][methodName].apply(_Swiper.Settings[type], args || []);
                }
            }
        }
    };

    _Swiper.Cache = {};

    _Swiper.createSwiper = function(name, options){
        var swiper = _Swiper.getSwiper(name);

        if(null === swiper){
            _Swiper.Cache[name] = new _Swiper(name, options);
            swiper = _Swiper.getSwiper(name);
        }

        return swiper;
    }

    _Swiper.getSwiper = function(name){
        var swiper = null;
        if(name in _Swiper.Cache){
            swiper = _Swiper.Cache[name];

            return {
                "set": function(type, option){
                    swiper.set(type, option);

                    return this;
                },
                "getHandleStack": function(){
                    return swiper.getHandleStack();
                },
                "options": function(){
                    return swiper.options.apply(swiper, arguments);
                },
                "setIndex": function(index){
                    swiper.setIndex(index);

                    return this;
                },
                "getIndex": function(){
                    return swiper.getIndex();
                },
                "getLastIndex": function(){
                    return swiper.getLastIndex();
                },
                "getItems": function(){
                    return swiper.getItems();
                },
                "getSize": function(){
                    return swiper.getSize();
                },  
                "getItem": function(index){
                    return swiper.getItem(index);
                },
                "getCurrentItem": function(){
                    return swiper.getCurrentItem();
                },
                "isEnabled": function(){
                    return swiper.isEnabled();
                },
                "isLocked": function(){
                    return swiper.isLocked();
                },
                "isForceLocked": function(){
                    return swiper.isForceLocked();
                },
                "isForwardLocked": function(){
                    return swiper.isForwardLocked();
                },
                "isBackwardLocked": function(){
                    return swiper.isBackwardLocked();
                },
                "setEnabled": function(enabled){
                    swiper.setEnabled(enabled);

                    return this;
                },
                "setLocked": function(locked){
                    swiper.setLocked(locked);

                    return this;
                },
                // "setForceLocked": function(locked){
                //     swiper.setForceLocked(locked);

                //     return this;
                // },
                "setForwardLocked": function(locked){
                    swiper.setForwardLocked(locked);

                    return this;
                },
                "setBackwardLocked": function(locked){
                    swiper.setBackwardLocked(locked);

                    return this;
                },
                "update": function(viewport){
                    swiper.findViewport(viewport);

                    return this;
                },
                "sizeof": function(type, _set){
                    return swiper.sizeof(type, _set || false);
                },
                "create": function(){
                    swiper.create();

                    return this;
                },
                "next": function(){
                    swiper.next();

                    return this;
                },
                "prev": function(){
                    swiper.prev();

                    return this;
                },
                "go": function(index){
                    swiper.go(index);

                    return this;
                },
                "play": function(){
                    swiper.play();

                    return this;
                },
                "pause": function(){
                    swiper.pause()

                    return this;
                }
            };
        }

        return null;
    };

    (function(){
        Util.watchAction("." + _BASE_CLASSNAME[0], [
            {type: "tap", mapping: "click", compatible: null},
            {type: "mouseover", mapping: null, compatible: null},
            {type: "mouseout", mapping: null, compatible: null}
        ], null);

        Util.source(SwiperSchema);
    })();

    module.exports = {
        "version": "R16B0512",
        createSwiper: function(name, options){
            return _Swiper.createSwiper(name, options);
        },
        getSwiper: function(name){
            return _Swiper.getSwiper(name);
        },
        parse: function(selector, useDefault){
            return ParseDOMOptions(selector, useDefault || false);
        }
    };
});