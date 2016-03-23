/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 加密服务
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Encrypt(require, exports, module){    
    $.Request = require("mod/se/request");
    /**
     * 加密服务
     * @param Object options {
     *     String key 
     *     String origin
     *     String type
     *     int delay
     *     Boolean crossdomain
     *     Object before
     *     Object runtime
     *     Object complete
     *     Object success
     *     Object error
     *     Object timeout
     * }
     * @see request.head
     */
    var encrypt = function(options){
        var key = (options.key || "Data");
        var origin = options.origin;
        var type = options.type || "rsa";
        var delay = options.delay || 0;
        var crossdomain = options.crossdomain || false;
        var before = options.before || null;
        var success = options.success || null;
        var error = options.error || null;
        var timeout = options.timeout || null;
        var runtime = options.runtime || null;
        var complete = options.complete || null;

        $.Request.head({
            url : "/jbin/encrypt",
            delay : delay,
            crossdomain : crossdomain,
            heads : [
                {name: "X-Encrypt-Origin", value: origin},
                {name: "X-Encrypt-Key", value: key},
                {name: "X-Encrypt-Type", value: (type || "rsa")}
            ],
            before : before,
            success : success,
            error : error,
            timeout : timeout,
            complete : complete,
            runtime : runtime
        });
    };

    module.exports = {
        "encrypt" : encrypt
    }
});