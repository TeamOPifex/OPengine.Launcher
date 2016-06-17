angular.module('engineControllers').controller('BugCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        $('.current-tab .tab-text').text('Report Bug');

        $scope.project = 'OPengine';
        $scope.problem = '';

        $scope.submitting = false;

        $scope.submit = function() {
            $scope.submitting = true;

            var terminal = null;
            if($scope.includeTerminal) {
              terminal = $('.console').html();
            }

            require('electron').remote.getCurrentWindow().webContents.session.clearCache(function(res, err) { console.log(res, err) })
            $.ajax({
              url: 'http://api.opengine.io/api/v1/bug?token=' + window.localStorage['login-token'] + '&cache=' + (+new Date),
              method: 'POST',
              data: {
                project: $scope.project,
                problem: $scope.problem,
                terminal: terminal
              },
              success: function(data) {
                  console.log(data);
                  if(data.success) {
                    alert('The bug has been successfully reported');
                    $scope.problem = '';
                  } else {
                    alert('There was a problem creating the bug report, please try again.');
                  }
                  $scope.submitting = false;
                  $scope.$digest();
              }
            });
        };
	}]);
