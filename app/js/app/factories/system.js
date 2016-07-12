angular.module('launcherFactories').factory("system", function() {
    return {
        isWindows: function() {
            return require('os').type() == 'Windows_NT';
        }
    };
});
