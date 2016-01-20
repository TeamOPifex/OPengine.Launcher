var engineApp = angular.module('engineApp');
engineApp.factory("engines", [ 'config', function(config){

    var root = require('os').homedir() + '/.opengine';
    window.localStorage.setItem('oproot', root);
    global.root = root;

    var fs = require('fs'),
        path = require('path');

    function getDirectories(srcpath) {
        try {
          return fs.readdirSync(srcpath).filter(function(file) {
            return fs.statSync(path.join(srcpath, file)).isDirectory();
          });
      } catch(ex) {
          return []
      }
    }

	var versions = [];

    //console.log(path.resolve(global.root + '/repos/OPengine'));
    var folders = getDirectories(path.resolve(global.root + '/repos/OPengine'));
    for(var i = 0; i < folders.length; i++) {
        var engineConfig = config.getEngine(folders[i]);
        versions.push({
            name: 'OPengine',
            version: engineConfig.engine.version,
            id: folders[i]
        });
    }

    return versions;
}]);
