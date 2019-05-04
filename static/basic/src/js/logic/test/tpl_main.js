;define(function(require, exports, module){
//---------------------------
var Util            = require("mod/se/util");
var CMD             = require("mod/se/cmd");
var DataType        = require("mod/se/datatype");
var DataProxy       = require("mod/se/dataproxy");
var Request         = require("mod/se/request");
var Storage         = require("mod/se/storage");
var TemplateEngine  = require("mod/se/template");
var Toast           = require("mod/ui/toast");
var ObjectPath      = require("mod/se/opaths");
var ErrorCode       = require("mod/conf/errcode");
var LazyLoader      = require("mod/se/lazyloader");

var ErrorTypes      = CMD.ErrorTypes;
var RespTypes       = CMD.ResponseTypes;
var ResponseProxy   = DataProxy.ResponseProxy;
var DataCache       = DataProxy.DataCache;
var Persistent      = Storage.Persistent;
var Session         = Storage.Session;

//错误回调处理函数配置（根据实际情况调整）
var ErrorHandlers = {
    ErrorTips: { //错误提示回调方法
        /**
         * 错误提示时的回调方法
         * @param  {String}   code    [错误码]
         * @param  {String}   message [错误信息]
         * @param  {String}   type    [错误类型]
         */
        callback: function(code, message, type){
            Toast.text(message, Toast.MIDDLE_CENTER, 3000);
        }
    },
    Login: {
        /**
         * 登录超时的回调
         * @param  {Number}   elapsedTime [延时时长]
         * @return {Boolean}              [true/false]
         */
        callback: function(elapsedTime){
            Util.requestExternal("go://url#/login?url=" + encodeURIComponent(Util.removeURLHash()), [null, null, null]);
        }
    },
    CreateErrorHandler: function(errorCode, errorMessage){
        var ctx = {
            "code": errorCode,
            "message": errorMessage
        };
        if("20100001000" == errorCode){
            return {
                callback: function(handler, code, msg, type){
                    Util.execHandler(ErrorHandlers.ErrorTips, [this.code, this.message, type]);

                    Util.delay(1500, ErrorHandlers.Login);
                },
                "context": ctx
            };
        }else{
            return {
                callback: function(handler, code, msg, type){
                    Util.execHandler(ErrorHandlers.ErrorTips, [this.code, this.message, type]);
                },
                "context": ctx
            }
        }
    }
};

//错误码特殊处理回调（根据实际情况调整）
var ErrorInfo = {
    // "EXAMPLE_CODE" : function(handler){
    //     //todo
    //     Util.execHandler(handler);
    //     return true;
    // }
    "*": {
        callback: function(handler, code, msg, type){
            Util.execHandler(ErrorHandlers.ErrorTips, [code, SEApp.conf("commonerror"), type]);

            return true;
        }
    }
};

//设置数据代理响应配置（根据实际的数据接口进行调整）
ResponseProxy.conf({
    "code": "code",                             //服务器返回用于判断是否成功的代码key，如：{"retCode": 0, "retMsg": "ok"}
    "msg": "message",                           //服务器返回用于提示的信息key，如：{"retCode": 0, "retMsg": "ok"}
    "success": "0",                             //服务器返回的代码，对应code里的值，resp[_config["code"]] === _config["success"] ? 成功 : 失败
    "errorHandler": ErrorHandlers.ErrorTips     //错误提示处理回调
});

//************************************************************************************************************************************************

/**
 * 阻止一些空链接的默认行为
 */
var PreventDefaultLink = function(){
    $("body").on("click", 'a[href="#none"]', function(e){
        e.preventDefault();
    }).on("click", 'a[href="#"]', function(e){
        e.preventDefault();
    }).on("click", 'a[href="###"]', function(e){
        e.preventDefault();
    });
};

/**
 * 本地访问时对路径的转换
 * @type {Object}
 */
var LocalPath = {
    prefix: "file:///",
    /**
     * 判断是否为本地访问
     * @return {String} [如果是file:///开头，则返回地址，否则返回null]
     */
    localFile: function(){
        var path = document.URL;

        if(path.substring(0, LocalPath.prefix.length) === LocalPath.prefix){
            return path.replace(LocalPath.prefix, "");
        }

        return null;
    },
    /**
     * 将路径转换为相对路径，只对file:///有效
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    relative: function(path){
        var localPath = null;

        if(null == (localPath = LocalPath.localFile())){
            return path;
        }

        path = path.replace("/html/", "/app/")
                   .replace(".shtml", ".html");

        if(path.charAt(0) !== "/"){
            return path;
        }

        localPath = localPath.replace(/\\/g, "/");

        var localPathItems = localPath.split("/");
        var pathItems = (path.substring(1)).split("/");

        for(var i = 0; i < localPathItems.length; i++){
            if(pathItems[0] === localPathItems[i]){
                localPathItems = localPathItems.slice(i);
                break;
            }
        }

        for(var i = 0; i < pathItems.length; i++){
            if(pathItems[i] !== localPathItems[i]){
                localPathItems = localPathItems.slice(i);
                pathItems = pathItems.slice(i);

                break;
            }
        }

        var relativePathFlags = [];
        var diff = localPathItems.length - pathItems.length;

        for(var i = 0; i < diff; i++){
            relativePathFlags.push("../");
        }

        path = relativePathFlags.join("") + pathItems.join("/");
        
        return path;
    }
};

/**
 * URL配置上下文解析类
 */
var URLContext = {
    parse: function(url){
        var context = _App.conf("URLContext") || {};
        var pattern = /\{([^\{\}]+)\}/g;
        var matcher = null;
        pattern.lastIndex = 0;

        context["params"] = Request.serialized(location.search);

        var key = null;
        var regexp = null;
        while(null != (matcher = pattern.exec(url))){
            key = matcher[1];

            regexp = new RegExp("\\{" + key.replace(/([\.\/])/, "\\$1") + "\\}", "g");
            url = url.replace(regexp, ObjectPath.find(context, key, ".") || "")
        }

        return url;
    },
    transform: function(url){
        var context = _App.conf("URLContext") || {};
        var rules = context.URLRules || [];

        if(rules.length == 0){
            return URLContext.parse(url);
        }

        var rule = null;
        var pattern = null;
        var replacement = null;

        for(var i = 0; i < rules.length; i++){
            rule = rules[i] || {};
            pattern = rule.pattern;
            replacement = rule.replacement || "";

            if(pattern){
                if(pattern.test(url)){
                    pattern.lastIndex = 0;

                    url = url.replace(pattern, replacement);

                    if(true === rule.break){
                        return URLContext.parse(url);
                    }
                }
            }
        }

        return URLContext.parse(url);
    },
    URL: function(key){
        var context = _App.conf("URLContext") || {};
        var url = context[key] || "";

        return URLContext.parse(url);
    }
};

/**
 * 安全URL处理
 * @type {Object}
 */
var SecurityURL = {
    /**
     * URL安全性验证
     * @param  {String} url        [需校验的URL]
     * @param  {String} defaultURL [默认URL。如果不匹配时，则返回该URL]
     * @return {String}            [合法的URL]
     */
    verify: function(url, defaultURL){
        if(LocalPath.localFile()){
            return url;
        }
        url = URLContext.transform(url);

        var info = Request.parseURL(url);
        var host = info.host;

        //需要根据实际情况调整，否则在调用时无法正常跳转页面
        var pattern = /(seshenghuo\.com)$/i;

        if(pattern.test(host)){
            return url;
        }else{
            console.warn("The URL(" + url + ") is not allowed.");
            console.warn("The default URL is `" + defaultURL + "`");
        }

        return defaultURL || "";
    },
    /**
     * 将指定的URL参数合并到目标URL上，如果有配置。主要用于全局URL参数传递
     * @param  {String} url [目标URL]
     * @return {String}     [处理后的URL]
     */
    fixed: function(url){
        url = URLContext.transform(url);

        var URLInfo = Request.parseURL(url);
        //--------------------------------------------------------
        var mergeKeys = [//需要合并的URL参数，根据实际情况设置

        ]; 
        //--------------------------------------------------------
        var locData = Request.serialized(location.search);
        var data = Request.serialized(URLInfo.search);
        var key = null;

        if(!mergeKeys || mergeKeys.length == 0){
            url = LocalPath.relative(url);
            return url;
        }

        for(var i = 0; i < mergeKeys.length; i++){
            key = mergeKeys[i];

            if(key in locData){
                data[key] = locData[key];
            }
        }

        url = Request.append(url, Request.stringify(data));
        url = LocalPath.relative(url);

        return url;
    }
};

/**
 * App虚拟schema定义
 * @type {Object}
 */
var AppSchema = {
    schema: "app",
    //--------------------------
    //data ==> [flag,action]
    /**
     * 调用指定的action
     * @param  {String} data [参数 => flag,action]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * 示例
     * app://invoke#0,go://url#/index
     */
    invoke: function(data, node, e, type){
        var args = (data || "").split(",");
        var flag = Number(args.shift() || 0); // 0, 1, 2, 4, ...
        var action = args.join(",");

        if(!action){
            return ;
        }

        if(e && Util.checkBitFlag(3, 1)){
            e.preventDefault();
        }

        if(e && Util.checkBitFlag(3, 2)){
            e.stopPropagation();
        }

        Util.requestExternal(action, [node, e, type]);
    }
};

/**
 * Go虚拟schema定义
 * @type {Object}
 */
var GoSchema = {
    schema: "go",
    //--------------------------
    /**
     * 登录校验重定向
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://url#/index
     */
    auth: function(data, node, e, type){
        e && e.stopPropagation();

        if(SEApp.UserSign){
            if(SEApp.UserSign.isLogin()){
                Util.requestExternal("go://url#" + data, [node, e, type]);
            }else{
                SEApp.UserSign.login(data, false);
            }
        }else{
            Util.requestExternal("go://url#" + data, [node, e, type]);
        }
    },
    /**
     * URL重定向
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://url#/index
     */
    url: function(data, node, e, type){
        var args = (data || "").split(",");
        var url = args[0];

        if(node && node.hasClass("disabled")){
            return ;
        }

        if(!url || !SecurityURL.verify(url)){
            return ;
        }

        location.href = SecurityURL.fixed(url);
    },
    /**
     * 新开窗口打开URL
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://open#/index
     */
    open: function(data, node, e, type){
        var args = (data || "").split(",");
        var url = args[0];
        var target = args[1] || "_blank";

        if(node && node.hasClass("disabled")){
            return ;
        }

        if(!url || !SecurityURL.verify(url)){
            return ;
        }

        window.open(SecurityURL.fixed(url), target);
    },
    /**
     * 刷新当前页面
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://refresh
     */
    refresh: function(data, node, e, type){
        var url = document.URL;

        if(node && node.hasClass("disabled")){
            return ;
        }

        location.replace(SecurityURL.fixed(url));
    },
    /**
     * 替换当前URL
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://replace#/index
     */
    replace: function(data, node, e, type){
        var args = (data || "").split(",");
        var url = args[0];

        if(node && node.hasClass("disabled")){
            return ;
        }

        if(!url || !SecurityURL.verify(url)){
            return ;
        }

        location.replace(SecurityURL.fixed(url));
    },
    /**
     * 跳转到传入的URL
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://sego#url,/index
     */
    sego: function(data, node, e, type){
        var args = (data || "").split(",");
        var name = args[0] || "segoto";
        var defaultURL = args[1] || null;
        var url = Request.getParameter(name) || defaultURL;

        if(url){
            try{
                url = decodeURIComponent(url);
                url = SecurityURL.verify(url);
            }catch(e){
                url = "";
            }
        }

        if(node && node.hasClass("disabled")){
            return ;
        }

        if(url){
            location.href = SecurityURL.fixed(url);
        }
    },
    /**
     * tab窗体切换
     * @param  {String} data [参数]
     * @param  {Object} node [jQuery/zepto节点对象，或null]
     * @param  {Event}  e    [事件对象，或null]
     * @param  {String} type [事件类型]
     * @return {[type]}      [description]
     * 示例
     * go://tab#tab1
     */
    tab: function(data, node, e, type){
        var args = (data || "").split(",");
        var name = args[0];
        var requestHandler = null;

        var menu = $('[data-tab-menu="' + name + '"]');
        var body = $('[data-tab-body="' + name + '"]');

        var menusRoot = menu.parents(".tab-menus");
        var bodiesRoot = body.parents(".tab-bodies");

        var menus = menusRoot.find('[data-tab-menu]');
        var bodies = bodiesRoot.find('[data-tab-body]');

        if(node && node.hasClass("disabled")){
            return ;
        }

        menus.removeClass("on");
        bodies.addClass("hide");

        requestHandler = menu.attr("data-tab-request") || null;

        menu.addClass("on");

        if(requestHandler){
            Util.requestExternal(requestHandler, [node, e, type, {
                "name": name,
                "menu": menu,
                "body": body,
                "root": {
                    "menu": menusRoot,
                    "body": bodiesRoot
                }
            }]);
        }

        body.removeClass("hide");
    }
};

/**
 * input虚拟schema定义
 * @type {Object}
 */
var InputSchema = {
    schema: "input",
    /**
     * 数据同步
     * @type {Object}
     */
    sync: {
        /**
         * 同步radio控件的数据到指定的input
         * @param  {String} data [参数]
         * @param  {Object} node [jQuery/zepto节点对象，或null]
         * @param  {Event}  e    [事件对象，或null]
         * @param  {String} type [事件类型]
         * @return {[type]}      [description]
         * 示例
         * input://sync/radio#targetInputName
         * input://sync/radio#targetInputName,targetInputContainerSelector
         */
        radio: function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];
            var container = args[1];
            var containerNode = null;
            var targetInput = null;

            if(container){
                containerNode = $(container);

                if(containerNode.length == 0){
                    containerNode = null;
                }
            }

            if(containerNode){
                targetInput = containerNode.find('input[name="' + name + '"]');
            }else{
                targetInput = $('input[name="' + name + '"]');
            }

            targetInput.val(node.val());
        },
        /**
         * 同步checkbox控件的数据到指定的input
         * @param  {String} data [参数]
         * @param  {Object} node [jQuery/zepto节点对象，或null]
         * @param  {Event}  e    [事件对象，或null]
         * @param  {String} type [事件类型]
         * @return {[type]}      [description]
         * 示例
         * input://sync/checkbox#targetInputName,,checkedValue,uncheckedValue
         * input://sync/checkbox#targetInputName,targetInputContainerSelector,checkedValue,uncheckedValue
         */
        checkbox: function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];
            var container = args[1];
            var checkedValue = args[2];
            var uncheckedValue = args[3];
            var containerNode = null;
            var targetInput = null;

            if(container){
                containerNode = $(container);

                if(containerNode.length == 0){
                    containerNode = null;
                }
            }

            if(containerNode){
                targetInput = containerNode.find('input[name="' + name + '"]');
            }else{
                targetInput = $('input[name="' + name + '"]');
            }

            var dom = node[0];

            if(dom.checked){
                targetInput.val(checkedValue);
            }else{
                targetInput.val(uncheckedValue);
            }   
        }
    },
    /**
     * radio's tab
     * @type {Object}
     */
    tab: {
        /**
         * radio tab切换
         * @param  {String} data [参数]
         * @param  {Object} node [jQuery/zepto节点对象，或null]
         * @param  {Event}  e    [事件对象，或null]
         * @param  {String} type [事件类型]
         * @return {[type]}      [description]
         * 示例
         * input://tab/radio#tabType
         */
        radio: function(data, node, e, type){
            var args = (data || "").split(",");
            var tabType = args[0];
            var val = node.val();

            var tabs = $('[data-tabfor^="' + tabType + '."]');
            var tab = $('[data-tabfor="' + tabType + '.' + val + '"]');

            if(node && (node[0].disabled || node.parents(".disabled").length > 0)){
                return ;
            }

            tabs.addClass("hide");
            tab.removeClass("hide");
        }
    },
    /**
     * 根据不停的选项切换标签文本
     * @type {Object}
     */
    label: {
        /**
         * 切换radio项目
         * @param  {String} data [参数]
         * @param  {Object} node [jQuery/zepto节点对象，或null]
         * @param  {Event}  e    [事件对象，或null]
         * @param  {String} type [事件类型]
         * @return {[type]}      [description]
         * 示例
         * input://label/radio#tabType
         */
        radio: function(data, node, e, type){
            var args = (data || "").split(",");
            var tabType = args[0];
            var val = node.val();

            if(node && (node[0].disabled || node.parents(".disabled").length > 0)){
                return ;
            }

            var labels = (node.attr("data-labels") || "").split(",");
            var labelNodes = $('[data-labelfor="' + tabType + '"]');
            var labelNode = null;
            var label = null;

            for(var i = 0; i < labelNodes.length; i++){
                label = labels[i];
                labelNode = labelNodes[i];

                if(label && labelNode){
                    labelNode.innerHTML = label;
                }
            }
        }
    } 
};

