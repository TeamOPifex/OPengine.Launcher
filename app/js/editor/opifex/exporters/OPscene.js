var OPIFEX = OPIFEX || {};

function OPsceneExporter(editor, fileOutput, cb) {

    var result = {
     	models: []
    };

    function ProcessChildren(children, cb) {
        for(var i = 0; i < children.length; i++) {
        	var m = children[i];
        	if(m.type == "Mesh" && (m.userData.gameType || 'Static') == 'Static') {
        		var obj = {
        			name: m.name,
        			type: m.userData.gameType || 'Static',
        			position: [ m.position.x, m.position.y, m.position.z ],
        			scale: [ m.scale.x, m.scale.y, m.scale.z ],
        			rotation: [ m.rotation.x, m.rotation.y, m.rotation.z ],
        			meta: m.userData,
        			collisions: []
        		};

        		for(var j = 0; j < m.children.length; j++) {
        			var child = m.children[j];
        			if(child.userData.gameType == 'Bounding Box') {
        				obj.collisions.push({
        					position: [ child.position.x, child.position.y, child.position.z ],
        					scale: [ child.scale.x, child.scale.y, child.scale.z ],
        					rotation: [ child.rotation.x, child.rotation.y, child.rotation.z ],
        					meta: child.userData
        				});
        			}
        		}

                ProcessChildren(m.children);

        		result.models.push(obj);
        	} else if(m.type == "Mesh" && m.userData.gameType == 'Static Triangle') {
        		var obj = {
        			name: m.name,
        			type: 'Static Triangle',
        			position: [ m.position.x, m.position.y, m.position.z ],
        			scale: [ m.scale.x, m.scale.y, m.scale.z ],
        			rotation: [ m.rotation.x, m.rotation.y, m.rotation.z ],
        			meta: m.userData,
        			collisions: []
        		};

        		result.models.push(obj);

                ProcessChildren(m.children);
        	}
        }

        if(cb) {
            cb();
        }
    }

    var me = this;
    ProcessChildren(editor.scene.children, function() {

        // Everything has been gathered together at this point
        // Now everything just has to be written out

        me.output = new ArrayBuffer();

        // Write out the binary data to the output
        // .opscene file format

        fileOutput
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
    })
}

OPsceneExporter.prototype = {
    output: null
};

OPIFEX.OPsceneExporter = OPsceneExporter;
