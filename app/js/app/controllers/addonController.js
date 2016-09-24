angular.module('engineControllers').controller('AddonCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        $('.current-tab .tab-text').text($routeParams.addonName + ' Addon');
	}]);
