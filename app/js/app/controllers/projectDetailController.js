angular.module('engineControllers').controller('ProjectDetailCtrl', ['$scope', '$routeParams', 'Terminal', 'system', 'VisualStudio', 'OS', 'Project', 'console', '$rootScope', 'engines', 'config', 'cmake', 'make', 'run', 'git',
    function($scope, $routeParams, Terminal, system, VisualStudio, OS, Project, appConsole, $rootScope, engines, config, cmake, make, run, git) {

        var ipc = require('electron').ipcRenderer;

        $scope.os = OS;
        $scope.project = new Project($routeParams.versionId, $scope.os, $scope);
        $scope.terminal = new Terminal($scope.project, $scope);
        $scope.engines = engines;
        $scope.windows = system.isWindows();
        $scope.visualStudios = VisualStudio;

        $('.current-tab .tab-text').text($routeParams.versionId);

        // Code Editor
        $scope.showCode = true;
        $scope.showSettings = false;
        $scope.showOptions = false;
        $scope.toggleCode = function() { $scope.showCode = !$scope.showCode; };
        $scope.showSettingsFn = function() {
          if($scope.showSettings) { return $scope.showCode = !$scope.showCode; }
          $scope.showCode = false; $scope.showSettings = true; $scope.showOptions = false;
        };
        $scope.showOptionsFn = function() {
          if($scope.showOptions) { return $scope.showCode = !$scope.showCode; }
          $scope.showCode = false; $scope.showSettings = false; $scope.showOptions = true;
        };
        $scope.pinned = [ ];

        $scope.$watch(function() { return $scope.project.config; }, function() {
    			config.saveProject($scope.project.repo.relative, $scope.project.config);
    			//console.log($scope.config);
    		}, true);

        // Open the project
        $scope.openFolder = function() { $scope.project.repo.openFolder(); };
        $scope.openBuildFolder = function() { $scope.project.build.openFolder(); };
        $scope.openSLN = function() { $scope.project.openSolution(); };
        $scope.openWith = function(program) { $scope.project.repo.openWith(program); };

        $scope.editor = function() {
          ipc.send('sceneEditor', $routeParams.versionId, $scope.project.repo.absolute);
        }

        $scope.helperTool = function() {
          ipc.send('project-helper-tool', $scope.project.path);
        }

        // On KeyBind events coming from the underlining application
        ipc.on('build', function() { $scope.make(); });
        ipc.on('forceBuild', function() { $scope.make(true); });
        ipc.on('run', function() { $scope.run(); });
        ipc.on('forceRun', function() { $scope.run(true); });

  }]);
