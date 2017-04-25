/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 逻辑弹层模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function LogicBox(require, exports, module){
    var Util             = require("mod/se/util");
    var TemplateEngine   = require("mod/se/template");

    var LOGICBOX = TemplateEngine.getTemplate("mod_logicbox", {
        "root": "options"
    }); 

    var _logicbox_html = '' +
                         '<div class="mod-logicbox-mask flexbox middle center hide js-logicbox-mask-<%=options.name%> <%=(options.skin ? options.skin : "")%>">' +
                         '  <div class="mod-logicbox-box">' +
                         '  </div>' +
                         '</div>' +
                         '';

    var GET_DEFAULT_OPTIONS = function(){
        return {
            "skin": "",
            "update": null,
            "show": null,
            "hide": null,
            "mask": {
                callback: function(name, mask){
                    mask.on("mousedown", function(e){
                        e.stopPropagation();

                        var ins = _LogicBox.get(name);

                        if(ins){
                            ins.hide();
                        }

                        ins = null;
                    });

                    mask.find(".mod-logicbox-box").on("mousedown", function(e){
                        e.stopPropagation();
                    });
                }
            }
        };
    };

    var _LogicBox = function(name){
        this.name = name || "default";
        this.options = {};
    };

    _LogicBox.Cache = {};

    _LogicBox.prototype = {
        //options::skin
        //options::mask
        //options::update
        //optoins::show
        //options::hide
        insert: function(options){
            var name = options.name;
            var mask = $(".js-logicbox-mask-" + name);

            if(mask.length > 0){
                mask.remove();
            }

            LOGICBOX.render(true, _logicbox_html, options, {
                callback: function(ret, _name){
                    var meta = ret.metaData;
                    var targetNode = $("body");

                    targetNode.append(ret.result);

                    if(meta.mask){
                        var _mask = $(".js-logicbox-mask-" + _name);
                        Util.execHandler(meta.mask, [_name, _mask]);
                    }
                },
                args: [name]
            });

            return this;
        },
        conf: function(options){
            this.options = $.extend(GET_DEFAULT_OPTIONS(), options);
            this.options.name = this.name;

            this.insert(this.options);

            return this;
        },
        update: function(content){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-logicbox-mask-" + name);
            var box = mask.find(".mod-logicbox-box");

            box.html(content);

            if(options.update){
                Util.execHandler(options.update, [name, mask]);
            }
        },
        visible : function(visible, handler){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-logicbox-mask-" + name);

            if(mask.length > 0){
                if(true === visible){
                    mask.removeClass("hide");
                }else{
                    mask.addClass("hide");
                }
            }

            if(handler){
                Util.execHandler(handler, [name, mask]);
            }
        },
        show: function(){
            this.visible(true, this.options.show);
        },
        hide: function(){
            this.visible(false, this.options.hide);
        }
    };

    _LogicBox.create = function(name){
        var _ins = _LogicBox.Cache[name] || (_LogicBox.Cache[name] = new _LogicBox(name));

        return {
            options: _ins.options,
            conf: function(options){
                _ins.conf(options);

                this.options = _ins.options;

                return this;
            },
            update: function(content){
                _ins.update(content);

                return this;
            },
            show: function(filter){
                if(false !== filter){
                    for(var _name in _LogicBox.Cache){
                        if(_LogicBox.Cache.hasOwnProperty(_name) && (_name != _ins.name)){
                            _LogicBox.Cache[_name].hide();
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

    _LogicBox.get = function(name){
        if(name in _LogicBox.Cache){
            return _LogicBox.create(name);
        }

        return null;
    };

    //--------------------------------------------------------------------------
    module.exports = {
        "version": "R17B0425",
        newLogicBox: function(name){
            return _LogicBox.create(name || "default");
        },
        get: function(name){
            return _LogicBox.get(name);
        }
    };
});