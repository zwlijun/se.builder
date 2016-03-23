/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 大转盘模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.7
 */
;define(function (require, exports, module){
                        require("mod/se/raf");
    var Tween         = require("mod/sa/tween");
    var Util = $.Util = require("mod/se/util");

    var _elementStyle = document.createElement('div').style;
    var _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;

        for ( ; i < l; i++ ) {
            transform = vendors[i] + 'ransform';
            if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
        }

        return false;
    })();

    function _prefixStyle (style) {
        if ( _vendor === false ) return false;
        if ( _vendor === '' ) return style;
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    var Turntable = function(selector){
        this.selector = selector;
        this.container = $(selector);
        this.stage = null;
        this.context = null;
        this.rAF = null;
        this.angle = 0;
        this.startTime = 0;
        this.beginAngle = 0;
        this.endAngle = 360;
        this.changeAngle = this.endAngle - this.beginAngle;
        this.duration = 1000;
        this.image = null;
        this.prizes = [];
        this.complete = null;
        this.isRunning = false;
        this.centerX = 0;
        this.centerY = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.preparing = false;
    };

    Turntable.prototype = {
        setTweenParameter : function(begin, end, duration){
            this.beginAngle = begin;
            this.endAngle = end;
            this.changeAngle = this.endAngle - this.beginAngle;
            this.duration = duration;
        },
        setPrizeList : function(list){
            this.prizes = list;
        },
        addResource : function(name, resource, x, y, z, width, height){
            var css = "position:absolute; left:" + x + "px; top:" + y + "px; width:" + width + "px; height:" + height + "px;"
                    + "background:transparent url(" + resource + ") no-repeat left top; background-size:100% 100%;"
                    + "z-index:" + z + ";";

            var layer = '<div id="' + name + '" style="' + css + '"></div>';

            this.container.append(layer);
        },
        addRotatingBody : function(name, x, y, z, width, height){
            var css = "position:absolute; left:" + x + "px; top:" + y + "px;"
                    + "z-index:" + z + ";";

            var layer = '<canvas id="' + name + '" style="' + css + '" width="' + width + '" height="' + height + '"></canvas>';

            this.container.append(layer);

            this.stage = $("#" + name)[0];
            this.context = this.stage.getContext("2d");
        },
        setAction : function(name, action){
            $("#" + name).attr("data-action", "Action://" + (action || "nul"));
        },
        setComplete : function(handler){
            this.complete = handler || null;
        },
        setCenterCoordinates : function(cx, cy){
            this.centerX = cx;
            this.centerX = cy;
        },
        setPreparing : function(preparing){
            this.preparing = preparing;
            this.startTime = new Date().getTime();
        },
        paint : function(resource, x, y, width, height){
            var img = new Image();

            var ins = this;
            var stage = ins.stage;
            var ctx = ins.context;

            ins.x = x;
            ins.y = y;
            ins.width = width;
            ins.height = height;

            img.onload = function(){
                ctx.clearRect(x, y, stage.width, stage.height);
                ctx.drawImage(img, x, y, stage.width, stage.height);
            }

            img.src = resource;

            this.image = img;
        },
        repaintContext : function(angle){ //unsupported
            var rad = Math.PI / 180;
            var ctx = this.context;
            var stage = this.stage;

            var w = stage.width;
            var h = stage.height;
            var x = this.centerX;
            var y = this.centerX;

            this.angle = angle;
            angle = (angle % 360) * rad;

            console.info(angle)
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.translate(-x, -y);
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(this.image, this.x, this.y);
        },
        repaintStage : function(angle){
            var x = this.centerX;
            var y = this.centerX;

            if(typeof(x) == "number"){
                x = x + "px";
            }

            if(typeof(y) == "number"){
                y = y + "px";
            }

            this.angle = angle;
            this.stage.style[_prefixStyle("transform")] = "rotate(" + (angle % 360) + "deg)";
            this.stage.style[_prefixStyle("transformOrigin")] = x + " " + y;
        },
        rotatePreparing : function(){
            var atime = new Date().getTime();
            var shiftTime = atime - this.startTime;

            this.isRunning = true;
            var angle = Tween.Liner.easeOut(shiftTime, this.beginAngle, this.changeAngle, this.duration);
            //this.repaint(this.angle);
            //this.repaintContext((~~(angle * 10)) / 10);
            this.repaintStage((~~(angle * 10)) / 10);

            if(shiftTime > this.duration){ //end
                shiftTime = 0;
                this.startTime = atime;
            }
        },
        rotate : function(){
            var atime = new Date().getTime();
            var shiftTime = atime - this.startTime;

            this.isRunning = true;
            var angle = Tween.Sine.easeOut(shiftTime, this.beginAngle, this.changeAngle, this.duration);
            //this.repaint(this.angle);
            //this.repaintContext((~~(angle * 10)) / 10);
            this.repaintStage((~~(angle * 10)) / 10);

            if(shiftTime > this.duration){ //end
                this.rAF = undefined;
                this.isRunning = false;

                Util.execAfterMergerHandler(this.complete, [this.prizes, this.angle]);
            }
        },
        run : function(){
            var tt = this;

            if(tt.preparing){
                tt.rotatePreparing();
            }else{
                tt.rotate();
            }

            if(undefined !== tt.rAF){
                this.rAF = window.requestAnimationFrame(function(){
                   tt.run();
                });
            }else{
                tt.rAF = null;
            }
        },
        start : function(){
            if(!this.rAF && false === this.isRunning){
                this.startTime = new Date().getTime();
                this.run();
            }
        }
    };

    module.exports = function(selector){
        var tt = new Turntable(selector);

        var pub = {
            setTweenParameter : function(begin, end, duration){
                tt.setTweenParameter(begin, end, duration);

                return this;
            },
            setPrizeList : function(list){
                tt.setPrizeList(list);

                return this;
            },
            setComplete : function(handler){
                tt.setComplete(handler);

                return this;
            },
            setCenterCoordinates : function(cx, cy){
                tt.setCenterCoordinates(cx, cy);

                return this;
            },
            setPreparing : function(preparing){
                tt.setPreparing(preparing);

                return this;
            },
            addResource : function(name, resource, x, y, z, width, height){
                tt.addResource(name, resource, x, y, z, width, height);

                return this;
            },
            addRotatingBody : function(name, x, y, z, width, height){
                tt.addRotatingBody(name, x, y, z, width, height);

                return this;
            },
            setAction : function(name, action){
                tt.setAction(name, action);

                return this;
            },
            paint : function(resource, x, y, width, height){
                tt.paint(resource, x, y, width, height);
            },
            start : function(){
                tt.start();
            }
        };

        return pub;
    }
});