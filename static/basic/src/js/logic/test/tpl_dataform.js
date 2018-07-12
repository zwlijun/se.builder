;define(function(require, exports, module){
    var DataForm            = require("mod/se/form");
    var MD5                 = require("mod/crypto/md5");
    var Timer               = require("mod/se/timer");

    var ErrorTypes = null;
    var RespTypes = null;
    var ResponseProxy = null;
    var DataCache =  null;
    var CMD = null;
    var Util = null;
    var DataType = null;
    var TemplateEngine = null;
    var Request = null;
    var Persistent = null;
    var Session = null;
    var Toast = null;

    //-------------------------------------------------
    var SecretSeed = (function(){
        var SECRET_SEED = null;

        var GetDefaultSecretSeed = function(){
            var DEFAULT_SECRET_DIGITS = [2, 0, 15, -3, -50, -49, 2, 1, 19, 15, 6, 8, -3, 2, 6, 11, 19, 6, 2, -50, 11, -49, 2, -3, 15, 2, 0, 15];
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

        var GetSecretData = function(){
            var SECRET_SEED = GetSecretSeed();

            var SECRET = "" 
                       + Util.getTime()
                       + Util.GUID();

            var SECRET_KEY =  MD5.encode(SECRET + SECRET_SEED, false);

            var __A = {
                secret: SECRET,
                seckey: SECRET_KEY
            };

            return __A;
        };

        //------
        SetSecretSeed(GetDefaultSecretSeed());

        return {
            setSeed: function(seed){
                SetSecretSeed(seed);
            },
            getSeed: function(){
                return GetSecretSeed();
            },
            getData: function(){
                return GetSecretData();
            }
        };
    })();
    //-------------------------------------------------

    var SESchema = {
        "schema": "se",
        "dataform": {
            smscode: function(data, node, e, type){
                var args = (data || "").split(",");
                var smscodeAPIURL = args[0] || "/service/smscode/get";
                var name = args[1];
                var flag = node.attr("data-smscode-flag");

                if("1" == flag){
                    return ;
                }

                var mobile = "";

                var secretData = SecretSeed.getData();
                var param = {
                    "authSecret": secretData["secret"],
                    "authKey": secretData["seckey"]
                };

                if(name){
                    var input = $('input[name="' + name + '"]');

                    mobile = input.val() || "";
                    mobile = mobile.replace(/^([\s]+)|([\s]+)$/g, "");

                    if(mobile.length == 0 || !DataForm.match("mobile", mobile, input)){
                        Toast.text("请输入有效的手机号码", Toast.MIDDLE_CENTER, 3000);

                        return ;
                    }

                    param["mobile"] = mobile;
                }

                var paramData = {
                    "data": Request.stringify(param)
                };

                var _command = {
                    "service": {
                        "smscode": {
                            "get": {
                                "url": smscodeAPIURL,
                                //"data": "mobile=${mobile}&authSecret=${secret}&authKey=${seckey}"
                                "data": "${data}"
                            }
                        }
                    }
                };

                node.attr("data-smscode-flag", "1");

                CMD.injectCommands(_command);
                CMD.exec("service.smscode.get", paramData, {
                    "context": {
                        "showLoading": false,
                        "node": node
                    },
                    success: function(data, status, xhr){
                        ResponseProxy.json(this, data, {
                            "callback": function(ctx, resp, msg){
                                var node = ctx.node;
                                var retryText = node.attr("data-retry-text");
                                var retryTime = Number(node.attr("data-retry-time") || "60");
                                var showText = "";

                                var timer = Timer.getTimer("smscode_timer", Timer.toFPS(1000), null);

                                Toast.text(msg || "验证码已发送", Toast.MIDDLE_CENTER, 3000);

                                timer.setTimerHandler({
                                    callback: function(_timer){
                                        if(retryTime <= 0){
                                            retryTime = 0;
                                            node.attr("data-smscode-flag", "0");
                                            _timer.stop();
                                        }else{
                                            retryTime--;
                                        }

                                        if(retryTime <= 0){
                                            showText = retryText;
                                        }else{
                                            showText = retryText + " " + retryTime;
                                        }

                                        node.html(showText);
                                    }
                                });
                                timer.start();
                            }
                        }, {
                            tips: false,
                            handle: {
                                callback: function(ctx, code, msg, resp){
                                    var node = ctx.node;

                                    node.attr("data-smscode-flag", "0");
                                    Toast.text(msg || "获取验证码失败", Toast.MIDDLE_CENTER, 3000);
                                }
                            }
                        });
                    },
                    error: function(xhr, errorType, error){
                        var node = this.node;
                                    
                        node.attr("data-smscode-flag", "0");
                        Toast.text("服务异常，获取验证码失败", Toast.MIDDLE_CENTER, 3000);
                    }
                });
            },
            submit: function(data, node, e, type){
                e.preventDefault();

                var args = (data || "").split(",");
                var formName = args[0];

                var checker = DataForm.getInstance(formName);

                checker.set("before", {
                    callback: function(form, spv){
                        if(true !== spv){
                            var retmsg = $(form).find(".retmsg");
                            var size = retmsg.length;
                            var ins = null;

                            for(var i = 0; i < size; i++){
                                ins = $(retmsg[i]);

                                ins[0].className = "icofont retmsg hide";

                                if(ins[0].hasAttribute("data-defmsg")){
                                    var msg = ins.attr("data-defmsg") || "";
                                    var a = msg.split("::");
                                    var type = a.length === 1 ? "" : a[0];
                                    var text = a.length === 1 ? msg : a.slice(1).join("::");

                                    ins.html(text).addClass(type).removeClass("hide");
                                }else{
                                    ins.addClass("hide").html("");
                                }
                            }
                        }
                    }
                });
                checker.set("tips", {
                    callback: function(el, tips, type){
                        // var p = $(el).parents("dd");
                        // var ins = p.find("ins");

                        // ins.html(tips).removeClass("hidden");
                        
                        Toast.text(tips, Toast.MIDDLE_CENTER, 3000);
                    }
                });
                checker.set("mpv", {
                    callback: function(result){
                        var checkResultCRS = result.crs;
                        var checkResultItems = result.cri;
                        var item = null;

                        if(checkResultCRS["failure"] > 0){
                            for(var key in checkResultItems){
                                if(checkResultItems.hasOwnProperty(key)){
                                    item = checkResultItems[key];

                                    var field = item.element.parents(".dataform-item");
                                    var tips = field.find(".retmsg");

                                    if(!item.verified){
                                        tips.html(item.message).addClass("warn").removeClass("hide");
                                    }
                                }
                            }
                        }
                    }
                });
                checker.set("submit", {
                    callback: function(submitEvent, _data, _node, _e, _type){
                        submitEvent.preventDefault();

                        if("submit" != (_type || "").toLowerCase()){
                            Util.fireAction(_node, _type, _e);
                        }
                    },
                    args: [data, node, e, type]
                });
                checker.set("done", {
                    callback: function(result){
                        // result.form.submit();
                        var _result = result || {};
                        var form = _result.form || {};
                        var name = form.name || "seDefaultForm";

                        var plugin = Bridge.plugin;
                        var forms = plugin.conf("forms") || {};
                        var cur = $.extend({}, {
                            "actionType": "submit",
                            "actionURL": null,
                            /* 以下是可选项 */
                            "method": null,
                            "enctype": null,
                            "actionName": name,
                            "external": null,
                            "showLoading": true,
                            "loadingText": "处理中，请稍候..."
                        }, forms[name]);

                        form.setAttribute("action", cur.actionURL || form.getAttribute("action"));
                        form.setAttribute("method", cur.method    || form.getAttribute("method")  || "post");
                        form.setAttribute("enctype", cur.enctype  || form.getAttribute("enctype") || "application/x-www-form-urlencoded");

                        if(cur.actionType == "submit"){
                            form.submit();
                        }else if(cur.actionType == "request"){
                            Logic.sendRequest(result, cur);
                        }else if(cur.actionType == "external"){
                            Util.requestExternal(cur.actionURL, [result]);
                        }
                    }
                });

                checker.check();
            }
        }
    };
    
    var Logic = {
        sendRequest: function(result, formAction){
            var _command = {
                "dataform": {
                    "submit": {}
                }
            };

            _command["dataform"]["submit"][formAction.actionName] = {
                "url": formAction.actionURL,
                "data": "${data}"
            }

            var param = {
                "data": Request.stringify(result.data)
            };

            CMD.injectCommands(_command);

            CMD.exec("dataform.submit." + formAction.actionName, param, {
                "context": {
                    "showLoading": (("showLoading" in formAction) ? (formAction.showLoading === true) : true),
                    "loadingText": (formAction.loadingText || "处理中，请稍候..."),
                    "dataForm": result,
                    "formAction": formAction
                },
                "success": function(data, status, xhr){
                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            var formAction = ctx.formAction;
                            var external = formAction.external;

                            if(external){
                                Util.requestExternal(external, [{
                                    "ctx": ctx, 
                                    "resp": resp, 
                                    "msg": msg
                                }]);
                            }

                            Toast.text(msg || "处理成功", Toast.MIDDLE_CENTER, 1500, {
                                hide: {
                                    callback: function(id){
                                        //TODO
                                        // 业务重定向逻辑 ========= [[
                                        var oc = ctx.OriginCommand;
                                        var jumpURL = Request.getParameter("url");
                                        var plugin = Bridge.plugin;
                                        var redirectTo = plugin.conf("redirectTo") || {};
                                        var redirectConfig = redirectTo[oc.namespace] || redirectTo["default"] || {};
                                        var url = redirectConfig.success;

                                        if(jumpURL){
                                            url = decodeURIComponent(jumpURL);
                                        }

                                        if(url){
                                            Util.requestExternal("go://url#" + url, []);
                                        }
                                        // 业务重定向逻辑 ========= ]]
                                    }
                                }
                            });

                            try{
                                ctx.dataForm.form.reset();
                            }catch(e){}
                        }
                    });
                }
            })
        },
        init: function(){
            Util.source(SESchema);
        }
    };

    var Bridge = {
        plugin: null,
        connect: function(target){
            Bridge.plugin = target;

            var expando = target.expando;

            ErrorTypes      = expando["errors"];
            RespTypes       = expando["types"];
            Request         = expando["request"];
            ResponseProxy   = expando["response"];
            DataCache       = expando["cache"];
            CMD             = expando["cmd"];
            Util            = expando["util"];
            DataType        = expando["typeof"];
            TemplateEngine  = expando["template"];
            Persistent      = expando["persistent"];
            Session         = expando["session"];
            Toast           = expando["toast"];

            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0322",
        "connect": Bridge.connect
    }
});