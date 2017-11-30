/**
 * @author mrdoob / http://mrdoob.com/
 */

var Menubar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'menubar' );

	container.add( new Menubar.File( editor ) );
	container.add( new Menubar.Edit( editor ) );
	container.add( new Menubar.Add( editor ) );
	//container.add( new Menubar.Play( editor ) );
	//container.add( new Menubar.Examples( editor ) );
	//container.add( new Menubar.Help( editor ) );

  var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Add Bounding Box' );
	option.onClick( function () {
		var width = 1;
		var height = 1;
		var depth = 1;

		var widthSegments = 1;
		var heightSegments = 1;
		var depthSegments = 1;

		var geometry = new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'BB ' + editor.selected.children.length;

		mesh.parent = editor.selected;
		mesh.material.color.r = 0.0;
		mesh.material.color.g = 0.4666666666666667;
		mesh.material.color.b = 1.0;
		mesh.material.transparent = true;
		mesh.material.wireframe = true;
		mesh.material.opacity = 0.5;
		mesh.gameType = 'BoundingBox';
		editor.selected.children.push(mesh);

        //console.log(editor.selected, mesh);
		// editor.addObject( mesh );
		editor.select( mesh );
        editor.signals.objectAdded.dispatch( mesh );
        editor.signals.sceneGraphChanged.dispatch();
	} );
	container.add( option );


	var objectGameTypes = new UI.Select().setFontSize( '11px' );
	window.defaultGameType = ' ';

	objectGameTypes.setClass( 'Select option' );
	function SetGameTypes() {
		var gameTypeOptions = { " ": " " };
		for(var i = 0; i < window.editorSettings.GameTypes.length; i++) {
			gameTypeOptions[window.editorSettings.GameTypes[i]] = window.editorSettings.GameTypes[i];
		}
		objectGameTypes.setOptions( gameTypeOptions );
	}
	SetGameTypes();

	objectGameTypes.onChange( function () {
		window.defaultGameType = objectGameTypes.getValue();
	});

	editor.signals.gameTypesUpdate.add(SetGameTypes);

	

	console.log(objectGameTypes);
	container.add( objectGameTypes );

	//container.add( new Menubar.Status( editor ) );

	return container;

};
