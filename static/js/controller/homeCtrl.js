'use strict';

/**
 * Controller - homeCtrl
 */
hitchcar.controller('homeCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {

    /**
     * Open a modal to search your the rides target.
     */
    $scope.startNewRide = function () {
        //Set global flag, Ride Controller will open Map and Destination Search
        $rootScope.startNewRide = true;
        $state.go('private.routes');
    };

    /**
     * Show Map witch currently active rides.
     */
    $scope.searchRide = function () {
        $state.go('private.map');
    };

}]);