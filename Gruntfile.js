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
    },

    curl: {
       Readium: {
          src: 'https://raw.github.com/readium/readium-js/master/epub-modules/readium-js/out/Readium.js',
          dest: __dirname + '/lib/Readium.js'
       }
    },

    requirejs: {
      chromeApp: {
        options: {
          mainConfigFile: './require_config.js',
          include: ['../chrome-app/extended-config', 'ReadiumViewer'],
          name: 'thirdparty/almond',
          baseUrl: './lib/',
          optimize: 'none',
          out: 'build/scripts/readium-all.js',
          paths: {
            'i18n/Strings': '../chrome-app/i18n/Strings',
          }
        }
      }
    },

    cssmin : {
        chromeApp : {
            files : {
              'build/css/readium-all.css' : ['css/bootstrap.css', 'css/library.css', 'css/readium_js.css', 'css/viewer.css']
            }
        }
    },

    copy : {
      chromeApp: {
        files: [
            {expand: true, cwd: 'chrome-app/', src: '**', dest: 'build/'},
            {expand: true, src: 'images/**', dest: 'build/'},
            {expand: true, cwd: 'i18n', src: '_locales/**', dest: 'build/'},
            {expand: true, src: 'epub_content/**', dest: 'build/'}
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-curl');

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['express', 'express-keepalive']);
  grunt.registerTask('update-readium', ['curl']);
  grunt.registerTask('chromeApp', ['copy:chromeApp', 'cssmin:chromeApp', 'requirejs:chromeApp']);

};

