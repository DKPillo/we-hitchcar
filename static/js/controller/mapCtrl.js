'use strict';

/**
 * Controller - mapController
 */
hitchcar.controller('mapCtrl', ['$rootScope', '$scope', '$q', 'dataService', function ($rootScope, $scope, $q, dataService) {

    //List of available Rides
    $scope.rides = [];

    //Load all available rides over API Server (call if map is ready)
    $scope.loadAvailableRides = function() {
        var promises = [];
        dataService.get('/api/rides/', {active: true}).then(function(rides) {
            $scope.rides = rides;
            //Resolve dependencies
            angular.forEach($scope.rides, function(ride) {
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
                //reset map markers
                $scope.resetMap();
                //All Data prepared, display on Map
                $scope.displayAvailableRides();
            });
        });
    };

    //Display Available Rides
    var directionsService = undefined;
    $scope.displayAvailableRides = function() {
        console.log($scope.rides);

        //Dont to anything if there are no routes.
        if ($scope.rides.length === 0) {
            return;
        }

        //Add Markers
        if (directionsService === undefined) {
            directionsService = new google.maps.DirectionsService;
        }

        angular.forEach($scope.rides, function(ride) {
            var directionsDisplay = new google.maps.DirectionsRenderer;
            directionsDisplay.setMap($scope.map);

            directionsService.route({
                origin: ride.rideStart.latitude + ", " + ride.rideStart.longitude,
                destination: ride.rideDestination.latitude + ", " + ride.rideDestination.longitude,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                }
            });
        });
    };

    $scope.markers = [];
    $scope.routes = [];
    $scope.mapOptions = {
        center: new google.maps.LatLng(46.8, 8.2),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //Initialize Map
    $scope.initMap = function() {
        $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);

        //Load and display Stats if map is ready
        google.maps.event.addListenerOnce($scope.map, 'idle', function(){
            $scope.loadAvailableRides();
            //Show Users Position
            $scope.showUser();
        });

    };
    $scope.initMap();

    $scope.showUser = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.renderUserMarker);
        }
    };

    $scope.renderUserMarker = function(position) {
        //Ad Marker for User
        var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        });
        //Track Markers
        $scope.markers.push(marker);
    };

    //Remove al routes from map
    $scope.resetMap = function() {
        angular.forEach($scope.routes, function(marker) {
            //TODO remove all routes

        });
    };

}]);