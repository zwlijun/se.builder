/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Animate.css 动画
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2015.8
 */
;define(function (require, exports, module){
                        require("mod/polyfill/array");
    var Util          = require("mod/se/util");
    var Listener      = require("mod/se/listener");
    var Style         = require("mod/se/css");
    var HandleStack   = Listener.HandleStack;

    var _KeyFrame = function(name){
        this.name = name;
        this.frames = [];
    };
    
    _KeyFrame.prototype = {
        push : function(frame, properties){
            if(this.frames.indexOf(frame) == -1){
                var list = [];
                var p = "";
                var v = "";
                var transform = [];
                for(var key in properties){
                    if(properties.hasOwnProperty(key)){
                        v = properties[key];

                        if(Style.isTransformMethod(key)){
                            transform.push(key + "(" + v + ")");
                        }else{
                            p = Style.getRealPropertyName(key);
                            
                            list.push(p + ": " + v);
                        }
                    }
                }

                if(transform.length > 0){
                    list.push(Style.getRealPropertyName("transform") + ": " + transform.join(" "));
                }

                this.frames.push(frame + " {" + list.join("; ") + "}");
            }
        },
        print : function(){
            if(this.existed()){
                return 0;
            }

            var frames = this.frames.join("\n");

            var key = "keyframes";
            var name = this.name;
            var hack = Style.getVendorHackKey("transform") + key;
            var str = " " + name + " {\n" + frames + "\n}";
            var keyframes = [];
            var styleNode = $("#" + name);

            if(hack != key){
                keyframes.push("@" + hack + str);
            }
            keyframes.push("@" + key + str);

            $("head").append('<style type="text/css" id="' + name + '">\n'+ keyframes.join("\n") +'\n</style>');
        },
        existed: function(){
            var styleNode = $("#" + this.name);

            return (styleNode.length > 0);
        },
        destroy: function(){
            var styleNode = $("#" + this.name);

            styleNode.remove();
        }
    };

    _KeyFrame.CachePool = {};

    _KeyFrame.getInstance = function(name){
        var kf = _KeyFrame.CachePool[name] || (_KeyFrame.CachePool[name] = new _KeyFrame(name));

        return kf;
    }

    var _Sequence = function(list){
        this.list = list || [];
        this.size = this.list.length;
        this.index = 0;
    };

    _Sequence.prototype = {
        isEmpty: function(){
            return this.size === 0;
        },
        find: function(index){
            if(index >= 0 && index < this.size){
                return this.list[index];
            }

            return null;
        },
        pop: function(){
            var item = null;

            if(this.isEmpty()){
                return item;
            }

            item = this.find(this.index);

            this.index++;

            return item;
        },
        reset: function(){
            this.index = 0;
        }
    };

    var TriggerTypes = {
        "DEFAULT": "default",
        "FIXED": "fixed",
        "FIXED_VISIBLE": "fixed.visible",
        "FIXED_HIDDEN": "fixed.hidden",
        "FIXED_CLICK": "fixed.click"
    };


    // 绑定在容器节点上
    // [data-animate]              动画配置
    // [data-animate-listen]       是否已经监控动画事件

    // 绑定在 [data-animate-key] 节点上   
    // [data-animate-key]          动画绑定的对象KEY
    // [data-animate-identity]     动画序列标识
    // [data-animate-state]        动画执行状态  running: 运行   paused: 暂停

    // 绑定在 动画 元素上
    // [data-animate-trigger]      动画触发类型  default: 默认   fixed: 固定的，指定的
    // [data-animate-runkey]       动画运行时的KEY
    var _Animate = function(){
        this.box = null;

        this.playNode = null;

        this.cacheData = {};
        this.cacheList = [];
        this.cacheTargetMapList = {};
        this.cacheTargetEnterMapList = {};
        this.cacheTargetExitMapList = {};

        this.sequence = null;
        this.sequenceSwitch = 0;

        this.beginTime = 0;
        this.completeTime = 0;
        this.elapsedTime = 0;

        this.forced = false;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onresume: null,      // [node]
            onpause: null,       // [node]
            onstartbefore: null, // [node, dom, className, cssText]
            onstart: null,       // [e, type, target, animationName, elapsedTime]
            onend: null,         // [e, type, target, animationName, elapsedTime]
            oniteration: null,   // [e, type, target, animationName, elapsedTime]
            onclean: null,       // [node, dom, className, cssText]
            onbegin: null,       // [elapsedTime]
            oncomplete: null     // [elapsedTime]
        }, this.handleStack);
    };

    _Animate.prototype = {
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
        listen: function(selector){
            var target = $(selector || "body");
            var plugins = target.find('[data-plugin-animate="1"]');
            var size = plugins.length;
            var plugin = null;
            var flag = null;

            for(var i = 0; i < size; i++){
                plugin = $(plugins.get(i));
                flag = plugin.attr("data-animate-listen");

                if("1" == flag){
                    continue ;
                }

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

                plugin.on(events.join(" "), "", this, function(e){
                    e.stopPropagation();
                    e.preventDefault();

                    //[e, target, animationName, elapsedTime]
                    var data = e.data;
                    var type = e.type;

                    type = type.toLowerCase();
                    type = type.replace(/^(webkit|moz|ms|o)/, "");

                    // console.info(type)
                    // console.info("animate.listen.type: " + type);

                    if(type in data){
                        data[type].apply(data, [e, type]);
                    }
                });

                plugin.attr("data-animate-listen", "1");
            }

            return this;
        },
        animationstart: function(e, type){
            var target = e.currentTarget;
            var animationName = e.animationName;
            var elapsedTime = e.elapsedTime;
            // console.info(target)

            // ++this.sequenceSwitch;

            // console.error("start::animation: " + animationName);

            this.exec("start", [e, type, target, animationName, elapsedTime]);
        },
        animationend: function(e, type){
            var target = e.currentTarget;
            var animationName = e.animationName;
            var elapsedTime = e.elapsedTime;

            var identity = $(target).attr("data-animate-identity");
            var node = null;
            var triggerNode = null;
            var triggerType = TriggerTypes.DEFAULT;
            var next = null;

            // console.error("end::animation: " + animationName);

            if(identity){
                node = this.getCacheData(identity);

                if(node){
                    if(node.target){
                        triggerNode = node.target;
                        triggerType = triggerNode.attr("data-animate-trigger") || TriggerTypes.DEFAULT;
                    }

                    next = this.findNext(triggerType, node.key, identity);
                }
            }

            this.sequenceSwitch = Math.max(--this.sequenceSwitch, 0);

            this.exec("end", [e, type, target, animationName, elapsedTime]);

            // console.info("identity: " + identity);
            // console.info("next: " + next.length);
            // console.info(next)

            if(next && next.length > 0){
                this.sequenceSwitch += next.length;
                console.info("next::sequence: " + this.sequenceSwitch);
                for(var i = 0, size = next.length; i < size; i++){
                    this.play(triggerType, next[i], this.forced).findSameAndPlay(triggerType, next[i], this.forced);
                }
            }else{
                var sequence = this.sequence;
                var sequenceSwitch = this.sequenceSwitch;
                var conf = null;
                var sameSize = 0;

                console.info("new::sequence: " + sequenceSwitch);
                // console.info(sequence)
                if(sequence && sequenceSwitch <= 0){
                    conf = sequence.pop();

                    if(conf){
                        this.sequenceSwitch = 1;
                        this.play(triggerType, conf, this.forced).findSameAndPlay(triggerType, conf, this.forced);
                    }else{
                        this.completeTime = Util.getTime();
                        this.exec("complete", [this.completeTime, this.completeTime - this.beginTime]);
                    }
                }
            }
        },
        animationiteration: function(e, type){
            var target = e.currentTarget;
            var animationName = e.animationName;
            var elapsedTime = e.elapsedTime;

            var $node = $(target);
            var iteration = Number($node.attr("data-animate-iteration") || 1);

            var identity = $node.attr("data-animate-identity");
            var node = null;
            var triggerNode = null;
            var triggerType = TriggerTypes.DEFAULT;
            var next = null;

            if(identity){
                node = this.getCacheData(identity);
            }

            $node.attr("data-animate-iteration", iteration + 1);

            if(node && node.animate.iterationCount === "infinite" && iteration === 1){
                // $node.trigger("animationend");
                this.animationend(e, "animationend");
                // console.info(iteration + "次后触发AnimationEnd事件...");
                // console.info(node);
            }

            this.exec("iteration", [e, type, target, animationName, elapsedTime]);
        },
        createAnimationFrames: function(node){
            var identity = node.identity;
            var animate = node.animate;
            var name = animate.name;
            var keyframeName = name + identity;
            var keyFrame = _KeyFrame.getInstance(keyframeName);
            var from = animate.configure[name];
            var to = animate[name];
            var properties = {};

            if(keyFrame.existed()){
                keyFrame.destroy();
            }

            properties[name] = from;
            keyFrame.push("0.001%", "combo" == name ? from : properties);

            properties = {};
            properties[name] = to;
            keyFrame.push("100%", "combo" == name ? to : properties);

            keyFrame.print();
        },
        play: function(triggerType, node, force){
            var targetKey = node.key;
            var target = node.target;

            // console.info(node)

            if(target.length == 0){
                return this;
            }

            var animate = node.animate;
            var name = animate.name;
            var type = node.type;
            var playNode = node.playNode;
            var applyNode = null;
            var dom = null;
            var className = null;
            var cssText = null;
            var state = this.playState(targetKey);

            state = "paused" == state ? state : "running";

            if(true === force){
                state = "running";
            }

            // console.info("play: " + state);
            // console.info("play: " + name);

            console.info("play: " + node.identity + "(" + node.key + ")" + "/" + name + "/" + type);

            target.attr("data-animate-identity", node.identity)
                  .attr("data-animate-trigger", triggerType);

            if(null == playNode || !playNode[type]){
                className = node.className;
                cssText = node.cssText;
                applyNode = target;
                dom = applyNode[0];
            }else{
                className = playNode[type].className;
                cssText = playNode[type].cssText;
                applyNode = playNode[type].node;
                dom = applyNode[0];
            }

            //console.info("before: " + className);
            // console.error("play::className: " + className)

            dom.className = className;
            dom.style.cssText = "";


            // dom.className = className;
            // dom.style.cssText = cssText;

            //console.info("after: " + dom.className)

            // Style.map(applyNode, {
            //     "animationDuration": animate.duration,
            //     "animationDelay": animate.delay,
            //     "animationIterationCount": animate.iterationCount,
            //     "animationPlayState": state
            // });

            var _styles = [
                '-webkit-animation-duration: ' + animate.duration,
                'animation-duration: ' + animate.duration,
                '-webkit-animation-iteration-count: ' + animate.iterationCount,
                'animation-iteration-count: ' + animate.iterationCount,
                '-webkit-animation-play-state: ' + state,
                'animation-play-state: ' + state
            ];

            if("rotate" == name || "scale" == name || "translate" == name || "opacity" == name || "combo" == name){
                //Style.css(applyNode, "animationName", name + node.identity);
                if("rotate" == name){
                    _styles.push('-webkit-animation-timing-function: linear; ');
                    _styles.push('animation-timing-function: linear; ');
                }

                _styles.push('-webkit-animation-name: ' + name + node.identity + '; ');
                _styles.push('animation-name: ' + name + node.identity + '; ');
            }

            // applyNode.attr("style", cssText + "; " + _styles.join(""))
            //          .attr("data-animate-identity", node.identity)
            //          .attr("data-animate-runkey", Util.GUID());

            dom.setAttribute("data-animate-identity", node.identity);
            dom.setAttribute("data-animate-runkey", Util.GUID());
            dom.removeAttribute("data-animate-iteration");
            dom.style.cssText = cssText + "; " + _styles.join("; ");

            if(parseFloat(animate.delay, 10) > 0){
                dom.style.webkitAnimationDelay = animate.delay;
                dom.style.animationDelay = animate.delay;
            }

            this.exec("startbefore", [node, dom, className, cssText]);

            // console.info("animate: " + name)

            // console.info("applyNode class: " + applyNode[0].className);

            if("paused" == state){
                 $(dom).trigger("animationend");
            }else{
                dom.className = className + " animated " + name;

                //解决动画时长或执行次数设置为0时的兼容问题
                if(parseFloat(animate.duration, 10) === 0 || parseFloat(animate.iterationCount, 10) === 0){
                    $(dom).trigger("animationend");
                }
            }

            // console.error($(dom).hasClass(name));
            // console.error("play::aniamtion: " + name);

            return this;
        },
        getAnimateNode: function(target){
            var identity = target.attr("data-animate-identity") || "";
            var node = this.getCacheData(identity) || null;

            return node;
        },
        fire: function(target, state){
            if(node){
                this.playState(node.key, state);
                
                var type = node.type;
                var playNode = node.playNode;

                target.attr("data-animate-identity", node.identity);

                if(null == playNode || !playNode[type]){
                    playNode = target;
                }else{
                    playNode = playNode[type].node;
                }

                $(playNode).attr("data-animate-runkey", Util.GUID())

                Style.map(playNode, {
                    "animationPlayState": state
                });
            }
        },
        resume: function(target){
            var node = this.getAnimateNode(target);

            this.exec("resume", [node]);
            this.fire(node, "running");
        },
        pause: function(target){
            var node = this.getAnimateNode(target);

            this.exec("pause", [node]);
            this.fire(node, "paused");
        },
        clean: function(animateNode){
            if(animateNode){
                this.rollback(animateNode);
                return ;
            }

            this.box.find('[data-plugin-animate="1"]').each((function(_this){
                return function(index, item){
                    _this.rollback(item);
                }
            })(this));

            return this;
        },
        findSameAndPlay: function(triggerType, node, force){
            var sameList = node.same;
            var size = sameList.length;
            var sameNode = null;

            if(size == 0){
                return size;
            }

            this.sequenceSwitch += size;

            console.info("findSameAndPlay::sequence: " + size);

            for(var i = 0; i < size; i++){
                sameNode = sameList[i];

                if(node.key == sameNode.key){
                    --this.sequenceSwitch;

                    console.info("Animation overwritten(" + node.key + "): " + sameNode.identity + "(" + sameNode.type + ")" + " >>> " + node.identity + "(" + node.type + ")");
                }

                console.info("find same: " + sameNode.identity + "(" + sameNode.key + ")" + "/" + sameNode.animate.name + "/" + sameNode.type);
                this.play(triggerType, sameNode, force).findSameAndPlay(triggerType, sameNode, force);
            }

            return size;
        },
        next: function(list, identity){
            var size = list.length;
            var item = null;

            var nextItems = [];
            var sameItems = [];
            var ret = [];

            for(var i = 0; i < size; i++){
                item = list[i];

                nextItems = item.next;
                sameItems = item.same;

                // console.info(item.identity == identity)

                // console.info(nextItems)

                // console.info("identity: " + identity);

                if(item.identity == identity){
                    console.info("list identity: " + item.identity+ "(" + item.key + ")" + "/" + item.animate.name + "/" + item.type);

                    return nextItems;
                }else{
                    for(var j = 0; j < sameItems.length; j++){
                        if(sameItems[j].identity == identity){
                            console.info("same identity: " + sameItems[j].identity+ "(" + sameItems[j].key + ")" + "/" + sameItems[j].animate.name + "/" + sameItems[j].type);

                            return sameItems[j].next;
                        }else{
                            ret = this.next(sameItems[j].next.concat(sameItems[j].same), identity);

                            if(ret.length > 0){
                                return ret;
                            }
                        }
                    }

                    ret = this.next(nextItems, identity);

                    if(ret.length > 0){
                        return ret;
                    }
                }
            }

            return ret;
        },
        findNext: function(triggerType, key, identity){
            var group = this.group(this.getCacheList(triggerType, key));

            return this.next(group, identity);
        },
        group: function(list){
            var item = null;
            var prevType = undefined;
            var newList = [];

            var findNext = function(item, list){
                var tmp = [];
                var next = null;

                tmp.push(item);

                do{
                    next = list.shift();

                    if(!next){
                        continue;
                    }

                    prevType = next.prevType;

                    if(next.execType == "0"){
                        list.unshift(next);
                        return {
                            items: tmp,
                            list: list,
                            prevType: undefined
                        };
                    }else if(next.execType == "2"){
                        var same = findSame(next, list);

                        tmp[tmp.length - 1].same = same.items;
                        list = same.list;

                        return {
                            items: tmp,
                            list: list,
                            prevType: same.prevType
                        }
                    }else{
                        //tmp.push(next);
                        var oo = findNext(next, list);

                        tmp[tmp.length - 1].next = oo.items;

                        list = oo.list;
                        prevType = oo.prevType;
                    }
                }while(list.length);

                return {
                    items: tmp,
                    list: list,
                    prevType: prevType
                }
            };

            var findSame = function(item, list){
                var tmp = [];
                var next = null;

                tmp.push(item);

                do{
                    next = list.shift();

                    if(!next){
                        continue;
                    }

                    prevType = next.prevType;

                    if(next.execType == "0"){
                        list.unshift(next);
                        return {
                            items: tmp,
                            list: list,
                            prevType: undefined
                        };
                    }else if(next.execType == "1"){
                        var next = findNext(next, list);

                        tmp[tmp.length - 1].next = next.items;
                        list = next.list;

                        return {
                            items: tmp,
                            list: list,
                            prevType: next.prevType
                        }
                    }else{
                        //tmp.push(next);
                        var oo = findSame(next, list);

                        tmp[tmp.length - 1].same = oo.items;

                        list = oo.list;
                        prevType = oo.prevType;
                    }
                }while(list.length);

                return {
                    items: tmp,
                    list: list,
                    prevType: prevType
                }
            };

            if(!list || list.length == 0){
                return [];
            }

            do{
                item = list.shift();

                if(undefined === prevType){
                    newList.push(item);
                    prevType = item.execType;
                }else{
                    if("1" == item.execType){
                        var next = findNext(item, list);

                        newList[newList.length - 1].next = next.items;

                        list = next.list;
                        prevType = next.prevType;

                    }else if("2" == item.execType){
                        var next = findSame(item, list);

                        newList[newList.length - 1].same = next.items;

                        list = next.list;
                        prevType = next.prevType;

                    }else if("0" == item.execType){
                        newList.push(item);
                        prevType = item.execType;
                    }
                }

            }while(list.length);

            // console.info(newList);

            return newList;
        },
        getCacheData: function(identity){
            if(identity){
                if(identity in this.cacheData){
                    return $.extend({}, this.cacheData[identity]);
                }

                return null;
            }else{
                return $.extend({}, this.cacheData);
            }
        },
        getCacheList: function(type, key){
            var list = [];

            switch(type){
                case TriggerTypes.DEFAULT:
                    list = [].concat(this.cacheList || []);
                break;
                case TriggerTypes.FIXED:
                case TriggerTypes.FIXED_CLICK:
                    list = [].concat(this.cacheTargetMapList[key] || []);
                break;
                case TriggerTypes.FIXED_VISIBLE:
                    list = [].concat(this.cacheTargetEnterMapList[key] || []);
                break;
                case TriggerTypes.FIXED_HIDDEN:
                    list = [].concat(this.cacheTargetExitMapList[key] || []);
                break;
            };

            return [].concat(list);
        },
        apply: function(triggerType, key, force){
            // var list = this.group(this.getCacheList(triggerType, key));
            // var size = list.length;
            // var conf = null;
            // console.info(this.group(this.getCacheList(triggerType, key)))
            this.sequence = new _Sequence(this.group(this.getCacheList(triggerType, key)));

            // console.info(this.sequence)

            var conf = this.sequence.pop();

            // for(var i = 0; i < size; i++){
            //     conf = list[i];

            //     this.play(triggerType, conf, force).findSameAndPlay(triggerType, conf, force);
            // }

            if(conf){
                this.sequenceSwitch = 1;

                this.play(triggerType, conf, force)
                    .findSameAndPlay(triggerType, conf, force);
            }

            return this;
        },
        backup: function(dom){
            if(dom.hasAttribute("data-source-class")){
                dom.className = dom.getAttribute("data-source-class");
            }else{
                dom.setAttribute("data-source-class", dom.className);
            }

            if(dom.hasAttribute("data-source-css")){
                dom.style.cssText = dom.getAttribute("data-source-css");
            }else{
                dom.setAttribute("data-source-css", dom.style.cssText);
            }
        },
        rollback: function(dom){
            if(dom.hasAttribute("data-source-class")){
                dom.className = dom.getAttribute("data-source-class");
            }

            if(dom.hasAttribute("data-source-css")){
                dom.style.cssText = dom.getAttribute("data-source-css");
            }
        },
        // data-animate="targetKey,animateType,execType,animation-name,animation-duration,animation-delay,animation-iteration-count,rotate,scale,opacity,left,top,extra"
        // screenItemId,itemAnimationShowType,execType,itemAnimationKey,animationRunningTime,animationStartTime,animationExecTimes,animationRotate,animationScale,animationOpacity,animationLeft,animationTop
        // targetKey: <element data-animate-key="targetKey">
        // animateType: 动画类型 1: 进入 2: 动作 3: 退出
        // execType: 执行方式  0: 进入页面就执行  1: 在前一个动画结束后执行  2: 与前一个动画一起执行
        // animation-name: 动画名称  @see animate.css
        // animation-duration: 动画时长
        // animation-delay: 动画延迟执行时间
        // animation-iteration-count: 动画执行次数
        // rotate: 旋转角度
        // scale: 缩放
        // opacity: 透明度
        // left: X轴位移
        // top: Y轴位移
        // extra: 外部参数
        parse: function(animations){
            var size = animations.length;
            var animate = null;
            var schemaData = null;
            var args = [];

            var identity = Util.GUID();
            var targetKey = 0;
            var animateType = 1;
            var execType = 0;
            var animateName = "none";
            var animateDuration = 1.0;
            var animateDelay = 0.0;
            var animateIterationCount = 1;
            var rotate = 0;
            var scale = 1;
            var opacity = 1;
            var left = 0;
            var top = 0; 
            var extra = null;

            var target = null;
            var dom = null;

            this.cacheData = {};
            this.cacheList = [];
            this.cacheTargetMapList = {};
            this.cacheTargetEnterMapList = {};
            this.cacheTargetExitMapList = {};

            for(var i = 0; i < size; i++){
                animate = animations[i];

                args = animate.split(",");

                identity                = Util.GUID(),        //唯一标识
                targetKey               = args[0] || "0";     //目标KEY/控件ID
                animateType             = args[1] || "1";     //动画类型 1:in 2:action 3:out
                execType                = args[2] || "0";     //执行类型
                animateName             = args[3] || "none";  //动画名称
                animateDuration         = args[4] || "1";     //动画执行时长
                animateDelay            = args[5] || "0";     //动画延迟执行时长
                animateIterationCount   = args[6] || "1";     //动画执行次数 -1:无限循环
                rotate                  = args[7] || "0";     //旋转角度
                scale                   = args[8] || "1";     //缩放
                opacity                 = args[9] || "1";     //透明度
                left                    = args[10] || "0";    //X轴位移
                top                     = args[11] || "0";    //Y轴位移
                extra                   = args[12] || null;   //外部扩展参数

                target = this.find(targetKey);

                if(target.length > 0){
                    dom = target[0];

                    if(animateIterationCount == -1 || animateIterationCount == "-1"){
                        animateIterationCount = "infinite";
                    }

                    this.backup(dom);

                    this.cacheData[identity] = {
                        "identity": identity,
                        "className": dom.className,
                        "cssText": dom.style.cssText,
                        "playNode": (function(playNode, ref, _this){
                            if(null == playNode){
                                return null;
                            }

                            var tmp = {};
                            var node = null;

                            for(var key in playNode){
                                if(playNode.hasOwnProperty(key)){
                                    node = ref.parents(playNode[key]);

                                    if(node.length == 0){
                                        node = ref.find(playNode[key]);
                                    }

                                    if(node.length == 0){
                                        node = ref;
                                    }

                                    node = node[0];

                                    _this.backup(node);

                                    tmp[key] = {
                                        "node": $(node), 
                                        "className": node.className,
                                        "cssText": node.style.cssText
                                    };
                                }
                            }

                            return tmp;
                        })(this.playNode, target, this),
                        "animate": {
                            "name": animateName,
                            "duration": animateDuration + "s",
                            "delay": animateDelay + "s",
                            "iterationCount": animateIterationCount,
                            "rotate": rotate + "deg",
                            "scale": scale,
                            "translate": left + "px, " + top + "px",
                            "opacity": (Number(opacity / 100)).toFixed(1),
                            "x": left + "px",
                            "y": top + "px",
                            "combo": {
                                "rotate": rotate + "deg",
                                "scale": scale,
                                "translate": left + "px, " + top + "px",
                                "opacity": (Number(opacity / 100)).toFixed(1)
                            },
                            "configure": {
                                "rotate": "0deg",
                                "scale": "1",
                                "translate": "0, 0",
                                "opacity": "1",
                                "combo": {
                                    "rotate": "0deg",
                                    "scale": "1",
                                    "translate": "0, 0",
                                    "opacity": "1"
                                }
                            }
                        },
                        "target": target,
                        "key": targetKey,
                        "execType": execType,
                        "type": animateType,
                        "next": [],
                        "same": [],
                        "extra": extra
                    };

                    var _cacheData = this.getCacheData(identity);

                    this.cacheList.push(_cacheData);

                    if(!(targetKey in this.cacheTargetMapList)){
                        this.cacheTargetMapList[targetKey] = [];
                    }

                    this.cacheTargetMapList[targetKey].push(_cacheData);

                    if(_cacheData.type == "1" || _cacheData.type == "2"){
                        if(!(targetKey in this.cacheTargetEnterMapList)){
                            this.cacheTargetEnterMapList[targetKey] = [];
                        }

                        this.cacheTargetEnterMapList[targetKey].push(_cacheData);
                    }

                    if(_cacheData.type == "3"){
                        if(!(targetKey in this.cacheTargetExitMapList)){
                            this.cacheTargetExitMapList[targetKey] = [];
                        }

                        this.cacheTargetExitMapList[targetKey].push(_cacheData);
                    }

                    if("rotate" == animateName || "scale" == animateName || "translate" == animateName || "opacity" == animateName || "combo" == animateName){
                        this.createAnimationFrames(_cacheData);
                    }
                }
            }

            return this;
        },
        find: function(targetKey){
            return this.box.find('[data-animate-key="' + targetKey + '"]');
        },
        playState: function(targetKey, state){
            var target = this.find(targetKey);

            if(target.length > 0){
                if("running" == state || "paused" == state || "none" == state){
                    target.attr("data-animate-state", state);
                }else{
                    return target.attr("data-animate-state") || "none";
                }
            }
        },
        setPlayNode: function(options){
            this.playNode = options || null
        },
        update: function(animateDataSet){
            var animations = animateDataSet ? animateDataSet.split("|") : [];

            this.parse(animations);
        },
        lookup: function(container, playNode){
            this.box = $(container || "body");

            this.setPlayNode(playNode || null);

            this.listen(this.box);

            return this;
        }
    };

    _Animate.CachePool = {};

    module.exports = {
        "version": "R17B0817",
        "TriggerTypes": TriggerTypes,
        "getAnimate": function(name){
            var ani = _Animate.CachePool[name] || (_Animate.CachePool[name] = new _Animate());

            return {
                "set": function(type, option){
                    ani.set(type, option);

                    return this;
                },
                "getHandleStack": function(){
                    return ani.getHandleStack();
                },
                "getAnimateNode": function(target){
                    return ani.getAnimateNode(target);
                },
                "getCacheList": function(type, key){
                    return ani.getCacheList(type, key);
                },
                "isEmpty": function(type, key){
                    var list = ani.getCacheList(type, key) || [];

                    return 0 === list.length;
                },
                "lookup": function(container, playNode){
                    ani.lookup(container, playNode);

                    return this;
                },
                "update": function(animateDataSet){
                    ani.update(animateDataSet);

                    return this;
                },
                "parse": function(animations){
                    ani.parse(animations);

                    return this;
                },
                "apply": function(triggerType, key){
                    ani.beginTime = Util.getTime();
                    ani.forced = false;
                    ani.exec("begin", [ani.beginTime, 0]);
                    ani.apply(triggerType || TriggerTypes.DEFAULT, key, false);

                    return this;
                },
                "enforcedApply": function(triggerType, key){
                    ani.beginTime = Util.getTime();
                    ani.forced = true;
                    ani.exec("begin", [ani.beginTime, 0]);
                    ani.apply(triggerType || TriggerTypes.DEFAULT, key, true);

                    return this;
                },
                "clean": function(animateNode){
                    ani.clean(animateNode);

                    return this;
                },
                "resume": function(target){
                    ani.resume(target);

                    return this;
                },
                "pause": function(target){
                    ani.pause(target);

                    return this;
                },
                "play": function(node, triggerType){
                    ani.beginTime = Util.getTime();
                    ani.forced = false;
                    ani.exec("begin", [ani.beginTime, 0]);
                    ani.play(triggerType || TriggerTypes.DEFAULT, node, false);

                    return this;
                },
                "enforcedPlay": function(node, triggerType){
                    ani.beginTime = Util.getTime();
                    ani.forced = true;
                    ani.exec("begin", [ani.beginTime, 0]);
                    ani.play(triggerType || TriggerTypes.DEFAULT, node, true);

                    return this;
                }
            }
        }
    };
});