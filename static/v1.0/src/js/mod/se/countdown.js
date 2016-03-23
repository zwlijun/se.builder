/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 倒计时(天，时，分，秒)
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.9
 */
;define(function (require, exports, module){
    var Timer         = require("mod/se/timer");
    var Util          = require("mod/se/util");
    var DateUtil      = require("mod/se/dateutil");

    var _CountDown = function(name, fps, handler){
        this.name = name;
        this.fps = fps || 0;
        this.handler = handler || null;
        this.timer = Timer.getTimer(name, fps || 0, null);
    };

    _CountDown.prototype = {
        setCountDownFPS: function(fps){
            this.fps = fps;
        },
        setCountDownHandler: function(handler){
            this.handler = handler;
        },
        getCountDownTimer: function(){
            return this.timer || null;
        },
        updateTimerFPS: function(fps){
            var timer = this.getCountDownTimer();

            if(null != timer){
                timer.setTimerFPS(fps);
            }

            this.setCountDownFPS(fps);
        },
        parse: function(value, interval){
            var dts = (function(t){
                var dt = {
                    "value": 0,
                    "interval": interval,
                    "stop": true
                };
                if(t > 0){
                    dt = {
                        "value": t,
                        "interval": interval,
                        "stop": false
                    };
                }
                return dt;
            })(value);

            return dts;
        },
        start: function(targetDate, currentDate, dateFormat, interval){
            var defaultDateFormat = "%y-%M-%d %h:%m:%s";
            var diff = 0;
            var g_time = 0;
            var _interval = interval || "s";

            currentDate = currentDate || new Date();

            if(typeof(targetDate) == "string"){
                targetDate = DateUtil.parse(targetDate, dateFormat || defaultDateFormat).date;
            }

            if(typeof(currentDate) == "string"){
                currentDate = DateUtil.parse(currentDate, dateFormat || defaultDateFormat).date;
            }

            diff = DateUtil.dateDiff(_interval, currentDate, targetDate);


            g_time = diff;
    
            this.timer.setTimerFPS(this.fps);
            this.timer.setTimerHandler({
                callback: function(_t, handler, __interval){
                    g_time--;

                    var dts = this.parse(g_time, __interval);

                    Util.execAfterMergerHandler(handler, [dts]);

                    if(dts.stop){
                        _t.stop();
                    }
                },
                context: this,
                args: [this.handler, _interval]
            });        
            this.timer.start();
        },
        stop: function(){
            if(this.timer){
                this.timer.stop();
            }
        }
    };

    _CountDown.CachePool = {};

    module.exports = {
        "getCountDown": function(name, fps, handler){
            name = name || "countdown_" + Util.GUID();
            handler = handler || null;
            
            var cd = _CountDown.CachePool[name] || (_CountDown.CachePool[name] = new _CountDown(name, fps, handler));

            return cd;
        },
        "toFPS": function(millisecond){
            return Timer.toFPS(millisecond);
        },
        "toMillisecond": function(fps){
            return Timer.toMillisecond(fps);
        }
    };
});