var engineControllers = angular.module('engineControllers');
engineControllers.controller('ProjectSettingsCtrl', ['$scope', '$routeParams', 'console', '$rootScope', 'engines', 'config',
	function($scope, $routeParams, appConsole, $rootScope, engines, config) {
        $scope.path = $routeParams.versionId;
        $scope.engines = engines;
        $scope.name = $routeParams.versionId;

        var projectRepoPath = global.root + '/repos/projects/' + $scope.path;
		var launcherConfig = config.getLauncher();
        for(var i = 0; i < launcherConfig.projects.length; i++) {
            if(launcherConfig.projects[i].id == $scope.path) {
                projectRepoPath = launcherConfig.projects[i].path;
            }
        }
        $scope.config = config.getProject(projectRepoPath);

		$scope.$watch(function() { return $scope.config; }, function() {
			config.saveProject(projectRepoPath, $scope.config);
			//console.log($scope.config);
		}, true);
	}
]);
