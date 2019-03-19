const path = require("path");

exports.conf = function(project, target){
	var env = project.env;
	var root = env.root;

	var prefix = {
		"default": "/"
	};

	var _urlPrefix = prefix[target || "default"] || "/";
	var _hashChars = (new Array(41)).join("?");

	return {
	    "importWorkboxFrom": "local",
	    "skipWaiting": true,
	    "clientsClaim": true,
	    "ignoreURLParametersMatching": [/./],
	    "runtimeCaching": [],
	    "modifyURLPrefix": {
	    	"static": _urlPrefix + "static"
	    },
	    "globDirectory": root.doc,
	    "globPatterns": [
	        "." + root.bin + "**/*." + _hashChars + ".{css,png,jpg,jpeg}",
            "." + root.bin + "**/*.mix." + _hashChars + ".js",
	        "." + (path.join(root.bin, "..")).replace(/\\/g, "/") + "/fonts/**/*.{svg,ttf,woff,eot}"
	    ]
	};
};