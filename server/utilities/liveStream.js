var utilities = require('./utilities_common.js');
var streaming = {};
var ioServer = null;

exports.setupLiveStreaming = function (io) {
    ioServer = io;
    io.sockets.on('connection', setupLiveStreamingConnecitons);
};

function setupLiveStreamingConnecitons(socket) {
    socket.on('startStreaming', function (data) {
        console.log('start stream');
        if(validateData(data, socket)) {
            console.log('validated');
            onStartStreaming(data, socket);
        }
    });
    socket.on('stopStreaming', function (data) {
        if(validateData(data, socket))
            onStopStreaming(data, socket);
    });
    socket.on('joinStreaming', function (data) {
        if(validateData(data, socket))
            onJoin(data, socket);
    });
    socket.on('leave', function (data) {
        onLeave(data, socket);
    });
}

function validateData(data, socket){
    if(!data || !data.roomID){
         error(socket, 'Missing room ID', -3);
         return false;
    }
    return true;
}

function error(socket, message, code) {
    var data = {Message: message, Type: 'Simple', Code: (code) ? code : -1};
    socket.emit('errorMessage', data);
}

function onStartStreaming(data, socket) {
    console.log('on start streaming');
    if(!socket.adapter.rooms[data.roomID] || !socket.adapter.rooms[data.roomID][socket.id] ) {
        console.log('room join', data.roomID);
        socket.join(data.roomID);
    }
    if (streaming[data.roomID]) { // check if room exists
        console.log('43', data.roomID, streaming[data.roomID]);
        socket.emit('performanceStarted', streaming[data.roomID]);
    } else {
        streaming[data.roomID] = {activeViewers: {}, activeViewersCount: 0, startTime: new Date(), roomID: data.roomID};
        console.log(data.roomID, streaming[data.roomID]);
        socket.join(data.roomID);
        socket.emit('performanceStarted', streaming[data.roomID]);
        socket.broadcast.to(data.roomID).emit('performanceState', streaming[data.roomID]);
        console.log("55", ioServer.sockets.adapter.rooms[data.roomID]);
    }
}

function onJoin(data, socket) {
    console.log("ON JOIN");
    if(!socket.adapter.rooms[data.roomID] || !socket.adapter.rooms[data.roomID][socket.id] )
        socket.join(data.roomID);
    if (!streaming[data.roomID]) {
        error(socket, 'No such performance is streaming');
    } else {
        streaming[data.roomID].activeViewers[data.userID] = data;
        streaming[data.roomID].activeViewersCount++;
        console.log(streaming[data.roomID]);
        socket.emit('joinedPerformance', streaming[data.roomID]);
        console.log("55", ioServer.sockets.adapter.rooms[data.roomID]);
        socket.broadcast.to(data.roomID).emit('performanceState', streaming[data.roomID]);
    }
}

function onLeave(data, socket) {
    if (!data[data.roomID]) {
        error(socket, 'No such performance is streaming', -2);
    } else {
//        socket.leave(data.performanceID);
        delete streaming[data.roomID].activeViewers[data.userID];
        streaming[data.roomID].activeViewersCount--;
        socket.emit('performanceState', data[data.roomID]);
    }
}
