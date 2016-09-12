;define(function(require, exports, module){
//---------------------------
var Util            = require("mod/se/util");
var CMD             = require("mod/se/cmd");
var DataType        = require("mod/se/datatype");
var DataProxy       = require("mod/se/dataproxy");
var Request         = require("mod/se/request");
var Storage         = require("mod/se/storage");
var TemplateEngine  = require("mod/se/template");

var ErrorTypes = CMD.ErrorTypes;
var RespTypes = CMD.ResponseTypes;
var ResponseProxy = DataProxy.ResponseProxy;
var DataCache =  DataProxy.DataCache;

var Persistent = Storage.Persistent;
var Session = Storage.Storage;

var PreventDefaultLink = function(){
    $("body").on("click", 'a[href="#none"]', function(e){
        e.preventDefault();
    }).on("click", 'a[href="#"]', function(e){
        e.preventDefault();
    }).on("click", 'a[href="###"]', function(e){
        e.preventDefault();
    });
};

var _App = {
    _conf: {},
    conf: function(){
        var args = arguments;
        var size = args.length;

        if(size <= 0 || size > 2){
            return ;
        }

        var key = "";
        var value = "";

        if(size == 2){
            key = args[0];
            value = args[1];

            if(key in _App._conf){
                if(DataType.isObject(value)){
                    var tmp = _App._conf[key];

                    _App._conf[key] = $.extend(true, {}, tmp, value);
                }else{
                    _App._conf[key] = value;
                }
            }else{
                _App._conf[key] = value;
            }
        }else{
            key = args[0];
            if(key in _App._conf){
                return _App._conf[key];
            }

            return undefined;
        }
    },
    init: function(conf){
        _App._conf = conf;

        var alias = _App.conf("alias");

        Util.watchAction("body", [
            {type: "click", mapping: null, compatible: null}
        ], null);

        if(conf.message){
            CMD.setBubbleTips(conf.message);
        }
        PreventDefaultLink();
    }
};

module.exports = {
    "version": "R16B0408",
    "init": _App.init,
    "conf": _App.conf,
    "expando": {
        "util": Util,
        "cmd": CMD,
        "errors": ErrorTypes,
        "types": RespTypes,
        "request": Request,
        "response": ResponseProxy,
        "cache": DataCache,
        "template": TemplateEngine,
        "persistent": Persistent,
        "session": Session,
        "typeof": DataType
    }
}
//---------------------------
});