var nodePath = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

angular.module('engineApp').factory("cmake",['console', '$rootScope', 'config', 'run', function(appConsole, $rootScope, configuration, run){

    var cmake = {
        addVariables: function(args, config, os) {

            for(var i = 0; i < config.options.length; i++) {
                if(config.options[i].value) {
                    args.push('-D' + config.options[i].id + '=ON');
                } else {
                    args.push('-D' + config.options[i].id + '=OFF');
                }
            }

            for(var i = 0; i < config.optionSelectors.length; i++) {
                args.push('-D' + config.optionSelectors[i].id + '=' + config.optionSelectors[i].value.id);
            }

            args.push('-DOPIFEX_OS=' + os.value.id);

            for(var i = 0; i < config.targets.length; i++) {
                if(config.targets[i].value) {
                    args.push('-D' + config.targets[i].id + '=ON');
                } else {
                    args.push('-D' + config.targets[i].id + '=OFF');
                }
            }

            for(var i = 0; i < config.targetSelectors.length; i++) {
                args.push('-D' + config.targetSelectors[i].id + '=' + config.targetSelectors[i].value.id);
            }

            if(config.tools) {
              for(var i = 0; i < config.tools.length; i++) {
                  if(config.tools[i].value) {
                      args.push('-D' + config.tools[i].id + '=ON');
                  } else {
                      args.push('-D' + config.tools[i].id + '=OFF');
                  }
              }
            }

            if(window.localStorage['physx'] && window.localStorage['physx'] != '') {
                args.push('-DPHYSX_PATH=' + window.localStorage['physx']);
            }

            if(window.localStorage['v8'] && window.localStorage['v8'] != '') {
                args.push('-DV8_PATH=' + window.localStorage['v8']);
            }

            if(window.localStorage['fmod'] && window.localStorage['fmod'] != '') {
                args.push('-DFMOD_PATH=' + window.localStorage['fmod']);
            }

            if(window.localStorage['assimp'] && window.localStorage['assimp'] != '') {
                args.push('-DASSIMP_PATH=' + window.localStorage['assimp']);
            }


            args.push('-DGLFW_BUILD_DOCS=OFF');
            args.push('-DGLFW_BUILD_EXAMPLES=OFF');
            args.push('-DGLFW_BUILD_TESTS=OFF');

            //console.log(config.visualStudio);

            // Set Generator
            //var osSelected = configuration.getValue(config, 'OPIFEX_OS');

            switch(os.value.id) {
                case 'OPIFEX_WIN32': {
                    args.push('-G');
                    args.push(config.visualStudio.name);
                    break;
                }
                case 'OPIFEX_WIN64': {
                    args.push('-G');
                    args.push(config.visualStudio.name + " Win64");
                    break;
                }
                case 'OPIFEX_IOS': {
                    args.push('-DCMAKE_TOOLCHAIN_FILE=./CMake/engine/toolchains/iOS.cmake');
                    args.push('-DIOS_PLATFORM=SIMULATOR');
                    args.push('-G');
                    args.push('Xcode');
                    args.push('-DOPENGL_DESKTOP_TARGET=OPENGL_ES_2');
                    break;
                }
            }
        },

        project: function(source, path, engine, config, os, cb) {
	        var sourceDir = source;
	        var buildDir = global.root + '/build/' + path + '_build';
            var engineDir = global.root + '/repos/OPengine/' + engine.id;
            var binariesDir = global.root + '/build/' + engine.id + '_build/Binaries';

            console.log(sourceDir, buildDir, engineDir, binariesDir, global.root);

            var args = [ sourceDir ];

            args.push('-DOPIFEX_ENGINE_REPOSITORY=' + engineDir); //'../../OPengine/' + engine.id);
            args.push('-DOPIFEX_BINARIES=' + binariesDir); //'../../../build/' + engine.id + '_build/Binaries');

            cmake.addVariables(args, config, os);

            rimraf(buildDir + '/CMakeCache.txt', function() {

                rimraf(buildDir + '/CMakeFiles', function() {
    		        mkdirp(buildDir, function(err) {
                        run.cmd('cmake ' + path, 'cmake', args, buildDir, cb);
    		        });
                });
            });
		},

		engine: function(path, config, os, cb) {
			var sourceDir = nodePath.resolve(global.root + '/repos/OPengine/' + path);
			var buildDir = nodePath.resolve(global.root + '/build/' + path + '_build');

            var args = [ sourceDir ];

            cmake.addVariables(args, config, os);

            rimraf(buildDir + '/CMakeCache.txt', function() {
                rimraf(buildDir + '/CMakeFiles', function() {
        			mkdirp(buildDir, function(err) {
                        run.cmd('cmake ' + path, 'cmake', args, buildDir, cb);
        			});
                });
            });
		}

    }

    return cmake;
}]);