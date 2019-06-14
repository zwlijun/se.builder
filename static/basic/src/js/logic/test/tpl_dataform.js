;define(function(require, exports, module){
    var DataForm            = require("mod/se/form");
    var MD5                 = require("mod/crypto/md5");
    var Timer               = require("mod/se/timer");

    //-------------------------------------------------
    /**
     * 数据表单工具类
     * @type {Object}
     */
    var DataFormUtil = {
        "dataforms": {
            "__def__": {
                callback: function(formName){
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
                        callback: function(el, tips, type, onlyCheck){
                            // var p = $(el).parents("dd");
                            // var ins = p.find("ins");

                            // ins.html(tips).removeClass("hidden");
                            if(true === onlyCheck){
                            	return ;
                            }

                            try{
                                if(el && el.length > 0){
                                    el[0].scrollIntoView();
                                }
                            }catch(e){}

                            SEApp.Toast.text(tips, SEApp.Toast.MIDDLE_CENTER, 3000);
                        }
                    });
                    checker.set("mpv", {
                        callback: function(result, onlyCheck){
                            var checkResultCRS = result.crs;
                            var checkResultItems = result.cri;
                            var item = null;
                            var first = true;

                            if(checkResultCRS["failure"] > 0){
                                for(var key in checkResultItems){
                                    if(checkResultItems.hasOwnProperty(key)){
                                        item = checkResultItems[key];

                                        var itemField = item.element.parents(".dataform-item");
                                        var tips = itemField.find(".retmsg");

                                        if(!item.verified){
                                            tips.html(item.message).addClass("warn").removeClass("hide");

                                            try{
                                                if(first && itemField[0]){
                                                    itemField[0].scrollIntoView();
                                                    first = false;
                                                }
                                            }catch(e){}
                                        }
                                    }
                                }
                            }
                        }
                    });

                    return checker;
                }
            }
        },
        define: function(){
            DataForm.rt(800, {
                "open": false,
                "interval": 5000
            });

            var forms = SEApp.conf("forms") || {};

            for(var f in forms){
                if(forms.hasOwnProperty(f)){
                    SEApp.Util.execHandler(DataFormUtil.dataforms[f] || DataFormUtil.dataforms["__def__"], [f]);
                }
            }
        }
    };
    //-------------------------------------------------
    /**
     * 获取验证码时的安全参数生成器
     * @return {Object}     [description]
     */
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
                       + SEApp.Util.getTime()
                       + SEApp.Util.GUID();

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
            /**
             * 设置种子串
             * @param {String} seed [种子字符串]
             */
            setSeed: function(seed){
                SetSecretSeed(seed);
            },
            /**
             * 获取种子
             * @return {String} [种子]
             */
            getSeed: function(){
                return GetSecretSeed();
            },
            /**
             * 获取安全串
             * @return {Object} [{String secret, String seckey}]
             */
            getData: function(){
                return GetSecretData();
            }
        };
    })();
    //-------------------------------------------------

    /**
     * [SESchema description]
     * @type {Object}
     */
    var SESchema = {
        "schema": "se",
        /**
         * 数据表单
         */
        "dataform": {
            /**
             * 错误提示处理
             */
            "err": {
                /**
                 * 清除错误提示信息
                 * @param  {String} data [参数]
                 * @param  {Object} node [jQuery/zepto节点对象，或null]
                 * @param  {Event}  e    [事件对象，或null]
                 * @param  {String} type [事件类型]
                 * @return {[type]}      [description]
                 */
                r: function(data, node, e, type){
                    var args = (data || "").split(",");
                    var formName = args[0];

                    var p = node.parents(".dataform-item");
                    var ins = p.find(".retmsg");

                    if(ins.length > 0){
	                    if(ins[0].hasAttribute("data-defmsg")){
	                        var msg = ins.attr("data-defmsg") || "";
	                        var a = msg.split("::");
	                        var type = a.length === 1 ? "" : a[0];
	                        var text = a.length === 1 ? msg : a.slice(1).join("::");

	                        ins.html(text).addClass(type).removeClass("hide");
	                    }else{
	                        ins.addClass("hide").html("");
	                    }

	                    p.removeClass("err");
	                }

                    if(formName){
                    	var checker = DataForm.getInstance(formName);

                    	if(checker && false === checker.check(false)){
                    		$(".btn.btn-orange").addClass("disabled");
                    	}else{
                    		$(".btn.btn-orange").removeClass("disabled");
                    	}
                    }
                }
            },
            /**
             * 获取短信验证码
             * @param  {String} data [参数]
             * @param  {Object} node [jQuery/zepto节点对象，或null]
             * @param  {Event}  e    [事件对象，或null]
             * @param  {String} type [事件类型]
             * @return {[type]}      [description]
             * 示例
             * se://dataform/smscode#smscodeAPIURL,mobileInputName
             * DOM设置示例
             * data-action-tap="se://dataform/smscode#/getcode,mobile" 
             * data-retry-text="重新获取" 
             * data-retry-time="60"
             */
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
                    var pattern = /^(cookie|session|persistent)\:\/\/([^\s\/]+)\/([^\s]+)$/gi;
                    pattern.lastIndex = 0;

                    var matcher = pattern.exec(name);

                    if(null != matcher){
                        var type = matcher[1];
                        var key = matcher[2];
                        var inputName = matcher[3];
                        var maps = {
                            "cookie": 2,
                            "session": 0,
                            "persistent": 1
                        };

                        name = inputName;
                        mobile = DataForm.getStorageValue(maps[type], key);
                    }else{
                        var parent = node.parents("form");
                        var input = parent.find('input[name="' + name + '"]');

                        mobile = input.val() || "";

                        mobile = mobile.replace(/^([\s]+)|([\s]+)$/g, "");

                        if(mobile.length == 0 || !DataForm.match("mobile", mobile, input)){
                            SEApp.Toast.text(input.attr("data-invalid"), SEApp.Toast.MIDDLE_CENTER, 3000);

                            return ;
                        }
                    }

                    param["mobile"] = mobile;
                }

                var paramData = {
                    "data": SEApp.Request.stringify(param)
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

                node.attr("data-smscode-flag", "1").addClass("disabled");

                SEApp.CMD.injectCommands(_command);
                SEApp.CMD.exec("service.smscode.get", paramData, {
                    "context": {
                        "showLoading": false,
                        "node": node
                    },
                    success: function(data, status, xhr){
                        SEApp.ResponseProxy.json(this, SEApp.DataSetUtil.dataTransform(data), {
                            "callback": function(ctx, resp, msg){
                                var node = ctx.node;
                                var retryText = node.attr("data-retry-text");
                                var retryTime = Number(node.attr("data-retry-time") || "60");
                                var showText = "";

                                var timer = Timer.getTimer("smscode_timer", Timer.toFPS(1000), null);

                                SEApp.Toast.text(msg || "Success", SEApp.Toast.MIDDLE_CENTER, 3000);

                                timer.setTimerHandler({
                                    callback: function(_timer){
                                        if(retryTime <= 0){
                                            retryTime = 0;
                                            node.attr("data-smscode-flag", "0").removeClass("disabled");
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

                                    node.attr("data-smscode-flag", "0").removeClass("disabled");
                                    SEApp.Toast.text(msg || "Error", SEApp.Toast.MIDDLE_CENTER, 3000);
                                }
                            }
                        });
                    },
                    error: function(xhr, errorType, error){
                        var node = this.node;
                                    
                        node.attr("data-smscode-flag", "0").removeClass("disabled");
                        
                        var err = SEApp.CMD.RequestStatus[errorType];
                        SEApp.Toast.text(err.text, SEApp.Toast.MIDDLE_CENTER, 3000);
                    }
                });
            },
            /**
             * 表单提交校验
             * @param  {String} data [参数]
             * @param  {Object} node [jQuery/zepto节点对象，或null]
             * @param  {Event}  e    [事件对象，或null]
             * @param  {String} type [事件类型]
             * @return {[type]}      [description]
             * 示例
             * se://dataform/submit#formName
             * @forms配置
             * "forms": {
             *     "formName": {
             *         "actionType"  : [Required]action触发方式，submit|request|exteranl
             *         "actionURL"   : [Required]action地址，当为actionType的值为external时为自定义的虚拟schema的地址
             *         "method"      : [Optional]表单提交时的HTTP方法() 
             *         "enctype"     : [Optional]表单提交编码方式
             *         "external"    : [Optional]自定义的虚拟schema回调
             *         "showLoading" : [Optional]是否显示loading
             *         "loadingText" : [Optional]loading的提示文案
             *         "actionName"  : [AutoFix]表单名
             *     }
             * }
             */
            submit: function(data, node, e, type){
                e.preventDefault();

                if(node && node.hasClass("disabled")){
                    return ;
                }

                var args = (data || "").split(",");
                var formName = args[0];

                var checker = DataForm.getInstance(formName);

                checker.set("submit", {
                    callback: function(submitEvent, _data, _node, _e, _type){
                        submitEvent.preventDefault();

                        if("submit" != (_type || "").toLowerCase()){
                            SEApp.Util.fireAction(_node, _type, _e);
                        }
                    },
                    args: [data, node, e, type]
                });
                checker.set("done", {
                    callback: function(result){
                        if(true === result.onlyCheck){
                            return;
                        }

                        var _result = result || {};
                        var form = _result.form || {};
                        var name = form.name || "seDefaultForm";

                        var cur = SEApp.DataSetUtil.getDataFormConf(name);

                        form.setAttribute("action", cur.actionURL || form.getAttribute("action"));
                        form.setAttribute("method", cur.method    || form.getAttribute("method")  || "post");
                        form.setAttribute("enctype", cur.enctype  || form.getAttribute("enctype") || "application/x-www-form-urlencoded");

                        if(cur.actionType == "submit"){
                            form.submit();
                        }else if(cur.actionType == "request"){
                            Logic.sendRequest(result, cur);
                        }else if(cur.actionType == "external"){
                            SEApp.Util.requestExternal(cur.actionURL, [result]);
                        }
                    }
                });

                checker.check();
            }
        }
    };
    
    /**
     * 业务处理
     * @type {Object}
     */
    var Logic = {
        /**
         * 提交表单时发送数据时调用的方法
         * @param  {Object} result     [表单验证成功返回的结果数据集]
         * @param  {Object} formAction [表单配置项]
         * @return {[type]}            [description]
         * 处理成功后重定向配置示例
         * @redirectTo
         * "redirectTo": {
         *     //业务名称，默认：default
         *     "default": { 
         *         "success": //对应的跳转URL
         *     },
         *     "dataform.submit.formName": {
         *         "success": //对应的跳转URL
         *     }
         * }
         */
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
                "data": SEApp.Request.stringify(result.data)
            };

            SEApp.CMD.injectCommands(_command);

            SEApp.CMD.exec("dataform.submit." + formAction.actionName, param, {
                "context": {
                    "showLoading": (("showLoading" in formAction) ? (formAction.showLoading === true) : true),
                    "loadingText": (formAction.loadingText || "处理中，请稍候..."),
                    "dataForm": result,
                    "formAction": formAction
                },
                "success": function(data, status, xhr){
                    SEApp.ResponseProxy.json(this, SEApp.DataSetUtil.dataTransform(data), {
                        "callback": function(ctx, resp, msg){
                            var formAction = ctx.formAction;
                            var external = formAction.external;

                            // 业务重定向逻辑地址 ========= [[
                            var oc = ctx.OriginCommand;
                            var jumpURL = SEApp.Request.getParameter("url");
                            var redirectTo = SEApp.conf("redirectTo") || {};
                            var redirectConfig = redirectTo[oc.namespace] || redirectTo["default"] || {};
                            var url = redirectConfig.success;

                            if(jumpURL){
                                url = decodeURIComponent(jumpURL);
                            }
                            // 业务重定向逻辑地址 ========= ]]

                            if(external){
                                SEApp.Util.requestExternal(external, [{
                                    "ctx": ctx, 
                                    "resp": resp, 
                                    "msg": msg,
                                    "url": url
                                }]);
                            }else{
                                if(true === formAction.redirectNow){
                                    // 业务重定向逻辑 ========= [[
                                    if(url){
                                        SEApp.Util.requestExternal("go://url#" + url, []);
                                    }
                                    // 业务重定向逻辑 ========= ]]
                                }else{
                                    SEApp.Toast.text(msg || "处理成功", SEApp.Toast.MIDDLE_CENTER, 1500, {
                                        hide: {
                                            callback: function(id){
                                                //TODO
                                                // 业务重定向逻辑 ========= [[
                                                if(url){
                                                    SEApp.Util.requestExternal("go://url#" + url, []);
                                                }
                                                // 业务重定向逻辑 ========= ]]
                                            }
                                        }
                                    });
                                }
                            }

                            try{
                                formAction.reset && ctx.dataForm.form.reset();
                            }catch(e){}
                        }
                    });
                }
            })
        },
        /**
         * 初始化，业务文件加载时会自动调用
         * @return {[type]} [description]
         */
        init: function(){
            SEApp.Util.source(SESchema);
            DataFormUtil.define();
        }
    };

    var Bridge = {
        connect: function(target){
            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0322",
        "connect": Bridge.connect
    }
});