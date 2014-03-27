'use strict';

module.exports = function(grunt) {

    var config = {
        // top-level task options, if needed.
    };

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
    grunt.loadNpmTasks('load-grunt-config');

    var path = require('path');
    var configs = require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt'),
        init: false
        //loadGruntTasks: false
    });
    //grunt.loadTasks('grunt');

    // console.log(JSON.stringify(subConfig));
    // console.log('');
    
    //grunt.util._.extend({}, configs)
    grunt.util._.merge(config, configs);

    // console.log(JSON.stringify(config));
    // console.log('');

    grunt.initConfig(config);
};
