self.importScripts('../readium-js/readium-shared-js/readium-cfi-js/node_modules/requirejs/require.js');
//self.importScripts('../readium-js/readium-shared-js/readium-cfi-js/node_modules/almond/almond.js');

self.importScripts('../build-config/RequireJS_config_browser.js');
self.importScripts('../readium-js/build-config/RequireJS_config_common.js');
self.importScripts('../readium-js/readium-shared-js/build-config/RequireJS_config_common.js');
self.importScripts('../readium-js/readium-shared-js/readium-cfi-js/build-config/RequireJS_config_common.js');
self.importScripts('../build-config/RequireJS_config_common.js');
//self.importScripts('../readium-js/readium-shared-js/build-config/RequireJS_config_plugins.js');

//self.importScripts('../src/fonts/fonts.js'); // not needed in the worker (font faces)
self.importScripts('./electron_requirejs-config.js');

require(
    ["readium_js_viewer/workers/EpubLibraryWriter"],
    function(obj) {
        //console.debug(obj);
    }
);

