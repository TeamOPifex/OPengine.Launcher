var shell = require('shell');

function walk(currentDirPath, subDir, callback) {
    var fs = require('fs'), path = require('path');
    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        callback(filePath, name, stat);
        if(subDir && stat.isDirectory()) {
            walk(filePath, callback);
        }
    });
}

function extension(name) {
    if(!name) return '';
    if(name.length == 0) return '';

    var dots = name.split('.');
    if(dots.length == 1) return '';
    else return dots[dots.length - 1];
}

var engineControllers = angular.module('engineControllers');
engineControllers.controller('EngineDetailCtrl', ['$scope', '$routeParams', 'console', '$rootScope', 'config', 'cmake', 'make', 'run', 'git', 'CodeEditor',
    function($scope, $routeParams, appConsole, $rootScope, config, cmake, make, run, git, CodeEditor) {
        $scope.path = $routeParams.versionId;
        $scope.config = config.getEngine($scope.path);


        $scope.version = $scope.config.engine.version;



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
        window.EngineDetailCtrl = $scope;

        var projectRepoPath = global.root + '/repos/OPengine/' + $scope.path;
        var buildDir = global.root + '/build/' + $scope.path + '_build';

        var startPath = nodePath.resolve(buildDir);
        var repoPath = nodePath.resolve(projectRepoPath);

        $scope.projectRepoPath = projectRepoPath;

        // Code Editor
        $scope.showCode = false;
        $scope.toggleCode = function() {
            $scope.showCode = !$scope.showCode;
        };
        $scope.toggleCode();
        $scope.pinned = [
            { label: 'HacknPlan', path: 'https://app.hacknplan.com/p/3638/m/4335' }
        ];


        $scope.openFolder = function() {
            if($scope.CurrentDir == 1) {
                run.command('Open Folder', 'explorer', [ repoPath + '\\' ], 'C:\\');
            } else {
                run.command('Open Folder', 'explorer', [ startPath + '\\' ], 'C:\\');
            }
        }

        $scope.openSLN = function() {
            shell.openItem(buildDir + '/OPifexEngine.sln');
        }




        $scope.cmake = function(cb) {
            config.saveEngine($scope.path, $scope.config);
            cmake.engine($scope.path, $scope.config, $scope.os, cb);
        };


        $scope.make = function(cb) {
            make.engine($scope.path, $scope.config, function(err) {
                if(err) return;

                config.saveBuildConfig({ id: $scope.path }, $scope.config);
                cb && cb();
            });
        };

        $scope.run = function(cb) {
            $scope.make(function() {
                var sourceDir = global.root + '/repos/OPengine/' + $scope.path;
                var buildDir = global.root + '/build/' + $scope.path + '_build';

                var appPath = './Application/Application';

                var os = require('os');
                if(os.platform() == 'win32') {
                    appPath = 'Application\\Debug\\Application.exe';
                }

                run.cmd('run ' + $scope.path, appPath, [], buildDir, cb);
            });
        };


        $scope.atom = function() {
            var spawn = require('child_process').spawn;
            spawn('atom', [nodePath.resolve(projectRepoPath)], {
                env: process.env
            });
        }

        $scope.atomBuild = function() {
            var spawn = require('child_process').spawn;
            spawn('atom', [nodePath.resolve(buildDir)], {
                env: process.env
            });
        }

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

  }]);
