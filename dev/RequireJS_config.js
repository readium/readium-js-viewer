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

var HTTPServerRootFolder =
window.location ? (
  window.location.protocol
  + "//"
  + window.location.hostname
  + (window.location.port ? (':' + window.location.port) : '')
  ) : ''
;


var EPUB_LIB_JSON = "http://127.0.0.1:8080/epub_library.opds";
//"http://development.readium.divshot.io/epub_content/epub_library.json"

// check for non-CORS mode
if (HTTPServerRootFolder.indexOf("127.0.0.1") > 0) {
    //EPUB_LIB_JSON = HTTPServerRootFolder + "/epub_content/epub_library.opds";
    EPUB_LIB_JSON = "../epub_content/epub_library.opds";
}

console.log("Default URL of ebooks library: " + EPUB_LIB_JSON);

var getURLQueryParams = function() {
   var params = {};

   var query = window.location.search;
   if (query && query.length) {
       query = query.substring(1);
       var keyParams = query.split('&');
       for (var x = 0; x < keyParams.length; x++)
       {
           var keyVal = keyParams[x].split('=');
           if (keyVal.length > 1) {
               params[keyVal[0]] = decodeURIComponent(keyVal[1]);
           }
       }
   }

   return params;
};

var urlParams = getURLQueryParams();

// MUST BE *SINGLE* CALL TO require.config() FOR ALMOND (SINGLE BUNDLE) TO WORK CORRECTLY!!!
require.config({
    /* http://requirejs.org/docs/api.html#config-waitSeconds */
    waitSeconds: 0,

    config : {

        'readium_js_viewer/ModuleConfig' : {

//            'mathJaxUrl': HTTPServerRootFolder + '/node_modules/MathJax-grunt-concatenator/MathJax.js',
            'mathJaxUrl': HTTPServerRootFolder + '/readium-js-viewer/node_modules/MathJax-grunt-concatenator/MathJax.js',

//          'annotationCSSUrl': HTTPServerRootFolder + '/src/css/annotations.css',
            'annotationCSSUrl': HTTPServerRootFolder + '/readium-js-viewer/src/css/annotations.css',

            'jsLibRoot': HTTPServerRootFolder + '/readium-js/node_modules/zip-js/WebContent/',
            //'jsLibRoot': HTTPServerRootFolder + '/build-output/',

            'useSimpleLoader' : false, // cloud reader (strictly-speaking, this config option is false by default, but we prefer to have it explicitly set here).

            'epubLibraryPath': "../epub_content/epub_library.json",
            //'epubLibraryPath': urlParams['epubs'] ? urlParams['epubs'] : EPUB_LIB_JSON,

            'imagePathPrefix': '/src/',

            'canHandleUrl' : false,
            'canHandleDirectory' : false,


            'workerUrl': HTTPServerRootFolder + '/src/chrome-app/readium-worker.js',

            'epubReadingSystemUrl': HTTPServerRootFolder + '/src/chrome-app/epubReadingSystem.js'
        }
    }
});
