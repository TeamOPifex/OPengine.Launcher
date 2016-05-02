import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';
import BrowserWindow from 'browser-window';
import GlobalShortcut from 'global-shortcut';
import Menu from 'menu';
import Dialog from 'dialog';
import { ipcMain } from 'electron';
import MenuBuilder from './menuBuilder.js';
import LoginWindow from './loginWindow.js';
import isInstalled from './is-installed.js';

function installWindow(app, token) {

	var registeredShortcuts = [];

	var mainWindow = new BrowserWindow({
		width: 400, height: 575,
		frame: false, title: 'OPengine'
	});


	// Creating developer menu for debugging purposes
    DevHelper.setDevMenu();

	// The application menu
    var menu = Menu.buildFromTemplate(MenuBuilder(mainWindow));
    Menu.setApplicationMenu(menu);

	// The default web file to load
	// This loads a local file first so that it can determine
	// if there's currently any internet. Otherwise we can go
	// in offline mode without negatively affecting the User
	// Experience
	if(token) {
	    mainWindow.loadUrl(global.webRoot + '/install.html?access_token=' + token);
	} else {
    	mainWindow.loadUrl(global.webRoot + '/install.html');
	}

    function installed(event, arg) {
        // console.log('Get results from Install Window');
      isInstalled(null, {}, function(err, results) {
        event.returnValue = results;
      });
    }
    // Helper functions from within the actual app
    ipcMain.on('installed', installed);


    ipcMain.on('install-cmake', function() {
        var request = require('request');
        var fs = require('fs');
        var progress = require('request-progress');

        //var root = process.cwd() + '/build';

        //'https://cmake.org/files/v3.5/cmake-3.5.2-Darwin-x86_64.dmg'
        var folder = '/Users/garretthoofman/.opengine/temp/';
        var file = 'cmake-3.5.2-Darwin-x86_64.dmg';
        var url = 'https://cmake.org/files/v3.5/cmake-3.5.2-Darwin-x86_64.dmg';

        var dest = folder + file;// 'cmake-3.5.2-Darwin-x86_64.dmg';
        var stream = fs.createWriteStream(dest);

        var req = request(url, function(error, response, body) {
            console.log('completed');
        });

        progress(req).on('progress', function (state) {
            console.log('progress', state);
        });

        // check for request errors
        req.on('error', function (err) {
            fs.unlink(dest);

            if (cb) {
                return cb(err.message);
            }
        });

        req.pipe(stream);

        stream.on('finish', function() {
            stream.close(function() {
                var child = require('child_process').spawn('open', [ file ], { cwd: folder });

            });  // close() is async, call cb after close completes.

        });

        stream.on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)

            if (cb) {
                return cb(err.message);
            }
        });

    });


	return mainWindow;
}

export default installWindow;
