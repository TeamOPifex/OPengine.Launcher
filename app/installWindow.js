import WindowStateKeeper from './vendor/electron_boilerplate/window_state';
import DevHelper from './vendor/electron_boilerplate/dev_helper';

import MenuBuilder from './menuBuilder.js';
import LauncherWindow from './launcherWindow.js';
import LoginWindow from './loginWindow.js';
import isInstalled from './is-installed.js';
import Download from './download-file.js';
import LauncherConfig from './launcher-config.js';

const electron = require('electron');
const ipcMain = electron.ipcMain;
// const Remote = electron.remote;
// const Menu = Remote.Menu;
const Dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

function installWindow(app, token) {

	var registeredShortcuts = [];

	var mainWindow = new BrowserWindow({
		width: 400, height: 575,
		frame: false, title: 'OPengine',
		transparent: true,
        resizable: false
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
	    mainWindow.loadURL(global.webRoot + '/install.html?access_token=' + token);
	} else {
    	mainWindow.loadURL(global.webRoot + '/install.html');
	}

    function installed(event, arg) {
        // console.log('Get results from Install Window');
      isInstalled(arg, {}, function(err, results) {

				if(err) return;

				var allInstalled = true;
				for(var i = 0 ; i < results.length; i++) {
					if(!results[i].installed) {
						allInstalled = false;
						break;
					}
				}
				if(allInstalled) {
					var config = LauncherConfig.config() || {};
					config.installed = true;
					LauncherConfig.saveConfig(config);

					//LauncherWindow(app, arg);
					//mainWindow.destroy();
				}

        event.returnValue = results;
      });
    }
    // Helper functions from within the actual app
    ipcMain.on('installed', installed);

		function exit() {
			mainWindow.destroy();
		}
		ipcMain.on('close-installWindow', exit);

    ipcMain.on('install-cmake', function() {

        var Spawn = require('child_process').spawn;
				var Exec = require('child_process').exec;

				var file = {
					windows: {
						x86_x64: {
							file: 'cmake-3.5.2-win32-x86.msi',
							url: 'https://cmake.org/files/v3.5/cmake-3.5.2-win32-x86.msi'
						}
					},
					osx: {
						x86_x64: {
							file: 'cmake-3.5.2-Darwin-x86_64.dmg',
							url: 'https://cmake.org/files/v3.5/cmake-3.5.2-Darwin-x86_64.dmg'
						}
					},
					linux: {
						x86_x64: {
							file: 'cmake-3.5.2-Linux-i386.sh',
							url: 'https://cmake.org/files/v3.5/cmake-3.5.2-Linux-x86_64.sh'
						}
					}
				};
        Download(file, function(err, result) {
            if(err) {
                return;
            }
						console.log('Launching: ', result.file, 'from: ', result.folder );

						mainWindow.webContents.send('finished', result);

						switch(require('os').platform()) {
							case 'win32': {
	            	var child = Exec(result.file, { cwd: result.folder.split('/').join('\\') });
								break;
							}
							default: {
	            	var child = Spawn('open', [ result.file ], { cwd: result.folder });
								break;
							}
						}
        }, function(progress) {
					mainWindow.webContents.send('progress', progress);
        });
    });


    ipcMain.on('install', function(event, file) {

				mainWindow.webContents.send('progress', file);

        var Spawn = require('child_process').spawn;
				var Exec = require('child_process').exec;

        Download(file, function(err, result) {
            if(err) {
                return;
            }
						console.log('Launching: ', result.file, 'from: ', result.folder );

						mainWindow.webContents.send('finished', result);

						switch(require('os').platform()) {
							case 'win32': {
	            	var child = Exec(result.file, { cwd: result.folder.split('/').join('\\') });
								child.on('close', function(code) {
										mainWindow.webContents.send('install-closed');
								});
								break;
							}
							default: {
	            	var child = Spawn('open', [ result.file ], { cwd: result.folder });
								child.on('close', function(code) {
										mainWindow.webContents.send('install-closed');
								});
								break;
							}
						}
        }, function(progress) {
					mainWindow.webContents.send('progress', progress);
        });
    });




	return mainWindow;
}

export default installWindow;
