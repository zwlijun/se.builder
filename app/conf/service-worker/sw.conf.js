exports.conf = function(project){
	var env = project.env;
	var root = env.root;

	return {
	    "importWorkboxFrom": "local",
	    "skipWaiting": true,
	    "clientsClaim": true,
	    "ignoreURLParametersMatching": [/./],
	    "runtimeCaching": [{
	        "urlPattern": /\/fonts\/iconfont\//i,
	        "handler": "NetworkFirst"
	    }],
	    "modifyURLPrefix": {},
	    "globDirectory": root.doc,
	    "globPatterns": [
	        "." + root.bin + "**/*.*.{css,png,jpg,jpeg}",
	        "." + root.bin + "**/*.*.mix.*.js"
	    ]
	};
};