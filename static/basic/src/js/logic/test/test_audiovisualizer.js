;define(function(require, exports, module){
    var AudioVisualizer = require("mod/se/audiovisualizer");

    var av = AudioVisualizer.newInstance("test_av");

    var audio = av.audio;
    var timer = av.timer;
    var analyser = null;

    audio.set("support", {
        callback: function(supported, audioContext){
            $(".app-header").append("AudioContext is supported = " + supported);
        }
    });

    audio.set("playbefore", {
        callback: function(index){
            var audioData = this.getAudioData(index);

            var audioContext = audioData.audioContext;
            var source = audioData.source;

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;

            source.connect(analyser);
            analyser.connect(audioContext.destination);
        },
        context: audio
    });

    audio.set("playafter", {
        callback: function(index){
            var node = av.createVisualizerNode(".app-body");
            var canvas = node.renderNode;
            var canvasContext = node.renderContext;
            var options = {};
            var gradient = null;

            canvas.width = 640;
            canvas.height = 360;

            gradient = canvasContext.createLinearGradient(0, 0, 0, 500);
            gradient.addColorStop(1, '#0f0');
            gradient.addColorStop(0.5, '#ff0');
            gradient.addColorStop(0, '#f00');

            options.visualizer = node;
            options.gradient = gradient;
            options.energyWidth = 10;
            options.energyGap = 2;
            options.energyCapHeight = 2;
            options.stayHeight = 2;
            options.energySize = Math.round(canvas.width / (options.energyWidth + options.energyGap));

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

            av.render(analyser, options);
        },
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