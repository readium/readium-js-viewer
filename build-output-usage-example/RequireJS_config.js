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

require.config({
    
    baseUrl: "../src/js",
    
    paths:
    {
        "readium-js-viewer":
            '../build-config/readium-js-viewer',
        
        // ------ NPM MODULEs
        
        'keymaster':
            '../node_modules/keymaster/keymaster',
            
        'screenfull':
            '../node_modules/screenfull/dist/screenfull',
            
        'hgn':
            '../node_modules/requirejs-hogan-plugin/hgn',
        
        'hogan':
            '../node_modules/hogan.js/hogan-3.0.2',// version number in file name! :(
            
        'jath':
            '../node_modules/jath/jath',

        'spin':
            '../node_modules/spin.js/spin',
            
        'bootstrap':
            '../node_modules/bootstrap/dist/bootstrap',
            
        'bootstrapA11y':
            '../node_modules/bootstrap-accessibility-plugin/plugins/js/bootstrap-accessibility',
        
        'remotestorage':
            '../node_modules/remotestoragejs/release/head/remotestorage',
            
        'jquery_hammer':
            '../node_modules/jquery-hammerjs/jquery.hammer',
            
        'hammer':
            '../node_modules/hammerjs/hammer',
            
            
        'i18n': '../i18n',
        'templates': '../templates',
        
        'storage/StorageManager' : 'storage/StaticStorageManager',
        'versioning/Versioning' : 'versioning/UnpackagedVersioning',
        
        'encryptionHandler': 
            '../../readium-js/epub-modules/epub-fetch/src/models/encryption_handler',
            
        'versioning/Versioning' : '../src/js/versioning/UnpackagedVersioning',
        'viewer-version' : '../build-output/version.json'
    },
    
    shim:
    {
        screenfull : {
            exports: 'screenfull'
        },
        keymaster : {
            exports: 'key'
        },
        jath : {
            exports: 'Jath'
        },
        spin : {
            exports: 'Spinner'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        bootstrapA11y: {
          deps: ['bootstrap'],
          exports: 'bootstrapA11y'
        }
    },
    
    hgn : {
        templateExtension : ""
    },
    
    config : {
        'storage/EpubUnzipper': {
            'workerScriptsPath': '/build-output/_single-bundle/'
        },
        
        'workers/WorkerProxy': {
            'workerUrl': '/scripts/readium-worker.js'
        },
        
        'EpubReader' : {
            'useSimpleLoader' : false, // the cloud reader cannot pre-process HTML content documents and may need to load zipped EPUBs too (strictly-speaking, this config option is false by default, but we prefer to have it explicitly set here).
            
            'mathJaxUrl' : '../src/js/mathjax/MathJax.js',
            
            'jsLibRoot' : '../build-output/_single-bundle/'
        }
    }
});