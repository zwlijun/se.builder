//socket.io codec

"use strict"

//message {head:null, body:{}}

var workspace = require("./workspace");
var encoder   = require("./encoder");

var Codec = function (socket) {
    // body...
    this.socket = socket || null;
    this.message = null;
};

Codec.prototype = {
    encode : function(message){
        return JSON.parse(message);
    },
    decode : function(message){
        return JSON.stringify(message);
    },
    setMessage : function(message){
        this.message = message;
    },
    getMessage : function(){
        return this.message;
    },
    emit : function(){
        var message = this.message;
        if(typeof(message) == "string"){
            message = this.encode(message);
        }
        console.log("head => " + this.decode(message.head));
        console.log("body => " + this.decode(message.body));

        this.parse(message);
    },
    parse : function(message){
        var socket = this.socket;
        var head = message.head;
        var body = message.body;

        var cmd = head.cmd;

        switch(cmd){
            case "hello":
                socket.emit("hello", {"head":{"cmd":"hello"}, "body":{"message":"welcome, " + head.user}});
            break;
            case "exit":
                socket.emit("exit", {"head":{"cmd":"exit"}, "body":{"message":"Goodbye, " + head.user}});
                socket.disconnect();
            break;
            case "workspace":
                var ws = workspace.newInstance();
                socket.emit("workspace", {"head":{"cmd":"workspace"}, "body":ws.read(body)});
                ws = null;
            break;
            case "encode":
                socket.emit("encode", {
                    "head":{
                        "cmd":"encode",
                        "state":"start"
                    },
                    "body":{
                        "message": "received files(" + body.data.size + ")"
                    }
                });
                encoder.encode(socket, message);
            break;
        }
    }
};

exports.newInstance = function(socket){
    return (new Codec(socket || null));
}