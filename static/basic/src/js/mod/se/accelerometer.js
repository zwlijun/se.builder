/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 重力感应
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.3
 * @see http://www.w3.org/html/ig/zh/wiki/DeviceOrientation%E4%BA%8B%E4%BB%B6%E8%A7%84%E8%8C%83#deviceorientation_.E4.BA.8B.E4.BB.B6
 */
;define(function (require, exports, module){
    var Util = require("mod/se/util");

    var Accelerometer = function(handler){
        this.hasDeviceMotion = 'DeviceMotionEvent' in window;
        this.hasDeviceOrientation = "DeviceOrientationEvent" in window;

        this.handler = handler || null;

        this.gravity = {
            "x": 0,
            "y": 0,
            "z": 0
        };

        //以设备坐标系z轴为轴，旋转alpha度。alpha的作用域为[0, 360)。
        //以设备坐标系x轴为轴，旋转beta度。beta的作用域为[-180, 180)。
        //以设备坐标系y轴为轴，旋转gamma度。gamma的作用域为[-90, 90)。
        //设备的初始位置，地球（XYZ）与设备（zyz）坐标系重合。
        //设备以z轴为轴，旋转alpha度，原坐标x、y轴显示为x0、y0。
        //设备以x轴为轴，旋转beta度，原坐标y、z轴显示为y0、z0。
        //设备以y轴为轴，旋转beta度，原坐标x、z轴显示为x0、z0。
        //alpha、beta和gamma组成一组Z-X'-Y''式的固有Tait-Bryan角度。

        this.accelerometer = {
            "alpha": 0,   //z
            "beta": 0,    //x
            "gamma": 0    //y
        };
    };

    Accelerometer.prototype = {
        on: function(){
            if(this.hasDeviceOrientation){
                window.addEventListener("deviceorientation", this, false);
            }
            if(this.hasDeviceMotion){
                window.addEventListener("devicemotion", this, false);
            }
        },
        off: function(){
            if(this.hasDeviceOrientation){
                window.removeEventListener("deviceorientation", this, false);
            }
            if(this.hasDeviceMotion){
                window.removeEventListener("devicemotion", this, false);
            }
        },
        setAccelerometerHandler: function(handler){
            this.handler = handler;
        },
        devicemotion: function (e){
            var type = e.type;

            if("deviceorientation" == type){
                this.accelerometer = {
                    "alpha": e.alpha || 0,
                    "beta": e.beta || 0,
                    "gamma": e.gamma || 0
                }
            }

            if("devicemotion" == type){
                this.gravity = e.accelerationIncludingGravity;
            }

            Util.execHandler(this.handler, [e, this.gravity, this.accelerometer]);

        },
        //http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventListener
        handleEvent: function (e) {
            switch(e.type){
                case "deviceorientation":
                case "devicemotion":
                    this.devicemotion(e);
                break;
            }
        }
    };

    Accelerometer.MemCache = {};

    module.exports = {
        "version": "R15B0911",
        "getAccelerometer": function(name, handler){
            var acc = Accelerometer.MemCache[name] || (Accelerometer.MemCache[name] = new Accelerometer(handler));

            return {
                "on": function(){
                    acc.on();

                    return this;
                },
                "off": function(){
                    acc.off();

                    return this;
                },
                "setAccelerometerHandler": function(handler){
                    acc.setAccelerometerHandler(handler);

                    return this;
                }
            }
        }
    };
});