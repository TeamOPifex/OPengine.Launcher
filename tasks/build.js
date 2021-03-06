'use strict';

var pathUtil = require('path');
var Q = require('q');
var gulp = require('gulp');
var rollup = require('rollup');
var less = require('gulp-less');
var jetpack = require('fs-jetpack');
var compressor = require('node-minify');
var fs = require('fs');
var uglify = require("uglify-js");
var concat = require('concat-files');
var walk    = require('walk');

var utils = require('./utils');
var generateSpecsImportFile = require('./generate_specs_import');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

var paths = {
    copyFromAppDir: [
        './bower_components/**',
        './node_modules/**',
        './stylesheets/**',
        './fonts/**',
        './vendor/**',
        './js/**',
        './**/*.html',
        './**/*.+(jpg|png|svg|gif)'
    ],
    copyWatchFromAppDir: [
        './stylesheets/**',
        './fonts/**',
        './js/**',
        './*.html',
        './js/**/*.html',
        './content/**/*.+(jpg|png|svg|gif)'
    ],
}

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function (callback) {
    return destDir.dirAsync('.', { empty: true });
});


var copyTask = function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true,
        matching: paths.copyFromAppDir
    });
};
var copyWatchTask = function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true,
        matching: paths.copyWatchFromAppDir
    });
};
gulp.task('copy', ['clean'], copyTask);
gulp.task('copy-watch', copyWatchTask);

var appBundle = function (src, destName) {
    var deferred = Q.defer();

    var files   = [];

    // Walker options
    var walker  = walk.walk(srcDir.path(src), { followLinks: false });

    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        if(stat.name.indexOf('.js') > -1)
          files.push(root + '/' + stat.name);
        next();
    });

    walker.on('end', function() {
        console.log(files);

        concat(files, destName + '.js', function() {
          console.log('done');
          var uglified = uglify.minify([destName + '.js']);
          fs.writeFile(destName + '.min.js', uglified.code, function (err){
            if(err) {
              console.log(err);
            } else {
              console.log("Script generated and saved:", 'concat.min.js');
            }
            deferred.resolve();
          });
        });
    });

    return deferred.promise;
};

var bundle = function (src, dest) {
    var deferred = Q.defer();

    rollup.rollup({
        entry: src,
    }).then(function (bundle) {
        var jsFile = pathUtil.basename(dest);
        var result = bundle.generate({
            format: 'cjs',
            sourceMap: true,
            sourceMapFile: jsFile,
        });
        // Wrap code in self invoking function so the variables don't
        // pollute the global namespace.
        var isolatedCode = '(function () {' + result.code + '\n}());';
        return Q.all([
            destDir.writeAsync(dest, isolatedCode + '\n//# sourceMappingURL=' + jsFile + '.map'),
            destDir.writeAsync(dest + '.map', result.map.toString()),
        ]);
    }).then(function () {
        deferred.resolve();
    }).catch(function (err) {
        console.error('Build: Error during rollup', err.stack);
    });

    return deferred.promise;
};

var bundleApplication = function () {
    return Q.all([
        bundle(srcDir.path('background.js'), destDir.path('background.js')),
        bundle(srcDir.path('launcherWindow.js'), destDir.path('launcherWindow.js')),
        bundle(srcDir.path('loginWindow.js'), destDir.path('loginWindow.js')),
        bundle(srcDir.path('app.js'), destDir.path('app.js')),
        appBundle('js/app/', destDir.path('appBundle')),
        appBundle('js/projectHelper/', destDir.path('projectHelperBundle')),
        appBundle('js/convertHelper/', destDir.path('convertHelperBundle'))
    ]);
};

var bundleSpecs = function () {
    generateSpecsImportFile().then(function (specEntryPointPath) {
        return Q.all([
            bundle(srcDir.path('background.js'), destDir.path('background.js')),
            bundle(specEntryPointPath, destDir.path('spec.js')),
        ]);
    });
};

var bundleTask = function () {
    if (utils.getEnvName() === 'test') {
        return bundleSpecs();
    }
    return bundleApplication();
};
gulp.task('bundle', ['clean'], bundleTask);
gulp.task('bundle-watch', bundleTask);


var lessTask = function () {
  return Q.all([
    gulp.src('app/stylesheets/main.less')
    .pipe(less())
    .pipe(gulp.dest(destDir.path('stylesheets'))),
    gulp.src('app/stylesheets/projectHelper.less')
    .pipe(less())
    .pipe(gulp.dest(destDir.path('stylesheets')))
  ]);
};
gulp.task('less', ['clean'], lessTask);
gulp.task('less-watch', lessTask);


gulp.task('finalize', ['clean'], function () {
    var manifest = srcDir.read('package.json', 'json');

    // Add "dev" or "test" suffix to name, so Electron will write all data
    // like cookies and localStorage in separate places for each environment.
    switch (utils.getEnvName()) {
        case 'development':
            manifest.name += '-dev';
            manifest.productName += ' Dev';
            break;
        case 'test':
            manifest.name += '-test';
            manifest.productName += ' Test';
            break;
    }

    // Copy environment variables to package.json file for easy use
    // in the running application. This is not official way of doing
    // things, but also isn't prohibited ;)
    manifest.env = projectDir.read('config/env_' + utils.getEnvName() + '.json', 'json');

    destDir.write('package.json', manifest);
});


gulp.task('watch', function () {
    gulp.watch('app/js/**/*.js', ['bundle-watch']);
    gulp.watch(paths.copyWatchFromAppDir, { cwd: 'app' }, ['copy-watch']);
    gulp.watch('app/**/*.less', ['less-watch']);
});


gulp.task('build', ['bundle', 'less', 'copy', 'finalize']);
