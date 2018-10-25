/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 分享
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.09
 */
;define(function(require, exports, module){
    var Util           = require("mod/se/util");
    var TemplateEngine = require("mod/se/template");

    var ShareTemplate = TemplateEngine.getTemplate("mod_openshare_eng", {
        "root": "openshare"
    });

    var GetShareAPI = function(){
        return {
            "qzone": {
                "type": "redirect",
                "url": 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey',
                "data": 'url=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.link)%>&desc=<%=encodeURIComponent(openshare.description)%>&summary=<%=encodeURIComponent(openshare.summary)%>&site=<%=encodeURIComponent(openshare.source)%>'
            },
            "qq": {
                "type": "redirect",
                "url": 'http://connect.qq.com/widget/shareqq/index.html',
                "data": 'url=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.title)%>&source=<%=encodeURIComponent(openshare.source)%>&desc=<%=encodeURIComponent(openshare.description)%>'
            },
            "tqq": {
                "type": "redirect",
                "url": 'http://share.v.t.qq.com/index.php',
                "data": 'c=share&a=index&title=<%=encodeURIComponent(openshare.description)%>&url=<%=encodeURIComponent(openshare.link)%>&pic=<%=encodeURIComponent(openshare.image)%>'
            },
            "weibo": {
                "type": "redirect",
                "url": 'http://service.weibo.com/share/share.php',
                "data": 'url=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.description)%>&pic=<%=encodeURIComponent(openshare.image)%>&appkey=<%=encodeURIComponent(openshare.appkey)%>'
            },
            "douban": {
                "type": "redirect",
                "url": 'http://shuo.douban.com/!service/share',
                "data": 'href=<%=encodeURIComponent(openshare.link)%>&name=<%=encodeURIComponent(openshare.title)%>&text=<%=encodeURIComponent(openshare.description)%>&image=<%=encodeURIComponent(openshare.image)%>&starid=0&aid=0&style=11'
            },
            "diandian": {
                "type": "redirect",
                "url": 'http://www.diandian.com/share',
                "data": 'lo=<%=encodeURIComponent(openshare.link)%>&ti=<%=encodeURIComponent(openshare.description)%>&type=link'
            },
            "xing": {
                "type": "redirect",
                "url": 'http://widget.renren.com/dialog/share',
                "data": 'resourceUrl=<%=encodeURIComponent(openshare.link)%>&srcUrl=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.title)%>&description=<%=encodeURIComponent(openshare.description)%>'
            },
            "renren": {
                "type": "redirect",
                "url": 'https://www.xing.com/app/user',
                "data": 'op=share&url=<%=encodeURIComponent(openshare.link)%>'
            },
            "linkedin": {
                "type": "redirect",
                "url": 'http://www.linkedin.com/shareArticle',
                "data": 'mini=true&title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>&summary=<%=encodeURIComponent(openshare.summary)%>&source=<%=encodeURIComponent(openshare.source)%>'
            },
            "facebook": {
                "type": "redirect",
                "url": 'https://www.facebook.com/sharer/sharer.php',
                "data": 'u=<%=encodeURIComponent(openshare.link)%>'
            },
            "twitter": {
                "type": "redirect",
                "url": 'https://twitter.com/intent/tweet',
                "data": 'text=<%=encodeURIComponent(openshare.description)%>&url=<%=encodeURIComponent(openshare.link)%>&via=<%=openshare.usrid || openshare.source%>&hashtags=<%=encodeURIComponent(openshare.hash)%>'
            },
            "google": {
                "type": "redirect",
                "url": 'https://plus.google.com/share',
                "data": 'url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.description)%>&hl=<%=encodeURIComponent(openshare.lang)%>'
            },
            "googlebookmarks": {
                "type": "redirect",
                "url": 'https://www.google.com/bookmarks/mark',
                "data": 'op=edit&bkmk<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.title)%>&annotation=<%=encodeURIComponent(openshare.description)%>&labels=<%=encodeURIComponent(openshare.hash)%>'
            },
            "reddit": {
                "type": "redirect",
                "url": "https://reddit.com/submit",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.title)%>"
            },
            "tumblr": {
                "type": "redirect",
                "url": "https://www.tumblr.com/widgets/share/tool",
                "data": "canonicalUrl=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.title)%>&caption=<%=encodeURIComponent(openshare.description)%>&tags=<%=encodeURIComponent(openshare.hash)%>"
            },
            "pinterest": {
                "type": "redirect",
                "url": "http://pinterest.com/pin/create/link/",
                "data": "url=<%=encodeURIComponent(openshare.link)%>"
            },
            "pinterestbutton": {
                "type": "redirect",
                "url": "http://pinterest.com/pin/create/button/",
                "data": "url=<%=encodeURIComponent(openshare.link)%>"
            },
            "blogger": {
                "type": "redirect",
                "url": "https://www.blogger.com/blog-this.g",
                "data": "u=<%=encodeURIComponent(openshare.link)%>&n=<%=encodeURIComponent(openshare.title)%>&t=<%=encodeURIComponent(openshare.description)%>"
            },
            "livejournal": {
                "type": "redirect",
                "url": "http://www.livejournal.com/update.bml",
                "data": "event=<%=encodeURIComponent(openshare.link)%>&subject=<%=encodeURIComponent(openshare.title)%>"
            },
            "evernote": {
                "type": "redirect",
                "url": "http://www.evernote.com/clip.action",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&title=<%=encodeURIComponent(openshare.title)%>"
            },
            "addthis": {
                "type": "redirect",
                "url": "http://www.addthis.com/bookmark.php",
                "data": "url=<%=encodeURIComponent(openshare.link)%>"
            },
            "getpocket": {
                "type": "redirect",
                "url": "https://getpocket.com/edit",
                "data": "url=<%=encodeURIComponent(openshare.link)%>"
            },
            "hackernews": {
                "type": "redirect",
                "url": "https://news.ycombinator.com/submitlink",
                "data": "u=<%=encodeURIComponent(openshare.link)%>&t=<%=encodeURIComponent(openshare.title)%>"
            },
            "stumbleupon": {
                "type": "redirect",
                "url": "http://www.stumbleupon.com/submit",
                "data": "url=<%=encodeURIComponent(openshare.link)%>"
            },
            "digg": {
                "type": "redirect",
                "url": "http://digg.com/submit",
                "data": "url=<%=encodeURIComponent(openshare.link)%>"
            },
            "buffer": {
                "type": "redirect",
                "url": "https://buffer.com/add",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.title)%>"
            },
            "flipboard": {
                "type": "redirect",
                "url": "https://share.flipboard.com/bookmarklet/popout",
                "data": "v=2&title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>"
            },
            "instapaper": {
                "type": "redirect",
                "url": "http://www.instapaper.com/edit",
                "data": "description=<%=encodeURIComponent(openshare.description)%>&title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>"
            },
            "surfingbird": {
                "type": "redirect",
                "url": "http://surfingbird.ru/share",
                "data": "description=<%=encodeURIComponent(openshare.description)%>&title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>&screenshot=<%=encodeURIComponent(openshare.image)%>"
            },
            "flattr": {
                "type": "redirect",
                "url": "https://flattr.com/submit/auto",
                "data": "hidden=HIDDEN&description=<%=encodeURIComponent(openshare.description)%>&title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>&language=<%=encodeURIComponent(openshare.lang)%>&tags=<%=encodeURIComponent(openshare.hash)%>&category=<%=encodeURIComponent(openshare.category)%>&user_id=<%=openshare.usrid || openshare.source%>"
            },
            "diaspora": {
                "type": "redirect",
                "url": "https://share.diasporafoundation.org/",
                "data": "title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>"
            },
            "vk": {
                "type": "redirect",
                "url": "http://vk.com/share.php",
                "data": "title=<%=encodeURIComponent(openshare.title)%>&url=<%=encodeURIComponent(openshare.link)%>&comment=<%=encodeURIComponent(openshare.description)%>"
            },
            "okru": {
                "type": "redirect",
                "url": "https://connect.ok.ru/dk",
                "data": "st.cmd=WidgetSharePreview&st.shareUrl=<%=encodeURIComponent(openshare.link)%>"
            },
            "threema": {
                "type": "redirect",
                "url": "threema://compose",
                "data": "text=<%=encodeURIComponent(openshare.link)%>&id=<%=encodeURIComponent(openshare.usrid)%>"
            },
            "sms": {
                "type": "redirect",
                "url": "sms:<%=encodeURIComponent(openshare.phone)%>",
                "data": "body=<%=encodeURIComponent(openshare.description)%>"
            },
            "lineit": {
                "type": "redirect",
                "url": "https://lineit.line.me/share/ui",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.description)%>"
            },
            "line": {
                "type": "redirect",
                "url": "https://social-plugins.line.me/lineit/share",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.description)%>"
            },
            "skype": {
                "type": "redirect",
                "url": "https://web.skype.com/share",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.description)%>"
            },
            "telegram": {
                "type": "redirect",
                "url": "https://telegram.me/share/url",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.title)%>&to=<%=encodeURIComponent(openshare.phone)%>"
            },
            "tgschema": {
                "type": "redirect",
                "url": "tg://msg",
                "data": "url=<%=encodeURIComponent(openshare.link)%>&text=<%=encodeURIComponent(openshare.title)%>&to=<%=encodeURIComponent(openshare.phone)%>"
            },
            "email": {
                "type": "redirect",
                "url": "mailto:<%=encodeURIComponent(openshare.email)%>",
                "data": "subject=<%=encodeURIComponent(openshare.title)%>&body=<%=encodeURIComponent(openshare.description)%>"
            },
            "gmail": {
                "type": "redirect",
                "url": "https://mail.google.com/mail/",
                "data": "view=cm&to=<%=encodeURIComponent(openshare.email)%>&su=<%=encodeURIComponent(openshare.title)%>&body=<%=encodeURIComponent(openshare.description)%>&bcc=<%=encodeURIComponent(openshare.email)%>&cc=<%=encodeURIComponent(openshare.email)%>"
            },
            "yahoo": {
                "type": "redirect",
                "url": "http://compose.mail.yahoo.com/",
                "data": "to=<%=encodeURIComponent(openshare.email)%>&subject=<%=encodeURIComponent(openshare.title)%>&body=<%=encodeURIComponent(openshare.description)%>"
            },
            "wechat": {
                "type": "native",
                "url": '',
                "data": ''
            },
            "timeline": {
                "type": "native",
                "url": '',
                "data": ''
            },
            "mqq": {
                "type": "native",
                "url": '',
                "data": ''
            }
        };
    };

    var DefineShareDataStruct = function(){
        var struct = {
            "type": "",                              //类型，如: wx, timeline, weibo, qq, qzone等
            "text": "",                              //文本标签，如：微信好友，朋友圈，微博，QQ好友，QZone等
            "name": "",                              //应用名称，如：微信，手机QQ，微博
            "sign": "",                              //应用签名串
            "appid": "",                             //应用ID
            "appkey": "",                            //应用key
            "title": "ogp::og:title",                //分享标题
            "description": "ogp::og:description",    //分享描述
            "link": "ogp::og:url",                   //分享跳转链接
            "image": "ogp::og:image",                //分享图片
            "source": "ogp::og:site_name",           //分享来源
            "summary": "ogp::og:description",        //分享摘要
            "lang": "ogp::og:locale",                //分享语言环境
            "hash": "",                              //分享hash，类似标签
            "category": "",                          //分享到哪个分类下
            "usrid": "",                             //分享用户ID
            "email": "",                             //email地址
            "phone": "",                             //手机号码
            "external": "",                          //分享的callback 虚拟schema回调
            "target": ""                             //分享触发目标窗口，如：_blank, _self
        };

        return struct;
    };

    var OpenShareSchema = {
        "schema": "openshare",
        "share": function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];
            var shareType = args[1];
            var shareDataKey = args[2] || "";

            var openShare = OpenShare.getOpenShare(name);

            if(openShare){
                openShare.share(shareType, shareDataKey);
            }
        }
    };

    var OpenShare = function(name){
        this.name = name;
        this.apis = GetShareAPI();
        this.basicShareData = this.og(DefineShareDataStruct());
        this.shareData = {};
        this.namespace = "openshare";
    };

    OpenShare.prototype = {
        /**
         * 解析值
         * @param  {[type]} value [description]
         * @param  {[type]} type  [description]
         * @return {[type]}       [description]
         */
        ogv: function(value, type){
            var prefix = "ogp::";
            var cut = value.substring(0, prefix.length);

            if(prefix !== cut){
                return value;
            }

            var property = value.substring(prefix.length);
            var meta = $('meta' + (type ? '[name="' + type + '"]' : '') + '[property="' + property + '"]');

            if(meta.length == 0){
                meta = $('meta[property="' + property + '"]');
            }

            var content = meta.attr("content") || "";

            return content || value;
        },
        /**
         * Open Graph Protocol 标签解析
         * @param  {[type]} obj  [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        og: function(obj, type){
            var newObj = {};

            for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    newObj[key] = this.ogv(obj[key] || "", type || null);
                }
            }

            return newObj;
        },
        /**
         * 添加分享API，如果存在将会覆盖
         * @param {[type]} type [description]
         * @param {[type]} opts [description]
         */
        addShareAPI: function(type, opts){
            this.apis[type] = {
                "type": opts.type || "",
                "url": opts.url || "",
                "data": opts.data || ""
            };
        },
        /**
         * 获取分享API
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        getShareAPI: function(type){
            var api = null;

            if(type in this.apis){
                api = $.extend({}, this.apis[type]);
            }
            
            return api;
        },
        /**
         * 定义全局基本分享数据
         * @return {[type]} [description]
         */
        defineShareData: function(data){
            var struct = this.basicShareData;

            for(var dataKey in struct){
                if(struct.hasOwnProperty(dataKey)){
                    struct[dataKey] = data[dataKey] || "";
                }
            }

            this.basicShareData = this.og(struct);
        },
        /**
         * 获取基础分享数据
         * @return {[type]} [description]
         */
        getBasicShareData: function(){
            return this.og($.extend({}, this.basicShareData));
        },
        /**
         * [putShareData description]
         * @param  {[type]} type [description]
         * @param  {[type]} data [description]
         * @param  {[type]} key  [description]
         * @return {[type]}      [description]
         */
        putShareData: function(type, data, key){
            var struct = DefineShareDataStruct();

            for(var dataKey in struct){
                if(struct.hasOwnProperty(dataKey)){
                    struct[dataKey] = data[dataKey] || "";
                }
            }

            struct = this.og(struct, type);

            if(!(type in this.shareData)){
                this.shareData[type] = {};
            }

            this.shareData[type][(key || this.namespace)] = struct;
        },
        /**
         * [getShareData description]
         * @param  {[type]} type [description]
         * @param  {[type]} key  [description]
         * @return {[type]}      [description]
         */
        getShareData: function(type, key){
            var data = null;
            var sd = this.shareData[type] || {};

            data = $.extend({}, this.getBasicShareData(), sd[(key || this.namespace)] || null);

            return this.og(data, type);
        },
        /**
         * [share description]
         * @param  {[type]} type [description]
         * @param  {[type]} key  [description]
         * @return {[type]}      [description]
         */
        share: function(type, key){
            var api = this.getShareAPI(type);
            var data = this.getShareData(type, key || this.namespace);

            if(!api){
                console.warn("not fount share api(" + type + ")");
                return false;
            }

            if(!data){
                console.warn("the share data not configure");
                return false;
            }

            var apiUrl = api.url;
            var apiData = api.data;
            var shareFullURL = "";

            apiUrl = ShareTemplate.render(true, apiUrl, data, {
                callback: function(ret){
                    return ret.result;
                }
            }).local;

            apiData = ShareTemplate.render(true, apiData, data, {
                callback: function(ret){
                    return ret.result;
                }
            }).local;

            shareFullURL = apiUrl + (apiUrl.indexOf("?") == -1 ? "?" : "&") + apiData;

            if(data.external){
                Util.requestExternal(data.external, [{
                    "url": apiUrl,
                    "data": apiData,
                    "api": shareFullURL,
                    "type": type,
                    "dataKey": key,
                    "shareData": data
                }]);
            }else{
                window.open(shareFullURL, data.target);
            }
        }
    };

    OpenShare.Cache = {};

    OpenShare.newInstance = function(name){
        var os = OpenShare.Cache[name] || (OpenShare.Cache[name] = new OpenShare(name));

        return {
            "name": name,
            addShareAPI: function(type, opts){
                os.addShareAPI(type, opts);

                return this;
            },
            getShareAPI: function(type){
                return os.getShareAPI(type);
            },
            defineShareData: function(data){
                os.defineShareData(data);

                return this;
            },
            getBasicShareData: function(){
                return os.getBasicShareData();
            },
            putShareData: function(type, data, key){
                os.putShareData(type, data, key);

                return this;
            },
            getShareData: function(type, key){
                return os.getShareData(type, key);
            },
            share: function(type, key){
                os.share(type, key);

                return this;
            }
        };
    };

    OpenShare.getOpenShare = function(name){
        if(name in OpenShare.Cache){
            return OpenShare.newInstance(name);
        }

        return null;
    };

    (function(){
        Util.source(OpenShareSchema);
    })();

    module.exports = {
        "version": "R18B0930",
        "newInstance": function(name){
            return OpenShare.newInstance(name);
        },
        "getOpenShare": function(name){
            return OpenShare.getOpenShare(name);
        }
    };
});