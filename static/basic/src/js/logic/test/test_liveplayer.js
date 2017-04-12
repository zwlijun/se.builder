;define(function(require, exports, module){
	var LivePlayer = require("mod/ui/liveplayer");

	var player = LivePlayer.createLivePlayer("test_liveplayer");

	player.set("render", {
		callback: function(name, isFirst){
			var master = this.getLivePlayerMasterVideo(true);

			if(this.maybeUseTencentX5Core()){
				// this.setTencentX5VideoPosition("50%", "50%");
				this.setTencentX5VideoFit("contain");
			}

			$("body").append("<p>" + (navigator.userAgent) + "</p>");
			$("body").append("<p>LivePlayer::Event#Render</p>");
			$("body").append("<p>LivePlayer::UseTencentX5#" + this.maybeUseTencentX5Core() + "</p>");
			$("body").append("<p>LivePlayer::Style#" + master.getAttribute("style") + "</p>");
		},
		context: player
	});
	player.set("requestfullscreen", {
		callback: function(name){
			var master = this.getLivePlayerMasterVideo(true);
			var percentage = RemAdaptor.getRemAdaptorPercentageValue();

			if(this.maybeUseTencentX5Core()){
				var orientation = master.getAttribute("x5-video-orientation");

				if(!orientation || "portraint" === orientation){
					master.style.height = "initial";
					master.setAttribute("x5-video-orientation", "landscape");
				}else{
					master.style.height = (percentage > 0 ? (Math.max(window.screen.height, window.screen.width) / percentage) * 2 : 3000) + "px";
					master.setAttribute("x5-video-orientation", "portraint");
				}
			}

			$("body").append("<p>LivePlayer::Event#RequestFullScreen</p>");
		},
		context: player
	});
	player.set("exitfullscreen", {
		callback: function(name){
			var master = this.getLivePlayerMasterVideo(true);
			var percentage = RemAdaptor.getRemAdaptorPercentageValue();

			if(this.maybeUseTencentX5Core()){
				var orientation = master.getAttribute("x5-video-orientation");

				if(!orientation || "portraint" === orientation){
					master.style.height = "initial";
					master.setAttribute("x5-video-orientation", "landscape");
				}else{
					master.style.height = (percentage > 0 ? (Math.max(window.screen.height, window.screen.width) / percentage) * 2 : 3000) + "px";
					master.setAttribute("x5-video-orientation", "portraint");
				}
			}

			$("body").append("<p>LivePlayer::Event#ExitFullScreen</p>");
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
			var navbar = this.getLivePlayerNavBar();
			var controlbar = this.getLivePlayerControlBar();
			var percentage = RemAdaptor.getRemAdaptorPercentageValue();

			navbar.addClass("hide");
			// controlbar.addClass("hide");

			// master.controls = true;
			master.style.height = (percentage > 0 ? (Math.max(window.screen.height, window.screen.width) / percentage) * 2 : 3000) + "px";

			$("body").append("<p>LivePlayer::Event#X5VideoEnterFullScreen</p>");
			$("body").append("<p>LivePlayer::Style#" + master.getAttribute("style") + "</p>");
		},
		context: player
	});
	player.set("x5videoexitfullscreen", {
		callback: function(e, name, element){
			var master = this.getLivePlayerMasterVideo(true);
			var navbar = this.getLivePlayerNavBar();
			var controlbar = this.getLivePlayerControlBar();
			
			master.style.height = "initial";
			master.setAttribute("x5-video-orientation", "portraint");

			// master.controls = false;

			navbar.removeClass("hide");
			// controlbar.removeClass("hide");

			$("body").append("<p>LivePlayer::Event#X5VideoExitFullScreen</p>");
			$("body").append("<p>LivePlayer::Style#" + master.getAttribute("style") + "</p>");
		},
		context: player
	});
	
    player.render();

});