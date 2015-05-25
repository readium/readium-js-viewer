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
  + (window.location.pathname ? window.location.pathname : '')
  ) : ''
;

console.log(HTTPServerRootFolder);

// MUST BE *SINGLE* CALL TO require.config() FOR ALMOND (SINGLE BUNDLE) TO WORK CORRECTLY!!!
require.config({
    /* http://requirejs.org/docs/api.html#config-waitSeconds */
    waitSeconds: 0,

    config : {

        'readium_js_viewer/ModuleConfig' : {

            'mathJaxUrl': '/scripts/mathjax/MathJax.js',

            'annotationCSSUrl': '/css/annotations.css',

            'jsLibRoot': '/scripts/zip/',

            'useSimpleLoader' : true,

            'epubLibraryPath': undefined, // defaults to /epub_content/epub_library.json inside Chrome's filesystem storage

            'imagePathPrefix': undefined,

            'canHandleUrl' : false,
            'canHandleDirectory' : true,

            'workerUrl': '/scripts/readium-js-viewer_CHROMEAPP-WORKER.js',
            'epubReadingSystemUrl': '/scripts/epubReadingSystem.js',
        }
    }
});
