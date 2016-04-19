var engineApp = angular.module('engineApp');
var spawn = require('child_process').spawn;

engineApp.factory("run", [ 'console', '$rootScope', function(appConsole, $rootScope) {

    var run = {

        cmd: function(title, cmd, args, dir, cb) {

            appConsole.display = true;
            appConsole.lines = [];
            appConsole.task = title;

            var child = spawn(cmd, args, {
                cwd: dir,
                env: process.env
            });

            child.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
                appConsole.AddLine('' + data);
                $rootScope.$digest();
            });

            child.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
                appConsole.AddLine('' + data, true);
                $rootScope.$digest();
            });

            child.on('close', function (code) {
                console.log('child process exited with code ' + code);
                appConsole.AddLine('child process exited with code ' + code, 2);
                if(code == 0) {
                    appConsole.display = false;
                }
                cb && cb(code != 0);
                $rootScope.$digest();
            });

            child.on('error', function(code) {
                cb && cb(true)
            });
        },

        command: function(title, cmd, args, dir, cb) {

            if(require('os').type() == 'Windows_NT') {
                tmpArgs = ['/C', cmd ];
                for(var i = 0; i < args.length; i++){
                    tmpArgs.push(args[i]);
                }
                args = tmpArgs;
                cmd = 'cmd';
            }

            run.cmd(title, cmd, args, dir, cb);

        },

        silent: function(title, cmd, args, dir, cb) {

            var child = spawn(cmd, args, {
                cwd: dir,
                env: process.env
            });

            var results = [];
            child.stdout.on('data', function(data) {
                results.push(data);
            });
            child.stderr.on('data', function (data) {
                results.push(data);
            });
            child.on('close', function (code) {
                console.log('child process exited with code ' + code);
                cb && cb(code != 0, results);
                $rootScope.$digest();
            });

            child.on('error', function(code) {
                cb && cb(true)
            });
        }

    }

    return run;
}]);
