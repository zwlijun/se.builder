/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Loading模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Loading(require, exports, module){
    var _loading_html = '' +
                        '<div class="mod-loading-box abs-center">' +
                        '  <div class="mod-loading-ani flexbox center middle">' +
                        '    <svg width="64" height="64" viewBox="0 0 57 57" xmlns="http://www.w3.org/2000/svg" stroke="#fff">' +
                        '      <g fill="none" fill-rule="evenodd">' +
                        '        <g transform="translate(1 1)" stroke-width="2">' +
                        '          <circle cx="5" cy="50" r="5">' +
                        '            <animate attributeName="cy"' +
                        '               begin="0s" dur="2.2s"' +
                        '               values="50;5;50;50"' +
                        '               calcMode="linear"' +
                        '               repeatCount="indefinite" />' +
                        '            <animate attributeName="cx"' +
                        '               begin="0s" dur="2.2s"' +
                        '               values="5;27;49;5"' +
                        '               calcMode="linear"' +
                        '               repeatCount="indefinite" />' +
                        '          </circle>' +
                        '          <circle cx="27" cy="5" r="5">' +
                        '            <animate attributeName="cy"' +
                        '               begin="0s" dur="2.2s"' +
                        '               from="5" to="5"' +
                        '               values="5;50;50;5"' +
                        '               calcMode="linear"' +
                        '               repeatCount="indefinite" />' +
                        '            <animate attributeName="cx"' +
                        '               begin="0s" dur="2.2s"' +
                        '               from="27" to="27"' +
                        '               values="27;49;5;27"' +
                        '               calcMode="linear"' +
                        '               repeatCount="indefinite" />' +
                        '          </circle>' +
                        '          <circle cx="49" cy="50" r="5">' +
                        '            <animate attributeName="cy"' +
                        '               begin="0s" dur="2.2s"' +
                        '               values="50;50;5;50"' +
                        '               calcMode="linear"' +
                        '               repeatCount="indefinite" />' +
                        '            <animate attributeName="cx"' +
                        '               from="49" to="49"' +
                        '               begin="0s" dur="2.2s"' +
                        '               values="49;5;27;49"' +
                        '               calcMode="linear"' +
                        '               repeatCount="indefinite" />' +
                        '          </circle>' +
                        '        </g>' +
                        '      </g>' +
                        '    </svg>' +
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
                    o.removeClass("hide");

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

            var textNode = mask.find("mod-loading-text");

            textNode.addClass("hide");
            if(options.text){
                textNode.html(options.text);
                textNode.removeClass("hide");
            }

            return this;
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