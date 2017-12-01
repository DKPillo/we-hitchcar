'use strict';

/**
 * Controller - loginCtrl
 */
hitchcar.controller('loginCtrl', ['$scope', 'authService', '$state', function($scope, authService, $state) {

    $scope.loginError = undefined;

    $scope.user = {
        username: '',
        password: ''
    };

    $scope.login = function() {
        $scope.loginError = undefined;
        authService.login($scope.user).then(function(msg) {
            $state.go('private.home');
        }, function(errMsg) {
            $scope.loginError = 'Login failed: ' + errMsg;
            console.log('error');
        });
    };

}]);
