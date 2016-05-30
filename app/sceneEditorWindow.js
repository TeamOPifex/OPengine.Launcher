import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';

import MenuBuilder from './menuBuilder.js';
import LoginWindow from './loginWindow.js';
import Download from './download-file.js';

const electron = require('electron');
const ipcMain = electron.ipcMain;
const remote = require('electron').remote;
// const Menu = remote.Menu;
// const MenuItem = remote.MenuItem;
const Dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

function sceneEditorWindow(app, project, projectPath) {

	var registeredShortcuts = [];

	var mainWindowState = WindowStateKeeper('main', {
	    width: 1280,
	    height: 720
	});

	var mainWindow = new BrowserWindow({
		width: mainWindowState.width, height: mainWindowState.height,
		frame: false, title: 'OPengine Scene Editor',
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

  	mainWindow.loadURL(global.webRoot + '/sceneEditor.html');

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
            globalShortcut.unregister(registeredShortcuts[i].keys);
        }
    });

	// When the window regains focus
    mainWindow.on('focus', function() {
        for(var i = 0 ; i < registeredShortcuts.length; i++) {
            globalShortcut.register(registeredShortcuts[i].keys, ipcMainMethod(registeredShortcuts[i].method));
        }
    });



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
		mainWindow.minimize();
	}
    ipcMain.on('minimize', minimize);

	function load(event, arg) {
		mainWindow.loadURL(global.webRoot + '/' + arg);
	}
    ipcMain.on('load', load);

	function absPath(event, arg) {
		event.returnValue = global.webRoot + '/' + arg;
	}
    ipcMain.on('absPath', absPath);


	function exit(event, arg) {
		mainWindow.destroy();
	}
	ipcMain.on('exit', exit);

	ipcMain.on('title', function(event) {
			mainWindow.webContents.send('title', project);
	});

	ipcMain.on('models', function(event) {

			event.returnValue = results;
	});

	ipcMain.on('projectPath', function(event) {
			event.returnValue = projectPath;
	});

	function exit(event, arg) {
		mainWindow.destroy();
	}
	ipcMain.on('close', exit);

	function minimize(event, arg) {
		mainWindow.minimize();
	}
		ipcMain.on('minimize', minimize);


	function maximize(event, arg) {
		if(mainWindow.isMaximized()) {
			mainWindow.unmaximize();
			return;
		}
		mainWindow.maximize();
	}
    ipcMain.on('maximize', maximize);

	return mainWindow;
}

export default sceneEditorWindow;
