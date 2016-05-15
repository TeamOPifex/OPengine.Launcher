var ipc = require('electron').ipcRenderer;
var fs = require('fs');

angular.module('engineControllers').controller('LibraryCtrl', ['$scope', '$http', 'user', 'git', 'engines', 'projects', 'engineReleases', 'config',
  function ($scope, $http, user, git, engines, projects, engineReleases, config) {


    $scope.token = window.localStorage['githubToken'];
    $scope.root = require('os').homedir() + '/.opengine';
    window.localStorage.setItem('oproot', $scope.root);
    global.root = $scope.root;

    $('.current-tab').text('Library');

    var Github = require('github-api');
    // user.github = new Github({
    //     token: $scope.token,
    //     auth: "oauth"
    // });
    user.github = new Github();
    user.token = $scope.token;

  //   user.githubUser = user.github.getUser();
  //   user.githubUser.orgs(function(err, results) {
  //     if(err) {
  //         if(err.error == 401) {
  //             alert('Failed to authenticate');
  //             return;
  //         }
  //     }
  //
  //     user.orgs = results;
  //     for(var i = 0; i < user.orgs.length; i++) {
  //         if(user.orgs[i].login == 'TeamOPifex') {
  //             user.OPifex = true;
  //             break;
  //         }
  //     }
  //
  //     if(!user.OPifex) {
  //         alert('Not a part of the Github Organization TeamOPifex');
  //     } else {
  //         user.githubUser.orgRepos('teamopifex', function(err, results) {
  //             user.orgRepos = results;
  //         });
  //     }
  // });



	$scope.engineVersions = [ ];
  	$scope.engineReleases = [ ];
    $scope.projects = [];

    $scope.newProject = {
        RepoName: '',
        CreateRepo: false
    };

    $scope.engineVersions = engines;
    $scope.projects = projects;

    $scope.config = config.getLauncher();
    //console.log('LAUNCHER CONFIG', $scope.config);
    for(var i = 0; i < $scope.config.projects.length; i++){
        $scope.config.projects[i]._v = i;
        //console.log($scope.config.projects[i]);
        var found = false;
        for(var j = 0; j < $scope.projects.length; j++){
            if($scope.projects[j].id == $scope.config.projects[i].id) {
                found = true;
                break;
            }
        }
        if(!found) {
            $scope.config.projects[i].bg = 'content/imgs/project-bg.png';

            var path = require('path');
            var fs = require('fs');
            var imgPath = path.resolve($scope.config.projects[i].id + '/bg.png');
            if(fs.existsSync(imgPath)) {
              $scope.config.projects[i].bg = 'file://' + imgPath.split('\\').join('/');
            }

            imgPath = path.resolve($scope.config.projects[i].id + '/bg.jpg');
            if(fs.existsSync(imgPath)) {
              $scope.config.projects[i].bg = 'file://' + imgPath.split('\\').join('/');
            }
            $scope.projects.push($scope.config.projects[i]);
        }
    }

    engineReleases.all(function(err, releases) {
        $scope.engineReleases = releases;
        $scope.$digest();
    });

  	$scope.clone = function(commit) {

        var clone = {
            name: 'OPengine',
            version: commit.name,
            cloning: true
        };

        $scope.engineVersions.push(clone);

        var version = commit.name.split('.').join('_');
        //var name = "opengine_" + version;

        var name = 'opengine_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });

        git.cloneEngine('TeamOPifex', 'OPengine', name, function(err, repo) {
            clone.cloning = false;

            var engineConfig = config.getEngine(name);
            engineConfig.engine.version = commit.name;
            config.saveEngine(name, engineConfig);

            $scope.$digest();
        });
  	};

    $scope.NewProject = function() {
        $scope.newProject = {
            RepoName: '',
            CreateRepo: false
        };
        $('#newProjectModal').modal();
    };

    $scope.ExistingProject = function() {
        var folders = ipc.sendSync('folder');
        //console.log(folders);
        if(folders && folders.length > 0) {
            var dirs = folders[0].split('\\').join('/').split('/');
            var name = dirs[dirs.length - 1];

            var clone = {
                name: name,
                id: name
            };

            $scope.projects.push(clone);
            $scope.config.projects.push({
                id: name,
                name: name,
                path: folders[0]
            });
            config.saveLauncher($scope.config);
        }
    }

    $scope.CreateFromGithub = function() {

        var Github = require('github-api');
        var github = new Github({
          token: window.localStorage.getItem('githubToken'),
          auth: "oauth"
        });

        var user = github.getUser();
        user.repos(function(err, results) {
            $scope.userRepos = results;
            $('#newGithubProjectModal').modal('show');
            $scope.$digest();
        });
    };

    $scope.CloneGithub = function() {
        $('#newGithubProjectModal').modal('hide');

        var safeName = $scope.currentGithubRepo.name.replace(/([^a-z0-9]+)/gi, '-');

        var clone = {
            name: $scope.currentGithubRepo.name,
            id: safeName,
            cloning: true
        };

        $scope.projects.push(clone);

        git.cloneProject($scope.currentGithubRepo.owner.login, $scope.currentGithubRepo.name, safeName, function(err, repo) {
            clone.cloning = false;
            $scope.$digest();
        });
    };

    $scope.CreateNewProject = function() {

        $('#newProjectModal').modal('hide');
        //console.log(git);

        if($scope.newProject.CreateRepo) {

        }

        var safeName = $scope.newProject.RepoName.replace(/([^a-z0-9]+)/gi, '-');

        var clone = {
            name: $scope.newProject.RepoName,
            id: safeName,
            cloning: true
        };

        $scope.projects.push(clone);

        git.cloneProject('TeamOPifex', 'OPengine.AppTemplate', safeName, function(err, repo) {
            clone.cloning = false;

            var path = nodePath.resolve(global.root + "/repos/projects/" + safeName);

            require('rimraf')(path + '/.git', function() {
                // Find CMakeLists.txt and replace YOURAPPNAME with clone.name
                fs.readFile(path + '/CMakeLists.txt', 'utf8', function (err,data) {
                  if (err) {
                    return console.log(err);
                  }


                  var result = data;
                  while(result.indexOf('YOURAPPNAME') > -1) {
                      result = result.replace('YOURAPPNAME', safeName);
                  }

                  fs.writeFile(path + '/CMakeLists.txt', result, 'utf8', function (err) {
                     if (err) return console.log(err);

                     var projectConfig = config.getProject(path);
                     projectConfig.solution = safeName + '.sln';
                     projectConfig.launchOSX = projectConfig.launchLinux = './' + safeName;
                     projectConfig.launchWindows = 'Debug/' + safeName + '.exe';
                     config.saveProject(path, projectConfig);

                     git.init(path, function() {
                         $scope.$digest();
                     });
                  });
                });
            });
        });
    };

  }]);
