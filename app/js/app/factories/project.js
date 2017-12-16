angular.module('launcherFactories').factory("Project", [ 'config', 'run', 'git', 'console', 'cmake', 'make', 'engines', function(config, run, git, appConsole, cmake, make, engines) {
    var nodePath = require('path');
    var spawn = require('child_process').spawn;
    var open = require('open');
    var fs = require('fs');

    function Project(path, OS, $scope) {
        this.path = path;
        this.$scope = $scope;
        this.OS = OS;
        this.name = path;
        this.setRepoPath();
        this.setBuildPath();
        this.config = config.getProject(this.repo.relative);
        this.rebuild = false;

        if(this.config.engine == null || this.config.engine.version == null) {
            this.config.engine = engines[0];
        }

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

    Project.prototype = {
        setRepoPath: function() {
            // Default to the OPengine Launcher root/repos/projects
            var me = this;
            this.repo = {
                relative: global.root + '/repos/projects/' + this.path,
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

            // Check if the project is external of the OPengine Launcher folder
            var launcherConfig = config.getLauncher();
            for(var i = 0; i < launcherConfig.projects.length; i++) {
                // Look for an external project
                if(launcherConfig.projects[i].id == this.path) {
                    this.repo.relative = launcherConfig.projects[i].path;
                }
            }

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
          console.log('can', this.OS);
          if(this.config.solution.indexOf('.sln') > -1) {
              return fs.existsSync(this.build.relative + '/' + this.config.solution);
          } else {
              return fs.existsSync(this.build.relative + '/' + this.config.solution + '.sln');
          }
        },

        openSolution: function() {
            // If it's set to Android, open with Android Studio
            if(this.OS.value.id == "OPIFEX_ANDROID") {
                var path = this.build.relative + '/Android';
                var args = [ path ];
                var cmd = '';

                // if this system is Windows
                switch(require('os').type()) {
                    case 'Darwin': {
                        args = [ '-a', '/Applications/Android Studio.app', path];
                        cmd = 'open';
                        break;
                    }
                    case 'Windows_NT': {
                        cmd = 'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe';
                        break;
                    }
                    case 'Unix': {
                        cmd = '';
                        break;
                    }
                    default:
                        cmd = '';
                }

                run.cmd('open ' + path, cmd, args, this.build.relative, function() { });
                return;
            }
            // Check if there's already a .sln extension
            if(this.config.solution.indexOf('.sln') > -1) {
                shell.openItem(this.build.relative + '/' + this.config.solution);
            } else {
                shell.openItem(this.build.relative + '/' + this.config.solution + '.sln');
            }
        },

        cmake: function(force, cb) {
            var me = this;

            appConsole.task = "cmake project " + this.name;
            config.saveProject(this.repo.relative, this.config);
            var lastBuildConfig = config.getBuildConfig(this.config.engine);

            // Check to see if the OPengine needs rebuilding
            //   Likely due to options that have been turned on/off
            if(this.rebuild || force || !config.isEqual(lastBuildConfig, this.config)) {

                // CMake OPengine
                config.saveEngine(this.config.engine.id, this.config, true);
                cmake.engine(this.config.engine.id, this.config, this.OS, force, function(err) {
                    if(err) {
                      cb && cb(true);
                      return;
                    }

                    // Build OPengine
                    make.engine(me.config.engine.id, me.config, function(err) {
                        if(err) {
                          cb && cb(true);
                          return;
                        }

                        // Save config as the latest build config
                        config.saveBuildConfig(me.config.engine, me.config);

                        // Finally, CMake the project
                        cmake.project(me.repo.relative, me.path, me.config.engine, me.config, me.OS, function(err) {
                            cb && cb(err);
                        });
                    });
                });

            } else {
                // CMake the project
                cmake.project(this.repo.relative, this.path, this.config.engine, this.config, this.OS, false, function(err) {
                    me.rebuild = false;
                    cb && cb(err);
                });
            }
        },

        make: function(force, cb) {
            var me = this;

            var lastBuildConfig = config.getBuildConfig(this.config.engine);
            if(this.rebuild || force || !config.isEqual(lastBuildConfig, this.config)) {
                this.cmake(force, function(err) {
                    if(err) {
                      cb && cb(true);
                      return;
                    }
                    make.project(me.path, me.config, cb);
                });
            } else {
              make.project(me.path, me.config, cb);
            }
        },

        run: function(force, cb) {
            var me = this;
            me.make(force, function() {

                var launchCmd = './YOURAPPNAME';
                switch(require('os').type()) {
                    case 'Darwin': {
                        launchCmd = me.config.launchOSX || launchCmd;
                        break;
                    }
                    case 'Windows_NT': {
                        launchCmd = me.config.launchWindows || launchCmd;
                        break;
                    }
                    case 'Unix': {
                        launchCmd = me.config.launchLinux || launchCmd;
                        break;
                    }
                    default:
                        launchCmd = './YOURAPPNAME';
                }

                me.config.launch = launchCmd;

                var cmds = me.config.launch.replace('\r', '').split('\n');

                function RUN(cmd, runCallback) {
                    if(me.OS.value.id == 'OPIFEX_IOS') {
                        open(me.build.relative + '/iOS/OPengine.xcodeproj');
                    } else {
                        run.cmd('run ' + me.path, cmd, [], me.build.relative, runCallback);
                    }
                }

                var promise = null;
                for(var i = 0; i < cmds.length; i++) {
                    if(promise) {
                        var proc = new $.Deferred();
                        promise.then(function() {
                            appConsole.task = 'run ' + cmds[i];
                            RUN(cmds[i], function(err) {
                              console.log(err);
                                if(err) {
                                  cb && cb(true);
                                  return;
                                }
                                proc.resolve();
                            });
                        });
                        promise = proc.promise();
                    } else {
                        var proc = new $.Deferred();
                        appConsole.task = 'run ' + cmds[i];
                        RUN(cmds[i], function(err) {
                          console.log(err);
                            if(err) {
                              cb && cb(true);
                              return;
                            }
                            proc.resolve();
                        });
                        promise = proc.promise();
                    }
                }
            });
        }

    };

    return Project;
}]);
