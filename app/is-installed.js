var fs = require('fs');
var os = require('os');


function cmake(cb) {
    var child = require('child_process').spawn('cmake', ['--version'], { env: process.env });
    var output = '';
    child.stdout.on('data', function(data) { output += data + ''; console.log(data + ''); });
    child.on('close', function(result) {
      var strToFind = 'cmake version ';
      var index = output.indexOf(strToFind);
      var version = '';
      if(index > -1) {
        var startPosition = index + strToFind.length;
        var length = output.indexOf('\n') - startPosition;
        version = output.substr(startPosition, length);
      }
      cb && cb(false, {
        installed: true,
        version: version
      });
    });
}

function IsInstalled (program, options, cb) {
    if(program == 'cmake') {
        cmake(cb);
        return;
    }

    path = process.env.Path;
    if(options && options.Path) {
        path = options.Path;
    }

    var paths = path.split(';');

    var extension = '';
    if(os.type() == 'Windows_NT') {
        extension = '.exe';
    }

    for(var i = 0; i < paths.length; i++) {
        if(fs.existsSync(paths[i] + '/' + program + extension)) {
            cb && cb(false, {
                installed: true
            });
            return;
        }
    }

    console.log('Is "' + program + '" installed : ');
    cb && cb(false, {
        installed: false
    });
}

function Installed(programs, options, cb) {
    var results = [];

    if(!programs) {
      programs = [
        {
          exe: 'cmake',
          name: 'CMake',
          desc: 'Generates project files: <a href="http://cmake.org">http://cmake.org</a>'
        },
        {
          exe: 'git',
          name: 'Git',
          desc: 'Generates project files: <a href="http://cmake.org">http://cmake.org</a>'
        },
        {
          exe: 'msvc',
          name: 'MS Visual Studio',
          desc: 'Generates project files: <a href="http://cmake.org">http://cmake.org</a>'
        }
      ]
    }

    var Async = require('async');
    Async.each(programs, function iteratee(item, callback) {
        IsInstalled(item.exe, options, function(err, result) {
            results.push({
                program: item,
                installed: result.installed,
                version: result.version
            });
            callback();
        });
    }, function done() {
        cb && cb(false, results);
    });
}

module.exports = Installed;
