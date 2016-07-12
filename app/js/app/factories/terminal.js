angular.module('launcherFactories').factory("Terminal", ['console', 'run', function(appConsole, run) {
    function Terminal(project, $scope) {
        this.project = project;
        this.$scope = $scope;
        this.cmd = '';

        this.CurrentDir = 0;
        this.Directories = [
            {
                symbol: 'B',
                path: this.project.build
            },
            {
                symbol: 'S',
                path: this.project.repo
            }
        ];
        this.CurrentPath = this.Directories[this.CurrentDir];

        var me = this;
        this.$scope.ToggleDir = this.changeDir;
        this.$scope.hideConsole = this.hideConsole;
        $scope.runCmd = function() {
            me.run(function() {
              me.$scope.$digest();
            })
        };
    }

    Terminal.prototype = {
        cmd: '',

        run: function(cb) {
            var me = this;

            var args = this.cmd.split(' ');
            var cmd = args[0];
            args.shift(0);
            var runPath = this.CurrentPath.path.absolute;

            run.command('Launching ' + this.project.path, cmd, args, runPath, function() {
                me.cmd = "";
                appConsole.display = true;
                cb && cb();
            });
        },

        changeDir: function() {
            this.CurrentDir++;
            this.CurrentDir = this.CurrentDir % (this.Directories.length);
            this.CurrentPath = this.Directories[this.CurrentDir];
        },

        hideConsole: function() {
            appConsole.display = false;
        }
    };

    return Terminal;
}]);
