//create service work

"use strict"

var workboxBuild = require("workbox-build");

var $sock = null;

var emit = function(state, message){
    $sock.emit("encode", {
        "head": {
            "cmd": "encode",
            "state": state
        },
        "body": {
            "message": message
        }
    });

    if("error" == state){
        console.log("\x1B[31m", message, "\x1B[39m")
    }else if("deploy" == state){
        console.log("\x1B[34m", message, "\x1B[39m");
    }else if("encoding" == state){
        console.log("\x1B[35m", message, "\x1B[39m");
    }else{
        console.log("\x1B[36m", message, "\x1B[39m");
    }
};

function generate(swc, proj, swDest, targets){
	const target = targets.shift();
	const cacheId = proj.alias + "-" + (target || "default");
	const swDestFile = undefined === target ? swDest : swDest.replace(".js", `-${target}.js`);

	console.log(`generate sw[${target}]: ${swDestFile} / ${cacheId}`);

	if(swc.conf){
		swc.options = require(swc.conf).conf(proj, target);
	}

	workboxBuild.generateSW(Object.assign({
		"swDest": swDestFile,
		"cacheId": cacheId
	}, swc.options || {})).then(({count, size}) => {
		emit("deploy", `Generated ${swDestFile}, which will precache ${count} files, totaling ${size} bytes.`);

		if(targets.length > 0){
			generate(swc, proj, swDest, targets);
		}else{
			emit("end", "构建完成");
		}
	}).catch((err) => {
		emit("error", "`service-work`生成失败: " + err.message);
		// emit("end", "构建失败");
	})
}

exports.fetch = function(sock, conf){
	$sock = sock;

	var proj = conf.project;
	var env = proj.env;

	var root = env.root;
	var swc = env.serviceWork;

	if(true === swc.turn){
		const swDest = root.doc + swc.path + swc.dest;
		const targets = [].concat(swc.targets || []);

		generate(swc, proj, swDest, targets);
	}else{
		emit("deploy", "`service-work`服务没有打开");
		emit("end", "构建完成");
	}
}