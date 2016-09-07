var OPIFEX = OPIFEX || {};

var fs = require('fs'), path = require('path');

OPIFEX.Utils = {

    SetNode: function(editor, node, object, cb) {
        if(object == null || object == undefined) {
            return;
        }

        node.position = node.position || [ 0, 0, 0 ];
        node.scale = node.scale || [ 1, 1, 1 ];
        node.rotation = node.rotation || [ 0, 0, 0 ];

        object.name = node.name.split('.')[0];
        object.opm = node.opm;
        object.position.x = node.position[0];
        object.position.y = node.position[1];
        object.position.z = node.position[2];
        object.scale.x = node.scale[0];
        object.scale.y = node.scale[1];
        object.scale.z = node.scale[2];
        object.rotation.x = node.rotation[0];
        object.rotation.y = node.rotation[1];
        object.rotation.z = node.rotation[2];

        if(node.userData) {
          object.userData = node.userData;
        }

        if(node.gameType) {
          editor.execute( new SetValueCommand( object, 'gameType', node.gameType ) );
        } else {
          editor.execute( new SetValueCommand( object, 'gameType', ' ' ) );
        }

        if(node.scripts) {
          for(var key in node.scripts) {
            var script = { name: key, source: node.scripts[key] };
            editor.execute( new AddScriptCommand( object, script ) );
          }
        }

        if(node.material) {
          object.material.transparent = node.material.transparent;
          object.material.opacity = node.material.opacity;
          object.material.wireframe = node.material.wireframe;

          if(node.material.color) {
            object.material.color.r = node.material.color[0];
            object.material.color.g = node.material.color[1];
            object.material.color.b = node.material.color[2];
          }
          if(node.material.texture != null && node.material.texture != undefined) {
              if(object.type == 'Mesh') {
                  OPIFEX.Utils.SetTexture(editor, object, node.material.texture);
              } else {
                  OPIFEX.Utils.SetTexture(editor, object.children[0], node.material.texture);
              }
          }
        }

        cb && cb(object);
    },

    AddMesh: function(editor, meshFileName, node, cb) {
        var file = window.projectPath + '/Assets/Models/' + meshFileName;

        if(!fs.existsSync(file)) {
          // OPM doesn't exist, assume it's a cube for now
          var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
          var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
          mesh.name = node.name.split('.')[0];
          mesh.opm = meshFileName;

          editor.execute( new AddObjectCommand( mesh ) );

          OPIFEX.Utils.SetNode(editor, node, mesh, cb);

          return;
        }

        var fileData = fs.readFileSync(file);

        editor.loader.loadFile({
          name: meshFileName,
          data: fileData
        }, true, function(object) {


          if(object.type == 'Group') {
            object.opm = meshFileName;
            object.gameType = node.gameType;
            node.opm = '';
            node.type = 'SUBMESH';
            object.position.x = node.position[0];
            object.position.y = node.position[1];
            object.position.z = node.position[2];

            for(var i = 0; i < object.children.length; i++) {
            	if(!node.material.texture && object.children[i].meta && object.children[i].meta['albedo']) {
            		node.material.texture = object.children[i].meta['albedo'];
            	}
              var passedNode = node;
              if(node.children) {
                passedNode = node.children[i];
              }
              OPIFEX.Utils.SetNode(editor, passedNode, object.children[i], cb);
            }
          } else {
          	if(!node.material.texture && object.meta && object.meta['albedo']) {
          		node.material.texture = object.meta['albedo'];
          	}
            OPIFEX.Utils.SetNode(editor, node, object, cb);
          }
        });
    },
    //
    // LoadUpMultiMesh: function(editor, meshFileName, node, cb) {
    //     var file = window.projectPath + '/Assets/Models/' + meshFileName;
    //     var fileData = fs.readFileSync(file);
    //
    //     editor.loader.loadFile({
    //       name: meshFileName,
    //       data: fileData
    //     }, true, function(object) {
    //       // This is a mesh with multiple meshes in it
    //       object.position.x = node.position[0];
    //       object.position.y = node.position[1];
    //       object.position.z = node.position[2];
    //     });
    // },

    AddGroup: function(editor, name, node, cb) {
        var mesh = new THREE.Group();
        mesh.name = name;
        mesh.position.x = node.position[0];
        mesh.position.y = node.position[1];
        mesh.position.z = node.position[2];
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
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

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

          function ProcessGroupChildren(result) {
              if(parent) {
                  OPIFEX.Utils.MoveObject( editor, result, parent );
              }
              if(node.children) {
                  for(var i = 0; i < node.children.length; i++) {
                      //OPIFEX.Utils.LoadSceneNode(editor, node.children[i], result);
                  }
              }
          }

        if(node.type == "MESH") {
            OPIFEX.Utils.AddMesh(editor, node.opm || node.name, node, ProcessChildren);
        } else if(node.type == "GROUP") {

            if(node.opm) {
              // This is a Mesh Group
              // Load this group as a mesh
              node.material = {};
              OPIFEX.Utils.AddMesh(editor, node.opm || node.name, node, ProcessGroupChildren);
            } else {
              OPIFEX.Utils.AddGroup(editor, node.name, node, ProcessChildren);
            }
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
