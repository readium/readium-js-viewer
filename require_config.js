
require.config({
    baseUrl: './lib/',

    paths: {
        'text': 'thirdparty/text/text',
        'hgn': 'thirdparty/hgn',
        'hogan': 'thirdparty/hogan',
        'jath' : 'thirdparty/jath.min',
        'jquery': 'thirdparty/jquery-1.9.1',
        'spin' : 'thirdparty/spin.min',
        'underscore': 'thirdparty/underscore-1.4.4',
        'backbone': 'thirdparty/backbone-0.9.10',
        'bootstrap': 'thirdparty/bootstrap.min',
        'URIjs': 'thirdparty/URIjs/URI',
        'punycode': 'thirdparty/URIjs/punycode',
        'SecondLevelDomains': 'thirdparty/URIjs/SecondLevelDomains',
        'IPv6': 'thirdparty/URIjs/IPv6',
        'remotestorage' : 'thirdparty/remotestorage',
        'Readium': 'Readium',
        'inflate' : 'thirdparty/inflate',
        'zip' : 'thirdparty/zip',
        'zip-fs' : 'thirdparty/zip-fs',
        'zip-ext' : 'thirdparty/zip-ext',
        'crypto-sha1' : 'thirdparty/crypto-sha1',
        'i18n': '../i18n',
        'templates': '../templates',
        'storage/StorageManager' : 'storage/StaticStorageManager'
    },
    hgn : {
        templateExtension : ""
    },
    config : {
        'storage/EpubUnzipper' : {'workerScriptsPath' : '/lib/thirdparty/'},
        'workers/WorkerProxy' : {'workerUrl' : '/scripts/readium-worker.js'}
    },
    shim: {
        zip : {
            exports: 'zip'
        },
        'zip-fs' : {
            deps: ['zip'],
            exports: 'zip-fs'
        },
        'zip-ext' : {
            deps: ['zip-fs'],
            exports: 'zip-ext'
        },
        underscore: {
            exports: '_'
        },
        jath : {
            exports: 'Jath'
        },
        spin : {
            exports: 'Spinner'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },

        bootstrap: {
            deps: ['jquery'],
            exports: 'bootstrap'
        },

        Readium: {
            deps: ['backbone', 'zip-ext', 'crypto-sha1'],
            exports:'Readium'
        }
    }
});
