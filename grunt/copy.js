'use strict';

module.exports = function(grunt) {

    return {
        chromeApp: {
            files: [{
                expand: true,
                cwd: 'chrome-app/',
                src: ['icons/*.*', 'index.html', 'background.js', 'extended-config.js', 'manifest.json'],
                dest: 'build/chrome-app'
            }, {
                expand: true,
                src: 'images/**',
                dest: 'build/chrome-app'
            }, {
                expand: true,
                cwd: 'i18n',
                src: '_locales/**',
                dest: 'build/chrome-app'
            }, {
                expand: true,
                cwd: 'lib/thirdparty/',
                src: ['inflate.js', 'deflate.js'],
                dest: 'build/chrome-app'
            }, {
                expand: true,
                cwd: 'css',
                src: 'annotations.css',
                dest: 'build/chrome-app/css'
            }, {
                expand: true,
                src: 'fonts/**',
                dest: 'build/chrome-app'
            }, {
                expand: true,
                cwd: 'lib',
                src: 'mathjax/**',
                dest: 'build/chrome-app/scripts'
            }]
        },
        chromeAppDevBuild: {
            files: [{
                expand: true,
                cwd: 'chrome-app/icons/devBuild/',
                src: ['*.*'],
                dest: 'build/chrome-app/icons/'
                /* , rename: function(dest, src) { return dest + '/' + src } */
            }]
        },
        cloudReader: {
            files: [{
                expand: true,
                cwd: 'chrome-app/',
                src: 'index.html',
                dest: 'build/cloud-reader'
            }, {
                expand: true,
                src: 'images/**',
                dest: 'build/cloud-reader'
            }, {
                expand: true,
                src: 'fonts/**',
                dest: 'build/cloud-reader'
            }, {
                expand: true,
                cwd: 'css',
                src: 'annotations.css',
                dest: 'build/cloud-reader/css'
            }, {
                expand: true,
                cwd: 'lib',
                src: 'mathjax/**',
                dest: 'build/cloud-reader/scripts'
            } ]
        },
        cloudReaderEpubContent: {
            files: [{
                expand: true,
                src: 'epub_content/**/*.*',
                dest: 'build/cloud-reader'
            }]
        },
        readiumjs: {
            files: [{
                expand: true,
                cwd: 'readium-js/out/',
                src: 'Readium.js',
                dest: 'lib'
            }]
        },
        prepareChromeAppTests: {
            files: [{
                expand: true,
                cwd: 'chrome-app/tests/',
                src: 'manifest.json',
                dest: 'build/chrome-app'
            }]
        }
    };
};
