/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var express = require('express');
var app = express();
var port = process.env.PORT || 1337;
var domain = require('domain');
var io = require('socket.io');
var easyrtc = require('easyrtc');
var fs = require("fs");
var liveStream = require("./utilities/liveStream.js");

//VARIABLES
// =============================================================================
var app = express();
var socketIOServer = null;

allowCors();

function allowCors(){
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header("Access-Control-Allow-Headers", "Content-Type, authtokencode");
        next();
    });
}

//Set up the routes
require("./configuration/routes")(app);

// START THE SERVER
// =============================================================================
var port = process.env.PORT || 1337;
var serverDomain = domain.create();

serverDomain.on('error', function(err) {
    fs.appendFileSync('./log.log','\n'+ new Date().toString() +' - ' + err.stack, {flags: 'a'});
    process.exit();
});

app.get('/start', function (req, res){
    res.json("START");
});

app.use(function(req, res, next) {
    var reqDomain = domain.create();
    reqDomain.add(req);
    reqDomain.add(res);
    reqDomain.on('error', function(err) {
        console.log("Req Domain Error: " + err);
        reqDomain.dispose();
        next(err);
    });
    next();
});

serverDomain.run(function() {

    socketIOServer = io.listen(app.listen(port));
    liveStream.setupLiveStreaming(socketIOServer);
    easyrtc.setOption("roomDefaultEnable", false);
    easyrtcServer = easyrtc.listen(app, socketIOServer);
    console.log('Server listen on port ' + port);
});