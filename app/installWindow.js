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
import Download from './download-file.js';

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

        var Spawn = require('child_process').spawn;
        var file = 'cmake-3.5.2-Darwin-x86_64.dmg';
        var url = 'https://cmake.org/files/v3.5/cmake-3.5.2-Darwin-x86_64.dmg';

        Download(url, file, function(err, result) {
            if(err) {
                return;
            }
            var child = Spawn('open', [ result.file ], { cwd: result.folder });
        }, function(progress) {

        });
    });


	return mainWindow;
}

export default installWindow;
