/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * AudioVisualizer
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.9
 */
;define(function AV(require, exports, module){
    var Audio           = require("mod/se/audio");
    var Timer           = require("mod/se/timer");

    var GetDefaultAudioVisualizerOptions = function(){
        //options => {
        //    gradient         [require]填充样式
        //    visualizer       [require]可视化节点    
        //    energySize       [require]能量条数量
        //    energyWidth      [optional]能量条宽度
        //    energyGap        [optional]能量条间隙
        //    energyCapHeight  [optional]能量帽高度
        //    stayHeight       [optional]保留高度
        //}
        var options = {
            "gradient": null,
            "visualizer": null,
            "energySize": 0,
            "energyWidth": 10,
            "energyGap": 2,
            "energyCapHeight": 2,
            "stayHeight": 2
        };

        return options;
    };

    var AudioVisualizer = function(name){
        this.name = name;
        this.audio = Audio.newInstance(name);
        this.canvas = null;
        this.canvasContext = null;
        this.timer = Timer.getTimer(this.name, 60, null);
        this.backgroundImage = null;
        this.opts = {};
    };

    AudioVisualizer.prototype = {
        setVisualizerNode: function(canvas){
            var context = null;

            if(canvas){
                context = canvas.getContext("2d");
            }

            this.canvas = canvas;
            this.canvasContext = context;
        },
        getVisualizerNode: function(visualizerSelector){
            if(visualizerSelector){
                var canvas = document.querySelector(visualizerSelector);

                this.setVisualizerNode(canvas);
            }

            return {
                "renderNode": this.canvas,
                "renderContext": this.canvasContext
            };
        },
        createVisualizerNode: function(targetSelector){
            var selector = targetSelector + " #" + this.name + "_visulizer";
            var node = this.getVisualizerNode(selector);

            if(node.renderNode && node.renderContext){
                return node;
            }

            var _html = ''
                      + '<canvas id="' + this.name + '_visulizer"></canvas>'
                      + '';

            $(targetSelector).append(_html);

            return this.getVisualizerNode(selector);
        },
        setBackgroundImage: function(imgObj, cssObj){
            var img = imgObj || {};
            this.backgroundImage = $.extend(img, {
                "image": img.image || null,
                "width": img.width || 1280,
                "height": img.height || 720,
                "source": img.source || "",
                "type": img.type || "canvas"  // css | canvas
            });

            if(this.canvas && "css" === img.type){
                var node = $(this.canvas);
                var setted = node.attr("data-background-setted");

                if("1" !== setted){
                    var styles = $.extend({
                        "backgroundColor": "rgba(0, 0, 0, 0)",
                        "backgroundRepeat": "no-repeat",
                        "backgroundPosition": "center center",
                        "backgroundSize": "cover",
                        "backgroundImage": "url(" + img.source + ")"
                    }, cssObj || {});

                    $(this.canvas).css(styles);

                    node.attr("data-background-setted", "1");
                }
            }
        },
        getBackgroundImage: function(){
            return this.backgroundImage;
        },
        render: function(analyser){
            var options = this.opts;

            var gradient = options.gradient;
            var node = options.visualizer;
            var canvas = node.renderNode;
            var canvasContext = node.renderContext;

            var backgroundImage = this.getBackgroundImage();

            var energySize = options.energySize;
            var energyWidth = options.energyWidth;
            var energyGap = options.energyGap;
            var energyCapHeight = options.energyCapHeight;
            var stayHeight = options.stayHeight;

            var width = canvas.width;
            var height = canvas.height - stayHeight;

            var dataArray = new Uint8Array(analyser.frequencyBinCount);
            var step = Math.round(dataArray.length / energySize);
            var energy = 0;

            analyser.getByteFrequencyData(dataArray);

            canvasContext.clearRect(0, 0, width, height);

            if(backgroundImage && backgroundImage.image && "canvas" === backgroundImage.type){
                canvasContext.drawImage(backgroundImage.image, 0, 0, backgroundImage.width, backgroundImage.height);
            }

            for (var i = 0; i < energySize; i++){
                canvasContext.fillStyle = gradient;
                canvasContext.fillRect(
                    i * (energyWidth + energyGap), 
                    height, 
                    energyWidth, 
                    stayHeight
                );
            }

            var x = 0;
            var y = 0;
            var w = 0;
            var h = 0;
            for (var i = 0; i < energySize; i++){
                energy = dataArray[step * i];

                x = i * (energyWidth + energyGap);
                y = height - energy + energyCapHeight;
                w = energyWidth;
                h = height;

                if(y < 0){
                    y = 0;
                }

                // console.log("x: " + x + ", y: " + y + ", w: " + w + ", h: " + h);

                canvasContext.fillStyle = gradient;
                canvasContext.fillRect(x, y, w, h);
            }
        },
        fork: function(analyser, interval){
            var options = this.opts;

            if(interval > 0){
                this.timer.setTimerFPS(Timer.toFPS(interval));
            }

            this.timer.setTimerHandler({
                callback: function(_timer, _analyser, opts){
                    this.render(_analyser, opts);
                },
                args: [analyser, options],
                context: this
            });

            this.timer.start();
        },
        erase: function(opts){
            var options = (this.opts = $.extend(true, {}, GetDefaultAudioVisualizerOptions(), opts));
            var gradient = options.gradient;

            var node = options.visualizer;
            var canvas = node.renderNode;
            var canvasContext = node.renderContext;

            canvasContext.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < options.energySize; i++){
                canvasContext.fillStyle = options.gradient;
                canvasContext.fillRect(
                    i * (options.energyWidth + options.energyGap), 
                    canvas.height - options.stayHeight, 
                    options.energyWidth, 
                    options.stayHeight
                );
            }
        },
        destroy: function(){
            this.timer.stop();
            this.audio.destroy();

            this.timer = null;
            this.audio = null;

            if(null != this.canvas){
                $(this.canvas).remove();

                this.canvas = null;
                this.canvasContext = null;
            }

            //清除缓存
            var name = this.name;
            if(name in AudioVisualizer.Cache){
                AudioVisualizer.Cache[name] = null;

                delete AudioVisualizer.Cache[name];
            }
        }
    };

    AudioVisualizer.Cache = {};

    AudioVisualizer.newInstance = function(name){
        var av = AudioVisualizer.Cache[name] || (AudioVisualizer.Cache[name] = new AudioVisualizer(name));

        return {
            "audio": av.audio,
            "timer": av.timer,
            setVisualizerNode: function(canvas){
                av.setVisualizerNode(canvas);

                return this;
            },
            getVisualizerNode: function(visualizerSelector){
                return av.getVisualizerNode(visualizerSelector);
            },
            createVisualizerNode: function(targetSelector){
                return av.createVisualizerNode(targetSelector);
            },
            setBackgroundImage: function(imgObj, cssObj){
                av.setBackgroundImage(imgObj, cssObj);

                return this;
            },
            getBackgroundImage: function(){
                return av.getBackgroundImage();
            },
            fork: function(analyser, interval){
                av.fork(analyser, interval);

                return this;
            },
            render: function(analyser){
                av.render(analyser);

                return this;
            },
            erase: function(options){
                av.erase(options);

                return this;
            },
            destroy: function(){
                av.destroy();

                return this;
            }
        };
    };

    AudioVisualizer.getInstance = function(name){
        if(name in AudioVisualizer.Cache){
            return AudioVisualizer.newInstance(name);
        }

        return null;
    } 

    module.exports = {
        "version": "R17B1204",
        newInstance: function(name){
            return AudioVisualizer.newInstance(name);
        },
        getInstance: function(name){
            return AudioVisualizer.getInstance(name);
        },
        destroy: function(name){
            if(name){
                var ins = this.getInstance(name);

                if(ins){
                    ins.destroy();
                }
            }else{
                for(var n in AudioVisualizer.Cache){
                    if(AudioVisualizer.Cache.hasOwnProperty(n)){
                        this.destroy(n);
                    }
                }
            }
        }
    };   
});