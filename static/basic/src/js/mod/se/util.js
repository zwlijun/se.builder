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
    var ActionEvent = function(wrapper, actualType, originType){
        this.wrapper = wrapper;
        this.actualType = this._aot(actualType);
        this.originType = originType;
    };
    ActionEvent.prototype = {
        _aot: function(attr){
            if(attr.indexOf("-") === -1){
                return attr;
            }

            var keys = attr.split("-");
            var size = keys.length;
            var tmp = [];
            for(var i = 0; i < size; i++){
                if(0 === i){
                    tmp.push(keys[i]);
                }else{
                    tmp.push(keys[i].charAt(0).toUpperCase() + keys[i].substring(1));
                }
            }

            return tmp.join("");
        },
        listen: function(){
            var _this = this;
            var box = _this.wrapper;
            var actualType = _this.actualType;
            var originType = _this.originType;

            box.on(actualType, '[data-action-' + originType + ']', null, function(e){
                var currentTarget = $(e.currentTarget);
                var external = currentTarget.attr("data-action-" + originType);
                var beforeCheck = currentTarget.attr("data-" + originType + "-beforecheck");
                var before = currentTarget.attr("data-" + originType + "-before");
                var after = currentTarget.attr("data-" + originType + "-after");

                console.log("ActionEvent#external: " + external + "; beforecheck: " + beforeCheck + "; before: " + before + "; after: " + after);
                console.log("ActionEvent#fireType: " + e.type + "; originType: " + originType);

                if(beforeCheck){
                    console.log("ActionEvent#beforecheck > call before");
                    var ret = _util.requestExternal(beforeCheck, [currentTarget, e, originType]);

                    console.log("ActionEvent#beforecheck > call after, result = " + ret);
                    if(0 === ret.code && true !== ret.result){
                        return ;
                    }
                }

                if(before){
                    console.log("ActionEvent#before > call before");
                    _util.requestExternal(before, [currentTarget, e, originType]);
                    console.log("ActionEvent#before > call after");
                }

                console.log("ActionEvent#requestExternal > call before");
                _util.requestExternal(external, [currentTarget, e, originType]);
                console.log("ActionEvent#requestExternal > call after");

                if(after){
                    console.log("ActionEvent#after > call before");
                    _util.requestExternal(after, [currentTarget, e, originType]);
                    console.log("ActionEvent#after > call after");
                }
            });
        }
    };
    var _util = {
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
         * 格式化代码
         * @param String code 需要格式化的代码
         * @param String formatter 格式，如：4, 4-4-2, 3-3-8-4, 3-4-4
         *                         如果代码超过格式设置的值，那么后面的格式形式以最后一个格式方式为准
         *                         默认值为：4
         * @param String chr 格式间隔字符，默认为值为：英文空格字符
         * @return String code
         */
        formatCode: function(code, formatter, chr){
            var scode = (code || "") + "";
            var sformatter = formatter || "4";
            var schr = chr || " ";
            var len = scode.length;

            var __a = sformatter.split("-");
            var formatterArray = [];
            var formatterIndex = 0;
            var formatterValue = 0;
            var formatterLatestIndex = __a.length - 1;
            var tmp = null;
            var codeItems = [];

            for(var i = 0; i < __a.length; i++){
                formatterArray.push(Number(__a[i]));
            }

            do{
                formatterValue = formatterArray[formatterIndex];
                tmp = scode.substr(0, formatterValue);
                scode = scode.substring(formatterValue);
                len = scode.length;

                codeItems.push(tmp);

                ++formatterIndex;

                if(formatterIndex > formatterLatestIndex){
                    formatterIndex = formatterLatestIndex;
                }
            }while(!!len);

            return codeItems.join(schr);
        },
        /**
         * 执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         * @param * __args 附加参数，些参数将会置于 handler.args 之前
         */
        execHandler : function(handler, __args){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = [].concat(handler.args || []);
                var context = handler.context || null;
                var delay = handler.delay || -1;

                if(__args){
                    __args = [].concat(__args);

                    args = __args.concat(args);
                }

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
        source: function(data){
            var schema = data.schema;

            console.log("Util.source#schema = " + schema);

            if(schema){
                if(!(schema in $)){
                    $[schema] = data;
                    console.log("Util.source#not existed > object($[" + schema + "]) = " + $[schema]);
                }else{
                    $[schema] = $.extend(true, {}, $[schema], data);
                    console.log("Util.source#existed > object($[" + schema + "]) = " + $[schema]);
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
            var _args = [].concat(args || []);

            var context = {
                "uri": uri,
                "args": _args
            };

            console.log("Util.requestExternal#call > uri = " + uri + "; matcher = " + result);

            if(result){
                _className = result[1];
                _namespace = result[2];            
                _data = result[4] || null;
                _class = $[_className] || null;

                 console.log("Util.requestExternal#call > class = " + _className + "; namespace = " + _namespace + "; data = " + _data);

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

                    console.log("Util.requestExternal#call > method = " + _method);

                    if(null != _class && (_method in _class)){
                        console.log("Util.requestExternal#call success");

                        return {
                            "result": _class[_method].apply(context, [_data].concat(_args)),
                            "code": 0,
                            "msg": "ok"
                        };
                    }

                    console.log("Util.requestExternal#call error, message = no such class or method");
                    console.log("Util.requestExternal#call error, class is null? " + (null == _class));
                    console.log("Util.requestExternal#call error, method? " + (null != _class && (_method in _class)));

                    return {
                        "result": undefined,
                        "code": -1,
                        "msg": "no such class or method"
                    };
                }
            }else{
                console.log("Util.requestExternal#call error, message = not match");
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
            var originType = null;
            var actualType = null;
            var compatible = null;
            var mapping = null;
            var flag = null;
            var actionEvent = null;
            
            if(!dom){
                console.log("the target is not existed");
                return false;
            }
            
            if(settings){
                _util.source(settings);
            }

            for(var i = 0; i < size; i++){
                evt = _events[i];
                originType = evt.type;
                mapping = evt.mapping;
                compatible = evt.compatible;

                flag = box.attr("data-action-" + originType + "-flag");

                if("1" == flag){
                    continue;
                }

                box.attr("data-action-" + originType + "-flag", "1");

                actualType = originType;

                if(mapping){
                    var p = /^((swipe(\-(left|right|up|down))?)|(((double|single|long)\-)?tap))$/;

                    if(p.test(originType)){
                        if(!("ontouchstart" in window)){
                            actualType = mapping;
                        }
                    }else{
                        if(!(("on" + originType) in dom)){
                            actualType = mapping;
                        }
                    }
                }

                if(compatible){
                    compatible = [].concat(compatible);
                    actualType = ([actualType].concat(compatible)).join(" ");
                }

                console.log("originType: " + originType + "; actualType: " + actualType);

                var actionEvent = new ActionEvent(box, actualType, originType);                
                actionEvent.listen();
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
        GUID32: function(){
            var seed = "0123456789abcdefghijklm9876543210nopqrstuvwxyz0123456789";
            var tmp = [];
            var size = seed.length;
            var n = 0;

            while(tmp.length < 32){
                n = _util.random(0, size).intValue;
                tmp.push(seed.charAt(n));
            }

            var str = tmp.join("");

            return str;
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
                _util.execHandler(callback, [img, img.naturalWidth || img.width, img.naturalHeight || img.height]);

                img = null;
            }

            img.onerror = function(e){
                _util.execHandler(callback, [null, 0, 0]);

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
                _util.execHandler(handler, [e, e.target.result]);
            };

            reader.onerror = function(e){
                _util.execHandler(handler, [e, null]);
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
                _util.execHandler(handler, [e, e.target.result]);
            };

            reader.onerror = function(e){
                _util.execHandler(handler, [e, null]);
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

                    _util.execHandler(handle, [elapsedTime]);
                }, milliseconds);
            }
        },
        removeURLHash: function(url){
            var _url = (url || document.URL).replace(/#([\w\W]*)$/, "");
            
            return _url;
        },
        parsePluginOptions: function(plugin, key, dataStruct, defaultOptions){
            //dataStruct::[]
            //{property: String, dataType: [number|string|boolean|array]}
            
            plugin = $(plugin);

            var opts = {};
            var pluginKey = plugin.attr("data-plugin");
            var pluginName = pluginKey.indexOf(".") == -1 ? "non-name" : pluginKey.substring(key.length + 1);
            var size = dataStruct.length;
            var data = null;
            var attr = null;
            var property = null;
            var value = null;

            var convert = function(value, type){
                var v = "";

                switch(type){
                    case "number":
                        v = Number(value);

                        if(isNaN(v)){
                            v = NaN;
                        }
                    break;
                    case "boolean":
                        v = false;

                        if("1" == value || "true" == value){
                            v = true;
                        }
                    break;
                    case "array":
                        v = value.split(",");
                    break;
                    default:
                        v = value;
                    break;
                }

                return v;
            };

            for(var i = 0; i < size; i++){
                data = dataStruct[i];
                property = data.property;
                attr = plugin.attr("data-" + key + "-" + property);

                if(!attr){
                    continue;
                }

                value = convert(attr, data.dataType);

                if(NaN === value){
                    continue;
                }

                if(property.indexOf("-") == -1){
                    opts[property] = value;
                }else{
                    var keys = property.split("-");
                    var _key = null;
                    var _tmp = opts;

                    for(var j = 0; j < keys.length - 1; j++){
                        _key = keys[j];

                        if(!(_key in _tmp)){
                            _tmp[_key] = {};
                        }
                        _tmp = _tmp[_key];
                    }

                    _tmp[keys[keys.length - 1]] = convert(attr, data.dataType);
                }
            }

            var o = $.extend(true, defaultOptions || {}, opts);

            o["name"] = pluginName;

            return o;
        },
        createObject: function(originObject, properties, value){
            //填充数据
            var __fixed = function(originObject, namespace, property, value){
                var funcBody = "if(!(\"" + property + "\" in originObject." + namespace + ")){" + 
                    "    originObject." + namespace + " = {}" + 
                    "}" + 
                    "originObject." + namespace + "." + property + " = value;" + 
                    "return originObject;";

                var originObject = new Function(
                    "originObject",
                    "value",
                    funcBody
                )(originObject, value);

                return originObject;
            };
            //创建对象
            var __createObject = function(originObject, properties, keys, value){
                var items = [].concat(properties);
                var property = items.shift();

                if(items.length === 0){
                    if(keys.length === 0){
                        originObject[property] = value;
                    }else{
                        originObject = __fixed(originObject, keys.join("."), property, value);
                    }

                    return originObject;
                }else{
                    if(keys.length === 0){
                        originObject[property] = {}
                    }else{
                        originObject = __fixed(originObject, keys.join("."), property, {});
                    }
                }

                keys.push(property);

                return __createObject(originObject, items, keys, value);                
            };
            
            return __createObject(originObject, properties, [], value)
        }
    };

    module.exports = _util;
});