define('plugin-example/example',['plugins-controller', 'jquery'], function (Plugins, $) {
    var config = {
        backgroundColor: "yellow",
        borderColor: "red"
    };

    Plugins.register("example", function (api) {
        var self = this;

        api.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem) {
            var div = '<div id="" style="position: absolute; left: 0; top: 0; border: 1px solid '
                + config.borderColor + '; background-color: ' + config.backgroundColor + ';">'
                + 'spineItemIdref: ' + spineItem.idref + '</div>';
            $(div).appendTo($iframe[0].contentDocument.documentElement).on('click', function () {
                self.emit("exampleEvent", api.reader.bookmarkCurrentPage());
            });
        });
        
        $("body").css({border: '10px solid ' + config.borderColor});

        api.extendReader(self);
    });

    return config;
});
define('plugin-example', ['plugin-example/example'], function (main) { return main; });

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium-plugin-example',['plugin-example'], function (pluginExampleConfig) {
return pluginExampleConfig;
});


//# sourceMappingURL=readium-plugin-example.js.map