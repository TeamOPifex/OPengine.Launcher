angular.module('engineApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'js/app/partials/notyet.html',
        controller: 'LoginCtrl'
      }).
      when('/settings', {
        templateUrl: 'js/app/partials/settings.html',
        controller: 'SettingsCtrl'
      }).
      when('/library', {
        templateUrl: 'js/app/partials/library.html',
        controller: 'LibraryCtrl'
      }).
      when('/library/engine/:versionId', {
        templateUrl: 'js/app/partials/engineDetail.html',
        controller: 'EngineDetailCtrl'
      }).
      when('/library/project/:versionId', {
        templateUrl: 'js/app/partials/projectDetail.html',
        controller: 'ProjectDetailCtrl'
      }).
      when('/library/project/settings/:versionId', {
        templateUrl: 'js/app/partials/projectSettings.html',
        controller: 'ProjectSettingsCtrl'
      }).
      when('/news', {
        templateUrl: 'js/app/partials/news.html',
        controller: 'StaticCtrl'
      }).
      when('/tools', {
        templateUrl: 'js/app/partials/tools.html',
        controller: 'ToolsCtrl'
      }).
      when('/tools/spriteSheet', {
        templateUrl: 'js/app/partials/spriteSheet.html',
        controller: 'ToolsCtrl'
      }).
      when('/tools/font', {
        templateUrl: 'js/app/partials/font.html',
        controller: 'ToolsCtrl'
      }).
      when('/tools/opm', {
        templateUrl: 'js/app/partials/opm.html',
        controller: 'ToolsCtrl'
      }).
      when('/toolsResourcePack', {
        templateUrl: 'js/app/partials/resourcePack.html',
        controller: 'ResourcePackCtrl'
      }).
      when('/learn', {
        templateUrl: 'js/app/partials/learn.html',
        controller: 'LearnCtrl'
      }).
      when('/license', {
        templateUrl: 'js/app/partials/license.html',
        controller: 'LicenseCtrl'
      }).
      when('/marketplace', {
        templateUrl: 'js/app/partials/marketplace.html',
        controller: 'MarketplaceCtrl'
      }).
      when('/bug', {
        templateUrl: 'js/app/partials/bug.html',
        controller: 'BugCtrl'
      }).
      when('/slack', {
        templateUrl: 'js/app/partials/slack.html',
        controller: 'StaticCtrl'
      }).
      when('/message', {
        templateUrl: 'js/app/partials/notyet.html',
        controller: 'StaticCtrl'
      }).
      when('/account', {
        templateUrl: 'js/app/partials/account.html',
        controller: 'AccountCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);
