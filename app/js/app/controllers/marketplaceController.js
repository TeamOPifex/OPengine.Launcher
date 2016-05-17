angular.module('engineControllers').controller('MarketplaceCtrl', ['$scope', '$routeParams', 'user', 'marketplace',
    function($scope, $routeParams, user, marketplace) {
        $('.current-tab').text('Marketplace');

        $scope.addons = window.addons || [];
        function GetAddons() {
            $.ajax({
                url: 'http://api.opengine.io/api/v1/packages',
                success: function(data) {
                    console.log(data);
                    if(data.success) {
                        $scope.addons = data.result;
                        window.addons = data.result;

                        // Check for installed addons
                        for(var i = 0; i < $scope.addons.length; i++) {
                            for(var j = 0; j < marketplace.length; j++) {
                                console.log($scope.addons[i].id, marketplace[j].id);
                                if($scope.addons[i].id == marketplace[j].name) {
                                    $scope.addons[i].installed = true;
                                    $scope.addons[i].installedVersion = marketplace[j].version;
                                    break;
                                }
                            }
                        }

                        $scope.$digest();
                    }
                }
            });
        }

        if($scope.addons.length == 0) {
          GetAddons();
        }

        var ipc = require('electron').ipcRenderer;

        ipc.on('progress', function(event, state) {
          console.log(state);
          // $('#message-progress').text((state.percentage * 100).toFixed(2));
          // $('#message-downloaded').text((state.size.transferred / 1024).toFixed(2) + ' KB');
          // $('#message-total').text((state.size.total / 1024).toFixed(2) + ' KB');
          // $('#message-rate').text((state.speed / 1024).toFixed(2) + ' KB');
          // $('#message-remaining').text(state.time.remaining.toFixed(0));
        });

        ipc.on('finished', function(event, state) {
          marketplace.refresh();
          GetAddons();
        });

        $scope.install = function(addon) {
            console.log('Install', addon);
            $.ajax({
                url: 'http://api.opengine.io/api/v1/packages/' + addon.id + '?token=' + window.localStorage['login-token'] + '&version=' + addon.latest + '&os=windows',
                success: function(data) {
                    console.log(data);
                    if(!data.success) {
                      alert('Error:' + data.message);
                      return;
                    }

                    ipc.send('install', data.result);
                }
            })
        }
	}]);
