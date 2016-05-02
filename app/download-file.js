function Download(url, file, cb, cbProgress) {
    console.log('Download', url, file);

    var fs = require('fs');
    var request = require('request');
    var progress = require('request-progress');

    var root = require('os').homedir() + '/.opengine';
    var folder = root + '/temp/';
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

}

module.exports = Download;

export default Download;
