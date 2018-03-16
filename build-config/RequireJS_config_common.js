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

    baseUrl: process._RJS_baseUrl(2),

    packages: [

          {
              name: 'readium_js_viewer',
              location:
                  process._RJS_rootDir(2) + '/src/js',

              main: 'ReadiumViewer'
          },

          {
              name: 'readium_js_viewer_html_templates',
              location:
                  process._RJS_rootDir(2) + '/src/templates'
          },

          {
              name: 'readium_js_viewer_i18n',
              location:
                  process._RJS_rootDir(2) + '/src/i18n',

              main: 'Strings'
          }
    ],

    paths:
    {
        // ------ NPM MODULEs

        'keymaster':
            process._RJS_rootDir(2) + '/node_modules/keymaster/keymaster',

        'screenfull':
            process._RJS_rootDir(2) + '/node_modules/screenfull/dist/screenfull',

        'hgn':
            process._RJS_rootDir(2) + '/node_modules/requirejs-hogan-plugin/hgn',

        'hogan':
            process._RJS_rootDir(2) + '/node_modules/hogan.js/dist/hogan-3.0.2.amd',// version number in file name! :(

        'jath':
            process._RJS_rootDir(2) + '/node_modules/jath/jath',

        'spin':
            process._RJS_rootDir(2) + '/node_modules/spin.js/spin',

        'bootstrap':
            process._RJS_rootDir(2) + '/node_modules/bootstrap/dist/js/bootstrap',

        'bootstrapA11y':
            process._RJS_rootDir(2) + '/node_modules/bootstrap-accessibility-plugin/plugins/js/bootstrap-accessibility',

        'jquery_hammer':
            process._RJS_rootDir(2) + '/node_modules/jquery-hammerjs/jquery.hammer',

        'hammerjs':
            process._RJS_rootDir(2) + '/node_modules/hammerjs/hammer',




        'i18nStrings':
            process._RJS_rootDir(2) + '/src/i18n/Strings',

        'Settings':
            process._RJS_rootDir(2) + '/src/js/storage/Settings',

        'StorageManager':
            process._RJS_rootDir(2) + '/src/js/storage/StaticStorageManager',

        'Analytics':
            process._RJS_rootDir(2) + '/src/js/analytics/Analytics'



        // 'remotestorage':
        //     process._RJS_rootDir(2) + '/node_modules/remotestoragejs/release/head/remotestorage',
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
    }
});
