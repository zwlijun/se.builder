define(function(require, exports, module){
	var ImageViewer = require("mod/ui/imageviewer");

	var viewer = ImageViewer.createImageViewer("test_imgv");

	viewer.options();

	viewer.dataset([
		{
			"source": "http://www.kukud.net/meinv/UploadFiles_3657/201103/2011030221090527.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/meinv/UploadFiles_3657/201011/20101123090929576.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/qiche/UploadFiles_2275/201012/20101206105153263.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/qiche/UploadFiles_2275/201012/20101206105142605.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/fengjing/UploadFiles_8688/201010/20101027154444622.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/qiche/UploadFiles_2275/201012/20101206105143802.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/qiche/UploadFiles_2275/201012/20101206105142901.jpg",
			"thumbnail": ""
		},
		{
			"source": "http://www.kukud.net/qiche/UploadFiles_2275/201012/20101206105144857.jpg",
			"thumbnail": ""
		}
	]);

	var swiper = viewer.render().show().getSwiper();

	swiper.sizeof("body", true);
});