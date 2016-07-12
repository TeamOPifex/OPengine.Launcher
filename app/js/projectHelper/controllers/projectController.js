angular.module('projectHelperApp').controller('ProjectCtrl', ['$scope', '$routeParams', 'Project', 'OS',
    function($scope, $routeParams, Project, OS) {
      console.log(window.localStorage['projectPath']);
      $scope.os = OS;
      $scope.project = new Project(window.localStorage['projectPath'], $scope.os, $scope);
      $('.tab-text').text($scope.project.name);

      $scope.running = false;
      $scope.runningErr = false;
      $scope.helperRun = function() {
        $scope.running = true;
        $scope.runningErr = false;
        $scope.project.run(false, function(err) {
          $scope.running = false;
          if(err) $scope.runningErr = true;
        });
      }

      $scope.making = false;
      $scope.makingErr = false;
      $scope.helperMake = function() {
        $scope.making = true;
        $scope.makingErr = false;
        $scope.project.make(false, function(err) {
          $scope.making = false;
          if(err) $scope.makingErr = true;
        });
      }

      $scope.cmakeRunning = false;
      $scope.cmakeRunningErr = false;
      $scope.helperCMake = function() {
        $scope.cmakeRunning = true;
        $scope.cmakeRunningErr = false;
        $scope.project.cmake(false, function(err) {
          $scope.cmakeRunning = false;
          if(err) $scope.cmakeRunningErr = true;
        });
      }

      $scope.newFile = function() {
        require('electron').remote.dialog.showSaveDialog({
          defaultPath: $scope.project.repo.absolute
        },function(path) {
          if(path) {
            require('fs').writeFileSync(path, "");
            $scope.helperCMake();
          }
        });
      }

      var ipc = require('electron').ipcRenderer;
      ipc.on('helper-cmake', function() {
        $scope.helperCMake();
      });
      ipc.on('helper-run', function() {
        $scope.helperRun();
      });
      ipc.on('helper-build', function() {
        $scope.helperMake();
      });
      ipc.on('helper-newFile', function() {
        $scope.newFile();
      });
    }
  ]);
