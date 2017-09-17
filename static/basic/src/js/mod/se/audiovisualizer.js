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
        this.opts = {};
    };

    AudioVisualizer.prototype = {
        getVisualizerNode: function(visualizerSelector){
            if(visualizerSelector){
                this.canvas = document.querySelector(visualizerSelector);

                if(this.canvas){
                    this.canvasContext = this.canvas.getContext("2d");
                }
            }

            return {
                "renderNode": this.canvas,
                "renderContext": this.canvasContext
            };
        },
        createVisualizerNode: function(targetSelector){
            var node = this.getVisualizerNode(targetSelector + " #" + this.name + "_visulizer");

            if(node.renderNode && node.renderContext){
                return node;
            }

            var _html = ''
                      + '<canvas id="' + this.name + '_visulizer"></canvas>'
                      + '';

            $(targetSelector).append(_html);

            return this.getVisualizerNode(targetSelector + " #" + this.name + "_visulizer");
        },
        render: function(analyser){
            var options = this.opts;

            var gradient = options.gradient;
            var node = options.visualizer;
            var canvas = node.renderNode;
            var canvasContext = node.renderContext;

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
            for (var i = 0; i < energySize; i++){
                energy = dataArray[step * i];

                canvasContext.fillStyle = gradient;
                canvasContext.fillRect(
                    i * (energyWidth + energyGap), 
                    height - energy + energyCapHeight, 
                    energyWidth, 
                    height
                );
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
            getVisualizerNode: function(visualizerSelector){
                return av.getVisualizerNode(visualizerSelector);
            },
            createVisualizerNode: function(targetSelector){
                return av.createVisualizerNode(targetSelector);
            },
            render: function(analyser, options){
                av.render(analyser, options || {});

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
        "version": "R17B0917",
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