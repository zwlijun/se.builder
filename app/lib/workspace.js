//workspace

"use strict"

var fs = require("fs");
var cs = require("./checksum");
var projects = require("../conf/project");

var Workspace = function(){
    this.projects = projects.projects;
};

Workspace.prototype = {
    getProjectByAlias : function(alias){
        var size = this.projects.length;
        var project = null;

        for(var i = 0; i < size; i++){
            project = this.projects[i];

            if(project.alias === alias){
                return project;
            }
        }

        return null;
    },
    getProjectWorkspaceByAlias : function(projectAlias, envAlias, deployAlias){
        var project = this.getProjectByAlias(projectAlias);
        var envList = project.env;
        var envSize = envList.length;
        var env = null;
        var buildList = null;
        var buildSize = 0;
        var build = null;

        var o = {
            "name": project.name,
            "alias": project.alias,
            "vctrl": project.vctrl,
            "rsync": project.rsync,
            "lock": project.lock,
            "fullbuild": project.fullbuild,
            "charset": project.charset || "utf-8",
            "sign": project.sign || "sha1",
            "banner": project.banner,
            "env": null
        };

        cs.setCharset(o.charset);

        for(var i = 0; i < envSize; i++){
            env = envList[i];

            if(env.alias === envAlias){
                o.env = {
                    "name": env.name,
                    "alias": env.alias,
                    "root": env.root,
                    "build": null
                }

                buildList = env.build;
                buildSize = buildList.length;
                break;
            }
        }

        for(var j = 0; j < buildSize; j++){
            build = buildList[j];

            if(build.alias === deployAlias){
                o.env.build = build;
                break;
            }
        }

        return o;
    },
    isDirectory : function(name){
        var stat = fs.lstatSync(name);

        return stat.isDirectory();
    },
    isFile : function(name){
        var stat = fs.lstatSync(name);

        return stat.isFile();
    },
    filterExcludeFolders: function(map, conf, excludeFolders, basePath){
        if(!excludeFolders || excludeFolders.length === 0){
            return map;
        }
        var item = null;

        for(var key in map){
            if(map.hasOwnProperty(key)){
                item = map[key];

                if(this.matchFolder(item, excludeFolders, basePath)){
                    delete map[key];
                }
            }
        }

        return map;
    },
    filterExcludeFiles: function(map, conf, excludeFiles, basePath){
        if(!excludeFiles || excludeFiles.length === 0){
            return map;
        }

        var item = null;
        var fileList = null;
        var excSize = excludeFiles.length;
        var file = null;
        var excFile = null;

        for(var key in map){
            if(map.hasOwnProperty(key)){
                item = map[key];
                fileList = item.filelist;
                
                outer:
                for(var i = 0; i < excSize; i++){
                    excFile = basePath + "/" + excludeFiles[i];

                    // console.log("exclude match file: " + excFile);

                    inner:
                    for(var j = 0; j < fileList.length; j++){
                        file = fileList[j].absolutePath;

                        if(excFile === file){
                            // console.log("exclude source file: " + file);

                            map[key].filelist.splice(j, 1);

                            fileList = map[key].filelist;

                            continue outer;
                        }
                    }
                }
            }
        }

        return map
    },
    filterIncludeFolders: function(map, conf, includeFolders, basePath){
        if(!includeFolders || includeFolders.length === 0){
            return map;
        }

        var item = null;

        for(var key in map){
            if(map.hasOwnProperty(key)){
                item = map[key];

                if(!this.matchFolder(item, includeFolders, basePath)){
                    delete map[key];
                }
            }
        }

        return map;
    },
    filterIncludeFiles: function(map, conf, includeFiles, basePath){
        if(!includeFiles || includeFiles.length === 0){
            return map;
        }

        var item = null;
        var fileList = null;
        var incSize = includeFiles.length;
        var file = null;
        var incFile = null;

        for(var key in map){
            if(map.hasOwnProperty(key)){
                item = map[key];
                fileList = item.filelist;
                
                outer:
                for(var i = 0; i < incSize; i++){
                    incFile = basePath + "/" + includeFiles[i];

                    // console.log("include match file: " + incFile);

                    inner:
                    for(var j = 0; j < fileList.length; j++){
                        file = fileList[j].absolutePath;

                        if(incFile !== file){
                            // console.log("include source file: " + file);

                            map[key].filelist.splice(j, 1);

                            fileList = map[key].filelist;

                            continue outer;
                        }
                    }
                }
            }
        }

        return map;
    },
    matchFolder: function(item, items, basePath){
        var name = item.name;
        var size = items.length;
        var folder = null;

        for(var i = 0; i < size; i++){
            folder = items[i];
            folder = basePath + "/" + folder;

            // console.log("match source: " + name);
            // console.log("match folder: " + folder);

            if(name === folder || name.substr(0, folder.length) == folder){
                return true;
            }
        }

        return false;
    },
    ls : function(type, project, path, basePath, map){
        var env = project.env;
        var rootPath = env.root;
        var build = env.build;
        var files = build.files;
        var conf = files[type];
        var includeFiles = conf.includeFiles;
        var includeFolders = conf.includeFolders;
        var excludeFiles = conf.excludeFiles;
        var excludeFolders = conf.excludeFolders;
        var filter = build.filter;

        if(!fs.existsSync(path)){
            return null;
        }

        var fileList = fs.readdirSync(path);

        var size = fileList.length;
        var file = null;
        var absPath = null;
        var matcher = null;
        var fileType = null;
        var fileExtName = null;

        // console.log("map: " + path);
        map[path] = {
            "name": path,
            "relative": path.replace(rootPath.doc + rootPath.src, ""),
            "folder":  path.replace(/[\w\W]*\/([^\/]+)$/m, "$1"),
            "checksum": cs.TextSHA1CheckSum(path),
            "filelist": []
        };

        for(var i = 0; i < size; i++){
            file = fileList[i];

            absPath = path + "/" + file;

            // console.log("ls#absolute path: " + absPath);

            if(this.isDirectory(absPath)){
                map = this.ls(type, project, absPath, basePath, map);
            }else if(this.isFile(absPath)){
                if(null === (matcher = filter.exec(file))){
                    // console.log("ls#filter file: " + file);
                    continue;
                }
                fileType = matcher[2];
                fileExtName = matcher[1];

                if(!map[path]){
                    continue;
                }

                cs.FileSHA1CheckSum(absPath, function(filename, checksum, isUpdate, _file, _path, _type, _ext){
                    // console.log(".......................")
                    // console.log(_path);
                    // console.log(map[_path])
                    map[_path].filelist.push({
                        "absolutePath": filename,
                        "checksum": checksum,
                        "isUpdate": isUpdate,
                        "fileName": _file,
                        "fileType": _type,
                        "fileExtName": _ext
                    });
                }, [file, path, fileType, fileExtName]);
            }else{
                continue;
            }
        }

        map = this.filterExcludeFolders(map, conf, excludeFolders, basePath);
        map = this.filterExcludeFiles(map, conf, excludeFiles, basePath);
        map = this.filterIncludeFolders(map, conf, includeFolders, basePath);
        map = this.filterIncludeFiles(map, conf, includeFiles, basePath);

        // console.log(JSON.stringify(map));

        return map;
    },
    parse : function(project){
        console.log("----------------------------");
        console.log(JSON.stringify(project));
        console.log("----------------------------");

        var env = project.env;
        var rootPath = env.root;
        var build = env.build;
        var files = build.files;

        var lib = files.lib;
        var mod = files.mod;
        var logic = files.logic;

        var srcPath = rootPath.doc + rootPath.src;

        var libPath = lib ? srcPath + lib.folder : null;
        var modPath = mod ? srcPath + mod.folder : null;
        var logicPath = logic ? srcPath + logic.folder : null;

        var libFiles = libPath ? this.ls("lib", project, libPath, libPath, {}) : null;
        var modFiles = modPath ? this.ls("mod", project, modPath, modPath, {}) : null;
        var logicFiles = logicPath ? this.ls("logic", project, logicPath, logicPath, {}) : null;

        return {
            "message": "list files",
            "project": project,
            "lib" : libFiles,
            "mod" : modFiles,
            "logic" : logicFiles
        };
    },
    read : function(body){
        var data = body.data;

        //console.log(JSON.stringify(body));

        return this.parse(this.getProjectWorkspaceByAlias(data.project, data.env, data.deploy));
    }
};


exports.newInstance = function () {
    return new Workspace();
}