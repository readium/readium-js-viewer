define('readium_plugin_example/example',['readium_shared_js/plugins_controller', 'jquery'], function (Plugins, $) {
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

define('readium_plugin_example', ['readium_plugin_example/example'], function (main) { return main; });


define("readium-plugin-example", function(){});

//# sourceMappingURL=readium-plugin-example.js.map