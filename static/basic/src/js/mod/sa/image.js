/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图片处理模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.7
 */
;define(function (require, exports, module){
    var Util = $.Util = require("mod/se/util");
    var Listener      = require("mod/se/listener");
    var Blur          = require("mod/sa/stackblur");

    var HandleStack   = Listener.HandleStack;

    /**
     * 图片处理
     * @param  {Canvas} canvas [description]
     * @return {[type]}        [description]
     */
    var _Image = function(canvas){
        this.version = "R17B0817";
        this.stage = canvas;
        this.context = canvas.getContext("2d");

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onload: null,
            onerror: null

        }, this.handleStack);
    };

    //跨域
    _Image.ORIGIN = {
        EMPTY: "",
        ANONYMOUS: "anonymous",
        USE_CREDENTIALS: "use-credentials"
    }

    _Image.prototype = {
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
         * 获取事件回调栈
         * @return {Object} [description]
         */
        getHandleStack : function(){
            return this.handleStack;
        },
        /**
         * 将图片画到canvas上
         * @param  {String} source      [图片的源地址]
         * @param  {Number} x           [x坐标]
         * @param  {Number} y           [y坐标]
         * @param  {Number} width       [宽度]
         * @param  {Number} height      [高度]
         * @param  {String} crossorigin [跨域设置]
         */
        drawImage : function(source, x, y, width, height, crossorigin){
            var stage = this.stage;
            var ctx = this.context;

            var src = source;
            var _x = x || 0;
            var _y = y || 0;
            var _w = width || stage.width;
            var _h = height || stage.height;

            var img = new Image();
            var ins = this;

            img.onload = function(){
                ctx.clearRect(_x, _y, stage.width, stage.height);
                ctx.drawImage(img, _x, _y, _w, _h);

                ins.exec("load", [stage, ctx, ins.readImageData(_x, _y, _w, _h), _x, _y, _w, _h]);
                //Util.execHandler(handler, [stage, ctx, ins.readImageData(_x, _y, _w, _h), _x, _y, _w, _h]);
            }

            img.onerror = function(){
                ins.exec("error", [stage, ctx, null, _x, _y, _w, _h]);
                //Util.execHandler(handler, [stage, ctx, null, _x, _y, _w, _h]);
            }

            img.crossOrigin = crossorigin || _Image.ORIGIN.EMPTY;

            img.src = src;
        },
        /**
         * 创建图像数据
         * @param  {Object} options [数据选项]
         * @return {Object}         [图片数据]
         */
        createImageData : function(options){
            var ctx = this.context;
            var imageData = null;

            if(options.imageData){
                imageData = ctx.createImageData(options.imageData);
            }else{
                imageData = ctx.createImageData(options.width, options.height);
            }

            /**
             * index + 0, R - 红色 (0-255)
             * index + 1, G - 绿色 (0-255)
             * index + 2, B - 蓝色 (0-255)
             * index + 3, A - alpha 通道 (0-255; 0 是透明的，255 是完全可见的)
             */
            return imageData;
        },
        /**
         * 读取图像数据
         * @param  {Number} x      [x坐标]
         * @param  {Number} y      [y坐标]
         * @param  {Number} width  [宽度]
         * @param  {Number} height [高度]
         * @return {Object}        [图像数据]
         */
        readImageData : function(x, y, width, height){
            var stage = this.stage;
            var ctx = this.context;

            var _x = x || 0;
            var _y = y || 0;
            var _w = width || stage.width;
            var _h = height || stage.height;

            /**
             * index + 0, R - 红色 (0-255)
             * index + 1, G - 绿色 (0-255)
             * index + 2, B - 蓝色 (0-255)
             * index + 3, A - alpha 通道 (0-255; 0 是透明的，255 是完全可见的)
             */
            return ctx.getImageData(_x, _y, _w, _h); 
        },
        /**
         * 写图像数据
         * @param  {Object} imageData [图像数据]
         * @param  {Number} x         [x坐标]
         * @param  {Number} y         [y坐标]
         * @param  {Object} dirty     [其他数据属性]
         */
        writeImageData : function(imageData, x, y, dirty){
            var stage = this.stage;
            var ctx = this.context;

            var _x = x || 0;
            var _y = y || 0;

            if(dirty){
                ctx.putImageData(imageData, _x, _y, dirty.x, dirty.y, dirty.width, dirty.height);
            }else{
                ctx.putImageData(imageData, _x, _y);
            }
        },
        /**
         * 将canvas转换成image
         * @return {Image} [description]
         */
        stage2image : function(){
            var img = new Image();

            img.src = this.stage.toDataURL("image/png");

            return img;
        },
        /**
         * 颜色值限制，将值控制在 0~255
         * @param  {Number} value [值]
         * @return {Number}       [值]
         */
        clamp : function(value){
            return value > 255 ? 255 : value < 0 ? 0 : value;
        },
        /**
         * 灰度
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        grayscale : function(imageData, x, y, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i] = data[i + 1] = data[i + 2] = (r + g + b)/3;
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * 怀旧
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        sepia : function(imageData, x, y, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i]     = (r * 0.393) + (g * 0.769) + (b * 0.189); // red
                data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168); // green
                data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131); // blue
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * 红
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        red : function(imageData, x, y, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i] = (r + g + b) / 3;        // 红色通道取平均值
                data[i + 1] = data[i + 2] = 0;    // 绿色通道和蓝色通道都设为0
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * 绿
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        green : function(imageData, x, y, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i + 1] = (r + g + b) / 3;        // 绿色通道取平均值
                data[i] = data[i + 2] = 0;            // 红色通道和蓝色通道都设为0
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * 蓝
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        blue : function(imageData, x, y, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i + 2] = (r + g + b) / 3;        // 蓝色通道取平均值
                data[i] = data[i + 1] = 0;            // 红色通道和绿色通道都设为0
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * RGBA
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} rd        [description]
         * @param  {[type]} gd        [description]
         * @param  {[type]} bd        [description]
         * @param  {[type]} ad        [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        rgba : function(imageData, x, y, rd, gd, bd, ad, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;
            var a = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];
                a = data[i + 3];

                data[i]     = r + rd;
                data[i + 1] = g + gd;
                data[i + 2] = b + bd;
                data[i + 3] = a + ad;
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * rgb
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} rd        [description]
         * @param  {[type]} gd        [description]
         * @param  {[type]} bd        [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        rgb : function(imageData, x, y, rd, gd, bd, dirty){
            return this.rgba(imageData, x, y, rd, gd, bd, 0, dirty);
        },
        /**
         * 亮度
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} delta     [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        brightness : function(imageData, x, y, delta, dirty){
            return this.rgb(imageData, x, y, delta, delta, delta, dirty);
        },
        /**
         * 取反
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        invert : function(imageData, x, y, dirty){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i]     = 255 - r;
                data[i + 1] = 255 - g;
                data[i + 2] = 255 - b;
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        },
        /**
         * 模糊
         * @param  {[type]} imageData [description]
         * @param  {[type]} x         [description]
         * @param  {[type]} y         [description]
         * @param  {[type]} width     [description]
         * @param  {[type]} height    [description]
         * @param  {[type]} radius    [description]
         * @param  {[type]} alpha     [description]
         * @param  {[type]} dirty     [description]
         * @return {[type]}           [description]
         */
        blur : function(imageData, x, y, width, height, radius, alpha, dirty){
            if(radius > 0){
                if(true === alpha){
                    imageData = Blur.getRGBAData(imageData, width, height, radius);
                }else{
                    imageData = Blur.getRGBData(imageData, width, height, radius);
                }
            }

            this.writeImageData(imageData, x, y, dirty);

            return imageData;
        }
    };

    module.exports = _Image;
});