;define(function(require, exports, module){
    /**
     * 业务处理
     * @type {Object}
     */
    var Logic = {
        /**
         * 初始化，业务文件加载时会自动调用
         * @return {[type]} [description]
         */
        init: function(){

        }
    };

    var Bridge = {
        connect: function(target){
            //业务初始化入口
            Logic.init();
        }
    };

    module.exports = {
        "version": "R18B0123",
        "connect": Bridge.connect
    }
});