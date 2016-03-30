/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 微信模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.1
 */
;define(function WeiXinAPI(require, exports, module){
    var wx = require("http://res.wx.qq.com/open/js/jweixin-1.0.0.js");
    $.Util = require("mod/se/util");

    /**
    <script type="text/template" name="wx">
    shareTitle=分享标题;
    shareContent=分享描述;
    shareURL=分享内容的链接地址;
    shareImage=分享图标;
    shareImageWidth=300;
    shareImageHeight=300;
    appId=应用ID，为空即可;
    shareClick=分享成功时的统计地址，如果为空不统计;
    shareRedirectURL=分享后的跳转地址，如果为空不跳转;
    allow=是否允许分享，1：允许，0：禁止;
    </script>
    **/

    var _MetaData = {
        templates: null,
        templateIndex: 0,
        templateNode: null,
        template: function(name){
            var tpls = $('script[name="' + (name || "wx") + '"]');
            var size = tpls.length;

            _MetaData.templates = tpls;

            if(size < 2){
                _MetaData.templateIndex = 0;
                _MetaData.templateNode = tpls;
            }else{
                _MetaData.templateIndex = Math.floor(Math.random() * size);
                _MetaData.templateNode = $(tpls.get(_MetaData.templateIndex));
            }

            return _MetaData.templateNode;
        },
        parse: function(name){
            var conf = _MetaData.template(name);
            var o = {};
            var content = conf.html() || "";
            var pattern = /([^\s=]+)[\s]*=[\s]*(([^;]*)(;*(?![\n\r])([^;]*))*)[\s]*;/gi;
            var matcher = null;
            var key = null;
            var value = null;

            pattern.lastIndex = 0;

            while(null !== (matcher = pattern.exec(content))){
                key = matcher[1];
                value = matcher[2] || "";

                if(!key){continue;}
                o[key] = value.replace(/[\r\n]+/g, "");
            }

            return o;
        },
        update: function(options, name){
            var conf = _MetaData.templateNode ? _MetaData.templateNode : _MetaData.template(name);
            var metaQQItemProp = {
                "shareTitle": "name",
                "shareContent": "description",
                "shareImage": "image",
                "shareImageWidth": null,
                "shareImageHeight": null,
                "shareURL": null,
                "appId": null,
                "shareClick": null,
                "shareRedirectURL": null,
                "allow": null
            };
            var metaItemPropNode = null;
            var metaItemPropName = null;
            var obj = _MetaData.parse(name);

            for(var key in options){
                if(options.hasOwnProperty(key)){
                    metaItemPropName = metaQQItemProp[key];

                    if(metaItemPropName){
                        metaItemPropNode = $('meta[itemprop="' + metaItemPropName + '"]');

                        if(metaItemPropNode.length > 0){
                            metaItemPropNode.attr("content", options[key]);
                        }
                    }

                    obj[key] = options[key];
                }
            }

            var tmp = [];
            for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    tmp.push(key + "=" + obj[key] + ";");
                }
            }

            conf.html(tmp.join("\n"));

            return obj;
        },
        //list {}
        /*{
            allow: "1"
            appid: ""
            shareContent: "云场景 ;;;; - 描;述;;"
            shareImageHeight: "200"
            shareImage: "http://m.zuikuapp.com/newadmin/res/img/nopic150x150.jpg"
            shareImageWidth: "200"
            shareURL: "http://vip.zuikuapp.com/v/429182_0.html"
            shareClick: "http://click.zuiku.com/share.jsp?appId=429182"
            shareTitle: "云场景标题"
            shareRedirectUrl: ""
          }
        */
        random: function(list, name){
            var size = list.length;
            var index = Math.floor(Math.random() * size);
            var options = list[i];

            return _MetaData.update(options, name);
        }
    };

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

    window["WeiXinAPI"] = WeiXinAPI;

    module.exports = WeiXinAPI;
});