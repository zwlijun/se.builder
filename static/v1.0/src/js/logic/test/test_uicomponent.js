;define(function(require, exports, module){
	var LayerBox = require("mod/ui/layerbox");
	var Loading = require("mod/ui/loading");
	var LogicBox = require("mod/ui/logicbox");
	var FrameBox = require("mod/ui/framebox");

	LayerBox.conf({
		"skin": "aabb",
		"text": "这里是一条文案",
		"type": LayerBox.Types.RIGHT,
		"btns": [
			{"label": "取消", "handler": {
				callback: function(layerbox, index, name){
					layerbox.hide();

					var frame = FrameBox.newFrameBox("hello");

					frame.conf({
						titleBar: true,
						statusBar: true,
						title: "我是标题",
						content: '<h2>我是内容主题</h2><div>我是内容</div><div>我是内容</div><div>我是内容</div><div>我是内容</div><div>我是内容</div>',
						onvisible: {
							callback: function(framebox, name, mask){
								framebox.size(800, 500);
							}
						}
					}).show()
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
	}, 1500);

	var lb = LogicBox.newLogicBox("test");

	lb.conf({
		"skin": "aabb"
	}).update("<h1>Hello World</h1>").show();
});