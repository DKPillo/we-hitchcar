'use strict';

/**
 * Service - LocationService
 *
 */
hitchcar.factory('locationService', ['$rootScope', '$q', '$http', '$filter', function($rootScope, $q, $http, $filter){

    const locationService = {};

    locationService.geocoder = undefined;


    //Find the name of a place
    locationService.resolveToName = function(location) {
        if (locationService.geocoder === undefined) {
            locationService.geocoder = new google.maps.Geocoder;
        }

        return $q(function(resolve, reject) {
            var latlng = {lat: location.latitude, lng: location.longitude};
            locationService.geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === 'OK' && results.length >= 1) {
                    location.title = results[0].formatted_address;
                    resolve(results[0].formatted_address)
                } else {
                    resolve('')
                }
            });
        });
    };

    // Public Service Methods
    return  {
        resolveToName : function(location) {
            return locationService.resolveToName(location);
        }
    };
}]);