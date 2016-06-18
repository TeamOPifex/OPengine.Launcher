import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';

import MenuBuilder from './menuBuilder.js';
import LoginWindow from './loginWindow.js';
import InstallWindow from './installWindow.js';
import Download from './download-file.js';
import SceneEditorWindow from './sceneEditorWindow.js';
import LauncherConfig from './launcher-config.js';

const electron = require('electron');
const ipcMain = electron.ipcMain;
const remote = require('electron').remote;
// const Menu = remote.Menu;
// const MenuItem = remote.MenuItem;
const Dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

function launcherWindow(app, token) {

	var registeredShortcuts = [];

	var mainWindowState = WindowStateKeeper('main', {
	    width: 1280,
	    height: 720
	});

	var mainWindow = new BrowserWindow({
		width: mainWindowState.width, height: mainWindowState.height,
		frame: false, title: 'OPengine',
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
	if(token) {
	    mainWindow.loadURL(global.webRoot + '/app.html?access_token=' + token);
	} else {
    	mainWindow.loadURL(global.webRoot + '/app.html');
	}


		var config = LauncherConfig.config() || {};

		if(!config.installed) {
				InstallWindow(app, token);
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
    mainWindow.on('blur', removeShortcuts);

	// When the window regains focus
		function addShortcuts() {
        for(var i = 0 ; i < registeredShortcuts.length; i++) {
            globalShortcut.register(registeredShortcuts[i].keys, ipcMainMethod(registeredShortcuts[i].method));
        }
    }
    mainWindow.on('focus', addShortcuts );



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


		function sceneEditor(event, project, projectPath) {
			SceneEditorWindow(app, project, projectPath);
		}
	  ipcMain.on('sceneEditor', sceneEditor);

		function install(event, file) {

					// mainWindow.webContents.send('progress', file);

					var Spawn = require('child_process').spawn;
					var Exec = require('child_process').exec;

					Download(file, function(err, result) {
							if(err) {
									return;
							}
							console.log('Launching: ', result.file, 'from: ', result.folder );


							var root = require('os').homedir() + '/.opengine';
							var folder = root + '/marketplace/';
							var unzipExtractor = require('unzip').Extract({ path: folder });
							unzipExtractor.on('close', function() {
									mainWindow.webContents.send('finished', result);
							});
							require('fs').createReadStream(result.folder + result.file).pipe(unzipExtractor);
							//
							// switch(require('os').platform()) {
							// 	case 'win32': {
							//   	var child = Exec(result.file, { cwd: result.folder.split('/').join('\\') });
							// 		child.on('close', function(code) {
							// 				mainWindow.webContents.send('install-closed');
							// 		});
							// 		break;
							// 	}
							// 	default: {
							//   	var child = Spawn('open', [ result.file ], { cwd: result.folder });
							// 		child.on('close', function(code) {
							// 				mainWindow.webContents.send('install-closed');
							// 		});
							// 		break;
							// 	}
							// }
					}, function(progress) {
						mainWindow.webContents.send('progress', progress);
					});
		}
  ipcMain.on('install', install);

	function exit(event, arg) {
		removeShortcuts();
		mainWindow.destroy();
	}
	ipcMain.on('exit', exit);


	function signout() {
		ipcMain.removeListener('signout', signout);
		ipcMain.removeListener('folder', folder);
		ipcMain.removeListener('shortcuts', shortcuts);
		ipcMain.removeListener('minimize', minimize);
		ipcMain.removeListener('load', load);
		ipcMain.removeListener('absPath', absPath);
		ipcMain.removeListener('sceneEditor', sceneEditor);
		ipcMain.removeListener('install', install);
		ipcMain.removeListener('exit', exit);
		removeShortcuts();
		console.log(LoginWindow);
		require('./loginWindow.js')(app, true);
		mainWindow.destroy();
	}

	ipcMain.on('signout', signout);

	return mainWindow;
}

export default launcherWindow;
