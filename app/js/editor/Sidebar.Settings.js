/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	// class

	var options = {
		'stylesheets/editor/opifex.css': 'opifex'
	};

	var themeRow = new UI.Row();
	var theme = new UI.Select().setWidth( '150px' );
	theme.setOptions( options );

	if ( config.getKey( 'theme' ) !== undefined ) {

		theme.setValue( config.getKey( 'theme' ) );

	}

	theme.onChange( function () {

		var value = this.getValue();

		editor.setTheme( value );
		editor.config.setKey( 'theme', value );

	} );

	themeRow.add( new UI.Text( 'Theme' ).setWidth( '90px' ) );
	themeRow.add( theme );

	container.add( themeRow );



	
	// editor.json

	var objectEditorSettingsDataRow = new UI.Row();
	var objectEditorSettingsData = new UI.TextArea().setWidth( '150px' ).setHeight( '40px' ).setFontSize( '12px' );

	// Read editor.json & setValue
	var fs = require('fs');
	var filePath = window.projectPath + '/editor.json';
	if(fs.existsSync(filePath)) {
		
		var fileData = fs.readFileSync(filePath);
		objectEditorSettingsData.setValue(fileData + '');
	} else {
		objectEditorSettingsData.setValue('{}');
	}

	var editSettingsSaveDataTimer = null;
	objectEditorSettingsData.onKeyUp( function () {

		if(editSettingsSaveDataTimer != null) {
			clearTimeout(editSettingsSaveDataTimer);
			editSettingsSaveDataTimer = null;
		}
		
		editSettingsSaveDataTimer = setTimeout(function() {
			try {
	
				var result = JSON.parse( objectEditorSettingsData.getValue() );
	
				objectEditorSettingsData.dom.classList.add( 'success' );
				objectEditorSettingsData.dom.classList.remove( 'fail' );

				// Save to editor.json
				var dataToFile = JSON.stringify( result, null, 4 );
				fs.writeFileSync( filePath, dataToFile );
				objectEditorSettingsData.setValue(dataToFile);

				window.editorSettings = result;

				editor.signals.gameTypesUpdate.dispatch( result );
	
			} catch ( error ) {
	
				objectEditorSettingsData.dom.classList.remove( 'success' );
				objectEditorSettingsData.dom.classList.add( 'fail' );
	
			}
	
			
		}, 500);

	} );

	objectEditorSettingsDataRow.add( new UI.Text( 'User data' ).setWidth( '90px' ) );
	objectEditorSettingsDataRow.add( objectEditorSettingsData );

	container.add( objectEditorSettingsDataRow );


	return container;

};
