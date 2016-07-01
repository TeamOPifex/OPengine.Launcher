var mkdirp = require('mkdirp');
var nodePath = require('path');
angular.module('launcherFactories').factory("git", ['user', 'run', function(user, run){
    var opts = {
      remoteCallbacks: {
        credentials: function() {
          return nodegit.Cred.userpassPlaintextNew (user.token, "x-oauth-basic");
        },
        certificateCheck: function() {
          return 1;
        }
      }
    };

	var git = {
		cloneProject: function(repoOwner, repoName, name, cb) {
            git.clone('projects', repoOwner, repoName, name, cb);
        },
        cloneEngine: function(repoOwner, repoName, name, cb) {
            git.clone('OPengine', repoOwner, repoName, name, cb);
        },
        clone: function(root, repoOwner, repoName, name, cb) {
	        // var repoUrl = "https://" + user.token +
	        //   ":x-oauth-basic@github.com/" +
	        //   repoOwner + "/" +
	        //   repoName + ".git";

              var repoUrl = "https://github.com/" +
                repoOwner + "/" +
                repoName + ".git";

            var path = nodePath.resolve(global.root + "/repos/" + root + "/" + name);
            mkdirp(path, function(err) {
                if(err) return;

                var cmd = 'git';
                var args = [ 'clone', repoUrl, name, '--progress' ];

                run.command('git clone ' + repoUrl, cmd, args, nodePath.resolve(global.root + "/repos/" + root + "/"), cb)

		        });
        },

        setBranch: function(root, name, commit, cb) {
          var cmd = 'git';
          var args = [ 'fetch', 'origin', commit, '--progress' ];
          run.command('git fetch origin ' + commit, cmd, args, nodePath.resolve(global.root + "/repos/" + root + "/" + name), cb);
        },

        hasChangesToPull: function(path, cb) {
            //var path = nodePath.resolve(global.root + "/repos/" + root + "/");

            run.silent('Check for changes', 'git', ['fetch'], path, function() {
                run.silent('Check for changes', 'git', ['status', '-sb'], path, function(err, data) {
                    if(err || !data) {
                        cb && cb(false, 0);
                        return;
                    }
                    for(var i = 0; i < data.length; i++) {
                        var ind = data[i].indexOf('behind ');
                        if(ind > -1) {
                            var str = data[i] + '';
                            var behind = str.substr(ind);
                            var spaceInd = behind.indexOf(' ');
                            var bracketInd = behind.indexOf(']');
                            var numStr = behind.substr(spaceInd, bracketInd - spaceInd);

                            //console.log(behind);
                            var num = parseInt(numStr);
                            cb && cb(false, num);
                            return;
                        }
                    }
                    cb && cb(false, 0);
                });
            });
        },

        create: function(repoName, name, cb) {

        },

        getCommit: function(path, sha, cb) {
          this.pull(path, function(err) {
            if(err) {
              cb && cb(err);
              return;
            }
              run.command('Get Release', 'git', ['reset', sha], path, function(err, data) {
                  if(err) {
                      alert(err);
                  }
                  cb && cb(err);
              });
          });
        },

        branches: function(path, cb) {
            run.silent('Check for changes', 'git', ['branch', '-a'], path, function(err, data) {

                console.log('branches', err, data + ' ');
                var resp = data + '';

                var lines = resp.split('\n');

                // Remove all spaces
                for(var i = 0; i < lines.length; i++) {
                    lines[i] = lines[i].split(' ').join('');
                }
                // Remove empty entries
                // Remove symbolic links
                for(var i = 0; i < lines.length; i++) {
                    if(lines[i] == '' || lines[i].indexOf('->') > -1) {
                        lines.splice(i, 1);
                    }
                }

                var local = [];
                var remote = [];
                // Determine local vs remote
                for(var i = 0; i < lines.length; i++) {
                    var branch = {
                        active: false,
                        name: lines[i],
                        remote: false
                    };

                    if(lines[i][0] == '*') {
                        branch.active = true;
                        branch.name = lines[i].split('*').join('');
                    }

                    if(lines[i].indexOf('remotes/origin/') > -1) {
                        branch.remote = true;
                        branch.name = lines[i].split('remotes/origin/').join('');
                        remote.push(branch);
                    } else {
                        local.push(branch);
                    }
                }

                console.log(lines);

                cb && cb(false, { local: local, remote: remote });

            });
        },

        checkout: function(path, branch, cb) {
            run.command('Checkout Branch', 'git', ['checkout', branch], path, function(err, data) {
                if(err) {
                    alert(err);
                }
                cb && cb(err);
            });
        },

        init: function(path, cb) {
            run.silent('Init', 'git', ['init'], path, function(err, data) {
                if(err) {
                    alert(err);
                }
                run.silent('Init', 'git', ['add', '.'], path, function(err, data) {
                    if(err) {
                        alert(err);
                    }
                    run.silent('Init', 'git', ['commit', '-m', '"Base Project"'], path, function(err, data) {
                        if(err) {
                            alert(err);
                        }

                        cb && cb(err);
                    });
                });
            });
        },

        pull: function(path, cb) {
            run.command('Pull Changes', 'git', ['pull'], path, function(err, data) {
                if(err) {
                    alert(err);
                }
                cb && cb(err);
            });
        }
	};


    function GitManager(path, $scope) {
        this.path = path;
        this.$scope = $scope;
        this.changes = 0;

        this.localBranches = [];
        this.remoteBranches = [];

        var me = this;
        function RepoChanges(err, changes) {
            me.changes = changes;
            me.$scope.$digest();
        }

        function RepoBranches(err, localBranches, remoteBranches) {
            me.localBranches = localBranches;
            me.remoteBranches = remoteBranches;
            me.$scope.$digest();
        }

        function RepoCheckout() {
            me.getChanges(RepoChanges);
            me.getBranches(RepoBranches);
        }

        this.$scope.checkout = function(branch) { me.checkout(branch, RepoCheckout); };
        this.$scope.pull = function(branch) { me.pull(branch, RepoCheckout); };
        RepoCheckout();
    }

    GitManager.prototype = {
        path: null,
        changes: 0,

        getChanges: function(cb) {
            git.hasChangesToPull(this.path, function(err, changes) {
                cb && cb(err, changes);
            });
        },

        getBranches: function(cb) {
            git.branches(this.path, function(err, result) {
                cb && cb(err, result.local, result.remote);
            });
        },

        checkout: function(branch, cb) {
            git.checkout(this.path, branch.name, cb);
        },

        pull: function(branch, cb) {
            git.pull(this.path, cb);
        }
    };

    return {
      CLI: git,
      Manager: GitManager
    };
}]);
