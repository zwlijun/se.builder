;define(function(require, exports, module){
    var UploadService   = require("mod/se/uploadservice");

    var ErrorTypes = null;
    var RespTypes = null;
    var ResponseProxy = null;
    var DataCache =  null;
    var CMD = null;
    var Util = null;
    var DataType = null;
    var TemplateEngine = null;
    var Request = null;
    var Persistent = null;
    var Session = null;

    //===Uploader Service Logic Start===
    var Uploader = function(conf){
        this.conf = conf;
        this.service = null;
        this.progress = new Uploader.Progress(this);
    };
    Uploader.prototype = {
        service: null,
        destroy: function(){
            if(null !== this.service){
                this.service.destroy();
            }
        },
        disabled: function(__is){
            var conf = this.conf;
            var inputNode = $(conf.inputSelector);
            var input = inputNode[0];

            if(input){
                if(true === __is){
                    input.disabled = true;
                }else{
                    input.disabled = false;
                }
            }
        },
        updateBackgroundImage: function(url){
            var conf = this.conf;
            var input = $(conf.inputSelector);
            var em = input.siblings("em");

            if(url){
                em.css({
                    backgroundImage: "url(" + url + ")"
                });
            }
        },
        updateHiddenValue: function(val){
            var conf = this.conf;
            var inputSelector = conf.inputSelector;
            var hiddenInputSelector = inputSelector.replace("_file", "");

            $(hiddenInputSelector).val(val || "");
        },
        init: function(){
            this.destroy();

            var conf = this.conf;
            var service = UploadService.getUploadService("us_" + conf.key,  {
                "maxsize": conf.maxsize,
                "filter": conf.filter,
                "url": conf.url,
                "maxupload": conf.maxupload,
                "heads": conf.heads
            });

            this.service = service;

            var _ctx = {
                "service": service,
                "conf": conf,
                "uploader": this
            };

            service.set("notsupport", {
                callback: function(){
                    CMD.fireError(
                        "0x100229", 
                        "对不起，您当前所在的浏览器或APP不支持", 
                        ErrorTypes.ALARM
                    );

                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("maxsize", {
                callback: function(fileInfo, maxsize){
                    CMD.fireError(
                        "0x100231", 
                        "文件“" + fileInfo.name + "”超过最大上传大小，单个文件允许上传大小为：" + this.service.getFileSize(maxsize), 
                        ErrorTypes.INFO
                    );

                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("maxupload", {
                callback: function(size, maxupload){
                    CMD.fireError(
                        "0x100230", 
                        "选择的文件个数超过最大允许数，最多允许上传（" + size + "/" + maxupload + "）个文件", 
                        ErrorTypes.INFO
                    );

                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("filter", {
                callback: function(fileInfo){
                    CMD.fireError(
                        "0x100230", 
                        "文件“" + fileInfo.name + "”的文件类型不允许上传，请重新选择。", 
                        ErrorTypes.INFO
                    );

                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("servererror", {
                callback: function(fileInfo, status){
                    CMD.fireError(
                        "0x100232", 
                        "文件“" + fileInfo.name + "”上传失败，服务器返回：" + status, 
                        ErrorTypes.ERROR
                    );

                    //todo
                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("progress", {
                callback: function(fileInfo, percent, loaded, total){
                    //todo
                    this.uploader.progress.update(100 - percent);
                },
                context: _ctx
            }).set("complete", {
                callback: function(fileInfo, response){
                    //todo
                    this.uploader.progress.update(0);

                    if("0" === response.code){
                        var dataSet = response.dataSet;
                        var uploadFile = dataSet[0];

                        this.uploader.updateHiddenValue(uploadFile.source);
                        this.uploader.updateBackgroundImage(uploadFile.source);
                    }else{
                        CMD.fireError(
                            response.code, 
                            "文件“" + fileInfo.name + "”上传失败" + (response.message ? "，" + response.message : ""), 
                            ErrorTypes.ERROR
                        );
                    }

                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("counterend", {
                callback: function(cancel, success, failed){
                    // todo
                    this.uploader.disabled(false);
                },
                context: _ctx
            }).set("file", {
                callback: function(files){
                    this.service.readFiles(files);
                },
                context: _ctx
            }).set("read", {
                callback: function(fileInfoList){
                    var firstFileInfo = fileInfoList[0];
                    var thumb = firstFileInfo.thumb;
                    var conf = this.conf;

                    this.uploader.disabled(true);
                    this.uploader.updateBackgroundImage(thumb);
                    this.uploader.updateHiddenValue("");
                    this.uploader.progress.init();

                    this.service.register().invoke("start");
                },
                context: _ctx
            }).listen({
                "dragZone": conf.dragZone,
                "inputFiles": conf.inputSelector,
                "enterStyle": conf.enterStyle
            });
        }
    };
    Uploader.Progress = function(uploader){
        this.uploader = uploader;
    };
    Uploader.Progress.prototype = {
        update: function(percent){
            var conf = this.uploader.conf;

            var inputNode = $(conf.inputSelector);
            var p = inputNode.parents(".filebrowser");
            var name = inputNode.attr("name");
            var progress = $("#" + name + "_progress");

            if(percent <= 0){
                progress.addClass("hide").css({
                    "height": "100%"
                }).find("span").html("");
            }else{
                progress.removeClass("hide").css({
                    "height": percent + "%"
                }).find("span").html((100 - percent) + "%");
            }
        },
        init: function(){
            var conf = this.uploader.conf;

            var inputNode = $(conf.inputSelector);
            var p = inputNode.parents(".filebrowser");
            var name = inputNode.attr("name");
            var html = ''
                     + '<div class="flexbox middle center" style="position: absolute; left: 0; top: 0; z-index: 20; width:100%; height: 100%;" id="' + name + '_progress">'
                     + '<span style="display: block; font-size: .12rem; color: #333;"></span>'
                     + '</div>'
                     + '';

            var progress = $("#" + name + "_progress");

            if(progress.length == 0){
                p.append(html);
                progress = $("#" + name + "_progress");
            }

            progress.css({
                "backgroundColor": "rgba(255, 255, 255, 0.65)"
            });
        }
    };
    Uploader.Cache = {};
    Uploader.newInstance = function(conf){
        var uploader = Uploader.Cache[conf.key] || (Uploader.Cache[conf.key] = new Uploader(conf));

        return uploader;
    };
    Uploader.getInstance = function(key){
        if(key in Uploader.Cache){
            return Uploader.Cache[key];
        }

        return null;
    };
    //===Uploader Service Logic End===

    var UploaderService = {
        "avator": {
            uploader: null,
            init: function(serviceKey){
                return this.uploader || (this.uploader = Uploader.newInstance({
                    "key": serviceKey,
                    "maxsize": 2097152,
                    "filter": /(image\/jpeg|image\/jpg|image\/png)/,
                    "url": "/upload",
                    "maxupload": 1,
                    "heads": [
                        {"name": "X-Upload-Type", "value": serviceKey}
                    ],
                    "dragZone": "non",
                    "inputSelector": 'input[data-uploader="' + serviceKey + '"]',
                    "enterStyle": "dragdrop"
                }));
            }
        }
    };

    var Logic = {
        init: function(){
            for(var service in UploaderService){
                if(UploaderService.hasOwnProperty(service)){
                    UploaderService[service].init.apply(UploaderService[service], [service]);
                }
            }
        }
    };

    var Bridge = {
        plugin: null,
        connect: function(target){
            Bridge.plugin = target;

            var expando = target.expando;

            ErrorTypes      = expando["errors"];
            RespTypes       = expando["types"];
            Request         = expando["request"];
            ResponseProxy   = expando["response"];
            DataCache       = expando["cache"];
            CMD             = expando["cmd"];
            Util            = expando["util"];
            DataType        = expando["typeof"];
            TemplateEngine  = expando["template"];
            Persistent      = expando["persistent"];
            Session         = expando["session"];

            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0324",
        "connect": Bridge.connect
    }
});