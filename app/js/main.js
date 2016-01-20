function OPSpriteWriter(stitch) {
	this.stitch = stitch;
}

function decodeFromBase64(input) {
  input = input.replace(/\s/g, '');
  return atob(input);
}

function utf8AbFromStr(str) {
    var strUtf8 = unescape(encodeURIComponent(str));
    var ab = new Uint8Array(strUtf8.length);
    for (var i = 0; i < strUtf8.length; i++) {
        ab[i] = strUtf8.charCodeAt(i);
    }
    return ab;
}

function dataURItoArray(dataURI) {
    'use strict'
    var byteString,
        mimestring

    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
        byteString = atob(dataURI.split(',')[1])
    } else {
        byteString = decodeURI(dataURI.split(',')[1])
    }

    mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var content = new Array();
    for (var i = 0; i < byteString.length; i++) {
        content[i] = byteString.charCodeAt(i)
    }

    return new Uint8Array(content);
}

function compare(a, b) {
  if (a.frame < b.frame)
     return -1;
  if (a.frame > b.frame)
     return 1;
  // a must be equal to b
  return 0;
}

OPSpriteWriter.prototype = {
	getSprites: function() {
		var spriteData = {
			sprites: [],
			spriteDict: {},
			totalFrames: 0
		};

		for(var i = 0; i < this.stitch.canvas.sprites.length; i++) {
			var sprite = this.stitch.canvas.sprites[i];

			var name = sprite.name;
			var frame = 0;
			var frameInd = name.indexOf('_');
			if(frameInd > -1) {
				// Part of an animation
				frameVal = name.substring(frameInd + 1);
				name = name.substring(0, frameInd);
				frame = parseInt(frameVal);
			}
			var OPsprite = spriteData.spriteDict[name];
			if(OPsprite === undefined) {
				OPsprite = {
					name: name,
					frames: []
				};
				spriteData.spriteDict[name] = OPsprite;
				spriteData.sprites.push(OPsprite);
			}

			OPsprite.frames.push({
				x: sprite.x,
				y: sprite.y,
				w: sprite.width,
				h: sprite.height,
				frame: frame
			});
			spriteData.totalFrames++;
		}


		for(var i = 0; i < spriteData.sprites.length; i++) {
			spriteData.sprites[i].frames.sort(compare);
		}


		return spriteData;
	},
	save: function() {

		this.stitch.generateSheets();
		var spriteData = this.getSprites();

		var allData = [];

		var dimensions = new Int32Array(4);

		var width = 1;
		var height = 1;

		while(width < this.stitch.canvas.dimensions.width) width *= 2;
		while(height < this.stitch.canvas.dimensions.height) height *= 2;


		console.log('Width', width, 'Height', height, 'OWidth', this.stitch.canvas.dimensions.width, 'OHeight', this.stitch.canvas.dimensions.height);
		dimensions[0] = width; // Width
		dimensions[1] = height; // Height
		dimensions[2] = spriteData.sprites.length; // Sprite Count
		dimensions[3] = spriteData.totalFrames; // Total Number of Frames
		allData.push(dimensions);

		for(var i = 0; i < spriteData.sprites.length; i++) {
			var nameCount = new Uint32Array(1);
			nameCount[0] = spriteData.sprites[i].name.length;
			allData.push(nameCount);

			var name = utf8AbFromStr(spriteData.sprites[i].name);
			allData.push(name);

			if(spriteData.sprites[i].frames.length > 0) {
				var flags = new Int32Array(2);
				flags[0] = 1; // Animation On
				flags[1] = spriteData.sprites[i].frames.length; // Number of Frames
				allData.push(flags);
			} else {
				var flags = new Int32Array(1);
				flags[0] = 0; // Animation Off
				allData.push(flags);
			}

			for(var j = 0; j < spriteData.sprites[i].frames.length; j++) {
				var spriteFrame = spriteData.sprites[i].frames[j];
				var frame = new Int32Array(4);
				frame[0] = spriteFrame.x;
				frame[1] = spriteFrame.y;
				frame[2] = spriteFrame.w;
				frame[3] = spriteFrame.h;
				console.log(spriteFrame);
				allData.push(frame);
			}

		}

		ResizeImage(this.stitch.spritesheet, this.stitch.canvas.dimensions.width, this.stitch.canvas.dimensions.height, width, height, function(dataURI) {
			var imgBuffer = dataURItoArray(dataURI);
			allData.push(imgBuffer);

			var blob = new Blob(allData);
			saveAs(blob, 'file');

			saveAs(new Blob([imgBuffer]), 'img');
		});
	}
};

