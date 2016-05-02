import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';
import BrowserWindow from 'browser-window';
import GlobalShortcut from 'global-shortcut';
import Menu from 'menu';
import Dialog from 'dialog';
import { ipcMain } from 'electron';
import MenuBuilder from './menuBuilder.js';
import LoginWindow from './loginWindow.js';
import isInstalled from 'is-installed';

function installWindow(app, token) {

	var registeredShortcuts = [];

	var mainWindowState = WindowStateKeeper('main', {
    width: 400, height: 575,
		frame: false, title: 'OPengine',
  	transparent: true
	});

	var mainWindow = new BrowserWindow({
		width: mainWindowState.width, height: mainWindowState.height,
		frame: false, title: 'OPengine'
	});

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

	mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
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
      isInstalled(null, {}, function(err, results) {
        event.returnValue = results;
      });
    }
    // Helper functions from within the actual app
    ipcMain.on('installed', installed);



	return mainWindow;
}

export default installWindow;
