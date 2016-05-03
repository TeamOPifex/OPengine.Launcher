import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';
import BrowserWindow from 'browser-window';
import GlobalShortcut from 'global-shortcut';
import Menu from 'menu';
import Dialog from 'dialog';
import { ipcMain } from 'electron';
import MenuBuilder from './menuBuilder.js';
import LoginWindow from './loginWindow.js';

function launcherWindow(app, token) {

	var registeredShortcuts = [];

	var mainWindowState = WindowStateKeeper('main', {
	    width: 1280,
	    height: 720
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
	    mainWindow.loadUrl(global.webRoot + '/app.html?access_token=' + token);
	} else {
    	mainWindow.loadUrl(global.webRoot + '/app.html');
	}

	// Helper function for using the ipcMain stuff with shortcut keys
	function ipcMainMethod(m) {
		return function() {
			mainWindow.webContents.send(m);
		};
	}

	// These have to be done so that the shortcuts aren't globally used
	// Otherwise things like running the current project would happen
	// whether the window was active or not. Not the correct intention.

	// When the window loses focus
    mainWindow.on('blur', function() {
        for(var i = 0 ; i < registeredShortcuts.length; i++) {
            GlobalShortcut.unregister(registeredShortcuts[i].keys);
        }
    });

	// When the window regains focus
    mainWindow.on('focus', function() {
        for(var i = 0 ; i < registeredShortcuts.length; i++) {
            GlobalShortcut.register(registeredShortcuts[i].keys, ipcMainMethod(registeredShortcuts[i].method));
        }
    });



	function shortcuts(event, arg) {
		for(var i = 0 ; i < registeredShortcuts.length; i++) {
			GlobalShortcut.unregister(registeredShortcuts[i].keys);
		}
		registeredShortcuts = arg;
		for(var i = 0 ; i < registeredShortcuts.length; i++) {
			console.log(registeredShortcuts[i]);
			if(registeredShortcuts[i].keys.indexOf('cmd') > -1) continue;
			GlobalShortcut.register(registeredShortcuts[i].keys, ipcMainMethod(registeredShortcuts[i].method));
		}
	}

	// Sets all of the shortcuts in one go
    ipcMain.on('shortcuts', shortcuts);

	function folder(event, arg) {
		Dialog.showOpenDialog({
			properties: [ 'openDirectory' ]
		}, function(results) {
			console.log(results);
			if(!results) {
				event.returnValue = null;
				return;
			}
			event.returnValue = results;
		});
	}
	// Helper functions from within the actual app
    ipcMain.on('folder', folder);

	function minimize(event, arg) {
		mainWindow.minimize();
	}
    ipcMain.on('minimize', minimize);

	function load(event, arg) {
		mainWindow.loadUrl(global.webRoot + '/' + arg);
	}
    ipcMain.on('load', load);

	function absPath(event, arg) {
		event.returnValue = global.webRoot + '/' + arg;
	}
    ipcMain.on('absPath', absPath);

	ipcMain.on('signout', function(event, arg) {
		ipcMain.removeListener('folder', folder);
		ipcMain.removeListener('shortcuts', shortcuts);
		ipcMain.removeListener('minimize', minimize);
		ipcMain.removeListener('load', load);
		ipcMain.removeListener('absPath', absPath);
		console.log(LoginWindow);
		require('./loginWindow.js')(app, true);
		mainWindow.destroy();
	});

	function exit(event, arg) {
		mainWindow.destroy();
	}
	ipcMain.on('exit', exit);

	return mainWindow;
}

export default launcherWindow;
