/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 标志监听
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.10
 */
;define(function(require, exports, module){
    var Util  = require("mod/se/util");
    var Timer = require("mod/se/timer"); 

    var flags = {};

    var _Watch = {
        register: function(key, checkValue){
            flags[key] = {
                "check": checkValue,
                "set": undefined,
                "timer": null
            };

            return _Watch;
        },
        unregister: function(key){
            if(key in flags){
                if(flags[key]["timer"]){
                    flags[key]["timer"].stop();
                }
                delete flags[key];
            }

            return _Watch;
        },
        update: function(key, value, restart){
            if(key in flags){
                flags[key]["set"] = value;

                if(true === restart && value !== flags[key]["check"] && flags[key]["timer"]){
                    flags[key]["timer"].start();
                }
            }

            return _Watch;
        },
        watch: function(key, handle){
            if(!(key in flags)){
                return 0;
            }

            var timer = flags[key]["timer"] = Timer.getTimer(key, 60, null);

            timer.setTimerHandler({
                callback: function(_t, _key, _handle){
                    var flag = flags[key];

                    if(flag.check === flag.set){
                        _t.stop();

                        Util.execHandler(_handle);
                    }
                },
                args: [key, handle]
            });

            timer.start();

            return _Watch;
        }
    };

    module.exports = _Watch;
});