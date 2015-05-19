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


// MUST BE *SINGLE* CALL TO require.config() FOR ALMOND (SINGLE BUNDLE) TO WORK CORRECTLY!!!
require.config({
    /* http://requirejs.org/docs/api.html#config-waitSeconds */
    waitSeconds: 0,

    config : {

        'readium_js_viewer/ModuleConfig' : {

            'mathJaxUrl': '/src/js/mathjax/MathJax.js',

            'annotationCSSUrl': '/src/css/annotations.css',

            'jsLibRoot': '/readium-js/node_modules/zip-js/WebContent/',

            'useSimpleLoader' : false, // cloud reader (strictly-speaking, this config option is false by default, but we prefer to have it explicitly set here).

            'epubLibraryPathPrefix': "/",

            'imagePathPrefix': '/src/',

            'canHandleUrl' : false,
            'canHandleDirectory' : false,


            'workerUrl': '/src/chrome-app/readium-worker.js',

            'epubReadingSystemUrl': '/src/chrome-app/epubReadingSystem.js'
        }
    }
});
