'use strict';

/**
 * Controller - navigationCtrl
 */
hitchcar.controller('navigationCtrl', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {

    $scope.navigation = [
        {
            name: 'Home',
            path: '/home',
            icon: 'fa-home'
        }, {
            name: 'Map',
            path: '/map',
            icon: 'fa-map-o'
        }, {
            name: 'Routes',
            path: '/routes',
            icon: 'fa-map-signs'
        }, {
            name: 'Profile',
            path: '/profile',
            icon: 'fa-user-circle-o'
        }
    ];

    $scope.isActive = function(nav) {
        var url = $location.url();
        return nav.path == url;
    }

    $scope.navigate = function(nav) {
        $('#collapsed-navbar').collapse('hide');
        $location.path(nav.path);
    }

}]);