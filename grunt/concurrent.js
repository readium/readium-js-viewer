'use strict';

module.exports = function(grunt) {

    return {
        serverwatch: {
            tasks: ['runserver', 'watch:readiumjs'],
            options: {
                logConcurrentOutput: true
            }
        }
    };
};
