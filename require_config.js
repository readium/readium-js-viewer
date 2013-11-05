
requirejs = {
    baseUrl: './lib/',

    paths: {

        jquery: 'jquery-1.9.1',
        underscore: 'underscore-1.4.4',
        backbone: 'backbone-0.9.10',
        bootstrap: 'bootstrap.min',

        URIjs: 'URIjs/URI',
        punycode: 'URIjs/punycode',
        SecondLevelDomains: 'URIjs/SecondLevelDomains',
        IPv6: 'URIjs/IPv6',

        Readium: 'Readium'
    },

    shim: {
        underscore: {
            exports: '_'
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
            deps: ['backbone'],
            exports:'Readium'
        }
    }
};