function ResizeImage(url, sourceWidth, sourceHeight, width, height, callback) {
    var sourceImage = new Image();

    sourceImage.onload = function() {
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Scale and draw the source image to the canvas
        canvas.getContext("2d").drawImage(sourceImage, 0, 0, sourceWidth, sourceHeight);

        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL());
    }

    sourceImage.src = url;
}

function loadit() {
	if(!window.Stitches) {
		setTimeout(loadit, 1);
		return;
	}
	window.stitch = new window.Stitches($('.stitches-container'));
	var spriteWriter = new OPSpriteWriter(window.stitch);
	$('.stitches-toolbar a').remove();
	$('.stitches-about').remove();
	$('button[data-action="downloads"]').remove();
	$('button[data-action="about"]').remove();
	var save = $('<button href="javascript:void();" class="btn btn-small btn-info btn-primary">Save</button>');
	$($('.stitches-toolbar .btn-group')[0]).append(save);

	var otherButtons = $('<button data-action="open" class="btn btn-small btn-primary files" title="Open">                <i class="icon-folder-open icon-white"></i> <span class="hidden-phone">Open</span><input class="file" type="file" multiple="multiple">            </button>            <button data-action="settings" class="btn btn-small btn-primary" title="Set layout, style prefix, padding, etc.">                <i class="icon-cog icon-white"></i> <span class="hidden-phone">Settings</span>            </button>            <button data-action="clear" class="btn btn-small btn-primary disabled" title="Clear sprites from the canvas">                <i class="icon-remove icon-white"></i> <span class="hidden-phone">Clear</span>            </button>');
	$('.stitches-toolbar button').addClass('btn-primary');
	//$('.stitches-toolbar').append(save);
	$('#header-menu').append($('.stitches-toolbar'));
	//$('#header-menu').append(save);
	save.click(function() {
		spriteWriter.save();
	});
}


function BlobWriter() {
	this.data = [];
}

BlobWriter.prototype = {
	toArray: function(v) {
		var data = v;
		if(!Array.isArray(data)) {
			data = [ data ];
		}
		return data;
	},
	push: function(v, datatype) {
		var data = this.toArray(v);
		var array = new datatype(data.length);
		for(var i = 0; i < data.length; i++) {
			array[i] = data[i];
		}
		this.data.push(array);
	},
	ui8: function(v) {
		this.push(v, Uint8Array);
	},
	ui16: function(v) {
		this.push(v, Uint16Array);
	},
	ui32: function(v) {
		this.push(v, Uint32Array);
	},
	i8: function(v) {
		this.push(v, Int8Array);
	},
	i16: function(v) {
		this.push(v, Int16Array);
	},
	i32: function(v) {
		this.push(v, Int32Array);
	},
	bytes: function(v) {
		this.data.push(v);
	},
	string: function(str) {
	    var strUtf8 = unescape(encodeURIComponent(str));
		this.ui32(strUtf8.length);
		var ab = new Uint8Array(strUtf8.length);
	    for (var i = 0; i < strUtf8.length; i++) {
	        ab[i] = strUtf8.charCodeAt(i);
	    }
		this.data.push(ab);
	},
	save: function(name) {
		var blob = new Blob(this.data);
		saveAs(blob, name || 'file');
	}
};
