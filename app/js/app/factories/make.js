angular.module('launcherFactories').factory("make",['console', 'run', '$rootScope', 'config', function(appConsole, run, $rootScope, configuration){

    var spawn = require('child_process').spawn;

    var obj = {
		project: function(path, config, cb) {

            var sourceDir = global.root + '/repos/projects/' + path;
            var buildDir = global.root + '/build/' + path + '_build';

            var cmd = 'make';
            var args = [];

            if(require('os').type() == 'Windows_NT') {
                cmd = 'MSBuild.exe';
                if(config.solution) {
                    args.push(buildDir + '/' + config.solution + '.sln');
                } else {
                    args.push(path + '.sln');
                }

                var release = configuration.getValue(config, 'OPIFEX_OPTION_RELEASE');
                if(release) {
                    args.push('/property:Configuration=Release');
                }
            }

            run.command('make ' + path, cmd, args, buildDir, cb);

		},

		engine: function(path, config, cb) {

            var sourceDir = global.root + '/repos/OPengine/' + path;
            var buildDir = global.root + '/build/' + path + '_build';

            var cmd = 'make';
            var args = [];

            if(require('os').type() == 'Windows_NT') {
                cmd = 'MSBuild.exe'
                args.push('OPifexEngine.sln');

                var release = configuration.getValue(config, 'OPIFEX_OPTION_RELEASE');
                if(release) {
                    args.push('/property:Configuration=Release');
                }
            }

            run.command('make ' + path, cmd, args, buildDir, cb);

		}
    }
    return obj;
}]);
