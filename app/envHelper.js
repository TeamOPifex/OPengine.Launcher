import os from 'os';
import env from './env';

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
	}

	// Only if it's Windows
	if(os.type() == 'Windows_NT' && env.name !== 'development') {
	    // Make sure we can find MSBuild
	    // These are all of the default locations that it's installed to
	    // This should work for 99% of all users
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\14.0\\Bin\\';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\12.0\\Bin\\';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\11.0\\Bin\\';
	    process.env.Path += ';C:\\Program Files (x86)\\MSBuild\\10.0\\Bin\\';
	    process.env.Path += ';C:\\Windows\\Microsoft.NET\\Framework\\v4.5\\';
	    process.env.Path += ';C:\\Windows\\Microsoft.NET\\Framework\\v4.0\\';
	}
}

export default envHelper;
