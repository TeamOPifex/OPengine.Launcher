var filewatcher = require('filewatcher'),
  path = require('path'),
  fs = require('fs');

function Watcher(cb) {
  // this.watcher = filewatcher();
  // this.watcher.on('change', function(file, stat) {
  //   console.log('File modified: %s', file);
  //   if (!stat) console.log('deleted');
  //   cb && cb(file, stat);
  // });
  this.watchers = [];
  this.cb = cb;
  this.watched = {};
}

Watcher.prototype = {

  add: function(dir, recursive) {
    var self = this;
    var p = path.resolve(dir) + '/';
    if(p.indexOf('.git') > -1) return;
    //console.log('Watching', p);
    //this.watcher.add(p);
    var watcher = fs.watch(p, {encoding: 'buffer'}, function(eventType, filename) {
      //console.log(eventType, p, filename + ' ');
      var endPath = path.resolve(p + filename);
      var fileExists = fs.existsSync(endPath);
      var fileStat = fs.statSync(endPath);

      if(self.watched[endPath]) {
        self.watched[endPath].eventType = eventType;
        clearTimeout(self.watched[endPath].timer);
        self.watched[endPath].timer = setTimeout(function() {
          self.cb && self.cb(self.watched[endPath]);
          self.watched[endPath] = null;
        }, 500);
      } else {
        self.watched[endPath] = {
          eventType: eventType,
          filename: filename + '',
          exists: fileExists,
          dir: p,
          isDir: fileStat.isDirectory(),
          isFile: fileStat.isFile(),
          timer: setTimeout(function() {
            self.cb && self.cb(self.watched[endPath]);
            self.watched[endPath] = null;
          }, 500)
        };
      }
    });
    this.watchers.push(watcher);

    if(recursive) {
      var dirs = this._getDirectories(p);
      for(var i = 0; i < dirs.length; i++) {
        if(dirs[i].indexOf('.git') > -1) continue;

        this.add(p + dirs[i], recursive);
      }
    }
  },

  _getDirectories: function(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  }
};

module.exports = Watcher;
