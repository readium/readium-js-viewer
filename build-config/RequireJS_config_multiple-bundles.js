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

    baseUrl: process._RJS_baseUrl(3),

    // relative to this config file (not baseUrl)
    dir: "../build-output/_multiple-bundles",

    modules:
    [
        {
            name: "readium-js-viewer",
            create: true,
            include: ["readium_js_viewer/ReadiumViewer"],
            exclude: ["readium-js", "readium-external-libs", "readium-shared-js", "readium-cfi-js"],
            insertRequire: [
                "readium_js_viewer/ReadiumViewer"
            ]
        },

        {
            name: "readium-js-viewer_LITE",
            create: true,
            include: ["readium_js_viewer/ReadiumViewerLite"],
            exclude: ["readium-js", "readium-external-libs", "readium-shared-js", "readium-cfi-js"],
            insertRequire: [
                "readium_js_viewer/ReadiumViewerLite"
            ]
        }
    ],

    // map:
    // {
    //       '*':
    //       {
    //           'StorageManager': 'readium_js_viewer/storage/StaticStorageManager'
    //       }
    // },

    //,
    // unlike with single-bundle, this does not work! :(
    // paths:
    // {
    //     "version":
    //         process._RJS_rootDir(3) + '/build-output/version',
    // }
});
