/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 弹层模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function LayerBox(require, exports, module){
    var Util             = require("mod/se/util");
    var TemplateEngine   = require("mod/se/template");

    var LAYERBOX = TemplateEngine.getTemplate("mod_layerbox", {
        "root": "options"
    }); 

    var _layerbox_html = '' +
                         '<div class="mod-layerbox-mask flexbox middle center hide js-layerbox-mask-<%=options.name%> <%=options.type%> <%=(options.skin ? options.skin : "")%>">' +
                         '  <div class="mod-layerbox-box">' +
                         '    <div class="mod-layerbox-content"><%=options.text%></div>' +
                         '    <div class="mod-layerbox-buttons flexbox center middle">' +
                         '      <%for(var i = 0; i < options.btns.length; i++){%>' +
                         '      <%var btn = options.btns[i];%>' +
                         '      <button data-btn-for="layerbox" data-btn-index="<%=i%>,<%=options.name%>" data-action-click="layerbox://seui/mod/layerbox/btn#<%=i%>,<%=options.name%>" type="button" class="button <%=(btn.skin ? btn.skin : \"\")%>"><%=btn.label%></button>' +
                         '      <%}%>' +
                         '    </div>' +
                         '  </div>' +
                         '</div>' +
                         '';

    var Action = {
        "schema": "layerbox",
        "seui": {
            "mod": {
                "layerbox": {
                    btn: function(data, node, e){
                        e.stopPropagation();

                        var args = (data || "").split(",");
                        var index = Number(args[0]);
                        var name = args[1];

                        var ins = _LayerBox.get(name);

                        if(ins){
                            var handler = ins.options.btns[index].handler;

                            Util.execHandler(handler, [ins, index, name]);
                        }
                    }
                }
            }
        }
    };

    var Types = {
        "INFO": "info",
        "CONFIRM": "confirm",
        "ALARM": "alarm",
        "ERROR": "error",
        "RIGHT": "success"
    };

    var GET_DEFAULT_OPTIONS = function(){
        return {
            "text": "",
            "skin": "",
            "type": Types.INFO,
            "btns": [{
                "label": "确定", 
                "skin": "", 
                "handler": {
                    callback: function(layerbox, index, name){
                        layerbox.hide();
                    }
                }
            }]
        }
    };

    var _LayerBox = function(name){
        this.name = name || "default";
        this.options = {};
    };

    _LayerBox.Cache = {};

    _LayerBox.prototype = {
        //options::text
        //options::skin
        //options::type
        //options::btns [label, skin, handler]
        insert: function(options){
            var name = options.name;
            var mask = $(".js-layerbox-mask-" + name);
            
            if(mask.length > 0){
                mask.remove();
            }

            LAYERBOX.render(true, _layerbox_html, options, {
                callback: function(ret, _name){
                    var targetNode = $("body");

                    targetNode.append(ret.result);

                    Util.registAction(".js-layerbox-mask-" + _name, [
                        {type: "click", mapping: null, compatible: null}
                    ], Action);
                },
                args: [name]
            });

            return this;
        },
        visible: function(visible, handler){
            var mask = $(".js-layerbox-mask-" + this.name);

            if(mask.length > 0){
                if(true === visible){
                    mask.removeClass("hide");
                }else{
                    mask.addClass("hide");
                }
                Util.execHandler(handler, [this.name]);
            }
        },
        conf: function(options){
            this.options = $.extend(GET_DEFAULT_OPTIONS(), options);
            this.options.name = this.name;

            this.insert(this.options);

            return this;
        },
        show: function(){
            this.visible(true, this.options.show);
        },
        hide: function(options){
            this.visible(false, this.options.hide);
        }
    };

    _LayerBox.create = function(name){
        var _ins = _LayerBox.Cache[name] || (_LayerBox.Cache[name] = new _LayerBox(name));

        return {
            options: _ins.options,
            conf: function(options){
                _ins.conf(options);

                this.options = _ins.options;

                return this;
            },
            show: function(filter){
                if(false !== filter){
                    for(var _name in _LayerBox.Cache){
                        if(_LayerBox.Cache.hasOwnProperty(_name) && (_name != _ins.name)){
                            _LayerBox.Cache[_name].hide();
                        }
                    }
                }

                _ins.show();

                return this;
            },
            hide: function(){
                _ins.hide();

                return this;
            }
        }
    };

    _LayerBox.get = function(name){
        if(name in _LayerBox.Cache){
            return _LayerBox.create(name);
        }

        return null;
    };

    var _Compatible = _LayerBox.create("default");

    module.exports = {
        "version": "R17B0425",
        "options": _Compatible.options,
        "Types": Types,
        newLayerBox: function(name){
            return _LayerBox.create(name || "default");
        },
        get: function(name){
            return _LayerBox.get(name);
        },
        conf: function(options){
            _Compatible.conf(options);

            this.options = _Compatible.options;

            return this;
        },
        show : function(filter){
            _Compatible.show(filter);

            return this;
        },
        hide : function(){
            _Compatible.hide();

            return this;
        }
    };
});