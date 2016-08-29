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
                           '        value = platform[pf];' +
                           '        conf.push("data-sharebox-" + pf + "=\\\"" + encodeURIComponent(value) + "\\\"");' +
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
                "data": 'c=share&a=index&title=<%=sharebox.title%>&url=<%=sharebox.link%>&pic=<%=sharebox.image%>'
            },
            "weibo": {
                "type": "redirect",
                "url": 'http://service.weibo.com/share/share.php',
                "data": 'url=<%=sharebox.link%>&title=<%=sharebox.title%>&pic=<%=sharebox.image%>&appkey=<%=sharebox.akey%>'
            },
            "douban": {
                "type": "redirect",
                "url": 'http://shuo.douban.com/!service/share',
                "data": 'href=<%=sharebox.link%>&name=<%=sharebox.title%>&text=<%=sharebox.description%>&image=<%=sharebox.image%>&starid=0&aid=0&style=11'
            },
            "diandian": {
                "type": "redirect",
                "url": 'http://www.diandian.com/share',
                "data": 'lo=<%=sharebox.link%>&ti=<%=sharebox.title%>&type=link'
            },
            "linkedin": {
                "type": "redirect",
                "url": 'http://www.linkedin.com/shareArticle',
                "data": 'mini=true&ro=true&title=<%=sharebox.title%>&url=<%=sharebox.link%>&summary=<%=sharebox.summary%>&source=<%=sharebox.source%>&armin=armin'
            },
            "facebook": {
                "type": "redirect",
                "url": 'https://www.facebook.com/sharer/sharer.php',
                "data": 'u=<%=sharebox.link%>'
            },
            "twitter": {
                "type": "redirect",
                "url": 'https://twitter.com/intent/tweet',
                "data": 'text=<%=sharebox.title%>&url=<%=sharebox.link%>&via=<%=sharebox.source%>'
            },
            "google": {
                "type": "redirect",
                "url": 'https://plus.google.com/share',
                "data": 'url=<%=sharebox.link%>'
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
        name: "sharebox",
        share: {
            callout: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];

                ActionSheet.show(name);
            },
            cancel: function(data, node, e, type){
                ActionSheet.hide();
            },
            adaptor: function(data, node, e, type){
                var args = (data || "").split(",");
                var name = args[0];

                var ins = _ShareBox.get(name);
                var conf = ins.parse(node);
                var type = conf.type;
                var api = conf.api;
                var apiType = api.type;;

                if(!apiType){
                    console.log("不支持的分享类型(" + type + "#" + apiType + ")");
                    return ;
                }

                if(conf.external){
                    Util.requestExternal(conf.external, [ins, conf]);
                }

                if(apiType == "native"){
                    //todo
                }else if(apiType == "redirect"){
                    var url = api.url;
                    var data = api.data;

                    ShareTemplate.render(true, data, conf, {
                        callback: function(ret, _url){
                            location.href = _url + "?" + ret.result;
                        },
                        args: [url]
                    });
                }
            }
        }
    };

    /**
     * options
     * options -> name  组件名称， 默认为：share
     * options -> title  组件标题， 默认为： 分享到
     * options -> type 类型 m: 移动端   d:PC端
     * options -> share 统一分享配置，如果平台中有配置，将优先用平台中的配置
     *            share -> title  分享标题
     *            share -> description  分享描述
     *            share -> link  分享链接
     *            share -> image  分享图片
     *            share -> source 来源
     *            share -> summary 摘要
     *            share -> external  callback URI 
     * options -> platforms  平台配置
     *            platform -> type   类型，如: wx, timeline, weibo, qq, qzone等
     *            platform -> text   文本标签，如：微信好友，朋友圈，微博，QQ好友，QZone等
     *            platform -> title  分享标题
     *            platform -> description  分享描述
     *            platform -> link   分享链接
     *            platform -> image  分享图片
     *            platform -> source 分享来源
     *            platform -> summary 分享摘要
     *            platform -> aid  应用ID
     *            platform -> akey 应用KEY
     *            platform -> external  callback URI 
     * options -> apis 分享API
     *            api -> type API类型，[redirect | native]
     *            api -> url 接口地址
     *            api -> data 接口地址参数
     */
    
    var GetDefaultOptions = function(){
        return {
            "name": "share",
            "title": "分享到",
            "type": "m",
            "share": {
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            "platforms": [
                {
                    "type": "wechat",
                    "text": "微信好友",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": ""
                },
                {
                    "type": "timeline",
                    "text": "朋友圈",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": ""
                },
                {
                    "type": "weibo",
                    "text": "微博",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": ""
                },
                {
                    "type": "mqq",
                    "text": "QQ好友",
                    "aid": "",
                    "akey": "",
                    "title": "",
                    "description": "",
                    "link": "",
                    "image": "",
                    "source": "",
                    "summary": "",
                    "external": ""
                }
            ],
            "apis": {}
        };
    };

    var _ShareBox = function(){
        this.options = GetDefaultOptions();
    };

    _ShareBox.prototype = {
        parse: function(node){
            var attrNames = [
                "type", 
                "text", 
                "sign", 
                "aid", 
                "akey", 
                "title", 
                "description", 
                "link", 
                "image", 
                "source", 
                "summary", 
                "external"
            ];
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
            var share = options.share;
            var platforms = options.platforms;
            var platform = null;
            var size = platforms.length;

            for(var i = 0; i < size; i++){
                platform = platforms[i];

                for(var key in share){
                    options.platforms[i][key] = platform[key] || share[key];
                }
            }

            return options;
        },
        conf: function(options){
            this.options = $.extend(true, GetDefaultOptions(), options);
            this.options = this.merge(this.options);

            var opts = this.options;
            var name = opts.name;
            var type = opts.type;

            if("m" == type){
                this.mconf(name, opts);
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
        "version": "R16B0418",
        "newShareBox": function(name){
            return _ShareBox.render(name);    
        },
        "get": function(name){
            return _ShareBox.get(name);
        }
    };
});