var fs = require('fs');
var os = require('os');


function prg_make(cb) {
    var child = require('child_process').spawn('make', ['--version'], { env: process.env });
    var output = '';
        var error = false;
    child.stdout.on('data', function(data) { output += data + ''; });
    child.on('error', function(err) {
      error = true;
    });
    child.on('close', function(result) {
      if(error) {
        cb && cb(false, {
          installed: false
        });
        return;
      }
      var strToFind = 'GNU Make ';
      var index = output.indexOf(strToFind);
      var version = '';
      if(index > -1) {
        var startPosition = index + strToFind.length;
        var length = output.indexOf('\n') - startPosition;
        version = output.substr(startPosition, length);
      }
      //console.log('Make: ', output);
      console.log('Make Version:', version);
      cb && cb(false, {
        installed: true,
        version: version
      });
    });
}

function prg_cmake(cb) {
    var child = require('child_process').spawn('cmake', ['--version'], { env: process.env });
    var output = '';
        var error = false;
    child.stdout.on('data', function(data) { output += data + ''; });
    child.on('error', function(err) {
      error = true;
    });
    child.on('close', function(result) {
      if(error) {
        cb && cb(false, {
          installed: false
        });
        return;
      }
      var strToFind = 'cmake version ';
      var index = output.indexOf(strToFind);
      var version = '';
      if(index > -1) {
        var startPosition = index + strToFind.length;
        var length = output.indexOf('\n') - startPosition;
        version = output.substr(startPosition, length);
      }
      //console.log('CMake: ', output);
      console.log('CMake Version:', version);
      cb && cb(false, {
        installed: true,
        version: version
      });
    });
}

function prg_git(cb) {
    var child = require('child_process').spawn('git', ['--version'], { env: process.env });
    var output = '';
        var error = false;
    child.stdout.on('data', function(data) { output += data + ''; });
    child.on('error', function(err) {
      error = true;
    });
    child.on('close', function(result) {
      if(error) {
        cb && cb(false, {
          installed: false
        });
        return;
      }
      var strToFind = 'git version ';
      var index = output.indexOf(strToFind);
      var version = '';
      if(index > -1) {
        var startPosition = index + strToFind.length;
        var length = output.indexOf(' ', startPosition) - startPosition;
        if(require('os').platform() == 'win32') {
          length = output.indexOf('\n', startPosition) - startPosition;
        }
        version = output.substr(startPosition, length);
      }
      //console.log('Git: ', output);
      console.log('Git Version:', version);
      cb && cb(false, {
        installed: true,
        version: version
      });
    });
}

function prg_msvs(cb) {
    var child = require('child_process').spawn('msbuild.exe', ['/version'], { env: process.env });
    var output = '';

    var error = false;
    child.stdout.on('data', function(data) { output += data + ''; });
    child.on('error', function(err) {
      error = true;
    });
    child.on('close', function(result) {
      if(error) {
        cb && cb(false, {
          installed: false
        });
        return;
      }
      var strToFind = 'Microsoft (R) Build Engine version ';
      var index = output.indexOf(strToFind);
      var version = '';
      if(index > -1) {
        var startPosition = index + strToFind.length;
        var length = output.indexOf('\n') - startPosition;
        version = output.substr(startPosition, length);
      }
      //console.log('Make: ', output);
      console.log('MSBuild Version:', version);
      cb && cb(false, {
        installed: true,
        version: version
      });
    });
}

function IsInstalled (program, options, cb) {
    switch(program) {
        case 'cmake': {
            prg_cmake(cb);
            return;
        }
        case 'git': {
            prg_git(cb);
            return;
        }
        case 'make': {
            prg_make(cb);
            return;
        }
        case 'msvc': {
            prg_msvs(cb);
            return;
        }
        default: break;
    }

    console.log(process.env, process.env.Path);
    var path = process.env.Path || process.env.PATH;
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
              desc: 'Distributed version control: <a href="https://git-scm.com">https://git-scm.com</a>'
            }
        ];


        if(require('os').type() == 'Windows_NT') {
            programs.push({
              exe: 'msvc',
              name: 'MS Visual Studio',
              desc: 'Microsoft Visual Studio: <a href="https://www.visualstudio.com/products/free-developer-offers-vs">http://visualstudio.com</a>'
            });
        } else {
            programs.push({
              exe: 'make',
              name: 'Make',
              desc: 'Controls the generation of executables: <a href="https://www.gnu.org/software/make/">http://gnu.org</a>'
            });
        }
    }

    var Async = require('async');
    Async.eachSeries(programs, function iteratee(item, callback) {
        IsInstalled(item.exe, options, function(err, result) {
            results.push({
                program: item,
                installed: result.installed,
                version: result.version
            });
            callback();
        });
    }, function done() {
        console.log('Have the results');

        cb && cb(false, results);
    });
}

module.exports = Installed;

export default Installed;
