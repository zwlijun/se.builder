/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 样式处理
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.9
 */
;define(function (require, exports, module){
    var vendors = ["webkit", "Moz", "ms", "O", ""];
    var vendorLength = vendors.length;
    var nodeStyle = document.createElement("div").style;
    var funcs = /^((translate|rotate|scale)(X|Y|Z|3d)?|skew(X|Y)|matrix(3d)?|perspective)$/;
    var needPrefix = /^(transform[\-a-zA-Z]*|transition|animation[\-a-zA-Z]*|perspective[\-a-zA-Z]*|keyframes)$/;

    var GetVendor = function(propertyName){
        var key = "";
        var prefix = "";
        var name = (function(n){
            if(n.indexOf("-") != -1){
                var items = n.split("-");
                var tmp = [];

                for(var i = 0; i < items.length; i++){
                    tmp.push(0 === i ? items[i] : items[i].charAt(0).toUpperCase() + items[i].substr(1));
                }

                return tmp.join("");
            }else{
                return n;
            }
        })(propertyName);

        var lfchr = name.charAt(0);
        var ufchr = lfchr.toUpperCase();

        for(var i = 0; i < vendorLength; i++){
            prefix = vendors[i];
            key = (prefix ? prefix + ufchr : lfchr) + name.substr(1);

            if(key in nodeStyle){
                return prefix;
            }
        }

        return undefined;
    };

    var hasProperty = function(property){
        var rt = getRealStyle(property);

        return ((property in nodeStyle) || (rt in nodeStyle));
    };

    var getRealStyle = function(style){
        var vendor = GetVendor(style);

        if(undefined === vendor){
            return undefined;
        }
        if("" === vendor){
            if(style in nodeStyle){
                return style
            }else{
                return undefined;
            }
        }else{
            var hack = vendor + style.charAt(0).toUpperCase() + style.substr(1);

            if(hack in nodeStyle){
                return hack;
            }else{
                if(style in nodeStyle){
                    return style;
                }else{
                    return undefined;
                }
            }
        }
    };

    var getPrefixStyle = function(style){
        var vendor = GetVendor(style);

        if(undefined === vendor){
            return undefined;
        }
        if("" === vendor){
            if(style in nodeStyle){
                return style
            }else{
                return undefined;
            }
        }else{
            var hack = vendor + style.charAt(0).toUpperCase() + style.substr(1);

            if(hack in nodeStyle){
                return "-" + vendor.toLowerCase() + "-" + cssname(style);
            }else{
                if(style in nodeStyle){
                    return style;
                }else{
                    return undefined;
                }
            }
        }
    };

    var getVendorHackKey = function(name){
        var vendor = GetVendor(name);

        var key = (vendor || "").toLowerCase();

        return key ? "-" + key + "-" : "";
    };

    var getRealPropertyName = function(name){
        var prefix = getPrefixStyle(name);

        if((undefined === prefix || prefix == name)){
            return name;
        }else{
            return prefix;
        }
    };

    var getRealComputedStyle = function(el, name){
        name = getRealPropertyName(name);

        var vendor = getVendorHackKey(name);
        var vendorName = (vendor && (name.indexOf(vendor) == -1)) ? vendor + name : name;

        name = name.replace(vendor, "");

        return (el.css(name) || el.css(vendorName) || "");
    };

    var cssname = function(property){
        var tmp = property.replace(/([A-Z])/g, "-$1").toLowerCase();

        return tmp;
    };

    var css = function(el, name, value){
        $(el).css(getRealPropertyName(name), value);
    };

    //styles  {proertyName: propertyValue}
    var map = function(el, styles){
        for(var key in styles){
            if(styles.hasOwnProperty(key)){
                css(el, key, styles[key]);
            }
        }
    };

    //[{key: Node, value: Styles}]
    var list = function(styleList){
        var size = styleList.length;
        var tmp0 = null;

        for(var i = 0; i < size; i++){
            tmp0 = styleList[i];

            if(!tmp0){
                continue;
            }

            map(tmp0.key, tmp0.value);
        }
    };

    var isTransformMethod = function(name){
        return funcs.test(name);
    };

    var needAppendPrefix = function(name){
        return needPrefix.test(name);
    };

    var getVendorStyles = function(name, value){
        var key = name;
        var tmp = [];

        if(needAppendPrefix(name)){
            for(var i = 0, s = vendors.length; i < s; i++){
                key = (vendors[i]).toLowerCase();

                if(key){
                    key = "-" + key + "-" + name;
                }else{
                    key = name;
                }

                tmp.push(key + ": " + value + ";");
            }
        }else{
            tmp.push(name + ": " + value + ";");
        }

        return  tmp;
    };

    var getNumberValue = function(el, name){
        var value = getRealComputedStyle($(el), name);

        value = value.replace(/[^0-9\.\-]+/g, "");

        // console.info(name + ": " + value)

        return Number(value);
    };

    var getIntValue = function(el, name){
        var value = getNumberValue(el, name);

        return NaN == value ? NaN : parseInt(value, 10);
    };

    var getFloatValue = function(el, name){
        var value = getNumberValue(el, name);

        return NaN == value ? NaN : parseFloat(value, 10);
    };

    var RemoveStyleRules = function(el, styles){
        if(el && el.style && el.style.cssText){
            var ls = styles || [];
            var cssText = (el.style.cssText || "").toLowerCase();
            var size = ls.length;

            var pattern = /([^:\s]+)[\s]*:[\s]*([^;]+);?/gmi;
            var matcher = null;

            pattern.lastIndex = 0;

            var property = null;
            var value = null;
            var style = {};

            while(null !== (matcher = pattern.exec(cssText))){
                property = matcher[1];
                value = matcher[2];

                if(!property){
                    continue;
                }

                style[property] = value;
            }

            for(var i = 0; i < size; i++){
                if(ls[i] in style){
                    delete style[ls[i]];
                }
            }

            var newStyles = [];
            for(var p in style){
                if(style.hasOwnProperty(p)){
                    newStyles.push(p + ": " + style[p]);
                }
            }

            el.style.cssText = newStyles.join("; ");
        }
    };

    module.exports = {
        "hasProperty" : hasProperty,
        "getRealStyle": getRealStyle,
        "getPrefixStyle": getPrefixStyle,
        "getRealPropertyName": getRealPropertyName,
        "getRealComputedStyle": getRealComputedStyle,
        "getVendorHackKey": getVendorHackKey,
        "cssname": cssname,
        "css": css,
        "map": map,
        "list": list,
        "isTransformMethod": isTransformMethod,
        "getNumberValue": getNumberValue,
        "getIntValue": getIntValue,
        "getFloatValue": getFloatValue,
        "needAppendPrefix": needAppendPrefix,
        "getVendorStyles": getVendorStyles,
        "removeStyleRules": RemoveStyleRules
    };
});