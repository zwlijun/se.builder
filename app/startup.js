//build service

"use strict"

var http     = require("http");
var express  = require("express");
var ejs      = require("ejs");
var fs       = require("fs");
var io       = require("socket.io");
var conf     = require("./lib/config");
var projects = require("./conf/project");
var codec    = require("./lib/codec");

var app = express();
var ioServer = null;
var httpServer = null;

app.engine('html', ejs.renderFile);

app.set("port", conf.port);
app.set("view engine", "ejs");
app.set("view options", {
    "layout": false
});
app.set("views", __dirname + "/view");

app.use(express.static(__dirname + "/res"));

//route
app.get("/", function (req, resp) {
    resp.render("index.html", {
        "conf": conf,
        "projects": projects
    });
});
//---------------------


app.on('close', function(errno) {
    console.log("Server Shutdown!!!");
});

httpServer = http.createServer(app);

ioServer = io(httpServer);
ioServer.on("connection", function(socket){
    console.log("Socket Connected !");

    socket.on("message", function(message){
        console.log("Message Received ! message: " + message);

        var instance = codec.newInstance(socket);

        instance.setMessage(message);
        instance.emit();

        instance = null;
    });

    socket.on("disconnect", function(){
        console.log("Socket Disconnected !");
    });
});

httpServer.listen(app.get('port'), function(){
  console.log("Server startup! Listen: " + app.get('port'));
});

process.on('exit', function(code) {
  console.log('Exit with code:', code);
});
