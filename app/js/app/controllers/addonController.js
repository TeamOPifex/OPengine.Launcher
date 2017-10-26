angular.module('engineControllers').controller('AddonCtrl', ['$scope', '$routeParams', 'user', 'marketplace',
    function($scope, $routeParams, user, marketplace) {
        $('.current-tab .tab-text').text($routeParams.id + ' Addon');
        
        $scope.addon = {};
        // Get Addon Details

        $.ajax({
            url: 'http://api.opengine.io/api/v1/packages/' + $routeParams.id,
            success: function(data) {
                console.log(data);
                $scope.addon = data.result;

                $scope.addon.installed = false;
                $scope.addon.installedVersion = '';
                for(var j = 0; j < marketplace.length; j++) {
                    if($scope.addon.id == marketplace[j].name) {
                        $scope.addon.installed = true;
                        $scope.addon.installedVersion = marketplace[j].version;
                        break;
                    }
                }

                $.ajax({
                    url: 'http://api.opengine.io/api/v1/packages/' + $routeParams.id + '/versions/' + $scope.addon.latest + '/image',
                    success: function( data ) {
                        $scope.imageUrl = data.result
                        $scope.$digest();
                    }
                });
                
            }
        });

        $scope.Install = function() {

            $.ajax({
                url: 'http://api.opengine.io/api/v1/packages/' + $scope.addon.id + '/versions/' + $scope.addon.latest + '?token=' + window.localStorage['login-token'],
                success: function(data) {
                    console.log(data);
                    if(!data.success) {
                      alert('Error:' + data.message);
                      return;
                    }

                    var installData = {
                        id: $scope.addon.id + '.' + $scope.addon.latest,
                        url: data.result
                    };
                    console.log(installData);
                    ipc.send('install', installData);
                }
            })
        }
	}]);
