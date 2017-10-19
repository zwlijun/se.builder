;define(function(require, exports, module){
	var Toast      = require("mod/ui/toast");
  var Util       = require("mod/se/util");

  Util.watchAction("body", [
      {type: "tap", mapping: "click", compatible: null},
      {type: "click", mapping: null, compatible: null},
      {type: "input", mapping: null, compatible: null}
  ], null);
});