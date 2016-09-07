angular.module('launcherFactories').factory("CodeEditor",[function(){

    var fs = require('fs'), path = require('path');
	var remote = require('electron').remote;
	var Menu = remote.Menu;
	var MenuItem = remote.MenuItem;

	// Helper Functions

	function walk(currentDirPath, subDir, callback) {
	    fs.readdirSync(currentDirPath).forEach(function(name) {
	        var filePath = path.join(currentDirPath, name);
	        var stat = fs.statSync(filePath);
	        callback(filePath, name, stat);
	        if(subDir && stat.isDirectory()) {
	            walk(filePath, subDir, callback);
	        }
	    });
	}

    function walkAsync(currentDirPath, subDir, callback) {
        fs.readdir(currentDirPath, function(err, files) {
            files.forEach(function(name) {
                if(name.length > 0 && name[0] == '.') return;

                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                callback(filePath, name, stat);
                if(subDir && stat.isDirectory()) {
                    walkAsync(filePath, subDir, callback);
                }
            });
        })
    }

	function extension(name) {
	    if(!name) return '';
	    if(name.length == 0) return '';

	    var dots = name.split('.');
	    if(dots.length == 1) return '';
	    else return dots[dots.length - 1];
	}


	function removeExtension(name) {
	    if(!name) return name;
	    if(name.length == 0) return name;

	    var dots = name.split('.');
	    if(dots.length == 1) return name;
        dots.splice(dots.length - 1, 1);
	    return dots.join('.');
	}


	// The Code Editor itself

	function CodeEditor(el, options) {
		this.el = el || "editor";
		this.editor = ace.edit(this.el);
		this.editor.setTheme("ace/theme/solarized_dark");
		var self = this;
        var label = options.label || 'OPengine';
        this.label = label;
		this.tree = [
			{
				type:'folder',
				fullPath: options.path,
				label: label,
				active: true,
				subDir: [],
				parent: null,
				changes: false,
                id: 'node_' + (this.idCount++)
			}
		];
        this.open = [];
        this.pinned = [];
        if(options.pinned) {
            this.pinned = options.pinned;
        }
		this._walkNode(this.tree[0]);
		window.codeeditor = this;

        var self = this;
        walkAsync(options.path, true, function(path, name, stat) {
            if(name.length > 0 && name[0] == '.') return;

            var noExtName = removeExtension(name);
            // console.log(name, noExtName);
            if(stat.isFile()) {
                if(!self.all[noExtName]) {
                    self.all[noExtName] = {
                        files: [ path ]
                    };
                } else {
                    self.all[noExtName].files.push(path);
                }
            }
        });

        $("#MySplitter").splitter({
            sizeLeft: 200
        });

        // if(window.localStorage['open_' + this.label]) {
        //     var openFiles = JSON.parse(window.localStorage['open_' + this.label]);
        //     for(var i = 0; i < openFiles.length; i++) {
        //         this.OpenFile(openFiles[i]);
        //     }
        // }
	}

	CodeEditor.prototype = {
		editor: null,
        label: null,
		tree: null,
		lastNode: null,
		onNewFile: null,
		onNewFolder: null,
		onDeleteFile: null,
		onChanged: null,
		onSaved: null,
		opened: false,
		open: [],
        pinned: [],
        all: {},
        idCount: 0,

        _setOpen: function() {
            var open = [];
            for(var i = 0; i < this.open.length; i++) {
                open.push(this.open[i].fullPath);
            }
            window.localStorage['open_' + this.label] = JSON.stringify(open);
        },

		Open: function(node, openTab) {
            if(node.type == 'folder') {
                return this._openFolder(node);
            }
			return this._openFile(node, openTab);
		},

        OpenFile: function(fileToCheck) {

            fileToCheck = fileToCheck.split('\\').join('/');
            var treePath = this.tree[0].fullPath;
            treePath = treePath.split('\\').join('/');
            var fp = fileToCheck.split(treePath);
            var nodes = fp[1].split('/');

            // Now work through each node until everything is loaded

            var node = this.tree[0];

            for(var j = 0; j < nodes.length; j++) {
                if(nodes[j] == '') continue;

                for(var k = 0; k < node.subDir.length; k++) {
                    if(node.subDir[k].label == nodes[j]) {
                        if(node.type == 'file' || !node.subDir[k].open) {
                            this.Open(node.subDir[k], true);
                        }
                        node = node.subDir[k];
                        if(node.type == 'folder') {
                            node.open = true;
                        }
                        break;
                    }
                }

            }
        },

		Save: function() {
            var currNode = this._currentNode();
			fs.writeFile(currNode.fullPath, this.editor.getValue(), 'utf8');
			currNode.changes = false;
			this.onSaved && this.onSaved();
		},

		Menu: function(node) {
			var currentWindow = remote.getCurrentWindow();

			var menu = new Menu();

			var self = this;
			if(node.type == 'folder') {
				menu.append(new MenuItem({ label: 'New File...', click: function() { self.onNewFile && self.onNewFile(node); } }));
				menu.append(new MenuItem({ label: 'New Folder...', click: function() { self.onNewFolder && self.onNewFolder(node); } }));
			} else {
				menu.append(new MenuItem({ label: 'Delete', click: function() { self.onDeleteFile && self.onDeleteFile(node); } }));
			}

			menu.popup(currentWindow);
		},

		AddToNode: function(node, name, isFolder) {
			var newNode = {
				type: 'file',
				fullPath: node.fullPath + '/' + name,
				label: name,
                subDir: [],
                parent: node
			};
      if(isFolder) {
          newNode.type = 'folder';
      } else {
          this.open.push(newNode);
          this._setOpen();
      }
			node.subDir.push(newNode);
      this.Open(newNode);

			node.subDir.sort(this._sortFoldersAndFiles);

			return newNode;
		},

		RemoveNode: function(node, name) {
            this.Close(node);
			for(var i = 0; i < node.parent.subDir.length; i++) {
				if(node.parent.subDir[i] == node) {
					node.parent.subDir.splice(i, 1);
					break;
				}
			}
		},

		Close: function(node) {
			for(var i = 0; i < this.open.length; i++) {
				if(this.open[i] == node) {
					node.changes = false;

					this.open.splice(i, 1);

					if(node.active) {
						if(this.open.length > 0) {
							if(i < this.open.length) {
								this.Open(this.open[i]);
							} else if(i > 0) {
								this.Open(this.open[i - 1]);
							} else {
								this.Open(this.open[0]);
							}
						} else {
							var self = this;
							this.lastNode.active = false;
							this.lastNode = null;
							self.editor.setValue('');
						}
					}

                    this._setOpen();

					return;
				}
			}
		},

        NextTab: function() {
            var i = 0;
            for(i = 0; i < this.open.length; i++) {
                if(this.open[i].active) {
                    break;
                }
            }
            if(this.open.length > 0) {
                this.open[i].active = false;
                this.Open(this.open[(i + 1) % this.open.length]);
            }
        },

        PrevTab: function() {
            var i = 0;
            for(i = 0; i < this.open.length; i++) {
                if(this.open[i].active) {
                    break;
                }
            }
            if(this.open.length > 0) {
                this.open[i].active = false;
                var pos = i - 1;
                if(pos < 0) {
                    pos = this.open.length - 1;
                }
                this.Open(this.open[pos]);
            }
        },

        ToggleFile: function() {
			if(!this.lastNode) {
                return;
            }

            var currNode = this._currentNode();

            var noExtName = removeExtension(currNode.label);
            if(this.all[noExtName]) {
                var i = 0;
                for(i = 0; i < this.all[noExtName].files.length; i++) {
                    if(this.all[noExtName].files[i] == currNode.fullPath) {
                        break;
                    }
                }
                // Round robin file opening
                var pos = (i + 1) % this.all[noExtName].files.length;

                this.OpenFile(this.all[noExtName].files[pos]);
                //console.log('Next file is: ', this.all[noExtName].files[i]);

                node.active = true;
                this.lastNode = node;

				var found = false;
				for(var i = 0; i < this.open.length; i++) {
					if(this.open[i] == this.lastNode) {
						found = true;
						break;
					}
				}
				if(!found) {
					this.open.push(this.lastNode);
                    this._setOpen();
				}

                return;
            }


        },

        Destroy: function() {
            if(this.editor) {
                this.editor.destroy();
            }
        },

        OpenWebsite: function(file) {
            var elId = 'iframe-' + file.label.split(' ').join('-');
            var editorEl = $('#editor').parent();
            this.lastNode = null;
            file.active = true;
            for(var i = 0; i < this.open.length; i++) {
                this.open[i].active = false;
            }
            if(file.open) {
                if(this.editor) {
                    this.editor.destroy();
                }
                this.editor = null;
                $('#editor').hide();
                $('.file-url').hide();
                $('#' + elId).show();
                return;
            }

            if(this.editor) {
                this.editor.destroy();
            }
            $('#editor').hide();
            var iframeEl = $('<iframe class="file-url" id="' + elId + '" src="' + file.path + '" style="width: 100%; height: 100%;border: 0px;" />');
            editorEl.prepend(iframeEl);

            iframeEl.load( function() {
                iframeEl.contents().find("head")
                  .append($("<style type='text/css'>  .h-header.h-row { display: none !important; } .h-body.h-row { top: 0px !important; bottom: 0px !important; } .h-footer.h-row { display: none !important; }  </style>"));
            });

            file.open = true;
        },

        _currentNode: function() {
            for(var i = 0; i < this.open.length; i++) {
                if(this.open[i].active) {
                    return this.open[i];
                }
            }
            return this.lastNode;
        },

		_change: function() {
			if(this.lastNode) {
				this.lastNode.changes = true;

				var found = false;
				for(var i = 0; i < this.open.length; i++) {
					if(this.open[i] == this.lastNode) {
						found = true;
						break;
					}
				}
				if(!found) {
					this.open.push(this.lastNode);
                    this._setOpen();
				}

			}
			this.onChanged && this.onChanged();
		},

		_walkNode: function(node) {
            var self = this;
			walk(node.fullPath, false, function(filePath, name, stat) {
				if(name.length > 0 && name[0] == '.') return;
				if(stat.isDirectory()) {
					node.subDir.push({
						type: 'folder',
						fullPath: filePath,
						label: name,
						subDir: [],
						parent: node,
						changes: false,
                        id: 'node_' + (self.idCount++)
					});
				} else {
					node.subDir.push({
						type: 'file',
						fullPath: filePath,
						label: name,
						parent: node,
						changes: false,
                        id: 'node_' + (self.idCount++)
					});
				}
			});

			node.subDir.sort(this._sortFoldersAndFiles);
		},

		_openFolder: function(node) {
			node.subDir = [];
			this._walkNode(node);
			return 0;
		},

		_sortFoldersAndFiles: function(a,b) {
			if(a.type == 'folder' && b.type == 'folder') return a.label.localeCompare(b.label);
			if(a.type == 'file' && b.type == 'file') return a.label.localeCompare(b.label);
			if(a.type == 'folder') return -1;
			return 1;
		},

		_openFile: function(node, openTab) {

            var self = this;
            switch(extension(node.label)) {
                case 'psd':
                    // if(this.lastNode == node) {
                        var PSD = require('psd');

                        //$('#imagePreview').attr('src', 'content/imgs/loading.gif');
                        setTimeout(function() {
                        PSD.open(node.fullPath).then(function (psd) {
                            var saveTo = global.root + '/temp/output.png';
                            return psd.image.saveAsPng(saveTo);
                        }).then(function () {
                            var img = $('#imagePreview');
                            var imgSource = 'file://' + global.root + '/temp/output.png?id=' + (self.idCount++);
                            img.attr('src', imgSource);
                            //$('#showFileModal').modal();
                        });

                      }, 0);
                    // } else {
                        if(this.lastNode) {
                            this.lastNode.active = false;
                        }
                        this.lastNode = node;
                        node.active = true;
                    // }

                    return 2;
                case 'png':
                case 'jpg':
                    //
                    // if(this.lastNode == node) {
                        var img = $('#imagePreview');
                        var imgSource = 'file://' + node.fullPath + '?id=' + (self.idCount++);
                        img.attr('src', imgSource);
                      //  $('#showFileModal').modal();
                    // } else {
                        if(this.lastNode) {
                            this.lastNode.active = false;
                        }
                        this.lastNode = node;
                        node.active = true;
                    // }
                    return 2;
                case 'opf':
                case 'opm':
                case 'anim':
                case 'opss':
                case 'dds':
                case 'exe':
                  return 3;
                case 'ogg': {
                    $('#audioPreview').html('');
                    var audSource = 'file://' + node.fullPath + '?id=' + (self.idCount++);
                    $('#audioPreview').append($('<audio controls><source src="' + audSource + '" type="audio/ogg"></audio>'));
                    return 4;
                }
                case 'wav': {
                  $('#audioPreview').html('');
                  var audSource = 'file://' + node.fullPath + '?id=' + (self.idCount++);
                  $('#audioPreview').append($('<audio controls><source src="' + audSource + '" type="audio/wav"></audio>'));
                  return 4;
                }
                case 'mp3':
                {
                    $('#audioPreview').html('');
                    var audSource = 'file://' + node.fullPath + '?id=' + (self.idCount++);
                    $('#audioPreview').append($('<audio controls><source src="' + audSource + '" type="audio/mpeg"></audio>'));
                    return 4;
                }
                default:
                    break;
            }

            $('.file-url').hide();
            for(var i = 0; i < this.pinned.length; i++) {
                this.pinned[i].active = false;
            }

			if(this.lastNode == node) {
				var found = false;
				for(var i = 0; i < this.open.length; i++) {
					if(this.open[i] == this.lastNode) {
						found = true;
						break;
					}
				}
				if(!found) {
					this.open.push(this.lastNode);
                    this._setOpen();
				}
				return 1;
			} else if(openTab) {
                this.open.push(node);
                this._setOpen();
            }

			if(this.lastNode) {
				this.lastNode.active = false;
				if(this.lastNode.changes) {
					this.lastNode.fileData = this.editor.getValue();
                } else {
					this.lastNode.changes = null;
				}
                this.lastNode.position = this.editor.getCursorPositionScreen();
			}

			this.lastNode = node;
			node.active = true;

			// Only reload if there aren't any changes
			if(!node.changes) {
				node.fileData = require('fs').readFileSync(node.fullPath, 'utf8');
			}

			if(this.editor) {
				this.editor.destroy();
			}
			this.editor = ace.edit(this.el);
			this.editor.setTheme("ace/theme/solarized_dark");
            $('#editor').show();

			this.editor.setValue(node.fileData);
			this.editor.blur();
			this.editor.focus();
            if(node.position) {
    			this.editor.gotoLine(node.position.row + 1, node.position.column);
                var self = this;
                setTimeout(function() {
                    self.editor.scrollToLine(node.position.row + 1, true, false);
                }, 0)
            } else {
    			this.editor.scrollToLine(0,false, false);
    			this.editor.gotoLine(0, 0);
            }

			var self = this;
			this.editor.on('change', function() {
				self._change();
			});

			switch(extension(node.label)) {
				case 'c':
				case 'cpp':
				case 'h':
					this.editor.getSession().setMode("ace/mode/c_cpp");
					break;
				case 'js':
					this.editor.getSession().setMode("ace/mode/javascript");
					break;
				case 'frag':
                case 'vert':
					this.editor.getSession().setMode("ace/mode/glsl");
					break;
				default:
					this.editor.getSession().setMode("ace/mode/plain_text");
					break;
			}
      return 1;
		}
	};

	return CodeEditor;
}]);
