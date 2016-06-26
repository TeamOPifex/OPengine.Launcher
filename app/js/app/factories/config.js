angular.module('engineApp').factory("config",[ 'marketplace', 'VisualStudio', function(marketplace, VisualStudio) {
	var fs = require('fs');

	var configFactory = {
		// Get the configuration for the OPengine Launcher
		getLauncher: function() {
		    var configFilePath = global.root + '/opifex.json';
				if(!fs.existsSync(configFilePath)) {
						return {
							engines: [],
							projects: []
						};
				}
		    var content = fs.readFileSync(configFilePath);
			return JSON.parse(content);
		},
		// Save the configuration for the OPengine Launcher
		saveLauncher: function(config) {
		    var configFilePath = global.root + '/opifex.json';
		    fs.writeFileSync(configFilePath, JSON.stringify(config));
		},

		// Get the configuration for a project
		getProject: function(projectPath) {
		    var configFilePath = projectPath + '/opifex.json';
				var baseConfig = configFactory.defaultConfig();
				if(!fs.existsSync(configFilePath)) {
					return baseConfig;
				}
		    var content = fs.readFileSync(configFilePath);
				var config = JSON.parse(content);
				return configFactory.mergeConfig(baseConfig, config);
		},
		// Save the configuration for a project
		saveProject: function(projectPath, config) {
		    var configFilePath = projectPath + '/opifex.json';
				var result = this.defaultConfig();
				this.mergeConfig(result, config);
		    fs.writeFileSync(configFilePath, JSON.stringify(result));
		},

		// Get the configuration for the current OPengine version
		getEngine: function(projectPath) {
		    var configFilePath = projectPath + '/opifex.json';
				var baseConfig = configFactory.defaultConfig();
				baseConfig.tools = [
						{ name: 'FBXtoOPM', id: 'OPIFEX_TOOLS_FBXTOOPM', value: false },
						{ name: 'Font Maker', id: 'OPIFEX_TOOLS_FONTMAKER', value: false },
						{ name: 'Project Builder', id: 'OPIFEX_TOOLS_PROJECTBUILDER', value: false },
						{ name: 'Assimp Exporter', id: 'OPIFEX_TOOLS_ASSIMPEXPORTER', value: false }
				];
				if(!fs.existsSync(configFilePath)) {
						return baseConfig;
				}
			  var content = fs.readFileSync(configFilePath);
				var config = JSON.parse(content);
				return configFactory.mergeConfig(baseConfig, config);
		},
		// Save the configuration for the current OPengine version
		saveEngine: function(projectPath, config, external) {
		    var configFilePath = global.root + '/repos/OPengine/' + projectPath + '/opifex.json';
				var result = this.defaultConfig();
				this.mergeConfig(result, config);
		    fs.writeFileSync(configFilePath, JSON.stringify(result));
		},

		// Get the configuration that was last used when building the engine
		getBuildConfig: function(engine) {
        var buildDir = global.root + '/build/' + engine.id + '_build';
		    var configFilePath = buildDir + '/Binaries/opifex.json';
				var baseConfig = configFactory.defaultConfig();
				if(!fs.existsSync(configFilePath)) {
					return baseConfig;
				}
		    var content = fs.readFileSync(configFilePath);
				var config = JSON.parse(content);
				return configFactory.mergeConfig(baseConfig, config);
		},
		// Save the current configuration to the build folder for the OPengine
		saveBuildConfig: function(engine, config) {
        var buildDir = global.root + '/build/' + engine.id + '_build';
		    var configFilePath = buildDir + '/Binaries/opifex.json';
		    fs.writeFileSync(configFilePath, JSON.stringify(config));
		},

		getEngineOptions: function(projectPath) {
		    var configFilePath = projectPath + '/options.json';
				if(!fs.existsSync(configFilePath)) {
						var options = config.defaultOptions();
				    fs.writeFileSync(configFilePath, JSON.stringify(options));
						return options;
				}
		    var content = fs.readFileSync(configFilePath);
		    return JSON.parse(content);
		},

		getValue: function(config, key) {

			for(var i = 0; i < config.options.length; i++) {
				if(config.options[i].id == key) {
					return config.options[i].value;
				}
			}
			for(var i = 0; i < config.addons.length; i++) {
				if(config.addons[i].id == key) {
					return config.addons[i].value;
				}
			}
			for(var i = 0; i < config.optionSelectors.length; i++) {
				if(config.optionSelectors[i].id == key) {
					return config.optionSelectors[i].value.id;
				}
			}
			for(var i = 0; i < config.targets.length; i++) {
				if(config.targets[i].id == key) {
					return config.targets[i].value;
				}
			}
			for(var i = 0; i < config.targetSelectors.length; i++) {
				if(config.targetSelectors[i].id == key) {
					return config.targetSelectors[i].value.id;
				}
			}

			return null;
		},

		isEqual: function(one, two) {

			for(var i = 0; i < one.options.length; i++) {
				for(var j = 0; j < two.options.length; j++) {
					if(one.options[i].id == two.options[j].id) {
						if(one.options[i].value != two.options[j].value) return false;
						break;
					}
				}
			}

			for(var i = 0; i < one.addons.length; i++) {
				for(var j = 0; j < two.addons.length; j++) {
					if(one.addons[i].id == two.addons[j].id) {
						if(one.addons[i].value != two.addons[j].value) return false;
						break;
					}
				}
			}

			for(var i = 0; i < one.optionSelectors.length; i++) {
				for(var j = 0; j < two.optionSelectors.length; j++) {
					if(one.optionSelectors[i].id == two.optionSelectors[j].id) {
						if(one.optionSelectors[i].value.id != two.optionSelectors[j].value.id) return false;
						break;
					}
				}
			}

			for(var i = 0; i < one.targets.length; i++) {
				for(var j = 0; j < two.targets.length; j++) {
					if(one.targets[i].id == two.targets[j].id) {
						if(one.targets[i].value != two.targets[j].value) return false;
						break;
					}
				}
			}

			for(var i = 0; i < one.targetSelectors.length; i++) {
				for(var j = 0; j < two.targetSelectors.length; j++) {
					if(one.targetSelectors[i].id == two.targetSelectors[j].id) {
						if(one.targetSelectors[i].value.id != two.targetSelectors[j].value.id) return false;
						break;
					}
				}
			}
			return true;
		},

		mergeConfig: function(base, proj) {
			// Merge the project preferences onto the base configuration
			// (This way if we update the engine with new options, they'll still be available)
			// TODO: (garrett) this is kind of a sloppy way to set the settings, should clean this up.
			if(!proj.options) proj.options = [];
			if(!proj.optionSelectors) proj.optionSelectors = [];
			if(!proj.targets) proj.targets = [];
			if(!proj.targetSelectors) proj.targetSelectors = [];
			if(!proj.addons) proj.addons = [];

			base.engine = proj.engine;
			base.visualStudio = proj.visualStudio;
			base.launch = proj.launch;
			base.launchWindows = proj.launchWindows;
			base.launchOSX = proj.launchOSX;
			base.launchLinux = proj.launchLinux;
			base.solution = proj.solution;

			for(var i = 0; i < base.options.length; i++) {
				for(var j = 0; j < proj.options.length; j++) {
					if(base.options[i].id == proj.options[j].id) {
						base.options[i].value = proj.options[j].value;
						break;
					}
				}
			}

			for(var i = 0; i < base.addons.length; i++) {
				for(var j = 0; j < proj.addons.length; j++) {
					if(base.addons[i].id == proj.addons[j].id) {
						base.addons[i].value = proj.addons[j].value;
						break;
					}
				}
			}

			for(var i = 0; i < base.optionSelectors.length; i++) {
				for(var j = 0; j < proj.optionSelectors.length; j++) {
					if(base.optionSelectors[i].id == proj.optionSelectors[j].id) {
						base.optionSelectors[i].value = proj.optionSelectors[j].value;
						break;
					}
				}
			}

			for(var i = 0; i < base.targets.length; i++) {
				for(var j = 0; j < proj.targets.length; j++) {
					if(base.targets[i].id == proj.targets[j].id) {
						base.targets[i].value = proj.targets[j].value;
						break;
					}
				}
			}

			for(var i = 0; i < base.targetSelectors.length; i++) {
				for(var j = 0; j < proj.targetSelectors.length; j++) {
					if(base.targetSelectors[i].id == proj.targetSelectors[j].id) {
						base.targetSelectors[i].value = proj.targetSelectors[j].value;
						break;
					}
				}
			}

			return base;
		},

		defaultConfig: function() {
			var tmp = {
				engine: { version: null },
				visualStudio: VisualStudio[4],
				solution: null,
				launch: null,
				launchWindows: null,
				launchOSX: null,
				launchLinux: null,
				options: [],
				optionSelectors: [],
				targets: [],
				targetSelectors: [],
				addons: []
			};

			if(window.localStorage["msvc"]) {
				switch(window.localStorage["msvc"]) {
					case "14": {
						tmp.visualStudio = VisualStudio[5];
						break;
					}
					case "12": {
						tmp.visualStudio = VisualStudio[4];
						break;
					}
					case "11": {
						tmp.visualStudio = VisualStudio[3];
						break;
					}
					case "10": {
						tmp.visualStudio = VisualStudio[2];
						break;
					}
					case "7": {
						tmp.visualStudio = VisualStudio[1];
						break;
					}
					case "6": {
						tmp.visualStudio = VisualStudio[0];
						break;
					}
				}
			}

			var options = configFactory.defaultOptions();

			for(var i = 0; i < options.length; i++) {
				switch(options[i].type) {
					case 'option': {
						tmp.options.push({
							id: options[i].id,
							name: options[i].name,
							value: options[i].value
						});
						break;
					}
					case 'addon': {
						tmp.addons.push({
							id: options[i].id,
							name: options[i].name,
							value: options[i].value
						});
						break;
					}
					case 'optionSelector': {
						// get initial value
						var initial = options[i].options[0];
						for(var j = 0; j < options[i].options.length; j++) {
							if(options[i].options[j].initial) {
								initial = options[i].options[j];
								break;
							}
						}
						tmp.optionSelectors.push({
							id: options[i].id,
							name: options[i].name,
							value: initial,
							options: options[i].options
						});
						break;
					}
					case 'target': {
						tmp.targets.push({
							id: options[i].id,
							name: options[i].name,
							value: options[i].value
						});
						break;
					}
					case 'targetSelector': {
						if(options[i].id == 'OPIFEX_OS') {
							var os = require('os');
							switch(os.type()) {
								case 'Darwin': {
									tmp.targetSelectors.push({
										id: options[i].id,
										name: options[i].name,
										value: options[i].options[0 + (os.arch() == 'x64')],
										options: options[i].options
									});
									break;
								}
								case 'Windows_NT': {
									tmp.targetSelectors.push({
										id: options[i].id,
										name: options[i].name,
										value: options[i].options[2 + (os.arch() == 'x64')],
										options: options[i].options
									});
									break;
								}
								default: {
									tmp.targetSelectors.push({
										id: options[i].id,
										name: options[i].name,
										value: options[i].options[4 + (os.arch() == 'x64')],
										options: options[i].options
									});
									break;
								}
							}
						} else {
							tmp.targetSelectors.push({
								id: options[i].id,
								name: options[i].name,
								value: options[i].options[0],
								options: options[i].options
							});
						}
						break;
					}
				}
			}

			//console.log('DEFAULT CONFIG', tmp);

			return tmp;
		},

		defaultOptions: function() {
			var options = [
					{ name: 'Audio', id: 'OPIFEX_OPTION_AUDIO', type: 'option', value: false },
					{ name: 'Myo', id: 'OPIFEX_OPTION_MYO', type: 'option', value: false },
					{ name: 'V8', id: 'OPIFEX_OPTION_V8', type: 'option', value: false },
					{ name: 'FMOD', id: 'OPIFEX_OPTION_FMOD', type: 'option', value: false },
					{ name: 'PhysX', id: 'OPIFEX_OPTION_PHYSX', type: 'option', value: false },
					{ name: 'NodeJS', id: 'OPIFEX_OPTION_NODEJS', type: 'option', value: false },
					{ name: 'Oculus', id: 'OPIFEX_OPTION_OCULUS', type: 'option', value: false },
					{ name: 'Spine', id: 'OPIFEX_OPTION_SPINE', type: 'option', value: false },
					{ name: 'ASIO', id: 'OPIFEX_OPTION_ASIO', type: 'option', value: false },
					{ name: 'RakNet', id: 'OPIFEX_OPTION_RAKNET', type: 'option', value: false },
					{ name: 'Emscripten', id: 'OPIFEX_OPTION_EMSCRIPTEN', type: 'option', value: false },

					{ name: 'NodeJS Version', id: 'OPIFEX_NODE_VERSION', type: 'optionSelector',
				        options: [
							{ name: 'NodeJS 0_10', id: '0_10' },
				            { name: 'NodeJS 0_12', id: '0_12' }
				        ]
					},

					{ name: 'Renderer', id: 'RENDER_TARGET', type: 'optionSelector',
				        options: [
							{ name: 'OpenGL 2.0', id: 'OPENGL_2_0' },
				            { name: 'OpenGL 3.3', id: 'OPENGL_3_3', initial: true },
							            { name: 'OpenGL ES 2.0', id: 'OPENGL_ES_2' },
										            { name: 'DirectX 11', id: 'DIRECTX_11' }
				        ]
					},

					{ name: 'Release Mode', id: 'OPIFEX_OPTION_RELEASE', type: 'target', value: false },
					{ name: 'Shared Library', id: 'OPIFEX_OPTION_SHARED', type: 'target', value: false }
				];

				console.log(marketplace);
				for(var i = 0; i < marketplace.length; i++) {
					options.push({name: marketplace[i].name, id: marketplace[i].id, type: 'addon', value: false})
				}


				return options;
		},

		getDefines: function(config) {
			var result = [];

            for(var i = 0; i < config.options.length; i++) {
                if(config.options[i].value) {
					result.push(config.options[i].id);
                }
            }

            for(var i = 0; i < config.targets.length; i++) {
                if(config.targets[i].value) {
					result.push(config.targets[i].id);
                }
            }

			return result;
		}
	};
    return configFactory;
}]);
