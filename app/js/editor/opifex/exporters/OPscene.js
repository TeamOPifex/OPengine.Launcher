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
                    type: 'MESH',
                    position: [ m.position.x, m.position.y, m.position.z ],
                    scale: [ m.scale.x, m.scale.y, m.scale.z ],
                    rotation: [ m.rotation.x, m.rotation.y, m.rotation.z ],
                    children: [],
                    gameType: m.gameType
                };

                if(m.material && m.material.map) {
                    obj.texture = m.material.map.sourceFile
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
                var obj = {
                    name: m.name,
                    type: 'GROUP',
                    position: [ m.position.x, m.position.y, m.position.z ],
                    scale: [ m.scale.x, m.scale.y, m.scale.z ],
                    rotation: [ m.rotation.x, m.rotation.y, m.rotation.z ],
                    children: [],
                    gameType: m.gameType
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
