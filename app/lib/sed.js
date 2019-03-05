//replace files and set timestamp

"use strict"

var fs    = require("fs");
var crypto = require('crypto');
var childProcess  = require("child_process");
var serviceWorkGen = require("./serviceworker");

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

var isHash = function(str){
    var pattern = /\.[a-fA-F0-9]{40}/;
    pattern.lastIndex = 0;

    return pattern.test(str);
};

var isFileExt = function(str){
    var pattern = /\.(js|css|png|jpg|jpeg)/;
    pattern.lastIndex = 0;

    return pattern.test(str);
};

var replace = function(content, replacement, isRequire){
    var patterns = [
        /^(.*)(\.[a-fA-F0-9]{40})(\.(js|css|png|jpg|jpeg))$/g,
        /^(.*)(\.(js|css|png|jpg|jpeg))$/g,
        /^(.*)(\.[a-fA-F0-9]{40})$/g,
        /^(.*)$/g
    ];
    var pattern = null;
    var matcher = null;

    var prefix = null;
    var hash = null;
    var ext = null;

    var regexp = null;
    var buf = [];

    for(var i = 0; i < patterns.length; i++){
        pattern = patterns[i];
        pattern.lastIndex = 0;

        matcher = pattern.exec(replacement);

        if(null !== matcher){
            break;
        }
    }

    if(null !== matcher){
        prefix = matcher[1];

        if(matcher[2]){
            hash = isHash(matcher[2]) ? matcher[2] : null;
            ext = isFileExt(matcher[2]) ? matcher[2] : null;
        }

        if(matcher[3]){
            ext = matcher[3];
        }

        if(true === isRequire){
            regexp = new RegExp((prefix.replace(/([\.\-])/g, "\\$1")) + '(\\.[0-9a-fA-F]{40})?("|\\.js)', "gmi");
            content = content.replace(regexp, replacement + "$2");
        }else{
            regexp = new RegExp((prefix.replace(/([\.\-])/g, "\\$1")) + '(\\.[0-9a-fA-F]{40})?(\\.css|\\.png|\\.jpg|\\.jpeg)', "gmi");
            content = content.replace(regexp, replacement);
        }
        
        return content;
    }

    return content;
};

var readCount = 0;
var writeCount = 0;
var startTime = 0;
var find = function(path, replacementItems, charset, inParams){
    fs.stat(path, function(error, stats){
        emit("encoding", "sed::find path: " + path);
        if(error){
            emit("error", "sed::find path error, path: " + path);

            throw error;
        }

        if(stats.isDirectory()){
            fs.readdir(path, charset, function(error, files){
                if(error){
                    emit("error", "sed::read file error, path(0): " + path);

                    throw error;
                }

                files.forEach(function(file){
                    find(path + "/" + file, replacementItems, charset, inParams);
                });
            });
        }else if(stats.isFile()){
            fs.readFile(path, charset, function(error, files){
                if(error){
                    emit("error", "sed::read file error, path(1): " + path);

                    throw error;
                }

                readCount++;

                var content = files;

                for(var i = 0; i < replacementItems.length; i++){
                    var item = replacementItems[i];

                    if("js" == item.alias){
                        content = replace(content, item.relative.requireSignUri, true);
                    }else{
                        content = replace(content, item.relative.signSource, false);
                    }
                }

                fs.writeFile(path, content, charset, function(error){
                    if(error){
                        emit("error", "sed::write file error, path: " + path);

                        throw error;
                    }
                    writeCount++;
                    emit("encoding", "sed::[" + writeCount + "/" + readCount + "] " + path);

                    if(writeCount == readCount){
                        var endTime = Date.now();
                        var cost = endTime - startTime;
                        emit("deploy", "SED执行完成, 花费 " + cost + " ms");
                        // emit("end", "构建完成");
                        serviceWorkGen.fetch($sock, inParams);
                    }
                });
            });
        }
    });
};

exports.hash = function(sock, project, deploy, replaceItems){
    $sock = sock;

    readCount = 0;
    writeCount = 0;
    startTime = Date.now();

    var charset = (project.charset).replace(/\-/g, "");

    const inParams = {
        "project": project,
        "deploy": deploy,
        "replaceItems": replaceItems
    };

    if(deploy.sed && true === deploy.sed.turn){
        for(var path in replaceItems){
            if(replaceItems.hasOwnProperty(path)){
                find(path, replaceItems[path], charset, inParams);
            }
        } 
    }else{
        emit("deploy", "没有设置SED或者SED功能已关闭");
        emit("end", "构建完成");
    }
}

