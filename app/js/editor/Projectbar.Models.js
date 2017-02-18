﻿Projectbar.Models = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );


  var models = [];
	var rootPath;
	var root = {
		models: []
	};
	var rootFolders = {};

	var modelsContainer = new UI.Panel();

  function GatherModels() {
		models = [];
		modelsContainer.dom.innerHTML = '';

		var fs = require('fs');
		if(!fs.existsSync(window.projectPath + '/Assets/Models/')) {
			fs.mkdirSync(window.projectPath + '/Assets/Models/');
		}

		rootPath = window.projectPath + '/Assets/Models/';

		rootPath = rootPath.split('\\').join('/');
	  OPIFEX.Utils.Walk(rootPath, function(result, name, stat, notInRoot, path) {
			if(!stat.isDirectory() && !name.endsWith('.opm')) return;

			if(notInRoot) {
				if(!rootFolders[path]) {
					var parent = path.split('\\').join('/').split('/');
					parent.pop();

					rootFolders[path] = {
						models: [],
						parent: parent.join('/')
					};
				}

				rootFolders[path].models.push({
						folder: stat.isDirectory(),
						name: name,
						asset: result.split(rootPath)[1],
						path: result,
						parent: path != rootPath ? path : null
					});

			} else {
				root.models.push({
					folder: stat.isDirectory(),
					name: name,
					asset: result.split(rootPath)[1],
					path: result,
					parent: path != rootPath ? path : null
				});
			}
	  });

    modelsContainer.setClass('ModelViewerPanel');


		function LoadModels(folder, parent) {

			modelsContainer.dom.innerHTML = '';

			if(folder) {
				var backButton = document.createElement( 'a' );
		    backButton.className = 'Model Back';
				backButton.textContent = 'Back';
		    modelsContainer.dom.appendChild(backButton);
				backButton.addEventListener( 'click', function(event) {
					if(!folder) {
						LoadModels();
					} else {
						LoadModels(rootFolders[folder.parent]);
					}
				});
			}

			if(!folder) {
				folder = root;
			}

			folder.models.sort(function(a,b) {
				if(a.folder && !b.folder) return -1;
				if(!a.folder && b.folder) return 1;
				if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
				if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
				return 0;
			});

		  for(var i = 0; i < folder.models.length; i++) {
				var model = document.createElement( 'a' );
		    model.className = 'Model';
		    model.setAttribute('model-name', folder.models[i].asset);
		    model.setAttribute('model-type', 'model');
		    model.setAttribute('model-path', folder.models[i].path);
				model.setAttribute('style', "background-size: cover; background-image: url('" + folder.models[i].path.split('\\').join('/') + ".png')");
				model.textContent = folder.models[i].name;
				if(folder.models[i].folder) {
					model.className = 'Model Folder';
			  	model.addEventListener( 'click', function(event) {
						console.log('Clicked Folder');
				    var path = this.getAttribute('model-path');
						LoadModels(rootFolders[path]);
					});
				} else {
		    	model.setAttribute('draggable', 'true');
			  	model.addEventListener( 'dragstart', function(event) {
			      var name = this.getAttribute('model-name');
			      var t = this.getAttribute('model-type');
			      event.dataTransfer.setData("text", name);
			      event.dataTransfer.setData("type", t);
			    }, false );
				}
		    modelsContainer.dom.appendChild(model);
			}
		}

		LoadModels();

	}

	require('fs').watch(window.projectPath + '/Assets/Models/', function(event, filename) {
		console.log('File change', event, filename);
		GatherModels();
	})

	GatherModels();

  container.add(modelsContainer);

	return container;

};
