/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 贝塞尔曲线画笔
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function (require, exports, module){
    var Brush = require("mod/sa/paintbrush/basebrush");
    var Listener = $.Listener;

    var _BezierCurves = function(canvas){
        var brush = this.brush = new Brush(canvas);
        
        this.setted = false;
        this.listener = new Listener({
            onstart: null,
            ondrawing: null,
            onend: null
        });

        brush.bind();
        brush.setLineWidth(10);
        brush.setLineJoin("round");
        brush.setLineCap("round");
        brush.set("start", {
            callback : function(e, brush){
                var ctx = brush.context;
                var pointer = brush.getPointerPosition(e);

                brush.isDrawing = true;

                if(false === this.setted){
                    ctx.lineWidth = brush.lineWidth;
                    ctx.lineJoin = brush.lineJoin;
                    ctx.lineCap = brush.lineCap;

                    this.setted = true;
                }

                brush.addPoint(pointer.x, pointer.y);

                this.exec("start", [e, brush]);
            },
            context: this
        });

        brush.set("end", {
            callback : function(e, brush){
                brush.isDrawing = false;
                brush.clearPoints();

                this.exec("end", [e, brush]);
            },
            context: this
        });

        brush.set("drawing", {
            callback : function(e, brush){
                var ctx = brush.context;
                var pointer = brush.getPointerPosition(e);
                var x = pointer.x;
                var y = pointer.y;
                var point = null;

                if(brush.isDrawing){
                    brush.addPoint(x, y);

                    var p1 = brush.getPoint(0);
                    var p2 = brush.getPoint(1);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y)

                    for(var i = 1, size = brush.points.length; i < size; i++){
                        point = brush.calcMiddlePointBetween(p1, p2);
                        
                        ctx.quadraticCurveTo(p1.x, p1.y, point.x, point.y);

                        p1 = brush.getPoint(i);
                        p2 = brush.getPoint(i + 1);
                    }

                    ctx.lineTo(p1.x, p1.y);
                    ctx.stroke();
                }

                this.exec("drawing", [e, brush]);
            },
            context: this
        });
    };

    _BezierCurves.prototype = {
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
        }
    };

    var _pub = {
        createPaintBrush : function(canvas){
            var ins = new _BezierCurves(canvas);

            return ins;
        }
    };

    module.exports = _pub;
});