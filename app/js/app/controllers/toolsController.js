var engineControllers = angular.module('engineControllers');

engineControllers.controller('ToolsCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        var IPC = require('electron').ipcRenderer;

        var path = IPC.sendSync('absPath', 'spriteSheet.html');
        $('#sprite-sheet-frame').attr('src', path);
	}
]);
