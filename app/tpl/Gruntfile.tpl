//Grunt Configure

"use strict";

module.exports = function(grunt) {
    // Do grunt-related things in here
    //build project
    var project = //{project};

    //configure
    var conf = null;

    //{conf};

    conf.pkg = grunt.file.readJSON('package.json');

    if("concat" in conf 
            && conf.concat
            && conf.concat.default 
            && conf.concat.default.options 
            && conf.concat.default.options.process){
            
        conf["concat"]["default"].options.process = function(src, filepath){
            var banner = (function find(path){
                var env = project.env;
                var root = env.root;
                var doc = root.doc;
                var src = root.src;
                var concatRoot = doc + src + "__build__/";
                var buildInfo = env.build;
                var files = buildInfo.files;

                var item = null;
                var concat = null;

                for(var key in files){
                    if(files.hasOwnProperty(key)){
                        item = files[key];
                        concat = item.concat || {};

                        for(var file in concat){ //-------
                            if(concat.hasOwnProperty(file)){
                                var concatSize = concat[file].length;
                                var concatItem = null;
                                var concatFilePath = null;

                                for(var i = 0; i < concatSize; i++){
                                    concatItem = concat[file][i];

                                    concatFilePath = concatRoot + item.folder + "/" + concatItem.file;

                                    if(concatFilePath == path){
                                        return concatItem.banner;
                                    }
                                }
                            }
                        }
                    }
                }

                return "";
            })(filepath);

            return banner + src;
        }
    }

    grunt.initConfig(conf);

    //load npm task
    //{npmTasks}

    //regist task
    //{task}

};