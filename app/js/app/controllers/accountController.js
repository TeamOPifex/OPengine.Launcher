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

        $scope.subscription = null;

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

                //if($scope.user.subscription) {
                  $.ajax({
                    url: 'http://api.opengine.io/api/v1/account/subscription?token=' + window.localStorage['login-token'] + '&cache=' + (+new Date),
                    method: 'GET',
                    success: function(data) {
                        console.log(data);
                        if(data.success) {
                          console.log(data.result);
                          $scope.subscription = {
                            created: new Date(data.result.created * 1000).toUTCString("en-US"),
                            current_period_start: new Date(data.result.current_period_start * 1000).toUTCString("en-US"),
                            current_period_end: new Date(data.result.current_period_end * 1000).toUTCString("en-US"),
                            amount: data.result.amount / 100.0,
                            status: data.result.status,
                            cancelled: data.result.canceled_at ? new Date(data.result.canceled_at * 1000).toUTCString("en-US") : null,
                            renew: !data.result.cancel_at_period_end
                          };
                          if(data.result.status == "active") {
                            $scope.user.subscription = "professional";
                          }
                          $scope.$digest();
                        } else {
                          alert('ERR getting user subscription');
                        }
                    }
                  });
                //}
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
