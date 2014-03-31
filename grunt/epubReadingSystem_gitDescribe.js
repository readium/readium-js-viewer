'use strict';

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


module.exports = function(grunt) {

    grunt.registerTask("epubReadingSystem_gitDescribe", function(fullPath) {

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

        grunt.event.once('git-describe', function(rev) {
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

    return {};
};
