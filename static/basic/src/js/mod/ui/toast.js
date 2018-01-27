/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Toast模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.4
 */
;define(function Toast(require, exports, module){
    var Util = require("mod/se/util");

    var Toast = {
        "TOP_CENTER": "toast-top-center",
        "TOP_LEFT": "toast-top-left",
        "TOP_RIGHT": "toast-top-right",

        "BOTTOM_CENTER": "toast-bottom-center",
        "BOTTOM_LEFT": "toast-bottom-left",
        "BOTTOM_RIGHT": "toast-bottom-right",

        "MIDDLE_LEFT": "toast-middle-left",
        "MIDDLE_RIGHT": "toast-middle-right",
        "MIDDLE_CENTER": "toast-middle-center",
        //-------------------------------------------------------------------------------
        "version": "R18B0123",
        //-------------------------------------------------------------------------------
        text: function(message, position, delay, callbacks){
            var sn = Util.GUID();
            var id = "toast_" + sn;
            var _cbs = callbacks || {};

            $("body").append('<div id="' + id + '" class="toast ' + (position || Toast.MIDDLE_CENTER) + ' hidden">' + message + '</div>');

            var intValue = function(key, target){
                var computed = getComputedStyle(target, null);
                var val = computed[key] || "0";

                val = val.replace(/[^\d\.\-]+/g, "");

                val = parseInt(val, 10);
                val = isNaN(val) ? 0 : val;
                val = val + (val % 2);

                $(target).css(key, val + "px");

                return val;
            };

            var toastBox = $("#" + id);
            var toast = toastBox[0];
            
            if(_cbs.before && _cbs.before.callback){
                Util.execHandler(_cbs.before, [id]);
            }

            var paddingLeft = intValue("paddingLeft", toast);
            var paddingTop = intValue("paddingTop", toast);
            var paddingRight = intValue("paddingRight", toast);
            var paddingBottom = intValue("paddingBottom", toast);

            var rect = Util.getBoundingClientRect(toast);
            var width = Math.round(rect.width - (paddingLeft + paddingRight));
            var height = Math.round(rect.height - (paddingTop + paddingBottom));

            width = width + (width % 2);
            height = height + (height % 2);

            toastBox.css({
                "width": width + "px",
                "whiteSpace": "normal"
            });

            // 重新计算
            rect = Util.getBoundingClientRect(toast);
            width = Math.round(rect.width - (paddingLeft + paddingRight));
            height = Math.round(rect.height - (paddingTop + paddingBottom));

            width = width + (width % 2);
            height = height + (height % 2);

            toastBox.css({
                "width": width + "px",
                "height": height + "px"
            }).removeClass("hidden").addClass("show");

            if(_cbs.show && _cbs.show.callback){
                Util.execHandler(_cbs.show, [id]);
            }

            setTimeout(function(){
                $("#" + id).removeClass("show");

                if(_cbs.hide && _cbs.hide.callback){
                    Util.execHandler(_cbs.hide, [id]);
                }
                setTimeout(function(){
                    $("#" + id).remove();
                }, 1000);
            }, delay || 3000);
        }
    };

    var ToastSchema = {
        "schema": "toast",
        message: function(data, node, e, type){
            var args = (data || "").split(",");
            var msg = args[0];
            var pos = Toast[args[1] || "MIDDLE_CENTER"];
            var delay = Number(args[2] || 3000);

            Toast.text(msg, pos, delay);
        }
    };

    (function main(){
        Util.source(ToastSchema);
    })();

    module.exports = Toast;
});