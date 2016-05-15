angular.module('engineApp').directive('codeEditor', ['CodeEditor', function (CodeEditor) {
    return {
        restrict: 'E',
        templateUrl: 'js/app/partials/shared/codeEditor.html',
        transclude: true,
        scope: {
            path: '=',
            label: '@',
            pinned: '&',
            showCode: '='
        },
        link: function ($scope) {
            var ipc = require('electron').ipcRenderer;

            var editor = new CodeEditor('editor',
                {
                    path: $scope.path,
                    label: $scope.label || 'OPengine',
                    pinned: $scope.pinned(),
                    showCode: $scope.showCode
                });


            $scope.$on('$destroy', function() {
                console.log('SCOPE DESTROYED');
                editor.Destroy();
                ipc.removeAllListeners();
            });

            $scope.editor = editor;
            $scope.newFileName = '';
            $scope.showNewFile = false;
            $scope.newFileNode = null;
            $scope.showDeleteFile = false;
            $scope.deleteFileNode = null;
            $scope.showFileType = 1;

            editor.onNewFile = function(node) {
                $scope.showNewFile = true;
                $scope.newFileNode = node;
                setTimeout(function() {
                    $('#newFileText').focus();
                }, 0);
            }

            editor.onNewFolder = function(node) {
                $scope.showNewFolder = true;
                $scope.newFolderNode = node;
                setTimeout(function() {
                    $('#newFolderText').focus();
                }, 0);
            }
            editor.onDeleteFile = function(node) {
                //$scope.newFileName = '';
                $scope.showDeleteFile = true;
                $scope.deleteFileNode = node;
                $('#deleteFileModal').modal();
            }
            editor.onChanged = function() {
                if(!$scope.$$phase) {
                    $scope.$digest();
                }
            }
            editor.onSaved = function() {
                $scope.$digest();
            }


            $scope.select = function(data) {
                var result = editor.Open(data);
                if(result > 0) {
                  $scope.showFileType = result;
                  $scope.showCode = true;
                }
            }

            ipc.on('save', function() {
                editor.Save();
            });

            ipc.on('nextTab', function() {
                editor.NextTab();
                $scope.$digest();
            });

            ipc.on('prevTab', function() {
                editor.PrevTab();
                $scope.$digest();
            });

            ipc.on('toggleFile', function() {
                editor.ToggleFile();
                $scope.$digest();
            });


            $scope.contextMenu = function(node) {
                editor.Menu(node);
            }

            var fs = require('fs');

            $scope.newFile = function() {
                var path = $scope.newFileNode.fullPath + '/' + $scope.newFileName;
                fs.readFile(path, function(err, data) {
                    if(!err) {
                        alert('File exists.');
                        return;
                    }
                    fs.writeFile(path, '', 'utf8', function() {
                        var node = editor.AddToNode($scope.newFileNode, $scope.newFileName);
                        editor.Open(node);
                        $scope.showNewFile = !$scope.showNewFile;
                        $scope.$digest();
                    });
                });
            };

            $scope.newFolder = function() {
                var path = $scope.newFolderNode.fullPath + '/' + $scope.newFolderName;

                var mkdirp = require('mkdirp');
                mkdirp(path, function(err) {
                    var node = editor.AddToNode($scope.newFolderNode, $scope.newFolderName, true);
                    editor.Open(node);
                    $scope.showNewFolder = !$scope.showNewFolder;
                    $scope.$digest();
                });
            };
            $scope.cancelFile = function() {
                //console.log($scope.newFileName);
                $scope.newFileName = ''; $scope.showNewFile = !$scope.showNewFile; };

            $scope.deleteFile = function() {
                fs.unlink($scope.deleteFileNode.fullPath, function(err) {
                    editor.RemoveNode($scope.deleteFileNode);
                    $scope.$digest();
                    $('#deleteFileModal').modal('hide');
                });
            };

            $scope.closeFile = function(node) {
                editor.Close(node);
            }
        }
    }
}]);
