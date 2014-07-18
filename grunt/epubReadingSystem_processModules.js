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

    grunt.registerTask("epubReadingSystem_processModules", function() {
        Array.isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        };

        var processModules = function(basePath, json) {
            for (var prop in json) {
                if (!json.hasOwnProperty(prop)) continue;

                if (prop === "modules" && Array.isArray(json[prop])) {
                    for (var i = 0; i < json[prop].length; i++) {
                        var module = json[prop][i];

                        if (typeof module === "string") {
                            var fullPath = basePath + "/" + json[prop];

                            var slash = fullPath.lastIndexOf("/");
                            var rebased = fullPath.substr(0, slash);
                            
                            grunt.task.run('exec:gitVersionUpdate:' + rebased);
                            
                            var moduleJson = require(fullPath);

                            grunt.log.writeln("Git describe: " + moduleJson.version);
                            grunt.log.writeln("Git hash: " + moduleJson.hash);

                            json[prop][i] = moduleJson;
                            
                            grunt.option('epubReadingSystem_moduleMap_' + rebased, json[prop][i]);
                            //grunt.config.set(["git-describe", "options", "moduleMap", rebased], json[prop][i]);
                            grunt.task.run('epubReadingSystem_gitDescribe:' + rebased);

                            processModules(rebased, moduleJson);
                        }
                    }
                }
            }
        };

        var epubReadingSystem = grunt.option('epubReadingSystem_JSON');

        processModules(process.cwd(), epubReadingSystem.readium);
    });

    return {};
};
