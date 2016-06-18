/**
 * @author mrdoob / http://mrdoob.com/
 */

    var fs = require('fs'), path = require('path');

 function walk(currentDirPath, subDir, callback) {
     fs.readdirSync(currentDirPath).forEach(function(name) {
         var filePath = path.join(currentDirPath, name);
         var stat = fs.statSync(filePath);
         callback(filePath, name, stat);
         if(subDir && stat.isDirectory()) {
             walk(filePath, subDir, callback);
         }
     });
 }

Projectbar.Textures = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );


  var textures = [];
	if(!fs.existsSync(window.projectPath + '/Assets/Textures/')) {
		fs.mkdirSync(window.projectPath + '/Assets/Textures/');
	}
  walk(window.projectPath + '/Assets/Textures/', true, function(result, name, stat) {
    if(name.endsWith('.png')) {
      textures.push(name);
    }
  });
  console.log('Textures:', textures);

  	var modelsContainer = new UI.Panel();
    modelsContainer.setClass('ModelViewerPanel');
    for(var i = 0; i < textures.length; i++) {
      //var modelsRow = new UI.Row();
      var contain = document.createElement( 'div' );
      contain.className = 'TextureContainer';

      var model = document.createElement( 'a' );
      model.className = 'Model Texture';
      model.setAttribute('draggable', 'true');
      model.setAttribute('model-name', textures[i]);
      model.setAttribute('model-type', 'texture');
      model.setAttribute('style', "background-image: url('file:///" + window.projectPath + "/Assets/Textures/" + textures[i] + "')");
      //model.textContent = textures[i];

    	model.addEventListener( 'dragstart', function(event) {
        var name = this.getAttribute('model-name');
        var t = this.getAttribute('model-type');
        event.dataTransfer.setData("text", name);
        event.dataTransfer.setData("type", t);
      }, false );

      contain.appendChild(model);

      var text = document.createElement( 'span' );
      text.textContent = textures[i];
      contain.appendChild(text);


      modelsContainer.dom.appendChild(contain);
      //modelsContainer.add(modelsRow);
    }

  container.add(modelsContainer);

	return container;

};
