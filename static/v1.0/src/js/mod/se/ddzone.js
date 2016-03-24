/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Drap Drop Zone
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.12
 */
;define(function (require, exports, module){
    var Listener      = require("mod/se/listener");
    var Util          = require("mod/se/util");
    var HandleStack   = Listener.HandleStack;

    var touch = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var endEvent = touch ? "touchend" : "mouseup";
    var moveEvent = touch ? "touchmove" : "mousemove";

    var _DDZone = function(name){
        this.name = name;
        this.currentKey = null;
        this.caller = null;
        this.scale = {"x": 1, "y": 1};

        this.TemporaryMemory = {};

        //--------------------------------
        this.handleStack = new HandleStack();
        this.listener = new Listener({
            "ondrag": null,
            "ondragging": null,
            "ondrop": null,
            "onzonein": null,
            "onzoneout": null
        }, this.handleStack);
    };

    _DDZone.Cache = {};

    _DDZone.SS = {
        db: {},
        set: function(key, value){
            _DDZone.SS.db[key] = value;
        },
        get: function(key){
            if(key in _DDZone.SS.db){
                return _DDZone.SS.db[key];
            }

            return null;
        },
        remove: function(key){
            if(key in _DDZone.SS.db){
                delete _DDZone.SS.db[key];
            }
        },
        snapshot: function(){
            var args = arguments;
            var argSize = args.length;

            if(argSize === 1){
                if(typeof(args[0]) == "object"){
                    for(var n in args[0]){
                        if(args[0].hasOwnProperty(n)){
                            _DDZone.SS.set(n, args[0][n]);
                        }
                    }
                }else{
                    return _DDZone.SS.get(args[0]);
                }
            }else{
                _DDZone.SS.set(args[0], args[1]);
            }

            return undefined;
        }
    };

    _DDZone.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listener.clear();
        },
        getHandleStack : function(){
            return this.handleStack;
        },
        getPluginSelector: function(type, key){
            return '[data-plugin="ddz.' + type + '.' + key + '"]';
        },
        getPluginNode: function(type, key){
            var selector = this.getPluginSelector(type, key);
            var node =  $(selector);

            return {
                "node": node,
                "selector": selector
            };
        },
        snapshot: function(){
            return _DDZone.SS.snapshot.apply(_DDZone, arguments);
        },
        render: function(node, type, css){
            if("drag" == type){
                node.css($.extend({
                    "position": "absolute",
                    "cursor": "move",
                    "zIndex": 10000,
                    "left": 0,
                    "top": 0
                }, css));
            }
        },
        getCurrentPoint: function(e){
            if(e.changedTouches){
                e = e.changedTouches[e.changedTouches.length - 1];
            }

            var scale = this.scale;
            var x = e.pageX;
            var y = e.pageY;

            return {"x": x / scale.x, "y": y / scale.y};
        },
        formatSnapshotNode: function(e){
            var data = e.data || {};
            var snapshot = data.snapshot;

            snapshot[0].style.cssText = data.snapshotStyle;
            snapshot.removeAttr("data-ddz-snapshot-clone");

            return snapshot;
        },
        getSnapshotInfo: function(e){
            var data = e.data || {};
            var snapshot = data.snapshot;
            var cssText = data.snapshotStyle;

            return {
                "snapshot": snapshot,
                "cssText": cssText 
            };
        },
        dragStart: function(e){
            var data = e.data;
            var ddz = data.ddz;
            var doc = data.doc;

            var currentTarget = e.currentTarget;
            var node = $(currentTarget);
            var snapshot = node.attr("data-ddz-snapshot") || "_self";
            var snapshotStyle = "";

            var point = ddz.getCurrentPoint(e);

            if("_self" == snapshot){
                snapshot = node.clone(true);
            }else if("_parent" == snapshot){
                snapshot = node.parent().clone(true);
            }else if(snapshot.indexOf("_filter$") != -1){
                snapshot = node.parents(snapshot.replace("_filter$", ""));
            }else{
                snapshot = $(ddz.snapshot(snapshot)) || node.clone(true);
            }

            snapshotStyle = snapshot[0].style.cssText;
            snapshot.appendTo("body");
            snapshot.attr("data-ddz-snapshot-clone", "1");

            ddz.render(snapshot, "drag", {
                "left": point.x + "px",
                "top": (point.y + 18) + "px"
            });

            ddz.writeTemporaryMemory("ddz.pointer", {
                "x": point.x,
                "y": point.y
            });

            data.snapshot = snapshot;
            data.snapshotStyle = snapshotStyle;
            data.dragNode = node;

            doc.on(endEvent, data, ddz.dragEnd);
            doc.on(moveEvent, data, ddz.dragMove);

            ddz.exec("drag", [e, node]);
        },
        dragEnd: function(e){
            var data = e.data;
            var ddz = data.ddz;
            var doc = data.doc;
            var target = e.target;
            var dragNode = data.dragNode;

            $('[data-ddz-snapshot-clone]').remove();

            doc.off(endEvent, ddz.dragEnd);
            doc.off(moveEvent, ddz.dragMove);

            ddz.exec("drop", [e, dragNode, target, ddz.inZone(target)]);
        },
        dragMove: function(e){
            var data = e.data;
            var ddz = data.ddz;
            var doc = data.doc;
            var snapshot = data.snapshot;
            var target = e.target;
            var dragNode = data.dragNode;

            var point = ddz.getCurrentPoint(e); 
            var zone = ddz.inZone(target);

            ddz.render(snapshot, "drag", {
                "left": point.x + "px",
                "top": (point.y + 18) + "px"
            });

            ddz.writeTemporaryMemory("ddz.pointer", {
                "x": point.x,
                "y": point.y
            });

            ddz.exec("dragging", [e, dragNode, target, zone]);
        },
        inZone: function(target){
            var dropPlugin = this.getPluginNode("drop", this.currentKey);
            
            if(target == dropPlugin.node[0]){
                return true;
            }else{
                var selector = dropPlugin.selector;
                var node = $(target);
                var p = node.parents(selector);

                return p.length > 0;
            }
        },
        watch: function(key, viewport, doc){
            this.currentKey = key;
            this.caller = "default";

            var drapPlugin = this.getPluginNode("drag", key);

            var dragNode = drapPlugin.node;
            var data = {
                "ddz": this,
                "doc": $(doc || document)
            };

            $(viewport).on(startEvent, drapPlugin.selector, data, this.dragStart);
        },
        setRuntimeInfo: function(key, caller){
            this.currentKey = key;
            this.caller = caller;
        },
        getRuntimeInfo: function(){
            return {
                key: this.currentKey,
                caller: this.caller
            }
        },
        writeTemporaryMemory: function(key, value){
            this.TemporaryMemory[key] = value;
        },
        readTemporayMemory: function(key){
            if(key in this.TemporaryMemory){
                return this.TemporaryMemory[key];
            }

            return null;
        },
        clearTemporayMemory: function(key){
            if(undefined === key){
                this.TemporaryMemory = {};
            }else{
                if(key in this.TemporaryMemory){
                    delete this.TemporaryMemory[key];
                }
            }
        }
    };

    module.exports = {
        "version": "R15B1214",
        createDDZone: function(name){
            var ddz = _DDZone.Cache[name] || (_DDZone.Cache[name] = new _DDZone(name));

            return {
                "exec" : function(type, args){
                    ddz.exec(type, args);

                    return this;
                },
                "set" : function(type, option){
                    ddz.set(type, option);

                    return this;
                },
                "remove" : function(type){
                    ddz.remove(type);

                    return this;
                },
                "get" : function(type){
                    return ddz.get(type);
                },
                "clear" : function(){
                    ddz.clear();

                    return this;
                },
                "getHandleStack" : function(){
                    return ddz.getHandleStack();
                },
                "snapshot": function(){
                    return ddz.snapshot.apply(ddz, arguments);
                },
                "formatSnapshotNode": function(e){
                    return ddz.formatSnapshotNode(e);
                },
                "getSnapshotInfo": function(e){
                    return ddz.getSnapshotInfo(e);
                },
                "setRuntimeInfo": function(key, caller){
                    ddz.setRuntimeInfo(key, caller);

                    return this;
                },
                "getRuntimeInfo": function(){
                    return ddz.getRuntimeInfo();
                },
                "writeTemporaryMemory": function(key, value){
                    ddz.writeTemporaryMemory(key, value);

                    return this;
                },
                "readTemporayMemory": function(key){
                    return ddz.readTemporayMemory(key);
                },
                "clearTemporayMemory": function(key){
                    ddz.clearTemporayMemory(key);

                    return this;
                },
                "watch": function(key, viewport, doc){
                    ddz.watch(key, viewport, doc);

                    return this;
                }
            }
        }
    };
});