/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 环形渐变画笔
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function (require, exports, module){
    var Brush = require("mod/sa/paintbrush/basebrush");
    var Listener = $.Listener;

    var _RadialPencil = function(canvas){
        var brush = this.brush = new Brush(canvas);
        
        this.setted = false;
        this.listener = new Listener({
            onstart: null,
            ondrawing: null,
            onend: null
        });

        brush.bind();
        brush.setLineWidth(5);
        brush.addColor(0, '#000');
        brush.addColor(0.5, 'rgba(0,0,0,0.5)');
        brush.addColor(1, 'rgba(0,0,0,0)');
        brush.set("start", {
            callback : function(e, brush){
                var ctx = brush.context;
                var pointer = brush.getPointerPosition(e);

                brush.isDrawing = true;

                ctx.moveTo(pointer.x, pointer.y);

                this.exec("start", [e, brush]);
            },
            context: this
        });

        brush.set("end", {
            callback : function(e, brush){
                brush.isDrawing = false;

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
                var r = brush.lineWidth;
                var r2 = r * 2;
                var r4 = r * 4;
                var gradient = null;

                if(brush.isDrawing){
                    gradient = brush.getBrushStyle(StyleTypes.RADIAL, [x, y, r, x, y, r2]);

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x - r2, y - r2, r4, r4);
                }

                this.exec("drawing", [e, brush]);
            },
            context: this
        });
    };

    _RadialPencil.prototype = {
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
            var ins = new _RadialPencil(canvas);

            return ins;
        }
    };

    module.exports = _pub;
});