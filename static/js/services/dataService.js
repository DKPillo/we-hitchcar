'use strict';

/**
 * Service - DataService
 *
 */
hitchcar.factory('dataService', ['$rootScope', '$q', '$http', '$filter', function($rootScope, $q, $http, $filter){

    const dataService = {};
    dataService.api = $rootScope.url;

    dataService.get = function(getUri, searchParams) {
        return $q(function(resolve, reject) {
            var uri = getUri;
            if (angular.isDefined(searchParams)) {
                //TODO, add params
                uri = uri + '?';
            }
            $http.get(dataService.api + uri).then(function(result) {
                resolve(result.data);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    dataService.post = function(postUri, payloadData) {
        return $q(function(resolve, reject) {
            $http.post(dataService.api + postUri, payloadData).then(function(result) {
                resolve(result.data);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    // Public Service Methods
    return  {
        get : function(getUri, searchParams) {
            return dataService.get(getUri, searchParams);
        },
        post : function(postUri, payloadData) {
            return dataService.post(postUri, payloadData);
        }
    };
}]);