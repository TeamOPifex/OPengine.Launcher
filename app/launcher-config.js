import jetpack from 'fs-jetpack';

var LauncherConfig = {
  config: function() {
    var root = require('os').homedir() + '/.opengine';
    var appDir = jetpack.cwd(root);
    return appDir.read('launcher.json', 'json');
  },
  saveConfig: function(config) {
    var root = require('os').homedir() + '/.opengine';
    var appDir = jetpack.cwd(root);
    appDir.write('launcher.json', config);
  }
};

module.exports = LauncherConfig;

export default LauncherConfig;
