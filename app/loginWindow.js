import DevHelper from './vendor/electron_boilerplate/dev_helper';
import BrowserWindow from 'browser-window';
import { ipcMain, ipcRenderer } from 'electron';
import env from './env';
import LauncherWindow from './launcherWindow.js';
import InstallWindow from './installWindow.js';
import isInstalled from 'is-installed';

function loginWindow(app, signout) {
	var window = new BrowserWindow({
		width: 400, height: 575,
		frame: false, title: 'OPengine',
  	transparent: true,
	});

	// Creating developer menu for debugging purposes
	DevHelper.setDevMenu();

	// Here we load from the file path regardless if it's in production
	// that way if the user doesn't have internet, it will still load
	// and they can login Offline.
	var path = 'file://' + __dirname + '/login.html?t=' + (+new Date);
	if(signout) {
		path += '&signout=true';
	}
    window.loadUrl(path);


	var githubWindow;
	function access(e, arg) {
		console.log(arg);
		window.webContents.send('access', arg);
		if(githubWindow) {
			console.log(githubWindow);
			githubWindow.close();
		}
	}

	function github(event, arg) {
		githubWindow = new BrowserWindow({
			width: 1025, height: 600,
			frame: true, title: 'Github'
		});
	    githubWindow.loadUrl(global.webRoot + '/githubLoad.html?t=' + (+new Date));
		githubWindow.on('close', function() {
			console.log('closing');
		})
		ipcMain.on('access', access);
	}

	function signin(event, arg) {
		//LauncherWindow(app, arg);
		isInstalled(null, {}, function(err, results) {
			console.log(err, results);
			var allInstalled = true;
			for(var i = 0; i < results.length; i++) {
				if(!results[i].installed) {
					allInstalled = false;
					break;
				}
			}
			if(allInstalled) {
				ipcMain.removeListener('signin', signin);
				ipcMain.removeListener('github', github);
				ipcMain.removeListener('access', access);
				window.destroy();
				LauncherWindow(app, arg);
			} else {
				ipcMain.removeListener('signin', signin);
				ipcMain.removeListener('github', github);
				ipcMain.removeListener('access', access);
				//window.destroy();
				InstallWindow(app, arg);
			}
		});
	}

	ipcMain.on('signin', signin);
	ipcMain.on('github', github);
}

export default loginWindow;
