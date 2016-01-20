var engineControllers = angular.module('engineControllers');

engineControllers.controller('ResourcePackCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {

		$scope.files = [];
		$scope.resourcePath =  window.localStorage['resourcePath'];

		function UpdateFileList() {
			if(!$scope.resourcePath) return;

			// Get directory listing
			function walk(currentDirPath, callback) {
			    var fs = require('fs'), path = require('path');
			    fs.readdirSync(currentDirPath).forEach(function(name) {
			        var filePath = path.join(currentDirPath, name);
			        var stat = fs.statSync(filePath);
			        if (stat.isFile()) {
			            callback(filePath, stat);
			        } else if (stat.isDirectory()) {
			            walk(filePath, callback);
			        }
			    });
			}

			$scope.files = [];
            var extensions = [
                // '.wav',
                // '.ogg',
                '.opm',
                '.opf',
                '.skel',
                '.anim',
                '.obj',
                '.vert',
                '.frag',
                '.opss',
                '.png'
            ];
			walk($scope.resourcePath, function(path, stat) {
                var ext = path.extension();

				if(extensions.indexOf(ext) >= 0) {
					$scope.files.push({
                        path: path,
						name: path.split($scope.resourcePath + '/').join(''),
						stat: stat,
						selected: true
					});
				}
			});
		}
		UpdateFileList();

        $scope.saveResourcePath = function() {
            window.localStorage.setItem('resourcePath', $scope.resourcePath);
			UpdateFileList();
		}

		$scope.setResourcePath = function() {
			var folders = ipc.sendSync('folder');

			if(folders.length > 0) {
				$scope.resourcePath = folders[0].split('\\').join('/');
				$scope.saveResourcePath();
			}
		}

        $scope.buildResource = function() {

            // Determine the header size so that we can use it for offsets
            var totalHeaderSize = 0;
            totalHeaderSize += 1; // Version
            totalHeaderSize += 2; // Resource Count
            totalHeaderSize += 4; // Total Name Length
            for(var i = 0; i < $scope.files.length; i++) {
                totalHeaderSize += 4; // Length of name
                totalHeaderSize += $scope.files[i].name.length;
                totalHeaderSize += 4; // Offset
                totalHeaderSize += 4; // Size
            }


            var fs = require('fs');
            // Get size of files and data
            for(var i = 0; i < $scope.files.length; i++) {
                $scope.files[i].data = fs.readFileSync($scope.files[i].path);
                $scope.files[i].size = $scope.files[i].data.length;
            }



            var builder = new BlobWriter();
            builder.ui8(1); // Version

            builder.ui16($scope.files.length); // Resource Count

            var totalNameLength = 0;
            for(var i = 0; i < $scope.files.length; i++) {
                totalNameLength += $scope.files[i].name.length;
            }
            builder.ui32(totalNameLength); // Combined length of all strings


            var offset = totalHeaderSize;
            for(var i = 0; i < $scope.files.length; i++) {
                builder.string($scope.files[i].name); // The resource name
                builder.ui32(offset); // Offset in bytes from the start of the file
                builder.ui32($scope.files[i].size); // Size of the resource in bytes
                offset += $scope.files[i].size;
            }



            for(var i = 0; i < $scope.files.length; i++) {
                // Write bytes
                builder.bytes($scope.files[i].data);
            }

            builder.save('pack.oppack');
        }

	}
]);
