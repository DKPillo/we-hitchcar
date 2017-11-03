'use strict';

/**
 * Controller - mapController
 */
hitchcar.controller('mapCtrl', ['$scope', '$timeout', 'uiGmapGoogleMapApi', function ($scope, $timeout, uiGmapGoogleMapApi) {

    $scope.markers = [];

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
            $scope.showDrivers();
            $scope.showUser();
        });

    };
    $scope.initMap();

    $scope.showDrivers = function() {

        //Show Route on Map
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay1 = new google.maps.DirectionsRenderer;
        directionsDisplay1.setMap($scope.map);
        var directionsDisplay2 = new google.maps.DirectionsRenderer;
        directionsDisplay2.setMap($scope.map);

        directionsService.route({
            origin: "Burgdorf, CH",
            destination: "Fribourg, CH",
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay1.setDirections(response);
            }
        });

        directionsService.route({
            origin: "Lyss, CH",
            destination: "Fribourg, CH",
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay2.setDirections(response);
            }
        });

    };

    $scope.showUser = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.renderUserMarker);
        }
    }

    $scope.renderUserMarker = function(position) {
        //Ad Marker for User
        var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        });
        //Track Markers
        $scope.markers.push(marker);
    }

}]);