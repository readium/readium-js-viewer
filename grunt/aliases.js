module.exports = function(grunt) {
    return {
        "default": 'concurrent:serverwatch',

        "runserver": ['express', 'express-keepalive'],

        "update-readium": ['run_grunt:readiumjs', 'copy:readiumjs'],

        "chromeApp": ['clean:chromeApp', 'copy:chromeApp', 'cssmin:chromeApp', 'requirejs:chromeApp', 'requirejs:chromeAppWorker'],
        "chromeAppDevBuild": ['chromeApp', 'copy:chromeAppDevBuild', 'chromeAppDevBuildManifest'],

        "cloudReader": ['clean:cloudReader', 'copy:cloudReader', 'cssmin:cloudReader', 'requirejs:cloudReader'],
        "cloudReaderWithEpub": ['clean:cloudReader', 'copy:cloudReader', 'copy:cloudReaderEpubContent', 'cssmin:cloudReader', 'requirejs:cloudReader'],

        "test": ['chromeApp', 'copy:prepareChromeAppTests', 'nodeunit:chromeApp'],

        "epubReadingSystem": ['epubReadingSystem_readJSON', 'epubReadingSystem_processModules', 'epubReadingSystem_writeJSON']
    };
};
