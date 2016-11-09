/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 微信模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.11
 */
;define(function(require, exports, module){
    var WeiXinAPI          = require("mod/open/jsapi/weixinapi");
    var Util               = require("mod/se/util");
    var CMD                = require("mod/se/cmd");
    var Stat               = require("mod/se/stat");

    var MetaData  = WeiXinAPI.MetaData;

    var G_StatFlag = 0;
    var G = window;
    var D = document;

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

    //---------------------------
    G["GetJSAPITemplateData"] = function(name, forceIndex){
        var index = MetaData.getIndex();
        var meta = MetaData.random(name || "wechat", (undefined !== forceIndex ? forceIndex : (index < 0 ? undefined : index)));

        if(!meta){
            return null;
        }

        var title = meta.options("title");
        var text = meta.options("description");
        var link = meta.options("link");
        var imgUrl = meta.options("image");

        var options = {
            "imgUrl" : imgUrl,
            "link" : link,
            "title" : title,
            "desc" : text,
            "success": function(){
                if(meta.options("shareStatURL")){
                    stat(meta.options("shareStatURL"));
                }

                if(meta.options("shareRedirectURL")){
                    location.href = meta.options("shareRedirectURL");
                }

                Stat.send("share");
            }
        };

        return {
            "options": options,
            "meta": meta
        };
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

    var set_default = function(){
        APIMap.put("getNetworkType", {
            callback: function(name){
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
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("showOptionMenu", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();
                if(!data){
                    return ;
                }
                var opts = data.options;
                var meta = data.meta;

                if(meta.options("allow")){
                    this.invoke(name, opts);
                }
            },
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("hideOptionMenu", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();
                if(!data){
                    return ;
                }
                var opts = data.options;
                var meta = data.meta;

                if(!meta.options("allow")){
                    this.invoke(name, opts);
                }
            },
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("onMenuShareTimeline", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();
                
                if(!data){
                    return ;
                }
                var opts = data.options;

                this.invoke(name, opts);
            },
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("onMenuShareAppMessage", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();

                if(!data){
                    return ;
                }
                var opts = data.options;

                this.invoke(name, opts);
            },
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("onMenuShareQQ", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();
                if(!data){
                    return ;
                }
                var opts = data.options;

                this.invoke(name, opts);
            },
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("onMenuShareWeibo", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();
                if(!data){
                    return ;
                }
                var opts = data.options;

                this.invoke(name, opts);
            },
            args: [],
            context: WeiXinAPI
        });
        APIMap.put("onMenuShareQZone", {
            callback: function(name){
                var data = G["GetJSAPITemplateData"]();
                if(!data){
                    return ;
                }
                var opts = data.options;

                this.invoke(name, opts);
            },
            args: [],
            context: WeiXinAPI
        });
    };
    var register = function(signAPI, data, _url){
        var url = _url || document.URL;
        var signURL = encodeURIComponent(url.replace(/(#[\w\W]*)/, ""));

        var command = {
            "weixin": {
                "bin": {
                    "sign": {
                        "url": signAPI || "/service/share/weixinsign", 
                        "data": data || "url=" + signURL
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

    var sign = function(code, debug, onresponse){
        if(Env.support){
            MetaData.parse();
            set_default();
            CMD.exec("weixin.bin.sign", null, {
                context: {
                    "showLoading": false,
                    "debug": (true === debug),
                    "code": String(code || "10"),
                    "onresponse": onresponse || ({
                        callback: function(data){
                            if(data && ("forbidShare" in data) && (true === data.forbidShare || "true" == data.forbidShare)){
                                var apiData = G["GetJSAPITemplateData"]();

                                if(!apiData){
                                    return ;
                                }
                                var meta = apiData.meta;

                                meta.options("allow", false);
                            }
                        }
                    })
                },
                success : function(data, status, xhr){
                    var result = String(data.code || data.retCode);
                    var msg = data.msg || data.retMsg;

                    Util.execHandler(this.onresponse, [data]);

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

    module.exports = {
        "version": "R16B0330",
        "WeiXinAPI": WeiXinAPI,
        "MetaData": MetaData,
        "api": {
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
            }
        },
        available: function(){
            return (true === Env.support);
        },
        register: function(signAPI, data, _url){
            register(signAPI, data, _url);

            return this;
        },
        sign: function(code, debug, onresponse){
            sign(code, debug, onresponse);
            return this;
        }
    };
});