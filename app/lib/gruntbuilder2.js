//grunt file builder

"use strict"

var win32       = "win32" == require('os').platform();
var fs          = require("fs");
var fse         = require("fs-extra");
var spawn       = require("child_process").spawn;
var exec        = require("child_process").exec;
var cs          = require("./checksum");
var sedShell    = require("./sed");

var _Socket = null;
var _Project = null;
var _Files = null;

var npmTask = [];
var gruntTask = [];
var gruntTaskString = "";

var buildTempDir = "__build__";
var transportTempDir = "__transport__";

var gruntfileTemplate = "";

var sedList = [];

var emit = function(state, message){
    _Socket.emit("encode", {
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

var GetProjectInfo = function(){
    var o = {
        "name": _Project.name,
        "alias": _Project.alias,
        "vctrl": _Project.vctrl,
        "rsync": _Project.rsync,
        "lock": _Project.lock,
        "charset": _Project.charset || "utf-8",
        "sign": _Project.sign || "sha1",
        "banner": _Project.banner
    }

    return o;
};

var GetEnvInfo = function(){
    var env = _Project.env;
    return {
        "name": env.name,
        "alias": env.alias,
        "root": env.root
    };
};

var GetBuildInfo = function(){
    var env = _Project.env;

    return env.build;
};

var LoadGruntfileTemplate = function(){
    fs.readFile("./tpl/Gruntfile.tpl", "utf8", function(err, data){
        if(err){
            emit("error", "读取Gruntfile模板文件失败");
        }else{
            gruntfileTemplate = data;

            updateGruntFile("project", JSON.stringify(_Project));

            mkdirs(function(){
                var env = GetEnvInfo();
                var root = env.root;
                var doc = root.doc;
                var src = root.src;

                var path = doc + src;

                fse.mkdirs(path + buildTempDir, function(err){
                    if(err){
                        emit("error", "创建构建__build__目录失败");
                    }else{
                        fse.mkdirs(path + transportTempDir, function(err){
                            if(err){
                                emit("error", "创建构建__transport__目录失败");
                            }else{
                                sedList.length = 0;
                                sedList = [];
                                createTask();
                                buildGruntFile();
                            }
                        })
                    }
                });
            });
        }
    });
};

var mkdirs = function(callback){
    var env = GetEnvInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;

    var path = doc + src;

    fs.exists(path, function(exists){
        if(!exists){
            fs.mkdir(path, "0766", function(err){
                if(err){
                    emit("error", "创建目录失败（" + path + "）");
                }else{
                    callback.apply(null, []);
                }
            });
        }else{
            callback.apply(null, []);
        }
    });
};

var updateGruntFile = function(name, str){
    gruntfileTemplate = gruntfileTemplate.replace("//{" + name + "}", str);
};

var registNpmTask = function(name){
    npmTask.push('grunt.loadNpmTasks("' + name + '");\n');
};

var registGruntTask = function(name){
    gruntTask.push(name);

    gruntTaskString = 'grunt.registerTask("default", ["' + gruntTask.join('", "') + '"]);\n';
};

var createTask = function(){
    var build = GetBuildInfo();

    var alias = build.alias;
    var transport = build.transport;

    npmTask.length = 0;
    npmTask = [];
    gruntTask.length = 0;
    gruntTask = [];

    switch(alias){
        case "js":
            registNpmTask("grunt-contrib-jshint");
            registNpmTask("grunt-contrib-uglify");
            registNpmTask("grunt-contrib-concat");

            if(transport){
                registNpmTask('grunt-cmd-transport');
            }
            registGruntTask("jshint");

            if(transport){
                registGruntTask("transport");
            }
            registGruntTask("uglify");
            registGruntTask("concat");
        break;
        case "html":
            registNpmTask("grunt-contrib-htmlmin");
            registGruntTask("htmlmin");
        break;
        case "css":
            registNpmTask("grunt-contrib-cssmin");
            registNpmTask("grunt-contrib-concat");
            registGruntTask("cssmin");
            registGruntTask("concat");
        break;
        case "img":
            registNpmTask("grunt-contrib-imagemin");
            registGruntTask("imagemin");
        break;
    }

    updateGruntFile("npmTasks", npmTask.join(""));
    updateGruntFile("task", gruntTaskString);
};

var buildGruntFile = function(){
    var build = GetBuildInfo();

    var alias = build.alias;

    if(alias in buildGruntFile){
        buildGruntFile[alias].apply(null, [_Files]);

        writeGruntFile();
    }else{
        emit("error", "未知的构建类型(" + alias + ")");
    }
};

buildGruntFile.js = function(files){
    var conf = {};
    var project = GetProjectInfo();
    var env = GetEnvInfo();
    var buildInfo = GetBuildInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;
    var bin = root.bin;
    var sed = root.sed;

    conf["jshint"] = {
        "all": []
    };

    conf["uglify"] = {
        "options": {
            "preserveComments": false,
            "mangle": {
                "except": ["require", "exports", "module"]
            },
            "report": "gzip",
            "banner": project.banner
        },
        "default": {
            "files": (function(list){
                var size = list.length;
                var file = null;

                var ret = {};
                var distFile = null;
                var srcFile = null;
                var path = null;

                for(var i = 0; i < size; i++){
                    // map.files.push({
                    //     "type" : treeType,
                    //     "name": itemName,
                    //     "relative": itemRelative,
                    //     "folder": itemFolder,
                    //     "folderCheckSum": itemCheckSum,
                    //     "file" : fileAbsolutePath,
                    //     "fileName": fileName,
                    //     "fileType": fileType,
                    //     "fileExtName": fileExtName,
                    //     "fileCheckSum": fileCheckSum,
                    //     "isUpdate": isUpdate
                    // });
                    file = list[i];
                    path = file.file;

                    srcFile = path.replace(doc + src, doc + src + transportTempDir + "/"); //从__transport__目录获取源文件
                    distFile = path.replace(doc + src, doc + src + buildTempDir + "/") //将__transport__目录下的文件构建到__build__目录

                    ret[distFile] = [srcFile];
                }

                return ret;
            })(files)
        }
    };

    conf["concat"] = {
        "default": {
            "options": {
                "process": true
            },
            "files": (function(info){
                var files = info.files;
                var item = null;
                var concat = null;
                var uglifyFiles = conf["uglify"]["default"]["files"];

                var ret = {};
                var full = null;

                for(var key in files){
                    if(files.hasOwnProperty(key)){
                        item = files[key];
                        concat = item.concat || {};

                        for(var file in concat){ //-------
                            if(concat.hasOwnProperty(file)){
                                full = doc + src + buildTempDir + "/" + item.folder + "/" + file;
                                if(!(full in ret)){
                                    ret[full] = [];
                                }

                                var concatSize = concat[file].length;
                                var concatItem = null;
                                var checkCount = 0;
                                var concatFilePath = null;

                                for(var i = 0; i < concatSize; i++){
                                    concatItem = concat[file][i];

                                    concatFilePath = doc + src + buildTempDir + "/"  + item.folder + "/"  + concatItem.file;

                                    if((concatFilePath in uglifyFiles)){
                                        checkCount++;
                                    }

                                    ret[full].push(concatFilePath);
                                }

                                if(checkCount != concatSize){
                                    delete ret[full];
                                }
                            }
                        }
                    }
                }

                return ret;
            })(buildInfo)
        }
    };

    conf["transport"] = {
        "expand": {
            "options": {
                "debug": false,
                "paths": [
                    doc + src + "js"
                ]
            },
            "files": [
                {
                    "expand": true,
                    "cwd": doc + src + transportTempDir + "/js",
                    "src": "**/*.js",
                    "dest": doc + src + transportTempDir + "/js"
                }
            ]
        }
    };

    updateGruntFile("conf", "conf = " + JSON.stringify(conf));
};

buildGruntFile.css = function(files){
    var conf = {};
    var project = GetProjectInfo();
    var env = GetEnvInfo();
    var buildInfo = GetBuildInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;
    var bin = root.bin;
    var sed = root.sed;

    conf["cssmin"] = {
        "default": {
            "options": {
                "banner": project.banner,
                "report": "gzip"
            },
            "files": (function(list){
                var size = list.length;
                var file = null;

                var ret = {};
                var distFile = null;
                var srcFile = null;
                var path = null;

                for(var i = 0; i < size; i++){
                    // map.files.push({
                    //     "type" : treeType,
                    //     "name": itemName,
                    //     "relative": itemRelative,
                    //     "folder": itemFolder,
                    //     "folderCheckSum": itemCheckSum,
                    //     "file" : fileAbsolutePath,
                    //     "fileName": fileName,
                    //     "fileType": fileType,
                    //     "fileExtName": fileExtName,
                    //     "fileCheckSum": fileCheckSum,
                    //     "isUpdate": isUpdate
                    // });
                    file = list[i];
                    path = file.file;

                    srcFile = path.replace(doc + src, doc + src + transportTempDir + "/"); //从__transport__目录获取源文件
                    distFile = path.replace(doc + src, doc + src + buildTempDir + "/") //将__transport__目录下的文件构建到__build__目录

                    ret[distFile] = [srcFile];
                }

                return ret;
            })(files)
        }
    };

    conf["concat"] = {
        "default": {
            "options": {
                "process": true
            },
            "files": (function(info){
                var files = info.files;
                var item = null;
                var concat = null;
                var uglifyFiles = conf["cssmin"]["default"]["files"];

                var ret = {};
                var full = null;

                for(var key in files){
                    if(files.hasOwnProperty(key)){
                        item = files[key];
                        concat = item.concat || {};

                        for(var file in concat){ //-------
                            if(concat.hasOwnProperty(file)){
                                full = doc + src + buildTempDir + "/" + item.folder + "/" + file;
                                if(!(full in ret)){
                                    ret[full] = [];
                                }

                                var concatSize = concat[file].length;
                                var concatItem = null;
                                var checkCount = 0;
                                var concatFilePath = null;

                                for(var i = 0; i < concatSize; i++){
                                    concatItem = concat[file][i];

                                    concatFilePath = doc + src + buildTempDir + "/"  + item.folder + "/"  + concatItem.file;

                                    if((concatFilePath in uglifyFiles)){
                                        checkCount++;
                                    }

                                    ret[full].push(concatFilePath);
                                }

                                if(checkCount != concatSize){
                                    delete ret[full];
                                }
                            }
                        }
                    }
                }

                return ret;
            })(buildInfo)
        }
    };

    updateGruntFile("conf", "conf = " + JSON.stringify(conf));
};

buildGruntFile.img = function(files){
    var conf = {};
    var project = GetProjectInfo();
    var env = GetEnvInfo();
    var buildInfo = GetBuildInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;
    var bin = root.bin;
    var sed = root.sed;

    conf["imagemin"] = {
        "default": {
            "options": {
                optimizationLevel: 3
            },
            "files": (function(list){
                var size = list.length;
                var file = null;

                var ret = {};
                var distFile = null;
                var srcFile = null;
                var path = null;

                for(var i = 0; i < size; i++){
                    // map.files.push({
                    //     "type" : treeType,
                    //     "name": itemName,
                    //     "relative": itemRelative,
                    //     "folder": itemFolder,
                    //     "folderCheckSum": itemCheckSum,
                    //     "file" : fileAbsolutePath,
                    //     "fileName": fileName,
                    //     "fileType": fileType,
                    //     "fileExtName": fileExtName,
                    //     "fileCheckSum": fileCheckSum,
                    //     "isUpdate": isUpdate
                    // });
                    file = list[i];
                    path = file.file;

                    srcFile = path.replace(doc + src, doc + src + transportTempDir + "/"); //从__transport__目录获取源文件
                    distFile = path.replace(doc + src, doc + src + buildTempDir + "/") //将__transport__目录下的文件构建到__build__目录

                    ret[distFile] = srcFile;
                }

                return ret;
            })(files)
        }
    };

    updateGruntFile("conf", "conf = " + JSON.stringify(conf));
};

var writeGruntFile = function(){
    fs.writeFile("./Gruntfile.js", gruntfileTemplate, "utf8", function(err){
        if(err){
            emit("error", "创建GruntFile失败");
        }else{
            readyBuildFiles();
        }
    });
};

var readyBuildFiles = function(){
    var env = GetEnvInfo();
    var buildInfo = GetBuildInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;

    fse.copy(doc + src + buildInfo.alias, doc + src + transportTempDir + "/" + buildInfo.alias, function(err){
        if(err){
            emit("error", "复制源文件(" + doc + src + buildInfo.alias + ")到__transport__目录失败");
        }else{
            console.log("copy from: " + doc + src + buildInfo.alias);
            console.log("copy to: " + doc + src + transportTempDir + "/" + buildInfo.alias);

            startGruntApp();
        }
    });
};

var addEscape = function(str){
    str = str.replace(/\./g, "\\.");
    str = str.replace(/\-/g, "\\-");
    str = str.replace(/\//g, "\\/");

    return str;
};

var parseRelativeName = function(relativeName, sign, alias){
    var p = /(\/[a-z0-9_\-\/\.]+\/)+(([^\/]+)(\.[a-zA-Z]+))$/gi;
    var matcher = null;
    var result = null;
    var aliasPath = "/" + alias + "/";
    var aliasLength = aliasPath.length;

    p.lastIndex = 0;

    if(null !== (matcher = p.exec(relativeName))){
        result = {
            "source": matcher[0],
            "path": matcher[1],
            "fileName": matcher[2],
            "shortName": matcher[3],
            "ext": matcher[4],

            "signSource": matcher[1] + matcher[3] + "." + sign + matcher[4],
            "signFileName": matcher[3] + "." + sign + matcher[4],
            "signShortName": matcher[3] + "." + sign,
            "signExt": "." + sign + matcher[4],

            "aliasSource": matcher[0].substring(aliasLength),
            "aliasPath": matcher[1].substring(aliasLength),
            "aliasSignSource": (matcher[1] + matcher[3] + "." + sign + matcher[4]).substring(aliasLength),
            "requireUri": matcher[0].substring(aliasLength, matcher[0].indexOf(matcher[4])),
            "requireSignUri": (matcher[1] + matcher[3] + "." + sign + matcher[4]).substring(aliasLength, ((matcher[1] + matcher[3] + "." + sign + matcher[4])).indexOf(matcher[4]))
        };

        result.escape = {};

        for(var key in result){
            if(result.hasOwnProperty(key)){
                if(Object.prototype.toString.call(result[key]) == "[object String]"){
                    result.escape[key] = addEscape(result[key]);
                }
            }
        }

        return result;
    }

    emit("error", "文件(" + relativeName + ")路径解析失败");

    return result;
};

var writeChecksum = function(file, isDest){
    //setTimeout(function(){
        if(fs.existsSync(file)){
            cs.FileSHA1CheckSum(file, function(filename, checksum, isSame){
                cs.WriteSHA1CheckSum(filename, checksum);

                var _project = GetProjectInfo();
                var _env = GetEnvInfo();
                var _deploy = GetBuildInfo();
                var _sed = _deploy.sed;
                var _root = _env.root;
                var _docDir = _root.doc;
                var _srcDir = _root.src;
                var _binDir = _root.bin;
                var _sedDir = _root.sed;
                var _sedRoot = _docDir + _sedDir;
                var checksumLength = checksum.length;
                var nodeCharset = (_project.charset).replace(/\-/g, "");
                
                if(isDest && _sed && true === _sed.turn){ //create sed command
                    //sed "" 's#logic/www/app1/index#logic/www/app1/index.22222#g' `grep logic/www/app1/index -rl ./app1`
                    var relativeName = filename.substring(filename.indexOf(buildTempDir) + buildTempDir.length);
                    var relativeData = parseRelativeName(relativeName, checksum, _deploy.alias);
                    var escapeData = relativeData.escape;

                    var sedSubPaths = _sed.paths || [""];

                    var ext = relativeData.ext;
                    var signExt = relativeData.signExt;
                    var signReg = '\\\(\\\.[0-9a-fA-F]\\\{' + checksumLength + '\\\}\\\)\\\{0,1\\\}';
                    var nonEscapeSignReg = '(\\\.[0-9a-fA-F]{' + checksumLength + '}){0,1}';

                    var sedName = null;
                    var findName = null;
                    var nonEscapeFindName = null;

                    var rsopts = {
                        flags: 'r',
                        mode: "0644",
                        encoding: nodeCharset,
                        autoClose: true
                    };

                    var wsopts = {
                        mode : "0644",
                        defaultEncoding: nodeCharset
                    };

                    if("img" == _deploy.alias){
                        delete rsopts.encoding;
                        delete wsopts.defaultEncoding;
                    }

                    var irs = fs.createReadStream(filename, rsopts);
                    var ows = fs.createWriteStream(filename.replace(ext, signExt), wsopts);

                    irs.pipe(ows);

                    sedName = relativeData.signSource;
                    findName = escapeData.path + escapeData.shortName + signReg + escapeData.ext;
                    nonEscapeFindName = escapeData.path + escapeData.shortName + nonEscapeSignReg + escapeData.ext;

                    //  grep -Ei "%string%" somefile.txt | sed "s/^/  /"

                    for(var i = 0, len = sedSubPaths.length; i < len; i++){
                        if(!findName || !sedName){
                            continue;
                        }
                        
                        if(win32){
                            sedList.push("@call sed.cmd " + sedName + " " + _sedRoot + sedSubPaths[i] + " " + _project.charset);
                        }else{
                            sedList.push("sed -i \"\" 's#" + findName + "#" + sedName + "#g' `grep -E " + findName + " -rl " + _sedRoot + sedSubPaths[i] + "`");
                        }
                    }

                    if("js" == _deploy.alias){
                        sedName = "\\\"" + relativeData.requireSignUri + "\\\"";
                        findName = "\\\"" + escapeData.aliasPath + escapeData.shortName + signReg + "\\\"";
                        nonEscapeFindName = "\\\"" + escapeData.aliasPath + escapeData.shortName + nonEscapeSignReg + "\\\"";

                        for(var i = 0, len = sedSubPaths.length; i < len; i++){
                            if(!findName || !sedName){
                                continue;
                            }
                            
                            if(win32){
                                sedList.push("@call sed.cmd " + sedName + " " + _sedRoot + sedSubPaths[i]);
                            }else{
                                sedList.push("sed -i \"\" 's#" + findName + "#" + sedName + "#g' `grep -E " + findName + " -rl " + _sedRoot + sedSubPaths[i] + "`");
                            }
                        }
                    }
                }

                emit("encoding", "storage file sign: " + checksum);
            });
        }
    //}, 0);
}

var writeDestChecksum = function(file){
    emit("encoding", "create dest file sign...");
    writeChecksum(file, true);
}

var writeSourceChecksum = function(file){
    emit("encoding", "create source file sign...");
    writeChecksum(file, false);
}

var parseGruntData = function(str){
    var prefix = "File ";
    var startIndex = str.indexOf(prefix) + prefix.length;
    var endIndex = str.indexOf(" created");
    var min = str.substring(startIndex, endIndex);
    var source = min.replace("/" + buildTempDir + "/", "/");

    writeSourceChecksum(source);
    writeDestChecksum(min);
}

var parseGruntImageData = function(str){
    var env = GetEnvInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;
    var prefix = "✔ ";
    var startIndex = str.indexOf(prefix) + prefix.length;
    var endIndex = str.indexOf(" (saved");
    var source = str.substring(startIndex, endIndex);
    var min = doc + src + buildTempDir + source.replace(doc + src + transportTempDir, "");

    source = source.replace("/" + transportTempDir + "/", "/");

    writeSourceChecksum(source);
    writeDestChecksum(min);
}

var startGruntApp = function(){
    emit("encoding", "call Grunt....");
    emit("encoding", "dir: " + process.cwd());
    emit("encoding", "Run at Win32: " + win32);

    console.log("Run at Win32: " + win32);

    var gruntFile = process.cwd() + "/Gruntfile.js";
    var grunt = spawn(win32 ? "grunt.cmd" : "grunt", ['-gruntfile', gruntFile, "-stack", "true", "-verbose", "true"]);

    grunt.stdout.on('data', function (data) {
        // console.log(data)
        var str = data.toString("UTF-8");
        
        emit("encoding", 'grunt stdout: ' + str);

        // console.log("str: " + str);

        if(str.indexOf("File ") != -1){
            parseGruntData(str);
        }else if(str.indexOf("✔ ") != -1){
            parseGruntImageData(str);
        }
    });

    grunt.stderr.on('data', function (data) {
        emit("error", data.toString("UTF-8"));
    });

    grunt.on('close', function (code) {
        if(code === 0){
            emit("encoding", "grunt exited with code " + code);
            deploy();
        }else{
            emit("error", "grunt exited with code " + code);
        }
    });
};

var deploy = function(){
    var env = GetEnvInfo();
    var buildInfo = GetBuildInfo();
    var alias = buildInfo.alias;
    var root = env.root;
    var doc = root.doc;
    var src = root.src;
    var bin = root.bin;

    fs.exists(doc + bin, function(exists){
        if(!exists){
            fse.mkdirs(doc + bin, function(err){
                //todo
                if(err){
                    emit("error", "创建部署目录（" + doc + bin + "）失败");
                }else{
                    syncBuildFiles();
                }
            });
        }else{
            fs.exists(doc + bin + alias, function(exists){
                if(!exists){
                    //todo
                    syncBuildFiles();
                }else{
                    fse.remove(doc + bin + alias, function(err){
                        //todo
                        if(err){
                            emit("error", "删除部署目录（" + doc + bin + alias + "）失败");
                        }else{
                            syncBuildFiles();
                        }
                    });
                }
            })
        }
    });
};

var syncBuildFiles = function(){
    var env = GetEnvInfo();
    var buildInfo = GetBuildInfo();
    var alias = buildInfo.alias;
    var root = env.root;
    var doc = root.doc;
    var src = root.src;
    var bin = root.bin;

    fse.copy(doc + src + buildTempDir + "/" + alias, doc + bin + alias, function(err){
        if(err){
            console.log(err)
            emit("error", "同步构建目录(" + doc + src + buildTempDir + "/" + alias + ")失败");
        }else{
            emit("encoding", "同步构建目录成功，开始清理临时数据...");
            cleanTempData();
        }
    });
};

var cleanTempData = function(){
    var env = GetEnvInfo();
    var root = env.root;
    var doc = root.doc;
    var src = root.src;

    fse.remove(doc + src + buildTempDir, function(err){
        if(err){
            emit("error", "清除临时构建目录(" + doc + src + buildTempDir + ")失败");
        }else{
            emit("encoding", "清除临时构建目录(" + doc + src + buildTempDir + ")成功");
            fse.remove(doc + src + transportTempDir, function(err){
                if(err){
                    emit("error", "清除临时构建目录(" + doc + src + transportTempDir + ")失败");
                }else{
                    emit("encoding", "清除临时构建目录(" + doc + src + transportTempDir + ")成功");
                    execShellScript();
                }
            })
        }
    });
};

var execShellScript = function(){
    console.log("sedList: \n" + sedList.join("\n"));

    emit("encoding", "准备执行Shell脚本");

    var line = [];

    if(win32){
        var script = process.cwd();
        var sbin = script + "\\sbin";

        line.push("@echo on");
        line.push("\r\n");
        line.push("set SBIN_PATH=" + sbin);
        line.push("\r\n");
        line.push("set path=%path%;%SBIN_PATH%");
        line.push("\r\n");
        line.push(sedList.join("\r\n"));
        line.push("\r\n");

        fs.writeFile("./timestamp.cmd", line.join("\r\n"), "utf8", function(err){
            emit("encoding", "Shell脚本创建完成，开始执行...");
            sedShell.run(_Socket, _Project, GetBuildInfo(), win32);
        });
        // emit("deploy", "Windows下暂不支持文件替换");
        // emit("end", "构建完成");
    }else{
        line.push("#!/bin/bash");
        line.push("\n");
        line.push(sedList.join("\n"));
        line.push("\n");

        fs.writeFile("./timestamp.sh", line.join("\n"), "utf8", function(err){
            spawn("chmod", ["744", "./timestamp.sh"]);

            emit("encoding", "Shell脚本创建完成，开始执行...");
            sedShell.run(_Socket, _Project, GetBuildInfo(), win32);
        });
    }
}

exports.builder = {
    create: function(sock, proj, files) {
        _Socket = sock;
        _Project = proj;
        _Files = files;

        LoadGruntfileTemplate();
    }
}