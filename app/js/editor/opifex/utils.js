var OPIFEX = OPIFEX || {};

var fs = require('fs'), path = require('path');

OPIFEX.Utils = {
    AddMesh: function(editor, meshFileName, textureFileName, settings, cb) {
        var file = window.projectPath + '/Assets/Models/' + meshFileName;

        if(!fs.existsSync(file)) return;

        var fileData = fs.readFileSync(file);

        editor.loader.loadFile({
          name: meshFileName,
          data: fileData
        }, true, function(object) {
            if(object == null || object == undefined) {
                return;
            }
            object.position.x = settings.position[0];
            object.position.y = settings.position[1];
            object.position.z = settings.position[2];
            object.scale.x = settings.scale[0];
            object.scale.y = settings.scale[1];
            object.scale.z = settings.scale[2];
            object.rotation.x = settings.rotation[0];
            object.rotation.y = settings.rotation[1];
            object.rotation.z = settings.rotation[2];

            if(settings.gameType) {
              editor.execute( new SetValueCommand( object, 'gameType', settings.gameType ) );
            }

            if(textureFileName != null && textureFileName != undefined) {
                if(object.type == 'Mesh') {
                    OPIFEX.Utils.SetTexture(editor, object, textureFileName);
                } else {
                    OPIFEX.Utils.SetTexture(editor, object.children[0], textureFileName);
                }
            }

            cb && cb(object);
        });
    },

    AddGroup: function(editor, name, node, cb) {
        var mesh = new THREE.Group();
        mesh.name = name;
        editor.execute( new AddObjectCommand( mesh ) );
        cb && cb(mesh);
    },

    SetTexture: function(editor, object, textureFileName) {
        var textureFilePath = window.projectPath + '/Assets/Textures/' + textureFileName;
        if(!require('fs').existsSync(textureFilePath)) return;

  			var image = document.createElement( 'img' );
  			image.addEventListener( 'load', function( event ) {

  				var texture = new THREE.Texture( this );
  				texture.sourceFile = textureFileName;
  				texture.needsUpdate = true;

  				editor.execute( new SetMaterialMapCommand( object, 'map', texture ) );

  			}, false );

  			image.src = 'file:///' + textureFilePath;
    },

    MoveObject: function( editor, object, newParent, nextObject ) {

      if ( nextObject === null ) nextObject = undefined;

      var newParentIsChild = false;

      object.traverse( function ( child ) {

        if ( child === newParent ) newParentIsChild = true;

      } );

      if ( newParentIsChild ) return;

      editor.execute( new MoveObjectCommand( object, newParent, nextObject ) );

    },

    LoadSceneNode: function(editor, node, parent) {
        function ProcessChildren(result) {
            if(parent) {
                OPIFEX.Utils.MoveObject( editor, result, parent );
            }
            if(node.children) {
                for(var i = 0; i < node.children.length; i++) {
                    OPIFEX.Utils.LoadSceneNode(editor, node.children[i], result);
                }
            }
        }

        if(node.type == "MESH") {
            OPIFEX.Utils.AddMesh(editor, node.name, node.texture, node, ProcessChildren);
        } else if(node.type == "GROUP") {
            OPIFEX.Utils.AddGroup(editor, node.name, node, ProcessChildren);
        }
    },

    LoadScene: function(editor, sceneFileName) {
        editor.clear();

        var file = window.projectPath + '/Assets/Scenes/' + sceneFileName;
        var fileData = fs.readFileSync(file);
        var scene = JSON.parse(fileData + '');
        for(var i = 0; i < scene.models.length; i++) {
            var model = scene.models[i];
            OPIFEX.Utils.LoadSceneNode(editor, model, null);
        }

        editor.select(null);

        window.activeScene = sceneFileName;
    },

    Walk: function(filePath, callback) {
        fs.readdirSync(filePath).forEach(function(name) {
            var fullFilePath = path.join(filePath, name);
            var stat = fs.statSync(fullFilePath);
            callback(fullFilePath, name, stat);
            if(stat.isDirectory()) {
                OPIFEX.Utils.Walk(filePath, callback);
            }
        });
    }
};
