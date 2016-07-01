var projectHelperControllers = angular.module('projectHelperControllers', []);
var launcherFactories = angular.module('launcherFactories', []);
var projectHelperApp = angular.module('projectHelperApp', [ 'ngRoute', 'projectHelperControllers', 'launcherFactories' ]);