/**
 * 数据处理工具类
 */
var DataSetUtil = {
    getRequestConf: function(requestName, def){
        var requests = SEApp.conf("requests") || {};

        var request = $.extend({}, {
            "names": [],
            "pageKey": "page",
            "params": {},
            "url": "/datalist",
            "paths": "dataList",
            /* 以下是可选项 */
            "rootRender": false,
            "external": null,
            "startPage": 1,
            "pageSize": 10,
            "name": requestName,
            "showLoading": false,
            "loadingText": "Loading...",
            "dataRendering": "append",
            "pageStyle": "loadmore", // loadmore | pagebar | autoload
            "page": 1,
            "autoload": null
        }, def || {}, requests[requestName] || {});

        return request;
    },
    getRequestMoreConf: function(requestName, data){
        return $.extend(DataSetUtil.getRequestConf(requestName, {
            "showLoading": false,
            "dataRendering": "append",
            "pageStyle": "loadmore",
            "page": 1
        }), data || {});
    },
    getRequestPageConf: function(requestName, data){
        return $.extend(DataSetUtil.getRequestConf(requestName, {
            "showLoading": false,
            "dataRendering": "replace",
            "pageStyle": "pagebar",
            "page": 1
        }), data || {});
    },
    getRequestAutoLoadConf: function(requestName, data){
        return $.extend(DataSetUtil.getRequestConf(requestName, {
            "showLoading": false,
            "dataRendering": "append",
            "pageStyle": "autoload",
            "autoload": "schema@se://dataset/auto#" + requestName,
            "page": 1
        }), data || {});
    },
    getDataFormConf: function(formName, data){
        var forms = SEApp.conf("forms") || {};

        var formConf = $.extend({}, {
            "actionType": "submit",
            "actionURL": null,
            /* 以下是可选项 */
            "method": null,
            "enctype": null,
            "actionName": formName,
            "redirectNow": false,
            "external": null,
            "showLoading": true,
            "loadingText": "Loading..."
        }, forms[formName] || {});

        return formConf;
    },
    dataTransform: function(resp){
        // resp.code = resp.errorCode;
        // resp.message = resp.replyText;
        // resp.recordSize = resp.count || 0;
        // resp.pageSize = resp.pageSize || 20;
        // resp.pageIndex = resp.pageNum || 0;

        return resp;
    }
};

