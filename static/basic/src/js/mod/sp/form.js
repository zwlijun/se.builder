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
    var DataCache       =  DataProxy.DataCache;

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
            var flag = node.attr("data-auth-flag") == "1";

            var mobileInput = $("#" + mobileInputID);
            var mobile = mobileInput.val() || "";

            if(flag){
                return ;
            }

            if(mobileInput.length == 0 || !FormUtil.match("mobile", mobile, mobileInput)){
                CMD.fireError("0x100102", "请输入有效的手机号码", ErrorTypes.INFO);

                return ;
            }

            var secretDigits = [2, -50, 5, 2, 11, 1, 19, 5, 6, 11, 1, 2, 6, 11, 2, 19, 5, 11, 6, -48, 4, -49, 11, 0, 15, 2, 15, 0];
            var secretSeed = (function(digits, diff){
                var size = digits.length;

                var t2 = [];
                for(var j = 0; j < size; j++){
                    t2.push(String.fromCharCode(digits[j]  + diff));
                }
                return t2.join("");
            })(secretDigits, 1E2);
            var secret = "" 
                       + Util.getTime()
                       + Util.GUID();
            var seckey =  MD5.encode(secret + secretSeed, false);
            var param = {
                "mobile": mobile,
                "secret": secret,
                "seckey": seckey
            };

            var formConfig = GetFormConfigure("mcode");

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
                    "source": sourceData,
                    "extra": extra
                },
                success: function(data, status, xhr){
                    var formConfig = GetFormConfigure("mcode");
                    var proxy = formConfig.proxy || {};

                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            CMD.fireError("0x100103", msg || "验证码已发送，请注意查收", ErrorTypes.INFO);

                            var cd = CountDown.getCountDown("mcode_" + mobileInputID, CountDown.toFPS(1000), {
                                callback: function(ret, _node, _label, _time){
                                    if(ret.stop){
                                        _node.removeClass("auth-disable");
                                        _node.html(_label);
                                        _node.attr("data-auth-flag", "0");
                                    }else{
                                        _node.addClass("auth-disable");
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
            var cls = args[3];
            var flag = node.attr("data-auth-flag") == "1";

            var mobileInput = $("#" + mobileInputID);
            var mobile = mobileInput.val() || "";

            if(flag){
                return ;
            }

            if(mobileInput.length == 0 || !FormUtil.match("mobile", mobile, mobileInput)){
                CMD.fireError("0x100102", "请输入有效的手机号码", ErrorTypes.INFO);

                return ;
            }

            var param = {
                "mobile": mobile
            };

            var formConfig = GetFormConfigure("checkaccount");

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
                    "cls": cls,
                    "source": sourceData,
                    "extra": extra
                },
                success: function(data, status, xhr){
                    var formConfig = GetFormConfigure("checkaccount");
                    var proxy = formConfig.proxy || {};

                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            CMD.fireError("0x100104", msg || "账号校验通过，请注意查收短信验证码", ErrorTypes.INFO);

                            var cd = CountDown.getCountDown("mcode_" + mobileInputID, CountDown.toFPS(1000), {
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

            checker.set("tips", {
                callback: function(el, tips, type){
                    if(CheckTypes.MIN == type){
                        CMD.fireError("0x900001", el.attr("data-mintips") || tips, ErrorTypes.INFO);
                    }else if(CheckTypes.MAX == type){
                        CMD.fireError("0x900002", el.attr("data-maxtips") || tips, ErrorTypes.INFO);
                    }else if(CheckTypes.LBOUND == type){
                        CMD.fireError("0x900003", el.attr("data-lboundtips") || tips, ErrorTypes.INFO);
                    }else if(CheckTypes.UBOUND == type){
                        CMD.fireError("0x900004", el.attr("data-uboundtips") || tips, ErrorTypes.INFO);
                    }else{
                        CMD.fireError("0x900000", tips, ErrorTypes.INFO);
                    }
                }
            });
            checker.set("submit", {
                callback: function(submitEvent, target, checkEvent){
                    submitEvent.preventDefault();

                    Util.fireAction(target, checkEvent.data, checkEvent);
                },
                args: [sourceData.node, sourceData.event]
            });
            checker.set("done", {
                callback: function(result, cmd, forward, sourceData, extra){
                    var formData = result.data;
                    var options = result.options;
                    var settings = result.settings;
                    var htmlForm = $(result.form);

                    var setting = null;

                    for(var key in settings){
                        setting = settings[key];

                        if("radio" == setting.type && setting.required){
                            if(!formData[setting.name]){
                                checker.exec("tips", [$(setting.node), setting.tips.empty, CheckTypes.EMPTY]);
                                return ;
                            }
                        }

                        if("checkbox" == setting.type && setting.required){
                            var group = htmlForm.find('[data-group="' + setting.group + '"]');
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
                                checker.exec("tips", [$(setting.node), setting.tips.empty, CheckTypes.EMPTY]);

                                return ;
                            }
                        }
                    }

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
     *                  handler: Handler
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

    var GetFormConfigure = function(key){
        var conf = _FormConf;

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

        if(key in conf){
            var _fc = conf[key];
            var req = _fc.request || null;
            var loading = _fc.loading || DEFAULT_LOADING_CONF;
            var proc = _fc.processor || DEFAULT_PROCESSOR_CONF;
            var proxy = _fc.proxy || null;

            return {
                "request": req,
                "loading": loading,
                "processor": proc,
                "proxy": proxy
            }
        }

        return null;
    };

    (function main(){
        Util.source(FormSchema)
    })();

    module.exports = {
        "version": "R16B0923",
        configure: function(conf){
            Configure(conf);
        }
    }
});