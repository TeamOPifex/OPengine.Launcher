angular.module('engineControllers').controller('NewAddonCtrl', ['$scope', '$routeParams', 'user',
    function($scope, $routeParams, user) {
        $('.current-tab .tab-text').text('Create Addon');

        $scope.folder = '';
        $scope.files = [];
        $scope.allFiles = [];
        $scope.binaries = [];
        $scope.osOptions = [
          { name: "All" },
          { name: "Windows" },
          { name: "Linux" },
          { name: "OS X" }
        ];
        $scope.vsOptions = [
          { name: "Any Visual Studio" },
          { name: "VS 2017" },
          { name: "VS 2015" },
          { name: "VS 2013" },
          { name: "VS 2010" },
          { name: "VS 2008" },
          { name: "VS 2005" }
        ];
        $scope.selectedOS = $scope.osOptions[0].name;
        $scope.selectedVS = $scope.vsOptions[0].name;

        var binaryExtensions = [
          'lib', 'dll', 'exe', 'a', 'dylib'
        ];

        var excludeByDefault = [
            'ds_store', 'obj', 'tmp'
        ];

        var fs = require('fs'), path = require('path');
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

        $scope.folder = function() {
            var folders = ipc.sendSync('folder');

            if(folders.length > 0) {
                $scope.folder = folders[0].split('\\').join('/');
                $scope.files = [];
                walk($scope.folder, true, function(path, name, stat) {
                    var root = path.substr($scope.folder.length);
                    var re = /(?:\.([^.]+))?$/;
                    var ext = re.exec(name)[1];
                    //console.log(stat);

                    if(!stat.isFile()) return;

                    $scope.allFiles.push({
                        id: $scope.files.length,
                        name: root,
                        selected: false,
                        ext: ext
                    });
                    if(root.indexOf('\\.git') != -1) return;
                    var selected = true;
                    if((ext && excludeByDefault.indexOf(ext.toLowerCase()) > -1)) {
                      selected = false;
                    }
                    // if((ext && binaryExtensions.indexOf(ext.toLowerCase()) > -1)) {
                    //   selected = false;
                    // }
                    $scope.files.push({
                        id: $scope.files.length,
                        name: root,
                        selected: selected,
                        ext: ext
                    });
                });

                console.log($scope.folder + '/package.json');
                if(fs.existsSync($scope.folder + '/package.json')) {
                    var data = fs.readFileSync($scope.folder + '/package.json');
                    console.log(data, data + '');
                    var package = JSON.parse(data + '');
                    console.log(package);
                    $scope.package = package;
                    $scope.addon = package.name || '';
                    $scope.version = package.version || '';
                    $scope.description = package.description || '';
                    $scope.image = 'file:///' + $scope.folder + '/' + package.image || '';
                }

            }
        }

        $scope.addBinary = function() {
          var binary = {
              id: $scope.binaries.length,
              files: [],
              os: $scope.selectedOS,
              vs: false
          };

          console.log($scope.selectedVS);
          if($scope.selectedVS != 'Any Visual Studio') {
            binary.vs = $scope.selectedVS;
          }

          for(var i = 0; i < $scope.allFiles.length; i++) {
            if(
              $scope.allFiles[i].name.indexOf('\\bin') > -1 ||
              ($scope.allFiles[i].ext && binaryExtensions.indexOf($scope.allFiles[i].ext.toLowerCase()) > -1)) {

                var f = {
                  selected: false,
                  id: $scope.allFiles[i].id,
                  name: $scope.allFiles[i].name,
                  ext: $scope.allFiles[i].ext
                };
              if($scope.selectedOS == 'Windows' && ($scope.allFiles[i].name.indexOf('\\bin\\win32') > -1 || $scope.allFiles[i].name.indexOf('\\bin\\win64') > -1)) {
                f.selected = true;
              }
              binary.files.push(f);
            }
          }

          $scope.binaries.push(binary);
        }

        $scope.binaryFiles = function(binary) {
            var files = ipc.sendSync('files');

            if(files.length > 0) {
                binary.files = [];
                for(var i = 0; i < files.length; i++) {
                    binary.files.push({
                        id: binary.files.length,
                        name: files[i],
                        selected: true
                    });
                }
            }
        }

        $scope.Create = function() {

            // Zip up the addon
            var zip = new require('node-zip')();
            for( var i = 0; i < $scope.files.length; i++ ) {
                var zipFileName = $scope.files[i].name.split('\\').join('/');
                zip.file(zipFileName, fs.readFileSync( $scope.folder + $scope.files[i].name));
            }
            
            var data = zip.generate({ base64:false, compression: 'DEFLATE' });
            var pathToZip = global.root + '/temp/addon.zip';
            fs.writeFileSync(pathToZip, data, 'binary');

            var pathToCover = $scope.folder + '/' + $scope.package.image;
            // Upload to opifex server

            var request = require('request');

            const req = request.post('http://api.opengine.io/api/v1/packages', function (err, resp, body) {
                if (err) {
                    console.log('Error!');
                } else {
                    console.log('URL: ' + body);
                }
            });
            const form = req.form();
            form.append('token', window.localStorage['login-token']);
            form.append('id', $scope.addon.toLowerCase());
            form.append('version', $scope.version);
            form.append('name', $scope.addon);
            form.append('description', $scope.description || '');
            form.append('package', fs.createReadStream(pathToZip));
            form.append('image', fs.createReadStream(pathToCover));


            // var req = request.post('http://localhost:8081/api/v1/packages', function (err, resp, body) {
            //     if (err) {
            //       console.log('Error!');
            //     } else {
            //       console.log('URL: ' + body);
            //     }
            // });
            // var form = req.form();
            // form.append('file', fs.createReadStream(pathToZip));
            // form.append('id', $scope.addon);

        }
    }]);
