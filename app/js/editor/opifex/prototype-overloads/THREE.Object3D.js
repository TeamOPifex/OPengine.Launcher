var Object3D_toJSON = THREE.Object3D.prototype.toJSON;

THREE.Object3D.prototype.toJSON = function(meta) {
  var result = Object3D_toJSON.apply(this, meta);
  console.log('Post Process OBJECT 3D');
  result.object.gameType = this.gameType;
  return result;
}

// var Object3D_clone_default = THREE.Object3D.prototype.clone;
//
// THREE.Object3D.prototype.clone = function( recursive ) {
//   console.log('Overriding clone');
//   Object3D_clone_default(recursive);
// }
