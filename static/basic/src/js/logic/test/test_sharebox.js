;define(function(require, exports, module) {
				   require("mod/zepto/r1.2.0/touch");
	var Util     = require("mod/se/util");
	var ShareBox = require("mod/ui/sharebox");

	var share = ShareBox.newShareBox("test_sharebox");

	share.set("configure", {
		callback: function(options){
			console.log(options);
			var platforms = options.platforms;
			var size = platforms.length;
			
			for(var i = 0; i < size; i++){
				var platform = platforms[i];
				var value = null;
				var node = null;

				for(var key in platform){
					if(platform.hasOwnProperty(key)){
						value = platform[key];
						node = $(".share." + platform.type);

						node.attr("data-sharebox-" + key, encodeURIComponent(value));

						if("type" == key){
							node.attr("data-action-click", "sharebox://share/adaptor#" + options.name)
						}
					}
				}
			}
		}
	});

	share.set("native", {
		callback: function(_sharebox, conf){
			console.log(conf)
		}
	})

	share.conf({
        "name": "test_sharebox",
        "title": "分享到",
        "type": "u",
        "share": {
            "title": "",
            "description": "",
            "link": "",
            "image": "",
            "source": "",
            "summary": "",
            "external": ""
        },
        "platforms": [
            {"type": "wechat",
                "text": "微信好友",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "timeline",
                "text": "朋友圈",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "weibo",
                "text": "微博",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "mqq",
                "text": "QQ好友",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "qq",
                "text": "QQ好友",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "qzone",
                "text": "QZone",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "tqq",
                "text": "腾讯微博",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "douban",
                "text": "豆瓣",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "diandian",
                "text": "点点",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "linkedin",
                "text": "Linked In",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "facebook",
                "text": "Facebook",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "twitter",
                "text": "Twitter",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            },
            {"type": "google",
                "text": "Google",
                "aid": "",
                "akey": "",
                "title": "",
                "description": "",
                "link": "",
                "image": "",
                "source": "",
                "summary": "",
                "external": ""
            }
        ],
        "apis": {}
    });
	// share.create();


	Util.watchAction("body", [
        {type: "tap", mapping: "click", compatible: null},
        {type: "click", mapping: null, compatible: null},
        {type: "input", mapping: null, compatible: null}
    ], null);
});