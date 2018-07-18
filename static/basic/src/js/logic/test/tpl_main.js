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
    }
};

//错误码特殊处理回调（根据实际情况调整）
var ErrorInfo = {
    // "EXAMPLE_CODE" : function(handler){
    //     //todo
    //     Util.execHandler(handler);
    //     return true;
    // }
    "20100001000": function(handler){
        Util.execHandler(handler);

        Util.delay(500, ErrorHandlers.Login);

        return true;
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
        var URLInfo = Request.parseURL(url);
        //--------------------------------------------------------
        var mergeKeys = [//需要合并的URL参数，根据实际情况设置

        ]; 
        //--------------------------------------------------------
        var locData = Request.serialized(location.search);
        var data = Request.serialized(URLInfo.search);
        var key = null;

        if(!mergeKeys || mergeKeys.length == 0){
            return url;
        }

        for(var i = 0; i < mergeKeys.length; i++){
            key = mergeKeys[i];

            if(key in locData){
                data[key] = locData[key];
            }
        }

        url = Request.append(url, Request.stringify(data));

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

        CMD.injectErrorInfo(ErrorInfo);

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
    "expando": {
        "util": Util,
        "cmd": CMD,
        "errors": ErrorTypes,
        "types": RespTypes,
        "request": Request,
        "response": ResponseProxy,
        "cache": DataCache,
        "template": TemplateEngine,
        "persistent": Persistent,
        "session": Session,
        "typeof": DataType,
        "toast": Toast
    }
};
module.exports = (window["SEApp"] = _public);
//---------------------------
});