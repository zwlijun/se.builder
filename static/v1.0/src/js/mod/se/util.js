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
    var _util = {
        /**
         * 格式化模板数据
         * @param String tpl 模板数据
         * @param Object metaData 元数据
         * @param String preifx 模板数据前缀标识，默认为$
         * @return String str 格式化后的字符串
         */
        formatData : function(tplData, metaData, prefix){
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
                        if(callback.tid){
                            clearTimeout(callback.tid);
                            callback.tid = undefined;
                        }

                        return (callback.tid = setTimeout(function(){
                            callback.apply(context, args);
                        }, delay));
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
            var pattern = /^([a-zA-Z0-9_]+):\/\/([a-zA-Z0-9_\/]+)(#(.*))?$/;
            var result = pattern.exec(uri||"");
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
                            "code": 0,
                            "msg": "ok"
                        };
                    }

                    return {
                        "result": undefined,
                        "code": -1,
                        "msg": "no such class or method"
                    };
                }
            }else{
                return {
                    "result": undefined,
                    "code": -2,
                    "msg": "not match"
                };
            }
        },
        /**
         * {"type": "touchstart", "mapping": "mousedown", "compatible": null}
         * {"type": "animationstart", "mapping": null, "compatible": ["webkitAnimationStart", "mozAnimationStart"]}
         */
        registAction: function(target, events, settings){
            var box = $(target || "body");
            var dom = box[0];
            var _events = [].concat(events);
            var size = _events.length;
            var evt = null;
            var type = null;
            var actualType = null;
            var compatible = null;
            var mapping = null;
            var flag = null;
            
            if(!dom){
                console.log("the target is not existed");
                return false;
            }

            if(settings){
                _util.source(settings);
            }

            for(var i = 0; i < size; i++){
                evt = _events[i];
                type = evt.type;
                mapping = evt.mapping;
                compatible = evt.compatible;

                flag = box.attr("data-action-" + type + "-flag");

                if("1" == flag){
                    continue;
                }

                box.attr("data-action-" + type + "-flag", "1");

                actualType = type;

                if(mapping){
                    var p = /^(swipe|swipeLeft|swipeRight|swipeUp|swipeDown|doubleTap|tap|singleTap|longTap)$/;

                    if(p.test(type)){
                        if(!("ontouchstart" in window)){
                            actualType = mapping;
                        }
                    }else{
                        if(!(("on" + type) in dom)){
                            actualType = mapping;
                        }
                    }
                }

                if(compatible){
                    compatible = [].concat(compatible);
                    actualType = ([actualType].concat(compatible)).join(" ");
                }

                box.on(actualType, '[data-action-' + type + ']', type, function(e){
                    var currentTarget = $(e.currentTarget);
                    var external = currentTarget.attr("data-action-" + e.data);
                    var beforeCheck = currentTarget.attr("data-" + e.data + "-beforecheck");
                    var before = currentTarget.attr("data-" + e.data + "-before");
                    var after = currentTarget.attr("data-" + e.data + "-after");

                    if(beforeCheck){
                        var ret = _util.requestExternal(beforeCheck, [currentTarget, e, e.data]);

                        if(0 === ret.code && true !== ret.result){
                            return ;
                        }
                    }

                    if(before){
                        _util.requestExternal(before, [currentTarget, e, e.data]);
                    }

                    _util.requestExternal(external, [currentTarget, e, e.data]);

                    if(after){
                        _util.requestExternal(after, [currentTarget, e, e.data]);
                    }
                });
            }

            return true;
        },
        fireAction: function(target, type, e){
            var node = $(target);
            var external = node.attr("data-action-" + type);

            _util.requestExternal(external, [node, (e || null), type]);
        },
        watchAction: function(target, events, settings){
            var regist = _util.registAction(target, events, settings);

            if(!regist){
                setTimeout(function(){
                   _util.watchAction(target, events, settings);
                }, 16);
            }
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
        random: function(min, max){
            var n = (Math.random() * (max - min)) + min;

            return {
                intValue: Math.floor(n),
                floatValue: n
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
        delay: function(milliseconds, handle){
            var _handler = handle || {};
            var callback = _handler.callback;

            if(callback && Object.prototype.toString.call(callback) == "[object Function]"){
                if(callback.tid){
                    clearTimeout(callback.tid);
                    callback.tid = undefined;
                }

                var start = _util.getTime();

                callback.tid = setTimeout(function(){
                    var end = _util.getTime();
                    var elapsedTime = end - start;

                    _util.execAfterMergerHandler(handle, [elapsedTime]);
                }, milliseconds);
            }
        }
    };

    module.exports = _util;
});