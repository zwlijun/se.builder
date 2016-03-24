/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 工具模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function Util(require, exports, module){
    //Action配置
    $.Action = {
        //todo
    };

    var __action__ = function(e){
        e = e || {};
        //flag:        1|2   1: preventDefault   2:stopPropagation   1 & 2: preventDefault + stopPropagation
        //eventType:   事件类型，如：click, mousedown, custom.boxshow
        //[flag#][eventType::]Class://[dir[/dir1...n]/]method[#params]
        //mousedown::Action://a/b/get#1,2,3
        //Actoin://a/b/get#1,2,3
        //
        var node = $(e.currentTarget);
        var eventData = e.data;
        var action = node.attr("data-action") || "";
        var pattern = /^([0-9]+#)?([a-zA-Z\. ]+::)?(([a-zA-Z0-9_]+):\/\/([a-zA-Z0-9_\/]+)(#([\w\W]*))?)$/;
        var result = pattern.exec(action);
        var _trigger = null;
        var _flag = null;
        var _uri = null;

        if(result){
            _flag = Number((result[1] || "0").replace("#", ""));
            _trigger = (result[2] || _util.CLICK_EVENT).replace("::", "");
            _uri = result[3];
            //_method = result[2];

            //console.info(result[1] + "\n" + result[2] + "\n" + result[3] + "\n" + result[5]);

            if(((function(a, b){
                var types = a.split(" ");
                var size = types.length;

                for(var i = 0; i < size; i++){
                    if(types[i] == b){
                        return true;
                    }
                }

                return false;
            })(_trigger, e.type))){

                if(_flag > 0){
                    if(_util.checkBitFlag(_flag, 1) && e.preventDefault){ //preventDefault
                        e.preventDefault();
                    }

                    if(_util.checkBitFlag(_flag, 2) && e.stopPropagation){
                        e.stopPropagation();
                    }
                }

                _util.requestExternal(_uri, [node, e]);
            }
        }
    }; 

    //Action事件委托
    var __onAction = function(e){
        // e.preventDefault();
        // e.stopPropagation();
        
        __action__(e);
    };

    var _util = {
        //点击事件，如果支持touch，则用tap事件，否则用click事件
        CLICK_EVENT : (("ontouchstart" in window) ? "tap" : "click"),
        //zepto ajax异常配置
        RequestStatus : {
            "timeout"  : {status: 0xFE01, text: "亲，网络不给力啊~~"},
            "error"  : {status: 0xFE02, text: "亲，系统出了点小问题，请稍候片刻再试"},
            "abort" : {status: 0xFE03, text: "抱歉，您的请求被中断，请重新发起"},
            "parsererror" : {status: 0xFE04, text: "数据处理异常"},
            "success" : {status: 0x0000, text: "OK"}
        },
        PACKAGE_HOLDER: "FORMAT_PACKAGE_HOLDER",
        /**
         * bit位检测
         * @param int src 源值
         * @param int flag 标识位
         * @return Boolean 
         * @example Util.checkBitFlag(7, 2) => true
         *          Util.checkBitFlag(7, 8) => false
         */
        checkBitFlag : function(src, flag){
            return (!!(src & flag) && flag > 0)
        },
        /**
         * 格式化模板数据
         * @param String tpl 模板数据
         * @param Object metaData 元数据
         * @param String preifx 模板数据前缀标识，默认为$
         * @param Handler handle 用于处理非Object或非简单数据类型的数据
         * @return String str 格式化后的字符串
         */
        formatData : function(tplData, metaData, prefix, handler){
            var str = "";
            var reg = null;
            var meta = null;

            prefix = (undefined === prefix ? "\\$" : (prefix ? "\\" + prefix : ""));
            prefix = prefix.replace(/\\\\/g, "\\");
            tplData = tplData || "";

            for(var key in metaData){
                if(metaData.hasOwnProperty(key)){
                    meta = metaData[key];
                    
                    reg = new RegExp(prefix + "\\!?\\{" + key.replace(/\./g, "\\.") + "\\}", "gm");
                    str = (tplData = tplData.replace(reg, meta));
                    reg = null;
                }
            }

            str = str || tplData;

            // console.info("output: " + str);
            //----------------------------------
            reg = new RegExp(prefix + "\\!\\{[^\\{\\}]+\\}", "gm");
            str = str.replace(reg, "");
            reg = null;
            //----------------------------------
            return str;
        },
        /**
         * 隐藏地址栏
         */
        hideAddressBar : function(e){
            setTimeout(function(){
                window.scrollTo(0, 1);
            }, 0);
        },
        /**
         * 获取设备屏幕显示方向
         * @return int orient 0:竖屏 1:横屏
         */
        getOrientation : function(){
            var orient = window.orientation;

            if(0 === orient || 180 == orient){
                return 0; //竖屏
            }else if(90 == orient || -90 == orient){
                return 1;  //横屏
            }else{
                return 0;  //竖屏
            }
        },
        /**
         * 执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         */
        execHandler : function(handler){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;
                var delay = handler.delay || -1;

                if(callback && callback instanceof Function){
                    if(typeof(delay) == "number" && delay >= 0){
                        setTimeout(function(){
                            callback.apply(context, args);
                        }, delay);
                    }else{
                        return callback.apply(context, args);
                    }
                }
            }
        },
        /**
         * 合并参数后执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         * @param Array args 参数
         */
        execAfterMergerHandler : function(handler, _args){
            var newHandler = $.extend({}, handler);
            
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;

                newHandler.args = _args.concat(args);
            }

            return this.execHandler(newHandler);
        },
        /**
         * html解码
         * @param String str 字符串
         * @return String tmp 解码后的字符串
         */
        decodeHTML : function(str){
            var tmp = str.replace(/&#60;/g, "<");
                tmp = tmp.replace(/&#62;/g, ">");
                tmp = tmp.replace(/&#34;/g, "\"");
                tmp = tmp.replace(/&#39;/g, "'");
                tmp = tmp.replace(/&#38;/g, "&");
                
            return tmp;
        },
        /**
         * html编码
         * @param String str 字符串
         * @return String tmp 编码后的字符串
         */
        encodeHTML : function(str){
            var tmp = str.replace(/&/g, "&#38;");
                tmp = tmp.replace(/>/g, "&#62;");
                tmp = tmp.replace(/"/g, "&#34;");
                tmp = tmp.replace(/'/g, "&#39;");
                tmp = tmp.replace(/</g, "&#60;");
            
            return tmp;
        },
        /**
         * 获取光标位置
         * @param Node ctrl 控件
         * @return Number caretPos 光标位置
         */
        getCursorPosition : function(ctrl){
            var caretPos = 0;
            
            if(document.selection) {
                ctrl.focus();
                
                var section = document.selection.createRange();
                
                section.moveStart ('character', -ctrl.value.length);
                caretPos = section.text.length;
                
            }else if(typeof(ctrl.selectionStart) == "number"){
                caretPos = ctrl.selectionStart;
            }
            return caretPos;
        },
        /**
         * 设置光标位置
         * @param Node ctrl 控件
         * @param Number pos 光标位置
         */
        setCursorPosition : function(ctrl, pos){
            setTimeout(function(){
                if(typeof(ctrl.selectionStart) == "number"){
                    ctrl.selectionStart = ctrl.selectionEnd = pos;
                }else if(ctrl.setSelectionRange){
                    ctrl.focus();
                    ctrl.setSelectionRange(pos,pos);
                }else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }, 15);
        },
        source: function(data){
            var name = data.name;

            if(name){
                if(!(name in $)){
                    $[name] = data;
                }else{
                    $.extend(true, $[name], data);
                }
            }
        },
        requestExternal: function(uri, args){
            var pattern = /^([a-zA-Z0-9_]+):\/\/([a-zA-Z0-9_\/]+)(#([\w\W]*))?$/;
            var result = pattern.exec(uri);
            var _class = null;
            var _className = null;
            var _namespace = null;
            var _method = null;
            var _data = null;

            if(result){
                _className = result[1];
                _namespace = result[2];            
                _data = result[4] || null;
                 _class = $[_className] || null;

                if(_class){

                    if(_namespace.indexOf("/") == -1){
                        _method = _namespace;
                    }else{
                        var _pkgs = _namespace.split("/");
                        var _size = _pkgs.length;

                        _class = (function(c, pkgs, size){
                            var pkg = null;

                            for(var i = 0; i < size - 1; i++){
                                pkg = pkgs[i];

                                if(null != c && (pkg in c)){
                                    c = c[pkg] || null;
                                }else{
                                    return null;
                                }
                            }

                            return c;
                        })(_class, _pkgs, _size);

                        _method = _pkgs[_size - 1];
                    }

                    if(null != _class && (_method in _class)){
                        return {
                            "result": _class[_method].apply(null, [_data].concat(args||[])),
                            "code": 0
                        };
                    }

                    return {
                        "result": undefined,
                        "code": -1
                    };
                }
            }else{
                return {
                    "result": undefined,
                    "code": -2
                };
            }
        },
        /**
         * 设置Action勾子         
         */
        setActionHook : function(selector, eventType){
            var body = $(selector || "body");
            var type = eventType || _util.CLICK_EVENT;
            var setting = null;
 
            if(Object.prototype.toString.call(type) == "[object Array]"){
                for(var i = 0; i < type.length; i++){
                    setting =  body.attr("data-action-" + type[i]);

                    if("1" != setting){
                        body.on(type[i], '[data-action]', __onAction); 
                        body.attr("data-action-" + type[i], "1");
                    }
                }
            }else{
                setting =  body.attr("data-action-" + type);
                if("1" != setting){
                    body.on(type, '[data-action]', __onAction); 
                    body.attr("data-action-" + type, "1");
                }
            }

            body = null;
        },
        /**
         * 主动触发data-action
         * @param Event|Object e 事件 ，如果Object类型，数据格式为：{"type":eventType, "currentTarget": node, "data": null}
         */
        fireAction : function(e){
            __action__.apply(null, [e]);
        },
        /**
         * 注入Action配置
         * @param Object action action配置
         */
        injectAction : function(action){
            $.extend(true, $.Action, action);
        },
        /**
         * 获取设备的像素比
         * @return float ratio 像素比
         */
        getDevicePixelRatio : function(){
            return window.devicePixelRatio || 1;
        },
        /**
         * 是否为隐藏节点
         * @param Node node
         * @return Boolean hidden
         */
        isHiddenNode : function(node){
            var dom = node[0];
            var hidden = false;
            var display = null;

            do{
                display = node.css("display");

                if("none" == display){
                    hidden = true;
                    break;
                }

                node = node.parent();
                dom = node[0];
            }while(dom != document.documentElement);

            return hidden;
        },
        /**
         * 查找节点的真实尺寸
         * @param Node node
         * @param String name
         * @param Number scale
         * @return Number size
         */
        findNodeRealSize : function(node, name, scale){
            var v = (node.css(name) || "").toLowerCase();

            if(v){
                if(v.indexOf("px") != -1){
                    return Number(v.substr(0, v.length - 2)) * scale;
                }else if(v.indexOf("%") != -1){
                    v = Number(v.substr(0, v.length - 1));

                    return this.findNodeRealSize(node.parent(), name, Math.round(v / 100));
                }else{
                    var tmp = v.replace(/[^0-9]+/g, "");

                    if(tmp){
                        return Number(v.replace(/[^0-9]+/g, "")) * scale;
                    }else{
                        return this.findNodeRealSize(node.parent(), name, scale);
                    }
                }
            }else{
                return this.findNodeRealSize(node.parent(), name, scale);
            }
        },
        /**
         * 获取节点的真实尺寸
         * @param Node node
         * @param Number scale
         * @param Object {Number width, Number height}
         */
        getNodeRealSize : function(node, scale){
            var offset = node.offset() || {"width": 0, "height": 0};
            var width = offset.width;
            var height = offset.height;
            var size = {
                "width":  width,
                "height": height
            };

            if(width <= 0 || height <= 0){
                size.width = this.findNodeRealSize(node, "width", scale);
                size.height = this.findNodeRealSize(node, "height", scale);
            }

            return size;
        },
        getBoundingClientRect: function(target, scrollDOM){
            var root = document.documentElement;
            var ct = root.clientTop;  // 非IE为0，IE为2
            var cl = root.clientLeft; // 非IE为0，IE为2

            var rx = 0;
            var ry = 0;
            var sx = 0;
            var sy = 0;
            var rl = 0;
            var rt = 0;
            var rr = 0;
            var rb = 0;
            var rw = 0;
            var rh = 0;
            var nul = true;

            rx = root.scrollLeft;
            ry = root.scrollTop;

            if(scrollDOM && ("scrollLeft" in scrollDOM)){
                sx = scrollDOM.scrollLeft;
            }

            if(scrollDOM && ("scrollTop" in scrollDOM)){
                sy = scrollDOM.scrollTop;
            }

            if(target){
                var rect = target.getBoundingClientRect();

                rl = rect.left - cl;
                rt = rect.top - ct;
                rr = rect.right;
                rb = rect.bottom;
                rw = rect.width || rr - rl;
                rh = rect.height || rb - rt;
                nul = false;
            }else{
                console.info("GetBoundingClientRect::target not found");
            }

            return {
                "globalScrollX": rx,
                "globalScrollY": ry,
                "localScrollX": sx,
                "localScrollY": sy,
                "left": rl,
                "top": rt,
                "right": rr,
                "bottom": rb,
                "width": rw,
                "height": rh,
                "nul": nul
            };
        },
        /**
         * 获取网络类型
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
         * @see http://w3c.github.io/netinfo/
         * @return String type cellular(2g,3g,4g),wifi,ethernet,bluetooth,wimax,none,unknown,other
         */
        getNetworkType: function(){
            var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
            var type = connection.type || "";
            var downlinkMax = undefined === connection.downlinkMax ? 0 : connection.downlinkMax;
            var nt = type;

            if("cellular" == type){
                if(downlinkMax < 2){
                    nt = "2g";
                }else if(downlinkMax >= 2 && downlinkMax <= 42){
                    nt = "3g";
                }else if(downlinkMax == 100){
                    nt = "4g";
                }else{
                    nt = type;
                }
            }

            return nt;
        },
        getTime: function(){
            return Date.now ? Date.now() : (new Date().getTime());
        },
        /**
         * 生成唯一ID
         * @return String guid
         */
        GUID: function(){
            var timestamp = String(_util.getTime());
            var random = String(0xFFFFFFFFFFF * Math.random());
            var r0 = random.substring(0, random.indexOf("."));
            var r1 = random.substring(random.indexOf(".") + 1);

            if(r0.length > 13){
                r0 = r0.substr(0, 13);
            }else if(r0.length < 13){
                r0 = r0 + r1.substr(0, 13 - r0.length);
            }

            var id = timestamp + r0;
            var tmp = 0;
            var chr = "";
            var sn = ""
            for(var i = 0; i < 26; i += 2){
                tmp = Number(id.substr(i, 2));
                chr = tmp.toString(16);

                if(chr.length < 2){
                    chr = "0" + chr;
                }

                sn += chr;
            }

            return sn;
        },
        /**
         * 获取当前节点之后的可用大小
         * @param Node node
         * @param viewport 视窗
         * @return Object {Number width, Number height}
         */
        getRemainingSize: function(node, viewport){
            viewport = viewport || $(window);

            var width = viewport.outerWidth ? viewport.outerWidth() : viewport.width();
            var height = viewport.outerHeight ? viewport.outerHeight() : viewport.height();
            var nodeWidth = node.outerWidth ? node.outerWidth() : node.width();
            var nodeHeight = node.outerHeight ? node.outerHeight() : node.height();
            var nodeOffset = node.offset();
            var left = nodeOffset.left;
            var top = nodeOffset.top;

            return {
                "height": height - (top + nodeHeight),
                "width": width - left
            };
        },
        blobSlice: function(blob, start, end, type){
            if(blob.slice){
                return blob.slice(start, end, type);
            }else if(blob.mozSlice){
                return blob.mozSlice(start, end, type);
            }else if(blob.webkitSlice){
                return blob.webkitSlice(start, end, type);
            }

            return blob;
        },
        getImageInfoByURL: function(src, callback){
            var img = new Image();

            img.onload = function(e){
                _util.execAfterMergerHandler(callback, [img, img.naturalWidth, img.naturalHeight]);

                img = null;
            }

            img.onerror = function(e){
                _util.execAfterMergerHandler(callback, [null, 0, 0]);

                img = null;
            }

            img.src = src;
        },
        asDataURL: function(blob, handler, start, end, type){
            start = start || 0;
            end = end || blob.size;
            type = type || blob.type;

            var newblob = _util.blobSlice(blob, start, end, type); 
            var reader = new FileReader();

            reader.onload = function(e){
                _util.execAfterMergerHandler(handler, [e, e.target.result]);
            };

            reader.onerror = function(e){
                _util.execAfterMergerHandler(handler, [e, null]);
            };

            blob = null;

            reader.readAsDataURL(newblob);
        },
        asBinaryString: function(blob, handler, start, end, type){
            start = start || 0;
            end = end || blob.size;
            type = type || blob.type;

            var newblob = _util.blobSlice(blob, start, end, type); 
            var reader = new FileReader();
            
            reader.onload = function(e){
                _util.execAfterMergerHandler(handler, [e, e.target.result]);
            };

            reader.onerror = function(e){
                _util.execAfterMergerHandler(handler, [e, null]);
            };

            blob = null;

            reader.readAsBinaryString(newblob);      

        },
        asBlob: function(dataURL){
            var arr = dataURL.split(','), 
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), 
                n = bstr.length, 
                u8arr = new Uint8Array(n);

            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }

            return new Blob([u8arr], {type: mime});
        },
        register: function(key, value){
            window[key] = value;

            return _util;
        },
        unregister: function(key){
            if(key in window){
                delete window[key];
            }

            return _util;
        },
        getRegisterValue: function(key){
            if(key in window){
                return window[key];
            }

            return undefined;
        },
        getFileSize : function(size){
            var KB = Math.pow(2, 10);           
            var MB = Math.pow(2, 20);
            var GB = Math.pow(2, 30);
            var TB = Math.pow(2, 40);

            var str = size + "Bytes";

            if(size >= TB){
                str = (size / TB).toFixed(2) + "TB";
            }else if(size >= GB){
                str = (size / GB).toFixed(2) + "GB";
            }else if(size >= MB){
                str = (size / MB).toFixed(2) + "MB";
            }else if(size >= KB){
                str = (size / KB).toFixed(2) + "KB";
            }

            return str;
        },
        delay: function(milliseconds, handle, tid){
            if(tid){
                clearTimeout(tid);
            }

            var start = _util.getTime();
            var timeId = setTimeout(function(){
                var end = _util.getTime();
                var elapsedTime = end - start;

                _util.execAfterMergerHandler(handle, [elapsedTime]);
            }, milliseconds);

            return timeId;
        },
        getAnimationEvents: function(){
            var events = [
                "webkitAnimationStart", 
                "mozAnimationStart", 
                "MSAnimationStart", 
                "oanimationstart", 
                "animationstart",
                "webkitAnimationEnd", 
                "mozAnimationEnd", 
                "MSAnimationEnd", 
                "oanimationend", 
                "animationend",
                "webkitAnimationIteration", 
                "mozAnimationIteration", 
                "MSAnimationIteration", 
                "oanimationiteration", 
                "animationiteration"
            ];

            return events;
        },
        stopAnimationPropagation: function(selectors){
            // var t1 = _util.getTime();
            var events = _util.getAnimationEvents();

            var nodes = $(selectors || "html,body,article,section,div,ul,ol,dl,span,em,i,li,p,code,del,ins,strong,b,sup,sub");

            nodes.each(function(index, item){
                if(!item.hasAttribute("data-animation-bubbles")){
                    $(item).on(events.join(" "), function(e){
                        e.stopPropagation();
                    });

                    item.setAttribute("data-animation-bubbles", "1");
                }
            });
            // var t2 = _util.getTime();
            // var diff = t2 - t1;

            // console.info("stop animation cost: " + (diff) + "ms");
        },
        isMobileDevice: function(){
            var ua = navigator.userAgent;
            var _flag = /(iPhone|iPad|iPod|iOS|Android|Windows[\s ]*Phone|IEMobile|Mobile[\s ]*Safari|MQQBrowser|BlackBerry|JUC|Fennec|wOSBrowser|TouchPad|BrowserNG|WebOS)/gi.test(ua);
            
            return _flag;
        }
    };

    module.exports = _util;
});