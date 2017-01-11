var convertHelperControllers = angular.module('convertHelperControllers', []);
var launcherFactories = angular.module('launcherFactories', []);
var convertHelperApp = angular.module('convertHelperApp', [ 'ngRoute', 'convertHelperControllers', 'launcherFactories' ]);
