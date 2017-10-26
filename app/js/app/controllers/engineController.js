var ipc = require('electron').ipcRenderer;
angular.module('engineApp').controller('engineCtrl', ['$scope', 'user', 'console', '$timeout', 'run', '$location', function($scope, user, appConsole, $timeout, run, $location) {
	console.log('engineAPP');
	if(!user.OPifex) {
	  window.location = '#/library';
	}

	var shortcuts = [
		{ keys: 'ctrl+`', method: 'toggleConsole' },
		{ keys: 'ctrl+shift+`', method: 'toggleFile' },
		{ keys: 'ctrl+s', method: 'save' },
		{ keys: 'ctrl+tab', method: 'nextTab' },
		{ keys: 'ctrl+shift+tab', method: 'prevTab' }
	];

	if(require('os').type() == 'Darwin') {
		shortcuts.push({ keys: 'cmd+s', method: 'save' });
	}

	ipc.send('shortcuts', shortcuts);

	$scope.console = appConsole;

	$scope.user = {
		username: '',
		firstName: '',
		lastName: ''
	};
	if(window.localStorage['user']) {
		try {
			$scope.user = JSON.parse(window.localStorage['user']);
		} catch(err) {

		}
	}

function GetUpdatedUser() {

		require('electron').remote.getCurrentWindow().webContents.session.clearCache(function(res, err) { console.log(res, err) })
		$.ajax({
			url: 'http://api.opengine.io/api/v1/account?token=' + window.localStorage['login-token'] + '&cache=' + (+new Date),
			method: 'GET',
			success: function(data) {
					console.log(data);
					if(data.success) {
						$scope.user = data.result;
						window.localStorage.setItem('user', JSON.stringify(data.result));
						$scope.$digest;
					} else {
						alert('ERR getting user account');
					}
			}
		});
}

	$(window).on('update-account', function() {
		GetUpdatedUser();
	});

	GetUpdatedUser();


	$(window).on('account-change', function(user) {
		if(window.localStorage['user']) {
			try {
				$scope.user = JSON.parse(window.localStorage['user']);
				$scope.$digest();
			} catch(err) {

			}
		}
	});


	// Side Bar
	if(window.localStorage["showSideBar"] == undefined) {
		$scope.showSideBar = true;
	} else {
		$scope.showSideBar = window.localStorage["showSideBar"] == "true";
	}
	$scope.toggleSideBar = function() {
		$scope.showSideBar = !$scope.showSideBar;
		window.localStorage["showSideBar"] = $scope.showSideBar;
	}



	$scope.open = function(test) {
		require('electron').shell.openExternal(test);
	};

	$scope.loggedIn = function() {
		if(user.OPifex) {
			return true;
		}
		return false;
	};

	$scope.getClass = function (path) {
	  if ($location.path().substr(0, path.length) === path) {
	    return 'active';
	  } else {
	    return '';
	  }
	}

    $scope.toggleConsole = function() {
        $scope.console.display = !$scope.console.display;
        if(!$scope.console.display) return;

        $timeout(function() {
			if($('.console').length > 0) {
	            $('.console')[0].scrollTop = $('.console')[0].scrollHeight;
			}
        });
    }

	$scope.hideConsole = function() {
		console.display = false;
	}

    ipc.on('toggleConsole', function() {
        $scope.toggleConsole();
		$('.console').focus();
        $scope.$digest();
    });


		$scope.close = function() {
				ipc.send('exit');
		};
		$('#close').click(function() {
				ipc.send('exit');
		});

		$('#minimize').click(function() {
			ipc.send('minimize');
		});
		$('#maximize').click(function() {
			ipc.send('maximize');
		});


		ipc.on('msvc', function(evt, result) {
			if(!result) return;
			window.localStorage.setItem('msvc', result.split('.')[0]);
		});
		ipc.send('msvc');

		$scope.signout = function() {
				user.OPifex = false;
				window.localStorage.removeItem('githubAccessToken');
				window.localStorage.removeItem('login-token');
				require('electron').ipcRenderer.send('signout');
		}
}]);
