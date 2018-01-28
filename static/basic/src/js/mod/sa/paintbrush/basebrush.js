/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 画笔基础模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.9
 */
;define(function (require, exports, module){
    var Listener = $.Listener  = require("mod/se/listener");
    var Util                   = require("mod/se/util");

    var StyleTypes = window["StyleTypes"] = {
        "LINEAR" : "linear",
        "RADIAL" : "radial",
        "COLOR" : "color",
        "PATTERN" : "pattern"
    };

    var _BaseBrush = function(canvas){
        this.stage = canvas;
        this.context = canvas.getContext("2d");
        this.isDrawing = false;
        this.currentPoint = null;
        this.lastPoint = null;
        this.lineWidth = 1;
        this.lineJoin = "round";
        this.lineCap = "round";
        this.miterLimit = 3;
        this.shadowBlur = 1;
        this.shadowColor = "#000";
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.points = [];
        this.colors = [];
        this.stageOffsetX = 0;
        this.stageOffsetY = 0;
        this.scale = {
            x: 1,
            y: 1
        };

        this.listener = new Listener({
            onstart: null,
            ondrawing: null,
            onend: null
        });
    }

    _BaseBrush.prototype = {
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
        setScale : function(x, y){
            this.scale = {
                x: x || 1,
                y: y || 1
            };
        },
        setLineWidth : function(width){
            this.lineWidth = width;
        },
        setLineJoin : function(join){
            this.lineJoin = join;
        },
        setLineCap : function(cap){
            this.lineCap = cap;
        },
        setMiterLimit : function(miter){
            this.miterLimit = miter;
        },
        setShadowBlur : function(blur){
            this.shadowBlur = blur;
        },
        setShadowColor : function(color){
            this.shadowColor = color;
        },
        setShadowOffsetX : function(x){
            this.shadowOffsetX = x;
        },
        setShadowOffsetY : function(y){
            this.shadowOffsetY = y;
        },
        addPoint : function(x, y){
            this.points.push({"x": x, "y": y});
        },
        getPoint : function(index){
            return this.points[index] || {"x": 0, "y": 0};
        },
        clearPoints : function(){
            this.points.length = 0;
        },
        addColor : function(stop, color){
            this.colors.push({"stop": stop, "color": color});
        },
        getColor : function(index){
            return this.colors[index] || {"stop": 1, "color": "transparent"};
        },
        clearColors : function(){
            this.colors.length = 0;
        },
        createLinearGradient : function(startX, startY, endX, endY){
            var ctx = this.context;
            var gradient = ctx.createLinearGradient(startY, startY, endX, endY);
            var item = null;

            for(var i = 0, size = this.colors.length; i < size; i++){
                item = this.colors[i];

                gradient.addColorStop(item.stop, item.color);
            }

            return gradient;
        },
        createRadialGradient : function(startX, startY, startR, endX, endY, endR){
            var ctx = this.context;
            var gradient = ctx.createRadialGradient(startY, startY, startR, endX, endY, endR);
            var item = null;

            for(var i = 0, size = this.colors.length; i < size; i++){
                item = this.colors[i];

                gradient.addColorStop(item.stop, item.color);
            }

            return gradient;
        },
        createPattern : function(image, repeat){
            var ctx = this.context;

            var pattern = ctx.createPattern(image, repeat || "repeat");

            return pattern;
        },
        getBrushStyle : function(type, args){
            var style = null;
            var colors = this.colors;
            var size = colors.length;

            type = type || StyleTypes.COLOR;

            if(size <= 1){
                type = StyleTypes.COLOR;
            }

            switch(type){
                case StyleTypes.LINEAR:
                    style = this.createLinearGradient.apply(this, args);
                break;
                case StyleTypes.RADIAL:
                    style = this.createRadialGradient.apply(this, args);
                break;
                case StyleTypes.PATTERN:
                    style = this.createPattern.apply(this, args);
                break;
                default:
                    style =  this.getColor(0).color || "transparent";
                break;
            }

            return style;
        },
        calcDistanceBetween : function(startPoint, endPoint){
            return Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        },
        calcAngleBetween : function(startPoint, endPoint){
            return Math.atan2(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        },
        calcMiddlePointBetween : function(startPoint, endPoint){
            return {
                "x": startPoint.x + (endPoint.x - startPoint.x) / 2,
                "y": startPoint.y + (endPoint.y - startPoint.y) / 2
            };
        },
        generateRandomInt : function(min, max){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getPointerPosition : function(e){
            if(e.type.indexOf('touch') !== -1){
                e = e.touches[0];
            }

            var scale = this.scale;
            var rect = Util.getBoundingClientRect(this.stage);
            var x = (e.clientX - rect.left) * (this.stage.width / rect.width);
            var y = (e.clientY - rect.top) * (this.stage.height / rect.height);

            return {"x": x / scale.x, "y": y / scale.y};
        },
        bind : function(){
            var touch = ("ontouchstart" in window);
            var startEvent = touch ? "touchstart" : "mousedown";
            var endEvent = touch ? "touchend" : "mouseup";
            var drawingEvent = touch ? "touchmove" : "mousemove";
            var stage = $(this.stage);
            var isBind = "1" == stage.attr("data-bind");

            if(!isBind){
                stage.on(startEvent, "", this, function(e){
                    var data = e.data;

                    data.exec("start", [e, data]);
                })
                .on(endEvent, "", this, function(e){
                    var data = e.data;

                    data.exec("end", [e, data]);
                })
                .on(drawingEvent, "", this, function(e){
                    var data = e.data;

                    data.exec("drawing", [e, data]);
                });
            }
        }
    };

    module.exports = _BaseBrush;
});