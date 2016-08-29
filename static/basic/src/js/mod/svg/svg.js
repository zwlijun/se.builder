/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * SVG
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.3
 */
;define(function (require, exports, module){
    var _conuter = 0;
    var _SVG = function(){
        this.name = "svg_" + (_conuter++);
        this.id = this.name;
        this.docType = 'svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"';
        this.version = "1.1";
        this.xmlns = 'http://www.w3.org/2000/svg';
        this.xmlnsXlink = "http://www.w3.org/1999/xlink";
        this.xmlSpace = "preserve";
        this.x = 0;
        this.y = 0;
        this.width = "80";
        this.height = "80";
        this.viewBox = {
            x: 0,
            y: 0,
            width: "80",
            height: "80"
        };
        this.preserveAspectRatio = "none";
        this.node = null;
    };

    _SVG.AttributeParser = {
        "_formater": {
            "viewBox": function(value){
                var tmp = [value.x, value.y, value.width, value.height];

                return tmp.join(" ");
            }
        },
        "_parser": {
            "viewBox": function(value){
                var tmp = value.split(/[\s ]+/);

                return {
                    x: tmp[0],
                    y: tmp[1],
                    width: tmp[2],
                    height: tmp[3]
                };
            }
        },
        format: function(name, value){
            var ap = _SVG.AttributeParser;
            var formater = ap._formater;

            if(name in formater){
                value = formater[name].apply(ap, [value]);
            }

            return value;
        },
        parse: function(name, value){
            var ap = _SVG.AttributeParser;
            var parser = ap._parser;

            if(name in parser){
                value = parser[name].apply(ap, [value]);
            }

            return value;
        }
    };

    _SVG.prototype = {
        create: function(){
            var node = document.createElementNS(this.xmlns, "svg");

            this.node = node;

            node.setAttribute("xmlns", this.xmlns);
            node.setAttribute("xmlns:xlink", this.xmlnsXlink);
            node.setAttribute("xml:space", this.xmlSpace);
            node.setAttribute("version", this.version);

            this.setAttribute("name", this.name);
            this.setAttribute("id", this.id);
            this.setAttribute("x", this.x);
            this.setAttribute("y", this.y);
            this.setAttribute("width", this.width);
            this.setAttribute("height", this.height);
            this.setAttribute("viewBox", this.viewBox);
            this.setAttribute("preserveAspectRatio", this.preserveAspectRatio);
        },
        flush: function(name, value){
            var o = this[name];
            var ot = Object.prototype.toString.call(o);

            if(ot == "[object Function]" || (ot == "[object Object]" && o.apply)){
                return ;
            }

            this[name] = value;
        },
        setAttribute: function(name, value){
            var node = this.node;

            value = _SVG.AttributeParser.format(name, value);

            node.setAttribute(name, value);
            this[name] = value;
            this.flush(name, value);
        },
        getAttrubte: function(name){
            var node = this.node;

            value = node.getAttrubte(name);
            value = _SVG.AttributeParser.parse(name, value);

            this.flush(name, value);

            return value;
        },
        getSVGElement: function(){
            return this.node;
        },
        elementArgument: function(element){
            var type = Object.prototype.toString.call(element);

            if(type == "[object String]"){
                element = document.querySelector(element);
            }

            return element;
        },
        append: function(element){
            element = this.elementArgument(element);

            if(this.node && element){
                this.node.appendChild(element);
            }

            return element;
        },
        appendTo: function(element){
            element = this.elementArgument(element);

            if(this.node && element){
                element.appendChild(this.node);
            }

            return this.node;
        },
        insertBefore: function(element){
            element = this.elementArgument(element);

            if(this.node && element){
                var parent = element.parentNode;

                parent.insertBefore(this.node, element);
            }

            return this.node;
        },
        insertAfter: function(element){
            element = this.elementArgument(element);

            if(this.node && element){
                var parent = element.parentNode;
                var next = element.nextElementSibling;

                if(next){
                    parent.insertBefore(this.node, next);
                }else{
                    parent.appendChild(this.node);
                }
            }

            return this.node;
        },
        remove: function(){
            if(this.node){
                var parent = this.node.parent();

                parent.removeChild(this.node);
            }

            return this.node;
        },
        removeChild: function(element){
            element = this.elementArgument(element);

            if(this.node && element){
                this.node.removeChild(element);
            }

            return element;
        }
    };

    module.exports = {
        "version": "R16B0324",
        "SVG": function(){
            var svg = new _SVG();

            return {
                "xmlns": svg.xmlns,
                "xmlnsXlink": svg.xmlnsXlink,
                "xmlSpace": svg.xmlSpace,
                "create": function(){
                    svg.create();

                    return svg.getSVGElement();
                },
                "setAttribute": function(name, value){
                    svg.setAttribute(name, value);

                    return this;
                },
                "getAttrubte": function(name){
                    return svg.getAttrubte(name);
                },
                "append": function(element){
                    return svg.append(element);
                },
                "appendTo": function(element){
                    return svg.appendTo(element);
                },
                "insertBefore": function(element){
                    return svg.insertBefore(element);
                },
                "insertAfter": function(element){
                    return svg.insertAfter(element);
                },
                "remove": function(){
                    return svg.remove();
                },
                "removeChild": function(element){
                    return svg.removeChild(element);
                }
            }
        }
    };
});