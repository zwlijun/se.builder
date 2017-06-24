define(function(require, exports, module){
    var Util        = require("mod/se/util");
    var TouchDatetime = require("mod/ui/touchdatetime");



    (function(){
        Util.watchAction("body", [
            {type: "click", mapping: null, compatible: null}
        ], null);
    })();

    var tc = TouchDatetime.newTouchDatetime("se_touchdatetime");

    tc.set("callout", {
        callback: function(name){
            console.log("callout: " + name);

            $(document).on("touchmove.ts0", function(e){
                e.preventDefault();
            });
        }
    });

    tc.set("exit", {
        callback: function(name){
            console.log("exit: " + name);

            $(document).off("touchmove.ts0");
        }
    });

    tc.set("change", {
        callback: function(name){
            console.log("change: " + name);

            var ts = this.touchselect;
            var values = ts.getSelectedOptions();
            var size = values.length;

            var p = [];

            for(var i = 0; i < size; i++){
                if(values[i].value){
                    p.push(values[i].text);
                }
            }

            $("#render").html(p.join("&ensp;"))
        },
        context: tc
    });

    tc.set("cancel", {
        callback: function(name){
            console.log("cancel: " + name);


        }
    });

    tc.set("confirm", {
        callback: function(name){
            console.log("confirm: " + name);
        }
    });

    tc.render(TouchDatetime.FORMAT.DATETIME, {
        "callout": "#ast",
        "action": "click",
        "defaultOptions": [
            {"value": 2000, "text": "2000", "linkedvalue": ""},
            {"value": 10, "text": "10", "linkedvalue": ""},
            {"value": 5, "text": "05", "linkedvalue": ""}

        ] //默认选择的值，对应data的数据组长度
    });
});