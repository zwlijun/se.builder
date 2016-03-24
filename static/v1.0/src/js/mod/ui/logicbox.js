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
    var Util = $.Util = require("mod/se/util");

    var _logicbox_html = '' +
                         '<div class="mod-logicbox-mask hide js-logicbox-mask-${name}">' +
                         '  <div class="mod-logicbox-box abs-center">' +
                         '  </div>' +
                         '</div>' +
                         '';

    var _LogicBox = function(name){
        this.name = name || "default";
        this.options = {};
    };

    _LogicBox.Cache = {};

    _LogicBox.prototype = {
        //options::mask
        //options::update
        //optoins::show
        //options::hide
        conf: function(options){
            var name = this.name;

            this.options = options || {};
            this.options.name = name;

            var mask = $(".js-logicbox-mask-" + name);

            if(mask.length == 0){
                $("body").append(_logicbox_html.replace("${name}", name));

                mask = $(".js-logicbox-mask-" + name);
            }

            if(this.options.mask){
                Util.execAfterMergerHandler(this.options.mask, [name, mask]);
            }
        },
        update: function(content){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-logicbox-mask-" + name);
            var box = mask.find(".mod-logicbox-box");

            box.html(content);

            if(options.update){
                Util.execAfterMergerHandler(options.update, [name, mask]);
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
                Util.execAfterMergerHandler(handler, [name, mask]);
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
        "version": "R16B0314",
        newLogicBox: function(name){
            return _LogicBox.create(name || "default");
        },
        get: function(name){
            return _LogicBox.get(name);
        }
    };
});