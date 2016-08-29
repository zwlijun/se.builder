;define(function(require, exports, module){
    var ErrorTypes = null;
    var RespTypes = null;
    var ResponseProxy = null;
    var DataCache =  null;
    var CMD = null;
    var Util = null;
    var ActionSheet = null;
    
    var Logic = {
        init: function(){

        }
    };

    var Bridge = {
        plugin: null,
        connect: function(target){
            Bridge.plugin = target;

            var expando = target.expando;

            ErrorTypes = expando.errors;
            RespTypes = expando.types;
            ResponseProxy = expando.response;
            DataCache =  expando.cache;
            CMD = expando.cmd;
            Util = expando.util;
            ActionSheet = expando.sheet;

            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R16B0408",
        "connect": Bridge.connect
    }
});