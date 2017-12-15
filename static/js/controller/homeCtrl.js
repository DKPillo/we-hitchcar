'use strict';

/**
 * Controller - homeCtrl
 */
hitchcar.controller('homeCtrl', ['$rootScope', '$scope', '$state', '$q', 'dataService', 'locationService', function ($rootScope, $scope, $state, $q, dataService, locationService) {

    //Load active rides and pickup requests
    $scope.myActiveRides = [];
    $scope.myActiveRequests = [];

    $scope.loadData = function() {
        $scope.showSpinner = true;

        dataService.get('/api/rides/', {user: $rootScope.user.id, active: true}, ['rideStart', 'rideDestination']).then(function(rides) {
            $scope.myActiveRides = rides;

            //Resolve dependencies (we do not wait on Location Resolving by Google Maps API)
            angular.forEach($scope.myActiveRides, function(ride) {
                //Resolve title for both locations of each ride.
                angular.forEach(['rideStart', 'rideDestination'], function(keyName) {
                    if (angular.isUndefined(ride[keyName].title) || ride[keyName].title === '' || ride[keyName].title === null) {
                        locationService.resolveToName(ride[keyName]).then(function(title) {
                            ride[keyName].title = title;
                        });
                    }
                });
            });

            $scope.showSpinner = false;
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
                $scope.showSpinner = false;
            });
        });
    };

    if ($rootScope.user === undefined) {
        dataService.loadUser().then(function (user) {
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

    //Set waypoint for a ride
    $scope.setWaypoint = function(ride) {
        console.log('clicked');
        if (navigator.geolocation) {
            $scope.showSpinner = true;
            navigator.geolocation.getCurrentPosition( function( position ){
                console.log('location returned');
                var location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                dataService.post('/api/locations/', location).then(function(locationObject) {
                    var waypoint = {
                        waypointLocation: locationObject.url,
                        ride: ride.url
                    };
                    dataService.post('/api/waypoints/', waypoint).then(function( waypointObject) {
                        console.log(waypointObject);
                    });
                });
            });
            $scope.showSpinner = false;
        }
    };

}]);