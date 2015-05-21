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

    grunt.registerTask("versioning", function() {                
        var exec = require('child_process').exec;
        exec("npm run versioning",
            { cwd: process.cwd() },
            function(err, stdout, stderr) {
                if (err) {
                    grunt.log.writeln(err);
                }
                if (stderr) {
                    grunt.log.writeln(stderr);
                }
                if (stdout) {
                    grunt.log.writeln(stdout);
            
                    obj["tag"] = stdout.trim();
                }

                fs.writeFileSync('build/version.json', JSON.stringify(obj));
                done();
            }
        );
    });

    grunt.registerTask('updateChromeManifest', function(){
        var fs = require('fs'),
            path = require('path');
        
        var done = this.async();

        var manifest = require(path.join(process.cwd(), 'chrome-app/manifest.json')),
            version = require(path.join(process.cwd(), 'build/version.json'));

        manifest.version = version.chromeVersion;

        var finish = function(){
            fs.writeFileSync('build/chrome-app/manifest.json', JSON.stringify(manifest));
            done()
        }

        if (!version.release){
            manifest.name = 'Readium (Development Build)';

            var mediumStream = fs.createReadStream('chrome-app/icons/devBuild/medium.png');
            mediumStream.pipe(fs.createWriteStream('build/chrome-app/icons/medium.png'));
            mediumStream.on('end', function(){
                var largeStream = fs.createReadStream('chrome-app/icons/devBuild/large.png');
                largeStream.pipe(fs.createWriteStream('build/chrome-app/icons/large.png'));
                largeStream.on('end', finish);
            });
        }
        else{
            finish();
        }
        
    });

    return {};
};