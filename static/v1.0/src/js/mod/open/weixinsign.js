/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 微信模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.11
 */
;define(function(require, exports, module){
    var WeiXinAPI          = require("mod/open/jsapi/weixinapi");
    var Util               = require("mod/se/util");
    var CMD                = require("mod/se/cmd");
    var Stat               = require("mod/se/stat");

    var RespTypes = CMD.ResponseTypes;

    var G_StatFlag = 0;

    var Env = (function(ua){
        var wx = /MicroMessenger\/(\d+\.\d+)/gi;
        var ret = wx.exec(ua);
        var ver = null != ret ? Number(ret[1]) : -1;

        return {
            "support": (ver > 0),
            "version": ver
        }
    })(navigator.userAgent);

    var log = function(msg){
        stat("?" + msg);
    };

    var stat = function(url){
        var img = new Image();
        img.src = url;
    };

    var WeiXinSign = (function(){
        var meta = WeiXinAPI.MetaData;
        var title = meta.shareTitle;
        var text = meta.descContent;
        var link = meta.lineLink;
        var imgUrl = meta.imgUrl;

        var allow = ("1" === meta.allow || "");

        var options = {
            "imgUrl" : imgUrl,
            "link" : link,
            "title" : title,
            "desc" : text,
            "success": function(){
                if(meta.shareClick){
                    stat(meta.shareClick);
                }

                if(meta.shareRedirectUrl){
                    location.href = meta.shareRedirectUrl;
                }

                Stat.send("share");
            }
        };

        var clone = function(obj, nobj){
            var o = {};

            for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    o[key] = obj[key];
                }
            }

            for(var key in nobj){
                if(nobj.hasOwnProperty(key)){
                    o[key] = nobj[key];
                }
            }

            return o;
        };

        var source_options = clone({}, options);

        var get_options = function(isSource){
            return true === isSource ? source_options : options;
        };
        var set_options = function(opts){
            options = opts;
        };
        var update_options = function(opts){
            for(var key in opts){
                if(opts.hasOwnProperty(key) && (key in options)){
                    options[key] = opts[key];
                }
            }
        };
        var get_allow = function(){
            return allow;
        };
        var set_allow = function(_allow){
            allow = _allow;
        };
        var register = function(signAPI, data){
            var url = document.URL;
            var signURL = encodeURIComponent(url.replace(/(#[\w\W]*)/, ""));

            var command = {
                "weixin": {
                    "bin": {
                        "sign": {
                            "url": signAPI || "/service/share/weixinsign", 
                            "data": data || "url=" + signURL, 
                            "method":"POST", 
                            "cross":false, 
                            "spa":false, 
                            "replace":false, 
                            "cache":"auto", 
                            "append":"auto", 
                            "dataType":RespTypes.J
                        }
                    }
                }
            };

            CMD.injectCommands(command);
        };
        var configure = function(data, debug){
            WeiXinAPI.configure({
                "debug": (debug || false),
                "appId": data.appId,
                "timestamp": data.timestamp,
                "nonceStr": data.nonceStr,
                "signature": data.signature,
                "jsApiList": [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'hideMenuItems',
                    'showMenuItems',
                    'getNetworkType',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'pauseVoice',
                    'stopVoice',
                    'onVoicePlayEnd',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'translateVoice',
                    'openLocation',
                    'getLocation',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard' 
                ]
            }).error({
                "callback": function(res) {
                    //调用微信接口失败
                    if(!G_StatFlag){
                        Stat.send("pv");
                        G_StatFlag = 1;
                    }
                }
            });

            return WeiXinAPI;
        };
        var APIMap = {
            api: {},
            put: function(name, handle){
                APIMap.api[name] = handle;
            },
            get: function(name){
                return (name in APIMap.api ? APIMap.api[name] : null);
            },
            remove: function(name){
                if(name in APIMap.api){
                    APIMap.api[name] = null;

                    delete APIMap.api[name];
                }
            },
            clear: function(){
                APIMap.api = {};
            },
            getItems: function(){
                return APIMap.api;
            },
            update: function(name, handle){
                var _handle = APIMap.get(name);

                if(_handle){
                    APIMap.put(name, clone(_handle, handle));
                }
            }
        };

        var set_default = function(opts){
            // for(var key in opts){
            //     alert(key + ": " + opts[key])
            // }
            APIMap.put("getNetworkType", {
                callback: function(name, opts){
                    var _opt = {
                        success: function(res){
                            var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi

                            Stat.setNetwork(networkType);

                            if(!G_StatFlag){
                                Stat.send("pv");
                                G_StatFlag = 1;
                            }
                        }
                    };

                    this.invoke(name, _opt);
                },
                args: [opts],
                context: WeiXinAPI
            });
            APIMap.put("showOptionMenu", {
                callback: function(name, opts, _allow){
                    if(true === _allow){
                        this.invoke(name, opts);
                    }
                },
                args: [{}, get_allow()],
                context: WeiXinAPI
            });
            APIMap.put("hideOptionMenu", {
                callback: function(name, opts, _allow){
                    if(true !== _allow){
                        this.invoke(name, opts);
                    }
                },
                args: [{}, get_allow()],
                context: WeiXinAPI
            });
            APIMap.put("onMenuShareTimeline", {
                callback: function(name, opts){
                    this.invoke(name, opts);
                },
                args: [opts],
                context: WeiXinAPI
            });
            APIMap.put("onMenuShareAppMessage", {
                callback: function(name, opts){
                    this.invoke(name, opts);
                },
                args: [opts],
                context: WeiXinAPI
            });
            APIMap.put("onMenuShareQQ", {
                callback: function(name, opts){
                    this.invoke(name, opts);
                },
                args: [opts],
                context: WeiXinAPI
            });
            APIMap.put("onMenuShareWeibo", {
                callback: function(name, opts){
                    this.invoke(name, opts);
                },
                args: [opts],
                context: WeiXinAPI
            });
            APIMap.put("onMenuShareQZone", {
                callback: function(name, opts){
                    this.invoke(name, opts);
                },
                args: [opts],
                context: WeiXinAPI
            });
        };

        var sign = function(code, debug){
            if(Env.support){
                set_default(get_options());
                CMD.exec("weixin.bin.sign", null, {
                    context: {
                        "showLoading": false,
                        "debug": (true === debug),
                        "code": String(code || "10")
                    },
                    success : function(data, status, xhr){
                        var result = String(data.code);
                        var msg = data.msg;

                        if(this.code === result){
                            configure(data, this.debug).success(APIMap.getItems());
                        }else{
                            WeiXinAPI.execErrorHandler();

                            //调用签名接口失败
                            if(!G_StatFlag){
                                Stat.send("pv");
                                G_StatFlag = 1;
                            }
                        }
                    },
                    error : function(xhr, errorType, error){
                        WeiXinAPI.execErrorHandler();
                        
                        if(!G_StatFlag){
                            Stat.send("pv");
                            G_StatFlag = 1;
                        }
                    }
                });
            }else{
                WeiXinAPI.execReadyHandler();
            }

            return Env.support;
        };

        return {
            "version": "R15B1211",
            "WeiXinAPI": WeiXinAPI,
            "MetaData": meta,
            "register": function(signAPI, data){
                register(signAPI, data);

                return this;
            },
            "sign": function(code, debug){
                return sign(code, debug);
            },
            "put": function(name, handle){
                APIMap.put(name, handle);

                return this;
            },
            "get": function(name){
                return APIMap.get(name);
            },
            "remove": function(name){
                APIMap.remove(name);

                return this;
            },
            "clear": function(){
                APIMap.clear();

                return this;
            },
            "getItems": function(){
                return APIMap.getItems();
            },
            "update": function(name, handle){
                APIMap.update(name, handle);

                return this;
            },
            "options": function(opts, update){
                if(opts){
                    if(true === opts){
                        return get_options(opts);
                    }else{
                        if(true === update){
                            update_options(opts);
                        }else{
                            set_options(opts);
                        }
                    }

                    return this;
                }else{
                    return get_options();
                }
            },
            "allow": function(bool){
                if(undefined === bool){
                    return allow;
                }else{
                    allow = bool;

                    return this;
                }
            },
            "flag": function(_flag){
                if(undefined === _flag){
                    return G_StatFlag;
                }else{
                    G_StatFlag = flag;

                    return this;
                }
            }
        };
    })();

    module.exports = WeiXinSign;
});