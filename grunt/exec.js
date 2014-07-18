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

'use strict';

module.exports = function(grunt) {

    return {
        gitVersionUpdate: {
            cmd: function(folder) {
                grunt.log.writeln("Git version update script (directory): " + folder);

                var script = folder + "/" + "update-version.sh";
                if (grunt.file.exists(script))
                {
                    grunt.log.writeln("Git version update script: " + script);
                    
                    return 'cd "' + folder + '" && . "./update-version.sh"';
                }
                else {
                    return 'echo "Git version update script not found?! ['+script+']"';
                }
            },
            stdout: true,
            stderr: true
        }
    };
};
