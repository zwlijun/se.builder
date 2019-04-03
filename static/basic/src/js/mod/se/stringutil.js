/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 字符串工具模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function StringUtil(require, exports, module) {

    module.exports = {
        /**
         * 替换所有匹配的字符/字符串
         * @param String instr 输入的字符串
         * @param String regexp 需要替换的字符/字符串
         * @param String replacement 替换的字符/字符串
         * @return String 替换后的字符串
         */
        replaceAll : function(instr, regexp, replacement){
            var pattern = new RegExp(regexp, "gm");
            var tmp = instr.replace(pattern, replacement);
            pattern = null;
            return tmp;
        },
        /**
         * 替换第一次匹配的字符/字符串
         * @param String instr 输入的字符串
         * @param String regexp 需要替换的字符/字符串
         * @param String replacement 替换的字符/字符串
         * @return String 替换后的字符串
         */
        replaceFirst : function(instr, regexp, replacement){
            var group = new RegExp("("+ regexp + ")", "gm").exec(instr);
            var tmp = instr;
            if (null !== group){
                tmp = instr.substring(0, group.index)
                    .concat(replacement)
                    .concat(instr.substring(group.index+group[1].length));
            }
            group = null;
            return tmp;
        },
        /**         
         * 匹配字符串是否以prefix开头
         * @param String instr 输入的字符串
         * @param String prefix 前缀
         * @param Number offset 起始的偏移位置
         * @return Boolean true/false
         */
        startsWith : function(instr, prefix, offset){
            offset = typeof(offset) == "number" ? offset : 0;
            if (instr.length >= (prefix.length + offset)){
                return (instr.substr(offset, prefix.length) == prefix);
            }else{
                return false;
            }
        },
        /**
         * 匹配字符串是否以suffix结尾
         * @param String instr 输入的字符串
         * @param String suffix
         * @return Boolean true/false
         */
        endsWith : function(instr, suffix){
            if (instr.length >= suffix.length){
                return (instr.substr((instr.length - suffix.length), suffix.length) == suffix);
            }else{
                return false;
            }
        },
         /**
         * 去两端空字符
         * @param String instr 输入的字符串
         * @return String 去空后的字符串
         */
        trim : function(instr){
            var pattern = /^([\s ]+)|([\s ]+)$/gmi;
            var tmp = instr.replace(pattern, "");
            pattern = null;
            return tmp;
        },
        /**
         * 去左空字符
         * @param String instr 输入的字符串
         * @return String 去空后的字符串
         */
        trimLeft : function(instr){
            var pattern = /^[\s ]+/gmi;
            var tmp = instr.replace(pattern, "");
            pattern = null;
            return tmp;
        },
        /**
         * 去右空字符
         * @param String instr 输入的字符串
         * @return String 去空后的字符串
         */
        trimRight : function(instr){
            var pattern = /[\s ]+$/gmi;
            var tmp = instr.replace(pattern, "");
            pattern = null;
            return tmp;
        },
        /**
         * 字符串长度，将中文看成两个字符计算
         * @param String instr 输入的字符串
         * @return Number 字符串长度
         */
        length : function(instr){
            return instr.replace(/[^\u0000-\u00FF]/gmi, "**").length;
        },
        /**
         * 前导填充
         * @param String instr 输入的字符串
         * @param String chr 填充的字符
         * @param Number bit 位数
         * @return String 填充后的字符串
         */
        fillBefore : function(instr, chr, bit){
            var len = instr.length;
            var shift = bit - len + 1;
            var str = instr;
            if(shift > 0){
                var a = new Array(shift);
                str = a.join(chr) + str;
                a = null;
            }
            return str;
        },
        /**
         * 向后填充
         * @param String instr 输入的字符串
         * @param String chr 填充的字符
         * @param Number bit 位数
         * @return String 填充后的字符串
         */
        fillAfter : function(instr, chr, bit){
            var len = instr.length;
            var shift = bit - len + 1;
            var str = instr;
            if(shift > 0){
                var a = new Array(shift);
                str = str + a.join(chr);
                a = null;
            }
            return str;
        },
        /**
         * 千分位格式化
         * @param String currency 货币金额
         * @param Boolean trimTailZero 是否过滤小数位后的未尾0
         * @return String 转换后的货币
         */
        formatMaskCurrency: function(currency, trimTailZero){
            if(null == currency){
                return "??";
            }
            var dotIndex = -1;
            var hasDot = -1 != (dotIndex = currency.indexOf("."));
            var prefix = hasDot ? currency.substring(0, dotIndex) : currency;
            var suffix = hasDot ? currency.substring(dotIndex) : "";

            if(suffix.length > 0 && true == trimTailZero){
                suffix = suffix.replace(/0+$/g, "");
                if("." == suffix){
                    suffix = "";
                }
            }

            var formatCurrent = prefix.replace(/([a-zA-Z\d\?\*])(?=(?:[a-zA-Z\d\?\*]{3})+$)/g, "$1,") + suffix;

            return formatCurrent;
        },
        /**
         * 转换成货币格式(支持超大金额)
         * @param String amount 输入的字符串
         * @param int digit 小数位数
         * @param Boolean trimTailZero 是否过滤小数位后的未尾0
         * @return String 转换后的货币
         */
        toCurrency: function(amount, digit, trimTailZero){
            if(!isNaN(Number(amount + ""))){
                var str = amount + "";
                var group = str.split(".");
                var prefix = group[0];
                var suffix = group[1] || "";
                var len = suffix.length;

                digit = Number(digit);
                digit = isNaN(digit) ? Math.min(len, 2) : Math.min(digit, 6);
                
                if(digit > 0){
                    if(len < digit){
                        suffix = suffix + new Array(digit - len + 1).join("0")
                    }else if(len == digit){
                        suffix = suffix;
                    }else{
                        var tmp = suffix.substring(0, digit);
                        var last = Number(tmp.substring(digit - 1));
                        var cut = Number(suffix.substring(digit, digit + 1));

                        if(cut >= 5){
                            tmp = Number(tmp) + 1;
                        }
                        suffix = tmp + "";
                    }
                }

                //如果小数位为0或者suffix计算后的长度 > 设置的小数位，测对主体进行进位操作
                if((digit === 0 && suffix) || (suffix.length - digit === 1)){
                    var tmp = Number(suffix.charAt(0));
                    var arr = prefix.split("");
                    var n = 0;
                    var o = 1;
                    var buf = [];

                    //小数溢出
                    if(suffix.length - digit === 1){
                        tmp = 5;
                        suffix = suffix.substring(1);
                    }

                    if(tmp >= 5){
                        for(var i = arr.length - 1; i >= 0; i--){
                            n = Number(arr[i]);

                            n += o;

                            if(n == 10){
                                buf.unshift(0);
                                o = 1;
                            }else{
                                buf.unshift(n);
                                o = 0;
                            }
                        }

                        if(o === 1){
                            buf.unshift(1);
                        }

                        prefix = buf.join("");
                    }
                }

                amount = digit > 0 ? prefix + "." + suffix : prefix;
            }

            return this.formatMaskCurrency(amount, true === trimTailZero);
        },
        /**
         * 将字符串转换成十六进制
         * @param String str 原串
         * @return String hex
         */
        string2hex : function(str){
            var len = str.length;
            var hex = '';
            var code = 0;

            for(var i = 0; i < len; i++){
                code = str.charCodeAt(i);

                if(code < 127){
                    hex += "00" + code.toString(16);  
                }else{
                    hex += code.toString(16);
                }
            }

            return hex;
        },
        /**
         * 将十六进制转换成字符串
         * @param String hex 十六进制串
         * @return String str
         */
        hex2string : function(hex){
            var len = hex.length;
            var str = "";
            var code = 0;

            for(var i = 0; i < len; i += 4){
                code = parseInt(hex.substr(i, 4), 16);
                str += String.fromCharCode(code);
            }

            return str;
        }
    };
});