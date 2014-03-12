'use strict';

var path = require('path');

module.exports = function (grunt) {

  grunt.initConfig({
   
   "git-describe": {
      options: {
          cwd: '.'
      },
      target: {
      },
    },
        
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
            'storage/Settings' : '../chrome-app/storage/ChromeSettings',
            'analytics/Analytics' : '../chrome-app/analytics/ExtensionAnalytics',
            'google-analytics-bundle' : '../chrome-app/analytics/google-analytics-bundle'

          },
          shim: {
            'google-analytics-bundle' : {
              exports: 'analytics'
            }
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
              'build/chrome-app/css/readium-all.css' : ['css/sourcesanspro.css', 'css/bootstrap.css', 'css/readium_js.css', 'css/viewer.css', 'css/library.css']
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
            {expand: true, cwd: 'css', src: 'annotations.css', dest: 'build/chrome-app/css'},
            {expand: true, src: 'fonts/**', dest: 'build/chrome-app'}
        ]
      },
      chromeAppDevBuild: {
        files: [
            {expand: false, cwd: 'chrome-app/icons/devBuild/', src: ['*.*'], dest: 'build/chrome-app/icons/'
            /* , rename: function(dest, src) { return dest + '/' + src } */
            }
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

  grunt.loadNpmTasks('grunt-git-describe');

  grunt.registerTask('runserver', ['express', 'express-keepalive']);
  grunt.registerTask('default', 'concurrent:serverwatch');
  grunt.registerTask('update-readium', ['run_grunt:readiumjs', 'copy:readiumjs']);
  grunt.registerTask('test', ['chromeApp', 'copy:prepareChromeAppTests', 'nodeunit:chromeApp']);

  grunt.registerTask('chromeApp', ['clean:chromeApp', 'copy:chromeApp', 'cssmin:chromeApp', 'requirejs:chromeApp', 'requirejs:chromeAppWorker']);
  
  grunt.registerTask('devBuildManifest', function() {
       var manifest = require('./build/chrome-app/manifest.json');

       manifest.description = manifest.description + " (DEV BUILD)";
       manifest.version = manifest.version + ".999";

       var fs = require('fs');
       fs.writeFileSync('./build/chrome-app/manifest.json', JSON.stringify(manifest, null, 2));
  });
  grunt.registerTask('chromeAppDevBuild', ['update-readium', 'chromeApp', 'copy:chromeAppDevBuild', 'devBuildManifest']);
  
  //Populates the EPUB3 navigator.epubReadingSystem with versioning information for each Readium component / dependency.
  //This data gets serialised to a JSON file, 
  //which should then be pulled by shared_js/readium_sdk.js
  //(because ReadiumSDK creates the app-level navigator.epubReadingSystem object)
  //Normally, the navigator.epubReadingSystem object is "customised" in EpubReader.js (with the correct 'name' and 'version' fields),
  //but this could be done in this build step (i.e. the generated epubReadingSystem.json file is "ready", not need for further customisation)
  //Note that subsequently, the navigator.epubReadingSystem is "forwarded" to each EPUB Content Document's host iframe (see shared_js/iframe_loader.js)
  // Also note that navigator.epubReadingSystem.hasFeature is a Javascript function (taking the parameters "feature" and "version")
  // so it cannot be serialised to JSON (it would just be a string). It therefore has to be defined in a JS file,
  // perhaps shared_js/readium_sdk.js (default baseline), and/or EpubReader.js (customised)

  grunt.registerTask('epubReadingSystem_gitDescribe', function(fullPath) {
grunt.log.writeln("Module directory: " + fullPath);

    var module = grunt.option('epubReadingSystem_moduleMap_' + fullPath);
    //var module = grunt.config.get(["git-describe", "options", "moduleMap", fullPath]);
//grunt.log.writeln("module: " + module);

    //TODO: decide whether to grab info from package.json, or from the computed module info (in which case version comes from Git revision)
    var packageJson = fullPath + '/package.json';
    if (grunt.file.exists(packageJson)) {
        var pack = grunt.file.readJSON(packageJson);
        module.name = pack.name;
        module.version = pack.version;

        if (pack.title || pack.description) {
            module.description = pack.title + " -- " + pack.description;
        }
    }

    grunt.event.once('git-describe', function (rev) {
//grunt.log.writeln("Git Revision: " + rev);

          //grunt.option('gitRevision', rev);
          //var rev = grunt.option('gitRevision');
          
grunt.log.writeln("Git rev tag: " + rev.tag);
grunt.log.writeln("Git rev since: " + rev.since);
grunt.log.writeln("Git rev object: " + rev.object);
grunt.log.writeln("Git rev dirty: " + rev.dirty);

        module["url_tag"] = module.url + "releases/tag/" + rev.tag;
        module["url_hash"] = module.url + "tree/" + rev.object;

        module.version = rev.tag;
        module.hash = rev.object;

        module.modules = module.modules;
      });
      
      grunt.config.set(["git-describe", "options", "cwd"], fullPath);
      grunt.task.run('git-describe');
  });
  
  grunt.registerTask('epubReadingSystem_readJSON', function() {
      
      //var epubReadingSystem = grunt.file.readJSON('./epubReadingSystem.json');
      var epubReadingSystem = require('./epubReadingSystem.json');
   
      grunt.option('epubReadingSystem_JSON', epubReadingSystem);
  });

  grunt.registerTask('epubReadingSystem_writeJSON', function() {
   
      var epubReadingSystem = grunt.option('epubReadingSystem_JSON');
       
       epubReadingSystem.readium.date = grunt.template.today();

       //TODO: decide whether to grab info from package.json, or from the computed module info (in which case version comes from Git revision)
       var pack = grunt.file.readJSON('package.json');
       epubReadingSystem.name = pack.name;
       epubReadingSystem.version = pack.version;
       
       epubReadingSystem.name = epubReadingSystem.readium.modules[0].name;
       epubReadingSystem.version = epubReadingSystem.readium.modules[0].version;
       
       
       // TODO this gets done in shared_js/readium_sdk.js or EpubReader.js
       //epubReadingSystem.hasFeature = eval(epubReadingSystem.hasFeature);
       
       
       var jSon = JSON.stringify(epubReadingSystem, null, 2);
grunt.log.writeln(jSon);

       grunt.file.write('./build/epubReadingSystem.json', jSon);
       // var fs = require('fs');
       // fs.writeFileSync(...);
  });
  
  grunt.registerTask('epubReadingSystem_processModules', function() {
   
      Array.isArray = Array.isArray || function (obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
      };
      
      var processModules = function(basePath, json)
      {
          for (var prop in json)
          {
              if (!json.hasOwnProperty(prop)) continue;

              if (prop === "modules" && Array.isArray(json[prop]))
              {
                  for (var i = 0; i < json[prop].length; i++)
                  {
                      var module = json[prop][i];
                      
                      if (typeof module === "string")
                      {
                          var fullPath = basePath + "/" + json[prop];

                          var moduleJson = require(fullPath);
                          json[prop][i] = moduleJson;

                          var slash = fullPath.lastIndexOf("/");
                          var rebased = fullPath.substr(0, slash);

   
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

       processModules(".", epubReadingSystem.readium);
  });
  
  grunt.registerTask('epubReadingSystem', ['epubReadingSystem_readJSON', 'epubReadingSystem_processModules', 'epubReadingSystem_writeJSON']);
};

