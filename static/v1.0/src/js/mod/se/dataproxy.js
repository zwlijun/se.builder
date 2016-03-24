/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 数据代理
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.1
 */
;define(function (require, exports, module){
    var CMD                 = require("mod/se/cmd");
    var Util                = require("mod/se/util");

    var _config = {
        "code": "retCode",                  //服务器返回用于判断是否成功的代码key，如：{"retCode": 0, "retMsg": "ok"}
        "msg": "retMsg",                    //服务器返回用于提示的信息key，如：{"retCode": 0, "retMsg": "ok"}
        "success": 0,                       //服务器返回的代码，对应code里的值，resp[_config["code"]] === _config["success"] ? 成功 : 失败
        "errorHandler": CMD.errorHandler    //错误提示处理回调
    };

    var ResponseProxy = {
        json: function(context, data, handler, exception, conf){
            exception = exception || {};
            conf = conf || {};

            var errorHandler = (("errorHandler" in conf) ? conf["errorHandler"] : _config["errorHandler"]);

            if(data){
                var codeKey = conf.code || _config.code;
                var msgKey = conf.msg || _config.msg;

                var code = data[codeKey];
                var msg = data[msgKey];

                var success = (("success" in conf) ? conf.success : _config.success);

                if(success === code){
                    delete data[codeKey];
                    delete data[msgKey];

                    Util.execAfterMergerHandler(handler, [context, data, msg]);
                }else{
                    if(false !== exception.tips){
                        CMD.fireError(code || "0x02", msg || "系统繁忙，请稍候再试", errorHandler);
                    }

                    if(exception.handle){
                        Util.execAfterMergerHandler(exception.handle, [context, code, msg]);
                    }
                }
            }else{
                if(false !== exception.tips){
                    CMD.fireError("0x01", "服务器返回数据失败", errorHandler);
                }

                if(exception.handle){
                    Util.execAfterMergerHandler(exception.handle, [context, -1, "服务器返回数据失败"]);
                }
            }
        },
        html: function(context, data, handler){
            if(data){
                Util.execAfterMergerHandler(handler, [context, data]);
            }else{
                CMD.fireError("0x03", "获取模板数据异常", _config["errorHandler"]);
            }
        }
    }; 

    var _DataManage = {
        MEMCACH: {},
        put: function(type, key, data){
            if(!(type in _DataManage.MEMCACH)){
                _DataManage.MEMCACH[type] = {};
                _DataManage.MEMCACH[type][key] = data;
            }else{
                 _DataManage.MEMCACH[type][key] = data;
            }

            // console.info("type: " + type + "; key: " + key);
            // console.info(_DataManage.MEMCACH);
        },
        get: function(type, key){
            if(undefined === type){
                return _DataManage.MEMCACH;
            }
            if(!(type in _DataManage.MEMCACH)){
                return null;
            }

            if(undefined === key || "" === key){
                return _DataManage.MEMCACH[type];
            }else{
                if(!(key in _DataManage.MEMCACH[type])){
                    return null;
                }

                return _DataManage.MEMCACH[type][key];
            }
        },
        remove: function(type, key){
            var data = _DataManage.get(type, key);

            if(null !== data){
                if(undefined === key || "" === key){
                    delete _DataManage.MEMCACH[type];
                }else{
                    delete _DataManage.MEMCACH[type][key];
                }
            }
        },
        update: function(type, key, data, isCreateNew){
            var cache = _DataManage.get(type, key);

            if(null === cache && true === isCreateNew){
                _DataManage.put(type, key, data);
            }else{
                cache = $.extend(true, {}, cache, data);

                _DataManage.put(type, key, cache);
            }
        },
        clone: function(flag){
            if(true === flag){
                return $.extend(true, {}, _DataManage.MEMCACH);
            }else{
                return $.extend({}, _DataManage.MEMCACH);
            }
        }
    };

    module.exports = {
        "version": "R16B0104",
        DataCache: {
            put: function(type, key, data){
                _DataManage.put(type, key, data);
            },
            get: function(type, key){
                return _DataManage.get(type, key);
            },
            remove: function(type, key){
                _DataManage.remove(type, key);
            },
            update: function(type, key, data, isCreateNew){
                _DataManage.update(type, key, data, isCreateNew);
            },
            clone: function(flag){
                return _DataManage.clone();
            }
        },
        ResponseProxy: {
            conf: function(){
                var args = arguments;
                var size = args.length;

                if(0 === size){
                    return _config;
                }else if(1 === size){
                    var arg = args[0];

                    if(Object.prototype.toString.call(arg) == "[object Object]"){
                        _config = $.extend(true, _config, arg);
                    }else{
                        if(arg in _config){
                            return _config[arg];
                        }
                    }

                    return null;
                }else if(2 === size){
                    var key = args[0];
                    var value = args[1];

                    _config[key] = value;
                }
            },
            json: function(context, data, handler, exception, conf){
                ResponseProxy.json(context, data, handler, exception, conf);
            },
            html: function(context, data, handler){
                ResponseProxy.html(context, data, handler);
            }
        }
    };
});