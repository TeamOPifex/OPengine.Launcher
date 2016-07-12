angular.module('engineControllers').controller('ToolsCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
      $('.current-tab .tab-text').text('Tools');
        var IPC = require('electron').ipcRenderer;

        var path = IPC.sendSync('absPath', 'spriteSheet.html');
        $('#sprite-sheet-frame').attr('src', path);
	}
]);
