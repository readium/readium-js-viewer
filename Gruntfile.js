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
            {expand: true, cwd: 'chrome-app/', src: ['icons/*.*', 'index.html', 'background.js', 'extended-config.js', 'manifest.json'], dest: 'build/chrome-app'},
            {expand: true, src: 'images/**', dest: 'build/chrome-app'},
            {expand: true, cwd: 'i18n', src: '_locales/**', dest: 'build/chrome-app'},
            {expand: true, cwd: 'lib/thirdparty/', src: ['inflate.js', 'deflate.js'], dest:'build/chrome-app'},
            {expand: true, cwd: 'css', src: 'annotations.css', dest: 'build/chrome-app/css'}
        ]
      },
      readiumjs: {
        files: [
          {expand: true, cwd: 'readium-js/out/', src: 'Readium.js', dest: 'lib'}
        ]
      },
      prepareChromeAppTests: {
        files: [
          {expand: true, cwd: 'chrome-app/tests/', src: 'manifest.json', dest: 'build/chrome-app'}
        ]
      }
    },
    nodeunit: {
      chromeApp: ['chrome-app/tests/tests.js']
    },
    clean : {
      chromeApp: ['build/chrome-app']
    },
    run_grunt: {
      readiumjs : {
        options: {
          cwd: 'readium-js'
        },
        src: 'readium-js/Gruntfile.js'
      }
    },
    watch : {
      readiumjs:{
        files: ['readium-js/**/*.js','!readium-js/out/Readium.js','!readium-js/**/node_modules/**'], 
        tasks: ['update-readium']
      }
    },
    concurrent : {
      serverwatch : {
        tasks: ['runserver', 'watch:readiumjs'],
        options: {
          logConcurrentOutput: true
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-express');

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-run-grunt');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('runserver', ['express', 'express-keepalive']);
  grunt.registerTask('default', 'concurrent:serverwatch');
  grunt.registerTask('update-readium', ['run_grunt:readiumjs', 'copy:readiumjs']);
  grunt.registerTask('test', ['chromeApp', 'copy:prepareChromeAppTests', 'nodeunit:chromeApp']);

  grunt.registerTask('chromeApp', ['clean:chromeApp', 'copy:chromeApp', 'cssmin:chromeApp', 'requirejs:chromeApp', 'requirejs:chromeAppWorker']);

};

