var nodePath = require('path');
var fs = require('fs');
var os = require('os');
var ipc = require('ipc');
var shell = require('shell');

var engineControllers = angular.module('engineControllers');
engineControllers.controller('ProjectDetailCtrl', ['$scope', '$routeParams', 'console', '$rootScope', 'engines', 'config', 'cmake', 'make', 'run', 'git',
    function($scope, $routeParams, appConsole, $rootScope, engines, config, cmake, make, run, git) {
        $scope.path = $routeParams.versionId;
        $scope.engines = engines;
        //console.log(engines);
        $scope.name = $routeParams.versionId;

        $scope.changes = 0;

        $scope.windows = false;
        if(require('os').type() == 'Windows_NT') {
            $scope.windows = true;
        }
        $scope.visualStudios = [
            { name: 'Visual Studio 6', id: 0 },
            { name: 'Visual Studio 7', id: 1 },
            { name: 'Visual Studio 10 2010', id: 2 },
            { name: 'Visual Studio 11 2012', id: 3 },
            { name: 'Visual Studio 12 2013', id: 4 },
            { name: 'Visual Studio 14 2015', id: 5 }
        ];

        $scope.os = { name: 'Operating System', id: 'OPIFEX_OS', type: 'targetSelector',
	        options: [
				{ name: 'Mac x86', id: 'OPIFEX_OSX32' },
	            { name: 'Mac x64', id: 'OPIFEX_OSX64' },
	            { name: 'Windows x86', id: 'OPIFEX_WIN32' },
	            { name: 'Windows x64', id: 'OPIFEX_WIN64' },
	            { name: 'Linux x86', id: 'OPIFEX_LINUX32' },
	            { name: 'Linux x64', id: 'OPIFEX_LINUX64' },
	            { name: 'iOS', id: 'OPIFEX_IOS' },
	            { name: 'Android', id: 'OPIFEX_ANDROID' }
	        ]
		};

    var osType = require('os').type();
    var osArch =  require('os').arch();

    if( osType == 'Windows_NT') {
      if(osArch == 'x64') {
        $scope.os.value = $scope.os.options[3];
      } else {
        $scope.os.value = $scope.os.options[2];
      }
    } else if (osType = 'Darwin') {
      if(osArch == 'x64') {
        $scope.os.value = $scope.os.options[1];
      } else {
        $scope.os.value = $scope.os.options[0];
      }
    } else {
      if(osArch == 'x64') {
        $scope.os.value = $scope.os.options[5];
      } else {
        $scope.os.value = $scope.os.options[4];
      }
    }


        var projectRepoPath = global.root + '/repos/projects/' + $scope.path;
        var launcherConfig = config.getLauncher();
        for(var i = 0; i < launcherConfig.projects.length; i++) {
            if(launcherConfig.projects[i].id == $scope.path) {
                projectRepoPath = launcherConfig.projects[i].path;
            }
        }

        $scope.config = config.getProject(projectRepoPath);

        var buildDir = global.root + '/build/' + $scope.path + '_build';
        var startPath = nodePath.resolve(buildDir);
        var repoPath = nodePath.resolve(projectRepoPath);

        $scope.projectRepoPath = repoPath;

        // Code Editor
        $scope.showCode = false;
        $scope.toggleCode = function() {
            $scope.showCode = !$scope.showCode;
        };
        $scope.toggleCode();
        $scope.pinned = [
            { label: 'HacknPlan', path: 'https://app.hacknplan.com/p/3640/m/4336' }
        ]

        $scope.openFolder = function() {
            if($scope.CurrentDir == 1) {
                run.command('Open Folder', 'explorer', [ repoPath + '\\' ], 'C:\\');
            } else {
                run.command('Open Folder', 'explorer', [ startPath + '\\' ], 'C:\\');
            }
        }

        $scope.openSLN = function() {
            shell.openItem(buildDir + '/' + $scope.config.solution + '.sln');
        }

        $scope.rebuild = false;
        $scope.firstBind = false;
        $scope.$watch(function() { return $scope.config; }, function() {
            if($scope.firstBind) {
                $scope.rebuild = true;
            }
            $scope.firstBind = true;
        }, true);

        if(engines.length > 0) {
            $scope.selectedEngine = $scope.engines[0];
        }



        $scope.CurrentDir = 0;
        $scope.Directories = [
            {
                symbol: 'B',
                path: startPath
            },
            {
                symbol: 'S',
                path: nodePath.resolve(projectRepoPath)
            }
        ];

        $scope.ToggleDir = function() {
            //console.log('TOGGLED');
            $scope.CurrentDir++;
            $scope.CurrentDir = $scope.CurrentDir % ($scope.Directories.length);
        }

        $scope.cmd = "";
        $scope.runCmd = function() {
            var args = $scope.cmd.split(' ');
            var cmd = args[0];
            args.shift(0);

            var runPath = $scope.Directories[$scope.CurrentDir].path;

            run.command('Launching ' + $scope.path, cmd, args, runPath, function() {
                $scope.cmd = "";
                appConsole.display = true;
            });
        }

        $scope.hideConsole = function() {
            appConsole.display = false;
        }

        $scope.cmake = function(cb, force) {
            appConsole.task = "cmake project " + $scope.path;
            config.saveProject(projectRepoPath, $scope.config);
            var lastBuildConfig = config.getBuildConfig($scope.config.engine);
            if(force || $scope.rebuild || !config.isEqual(lastBuildConfig, $scope.config)) {
                cmake.engine($scope.config.engine.id, $scope.config, $scope.os, function(err) {
                    if(err) return;

                    make.engine($scope.config.engine.id, $scope.config, function(err) {
                        if(err) return;

                        config.saveBuildConfig($scope.config.engine, $scope.config);
                        $scope.rebuild = false;

                        cmake.project(projectRepoPath, $scope.path, $scope.config.engine, $scope.config, $scope.os, function() {
                            cb && cb();
                        });
                    });
                });
            } else {
                cmake.project(projectRepoPath, $scope.path, $scope.config.engine, $scope.config, $scope.os, function() {
                    cb && cb();
                });
            }
        };


        $scope.make = function(cb, force) {
            var sourceDir = global.root + '/repos/projects/' + $scope.path;
            var buildDir = global.root + '/build/' + $scope.path + '_build';

            function m() {
                make.project($scope.path, $scope.config, cb);
            }

            var lastBuildConfig = config.getBuildConfig($scope.config.engine);
            if(force || $scope.rebuild || !config.isEqual(lastBuildConfig, $scope.config)) {
                $scope.cmake(m, force);
            } else {
                m();
            }
        };

        $scope.run = function() {
            var sourceDir = global.root + '/repos/projects/' + $scope.path;
            var buildDir = global.root + '/build/' + $scope.path + '_build';

            function m() {

                var launchCmd = './YOURAPPNAME';
                switch(os.type()) {
                    case 'Darwin': {
                        launchCmd = $scope.config.launchOSX || launchCmd;
                        break;
                    }
                    case 'Windows_NT': {
                        launchCmd = $scope.config.launchWindows || launchCmd;
                        break;
                    }
                    case 'Unix': {
                        launchCmd = $scope.config.launchLinux || launchCmd;
                        break;
                    }
                    default:
                        launchCmd = './YOURAPPNAME';
                }

                $scope.config.launch = launchCmd;

                var cmds = $scope.config.launch.replace('\r', '').split('\n');

                function RUN(cmd, cb) {
                    if($scope.os.value.id == 'OPIFEX_IOS') {
                        require('open')(buildDir + '/iOS/OPengine.xcodeproj');
                        //run.cmd('run ' + $scope.path, buildDir + '/iOS/' + $scope.path + '.xcodeproj', [], buildDir, cb);
                    } else {
                        run.cmd('run ' + $scope.path, cmd, [], buildDir, cb);
                    }
                }

                var promise = null;
                for(var i = 0; i < cmds.length; i++) {
                    if(promise) {
                        var proc = new $.Deferred();
                        promise.then(function() {
                            appConsole.task = 'run ' + cmds[i];
                            RUN(cmds[i], function() {
                                proc.resolve();
                            })
                        });
                        promise = proc.promise();
                    } else {
                        var proc = new $.Deferred();
                        appConsole.task = 'run ' + cmds[i];
                        RUN(cmds[i], function() {
                            proc.resolve();
                        });
                        promise = proc.promise();
                    }
                }
            }

            $scope.make(m);
        };

        $scope.atom = function() {
            var spawn = require('child_process').spawn;
            spawn('atom', [ nodePath.resolve(projectRepoPath) ], {
                env: process.env
            });
        }

        $scope.atomBuild = function() {
            var spawn = require('child_process').spawn;
            spawn('atom', [ nodePath.resolve(buildDir) ], {
                env: process.env
            });
        };

        function GetChanges() {
            git.hasChangesToPull(nodePath.resolve(projectRepoPath), function(err, changes) {
                //console.log('Changes', changes);
                $scope.changes = changes;
                $scope.$digest();
            });
        }
        GetChanges();

        function GetBranches() {
            git.branches(nodePath.resolve(projectRepoPath), function(err, result) {
                $scope.localBranches = result.local;
                $scope.remoteBranches = result.remote;
                $scope.$digest();
            });
        };
        GetBranches();

        $scope.checkout = function(branch) {
            git.checkout(nodePath.resolve(projectRepoPath), branch.name, function() {
                GetBranches();
                GetChanges();
            });
        };

        $scope.pull = function(branch) {
            git.pull(nodePath.resolve(projectRepoPath), function() {
                GetChanges();
            });
        };

        ipc.on('build', function() {
            $scope.make(function() {});
            $scope.$digest();
        });

        ipc.on('forceBuild', function() {
            $scope.make(function() {}, true);
            $scope.$digest();
        });

        ipc.on('forceRun', function() {
            $scope.make(function() {
                $scope.run();
            }, true);
            $scope.$digest();
        });

        ipc.on('run', function() {
            $scope.run();
            $scope.$digest();
        });

  }]);
