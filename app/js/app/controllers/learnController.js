angular.module('engineControllers').controller('LearnCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
      $('.current-tab .tab-text').text('Documentation');
      $('.current-tab').click(function() {
        if($('iframe').length == 0) return;
        $('iframe')[0].contentWindow.location = $('iframe').attr('src');
      });
      $('li.learn').click(function() {
        if($('iframe').length == 0) return;
        $('iframe')[0].contentWindow.location = $('iframe').attr('src');
      });
	}]);
