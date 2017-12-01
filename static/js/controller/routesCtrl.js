'use strict';

/**
 * Controller - routesCtrl
 */
hitchcar.controller('routesCtrl', ['$rootScope', '$scope', 'dataService', function ($rootScope, $scope, dataService) {

    $scope.newRide = {};

    //Search for user Location:
    $scope.updateLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.saveUserLocation);
        }
    };

    //Store current location
    $scope.saveUserLocation = function(position) {
        $scope.newRide.rideStart = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    };

    //Opens a Modal to search for the destination
    $scope.openNewRideModal = function () {
        $rootScope.startNewRide = false;
        //Open the Modal to select the destination:
        $('#startTripModal').modal('show');
        $scope.initMap();
    };

    $scope.mapOptions = {
        center: new google.maps.LatLng(46.8, 8.2),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //Initialize Map
    $scope.initMap = function() {
        $scope.map = new google.maps.Map(document.getElementById("searchMap"), $scope.mapOptions);

        //Load and display Stats if map is ready
        google.maps.event.addListenerOnce($scope.map, 'idle', function(){
            $scope.updateLocation();
            $scope.initAutocomplete();
        });

    };

    //Autocomplete for destination search
    $scope.initAutocomplete = function() {
        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        $scope.map.addListener('bounds_changed', function() {
            searchBox.setBounds($scope.map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length === 0) {
              return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
              marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
              if (!place.geometry) {
                  return;
              }
              var icon = {
                  url: place.icon,
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(25, 25)
              };

              // Create a marker for each place.
              markers.push(new google.maps.Marker({
                  map: $scope.map,
                  icon: icon,
                  title: place.name,
                  position: place.geometry.location
              }));

              //Set ride destination
              $scope.newRide.rideDestination = {
                  latitude: place.geometry.location.lat(),
                  longitude: place.geometry.location.lng(),
                  title: place.formatted_address
              };

              if (place.geometry.viewport) {
                  // Only geocodes have viewport.
                  bounds.union(place.geometry.viewport);
              } else {
                  bounds.extend(place.geometry.location);
              }

              $scope.$apply();
          });
          $scope.map.fitBounds(bounds);
        });
    };

    //Starts the new Ride
    $scope.startRide = function() {
        if (!$scope.canStartRide()) {
            return false;
        }
        console.log($scope.newRide);

        var ride = {
            user: 'http://127.0.0.1:8000/api/users/1/',
            rideStart: '',
            rideDestination: ''
        };

        dataService.post('/api/locations/', $scope.newRide.rideStart).then(function(dataStart) {
            ride.rideStart = dataStart.url;
            dataService.post('/api/locations/', $scope.newRide.rideDestination).then(function(dataDestination) {
                ride.rideDestination = dataDestination.url;
                dataService.post('/api/rides/', ride).then(function(dataRide) {
                    console.log(dataRide);
                });
            });
        });


    };

    //Are start and Destination set?
    $scope.canStartRide = function () {
        return (angular.isDefined($scope.newRide.rideStart) && angular.isDefined($scope.newRide.rideDestination));
    };

    dataService.get('/api/').then(function(data) {
        console.log(data);
    });

    dataService.get('/api/rides/').then(function(data) {
        console.log(data);
    });

    dataService.get('/api/users/').then(function(data) {
        console.log(data);
    });


    //start a new ride if flag is set
    if ($rootScope.startNewRide) {
        $scope.openNewRideModal();
    }

}]);