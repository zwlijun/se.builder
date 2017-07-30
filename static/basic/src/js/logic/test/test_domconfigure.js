;define(function(require, exports, module){
  var DOMConfigure      = require("mod/se/domconfigure");

  (function(){
      var dc = DOMConfigure.initDOMConfigure("#dconf0");

      var opts = dc.define([
          {"property": "name", "dataType": "string", "format": "", "pattern": "", "defaultValue": ""},
          {"property": "age", "dataType": "number", "format": "", "pattern": "", "defaultValue": "30"},
          {"property": "qq", "dataType": "string", "format": "", "pattern": "^[1-9][0-9]{6,9}$", "defaultValue": ""},
          {"property": "birthday", "dataType": "datetime", "format": "%y-%M-%d", "pattern": "", "defaultValue": ""},
          {"property": "sn", "dataType": "string", "format": "", "pattern": "^[a-zA-Z0-9]{3}\\-[a-zA-Z0-9]{2}\\-[a-zA-Z0-9]{3}$", "defaultValue": "123-45-678"},
          {"property": "menus", "dataType": "array", "format": ",", "pattern": "", "defaultValue": ""},
          {"property": "dataset", "dataType": "json", "format": "", "pattern": "", "defaultValue": ""},
          {"property": "flag", "dataType": "boolean", "format": "", "pattern": "", "defaultValue": "0"}
      ]).parse();

      console.log(opts);
  })();
});