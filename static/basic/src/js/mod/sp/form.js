/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 表单提交封装
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.builder
 * @date 2016.09
 */
;define(function (require, exports, module){
    var FormUtil            = require("mod/se/form");
    var Request             = require("mod/se/request");
    var CountDown           = require("mod/se/countdown");
    var DateUtil            = require("mod/se/dateutil");
    var MD5                 = require("mod/crypto/md5");
    var CMD                 = require("mod/se/cmd");
    var DataProxy           = require("mod/se/dataproxy");
    var Util                = require("mod/se/util");

    var CheckTypes      = FormUtil.CheckTypes;
    var ErrorTypes      = CMD.ErrorTypes;
    var RespTypes       = CMD.ResponseTypes;
    var ResponseProxy   = DataProxy.ResponseProxy;
    var DataCache       = DataProxy.DataCache;

    var SECRET_SEED = null;

    var GetDefaultSecretSeed = function(){
        var DEFAULT_SECRET_DIGITS = [2, -50, 5, 2, 11, 1, 19, 5, 6, 11, 1, 2, 6, 11, 2, 19, 5, 11, 6, -48, 4, -49, 11, 0, 15, 2, 15, 0];
        var DEFAULT_SECRET_SEED = (function(digits, diff){
            var size = digits.length;

            var t2 = [];
            for(var j = 0; j < size; j++){
                t2.push(String.fromCharCode(digits[j]  + diff));
            }
            return t2.join("");
        })(DEFAULT_SECRET_DIGITS, 1E2);

        return DEFAULT_SECRET_SEED;
    };

    var SetSecretSeed = function(seed){
        SECRET_SEED = seed;
    };

    var GetSecretSeed = function(){
        return SECRET_SEED;
    };

    var GetSecretData = function(dataKey){
        var SECRET_SEED = GetSecretSeed();

        var SECRET = "" 
                   + Util.getTime()
                   + Util.GUID();

        var SECRET_KEY =  MD5.encode(SECRET + SECRET_SEED, false);

        var __A = {
            secret: SECRET,
            seckey: SECRET_KEY
        };

        if(dataKey && (dataKey in __A)){
            return __A[dataKey];
        }else{
            return __A;
        }
    };

    var FormSchema = {
        "schema": "form",
        submit: function(data, node, e, type){
            e.preventDefault();

            var args = (data || "").split(",");
            var formType = args[0];
            var formName = args[1];
            var submitType = args[2];

            var sourceData = {
                "data": data,
                "node": node,
                "event": e,
                "type": type
            };

            _DataForm.bind(formType, formName, submitType, sourceData, Array.prototype.slice.call(arguments, 4));
        },
        mcode: function(data, node, e, type){
            e.preventDefault();

            var args = data.split(",");
            var mobileInputID = args[0];
            var label = args[1];
            var time = Number(args[2] || 60);
            var cls = args[3] || "disabled";
            var flag = node.attr("data-auth-flag") == "1";

            var mainKey = "mcode";
            var mcodeKey = node.attr("data-mcode-key");

            var form = node.parents("form");

            var mobileInput = form.find("#" + mobileInputID);
            var mobile = mobileInput.val() || "";

            if(flag){
                return ;
            }

            if(mobileInput.length == 0 || !FormUtil.match("mobile", mobile, mobileInput)){
                CMD.fireError("0x100102", "请输入有效的手机号码", ErrorTypes.INFO);

                return ;
            }

            if(mcodeKey){
                mainKey += "." + mcodeKey;
            }

            var param = {
                "mobile": mobile,
                "secret": GetSecretData("secret"),
                "seckey": GetSecretData("seckey")
            };

            var formConfig = GetFormConfigure(mainKey);

            if(!formConfig.request){
                throw new Error("Form configuration \"request\" attribute is missing.");
            }

            var extra = Array.prototype.slice.call(arguments, 4);
            var sourceData = {
                "data": data,
                "node": node,
                "event": e,
                "type": type
            };

            CMD.exec(formConfig.request.name, param, {
                context: {
                    // "showLoading": true,
                    // "loadingText": "正在获取短信验证码",
                    "showLoading": formConfig.loading.show,
                    "loadingText": formConfig.loading.text,
                    "mobile": mobile,
                    "time": time,
                    "cls": cls,
                    "mcode": mainKey,
                    "source": sourceData,
                    "extra": extra
                },
                success: function(data, status, xhr){
                    var formConfig = GetFormConfigure(this.mcode);
                    var proxy = formConfig.proxy || {};

                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            CMD.fireError("0x100103", msg || "验证码已发送，请注意查收", ErrorTypes.INFO);

                            var cd = CountDown.getCountDown("mcode_" + mobileInputID + "." + ctx.mcode, CountDown.toFPS(1000), {
                                callback: function(ret, _node, _label, _time){
                                    if(ret.stop){
                                        _node.removeClass("auth-disable").removeClass(ctx.cls);
                                        _node.html(_label);
                                        _node.attr("data-auth-flag", "0");
                                    }else{
                                        _node.addClass("auth-disable").addClass(ctx.cls);
                                        _node.html(_label + "(" + Math.floor(ret.value) + ")");
                                        _node.attr("data-auth-flag", "1");
                                    }
                                },
                                args: [node, label, time]
                            });
                            var curDate = new Date();
                            var cur = DateUtil.format(curDate, "%y-%M-%d %h:%m:%s");
                            var target = DateUtil.dateAdd("s", DateUtil.parse(cur, "%y-%M-%d %h:%m:%s").date, ctx.time);

                            cd.start(target, curDate, "s");
                        }
                    }, proxy.exception, proxy.conf);
                }
            })
        },
        verify: function(data, node, e, type){
            e.preventDefault();

            var args = data.split(",");
            var verifyType = args[0];
            var label = args[1];
            var time = Number(args[2] || 60);
            var cls = args[3] || "disabled";
            var flag = node.attr("data-auth-flag") == "1";

            var mainKey = "verify";
            var verifyKey = node.attr("data-verify-key");

            if(flag){
                return ;
            }

            if(verifyKey){
                mainKey += "." + verifyKey;
            }

            var param = {
                "secret": GetSecretData("secret"),
                "seckey": GetSecretData("seckey")
            };

            var formConfig = GetFormConfigure(mainKey);

            if(!formConfig.request){
                throw new Error("Form configuration \"request\" attribute is missing.");
            }

            var extra = Array.prototype.slice.call(arguments, 4);
            var sourceData = {
                "data": data,
                "node": node,
                "event": e,
                "type": type
            };

            CMD.exec(formConfig.request.name, param, {
                context: {
                    // "showLoading": true,
                    // "loadingText": "正在获取短信验证码",
                    "showLoading": formConfig.loading.show,
                    "loadingText": formConfig.loading.text,
                    "verifyType": verifyType,
                    "time": time,
                    "verify": mainKey,
                    "cls": cls,
                    "source": sourceData,
                    "extra": extra
                },
                success: function(data, status, xhr){
                    var formConfig = GetFormConfigure(this.verify);
                    var proxy = formConfig.proxy || {};

                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            CMD.fireError("0x100103", msg || "验证码已发送，请注意查收", ErrorTypes.INFO);

                            var cd = CountDown.getCountDown("verify_" + ctx.verifyType + "." + ctx.verify, CountDown.toFPS(1000), {
                                callback: function(ret, _node, _label, _time){
                                    if(ret.stop){
                                        _node.removeClass("auth-disable").removeClass(ctx.cls);
                                        _node.html(_label);
                                        _node.attr("data-auth-flag", "0");
                                    }else{
                                        _node.addClass("auth-disable").addClass(ctx.cls);
                                        _node.html(_label + "(" + Math.floor(ret.value) + ")");
                                        _node.attr("data-auth-flag", "1");
                                    }
                                },
                                args: [node, label, time]
                            });
                            var curDate = new Date();
                            var cur = DateUtil.format(curDate, "%y-%M-%d %h:%m:%s");
                            var target = DateUtil.dateAdd("s", DateUtil.parse(cur, "%y-%M-%d %h:%m:%s").date, ctx.time);

                            cd.start(target, curDate, "s");
                        }
                    }, proxy.exception, proxy.conf);
                }
            })
        },
        checkaccount: function(data, node, e, type){
            e.preventDefault();

            var args = data.split(",");
            var mobileInputID = args[0];
            var label = args[1];
            var time = Number(args[2] || 60);
            var cls = args[3] || "disabled";
            var flag = node.attr("data-auth-flag") == "1";

            var mainKey = "checkaccount";
            var checkAccountKey = node.attr("data-checkaccount-key");

            var form = node.parents("form");

            var mobileInput = form.find("#" + mobileInputID);
            var mobile = mobileInput.val() || "";

            if(flag){
                return ;
            }

            if(mobileInput.length == 0 || !FormUtil.match("mobile", mobile, mobileInput)){
                CMD.fireError("0x100102", "请输入有效的手机号码", ErrorTypes.INFO);

                return ;
            }

            if(checkAccountKey){
                mainKey += "." + checkAccountKey;
            }

            var param = {
                "mobile": mobile,
                "secret": GetSecretData("secret"),
                "seckey": GetSecretData("seckey")
            };

            var formConfig = GetFormConfigure(mainKey);

            if(!formConfig.request){
                throw new Error("Form configuration \"request\" attribute is missing.");
            }

            var extra = Array.prototype.slice.call(arguments, 4);
            var sourceData = {
                "data": data,
                "node": node,
                "event": e,
                "type": type
            };

            CMD.exec(formConfig.request.name, param, {
                context: {
                    // "showLoading": true,
                    // "loadingText": "正在校验账号和发送验证码",
                    "showLoading": formConfig.loading.show,
                    "loadingText": formConfig.loading.text,
                    "mobile": mobile,
                    "time": time,
                    "checkaccount": mainKey,
                    "cls": cls,
                    "source": sourceData,
                    "extra": extra
                },
                success: function(data, status, xhr){
                    var formConfig = GetFormConfigure(this.checkaccount);
                    var proxy = formConfig.proxy || {};

                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            CMD.fireError("0x100104", msg || "账号校验通过，请注意查收短信验证码", ErrorTypes.INFO);

                            var cd = CountDown.getCountDown("checkaccount_" + mobileInputID + "." + ctx.checkaccount, CountDown.toFPS(1000), {
                                callback: function(ret, _node, _label, _time){
                                    if(ret.stop){
                                        _node.removeClass("auth-disable").removeClass(ctx.cls);
                                        _node.html(_label);
                                        _node.attr("data-auth-flag", "0");
                                    }else{
                                        _node.addClass("auth-disable").addClass(ctx.cls);
                                        _node.html(_label + "(" + Math.floor(ret.value) + ")");
                                        _node.attr("data-auth-flag", "1");
                                    }
                                },
                                args: [node, label, time]
                            });
                            var curDate = new Date();
                            var cur = DateUtil.format(curDate, "%y-%M-%d %h:%m:%s");
                            var target = DateUtil.dateAdd("s", DateUtil.parse(cur, "%y-%M-%d %h:%m:%s").date, ctx.time);

                            cd.start(target, curDate, "s");
                        }
                    }, proxy.exception, proxy.conf);
                }
            })
        }
    };

    var _DataForm = {
        bind: function(formType, formName, submitType, sourceData, extra){
            var checker = FormUtil.getInstance(formName);
            var fc = GetFormConfigure(formType);
            var check = fc.check;

            checker.set("before", check.before);
            checker.set("tips", {
                callback: function(el, tips, type){
                    CMD.fireError("0x900000", tips, ErrorTypes.INFO);
                }
            });
            checker.set("submit", {
                callback: function(submitEvent, target, checkEvent){
                    submitEvent.preventDefault();
                    submitEvent.stopPropagation();


                    Util.fireAction(target, checkEvent.data, checkEvent);
                },
                args: [sourceData.node, sourceData.event]
            });
            checker.set("mpv", check.mpv);
            checker.set("done", {
                callback: function(result, cmd, forward, sourceData, extra){
                    var formData = result.data;
                    // var options = result.options;
                    // var settings = result.settings;
                    // var htmlForm = $(result.form);

                    // var setting = null;

                    // for(var key in settings){
                    //     setting = settings[key];

                    //     if("radio" == setting.type && setting.required){
                    //         if(!formData[setting.name]){
                    //             checker.exec("tips", [$(setting.node), setting.tips.empty, CheckTypes.EMPTY]);
                    //             return ;
                    //         }
                    //     }

                    //     if("checkbox" == setting.type && setting.required){
                    //         var group = htmlForm.find('[data-group="' + setting.group + '"]');
                    //         var flag = 0;
                    //         var item = null;

                    //         for(var i = 0; i < group.length; i++){
                    //             item = group[i];

                    //             if(item.checked){
                    //                 flag = 1;
                    //                 break;
                    //             }
                    //         }

                    //         if(0 === flag){
                    //             checker.exec("tips", [$(setting.node), setting.tips.empty, CheckTypes.EMPTY]);

                    //             return ;
                    //         }
                    //     }
                    // }

                    if("request" == forward){
                        //@todo
                        var param = {
                            data: Request.stringify(formData)
                        };

                        var formConfig = GetFormConfigure(cmd);

                        if(!formConfig.request){
                            throw new Error("Form configuration \"request\" attribute is missing.");
                        }

                        CMD.exec(formConfig.request.name, param, {
                            context: {
                                "showLoading": formConfig.loading.show,
                                "loadingText": formConfig.loading.text,
                                "formData": formData,
                                "formType": cmd,
                                "form": result.form,
                                "source": sourceData,
                                "extra": extra
                            },
                            success: function(data, status, xhr){
                                var formConfig = GetFormConfigure(this.formType);
                                var proxy = formConfig.proxy || {};

                                ResponseProxy.json(this, data, {
                                    "callback": function(ctx, resp, msg){
                                        var ft = ctx.formType;

                                        var formConfig = GetFormConfigure(ft);
                                        var proc = formConfig.processor;

                                        proc.apply(null, [ctx, resp, msg]);
                                    }
                                }, proxy.exception, proxy.conf);
                            }
                        });
                    }else if("redirect" == forward){
                        result.form.submit();
                    }
                },
                args: [formType, submitType, sourceData, extra]
            });

            checker.check();
        }
    };

    /**
     * 配置
     * @param {Object} conf 配置项
     * {
     *      "[key]": {
     *          "request": {
     *              "name": "mod_name.request_type.request_name",
     *              "command": {
     *                  "mod_name": {
     *                      "request_type": {
     *                          "request_name": {
     *                              "url":"", 
                                    "data":""
     *                          }
     *                      }
     *                  }
     *              }
     *          },
     *          "loading": {
     *              "show": [true|false],
     *              "text": "正在提交数据，请稍候..."
     *          },
     *          "check": {
     *              "before": null,
     *              "mpv": null
     *          },
     *          "processor": function(ctx, resp, msg){
     *              try{
     *                  ctx.form.reset();
     *              }catch(e){}
     *
     *              CMD.fireError("0", msg || "操作成功", ErrorTypes.SUCCESS);
     *          },
     *          "proxy": {
     *              "exception": {
     *                  errorMap: {
     *                      "[retcode]": Handler
     *                  },
     *                  tips: true|false,
     *                  handle: Handler
     *              },
     *              "conf": {
     *                  "code": "retCode",
     *                  "msg": "retMsg",
     *                  "success": 0,
     *                  "errorHandler": CMD.errorHandler
     *              }
     *          }
     *      }
     * }
     */
    var _FormConf = {};
    var Configure = function(conf){
        Register((_FormConf = $.extend(true, {}, _FormConf, conf || null)));
    };

    var Register = function(conf){
        var _c = null;
        var _req = null;
        var _commands = {};

        for(var key in conf){
            if(conf.hasOwnProperty(key)){
                _c = conf[key];
                _req = _c.request || null;

                if(_req){
                    _commands = $.extend(true, {}, _commands, _req.command);
                }else{
                    console.warn("Register::Form configuration \"request\" attribute is missing.");
                }
            }
        }

        CMD.injectCommands(_commands);
    };

    var GetDefaultConfigure = function(key){
        var DEFAULT_LOADING_CONF = {
            "show": true,
            "text": "正在提交数据，请稍候..."
        };

        var DEFAULT_PROCESSOR_CONF = function(ctx, resp, msg){
            try{
                ctx.form.reset();
            }catch(e){
                //@todo
            }finally{
                CMD.fireError("0", msg || "操作成功", ErrorTypes.SUCCESS);
            }
        };

        var DEFAULT_CHECK_BEFORE_CONF = {
            callback: function(form, spv){
                if(!spv){
                    form.find(".form-field")
                        .removeClass("v-ok")
                        .removeClass("v-err")
                        .find(".tips")
                        .removeClass("out")
                        .removeAttr("style");
                }
            }
        };

        var DEFAULT_CHECK_MPV_CONF = {
            callback: function(result){
                var checkResultCRS = result.crs;
                var checkResultItems = result.cri;
                var item = null;
                var endEvents = [
                    "webkitAnimationEnd", 
                    "mozAnimationEnd", 
                    "MSAnimationEnd", 
                    "oanimationend", 
                    "animationend",
                ];

                if(checkResultCRS["failure"] > 0){
                    for(var key in checkResultItems){
                        if(checkResultItems.hasOwnProperty(key)){
                            item = checkResultItems[key];

                            var field = item.element.parents(".form-field");
                            var tips = field.find(".tips");
                            var rect = null;

                            if(item.verified){
                                field.addClass("v-ok");
                            }else{
                                rect = Util.getBoundingClientRect(item.element[0]);

                                tips.one(endEvents.join(" "), function(e){
                                    e.stopPropagation();
                                    $(e.currentTarget).css("display", "none");
                                })

                                tips.html(item.message)
                                    .css({
                                        "top": (rect.height + 5) + "px"
                                    }).addClass("out");
                                field.addClass("v-err");
                            }
                        }
                    }
                }
            }
        };

        var conf = {
            "loading": DEFAULT_LOADING_CONF,
            "processor": DEFAULT_PROCESSOR_CONF,
            "before": DEFAULT_CHECK_BEFORE_CONF,
            "mpv": DEFAULT_CHECK_MPV_CONF
        };

        if(key in conf){
            return conf[key];
        }

        return conf;
    };

    var GetFormConfigure = function(key){
        var conf = _FormConf;

        var DEFAULT_LOADING_CONF = GetDefaultConfigure("loading");
        var DEFAULT_PROCESSOR_CONF = GetDefaultConfigure("processor");
        var DEFAULT_CHECK_BEFORE_CONF = GetDefaultConfigure("before");
        var DEFAULT_CHECK_MPV_CONF = GetDefaultConfigure("mpv");

        if(key in conf){
            var _fc = conf[key];
            var req = _fc.request || null;
            var loading = _fc.loading || DEFAULT_LOADING_CONF;
            var proc = _fc.processor || DEFAULT_PROCESSOR_CONF;
            var proxy = _fc.proxy || null;
            var check = _fc.check || {};

            check.before = check.before || DEFAULT_CHECK_BEFORE_CONF;
            check.mpv = check.mpv || DEFAULT_CHECK_MPV_CONF;

            return {
                "request": req,
                "loading": loading,
                "processor": proc,
                "proxy": proxy,
                "check": check
            }
        }

        return null;
    };

    (function main(){
        Util.source(FormSchema);
        SetSecretSeed(GetDefaultSecretSeed());
    })();

    module.exports = {
        "version": "R17B0425",
        "CheckTypes": CheckTypes,
        configure: function(conf){
            Configure(conf);
        },
        getDefaultConfigure: function(key){
            return GetDefaultConfigure(key);
        },
        setScretSeed: function(seed){
            SetSecretSeed(seed);
        },
        getSecretSeed: function(){
            return GetSecretSeed();
        },
        getSecretData: function(dataKey){
            return GetSecretData(dataKey);
        }
    }
});