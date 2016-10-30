;define(function(require, exports, module){
//---------------------------
var Util            = require("mod/se/util");
var CMD             = require("mod/se/cmd");
var DataType        = require("mod/se/datatype");
var DataProxy       = require("mod/se/dataproxy");
var Request         = require("mod/se/request");
var Storage         = require("mod/se/storage");
var TemplateEngine  = require("mod/se/template");

var ErrorTypes = CMD.ErrorTypes;
var RespTypes = CMD.ResponseTypes;
var ResponseProxy = DataProxy.ResponseProxy;
var DataCache =  DataProxy.DataCache;

var Persistent = Storage.Persistent;
var Session = Storage.Storage;

var PreventDefaultLink = function(){
    $("body").on("click", 'a[href="#none"]', function(e){
        e.preventDefault();
    }).on("click", 'a[href="#"]', function(e){
        e.preventDefault();
    }).on("click", 'a[href="###"]', function(e){
        e.preventDefault();
    });
};

var GoSchema = {
    schema: "go",
    //--------------------------
    url: function(data, node, e, type){
        var args = (data || "").split(",");
        var url = args[0];

        if(node && node.hasClass("disabled")){
            return ;
        }

        location.href = url;
    },
    open: function(data, node, e, type){
        var args = (data || "").split(",");
        var url = args[0];
        var target = args[1] || "_blank";

        if(node && node.hasClass("disabled")){
            return ;
        }

        window.open(url, target);
    },
    refresh: function(data, node, e, type){
        var url = document.URL;

        if(node && node.hasClass("disabled")){
            return ;
        }

        location.replace(url);
    },
    replace: function(data, node, e, type){
        var args = (data || "").split(",");
        var url = args[0];

        if(node && node.hasClass("disabled")){
            return ;
        }

        location.replace(url);
    },
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

var InputSchema = {
    schema: "input",
    sync: {
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
    tab: {
        radio: function(data, node, e, type){
            var args = (data || "").split(",");
            var type = args[0];
            var val = node.val();

            var tabs = $('[data-tabfor^="' + type + '."]');
            var tab = $('[data-tabfor="' + type + '.' + val + '"]');

            if(node && (node[0].disabled || node.parents(".disabled").length > 0)){
                return ;
            }

            tabs.addClass("hide");
            tab.removeClass("hide");
        }
    } 
}

var _App = {
    _conf: {},
    conf: function(){
        var args = arguments;
        var size = args.length;

        if(size <= 0 || size > 2){
            return ;
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
            {type: "click", mapping: null, compatible: null},
            {type: "input", mapping: null, compatible: null}
        ], null);

        Util.source(GoSchema);
        Util.source(InputSchema);

        if(conf.message){
            CMD.setBubbleTips(conf.message);
        }
        PreventDefaultLink();
    }
};

module.exports = {
    "version": "R16B0408",
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
        "typeof": DataType
    }
}
//---------------------------
});