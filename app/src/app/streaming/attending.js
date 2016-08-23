
/**
 * Created by Aleksandar on 12.10.2015.
 */
angular.module( 'ngBoilerplate.attend', [
    'ui.router',
    'placeholders',
    'ui.bootstrap'
])
    .config(function config( $stateProvider ) {
        $stateProvider.state( 'attend', {
            url: '/attend',
            views: {
                "main": {
                    controller: 'AttendCtrl',
                    templateUrl: 'streaming/attend.tpl.html'
                }
            },
            data:{ pageTitle: 'Live Conference' }
        });
    })
    .controller('AttendCtrl', function AttendCtrl( $scope, attenderStreamingModule, API_URL) {
        $scope.streaming = attenderStreamingModule;
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
                username: "testAttender",
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
            $scope.isStreaming = true;
            $scope.isInitialized = true;
            $scope.cameraIsOn = $scope.streaming.getVideoStatus();
            $scope.microphoneIsOn = $scope.streaming.getMicrophoneStatus();
            $scope.muteSound = false;
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