var nodePath = require('path');
var fs = require('fs');
var os = require('os');
var ipc = require('ipc');
var shell = require('shell');

var engineControllers = angular.module('engineControllers');
engineControllers.controller('ProjectDetailCtrl', ['$scope', '$routeParams', 'system', 'VisualStudio', 'OS', 'Project', 'console', '$rootScope', 'engines', 'config', 'cmake', 'make', 'run', 'git',
    function($scope, $routeParams, system, VisualStudio, OS, Project, appConsole, $rootScope, engines, config, cmake, make, run, git) {

        $scope.engines = engines;
        if(engines.length > 0) {
            $scope.selectedEngine = $scope.engines[0];
        }
        $scope.windows = system.isWindows();
        $scope.visualStudios = VisualStudio;
        $scope.os = OS;

        $scope.project = new Project($routeParams.versionId);


        // Code Editor
        $scope.showCode = false;
        $scope.toggleCode = function() {
            $scope.showCode = !$scope.showCode;
        };
        $scope.toggleCode();
        $scope.pinned = [
            { label: 'HacknPlan', path: 'https://app.hacknplan.com/p/3640/m/4336' }
        ]

        // Open the current directory in Explorer
        $scope.openFolder = function() { $scope.Directories[$scope.CurrentDir].path.openFolder(); };
        $scope.openSLN = function() { $scope.project.openSolution(); };
        $scope.openWith = function(program) { $scope.project.repo.openWith(program); };


        $scope.rebuild = false;
        $scope.firstBind = false;
        $scope.$watch(function() { return $scope.project.config; }, function() {
            if($scope.firstBind) {
                $scope.rebuild = true;
            }
            $scope.firstBind = true;
        }, true);





        $scope.CurrentDir = 0;
        $scope.CurrentPath = $scope.project.build;
        $scope.Directories = [
            {
                symbol: 'B',
                path: $scope.project.build
            },
            {
                symbol: 'S',
                path: $scope.project.repo
            }
        ];

        $scope.ToggleDir = function() {
            //console.log('TOGGLED');
            $scope.CurrentDir++;
            $scope.CurrentDir = $scope.CurrentDir % ($scope.Directories.length);
            $scope.CurrentPath = $scope.Directories[$scope.CurrentDir];
        }

        // Terminal Emulation
        $scope.cmd = "";
        $scope.runCmd = function() {
            var args = $scope.cmd.split(' ');
            var cmd = args[0];
            args.shift(0);
            var runPath = $scope.CurrentPath.path.absolute;

            run.command('Launching ' + $scope.project.path, cmd, args, runPath, function() {
                $scope.cmd = "";
                appConsole.display = true;
            });
        }

        $scope.hideConsole = function() {
            appConsole.display = false;
        }

        // Manage running/building/generating the project
        $scope.cmake = function(cb, force) {
            $scope.project.cmake($scope.rebuild, force, $scope.os, function() {
                $scope.rebuild = false;
            });
        };

        $scope.make = function(cb, force) {
            $scope.project.make($scope.rebuild, force, $scope.os, function() {
                $scope.rebuild = false;
            });
        };

        $scope.run = function() {
            $scope.project.run($scope.rebuild, $scope.os, function() {
                $scope.rebuild = false;
            });
        };

        // Managing the Git Repository
        function RepoChanges(err, changes) {
            $scope.project.repo.git.changes = changes;
            $scope.$digest();
        }
        $scope.project.repo.git.getChanges(RepoChanges);

        function RepoBranches(err, localBranches, remoteBranches) {
            $scope.localBranches = localBranches;
            $scope.remoteBranches = remoteBranches;
            $scope.$digest();
        }
        $scope.project.repo.git.getBranches(RepoBranches);

        function RepoCheckout() {
            $scope.project.repo.git.getBranches(RepoBranches);
            $scope.project.repo.git.getChanges(RepoChanges);
        }
        $scope.checkout = function(branch) { $scope.project.repo.git.checkout(branch, RepoCheckout); };
        $scope.pull = function(branch) { $scope.project.repo.git.pull(branch, RepoCheckout); };



        // On KeyBind events coming from the underlining application
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
