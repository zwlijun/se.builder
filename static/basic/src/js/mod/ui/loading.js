/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Loading模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function Loading(require, exports, module){
    var _svg = '' +
               '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48" fill="white">' + 
               '  <circle cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(45 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.125s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(90 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.25s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(135 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.375s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(180 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(225 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.625s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(270 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.75s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(315 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.875s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '  <circle transform="rotate(180 16 16)" cx="16" cy="3" r="0">' + 
               '    <animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="0.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline" />' + 
               '  </circle>' + 
               '</svg>' +  
               '';   
    var _loading_html = '' +
                        '<div class="mod-loading-box abs-center">' +
                        '  <div class="mod-loading-ani flexbox center middle">' +
                        _svg + 
                        '  </div>' +
                        '  <div class="mod-loading-text"></div>' +
                        '</div>'
                        '';
    var _mask_html = '' +
                     '<div class="mod-loading-mask hide js-loading-mask-${name}">' +
                     _loading_html +
                     '</div>' + 
                     '';

    //统计
    var _count = 0;

    var _Loading = function(name){
        this.name = name || "default";
        this.count = 0;
    };

    _Loading.Cache = {};

    _Loading.prototype = {
        visible: function(visible){
            var name = this.name;
            var mask = $(".js-loading-mask-" + name);
            
            if(mask.length > 0){
                if(true === visible){                                        
                    mask.removeClass("hide");

                    this.count++;
                }else{
                    --this.count;

                    if(this.count <= 0){
                        mask.addClass("hide");
                        this.count = 0;
                    }
                }
            }
        },
        /**
         * 设置Loading
         * @param  {Object} options 设置项
         *         {String} text = 加载中
         *         {String} skin = ""
         *         {Boolean} embed = false
         *         {Boolean} full = false
         *         {String} target = body
         */
        loading: function(options){
            var targetNode = $(options.target || "body");
            var name = this.name;
            var mask = $(".js-loading-mask-" + name);

            if(mask.length == 0){
                targetNode.append(_mask_html.replace("${name}", name));

                mask = $(".js-loading-mask-" + name);
            }else{
                mask[0].className = "mod-loading-mask hide js-loading-mask-" + name;
            }

            if(true === options.embed){
                mask.addClass("embed");
            }

            if(true === options.full){
                mask.addClass("full");
            }

            if(options.skin){
                mask.addClass(options.skin);
            }

            this.text(options.text);

            return this;
        },
        text: function(text){
            var name = this.name;
            var mask = $(".js-loading-mask-" + name);
            var textNode = mask.find(".mod-loading-text");

            textNode.addClass("hide");
            if(text){
                textNode.html(text);
                textNode.removeClass("hide");
            }

            mask = null;
            textNode = null;
        },
        /**
         * 内嵌Loading内容
         * @param  {Object} options 设置项
         *         {String} text = 加载中
         *         {String} skin = ""
         *         {Boolean} embed = false
         *         {Boolean} full = false
         *         {String} target = body
         */
        show: function(options){
            this.loading(options).visible(true);

            return this;
        },
        hide: function(){
            this.visible(false);

            return this;
        }
    };

    _Loading.create = function(name){
        var _loading = _Loading.Cache[name] || (_Loading.Cache[name] = new _Loading(name));

        return {
            text: function(text){
                _loading.text(text);

                return this;
            },
            show: function(options){
                _loading.show(options);

                return this;
            },
            hide: function(){
                _loading.hide();

                return this;
            }
        }
    };

    var _Compatible = _Loading.create("default");

    module.exports = {
        "version": "R16B0314",
        newLoading: function(name){
            return _Loading.create(name || "default");
        },
        text: function(text){
            _Compatible.text(text);

            return this;
        },
        show : function(loadingText){
            _Compatible.show({
                "text": loadingText
            });

            return this;
        },
        hide : function(){
            _Compatible.hide();

            return this;
        },
        clear: function(name){
            var _ins = _Loading.Cache;

            if(name){
                if(name in _ins){
                    _ins[name].count = 0;
                    _ins[name].hide();
                }
            }else{
                for(var _name in _ins){
                    if(_ins.hasOwnProperty(_name)){
                        _ins[_name].count = 0;
                        _ins[_name].hide();
                    }
                }
            }

            return this;
        }
    };    
});