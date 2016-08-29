define(function(require, exports, module){
	var SwiperFactory = require("mod/se/swiper.ie");

	var _Swiper = SwiperFactory.createSwiper("test", {
		"type": "random",
		"dots": "none",
		"loop": true,
		"autoplay": true,
		"interval": 5000,
		"width": 400,
		"height": 200
	});

	_Swiper.set("notfound", {
		callback: function(){
			console.info("notfound")
		}
	}).set("createbefore", {
		callback: function(){
			console.info("createbefore")
		}
	}).set("create", {
		callback: function(){
			console.info("create")
		}
	}).set("block", {
		callback: function(type){
			console.info("block", _Swiper.getIndex());
		}
	}).set("start", {
		callback: function(target){
			console.info("start", _Swiper.getIndex());
		}
	}).set("end", {
		callback: function(target){
			console.info("end", _Swiper.getIndex())
		}
	}).set("enterstart", {
		callback: function(target){
			console.info("enterstart")
		}
	}).set("enterend", {
		callback: function(target){
			console.info("enterend")
		}
	}).set("exitstart", {
		callback: function(target){
			console.info("exitstart")
		}
	}).set("exitend", {
		callback: function(target){
			console.info("exitend")
		}
	});

	_Swiper.create();

	window.Swiper = _Swiper;
});