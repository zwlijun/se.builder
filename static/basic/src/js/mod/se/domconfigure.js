/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * DOM配置解析
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2017.7
 *
 */
;define(function(require, exports, module){
    var DateUtil = require("mod/se/dateutil");
    //element::data-domconf-[key-]property
    var DOMConfigure = function(node, key){
        this.node = $(node);
        this.key = key || null;
        this.main = "data-domconf-";
        this.prefix = this.key ? this.main + this.key + "-" : this.main;

        this.struct = [
            //{"property": "",
            //     "dataType": "string|number|boolean|datetime|array|json",
            //     "format": "",
            //     "pattern": "",
            //     "defaultValue": ""
            //}
        ];
    };

    DOMConfigure.prototype = {
        parser: {
            "string": function(item){
                var property = item.property;
                var dataType = item.dataType;
                var format = item.format || "";
                var pattern = item.pattern || "";
                var defaultValue = item.defaultValue || "";

                var value = defaultValue;

                if(this.hasAttribute(property)){
                    value = this.getAttribute(property);

                    if(!this.match(value, pattern)){
                        value = defaultValue;
                    }
                }

                return value;
            },
            "number": function(item){
                var property = item.property;
                var dataType = item.dataType;
                var format = item.format || "";
                var pattern = item.pattern || "";
                var defaultValue = item.defaultValue || "0";

                var value = Number(defaultValue);

                if(this.hasAttribute(property)){
                    value = this.getAttribute(property);

                    if(!this.match(value, pattern)){
                        value = defaultValue;
                    }

                    value = Number(value);

                    if(isNaN(value)){
                        value = Number(defaultValue);
                    }
                }

                return value;
            },
            "boolean": function(item){
                var property = item.property;
                var dataType = item.dataType;
                var format = item.format || "";
                var pattern = item.pattern || "";
                var defaultValue = item.defaultValue || "0";

                var value = defaultValue;

                if(this.hasAttribute(property)){
                    value = this.getAttribute(property);
                }

                value = ("1" === value || "true" === value);

                return value;
            },
            "datetime": function(item){
                var property = item.property;
                var dataType = item.dataType;
                var format = item.format || "%y-%M-%d";
                var pattern = item.pattern || "";
                var defaultValue = item.defaultValue || "";

                var value = defaultValue;

                if(this.hasAttribute(property)){
                    value = this.getAttribute(property);
                }

                if(value){
                    if(DateUtil.parse(value, format).ok){
                        return value;
                    }else{
                        value = "";
                    }
                }

                return value || "";
            },
            "array": function(item){
                var property = item.property;
                var dataType = item.dataType;
                var format = item.format || ",";
                var pattern = item.pattern || "";
                var defaultValue = item.defaultValue || "";

                var value = defaultValue;

                if(this.hasAttribute(property)){
                    value = this.getAttribute(property);
                }

                value = value.length === 0 ? [] : value.split(format);

                return value;
            },
            "json": function(item){
                var property = item.property;
                var dataType = item.dataType;
                var format = item.format || "";
                var pattern = item.pattern || "";
                var defaultValue = item.defaultValue || "{}";

                var value = defaultValue;

                if(this.hasAttribute(property)){
                    value = this.getAttribute(property);
                }

                value = this.parseJSON(value);

                return value;
            }
        },
        define: function(struct){
            this.struct = struct || [];
        },
        trim: function(str){
            if(null === str || undefined === str){
                return str;
            }

            var v = String(str).replace(/^([\s ]+)|([\s ]+)$/g, "");

            return v;
        },
        parseJSON: function(str){
            var o = new Function("return " + str)();

            return o;
        },
        match: function(value, pattern){
            if(!pattern){
                return true;
            }

            var re = new RegExp(pattern);

            return re.test(value);
        },
        hasAttribute: function(property){
            var node = this.node;
            var dom = node[0];
            var prefix = this.prefix;
            var attributeName = prefix + property;

            return dom.hasAttribute(attributeName);
        },
        getAttribute: function(property){
            var node = this.node;
            var prefix = this.prefix;
            var attributeName = prefix + property;

            if(this.hasAttribute(property)){
                return this.trim(node.attr(attributeName) || null);
            }

            return null;
        },
        setAttribute: function(property, value){
            var node = this.node;
            var prefix = this.prefix;
            var attributeName = prefix + property;

            node.attr(attributeName, this.trim(value));
        },
        createObject: function createObject(originObject, properties, value){
            //填充数据
            var __fixed = function(originObject, namespace, property, value){
                var funcBody = "if(!(\"" + property + "\" in originObject." + namespace + ")){" + 
                    "    originObject." + namespace + " = {}" + 
                    "}" + 
                    "originObject." + namespace + "." + property + " = value;" + 
                    "return originObject;";

                var originObject = new Function(
                    "originObject",
                    "value",
                    funcBody
                )(originObject, value);

                return originObject;
            };
            //创建对象
            var __createObject = function(originObject, properties, keys, value){
                var items = [].concat(properties);
                var property = items.shift();

                if(items.length === 0){
                    if(keys.length === 0){
                        originObject[property] = value;
                    }else{
                        originObject = __fixed(originObject, keys.join("."), property, value);
                    }

                    return originObject;
                }else{
                    if(keys.length === 0){
                        originObject[property] = {}
                    }else{
                        originObject = __fixed(originObject, keys.join("."), property, {});
                    }
                }

                keys.push(property);

                return __createObject(originObject, items, keys, value);                
            };
            
            return __createObject(originObject, properties, [], value)
        },
        parse: function(){
            var struct = [].concat(this.struct || []);
            var size = struct.length;
            var item = null;
            var dataType = null;
            var property = null;
            var properties = null;
            var conf = {};

            for(var i = 0; i < size; i++){
                item = struct[i];

                if(!item){
                    continue;
                }

                property = item.property;
                dataType = item.dataType;

                if(dataType in this.parser){
                    properties = property.split("-");

                    conf = this.createObject(conf, properties, this.parser[dataType].apply(this, [item]));
                }else{
                    console.warn("无法解析的数据类型(" + dataType + ")");
                }
            }

            return conf;
        }
    };

    DOMConfigure.initDOMConfigure = function(node, key){
        var _key = key || "domconf";
        var dc = new DOMConfigure(node, key);

        return {
            define: function(struct){
                dc.define(struct);

                return this;
            },
            parseJSON: function(str){
                return dc.parseJSON(str);
            },
            hasAttribute: function(property){
                return dc.hasAttribute(property);
            },
            getAttribute: function(property){
                return dc.getAttribute(property);
            },
            setAttribute: function(property, value){
                dc.setAttribute(property, value);
            },
            parse: function(){
                return dc.parse();
            }
        };
    };

    return {
        "version": "R17B0730",
        initDOMConfigure: function(node, key){
            return DOMConfigure.initDOMConfigure(node, key);
        }
    };
});