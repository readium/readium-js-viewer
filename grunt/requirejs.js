'use strict';

module.exports = function(grunt) {

    return {
        chromeApp: {
            options: {
                mainConfigFile: './require_config.js',
                include: ['../chrome-app/extended-config', 'ReadiumViewer'],
                name: 'thirdparty/almond',
                baseUrl: './lib/',
                optimize: 'none',
                out: 'build/chrome-app/scripts/readium-all.js',
                paths: {
                    'i18n/Strings': '../chrome-app/i18n/Strings',
                    'storage/StorageManager': '../chrome-app/storage/FileSystemStorage',
                    'storage/Settings': '../chrome-app/storage/ChromeSettings',
                    'analytics/Analytics': '../chrome-app/analytics/ExtensionAnalytics',
                    'google-analytics-bundle': '../chrome-app/analytics/google-analytics-bundle'

                },
                shim: {
                    'google-analytics-bundle': {
                        exports: 'analytics'
                    }
                }
            }
        },
        chromeAppWorker: {
            options: {
                mainConfigFile: './require_config.js',
                include: ['workers/EpubLibraryWriter'],
                name: 'thirdparty/almond',
                baseUrl: './lib/',
                optimize: 'none',
                out: 'build/chrome-app/scripts/readium-worker.js',
                paths: {
                    'i18n/Strings': '../chrome-app/i18n/Strings',
                    'storage/StorageManager': '../chrome-app/storage/FileSystemStorage'
                }
            }
        },
        cloudReader: {
            options: {
                mainConfigFile: './require_config.js',
                include: ['ReadiumViewer'],
                name: 'thirdparty/almond',
                baseUrl: './lib/',
                out: 'build/cloud-reader/scripts/readium-all.js'
            }
        }
    };
};
