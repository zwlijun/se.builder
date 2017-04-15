define(function(require, exports, module){
    var CMD      = require("mod/se/cmd");
    var FormUtil = require("mod/se/form");
    var Util     = require("mod/se/util");

    var CheckTypes      = FormUtil.CheckTypes;
    var ErrorTypes      = CMD.ErrorTypes;
    var RespTypes       = CMD.ResponseTypes;

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
        }
    };

    var _DataForm = {
        bind: function(formType, formName, submitType, sourceData, extra){
            var checker = FormUtil.getInstance(formName);
            

            checker.set("before", {
                callback: function(form, spv){
                    console.log("FormUtil#Listener/before, spv = " + spv);
                }
            });
            checker.set("beforecheck", {
                callback: function(form, spv){
                    console.log("FormUtil#Listener/beforecheck, spv = " + spv);

                    return true;
                },
                returnValue: true
            });
            checker.set("tips", {
                callback: function(el, tips, type){
                    CMD.fireError("0x900000", tips, ErrorTypes.INFO);
                    console.log("FormUtil#Listener/tips, type = " + type + "; tips = " + tips);
                }
            });
            checker.set("mpv", {
                callback: function(result){
                    console.log("FormUtil#Listener/mpv ==Start==");
                    console.log(request);
                    console.log("FormUtil#Listener/mpv ==End==");
                }
            });
            checker.set("submit", {
                callback: function(submitEvent, target, checkEvent){
                    submitEvent.preventDefault();
                    submitEvent.stopPropagation();

                    console.log("FormUtil#Listener/submit");

                    Util.fireAction(target, checkEvent.data, checkEvent);
                },
                args: [sourceData.node, sourceData.event]
            });
            checker.set("done", {
                callback: function(result, cmd, forward, sourceData, extra){
                    var formData = result.data;

                    console.log("FormUtil#Listener/done(" + forward + ")  ==Start==");
                    console.log(result);
                    console.log("FormUtil#Listener/done(" + forward + ")  ==End==");

                    if("request" == forward){
                        //@todo
                        //fire ajax request
                    }else if("redirect" == forward){
                        result.form.submit();
                    }
                },
                args: [formType, submitType, sourceData, extra]
            });

            checker.check();
        }
    };

    Util.source(FormSchema);

    Util.watchAction("body", [
        {type: "submit", mapping: null, compatible: null}
    ], null);
});