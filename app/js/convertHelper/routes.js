angular.module('convertHelperApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/convert', {
        templateUrl: 'js/convertHelper/partials/helper.html',
        controller: 'ProjectCtrl'
      }).
      when('/engine', {
        templateUrl: 'js/convertHelper/partials/helper.html',
        controller: 'EngineCtrl'
      }).
      otherwise({
        redirectTo: '/convert'
      });
    }
  ]);
