//encoder

"use strict"

var GruntBuilder = null;

var $sock = null;
var $proj = null;

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
    console.log('\x1B[34m', message, '\x1B[39m');
};

var init = function(socket, size, project, files){
    $sock = socket;
    $proj = project;

    emit("init", "initialization encoding...");

    console.info(JSON.stringify(files))

    // for(var type in files){
    //     if(files.hasOwnProperty(type)){
    //         encoder(type, files[type]);
    //     }
    // }
    GruntBuilder = require("./gruntbuilder2");
    GruntBuilder.builder.create($sock, $proj, files);
};

exports.encode = function (socket, message) {
    var head = message.head;
    var body = message.body;
    var data = body.data;
    var size = data.size;
    var project = data.project;
    var files = data.files; //{checksum, type, path}

    init(socket, size, project, files);

};
