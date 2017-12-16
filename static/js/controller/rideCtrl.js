'use strict';

/**
 * Controller - rideCtrl
 */
hitchcar.controller('rideCtrl', ['$rootScope', '$scope', '$stateParams', 'dataService', 'locationService', function ($rootScope, $scope, $stateParams, dataService, locationService) {

    $scope.rideId = $stateParams.id;
    $scope.ride = undefined;

    $scope.loadRideDetails = function() {
        dataService.get('/api/rides/'+$scope.rideId+'/', undefined, ['rideStart', 'rideDestination']).then(function(ride) {
            $scope.ride = ride;

            //Resolve title for both locations of ride.
            angular.forEach(['rideStart', 'rideDestination'], function(keyName) {
                if (angular.isUndefined(ride[keyName].title) || ride[keyName].title === '' || ride[keyName].title === null) {
                    locationService.resolveToName(ride[keyName]).then(function(title) {
                        ride[keyName].title = title;
                    });
                }
            });

            //Update Waypoints and PickUp Requests
            $scope.updateWaypoints($scope.ride);
            $scope.updatePickUpRequests($scope.ride);
        });
    };

    $scope.showSpinner = true;
    if ($rootScope.user === undefined) {
        dataService.loadUser().then(function (user) {
            $rootScope.user = user;
            $scope.loadRideDetails();
        });
    } else {
        $scope.loadRideDetails();
    }

    $scope.updateWaypoints = function(ride){
        $scope.showSpinner = true;
        var p = dataService.get('/api/waypoints/', {ride: ride.id}, ['waypointLocation']).then(function(rideWaypoints) {
            ride.waypoints = rideWaypoints;
            $scope.showSpinner = false;

            angular.forEach(ride.waypoints, function(waypoint) {
                if (angular.isUndefined(waypoint.waypointLocation.title) || waypoint.waypointLocation.title === '' || waypoint.waypointLocation.title === null) {
                    locationService.resolveToName(waypoint.waypointLocation).then(function(title) {
                        waypoint.waypointLocation.title = title;
                    });
                }
            });
        });
    };

    $scope.updatePickUpRequests = function(ride){
        $scope.showSpinner = true;
        var p = dataService.get('/api/pickuprequests/', {ride: ride.id}, ['currentLocation', 'destination']).then(function(rideRequests) {
            ride.requests = rideRequests;
            $scope.showSpinner = false;

            angular.forEach(ride.requests, function(request) {
                angular.forEach(['currentLocation', 'destination'], function(keyName) {
                    if (angular.isUndefined(request[keyName].title) || request[keyName].title === '' || request[keyName].title === null) {
                        locationService.resolveToName(request[keyName]).then(function(title) {
                            request[keyName].title = title;
                        });
                    }
                });
            });
        });
    };

    //Set waypoint for a ride
    $scope.setWaypoint = function(ride) {
        if (navigator.geolocation) {
            $scope.showSpinner = true;
            navigator.geolocation.getCurrentPosition( function( position ){
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
                        $scope.showSpinner = false;
                        $scope.updateWaypoints();
                    });
                });
            });
        } else {
            $scope.showSpinner = false;
        }
    };

}]);