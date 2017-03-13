;define(function(require, exports, module){
	var LivePlayer = require("mod/ui/liveplayer");

	var player = LivePlayer.createLivePlayer("test_liveplayer");

	player.set("render", {
		callback: function(name, isFirst){
			// var master = this.getLivePlayerMasterVideo(true);
			this.setTencentX5VideoPosition(0, 0);

			$("body").append("<p>LivePlayer::Event#Render</p>");
			$("body").append("<p>LivePlayer::Style#" + master.getAttribute("style") + "</p>");
		},
		context: player
	});
	player.set("fullscreenchange", {
		callback: function(e, name, element){
			$("body").append("<p>LivePlayer::Event#FullScreenChange</p>");
		},
		context: player
	});
	player.set("fullscreenerror", {
		callback: function(e, name, element){
			$("body").append("<p>LivePlayer::Event#FullScreenError</p>");
		},
		context: player
	});
	player.set("webkitbeginfullscreen", {
		callback: function(e, name, element){
			$("body").append("<p>LivePlayer::Event#WebkitBeginFullScreen</p>");
		},
		context: player
	});
	player.set("webkitendfullscreen", {
		callback: function(e, name, element){
			$("body").append("<p>LivePlayer::Event#WebkitEndFullScreen</p>");
		},
		context: player
	});
	player.set("x5videoenterfullscreen", {
		callback: function(e, name, element){
			var master = this.getLivePlayerMasterVideo(true);
			
			this.setTencentX5VideoPosition(0, 0);

			$("body").append("<p>LivePlayer::Event#X5VideoEnterFullScreen</p>");
			$("body").append("<p>LivePlayer::Style#" + master.getAttribute("style") + "</p>");
		},
		context: player
	});
	player.set("x5videoexitfullscreen", {
		callback: function(e, name, element){
			$("body").append("<p>LivePlayer::Event#X5VideoExitFullScreen</p>");
		},
		context: player
	});
	
    player.render();

});