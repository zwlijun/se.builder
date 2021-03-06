/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * LivePlayer模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.10 
 */
;define(function LivePlayer(require, exports, module){
    var TemplateEngine        = require("mod/se/template");
    var Util                  = require("mod/se/util");
    var DataType              = require("mod/se/datatype");
    var Listener              = require("mod/se/listener");
    var Timer                 = require("mod/se/timer");
    var Detect                = require("mod/se/detect");
    var Request               = require("mod/se/request");
    var FullScreen            = require("mod/se/fullscreen");
    var AudioVisualizer       = require("mod/se/audiovisualizer");
    var MIME                  = require("mod/se/mime");
    var HandleStack           = Listener.HandleStack;
    var Env                   = Detect.env;

    var LivePlayerTemplate = TemplateEngine.getTemplate("mod_liveplayer", {
        "root": "liveplayer"
    }); 

    var MediaError = ("MediaError" in window) ? window["MediaError"] : {
        MEDIA_ERR_ABORTED: 1,
        MEDIA_ERR_NETWORK: 2,
        MEDIA_ERR_DECODE: 3,
        MEDIA_ERR_SRC_NOT_SUPPORTED: 4
    };

    var MediaNetworkState = {
        NETWORK_EMPTY: 0,      //音频/视频尚未初始化
        NETWORK_IDLE: 1,       //音频/视频是活动的且已选取资源，但并未使用网络
        NETWORK_LOADING: 2,    //浏览器正在下载数据
        NETWORK_NO_SOURCE: 3   //未找到音频/视频来源
    };

    var MediaReadyState = {
        HAVE_NOTHING: 0,       //没有关于音频/视频是否就绪的信息
        HAVE_METADATA: 1,      //关于音频/视频就绪的元数据
        HAVE_CURRENT_DATA: 2,  //关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
        HAVE_FUTURE_DATA: 3,   //当前及至少下一帧的数据是可用的
        HAVE_ENOUGH_DATA: 4    //可用数据足以开始播放
    };

    var MEDIA_TEMPLATE = ''
                       + '<div class="liveplayer-frame disable-select use-<%=liveplayer.appearance%> <%=liveplayer.type%>" id="<%=liveplayer.name%>" style="width: <%=liveplayer.width%>; height: <%=liveplayer.height%>;">'
                       + '  <%if("none" != liveplayer.appearance && true === liveplayer.showNavigationBar){%>'
                       + '  <div class="liveplayer-navbar flexbox middle justify">'
                       + '    <a href="<%=liveplayer.back%>" class="liveplayer-back icofont"></a>'
                       + '    <span class="liveplayer-title ellipsis"><%=liveplayer.title%></span>'
                       + '  </div>'
                       + '  <%}%>'
                       + '  <%if(liveplayer.controls && "define" == liveplayer.appearance){%>'
                       + '  <div class="liveplayer-controlbar">'
                       + '    <div class="liveplayer-progressbar<%="live" == liveplayer.type ? " hidden" : ""%>" data-action-touchstart="liveplayer://progress/seek#<%=liveplayer.name%>">'
                       + '      <div class="liveplayer-progressbar-buffered" style="width: 0%"></div>'
                       + '      <div class="liveplayer-progressbar-seeked" style="width: 0%"></div>'
                       + '      <div class="liveplayer-progressbar-seeked-bar"></div>'
                       + '    </div>'
                       + '    <div class="liveplayer-control flexbox middle justify">'
                       + '      <div class="liveplayer-control-state flexbox middle left <%=liveplayer.autoplay ? "play" : "pause"%>">'
                       + '        <cite class="liveplayer-button-play icofont" data-action-click="liveplayer://swapState#<%=liveplayer.name%>"></cite>'
                       + '        <%if("live" != liveplayer.type){%>'
                       + '        <span class="liveplayer-timeseek">00:00:00/00:00:00</span>'
                       + '          <%if(true === liveplayer.allowChangePlaybackRate){%>'
                       + '          <span class="liveplayer-rate flexbox middle center" data-action-click="liveplayer://playback/rate#<%=liveplayer.name%>"><%=(liveplayer.defaultPlaybackRate).toFixed(1)%>&ensp;x</span>'
                       + '          <%}%>'
                       + '        <%}%>'
                       + '      </div>'
                       + '      <div class="liveplayer-control-player flexbox middle right">'
                       + '        <%if(liveplayer.allowAdjustVolume){%>'
                       + '        <div class="liveplayer-button-volume flexbox middle justify">'
                       + '          <b class="icofont" data-action-click="liveplayer://volume/muted#<%=liveplayer.name%>"></b>'
                       + '          <code>'
                       + '            <i></i>'
                       + '          </code>'
                       + '        </div>'
                       + '        <%}%>'
                       + '        <%if(liveplayer.allowFullScreen && "audio" != liveplayer.type){%>'
                       + '        <cite class="liveplayer-button-fullscreen icofont fullscreen" data-action-click="liveplayer://fullscreen#<%=liveplayer.name%>"></cite>'
                       + '        <%}%>'
                       + '      </div>'
                       + '    </div>'
                       + '  </div>'
                       + '  <%}%>'
                       + '  <div class="liveplayer-master" data-action-click="liveplayer://swapBars#<%=liveplayer.name%>" style="width: <%=liveplayer.width%>; height: <%=liveplayer.height%>;">'
                       + '    <<%="audio" == liveplayer.type ? "audio" : "video"%> class="liveplayer-media" style="width: <%=liveplayer.width%>; height: <%=liveplayer.height%>;" '
                       + '      <%=liveplayer.loop ? " loop" : ""%> '
                       + '      <%=liveplayer.autoplay ? " autoplay" : ""%> '
                       + '      <%=liveplayer.muted ? " muted" : ""%> '
                       + '      <%=(liveplayer.controls &&  "native" == liveplayer.appearance) ? " controls" : ""%> '
                       + '      preload="<%=liveplayer.preload%>" '
                       + '      poster="<%=liveplayer.poster%>" '
                       + '      x-webkit-airplay="allow" '
                       + '      webkit-playsinline="true" '
                       + '      playsinline="true" '
                       + '      <%if(liveplayer.crossOrigin){%>'
                       + '      crossOrigin="<%=liveplayer.crossOrigin%>"'
                       + '      <%}%>'
                       + '      <%if(liveplayer.x5h5){%>'
                       + '      x5-video-player-type="<%=liveplayer.x5h5%>" '
                       + '      <%}%>'
                       + '      <%if("true" == liveplayer.x5fullscreen || "false" == liveplayer.x5fullscreen){%>'
                       + '      x5-video-player-fullscreen="<%=liveplayer.x5fullscreen%>" '
                       + '      <%}%>'
                       + '      <%if(liveplayer.x5orientation){%>'
                       + '      x5-video-orientation="<%=liveplayer.x5orientation%>" '
                       + '      <%}%>'
                       + '      <%if(!liveplayer.contextmenu){%>'
                       + '      oncontextmenu="return false;" '
                       + '      <%}%>'
                       + '    >'
                       + '    <%if(liveplayer.meta){%>'
                       + '      <%if(liveplayer.meta.type){%>'
                       + '      <source src="<%=liveplayer.meta.source%>" type="<%=liveplayer.meta.type%>" />'
                       + '      <%}else{%>'
                       + '      <source src="<%=liveplayer.meta.source%>" />'
                       + '      <%}%>'
                       + '    <%}%>'
                       + '      <%=liveplayer.notsupport%>'
                       + '    </<%="audio" == liveplayer.type ? "audio" : "video"%>>'
                       + '    <canvas class="liveplayer-visualizer hide"></canvas>'
                       + '    <div class="liveplayer-master-mask flexbox middle center<%=(liveplayer.autoplay || "native" === liveplayer.appearance) ? " hide" : ""%>">'
                       + '       <%if("audio" == liveplayer.type){%>'
                       + '       <sub class="icofont disabled" data-action-click="liveplayer://prev#<%=liveplayer.name%>"></sub>'
                       + '       <%}%>'
                       + '       <ins class="icofont" data-action-click="liveplayer://play#<%=liveplayer.name%>"></ins>'
                       + '       <%if("audio" == liveplayer.type){%>'
                       + '       <sup class="icofont disabled" data-action-click="liveplayer://next#<%=liveplayer.name%>"></sup>'
                       + '       <%}%>'
                       + '    </div>'
                       + '  </div>'
                       + '</div>'
                       + '';

    var _seek_start = ("ontouchstart" in document) ? "touchstart.liveplayer_seek" : "mousedown.liveplayer_seek";
    var _seek_move = ("ontouchmove" in document) ? "touchmove.liveplayer_seek" : "mousemove.liveplayer_seek";
    var _seek_end = ("ontouchend" in document) ? "touchend.liveplayer_seek" : "mouseup.liveplayer_seek";

    var _volume_start = ("ontouchstart" in document) ? "touchstart.liveplayer_volume" : "mousedown.liveplayer_volume";
    var _volume_move = ("ontouchmove" in document) ? "touchmove.liveplayer_volume" : "mousemove.liveplayer_volume";
    var _volume_end = ("ontouchend" in document) ? "touchend.liveplayer_volume" : "mouseup.liveplayer_volume";

    var MAX_VOLUME = 10;

    var LivePlayerSchema = {
        schema: "liveplayer",
        swapState: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);
            var state = player.getLivePlayerMasterControlState();

            if(player){
                if(state.hasClass("play")){
                    player.pause();
                }else if(state.hasClass("pause")){
                    player.play();
                }
            }
        },
        swapBars: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);
            var frame = player.getLivePlayerFrame();
            var timer = player.watch();
            var video = player.getLivePlayerMasterMedia(true);

            if(player.isAudio()){
                timer.stop();
                frame.removeClass("hidebars");

                return;
            }

            if(video && video.paused){
                frame.removeClass("hidebars");
  
                return ;
            }

            frame.toggleClass("hidebars");

            timer.stop();
            if(!frame.hasClass("hidebars")){
                timer.start();
            }
        },
        play: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);
            var mask = player.getLivePlayerMasterMask();

            if(!mask.hasClass("liveplayer-error") && !node.hasClass("use-native")){
                if(node.hasClass("pause")){
                    player.pause();
                }else{
                    player.play();
                }
            }
        },
        prev: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);

            if(node.hasClass("disabled")){
                return ;
            }

            var index = player.getSourceIndex();
            var prevIndex = index - 1;

            if(prevIndex < 0){
                node.addClass("disabled");
                return ;
            }

            player.gotoAndPlay(prevIndex);
        },
        next: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);

            if(node.hasClass("disabled")){
                return ;
            }

            var index = player.getSourceIndex();
            var list = player.getSourceList();
            var size = list.length;
            var lastIndex = size - 1;
            var nextIndex = index + 1;

            if(nextIndex > lastIndex){
                node.addClass("disabled");
                return ;
            }

            player.gotoAndPlay(nextIndex);
        },
        fullscreen: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);

            if(player){
                if(player.isFullScreen()){
                    player.exitFullscreen();
                }else{
                    player.requestFullscreen();
                }
            }
        },
        reconnect: function(data, node, e, type){
            e && e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];
            var code = args[1];

            var player = LivePlayer.getLivePlayer(name);
            var onreconnect = player.get("reconnect");

            if(onreconnect){
                player.exec("reconnect", [name, code, {
                    callback: function(){
                        // this.destroy(false);
                        // this.render(true);
                        this.updateMasterSource(
                            this.getCurrentSourceMetaData()
                        );

                        this.play();
                    },
                    context: player
                }]);
            }else{
                // player.destroy(false);
                // player.render(true);
                player.updateMasterSource(
                    player.getCurrentSourceMetaData()
                );

                player.play();
            }
        },
        progress: {
            seek: function(data, node, e, type){
                e && e.stopPropagation();

                var evt = ("changedTouches" in e ? e["changedTouches"][0] : e);
                var args = (data || "").split(",");
                var name = args[0];

                var player = LivePlayer.getLivePlayer(name);

                if(player.isLive()){
                    return ;
                }

                player.seekToMouse(evt.pageX);
            }
        },
        volume: {
            muted: function(data, node, e, type){
                e && e.stopPropagation();
                e && e.preventDefault();

                var args = (data || "").split(",");
                var name = args[0];

                var player = LivePlayer.getLivePlayer(name);
                var video = null;

                if(!player){
                    return ;
                }

                if(node.hasClass("muted")){
                    player.setMuted(false);
                    node.removeClass("muted");
                }else{
                    player.setMuted(true);
                    node.addClass("muted");
                }
            }
        },
        playback: {
            rate: function(data, node, e, type){
                e && e.stopPropagation();
                
                var args = (data || "").split(",");
                var name = args[0];

                var player = LivePlayer.getLivePlayer(name);
                var video = null;

                if(!player){
                    return ;
                }

                var rates = player.options("rates");
                var items = rates.split(" ");
                var size = items.length;
                var rateIndex = Number(node.attr("data-liveplayer-rateIndex") || 1);
                var nextRateIndex = rateIndex + 1;

                var rate = Number(items[rateIndex]);

                nextRateIndex = nextRateIndex >= size ? 0 : nextRateIndex;

                node.attr("data-liveplayer-rateIndex", nextRateIndex);

                console.log("LivePlayer#" + name + "/rates(" + rates + ") => " + rate);

                player.setPlaybackRate(rate);

                node.html(rate.toFixed(1) + "&ensp;x");
            }
        }
    };
    /**
    <element
      data-liveplayer="播放器实例名称" 
      data-liveplayer-type="播放器类型，[vod|live|audio]" 
      data-liveplayer-back="返回URL" 
      data-liveplayer-title="视频标题" 
      data-liveplayer-width="宽度，默认：100%" 
      data-liveplayer-height="高度，默认：100%" 
      
      data-liveplayer-time="控制条及标题栏停留时长，默认：3000毫秒" 
      data-liveplayer-stateInterval="状态监听周期，默认：1000毫秒"

      data-liveplayer-showNavigationBar="是否显示导航栏，1 - 显示， 0 - 不显示"

      data-liveplayer-allowFullScreen="是否允许显示全屏菜单，1 - 显示， 0 - 不显示" 
      data-liveplayer-allowAdjustVolume="是否允许调节音量， 1 - 允许， 0 - 不允许"
      
      data-liveplayer-volume="默认音量 7"
      
      data-liveplayer-allowChangePlaybackRate="是否允许改变播放速率（仅在vod模式下有效）， 1 - 允许  0 - 不允许"
      data-liveplayer-defaultPlaybackRate="默认播放速率 1.0"
      data-liveplayer-playbackRate="当前播放速率 1.0" 
      data-liveplayer-rates="1.0 1.5 2.0 3.0" 

      data-liveplayer-errorMessageMode="错误消息显示方式， default - 模块默认显示  custom - 通回调自行设置"

      data-liveplayer-source="视频地址或地址列表，多个地址间用英文逗号“,”分隔，格式：mimetype:media_source[,mimetype:media_source]" 
      data-liveplayer-sourceIndex="初始播放视频地址索引" 
      data-liveplayer-autonext="是否为自动播放下一个地址，1 - 自动播放， 0 - 需要点击播放"
      data-liveplayer-poster="视频poster图片地址" 
      data-liveplayer-preload="预加载，auto - 当页面加载后载入整个视频 meta - 当页面加载后只载入元数据 none - 当页面加载后不载入视频" 
      data-liveplayer-loop="是否设置循环播放，1 - 循环， 0 - 单播" 
      data-liveplayer-autoplay="是否设置为自动播放， 1 - 自动播放， 0 - 需要点击播放" 
      data-liveplayer-muted="是否设置为禁用， 1 - 禁音， 0 - 不禁音" 
      data-liveplayer-controls="是否显示控制条， 1 - 显示， 0 - 不显示"
      data-liveplayer-appearance="播放器外观，define - 自定义 native - 系统默认样式 none - 无外观仅播放窗口"
      data-liveplayer-x5h5="设置腾讯X5内核播放器H5属性 h5/h5-page"
      data-liveplayer-x5fullscreen="设置腾讯X5内核播放器全屏模式 true|false"
      data-liveplayer-x5­orientation="设置腾讯X5内核视频的横竖屏  landscape 横屏, portraint竖屏"

      data-liveplayer-crossOrigin="跨域设置  *|anonymous|use-credentials，默认不设置"

      data-liveplayer-contextmenu="是否允许视频区的contextmenu 1 - 允许 0 - 不允许"

      data-liveplayer-notsupport="对不支持的情况下的提示信息"
      data-liveplayer-visualizerBackgroundImage="音频可视化背景图片"
      data-liveplayer-visualizerInterval="音频可视化动态刷新间隔时间(ms)"
      data-liveplayer-visualizer="音频可视化模式  auto - 如果type为audio就加载, force - 强制加载, none - 不使用vistualizer"
      data-liveplayer-visualizerCorssOrigin="加载视频化音频频谱时，如果没有设置crossOrigin就取该值"
    ></element>
    **/
    var GetDefaultOptions = function(){
        var options = {
            type: "live",
            back: "#",
            title: "&nbsp;",
            width: "100%",
            height: "100%",
            time: 12000,
            stateInterval: 1000,
            showNavigationBar: true,
            allowFullScreen: true,
            allowAdjustVolume: true,
            allowChangePlaybackRate: false,
            volume: 7,
            defaultPlaybackRate: 1.0,
            playbackRate: 1.0,
            rates: "1.0 1.5 2.0 3.0",
            errorMessageMode: "default",
            source: "",
            sourceIndex: 0,
            autonext: true,
            poster: "",
            preload: "auto",
            loop: false,
            autoplay: true,
            muted: false,
            controls: true,
            crossOrigin: "",
            contextmenu: false,
            appearance: "define",
            x5h5: "h5-page",
            x5fullscreen: "",
            x5orientation: "",
            visualizerBackgroundImage: "",
            visualizerInterval: 0,
            visualizer: "auto",
            visualizerCorssOrigin: "",
            notsupport: "Your browser does not support HTMLMediaElement, please use IE10+, Chrome, Firefox, Safari etc modern browser."
        };

        return options;
    };

    //event order:
    //1. loadstart
    //2. durationchange
    //3. loadedmetadata
    //4. loadeddata
    //5. progress
    //6. canplay
    //7. canplaythrough

    var LivePlayer = function(name, options){
        this.name = name;

        this.opts = $.extend(true, {}, GetDefaultOptions(), options || {});

        this.isListened = false;
        this.sourceList = [];
        this.sourceIndex = 0;
        this.allowHideBars = true;
        this.forceLockBars = false;

        this.stateTimer = null;
        this.statusBarTimer = null;

        this.readyState = MediaReadyState.HAVE_NOTHING;
        this.networkState = MediaNetworkState.NETWORK_EMPTY;

        this.visualizer = AudioVisualizer.newInstance(name);

        this.handleStack = new HandleStack();
        this.events = {
            onabort: null,                  //Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.
            oncanplay: null,                //在媒体数据已经有足够的数据（至少播放数帧）可供播放时触发。这个事件对应CAN_PLAY的readyState。
            oncanplaythrough: null,         //在媒体的readyState变为CAN_PLAY_THROUGH时触发，表明媒体可以在保持当前的下载速度的情况下不被中断地播放完毕。注意：手动设置currentTime会使得firefox触发一次canplaythrough事件，其他浏览器或许不会如此。
            ondurationchange: null,         //元信息已载入或已改变，表明媒体的长度发生了改变。例如，在媒体已被加载足够的长度从而得知总长度时会触发这个事件。
            onemptied: null,                //The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
            onended: null,                  //播放结束时触发。
            onerror: null,                  //在发生错误时触发。元素的error属性会包含更多信息。参阅Error handling获得详细信息。
            onloadeddata: null,             //媒体的第一帧已经加载完毕。
            onloadedmetadata: null,         //媒体的元数据已经加载完毕，现在所有的属性包含了它们应有的有效信息。
            onloadstart: null,              //在媒体开始加载时触发。
            onpause: null,                  //播放暂停时触发
            onplay: null,                   //在媒体回放被暂停后再次开始时触发。即，在一次暂停事件后恢复媒体回放。
            onplaying: null,                //在媒体开始播放时触发（不论是初次播放、在暂停后恢复、或是在结束后重新开始）。
            onprogress: null,               //告知媒体相关部分的下载进度时周期性地触发。有关媒体当前已下载总计的信息可以在元素的buffered属性中获取到。
            onratechange: null,             //在回放速率变化时触发。
            onseeked: null,                 //在跳跃操作完成时触发。
            onseeking: null,                //在跳跃操作开始时触发。
            onstalled: null,                //Sent when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
            onsuspend: null,                //在媒体资源加载终止时触发，这可能是因为下载已完成或因为其他原因暂停。
            ontimeupdate: null,             //元素的currentTime属性表示的时间已经改变。
            onvolumechange: null,           //在音频音量改变时触发（既可以是volume属性改变，也可以是muted属性改变）。
            onwaiting: null,                //在一个待执行的操作（如回放）因等待另一个操作（如跳跃或下载）被延迟时触发。
            //----------------------------------------------------------------------------------------------
            onreconnect: null,              //点击重试或刷新时执行的回调，如果有设置，就先执行回调，再调用相关业务逻辑
            onruntimeexception: null,       //播放器运行期异常
            onbeforerender: null,           //在渲染之前执行，可以更改配置，视频源等
            onrender: null,                 //渲染LivePlayer后执行
            onstatechange: null,            //媒体状态监听
            onwebkitbeginfullscreen: null,  //进入全屏模式(iOS)
            onwebkitendfullscreen: null,    //退出全屏模式(iOS)
            onfullscreenchange: null,       //进入或退出全屏触发
            onfullscreenerror: null,        //进入或退出全屏发生错误触发
            onx5videoenterfullscreen: null, //进入全屏模式(Tencent X5)
            onx5videoexitfullscreen: null,  //退出全屏模式(Tencent X5)
            onrequestfullscreen: null,      //请求进入全屏时触发
            onexitfullscreen: null,         //请求退出全屏时触发
            //------------------------------------------------------------------------------------------------
            onvisualizerrenderbefore: null  //音频频谱可视化渲染之前
        };
        this.listner = new Listener(this.events, this.handleStack);
    };

    LivePlayer.prototype = {
        //默认处理器
        LivePlayerProcessor: {
            "timeupdate": function(e){
                var master = this.getLivePlayerMasterMedia(true);
                var duration = master.duration;
                var currentTime = master.currentTime;

                if(duration > 0){
                    var percent = currentTime / duration;
                    var s = Math.min(percent * 100, 100) + "%";

                    this.updateTimeSeek(currentTime, duration);
                    this.updateProgress(s);

                    if(master.error){
                        this.error(master.error);
                    }
                }
            },
            "durationchange": function(e){
                var master = this.getLivePlayerMasterMedia(true);
                var duration = master.duration;
                var currentTime = master.currentTime;

                if(duration > 0){
                    var percent = currentTime / duration;
                    var s = Math.min(percent * 100, 100) + "%";

                    this.updateTimeSeek(currentTime, duration);
                    this.updateProgress(s);

                    if(master.error){
                        this.error(master.error);
                    }
                }
            },
            "loadstart": function(e){
                this.message("正在缓冲，请稍候...");
            },
            "waiting": function(e){
                this.message("正在缓冲，请稍候...");
            },
            "canplay": function(e){
                this.message();
            },
            "seeking": function(e){
                // this.message("正在缓冲，请稍候...");
            },
            "seeked": function(e){
                // this.message();
            },
            "progress": function(e){
                if(this.isVOD()){
                    var master = this.getLivePlayerMasterMedia(true);

                    var buffered = master.buffered;
                    var timeBuffered = 0;
                    var duration = master.duration;
                    var percent = 0;

                    if(buffered.length != 0){
                        timeBuffered = buffered.end(Math.max(buffered.length - 2, 0));
                        percent = (timeBuffered / duration);
                        
                        this.updateBufferedProgress(percent);
                    }else{
                        this.updateBufferedProgress(0);
                    }
                }
            },
            "pause": function(e){
                var frame = this.getLivePlayerFrame();
                var mask = this.getLivePlayerMasterMask();
                var master = this.getLivePlayerMasterMedia(true);

                if(master.error){
                    this.error(master.error);
                }else{
                    this.updatePlayStateUI();
                    this.updateLivePlayerBarsStateUI();
                }
            },
            "play": function(e){
                this.updatePlayStateUI();
                this.updateNextButton();
                this.updatePrevButton();
            },
            "playing": function(e){
                var mask = this.getLivePlayerMasterMask();

                if(!this.isAudio()){
                    mask.addClass("hide");
                }else{
                    mask.removeClass("hide");
                }
                this.updatePlayStateUI();
            },
            "ended": function(e){
                if(this.isVOD() || this.isAudio()){
                    if(this.options("autonext")){
                        var nextIndex = this.getSourceIndex() + 1;
                        var list = this.getSourceList();
                        var lastIndex = list.length - 1;

                        if(nextIndex > lastIndex){
                            if(this.options("loop")){
                                this.gotoAndPlay(0);
                            }else{
                                this.updateLivePlayerBarsStateUI();
                            }
                        }else{
                            this.gotoAndPlay(this.getSourceIndex() + 1);
                        }
                    }
                }else{
                    this.updateLivePlayerBarsStateUI();
                }
            },
            "error": function(e){
                var master = this.getLivePlayerMasterMedia(true);

                if(master.error){
                    this.error(master.error);
                }
            },
            "abort": function(e){
                var master = this.getLivePlayerMasterMedia(true);

                if(master.error){
                    this.error(master.error);
                }
            },
            "emptied": function(e){
                var master = this.getLivePlayerMasterMedia(true);

                if(master.error){
                    this.error(master.error);
                }
            }
        },
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listner.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listner.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listner.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listner.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listner.clear();
        },
        /**
         * [getHandleStack description]
         * @return {[type]} [description]
         */
        getHandleStack: function(){
            return this.handleStack;
        },
        getLivePlayerName: function(){
            return this.name;
        },
        options: function(){
            var args = arguments;
            var size = args.length;
            var opts = this.opts;

            if(0 === size){
                return opts;
            }else if(1 === size){
                if(DataType.isObject(args[0])){
                    this.opts = $.extend(true, {}, opts, args[0]);
                }else{
                    return opts[args[0]];
                }
            }else if(2 === size){
                var key = args[0];
                var value = args[1];

                if(key in opts){
                    if(DataType.isObject(value)){
                        this.opts[key] = $.extend({}, opts[key], value);
                    }else{
                        this.opts[key] = value;
                    }
                }
            }
        },
        getLivePlayerEvents: function(){
            var list = [];

            for(var e in this.events){
                if(this.events.hasOwnProperty(e)){
                    list.push(e.substr(2));
                }
            }

            return list;
        },
        getLivePlayerPlugin: function(){
            var name = this.getLivePlayerName();

            return $('[data-liveplayer="' + name + '"]')
        },
        getLivePlayerFrame: function(){
            var name = this.getLivePlayerName();

            return $("#" + name);
        },
        getLivePlayerNavBar: function(){
            var frame = this.getLivePlayerFrame();
            var navbar = frame.find(".liveplayer-navbar");

            return navbar;
        },
        getLivePlayerControlBar: function(){
            var frame = this.getLivePlayerFrame();
            var controlbar = frame.find(".liveplayer-controlbar");

            return controlbar;
        },
        getLivePlayerButton: function(type){
            var frame = this.getLivePlayerFrame();
            var button = frame.find(".liveplayer-button-" + type);

            return button;
        },
        getLivePlayerMasterZone: function(){
            var frame = this.getLivePlayerFrame();
            var master = frame.find(".liveplayer-master");

            return master;
        },
        getLivePlayerMasterVideo: function(isDOM){
            return this.getLivePlayerMasterMedia(true === isDOM);
        },
        getLivePlayerMasterMedia: function(isDOM){
            var frame = this.getLivePlayerFrame();
            var media = frame.find(".liveplayer-master .liveplayer-media");

            return true === isDOM ? media[0] : media;
        },
        getLivePlayerMasterVisualizer: function(isDOM){
            var frame = this.getLivePlayerFrame();
            var visualizer = frame.find(".liveplayer-master .liveplayer-visualizer");

            return true === isDOM ? visualizer[0] : visualizer;
        },
        getLivePlayerMasterMask: function(){
            var frame = this.getLivePlayerFrame();
            var mask = frame.find(".liveplayer-master .liveplayer-master-mask");

            return mask;
        },
        getLivePlayerMasterControlState: function(){
            var frame = this.getLivePlayerFrame();
            var state = frame.find(".liveplayer-control-state");

            return state;
        },
        getLivePlayerProgressBar: function(){
            var frame = this.getLivePlayerFrame();
            var bar = frame.find(".liveplayer-progressbar");

            return bar;
        },
        getLivePlayerProgressSeekNode: function(){
            var pb = this.getLivePlayerProgressBar();
            var node = pb.find(".liveplayer-progressbar-seeked");

            return node;
        },
        getLivePlayerProgressSeekBarNode: function(){
            var pb = this.getLivePlayerProgressBar();
            var node = pb.find(".liveplayer-progressbar-seeked-bar");

            return node;
        },
        getLivePlayerProgressBufferedNode: function(){
            var pb = this.getLivePlayerProgressBar();
            var node = pb.find(".liveplayer-progressbar-buffered");

            return node;
        },
        getLivePlayerVolumeRectNode: function(){
            var frame = this.getLivePlayerFrame();
            var node = frame.find(".liveplayer-button-volume");

            return node;
        },
        getLivePlayerVolumeNode: function(){
            var frame = this.getLivePlayerVolumeRectNode();
            var node = frame.find("b");

            return node;
        },
        getLivePlayerVolumeSliderNode: function(){
            var frame = this.getLivePlayerVolumeRectNode();
            var node = frame.find("code");

            return node;
        },
        getLivePlayerVolumeBarNode: function(){
            var frame = this.getLivePlayerVolumeRectNode();
            var node = frame.find("i");

            return node;
        },
        getLivePlayerBackNode: function(){
            var frame = this.getLivePlayerFrame();
            var node = frame.find(".liveplayer-back");

            return node;
        },
        getLivePlayerTitleNode: function(){
            var frame = this.getLivePlayerFrame();
            var node = frame.find(".liveplayer-title");

            return node;
        },
        getLivePlayerTimeSeekNode: function(){
            var frame = this.getLivePlayerFrame();
            var node = frame.find(".liveplayer-timeseek");

            return node;
        },
        parseMasterSource: function(source){
            var pattern = /^(([a-z0-9\-\_\+\.]+\/[a-z0-9\-\_\+\.]+)\:)?([\w\W]+)$/gi;
                pattern.lastIndex = 0;
            var matcher = pattern.exec(source);
            var mimeTypes = null;
            var mimeType = null;
            var src = null;

            if(matcher){
                mimeType = matcher[2] || "";
                src = matcher[3];

                // if(!mimeType){
                //     mimeTypes = LivePlayer.SOURCE_MIME_TYPES(src);

                //     if(mimeTypes){
                //         mimeType = mimeTypes[0];
                //     }
                // }
                return {
                    "type": mimeType || "",
                    "source": src
                }
            }

            return null;
        },
        loadMasterSource: function(){
            var video = this.getLivePlayerMasterMedia(true);

            if(video){
                try{
                    video.load();
                }catch(e){
                    this.error(LivePlayer.Error.MEDIA_ERR_LOAD_SOURCE);
                }
            }
        },
        updateMasterSource: function(source){
            var video = this.getLivePlayerMasterMedia();
            var sourceInfo = DataType.isString(source) ? this.parseMasterSource(source) : source;

            // console.log(">>-----------------------");
            // console.log(source);
            // console.log(JSON.stringify(sourceInfo));
            // console.log("<<-----------------------")

            var notsupportText = this.options("notsupport") || "";

            if(sourceInfo && sourceInfo.source){
                if(sourceInfo.type){
                    video.removeAttr("src")
                         .html('<source src="' + sourceInfo.source + '" type="' + sourceInfo.type + '" />' + notsupportText);
                }else{
                    video.removeAttr("src")
                         .html('<source src="' + sourceInfo.source + '" />' + notsupportText);
                }

                this.listenSourceError();
                this.loadMasterSource();
            }else{
                this.error(LivePlayer.Error.MEDIA_ERR_NO_SOURCE);
            }
        },
        updateBackURL: function(url){
            var node = this.getLivePlayerBackNode();

            node.attr("href", url);
        },
        updateTitle: function(title){
            var node = this.getLivePlayerTitleNode();

            node.html(title);
        },
        updateTimeSeek: function(current, total){
            var node = this.getLivePlayerTimeSeekNode();

            var format = function(time){
                var H = 1 * 60 * 60; //1小时
                var M = 1 * 60;      //1分钟
                var S = 1;           //1秒钟

                var hours = Math.floor(time / H);
                var minutes = Math.floor((time - hours * H) / M);
                var seconds = Math.floor((time - hours * H - minutes * M) / S);

                var sh = hours < 10 ? "0" + hours : "" + hours;
                var sm = minutes < 10 ? "0" + minutes : "" + minutes;
                var ss = seconds < 10 ? "0" + seconds : "" + seconds;

                return sh + ":" + sm + ":" + ss;
            };

            node.html(format(current) + "/" + format(total));
        },
        updateProgress: function(percent){
            var progressSeekNode = this.getLivePlayerProgressSeekNode();
            var progressSeekBarNode = this.getLivePlayerProgressSeekBarNode();

            if(progressSeekNode.length > 0){
                var inum = Number(percent.replace("%", "")) / 100;
                var frame = this.getLivePlayerFrame();
                var frameRect = Util.getBoundingClientRect(frame[0]);
                var seekRect = Util.getBoundingClientRect(progressSeekBarNode[0]);
                var pos = inum * frameRect.width - seekRect.width;

                if(pos <= 0){
                    pos = 0;
                }

                progressSeekNode.css("width", percent);
                progressSeekBarNode.css("left", pos + "px");
            }
        },
        updateVolumeProgress: function(volume){
            var slider = this.getLivePlayerVolumeSliderNode();
            var bar = this.getLivePlayerVolumeBarNode();

            if(slider.length > 0){
                var sliderRect = Util.getBoundingClientRect(slider[0]);
                var barRect = Util.getBoundingClientRect(bar[0]);
                var vol = volume * 10;
                var inum = vol / 100;
                var pos = inum * sliderRect.width - barRect.width;

                if(pos <= 0){
                    pos = 0;
                }

                bar.css("left", pos + "px");
            }
        },
        updateBufferedProgress: function(percent){
            var node = this.getLivePlayerProgressBufferedNode();
            var str = Number(percent * 100).toFixed(2) + "%";

            node.css("width", str);
        },
        parseSourceList: function(){
            var source = this.options("source") || "";
            var items = source.split(/[\s]*,[\s]*/);
            var size = items.length;
            var url = null;
            var list = [];

            for(var i = 0; i < size; i++){
                url = this.parseMasterSource(items[i]);

                if(!url){
                    continue;
                }

                list.push(url);
            }

            return list;
        },
        setSourceList: function(list){
            this.sourceList = list || [];
        },
        getSourceList: function(){
            return [].concat(this.sourceList || []);
        },
        setSourceIndex: function(index){
            var size = this.getSourceList().length;
            var lastIndex = Math.max(size - 1, 0);

            if(index < 0){
                index = 0;
            }

            if(index > lastIndex){
                index = lastIndex;
            }

            this.sourceIndex = index;
        },
        getSourceIndex: function(){
            return this.sourceIndex;
        },
        getSourceMetaData: function(index){
            var list = this.getSourceList();
            var source = null;

            this.setSourceIndex(index);

            source = list[this.getSourceIndex()] || null;

            return source;
        },
        getCurrentSourceMetaData: function(){
            return this.getSourceMetaData(this.getSourceIndex());
        },
        isLive: function(){
            var type = this.options("type");
            var attrType = this.getAttribute("type");

            return ("live" == type || "live" == attrType);
        },
        isVOD: function(){
            var type = this.options("type");
            var attrType = this.getAttribute("type");

            return ("vod" == type || "vod" == attrType);
        },
        isAudio: function(){
            var type = this.options("type");
            var attrType = this.getAttribute("type");

            return ("audio" == type || "audio" == attrType);
        },
        isLoadVisualizer: function(){
            var isAudio = this.isAudio();
            var visualizerMode = this.options("visualizer");
            var attrVisualizerMode = this.getAttribute("visualizer");

            if("none" == visualizerMode || "none" == attrVisualizerMode){
                return false;
            }

            return (("auto" == visualizerMode && isAudio) || ("force" === visualizerMode || "force" === attrVisualizerMode));
        },
        initFullScreen: function(){
            var master = this.getLivePlayerMasterMedia(true);
            var name = this.getLivePlayerName();
            var fsi = FullScreen.getFullScreenInstance(name);

            if(!fsi){
                fsi = FullScreen.newFullScreenInstance(name, master);

                fsi.onfullscreenchange({
                    callback: function(e, name, element){
                        // console.log(e.type)
                        this.exec("fullscreenchange", [e, name, element]);
                    },
                    context: this
                });
                fsi.onfullscreenerror({
                    callback: function(e, name, element){
                        // console.log(e.type)
                        this.exec("fullscreenerror", [e, name, element]);
                    },
                    context: this
                });
                fsi.onwebkitbeginfullscreen({
                    callback: function(e, name, element){
                        // console.log(e.type)
                        this.exec("webkitbeginfullscreen", [e, name, element]);
                    },
                    context: this
                });
                fsi.onwebkitendfullscreen({
                    callback: function(e, name, element){
                        // console.log(e.type)
                        this.exec("webkitendfullscreen", [e, name, element]);
                    },
                    context: this
                });
                fsi.onx5videoenterfullscreen({
                    callback: function(e, name, element){
                        // console.log(e.type)
                        this.exec("x5videoenterfullscreen", [e, name, element]);
                    },
                    context: this
                });
                fsi.onx5videoexitfullscreen({
                    callback: function(e, name, element){
                        // console.log(e.type)
                        this.exec("x5videoexitfullscreen", [e, name, element]);
                    },
                    context: this
                });
            }
        },
        requestFullscreen: function(){
            var master = this.getLivePlayerMasterMedia(true);
            var name = this.getLivePlayerName();

            if(master){
                var fsi = FullScreen.getFullScreenInstance(name);

                fsi.requestFullscreen();

                this.exec("requestfullscreen", [name]);
            }
        },
        exitFullscreen: function(){
            var master = this.getLivePlayerMasterMedia(true);
            var name = this.getLivePlayerName();

            if(master){
                var fsi = FullScreen.getFullScreenInstance(name);

                fsi.exitFullscreen();

                this.exec("exitfullscreen", [name]);
            }
        },
        isFullScreen: function(){
            var name = this.getLivePlayerName();
            var fsi = FullScreen.getFullScreenInstance(name);

            if(fsi){
                return fsi.isFullScreen();
            }

            return false;
        },
        maybeUseTencentX5Core: function(){
            var browser = Env.browser;
            var os = Env.os;

            var tbs = browser.tbs;
            var mqq = browser.mqq;
            var wechat = browser.wechat;
            var mqb = browser.mqqbrowser;

            var android = os.android;

            if(android.major > -1){
                if(mqb.major > -1 && mqb.short >= 7.1){
                    return true;
                }

                if(wechat.major > -1 && tbs.major > -1 && tbs.major > 36849){
                    return true;
                }

                if(mqq.major > -1 && tbs.major > -1 && tbs.major > 36855){
                    return true;
                }

                return false;
            }else{
                return false;
            }         
        },
        watchState: function(){
            var name = this.getLivePlayerName();
            var interval = this.options("stateInterval");
            var timer = this.stateTimer = Timer.getTimer("liveplayer_" + name + "_state", Timer.toFPS(interval), {
                callback: function(_timer){
                    var video = this.getLivePlayerMasterMedia(true);
                    var readyState = MediaReadyState.HAVE_NOTHING;
                    var networkState = MediaNetworkState.NETWORK_EMPTY;

                    if(video){
                        readyState = video.readyState;
                        networkState = video.networkState;
                    }

                    this.readyState = readyState;
                    this.networkState = networkState;
                    this.exec("statechange", [name, readyState, networkState]);
                },
                context: this
            });

            timer.start();
        },
        watch: function(){
            var name = this.getLivePlayerName();
            var time = this.options("time");
            var timer = this.statusBarTimer = Timer.getTimer("liveplayer_" + name, Timer.toFPS(time), {
                callback: function(_timer){
                    this.updateLivePlayerBarsStateUI();
                },
                context: this
            });

            this.updateLivePlayerBarsStateUI();
            timer.start();

            return timer;
        },
        updateLivePlayerBarsStateUI: function(){
            var frame = this.getLivePlayerFrame();
            var master = this.getLivePlayerMasterMedia(true);

            if(true === this.forceLockBars 
                  || false === this.allowHideBars 
                      || (master && true === master.paused)
                          || this.isAudio())
            { //如果当前设置为不允许隐藏、强制锁定或者视频为暂停状态时显示工具栏
                if(frame.hasClass("hidebars")){
                    frame.removeClass("hidebars");
                }
            }else{
                if(!frame.hasClass("hidebars")){
                    frame.addClass("hidebars");
                }
            }
        },
        dispatcher: function(e){
            var data = e.data;
            var type = e.type;
            var ins = data.liveplayer;
            var name = ins.getLivePlayerName();
            var processor = ins.LivePlayerProcessor;

            e.preventDefault();
            e.stopPropagation();

            console.log("LivePlayer#" + name + "/Event/" + type);

            if((type in processor) && processor[type]){
                processor[type].apply(ins, [e]);
            }

            ins.exec(type, [e, name]);
        },
        listen: function(){
            if(true !== this.isListened){
                var events = this.getLivePlayerEvents();
                var master = this.getLivePlayerMasterMedia();

                if(master.length > 0){
                    master.on(events.join(" "), "", {
                        liveplayer: this
                    }, this.dispatcher);

                    this.isListened = true;
                }
            }
        },
        sourceErrorDispatcher: function(e){
            var data = e.data;
            var ins = data.liveplayer;

            ins.error(LivePlayer.Error.MEDIA_ERR_LOAD_SOURCE);
        },
        listenSourceError: function(){
            var master = this.getLivePlayerMasterMedia();
            var source = master.find("source");

            if(source.length > 0){
                source.on("error", "", {
                    liveplayer: this
                }, this.sourceErrorDispatcher);
            }
        },
        parse: function(){
            var container = this.getLivePlayerPlugin();

            var attrs = function(){
                // @see GetDefaultOptions();
                // var options = {
                //     type: "live",
                //     back: "#",
                //     title: "&nbsp;",
                //     width: "100%",
                //     height: "100%",
                //     time: 3000,
                //     stateInterval: 1000,
                //     showNavigationBar: true,
                //     allowFullScreen: true,
                //     allowAdjustVolume: true,
                //     allowChangePlaybackRate: false,
                //     volume: 7,
                //     defaultPlaybackRate: 1.0,
                //     playbackRate: 1.0,
                //     rates: "1.0 1.5 2.0 3.0",
                //     errorMessageMode: "default",
                //     source: "",
                //     sourceIndex: 0,
                //     autonext: true,
                //     poster: "",
                //     preload: "auto",
                //     loop: false,
                //     autoplay: true,
                //     muted: false,
                //     controls: true,
                //     crossOrigin: "",
                //     contextmenu: false,
                //     appearance: "define",
                //     x5h5: "h5-page",
                //     x5fullscreen: "",
                //     x5orientation: "",
                //     visualizerBackgroundImage: "",
                //     visualizerInterval: 0,
                //     visualizer: "auto",
                //     visualizerCorssOrigin: "",
                //     notsupport: "Your browser does not support video tag, please use IE10+, Chrome, Firefox, Safari etc modern browser."
                // };
                var _conf = [
                    {name: "type", dataType: "string"},
                    {name: "back", dataType: "string"},
                    {name: "title", dataType: "string"},
                    {name: "width", dataType: "string"},
                    {name: "height", dataType: "string"},
                    {name: "time", dataType: "number"},
                    {name: "showNavigationBar", dataType: "boolean"},
                    {name: "allowFullScreen", dataType: "boolean"},
                    {name: "allowAdjustVolume", dataType: "boolean"},
                    {name: "volume", dataType: "number"},
                    {name: "allowChangePlaybackRate", dataType: "boolean"},
                    {name: "defaultPlaybackRate", dataType: "number"},
                    {name: "playbackRate", dataType: "number"},
                    {name: "rates", dataType: "string"},
                    {name: "errorMessageMode", dataType: "string"},
                    {name: "source", dataType: "string"},
                    {name: "sourceIndex", dataType: "number"},
                    {name: "autonext", dataType: "boolean"},
                    {name: "poster", dataType: "string"},
                    {name: "preload", dataType: "string"},
                    {name: "loop", dataType: "boolean"},
                    {name: "autoplay", dataType: "boolean"},
                    {name: "muted", dataType: "boolean"},
                    {name: "controls", dataType: "boolean"},
                    {name: "crossOrigin", dataType: "string"},
                    {name: "contextmenu", dataType: "boolean"},
                    {name: "appearance", dataType: "string"},
                    {name: "x5h5", dataType: "string"},
                    {name: "x5fullscreen", dataType: "string"},
                    {name: "x5orientation", dataType: "string"},
                    {name: "visualizerBackgroundImage", dataType: "string"},
                    {name: "visualizerInterval", dataType: "number"},
                    {name: "visualizer", dataType: "string"},
                    {name: "visualizerCorssOrigin", dataType: "string"},
                    {name: "notsupport", dataType: "string"}
                ];

                return _conf;
            };

            var convert = function(value, dataType){
                var v = null;

                switch(dataType){
                    case "boolean":
                        if("1" == value || "true" == value){
                            v = true;
                        }else{
                            v = false;
                        }
                    break;
                    case "number":
                        v = Number(value);
                    break;
                    default:
                        v = value;
                    break;
                }

                return v;
            };

            var ats = attrs();
            var size = ats.length;
            var attr = null;
            var value = null;
            var objs = {};
            var name = null;
            var dataType = null;

            for(var i = 0; i < size; i++){
                attr = ats[i];
                name = attr.name;
                dataType = attr.dataType;

                value = container.attr("data-liveplayer-" + name);

                if(value){
                    if(name.indexOf("-") == -1){
                        objs[name] = convert(value, dataType);
                    }else{
                        var a = name.split("-");
                        var akey = a[0];
                        var ap = a[1];

                        if(!(akey in objs)){
                            objs[akey] = {};
                        }

                        objs[akey][ap] = convert(value, dataType);
                    }
                }
            }

            return $.extend(true, {}, GetDefaultOptions(), objs);
        },
        updateAttribute: function(attrName, attrValue){
            var container = this.getLivePlayerPlugin();

            container.attr("data-liveplayer-" + attrName, attrValue);

            this.options(this.parse());
        },
        setAttribute: function(attrName, attrValue){
            var container = this.getLivePlayerPlugin();

            container.attr("data-liveplayer-" + attrName, attrValue);
        },
        hasAttribute: function(attrName){
            var container = this.getLivePlayerPlugin();
            var dom = container[0];

            if(dom && dom.hasAttribute("data-liveplayer-" + attrName)){
                return true;
            }

            return false;
        },
        getAttribute: function(attrName){
            var container = this.getLivePlayerPlugin();

            return container.attr("data-liveplayer-" + attrName) || null;
        },
        setLivePlayerObjectStyle: function(type, style){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                master.style["object-" + type] = style;
            }
        },
        setTencentX5VideoPosition: function(left, top){
            var sleft = left + "";
            var stop = top + "";
            var unit = /(px|%|pt|in|cm|mm|em|rem|ex|pc)$/i;

            var style = "";

            if(!unit.test(sleft)){
                sleft = sleft + "px";
            }

            if(!unit.test(stop)){
                stop = stop + "px";
            }

            style = sleft + " " + stop;

            this.setLivePlayerObjectStyle("position", style);
        },
        setTencentX5VideoFit: function(fitType){
            this.setLivePlayerObjectStyle("fit", fitType);
        },
        seekToMouse: function(pageX){
            var frame = this.getLivePlayerFrame();
            var master = this.getLivePlayerMasterMedia(true);
            var rect = Util.getBoundingClientRect(frame[0]);

            var left = rect.left;
            var width = rect.width;
            var pos = pageX - left;

            var duration = master.duration;
            var percent = pos / width;
            var targetTime = Number(Number(duration * percent).toFixed(3));

            master.currentTime = targetTime;

            var seekPercent = master.currentTime / duration;
            var s = Math.min(seekPercent * 100, 100) + "%";

            this.updateTimeSeek(master.currentTime, duration);
            this.updateProgress(s);
        },
        seekstart: function(e){
            var data = e.data;
            var player = data.liveplayer;
            var ctx = {
                liveplayer: player
            };

            // var evt = ("changedTouches" in e ? e["changedTouches"][0] : e);
            player.forceLockBars = true;
            // player.watch().stop();

            $(document).on(_seek_move + "_" + player.getLivePlayerName(), "", ctx, player.seekmove)
                       .on(_seek_end + "_" + player.getLivePlayerName(), "", ctx, player.seekstop);
        },
        seekmove: function(e){
            var data = e.data;
            var player = data.liveplayer;
            var ctx = {
                liveplayer: player
            };

            var evt = ("changedTouches" in e ? e["changedTouches"][0] : e);

            player.seekToMouse(evt.pageX);            
        },
        seekstop: function(e){
            var data = e.data;
            var player = data.liveplayer;

            player.forceLockBars = false;
            // player.watch().start();

            $(document).off(_seek_move + "_" + player.getLivePlayerName())
                       .off(_seek_end + "_" + player.getLivePlayerName());
        },
        bindSeekEvent: function(){
            if(this.isLive()){
                return ;
            }

            var seekBarNode = this.getLivePlayerProgressSeekBarNode();
            var ctx = {
                liveplayer: this
            };

            seekBarNode.on(_seek_start + "_" + this.getLivePlayerName(), "", ctx, this.seekstart);
        },
        volumeToMouse: function(pageX){
            var slider = this.getLivePlayerVolumeSliderNode();
            var rect = Util.getBoundingClientRect(slider[0]);

            var left = rect.left;
            var width = rect.width;
            var pos = pageX - left;

            var duration = MAX_VOLUME;
            var percent = pos / width;
            var targetVolume = Number(Number(duration * percent).toFixed(2));

            this.setVolume(targetVolume);
        },
        volumestart: function(e){
            var data = e.data;
            var player = data.liveplayer;
            var ctx = {
                liveplayer: player
            };

            // var evt = ("changedTouches" in e ? e["changedTouches"][0] : e);
            player.forceLockBars = true;
            // player.watch().stop();

            $(document).on(_volume_move + "_" + player.getLivePlayerName(), "", ctx, player.volumemove)
                       .on(_volume_end + "_" + player.getLivePlayerName(), "", ctx, player.volumestop);
        },
        volumemove: function(e){
            var data = e.data;
            var player = data.liveplayer;
            var ctx = {
                liveplayer: player
            };

            var evt = ("changedTouches" in e ? e["changedTouches"][0] : e);

            player.volumeToMouse(evt.pageX);            
        },
        volumestop: function(e){
            var data = e.data;
            var player = data.liveplayer;

            player.forceLockBars = false;
            // player.watch().start();

            $(document).off(_volume_move + "_" + player.getLivePlayerName())
                       .off(_volume_end + "_" + player.getLivePlayerName());
        },
        bindVolumeEvent: function(){
            var volumeBarNode = this.getLivePlayerVolumeBarNode();
            var ctx = {
                liveplayer: this
            };

            volumeBarNode.on(_volume_start + "_" + this.getLivePlayerName(), "", ctx, this.volumestart);
        },
        updateNextButton: function(){
            var sourceList = this.getSourceList();
            var size = sourceList.length;
            var index = this.getSourceIndex();
            var mask = this.getLivePlayerMasterMask();
            var sup = mask.find("sup");

            if(sup.length > 0){
                if(size <= 1 || index >= (size - 1)){
                    sup.addClass("disabled");
                }else{
                    sup.removeClass("disabled");
                }
            }
        },
        updatePrevButton: function(){
            var sourceList = this.getSourceList();
            var size = sourceList.length;
            var index = this.getSourceIndex();
            var mask = this.getLivePlayerMasterMask();
            var sub = mask.find("sub");

            if(sub.length > 0){
                if(size <= 1 || index <= 0){
                    sub.addClass("disabled");
                }else{
                    sub.removeClass("disabled");
                }
            }
        },
        init: function(isInvokePlay){
            //监听事件
            this.listen();
            this.listenSourceError();

            //监听状态
            this.watchState();
            this.watch();

            //设置声音
            this.setVolume(this.options("volume"));
            
            //绑定进度条事件
            this.bindSeekEvent();
            this.bindVolumeEvent();

            //初始化全屏控制
            this.initFullScreen();

            //设置默认播放速率
            this.setDefaultPlaybackRate(this.options("defaultPlaybackRate"));

            //更新上一个和下一下的样式
            this.updateNextButton();
            this.updatePrevButton();

            var meta = this.getCurrentSourceMetaData();
            if(meta){
                this.loadMasterSource(); //加载资源

                if(true === isInvokePlay){
                    this.play();
                }
            }

            //设置当前播放速率
            this.setPlaybackRate(this.options("playbackRate"));
        },
        innerBeforeRender: function(isInvokePlay){
            // var videoWidth = target.videoWidth;
            // var videoHeight = target.videoHeight;
            // var audioDecoded = target.webkitAudioDecodedByteCount;
            // var videoDecoded = target.webkitVideoDecodedByteCount;
            // var hasAudio = target.mozHasAudio;

            var visualizerBackgroundImage = this.getAttribute("visualizerBackgroundImage");
            var crossOrigin = this.getAttribute("crossOrigin");
            var visualizerCorssOrigin = this.getAttribute("visualizerCorssOrigin");
            
            if(this.isLoadVisualizer()){
                if(!crossOrigin && !visualizerCorssOrigin){
                    this.setAttribute("crossOrigin", visualizerCorssOrigin);
                }

                if(visualizerBackgroundImage){
                    Util.getImageInfoByURL(visualizerBackgroundImage, {
                        callback: function(img, naturalWidth, naturalHeight, source){
                            var viz = LivePlayer.Visualizer.connect(this);
                            var bg = viz.getBackgroundImage() || {};

                            var imgObj = {
                                "image": img,
                                "width": bg.width || naturalWidth,
                                "height": bg.height || naturalHeight,
                                "source": source,
                                "type": "canvas"
                            };

                            var cssObj = {};

                            viz.setBackgroundImage(imgObj, cssObj);
                        },
                        args: [visualizerBackgroundImage],
                        context: this
                    });
                }
            }else{
                if(this.isAudio() && visualizerBackgroundImage){
                    Util.getImageInfoByURL(visualizerBackgroundImage, {
                        callback: function(img, naturalWidth, naturalHeight, source){
                            var viz = LivePlayer.Visualizer.connect(this);
                            var bg = viz.getBackgroundImage() || {};

                            var imgObj = {
                                "image": img,
                                "width": bg.width || naturalWidth,
                                "height": bg.height || naturalHeight,
                                "source": source,
                                "type": "css"
                            };

                            var cssObj = {};

                            var vn = this.getLivePlayerMasterVisualizer();

                            vn.removeClass("hide");
                            viz.setVisualizerNode(vn[0]);
                            viz.setBackgroundImage(imgObj, cssObj);
                        },
                        args: [visualizerBackgroundImage],
                        context: this
                    });
                }
            }
        },
        innerAfterRender: function(isInvokePlay){
            this.init(isInvokePlay);

            var visualizerMode = this.options("visualizer");

            if(this.isLoadVisualizer()){
                var viz = LivePlayer.Visualizer.connect(this);
                var bg = viz.getBackgroundImage() || {};

                var frame = this.getLivePlayerFrame();
                var rect = Util.getBoundingClientRect(frame[0]);

                var imgObj = {
                    "image": bg.image || null,
                    "width": rect.width,
                    "height": rect.height,
                    "source": bg.source || "",
                    "type": bg.type
                };

                var cssObj = {};

                viz.setBackgroundImage(imgObj, cssObj).render();
            }
        },
        render: function(isInvokePlay){
            var container = this.getLivePlayerPlugin();

            this.innerBeforeRender(isInvokePlay);
            this.options(this.parse());
            this.setSourceList(this.parseSourceList()); 
            this.setSourceIndex(this.options("sourceIndex"));

            if(container.find(".liveplayer-frame").length === 0){
                this.exec("beforerender", [this.getLivePlayerName()]);
                var metaData = $.extend({}, this.options(), {
                    "name": this.getLivePlayerName(),
                    "meta": this.getCurrentSourceMetaData()
                });

                LivePlayerTemplate.render(true, MEDIA_TEMPLATE, metaData, {
                    callback: function(ret, _container, _isInvokePlay){
                        _container.html(ret.result);

                        this.innerAfterRender(_isInvokePlay);

                        //调用render回调
                        this.exec("render", [this.getLivePlayerName()]);

                        //注册schema
                        Util.source(LivePlayerSchema);

                        //注册事件
                        Util.registAction(_container, [
                            {type: "click", mapping: null, compatible: null},
                            {type: "touchstart", mapping: "mousedown", compatible: null},
                            {type: "touchmove", mapping: "mousemove", compatible: null},
                            {type: "touchend", mapping: "mouseup", compatible: null}
                        ], null);
                    },
                    args: [container, isInvokePlay],
                    context: this
                });
            }else{
                console.warn("媒体播放器已经存在，如果您要重新渲染，请先调用destroy()方法");
            }
        },
        restore: function(){
            var master = this.getLivePlayerMasterMedia(true);
            var duration = master.duration;

            this.updateTimeSeek(0, duration);
            this.updateProgress("0%");
        },
        gotoAndPlay: function(index){
            this.setSourceIndex(index);
            this.updateBufferedProgress(0);
            this.updateMasterSource(
                this.getCurrentSourceMetaData()
            );

            this.play();
        },
        updatePlayStateUI: function(){
            var master = this.getLivePlayerMasterMedia(true);
            var state = this.getLivePlayerMasterControlState();
            var mask = this.getLivePlayerMasterMask();
            var maskPlayNode = mask.find("ins");

            if(master){
                // mask.addClass("hide")
                //     .removeClass("liveplayer-error");

                if(master.paused){
                    state.removeClass("play").addClass("pause");
                    maskPlayNode.removeClass("pause");

                    if("define" == this.options("appearance")){
                        mask.removeClass("hide");
                    } 
                }else{
                    state.removeClass("pause").addClass("play");
                    maskPlayNode.addClass("pause");
                }
            }
        },
        play: function(){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                try{
                    master.play();
                }catch(e){
                    this.error(LivePlayer.Error.MEDIA_ERR_PLAY);
                }
            }
        },
        pause: function(){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                try{
                    master.pause();
                }catch(e){

                }
            }
        },
        //---------- NATIVE PROPERTIES SET BEGIN ---------------
        isMuted: function(){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                return master.muted;
            }

            return false;
        },
        setMuted: function(isMuted){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                master.muted = !!isMuted;
            }
        },
        setVolume: function(volume){
            var master = this.getLivePlayerMasterMedia(true);

            volume = Math.min(Math.max(0, volume), MAX_VOLUME);

            if(master){
                master.volume = Number(Number(volume / 10).toFixed(1));

                this.updateVolumeProgress(volume);
            }
        },
        getVolume: function(){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                return master.volume;
            }
        },
        setCrossOrigin: function(crossOrigin){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                // anonymous, use-credentials
                master.crossOrigin = crossOrigin;
            }
        },
        getCrossOrigin: function(){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                return master.crossOrigin;
            }
        },
        setDefaultPlaybackRate: function(playbackspeed){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                master.defaultPlaybackRate = playbackspeed;
            }
        },
        getDefaultPlaybackRate: function(playbackspeed){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                return master.defaultPlaybackRate;
            }
        },
        setPlaybackRate: function(playbackspeed){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                master.playbackRate = playbackspeed;

                if(Env.os.ios.major > -1 || Env.os.android.major > -1){
                    this.setDefaultPlaybackRate(playbackspeed);
                }
            }
        },
        getPlaybackRate: function(playbackspeed){
            var master = this.getLivePlayerMasterMedia(true);

            if(master){
                return master.playbackRate;
            }
        },
        //---------- NATIVE PROPERTIES SET END ---------------
        size: function(width, height){
            var frame = this.getLivePlayerFrame();

            frame.css({
                "width": width,
                "height": height
            });
        },
        canPlaySource: function(source){
            return LivePlayer.canPlaySource(source);
        },
        message: function(msg){
            var master = this.getLivePlayerMasterMedia(true);
            var mask = this.getLivePlayerMasterMask();
            var ins = mask.find("ins");

            if(!msg){
                mask.removeClass("liveplayer-error").addClass("hide");
                ins.html("");

                this.updatePlayStateUI();

                this.allowHideBars = true;
                return ;
            }

            var meta = {
                "name": this.getLivePlayerName()
            };

            ins.html(Util.formatData(msg, meta));

            mask.addClass("liveplayer-error").removeClass("hide");

            this.allowHideBars = false;
            // this.watch().stop();
        },
        error: function(err){
            switch(err.code){
                //------SYSTEM ERROR------------
                case MediaError.MEDIA_ERR_ABORTED:
                    err = LivePlayer.Error.MEDIA_ERR_ABORTED;
                break;
                case MediaError.MEDIA_ERR_NETWORK:
                    err = LivePlayer.Error.MEDIA_ERR_NETWORK;
                break;
                case MediaError.MEDIA_ERR_DECODE:
                    err = LivePlayer.Error.MEDIA_ERR_DECODE;
                break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    err = LivePlayer.Error.MEDIA_ERR_SRC_NOT_SUPPORTED;
                break;
                //------LOGIC ERROR-------------
                case LivePlayer.Error.MEDIA_ERR_LOAD_SOURCE.code:
                case LivePlayer.Error.MEDIA_ERR_PLAY.code:
                case LivePlayer.Error.MEDIA_ERR_NO_SOURCE.code:
                    //@todo
                break;
                //------DEFAULT ERROR------------
                default:
                    err = LivePlayer.Error.MEDIA_ERR_UNKNOWN;
                break;
            }

            var state = this.getLivePlayerMasterControlState();

            var code = err.code;
            var msg = err.message;
            var evt = err.event;

            state.removeClass("play pause")
                 .addClass("pause");

            if("default" === this.options("errorMessageMode")){
                this.message(code + ": " + msg + (evt ? evt : ""));
            }

            this.exec("runtimeexception", [this.getLivePlayerName(), code, msg, evt]);
        },
        destroy: function(){
            var frame = this.getLivePlayerFrame();

            if(this.stateTimer){
                this.stateTimer.stop();
                this.stateTimer = null;
            }

            if(this.statusBarTimer){
                this.statusBarTimer.stop();
                this.statusBarTimer = null;
            }

            frame.remove();

            this.isListened = false;
            this.sourceList = [];
            this.sourceIndex = 0;
            this.allowHideBars = true;
            this.forceLockBars = false;
        }
    };

    LivePlayer.Error = {
        //------SYSTEM ERROR------------
        "MEDIA_ERR_ABORTED": {
            "code": "E1001",
            "message": "已取消视频源的请求",
            "event": "<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name},E1001\">刷新</a>"
        },
        "MEDIA_ERR_NETWORK": {
            "code": "E1002",
            "message": "网络出现故障",
            "event": "<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name},E1002\">重试</a>"
        },
        "MEDIA_ERR_DECODE": {
            "code": "E1003",
            "message": "媒体解码失败",
            "event": "<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name},E1003\">刷新</a>"
        },
        "MEDIA_ERR_SRC_NOT_SUPPORTED": {
            "code": "E1004",
            "message": "不支持的媒体地址",
            "event": null
        },
        //------DEFAULT ERROR-------------
        "MEDIA_ERR_UNKNOWN": {
            "code": "E2000",
            "message": "发生未知的错误",
            "event": "<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name},E2000\">重试</a>"
        },
        //------LOGIC ERROR-------------
        "MEDIA_ERR_NO_SOURCE": {
            "code": "E2001",
            "message": "解析播放地址失败，正确格式：[媒体类型:]播放地址。如：video/mp4:source.mp4或source.mp4",
            "event": null
        },
        "MEDIA_ERR_LOAD_SOURCE": {
            "code": "E2002",
            "message": "加载媒体地址失败",
            "event": "<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name},E2002\">重试</a>"
        },
        "MEDIA_ERR_PLAY": {
            "code": "E2003",
            "message": "播放时发生错误",
            "event": "<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name},E2003\">重试</a>"
        }
    };

    LivePlayer.canPlaySource = function(source){
        var mimeTypes = LivePlayer.SOURCE_MIME_TYPES(source);

        if(!mimeTypes || (mimeTypes && mimeTypes.length === 0)){
            return false;
        }

        var video = document.createElement("video");
        var audio = document.createElement("audio");

        var canplay = "";
        var supported = false;
        var type = "";

        for(var i = 0; i < mimeTypes.length; i++){
            type = mimeTypes[i];

            canplay = audio.canPlayType(type) || video.canPlayType(type);

            if(!!canplay){
                supported = true;
            }
        }

        video = null;
        audio = null;
        
        return supported;
    };

    LivePlayer.SOURCE_MIME_TYPES = function(source){
        var urlInfo = Request.parseURL(source);
        var fileName = urlInfo.filename;
        var pattern = /([^\.]+)$/g; pattern.lastIndex = 0;
        var matcher = pattern.exec(fileName);
        var ext = matcher ? matcher[1] : "";
        var mimeTypes = null;

        mimeTypes = MIME.maybe(ext);

        return mimeTypes;
    };

    LivePlayer.LivePlayers = {};

    LivePlayer.createLivePlayer = function(name, options){
        var _opts = options || {};
        var player = LivePlayer.LivePlayers[name] || (LivePlayer.LivePlayers[name] = new LivePlayer(name, _opts));

        var _exports = {
            "exec": function(type, args){
                player.exec(type, args);

                return this;
            },
            "set": function(type, option){
                player.set(type, option);

                return this;
            },
            "remove": function(type){
                player.remove(type);

                return this;
            },
            "get": function(type){
                return player.get(type);
            },
            "clear": function(){
                player.clear();

                return this;
            },
            "getHandleStack": function(){
                return player.getHandleStack();
            },
            "getLivePlayerName": function(){
                return player.getLivePlayerName();
            },
            "getLivePlayerPlugin": function(){
                return player.getLivePlayerPlugin();
            },
            "getLivePlayerFrame": function(){
                return player.getLivePlayerFrame();
            },
            "getLivePlayerNavBar": function(){
                return player.getLivePlayerNavBar();
            },
            "getLivePlayerControlBar": function(){
                return player.getLivePlayerControlBar();
            },
            "getLivePlayerButton": function(type){
                return player.getLivePlayerButton(type);
            },
            "getLivePlayerMasterZone": function(){
                return player.getLivePlayerMasterZone();
            },
            "getLivePlayerMasterVideo": function(isDOM){
                return player.getLivePlayerMasterMedia(isDOM);
            },
            "getLivePlayerMasterMedia": function(isDOM){
                return player.getLivePlayerMasterMedia(isDOM);
            },
            "getLivePlayerMasterVisualizer": function(isDOM){
                return player.getLivePlayerMasterVisualizer(isDOM);
            },
            "getLivePlayerMasterMask": function(){
                return player.getLivePlayerMasterMask();
            },
            "getLivePlayerMasterControlState": function(){
                return player.getLivePlayerMasterControlState();
            },
            "getLivePlayerStateTimer": function(){
                return player.stateTimer;
            },
            "getLivePlayerStatusBarTimer": function(){
                return player.statusBarTimer;
            },
            "getLivePlayerReadyState": function(){
                return player.readyState;
            },
            "getLivePlayerNetworkState": function(){
                return player.networkState;
            },
            "updateMasterSource": function(source){
                player.updateMasterSource(source);

                return this;
            },
            "updateBackURL": function(url){
                player.updateBackURL(url);

                return this;
            },
            "updateProgress": function(percent){
                player.updateProgress(percent);

                return this;
            },
            "updateTitle": function(title){
                player.updateTitle(title);

                return this;
            },
            "updateTimeSeek": function(current, duration){
                player.updateTimeSeek(current, duration);

                return this;
            },
            "updateAttribute": function(attrName, attrValue){
                player.updateAttribute(attrName, attrValue);

                return this;
            },
            "setAttribute": function(attrName, attrValue){
                player.setAttribute(attrName, attrValue);

                return this;
            },
            "hasAttribute": function(attrName){
                return player.hasAttribute(attrName);
            },
            "getAttribute": function(attrName){
                return player.getAttribute(attrName);
            },
            "seekToMouse": function(pageX){
                player.seekToMouse(pageX);

                return this;
            },
            "parseSourceList": function(){
                return player.parseSourceList();
            },
            "setSourceList": function(list){
                player.setSourceList(list);

                return this;
            },
            "getSourceList": function(){
                return player.getSourceList();
            },
            "setSourceIndex": function(index){
                player.setSourceIndex(index);

                return this;
            },
            "getSourceIndex": function(){
                return player.getSourceIndex();
            },
            "getSourceMetaData": function(index){
                return player.getSourceMetaData(index);
            },
            "getCurrentSourceMetaData": function(){
                return player.getCurrentSourceMetaData();
            },
            "requestFullscreen": function(){
                player.requestFullscreen();

                return this;
            },
            "exitFullscreen": function(){
                player.exitFullscreen();

                return this;
            },
            "isFullScreen": function(){
                return player.isFullScreen();
            },
            "maybeUseTencentX5Core": function(){
                return player.maybeUseTencentX5Core();
            },
            "setLivePlayerObjectStyle": function(type, style){
                player.setLivePlayerObjectStyle(type, style);

                return this;
            },
            "setTencentX5VideoPosition": function(left, top){
                player.setTencentX5VideoPosition(left, top);

                return this;
            },
            "setTencentX5VideoFit": function(fitType){
                player.setTencentX5VideoFit(fitType);

                return this;
            },
            "render": function(isInvokePlay){
                player.render(isInvokePlay);

                return this;
            },
            "restore": function(){
                player.restore();

                return this;
            },
            "options": function(){
                return player.options.apply(player, arguments);
            },
            "isLive": function(){
                return player.isLive();
            },
            "isVOD": function(){
                return player.isVOD();
            },
            "isAudio": function(){
                return player.isAudio();
            },
            "isLoadVisualizer": function(){
                return player.isLoadVisualizer();
            },
            "gotoAndPlay": function(index){
                player.gotoAndPlay(index);

                return this;
            },
            "play": function(){
                player.play();

                return this;
            },
            "pause": function(){
                player.pause();

                return this;
            },
            isMuted: function(){
                return player.isMuted();
            },
            "setMuted": function(isMuted){
                player.setMuted(isMuted);

                return this;
            },
            "setVolume": function(volume){
                player.setVolume(volume);

                return this;
            },
            "getVolume": function(){
                return player.getVolume();
            }, 
            "setCrossOrigin": function(crossOrigin){
                player.setCrossOrigin(crossOrigin);

                return this;
            },
            "getCrossOrigin": function(){
                return player.getCrossOrigin();
            },
            "setDefaultPlaybackRate": function(playbackspeed){
                player.setDefaultPlaybackRate(playbackspeed);

                return this;
            },
            "getDefaultPlaybackRate": function(){
                return player.getDefaultPlaybackRate();
            },
            "setPlaybackRate": function(playbackspeed){
                player.setPlaybackRate(playbackspeed);

                return this;
            },
            "getPlaybackRate": function(){
                return player.getPlaybackRate();
            },
            "size": function(width, height){
                player.size(width, height);

                return this;
            },
            "parse": function(){
                return player.parse();
            },
            "watch": function(){
                return player.watch();
            },
            "canPlaySource": function(source){
                return player.canPlaySource(source);
            },
            "error": function(errObj){
                player.error(errObj);

                return this;
            },
            "message": function(msg){
                player.message(msg);
 
                return this;
            },
            "destroy": function(removeCache){
                player.destroy();

                if(true === removeCache || undefined === removeCache){
                    LivePlayer.LivePlayers[name] = null;
                    delete LivePlayer.LivePlayers[name];
                }

                return this;
            }
        };

        return _exports;
    };

    LivePlayer.getLivePlayer = function(name){
        if(name in LivePlayer.LivePlayers){
            return LivePlayer.createLivePlayer(name);
        }

        return null;
    };

    LivePlayer.Visualizer = function(liveplayer){
        this.liveplayer = liveplayer;
        this.isRender = false;
        this.opts = {
            "visualizer": null,
            "gradient": null,
            "energyWidth": 10,
            "energyGap": 2,
            "energyCapHeight": 2,
            "stayHeight": 2,
            "energySize": 0
        };
    };

    LivePlayer.Visualizer.prototype = {
        update: function(opts){
            this.opts = $.extend({}, this.opts, opts);
        },
        setVisualizerNode: function(canvas){
          var player = this.liveplayer;
          var av = player.visualizer;

          av.setVisualizerNode(canvas);
        },
        setBackgroundImage: function(imgObj, cssObj){
            var player = this.liveplayer;
            var av = player.visualizer;

            av.setBackgroundImage(imgObj, cssObj);
        },
        getBackgroundImage: function(){
            var player = this.liveplayer;
            var av = player.visualizer;

            return av.getBackgroundImage();
        },
        render: function(){
            var player = this.liveplayer;
            var av = player.visualizer;
            var audio = av.audio;
            var timer = av.timer;
            var analyser = null;
            var source = null;
            var ac = audio.audioContext;

            if(false === this.isRender && audio.supported()){
                this.isRender = true;
                
                var media = player.getLivePlayerMasterMedia(true);
                var node = player.getLivePlayerMasterVisualizer();
                var canvas = node[0];
                var canvasContext = canvas.getContext("2d");
                var gradient = null;

                var interval = player.options("visualizerInterval");
                var frame = player.getLivePlayerFrame();
                var rect = Util.getBoundingClientRect(frame[0]);

                node.removeClass("hide");

                canvas.width = rect.width;
                canvas.height = rect.height;

                gradient = canvasContext.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(1, '#0f0');
                gradient.addColorStop(0.5, '#ff0');
                gradient.addColorStop(0, '#f00');

                this.opts = $.extend({}, this.opts, {
                    "visualizer": {
                        "renderNode": canvas,
                        "renderContext": canvasContext
                    },
                    "gradient": gradient,
                    "energySize": Math.round(canvas.width / (this.opts.energyWidth + this.opts.energyGap))
                });
                
                source = ac.createMediaElementSource(media);

                analyser = ac.createAnalyser();
                analyser.fftSize = 2048;

                player.exec("visualizerrenderbefore", [this.opts, analyser, {
                    callback: function(opts){
                        this.update(opts);
                    },
                    context: this
                }]);

                source.connect(analyser);
                analyser.connect(ac.destination);

                av.erase(this.opts).render(analyser).fork(analyser, interval);
            }
        }
    };

    LivePlayer.Visualizer.Cache = {};

    LivePlayer.Visualizer.connect = function(liveplayer){
        var name = liveplayer.getLivePlayerName();
        var v = LivePlayer.Visualizer.Cache[name] || (LivePlayer.Visualizer.Cache[name] = new LivePlayer.Visualizer(liveplayer));

        var o = {
            setVisualizerNode: function(canvas){
              v.setVisualizerNode(canvas);

              return this;
            },
            setBackgroundImage: function(imgObj, cssObj){
                v.setBackgroundImage(imgObj, cssObj);

                return this;
            },
            getBackgroundImage: function(){
                return v.getBackgroundImage();
            },
            update: function(opts){
                v.update(opts);

                return this;
            },
            render: function(){
                v.render();

                return this;
            }
        };

        return o;
    };

    module.exports = {
        "version": "R17B1204",
        "MediaReadyState": MediaReadyState,
        "MediaNetworkState": MediaNetworkState,
        "MediaError": MediaError,
        "LivePlayerError": (function(){
            var err = LivePlayer.Error;
            var o = {};

            for(var type in err){
                if(err.hasOwnProperty(type)){
                    o[type] = err[type].code;
                }
            }

            return o;
        })(),
        createLivePlayer: function(name, options){
            console.log("LivePlayer::Version#" + this.version);
            return LivePlayer.createLivePlayer(name, options);
        },
        getLivePlayer: function(name){
            return LivePlayer.getLivePlayer(name);
        },
        canPlaySource: function(source){
            return LivePlayer.canPlaySource(source);
        },
        getSourceMIMETypes: function(source){
            return LivePlayer.SOURCE_MIME_TYPES(source);
        },
        destroy: function(name, removeCache){
            var player = null;

            if(name){
                var player = LivePlayer.getLivePlayer(name);

                if(player){
                    player.destroy(removeCache);
                }
            }else{
                for(var _name in LivePlayer.LivePlayers){
                    if(LivePlayer.LivePlayers.hasOwnProperty(_name)){
                        player = LivePlayer.getLivePlayer(_name);

                        if(player){
                            player.destroy(removeCache);
                        }
                    }
                }
            }
        }
    };
});