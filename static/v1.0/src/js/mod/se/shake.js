/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 摇一摇
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.3
 */
;define(function (require, exports, module){
    var Util = require("mod/se/util");

    function Shake(handler, threshold, timeout){
        this.hasDeviceMotion = 'ondevicemotion' in window;

        this.handler = handler || null;    //摇一摇回调事件
        this.threshold = threshold || 15;  //对于摇一摇的默认速度阈值
        this.timeout = timeout || 1000;    //事件之间默认的时间间隔

        this.lastTime = new Date();

        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
    }

    Shake.prototype = {
        reset: function(){
            this.lastTime = new Date();
            this.lastX = null;
            this.lastY = null;
            this.lastZ = null;
        },
        on: function(){
            this.reset();

            if(this.hasDeviceMotion){
                window.addEventListener('devicemotion', this, false);
            }
        },
        off: function(){
            if(this.hasDeviceMotion){
                window.removeEventListener('devicemotion', this, false);
            }
            this.reset();
        },
        devicemotion: function (e){
            var current = e.accelerationIncludingGravity;
            var currentTime;
            var timeDifference;
            var deltaX = 0;
            var deltaY = 0;
            var deltaZ = 0;

            if((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)){
                this.lastX = current.x;
                this.lastY = current.y;
                this.lastZ = current.z;
                return;
            }

            deltaX = Math.abs(this.lastX - current.x);
            deltaY = Math.abs(this.lastY - current.y);
            deltaZ = Math.abs(this.lastZ - current.z);

            if(((deltaX > this.threshold) 
                 && (deltaY > this.threshold)) || ((deltaX > this.threshold) 
                    && (deltaZ > this.threshold)) || ((deltaY > this.threshold) 
                        && (deltaZ > this.threshold)))
            {
                currentTime = new Date();
                timeDifference = currentTime.getTime() - this.lastTime.getTime();

                if(timeDifference > this.timeout){
                    //todo
                    Util.execHandler(this.handler);
                    this.lastTime = new Date();
                }
            }

            this.lastX = current.x;
            this.lastY = current.y;
            this.lastZ = current.z;

        },
        //http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventListener
        handleEvent: function (e) {
            if(typeof(this[e.type]) === 'function'){
                return this[e.type](e);
            }
        }
    };

    Shake.ShakePool = {};

    module.exports = {
        getShake: function(name, handler, threshold, timeout){
            var shake = Shake.ShakePool[name] || (Shake.ShakePool[name] = new Shake(handler, threshold, timeout));

            return {
                "on": function(){
                    shake.on();

                    return this;
                },
                "off": function(){
                    shake.off();

                    return this;
                }
            }
        }
    };
});