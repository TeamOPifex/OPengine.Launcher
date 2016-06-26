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

angular.module('engineControllers').controller('EngineDetailCtrl', ['$scope', '$routeParams', 'Engine', 'Terminal', 'system', 'OS', 'VisualStudio', 'console', '$rootScope', 'config', 'cmake', 'make', 'run', 'git', 'marketplace', 'CodeEditor', 'engineReleases',
    function($scope, $routeParams, Engine, Terminal, system, OS, VisualStudio, appConsole, $rootScope, config, cmake, make, run, git, marketplace, CodeEditor, engineReleases) {
        $scope.os = OS;
        $scope.engine = new Engine($routeParams.versionId, $scope.os, $scope);
        $scope.terminal = new Terminal($scope.engine, $scope);
        $scope.windows = system.isWindows();
        $scope.visualStudios = VisualStudio;
        $scope.version = $scope.engine.config.engine.version;

        $('.current-tab .tab-text').text('OPengine ' + $scope.version);

        // Code Editor
        $scope.showCode = true;
        $scope.toggleCode = function() {
          $scope.showCode = !$scope.showCode;
        };
        $scope.pinned = [ ];

        $scope.updates = [  ];
        engineReleases.all(function(err, releases) {
          $scope.updates = [];

          var engineVersion = $scope.engine.config.engine.version;
          console.log(engineVersion);

          var semver = require('semver');
          for(var i = 0; i < releases.length; i++) {
            if(semver.lt(engineVersion, releases[i].name)) {
              $scope.updates.push(releases[i]);
            }
          }

          $scope.$digest();
        });

        $scope.updateTo = function(update) {
          git.CLI.getCommit($scope.engine.repo.absolute, update.sha, function() {

            $scope.$digest();
          });
        }

        $scope.openFolder = function() { $scope.engine.repo.openFolder(); };
        $scope.openBuildFolder = function() { $scope.engine.build.openFolder(); };

        $scope.openSLN = function() { $scope.engine.openSolution(); };
        $scope.openWith = function(program) { $scope.engine.repo.openWith(program); };

        $scope.editor = function() {
          ipc.send('sceneEditor', 'OPengine', $scope.engine.repo.absolute);
        }

        // On KeyBind events coming from the underlining application
        ipc.on('build', function() { $scope.make(); });
        ipc.on('forceBuild', function() { $scope.make(true); });
        ipc.on('run', function() { $scope.run(); });
        ipc.on('forceRun', function() { $scope.run(true); });
  }]);
