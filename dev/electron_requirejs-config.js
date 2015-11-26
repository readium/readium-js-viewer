//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.


var currentURL =
self.location ? (
  self.location.protocol
  + "//"
  + self.location.hostname
  + (self.location.port ? (':' + self.location.port) : '')
  + (self.location.pathname ? self.location.pathname : '')
  ) : ''
;

//    file:///FULL-PATH/index.html
console.log(currentURL);

// self.location.origin  == self.location.protocol + '//' + self.location.host

//    file://
console.log(self.location.origin);




var path = (self.location && self.location.pathname) ? self.location.pathname : ''; 

// extracts path to index.html (or more generally: /PATH/TO/*.[x]html or /PATH/TO/*.js for the worker script)
path = path.replace(/(.*)(\/dev\/.*\.[x]?html|\/dev\/.*\.js)$/, "$1");

// removes trailing slash
path = path.charAt(path.length-1) == '/'
          ? path.substr(0, path.length-1)
          : path;
          
var HTTPServerRootFolder =
self.location ? (
  self.location.protocol
  + "//"
  + self.location.hostname
  + (self.location.port ? (':' + self.location.port) : '')
  + path
  ) : ''
;

//HTTPServerRootFolder = HTTPServerRootFolder + "/..";
console.log(HTTPServerRootFolder);



console.debug(process._RJS_rootDir(3));


// MUST BE *SINGLE* CALL TO require.config() FOR ALMOND (SINGLE BUNDLE) TO WORK CORRECTLY!!!
require.config({
    /* http://requirejs.org/docs/api.html#config-waitSeconds */
    waitSeconds: 0,
    
    paths:
    {
        'StorageManager':
            process._RJS_rootDir(3) + '/src/chrome-app/storage/FileSystemStorage',

        'Analytics':
            process._RJS_rootDir(3) + '/src/chrome-app/analytics/ExtensionAnalytics'
    },
    
    config : {

        'readium_js_viewer/ModuleConfig' : {

            'mathJaxUrl': HTTPServerRootFolder + '/node_modules/MathJax-grunt-concatenator/MathJax.js',

            'annotationCSSUrl': HTTPServerRootFolder + '/src/css/annotations.css',

            'jsLibRoot': HTTPServerRootFolder + '/readium-js/node_modules/zip-js/WebContent/',
            //'jsLibRoot': HTTPServerRootFolder + '/build-output/',

            'useSimpleLoader' : true,

            //    filesystem:file:///persistent/epub_library.json
            'epubLibraryPath': undefined,

            'imagePathPrefix': HTTPServerRootFolder + '/src/',

            'canHandleUrl' : false,
            
            'canHandleDirectory' : false, //see EpubLibrary.js handleDirSelect() <input type="file" webkitdirectory=""/>  recursive folder file listing, not implemented in Electron


            'workerUrl': HTTPServerRootFolder + '/dev/electron_worker.js',

            'epubReadingSystemUrl': HTTPServerRootFolder + '/src/chrome-app/epubReadingSystem.js'
        }
    }
});
