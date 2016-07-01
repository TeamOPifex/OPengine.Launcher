var engineControllers = angular.module('engineControllers', []);
var launcherFactories = angular.module('launcherFactories', []);
var engineApp = angular.module('engineApp', [ 'ngRoute', 'engineControllers', 'launcherFactories' ]);
