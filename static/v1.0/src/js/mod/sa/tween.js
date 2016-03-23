/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 缓动模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.7
 */
; define(function(require, exports, module){
    var Tween = {
        /**
         * 线性缓动，p(t) = t
         */
        Liner : {
            /**
             * 无效果
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeNone : function(time, begin, change, duration){
                return change * time / duration + begin;
            },
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return this.easeNone(time, begin, change, duration);
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return this.easeNone(time, begin, change, duration);
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                return this.easeNone(time, begin, change, duration);
            }
        },
        /**
         * 二次方的缓动，p(t) = t^2
         */
        Quadratic : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * (time /= duration) * time + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return -change * (time /= duration) * (time - 2) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if((time /= duration / 2) < 1){
                    return change / 2 * time * time + begin;
                }
                return -change / 2 * ((--time) * (time - 2) - 1) + begin;
            }
        },
        /**
         * 三次方的缓动，p(t) = t^3
         */
        Cubic : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * Math.pow(time / duration, 3) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return change * (Math.pow(time / duration - 1, 3) + 1) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if((time /= duration / 2) < 1){
                    return change / 2 * Math.pow(time, 3) + begin;
                }
                return change / 2 * (Math.pow(time - 2, 3) + 2) + begin;
            }
        },
        /**
         * 四次方的缓动，p(t) = t^4
         */
        Quartic : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * Math.pow(time / duration, 4) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return -change * (Math.pow(time / duration - 1, 4) - 1) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if((time /= duration / 2) < 1){
                    return change / 2 * Math.pow(time, 4) + begin;
                }
                return -change / 2 * (Math.pow(time - 2, 4) - 2) + begin;
            }
        },
        /**
         * 五次方的缓动，p(t) = t^5
         */
        Quintic : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * Math.pow(time / duration, 5) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return change * (Math.pow(time / duration - 1, 5) + 1) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if((time /= duration / 2) < 1){
                    return change / 2 * Math.pow(time, 6) + begin;
                }
                return change / 2 * (Math.pow(time - 2, 5) + 2) + begin;
            }
        },
        /**
         * 正弦曲线的缓动，p(t) = sin(t × π/2)
         */
        Sine : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * (1 - Math.cos(time / duration * (Math.PI / 2))) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return change * Math.sin(time / duration * (Math.PI / 2)) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                return change / 2 * (1 - Math.cos(Math.PI * time / duration)) + begin;
            }
        },
        /**
         * 指数曲线的缓动，p(t) = 2^10(t-1)
         */
        Expo : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * Math.pow(2, 10 * (time / duration - 1)) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return change * (-Math.pow(2, -10 * time / duration) + 1) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if((time /= duration / 2) < 1){
                    return change / 2 * Math.pow(2, 10 * (time - 1)) + begin;
                }
                return change / 2 * (-Math.pow(2, -10 * --time) + 2) + begin;
            }
        },
        /**
         * 圆形曲线的缓动，p(t) = 1 - √1 - t ²
         */
        Circular : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change * (1 - Math.sqrt(1 - (time /= duration) * time)) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                return change * Math.sqrt(1 - (time = time / duration - 1) * time) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if ((time /= duration / 2) < 1){
                    return change / 2 * (1 - Math.sqrt(1 - time * time)) + begin;
                }
                return change / 2 * (Math.sqrt(1 - (time -= 2) * time) + 1) + begin;
            }
        },
        /**
         * 指数衰减的正弦曲线缓动。
         */
        Elastic : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             * @param a 正弦波振幅（默认为 0）
             * @param p 正弦波周期（默认为 0）
             */
            easeIn : function(time, begin, change, duration, a, p){
                if(time == 0){
                    return begin;
                }
                if((time /= duration) == 1){
                    return begin + change;
                }
                if(!p){
                    p = duration * 0.3;
                }
                if(!a || a < Math.abs(change)){
                    a = change;
                    var s = p / 4;
                }else{
                    var s = p / (2 * Math.PI) * Math.asin (change / a);
                }
                return -(a * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s) * (2 * Math.PI) / p)) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             * @param a 正弦波振幅（默认为 0）
             * @param p 正弦波周期（默认为 0）
             */
            easeOut : function(time, begin, change, duration, a, p){
                if(time == 0){
                    return begin;
                }
                if((time /= duration) == 1){
                    return begin + change;
                }
                if(!p){
                    p= duration * 0.3;
                }
                if(!a || a < Math.abs(change)){
                    a = change;
                    var s = p / 4;
                }else{
                    var s = p / (2 * Math.PI) * Math.asin(change / a);
                }
                return (a * Math.pow(2, -10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / p) + change + begin);
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             * @param a 正弦波振幅（默认为 0）
             * @param p 正弦波周期（默认为 0）
             */
            easeInOut : function(time, begin, change, duration, a, p){
                if(time == 0){
                    return begin;
                }
                if((time /= duration / 2) == 2){
                    return begin + change;
                }
                if(!p){
                    p = duration * (.3 * 1.5);
                }
                if(!a || a < Math.abs(change)){
                    a = change;
                    var s = p / 4;
                }else{
                    var s = p / (2 * Math.PI) * Math.asin(change / a);
                }
                if (time < 1){
                    return -.5 * (a * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s) * (2 * Math.PI) / p )) + begin;
                }
                return a * Math.pow(2, -10 * (time -= 1)) * Math.sin((time * duration - s) * (2 * Math.PI) / p) * .5 + change + begin;
            }
        },
        /**
         * 指数衰减的反弹缓动。
         */
        Bounce : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeIn : function(time, begin, change, duration){
                return change - this.easeOut(duration - time, 0, change, duration) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeOut : function(time, begin, change, duration){
                if((time /= duration) < (1 / 2.75)){
                    return change * (7.5625 * time * time) + begin;
                }else if(time < (2/2.75)){
                    return change * (7.5625 * (time -= (1.5 / 2.75)) * time + .75) + begin;
                }else if(time < (2.5 / 2.75)){
                    return change * (7.5625 * (time -= (2.25 / 2.75)) * time + .9375) + begin;
                }else{
                    return change * (7.5625 * (time -= (2.625 / 2.75)) * time + .984375) + begin;
                }
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             */
            easeInOut : function(time, begin, change, duration){
                if (time < duration / 2){
                    return this.easeIn(time * 2, 0, change, duration) * .5 + begin;
                }
                return this.easeOut(time * 2 - duration, 0, change, duration) * .5 + change * .5 + begin;
            }
        },
        /**
         * 超过范围的三次方缓动。
         */
        Back : {
            /**
             * 渐进（由慢到快）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             * @param s (default = 0)Specifies the amount of overshoot, where the higher the value, the greater the overshoot.
             */
            easeIn : function(time, begin, change, duration, s){
                if(s == undefined){
                    s = 1.70158;
                }
                return change * (time /= duration) * time * ((s + 1) * time - s) + begin;
            },
            /**
             * 渐出（由快到慢）
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             * @param s (default = 0)Specifies the amount of overshoot, where the higher the value, the greater the overshoot.
             */
            easeOut : function(time, begin, change, duration, s){
                if(s == undefined){
                    s = 1.70158;
                }
                return change * ((time = time / duration - 1) * time * (( s + 1) * time + s) + 1) + begin;
            },
            /**
             * 渐进渐出
             * @param time 时间点
             * @param begin 起始位置
             * @param change 区间改变量（结束位置 - 起始位置）
             * @param duration 持续的时间
             * @param s (default = 0)Specifies the amount of overshoot, where the higher the value, the greater the overshoot.
             */
            easeInOut : function(time, begin, change, duration, s){
                if(s == undefined){
                    s = 1.70158;
                }
                if((time /= duration / 2) < 1){
                    return change / 2 * (time * time * (((s *= (1.525)) + 1) * time - s)) + begin;
                }
                return change / 2 * ((time -= 2) * time * (((s *= (1.525)) + 1) * time + s) + 2) + begin;
            }
        }
    };

    module.exports = Tween;
});