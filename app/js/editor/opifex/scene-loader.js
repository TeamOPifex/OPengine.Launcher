var OPIFEX = OPIFEX || {};
OPIFEX.Scene = {
  fromJSON: function(json) {
    var result = {
      name: 'Scene',
      userData: '',
      children: []
    };

    var loader = new THREE.ObjectLoader();

    for(ind in json.children) {
      var child = json.children[ind];
      result.children.push(loader.parse(child));
    }

    return result;
  }
}
