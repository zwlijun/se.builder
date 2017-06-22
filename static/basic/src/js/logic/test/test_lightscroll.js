;define(function(require, exports, module){
	var LightScroll = require("mod/se/lightscroll");

	var ls = LightScroll.getInstance("test_lightscroll", "#viewer", "#viewbody");

	ls.set("start", {
		callback: function(e, x, y){
			console.log("start....")
		}
	});
	ls.set("scrolling", {
		callback: function(e, x, y){
			console.log("scrolling....")
		}
	});
	ls.set("end", {
		callback: function(e, x, y){
			console.log("end....")
		}
	});
	ls.set("pushready", {
		callback: function(e, x, y){
			console.log("pushready....")
		}
	});
	ls.set("pullready", {
		callback: function(e, x, y){
			console.log("pullready....")
		}
	});
	ls.set("push", {
		callback: function(e, x, y){
			console.log("push....")
		}
	});
	ls.set("pull", {
		callback: function(e, x, y){
			console.log("pull....")
		}
	});
	ls.set("block", {
		callback: function(type){
			console.log("block...." + type)
		}
	});

	ls.refresh().configure();
});