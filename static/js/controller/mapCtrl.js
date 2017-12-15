'use strict';

/**
 * Controller - mapController
 */
hitchcar.controller('mapCtrl', ['$rootScope', '$scope', '$q', '$filter', 'dataService', function ($rootScope, $scope, $q, $filter, dataService) {

    //List of available Rides
    $scope.rides = [];

    //Load all available rides over API Server (call if map is ready)
    $scope.loadAvailableRides = function() {
        dataService.get('/api/rides/', {active: true}, ['rideStart', 'rideDestination']).then(function(rides) {
            $scope.rides = rides;
            var promises = [];

            //Resolve waypoints and set color
            angular.forEach($scope.rides, function(ride) {
                ride.color = $rootScope.randomColor();
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
        $scope.createPolyline(response, ride.color, ride);

        //Draw start Marker
        $scope.createMarker(leg.start_location, 'Start:<br/>' + $filter('date')(ride.startTime, 'dd.MM.yyyy HH:mm'), ride.color, '', ride, true, false);

        //Draw waypoint Markers
        var cnt = 1;
        angular.forEach(ride.waypoints, function(waypoint){
            var latLng = new google.maps.LatLng(waypoint.waypointLocation.latitude, waypoint.waypointLocation.longitude);
            $scope.createMarker(latLng, 'Waypoint ' + cnt + '<br/>' + $filter('date')(waypoint.timestamp, 'dd.MM.yyyy HH:mm'), ride.color, cnt++, ride, false, false);
        });

        //Draw destination Marker
        $scope.createMarker(leg.end_location, 'Destination', ride.color, '', ride, false, true);
    };

    $scope.createPolyline = function(directionResult, color, ride) {
        var line = new google.maps.Polyline({
            map: $scope.map,
            path: directionResult.routes[0].overview_path,
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 4
        });

        line.addListener('click', function() {
            $scope.showRideModal(ride);
        });

        $scope.routes.push(line);
    };

    $scope.createMarker = function(latLng, title, color, number, ride, isStart, isEnd) {

        var pinColor = color.replace('#', '');
        if (isStart) {
            number = 'S';
        }
        if (isEnd) {
            number = 'D';
        }

        var pinImage = new google.maps.MarkerImage("//chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + number +"|" + pinColor, new google.maps.Size(21, 34), new google.maps.Point(0,0), new google.maps.Point(10, 34));
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: latLng,
            title: title,
            icon: pinImage
        });

        marker.addListener('click', function() {
            $scope.showRideModal(ride);
        });

        $scope.routes.push(marker);
    };

    $scope.selectedRide = undefined;
    $scope.showRideModal = function(ride) {
        console.log('showRideModal called');
        //Save Ride in Scope for UI
        $scope.selectedRide = ride;
        $('#rideModal').modal('show');
    };

    $scope.userMarker = undefined;
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
        $scope.userMarker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        });
    };

    //Remove al routes from map
    $scope.resetMap = function() {
        angular.forEach($scope.routes, function(routElement) {
            routElement.setMap(null);
        });
    };

}]);