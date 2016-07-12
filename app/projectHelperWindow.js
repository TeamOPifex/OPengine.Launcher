import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';

import MenuBuilder from './menuBuilder.js';
import LoginWindow from './loginWindow.js';
import InstallWindow from './installWindow.js';
import Download from './download-file.js';
import SceneEditorWindow from './sceneEditorWindow.js';
import LauncherConfig from './launcher-config.js';
import isInstalled from './is-installed.js';

const electron = require('electron');
const ipcMain = electron.ipcMain;
const remote = require('electron').remote;
// const Menu = remote.Menu;
// const MenuItem = remote.MenuItem;
const Dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

function projectHelperWindow(app, path, isProject) {

	var registeredShortcuts = [];
  	var currentWindow = global.windowCount++;

	var mainWindowState = WindowStateKeeper('projectHelper', {
	    width: 232,
	    height: 76
	});

	var mainWindow = new BrowserWindow({
		width: mainWindowState.width, height: mainWindowState.height,
		frame: false, title: 'Project Helper',
    alwaysOnTop: true, transparent: true,
		webPreferences: {
			webSecurity: false,
			allowDisplayingInsecureContent: true,
			allowRunningInsecureContent: true
		}
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
    // var menu = Menu.buildFromTemplate(MenuBuilder(mainWindow));
    // Menu.setApplicationMenu(menu);

	// The default web file to load
	// This loads a local file first so that it can determine
	// if there's currently any internet. Otherwise we can go
	// in offline mode without negatively affecting the User
	// Experience
  if(isProject) {
	   mainWindow.loadURL(global.webRoot + '/projectHelper.html?path=' + path + '&currentWindow=' + currentWindow + '#/project');
  } else {
	   mainWindow.loadURL(global.webRoot + '/projectHelper.html?path=' + path + '&currentWindow=' + currentWindow + '#/engine');
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

		function removeShortcuts() {
				for(var i = 0 ; i < registeredShortcuts.length; i++) {
						globalShortcut.unregister(registeredShortcuts[i].keys);
				}
		}
    // mainWindow.on('blur', removeShortcuts);

	// When the window regains focus
		function addShortcuts() {
        for(var i = 0 ; i < registeredShortcuts.length; i++) {
            globalShortcut.register(registeredShortcuts[i].keys, ipcMainMethod(registeredShortcuts[i].method));
        }
    }
    addShortcuts();
    //mainWindow.on('focus', addShortcuts );

  	function shortcuts(event, arg) {
  		for(var i = 0 ; i < registeredShortcuts.length; i++) {
  			globalShortcut.unregister(registeredShortcuts[i].keys);
  		}
  		registeredShortcuts = arg;
  		for(var i = 0 ; i < registeredShortcuts.length; i++) {
  			console.log(registeredShortcuts[i]);
  			if(registeredShortcuts[i].keys.indexOf('cmd') > -1) continue;
  			globalShortcut.register(registeredShortcuts[i].keys, ipcMainMethod(registeredShortcuts[i].method));
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
		if(arg != currentWindow) return;
		mainWindow.minimize();
	}

	function exit(event, arg) {
		if(arg != currentWindow) return;
		removeShortcuts();
		mainWindow.destroy();
	}

	ipcMain.on('exit-helper-tool', exit);
  ipcMain.on('minimize', minimize);


	function signout() {
		mainWindow.destroy();
	}
	ipcMain.on('signout', signout);

	return mainWindow;
}

export default projectHelperWindow;
