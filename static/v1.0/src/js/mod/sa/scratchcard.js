/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 刮刮卡模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.7
 */
;define(function (require, exports, module){
    var ImageUtil      = require("mod/sa/image");
    var Brush          = require("mod/sa/paintbrush/fuzzyedgepencil");
    var Util           = require("mod/se/util");
    var Listener       = require("mod/se/listener");
    var HandleStack    = Listener.HandleStack;

    var ScratchCard = function(canvas){
        this.ImageUtil = null;
        this.stage = canvas;
        this.context = canvas.getContext("2d");
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.imageX = 0;
        this.imageY = 0;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.touched = false;
        this.offsetX = this.stage.offsetLeft;
        this.offsetY = this.stage.offsetTop;
        this.brushSize = 10;
        this.blurRadius = 40;
        this.shadowBlur = 20;
        this.scratchText = null;
        this.alpha = 1;
        this.brush = Brush.createPaintBrush(canvas);

        this.setStageStyle("background-color", "transparent");

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onready: null,      //已准备好
            onbegin: null,      //开始
            onprocessing: null, //处理过程中
            oncomplete: null,   //完成
            onerror: null       //错误
        }, this.handleStack);
    };

    ScratchCard.prototype = {
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
        setStageStyle : function(name, property){
            $(this.stage).css(name, property);
        },
        mask : function(width, height){
            var canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            return canvas;
        },
        setAlpha : function(alpha){
            this.alpha = alpha;
        },
        setBrushSize : function(size){
            this.brushSize = size;
        },
        setBlurRadius : function(radius){
            this.blurRadius = radius;
        },
        setShadowBlur : function(blur){
            this.shadowBlur = blur;
        }, 
        setScratchText : function(txt){
            //{font, textAlign, textBaseline, color, x, y, text}
            this.scratchText = txt;
        },
        setScale : function(x, y){
            this.brush.brush.setScale(x, y);
        },
        appendText : function(t){
            if(!t) return;

            var ctx = this.context;

            t.font && (ctx.font = t.font);
            t.textAlign && (ctx.textAlign = t.textAlign);
            t.textBaseline && (ctx.textBaseline = t.textBaseline);
            t.color && (ctx.fillStyle = t.color);

            ctx.fillText(t.text, t.x, t.y);
        },
        bind : function(){
            var ins = this;
            var brush =  ins.brush;
            var base = brush.brush;
            var o = ins.stage;

            ins.exec("ready", []);

            base.setLineWidth(ins.brushSize);
            base.addColor(1, "#000");
            base.setShadowBlur(ins.shadowBlur);
            base.setShadowColor("#000");

            brush.set("start", {
                "callback": function(e, brush){
                    e.preventDefault();
                    e.stopPropagation();

                    this.exec("begin", []);
                },
                context: ins
            });

            brush.set("end", {
                "callback": function(e, brush){
                    e.preventDefault();
                    e.stopPropagation();

                    var ins = this;
                    var ctx = ins.context;
                    var pixel = ctx.getImageData(ins.x, ins.y, ins.width, ins.height).data;

                    for(var i = 0, removed = 0, remain = 0, size = pixel.length; i < size; i += 4){
                        if(pixel[i] && pixel[i + 1] && pixel[i + 2] && pixel[i + 3]){
                            remain++;
                        }else{
                            removed++;
                        }
                    }

                    this.exec("complete", [remain, removed]);
                },
                context: ins
            });

            brush.set("drawing", {
                "callback": function(e, brush){
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var pointer = brush.getPointerPosition(e);

                    this.exec("processing", [pointer.x, pointer.y]);
                },
                context: ins
            });
        },
        clean : function(){
            var ctx = this.context;

            ctx.clearRect(0, 0, this.width, this.height);
        },
        setProperty : function(x, y, width, height, imgX, imgY, imgWidth, imgHeight){
            this.x = x;
            this.y = y;
            this.stage.width = this.width = width;
            this.stage.height = this.height = height;

            this.imageX = imgX || 0;
            this.imageY = imgY || 0;
            this.imageWidth = imgWidth || width;
            this.imageHeight = imgHeight || height;
        },
        fill : function(background, x, y, width, height, fillStyle){
            var ctx = this.context;

            this.setStageStyle("background", "url(" + background + ") no-repeat left top");
            this.setStageStyle("background-size", "100.00000001% 100.00000001%");

            ctx.globalAlpha = 1;

            ctx.fillStyle = "transparent";             
            ctx.fillRect(x, y, width, height);

            ctx.globalAlpha = this.alpha;

            ctx.fillStyle = fillStyle;
            ctx.fillRect(x, y, width, height);

            this.appendText(this.scratchText);

            ctx.globalCompositeOperation = "destination-out"; 
        },
        paintImage : function(background, frontimage, x, y, width, height, imgX, imgY, imgWidth, imgHeight){
            this.ImageUtil = new ImageUtil(this.mask(width, height));
            
            this.setProperty(x, y, width, height, imgX, imgY, imgWidth, imgHeight);

            this.ImageUtil.set("load", {
                callback: function(stage, ctx, imageData, x, y, width, height){
                    var img = this.ImageUtil;

                    img.blur(imageData, x, y, width, height, this.blurRadius, true);

                    this.fill(background, this.x, this.y, this.width, this.height, this.context.createPattern(img.stage, "no-repeat"));

                    this.bind();
                },
                context: this,
                args: []
            });
            this.ImageUtil.set("error", {
                callback: function(stage, ctx, imageData, x, y, width, height){
                    this.exec("error", []);
                },
                context: this,
                args: []
            });

            this.ImageUtil.drawImage(frontimage, this.imageX, this.imageY, this.imageWidth, this.imageHeight);
        },
        paintColor : function(background, color, x, y, width, height){
            this.setProperty(x, y, width, height);

            this.fill(background, x, y, width, height, color);

            this.bind();
        }
    };

    module.exports = function(canvas){
        var _sc = new ScratchCard(canvas);

        var pub = {
            "version": "B15R0909",
            "set": function(type, option){
                _sc.set(type, option);

                return this;
            },
            "getHandleStack": function(){
                return _sc.getHandleStack();
            },
            "setScale" : function(x, y){
                _sc.setScale(x, y);

                return this;
            },
            "setBlurRadius" : function(radius){
                _sc.setBlurRadius(radius);

                return this;
            },
            "setShadowBlur" : function(blur){
                _sc.setShadowBlur(blur);

                return this;
            },
            "setBrushSize" : function(size){
                _sc.setBrushSize(size);

                return this;
            },
            "setScratchText" : function(txt){
                _sc.setScratchText(txt);

                return this;
            },
            "clean" : function(){
                _sc.clean();

                return this;
            },
            "setAlpha" : function(alpha){
                _sc.setAlpha(alpha);

                return this;
            },
            "paintImage" : function(background, frontimage, x, y, width, height, imgX, imgY, imgWidth, imgHeight){
                _sc.paintImage(background, frontimage, x, y, width, height, imgX, imgY, imgWidth, imgHeight);
            },
            "paintColor" : function(background, color, x, y, width, height){
                _sc.paintColor(background, color, x, y, width, height);
            }
        }

        return pub;
    };
});