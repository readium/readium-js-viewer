'use strict';

var path = require('path');

module.exports = function (grunt) {

  grunt.initConfig({
    express: {
      server: {
        options: {
          port: 8080,
          bases: path.resolve(__dirname)
        }
      },
      livereload: true
    }
  });
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-curl');
  grunt.registerTask('default', ['express', 'express-keepalive']);
  grunt.registerTask('update-readium', ['curl']);

};

