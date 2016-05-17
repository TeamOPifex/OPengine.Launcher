var shell = require('electron').shell;

function walk(currentDirPath, subDir, callback) {
    var fs = require('fs'), path = require('path');
    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        callback(filePath, name, stat);
        if(subDir && stat.isDirectory()) {
            walk(filePath, callback);
        }
    });
}

function extension(name) {
    if(!name) return '';
    if(name.length == 0) return '';

    var dots = name.split('.');
    if(dots.length == 1) return '';
    else return dots[dots.length - 1];
}

angular.module('engineControllers').controller('EngineDetailCtrl', ['$scope', '$routeParams', 'Engine', 'Terminal', 'system', 'OS', 'VisualStudio', 'console', '$rootScope', 'config', 'cmake', 'make', 'run', 'git', 'marketplace', 'CodeEditor',
    function($scope, $routeParams, Engine, Terminal, system, OS, VisualStudio, appConsole, $rootScope, config, cmake, make, run, git, marketplace, CodeEditor) {
        $scope.os = OS;
        $scope.engine = new Engine($routeParams.versionId, $scope.os, $scope);
        $scope.terminal = new Terminal($scope.engine, $scope);
        $scope.windows = system.isWindows();
        $scope.visualStudios = VisualStudio;
        $scope.version = $scope.engine.config.engine.version;

        $('.current-tab').text('OPengine ' + $scope.version);

        // Code Editor
        $scope.showCode = true;
        $scope.toggleCode = function() {
          $scope.showCode = !$scope.showCode;
        };
        $scope.pinned = [ ];



        $scope.openFolder = function() { $scope.terminal.CurrentPath.path.openFolder(); };
        $scope.openSLN = function() { $scope.engine.openSolution(); };
        $scope.openWith = function(program) { $scope.engine.repo.openWith(program); };



        // On KeyBind events coming from the underlining application
        ipc.on('build', function() { $scope.make(); });
        ipc.on('forceBuild', function() { $scope.make(true); });
        ipc.on('run', function() { $scope.run(); });
        ipc.on('forceRun', function() { $scope.run(true); });
  }]);
