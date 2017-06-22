define(function(require, exports, module){
	var Util        = require("mod/se/util");
	var TouchSelect = require("mod/ui/touchselect");



    (function(){
        Util.watchAction("body", [
            {type: "click", mapping: null, compatible: null}
        ], null);
    })();

	var ts = TouchSelect.newTouchSelect("se_touchselect");

	ts.options({
		"name": "se_touchselect",
        "type": "default",
        "callout": "#ast",
        "action": "click",
        "title": "年月日",
        "data": {
            "linked": false,
            "list": [
                {
                    "label": {"value": "", "text": "年"},
                    "options": [
                        {"value": "1970", "text": "1970", "linkedvalue": ""},
                        {"value": "1971", "text": "1971", "linkedvalue": ""},
                        {"value": "1972", "text": "1972", "linkedvalue": ""},
                        {"value": "1973", "text": "1973", "linkedvalue": ""},
                        {"value": "1974", "text": "1974", "linkedvalue": ""},
                        {"value": "1975", "text": "1975", "linkedvalue": ""},
                        {"value": "1976", "text": "1976", "linkedvalue": ""},
                        {"value": "1977", "text": "1977", "linkedvalue": ""},
                        {"value": "1978", "text": "1978", "linkedvalue": ""},
                        {"value": "1979", "text": "1979", "linkedvalue": ""},
                        {"value": "1980", "text": "1980", "linkedvalue": ""},
                        {"value": "1981", "text": "1981", "linkedvalue": ""},
                        {"value": "1982", "text": "1982", "linkedvalue": ""},
                        {"value": "1983", "text": "1983", "linkedvalue": ""},
                        {"value": "1984", "text": "1984", "linkedvalue": ""},
                        {"value": "1985", "text": "1985", "linkedvalue": ""}
                    ]
                },
                {
                    "label": {"value": "", "text": "月"},
                    "options": [
                        {"value": "1", "text": "01", "linkedvalue": ""},
                        {"value": "2", "text": "02", "linkedvalue": ""},
                        {"value": "3", "text": "03", "linkedvalue": ""},
                        {"value": "4", "text": "04", "linkedvalue": ""},
                        {"value": "5", "text": "05", "linkedvalue": ""},
                        {"value": "6", "text": "06", "linkedvalue": ""},
                        {"value": "7", "text": "07", "linkedvalue": ""},
                        {"value": "8", "text": "08", "linkedvalue": ""},
                        {"value": "9", "text": "09", "linkedvalue": ""},
                        {"value": "10", "text": "10", "linkedvalue": ""},
                        {"value": "11", "text": "11", "linkedvalue": ""},
                        {"value": "12", "text": "12", "linkedvalue": ""}
                    ]
                },
                {
                    "label": {"value": "", "text": "日"},
                    "options": [
                        {"value": "1", "text": "01", "linkedvalue": ""},
                        {"value": "2", "text": "02", "linkedvalue": ""},
                        {"value": "3", "text": "03", "linkedvalue": ""},
                        {"value": "4", "text": "04", "linkedvalue": ""},
                        {"value": "5", "text": "05", "linkedvalue": ""},
                        {"value": "6", "text": "06", "linkedvalue": ""},
                        {"value": "7", "text": "07", "linkedvalue": ""},
                        {"value": "8", "text": "08", "linkedvalue": ""},
                        {"value": "9", "text": "09", "linkedvalue": ""},
                        {"value": "10", "text": "10", "linkedvalue": ""},
                        {"value": "11", "text": "11", "linkedvalue": ""},
                        {"value": "12", "text": "12", "linkedvalue": ""},
                        {"value": "13", "text": "13", "linkedvalue": ""},
                        {"value": "14", "text": "14", "linkedvalue": ""},
                        {"value": "15", "text": "15", "linkedvalue": ""},
                        {"value": "16", "text": "16", "linkedvalue": ""},
                        {"value": "17", "text": "17", "linkedvalue": ""},
                        {"value": "18", "text": "18", "linkedvalue": ""},
                        {"value": "19", "text": "19", "linkedvalue": ""},
                        {"value": "20", "text": "20", "linkedvalue": ""},
                        {"value": "21", "text": "21", "linkedvalue": ""},
                        {"value": "22", "text": "22", "linkedvalue": ""},
                        {"value": "23", "text": "23", "linkedvalue": ""},
                        {"value": "24", "text": "24", "linkedvalue": ""},
                        {"value": "25", "text": "25", "linkedvalue": ""},
                        {"value": "26", "text": "26", "linkedvalue": ""},
                        {"value": "27", "text": "27", "linkedvalue": ""},
                        {"value": "28", "text": "28", "linkedvalue": ""},
                        {"value": "29", "text": "29", "linkedvalue": ""},
                        {"value": "30", "text": "30", "linkedvalue": ""},
                        {"value": "31", "text": "31", "linkedvalue": ""}
                    ]
                }
            ]
        },
        "defaultOptions": [
        	// {"value": "1979", "text": "1979", "linkedvalue": ""},
        	// {"value": "12", "text": "12", "linkedvalue": ""},
        	// {"value": "1", "text": "31", "linkedvalue": ""}

        ] //默认选择的值，对应data的数据组长度
	});

	ts.set("callout", {
		callback: function(name){
			console.log("callout: " + name);

			$(document).on("touchmove.ts0", function(e){
				e.preventDefault();
			});
		}
	});

	ts.set("exit", {
		callback: function(name){
			console.log("exit: " + name);

			$(document).off("touchmove.ts0");
		}
	});

	ts.set("change", {
		callback: function(name){
			console.log("change: " + name);
		}
	});

	ts.set("cancel", {
		callback: function(name){
			console.log("cancel: " + name);
		}
	});

	ts.set("confirm", {
		callback: function(name){
			console.log("confirm: " + name);
		}
	});

	
	ts.render();
});