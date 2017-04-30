/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * FullScreen
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.3
 */
;define(function(require, exports, module){
    var Util = require("mod/se/util");

    var _doc = document;
    var _win = window;

    _doc.x5fullscreen = false; //for Tencent X5(TBS)

    var _FullScreen = function(name, element){
        this.name = name;
        this.element = element;
    };

    _FullScreen.prototype = {
        isFullScreen: function(){
            return !!(
                _doc.fullscreen || 
                _doc.webkitIsFullScreen || 
                _doc.mozFullScreen || 
                _doc.x5fullscreen || 
                _win.fullScreen || 
                this.element.webkitDisplayingFullscreen
            );
        },
        isFullScreenAvailable: function(){
            return !!(
                _doc.fullscreenEnabled || 
                _doc.webkitFullscreenEnabled || 
                _doc.mozFullScreenEnabled || 
                _doc.msFullscreenEnabled || 
                this.element.webkitSupportsFullscreen
            );
        },
        getFullScreenElement: function(){
            return (
                _doc.fullscreenElement || 
                _doc.webkitFullscreenElement || 
                _doc.mozFullScreenElement || 
                _doc.msFullscreenElement || 
                (_doc.x5fullscreen ? this.element : null)
            );
        },
        _dispatcher: function(e){
            var data = e.data;
            var name = data.name;
            var type = data.type;
            var element = data.element;
            var handler = data.handler;

            switch(type){
                case "x5videoenterfullscreen":
                    _doc.x5fullscreen = true;
                break;
                case "x5videoexitfullscreen":
                    _doc.x5fullscreen = false;
                break;
            }

            Util.execHandler(handler, [e, name, element]);
        },
        onfullscreenchange: function(handler){
            var eventType = "onfullscreenchange";

            if("onwebkitfullscreenchange" in _doc){
                eventType = "webkitfullscreenchange";
            }else if("onmozfullscreenchange" in _doc){
                eventType = "mozfullscreenchange";
            }else if("onmsfullscreenchange" in _doc){
                eventType = "msfullscreenchange";
            }else{
                console.warn("not support fullscreenchange");
            }

            var data = {
                "name": this.name,
                "type": eventType,
                "element": this.element,
                "handler": handler
            };

            $(_doc).on(eventType, "", data, this._dispatcher);
        },
        onfullscreenerror: function(handler){
            var eventType = "fullscreenerror";

            if("onwebkitfullscreenerror" in _doc){
                eventType = "webkitfullscreenerror";
            }else if("onmozfullscreenerror" in _doc){
                eventType = "mozfullscreenerror";
            }else if("onmsfullscreenerror" in _doc){
                eventType = "msfullscreenerror";
            }else{
                console.warn("not support fullscreenerror");
            }

            var data = {
                "name": this.name,
                "type": eventType,
                "element": this.element,
                "handler": handler
            };

            $(_doc).on(eventType, "", data, this._dispatcher);
        },
        onwebkitbeginfullscreen: function(handler){
            var eventType = "webkitbeginfullscreen";

            var data = {
                "name": this.name,
                "type": eventType,
                "element": this.element,
                "handler": handler
            };

            $(this.element).on(eventType, "", data, this._dispatcher);
        },
        onwebkitendfullscreen: function(handler){
            var eventType = "webkitendfullscreen";

            var data = {
                "name": this.name,
                "type": eventType,
                "element": this.element,
                "handler": handler
            };

            $(this.element).on(eventType, "", data ,this._dispatcher);
        },
        onx5videoenterfullscreen: function(handler){
            var eventType = "x5videoenterfullscreen";

            var data = {
                "name": this.name,
                "type": eventType,
                "element": this.element,
                "handler": handler
            };

            $(this.element).on(eventType, "", data ,this._dispatcher);
        },
        onx5videoexitfullscreen: function(handler){
            var eventType = "x5videoexitfullscreen";

            var data = {
                "name": this.name,
                "type": eventType,
                "element": this.element,
                "handler": handler
            };

            $(this.element).on(eventType, "", data ,this._dispatcher);
        },
        requestFullscreen: function(){
            var master = this.element;

            if(master.requestFullscreen){
                master.requestFullscreen();
            }else if(master.mozRequestFullScreen){
                master.mozRequestFullScreen();
            }else if(master.msRequestFullscreen){
                master.msRequestFullscreen();
            }else if(master.webkitRequestFullscreen){
                master.webkitRequestFullscreen();
            }else if(master.webkitEnterFullScreen){
                master.webkitEnterFullScreen();
            }
        },
        exitFullscreen: function(){
            var master = this.element;

            if(_doc.exitFullscreen){
                _doc.exitFullscreen();
            }else if(_doc.mozCancelFullScreen){
                _doc.mozCancelFullScreen();
            }else if(_doc.msExitFullscreen){
                _doc.msExitFullscreen();
            }else if(_doc.webkitExitFullscreen){
                _doc.webkitExitFullscreen();
            }else if(master.webkitExitFullscreen){
                master.webkitExitFullscreen();
            }
        }
    };

    _FullScreen.Cache = {};

    _FullScreen.newFullScreenInstance = function(name, element){
        var ins = _FullScreen.Cache[name] || (_FullScreen.Cache[name] = new _FullScreen(name, element));

        return {
            "isFullScreen": function(){
                return ins.isFullScreen();
            },
            "isFullScreenAvailable": function(){
                return ins.isFullScreenAvailable();
            },
            "getFullScreenElement": function(){
                return ins.getFullScreenElement();
            },
            "onfullscreenchange": function(handler){
                ins.onfullscreenchange(handler);

                return this;
            },
            "onfullscreenerror": function(handler){
                ins.onfullscreenerror(handler);

                return this;
            },
            "onwebkitbeginfullscreen": function(handler){
                ins.onwebkitbeginfullscreen(handler);

                return this;
            },
            "onwebkitendfullscreen": function(handler){
                ins.onwebkitendfullscreen(handler);

                return this;
            },
            "onx5videoenterfullscreen": function(handler){
                ins.onx5videoenterfullscreen(handler);

                return this;
            },
            "onx5videoexitfullscreen": function(handler){
                ins.onx5videoexitfullscreen(handler);

                return this;
            },
            "requestFullscreen": function(){
                ins.requestFullscreen();

                return this;
            },
            "exitFullscreen": function(){
                ins.exitFullscreen();

                return this;
            }
        };
    };

    _FullScreen.getFullScreenInstance = function(name){
        var ins = null;
        var cache = null;

        if(name in _FullScreen.Cache){
            cache = _FullScreen.Cache[name];
            ins = _FullScreen.newFullScreenInstance(name, cache.element);

            return ins;
        }

        return ins;
    };

    module.exports = {
        "version": "R17B0430.01",
        "newFullScreenInstance": _FullScreen.newFullScreenInstance,
        "getFullScreenInstance": _FullScreen.getFullScreenInstance
    };
});