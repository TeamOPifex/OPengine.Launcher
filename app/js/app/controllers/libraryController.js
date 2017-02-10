var ipc = require('electron').ipcRenderer;
var fs = require('fs');

angular.module('engineControllers').controller('LibraryCtrl', ['$scope', '$http', 'user', 'git', 'engines', 'projects', 'engineReleases', 'config', '$sce',
  function ($scope, $http, user, git, engines, projects, engineReleases, config, $sce) {


    $scope.token = window.localStorage['githubToken'];
    $scope.root = require('os').homedir() + '/.opengine';
    window.localStorage.setItem('oproot', $scope.root);
    global.root = $scope.root;

    $('.current-tab .tab-text').text('Library');

    var Github = require('github-api');
    // user.github = new Github({
    //     token: $scope.token,
    //     auth: "oauth"
    // });
    user.github = new Github({});
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

  $scope.templates = [];
  $scope.templates.push({
    id: 1,
    name: "Blank Template",
    desc: "<img class=\"template-image\" src=\"content/imgs/OPengineLogoWhite.png\" /><div>An empty blank project.</div>",
    repo: "OPengine.AppTemplate"
  });
  $scope.templates.push({
      id: 2,
      name: "Scripted V8",
      desc: "<img class=\"template-image\" src=\"https://pbs.twimg.com/media/C15FIgXVIAA_BbA.jpg:large\" /><div>Uses Chrome V8 Engine.</div>",
      repo: "OPengine.AppTemplate.Scripting"
  });
  $scope.templates.push({
      id: 3,
      name: "Basic 3D Game",
      desc: "<img class=\"template-image\" src=\"content/imgs/PhysXScripting.png\" /><div>Uses Chrome V8 Engine and NVidia's PhysX Engine along with some basic game structure.</div>",
      repo: "OPengine.AppTemplate.PhysXScripting"
  });
  $scope.templateSelected = $scope.templates[0];
  $scope.templateSelect = function(temp) {
    $scope.templateSelected = temp;
  };
  //$sce.trustAsHtml($scope.templateSelected.desc);


	$scope.engineVersions = [ ];
  	$scope.engineReleases = [ ];
    $scope.projects = [];

    $scope.newProject = {
        RepoName: '',
        CreateRepo: false
    };

    $scope.tab = function(t) {
        $('#newProjectModal li').removeClass('active');
        $('#newProjectModal li#' + t).addClass('active');
        $('#newProjectModal .tab').hide();
        $('#newProjectModal .tab-' + t).show();
    }

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

      $('#newEngineModal').modal('hide');

        var version = commit.name.split('.').join('_');
        //var name = "opengine_" + version;

        var name = 'opengine_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });

          var clone = {
              id: name,
              name: 'OPengine',
              version: commit.name,
              cloning: true
          };

          $scope.engineVersions.push(clone);

        git.CLI.cloneEngine('TeamOPifex', 'OPengine', name, function(err, repo) {
            clone.cloning = false;

            var engineConfig = config.getEngine(name);
            engineConfig.engine.version = commit.name;
            config.saveEngine(name, engineConfig);

            git.CLI.setBranch('OPengine', name, commit.sha, function() {
              $scope.$digest();
            });

        });
  	};

    $scope.NewProject = function() {
        $scope.newProject = {
            RepoName: '',
            CreateRepo: false
        };
        $('#newProjectModal').modal();
    };

    $scope.currentEngineVersion = null;
    $scope.NewEngine = function() {
        $scope.newEngine = {
            RepoName: '',
            CreateRepo: false
        };
        if(!$scope.currentEngineVersion) {
          $scope.currentEngineVersion = $scope.engineReleases[0];
        }
        console.log($scope.currentEngineVersion);
        $('#newEngineModal').modal();
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
                path: folders[0],
                bg: 'content/imgs/project-bg.png'
            });
            config.saveLauncher($scope.config);
            $('#newProjectModal').modal('hide');
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

        git.CLI.cloneProject($scope.currentGithubRepo.owner.login, $scope.currentGithubRepo.name, safeName, function(err, repo) {
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
            cloning: true,
            bg: 'content/imgs/project-bg.png'
        };

        $scope.projects.push(clone);

        git.CLI.cloneProject('TeamOPifex', $scope.templateSelected.repo, safeName, function(err, repo) {
            clone.cloning = false;

            var path = nodePath.resolve(global.root + "/repos/projects/" + safeName);

            var fs = require('fs');
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
                     projectConfig.solution = safeName;
                     projectConfig.launchOSX = projectConfig.launchLinux = './' + safeName;
                     projectConfig.launchWindows = 'Debug/' + safeName + '.exe';
                     config.saveProject(path, projectConfig);

                     git.CLI.init(path, function() {

                         $scope.$digest();
                     });
                  });
                });
            });
        });
    };

    function Setup() {


      $.powerTour({
        tours: [
          {
            startWith          : 1,
            easyCancel         : true,
            escKeyCancel       : true,
            steps : [
                {
                  hookTo          : '#EngineReleases',
                  content         : '#step-id-1',
                  width           : 400,
                  position        : 'sc',
                  offsetY         : 0,
                  offsetX         : 20,
                  fxIn            : 'flipInX',
                  fxOut           : 'bounceOutLeft',
                  showStepDelay   : 0,
                  center          : 'step',
                  scrollSpeed     : 400,
                  scrollEasing    : 'swing',
                  scrollDelay     : 0,
                },
                    {
                      hookTo          : '#EngineVersionsTitle',
                      content         : '#step-id-2',
                      width           : 400,
                      position        : 'bl',
                      fxIn            : 'fadeIn',
                      fxOut           : 'fadeOut',
                      showStepDelay   : 0,
                      center          : 'step',
                      scrollSpeed     : 400,
                      scrollEasing    : 'swing',
                      scrollDelay     : 0,
                    },
                        {
                          hookTo          : '#EngineReleases',
                          content         : '#step-id-3',
                          width           : 400,
                          position        : 'bm',
                          fxIn            : 'rotateIn',
                          fxOut           : 'rotateOut',
                          showStepDelay   : 0,
                          center          : 'step',
                          scrollSpeed     : 400,
                          scrollEasing    : 'swing',
                          scrollDelay     : 0,
                        }
            ]
          }
        ]
      });
    }
    $scope.tour = function(e) {
      setTimeout(function() {
        $.powerTour('destroy');
        Setup();
        $.powerTour('run', 1);
      }, 0);
      console.log('test', e);
      return false;
    }

    if(!window.localStorage["tour"]) {
      //$scope.tour();

    }
  }]);
