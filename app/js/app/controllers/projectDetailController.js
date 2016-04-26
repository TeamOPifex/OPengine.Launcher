angular.module('engineControllers').controller('ProjectDetailCtrl', ['$scope', '$routeParams', 'Terminal', 'system', 'VisualStudio', 'OS', 'Project', 'console', '$rootScope', 'engines', 'config', 'cmake', 'make', 'run', 'git',
    function($scope, $routeParams, Terminal, system, VisualStudio, OS, Project, appConsole, $rootScope, engines, config, cmake, make, run, git) {

        var ipc = require('ipc');

        $scope.os = OS;
        $scope.project = new Project($routeParams.versionId, $scope.os, $scope);
        $scope.terminal = new Terminal($scope.project, $scope);
        $scope.engines = engines;
        $scope.windows = system.isWindows();
        $scope.visualStudios = VisualStudio;


        // Code Editor
        $scope.showCode = true;
        $scope.toggleCode = function() { $scope.showCode = !$scope.showCode; };
        $scope.pinned = [ ];



        // Open the project
        $scope.openFolder = function() { $scope.terminal.CurrentPath.path.openFolder(); };
        $scope.openSLN = function() { $scope.project.openSolution(); };
        $scope.openWith = function(program) { $scope.project.repo.openWith(program); };



        // On KeyBind events coming from the underlining application
        ipc.on('build', function() { $scope.make(); });
        ipc.on('forceBuild', function() { $scope.make(true); });
        ipc.on('run', function() { $scope.run(); });
        ipc.on('forceRun', function() { $scope.run(true); });

  }]);
