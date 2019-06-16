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
    var WeiXinJSSDK         = require("wxjssdk");
    var Util                = require("mod/se/util");
    var DataType            = require("mod/se/datatype");

    /*
    <meta itemprop="type" content="share" itemfor="share" desc="分享类型说明">
    <meta itemprop="text" content="通用" itemfor="share" desc="分享类型说明">
    <meta itemprop="title" content="" itemfor="share" desc="分享标题">
    <meta itemprop="image" content="" itemfor="share" desc="分享图标">
    <meta itemprop="link" content="" itemfor="share" desc="分享链接，为空时取当前URL">
    <meta itemprop="description" content="" itemfor="share" desc="分享描述">
    <meta itemprop="source" content="" itemfor="share" desc="分享来源">
    <meta itemprop="summary" content="" itemfor="share" desc="分享摘要">
    <meta itemprop="allow" content="" itemfor="share" desc="在微信下控制是否允许分享, 默认为 1， 0:禁止 1:允许">
    <meta itemprop="shareStatURL" content="" itemfor="share" desc="分享统计地址">
    <meta itemprop="shareRedirectURL" content="" itemfor="share" desc="分享后自动跳转地址">
    <meta itemprop="appId" content="" itemfor="share" desc="应用ID">
    <meta itemprop="appKey" content="" itemfor="share" desc="应用KEY">
    <meta itemprop="token" content="" itemfor="share" desc="应用TOKEN"> 
    <meta itemprop="pageId" content="" itemfor="share" desc="分享页面标识">
    */
    
    /**
     * meta标签配置Set
     *
     * @class      MetaSet (name)
     * @param      {Object}  options  配置项
     */
    var MetaSet = function(options){
        this.opts = $.extend({
            title: "",
            link: "",
            image: "",
            description: "",
            source: "",
            summary: "",
            allow: true,
            shareStatURL: "",
            shareRedirectURL: "",
            appId: "",
            appKey: "",
            token: "",
            type: "share",
            text: "通用",
            pageId: ""
        }, options || {});
    };

    MetaSet.prototype = {
        /**
         * 设置或获取配置选项
         *
         * param      {Any} <parameter_name> { parameter_description }
         * @return {Any}
         */
        options: function(){
            var args = arguments;
            var size = args.length;

            if(0 === size){
                return this.opts;
            }

            if(1 === size){
                if(DataType.isString(args[0])){
                    return this.opts[args[0]];
                }

                this.opts = $.extends(true, this.opts, args[0]);
            }else if(2 === size){
                this.opts[args[0]] = args[1];
            }
        },
        /**
         * 设置配置项
         * @param {String} key
         * @param {String} value
         */
        set: function(key, value){
            this.options(key, value);
        },
        /**
         * 获取配置项的值
         * @param  {String} key
         * @return {String} value
         */
        get: function(key){
            return this.options(key);
        }
    };

    /**
     * meta数据处理
     * @type {Object}
     */
    var MetaData = {
        Sets: null, //数据集
        index: -1,  //索引

        /**
         * 解析meta数据
         *
         * @return     {Object}  数据集
         */
        parse: function(){
            var metaList = $('meta[itemfor]');
            var size = metaList.length;
            var map = {};
            var meta = null;
            var itemfor = null;
            var itemprop = null;
            var itemcontent = null;

            var sets = {};
            var items = null;

            for(var i = 0; i < size; i++){
                meta = $(metaList[i]);

                itemfor = meta.attr("itemfor");
                itemprop = meta.attr("itemprop");
                itemcontent = meta.attr("content");

                if(!DataType.isObject(map[itemfor])){
                    map[itemfor] = {};
                }

                map[itemfor][itemprop] = itemcontent;
            }

            for(var key in map){
                if(map.hasOwnProperty(key)){
                    items = map[key];

                    if(!items.type){
                        items.type = key;
                    }

                    if(!items.text){
                        switch(items.type){
                            case "wechat":
                                items.text = "微信";
                            break;
                            case "mqq":
                                items.text = "手机QQ";
                            break;
                            case "qzone":
                                items.text = "QQ空间";
                            break;
                            case "weibo":
                                items.text = "微博";
                            break;
                            case "share":
                                items.text = "通用";
                            break;
                            default:
                                items.text = "其他";
                            break;
                        }
                    }

                    if(!items.title){
                        items.title = document.title || "";
                    }

                    if(!items.description){
                        items.description = items.title;
                    }

                    if(!items.link){
                        items.link = Util.removeURLHash();
                    }

                    if(DataType.isUndefined(items.allow)){
                        items.allow = true;
                    }else if(DataType.isEmptyString(items.allow)){
                        items.allow = true;
                    }else{
                        items.allow = !("0" == items.allow);
                    }

                    sets[key] = new MetaSet(items);
                }
            }

            MetaData.Sets = sets;

            return sets;
        },
        /**
         * 匹配数据
         * @param  {String} key 数据KEY
         * @return {Array} 匹配到的数据列表
         */
        find: function(key){
            var tmp = [];
            var ds = MetaData.Sets;

            if(!ds){
                return tmp;
            }

            for(var n in ds){
                if(ds.hasOwnProperty(n)){
                    if(key === n.substr(0, key.length)){
                        tmp.push(ds[n]);
                    }
                }
            }

            return tmp;
        },
        /**
         * 随机获取匹配到的数据集中的某一个
         * @param  {String} key    key
         * @param  {Number} index  索引，不指定为随机获取
         * @return {Object}        匹配到的数据对象
         */
        random: function(key, index){
            var list = MetaData.find(key);
            var size = list.length;
            var generic = MetaData.getMetaSet("share");
            var randomIndex = 0;

            if(0 === size && generic){
                list.push(generic);
            }
            size = list.length;

            if(size > 0){
                randomIndex = DataType.isNumber(index) ? index : Math.floor(Math.random() * size);
                MetaData.index = randomIndex;

                return list[randomIndex];
            }

            return null;
        },
        /**
         * @return {Number} 获取索引
         */
        getIndex: function(){
            return MetaData.index;
        },
        /**
         * 更新meta数据集数据
         * @param  {String}  key 
         * @param  {Any}     metaSetOptions  配置项
         * @return {[type]}
         */
        update: function(key, metaSetOptions){
            var metaSet = MetaData.getMetaSet(key);

            if(metaSet){
                metaSet.options(metaSetOptions);
            }
        },
        /**
         * 获取指定的meta数据集
         * @param  {String} key 
         * @return {Object} 数据集
         */
        getMetaSet: function(key){
            if(MetaData.Sets && (key in MetaData.Sets)){
                return MetaData.Sets[key];
            }

            return null;
        }
    };

    /**
     * 微信API二次封装
     * @type {Object}
     */
    var WeiXinAPI = {
        "version": "R17B0817",
        MetaData : MetaData,
        readyState: 0,
        _readyList: [],
        _errorList: [],
        _signErrorList: [],
        /**
         * 配置
         * @param  {Object} options  配置项，参考微信JSSDK的config方法
         * @return {WeiXinAPI}
         */
        configure: function(options){
            WeiXinJSSDK.config(options);

            return WeiXinAPI;
        },
        /**
         * 发生错误时的回调处理
         * @param  {Handler} handler 回调处理方法 {Function callback, Array args, Object context}
         * @return {WeiXinAPI}
         */
        error: function(handler){
            WeiXinJSSDK.error(function(res){
                WeiXinAPI.readyState = -1;
                try{
                    console.info(res);
                }catch(e){}

                Util.execHandler(handler, [res]);
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
            WeiXinJSSDK.ready(function(){
                WeiXinAPI.readyState = 1;
                WeiXinAPI.register(api);
                WeiXinAPI.execReadyHandler();
            });

            return WeiXinAPI;
        },
        /**
         * 添加错误回调句柄
         * @param {Handler} handler 回调处理方法 {Function callback, Array args, Object context}
         * @return {WeiXinAPI}
         */
        addErrorHandler: function(handler){
            WeiXinAPI._errorList.push(handler);

            return WeiXinAPI;
        },
        /**
         * 执行错误回调
         * @return {WeiXinAPI}
         */
        execErrorHandler: function(){
            var handler = WeiXinAPI._errorList.shift();

            if(handler && handler.callback){
                Util.execHandler(handler);

                WeiXinAPI.execErrorHandler();
            }

            return WeiXinAPI;
        },
        /**
         * 添加微信签名时的错误处理方法
         * @param {Handler} handler 回调处理方法 {Function callback, Array args, Object context}
         * @return {WeiXinAPI}
         */
        addSignErrorHandler: function(handler){
            WeiXinAPI._signErrorList.push(handler);

            return WeiXinAPI;
        },
        /**
         * 执行微信签名错误处理回调
         * @return {WeiXinAPI}
         */
        execSignErrorHandler: function(){
            var handler = WeiXinAPI._signErrorList.shift();

            if(handler && handler.callback){
                Util.execHandler(handler);

                WeiXinAPI.execSignErrorHandler();
            }

            return WeiXinAPI;
        },
        /**
         * 添加Ready处理方法
         * @param {Handler} handler 回调处理方法 {Function callback, Array args, Object context}
         * @return {WeiXinAPI}
         */
        addReadyHandler: function(handler){
            WeiXinAPI._readyList.push(handler);

            return WeiXinAPI;
        },
        /**
         * 执行Ready处理回调
         * @return {WeiXinAPI}
         */
        execReadyHandler: function(){
            var handler = WeiXinAPI._readyList.shift();

            if(handler && handler.callback){
                Util.execHandler(handler);

                WeiXinAPI.execReadyHandler();
            }

            return WeiXinAPI;
        },
        /**
         * 注册微信API
         * @param  {Object} api 
         * @return {WeiXinAPI}
         */
        register: function(api){
            for(var key in api){
                if(api.hasOwnProperty(key) && (key in WeiXinJSSDK)){
                    Util.execHandler(api[key], [key]);
                }
            }

            return WeiXinAPI;
        },
        /**
         * 调用微信API
         * @param  {String} name       微信API的名字
         * @param  {Object} options    选项
         * @return {WeiXinAPI}
         */
        invoke: function(name, options){
            if(name in WeiXinJSSDK){
                if(1 === WeiXinAPI.readyState){
                    WeiXinJSSDK[name].apply(WeiXinJSSDK, [options]);
                }else if(0 === WeiXinAPI.readyState){
                    (function(n, o, c){
                        var fn = arguments.callee;

                        setTimeout(function(){
                            if(c < 2000){
                                c++;
                                if(1 === WeiXinAPI.readyState){
                                    WeiXinJSSDK[n].apply(WeiXinJSSDK, [o]);
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