;define(function(require, exports, module){
	var LayerBox = require("mod/ui/layerbox");
	var Loading = require("mod/ui/loading");
	var LogicBox = require("mod/ui/logicbox");

	LayerBox.conf({
		"skin": "aabb",
		"text": "这里是一条文案",
		"type": LayerBox.Types.RIGHT,
		"btns": [
			{"label": "取消", "handler": {
				callback: function(layerbox, index, name){
					layerbox.hide();
				}
			}},
			{"label": "新弹层", "handler": {
				callback: function(layerbox, index, name){
					var newLayerBox = LayerBox.newLayerBox("newlayerbox");

					newLayerBox.conf({
						"text": "这里是一条文案123",
						"type": LayerBox.Types.ALARM
					}).show();
				}
			}}
		]
	}).show();

	Loading.show("加载中...");

	setTimeout(function(){
		Loading.hide();
	}, 3000);

	var lb = LogicBox.newLogicBox("test");

	lb.conf({
		"skin": "aabb"
	}).update("<h1>Hello World</h1>").show();
});