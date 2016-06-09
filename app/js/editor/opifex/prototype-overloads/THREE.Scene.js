THREE.Scene.prototype.toJSON = function() {
  var result = {
    children: []
  };
  for(ind in this.children) {
    var child = this.children[ind];
    result.children.push(child.toJSON());
  }
  return result;
};
