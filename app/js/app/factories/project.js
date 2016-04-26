angular.module('engineApp').factory("Project", [ 'config', 'run', 'git', 'console', 'cmake', 'make', function(config, run, git, appConsole, cmake, make) {
    var nodePath = require('path');
    var spawn = require('child_process').spawn;
    var open = require('open');

    function Project(path, OS, $scope) {
        this.path = path;
        this.$scope = $scope;
        this.OS = OS;
        this.name = path;
        this.setRepoPath();
        this.setBuildPath();
        this.config = config.getProject(this.repo.relative);
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
            me.cmake(me.rebuild, force, me.OS, function() {
                me.rebuild = false;
                me.$scope.$digest();
            });
        };

        this.$scope.make = function(force) {
            me.make(me.rebuild, force, me.OS, function() {
                me.rebuild = false;
                me.$scope.$digest();
            });
        };

        this.$scope.run = function(force) {
            me.run(me.rebuild, force, me.OS, function() {
                me.rebuild = false;
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
                    run.command('Open Folder', 'explorer', [ me.repo.absolute + '\\' ], 'C:\\');
                },
                openWith: function(program) {
                    spawn(program, [ me.repo.absolute ], {
                        env: process.env
                    });
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
                    run.command('Open Folder', 'explorer', [ me.build.absolute + '\\' ], 'C:\\');
                },
                openWith: function(program) {
                    spawn(program, [ me.build.absolute ], {
                        env: process.env
                    });
                }
            };
            this.build.absolute = nodePath.resolve(this.build.relative);
        },

        openSolution: function() {
            // Check if there's already a .sln extension
            if(this.config.solution.indexOf('.sln') > -1) {
                shell.openItem(this.build.relative + '/' + this.config.solution);
            } else {
                shell.openItem(this.build.relative + '/' + this.config.solution + '.sln');
            }
        },

        cmake: function(rebuild, force, OS, cb) {
            var me = this;

            appConsole.task = "cmake project " + this.name;
            config.saveProject(this.repo.relative, this.config);
            var lastBuildConfig = config.getBuildConfig(this.config.engine);

            // Check to see if the OPengine needs rebuilding
            //   Likely due to options that have been turned on/off
            if(rebuild || force || !config.isEqual(lastBuildConfig, this.config)) {

                // CMake OPengine
                cmake.engine(this.config.engine.id, this.config, OS, function(err) {
                    if(err) return;

                    // Build OPengine
                    make.engine(me.config.engine.id, me.config, function(err) {
                        if(err) return;

                        // Save config as the latest build config
                        config.saveBuildConfig(me.config.engine, me.config);

                        // Finally, CMake the project
                        cmake.project(me.repo.relative, me.path, me.config.engine, me.config, OS, function() {
                            cb && cb();
                        });
                    });
                });

            } else {
                // CMake the project
                cmake.project(this.repo.relative, this.path, this.config.engine, this.config, OS, function() {
                    cb && cb();
                });
            }
        },

        make: function(rebuild, force, OS, cb) {
            var me = this;

            var lastBuildConfig = config.getBuildConfig(this.config.engine);
            if(rebuild || force || !config.isEqual(lastBuildConfig, this.config)) {
                this.cmake(rebuild, force, OS, function() {
                    make.project(me.path, me.config, cb);
                });
            } else {
              make.project(me.path, me.config, cb);
            }
        },

        run: function(rebuild, force, OS, cb) {
            var me = this;
            me.make(rebuild, force, OS, function() {

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

                function RUN(cmd, cb) {
                    if(OS.value.id == 'OPIFEX_IOS') {
                        open(me.build.relative + '/iOS/OPengine.xcodeproj');
                    } else {
                        run.cmd('run ' + me.path, cmd, [], me.build.relative, cb);
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
            });
        }

    };

    return Project;
}]);