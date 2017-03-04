angular.module('engineControllers').controller('LoginCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {

      console.log('LOGIN');

    	var Github = require('github-api');

      var qs = (function(a) {
          if (a == "") return {};
          var b = {};
          for (var i = 0; i < a.length; ++i)
          {
              var p=a[i].split('=', 2);
              if (p.length == 1)
                  b[p[0]] = "";
              else
                  b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
          }
          return b;
      })(window.location.search.substr(1).split('&'));

      //console.log(qs);

      if(qs['access_token']) {
        window.localStorage.setItem('githubAccessToken', qs['access_token']);
      }


        $scope.token = '';
        $scope.email = '';
    	$scope.branches = [];

        $scope.root = require('os').homedir() + '/.opengine';

    	$scope.login = function() {

            window.localStorage.setItem('githubToken', $scope.token);
            window.localStorage.setItem('oproot', $scope.root);

            global.root = $scope.root;

              user.github = new Github({
                token: $scope.token,
                auth: "oauth"
              });
    		user.token = $scope.token;

        //window.location = 'app.html#!/library';
    		// user.githubUser = user.github.getUser();
    		// user.githubUser.orgs(function(err, results) {
    		// 	if(err) {
    		// 		if(err.error == 401) {
    		// 			alert('Failed to authenticate');
    		// 			return;
    		// 		}
    		// 	}
        //
    		// 	user.orgs = results;
    		// 	for(var i = 0; i < user.orgs.length; i++) {
    		// 		if(user.orgs[i].login == 'TeamOPifex') {
    		// 			user.OPifex = true;
    		// 			break;
    		// 		}
    		// 	}
        //
    		// 	if(!user.OPifex) {
    		// 		alert('Not a part of the Github Organization TeamOPifex');
    		// 	} else {
    		// 		user.githubUser.orgRepos('teamopifex', function(err, results) {
    		// 			//console.log('org repos', err, results);
    		// 			user.orgRepos = results;
    		// 		});
        //
    		// 		window.location = 'app.html#!/library';
    		// 	}
    		// });

    		//console.log(user);

    	}

        $scope.signup = function() {
            $.ajax({
                url: 'http://opengine.io/add',
                method: 'POST',
                data: {
                    email: $scope.email
                },
                success: function(data) {
                    alert('An e-mail has been sent.');
                }
            });
        }

        if(window.localStorage['githubToken']) {
            $scope.token = window.localStorage['githubToken'];
        }

        if(window.localStorage['githubAccessToken']) {
          $scope.token =  window.localStorage['githubAccessToken'];
          $scope.login();
        }

        if(window.localStorage['oproot']) {
            $scope.root = window.localStorage['oproot'];
        }

 }]);