var _App = {
    _conf: {},
    /**
     * 设置和获取配置项
     * @return {Any} [description]
     */
    conf: function(){
        var args = arguments;
        var size = args.length;

        if(size <= 0 || size > 2){
            return _App._conf;
        }

        var key = "";
        var value = "";

        if(size == 2){
            key = args[0];
            value = args[1];

            if(key in _App._conf){
                if(DataType.isObject(value)){
                    var tmp = _App._conf[key];

                    _App._conf[key] = $.extend(true, {}, tmp, value);
                }else{
                    _App._conf[key] = value;
                }
            }else{
                _App._conf[key] = value;
            }
        }else{
            key = args[0];
            if(key in _App._conf){
                return _App._conf[key];
            }

            return undefined;
        }
    },
    init: function(conf){
        _App._conf = conf;

        var alias = _App.conf("alias");

        Util.watchAction("body", [
            {type: "tap", mapping: "click", compatible: null},
            {type: "click", mapping: null, compatible: null},
            {type: "input", mapping: null, compatible: null},
            {type: "submit", mapping: null, compatible: null}
        ], null);

        Util.source(AppSchema);
        Util.source(GoSchema);
        Util.source(InputSchema);

        //重置CMD模块中的公共提示信息
        if(_App.conf("RequestStatus")){
            $.extend(CMD.RequestStatus, _App.conf("RequestStatus") || null);
        }

        CMD.injectErrorInfo(ErrorInfo);
        //--------------------------------------------------
        var errorCodeMeta = $('meta[name="errcode"]');

        if(errorCodeMeta.length > 0 && errorCodeMeta.attr("data-turn") === "on"){
            var errcodeConf = errorCodeMeta.attr("content");
            var errcodeName = errorCodeMeta.attr("data-errkey");

            ErrorCode.setConfigurePath(errcodeConf);
            ErrorCode.check(errcodeName, {
                callback: function(errinfo){
                    errinfo = errinfo || {};

                    if("iLang" in window){
                        lang = iLang.language();
                        errinfo = errinfo[lang] || {};
                    }

                    var tmp = {};
                    var flag = false;
                    for(var code in errinfo){
                        flag = true;

                        tmp[code] = ErrorHandlers.CreateErrorHandler(code, errinfo[code]);
                    }

                    if(true === flag){
                        CMD.injectErrorInfo(tmp);
                    }
                }
            });
        }
        //--------------------------------------------------

        //---------------------------------------------------
        var retmsg = (conf.message || "") + "";
        retmsg = retmsg.replace(/^([\s]+)|([\s]+)$/gi, "");

        if(retmsg){
            var toastConfig = conf.toast || null;
            if(toastConfig){
                Toast.text(retmsg, toastConfig.align || Toast.BOTTOM_CENTER, toastConfig.delay || 3000, toastConfig.callbacks || {});
            }else{
                CMD.setBubbleTips(retmsg);
            }            
        }
        //---------------------------------------------------
        PreventDefaultLink();
    }
};

var _public = {
    "version": "R18B0517",
    "init": _App.init,
    "conf": _App.conf,
    "path": LocalPath,
    "params": Request.serialized(location.search),
    "SecurityURL": SecurityURL,
    "DataSetUtil": DataSetUtil,
    "URLContext": URLContext,
    "Util": Util,
    "CMD": CMD,
    "ErrorTypes": ErrorTypes,
    "Request": Request,
    "ResponseProxy": ResponseProxy,
    "DataCache": DataCache,
    "TemplateEngine": TemplateEngine,
    "Persistent": Persistent,
    "Session": Session,
    "DataType": DataType,
    "Toast": Toast,
    "ObjectPath": ObjectPath,
    "ErrorCode": ErrorCode,
    "LazyLoader": LazyLoader
};
module.exports = (window["SEApp"] = _public);
//---------------------------
});