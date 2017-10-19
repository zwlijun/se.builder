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
        "version": "R171020",
        //-------------------------------------------------------------------------------
        text: function(message, position, delay){
            var sn = Util.GUID();
            var id = "toast_" + sn;

            $("body").append('<div id="' + id + '" class="toast ' + (position || Toast.MIDDLE_CENTER) + ' show">' + message + '</div>');

            setTimeout(function(){
                $("#" + id).removeClass("show");

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