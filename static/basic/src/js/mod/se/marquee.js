/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Marquee
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.04
 */
;define(function (require, exports, module){
    var Timer               = require("mod/se/timer");
    var Style               = require("mod/se/css");
    var Util                = require("mod/se/util");

    var Marquee = function(name, duration, dir){
        this.timer = null;
        this.shift = 0;
        this.distance = 0;
        this.element = null;
        this.name = name;
        this.duration = duration || 50,
        this.dir = dir || Marquee.Direction.SCROLL_TO_UP;
    };

    Marquee.Direction = {
        SCROLL_TO_UP: 1,
        SCROLL_TO_DOWN: 2,
        SCROLL_TO_LEFT: 3,
        SCROLL_TO_RIGHT: 4
    };

    Marquee.prototype = {
        init: function(){
            var _this = this;
            var marqueeNode = document.querySelector('[data-marquee="' + _this.name + '"]');

            if(!marqueeNode){
                return false;
            }

            var isOpen = "1" === marqueeNode.getAttribute("data-marquee-open");
            var container = marqueeNode.querySelector(".marquee-items");
            var items = container.querySelector(".marquee-item") || [];
            var size = items.length;

            if(!isOpen){
                return false;
            }

            if(size <= 1){
                return false;
            }

            _this.timer = Timer.getTimer("marquee_timer_" + _this.name, Timer.toFPS(_this.duration), null);
            _this.timer.setTimerHandler({
                callback: function(_timer){
                    if(_this.distance === 0){
                        var el = this.querySelector(".marquee-item:first-child");
                        var rect = Util.getBoundingClientRect(el);

                        _this.element = el;
                        _this.distance = rect.height;

                        if(_this.dir === Marquee.Direction.SCROLL_TO_LEFT || _this.dir === Marquee.Direction.SCROLL_TO_RIGHT){
                            _this.distance = rect.width;
                        }
                    }

                    if(!_this.element){
                        _this.shift = 0;
                        _this.distance = 0;
                        _this.element = null;
                        return ;
                    }

                    // console.log(_this.shift, _this.distance);

                    if(_this.shift < _this.distance){
                        _this.shift++;

                        var matrix = "matrix(1, 0, 0, 1, 0, -" + _this.shift + ")";

                        switch(_this.dir){
                            case Marquee.Direction.SCROLL_TO_DOWN:
                                matrix = "matrix(1, 0, 0, 1, 0, " + _this.shift + ")";
                            break;
                            case Marquee.Direction.SCROLL_TO_LEFT:
                                matrix = "matrix(1, 0, 0, 1, -" + _this.shift + ", 0)";
                            break;
                            case Marquee.Direction.SCROLL_TO_RIGHT:
                                matrix = "matrix(1, 0, 0, 1, " + _this.shift + ", 0)";
                            break;
                        }

                        Style.css(this, "transform", matrix);
                    }else{
                        var clone = _this.element.cloneNode(true);

                        this.style.cssText = "";

                        this.removeChild(_this.element);
                        this.appendChild(clone);

                        _this.shift = 0;
                        _this.distance = 0;
                        _this.element = null;
                    }
                },
                context: container
            });

            _this.timer.start();

            return true;
        }
    };

    module.exports = Marquee;
});