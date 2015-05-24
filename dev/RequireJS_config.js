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

// MUST BE *SINGLE* CALL TO require.config() FOR ALMOND (SINGLE BUNDLE) TO WORK CORRECTLY!!!
require.config({
    /* http://requirejs.org/docs/api.html#config-waitSeconds */
    waitSeconds: 0,

    config : {

        'readium_js_viewer/ModuleConfig' : {

            'mathJaxUrl': HTTPServerRootFolder + '/src/js/mathjax/MathJax.js',

            'annotationCSSUrl': HTTPServerRootFolder + '/src/css/annotations.css',

            'jsLibRoot': HTTPServerRootFolder + '/readium-js/node_modules/zip-js/WebContent/',

            'useSimpleLoader' : false, // cloud reader (strictly-speaking, this config option is false by default, but we prefer to have it explicitly set here).

            //'epubLibraryPath': "../epub_content/epub_library.json",
            //'epubLibraryPath': "/epub_content/epub_library.json",
            'epubLibraryPath': "http://127.0.0.1:8080/epub_library.json",

            'imagePathPrefix': '/src/',

            'canHandleUrl' : false,
            'canHandleDirectory' : false,


            'workerUrl': HTTPServerRootFolder + '/src/chrome-app/readium-worker.js',

            'epubReadingSystemUrl': HTTPServerRootFolder + '/src/chrome-app/epubReadingSystem.js'
        }
    }
});
