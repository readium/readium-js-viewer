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

    baseUrl: process._RJS_baseUrl(0),

    // relative to this config file (not baseUrl)
    dir: "../build-output/_multiple-bundles",

    modules:
    [
        {
            name: "readium-external-libs",
            create: true,
            include: ["jath", "bootstrap", "bootstrapA11y", "hammerjs", "hogan", "jquery_hammer", "keymaster", "screenfull", "spin",
            "mime-types", "zip", "zip-ext", "zip-fs", "cryptoJs/sha1", "cryptoJs/core",
            'jquery',
            'underscore', 'URIjs', 'punycode', 'SecondLevelDomains', 'IPv6',
            'jquerySizes', 'domReady', 'eventEmitter', 'console_shim',
            'rangy', 'rangy-core', 'rangy-textrange', 'rangy-highlighter', 'rangy-cssclassapplier', 'rangy-position']
        }
    ]
});
