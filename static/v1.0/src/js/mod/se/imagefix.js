/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图像旋转修正
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.10
 */
;define(function (require, exports, module){
    var Util = require("mod/se/util");
    var EXIF = require("lib/extra/exif/r2.1.1/exif");
    
    var ImageFixTypes = {
        "URL": 0,
        "BASE64": 1,
        "IMAGE": 2
    };

    var ImageFix = function(options, handle){
        this.settings = {
            "image": options.image,
            "imageType": options.imageType || ImageFixTypes.URL,
            "crossOrigin": options.crossOrigin || "Anonymous",
            "maxWidth": 1024,
            "maxHeight": 1024,
            // "width": 0,
            // "height": 0,
            "quality": 0.8
        };
        this.handle = handle || null;

        this.ExifInfo = {};
        this.image = null;
    };

    /**
     * Detecting vertical squash in loaded image.
     * Fixes a bug which squash image vertically while drawing into canvas for some images.
     * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
     *
     */
    ImageFix.DetectVerticalSquash = function(img, nw, nh){
        var iw = nw || img.naturalWidth, 
            ih = nh || img.naturalHeight;

        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = ih;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        var data = ctx.getImageData(0, 0, 1, ih).data;
        // search image edge pixel position in case it is squashed vertically.
        var sy = 0;
        var ey = ih;
        var py = ih;

        while (py > sy) {
            var alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        var ratio = (py / ih);

        return (ratio===0) ? 1 : ratio;
    };

    ImageFix.IsCrossOrigin = function(url){
        var local = document.URL;
        var protocol = location.protocol;
        var absolute = /^([a-z]+:)?\/\//i;

        if(!absolute.test(url)){
            return false;
        }

        if(/^\/\//.test(url)){
            url = protocol + url;
        }

        var group1 = local.split("/").slice(0, 3).join("/");
        var group2 = url.split("/").slice(0, 3).join("/");

        return (group1 != group2);
    }; 

    ImageFix.IsIOSSubSample = function(img){
        var w = img.naturalWidth,
            h = img.naturalHeight,
            hasSubSample = false;

        if (w * h > 1024 * 1024) { //超过1K*1K分辨率的图会被抽样
            var canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d'),
                canvas.width = canvas.height = 1;

            ctx.drawImage(img, 1 - w, 0);

            hasSubSample = ctx.getImageData(0, 0, 1, 1).data[3] === 0;

            canvas = ctx = null;//清理
        }

        return hasSubSample;
    };

    ImageFix.ImageToDataURL = function(fix, image, width, height){
        var canvas = document.createElement('canvas');

        ImageFix.ImageToCanvas(fix, image, canvas, width, height);

        return canvas.toDataURL("image/jpeg", fix.settings.quality || 0.8);
    };

    ImageFix.ImageToCanvas = function(fix, image, canvas, width, height){
        var iw = image.naturalWidth;
        var ih = image.naturalHeight;

        if(!(iw + ih)) {return ;}

        var ctx = canvas.getContext('2d');
            ctx.save();

        var orientation = fix.ExifInfo.Orientation;

        if(undefined === orientation){
            orientation = 1;
        }

        ImageFix.AutoRotate(canvas, ctx, width, height, orientation);

        if(ImageFix.Env.iOS && ImageFix.IsIOSSubSample(image)){
            iw /= 2;
            ih /= 2;

            var d = 1024; // size of tiling canvas
            var tmpCanvas = document.createElement('canvas');

            tmpCanvas.width = tmpCanvas.height = d;

            var tmpCtx = tmpCanvas.getContext('2d');
            var vertSquashRatio = ImageFix.DetectVerticalSquash(image, iw, ih);
            var dw = Math.ceil(d * width / iw);
            var dh = Math.ceil(d * height / ih / vertSquashRatio);
            var sy = 0;
            var dy = 0;
            while (sy < ih) {
                var sx = 0;
                var dx = 0;
                while (sx < iw) {
                    tmpCtx.clearRect(0, 0, d, d);
                    tmpCtx.drawImage(image, -sx, -sy);
                    ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
                    sx += d;
                    dx += dw;
                }
                sy += d;
                dy += dh;
            }

            tmpCanvas = tmpCtx = null;
        }else{
            ctx.drawImage(image, 0, 0, iw, ih, 0, 0, width, height);
        }

        ctx.restore();
    };

    ImageFix.AutoRotate = function(canvas, ctx, width, height, orientation){
        switch (orientation){
            case 5:
            case 6:
            case 7:
            case 8:
                canvas.width = height;
                canvas.height = width;
            break;
            default:
                canvas.width = width;
                canvas.height = height;
        }

        switch (orientation) {
            case 2:
                // horizontal flip
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                break;
            case 3:
                // 180 rotate left
                ctx.translate(width, height);
                ctx.rotate(Math.PI);
                break;
            case 4:
                // vertical flip
                ctx.translate(0, height);
                ctx.scale(1, -1);
                break;
            case 5:
                // vertical flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);
                break;
            case 6:
                // 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(0, -height);
                break;
            case 7:
                // horizontal flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(width, -height);
                ctx.scale(-1, 1);
                break;
            case 8:
                // 90 rotate left
                ctx.rotate(-0.5 * Math.PI);
                ctx.translate(-width, 0);
                break;
            default:
                break;
        }
    };

    ImageFix.GetImageInfo = function(fix, image){
        var width = fix.settings.width;
        var height = fix.settings.height;
        var maxWidth = fix.settings.maxWidth;
        var maxHeight = fix.settings.maxHeight;
        var imgWidth = image.naturalWidth;
        var imgHeight = image.naturalHeight;

        var _w = image.naturalWidth;
        var _h = image.naturalHeight;
        var w = _w;
        var h = _h;

        if (width && !height) {
            height = (imgHeight * width / imgWidth) << 0;
        } else if (height && !width) {
            width = (imgWidth * height / imgHeight) << 0;
        } else {
            width = imgWidth;
            height = imgHeight;
        }
        if (maxWidth && width > maxWidth) {
            width = maxWidth;
            height = (imgHeight * width / imgWidth) << 0;
        }
        if (maxHeight && height > maxHeight) {
            height = maxHeight;
            width = (imgWidth * height / imgHeight) << 0;
        }

        fix.settings.width = width;
        fix.settings.height = height;

        return {
            "width": width,
            "height": height
        };
    };

    ImageFix.Env = (function(ua){
        var ios = /(iphone|ipad|ipod|ios)/i;
        var android = /(android)/i;

        return {
            "iOS": ios.test(ua),
            "Android": android.test(ua)
        };
    })(navigator.userAgent);

    ImageFix.prototype = {
        update: function(options){
            this.settings = $.extend(this.settings, options);

            return this;
        },
        fix: function(handle){
            if(handle){
                this.handle = handle;
            }

            var _image = new Image();
            var _this = this;
            var settings = _this.settings;

            _this.image = _image;

            if(settings.imageType == ImageFixTypes.URL){
                if(ImageFix.IsCrossOrigin(settings.image)){
                    _image.crossOrigin = settings.crossOrigin || "Anonymous";
                }
            }

            _image.onload = function(e){
                EXIF.getData(this, function(){

                    _this.ExifInfo = EXIF.getAllTags(this);
                    _this.process();
                });
            };

            _image.onerror = function(e){
                Util.execAfterMergerHandler(_this.handle, [_this.ExifInfo, null, null, null]);
            };

            if(settings.imageType == ImageFixTypes.IMAGE){
                _image.src = $(settings.image).attr("src");
            }else{
                _image.src = settings.image;
            }
        },
        process: function(){
            var _this = this;
            var _image = _this.image;
            var ImageInfo = ImageFix.GetImageInfo(_this, _image);

            var _base64 = ImageFix.ImageToDataURL(_this, _image, ImageInfo.width, ImageInfo.height);

            Util.execAfterMergerHandler(_this.handle, [_this.ExifInfo, _base64])
        }
    };

    ImageFix.Cache = {};

    module.exports = {
        "version": "R15B1030",
        "Types": ImageFixTypes,
        "getInstance": function(name, options, handle){
            var ifx = ImageFix.Cache[name] || (ImageFix.Cache[name] = new ImageFix(options, handle));

            return {
                "update": function(options){
                    ifx.update(options);

                    return this;
                },
                "fix": function(handle){
                    ifx.fix(handle);

                    return this;
                }
            }
        }
    };
});