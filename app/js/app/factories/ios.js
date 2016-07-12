var xcode = require('node-xcode-opifex'),
    fs = require('fs'),
	fsExtra = require('fs-extra'),
    xcodeProjectSource = 'SOURCE.xcodeproj',
    projectPath = 'OPengine.xcodeproj/project.pbxproj';

angular.module('launcherFactories').factory("ios", [ '$rootScope', function($rootScope) {

    var ios = {

		/// source: Root of the source project
		/// destination: Build folder of the project
		/// opts: can set the name of the xcode project
        generate: function(source, destination, engineBuild, engineSource, opts, cb) {
			opts = opts || {};
			opts.name = 'OPengine';
			opts.defines = opts.defines || [];
            opts.libraryPaths = opts.libraryPaths || [];
            opts.headerPaths = opts.headerPaths || [];
            opts.libraries = opts.libraries || [];

			var xcodeProjectSourceFolder =
				source + '/iOS/' + xcodeProjectSource;
			var xcodeProjectBuildFolder =
				destination + '/iOS/' + opts.name + '.xcodeproj';

			// Copy source to final destination
			fsExtra.copySync(
				source + '/iOS/OPengine',
				destination + '/iOS/OPengine');
			fsExtra.copySync(
				xcodeProjectSourceFolder,
				xcodeProjectBuildFolder);

			var myProj = xcode.project(xcodeProjectBuildFolder + '/project.pbxproj');

			// parsing is async, in a different process
			myProj.parse(function (err) {

				// If it already exists, nothing happens
				myProj.createPbxGroup('OPengine');

				//myProj.addSourceFileToGroup('foo.m', 'OPengine');

				// Add the engine library files
				myProj.addFrameworkFile('OPengine', 'libCore.a');
				myProj.addFrameworkFile('OPengine', 'libData.a');
				myProj.addFrameworkFile('OPengine', 'libMath.a');
				myProj.addFrameworkFile('OPengine', 'libPerformance.a');
				myProj.addFrameworkFile('OPengine', 'libHuman.a');
				myProj.addFrameworkFile('OPengine', 'libCommunication.a');
				myProj.addFrameworkFile('OPengine', 'libScripting.a');
				myProj.addFrameworkFile('OPengine', 'libPipeline.a');
				myProj.addFrameworkFile('OPengine', 'libLodePNG.a');
				myProj.addFrameworkFile('OPengine', 'libMongoose.a');

				// Add the application library
				// this will be the same regardless if it's from the engine
				// or if it's an application using the engine
				// Right now this is the only limitation to using this
				// eventually it should be possible to add more libraries
				// programmatically.
				for(var i = 0; i < opts.libraries.length; i++) {
					myProj.addFrameworkFile('OPengine', opts.libraries[i]);
				}

				// Clears the defines for all of the Configs in 'teamopifex.OPengine'
				myProj.clearConfigDefine('teamopifex.OPengine');
				// Clears the defines for only the Debug config
				myProj.clearConfigDefine('teamopifex.OPengine', 'Debug');

				myProj.addConfigDefine('teamopifex.OPengine', 'OPIFEX_IOS');
				myProj.addConfigDefine('teamopifex.OPengine', 'OPIFEX_OPENGL_ES_2');
				myProj.addConfigDefine('teamopifex.OPengine', '_DEBUG', 'Debug');
				myProj.addConfigDefine('teamopifex.OPengine', 'OPIFEX_RELEASE', 'Release');

				// Loop through all of the defines and add them
				console.log('Adding defines: ', opts.defines);
				for(var i = 0; i < opts.defines.length; i++) {
					myProj.addConfigDefine('teamopifex.OPengine', opts.defines[i]);
				}

				myProj.clearConfigLibraryPath('teamopifex.OPengine');

                for(var i = 0; i < opts.libraryPaths.length; i++) {
                    myProj.addConfigLibraryPath('teamopifex.OPengine', opts.libraryPaths[i].path, opts.libraryPaths[i].config);
                }

				myProj.addConfigLibraryPath('teamopifex.OPengine', engineBuild + '/Binaries/ios/debug', 'Debug');
				myProj.addConfigLibraryPath('teamopifex.OPengine', engineBuild + '/Binaries/ios/release', 'Release');


				myProj.clearConfigHeaderPath('teamopifex.OPengine');
				myProj.addConfigHeaderPath('teamopifex.OPengine', engineSource);
				for(var i = 0; i < opts.headerPaths.length; i++) {
                    myProj.addConfigHeaderPath('teamopifex.OPengine', opts.headerPaths[i].path, opts.headerPaths[i].config);
                }

			    fs.writeFileSync(xcodeProjectBuildFolder + '/project.pbxproj', myProj.writeSync());
			});
		}

    }

    return ios;
}]);
