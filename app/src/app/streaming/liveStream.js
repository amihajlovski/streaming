(function (window, angular) {
    'use strict';
    var socket;
    var bindings;
    var debugEnabled = true;
    var streaming = null;
    var doCallOthers=true;
    var triedOnce= false;
    var settings = {
        url: null,
        bindings: null,
        performanceID: null,
        isInitiator: false,
        isStarted: false,
        localStream: null,
        remoteStream: null,
        pc_config: {
            'iceServers': [
                {'url': 'stun:stun.l.google.com:19302'},
                {'url': 'turn:85.25.243.74:3478?transport=tcp',
                    "username": "iefQomQJMtII",
                    "password": "e6e54cff2db6de8b1e62df82d683f728",
                    "ttl": 86400
                }
            ]
        },
        pc_constraints: {'optional': [{'DtlsSrtpKeyAgreement': true}]},
        sdpConstraints: {'mandatory': {
                'OfferToReceiveAudio': true,
                'OfferToReceiveVideo': true
            }
        },
        constraints: {video: true, audio: true},
        localVideo: 'selfVideo',
        remoteVideo: 'callerVideo'
    };

    var log = function (data) {
        if (debugEnabled)
            console.log(data);
    };

    window.onbeforeunload = function (e) {
        // todo send leave/stop command
    };

    var selfEasyrtcid = "";

    function roomJoinSuccess(roomName) {
        console.log('joined room', roomName);
    }

    function roomJoinFailed(errorCode, errorText, roomName) {
        console.log('failed to join room',errorCode, errorText, roomName);
    }  
    
    function streamAcceptor(easyrtcid,stream){
        var element = document.getElementById('callerVideo');
        easyrtc.setVideoObjectSrc( element, stream );
    }
    
    function streamClosed (easyrtcid){
        document.getElementById('callerVideo').src="";
    }

    function connect(noMedia) {
        easyrtc.setCookieId(settings.roomID);
        easyrtc.setUsername(settings.username);
        if(triedOnce === false)
            easyrtc.joinRoom(settings.roomID);
        easyrtc.setVideoDims(640, 480);
        easyrtc.setRoomOccupantListener(processRoomOccupants);
        easyrtc.setSocketUrl(settings.url);
        console.log(settings.localVideo, [settings.remoteVideo]);
        easyrtc.enableAudio(true);
        easyrtc.enableVideo(true);
        easyrtc.enableAudioReceive(true);
        easyrtc.enableVideoReceive(true);
        easyrtc.connect("LiveConference", (noMedia)?null: settings.localVideo, [settings.remoteVideo], loginSuccess, loginFailure);
        loginSuccess('null', true);
        easyrtc.easyApp("LiveConference", settings.localVideo, [settings.remoteVideo], loginSuccess, loginFailure);
    }

    function processRoomOccupants(roomName, data, isPrimary) {
        console.log('processRoomOccupants', roomName, data, isPrimary);
        for (var easyrtcID in data) {
            performCall(easyrtcID);
        }
    }
    
    function connectedToPeer(otherCaller, mediaType){
        console.log('connected with peer::', otherCaller, mediaType);
    }
    
    function failedToConnectWithPeer(errorCode, errMessage){
        console.log('failed to connect with peer::', errorCode, errMessage);
    }
    
    function peerAcceptedCall(wasAccepted ,otherUser){
        if(!wasAccepted)
            alert("Sorry, your call to " + easyrtcid + " was rejected");
        else
            console.log('peer accpeted call:', wasAccepted,otherUser);
    }

    function performCall(otherEasyrtcid) {
        if(settings.isInitiator === false){
            console.log('Calling', otherEasyrtcid);
            console.log('performing call to:', otherEasyrtcid);
            easyrtc.call(otherEasyrtcid, connectedToPeer, failedToConnectWithPeer, peerAcceptedCall);
        }
    }

    function loginSuccess(easyrtcid, noMedia) {
        selfEasyrtcid = easyrtcid;
        console.log('loginSuccess',selfEasyrtcid);
        socket = easyrtc.webSocket;
        streaming.armEvents(socket);
        settings.isStarted=true;
        if(typeof settings.bindings.loginSuccess==='function')
            settings.bindings.loginSuccess(easyrtcid);
           
        if(settings.isInitiator===true){
            console.log('Telling server to start performance');
            socket.emit('startStreaming', {roomID: settings.roomID});
        }else{
            console.log('Telling server to join performance');
            socket.emit('joinStreaming', {roomID: settings.roomID});
        }
    }


    function loginFailure(errorCode, message) {
        console.log('loginFailure', errorCode, message);
        if(errorCode==='MEDIA_ERR' && triedOnce==false){
            triedOnce=true;
            connect(true);
        }
        if (typeof settings.bindings.loginFailed === 'function')
            settings.bindings.loginFailed(errorCode, message);
    }

    //common methods 
    var _toggleVideo = function (state) {
        return easyrtc.enableCamera(state);
    };
    
    var _toggleMicrophone = function(state){
        return easyrtc.enableMicrophone(state);
    };
    
    var _getVideoStatus = function(){
        return easyrtc.getCameraStatus();
    };
    
    var _getMicrophoneStatus= function(){
        return easyrtc.getMicrophoneStatus();
    };
    
    var _sendMessage = function(message){
        console.log('sending message',message);
        var data = {
            text:message,
            performanceID: settings.performanceID,
            username: settings.username,
            userID: settings.userID,
            time: moment()
        };
        socket.emit('textMessage',data);
    };
    
    var _stopStreaming = function(){
         easyrtc.getLocalStream().stop();
    };
    
    var _startStreaming = function(){
        easyrtc.getLocalStream().start();
    };
    
    var _onTextMessage = function (data) {
        console.log('Received message',data);
        if (typeof settings.bindings.onTextMessage === 'function') {
            settings.bindings.onTextMessage(data);
        }
    };
    
    var onError = function (data) {
        console.log('Error:', data);
        if (settings.bindings && settings.bindings.onError)
            settings.bindings.onError(data);
    };
    
    var _fullScreen = function(elementID){
        var elem = document.getElementById(elementID);
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    };
    
    var _setVolumeLevel = function(level){
        // to do extend easyrtc to include sound level control
    };

    angular.module('StreamingModule', ['ng']).
            //performer streaming
            factory('performerStreamingModule', function ($window) {
                var _initialize = function (hostUrl, debug, bindings) {
                    settings.isInitiator = true; 
                    debugEnabled = (debug) ? debug : true;
                    settings.url = hostUrl;
                    settings.bindings = bindings;
                    settings.roomID = bindings.roomID;
                    settings.token = "token";
                    //settings.userID = localStorageService.get('loginInfo').id;
                    settings.username = bindings.username;
                    settings.localVideo = bindings.localVideo;
                    settings.remoteVideo = bindings.remoteVideo;
                    streaming = this;
                    console.log(settings);
                };
                var onPerformanceStarted=function(data){
                    console.log(data);
                    if (settings.bindings && settings.bindings.onPerformanceStarted)
                        settings.bindings.onPerformanceStarted(data);
                };
                var onConnected = function () {
                    console.log('connected');
                };
                var onDisconnect = function () {
                    console.log('lost server connection');
                    if (settings.bindings && settings.bindings.onDisconnect)
                        settings.bindings.onDisconnect();
                };
                var onPerformanceStateChange = function (data) {
                    log('State change:');
                    log(data);
                    if (settings.bindings && settings.bindings.onPerformanceStateChange)
                        settings.bindings.onPerformanceStateChange(data);
                };
                var onError = function (data) {
                    log('Error:');
                    log(data);
                    if (settings.bindings && settings.bindings.onError)
                        settings.bindings.onError(data);
                };

                var _startPerformanceStreaming = function (data) {
                    connect();
                };
                var _stopPerformanceStreaming = function (data) {
                    socket.emit('stopPerformance', data);
                };
                var _getPerformanceState = function (data) {
                    socket.emit('getPerformanceState', data);
                };
                var _armSocketEvents = function (socket) {
                    socket.on('performanceState', onPerformanceStateChange);
                    socket.on('errorMessage', onError);
                    socket.on('textMessage', _onTextMessage);
                    socket.on('performanceStarted', onPerformanceStarted);
                    console.log('Additional socket events armed');
                };
                var _leavePerformance = function () {
                    socket.emit('leavePerformance', {performanceID: settings.performanceID});
                    easyrtc.leaveRoom(settings.performanceID);
                    easyrtc.disconnect();
                    easyrtc.closeLocalStream();
                };

                var _joinPerformance = function(){
                    console.log('performer join performance');
                    connect(true);
                };

                return {
                    initialize: _initialize,
                    armEvents :_armSocketEvents,
                    startPerformanceStreaming: _startPerformanceStreaming,
                    getPerformanceState: _getPerformanceState,
                    leavePerformance: _leavePerformance,
                    toggleVideo : _toggleVideo,
                    toggleMicrophone: _toggleMicrophone,
                    getVideoStatus: _getVideoStatus,
                    getMicrophoneStatus:_getMicrophoneStatus,
                    sendMessage:_sendMessage,
                    stopStreaming:_stopStreaming,
                    startStreaming:_startStreaming,
                    fullScreen:_fullScreen,
                    setVolumeLevel:_setVolumeLevel,
                    joinPerformance: _joinPerformance,
                };
            }).
            // buyer streaming
            factory('attenderStreamingModule', function ($window) {
                var _initialize = function (hostUrl, debug, bindings) {
                    settings.isInitiator = false; 
                    debugEnabled = (debug) ? debug : true;
                    settings.url = hostUrl;
                    settings.bindings = bindings;
                    settings.roomID = bindings.roomID;
                    settings.username = bindings.username;
                    settings.localVideo = bindings.localVideo;
                    settings.remoteVideo = bindings.remoteVideo;
                    streaming = this;
                    console.log(settings);
                };
                var onJoinedPerformance = function(data){
                    console.log('joined',data);
                    if (settings.bindings && settings.bindings.onJoinedPerformance)
                        settings.bindings.onJoinedPerformance(data);
                };
                var onDisconnect = function () {
                    console.log('lost server connection');
                    if (settings.bindings && settings.bindings.onDisconnect)
                        settings.bindings.onDisconnect();
                };
                var onPerformanceStateChange = function (data) {
                    log('State change:',data);
                    if (settings.bindings && settings.bindings.onPerformanceStateChange)
                        settings.bindings.onPerformanceStateChange(data);
                };
                var _joinPerformance = function () {
                    console.log('join performance');
                    connect(true);
                };
                var _getPerformanceState = function (data) {
                    socket.emit('getPerformanceState', data);
                };
                var _leavePerformance = function () {
                    socket.emit('leavePerformance', {performanceID: settings.performanceID});
                    easyrtc.leaveRoom(settings.performanceID);
                    easyrtc.disconnect();
                    easyrtc.closeLocalStream();
                };
                var _armSocketEvents = function (socket) {
                    socket.on('performanceState', onPerformanceStateChange);
                    socket.on('errorMessage', onError);
                    socket.on('textMessage', _onTextMessage);
                    socket.on('joinedPerformance', onJoinedPerformance);
                    console.log('Additional socket events armed');
                };
                return {
                    initialize: _initialize,
                    armEvents :_armSocketEvents,
                    joinPerformance: _joinPerformance,
                    getPerformanceState: _getPerformanceState,
                    leavePerformance: _leavePerformance,
                    fullScreen:_fullScreen,
                    sendMessage:_sendMessage,
                    setVolumeLevel:_setVolumeLevel,
                    toggleVideo : _toggleVideo,
                    toggleMicrophone: _toggleMicrophone,
                    getVideoStatus: _getVideoStatus,
                    getMicrophoneStatus:_getMicrophoneStatus
                };
            });
})(window, window.angular);