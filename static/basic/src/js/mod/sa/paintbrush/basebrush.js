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

    /**
     * 样式类型
     * @type {[type]}
     */
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
            onstart: null,      //画笔开始时回调
            ondrawing: null,    //画笔绘画中
            onend: null         //画笔结束时回调
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
        /**
         * 设置缩放
         * @param {Number} x [x轴缩放]
         * @param {Number} y [y轴缩放]
         */
        setScale : function(x, y){
            this.scale = {
                x: x || 1,
                y: y || 1
            };
        },
        /**
         * 设置线条宽度（粗细）
         * @param {Number} width [宽度]
         */
        setLineWidth : function(width){
            this.lineWidth = width;
        },
        /**
         * 设置或返回两条线相交时，所创建的拐角类型
         * @param {String} join [连接方式]
         */
        setLineJoin : function(join){
            this.lineJoin = join;
        },
        /**
         * 设置线条的结束端点样式
         * @param {String} cap [类型]
         */
        setLineCap : function(cap){
            this.lineCap = cap;
        },
        /**
         * 设置最大斜接长度，斜接长度指的是在两条线交汇处内角和外角之间的距离
         * @param {Number} miter [规定最大斜接长度]
         */
        setMiterLimit : function(miter){
            this.miterLimit = miter;
        },
        /**
         * 设置阴影的模糊级别
         * @param {Number} blur [阴影的模糊级数]
         */
        setShadowBlur : function(blur){
            this.shadowBlur = blur;
        },
        /**
         * 设置阴影的颜色
         * @param {String} color [CSS 颜色值]
         */
        setShadowColor : function(color){
            this.shadowColor = color;
        },
        /**
         * 设置阴影距形状的水平距离
         * @param {Number} x [水平距离]
         */
        setShadowOffsetX : function(x){
            this.shadowOffsetX = x;
        },
        /**
         * 设置阴影距形状的垂直距离
         * @param {Number} y [垂直距离]
         */
        setShadowOffsetY : function(y){
            this.shadowOffsetY = y;
        },
        /**
         * 添加一个点
         * @param {Number} x [x坐标]
         * @param {Number} y [y坐标]
         */
        addPoint : function(x, y){
            this.points.push({"x": x, "y": y});
        },
        /**
         * 根据索引获取一个点
         * @param  {Number} index [索引]
         * @return {Object}       [{Number x, Number y}]
         */
        getPoint : function(index){
            return this.points[index] || {"x": 0, "y": 0};
        },
        /**
         * 清除所有的点
         * @return {[type]} [description]
         */
        clearPoints : function(){
            this.points.length = 0;
        },
        /**
         * 添加一个颜色点，用于规定 gradient 对象中的颜色和位置
         * @param {Number} stop  [介于 0.0 与 1.0 之间的值，表示渐变中开始与结束之间的位置]
         * @param {String} color [在结束位置显示的 CSS 颜色值]
         */
        addColor : function(stop, color){
            this.colors.push({"stop": stop, "color": color});
        },
        /**
         * 获取颜色
         * @param  {Number} index [索引]
         * @return {Object}       [{Number stop, String color}]
         */
        getColor : function(index){
            return this.colors[index] || {"stop": 1, "color": "transparent"};
        },
        /**
         * 清除所有颜色
         * @return {[type]} [description]
         */
        clearColors : function(){
            this.colors.length = 0;
        },
        /**
         * 创建线性的渐变对象
         * @param  {Number} startX [渐变开始点的 x 坐标]
         * @param  {Number} startY [渐变开始点的 y 坐标]
         * @param  {Number} endX   [渐变结束点的 x 坐标]
         * @param  {Number} endY   [渐变结束点的 y 坐标]
         * @return {Object}        [Gradient 对象]
         */
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
        /**
         * 创建放射状/圆形渐变对象
         * @param  {[type]} startX [渐变的开始圆的 x 坐标]
         * @param  {[type]} startY [渐变的开始圆的 y 坐标]
         * @param  {[type]} startR [开始圆的半径]
         * @param  {[type]} endX   [渐变的结束圆的 x 坐标]
         * @param  {[type]} endY   [渐变的结束圆的 y 坐标]
         * @param  {[type]} endR   [结束圆的半径]
         * @return {Object}        [Gradient 对象]
         */
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
        /**
         * 在指定的方向上重复指定的元素
         * @param  {Image|Canvas|Video} image  [规定要使用的图片、画布或视频元素]
         * @param  {String}             repeat [repeat | repeat-x | repeat-y | no-repeat]
         * @return {Object}                    [Pattern]
         */
        createPattern : function(image, repeat){
            var ctx = this.context;

            var pattern = ctx.createPattern(image, repeat || "repeat");

            return pattern;
        },
        /**
         * 获取笔刷样式
         * @param  {String} type [类型]
         * @param  {Array}  args [参数]
         * @return {Any}      [样式]
         */
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
        /**
         * 计算两点之间的距离
         * @param  {Point} startPoint  [开始点]
         * @param  {Point} endPoint    [结束点]
         * @return {Number}            [距离]
         */
        calcDistanceBetween : function(startPoint, endPoint){
            return Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        },
        /**
         * 计算两点之间的角度
         * @param  {Point} startPoint [开始点]
         * @param  {Point} endPoint   [结束点]
         * @return {Number}           [角度]
         */
        calcAngleBetween : function(startPoint, endPoint){
            return Math.atan2(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        },
        /**
         * 计算两点之间的中间点
         * @param  {Point} startPoint [开始点]
         * @param  {Point} endPoint   [结束点]
         * @return {Point}            [{Number x, Number y}]
         */
        calcMiddlePointBetween : function(startPoint, endPoint){
            return {
                "x": startPoint.x + (endPoint.x - startPoint.x) / 2,
                "y": startPoint.y + (endPoint.y - startPoint.y) / 2
            };
        },
        /**
         * 生成一个随机整数
         * @param  {Number} min [最小值]
         * @param  {Number} max [最大值]
         * @return {Number}     [随机数]
         */
        generateRandomInt : function(min, max){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        /**
         * 获取触发点的位置
         * @param  {Event} e [事件]
         * @return {Point}   [{Number x, Number y}]
         */
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
        /**
         * 绑定事件
         * @return {[type]} [description]
         */
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