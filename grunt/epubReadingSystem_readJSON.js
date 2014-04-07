'use strict';

module.exports = function(grunt) {
    
    grunt.registerTask("epubReadingSystem_readJSON", function() {
        var path = require('path');
        var fullpath = path.join(process.cwd(), 'epubReadingSystem.json');

        //var epubReadingSystem = grunt.file.readJSON(fullpath);
        var epubReadingSystem = require(fullpath);

        grunt.option('epubReadingSystem_JSON', epubReadingSystem);
    });
    
    return {};
};
