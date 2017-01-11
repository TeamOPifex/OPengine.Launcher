angular.module('convertHelperControllers').controller('convertHelperCtrl', [ '$scope', function($scope) {

  var ipc = require('electron').ipcRenderer;

  $scope.minimize = function() {
    ipc.send('minimize', window.currentWindow);
  }

  $scope.exit = function() {
    ipc.send('exit-helper-tool', window.currentWindow);
  }

  var shortcuts = [
    { keys: 'ctrl+alt+c', method: 'helper-cmake' },
    { keys: 'ctrl+alt+r', method: 'helper-run' },
    { keys: 'ctrl+alt+b', method: 'helper-build' },
    { keys: 'ctrl+alt+n', method: 'helper-newFile' },
  ];

  ipc.send('shortcuts', shortcuts);
}]);
