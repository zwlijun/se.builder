;define(function(require, exports, module){
    var DataForm        = require("mod/se/form");

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

    var SESchema = {
        schema: "se",
        dataform: {
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

                        Util.fireAction(_node, _type, _e);
                    },
                    args: [data, node, e, type]
                });
                checker.set("done", {
                    callback: function(result){
                        // result.form.submit();
                        Logic.sendRequest(result);
                    }
                });

                checker.check();
            }
        }
    };
    
    var Logic = {
        sendRequest: function(result){
            var _command = {
                "dataform": {
                    "submit": {
                        "tpl": {
                            "url": "/submit",
                            "data": "${data}"
                        }
                    }
                }
            };

            var param = {
                "data": Request.stringify(result.data)
            };

            CMD.injectCommands(_command);

            CMD.exec("dataform.submit.tpl", param, {
                "context": {
                    "showLoading": true,
                    "loadingText": "处理中，请稍候...",
                    "dataForm": result
                },
                "success": function(data, status, xhr){
                    ResponseProxy.json(this, data, {
                        "callback": function(ctx, resp, msg){
                            Toast.text(msg || "操作成功", Toast.MIDDLE_CENTER, 1500, {
                                hide: {
                                    callback: function(id){
                                        //TODO
                                        // 业务重定向逻辑 ========= [[
                                        var jumpURL = Request.getParameter("url");
                                        var plugin = Bridge.plugin;
                                        var redirectTo = plugin.conf("redirectTo");
                                        var url = redirectTo["default"].success;

                                        if(jumpURL){
                                            url = decodeURIComponent(jumpURL);
                                        }

                                        Util.requestExternal("go://url#" + url, []);
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

            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0322",
        "connect": Bridge.connect
    }
});