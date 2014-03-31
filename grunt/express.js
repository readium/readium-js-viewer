'use strict';

module.exports = function(grunt) {

    var path = require('path');
    
    return {
        server: {
            options: {
                port: 8080,
                bases: process.cwd() //path.resolve(__dirname)
            }
        },
        livereload: true
    };
};
