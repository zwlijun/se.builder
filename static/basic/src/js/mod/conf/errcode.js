/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 错误码
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.10
 */
;define(function(require, exports, module){
    var CMD             = require("mod/se/cmd");
    var Storage         = require("mod/se/storage");
    var Util            = require("mod/se/util");
    
    var ErrorTypes      = CMD.ErrorTypes;
    var RespTypes       = CMD.ResponseTypes;
    var Persistent      = Storage.Persistent;
    var Session         = Storage.Session;

    var RootSet = $.__ROOT__;
    var resPath = RootSet.RES_ROOT;
    var confPath = resPath.replace(/(src|res)\/$/gi, "conf/errcode/");

    var ErrorCode = {
        "version": "R18B1008",
        setConfigurePath: function(path){
            confPath = path || confPath;

            if(!/\/$/.test(confPath)){
                confPath += "/";
            }
        },
        getConfigurePath: function(){
            return confPath;
        },
        check: function(type, handler){
            var version = Persistent.get("errcode_" + type + "_version") || -1;
            var cache = Persistent.get("errcode_" + type) || null;

            if(null !== cache){
                Util.execHandler(handler, [cache]);
            }

            if(version <= 0){
                ErrorCode.load(type, handler, true);
                return ;
            }

            var _command = {
                "errcode": {
                    "version": {

                    }
                }
            };

            _command["errcode"]["version"][type] = {
                "url": ErrorCode.getConfigurePath() + type + ".version",
                "data": "r=" + Util.GUID32(),
                "dataType": RespTypes.T,
                "method": "GET"
            };

            CMD.injectCommands(_command);
            CMD.exec("errcode.version." + type, null, {
                "context": {
                    "showLoading": false,
                    "handler": handler,
                    "type": type,
                    "version": version
                },
                success: function(data, status, xhr){
                    var pattern = /^[\d]+$/;
                    var str = (data || "");
                    var cur = 0;

                    if(pattern.test(str)){
                        cur = parseInt(str, 10);
                    }

                    if(cur != this.version){
                        var d = new Date();
                        d.setFullYear(d.getFullYear() + 1);

                        Persistent.set("errcode_" + type + "_version", cur, d.getTime());

                        ErrorCode.load(this.type, this.handler, true);
                    }else{
                        ErrorCode.load(this.type, this.handler, false);
                    }
                },
                error: function(xhr, errorType, error){
                    ErrorCode.load(this.type, this.handler, true);
                }
            });
        },
        load: function(type, handler, isRefresh){
            var cache = Persistent.get("errcode_" + type) || null;

            if(true === isRefresh || (true !== isRefresh && null === cache)){
                var _command = {
                    "errcode": {
                        "request": {

                        }
                    }
                };

                _command["errcode"]["request"][type] = {
                    "url": ErrorCode.getConfigurePath() + type + ".json",
                    "data": "r=" + Util.GUID32(),
                    "method": "GET"
                };

                CMD.injectCommands(_command);
                CMD.exec("errcode.request." + type, null, {
                    "context": {
                        "showLoading": false,
                        "handler": handler,
                        "type": type
                    },
                    success: function(data, status, xhr){
                        var d = new Date();
                        d.setFullYear(d.getFullYear() + 1);

                        Persistent.set("errcode_" + type + "_version", data.version, d.getTime());
                        Persistent.set("errcode_" + type, data, d.getTime());

                        Util.execHandler(handler, [data]);
                    },
                    error: function(xhr, errorType, error){
                        //@todo 
                        console.warn("request errorcode(" + this.type + ") config failed.");
                    }
                });
            }else{
                Util.execHandler(handler, [cache]);
            }
        },
        message: function(type, code, def, lang){
            var cache = Persistent.get("errcode_" + type) || null;

            if(!lang && ("iLang" in window)){
                lang = iLang.language();
            }
            
            if(null !== cache){
                var obj = cache;
                if(lang){
                    obj = obj[lang];
                }

                return obj[code] || def;
            }else{
                return def;
            }
        }
    };

    module.exports = ErrorCode;
});