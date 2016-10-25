angular.module('engineControllers').controller('NewAddonCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        $('.current-tab .tab-text').text('Create Addon');

        $scope.folder = '';
        $scope.files = [];
        $scope.binaries = [];

        var fs = require('fs'), path = require('path');
        function walk(currentDirPath, subDir, callback) {
            fs.readdirSync(currentDirPath).forEach(function(name) {
                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                callback(filePath, name, stat);
                if(subDir && stat.isDirectory()) {
                    walk(filePath, subDir, callback);
                }
            });
        }

        $scope.folder = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.folder = folders[0].split('\\').join('/');
                $scope.files = [];
                walk($scope.folder, true, function(path, name, stat) {
                    var root = path.substr($scope.folder.length);
                    $scope.files.push({
                        id: $scope.files.length,
                        name: root,
                        selected: true
                    });
                });
            }
        }

        $scope.addBinary = function() {
            $scope.binaries.push({
                id: $scope.binaries.length,
                files: []
            });
        }

        $scope.binaryFiles = function(binary) {
            var files = ipc.sendSync('files');

            if(files.length > 0) {
                binary.files = [];
                for(var i = 0; i < files.length; i++) {
                    binary.files.push({
                        id: binary.files.length,
                        name: files[i],
                        selected: true
                    });
                }
            }
        }
    }]);
