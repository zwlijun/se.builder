/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 表单工具模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2014.4
 */
;define(function FormUtil(require, exports, module){
    var Listener   = $.Listener   = require("mod/se/listener");
    var StringUtil = $.StringUtil = require("mod/se/stringutil");
    var Request    = $.Request    = require("mod/se/request");
    var Util       = $.Util       = require("mod/se/util");
    var HandleStack               = Listener.HandleStack;

    /**
     * 校驗方法
     * @param String data 外部传入参数
     * @param String value 输入值
     * @param Node el 对象元素（zepto/jquery） 
     * @return String|Boolean tips|true    tips/false/null/undefined/"": 表示校验失败  true: 表示校验通过  
     */
    $.CheckFilter = {
        "Internal": {
            /**
             * 是否為中國大陸身份證
             * @param String v 需要校驗的值
             * @return Boolean true/false
             */
            cnid : function(data, v, el){
                var wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
                var vi = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var ai = [];
                var tmp = null;
                if(v.length != 15 && v.length != 18){
                    return "请输入15或18位的身份证号码(中国大陆)";
                }
                function getVerify(id){ //獲取末尾示識
                    var remain = 0;
                    var sum = 0;
                    var k = 0;
                    if(id.length == 18){
                        id = id.substring(0, 17);
                    }
                    for(var i = 0; i < 17; i++){
                        k = id.substring(i, i + 1);
                        ai[i] = k * 1;
                    }
                    for(var j = 0; j < 17; j++){
                        sum += wi[j] * ai[j];
                    }
                    remain = sum % 11;
                    return vi[remain];
                }
                if(v.length == 15){ //將15位身份證升級到18位再校驗
                    tmp = v.substring(0, 6);
                    tmp = tmp + "19";
                    tmp = tmp + v.substring(6, 15);
                    tmp = tmp + getVerify(tmp);
                    v = tmp;
                }
                
                var ret = (getVerify(v) == v.substring(17, 18));

                if(!ret){
                    return "请输入有效的身份证号码(中国大陆)";
                }

                return true;
            },
            /**
             * 是否為香港身份證
             * @param String v 需要校驗的值
             * @return Boolean true/false
             */
            hkid : function(data, v, el){
                var wi = {'A':1, 'B':2, 'C':3, 'D':4, 'E':5, 'F':6, 'G':7, 'H':8, 'I':9, 'J':10, 'K':11, 'L':12, 'M':13, 'N':14, 'O':15, 'P':16, 'Q':17, 'R':18, 'S':19, 'T':20, 'U':21, 'V':22, 'W':23, 'X':24, 'Y':25, 'Z':26};
                var tmp = v.substring(0, 7);
                var a = tmp.split("");
                var t = null;
                var sum = 0;
                var verify = 0;
                var vi = v.substring(8, 9) * 1;
                for(var i = 0, j = 8; i < 7; i++, j--)
                {
                    t = wi[a[i]] || a[i];
                    sum += t * j;
                }
                verify = sum % 11 == 0 ? 0 : 11 - sum % 11;

                var ret =  (vi == verify);

                if(!ret){
                    return "请输入有效的身份证号码(中国香港)";
                }

                return true;
            },
            spasswd: function(data, v, el){
                var p = /^[\u0021-\u007E]{6,16}$/;

                return p.test(v);
            },
            npasswd: function(data, v, el){
                var p = /^[0-9]{6,8}$/;

                return p.test(v);
            },
            enchar: function(data, v, el){
                var p = /^[a-zA-Z]+$/i;

                return p.test(v);
            },
            cnchar: function(data, v, el){
                var p = /^[\u4E00-\u9FA5\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F]+$/;

                return p.test(v);
            },
            cn_name: function(data, v, el){
                var p = /^[\u4E00-\u9FA5\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F]{2,5}(?:·[\u4E00-\u9FA5\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F]{1,5})*$/;

                return p.test(v);
            },
            en_name: function(data, v, el){
                var p = /^[a-z]+(?: [a-z]+)*$/i

                return p.test(v);
            },
            ascii: function(data, v, el){
                var p = /^[\u0021-\u007E]+$/;

                return p.test(v);
            },
            mobile: function(data, v, el){
                var p = /^1[0-9]{10}$/;

                return p.test(v);
            },
            tel: function(data, v, el){
                var p = /^([0-9]{1,5}\-?)?([0-9]{5,8})(\-?[0-9]{1,6})?$/;

                return p.test(v)
            },
            email: function(data, v, el){
                var p = /^([a-z0-9_\.\-]+)@([a-z0-9_\-]+)(\.[a-z0-9_\-]+)+$/i
                return p.test(v);
            },
            smscode: function(data, v, el){
                var p = /^[0-9]{4,6}$/i;

                return p.test(v);
            },
            verifycode: function(data, v, el){
                var p = /^[a-z0-9]{4,6}$/i;

                return p.test(v);
            },
            any: function(data, v, el){
                var p = /^[\s ]+$/;

                return !p.test(v);
            }
        }
    };

    var Types = {
        "OK": "ok",
        "MATCH": "match",
        "MIN": "min",
        "MAX": "max",
        "LBOUND": "lbound",
        "UBOUND": "ubound",
        "SAME": "same",
        "CUSTOM": "custom",
        "EMPTY": "empty",
        "FORMAT": "format"
    };

    /**
     * 表單校驗
     * @param String name
     * @param String prefix
     */
    var _Form = function(name, prefix){
        this.name = name;
        this.prefix = prefix || "";
        this.form = $(this.prefix + 'form[name="' + this.name + '"]');
        this.optionsMerge = (
                                this.form[0].hasAttribute("data-options-merge") 
                                    && this.form.attr("data-options-merge")
                            ) ? this.form.attr("data-options-merge") : false;
        this.spv = ("0" !== this.form.attr("data-spv")); //single point verification
        this.checkResults = {
            crs: {
                success: 0,
                failure: 0
            },
            items:{
                //name: {
                //  verified: true/false
                //  message: ""
                //  type: ""
                //  element: null
                //}
            }
        };

        this.handleStack = new HandleStack();
        this.listner = new Listener({
            ontips : null,         //提示信息的回调{Function callback, Array args, Object context}
            onmpv: null,           //多点验证回调{Function callback, Array args, Object context}
            ondone:null,           //校验完成的回调{Function callback, Array args, Object context}
            onbefore : null,       //校验前前的回调{Function callback, Array args, Object context}
            onbeforecheck : null,  //开始前校验的回调{Function callback, Array args, Object context}
            onsubmit : null        //提交时的回调{Function callback, Array args, Object context}
        }, this.handleStack);
        
        this.bindSubmit();
    };
    _Form.prototype = {
        /**
         * 更新form表单实例
         */
        updateForm : function(){
            this.form = $(this.prefix + 'form[name="' + this.name + '"]');
        },
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listner.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listner.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listner.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listner.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listner.clear();
        },
        setCheckResults: function(name, verified, el, message, type){
            var ckey = true === verified ? "success" : "failure";

            this.checkResults["crs"][ckey] += 1;
            this.checkResults["items"][name] = {
                "verified": verified,
                "message": message,
                "type": type,
                "element": el
            };
        },
        getCheckResultItems: function(name){
            if(undefined === name){
                return this.checkResults["items"];
            }

            if(name in this.checkResults["items"]){
                return this.checkResults["items"][name];
            }

            return null;
        },
        getCheckResultCRS: function(type){
            if(undefined === type){
                return this.checkResults["crs"];
            }

            return this.checkResults["crs"][type] || 0;
        },
        resetCheckResults: function(){
            this.checkResults = null;
            this.checkResults = {
                crs: {
                    success: 0,
                    failure: 0
                },
                items:{
                    //name: {
                    //  verified: true/false
                    //  message: ""
                    //  type: ""
                    //  element: null
                    //}
                }
            };
        },
        /**
         * 校驗
         ************************************************************************************
         * <form>
         *   <element data-empty="string"             //为空时的提示内容
         *            data-invalid="string"           //校验不符合规范时的提示内容
         *            data-filter="0|1"               //是否过滤/忽略当前字段 
         *            data-format="string"            //验证类型        
         *            data-encode="0|1"               //是否进行encodeURIComponent编码
         *            data-xss="0|1"                  //是否进行XSS过滤
         *            data-compare="name"             //确认输入比较的元素的name值
         *            data-different="string"         //两次输入比较不一致时的提示内容
         *            data-lbound="number"            //最小限定值
         *            data-ubound="number"            //最大限定值
         *            data-refer="selector"           //当前元素的值为data-refer所指向节点的值，data-refer为目标元素的selector
         *            data-checkfilter="external"     //用户自定义校验方法的名称，如：CheckFilter://Internal/CNID, CheckFilter://Internal/HKID
         *            data-placeholder="string"       //自定义placeholder的值
         *            data-required="0|1"             //是否为必须项
         *            required                        //必填项，与data-required二选一
         *            data-pattern="regexp"           //正则表达式
         *            pattern="regexp"                //正则表达式，与data-pattern二选一
         *            data-use="value"                //真实值，优先级超过value属性
         *            data-min=number                 //最小值
         *            min                             //最小值
         *            data-max                        //最大值
         *            max                             //最大值
         *            data-nullvalue=""               //除了""之外的空值
         * />               
         * </form> 
         * </script>        
         */
        doCheck : function(){
            var f = this.form;
            var spv = this.spv;
            var els = f.prop("elements");
            var size = els.length;
            var el = null;
            var tagName = null;
            var name = null;
            var group = null;
            var type = null;
            var value = null;
            var useValue = null;
            var defaultValue = null;
            var nullvalue = null;
            var length = 0;
            var pattern = null;            
            var empty = null;
            var invalid = null;
            var different = null;
            var custom_tips = null;
            var filter = false;
            var format = null;
            var encoder = false;
            var xss = true;
            var compare = null;
            var lbound = 0;
            var ubound = 0;
            var min = undefined;
            var max = undefined;
            var lboundTips = null;
            var uboundTips = null;
            var minTips = null;
            var maxTips = null;
            var refer = null;
            var checkfilter = null;
            var holder = null;
            var use = null;
            var data = {};
            var options = {};
            var settings = {};
            
            this.resetCheckResults();

            for(var i = 0; i < size; i++){
                el = $(els[i]);
                name = el.attr("name");
                tagName = (els[i].tagName).toLowerCase();
                type = (el.attr("type")||"").toLowerCase();

                if("textarea" == tagName || "select" == tagName){
                    type = tagName;
                }
                
                if(!name){ continue; }

                group = (el.attr("data-group") || name);

                use = el.attr("data-use");
                useValue = ((use && el[0].hasAttribute("data-" + use)) ? el.attr("data-" + use) : undefined);
                value = StringUtil.trim(undefined !== useValue ? useValue : el.val());
                defaultValue = el[0].hasAttribute("data-default") ? el.attr("data-default") : undefined;
                nullvalue = el.attr("data-nullvalue") || "";
                filter = (el.prop("disabled") || ("1" == el.attr("data-filter")));
                holder = (el.attr("placeholder") || el.attr("data-placeholder") || "");

                length = StringUtil.length(value);
                required = (el.prop("required") || ("1" == el.attr("data-required")));
                pattern = (el.attr("pattern") || el.attr("data-pattern"));
                empty = el.attr("data-empty") || "";
                format = el.attr("data-format") || null;
                invalid = el.attr("data-invalid") || "";
                different = el.attr("data-different") || "";
                encode = ("1" == el.attr("data-encode"));
                xss = ("1" == el.attr("data-xss"));
                lbound = Number(el.attr("data-lbound") || 0);
                ubound = Number(el.attr("data-ubound") || 0);
                min = Number(el.attr("min") || el.attr("data-min") || undefined);
                max = Number(el.attr("max") || el.attr("data-max") || undefined);
                lboundTips = el.attr("data-lboundtips") || "";
                uboundTips = el.attr("data-uboundtips") || "";
                minTips = el.attr("data-mintips") || "";
                maxTips = el.attr("data-maxtips") || "";
                compare = el.attr("data-compare");
                refer = el.attr("data-refer");
                checkfilter = el.attr("data-checkfilter"); 

                settings[name] = {
                    "form": f[0],
                    "node": el[0],
                    "name": name,
                    "group": group,
                    "tagName": tagName,
                    "type": type,
                    "value": value,
                    "defaultValue": defaultValue,
                    "use": use,
                    "userValue": useValue,
                    "filter": filter,
                    "format": format,
                    "holder": holder,
                    "length": length,
                    "required": required,
                    "pattern": pattern,
                    "encode": encode,
                    "xss": xss,
                    "lbound": lbound,
                    "ubound": ubound,
                    "min": min,
                    "max": max,
                    "lboundTips": lboundTips,
                    "uboundTips": uboundTips,
                    "minTips": minTips,
                    "maxTips": maxTips,
                    "compare": compare,
                    "refer": refer,
                    "checkfilter": checkfilter,
                    "tips": {
                        "empty": empty,
                        "invalid": invalid,
                        "different": different
                    }
                }; 

                if(true === filter){ continue; }

                if("checkbox" == type || "radio" == type){
                    if(!(name in options)){
                        options[name] = [];
                    }
                    
                    if(true !== el[0].checked){
                        continue;
                    }
                }

                if(holder && holder == value){
                    value = "";
                }

                if(nullvalue == value){
                    value = "";
                }

                if(value == "" && undefined !== defaultValue){
                    value = defaultValue;
                } 

                if(required && value == ""){
                    if(spv){
                        this.exec("tips", [el, empty, Types["EMPTY"]]);
                        return null;
                    }else{
                        this.setCheckResults(name, false, el, empty, Types["EMPTY"]);
                        continue;
                    }
                }
                
                if(value != "" && pattern){
                    var regExp = new RegExp(pattern);

                    if(!regExp.test(value)){
                        if(spv){
                            this.exec("tips", [el, invalid, Types["MATCH"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, invalid, Types["MATCH"]);
                            continue;
                        }
                    }

                    pattern = null; regExp = null;
                }

                if(value != "" && checkfilter){
                    var ret = Util.requestExternal(checkfilter, [value, el]);

                    custom_tips = ret.result;

                    if(true !== custom_tips){ // body
                        if(spv){
                            this.exec("tips", [el, custom_tips || invalid || empty, Types["CUSTOM"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, custom_tips || invalid || empty, Types["CUSTOM"]);
                            continue;
                        }
                    }
                }

                if(value != "" && format && (format in $.CheckFilter.Internal)){
                    var ret = $.CheckFilter.Internal[format].apply(null, [null, value, el]);

                    if(true !== ret){
                        if(spv){
                            this.exec("tips", [el, ret || invalid || empty, Types["FORMAT"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, ret || invalid || empty, Types["FORMAT"]);
                            continue;
                        }
                    }
                }
                
                if(compare){
                    use = $(els[compare]).attr("data-use");
                    useValue = ((use && els[compare].hasAttribute("data-" + use)) ? $(els[compare]).attr("data-" + use) : undefined);
                    var compareValue = StringUtil.trim(undefined !== useValue ? useValue : els[compare].value);
                    
                    if(value != compareValue){
                        if(spv){
                            this.exec("tips", [el, different, Types["SAME"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, different, Types["SAME"]);
                            continue;
                        }
                    }
                }

                if(lbound > 0 || ubound > 0){
                    if(lbound > 0 && length < lbound){
                        if(spv){
                            this.exec("tips", [el, lboundTips || invalid, Types["LBOUND"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, lboundTips || invalid, Types["LBOUND"]);
                            continue;
                        }
                    }

                    if(ubound > 0 && length > ubound){
                        if(spv){
                            this.exec("tips", [el, uboundTips || invalid, Types["UBOUND"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, uboundTips || invalid, Types["UBOUND"]);
                            continue;
                        }
                    }
                }

                if(!isNaN(value)){
                    if(!isNaN(min) && Number(value) < min){
                        if(spv){
                            this.exec("tips", [el, minTips || invalid, Types["MIN"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, minTips || invalid, Types["MIN"]);
                            continue;
                        }
                    }

                    if(!isNaN(max) && Number(value) > max){
                        if(spv){
                            this.exec("tips", [el, maxTips || invalid, Types["MAX"]]);
                            return null;
                        }else{
                            this.setCheckResults(name, false, el, maxTips || invalid, Types["MAX"]);
                            continue;
                        }
                    }
                }
                
                if(xss){
                    value = Request.filterScript(value);
                }
                if(encode){
                    value = encodeURIComponent(value);
                }

                if("checkbox" == type || "radio" == type){
                    options[name].push(value);
                }else{
                    this.setCheckResults(name, true, el, "", Types["OK"]);
                }

                data[name] = value;

                if(refer && (el = $(refer)).length > 0){
                    data[name] = StringUtil.trim(el.val());
                }
            }//end check for
            
            var mergeData = (function(m, d, o){
                for(var name in o){
                    if(o.hasOwnProperty(name)){
                        if(m){
                            d[name] = o[name].join(m);
                        }else{
                            d[name] = o[name];
                        }

                        if(undefined !== defaultValue && !d[name]){
                            d[name] = defaultValue;
                        }
                    }
                }

                return d;
            })(this.optionsMerge, data, options);

            var setting = null;

            for(var key in settings){
                setting = settings[key];

                if("radio" == setting.type && setting.required){
                    if(!data[setting.name]){
                        if(spv){
                            this.exec("tips", [$(setting.node), setting.tips.empty, Types["EMPTY"]]);
                            return null;
                        }else{
                            this.setCheckResults(setting.name, false, $(setting.node), setting.tips.empty, Types["EMPTY"]);
                            continue;
                        }
                    }else{
                        this.setCheckResults(setting.name, true, $(setting.node), "", Types["OK"]);
                    }
                }

                if("checkbox" == setting.type && setting.required){
                    var group = f.find('[data-group="' + setting.group + '"]');
                    var flag = 0;
                    var item = null;

                    for(var i = 0; i < group.length; i++){
                        item = group[i];

                        if(item.checked){
                            flag = 1;
                            break;
                        }
                    }

                    if(0 === flag){
                        if(spv){
                            this.exec("tips", [$(setting.node), setting.tips.empty, Types["EMPTY"]]);
                            return null;
                        }else{
                            this.setCheckResults(setting.name, false, $(setting.node), setting.tips.empty, Types["EMPTY"]);
                            continue;
                        }
                    }else{
                        this.setCheckResults(setting.name, true, $(setting.node), "", Types["OK"]);
                    }
                }
            }

            var ___a = {
                "form": f[0],
                "action": f.attr("action"),
                "method": f.attr("method"),
                "data": data,
                "options": options,
                "merge": mergeData,
                "settings": settings,
                "spv": spv,
                "crs": this.getCheckResultCRS(),
                "cri": this.getCheckResultItems()
            };

            if(!spv){
                if(this.getCheckResultCRS("failure") > 0){
                    this.exec("mpv", [___a]);
                    return ;
                }
            }

            this.exec("done", [___a]);

            return true;
        },
        /**
         * 校驗
         */
        check : function(){
            var chk = this.get("beforecheck");
            
            this.exec("before", [this.form, this.spv]);
            
            if((null == chk) ||                                                     //没有设置beforecheck
               (null != chk && true !== chk.returnValue) ||                         //没有设置returnValue属性或returnValue属性不为true
               (null != chk && this.exe("beforecheck", [this.form, this.spv]))      //有设置beforecheck并且条件为真
            ){
                this.doCheck();
            }
        },
        /**
         * 提交表单处理句柄
         * @param Event e
         */
        submitHandler : function(e){
            var ins = e.data;
            
            if(ins && ins.exec){
                ins.exec("submit", [e]);
            }

            ins = null;
        },
        /**
         * 绑定表单的submit事件
         */
        bindSubmit : function(){
            var form = this.form;
            if(form.length > 0){
                form.attr("data-form", this.name);
                form.on("submit", "", this, this.submitHandler);
            }
        } 
    };

    var _Cache = {};

    module.exports = {
        "version": "R16B0516",
        "CheckTypes": Types,
        "getInstance" : function(name, prefix){
            var ins = (_Cache[name] || new _Form(name, prefix)); 
            
            ins.updateForm();

            var cfg = {
                "name" : ins.name,
                "prefix" : ins.prefix,
                "form" : ins.form,
                //-----------------------------------------------------------------
                "set" : function(type, option){ins.set(type, option);},
                "remove" : function(type){ins.remove(type);},
                "get" : function(type){return ins.get(type);},
                "exec" : function(type, args){return ins.exec(type, args);},
                "clear" : function(){ins.clear();},
                "check" : function(){ins.check();},
                "getHandleStack": function(){return ins.handleStack;}
            };

            _Cache[name] = ins;

            return cfg;
        },
        "injectCheckFilter": function(filter){
            $.extend(true, $.CheckFilter, filter);

            return this;
        },
        "register": function(type, callback){
            $.CheckFilter.Internal[type] = callback;

            return this;
        },
        "match": function(type, value, el){
            var matcher = $.CheckFilter.Internal;
            var ret = false;

            if(type in matcher){
                ret = matcher[type].apply(null, [null, (value || ""), el]);
            }

            return ret;
        }
    };
});