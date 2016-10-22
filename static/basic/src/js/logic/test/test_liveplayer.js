;define(function(require, exports, module){
	var LivePlayer = require("mod/ui/liveplayer");

	var lp = LivePlayer.createLivePlayer("test_liveplayer", {
		name: "test_liveplayer",
		type: "vod"
	});

	lp.render();
});