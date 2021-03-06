function menuBuilder(mainWindow) {
	var template = [
	  {
	    label: 'OPengine',
	    submenu: [
	        {
	            label: 'Home',
	            click: function() { mainWindow.loadURL('file://' + __dirname + '/loading.html'); }
	        },
	      {
	        type: 'separator'
	      },
	      {
	        label: 'Services',
	        submenu: []
	      },
	      {
	        type: 'separator'
	      },
	      {
	        label: 'Hide OPengine',
	        accelerator: 'CmdOrCtrl+H',
	        selector: 'hide:'
	      },
	      {
	        label: 'Hide Others',
	        accelerator: 'CmdOrCtrl+Shift+H',
	        selector: 'hideOtherApplications:'
	      },
	      {
	        label: 'Show All',
	        selector: 'unhideAllApplications:'
	      },
	      {
	        type: 'separator'
	      },
	      {
	        label: 'Quit',
	        accelerator: 'CmdOrCtrl+Q',
	        selector: 'terminate:'
	      },
	    ]
	  },
	  {
	    label: 'Edit',
	    submenu: [
	      {
	        label: 'Undo',
	        accelerator: 'CmdOrCtrl+Z',
	        selector: 'undo:'
	      },
	      {
	        label: 'Redo',
	        accelerator: 'Shift+CmdOrCtrl+Z',
	        selector: 'redo:'
	      },
	      {
	        type: 'separator'
	      },
	      {
	        label: 'Cut',
	        accelerator: 'CmdOrCtrl+X',
	        selector: 'cut:'
	      },
	      {
	        label: 'Copy',
	        accelerator: 'CmdOrCtrl+C',
	        selector: 'copy:'
	      },
	      {
	        label: 'Paste',
	        accelerator: 'CmdOrCtrl+V',
	        selector: 'paste:'
	      },
	      {
	        label: 'Select All',
	        accelerator: 'CmdOrCtrl+A',
	        selector: 'selectAll:'
	      }
	    ]
	  },
	  {
	    label: 'View',
	    submenu: [
	      {
	        label: 'Reload',
	        accelerator: 'CmdOrCtrl+R',
	        click: function() { mainWindow.reload(); }
	      },
	      {
	        label: 'Toggle DevTools',
	        accelerator: 'Alt+CmdOrCtrl+I',
	        click: function() { mainWindow.toggleDevTools(); }
	      },
	    ]
	  },
	  {
	    label: 'Window',
	    submenu: [
	      {
	        label: 'Minimize',
	        accelerator: 'CmdOrCtrl+M',
	        selector: 'performMiniaturize:'
	      },
	      {
	        label: 'Close',
	        accelerator: 'CmdOrCtrl+W',
	        selector: 'performClose:'
	      },
	      {
	        type: 'separator'
	      },
	      {
	        label: 'Bring All to Front',
	        selector: 'arrangeInFront:'
	      }
	    ]
	  },
	  {
	    label: 'Help',
	    submenu: [
	      {
	        label: 'About OPengine',
	        selector: 'orderFrontStandardAboutPanel:'
	      }
	    ]
	  }
	];
	return template;
}

export default menuBuilder;
