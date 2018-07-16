//Grunt Configure

"use strict";

module.exports = function(grunt) {
    // Do grunt-related things in here

    //configure
    var conf = null;

    //{conf};

    conf.pkg = grunt.file.readJSON('package.json');

    grunt.initConfig(conf);

    //load npm task
    //{npmTasks}

    //regist task
    //{task}

};