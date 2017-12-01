'use strict';

/**
 * Controller - routesCtrl
 */
hitchcar.controller('routesCtrl', ['$scope', 'dataService', function ($scope, dataService) {

    $scope.message = 'Hello in My Trips!';

    dataService.get('/api/').then(function(data) {
        console.log(data);
    });

    dataService.get('/api/rides/').then(function(data) {
        console.log(data);
    });

    dataService.get('/api/users/').then(function(data) {
        console.log(data);
    });

}]);