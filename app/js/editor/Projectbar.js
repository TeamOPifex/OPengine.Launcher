/**
 * @author mrdoob / http://mrdoob.com/
 */

var Projectbar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'projectbar' );

  function onClick( event ) {
		select( event.target.textContent );
	}

	var settingsTab = new UI.Text( 'SCENES' ).onClick( onClick );
  var sceneTab = new UI.Text( 'MODELS' ).onClick( onClick );
	var projectTab = new UI.Text( 'TEXTURES' ).onClick( onClick );

    settingsTab.dom.style.cursor = 'pointer';
    sceneTab.dom.style.cursor = 'pointer';
    projectTab.dom.style.cursor = 'pointer';

  var tabs = new UI.Div();
  tabs.setId( 'tabs' );
  tabs.add( settingsTab, sceneTab, projectTab  );
  container.add( tabs );

  var models = new UI.Span().add(
		new Projectbar.Models( editor )
	);
	container.add( models );

  var textures = new UI.Span().add(
		new Projectbar.Textures( editor )
	);
	container.add( textures );


  function select( section ) {

		sceneTab.setClass( '' );
		projectTab.setClass( '' );
		settingsTab.setClass( '' );

		models.setDisplay( 'none' );
		textures.setDisplay( 'none' );
		// settings.setDisplay( 'none' );

		switch ( section ) {
			case 'MODELS':
				sceneTab.setClass( 'selected' );
				models.setDisplay( '' );
				break;
			case 'TEXTURES':
				projectTab.setClass( 'selected' );
				textures.setDisplay( '' );
				break;
			case 'SCENES':
				settingsTab.setClass( 'selected' );
				//settings.setDisplay( '' );
				break;
		}

	}

	select( 'SCENES' );

	return container;

};
