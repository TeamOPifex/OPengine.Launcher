function Download(files, cb, cbProgress) {
    console.log('Download', url, file);

    var fs = require('fs');
    var os = require('os');
    var request = require('request');
    var progress = require('request-progress');
    var mkdirp = require('mkdirp');

    var file = '';
    var url = '';

    var platform = null;
    switch(os.platform()) {
      case 'win32':{
        platform = files.windows;
        break;
      }
      case 'darwin': {
        platform = files.osx;
        break;
      }
      case 'linux': {
        platform = files.linux;
        break;
      }
    }

    if(platform == null) {
      console.log('WARNING: platform was not found');
      return;
    }

    if(!platform.x86_x64) {
      switch(os.arch()) {
        case 'x64': {
          file = platform.x64.file;
          url = platform.x64.url;
          break;
        }
        case 'ia32': {
          file = platform.x86.file;
          url = platform.x86.url;
          break;
        }
        default: {
          console.log('WARNING: architecture not supported');
          return;
        }
      }
    } else {
      file = platform.x86_x64.file;
      url = platform.x86_x64.url;
    }

    if(file == null || url == null) {
      console.log('WARNING: file/url was not found');
      return;
    }

    var root = require('os').homedir() + '/.opengine';
    var folder = root + '/temp/';

    mkdirp(folder, function(err) {
      if(err) {
        console.log('ERROR: failed to create temp directory');
        return;
      }
      var dest = folder + file;
      var stream = fs.createWriteStream(dest);
      var req = request(url);
      req.on('error', function (err) {
          fs.unlink(dest);

          if (cb) {
              return cb(true, err.message);
          }
      });
      req.pipe(stream);

      progress(req).on('progress', function (state) {
          console.log('progress', state);
          cbProgress(state);
      });

      stream.on('finish', function() {
          stream.close(function() {
              cb(false, {
                  file: file,
                  folder: folder
              });
          });  // close() is async, call cb after close completes.
      });

      stream.on('error', function(err) { // Handle errors
          fs.unlink(dest); // Delete the file async. (But we don't check the result)

          if (cb) {
              return cb(true, err.message);
          }
      });
    });

}

module.exports = Download;

export default Download;
