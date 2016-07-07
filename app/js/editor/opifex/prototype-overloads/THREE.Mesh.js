var Mesh_clone_default = THREE.Mesh.prototype.clone;

THREE.Mesh.prototype.clone = function( ) {
  console.log('Overriding clone');
  var result = Mesh_clone_default.call(this);
  return result;
}


var Mesh_copy_default = THREE.Mesh.prototype.copy;

THREE.Mesh.prototype.copy = function( source ) {
  console.log('Overriding copy');
  var result = Mesh_copy_default.call(this, source);

  result.gameType = source.gameType;

  return result;
}
