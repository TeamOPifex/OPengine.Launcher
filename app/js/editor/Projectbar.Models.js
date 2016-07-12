Projectbar.Models = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );


  var models = [];

	var modelsContainer = new UI.Panel();

  function GatherModels() {
		models = [];
		modelsContainer.dom.innerHTML = '';

		var fs = require('fs');
		if(!fs.existsSync(window.projectPath + '/Assets/Models/')) {
			fs.mkdirSync(window.projectPath + '/Assets/Models/');
		}
	  OPIFEX.Utils.Walk(window.projectPath + '/Assets/Models/', function(result, name, stat) {
	    if(name.endsWith('.opm')) {
	      models.push(name);
	    }
	  });

    modelsContainer.setClass('ModelViewerPanel');
	  for(var i = 0; i < models.length; i++) {
	    //var modelsRow = new UI.Row();
	    var model = document.createElement( 'a' );
	    model.className = 'Model';
	    model.setAttribute('draggable', 'true');
	    model.setAttribute('model-name', models[i]);
	    model.setAttribute('model-type', 'model');
	    model.textContent = models[i];

	  	model.addEventListener( 'dragstart', function(event) {
	      var name = this.getAttribute('model-name');
	      var t = this.getAttribute('model-type');
	      event.dataTransfer.setData("text", name);
	      event.dataTransfer.setData("type", t);
	    }, false );
	    modelsContainer.dom.appendChild(model);
	    //modelsContainer.add(modelsRow);
	  }
	}

	require('fs').watch(window.projectPath + '/Assets/Models/', function(event, filename) {
		console.log('File change', event, filename);
		GatherModels();
	})

	GatherModels();

  container.add(modelsContainer);

	return container;

};
