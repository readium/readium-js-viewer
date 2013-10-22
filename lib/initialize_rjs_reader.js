var pathsReadium = {
    jquery: 'jquery-1.9.1',
    underscore: 'underscore-1.4.4',
    backbone: 'backbone-0.9.10',
    readiumjs: 'readium-js/Readium.min'
};

var pathsSeparateEpubModules = {
    jquery: 'jquery-1.9.1',
    underscore: 'underscore-1.4.4',
    backbone: 'backbone-0.9.10',
    bootstrap: 'bootstrap.min',
    EpubFetchModule: './epub-fetch/src/epub_fetch_module',
    EpubModule: './epub/src/epub_module',
    EpubRendererModule: './epub-renderer/epub_renderer_module',
    EpubReadingSystem: './epub-ers/src/epub_reading_system'
};

require.config({
    baseUrl: './lib/',
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'bootstrap'
        }
    },
    paths: pathsSeparateEpubModules
});

// TODO: eliminate this global
RJSDemoApp = {};

require(['jquery', 'underscore', 'bootstrap', 'EpubFetchModule', 'EpubModule', 'EpubRendererModule', 'EpubReadingSystem'], 
    function ($, _, bootstrap, EpubFetchModule, EpubModule, EpubRendererModule, EpubReadingSystem) {

    RJSDemoApp.getInputValue = function (inputId) {
        return $("#" + inputId).val();
    };

    RJSDemoApp.setModuleContainerHeight = function () {
        $("#epub-reader-container").css({ "height" : $(window).height() * 0.85 + "px" });
    };

    // This function will retrieve a package document and load an EPUB
    RJSDemoApp.loadAndRenderEpub = function (packageDocumentURL) {

        // Set a fixed height for the epub viewer container
        RJSDemoApp.setModuleContainerHeight();

        var that = this;
        var jsLibDir = '../lib/';
        var elementToBindReaderTo = $("#epub-reader-container");
        var fontSize = 100;
        $(elementToBindReaderTo).html("");

        // Clear the viewer, if it has been defined -> to load a new epub
        RJSDemoApp.epubViewer = undefined;

        RJSDemoApp.epubFetch = new EpubFetchModule({
            packageDocumentURL: packageDocumentURL,
            libDir: jsLibDir
        });

        RJSDemoApp.epub = new EpubModule(RJSDemoApp.epubFetch, function () {

            var packageData = RJSDemoApp.epub.getPackageData();
            RJSDemoApp.epubViewer = new EpubRendererModule(elementToBindReaderTo, packageData);
            RJSDemoApp.epubViewer.openBook();

            // Change layout stuff
            RJSDemoApp.epubViewer.updateSettings({ "columnGap" : 20});
        });

        // These are application specific handlers that wire the HTML to the SimpleReadiumJs module API

        // Set handlers for click events
        $("#previous-page-btn").unbind("click");
        $("#previous-page-btn").on("click", function () {
            RJSDemoApp.epubViewer.openPageLeft();
        });

        $("#next-page-btn").unbind("click");
        $("#next-page-btn").on("click", function () {
            RJSDemoApp.epubViewer.openPageRight();
        });

        $("#toggle-synthetic-btn").unbind("click");
        $("#toggle-synthetic-btn").on("click", function () {

            if (RJSDemoApp.currLayoutIsSynthetic) {
                RJSDemoApp.epubViewer.updateSettings({ "isSyntheticSpread" : false });
                RJSDemoApp.currLayoutIsSynthetic = false;
                $("#toggle-synthetic-btn").removeClass('synthetic-page-ico');
                $("#toggle-synthetic-btn").addClass('single-page-ico');
            }
            else {
                RJSDemoApp.epubViewer.updateSettings({ "isSyntheticSpread" : true });
                RJSDemoApp.currLayoutIsSynthetic = true;
                $("#toggle-synthetic-btn").removeClass('single-page-ico');
                $("#toggle-synthetic-btn").addClass('synthetic-page-ico');
            }
        });


        $("#increase-font-size-btn").on("click", function () {
            fontSize = fontSize + 10; 
            RJSDemoApp.epubViewer.updateSettings({ "fontSize" : fontSize });
        });

        $("#decrease-font-size-btn").on("click", function () {
            fontSize = fontSize - 10; 
            RJSDemoApp.epubViewer.updateSettings({ "fontSize" : fontSize });
        });


    };

    // When the document is ready, choose an EPUB to show.
    $(document).ready(function () {

        RJSDemoApp.currLayoutIsSynthetic = true;

        // "epub_content/moby_dick/OPS/package.opf"

        if (window.location.search === "") {
            // Load Moby Dick by default
            RJSDemoApp.loadAndRenderEpub("epub_content/moby_dick/OPS/package.opf");
        } else {
            var path = window.location.search.substr(5)
            RJSDemoApp.loadAndRenderEpub(path);
        }

        // Generate the library
        $.getJSON('epub_content/epub_library.json', function (data) {

            $(".show-on-load").hide();
            $(".show-on-load").show();

        }).fail(function (result) {
            console.log("The library could not be loaded");
        });
    });
});
