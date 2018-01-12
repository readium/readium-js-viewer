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

window.process = {};

window.process._RJS_baseUrl = function(n)
{
    return "..";
};

window.process._RJS_rootDir = function(n)
{
    if (n == 2) return ".";
    if (n == 1) return "readium-js";
    if (n == 0) return "readium-js/readium-shared-js";
};

// Used in readium-build-tools/pluginsConfigMaker
// and readium_shared_js/globalsSetup.
// Flag as not optimized by r.js
window._RJS_isBrowser = true;

require.config({

    paths:
    {
        "version":
            process._RJS_rootDir(2) + '/dev/version'
    }
});
