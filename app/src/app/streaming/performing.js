/**
 * Created by Aleksandar on 12.10.2015.
 */
angular.module( 'ngBoilerplate.perform', [
    'ui.router',
    'placeholders',
    'ui.bootstrap'
])
.config(function config( $stateProvider ) {
    $stateProvider.state( 'perform', {
        url: '/perform',
        views: {
            "main": {
                controller: 'PerformCtrl',
                templateUrl: 'streaming/perform.tpl.html'
            }
        },
        data:{ pageTitle: 'Live Conference' }
    });
})
.controller('PerformCtrl', function PerformCtrl( $scope, performerStreamingModule, API_URL) {
        $scope.streaming = performerStreamingModule;
        $scope.isInitialized = false;
        $scope.isStreaming = false;
        $scope.cameraIsOn = false;
        $scope.microphoneIsOn = false;
        $scope.chatIsOn = true;
        $scope.soundLevel = 60;
        $scope.muteSound = true;
        $scope.fullScreenMode = false;
        $scope.volumeControlVisible = false;
        $scope.selectedVideoStream = 'callerVideo';
        $scope.currentTime = -3600000;
        $scope.watching = false;
        $scope.selectedVideo = null;

        var initStreaming = function () {
            $scope.streaming.initialize(API_URL, true, {
                localVideo: 'selfVideo',
                remoteVideo: 'callerVideo',
                roomID: "test123",
                username: "testPerformer",
                isStreaming: $scope.isStreaming,
                loginSuccess: loginSuccess,
                onStateChange: onStateChange,
                loginFailed: loginFailure,
                onJoinedPerformance: onJoinedPerformance
            });
            setTimeout($scope.streaming.joinPerformance, 1500);
        };
        initStreaming();

        var loginSuccess = function (easyRTCID) {
            console.log('login success');
            $scope.isStreaming = true;
            $scope.isInitialized = true;
            $scope.cameraIsOn = $scope.streaming.getVideoStatus();
            $scope.microphoneIsOn = $scope.streaming.getMicrophoneStatus();
            $scope.muteSound =false;
            allowRedirect = false;
            $scope.$apply();
            $scope.selectedVideo = document.getElementById($scope.selectedVideoStream);
        };

        var onStateChange = function (data) {
        };

        var loginFailure = function(errCode, errMessage){
        };

        var onJoinedPerformance = function (data) {
        };
});