angular.module('launcherFactories').factory("OS", function() {
    var result = {
        name: 'Operating System',
        id: 'OPIFEX_OS',
        type: 'targetSelector',
        options: [
            { name: 'Mac x86', id: 'OPIFEX_OSX32' },
            { name: 'Mac x64', id: 'OPIFEX_OSX64' },
            { name: 'Windows x86', id: 'OPIFEX_WIN32' },
            { name: 'Windows x64', id: 'OPIFEX_WIN64' },
            { name: 'Linux x86', id: 'OPIFEX_LINUX32' },
            { name: 'Linux x64', id: 'OPIFEX_LINUX64' },
            { name: 'iOS', id: 'OPIFEX_IOS' },
            { name: 'Android', id: 'OPIFEX_ANDROID' }
        ]
    };

    var osType = require('os').type();
    var osArch =  require('os').arch();

    if( osType == 'Windows_NT') {
        if(osArch == 'x64') {
            result.value = result.options[3];
        } else {
            result.value = result.options[2];
        }
    } else if (osType = 'Darwin') {
        if(osArch == 'x64') {
            result.value = result.options[1];
        } else {
            result.value = result.options[0];
        }
    } else {
        if(osArch == 'x64') {
            result.value = result.options[5];
        } else {
            result.value = result.options[4];
        }
    }

    return result;
});
