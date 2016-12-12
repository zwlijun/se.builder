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
    var TemplateEngine  = require("mod/se/template");
    var Util            = require("mod/se/util");
    var DataType        = require("mod/se/datatype");
    var Listener        = require("mod/se/listener");
    var Timer           = require("mod/se/timer");
    var Detect          = require("mod/se/detect");
    var Request         = require("mod/se/request");
    var HandleStack     = Listener.HandleStack;
    var Env             = Detect.env;

    var LivePlayerTemplate = TemplateEngine.getTemplate("mod_liveplayer", {
        "root": "liveplayer"
    }); 

    var MediaError = ("MediaError" in window) ? window["MediaError"] : {
        MEDIA_ERR_ABORTED: 1,
        MEDIA_ERR_NETWORK: 2,
        MEDIA_ERR_DECODE: 3,
        MEDIA_ERR_SRC_NOT_SUPPORTED: 4
    };

    var HTML_TEMPLATE = ''
                      + '<div class="liveplayer-frame disable-select <%=liveplayer.type%>" id="<%=liveplayer.name%>" style="width: <%=liveplayer.width%>; height: <%=liveplayer.height%>;">'
                      + '  <%if("none" != liveplayer.appearance){%>'
                      + '  <div class="liveplayer-navbar flexbox middle justify">'
                      + '    <a href="<%=liveplayer.back%>" class="liveplayer-back icofont"></a>'
                      + '    <span class="liveplayer-title ellipsis"><%=liveplayer.title%></span>'
                      + '  </div>'
                      + '  <%}%>'
                      + '  <%if(liveplayer.controls && "define" == liveplayer.appearance){%>'
                      + '  <div class="liveplayer-controlbar">'
                      + '    <div class="liveplayer-progressbar<%="live" == liveplayer.type ? " hidden" : ""%>" data-action-touchstart="liveplayer://progress/seek#<%=liveplayer.name%>">'
                      + '      <div class="liveplayer-progressbar-seeked" style="width: 0%"></div>'
                      + '      <div class="liveplayer-progressbar-seeked-bar"></div>'
                      + '    </div>'
                      + '    <div class="liveplayer-control flexbox middle justify">'
                      + '      <div class="liveplayer-control-state flexbox middle left <%=liveplayer.autoplay ? "play" : "pause"%>">'
                      + '        <cite class="liveplayer-button-play icofont" data-action-click="liveplayer://swapState#<%=liveplayer.name%>"></cite>'
                      + '        <%if("live" != liveplayer.type){%>'
                      + '        <span class="liveplayer-timeseek">00:00:00/00:00:00</span>'
                      + '        <%}%>'
                      + '      </div>'
                      + '      <div class="liveplayer-control-player flexbox middle right">'
                      + '        <%if(liveplayer.allowFullScreen){%>'
                      + '        <cite class="liveplayer-button-fullscreen icofont fullscreen" data-action-click="liveplayer://fullscreen#<%=liveplayer.name%>"></cite>'
                      + '        <%}%>'
                      + '      </div>'
                      + '    </div>'
                      + '  </div>'
                      + '  <%}%>'
                      + '  <div class="liveplayer-master" data-action-click="liveplayer://swapBars#<%=liveplayer.name%>">'
                      + '    <video '
                      + '      <%=liveplayer.loop ? " loop" : ""%> '
                      + '      <%=liveplayer.autoplay ? " autoplay" : ""%> '
                      + '      <%=liveplayer.muted ? " muted" : ""%> '
                      + '      <%=(liveplayer.controls &&  "native" == liveplayer.appearance) ? " controls" : ""%> '
                      + '      preload="<%=liveplayer.preload%>" '
                      + '      poster="<%=liveplayer.poster%>" '
                      + '      x-webkit-airplay="allow" '
                      + '      webkit-playsinline="true" '
                      + '      playsinline="true" '
                      + '      <%if(liveplayer.x5h5){%>'
                      + '      x5-video-player-type="h5"'
                      + '      <%}%>'
                      + '    >'
                      + '    <%if(liveplayer.meta){%>'
                      + '      <%if(liveplayer.meta.type){%>'
                      + '      <source src="<%=liveplayer.meta.source%>" type="<%=liveplayer.meta.type%>" />'
                      + '      <%}else{%>'
                      + '      <source src="<%=liveplayer.meta.source%>" />'
                      + '      <%}%>'
                      + '    <%}%>'
                      + '    </video>'
                      + '    <div class="liveplayer-master-mask flexbox middle center<%=liveplayer.autoplay ? " hide" : ""%>">'
                      + '       <ins class="icofont" data-action-click="liveplayer://play#<%=liveplayer.name%>"></ins>'
                      + '    </div>'
                      + '  </div>'
                      + '</div>'
                      + '';

    var _seek_start = ("ontouchstart" in document) ? "touchstart.liveplayer" : "mousedown.liveplayer";
    var _seek_move = ("ontouchmove" in document) ? "touchmove.liveplayer" : "mousemove.liveplayer";
    var _seek_end = ("ontouchend" in document) ? "touchend.liveplayer" : "mouseup.liveplayer";

    var LivePlayerSchema = {
        schema: "liveplayer",
        swapState: function(data, node, e, type){
            e.stopPropagation();

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
            e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);
            var frame = player.getLivePlayerFrame();
            var timer = player.watch();

            frame.toggleClass("hidebars");

            timer.stop();
            if(!frame.hasClass("hidebars")){
                timer.start();
            }
        },
        play: function(data, node, e, type){
            e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);

            if(!node.hasClass("liveplayer-error")){
                player.play();
            }
        },
        fullscreen: function(data, node, e, type){
            e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);
            var master = player.getLivePlayerMasterVideo(true);

            if(master.requestFullscreen){
                master.requestFullscreen();
            }else if(master.mozRequestFullScreen){
                master.mozRequestFullScreen();
            }else if(master.webkitRequestFullscreen){
                master.webkitRequestFullscreen();
            }
        },
        reconnect: function(data, node, e, type){
            e.stopPropagation();

            var args = (data || "").split(",");
            var name = args[0];

            var player = LivePlayer.getLivePlayer(name);

            player.destory(false);
            player.render(true);
        },
        progress: {
            seek: function(data, node, e, type){
                var evt = ("changedTouches" in e ? e["changedTouches"][0] : e);
                var args = (data || "").split(",");
                var name = args[0];

                var player = LivePlayer.getLivePlayer(name);

                if(player.isLive()){
                    return ;
                }

                player.seekToMouse(evt.pageX);
            }
        }
    };
    /**
    <element
      data-liveplayer="播放器实例名称" 
      data-liveplayer-type="播放器类型，[vod|live]" 
      data-liveplayer-back="返回URL" 
      data-liveplayer-title="视频标题" 
      data-liveplayer-width="宽度，默认：100%" 
      data-liveplayer-height="高度，默认：4.46rem" 
      
      data-liveplayer-time="控制条及标题栏停留时长，默认：3000毫秒" 

      data-liveplayer-allowFullScreen="是否允许显示全屏菜单，1 - 显示， 0 - 不显示" 
      data-liveplayer-allowAdjustVolume="是否允许调节音量， 1 - 允许， 0 - 不允许"
      
      data-liveplayer-volume="默认音量 7"
      data-liveplayer-source="视频地址，格式：mimetype:media_source" 
      data-liveplayer-poster="视频poster图片地址" 
      data-liveplayer-preload="预加载，auto - 当页面加载后载入整个视频 meta - 当页面加载后只载入元数据 none - 当页面加载后不载入视频" 
      data-liveplayer-loop="是否设置循环播放，1 - 循环， 0 - 单播" 
      data-liveplayer-autoplay="是否设置为自动播放， 1 - 自动播放， 0 - 需要点击播放" 
      data-liveplayer-multed="是否设置为禁用， 1 - 不禁音， 0 - 禁音" 
      data-liveplayer-nextlist="其他播放地址列表，多个地址间用英文逗号“,”分隔，没有时为空或不设置该属性，地址格式：mimetype:media_source"
      data-liveplayer-controls="是否显示控制条， 1 - 显示， 0 - 不显示"
      data-liveplayer-appearance="播放器外观，define - 自定义 native - 系统默认样式 none - 无外观仅播放窗口"
      data-liveplayer-x5h5="设置腾讯X5内核播放器H5属性 1 - 设置 0 - 不设置"
    ></element>
    **/
    var GetDefaultOptions = function(){
        var options = {
            type: "live",
            back: "#",
            title: "&nbsp;",
            width: "100%",
            height: "4.46rem",
            time: 3000,
            allowFullScreen: true,
            allowAdjustVolume: true,
            volume: 7,
            source: "",
            poster: "",
            preload: "auto",
            loop: false,
            autoplay: true,
            muted: false,
            controls: true,
            appearance: "define",
            nextlist: "",
            x5h5: false
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
        this.opts = $.extend(true, {}, GetDefaultOptions(), options || {});

        this.isListened = false;
        this.nextPlayList = [];
        this.nextPlayIndex = 0;
        this.name = name;
        this.allowHideBars = true;

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
            onwaiting: null                 //在一个待执行的操作（如回放）因等待另一个操作（如跳跃或下载）被延迟时触发。
        };
        this.listner = new Listener(this.events, this.handleStack);
    };

    LivePlayer.prototype = {
        //默认处理器
        LivePlayerProcessor: {
            "timeupdate": function(e){
                var master = this.getLivePlayerMasterVideo(true);
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

                    // if(this.isVOD()){
                    //     if(Env.browser.tbs.major > 0){
                    //         var diff = duration - currentTime;

                    //         if(diff < 1){
                    //             this.pause();
                    //             this.next();
                    //         }
                    //     }
                    // }
                }
            },
            "pause": function(e){
                var frame = this.getLivePlayerFrame();
                var mask = this.getLivePlayerMasterMask();
                var master = this.getLivePlayerMasterVideo(true);

                this.watch().stop();
                frame.removeClass("hidebars");

                if(master.error){
                    mask.removeClass("hide")
                        .addClass("liveplayer-error");
                }else{
                    mask.addClass("hide")
                        .removeClass("liveplayer-error");
                }
            },
            "playing": function(e){
                var mask = this.getLivePlayerMasterMask();

                if(this.allowHideBars){
                    this.watch().start();
                }

                mask.addClass("hide");
            },
            "ended": function(e){
                if(this.isVOD()){
                    // if(Env.browser.tbs.major <= 0){
                        this.next();
                    // }
                }
            },
            "error": function(e){
                var master = this.getLivePlayerMasterVideo(true);

                if(master.error){
                    this.error(master.error);
                }
            },
            "abort": function(e){
                var master = this.getLivePlayerMasterVideo(true);

                if(master.error){
                    this.error(master.error);
                }
            },
            "emptied": function(e){
                var master = this.getLivePlayerMasterVideo(true);

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
        getLivePlayerButton: function(type){
            var frame = this.getLivePlayerFrame();
            var button = frame.find(".liveplayer-button-" + type);

            return button;
        },
        getLivePlayerMasterZone: function(){
            var frame = this.getLivePlayerFrame();
            var mask = frame.find(".liveplayer-master");

            return mask;
        },
        getLivePlayerMasterVideo: function(isDOM){
            var frame = this.getLivePlayerFrame();
            var master = frame.find(".liveplayer-master video");

            return isDOM ? master[0] : master;
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

                if(!mimeType){
                    mimeTypes = LivePlayer.SOURCE_MIME_TYPES(src);

                    if(mimeTypes){
                        mimeType = mimeTypes[0];
                    }
                }
                return {
                    "type": mimeType || "",
                    "source": src
                }
            }

            return null;
        },
        updateMasterSource: function(source){
            var video = this.getLivePlayerMasterVideo();
            var sourceInfo = DataType.isString(source) ? this.parseMasterSource(source) : source;

            // console.log(">>-----------------------");
            // console.log(source);
            // console.log(JSON.stringify(sourceInfo));
            // console.log("<<-----------------------")


            if(sourceInfo){
                if(sourceInfo.type){
                    video.removeAttr("src")
                         .html('<source src="' + sourceInfo.source + '" type="' + sourceInfo.type + '" />');
                }else{
                    video.removeAttr("src")
                         .html('<source src="' + sourceInfo.source + '" />');
                }

                video[0].load();
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

                progressSeekNode.css("width", percent);
                progressSeekBarNode.css("left", pos + "px");
            }
        },
        parseNextPlayList: function(){
            var nextlist = this.options("nextlist") || "";
            var items = nextlist.split(",");
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
        updateNextPlayList: function(nextlist){
            this.nextPlayList = [].concat(nextlist);

            // console.log("------------------------------");
            // console.log(arguments.callee.caller);
            // console.log(this.nextPlayList);
            // console.log("------------------------------");
        },
        getNextPlayList: function(){
            return this.nextPlayList;
        },
        getNextPlayURL: function(isReverse){
            var list = [].concat(this.getNextPlayList());
            var url = "";

            if(true === isReverse){
                url = list.pop() || "";
            }else{
                url = list.shift() || "";
            }

            this.updateNextPlayList(list);

            return url;
        },
        isLive: function(){
            var type = this.options("type");

            return "live" == type;
        },
        isVOD: function(){
            var type = this.options("type");

            return "vod" == type;
        },
        watch: function(){
            var name = this.getLivePlayerName();
            var time = this.options("time");
            var timer = Timer.getTimer("liveplayer_" + name, Timer.toFPS(time), {
                callback: function(_timer){
                    var frame = this.getLivePlayerFrame();

                    if(!frame.hasClass("hidebars")){
                        frame.addClass("hidebars");
                    }

                    _timer.stop();
                },
                context: this
            });

            return timer;
        },
        dispatcher: function(e){
            var data = e.data;
            var type = e.type;
            var ins = data.liveplayer;
            var name = ins.getLivePlayerName();
            var processor = ins.LivePlayerProcessor;

            e.preventDefault();
            e.stopPropagation();

            // console.log(name + " - " + type);

            if((type in processor) && processor[type]){
                processor[type].apply(ins, [e]);
            }

            ins.exec(type, [e, name]);
        },
        listen: function(){
            if(true !== this.isListened){
                var events = this.getLivePlayerEvents();
                var master = this.getLivePlayerMasterVideo();

                if(master.length > 0){
                    master.on(events.join(" "), "", {
                        liveplayer: this
                    }, this.dispatcher);

                    this.isListened = true;
                }
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
                //     height: "4.46rem",
                //     time: 3000,
                //     allowFullScreen: true,
                //     allowAdjustVolume: true,
                //     volume: 7,
                //     source: "",
                //     poster: "",
                //     preload: "auto",
                //     loop: false,
                //     autoplay: true,
                //     muted: false,
                //     controls: true,
                //     appearance: "define",
                //     nextlist: "",
                //     x5h5: false
                // };
                var _conf = [
                    {name: "type", dataType: "string"},
                    {name: "back", dataType: "string"},
                    {name: "title", dataType: "string"},
                    {name: "width", dataType: "string"},
                    {name: "height", dataType: "string"},
                    {name: "time", dataType: "number"},
                    {name: "allowFullScreen", dataType: "boolean"},
                    {name: "allowAdjustVolume", dataType: "boolean"},
                    {name: "volume", dataType: "number"},
                    {name: "source", dataType: "string"},
                    {name: "poster", dataType: "string"},
                    {name: "preload", dataType: "string"},
                    {name: "loop", dataType: "boolean"},
                    {name: "autoplay", dataType: "boolean"},
                    {name: "muted", dataType: "boolean"},
                    {name: "controls", dataType: "boolean"},
                    {name: "appearance", dataType: "string"},
                    {name: "nextlist", dataType: "string"},
                    {name: "x5h5", dataType: "boolean"}
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
        seekToMouse: function(pageX){
            var frame = this.getLivePlayerFrame();
            var master = this.getLivePlayerMasterVideo(true);
            var rect = Util.getBoundingClientRect(frame[0]);

            var left = rect.left;
            var width = rect.width;
            var pos = pageX - left;

            var duration = master.duration;
            var percent = pos / width;
            var targetTime = Number(Number(duration * percent).toFixed(3));

            master.currentTime = targetTime;

            var percent = master.currentTime / duration;
            var s = Math.min(percent * 100, 100) + "%";

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
            player.allowHideBars = false;
            player.watch().stop();

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

            player.allowHideBars = true;
            player.watch().start();

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
        render: function(isInvokePlay){
            var container = this.getLivePlayerPlugin();

            if(container.find(".liveplayer-frame").length === 0){
                this.options(this.parse());

                var metaData = $.extend({}, this.options(), {
                    "name": this.getLivePlayerName(),
                    "meta": this.parseMasterSource(this.options("source"))
                });

                //解析其它播放列表
                this.updateNextPlayList(this.parseNextPlayList()); 

                LivePlayerTemplate.render(true, HTML_TEMPLATE, metaData, {
                    callback: function(ret, _container, _isInvokePlay){
                        _container.html(ret.result);

                        Util.delay(50, {
                            callback: function(et, _node, $isInvokePlay){
                                this.listen();
                                this.setVolume(this.options("volume"));

                                Util.registAction(_node, [
                                    {type: "click", mapping: null, compatible: null},
                                    {type: "touchstart", mapping: "mousedown", compatible: null},
                                    {type: "touchmove", mapping: "mousemove", compatible: null},
                                    {type: "touchend", mapping: "mouseup", compatible: null}
                                ], null);

                                Util.source(LivePlayerSchema);

                                if(this.options("autoplay")){
                                    this.watch().start();
                                }else{
                                    this.watch();
                                }
                                this.bindSeekEvent();

                                if(true === $isInvokePlay){
                                    var master = this.getLivePlayerMasterVideo(true);
                                    var state = this.getLivePlayerMasterControlState();

                                    master.play();
                                    state.removeClass("pause")
                                         .addClass("play");
                                }
                            },
                            args: [_container, _isInvokePlay],
                            context: this
                        });
                    },
                    args: [container, isInvokePlay],
                    context: this
                });
            }else{
                //解析其它播放列表
                this.updateNextPlayList(this.parseNextPlayList());
            }
        },
        load: function(source, isPlay){
            var video = this.getLivePlayerMasterVideo();

            if(video.length > 0){
                this.updateMasterSource(source)

                if(true === isPlay){
                    this.play();
                }else{
                  this.pause();
                }
            }
        },
        reload: function(isPlay){
            var source = this.options("source");
            
            this.updateNextPlayList(this.parseNextPlayList());

            // console.log("reload::source = " + source);
            // console.log(this.getNextPlayList());

            this.load(source, true === isPlay);
        },
        next: function(){
            var next = this.getNextPlayURL();
            var frame = this.getLivePlayerFrame();
            var playButton = this.getLivePlayerButton("play");
            var cs = playButton.parents(".liveplayer-control-state");
            var isLoop = this.options("loop");

            // console.log(next);
            // console.log("next::source = " + next);
            // console.log(this.getNextPlayList())

            if(!next){
                cs.removeClass("play pause").addClass("pause");
                frame.removeClass("hidebars");
                this.reload(isLoop);
            }else{
                this.load(next, true);
            }
        },
        restore: function(){
            var master = this.getLivePlayerMasterVideo(true);
            var duration = master.duration;

            this.updateTimeSeek(0, duration);
            this.updateProgress("0%");
        },
        play: function(){
            var master = this.getLivePlayerMasterVideo(true);
            var state = this.getLivePlayerMasterControlState();
            var mask = this.getLivePlayerMasterMask();

            if(master){
                if(mask.hasClass("liveplayer-error")){
                    this.destory();
                    this.render(true);
                }else{
                    master.play();

                    state.removeClass("pause")
                         .addClass("play");
                }
            }
        },
        pause: function(){
            var master = this.getLivePlayerMasterVideo(true);
            var state = this.getLivePlayerMasterControlState();

            if(master){
                master.pause();

                state.removeClass("play")
                     .addClass("pause");
            }
        },
        //---------- NATIVE PROPERTIES SET BEGIN ---------------
        setVolume: function(volume){
            var master = this.getLivePlayerMasterVideo(true);

            if(master){
                master.volume = Number(Number(volume / 10).toFixed(1));
            }
        },
        getVolume: function(){
            var master = this.getLivePlayerMasterVideo(true);

            if(master){
                return master.volume;
            }
        },
        setCrossOrigin: function(crossOrigin){
            var master = this.getLivePlayerMasterVideo(true);

            if(master){
                // anonymous, use-credentials
                master.crossOrigin = crossOrigin;
            }
        },
        getCrossOrigin: function(){
            var master = this.getLivePlayerMasterVideo(true);

            if(master){
                return master.crossOrigin;
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
        error: function(err){
            switch(err.code){
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
            }

            var mask = this.getLivePlayerMasterMask();
            var state = this.getLivePlayerMasterControlState();
            var ins = mask.find("ins");
            var meta = {
                "name": this.getLivePlayerName()
            };

            mask.addClass("liveplayer-error").removeClass("hide");
            ins.html(err.code + ": " + Util.formatData(err.message, meta));

            state.removeClass("play pause")
                 .addClass("pause");
        },
        destory: function(){
            var frame = this.getLivePlayerFrame();
            frame.remove();

            this.isListened = false;
            this.nextPlayList = [];
            this.nextPlayIndex = 0;
            this.allowHideBars = true;
        }
    };

    LivePlayer.Error = {
        "MEDIA_ERR_NO_SOURCE": {
            "code": "E0001",
            "message": "解析播放地址失败，正确格式：[媒体类型:]播放地址。如：video/mp4:source.mp4或source.mp4"
        },
        "MEDIA_ERR_ABORTED": {
            "code": "E1001",
            "message": "已取消视频源的请求"
        },
        "MEDIA_ERR_NETWORK": {
            "code": "E1002",
            "message": "网络出现故障<a href=\"#\" data-action-click=\"liveplayer://reconnect#${name}\">重试</a>"
        },
        "MEDIA_ERR_DECODE": {
            "code": "E1003",
            "message": "媒体解码失败"
        },
        "MEDIA_ERR_SRC_NOT_SUPPORTED": {
            "code": "E1004",
            "message": "不支持的媒体地址"
        }
    };

    LivePlayer.canPlaySource = function(source){
        var mimeTypes = LivePlayer.SOURCE_MIME_TYPES(source);

        if(!mimeTypes){
            return false;
        }

        var video = document.createElement("video");
        var canplay = "";
        var supported = false;

        for(var i = 0; i < mimeTypes.length; i++){
            canplay = video.canPlayType(mimeTypes[i]);

            if(!!canplay){
                supported = true;
            }
        }

        video = null;
        
        return supported;
    };

    LivePlayer.SOURCE_MIME_TYPES = function(source){
        var urlInfo = Request.parseURL(source);
        var fileName = urlInfo.filename;
        var ext = fileName.replace(/^[^\.]+\./, "");
        var mimeTypes = null;

        switch(ext.toLowerCase()){
            case "mp4":
            case "mp4v":
            case "mpg4":
                mimeTypes = [
                    "video/mp4"
                ];
            break;
            case "mpeg":
            case "mpg":
            case "mpe":
            case "m1v":
            case "m2v":
                mimeTypes = [
                    "video/mpeg"
                ];
            break;
            case "ogv":
            case "ogg":
            case "ogm":
                mimeTypes = [
                    "video/ogg"
                ];
            break;
            case "webm":
                mimeTypes = [
                    "video/webm"
                ];
            break;
            case "f4v":
                mimeTypes = [
                    "video/x-f4v"
                ];
            break;
            case "flv":
                mimeTypes = [
                    "video/x-flv"
                ];
            break;
            case "m3u8":
                mimeTypes = [
                    "application/vnd.apple.mpegurl"
                ];
            break;
            default:
                mimeTypes = null;
            break;
        }

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
            "getLivePlayerFrame": function(){
                return player.getLivePlayerFrame();
            },
            "getLivePlayerButton": function(type){
                return player.getLivePlayerButton(type);
            },
            "getLivePlayerMasterZone": function(){
                return player.getLivePlayerMasterZone();
            },
            "getLivePlayerMasterVideo": function(isDOM){
                return player.getLivePlayerMasterVideo(isDOM);
            },
            "getLivePlayerMasterMask": function(){
                return player.getLivePlayerMasterMask();
            },
            "getLivePlayerMasterControlState": function(){
                return player.getLivePlayerMasterControlState();
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
            "seekToMouse": function(pageX){
                player.seekToMouse(pageX);

                return this;
            },
            "parseNextPlayList": function(){
                return player.parseNextPlayList();
            },
            "updateNextPlayList": function(list){
                player.updateNextPlayList(list);

                return this;
            },
            "getNextPlayList": function(){
                return player.getNextPlayList();
            },
            "getNextPlayURL": function(){
                return player.getNextPlayURL();
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
            "next": function(){
                player.next();

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
            "destory": function(removeCache){
                player.destory();

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

    module.exports = {
        "version": "R16B1201",
        createLivePlayer: function(name, options){
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
        destory: function(name, removeCache){
            var player = null;

            if(name){
                var player = LivePlayer.getLivePlayer(name);

                if(player){
                    player.destory(removeCache);
                }
            }else{
                for(var _name in LivePlayer.LivePlayers){
                    if(LivePlayer.LivePlayers.hasOwnProperty(_name)){
                        player = LivePlayer.getLivePlayer(_name);

                        if(player){
                            player.destory(removeCache);
                        }
                    }
                }
            }
        }
    };
});