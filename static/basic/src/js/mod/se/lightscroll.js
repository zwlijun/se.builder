/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 滑动
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.6
 */
;define(function (require, exports, module){
    var Listener      = require("mod/se/listener");
    var Util = $.Util = require("mod/se/util");
    var Style         = require("mod/se/css");
    var Timer         = require("mod/se/timer");
    var HandleStack   = Listener.HandleStack;

    var touch = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var endEvent = touch ? "touchend" : "mouseup";
    var moveEvent = touch ? "touchmove" : "mousemove";

    var _LightScroll = function(viewer, scroller, ratio){
        this.viewer = $(viewer);
        this.scroller = scroller ? $(scroller) : $(this.viewer.children().get(0));
        this.ratio = ratio || 1;

        this.viewerCSSText = this.viewer[0].style.cssText || "";
        this.scrollerCSSText = this.scroller[0].style.cssText || "";

        this.direction = this.viewer.attr("data-dir") || "v";
        this.shiftDistance = Number(this.viewer.attr("data-shift") || 0);
        this.overDistance = Number(this.viewer.attr("data-over") || 0);

        this.bind = false;

        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onstart: null,
            onscrolling: null,
            onend: null,
            onpushready: null,
            onpullready: null,
            onpush: null,
            onpull: null,
            onblock: null
        }, this.handleStack);

        this.refresh();
    };

    _LightScroll.prototype = {
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
        cleanBoxStyle: function(){
            this.viewer[0].style.cssText = this.viewerCSSText;
            this.scroller[0].style.cssText = this.scrollerCSSText;
        },
        refresh: function(){
            var vo = 0;
            var so = 0;

            this.cleanBoxStyle();

            vo = this.viewer.offset();
            so = this.scroller.offset();

            this.viewerbox = {
                "width": vo.width / this.ratio,
                "height": vo.height / this.ratio
            };

            this.scrollerbox = {
                "width": so.width / this.ratio,
                "height": so.height / this.ratio
            };

            this.maxScrollX = (this.scrollerbox.width - this.viewerbox.width) + ("h" == this.direction ? this.overDistance : 0);
            this.maxScrollY = (this.scrollerbox.height - this.viewerbox.height) + ("h" == this.direction ? 0 : this.overDistance);

            this.ZERO = {"x": "0", "y": "0"};
            this.MAX = {"x": -this.maxScrollX, "y": -this.maxScrollY};

            if(this.viewerbox.width > 0 && this.viewerbox.height > 0){
                this.viewer.css({
                    "width": this.viewerbox.width + "px",
                    "height": this.viewerbox.height + "px",
                    "overflow": "hidden"
                });
            }

            if(this.scrollerbox.width > 0 && this.scrollerbox.height > 0){
                this.scroller.css({
                    "width": this.scrollerbox.width + "px",
                    "height": this.scrollerbox.height + "px"
                });
            }
        },
        scrollTo: function(point){
            var dir = this.direction;
            var matrix = "matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})";
            var opt = {
                "a": "1",
                "b": "0",
                "c": "0",
                "d": "1",
                "x": "0",
                "y": "${y}"
            };

            this.x = 0;
            this.y = point.y;

            if("h" == dir){
                opt = $.extend(opt, {"x": "${x}", "y": "0"});

                this.x = point.x;
                this.y = 0;
            }

            var args = JSON.stringify(opt);
            var meta = JSON.parse(Util.formatData(args, point));
            var func = Util.formatData(matrix, meta);

            Style.css(this.scroller, "transform", func);
        },
        minimum: function(){
            this.scrollTo(this.ZERO);
        },
        maximum: function(){
            this.scrollTo(this.MAX);
        },
        configure : function(){
            var _ins = this;
            var dir = _ins.direction;
            var viewerbox = _ins.viewerbox;
            var scrollerbox = _ins.scrollerbox;
            var viewer = _ins.viewer;
            var scroller = _ins.scroller;
            var startX = 0;
            var startY = 0;
            var scrollX = 0;
            var scrollY = 0;
            var moveX = 0;
            var moveY = 0;
            var isStarted = false;
            var triggerPull = false;
            var triggerPush = false;
            var startTime = 0;
            var moveTime = 0;
            var endTime = 0;
            var durationTime = 0;

            if("h" == dir){
                if(scrollerbox.width <= viewerbox.width){
                    _ins.exec("block", ["minimum/width"]);
                    return 0;
                }
            }else{
                if(scrollerbox.height <= viewerbox.height){
                    _ins.exec("block", ["minimum/height"]);
                    return 0;
                }
            }

            if(true === this.bind){
                _ins.exec("block", ["bind"]);
                return 0;
            }

            viewer.on(startEvent, function(e){
                var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                var x = startX = pointer.pageX;
                var y = startY = pointer.pageY;

                isStarted = true;
                triggerPull = false;
                triggerPush = false;
                startTime = (new Date().getTime());
                _ins.exec("start", [e, x, y]);

            }).on(moveEvent, function(e){
                if(!isStarted){
                    return 0;
                }

                var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);

                var x = pointer.pageX;
                var y = pointer.pageY;
                var dx = scrollX = x + moveX - startX;
                var dy = scrollY = y + moveY - startY;

                var p = {
                    "x": dx,
                    "y": dy
                };

                _ins.directionX = x - startX;
                _ins.directionY = y - startY;

                moveTime = (new Date().getTime());

                _ins.scrollTo(p);

                //console.info("move: " + (moveTime - startTime));

                var cp = "h" == dir ? dx : dy;
                var mp = "h" == dir ? _ins.maxScrollX : _ins.maxScrollY;

                triggerPull = false;
                triggerPush = false;

                if(cp > 0 && cp >= _ins.shiftDistance){ //pull
                    triggerPull = true;
                    _ins.exec("pullready", [e, dx, dy]);
                }else if(cp < 0 && (Math.abs(cp) >= (_ins.shiftDistance + mp))){ //push
                    triggerPush = true;
                    _ins.exec("pushready", [e, dx, dy]);
                }else{
                    _ins.exec("scrolling", [e, dx, dy]);
                }
            }).on(endEvent, function(e){
                isStarted = false;

                var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);

                var dx = moveX = scrollX;
                var dy = moveY = scrollY;
                var cp = "h" == dir ? dx : dy;
                var mp = "h" == dir ? _ins.maxScrollX : _ins.maxScrollY;
                var du = "h" == dir ? _ins.directionX : _ins.directionY;
                var abs = Math.abs(cp);
                var v = 0;
                var d = 0;

                endTime = (new Date().getTime());
                durationTime = endTime - moveTime;

                if(durationTime < 20){
                    v = du / (durationTime / 1000) * 0.0006;

                    d = v / 0.0375;

                    Style.css(_ins.scroller, "transition", "all 0.4s ease");

                    var p = {
                        "x": dx,
                        "y": dy + d
                    };

                    if("h" == dir){
                        p = {
                            "x": dx + d,
                            "y": dy
                        };
                    }

                    _ins.scroller.one("webkitTransitionEnd", function(e){
                        var _dx = moveX = scrollX = p.x;
                        var _dy = moveY = scrollY = p.y;
                        var _cp = "h" == dir ? _dx : _dy;
                        var _abs = Math.abs(_cp);

                        Style.css(_ins.scroller, "transition", "all 0s ease");

                        if(_cp > 0){
                            moveX = moveY = 0;
                            _ins.minimum();
                        }else if(_cp < 0 && _abs > mp){
                            moveX = -_ins.maxScrollX;
                            moveY = -_ins.maxScrollY;
                            _ins.maximum();
                        }

                        _ins.exec("end", [e, moveX, moveY]);

                        if(true === triggerPull){
                            _ins.exec("pull", [e, scrollX, scrollY]);
                        }
                        if(true === triggerPush){
                            _ins.exec("push", [e, scrollX, scrollY]);
                        }
                    });

                    _ins.scrollTo(p);
                }else{
                    if(cp > 0){
                        moveX = moveY = 0;
                        _ins.minimum();
                    }else if(cp < 0 && abs > mp){
                        moveX = -_ins.maxScrollX;
                        moveY = -_ins.maxScrollY;
                        _ins.maximum();
                    }

                    _ins.exec("end", [e, moveX, moveY]);

                    if(true === triggerPull){
                        _ins.exec("pull", [e, scrollX, scrollY]);
                    }
                    if(true === triggerPush){
                        _ins.exec("push", [e, scrollX, scrollY]);
                    }
                }
            }); 

            this.bind = true;
        }
    };

    _LightScroll.Cache = {};

    module.exports = {
        getInstance: function(name, viewer, scroller, ratio){
            var _ls = _LightScroll.Cache[name] || (_LightScroll.Cache[name] = new _LightScroll(viewer, scroller, ratio));

            return {
                "version": "R17B0430.01",
                "viewer": _ls.viewer,
                "scroller": _ls.scroller,
                "ratio": _ls.ratio,
                "set": function(type, option){
                    _ls.set(type, option);

                    return this;
                },
                "getHandleStack": function(){
                    return _ls.getHandleStack();
                },
                "refresh": function(){
                    _ls.refresh();

                    return this;
                },
                "scrollTo": function(point){
                    _ls.scrollTo(point);

                    return this;
                },
                "minimum": function(){
                    _ls.minimum();

                    return this;
                },
                "maximum": function(){
                    _ls.maximum();

                    return this;
                },
                "getMaxScrollY": function(){
                    return _ls.maxScrollY;
                },
                "getMaxScrollX": function(){
                    return _ls.maxScrollX;
                },
                "getViewerBox": function(){
                    return _ls.viewerbox;
                },
                "getScrollerBox": function(){
                    return _ls.scrollerbox;
                },
                "getZeroPoint": function(){
                    return _ls.ZERO;
                },
                "getMaxPoint": function(){
                    return _ls.MAX;
                },
                "configure": function(){
                    _ls.configure();

                    return this;
                }
            }
        }
    };
});