define(function(require, exports, module){
    var LazyLoader = require("mod/se/lazyloader");

    var lazy = LazyLoader.newInstance("test")
    lazy.options({
        "interval": 300
    }).watch()
});