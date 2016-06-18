Projectbar.Scenes = function ( editor ) {

  	var signals = editor.signals;

  	var container = new UI.Panel();
  	container.setBorderTop( '0' );
  	container.setPaddingTop( '20px' );


    var scenes = [];
    var fs = require('fs');
    if(!fs.existsSync(window.projectPath + '/Assets/Scenes/')) {
      fs.mkdirSync(window.projectPath + '/Assets/Scenes/');
    }
    OPIFEX.Utils.Walk(window.projectPath + '/Assets/Scenes/', function(result, name, stat) {
        if(name.endsWith('.opscene')) {
          scenes.push(name);
        }
    });

  	var modelsContainer = new UI.Panel();
    modelsContainer.setClass('ModelViewerPanel');
    for(var i = 0; i < scenes.length; i++) {
        //var modelsRow = new UI.Row();
        var model = document.createElement( 'a' );
        model.className = 'Model';
        model.setAttribute('draggable', 'true');
        model.setAttribute('model-name', scenes[i]);
        model.setAttribute('model-type', 'model');
        model.textContent = scenes[i];

        model.addEventListener( 'click', function(event) {
          // Remove the active class from all of the other scenes
          $('a.Model.active').removeClass('active');
          // Add the active class back to this scene
          this.className = 'Model active';
          // var name = this.getAttribute('model-name');
          // OPIFEX.Utils.LoadScene(editor, name);
        }, false );

        modelsContainer.dom.appendChild(model);
    }

    container.add(modelsContainer);


    var buttonsContainer = new UI.Panel();
    buttonsContainer.setClass('ModelViewerButtonsPanel');

    var newScene = new UI.Button( 'New' );
  	newScene.onClick( function () {

  	} );
  	buttonsContainer.add( newScene );

    var loadScript = new UI.Button( 'Load Selected' );
    loadScript.onClick( function () {
        var activeScenes = $('a.Model.active');
        if(activeScenes.length == 0) return;

        var name = activeScenes.attr('model-name');
        OPIFEX.Utils.LoadScene(editor, name);

    } );
    buttonsContainer.add( loadScript );

    container.add(buttonsContainer);

  	return container;

};
