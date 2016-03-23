/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 样式处理工具
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2015.12
 */
;define(function (require, exports, module){
    var ColorUtil = {
        auto: function(color, alpha){
            color = String(color || "").toLowerCase();
            alpha = String(alpha);

            var isHEX = "#" == color.substr(0, 1);
            var isRGB = "rgb" == color.substr(0, 3);
            var isNumber = /^[\d]+(\.[\d]+)?$/.test(alpha);
            var r = 0;
            var g = 0;
            var b = 0;
            var a = isNumber ? Number(alpha) : 1;

            if(a > 1){
                a = Number((a / 100).toFixed(2));
            }

            if(!isHEX && !isRGB){
                return "";
            }

            if(isHEX){
                var hex = color.substr(1);

                if(hex.length == 3){
                    var tmp = hex.split("");
                    var str = "";
                    for(var j = 0; j < 3; j++){
                        str += (tmp[j] + tmp[j]);
                    }
                    
                    hex = str;
                }

                r = parseInt(hex.substr(0, 2) || "0", 16);
                g = parseInt(hex.substr(2, 2) || "0", 16);
                b = parseInt(hex.substr(4, 2) || "0", 16);
            }
            if(isRGB){
                var str = color.substring(color.indexOf("(") + 1, color.indexOf(")"));
                var item = [];
                str = str.replace(/[^\d,]+/g, "");
                item = str.split(",");

                r = Number(item[0]);
                g = Number(item[1]);
                b = Number(item[2]);
                a = Number((undefined === item[3] || isNumber) ? a : item[3]); 
            }

            return {
                "r": r,
                "g": g,
                "b": b,
                "a": a
            };
        },
        stringify: function(rgba){
            if(!rgba){
                return "";
            }

            var r = rgba.r;
            var g = rgba.g;
            var b = rgba.b;
            var a = rgba.a;

            if(1 == a){
                return "rgb(" + r + ", " + g + ", " + b + ")";
            }else{
                return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            }
        }
    };
    var StyleUtil = {
        hasUnit: function(value){
            return /(px|%|pt|in|cm|mm|em|rem|ex|pc)$/gi.test(value + "");
        },
        isKeyword: function(value){
            return /^(top|bottom|left|right|center|cover|contain|auto)$/gi.test(value);
        },
        getRealValue: function(value){
            var p1 = /^(top|bottom|left|right|center|cover|contain|auto)(px|%|pt|in|cm|mm|em|rem|ex|pc)$/gi;
            var p2 = /(px|%|pt|in|cm|mm|em|rem|ex|pc)(px|%|pt|in|cm|mm|em|rem|ex|pc){1,}$/gi;

            value = p2.test(value) ? value.replace(p2, "$1") : value;
            value = p1.test(value) ? value.replace(p1, "$1") : value;

            return value;
        },
        simple: function(key, value){
            if("" === value || undefined === value){
                return "";
            }

            var items = value.split(/[\s ]+/g);
            var size = items.length;
            var item = null;

            if(size > 1){
                var tmp = [];

                for(var i = 0; i < size; i++){
                    item = items[i];

                    if(!item){continue;}
                    item = (StyleUtil.hasUnit(item) ? item : item + "px");
                    item = StyleUtil.getRealValue(item);

                    tmp.push(item);
                }

                value = tmp.join(" ");
            }else{
                value = (StyleUtil.hasUnit(value) ? value : value + "px");
                value = StyleUtil.getRealValue(value);
            }

            return key + ": " + value + "; ";
        },
        source: function(key, value){
            if("" === value || undefined === value){
                return "";
            }

            return key + ": " + value + "; ";
        },
        color: function(key, color, alpha){
            var rgba = ColorUtil.auto(color, alpha);

            if(!rgba){
                return "";
            }
            
            return key + ": " + ColorUtil.stringify(rgba) + "; ";
        }
    };
    var StyleTransform = {
        "backgroundColor": function(color, alpha){
            return StyleUtil.color("background-color", color, alpha);
        },
        "backgroundImage": function(url){
            if(url){
                return "background-image: url(" + url + "); ";
            }
            return "";
        },
        "backgroundRepeat": function(repeat){
            if(repeat){
                return "background-repeat: " + repeat + "; ";
            }

            return "";
        },
        "backgroundPosition": function(x, y){
            if(("" === x || undefined === x)){
                return ""
            }

            var xpos = 0;
            var ypos = 0;

            if("" === y || undefined === y){
                var item = String(x).split(/[\s ]+/g);
                var size = item.length;

                if(1 === size){
                    xpos = item[0];
                    ypos = StyleUtil.isKeyword(xpos) ? "center" : "50%";
                }else{
                    xpos = item[0];
                    ypos = item[1];
                }
            }else{
                xpos = String(x);
                ypos = String(y);
            }

            xpos = StyleUtil.isKeyword(xpos) ? xpos : (StyleUtil.hasUnit(xpos) ? xpos : xpos + "px");
            ypos = StyleUtil.isKeyword(ypos) ? ypos : (StyleUtil.hasUnit(ypos) ? ypos : ypos + "px");

            return "background-position: " + xpos + " " + ypos + "; ";
        },
        "backgroundSize": function(x, y){
            if(("" === x || undefined === x)){
                return ""
            }

            var xpos = 0;
            var ypos = 0;

            if("" === y || undefined === y){
                var item = String(x).split(/[\s ]+/g);
                var size = item.length;

                if(1 === size){
                    xpos = item[0];

                    if(StyleUtil.isKeyword(xpos)){
                        ypos = "";
                    }else{
                        xpos = StyleUtil.hasUnit(xpos) ? xpos : xpos + "px";
                        ypos = "auto";
                    }
                }else{
                    xpos = StyleUtil.hasUnit(item[0])? item[0] : item[0] + "px";
                    ypos = StyleUtil.hasUnit(item[1])? item[1] : item[1] + "px";
                }
            }else{
                xpos = StyleUtil.hasUnit(String(x)) ? x : x + "px";
                ypos = StyleUtil.hasUnit(String(y)) ? y : y + "px";
            }

            return "background-size: " + xpos + (ypos ? " " + ypos : "") + "; ";
        },
        "background": function(v){
            return StyleUtil.source("background", v);
        },
        "font": function(v){
            return StyleUtil.source("font", v);
        },
        "fontSize": function(size){
            return StyleUtil.simple("font-size", size);
        },
        "lineHeight": function(lh){
            return StyleUtil.source("line-height", lh);
        },
        "textAlign": function(align){
            return StyleUtil.source("text-align", align);
        },
        "color": function(color, alpha){
            return StyleUtil.color("color", color, alpha);
        },
        "width": function(width){
            return StyleUtil.simple("width", width);
        },
        "height": function(height){
            return StyleUtil.simple("height", height);
        },
        "left": function(left){
            return StyleUtil.simple("left", left);
        },
        "top": function(top){
            return StyleUtil.simple("top", top);
        },
        "margin": function(v){
            return StyleUtil.simple("margin", v);
        },
        "marginLeft": function(n){
            return StyleUtil.simple("margin-left", n);
        },
        "marginRight": function(n){
            return StyleUtil.simple("margin-right", n);
        },
        "marginTop": function(n){
            return StyleUtil.simple("margin-top", n);
        },
        "marginBottom": function(n){
            return StyleUtil.simple("margin-bottom", n);
        },
        "padding": function(v){
            return StyleUtil.simple("padding", v);
        },
        "paddingLeft": function(n){
            return StyleUtil.simple("padding-left", n);
        },
        "paddingRight": function(n){
            return StyleUtil.simple("padding-right", n);
        },
        "paddingTop": function(n){
            return StyleUtil.simple("padding-top", n);
        },
        "paddingBottom": function(n){
            return StyleUtil.simple("padding-bottom", n);
        },
        "border": function(v){
            return StyleUtil.source("border", v);
        },
        "borderWidth": function(v){
            return StyleUtil.simple("border-width", v);
        },
        "borderStyle": function(v){
            return StyleUtil.source("border-style", v);
        },
        "borderColor": function(v){
            return StyleUtil.source("border-color", v);
        },
        "borderLeftWidth": function(n){
            return StyleUtil.simple("border-left-width", n);
        },
        "borderRightWidth": function(n){
            return StyleUtil.simple("border-right-width", n);
        },
        "borderTopWidth": function(n){
            return StyleUtil.simple("border-top-width", n);
        },
        "borderBottomWidth": function(n){
            return StyleUtil.simple("border-bottom-width", n);
        },
        "borderLeftStyle": function(n){
            return StyleUtil.source("border-left-style", n);
        },
        "borderRightStyle": function(n){
            return StyleUtil.source("border-right-style", n);
        },
        "borderTopStyle": function(n){
            return StyleUtil.source("border-top-style", n);
        },
        "borderBottomStyle": function(n){
            return StyleUtil.source("border-bottom-style", n);
        },
        "borderLeftColor": function(color, alpha){
            return StyleUtil.color("border-left-color", color, alpha);
        },
        "borderRightColor": function(color, alpha){
            return StyleUtil.color("border-right-color", color, alpha);
        },
        "borderTopColor": function(color, alpha){
            return StyleUtil.color("border-top-color", color, alpha);
        },
        "borderBottomColor": function(color, alpha){
            return StyleUtil.color("border-bottom-color", color, alpha);
        },
        "borderRadius": function(v){
            return StyleUtil.simple("border-radius", v);
        },
        "borderTopLeftRadius": function(n){
            return StyleUtil.simple("border-top-left-radius", n);
        },
        "borderBottomLeftRadius": function(n){
            return StyleUtil.simple("border-bottom-left-radius", n);
        },
        "borderTopRightRadius": function(n){
            return StyleUtil.simple("border-top-right-radius", n);
        },
        "borderBottomRightRadius": function(n){
            return StyleUtil.simple("border-bottom-right-radius", n);
        },
        "zIndex": function(n){
            return StyleUtil.source("z-index", n);
        },
        "opacity": function(n){
            return StyleUtil.source("opacity", n);
        }
    };

    module.exports = {
        "version": "R15B1215",
        "ColorUtil": ColorUtil,
        "StyleUtil": StyleUtil,
        "cssText": function(obj){
            var a = [];

            if(obj && Object.prototype.toString.call(obj) == "[object Object]"){
                for(var key in obj){
                    if(obj.hasOwnProperty(key)){
                        if(key in StyleTransform){
                            a.push(StyleTransform[key].apply(null, (String(obj[key]||"")).split(";")));
                        }
                    }
                }
            }

            return a.join("");
        },
        "style": function(obj){
            var cssText = this.cssText(obj);

            return cssText ? ' style="' + cssText + '"' : '';
        },
        "merge": function(obj1, obj2, isStyle){
            var nobj = $.extend({}, obj1, obj2);

            return (true === isStyle ? this.style(nobj) : this.cssText(nobj));
        }
    };
});