;define(function(require, exports, module){
	var LoggerUtil      = require("mod/se/logger");

	(function(){
		var logger = LoggerUtil.getLogger("test", "/log", "|");
        var dataset = logger.dataset();


        var os = logger.os();
        var browser = logger.browser();

        dataset.put("q", "logger")
               .put("q", "test")
               .put("q", "0")
               .put("q", "ok")
               .put("q", os)
               .put("q", browser);

        LoggerUtil.out.info(decodeURIComponent(dataset.toString()));
        logger.collect(true);
	})();
});