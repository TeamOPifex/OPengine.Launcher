var OPIFEX = OPIFEX || {};

function OPsceneExporter(editor) {
    this.result = {
     	models: []
    };

    this.ProcessChildren(null, editor.scene.children, function() { });
}

OPsceneExporter.prototype = {
    result: {
      models: []
    },

    ProcessChildren: function(parent, children, cb) {
        for(var i = 0; i < children.length; i++) {
            var m = children[i];
            if(m.type == "Mesh") {
                var obj = {
                    name: m.name,
                    opm: m.opm,
                    type: 'MESH',
                    position: [ m.position.x, m.position.y, m.position.z ],
                    scale: [ m.scale.x, m.scale.y, m.scale.z ],
                    rotation: [ m.rotation.x, m.rotation.y, m.rotation.z ],
                    children: [],
                    gameType: m.gameType
                };

                m.geometry.computeBoundingBox();
                obj.boundingBox = {
                  min: [ m.geometry.boundingBox.min.x, m.geometry.boundingBox.min.y, m.geometry.boundingBox.min.z ],
                  max: [ m.geometry.boundingBox.max.x, m.geometry.boundingBox.max.y, m.geometry.boundingBox.max.z ]
                };

                if(m.userData) {
                  obj.userData = m.userData;
                }

                if(m.material) {
                  obj.material = {
                    transparent: m.material.transparent,
                    opacity: m.material.opacity,
                    wireframe: m.material.wireframe
                  };

                  if(m.material.color) {
                    obj.material.color = [ m.material.color.r, m.material.color.g, m.material.color.b ];
                  }

                  if(m.material.map) {
                      obj.material.texture = m.material.map.sourceFile
                  }
                }

                var scripts = editor.scripts[m.uuid];
                if(scripts) {
                  obj.scripts = {};
                  for(var j = 0; j < scripts.length; j++) {
                    obj.scripts[scripts[j].name] = scripts[j].source;
                  }
                }

                if(m.gameType == 'Bounding Box') {
                    obj.type = 'PHYSICS';
                }

                if(parent) {
                    parent.children.push(obj);
                } else {
                  this.result.models.push(obj);
                }
            } else if(m.type == "Group") {
              var bounds = this.calculateBounds(m);
                var obj = {
                    name: m.name,
                    opm: m.opm,
                    type: 'GROUP',
                    position: [ m.position.x, m.position.y, m.position.z ],
                    scale: [ m.scale.x, m.scale.y, m.scale.z ],
                    rotation: [ m.rotation.x, m.rotation.y, m.rotation.z ],
                    children: [],
                    gameType: m.gameType,
                    boundingBox: bounds
                };

                if(parent) {
                    parent.children.push(obj);
                } else {
                  this.result.models.push(obj);
                }
            }

            this.ProcessChildren(obj, m.children);
        }

        if(cb) {
            cb();
        }
    },

    calculateBounds: function(node, bounds) {
      if(!bounds) {
        bounds = {
          min: [ 0, 0, 0 ],
          max: [ 0, 0, 0 ]
        };
      }

      console.log(node);

      for(var i = 0; i < node.children.length; i++) {
        if(node.children[i].type != 'Mesh') continue;

        node.children[i].geometry.computeBoundingBox();
        var mBB = node.children[i].geometry.boundingBox;

        if(mBB.min.x < bounds.min[0]) bounds.min[0] = mBB.min.x;
        if(mBB.min.y < bounds.min[1]) bounds.min[1] = mBB.min.y;
        if(mBB.min.z < bounds.min[2]) bounds.min[2] = mBB.min.z;
        if(mBB.max.x > bounds.max[0]) bounds.max[0] = mBB.max.x;
        if(mBB.max.y > bounds.max[1]) bounds.max[1] = mBB.max.y;
        if(mBB.max.z > bounds.max[2]) bounds.max[2] = mBB.max.z;
      }

      return bounds;
    },

    outputJSON: function(fileOutput, cb) {
      var fs = require('fs');
      var wstream = fs.createWriteStream(fileOutput);
      wstream.on('finish', function () {
          if(cb) cb();
      });
      var me = this;
      wstream.on('open', function() {
          var output = '';
          try {
              output = JSON.stringify( me.result, null, '\t' );
              output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
          } catch ( e ) {
              output = JSON.stringify( me.result );
          }

          //output = 'module.exports = ' + output;
          wstream.write(output);
          wstream.end();
      });
    },

    outputBinary: function(fileOutput) {
      // Everything has been gathered together at this point
      // Now everything just has to be written out

      // Write out the binary data to the output
      // .opscene file format
      // version: ui8
      // children count: ui32
      //    name: string
      //    type: string
      //    position: float3
      //    scale: float3
      //    rotation: float3
      //    children: [ models ]
      //
      //    type:MESH
      //      gameType: string
      //      model: string
      //      texture: string
      //
      //    type:PHYSICS
      //      gameType: string

      var fs = require('fs');
      var wstream = fs.createWriteStream(fileOutput);
      wstream.on('finish', function () {
          if(cb) cb();
      });
      wstream.on('open', function() {

          var arr = new ArrayBuffer(4);
          var version = new Uint8Array(arr);
          version[0] = 2;

          var blob = new Blob(arr);
          var resultArr = new ArrayBuffer(blob, blob.length);
          wstream.write(new Buffer(resultArr));
          wstream.end();
      });
    }
};

OPIFEX.OPsceneExporter = OPsceneExporter;
