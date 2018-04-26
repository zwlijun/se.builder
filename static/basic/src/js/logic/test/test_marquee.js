define(function(require, exports, module){
	var Marquee     = require("mod/se/marquee");
	
	var m1 = new Marquee("m1", 50, Marquee.Direction.SCROLL_TO_UP);
	m1.init();

	var m2 = new Marquee("m2", 50, Marquee.Direction.SCROLL_TO_DOWN);
	m2.init();

	var m3 = new Marquee("m3", 10, Marquee.Direction.SCROLL_TO_LEFT);
	m3.init();

	var m4 = new Marquee("m4", 10, Marquee.Direction.SCROLL_TO_RIGHT);
	m4.init();
});