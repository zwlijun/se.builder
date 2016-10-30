/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 窗口弹层模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.4
 */
;define(function FrameBox(require, exports, module){
    var Util             = require("mod/se/util");
    var TemplateEngine   = require("mod/se/template");

    var FRAMEBOX = TemplateEngine.getTemplate("mod_framebox", {
        "root": "options"
    });

    var _framebox_html = '' +
                         '<div class="mod-framebox-mask flexbox middle center js-framebox-mask-<%=options.name%> <%=(options.skin ? options.skin : "")%>">' +
                         '  <div class="mod-framebox-box">' +
                         '    <del class="icofont<%=(options.close ? "" : " hide")%>" title="关闭/Close" data-close-for="framebox" data-action-click="framebox://seui/mod/framebox/close#<%=options.name%>"></del>' +
                         '    <h3 class="mod-framebox-titlebar<%=(options.titleBar ? "" : " hide")%>">' +
                         '      <i class="<%=(options.iconClass ? options.iconClass : "")%>"><%=options.icon ? options.icon : ""%></i>' +
                         '      <span><%=options.title%></span>' +
                         '    </h3>' +
                         '    <div class="mod-framebox-content">' +
                         '      <%=options.content%>' +
                         '    </div>' +
                         '    <div class="mod-framebox-statusbar<%=(options.statusBar ? "" : " hide")%>"><%=options.status%></div>' +
                         '  </div>' +
                         '</div>' +
                         ''; 

    var Action = {
        "schema": "framebox",
        "seui": {
            "mod": {
                "framebox": {
                    close: function(data, node, e){
                        var args = (data || "").split(",");
                        var name = args[0];

                        var mask = $(".js-framebox-mask-" + name);
                        var ins = _FrameBox.get(name);

                        if(ins){
                            var closeHandler = ins.options.onclose;
                            var closeBeforeHandler = ins.options.onclosebefore;

                            Util.execHandler(closeBeforeHandler, [ins, name, mask]);

                            ins.hide();

                            Util.execHandler(closeHandler, [ins, name, mask]);
                        }
                    }
                }
            }
        }
    };

    var GET_DEFAULT_OPTIONS = function(){
        return {
            "width": 560,
            "height": 400,
            "skin": "",
            "close": true,
            "titleBar": true,
            "statusBar": true,
            "iconClass": "",
            "icon": "",
            "title": "",
            "content": "",
            "status": "",
            "onclosebefore": null,
            "onclose": null,
            "onvisible": null,
            "onhidden": null,
            "onrender": null
        }
    }; 

    var _FrameBox = function(name){
        this.name = name || "default";
        this.options = {};
    };

    _FrameBox.Cache = {};

    _FrameBox.prototype = {
        insert: function(options){
            var ins = this;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);
            
            if(mask.length > 0){
                mask.remove();
            }

            FRAMEBOX.render(true, _framebox_html, options, {
                callback: function(ret, _name, _ins){
                    var meta = ret.metaData;
                    var targetNode = $("body");

                    targetNode.append(ret.result);

                    Util.registAction(".js-framebox-mask-" + _name, [
                        {type: "click", mapping: null, compatible: null}
                    ], Action);

                    _ins.size(meta.width, meta.height);

                    var mask = $(".js-framebox-mask-" + _name);

                    if(meta.onrender){
                        Util.execHandler(meta.onrender, [_FrameBox.get(_name), _name, mask, "init"]);
                    }
                },
                args: [name, ins]
            });

            return this;
        },
        conf: function(options){
            this.options = $.extend(GET_DEFAULT_OPTIONS(), options);
            this.options.name = this.name;

            this.insert(this.options);

            return this;
        },
        size: function(width, height){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);
            var box = mask.find(".mod-framebox-box");
            var content = mask.find(".mod-framebox-content");
            var titleBar = mask.find(".mod-framebox-titlebar")[0];
            var statusBar = mask.find(".mod-framebox-statusbar")[0];
            var titleBarRect = Util.getBoundingClientRect(titleBar);
            var statusBarRect = Util.getBoundingClientRect(statusBar);

            box.css({
                "width": width + "px",
                "height": height + "px"
            });

            content.css({
                "height": (height - titleBarRect.height - statusBarRect.height) + "px"
            });
        },
        content: function(content){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);
            var box = mask.find(".mod-framebox-box");

            box.html(content);

            if(options.onrender){
                Util.execHandler(meta.onrender, [_FrameBox.get(name), name, mask, "content"]);
            }
        },
        title: function(title){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);
            var box = mask.find(".mod-framebox-titlebar > span");

            box.html(title);

            if(options.onrender){
                Util.execHandler(meta.onrender, [_FrameBox.get(name), name, mask, "title"]);
            }
        },
        icon: function(cls, ico){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);
            var box = mask.find(".mod-framebox-titlebar > i");

            if(cls){
                box[0].className = cls;
            }
            
            if(ico){
                box.html(ico);
            }

            if(options.onrender){
                Util.execHandler(meta.onrender, [_FrameBox.get(name), name, mask, "icon"]);
            }
        },
        status: function(status){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);
            var box = mask.find(".mod-framebox-statusbar");

            box.html(status);

            if(options.onrender){
                Util.execHandler(meta.onrender, [_FrameBox.get(name), name, mask, "status"]);
            }
        },
        visible : function(visible, handler){
            var options = this.options;
            var name = options.name;
            var mask = $(".js-framebox-mask-" + name);

            if(mask.length > 0){
                if(true === visible){
                    mask.removeClass("hide");
                }else{
                    mask.addClass("hide");
                }
            }

            if(handler){
                Util.execHandler(handler, [_FrameBox.get(name), name, mask]);
            }
        },
        show: function(){
            this.visible(true, this.options.onvisible);
        },
        hide: function(){
            this.visible(false, this.options.onhidden);
        }
    };

    _FrameBox.create = function(name){
        var _ins = _FrameBox.Cache[name] || (_FrameBox.Cache[name] = new _FrameBox(name));

        return {
            options: _ins.options,
            conf: function(options){
                _ins.conf(options);

                this.options = _ins.options;

                return this;
            },
            size: function(width, height){
                _ins.size(width, height);

                return this;
            },
            content: function(content){
                _ins.content(content);

                return this;
            },
            title: function(title){
                _ins.title(title);

                return this;
            },
            status: function(status){
                _ins.status(status);

                return this;
            },
            icon: function(cls, ico){
                _ins.icon(cls, ico);

                return this;
            },
            show: function(filter){
                if(false !== filter){
                    for(var _name in _FrameBox.Cache){
                        if(_FrameBox.Cache.hasOwnProperty(_name) && (_name != _ins.name)){
                            _FrameBox.Cache[_name].hide();
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

    _FrameBox.get = function(name){
        if(name in _FrameBox.Cache){
            return _FrameBox.create(name);
        }

        return null;
    };  

    //--------------------------------------------------------------------------
    module.exports = {
        "version": "R16B0408",
        newFrameBox: function(name){
            return _FrameBox.create(name || "default");
        },
        get: function(name){
            return _FrameBox.get(name);
        }
    };                
});