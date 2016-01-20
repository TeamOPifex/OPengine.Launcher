// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, ipcMain } from 'electron';
import devHelper from './vendor/electron_boilerplate/dev_helper';
import windowStateKeeper from './vendor/electron_boilerplate/window_state';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';
import envHelper from './envHelper'
import loginWindow from './loginWindow'

envHelper();

global.webRoot = 'file://' + __dirname;
if (env.name == 'production') {
    global.webRoot = 'http://launcher.opengine.io'
}

app.on('ready', function () {

    ipcMain.on('close', function(event, arg) {
        app.quit();
    });

    ipcMain.on('env-name', function(event, arg) {
        event.returnValue = env.name;
    });

    loginWindow(app);
});

app.on('window-all-closed', function () {
    app.quit();
});
