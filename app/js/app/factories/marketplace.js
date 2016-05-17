angular.module('engineApp').factory("marketplace",function(){

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

	  var addons = [];

    addons.refresh = function() {
      this.length = 0;

      folders = getDirectories(path.resolve(global.root + '/marketplace'));
      for(var i = 0; i < folders.length; i++) {
          var name = folders[i];
          var sep = name.split('.');
          var addonName = sep[0];
          sep.shift(0);
          var version = sep.join('.');
          this.push({
              name: addonName,
              id: folders[i],
              version: version
          });
      }
    }

    addons.refresh();

    //console.log(path.resolve(global.root + '/repos/projects'));


    return addons;
});
