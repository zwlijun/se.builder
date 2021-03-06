/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图片懒惰加载
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.10
 *
 */
;define(function(require, exports, module){
                              require("mod/polyfill/intersection-observer");
    var Util                = require("mod/se/util");
    var DateType            = require("mod/se/datatype");
    var Listener            = require("mod/se/listener");

    var HandleStack         = Listener.HandleStack;

    var GetDefaultOptions = function(){
        return {
            "root": null,               //DOM元素，但默认值为null
            "threshold": [0.0],         //Either a single number or an array of numbers between 0.0 and 1.0, 
            "margin": "30px",           //offset
            "visible": false,           //是否只有可见才加载，比较耗性能
            "validity": true            //是否检测图片是否合法
        };
    };

    var LazyLoader = function(name){
        this.name = name;
        this.opts = GetDefaultOptions();
        this.observer = null;

        this.handleStack = new HandleStack();
        this.listener = new Listener({
            onbefore: null,
            onsuccess: null,
            onerror: null,
            oncomplete: null
        }, this.handleStack);
    };

    LazyLoader.prototype = {
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
        /**
         * 配置参数
         * @return {[type]} [description]
         */
        options: function(){
            var args = arguments;
            var size = args.length;

            if(0 === size){
                return this.opts;
            }

            if(1 === size){
                if(DateType.isObject(args[0])){
                    this.opts = $.extend(true, {}, this.opts, args[0]);

                    return this;
                }
                return this.opts[args[0]];
            }

            if(2 === size){
                var key = args[0]
                var tmp = args[1];
                if(DateType.isObject(tmp)){
                    tmp = $.extend(true, {}, this.opts[key], tmp);
                }

                this.opts[key] = tmp;
            }

            return this;
        },
        /**
         * 获取节点样式
         * @param  {[type]} element      [description]
         * @param  {[type]} propertyName [description]
         * @param  {[type]} pseudo       [description]
         * @return {[type]}              [description]
         */
        getComputedStyle: function(element, propertyName, pseudo){
            pseudo = pseudo || null;

            var style = null;

            if("getComputedStyle" in window){
                style = window.getComputedStyle(element, pseudo);
            }else if(element.currentStyle){
                style = element.currentStyle;
            }

            if(style){
                return style[propertyName];
            }

            return "";
        },
        /**
         * 判断元素是否可见
         * @param  {[type]}  el [description]
         * @return {Boolean}    [description]
         */
        visible: function(el){
            var display = this.getComputedStyle(el, "display");
            var visibility = this.getComputedStyle(el, "visibility");
            var opacity = this.getComputedStyle(el, "opacity");

            return ("none" != display && "hidden" != visibility && opacity > 0);
        },
        /**
         * 判断节点是否可见
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        visibility: function(node){
            var el = null;
            var tagName = null;
            var visible = true;

            do{
                el = node[0];
                tagName = (el.tagName || "").toLowerCase()
                visible = this.visible(el);

                el = el.offsetParent;
            }while(null !== el && true === visible);

            return visible;
        },
        /**
         * [setBackgroundImage description]
         * @param {[type]} node [description]
         * @param {[type]} src  [description]
         * @param {[type]} defaultURL  [description]
         */
        setBackgroundImage: function(node, src, defaultURL){
            var _this = this;
            var opts = _this.options();
            var external = node.attr("data-lazyexternal") || null;

            src = LazyImages.transformImageURL(src, external);
            defaultURL = LazyImages.transformImageURL(defaultURL, external);

            node.addClass("lazy-beforeload");
            _this.exec("before", ["bg", node]);

            if(true === opts.validity){
                node.css("background-image", "url(" + defaultURL + ")");
                Util.getImageInfoByURL(src, {
                    callback: function(img, width, height, url, def){
                        if(!img){
                            this.node.removeClass("lazy-beforeload")
                                     .addClass("lazy-error")
                                     .css("background-image", "url(" + def + ")");
                            this.lazy.exec("error", ["bg", this.node]);
                        }else{
                            this.node.removeClass("lazy-beforeload")
                                     .addClass("lazy-success")
                                     .css("background-image", "url(" + url + ")");
                            this.lazy.exec("success", ["bg", this.node]);
                        }

                        this.node.addClass("lazy-complete");
                        this.lazy.exec("complete", ["bg", this.node]);
                    },
                    context: {
                        "node": node,
                        "lazy": _this
                    },
                    args: [src, defaultURL]
                });
            }else{
                node.removeClass("lazy-beforeload")
                    .addClass("lazy-complete")
                    .addClass("lazy-maybe")
                    .css("background-image", "url(" + src + ")");
                _this.exec("complete", ["bg", node]);
            }
        },
        /**
         * [getRealImageNode description]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        getRealImageNode: function(node){
            var el = node[0];
            var tagName = (el.tagName).toLowerCase();

            if("img" == tagName){
                return node;
            }

            var tmp = node.find("img");

            if(tmp.length == 0){
                return null;
            }

            return $(tmp[0]);
        },
        /**
         * [setImageSource description]
         * @param {[type]} node [description]
         * @param {[type]} src  [description]
         * @param {[type]} defaultURL  [description]
         */
        setImageSource: function(node, src, defaultURL){
            var _this = this;
            var opts = _this.options();
            var external = node.attr("data-lazyexternal") || null;

            node = _this.getRealImageNode(node);

            if(!node){
                return ;
            }

            src = LazyImages.transformImageURL(src, external);
            defaultURL = LazyImages.transformImageURL(defaultURL, external);

            node.addClass("lazy-beforeload");
            _this.exec("before", ["img", node]);

            if(true === opts.validity){
                node.attr("src", defaultURL);
                Util.getImageInfoByURL(src, {
                    callback: function(img, width, height, url, def){
                        if(!img){
                            this.node.removeClass("lazy-beforeload")
                                     .addClass("lazy-error")
                                     .attr("src", def);
                            this.lazy.exec("error", ["img", this.node]);
                        }else{
                            this.node.removeClass("lazy-beforeload")
                                     .addClass("lazy-success")
                                     .attr("src", url)
                                     .removeAttr("data-loaderr");
                            this.lazy.exec("success", ["img", this.node]);
                        }
                        
                        this.node.addClass("lazy-complete");
                        this.lazy.exec("complete", ["img", this.node]);
                    },
                    context: {
                        "node": node,
                        "lazy": _this
                    },
                    args: [src, defaultURL]
                });
            }else{
                node.removeClass("lazy-beforeload")
                    .addClass("lazy-complete")
                    .addClass("lazy-maybe")
                    .attr("src", src);
                _this.exec("complete", ["bg", node]);
            }
        },
        /**
         * [execExternalSchema description]
         * @param {[type]} node         [description]
         * @param {[type]} externalURL  [description]
         */
        execExternalSchema: function(node, externalURL){
            var _this = this;

            Util.requestExternal(externalURL, [_this.name, node]);
        },
        /**
         * 获取默认图片
         * @param {[type]} node         [description]
         */
        getDefaultImage: function(node){
            return LazyImages.getDefaultImage(node[0] || null);
        },
        /**
         * [process description]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        process: function(node){
            var lazy = node.attr("data-lazysrc");

            if(!lazy){
                return ;
            }

            node.removeAttr("data-lazysrc");

            var defaultURL = this.getDefaultImage(node);

            var pattern = /^((bg|img|schema)@)?([^\s]+)$/gi;
            var matcher = null;

            var type = null;
            var src = null;

            var _this = this;
            var opts = _this.options();

            pattern.lastIndex = 0;
            if(null !== (matcher = pattern.exec(lazy))){
                type = (matcher[2] || "img").toLowerCase();
                src = matcher[3];

                if("bg" === type){
                    this.setBackgroundImage(node, src || defaultURL, defaultURL);
                }else if("schema" === type){
                    this.execExternalSchema(node, src || "lazy://exec");
                }else if("img" === type){
                    this.setImageSource(node, src || defaultURL, defaultURL);
                }
            }
        },
        /**
         * 预处理
         * @param  {HTMLElement} el      [description]
         * @return {[type]}              [description]
         */
        prepare: function(el){
            var _this = this;
            var opts = _this.options();
            var node = $(el);
            var needVisibility = true === opts.visible;

            if(true !== needVisibility || (true === needVisibility && _this.visibility(node))){
                _this.observer.observe(node[0]);
            }
        },
        /**
         * 筛选出有效的节点
         */
        filter: function(){
            var wrapper = this.wrapper;
            var nodes = wrapper.find('[data-lazysrc]');
            var size = nodes.length;

            if(size == 0){
                return ;
            }

            for(var i = 0; i < size; i++){
                this.prepare(nodes[i]);
            }
        },
        /**
         * 监听
         * @param  {String}  wrapperSelector    范围包裹元素selector，默认为body
         * @param  {Element} root               [description]
         * @return {[type]}                     [description]
         */
        watch: function(wrapperSelector, root){
            var wrapper = $(wrapperSelector || "body");

            if(wrapper.length == 0){
                return ;
            }

            var _this = this;
            var opts = _this.options();

            _this.wrapper = wrapper;
            _this.options("root", root || null);

            if("IntersectionObserver" in window){
                _this.observer = new IntersectionObserver(function(entries, observer){
                    entries.forEach(function(entry) {
                        // console.log(entry)
                        
                        if(true === entry.isIntersecting || entry.intersectionRatio > 0){
                            var target = entry.target;

                            _this.process($(target));
                            observer.unobserve(target);
                        }
                    });
                }, {
                    "root": root || null,
                    "rootMargin": opts.margin,
                    "threshold": opts.threshold
                });
            }
        }
    };

    LazyLoader.Cache = {};

    LazyLoader.newInstance = function(name){
        var lazy = LazyLoader.Cache[name] || (LazyLoader.Cache[name] = new LazyLoader(name));

        return {
            exec: function(type, args){
                return lazy.exec(type, args);
            },
            set: function(type, option){
                lazy.set(type, option);
            },
            remove: function(type){
                lazy.remove(type);
            },
            get: function(type){
                return lazy.get(type);
            },
            clear: function(){
                lazy.clear();
            },
            getHandleStack: function(){
                return lazy.getHandleStack();
            },
            options: function(){
                var opts = lazy.options.apply(lazy, arguments);

                if(opts instanceof LazyLoader){
                    return this;
                }

                return opts;
            },
            filter: function(){
                lazy.filter();

                return this;
            },
            watch: function(wrapperSelector, root){
                lazy.watch(wrapperSelector, root);

                return this;
            }
        };
    };

    LazyLoader.getInstance = function(name){
        if(name in LazyLoader.Cache){
            return LazyLoader.newInstance(name);
        }

        return null;
    };

    (function(){
        if(("LazyImages" in window) && window["LazyImages"]){
            return ;
        }
        var lazyImages = $('meta[property="lazyimage"]');
        var size = lazyImages.length;

        var tmp = {};
        var meta = null;
        var sizeKey = null;
        for(var i = 0; i < size; i++){
            meta = $(lazyImages[i]);
            sizeKey = meta.attr("data-size");

            tmp[sizeKey] = {
                "size": sizeKey,
                "source": meta.attr("content"),
                "isDefault": "1" === meta.attr("data-default")
            };

            if(tmp[sizeKey].isDefault){
                tmp["defaultImage"] = tmp[sizeKey];
            }
        };

        var GetDefaultImage = function(dom){
            if(!dom){
                return (LazyImages["defaultImage"] || {}).source || "";
            }
            
            var cls = dom.className || "";
            var items = cls.split(/[\s]+/);
            var size = items.length;
            var item = null;

            var defaultURL = dom.getAttribute("data-default-image") || (LazyImages["defaultImage"] || {}).source || "";
            for(var i = 0; i < size; i++){
                item = items[i];

                if(item in LazyImages){
                    defaultURL = LazyImages[item].source;
                }
            }

            return defaultURL || "";
        };

        tmp["getDefaultImage"] = GetDefaultImage;
        tmp["transformImageURL"] = function(imageURL, external){
            return external ? (Util.requestExternal(external, [imageURL]).result || imageURL) : imageURL;
        };

        window["LazyImages"] = tmp;
    })();

    module.exports = {
        "version": "R18B1011",
        newInstance: function(name){
            return LazyLoader.newInstance(name);
        },
        getInstance: function(name){
            return LazyLoader.getInstance(name);
        }
    };
});