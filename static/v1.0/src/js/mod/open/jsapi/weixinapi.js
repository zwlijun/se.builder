/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 微信模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.1
 */
;define(function WeiXinAPI(require, exports, module){
    var wx = require("http://res.wx.qq.com/open/js/jweixin-1.0.0.js");
    $.Util = require("mod/se/util");

    var _MetaNode = $('script[name="wx"]');
    var _MetaData = (function(){
        var items = null;
        var item = null;
        var splitIndex = -1;
        var o = {};
        var content = _MetaNode.html() || "";
        content = content.replace(/([\s ]*[\r\n]+[\s ]*)/g, "\n").replace(/\n$/, "");
        content = content.replace(/^([\s ]*\n+[\s ]*)|([\s ]*\n+[\s ]*)$/, "");
        items = content.split(/(;\n)/);

        for(var i = 0, j = items.length; i < j; i++){
            item = items[i];
            splitIndex = item.indexOf("=");
            o[item.substring(0, splitIndex).replace(/^([\s ]*)|([\s ]*)$/g, "")] = item.substring(splitIndex).replace(/^([\s ]*=[\s ]*)/g, "");
        }

        return o;
    })();

    var WeiXinAPI = {
        MetaData : _MetaData,
        readyState: 0,
        _readyList: [],
        _errorList: [],
        _signErrorList: [],
        configure: function(options){
            wx.config(options);

            return WeiXinAPI;
        },
        error: function(handler){
            wx.error(function(res){
                WeiXinAPI.readyState = -1;

                $.Util.execAfterMergerHandler(handler, [res]);
                WeiXinAPI.execSignErrorHandler();
            });

            return WeiXinAPI;
        },
        /**
         * 
         * @param Object api
         * @usage
         * {
         *     callback: function(name, options){
         *        this.invoke(name, options);
         *     },
         *     args: [options],
         *     context: WeiXinAPI
         * }
         */
        success: function(api){
            wx.ready(function(){
                WeiXinAPI.readyState = 1;
                WeiXinAPI.register(api);
                WeiXinAPI.execReadyHandler();
            });

            return WeiXinAPI;
        },
        addErrorHandler: function(handler){
            WeiXinAPI._errorList.push(handler);

            return WeiXinAPI;
        },
        execErrorHandler: function(){
            var handler = WeiXinAPI._errorList.shift();

            if(handler && handler.callback){
                $.Util.execHandler(handler);

                WeiXinAPI.execErrorHandler();
            }

            return WeiXinAPI;
        },
        addSignErrorHandler: function(handler){
            WeiXinAPI._signErrorList.push(handler);

            return WeiXinAPI;
        },
        execSignErrorHandler: function(){
            var handler = WeiXinAPI._signErrorList.shift();

            if(handler && handler.callback){
                $.Util.execHandler(handler);

                WeiXinAPI.execSignErrorHandler();
            }

            return WeiXinAPI;
        },
        addReadyHandler: function(handler){
            WeiXinAPI._readyList.push(handler);

            return WeiXinAPI;
        },
        execReadyHandler: function(){
            var handler = WeiXinAPI._readyList.shift();

            if(handler && handler.callback){
                $.Util.execHandler(handler);

                WeiXinAPI.execReadyHandler();
            }

            return WeiXinAPI;
        },
        register: function(api){
            for(var key in api){
                if(api.hasOwnProperty(key) && (key in wx)){
                    $.Util.execAfterMergerHandler(api[key], [key]);
                }
            }

            return WeiXinAPI;
        },
        invoke: function(name, options){
            if(name in wx){
                if(1 === WeiXinAPI.readyState){
                    wx[name].apply(wx, [options]);
                }else if(0 === WeiXinAPI.readyState){
                    (function(n, o, c){
                        var fn = arguments.callee;

                        setTimeout(function(){
                            if(c < 2000){
                                c++;
                                if(1 === WeiXinAPI.readyState){
                                    wx[n].apply(wx, [o]);
                                }else{
                                    fn.apply(null, [n, o, c]);
                                    fn = null;
                                }
                            }
                        }, 15);
                    })(name, options, 0);
                }
            }

            return WeiXinAPI;
        }
    };

    module.exports = WeiXinAPI;
});