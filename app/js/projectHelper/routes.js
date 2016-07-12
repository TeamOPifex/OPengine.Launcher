angular.module('projectHelperApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/project', {
        templateUrl: 'js/projectHelper/partials/helper.html',
        controller: 'ProjectCtrl'
      }).
      when('/engine', {
        templateUrl: 'js/projectHelper/partials/helper.html',
        controller: 'EngineCtrl'
      }).
      otherwise({
        redirectTo: '/project'
      });
    }
  ]);
