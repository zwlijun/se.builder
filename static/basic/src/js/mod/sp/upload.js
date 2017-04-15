/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 上传组件封装
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.09
 */
;define(function (require, exports, module){
    var UploadService       = require("mod/se/uploadservice");
    var Util                = require("mod/se/util");
    var Loading             = require("mod/ui/loading");
    var CMD                 = require("mod/se/cmd");

    var ErrorTypes = CMD.ErrorTypes;
    var RespTypes = CMD.ResponseTypes;

    var _Uploader = {
        "upload": {
            service: {},
            watchdog: {},
            init: function(conf){
                if(conf.key in _Uploader.upload.service){
                    return ;
                }

                var service = UploadService.getUploadService("uploadservice_" + conf.key,  {
                    "maxsize": conf.maxsize,
                    "filter": conf.filter,
                    "url": conf.url,
                    "maxupload": conf.maxupload
                });

                var _ctx = {
                    "service": service,
                    "conf": conf
                };

                _Uploader.upload.service[conf.key] = service;

                service.set("notsupport", {
                    callback: function(){
                        CMD.fireError(
                            "0x100229", 
                            "对不起，您当前所在的浏览器或APP不支持", 
                            ErrorTypes.ALARM,
                            _Uploader.upload.listener(this.conf.key, "tips")
                        );
                    },
                    context: _ctx
                }).set("maxsize", {
                    callback: function(fileInfo, maxsize){
                        CMD.fireError(
                            "0x100231", 
                            "文件“" + fileInfo.name + "”超过最大上传大小，单个文件允许上传大小为：" + this.service.getFileSize(maxsize), 
                            ErrorTypes.INFO,
                            _Uploader.upload.listener(this.conf.key, "tips")
                        );
                    },
                    context: _ctx
                }).set("maxupload", {
                    callback: function(size, maxupload){
                        CMD.fireError(
                            "0x100230", 
                            "选择的文件个数超过最大允许数，最多允许上传（" + size + "/" + maxupload + "）个文件", 
                            ErrorTypes.INFO,
                            _Uploader.upload.listener(this.conf.key, "tips")
                        );
                    },
                    context: _ctx
                }).set("filter", {
                    callback: function(fileInfo){
                        CMD.fireError(
                            "0x100230", 
                            "文件“" + fileInfo.name + "”的文件类型不允许上传，请重新选择。", 
                            ErrorTypes.INFO,
                            _Uploader.upload.listener(this.conf.key, "tips")
                        );
                    },
                    context: _ctx
                }).set("servererror", {
                    callback: function(fileInfo, status){
                        CMD.fireError(
                            "0x100232", 
                            "文件“" + fileInfo.name + "”上传失败，服务器返回：" + status, 
                            ErrorTypes.ERROR,
                            _Uploader.upload.listener(this.conf.key, "tips")
                        );

                        //todo
                        Util.execHandler(_Uploader.upload.listener(this.conf.key, "servererror"), [
                            this, 
                            fileInfo, 
                            status
                        ]);
                    },
                    context: _ctx
                }).set("progress", {
                    callback: function(fileInfo, percent, loaded, total){
                        //todo
                        Util.execHandler(_Uploader.upload.listener(this.conf.key, "progress"), [
                            this, 
                            fileInfo, 
                            percent, 
                            loaded, 
                            total
                        ]);
                    },
                    context: _ctx
                }).set("complete", {
                    callback: function(fileInfo, response){
                        Util.execHandler(_Uploader.upload.listener(this.conf.key, "complete"), [
                            this, 
                            fileInfo, 
                            response
                        ]);
                    },
                    context: _ctx
                }).set("counterend", {
                    callback: function(cancel, success, failed){
                        // todo
                        Util.execHandler(_Uploader.upload.listener(this.conf.key, "counterend"), [
                            this, 
                            cancel, 
                            success, 
                            failed
                        ]);
                    },
                    context: _ctx
                }).set("file", {
                    callback: function(files){
                        this.service.readFiles(files);
                    },
                    context: _ctx
                }).set("read", {
                    callback: function(fileInfoList){
                        Util.execHandler(_Uploader.upload.listener(this.conf.key, "read"), [
                            this, 
                            fileInfoList,
                            /*start handler: */{
                                callback: function(){
                                    this.service.register().invoke("start");
                                },
                                context: _ctx
                            }
                        ]);
                    },
                    context: _ctx
                }).listen({
                    "dragZone": conf.dragZone,
                    "inputFiles": "#" + conf.inputId,
                    "enterStyle": conf.enterStyle
                });
            },
            watch: function(key, options){
                if(key in _Uploader.upload.watchdog){
                    _Uploader.upload.watchdog[key] = $.extend(true, {}, _Uploader.upload.watchdog[key], options);
                }else{
                    _Uploader.upload.watchdog[key] = options;
                }
            },
            dog: function(key){
                if(key in _Uploader.upload.watchdog){
                    return _Uploader.upload.watchdog[key];
                }else{
                    return null;
                }
            },
            listener: function(key, type){
                var dog = _Uploader.upload.dog(key);

                if(dog && ("listener" in dog)){
                    var _tmp = dog["listener"];

                    if(_tmp && (type in _tmp)){
                        var _h = _tmp[type] || null;

                        return _h;
                    }
                }

                return null;
            },
            lookup: function(){
                var plugins = $('[data-upload-service]');
                var size = plugins.length;
                var plugin = null;
                var key = null;
                var inputId = null;
                var uploadUrl = null;
                var maxupload = 1;
                var maxsize = 0;
                var filter = null;
                var drag = null;
                var enter = null;

                for(var i = 0; i < size; i++){
                    plugin = $(plugins[i]);

                    key = plugin.attr("data-upload-service");
                    inputId = plugin.attr("data-upload-input") || "uploadfile";

                    uploadUrl = plugin.attr("data-upload-url") || "/upload";
                    maxupload = Number(plugin.attr("data-upload-max") || "1");
                    maxsize = Number(plugin.attr("data-upload-size") || 6 * 1024 * 1024);
                    filter = plugin.attr("data-upload-filter") || "image/jpeg|image/jpg|image/png";
                    zone = plugin.attr("data-upload-zone") || null;
                    enter = plugin.attr("data-upload-enter") || null;

                    filter = filter.replace(/([\.\-\/\+])/g, "\\\$1");

                    _Uploader.upload.init({
                        "key": key,
                        "plugin": plugin,
                        "inputId": inputId,
                        "url": uploadUrl,
                        "maxupload": maxupload,
                        "maxsize": maxsize,
                        "filter": new RegExp("^(" + filter + ")$", "i"),
                        "dragZone": zone,
                        "enterStyle": enter
                    });
                }
            }
        }
    };

    module.exports = {
        "version": "R17B0413",
        lookup: function(){
            _Uploader.upload.lookup();

            return this;
        },
        watch: function(key, options){
            _Uploader.upload.watch(key, options);

            return this
        }
    };
});