/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Tooltips模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2018.8
 */
;define(function Tooltips(require, exports, module){
    var Util                = require("mod/se/util");
    var DOMConfigure        = require("mod/se/domconfigure");
    var DateType            = require("mod/se/datatype");
    var TemplateEngine      = require("mod/se/template");

    var _HTML_STRUCT = ''
                     + '<div class="mod-tooltips hide <%=tooltips.opts.stick%><%=tooltips.opts.shadow.set ? " set-shadow" : ""%><%=tooltips.opts.skin ? " " + tooltips.opts.skin : ""%>" data-tooltips="<%=tooltips.name%>">'
                     + '  <div class="mod-tooltips-triangle"></div>'
                     + '  <div class="mod-tooltips-body">'
                     + '  </div>'
                     + '</div>'
                     + '';

    var STICK = {
        "TOP": "stick-top",
        "RIGHT": "stick-right",
        "BOTTOM": "stick-bottom",
        "LEFT": "stick-left"
    };

    var ToolTipsTemplateEngine = TemplateEngine.getTemplate("tooltips_struct", {
        "start": "<%",
        "close": "%>",
        "root": "tooltips"
    });

    var DOMStruct = [
        {"property": "width",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": "auto"
        },
        {"property": "height",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": "auto"
        },
        {"property": "unit",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": "px"
        },
        {"property": "offset",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "x",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "y",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "shadow-set",
            "dataType": "boolean",
            "format": "",
            "pattern": "",
            "defaultValue": "1"
        },
        {"property": "shadow-value",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "triangle-size",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "10"
        },
        {"property": "triangle-unit",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": "px"
        },
        {"property": "triangle-offset",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "triangle-x",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "triangle-y",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "border",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "border-left",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "border-top",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "border-right",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "border-bottom",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "stick",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": STICK.RIGHT
        },
        {"property": "skin",
            "dataType": "string",
            "format": "",
            "pattern": "",
            "defaultValue": ""
        },
        {"property": "autohide",
            "dataType": "boolean",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        },
        {"property": "delay",
            "dataType": "number",
            "format": "",
            "pattern": "",
            "defaultValue": "0"
        }
    ];

    var GetDefaultOptions = function(){
        var opts = {
            "width": "auto",
            "height": "auto",
            "unit": "px",
            "offset": 0,
            "x": 0,
            "y": 0,
            "shadow": {
                "set": true,
                "value": null
            },
            "triangle": {
                "size": 10,
                "unit": "px",
                "offset": 0,
                "x": 0,
                "y": 0
            },
            "border": {
                "left": null,
                "top": null,
                "right": null,
                "bottom": null
            },
            "stick": STICK.RIGHT,
            "skin": "",
            "autohide": false,
            "delay": 0
        };

        return opts;
    };

    var _Tooltips = function(name){
        this.name = name;
        this.trigger = null;
        this.opts = GetDefaultOptions();
    };

    _Tooltips.prototype = {
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
        getTooltipsNode: function(){
            return $("[data-tooltips=\"" + this.name + "\"].mod-tooltips");
        },
        getTooltipsTriangle: function(){
            var node = this.getTooltipsNode();

            return node.find(".mod-tooltips-triangle");
        },
        getTooltipsBody: function(){
            var node = this.getTooltipsNode();

            return node.find(".mod-tooltips-body");
        },
        existed: function(){
            return this.getTooltipsNode().length > 0;
        },
        updateContent: function(content){
            var contentNode = this.getTooltipsBody();

            contentNode.html(content);

            return this;
        },
        getRealValue: function(value){
            var p1 = /^(top|bottom|left|right|center|cover|contain|auto)(px|%|pt|in|cm|mm|em|rem|ex|pc)$/gi;
            var p2 = /(px|%|pt|in|cm|mm|em|rem|ex|pc)(px|%|pt|in|cm|mm|em|rem|ex|pc){1,}$/gi;

            value = p2.test(value) ? value.replace(p2, "$1") : value;
            value = p1.test(value) ? value.replace(p1, "$1") : value;

            return value;
        },
        setSize: function(width, height, unit){
            var node = this.getTooltipsNode();

            unit = unit || "px";

            node.css({
                "width": this.getRealValue(width + unit),
                "height": this.getRealValue(height + unit)
            });
        },
        setShadow: function(shadow){
            var v = shadow.value;
            var node = this.getTooltipsNode();
            var triangle = this.getTooltipsTriangle();

            if(v){
                var o = {
                    "boxShadow": v
                };

                node.css(o);
                triangle.css(o);
            }
        },
        setBorder: function(border){
            var node = this.getTooltipsNode();
            var triangle = this.getTooltipsTriangle();

            if(!border){
                return ;
            }

            if(DateType.isObject(border)){
                for(var n in border){
                    if(border.hasOwnProperty(n)){
                        if(border[n]){
                            var o = {};
                            var k = "border" + n.charAt(0).toUpperCase() + n.substring(1);

                            o[k] = border[n];

                            node.css(o);
                            triangle.css(o);
                        }
                    }
                }
            }else{
                var o = {
                    "border": border
                };
                node.css(o);
                triangle.css(o);
            }
        },
        setTriangle: function(triangle, stick){
            var size = triangle.size;
            var unit = triangle.unit || "px";
            var offset = triangle.offset;
            var offsetX = triangle.x;
            var offsetY = triangle.y;

            var value = size + unit;
            var node = this.getTooltipsTriangle();

            var half = Math.floor(size / 2);

            var o = {
                "width": value,
                "height": value
            };

            switch(stick){
                case STICK.TOP:
                    o.top = (-(half + offsetY)) + unit;
                    o.marginLeft = (-(half + offset + offsetX)) + unit;
                break;
                case STICK.RIGHT:
                    o.right = (-(half + offsetX)) + unit;
                    o.marginTop = (-(half + offset + offsetY)) + unit;
                break;
                case STICK.BOTTOM:
                    o.bottom = (-(half + offsetY)) + unit;
                    o.marginLeft = (-(half + offset + offsetX)) + unit;
                break;
                case STICK.LEFT:
                    o.left = (-(half + offsetX)) + unit;
                    o.marginTop = (-(half + offset + offsetY)) + unit;
                break;
            }

            node.css(o);
        },
        updateAttributes: function(){
            var opts = this.options();

            this.setSize(opts.width, opts.height, opts.unit);
            this.setShadow(opts.shadow);
            this.setBorder(opts.border);
            this.setTriangle(opts.triangle, opts.stick);
        },
        render: function(selector, handlers){
            var _this = this;
            var _handlers = handlers || {};
            if(this.existed()){
                Util.execHandler(_handlers.existed, [_this]);
                return this;
            }
            _this.trigger = $(selector);
            _this.options(DOMConfigure.initDOMConfigure(_this.trigger).define(DOMStruct).parse());

            Util.execHandler(_handlers.beforeRender, [_this]);

            ToolTipsTemplateEngine.render(true, _HTML_STRUCT, {
                "name": this.name,
                "opts": this.options()
            }, {
                callback: function(ret){
                    $("body").append(ret.result);

                    this.updateAttributes();

                    Util.execHandler(_handlers.render, [_this]);
                },
                context: _this
            });

            return this;
        },
        position: function(){
            var trigger = this.trigger;
            var node = this.getTooltipsNode();
            var triangleNode = this.getTooltipsTriangle();

            var triggerRect = Util.getBoundingClientRect(trigger[0]);
            var tooltipsRect = Util.getBoundingClientRect(node[0]);

            var stick = this.options("stick");
            var triangle = this.options("triangle");
            var half = triangle.size / 2;
            var offset = this.options("offset");
            var offsetX = this.options("x");
            var offsetY = this.options("y");

            var o = {};

            switch(stick){
                case STICK.TOP:
                    o.top = (triggerRect.bottom + half + offset + offsetY) + "px";
                    o.left = (triggerRect.left + (triggerRect.width / 2) - (tooltipsRect.width / 2) + offsetX) + "px";
                break;
                case STICK.RIGHT:
                    o.top = (triggerRect.top + (triggerRect.height / 2) - (tooltipsRect.height / 2) + offsetY) + "px";
                    o.left = (triggerRect.left - half - tooltipsRect.width - offset + offsetX) + "px";
                break;
                case STICK.BOTTOM:
                    o.top = (triggerRect.top - half - tooltipsRect.height - offset + offsetY) + "px";
                    o.left = (triggerRect.left + (triggerRect.width / 2) - (tooltipsRect.width / 2) + offsetX) + "px";
                break;
                case STICK.LEFT:
                    o.top = (triggerRect.top + (triggerRect.height / 2) - (tooltipsRect.height / 2) + offsetY) + "px";
                    o.left = (triggerRect.right + half + offset + offsetX) + "px";
                break;
            }

            node.css(o);
        },
        visible: function(){
            var node = this.getTooltipsNode();

            return (node && node.hasClass("visible"));
        },
        show: function(handlers){
            var node = this.getTooltipsNode();

            if(this.visible()){
                return;
            }

            handlers = handlers || {};

            node.addClass("hidden");
            node.removeClass("hide");

            this.position();
            Util.execHandler(handlers.before, [this]);
            node.removeClass("hidden").addClass("visible");
            Util.execHandler(handlers.show, [this]);

            var opts = this.options();
            var autohide = opts.autohide;
            var delay = opts.delay;

            if(true === autohide){
                Util.delay(delay, {
                    callback: function(elapsedTime, _h){
                        this.hide(_h.hide || {});
                    },
                    context: this,
                    args: [handlers]
                })
            }
        },
        hide: function(handlers){
            handlers = handlers || {};

            var node = this.getTooltipsNode();
            var delay = Util.execHandler(handlers.before, [this]) || 0;

            Util.delay(delay, {
                callback: function(elapsedTime, _node, _h){
                    _node.removeClass("visible").addClass("hide");
                    Util.execHandler(_h.hide, [this]);
                },
                context: this,
                args: [node, handlers]
            })
        }
    };

    _Tooltips.Cache = {};

    _Tooltips.createTooltips = function(name){
        var tt = _Tooltips.Cache[name] || (_Tooltips.Cache[name] = new _Tooltips(name));

        return tt;
    }

    module.exports = {
        "version": "R18B0805",
        "createTooltips": function(name){
            return _Tooltips.createTooltips(name);
        }
    };
});