;define(function(require, exports, module){
	var ote      = require("mod/ui/orgchart");

	ote.newInstance("ote").render(".app-body", ORG_NODE_DATA);
});