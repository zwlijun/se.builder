define(function(require, exports, module){
    var CMD      = require("mod/se/cmd");
    var FormUtil = require("mod/se/form").rt(300);
    var Util     = require("mod/se/util");

    var CheckTypes      = FormUtil.CheckTypes;
    var ErrorTypes      = CMD.ErrorTypes;
    var RespTypes       = CMD.ResponseTypes;

    var DataFormUtil = {
        "dataforms": {
            "__def__": {
                callback: function(formName){
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

                    return checker;
                }
            }
        },
        define: function(){
            var f = "testForm";

            Util.execHandler(DataFormUtil.dataforms[f] || DataFormUtil.dataforms["__def__"], [f]);
        }
    };

    var FormSchema = {
        "schema": "form",
        submit: function(data, node, e, type){
            e.preventDefault();

            var args = (data || "").split(",");
            var formName = args[0];

            _DataForm.bind(formName, node, e, type);
        }
    };

    var _DataForm = {
        bind: function(formName, node, e, type){
            var checker = FormUtil.getInstance(formName);

            checker.set("submit", {
                callback: function(submitEvent, target, event, eventType){
                    submitEvent.preventDefault();
                    submitEvent.stopPropagation();

                    console.log("FormUtil#Listener/submit");

                    Util.fireAction(target, eventType, event);
                },
                args: [node, e, type]
            });
            checker.set("done", {
                callback: function(result){
                    if(true === result.onlyCheck){
                        console.warn("only check")
                        return ;
                    }
                    var formData = result.data;

                    console.log(result);
                },
                args: []
            });

            checker.check();
        }
    };

    DataFormUtil.define();

    Util.source(FormSchema);

    Util.watchAction("body", [
        {type: "submit", mapping: null, compatible: null},
        {type: "input", mapping: null, compatible: null}
    ], null);
});