define(function(require, exports, module){
	var Util     = require("mod/se/util");
	var Request  = require("mod/se/request");

	var ReqSchema = {
		schema: "req",
		parse: function(data, node, e, type){
			var url = $("#url").val();

			console.log(Request.parseURL(url));
		}
	};

	Util.source(ReqSchema);

	Util.watchAction("body", [
        {type: "tap", mapping: "click", compatible: null},
        {type: "click", mapping: null, compatible: null},
        {type: "input", mapping: null, compatible: null}
    ], null);
});