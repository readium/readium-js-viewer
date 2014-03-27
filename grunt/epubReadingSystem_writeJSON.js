'use strict';

module.exports = function(grunt) {

    grunt.registerTask("epubReadingSystem_writeJSON", function() {
        var epubReadingSystem = grunt.option('epubReadingSystem_JSON');

        epubReadingSystem.readium.date = grunt.template.today();

        var path = require('path');
        var fullpath = path.join(process.cwd(), 'package.json');

        //TODO: decide whether to grab info from package.json, or from the computed module info (in which case version comes from Git revision)
        var pack = grunt.file.readJSON(fullpath);
        epubReadingSystem.name = pack.name;
        epubReadingSystem.version = pack.version;

        epubReadingSystem.name = epubReadingSystem.readium.modules[0].name;
        epubReadingSystem.version = epubReadingSystem.readium.modules[0].version;


        // TODO this gets done in shared_js/readium_sdk.js or EpubReader.js
        //epubReadingSystem.hasFeature = eval(epubReadingSystem.hasFeature);


        var jSon = JSON.stringify(epubReadingSystem, null, 2);
        grunt.log.writeln(jSon);

        var fullpathOut = path.join(process.cwd(), 'build/epubReadingSystem.json');
        grunt.file.write(fullpathOut, jSon);
        // var fs = require('fs');
        // fs.writeFileSync(...);
    });

    return {};
};
