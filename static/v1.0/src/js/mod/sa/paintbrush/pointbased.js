/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 基于点的画笔
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function (require, exports, module){
    var Brush = require("mod/sa/paintbrush/basebrush");
    var Listener = $.Listener;

    var _PointBased = function(canvas){
        var brush = this.brush = new Brush(canvas);
        
        this.setted = false;
        this.listener = new Listener({
            onstart: null,
            ondrawing: null,
            onend: null
        });

        brush.bind();
        brush.setLineWidth(5);
        brush.setLineJoin("round");
        brush.setLineCap("round");
        brush.set("start", {
            callback : function(e, brush){
                var ctx = brush.context;
                var pointer = brush.getPointerPosition(e);

                brush.isDrawing = true;

                if(false === this.setted){
                    ctx.strokeStyle = brush.getBrushStyle(StyleTypes.COLOR);
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

                    point = brush.getPoint(0);
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);

                    for(var i = 1, size = brush.points.length; i < size; i++){
                        point = brush.getPoint(i);
                        ctx.lineTo(point.x, point.y); 
                    }     
                    ctx.stroke();
                }

                this.exec("drawing", [e, brush]);
            },
            context: this
        });
    };

    _PointBased.prototype = {
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
            var ins = new _PointBased(canvas);

            return ins;
        }
    };

    module.exports = _pub;
});