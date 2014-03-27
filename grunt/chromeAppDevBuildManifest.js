'use strict';

module.exports = function(grunt) {

    grunt.registerTask("chromeAppDevBuildManifest", function() {
        var path = require('path');
        var fullpath = path.join(process.cwd(), 'build/chrome-app/manifest.json');

        var manifest = require(fullpath);

        manifest.description = manifest.description + " (DEV BUILD)";
        manifest.version = manifest.version + ".999";

        var fs = require('fs');
        fs.writeFileSync(fullpath, JSON.stringify(manifest, null, 2));
    });

    return {};
};
