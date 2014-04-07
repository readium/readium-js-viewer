'use strict';

module.exports = function(grunt) {

    return {
        readiumjs: {
            files: ['readium-js/**/*.js', '!readium-js/out/Readium.js', '!readium-js/**/node_modules/**'],
            tasks: ['update-readium']
        }
    };
};
