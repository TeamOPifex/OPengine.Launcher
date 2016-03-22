var engineControllers = angular.module('engineControllers');

engineControllers.controller('SettingsCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {

        $scope.logout = function() {
        	user.OPifex = false;
            window.localStorage.removeItem('githubAccessToken');
            require('electron').ipcRenderer.send('signout');
        }

        $scope.root = global.root;
        $scope.physx = window.localStorage['physx'];
        $scope.v8 = window.localStorage['v8'];
        $scope.fmod = window.localStorage['fmod'];
        $scope.assimp = window.localStorage['assimp'];

        $scope.setRoot = function() {
            global.root = $scope.root;
        }

        $scope.savePhysX = function() {
            window.localStorage.setItem('physx', $scope.physx);
        }
        $scope.setPhysX = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.physx = folders[0].split('\\').join('/');
                $scope.savePhysX();
            }
        }

        $scope.saveV8 = function() {
            window.localStorage.setItem('v8', $scope.v8);
        }
        $scope.setV8 = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.v8 = folders[0].split('\\').join('/');
                $scope.saveV8();
            }
        }

        $scope.saveFMOD = function() {
            window.localStorage.setItem('fmod', $scope.fmod);
        }
        $scope.setFMOD = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.fmod = folders[0].split('\\').join('/');
                $scope.saveFMOD();
            }
        }

        $scope.saveAsio = function() {
            window.localStorage.setItem('asio', $scope.asio);
        }
        $scope.setAsio = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.asio = folders[0].split('\\').join('/');
                $scope.saveFAsio();
            }
        }

        $scope.saveAssimp = function() {
            window.localStorage.setItem('assimp', $scope.assimp);
        }
        $scope.setAssimp = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.assimp = folders[0].split('\\').join('/');
                $scope.saveAssimp();
            }
        }

    }]);
