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
               require("mod/zepto/touch");
    var Util = require("mod/se/util");

    var SheetProtocol = {
        name: "actionsheet",
        prevent: function(data, node, e, type){
            e.stopPropagation();
        },
        show: function(data, node, e, type){
            var args = (data || "").split(",");
            var name = args[0];
            
            _ActionSheet.show(name);
        },
        hide: function(data, node, e, type){
            e.stopPropagation();

            _ActionSheet.hide();
        }
    };

    var _ActionSheet = {
        show: function(name){
            var mask = $(".mod-actionsheet-mask");
            var panel = name 
                        ? 
                        $('[data-actionsheet="' + name + '"]')
                        :
                        $($(".mod-actionsheet-panel").get(0));

            $(".mod-actionsheet").addClass("exit");

            mask.removeClass("exit");
            panel.removeClass("exit");

            mask.attr("data-action-tap", "actionsheet://hide");
            panel.attr("data-action-tap", "actionsheet://prevent");
        },
        hide: function(){
            $(".mod-actionsheet").addClass("exit");
        }
    };

    (function(){
        Util.watchAction("body", [
            {type: "tap", mapping: "click", compatible: null}
        ], null);

        Util.source(SheetProtocol);
    })();

    module.exports = {
        "version": "R16B0415",
        "show": _ActionSheet.show,
        "hide": _ActionSheet.hide
    };
});