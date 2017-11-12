angular.module('convertHelperApp').controller('ProjectCtrl', ['$scope', '$routeParams', 'Project', 'OS',
    function($scope, $routeParams, Project, OS) {
      console.log(window.localStorage['projectPath']);
      $scope.os = OS;
      $scope.project = new Project(window.localStorage['projectPath'], $scope.os, $scope);
      $('.tab-text').text($scope.project.name);

      $scope.lastChanged = 'Monitoring Changes';

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

      console.log('setup project watcher');

      $scope.watch = new Watcher(function(evt) {
        console.log('evt', evt);
        if(evt.isFile && evt.eventType == 'change' && evt.filename.endsWith('.fbx')) {
          console.log('TIME TO DO THE PROCESSING!');
          var spawn = require('child_process').spawn;
          var cmd = 'C:\\Users\\ghoofman\\.opengine\\build\\OPengine.Tool.OPM_build\\Debug\\Tool-OPM.exe';
          //var dest = evt.filename.split('.fbx').join('') + '.dae';
          var args = [ evt.dir + evt.filename ];
          var child = spawn(cmd, args, {
              cwd: evt.dir,
              env: process.env
          });

          child.stdout.on('data', function(data) {
              console.log('stdout: ' + data);
          });

          child.stderr.on('data', function (data) {
              console.log('stderr: ' + data);
          });

          child.on('close', function (code) {
              console.log('child process exited with code ' + code);
              $scope.lastChanged = evt.filename;
              $scope.$digest();
          });

          child.on('error', function(code) {
              console.log('error: ' + code);
          });
        }

        // if(evt.isFile && evt.eventType == 'change' && evt.filename.endsWith('.fbx')) {
        //   console.log('TIME TO DO THE PROCESSING!');
        //   var spawn = require('child_process').spawn;
        //   var cmd = 'C:\\Program Files\\Autodesk\\FBX\\FBX Converter\\2013.3\\bin\\FbxConverter.exe';
        //   var dest = evt.filename.split('.fbx').join('') + '.dae';
        //   var args = [evt.filename, dest, '/sffFBX', '/dffCOLLADA'];
        //   var child = spawn(cmd, args, {
        //       cwd: evt.dir,
        //       env: process.env
        //   });

        //   child.stdout.on('data', function(data) {
        //       console.log('stdout: ' + data);
        //   });

        //   child.stderr.on('data', function (data) {
        //       console.log('stderr: ' + data);
        //   });

        //   child.on('close', function (code) {
        //       console.log('child process exited with code ' + code);
        //       $scope.lastChanged = evt.filename;
        //       $scope.$digest();
        //   });

        //   child.on('error', function(code) {
        //       console.log('error: ' + code);
        //   });
        // }
      });
      $scope.watch.add($scope.project.repo.absolute, true);
    }
  ]);
