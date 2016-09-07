THREE.OPMLoader = function( manager ) {
    console.log('OPMLoader initialized');
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
  	this.materials = null;
}

function BinaryReader(data) {
  this.offset = 0;
  this.dv = new DataView(data);
}

BinaryReader.prototype = {
  offset: 0,
  dv: null,

  ui8: function() {
    var val = this.dv.getUint8(this.offset, true);
    this.offset += 1;
    return val;
  },
  ui16: function() {
    var val = this.dv.getUint16(this.offset, true);
    this.offset += 2;
    return val;
  },
  ui32: function() {
    var val = this.dv.getUint32(this.offset, true);
    this.offset += 4;
    return val;
  },
  f32: function() {
    var val = this.dv.getFloat32(this.offset, true);
    this.offset += 4;
    return val;
  },
  str: function() {
    var len = this.ui32();
    if(len == 0) return '';
    var utf16 = new ArrayBuffer(len * 2);
    var utf16View = new Uint16Array(utf16);
    for (var i = 0; i < len; ++i) {
        utf16View[i] = this.ui8();
    }
    return String.fromCharCode.apply(null, utf16View);
  }
}


THREE.OPMLoader.prototype = {

	constructor: THREE.OPMLoader,

  features: {
    Position: 1,
    Normal: 2,
    UV: 4,
    Tangent: 8,
    Index: 16,
    Bones: 32,
    Skinning: 64,
    Animations: 128,
    Color: 256,
    Meta: 512,
    BiTangent: 1024
  },

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setPath( this.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

  },

	setPath: function ( value ) {

		this.path = value;

	},

	setMaterials: function ( materials ) {

		this.materials = materials;

	},

  loadV3: function(data, reader) {
        var container = new THREE.Group();

        var modelName = reader.str();
        console.log('Loading Model: ', modelName);

        var meshCount = reader.ui32();
        var features = reader.ui32();

        var stride = 0;
        if((this.features.Position & features) > 0) {
          stride += 3;
        }
        if((this.features.Normal & features) > 0) {
          stride += 3;
        }
        if((this.features.Tangent & features) > 0) {
          stride += 3;
        }
        if((this.features.BiTangent & features) > 0) {
          stride += 3;
        }
        if((this.features.UV & features) > 0) {
          stride += 2;
        }
        if((this.features.Color & features) > 0) {
          stride += 3;
        }
        if((this.features.Skinning & features) > 0) {
          stride += 4;
          stride += 4;
          alert('Skinning Unsupported');
          return;
        }

        var vertexMode = reader.ui16();
        if(vertexMode == 2) {
          alert('Vertex Mode Unsupported: ' + vertexMode);
          return;
        }

        var totalVertices = reader.ui32();
        var totalIndices = reader.ui32();

        var ind = 0;

        for(var meshInd = 0; meshInd < meshCount; meshInd++) {
          var meshName = reader.str();
          console.log('Loading Mesh: ', meshName);

          var verticesCount = reader.ui32();
          var indicesCount = reader.ui32();

          var buffergeometry = new THREE.BufferGeometry();


          var positions = [];
          var normals = [];
          var uvs = [];
          var tangents = [];
          var bitangents = [];

          var vertices = [];
          for(var i = 0; i < verticesCount; i++) {
            if((this.features.Position & features) > 0) {
              positions.push(reader.f32());
              positions.push(reader.f32());
              positions.push(reader.f32());
            }
            if((this.features.Normal & features) > 0) {
              normals.push(reader.f32());
              normals.push(reader.f32());
              normals.push(reader.f32());
            }
            if((this.features.Tangent & features) > 0) {
              tangents.push(reader.f32());
              tangents.push(reader.f32());
              tangents.push(reader.f32());
            }
            if((this.features.BiTangent & features) > 0) {
              bitangents.push(reader.f32());
              bitangents.push(reader.f32());
              bitangents.push(reader.f32());
            }
            if((this.features.UV & features) > 0) {
              uvs.push(reader.f32());
              uvs.push(reader.f32());
            }
          }

          var indices = [];
          for(var i = 0; i < indicesCount; i++) {
            indices.push(reader.ui16() - ind);
          }
          ind += indicesCount;

          // Bounding Box
          // Don't need it, THREE.js will generate its own
          reader.f32(); reader.f32(); reader.f32();
          reader.f32(); reader.f32(); reader.f32();


          var meta = {

          };

          var metaCount = reader.ui32();
          for(var i = 0; i < metaCount; i++) {
            var name = reader.str();
            console.log('META NAME: ', name);
            if(name == 'albedo') {
              var resultMeta = reader.str();
              console.log('META VAL: ', resultMeta);
              meta[name] = resultMeta;
            } else {
              var dataSize = reader.ui32();
              for(var j = 0; j < dataSize; j++) {
                reader.ui8();
              }
            }
          }

          buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

          if((this.features.Normal & features) > 0) {
    				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normals ), 3 ) );
          }
          if((this.features.UV & features) > 0) {
    				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
          }

          buffergeometry.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );


          var createdMaterials = [];
          var mat = new THREE.MeshPhongMaterial();
          mat.name = "OPmaterial";
          mat.shading = THREE.SmoothShading;
          createdMaterials.push(mat);

          //var multiMaterial = new THREE.MultiMaterial( createdMaterials );
          var mesh = new THREE.Mesh( buffergeometry, createdMaterials[0] );
          mesh.name = "OPmesh";
          mesh.meta = meta;
    			container.add( mesh );

        }

        if(container.children.length == 1) {
          return container.children[0];
        }

    		return container;
  },

	parse: function ( data ) {
      console.log('Parse OPM');

      var reader = new BinaryReader(data);
      var version = reader.ui16();
      if(version == 1) {
        alert('Unsupported Version: ' + version);
        return;
      }

      if(version == 3) {
        return this.loadV3(data, reader);
      }

      // Else Version 2
  		var container = new THREE.Group();

      var meshCount = reader.ui32();
      var totalVertices = reader.ui32();
      var totalIndices = reader.ui32();


      for(var meshInd = 0; meshInd < meshCount; meshInd++) {


        var vertexMode = reader.ui16();
        if(vertexMode == 2) {
          alert('Vertex Mode Unsupported: ' + vertexMode);
          return;
        }

        var features = reader.ui32();
        var verticesCount = reader.ui32();
        var indicesCount = reader.ui32();


        var buffergeometry = new THREE.BufferGeometry();

        var stride = 0;
        if((this.features.Position & features) > 0) {
          stride += 3;
        }
        if((this.features.Normal & features) > 0) {
          stride += 3;
        }
        if((this.features.Tangent & features) > 0) {
          stride += 3;
        }
        if((this.features.BiTangent & features) > 0) {
          stride += 3;
        }
        if((this.features.UV & features) > 0) {
          stride += 2;
        }
        if((this.features.Color & features) > 0) {
          stride += 3;
        }
        if((this.features.Skinning & features) > 0) {
          stride += 4;
          stride += 4;
          alert('Skinning Unsupported');
          return;
        }

        var positions = [];
        var normals = [];
        var uvs = [];
        var tangents = [];
        var bitangents = [];

        var vertices = [];
        for(var i = 0; i < verticesCount; i++) {
          if((this.features.Position & features) > 0) {
            positions.push(reader.f32());
            positions.push(reader.f32());
            positions.push(reader.f32());
          }
          if((this.features.Normal & features) > 0) {
            normals.push(reader.f32());
            normals.push(reader.f32());
            normals.push(reader.f32());
          }
          if((this.features.Tangent & features) > 0) {
            tangents.push(reader.f32());
            tangents.push(reader.f32());
            tangents.push(reader.f32());
          }
          if((this.features.BiTangent & features) > 0) {
            bitangents.push(reader.f32());
            bitangents.push(reader.f32());
            bitangents.push(reader.f32());
          }
          if((this.features.UV & features) > 0) {
            uvs.push(reader.f32());
            uvs.push(reader.f32());
          }
        }

        var indices = [];
        for(var i = 0; i < indicesCount; i++) {
          indices.push(reader.ui16());
        }

        var meta = {

        };

        var metaCount = reader.ui32();
        for(var i = 0; i < metaCount; i++) {
          var name = reader.str();
          console.log('META NAME: ', name);
          if(name == 'albedo') {
            var resultMeta = reader.str();
            console.log('META VAL: ', resultMeta);
            meta[name] = resultMeta;
          } else {
            var dataSize = reader.ui32();
            for(var j = 0; j < dataSize; j++) {
              reader.ui8();
            }
          }
        }

        buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

        if((this.features.Normal & features) > 0) {
  				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normals ), 3 ) );
        }
        if((this.features.UV & features) > 0) {
  				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
        }

        buffergeometry.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );


        var createdMaterials = [];
        var mat = new THREE.MeshPhongMaterial();
        mat.name = "OPmaterial";
        mat.shading = THREE.SmoothShading;
        createdMaterials.push(mat);

        //var multiMaterial = new THREE.MultiMaterial( createdMaterials );
        var mesh = new THREE.Mesh( buffergeometry, createdMaterials[0] );
        mesh.name = "OPmesh";
        mesh.meta = meta;
  			container.add( mesh );

      }

      if(container.children.length == 1) {
        return container.children[0];
      }

  		return container;


  }
};
