exports.conf = function(project, target){
	var env = project.env;
	var root = env.root;

	var prefix = {
		"default": "/"
	};

	var _urlPrefix = prefix[target || "default"] || "/";

	return {
	    "importWorkboxFrom": "local",
	    "skipWaiting": true,
	    "clientsClaim": true,
	    "ignoreURLParametersMatching": [/./],
	    "runtimeCaching": [{
	        "urlPattern": new RegExp((_urlPrefix).replace(/(\.)/g, "\\$1") + "fonts/iconfont/.*\\.(svg|ttf|woff|eot)", "i"),
	        "handler": "CacheFirst",
	        "options": {
	        	"cacheName": "iconfont",
                "fetchOptions": {
                    "mode": 'no-cors',
                }
	        }
	    }],
	    "modifyURLPrefix": {
	    	"static": _urlPrefix + "static"
	    },
	    "globDirectory": root.doc,
	    "globPatterns": [
	        "." + root.bin + "**/*.*.{css,png,jpg,jpeg}",
	        "." + root.bin + "**/*.*.mix.*.js"
	    ]
	};
};