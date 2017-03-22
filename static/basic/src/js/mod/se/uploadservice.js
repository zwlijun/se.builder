/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 文件上传模块，仅支持XMLHttpReqeust Level 2
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.7
 */
;define(function Upload(require, exports, module){
    var Util                = $.Util            = require("mod/se/util");
    var DateUtil            = $.DateUtil        = require("mod/se/dateutil");
    var Timer                                   = require("mod/se/timer");
    var Listener            = $.Listener        = require("mod/se/listener");
    var HandleStack                             = Listener.HandleStack;

    var _UploadService = function(upload, fileInfo){
        this.upload = upload;
        this.conf = upload.options;
        this.fileInfo = fileInfo;
        this.service = null;
    };
    _UploadService.prototype = {
        start: function(){
            var us = this;
            var xhr = us.service = new XMLHttpRequest();
            var conf = us.conf;
            var heads = conf.heads || [];
            var fileInfo = us.fileInfo;

            xhr.open("POST", conf.url, true);

            for(var i = 0, size = heads.length; i < size; i++){
                head = heads[i];
                xhr.setRequestHeader(head.name, head.value);
            }

            xhr.onload = function(){
                us.uploading = false;
                us.upload.exec("load", [fileInfo]);
            };

            xhr.onreadystatechange = function(){
                var status = xhr.status;
                var state = xhr.readyState;

                us.uploading = true;

                if(4 == state){
                    us.uploading = false;

                    if(200 == status){
                        var resp = JSON.parse(xhr.responseText||"{}");
                        
                        us.upload.counter("success", fileInfo);
                        us.upload.exec("complete", [fileInfo, resp]);
                    }else{
                        us.upload.counter("failed", fileInfo);
                        us.upload.exec("servererror", [fileInfo, status]);
                    }
                }
            };

            xhr.onabort = function(){
                us.uploading = false;
                us.upload.counter("cancel", fileInfo);
                us.upload.exec("cancel", [fileInfo]);
            };

            xhr.upload.onprogress = function(e){
                us.uploading = true; 

                if(e.lengthComputable){
                    if(e.total > us.upload.maxsize){
                        xhr.abort();

                        us.upload.exec("maxsize", [fileInfo, us.upload.maxsize]);

                        return 0;
                    }

                    us.upload.exec("progress", [fileInfo, ((e.loaded / e.total) * 100).toFixed(0), e.loaded, e.total]);
                }
            }

            var formData = null;

            if(fileInfo.sourceType == "text"){
                formData = "file_" + fileInfo.key + "=" + fileInfo.source;
            }else{
                formData = new FormData();

                formData.append("file_" + fileInfo.key, fileInfo.source);
            }

            xhr.send(formData);
        },
        cancel : function(){
            if(this.service && true === this.uploading){
                this.service.abort();
            }
        },
        destroy : function(){
            var xhr = this.service;

            if(xhr){
                xhr.onload = null;
                xhr.onabort = null;
                xhr.onreadystatechange = null;
                xhr.upload.onprogress = null;
                xhr = this.service = null;
            }
        }
    };

    // options.maxsize     单个文件最大尺寸
    // options.filter      文件类型过滤
    // options.url         上传接口
    // options.maxupload   最大上传文件个数 
    // options.heads       HTTP头设置
    var _Upload = function(options){
        this.options = options;

        this.size = 0;
        this.fileInfoList = [];

        this.Service = {};
        this.Counter = {
            "cancel": {
                count: 0,
                list: []
            },
            "success": {
                count: 0,
                list: []
            },
            "failed": {
                count: 0,
                list: []
            }
        };
        this.CounterTimer = null;

        this.handleStack = new HandleStack();
        this.listner = new Listener({
            onnotsupport: null,
            onfile: null,
            onread: null,
            onreading: null,
            onload: null,
            onservererror: null,
            oncomplete: null,
            oncancel: null,
            onprogress: null,
            onmaxsize: null,
            onmaxupload: null,
            onfilter: null,
            oncounterend: null
        }, this.handleStack);
    };

    _Upload.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listner.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listner.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listner.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listner.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listner.clear();
        },
        getHandleStack: function(){
            return ins.handleStack;
        },
        counter: function(type, fileInfo){
            if(type in this.Counter){
                this.Counter[type].count++;
                this.Counter[type].list.push(fileInfo);
            }
        },
        cc: function(){
            this.Counter = {
                "cancel": {
                    count: 0,
                    list: []
                },
                "success": {
                    count: 0,
                    list: []
                },
                "failed": {
                    count: 0,
                    list: []
                }
            };
        },
        checkEnv : function(){
            return !!(window.File && window.FileReader && window.FileList && window.FormData && window.Blob);
        },
        addService: function(fileInfo){
            this.Service[fileInfo.key] = new _UploadService(this, fileInfo);
        },
        addFileInfo: function(fileInfo){
            this.fileInfoList.push(fileInfo);
            this.size = this.fileInfoList.length;
        },
        as: function(fileInfo){
            this.addFileInfo(fileInfo);
            this.addService(fileInfo);
        },
        register: function(){
            if(!this.checkEnv()){
                this.Service = {};
                this.exec("notsupport", []);

                return  0;
            }
            var fileInfoList = this.fileInfoList;
            var size = fileInfoList.length;
            var fileInfo = null;

            this.size = size;

            this.Service = {};

            for(var i = 0; i < size; i++){
                fileInfo = fileInfoList[i];

                this.addService(fileInfo);
            }
        },
        unregister: function(key){
            if(!key){
                for(var _name in this.Service){
                    if(this.Service.hasOwnProperty(_name)){
                        this.unregister(_name);
                    }
                }

                return ;
            }

            if(key in this.Service){
                this.Service[key].destroy();

                delete this.Service[key];
            }else{
                return ;
            }

            var fileInfoList = this.fileInfoList;
            var size = fileInfoList.length;
            var fileInfo = null;

            for(var i = 0; i < size; i++){
                fileInfo = fileInfoList[i];

                if(key === fileInfo.key){
                    this.fileInfoList.splice(i, 1);
                    this.size = this.fileInfoList.length;

                    break;
                }
            }
        },
        getFileInfo: function(key){
            var fileInfoList = this.fileInfoList;
            var size = fileInfoList.length;
            var fileInfo = null;

            for(var i = 0; i < size; i++){
                fileInfo = fileInfoList[i];

                if(key === fileInfo.key){
                    return fileInfo;
                }
            }

            return null;
        },
        getUploadService: function(key){
            if(key){
                return this.Service[key] || {};
            }else{
                return this.Service;
            }
        },
        invoke: function(name, key){
            var map = this.getUploadService(key);
            var service = null;

            if("start" === name){
                if(this.size > this.options.maxupload){
                    this.exec("maxupload", [this.size, this.options.maxupload]);
                    return 0;
                }

                this.cc();
                this.CounterTimer.start();
            }

            if(key){
                service = map;

                if(name in service){
                    service[name].apply(service, []);
                }
            }else{
                for(var key in map){
                    if(map.hasOwnProperty(key)){
                        service = map[key];

                        if(name in service){
                            service[name].apply(service, []);
                        }
                    }
                }
            }
        },
        getFileSize : function(size){
            return Util.getFileSize(size);
        },
        isImage : function(type){
            switch(type){
                case "image/jpeg":
                case "image/png":
                case "image/gif":
                case "image/jpg":
                case "image/bmp":
                    return true;
            }

            return false;
        },
        checkFilter: function(fileType){
            return this.options.filter.test(fileType);
        },
        readFiles: function(files){
            var _ins = this;

            if(!_ins.checkEnv()){
                _ins.Service = {};
                _ins.exec("notsupport", []);
                return 0;
            }

            var len = files.length;
            var file = null;
            var fileType = null;
            var fileInfo = null;
            var reader = null;

            _ins.fileInfoList = [];
            _ins.size = len;
            _ins.readCount = 0;

            if(_ins.size > _ins.options.maxupload){
                _ins.exec("maxupload", [_ins.size, _ins.options.maxupload]);
                return 0;
            }

            if(len == 0){
                return 0;
            }

            var lastModified = 0;
            var lastModifiedDate = null;

            for(var i = 0; i < len; i++){
                file = files[i];
                fileType = file.type;

                if(file.lastModified){
                    lastModified = file.lastModified;
                }

                if(file.lastModifiedDate){
                    lastModifiedDate = file.lastModifiedDate;
                }

                if(lastModifiedDate && !lastModified){
                    lastModified = lastModifiedDate.getTime();
                }

                if(lastModified && !lastModifiedDate){
                    lastModifiedDate = new Date(lastModified);
                }

                fileInfo = {
                    "key": Util.GUID(),
                    "source": file,
                    "sourceType": "binary",
                    "name": file.name,
                    "type": fileType,
                    "bytes": file.size,
                    "size": _ins.getFileSize(file.size),
                    "lastModified": lastModified,
                    "lastModifiedDate": DateUtil.format(lastModifiedDate, "%d/%M/%y %h:%m:%s"),
                    "thumb": undefined
                };

                if(_ins.options.filter && _ins.options.filter != "*"){
                    if(!_ins.checkFilter(fileType)){
                        _ins.exec("filter", [fileInfo]);

                        continue;
                    }
                }

                if(file.size > _ins.options.maxsize){
                    _ins.exec("maxsize", [fileInfo, _ins.options.maxsize]);

                    continue;
                }

                reader = new FileReader();

                if(_ins.isImage(fileType)){
                    reader.onload = (function(_fileInfo, ins){
                        return function(e){
                            _fileInfo.thumb = e.target.result;

                            ins.fileInfoList.push(_fileInfo);
                            ins.readCount++;
                        }
                    })(fileInfo, _ins);
                    reader.readAsDataURL(file);
                }else{
                    fileInfo.thumb = undefined;

                    _ins.fileInfoList.push(fileInfo);
                    _ins.readCount++;
                }
            }

            var timer = Timer.getTimer("upload_read_files_" + Util.GUID(), 60, null);

            timer.setTimerHandler({
                callback: function(_timer, size){
                    if(this.readCount >= size){
                        _timer.destroy();
                        
                        this.exec("read", [this.fileInfoList]);
                    }else{
                        this.exec("reading", [this.readCount, size]);
                    }
                },
                context: _ins,
                args: [len]
            });

            timer.start();
        },
        listen: function(options){
            var dragZone = options.dragZone;
            var inputFiles = options.inputFiles;

            if(!this.checkEnv()){
                this.Service = {};
                this.exec("notsupport", []);
                return 0;
            }
            
            dragZone = $(dragZone);
            inputFiles = $(inputFiles);

            var _ins = this;

            dragZone.each((function(_this){
                var _ins = _this;

                return function(index, item){
                    item.ondragover = function(e){
                        e.stopPropagation();
                        e.preventDefault();

                        e.dataTransfer.dropEffect = 'copy';

                        if(options.enterStyle){
                            dragZone.addClass(options.enterStyle);
                        }
                    };

                    item.ondrop = function(e){
                        e.stopPropagation();
                        e.preventDefault();

                        if(options.enterStyle){
                            dragZone.removeClass(options.enterStyle);
                        }

                        var files = e.dataTransfer.files;
                        
                        _ins.exec("file", [files]);              
                    };
                };
            })(_ins));
            
            inputFiles.each((function(_this){
                var _ins = _this;

                return function(index, item){
                    item.onchange = function(e){
                        e.preventDefault();
                        e.stopPropagation();

                        var files = e.target.files;

                        _ins.exec("file", [files]);
                    };
                }
            })(_ins));

            if(null != _ins.CounterTimer){
                _ins.CounterTimer.setTimerHandler({
                    callback: function(_timer){
                        var counter = this.Counter;
                        var cancel = counter.cancel;
                        var success = counter.success;
                        var failed = counter.failed;
                        var total = this.size || 0;

                        if(total <= 0){
                            return ;
                        }

                        if(cancel.count === 0 && success.count === 0 && failed.count === 0){
                            return ;
                        }

                        if(cancel.count + success.count + failed.count >= total){
                            this.exec("counterend", [cancel, success, failed]);
                            this.cc();

                            _timer.stop();
                        }
                    },
                    context: _ins
                });
            }
        },
        destroy: function(){
            this.cc();

            if(this.CounterTimer){
                this.CounterTimer.stop();
                this.CounterTimer = null;
            }

            this.size = 0;
            this.fileInfoList = [];

            for(var key in this.Service){
                if(this.Service.hasOwnProperty(key)){
                    this.unregister(key);
                }
            }
        }
    };

    _Upload.cacheData = {};

    module.exports = {
        "version": "R17B0322",
        "getUploadService": function(name, options){
            // options.maxsize     单个文件最大尺寸
            // options.filter      文件类型过滤
            // options.url         上传接口
            // options.maxupload   最大上传文件个数 
            // options.heads       HTTP头设置
            var s = _Upload.cacheData[name] || (_Upload.cacheData[name] = new _Upload(options));

            s.CounterTimer = Timer.getTimer("us_counter_timer_" + name, 60, null);

            return {
                "set": function(type, option){
                    s.set(type, option);

                    return this;
                },
                "getHandleStack": function(){
                    return s.getHandleStack();
                },
                "setMaxSize": function(max){
                    s.options.maxsize = max;

                    return this;
                },
                "setFilter": function(filter){
                    s.options.filter = filter;

                    return this;
                },
                "setUploadURL": function(url){
                    s.options.url = url;

                    return this;
                },
                "setMaxUpload": function(max){
                    s.options.maxupload = max;

                    return this;
                },
                "setUploadHeads": function(heads){
                    s.options.heads = heads;

                    return this;
                },
                "pushUploadHead": function(head){
                    var heads = s.options.heads || [];
                    var size = heads.length;

                    if(size === 0){
                        s.options.heads = [head];
                        return this;
                    }else{
                        for(var i = 0; i < size; i++){
                            if(heads[i].name == head.name){
                                s.options.heads[i] = head;
                                return this;
                            }
                        }

                        s.options.heads.push(head);
                    }

                    return this;
                },
                "removeUploadHead": function(head){
                    var heads = s.options.heads || [];
                    var size = heads.length;

                    if(size === 0){
                        return this;
                    }else{
                        for(var i = 0; i < size; i++){
                            if(heads[i].name == head.name){
                                s.options.heads.splice(i, 1);
                                return this;
                            }
                        }
                    }

                    return this;
                },
                "getFileSize": function(size){
                    return s.getFileSize(size);
                },
                "listen": function(options){
                    s.listen(options);

                    return this;
                },
                "readFiles": function(files){
                    s.readFiles(files);

                    return this;
                },
                "invoke": function(name, key){
                    s.invoke(name, key);

                    return this;
                },
                "getFileInfo": function(key){
                    return s.getFileInfo(key);
                },
                "getServiceCollection": function(key){
                    return s.getUploadService(key);
                },
                "as": function(fileInfo){
                    s.as(fileInfo);

                    return this;
                },
                "register": function(){
                    s.register();

                    return this;
                },
                "unregister": function(key){
                    s.unregister(key);

                    return this;
                },
                "destroy": function(){
                    s.destroy();

                    return this;
                }
            };
        }
    };
});
