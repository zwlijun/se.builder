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

    var ErrorTypes = CMD.ErrorTypes;

    var _config = {
        "code": "retCode",                  //服务器返回用于判断是否成功的代码key，如：{"retCode": 0, "retMsg": "ok"}
        "msg": "retMsg",                    //服务器返回用于提示的信息key，如：{"retCode": 0, "retMsg": "ok"}
        "success": 0,                       //服务器返回的代码，对应code里的值，resp[_config["code"]] === _config["success"] ? 成功 : 失败
        "errorHandler": CMD.errorHandler    //错误提示处理回调
    };

    function MatchErrorHandler(code, errorMap){
        var CONST_UNIVERSAL_MATCH = "*";

        code = code + "";
        errorMap = errorMap || null;

        if(!errorMap){
            return null;
        }
        //先匹配code，如果有就直接返回
        if(code in errorMap){
            return errorMap[code] || null;
        }
        //糊模匹配
        for(var key in errorMap){
            if(errorMap.hasOwnProperty(key)){
                if(key.charAt(0) === "~"){
                    key = key.substring(1);
                    key = key.replace(/%/g, "[a-z0-9]+");

                    var pattern = new RegExp(key, "gi");
                    pattern.lastIndex = 0;

                    if(pattern.test(code)){
                        return errorMap[key] || null;
                    }
                }
            }
        }
        //通用匹配
        if(CONST_UNIVERSAL_MATCH in errorMap){
            return errorMap[CONST_UNIVERSAL_MATCH] || null;
        }
        
        return null;
    };

    var ResponseProxy = {
        /**
         * JSON数据响应
         * @param  Object context    上下文(this指针)
         * @param  Object data       服务器返回的JSON数据
         * @param  Handler handler   服务器成功后的回调函数  
         *         {
         *             Function callback 
         *             Object context
         *             Array args
         *         }
         * @param  Object exception  错误或异常情况 
         *         {
         *             Boolean tips         false - 仅仅只执行errorMap配置的回调  true - 如果有配置errorMap，那么执行errorMap回调，否则直接提示
         *             Handler handle
         *             Object errorMap      错误码回调，示例：
         *                                  errorMap => {
         *                                      "noresponse": {
         *                                          callback: function(ctx, code, msg, resp){
         *                                               //@TODO   
         *                                          }
         *                                      }
         *                                      "20100001000": {
         *                                          callback: function(ctx, code, msg, resp){
         *                                              //@TODO
         *                                          },
         *                                          args: [],
         *                                          context: null
         *                                      },
         *                                      "*": {
         *                                          callback: function(ctx, code, msg, resp){
         *                                              //@TODO
         *                                          }
         *                                      },
         *                                      "~"
         *                                  }      
         *         }
         * @param  Object conf       数据判断条件配置 @see _config
         */
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

                    Util.execHandler(handler, [context, data, msg]);
                }else{
                    var errHandler = MatchErrorHandler(code, exception.errorMap);

                    if(errHandler){
                        Util.execHandler(errHandler, [context, code, msg, data]);
                    }else{
                        CMD.fireError(code || "0x02", msg || "系统繁忙，请稍候再试", ErrorTypes.ERROR, errorHandler, false === exception.tips);
                    }

                    if(exception.handle){
                        Util.execHandler(exception.handle, [context, code, msg, data]);
                    }
                }
            }else{
                var errHandler = MatchErrorHandler("noresponse", exception.errorMap);
                
                if(errHandler){
                    Util.execHandler(errHandler, [context, -1, "服务器返回数据失败", null]);
                }else{
                    CMD.fireError("0x01", "服务器返回数据失败", ErrorTypes.ERROR, errorHandler, false === exception.tips);
                }

                if(exception.handle){
                    Util.execHandler(exception.handle, [context, -1, "服务器返回数据失败", null]);
                }
            }
        },
        html: function(context, data, handler){
            if(data){
                Util.execHandler(handler, [context, data]);
            }else{
                CMD.fireError("0x03", "获取模板数据异常", ErrorTypes.ERROR, _config["errorHandler"]);
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
        "version": "R17B0817",
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