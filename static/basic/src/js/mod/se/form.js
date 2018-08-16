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
    var Listener        = require("mod/se/listener");
    var StringUtil      = require("mod/se/stringutil");
    var Request         = require("mod/se/request");
    var Util            = require("mod/se/util");
    var DateUtil        = require("mod/se/dateutil");
    var DataType        = require("mod/se/datatype");
    var Timer           = require("mod/se/timer");
    var Storage         = require("mod/se/storage");
    var Cookie          = require("mod/se/cookie");
    var OPaths          = require("mod/se/opaths");
    var HandleStack     = Listener.HandleStack;
    var Persistent      = Storage.Persistent;
    var Session         = Storage.Session;

    var RealTimeCheckTimerPool = {
        timers: {},
        put: function(name, timerId){
            this.timers[name] = timerId;
        },
        get: function(name){
            return this.timers[name] || null;
        },
        clear: function(name){
            var t = null;
            if(name){
                t = this.get(name);

                if(t){
                    clearTimeout(t);
                    RealTimeCheckTimerPool.timers[t] = null;

                    delete RealTimeCheckTimerPool.timers[t];
                }
            }else{
                for(var key in RealTimeCheckTimerPool.timers){
                    if(RealTimeCheckTimerPool.timers.hasOwnProperty(key)){
                        this.clear(key);
                    }
                }
            }
        }
    };

    /**
     * 定义伪协议
     */
    var DataFormSchema = {
        "schema": "dataform",
        match: function(data, node, e, type){
            var args = (data || "").split(",");
            var inputName = args[0];
            var delay = Number(args[1]);

            var dataForm = node.parents("form");
            var formName = dataForm.attr("name");
            
            var external = node.attr("data-realtime-external");

            if(isNaN(delay)){
                delay = 800;
            }

            RealTimeCheckTimerPool.clear(inputName);
            RealTimeCheckTimerPool.put(inputName, setTimeout(function(){
                if(external){
                    Util.requestExternal(external, [formName, dataForm, inputName]);
                }else{
                    var checker = _Form.createDataForm(formName);

                    checker.check(false, inputName.split("|"));
                }
            }, delay));
            
        }
     };

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
                    return false;
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
                    return false;
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
                    return false;
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
            url: function(data, v, el){
                var urlInfo = Request.parseURL(v, false);

                return !!urlInfo.url;
            },
            datetime: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%y-%M-%d %h:%m:%s";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            shortdatetime: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%y-%M-%d %h:%m";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            date: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%y-%M-%d";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            shortdate: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%y-%M";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            shortdate2: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%M-%d";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            time: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%h:%m:%s";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            shorttime: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%h:%m";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
            },
            shorttime2: function(data, v, el){
                var fmt = el.attr("data-dtpicker-format") || "%m:%s";
                var check = DateUtil.parse(v, fmt);

                return check.ok;
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

    /**
     * 返回类型
     * @type {Object}
     */
    var Types = {
        "OK": "ok",
        "MATCH": "match",
        "MIN": "min",
        "MAX": "max",
        "LBOUND": "lbound",
        "UBOUND": "ubound",
        "SAME": "same",
        "DIFFERENT": "different",
        "EMPTY": "empty",
        "FORMAT": "format"
    };

    /**
     * 表單校驗
     * @param String name
     */
    var _Form = function(name){
        this.name = name;
        this.selector = 'form[name="' + this.name + '"]';
        this.isInit = false;

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
    };
    _Form.prototype = {
        init: function(){
            this.updateForm();

            if(this.isInit && this.form.length > 0){
                return ;
            }

            this.form = $(this.selector);
            this.optionsMerge = (
                                    this.form[0].hasAttribute("data-options-merge") 
                                        && this.form.attr("data-options-merge")
                                ) ? this.form.attr("data-options-merge") : false;
            this.spv = ("0" !== this.form.attr("data-spv")); //single point verification

            this.bindSubmit();
        },
        /**
         * 更新form表单实例
         */
        updateForm : function(){
            this.form = $(this.selector);
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
        getStorageValue: function(type, conf){
            var items = conf.split("@");
            var key = items[0];
            var path = items[1];

            var storage = (2 === type ? Cookie : (1 === type ? Persistent : Session));
            var value = storage.get(key) || "";

            if(!path){
                return value;
            }

            if(!value){
                return value;
            }
            
            if(DataType.isObject(value)){
                value = OPaths.find(value, path);
            }

            return value
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
         *            data-comparetype="0|1"          //比较类型，1:两个值需要一致，0:两个值不能一样
         *            data-different="string"         //两次输入比较不一致时的提示内容
         *            data-same="string"              //两次输入比较一样时的提示内容，data-comparetype="0"时触发
         *            data-lbound="number"            //最小限定值
         *            data-ubound="number"            //最大限定值
         *            data-refer="selector"           //当前元素的值为data-refer所指向节点的值，data-refer为目标元素的selector
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
         *            data-trimspaces="0|1"           //首尾去空
         *            data-clearspaces="0|1"          //清除所有空格
         *            data-uncheck="string"           //未选择时的值
         *            data-use-session="key@path"     //从sessionStorage中取值
         *            data-use-persistent="key@path"  //从localStorage中取值
         *            data-use-cookie="key@path"      //从cookie中取值
         * />               
         * </form> 
         * </script>        
         */
        doCheck : function(execCheckDone, specifiedCheckItems){
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
            var uncheckValue = null;
            var useSession = null;
            var usePersistent = null;
            var useCookie = null;
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
            var trimSpaces = true;
            var clearSpaces = false;
            var compare = null;
            var compareType = 1;
            var same = null;
            var lbound = 0;
            var ubound = 0;
            var min = undefined;
            var max = undefined;
            var lboundTips = null;
            var uboundTips = null;
            var minTips = null;
            var maxTips = null;
            var refer = null;
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

                if(specifiedCheckItems.length > 0){
                    var tmp = specifiedCheckItems.join("|");
                    var tp = new RegExp("^(" + tmp + ")$");

                    tp.lastIndex = 0;
                    if(!tp.test(name)){
                        tp = null;
                        continue;
                    }

                    tp = null;
                }

                trimSpaces = ("1" == (el.attr("data-trimspaces") || "1"));
                clearSpaces = ("1" == el.attr("data-clearspaces"));

                group = (el.attr("data-group") || name);

                use = el.attr("data-use");
                useValue = ((use && el[0].hasAttribute("data-" + use)) ? el.attr("data-" + use) : undefined);
                value = StringUtil.trim(undefined !== useValue ? useValue : el.val());

                useSession = el.attr("data-use-session");
                usePersistent = el.attr("data-use-persistent");
                useCookie = el.attr("data-use-cookie");

                if(useSession){
                    value = this.getStorageValue(0, useSession);
                }

                if(usePersistent){
                    value = this.getStorageValue(1, usePersistent);
                }

                if(useCookie){
                    value = this.getStorageValue(2, useCookie);
                }

                
                if(true === trimSpaces){
                    value = StringUtil.trim(value);
                }

                if(true === clearSpaces){
                    var clearSpacesPattern = /[\s]+/g;
                    clearSpacesPattern.lastIndex = 0;
                    
                    value = value.replace(clearSpacesPattern, "");
                }

                el.val(value);

                defaultValue = el[0].hasAttribute("data-default") ? el.attr("data-default") : undefined;

                nullvalue = el.attr("data-nullvalue") || "";
                uncheckValue = StringUtil.trim(el.attr("data-uncheck") || "");
                filter = (el.prop("disabled") || ("1" == el.attr("data-filter")));
                holder = (el.attr("placeholder") || el.attr("data-placeholder") || "");

                length = StringUtil.length(value);
                required = (el.prop("required") || ("1" == el.attr("data-required")));
                pattern = (el.attr("pattern") || el.attr("data-pattern"));
                empty = el.attr("data-empty") || "";
                format = el.attr("data-format") || null;
                invalid = el.attr("data-invalid") || "";
                different = el.attr("data-different") || "";
                same = el.attr("data-same") || "";
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
                compareType = Number(el.attr("data-comparetype") || 1);
                refer = el.attr("data-refer");

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
                    "uncheckValue": uncheckValue,
                    "useSession": useSession,
                    "usePersistent": usePersistent,
                    "useCookie": useCookie,
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
                    "compare": compare,
                    "compareType": compareType,
                    "refer": refer,
                    "tips": {
                        "empty": empty,
                        "invalid": invalid,
                        "different": different,
                        "same": same,
                        "lboundTips": lboundTips,
                        "uboundTips": uboundTips,
                        "minTips": minTips,
                        "maxTips": maxTips
                    }
                }; 

                if(true === filter){ continue; }

                if("checkbox" == type || "radio" == type){
                    if(!(name in options)){
                        options[name] = [];
                    }
                    
                    if(true !== el[0].checked){
                        options[name].push(uncheckValue);
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
                        return false;
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
                            return false;
                        }else{
                            this.setCheckResults(name, false, el, invalid, Types["MATCH"]);
                            continue;
                        }
                    }

                    pattern = null; regExp = null;
                }

                if(value != "" && format && (format in $.CheckFilter.Internal)){
                    var ret = $.CheckFilter.Internal[format].apply(null, [null, value, el]);

                    if(true !== ret){
                        if(spv){
                            this.exec("tips", [el, invalid || empty, Types["FORMAT"]]);
                            return false;
                        }else{
                            this.setCheckResults(name, false, el, invalid || empty, Types["FORMAT"]);
                            continue;
                        }
                    }
                }
                
                if(compare){
                    use = $(els[compare]).attr("data-use");
                    useValue = ((use && els[compare].hasAttribute("data-" + use)) ? $(els[compare]).attr("data-" + use) : undefined);
                    var compareValue = StringUtil.trim(undefined !== useValue ? useValue : els[compare].value);
                    
                    if(0 !== compareType){
                        if(value != compareValue){
                            if(spv){
                                this.exec("tips", [el, different || invalid, Types["DIFFERENT"]]);
                                return false;
                            }else{
                                this.setCheckResults(name, false, el, different || invalid, Types["DIFFERENT"]);
                                continue;
                            }
                        }
                    }else{
                        if(value == compareValue){
                            if(spv){
                                this.exec("tips", [el, same || invalid,, Types["SAME"]]);
                                return false;
                            }else{
                                this.setCheckResults(name, false, el, same || invalid, Types["SAME"]);
                                continue;
                            }
                        }
                    }
                }

                if(lbound > 0 || ubound > 0){
                    if(lbound > 0 && length < lbound){
                        if(spv){
                            this.exec("tips", [el, lboundTips || invalid, Types["LBOUND"]]);
                            return false;
                        }else{
                            this.setCheckResults(name, false, el, lboundTips || invalid, Types["LBOUND"]);
                            continue;
                        }
                    }

                    if(ubound > 0 && length > ubound){
                        if(spv){
                            this.exec("tips", [el, uboundTips || invalid, Types["UBOUND"]]);
                            return false;
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
                            return false;
                        }else{
                            this.setCheckResults(name, false, el, minTips || invalid, Types["MIN"]);
                            continue;
                        }
                    }

                    if(!isNaN(max) && Number(value) > max){
                        if(spv){
                            this.exec("tips", [el, maxTips || invalid, Types["MAX"]]);
                            return false;
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
                            return false;
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
                            return false;
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
                "cri": this.getCheckResultItems(),
                "onlyCheck": (false === execCheckDone)
            };

            if(!spv){
                if(this.getCheckResultCRS("failure") > 0){
                    this.exec("mpv", [___a]);
                    return false;
                }
            }

            this.exec("done", [___a]);

            return true;
        },
        /**
         * 校驗
         */
        check : function(execCheckDone, specifiedCheckItems){
            this.init();

            var chk = this.get("beforecheck");
            var beforeCheckResult = true;
            
            this.exec("before", [this.form, this.spv]);
            
            if((null == chk) ||                                                     //没有设置beforecheck
               (null != chk && true !== chk.returnValue) ||                         //没有设置returnValue属性或returnValue属性不为true
               (null != chk && (beforeCheckResult = this.exec("beforecheck", [this.form, this.spv])))      //有设置beforecheck并且条件为真
            ){
               return this.doCheck(false !== execCheckDone, specifiedCheckItems || []);
            }

            return !!beforeCheckResult;
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

    _Form.Cache = {};

    _Form.createDataForm = function(name){
        var ins = _Form.Cache[name] || (_Form.Cache[name] = new _Form(name));

        ins.init();

        var _pub = {
            "name" : ins.name,
            "form" : ins.form,
            //-----------------------------------------------------------------
            "set" : function(type, option){
                ins.set(type, option);
            },
            "remove" : function(type){
                ins.remove(type);
            },
            "get" : function(type){
                return ins.get(type);
            },
            "exec" : function(type, args){
                return ins.exec(type, args);
            },
            "clear" : function(){
                ins.clear();
            },
            "check" : function(execCheckDone, specifiedCheckItems){
                return ins.check(execCheckDone, specifiedCheckItems || []);
            },
            "getHandleStack": function(){
                return ins.handleStack;
            }
        };

        return _pub;
    };

    (function(){
        Util.source(DataFormSchema);
    })()

    module.exports = {
        "version": "R18B0807",
        "CheckTypes": Types,
        "RTCheckTimers": RealTimeCheckTimerPool,
        "watchTimer": Timer.getTimer("rt_bind_timer", Timer.toFPS(5000), null),
        "getInstance" : function(name){
            return _Form.createDataForm(name);
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
        },
        /**
         * 绑定实时检测
         * @return {[type]} [description]
         */
        "rt": function(delay, watch){
            var find = function(_delay){
                var items = $('[data-realtime="1"]');
                var size = items.length;
                var item = null;
                var name = null;

                _delay = Number(_delay);

                if(isNaN(_delay)){
                    _delay = 800;
                }

                for(var i = 0; i < size; i++){
                    item = $(items[i]);

                    name = item.attr("name");

                    if(!name){
                        continue;
                    }

                    item.attr("data-action-input", "dataform://match#" + name + "," + _delay)
                        .removeAttr("data-realtime");
                }
            };

            find(delay);

            watch = watch || {};
            if(true === watch.open){
                if("interval" in watch){
                    this.watchTimer.setTimerFPS(watch.interval || 5000);
                }

                this.watchTimer.setTimerHandler({
                    callback: function(_timer, _callback, _delay){
                        _callback.apply(null, [_delay]);
                    },
                    args: [find, delay]
                });
            }

            return this;
        }
    };
});