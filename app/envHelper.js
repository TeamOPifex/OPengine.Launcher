import os from 'os';
import env from './env';

var fs = require('fs');

function getConfig() {
    var root = require('os').homedir() + '/.opengine';
    var configFilePath = root + '/opifex.json';
    if (!fs.existsSync(configFilePath)) {
        return {
            engines: [],
            projects: [],
            paths: []
        };
    }
    var content = fs.readFileSync(configFilePath);
    return JSON.parse(content);
}

// This will add paths to the environment when we're not running it through
// the console. (AKA production release build)
var envHelper = function() {

	// TODO: Custom paths
	// In the case that the default paths don't align with the users,
	// we'll set up a process for adding custom paths to these.

	// Only if it's OSX
	if(os.type() == 'Darwin' && env.name !== 'development') {
	    // Applications don't inherit the PATH when run outside of the terminal
	    // So we default to these set locations on OSX
	    process.env.PATH += ":/usr/local/bin:/Applications:/Applications/CMake.app/Contents/bin"
		process.env.PATH += ":~/emsdk_portable/";
		process.env.EMSCRIPTEN = "/Users/garretthoofman/emsdk_portable/emscripten/1.35.0";
	}

	// Only if it's Windows
	if(os.type() == 'Windows_NT') {
	    // Make sure we can find MSBuild
	    // These are all of the default locations that it's installed to
	    // This should work for 99% of all users
	    process.env.Path += ';C:\\Program Files\\Git\\bin';
        process.env.Path += ';C:\\Program Files (x86)\\CMake\\bin';
        process.env.Path += ';C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Professional\\MSBuild\\15.0\\Bin';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\14.0\\Bin\\';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\14.0\\Bin\\amd64';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\12.0\\Bin\\';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\11.0\\Bin\\';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\10.0\\Bin\\';
	    process.env.Path += ';C:\\Windows\\Microsoft.NET\\Framework\\v4.5\\';
	    process.env.Path += ';C:\\Windows\\Microsoft.NET\\Framework\\v4.0\\';
    }

    var config = getConfig();
    console.log(__dirname, config);
    if (config.path) {
        config.path.map(p => process.env.Path += ';' + p);
    }

}

export default envHelper;