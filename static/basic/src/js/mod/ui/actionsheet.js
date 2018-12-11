/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * ActionSheet模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.4
 */
;define(function ActionSheet(require, exports, module){
    var Util            = require("mod/se/util");
    var Listener        = require("mod/se/listener");
    var HandleStack     = Listener.HandleStack; 

    var SheetProtocol = {
        schema: "actionsheet",
        prevent: function(data, node, e, type){
            e.stopPropagation();
        },
        show: function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0] || "";
            
            _ActionSheet.show(name);
        },
        hide: function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0] || "";

            e.stopPropagation();

            _ActionSheet.hide(name);
        }
    };

    var _ActionSheet = function(name){
        this.name = name;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onshow: null, //[name]
            onhide: null  //[name]
        }, this.handleStack);
    };

    _ActionSheet.prototype = {
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
        show: function(){
            var name = this.name;

            var mask = $('.mod-actionsheet-mask[data-actionsheet="' + name + '"]');
            var panel = $('.mod-actionsheet-panel[data-actionsheet="' + name + '"]');

            $(".mod-actionsheet").addClass("exit");

            if(mask.length == 0){
                mask = $($(".mod-actionsheet-mask").get(0));
            }

            if(panel.length == 0){
                panel = $($(".mod-actionsheet-panel").get(0));
            }

            mask.removeClass("exit");
            panel.removeClass("exit");

            mask.attr("data-action-tap", "actionsheet://hide#" + name);
            panel.attr("data-action-tap", "actionsheet://prevent");

            this.exec("show", [name]);
        },
        hide: function(){
            var name = this.name;

            $(".mod-actionsheet").addClass("exit");

            this.exec("hide", [name]);
        }
    };

    _ActionSheet.Cache = {};
    _ActionSheet.createActionSheet = function(name){
        var as = _ActionSheet.Cache[name] || (_ActionSheet.Cache[name] = new _ActionSheet(name));

        return {
            "exec": function(type, args){
                return as.exec(type, args);
            },
            "set": function(type, option){
                as.set(type, option);

                return this;
            },
            "remove": function(type){
                as.remove(type);

                return this;
            },
            "get": function(type){
                return as.get(type);
            },
            "clear": function(){
                as.clear();

                return this;
            },
            "getHandleStack": function(){
                return as.getHandleStack();
            },
            "show": function(){
                as.show();

                return this;
            },
            "hide": function(){
                as.hide();

                return this;
            }
        };
    };
    _ActionSheet.show = function(name){
        var as = _ActionSheet.createActionSheet(name || "_compatible");

        as.show();
    };
    _ActionSheet.hide = function(name){
        var as = _ActionSheet.createActionSheet(name || "_compatible");

        as.hide();
    };

    (function(){
        Util.watchAction("body", [
            {type: "tap", mapping: "click", compatible: null}
        ], null);

        Util.source(SheetProtocol);
    })();

    module.exports = {
        "version": "R18B1206",
        "createActionSheet": function(name){
            return _ActionSheet.createActionSheet(name);
        },
        "show": _ActionSheet.show,
        "hide": _ActionSheet.hide
    };
});