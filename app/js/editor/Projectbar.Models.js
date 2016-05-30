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

Projectbar.Models = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );


  var models = [];
  walk(window.projectPath + '/Assets/Models/', true, function(result, name, stat) {
    if(name.endsWith('.opm')) {
      models.push(name);
    }
  });
  console.log('MODELS:', models);

  	var modelsContainer = new UI.Panel();
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

  container.add(modelsContainer);

	return container;

};
