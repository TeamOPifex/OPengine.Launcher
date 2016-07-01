angular.module('launcherFactories').factory("engineReleases",[ 'user', function(user){
	return {
		all: function(cb) {
			//console.log('GET RELEASES');
			var gitOPengine = user.github.getRepo('TeamOPifex', 'OPengine');

			gitOPengine.listTags(function(err, tags) {
				var releases = [];
		  		for(var i = 0; i < tags.length; i++) {
		  			releases.push({
		  				name: tags[i].name,
		  				sha: tags[i].commit.sha
		  			});
		  		}
				//console.log('TAGS', tags);
				cb && cb(null, releases);
		  	});
		}
	}
}]);
