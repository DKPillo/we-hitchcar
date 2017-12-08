'use strict';

/**
 * Controller - homeCtrl
 */
hitchcar.controller('homeCtrl', ['$rootScope', '$scope', '$state', '$q', 'dataService', function ($rootScope, $scope, $state, $q, dataService) {

    //Load active rides and pickup requests
    $scope.myActiveRides = [];
    $scope.myActiveRequests = [];

    $scope.loadData = function() {
        dataService.get('/api/rides/', {user: $rootScope.user.id, active: true}).then(function(rides) {
            var promises = [];
            $scope.myActiveRides = rides;
            //Resolve dependencies
            angular.forEach($scope.myActiveRides, function(ride) {
                var uriStart = ride.rideStart.replace($rootScope.url, '');
                var p1 = dataService.get(uriStart).then(function(rideStart) {
                    ride.rideStart = rideStart;
                });
                promises.push(p1);
                var uriDestination = ride.rideDestination.replace($rootScope.url, '');
                var p2 = dataService.get(uriDestination).then(function(rideDestination) {
                    ride.rideDestination = rideDestination;
                });
                promises.push(p2);
            });

            //Wait for all Async operations to be resolved
            $q.all(promises).then(function() {
                console.log('loaded my rides');
            });
        });

        dataService.get('/api/pickuprequests/', {user: $rootScope.user.id}).then(function(requests) {
            var promises = [];
            $scope.myActiveRequests = requests;
            //Resolve dependencies
            angular.forEach($scope.myActiveRequests, function(request) {
                var uriLocation = request.currentLocation.replace($rootScope.url, '');
                var p1 = dataService.get(uriLocation).then(function(currentLocation) {
                    request.currentLocation = currentLocation;
                });
                promises.push(p1);
                var uriDestination = request.destination.replace($rootScope.url, '');
                var p2 = dataService.get(uriDestination).then(function(destination) {
                    request.destination = destination;
                });
                promises.push(p2);
            });

            //Wait for all Async operations to be resolved
            $q.all(promises).then(function() {
                console.log('loaded my requests');
            });
        });
    };

    if ($rootScope.user === undefined) {
        return dataService.loadUser().then(function (user) {
            console.log('user updated');
            $rootScope.user = user;
            $scope.loadData();
        });
    } else {
        $scope.loadData();
    }

    //Open a modal to search your the rides target.
    $scope.startNewRide = function () {
        //Set global flag, Ride Controller will open Map and Destination Search
        $rootScope.startNewRide = true;
        $state.go('private.routes');
    };

    //Show Map witch currently active rides.
    $scope.searchRide = function () {
        $state.go('private.map');
    };

}]);