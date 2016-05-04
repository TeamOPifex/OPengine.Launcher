angular.module('engineApp').factory("projects",function(){

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

    //console.log(path.resolve(global.root + '/repos/projects'));
	folders = getDirectories(path.resolve(global.root + '/repos/projects'));
    for(var i = 0; i < folders.length; i++) {
        var name = folders[i];
        var proj = {
            name: name,
            id: folders[i],
            bg: 'content/imgs/project-bg.png'
        };

        var imgPath = path.resolve(global.root + '/repos/projects') + '/' + folders[i] + '/bg.png';
        if(fs.existsSync(imgPath)) {
          proj.bg = 'file://' + imgPath.split('\\').join('/');
        }

        imgPath = path.resolve(global.root + '/repos/projects') + '/' + folders[i] + '/bg.jpg';
        if(fs.existsSync(imgPath)) {
          proj.bg = 'file://' + imgPath.split('\\').join('/');
        }

        versions.push(proj);
    }

    return versions;
});
