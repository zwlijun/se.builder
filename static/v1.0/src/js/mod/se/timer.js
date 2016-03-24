/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 定时器
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.3
 */
;define(function (require, exports, module){
	           require("mod/se/raf");
	var Util = require("mod/se/util");

	var rAF = requestAnimationFrame;
    var cAF = cancelAnimationFrame;

    var Timer = function(fps, handler){
        this.fps = fps || 0;
        this.handler = handler || null;
        this.timerId = null;
        this.isRunning = false;
        this.elapsedTime = 0;
        this.element = null;
    };

    Timer.prototype = {
        setTimerFPS: function(fps){
            this.fps = fps;
        },
        setTimerHandler: function(handler){
            this.handler = handler;
        },
        setElement: function(el){
            this.element = el;
        },
        toFPS: function(millisecond){
            return 1000 / millisecond;
        },
        toMillisecond: function(fps){
            return 1000 / fps;
        },
        start: function(){
            var _ins = this;
            var now = (new Date().getTime());
            var lastTime = now;
            var time = now;

            if(true !== _ins.isRunning){
                _ins.isRunning = true;

                (function(){
                    time = (new Date().getTime());

                    if(_ins.fps === 0 || (_ins.fps > 0 && (time - lastTime) > (1000 / _ins.fps))){
                        _ins.elapsedTime = time - lastTime;

                        lastTime = time;
                        
                        Util.execAfterMergerHandler(_ins.handler, [_ins]);
                    }

                    if(true === _ins.isRunning){
                        _ins.timerId = _ins.element ? rAF(arguments.callee, _ins.element) : rAF(arguments.callee);
                    }
                })();
            }
        },
        stop: function(){
            if(true === this.isRunning){
                if(null != this.timerId){
                    cAF(this.timerId);
                    this.timerId = null;
                }

                this.isRunning = false;
            }
        },
        toggle: function(){
            if(true === this.isRunning){
                this.stop();
            }else{
                this.start();
            }
        }
    };

    Timer.TimerPool = {};

    module.exports = {
    	"getTimer": function(name, fps, handler){
            name = name || "timer_" + Util.GUID();
            fps = fps || 0;
            handler = handler || null;
            
            var timer = Timer.TimerPool[name] || (Timer.TimerPool[name] = new Timer(fps, handler));

            return timer;
        },
        "toFPS": function(millisecond){
            return 1000 / millisecond;
        },
        "toMillisecond": function(fps){
            return 1000 / fps;
        }
    };
});