'use strict';

/**
 * Controller - mapController
 */
hitchcar.controller('mapCtrl', ['$rootScope', '$scope', '$q', 'dataService', function ($rootScope, $scope, $q, dataService) {

    //List of available Rides
    $scope.rides = [];

    //Load all available rides over API Server (call if map is ready)
    $scope.loadAvailableRides = function() {
        dataService.get('/api/rides/', {active: true}, ['rideStart', 'rideDestination']).then(function(rides) {
            $scope.rides = rides;
            var promises = [];

            //Resolve Waypoints
            angular.forEach($scope.rides, function(ride) {
                //Load Waypoints
                var p = dataService.get('/api/waypoints/', {ride: ride.id}, ['waypointLocation']).then(function(rideWaypoints) {
                    ride.waypoints = rideWaypoints;
                });
                promises.push(p);
            });

            //Wait for all async operations to be resolved
            $q.all(promises).then(function() {
                //reset map markers
                $scope.resetMap();
                //All Data prepared, display on Map
                $scope.displayAvailableRides();
            });
        });
    };

    //Display Available Rides
    $scope.directionsService = undefined;
    $scope.displayAvailableRides = function() {
        console.log($scope.rides);

        //Dont to anything if there are no routes.
        if ($scope.rides.length === 0) {
            return;
        }

        if ($scope.directionsService === undefined) {
            $scope.directionsService = new google.maps.DirectionsService;
        }

        //Load the direction object over Google Maps API for each ride
        angular.forEach($scope.rides, function(ride) {
            console.log('Ride Details:');
            console.log(ride);

            var waypoints = [];

            angular.forEach(ride.waypoints, function(waypoint) {
                waypoints.push({location: waypoint.waypointLocation.latitude + ', ' + waypoint.waypointLocation.longitude, stopover: false})
            });

            $scope.directionsService.route({
                origin: ride.rideStart.latitude + ", " + ride.rideStart.longitude,
                destination: ride.rideDestination.latitude + ", " + ride.rideDestination.longitude,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
                waypoints: waypoints
            }, function(response, status) {
                if (status === 'OK') {
                    $scope.renderRideOnMap(ride, response);
                }
            });
        });
    };

    $scope.renderRideOnMap = function(ride, response) {
        var leg = response.routes[ 0 ].legs[ 0 ];

        //Draw Line
        $scope.createPolyline(response);

        //Draw start Marker
        $scope.createMarker(leg.start_location, '', "My Start" );

        //Draw waypoint Markers
        angular.forEach(ride.waypoints, function(waypoint){
            $scope.createMarker(leg.end_location, '', "My End" );
        });

        //Draw destination Marker
        $scope.createMarker(leg.end_location, '', "My End" );
    };

    $scope.createPolyline = function(directionResult) {
        var line = new google.maps.Polyline({
            map: $scope.map,
            path: directionResult.routes[0].overview_path,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 4
        });
    };

    $scope.createMarker = function(latlng, icon, title) {
        console.log('create marker: ');
        console.log(latlng);
        console.log(title);

        var infowindow = new google.maps.InfoWindow({
          content: title
        });

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: latlng,
            title: title
        });

        marker.addListener('click', function() {
          infowindow.open($scope.map, marker);
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