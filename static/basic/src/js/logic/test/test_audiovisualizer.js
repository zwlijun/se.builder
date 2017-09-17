;define(function(require, exports, module){
    var AudioVisualizer = require("mod/se/audiovisualizer");

    var av = AudioVisualizer.newInstance("test_av");

    var audio = av.audio;
    var timer = av.timer;
    var analyser = null;
    var ac = audio.audioContext;

    var options = (function(){
        var node = av.createVisualizerNode(".app-body");
        var canvas = node.renderNode;
        var canvasContext = node.renderContext;
        var opts = {};
        var gradient = null;

        canvas.width = 640;
        canvas.height = 360;

        gradient = canvasContext.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, '#0f0');
        gradient.addColorStop(0.5, '#ff0');
        gradient.addColorStop(0, '#f00');

        opts.visualizer = node;
        opts.gradient = gradient;
        opts.energyWidth = 10;
        opts.energyGap = 2;
        opts.energyCapHeight = 2;
        opts.stayHeight = 2;
        opts.energySize = Math.round(canvas.width / (opts.energyWidth + opts.energyGap));

        return opts;
    })();

    audio.set("support", {
        callback: function(supported){
            $(".app-header").append("<p>AudioContext is supported = " + supported + "</p>");
        }
    });

    audio.set("playbefore", {
        callback: function(index, audioContext, audioVisualizer){
            var audioData = this.getAudioData(index);
            var source = audioData.source;

            source.addEventListener("ended", function(e){
                $(".app-header").append("<p>AudioContext :: Ended</p>");
                
                audioVisualizer.erase(options);

                source.removeEventListener("ended", arguments.callee);
            }, false);

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;

            source.connect(analyser);
            analyser.connect(audioContext.destination);
        },
        args: [ac, av],
        context: audio
    });

    audio.set("playafter", {
        callback: function(index, audioVisualizer){
            audioVisualizer.erase(options).render(analyser);
        },
        args: [av],
        context: audio
    });

    audio.set("decodecomplete", {
        callback: function(event, audioContext){
            this.play();
        },
        context: audio
    })

    audio.setAudioList([
        {
            "type": "remote",
            "name": "a",
            "url": "/static/basic/media/audio/a.mp3"
        }
    ]).load();
});