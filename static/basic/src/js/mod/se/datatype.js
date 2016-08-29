/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 数据类型检测
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.4
 */
;define(function(requre, exports, module){
    var _DataType = {
        version: "R16B0429",
        typeof: function(obj){
            var _type = Object.prototype.toString.call(obj);
            var prefix = "[object ";
            var prefixLength = prefix.length;
            var length = _type.length;

            var realType = _type.substring(prefixLength, length - 1);

            return realType;
        },
        lower: function(obj){
            return (_DataType.typeof(obj)).toLowerCase();
        },
        isString: function(obj){
            var _type = _DataType.lower(obj);

            return "string" === _type;
        },
        isNumber: function(obj){
            var _type = _DataType.lower(obj);

            return "number" === _type;
        },
        isInt: function(obj){
            if(_DataType.isNumber(obj)){
                return obj === Math.floor(obj);
            }

            return false;
        },
        isFloat: function(obj){
            if(_DataType.isNumber(obj)){
                return obj !== Math.floor(obj);
            }

            return false;
        },
        isBoolean: function(obj){
            return (true === obj || false === obj);
        },
        isNull: function(obj){
            return (null === obj);
        },
        isUndefined: function(obj){
            return (undefined === obj);
        },
        isEmptyString: function(obj){
            if(_DataType.isString(obj)){
                obj = obj.replace(/^([\s]+)|([\s]+)$/, "");

                return "" === obj;
            }

            return false;
        },
        isObject: function(obj){
            var _type = _DataType.lower(obj);
            return "object" === _type;
        },
        isArray: function(obj){
            if(Array.isArray){
                return Array.isArray(obj);
            }

            var _type = _DataType.lower(obj);

            return "array" === _type;
        },
        isFunction: function(obj){
            var _type = _DataType.lower(obj);

            return "function" === _type;
        },
        isDate: function(obj){
            var _type = _DataType.lower(obj);

            return "date" === _type;
        },
        isRegExp: function(obj){
            var _type = _DataType.lower(obj);

            return "regexp" === _type;
        }
    };

    module.exports = _DataType;
});