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
          include: ['../chrome-app/extended-config','ReadiumViewer'],
          name: 'thirdparty/almond',
          baseUrl: './lib/',
          optimize: 'none',
          out: 'build/chrome-app/scripts/readium-all.js',
          paths: {
            'i18n/Strings': '../chrome-app/i18n/Strings',
            'storage/StorageManager' : '../chrome-app/storage/FileSystemStorage',
            'storage/Settings' : '../chrome-app/storage/ChromeSettings'
          }
        }
      },
      chromeAppWorker : {
        options : {
          mainConfigFile: './require_config.js',
          include: ['workers/EpubLibraryWriter'],
          name: 'thirdparty/almond',
          baseUrl: './lib/',
          optimize: 'none',
          out: 'build/chrome-app/scripts/readium-worker.js',
          paths: {
            'i18n/Strings': '../chrome-app/i18n/Strings',
            'storage/StorageManager' : '../chrome-app/storage/FileSystemStorage'
          }
        }
      }
    },

    cssmin : {
        chromeApp : {
            files : {
              'build/chrome-app/css/readium-all.css' : ['css/bootstrap.css', 'css/readium_js.css', 'css/viewer.css', 'css/library.css']
            }
        }
    },

    copy : {
      chromeApp: {
        files: [
            {expand: true, cwd: 'chrome-app/', src: ['index.html', 'background.js', 'extended-config.js', 'manifest.json'], dest: 'build/chrome-app'},
            {expand: true, src: 'images/**', dest: 'build/chrome-app'},
            {expand: true, cwd: 'i18n', src: '_locales/**', dest: 'build/chrome-app'},
            {expand: true, cwd: 'lib/thirdparty/', src: ['inflate.js', 'deflate.js'], dest:'build/chrome-app'}
        ]
      }
    },

    clean : {
      chromeApp: ['build/chrome-app']
    }

  });

  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-curl');

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');


  grunt.registerTask('default', ['express', 'express-keepalive']);
  grunt.registerTask('update-readium', ['curl']);
  grunt.registerTask('chromeApp', ['clean:chromeApp', 'copy:chromeApp', 'cssmin:chromeApp', 'requirejs:chromeApp', 'requirejs:chromeAppWorker']);

};

