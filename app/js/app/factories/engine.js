angular.module('launcherFactories').factory("Engine", [ 'config', 'run', 'git', 'console', 'cmake', 'make', function(config, run, git, appConsole, cmake, make) {
    var nodePath = require('path');
    var spawn = require('child_process').spawn;
    var open = require('open');
    var fs = require('fs');

    function Engine(path, OS, $scope) {
        this.path = path;
        this.$scope = $scope;
        this.OS = OS;
        this.name = path;
        this.setRepoPath();
        this.setBuildPath();
        this.config = config.getEngine(this.repo.relative);
        this.rebuild = false;


        var me = this;

        // If the config changes, then a rebuild (re-cmake) is necessary
        var firstWatch = false;
        this.$scope.$watch(function() { return me.config; }, function() {
            if(firstWatch) {
                me.rebuild = true;
            }
            firstWatch = true;
        }, true);

        // Manage running/building/generating the project
        this.$scope.cmake = function(force) {
            me.cmake(force, function() {
                me.$scope.$digest();
            });
        };

        this.$scope.make = function(force) {
            me.make(force, function() {
                me.$scope.$digest();
            });
        };

        this.$scope.run = function(force) {
            me.run(force, function() {
                me.$scope.$digest();
            });
        };
    }

    Engine.prototype = {

        setRepoPath: function() {
            // Default to the OPengine Launcher root/repos/projects
            var me = this;
            this.repo = {
                relative: global.root + '/repos/OPengine/' + this.path,
                openFolder: function() {
                    run.command('Open Folder', 'explorer', [ me.repo.absolute + '\\' ], 'C:\\', null, true);
                },
                openWith: function(program) {
                    spawn(program, [ me.repo.absolute ], {
                        env: process.env
                    });
                },
                openWithAtom: function() {
                  spawn(process.env['LOCALAPPDATA'] + '\\atom\\bin\\atom.cmd', [ me.repo.absolute ]);
                },
                openWithSublime: function() {
                  spawn('C:\\Program Files\\Sublime Text 3\\sublime_text.exe', [ me.repo.absolute ]);
                }
            };

            this.repo.absolute = nodePath.resolve(this.repo.relative);

            this.repo.git = new git.Manager(this.repo.absolute, this.$scope);
        },

        setBuildPath: function() {
            var me = this;
            this.build = {
                relative: global.root + '/build/' + this.path + '_build',
                openFolder: function() {
                    run.command('Open Folder', 'explorer', [ me.build.absolute + '\\' ], 'C:\\', null, true);
                },
                openWith: function(program) {
                    spawn(program, [ me.build.absolute ], {
                        env: process.env
                    });
                }
            };
            this.build.absolute = nodePath.resolve(this.build.relative);
        },

        solutionExists: function() {
          return fs.existsSync(this.build.relative + '/OPifexEngine.sln');
        },

        openSolution: function() {
            shell.openItem(this.build.relative + '/OPifexEngine.sln');
        },

        cmake: function(force, cb, external) {
            appConsole.task = 'CMake OPengine';
            config.saveEngine(this.path, this.config, external);
            cmake.engine(this.path, this.config, this.OS, force, cb);
        },

        make: function(force, cb) {
            var me = this;
            make.engine(this.path, this.config, function(err) {
                if(err) {
                  cb && cb(err);
                  return;
                }

                config.saveBuildConfig({ id: me.path }, me.config);
                cb && cb();
            });
        },

        run: function(force, cb) {
            var me = this;
            me.make(force, function() {
                var appPath = './Application/Application';
                if(require('os').platform() == 'win32') {
                    appPath = 'Application\\Debug\\Application.exe';
                }
                run.cmd('run ' + me.path, appPath, [], me.build.absolute, cb);
            });
        }

    };

    return Engine;
}]);
