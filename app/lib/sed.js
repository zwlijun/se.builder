//replace files and set timestamp
//sed -i "" 's#logic/www/app1/index#logic/www/app1/index.22222#g' `grep -E logic/www/app1/index -rl ./app1`

"use strict"

var fs    = require("fs");
var childProcess  = require("child_process");

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
    console.log(message);
};

exports.run = function (sock, project, deploy, win32) {
    // body...
    $sock = sock;

    if(deploy.sed && true === deploy.sed.turn){
        var script = process.cwd();

        if(win32){
            console.log("shell://" + script + "\\timestamp.cmd");
            childProcess.exec(script + "\\timestamp.cmd", {
                encoding: 'utf8',
                timeout: 24 * 60 * 60 * 1000,
                maxBuffer: 100000 * 1024, // 默认 200 * 1024
                killSignal: 'SIGTERM'
            }, function(error, stdout, stderr){
                console.log("==========执行完成::错误信息 START==========");
                console.log(error);
                console.log("==========执行完成::错误信息 END==========");

                emit("deploy", "SED脚本执行完成");
                emit("end", "构建完成");
            });
        }else{
            console.log("shell://" + script + "/timestamp.sh");
            childProcess.execFile(script + "/timestamp.sh", [], {
                encoding: 'utf8',
                timeout: 24 * 60 * 60 * 1000,
                maxBuffer: 100000 * 1024, // 默认 200 * 1024
                killSignal: 'SIGTERM'
            }, function(error, stdout, stderr){
                console.log("==========执行完成::错误信息 START==========");
                console.log(error);
                console.log("==========执行完成::错误信息 END==========");

                emit("deploy", "SED脚本执行完成");
                emit("end", "构建完成");
            });
        }
    }else{
        emit("deploy", "没有设置SED或者SED功能已关闭");
        emit("end", "构建完成");
    } 
}