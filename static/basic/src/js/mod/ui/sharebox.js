/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Share模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.4
 */
;define(function ShareBox(require, exports, module){
    var Util           = require("mod/se/util");
    var ActionSheet    = require("mod/ui/actionsheet");
    var TemplateEngine = require("mod/se/template");
    var Listener       = require("mod/se/listener");
    var HandleStack    = Listener.HandleStack;

    var ShareTemplate = TemplateEngine.getTemplate("mod_share_box", {
        "root": "sharebox"
    });

    var _html_mask = '<div class="mod-actionsheet mod-actionsheet-mask exit"></div>';
    var _html_sharebox_m = '' +
                           '<div class="mod-actionsheet mod-actionsheet-panel exit sheetbox mod-sharebox mod-sharebox-m" data-actionsheet="<%=sharebox.name%>">' +
                           '  <h4><%=sharebox.title%></h4>' +
                           '  <nav class="mod-grid grid4 flexbox middle left wrap sharegrid">' +
                           '  <%' +
                           '  var platforms = sharebox.platforms || [];' +
                           '  var size = platforms.length;' +
                           '  for(var i = 0; i < size; i++){' +
                           '    var platform = platforms[i];' +
                           '    var conf = [];' +
                           '    var value = null;' + 
                           '    conf.push("data-action-tap=\\\"sharebox://share/adaptor#" + sharebox.name + "\\\"");' +
                           '    for(var pf in platform){' +
                           '        if(platform.hasOwnProperty(pf)){' +
                           '            value = platform[pf];' +
                           '            conf.push("data-sharebox-" + pf + "=\\\"" + encodeURIComponent(value) + "\\\"");' +
                           '        }' +
                           '    }' +
                           '  %>' +
                           '    <a href="#none" <%=conf.join(" ")%>>' +
                           '      <cite class="ico-share-<%=platform.type%>"></cite>' +
                           '      <span><%=platform.text%></span>' +
                           '    </a>' +
                           '  <%}%>' +
                           '  </nav>' +
                           '  <div class="sharebox-cancel" data-action-tap="sharebox://share/cancel#<%=sharebox.name%>">取消</div>' +
                           '';

    var GetShareAPI = function(){
        return {
            "qzone": {
                "type": "redirect",
                "url": 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey',
                "data": 'url=<%=sharebox.link%>&title=<%=sharebox.link%>&desc=<%=sharebox.description%>&summary=<%=sharebox.summary%>&site=<%=sharebox.source%>'
            },
            "qq": {
                "type": "redirect",
                "url": 'http://connect.qq.com/widget/shareqq/index.html',
                "data": 'url=<%=sharebox.link%>&title=<%=sharebox.title%>&source=<%=sharebox.source%>&desc=<%=sharebox.description%>'
            },
            "tqq": {
                "type": "redirect",
                "url": 'http://share.v.t.qq.com/index.php',
                "data": 'c=share&a=index&title=<%=sharebox.description%>&url=<%=sharebox.link%>&pic=<%=sharebox.image%>'
            },
            "weibo": {
                "type": "redirect",
                "url": 'http://service.weibo.com/share/share.php',
                "data": 'url=<%=sharebox.link%>&title=<%=sharebox.description%>&pic=<%=sharebox.image%>&appkey=<%=sharebox.akey%>'
            },
            "douban": {
                "type": "redirect",
                "url": 'http://shuo.douban.com/!service/share',
                "data": 'href=<%=sharebox.link%>&name=<%=sharebox.title%>&text=<%=sharebox.description%>&image=<%=sharebox.image%>&starid=0&aid=0&style=11'
            },
            "diandian": {
                "type": "redirect",
                "url": 'http://www.diandian.com/share',
                "data": 'lo=<%=sharebox.link%>&ti=<%=sharebox.description%>&type=link'
            },
            "xing": {
                "type": "redirect",
                "url": 'http://widget.renren.com/dialog/share',
                "data": 'resourceUrl=<%=sharebox.link%>&srcUrl=<%=sharebox.link%>&title=<%=sharebox.title%>&description=<%=sharebox.description%>'
            },
            "renren": {
                "type": "redirect",
                "url": 'https://www.xing.com/app/user',
                "data": 'op=share&url=<%=sharebox.link%>'
            },
            "linkedin": {
                "type": "redirect",
                "url": 'http://www.linkedin.com/shareArticle',
                "data": 'mini=true&title=<%=sharebox.title%>&url=<%=sharebox.link%>&summary=<%=sharebox.summary%>&source=<%=sharebox.source%>'
            },
            "facebook": {
                "type": "redirect",
                "url": 'https://www.facebook.com/sharer/sharer.php',
                "data": 'u=<%=sharebox.link%>'
            },
            "twitter": {
                "type": "redirect",
                "url": 'https://twitter.com/intent/tweet',
                "data": 'text=<%=sharebox.description%>&url=<%=sharebox.link%>&via=<%=sharebox.usrid || sharebox.source%>&hashtags=<%=sharebox.hash%>'
            },
            "google": {
                "type": "redirect",
                "url": 'https://plus.google.com/share',
                "data": 'url=<%=sharebox.link%>&text=<%=sharebox.description%>&hl=<%=sharebox.lang%>'
            },
            "googlebookmarks": {
                "type": "redirect",
                "url": 'https://www.google.com/bookmarks/mark',
                "data": 'op=edit&bkmk<%=sharebox.link%>&title=<%=sharebox.title%>&annotation=<%=sharebox.description%>&labels=<%=sharebox.hash%>'
            },
            "reddit": {
                "type": "redirect",
                "url": "https://reddit.com/submit",
                "data": "url=<%=sharebox.link%>&title=<%=sharebox.title%>"
            },
            "tumblr": {
                "type": "redirect",
                "url": "https://www.tumblr.com/widgets/share/tool",
                "data": "canonicalUrl=<%=sharebox.link%>&title=<%=sharebox.title%>&caption=<%=sharebox.description%>&tags=<%=sharebox.hash%>"
            },
            "pinterest": {
                "type": "redirect",
                "url": "http://pinterest.com/pin/create/link/",
                "data": "url=<%=sharebox.link%>"
            },
            "pinterestbutton": {
                "type": "redirect",
                "url": "http://pinterest.com/pin/create/button/",
                "data": "url=<%=sharebox.link%>"
            },
            "blogger": {
                "type": "redirect",
                "url": "https://www.blogger.com/blog-this.g",
                "data": "u=<%=sharebox.link%>&n=<%=sharebox.title%>&t=<%=sharebox.description%>"
            },
            "livejournal": {
                "type": "redirect",
                "url": "http://www.livejournal.com/update.bml",
                "data": "event=<%=sharebox.link%>&subject=<%=sharebox.title%>"
            },
            "evernote": {
                "type": "redirect",
                "url": "http://www.evernote.com/clip.action",
                "data": "url=<%=sharebox.link%>&title=<%=sharebox.title%>"
            },
            "addthis": {
                "type": "redirect",
                "url": "http://www.addthis.com/bookmark.php",
                "data": "url=<%=sharebox.link%>"
            },
            "getpocket": {
                "type": "redirect",
                "url": "https://getpocket.com/edit",
                "data": "url=<%=sharebox.link%>"
            },
            "hackernews": {
                "type": "redirect",
                "url": "https://news.ycombinator.com/submitlink",
                "data": "u=<%=sharebox.link%>&t=<%=sharebox.title%>"
            },
            "stumbleupon": {
                "type": "redirect",
                "url": "http://www.stumbleupon.com/submit",
                "data": "url=<%=sharebox.link%>"
            },
            "digg": {
                "type": "redirect",
                "url": "http://digg.com/submit",
                "data": "url=<%=sharebox.link%>"
            },
            "buffer": {
                "type": "redirect",
                "url": "https://buffer.com/add",
                "data": "url=<%=sharebox.link%>&text=<%=sharebox.title%>"
            },
            "flipboard": {
                "type": "redirect",
                "url": "https://share.flipboard.com/bookmarklet/popout",
                "data": "v=2&title=<%=sharebox.title%>&url=<%=sharebox.link%>"
            },
            "instapaper": {
                "type": "redirect",
                "url": "http://www.instapaper.com/edit",
                "data": "description=<%=sharebox.description%>&title=<%=sharebox.title%>&url=<%=sharebox.link%>"
            },
            "surfingbird": {
                "type": "redirect",
                "url": "http://surfingbird.ru/share",
                "data": "description=<%=sharebox.description%>&title=<%=sharebox.title%>&url=<%=sharebox.link%>&screenshot=<%=sharebox.image%>"
            },
            "flattr": {
                "type": "redirect",
                "url": "https://flattr.com/submit/auto",
                "data": "hidden=HIDDEN&description=<%=sharebox.description%>&title=<%=sharebox.title%>&url=<%=sharebox.link%>&language=<%=sharebox.lang%>&tags=<%=sharebox.hash%>&category=<%=sharebox.category%>&user_id=<%=sharebox.usrid || sharebox.source%>"
            },
            "diaspora": {
                "type": "redirect",
                "url": "https://share.diasporafoundation.org/",
                "data": "title=<%=sharebox.title%>&url=<%=sharebox.link%>"
            },
            "vk": {
                "type": "redirect",
                "url": "http://vk.com/share.php",
                "data": "title=<%=sharebox.title%>&url=<%=sharebox.link%>&comment=<%=sharebox.description%>"
            },
            "okru": {
                "type": "redirect",
                "url": "https://connect.ok.ru/dk",
                "data": "st.cmd=WidgetSharePreview&st.shareUrl=<%=sharebox.link%>"
            },
            "threema": {
                "type": "redirect",
                "url": "threema://compose",
                "data": "text=<%=sharebox.link%>&id=<%=sharebox.usrid%>"
            },
            "sms": {
                "type": "redirect",
                "url": "sms:<%=sharebox.phone%>",
                "data": "body=<%=sharebox.description%>"
            },
            // 原先的地址 https://lineit.line.me/share/ui
            "line": {
                "type": "redirect",
                "url": "https://social-plugins.line.me/lineit/share",
                "data": "url=<%=sharebox.link%>&text=<%=sharebox.description%>"
            },
            "skype": {
                "type": "redirect",
                "url": "https://web.skype.com/share",
                "data": "url=<%=sharebox.link%>&text=<%=sharebox.description%>"
            },
            "telegram": {
                "type": "redirect",
                "url": "https://telegram.me/share/url",
                "data": "url=<%=sharebox.link%>&text=<%=sharebox.title%>&to=<%=sharebox.phone%>"
            },
            "tgschema": {
                "type": "redirect",
                "url": "tg://msg",
                "data": "url=<%=sharebox.link%>&text=<%=sharebox.title%>&to=<%=sharebox.phone%>"
            },
            "email": {
                "type": "redirect",
                "url": "mailto:<%=sharebox.email%>",
                "data": "subject=<%=sharebox.title%>&body=<%=sharebox.description%>"
            },
            "gmail": {
                "type": "redirect",
                "url": "https://mail.google.com/mail/",
                "data": "view=cm&to=<%=sharebox.email%>&su=<%=sharebox.title%>&body=<%=sharebox.description%>&bcc=<%=sharebox.email%>&cc=<%=sharebox.email%>"
            },
            "yahoo": {
                "type": "redirect",
                "url": "http://compose.mail.yahoo.com/",
                "data": "to=<%=sharebox.email%>&subject=<%=sharebox.title%>&body=<%=sharebox.description%>"
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

    var ShareProtocol = {
        schema: "sharebox",
        share: {
            callout: function(data, node, e, type){
                e && e.preventDefault();
                
                var args = (data || "").split(",");
                var name = args[0];

                ActionSheet.show(name);
            },
            cancel: function(data, node, e, type){
                e && e.preventDefault();

                ActionSheet.hide();
            },
            adaptor: function(data, node, e, type){
                e && e.preventDefault();

                var args = (data || "").split(",");
                var name = args[0];

                var ins = _ShareBox.get(name);
                var conf = ins.parse(node);
                var type = conf.type;
                var api = conf.api;
                var apiType = api.type;

                if(!apiType){
                    console.log("不支持的分享类型(" + type + "#" + apiType + ")");
                    return ;
                }

                if(apiType == "native"){
                    //todo
                    ins.exec("native", [ins, conf, node]);
                }else if(apiType == "redirect"){
                    var apiUrl = api.url;
                    var apiData = api.data;
                    var shareFullURL = "";

                    apiUrl = ShareTemplate.render(true, apiUrl, conf, {
                        callback: function(ret){
                            return ret.result;
                        }
                    }).local;

                    apiData = ShareTemplate.render(true, apiData, conf, {
                        callback: function(ret){
                            return ret.result;
                        }
                    }).local;

                    shareFullURL = apiUrl + (apiUrl.indexOf("?") == -1 ? "?" : "&") + apiData;

                    if(conf.external){
                        Util.requestExternal(conf.external, [ins, conf, {
                            callback: function(_shareUrl, _conf){
                                window.open(_shareUrl, _conf.target);
                            },
                            args: [shareFullURL, conf],
                            context: ShareTemplate
                        }, node]);
                    }else{
                        window.open(shareFullURL, conf.target);
                    }
                }
            }
        }
    };

    /**
     * options
     * options -> name  组件名称， 默认为：share
     * options -> title  组件标题， 默认为： 分享到
     * options -> type 类型 m: 移动端   d:PC端(未实现)   a:自动适配平台(未实现)   u:自定义
     * options -> share 统一分享配置，如果平台中有配置，将优先用平台中的配置
     *            share -> name   应用名称，如：微信，手机QQ，微博 
     *            share -> title  分享标题
     *            share -> description  分享描述
     *            share -> link  分享链接
     *            share -> image  分享图片
     *            share -> source 来源
     *            share -> summary 摘要
     *            share -> external  callback URI 
     *            share -> target 
     *            share -> lang  语言代码
     *            share -> hash  hash tags
     *            share -> category 分类
     *            share -> usrid 用户ID
     *            share -> email 电子邮箱
     *            share -> phone 手机号码
     * options -> platforms  平台配置
     *            platform -> type   类型，如: wx, timeline, weibo, qq, qzone等
     *            platform -> text   文本标签，如：微信好友，朋友圈，微博，QQ好友，QZone等
     *            platform -> name   应用名称，如：微信，手机QQ，微博 
     *            platform -> title  分享标题
     *            platform -> description  分享描述
     *            platform -> link   分享链接
     *            platform -> image  分享图片
     *            platform -> source 分享来源
     *            platform -> summary 分享摘要
     *            platform -> aid  应用ID
     *            platform -> akey 应用KEY
     *            platform -> external  callback URI 
     *            platform -> target
     *            platform -> lang  语言代码
     *            platform -> hash  hash tags
     *            platform -> category 分类
     *            platform -> usrid 用户ID
     *            platform -> email 电子邮箱
     *            platform -> phone 手机号码
     * options -> apis 分享API
     *            api -> type API类型，[redirect | native]
     *            api -> url 接口地址
     *            api -> data 接口地址参数
     */

    var ConfDataStruct = {
        share: function(){
            return {
                "name": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": "",
                "target": "",
                "lang": "",
                "hash": "",
                "category": "",
                "usrid": "",
                "email": "",
                "phone": ""
            };
        },
        platform: function(){
            return {
                "type": "",
                "text": "",
                "name": "",
                "sign": "",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": "",
                "target": "",
                "lang": "",
                "hash": "",
                "category": "",
                "usrid": "",
                "email": "",
                "phone": ""
            };
        },
        api: function(){
            return {
                "type": "native",
                "url": '',
                "data": ''
            };
        }
    };

    var GetDefaultOptions = function(){
        return {
            "name": "share",
            "title": "分享到",
            "type": "m",
            "share": {"name": "SE.Shenghuo",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": "",
                "target": "_blank",
                "lang": "",
                "hash": "",
                "category": "",
                "usrid": "",
                "email": "",
                "phone": ""
            },
            "platforms": [
                {"type": "wechat",
                    "text": "微信好友",
                    "name": "微信",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": "",
                    "target": "_blank",
                    "lang": "",
                    "hash": "",
                    "category": "",
                    "usrid": "",
                    "email": "",
                    "phone": ""
                },
                {"type": "timeline",
                    "text": "朋友圈",
                    "name": "微信",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": "",
                    "target": "_blank",
                    "lang": "",
                    "hash": "",
                    "category": "",
                    "usrid": "",
                    "email": "",
                    "phone": ""
                },
                {"type": "weibo",
                    "text": "微博",
                    "name": "微博",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": "",
                    "target": "_blank",
                    "lang": "",
                    "hash": "",
                    "category": "",
                    "usrid": "",
                    "email": "",
                    "phone": ""
                },
                {"type": "mqq",
                    "text": "QQ好友",
                    "name": "手机QQ",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": "",
                    "target": "_blank",
                    "lang": "",
                    "hash": "",
                    "category": "",
                    "usrid": "",
                    "email": "",
                    "phone": ""
                }
            ],
            "apis": {}
        };
    };

    var _ShareBox = function(){
        this.options = GetDefaultOptions();

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onconfigure: null,
            onnative: null
        }, this.handleStack);
    };

    _ShareBox.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listener.clear();
        },
        getHandleStack : function(){
            return this.handleStack;
        },
        parse: function(node){
            var attrNames = [];
            var struct = ConfDataStruct.platform();

            for(var key in struct){
                if(struct.hasOwnProperty(key)){
                    attrNames.push(key);
                }
            }

            var size = attrNames.length;
            var name = null;
            var conf = {};

            for(var i = 0; i < size; i++){
                name = attrNames[i];

                conf[name] = node.attr("data-sharebox-" + name) || "";
            }

            var type = conf.type;
            var systemAPIS = GetShareAPI();
            var userAPIS = this.options["apis"] || {}; 
            var sapi = systemAPIS[type] || {};
            var uapi = userAPIS[type] || {};
            var api = $.extend({}, sapi, uapi);

            conf["api"] = api;

            return conf;
        },
        mconf: function(name, opts){
            var name = opts.name;
            var mask = $(".mod-actionsheet-mask");
            var sharebox = $('[data-actionsheet=' + name + ']');
            var _html = "";

            if(mask.length == 0){
                _html += _html_mask;
            }

            if(sharebox.length > 0){
                sharebox.remove();
            }
            _html += _html_sharebox_m;

            ShareTemplate.render(true, _html, opts, {
                callback: function(ret){
                    $("body").append(ret.result);
                }
            });
        },
        merge: function(options){
            var defaultOptions = GetDefaultOptions();
            var newOptions = {
                "share": {},
                "platforms": [],
                "apis": {}
            };

            var defaultPlatforms = defaultOptions.platforms;
            var defaultSize = defaultPlatforms.length;
            var defaultPlatform = null;

            var share = options.share;
            var platforms = options.platforms;
            var platform = null;
            var size = platforms.length;

            var shareStruct = ConfDataStruct.share();
            var platformStruct = ConfDataStruct.platform();
            var apiStruct = ConfDataStruct.api();

            share = (newOptions["share"] = $.extend(true, {}, shareStruct, defaultOptions["share"], options["share"]));

            for(var key in defaultOptions){
                if(defaultOptions.hasOwnProperty(key)){
                    if("share" === key){ //copy share conf
                        continue;
                    }else if("platforms" === key){ //copy platforms conf
                        for(var i = 0; i < size; i++){
                            platform = platforms[i];

                            newOptions.platforms.push($.extend(true, {}, platformStruct, share, platform));
                        }
                        // console.table(newOptions.platforms);
                    }else if("apis" === key){ //copy apis conf
                        newOptions[key] = options[key] || {};

                        for(var api in newOptions[key]){
                            if(newOptions[key].hasOwnProperty(api)){
                                newOptions[key][api] = $.extend(true, {}, apiStruct, newOptions[key][api]);
                            }
                        }
                    }else{ // other conf
                        newOptions[key] = options[key] || defaultOptions[key];
                    }
                }
            }

            return newOptions;
        },
        conf: function(options){
            this.options = this.merge(options);

            var opts = this.options;
            var name = opts.name;
            var type = opts.type;

            if("m" == type){
                this.mconf(name, opts);
            }else{
                this.exec("configure", [opts]);
            }
        },
        create: function(){
            var opts = this.options;
            var name = opts.name;

            var links = $('[data-sharebox="' + name + '"]');

            links.attr("data-action-tap", "sharebox://share/callout#" + name);
        }
    };

    _ShareBox.Cache = {};

    _ShareBox.render = function(name){
        var _ins = _ShareBox.Cache[name] || (_ShareBox.Cache[name] = new _ShareBox());

        return {
            exec : function(type, args){
                return _ins.exec(type, args);
            },
            set : function(type, option){
                _ins.set(type, option);

                return this;
            },
            remove : function(type){
                _ins.remove(type);

                return this;
            },
            get : function(type){
                return _ins.get(type);
            },
            clear : function(){
                _ins.clear();

                return this;
            },
            getHandleStack : function(){
                return _ins.getHandleStack();
            },
            parse: function(node){
                return _ins.parse(node);
            },
            conf: function(options){
                _ins.conf(options);

                return this;
            },
            create: function(){
                _ins.create();

                return this;
            }
        };
    };

    _ShareBox.get = function(name){
        if(name in _ShareBox.Cache){
            return _ShareBox.render(name);
        }

        return null;
    };

    (function(){
        Util.source(ShareProtocol);
    })();

    module.exports = {
        "version": "R17B0817",
        "newShareBox": function(name){
            return _ShareBox.render(name);    
        },
        "get": function(name){
            return _ShareBox.get(name);
        }
    };
});