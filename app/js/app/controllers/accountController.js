angular.module('engineControllers').controller('AccountCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        $('.current-tab .tab-text').text('Account');

        $scope.user = {
          firstName: '',
          lastName: ''
        };
      	if(window.localStorage['user']) {
      		try {
      			$scope.user = JSON.parse(window.localStorage['user']);
      		} catch(err) {

      		}
      	}

        require('electron').remote.getCurrentWindow().webContents.session.clearCache(function(res, err) { console.log(res, err) })
        $.ajax({
          url: 'http://api.opengine.io/api/v1/account?token=' + window.localStorage['login-token'] + '&cache=' + (+new Date),
          method: 'GET',
          success: function(data) {
              console.log(data);
              if(data.success) {
                $scope.user = data.result;
                window.localStorage.setItem('user', JSON.stringify(data.result));
                $scope.$digest();
              } else {
                alert('ERR getting user account');
              }
          }
        });

        $scope.submit = function() {
          require('electron').remote.getCurrentWindow().webContents.session.clearCache(function(res, err) { console.log(res, err) })
          $.ajax({
            url: 'http://api.opengine.io/api/v1/account?token=' + window.localStorage['login-token'] + '&cache=' + (+new Date),
            method: 'PUT',
            data: $scope.user,
            success: function(data) {
                console.log(data);
                if(data.success) {
                  $scope.user = data.result;
                  window.localStorage.setItem('user', JSON.stringify(data.result));
                  $(window).trigger('account-change');
                  $scope.$digest();
                } else {
                  alert('ERR getting user account');
                }
            }
          });
        }



	}]);
