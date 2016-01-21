// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
// import os from 'os'; // native node.js module
// import { remote } from 'electron'; // native electron module
// import jetpack from 'fs-jetpack'; // module loaded from npm
// import { greet } from './hello_world/hello_world'; // code authored by you in this project
// import env from './env';
//
// console.log('Loaded environment variables:', env);
//
// var app = remote.app;
// var appDir = jetpack.cwd(app.getAppPath());
//
// // Holy crap! This is browser window with HTML and stuff, but I can read
// // here files like it is node.js! Welcome to Electron world :)
// console.log('The author of this app is:', appDir.read('package.json', 'json').author);
//
// document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById('greet').innerHTML = greet();
//     document.getElementById('platform-info').innerHTML = os.platform();
//     document.getElementById('env-name').innerHTML = env.name;
// });

import path from 'path';
import Module from 'module';
Module.globalPaths.push( path.join(__dirname, '..', '..', '..', 'app.asar', 'node_modules') );

import { ipcRenderer } from 'electron';
import process from 'process';
import jetpack from 'fs-jetpack';

ipcRenderer.on('asynchronous-reply', function(arg) {

});

$('#close').click(function() {
	ipcRenderer.send('close');
});

$('#minimize').click(function() {
	ipcRenderer.send('minimize');
});

global.env = {
    name: ipcRenderer.sendSync('env-name')
};

if(global.env.name == 'development') {
    global.root = process.cwd() + '/build';
} else {
    global.root = __dirname + '/../../../build';
}
