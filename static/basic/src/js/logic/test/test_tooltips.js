;define(function(require, exports, module){
	var Tooltips      = require("mod/ui/tooltips");

	(function(){
		$('[data-plugin="tooltips_left"]').on("click", function(e){
			var item = $(e.currentTarget);
			var name = item.attr("data-plugin");

			var tt = Tooltips.createTooltips(name);

			console.log(name)

			tt.render(item).updateContent("<div style='height: 50px; line-height: 50px;'>这是一条Tooltips提示</div>").show();

			console.log(tt.options())
		})
		$('[data-plugin="tooltips_right"]').on("click", function(e){
			var item = $(e.currentTarget);
			var name = item.attr("data-plugin");

			var tt = Tooltips.createTooltips(name);

			console.log(name)

			tt.render(item).updateContent("<div style='height: 50px; line-height: 50px;'>这是一条Tooltips提示</div>").show();

			console.log(tt.options())
		})
		$('[data-plugin="tooltips_top"]').on("click", function(e){
			var item = $(e.currentTarget);
			var name = item.attr("data-plugin");

			var tt = Tooltips.createTooltips(name);

			console.log(name)

			tt.render(item).updateContent("<div style='height: 50px; line-height: 50px;'>这是一条Tooltips提示</div>").show();

			console.log(tt.options())
		})
		$('[data-plugin="tooltips_bottom"]').on("click", function(e){
			var item = $(e.currentTarget);
			var name = item.attr("data-plugin");

			var tt = Tooltips.createTooltips(name);

			console.log(name)

			tt.render(item).updateContent("<div style='height: 50px; line-height: 50px;'>这是一条Tooltips提示</div>").show();

			console.log(tt.options())
		})
		
	})();
});