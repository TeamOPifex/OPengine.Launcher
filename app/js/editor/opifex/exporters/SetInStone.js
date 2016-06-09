var OPIFEX = OPIFEX || {};

function SetInStoneExporter(editor) {

    var output = {
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

        		output.models.push(obj);
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

        		output.models.push(obj);

                ProcessChildren(m.children);
        	}
        }

        if(cb) {
            cb();
        }
    }

    var me = this;
    ProcessChildren(editor.scene.children, function() {

        try {
        	output = JSON.stringify( output, null, '\t' );
        	output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
        } catch ( e ) {
        	output = JSON.stringify( output );
        }

        output = 'module.exports = ' + output;

        me.output = output;
    })
}

SetInStoneExporter.prototype = {
    output: ''
};

OPIFEX.SetInStoneExporter = SetInStoneExporter;
