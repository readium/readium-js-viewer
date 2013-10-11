var pathsReadium = {
    jquery: 'jquery-1.9.1',
    underscore: 'underscore-1.4.4',
    backbone: 'backbone-0.9.10',
    bootstrap: 'bootstrap.min',
    readium_js: '../Readium-Web-Components/epub-modules/readium-js/src',
    epub_fetch: '../Readium-Web-Components/epub-modules/epub-fetch/src',
    epub: '../Readium-Web-Components/epub-modules/epub/src',
    epub_ers: '../Readium-Web-Components/epub-modules/epub-ers/src',
    epub_renderer: '../Readium-Web-Components/epub-modules/epub-renderer/src',

    epubCfi: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/lib/epub_cfi',
    readiumSDK: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/readium_sdk',
    helpers: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/helpers',
    triggers: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/trigger',
    bookmarkData: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/bookmark_data',
    spineItem: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/spine_item',
    spine: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/spine',
    fixedPageSpread: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/fixed_page_spread',
    package: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/package',
    viewerSettings: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/viewer_settings',
    currentPagesInfo: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/current_pages_info',
    pageOpenRequest: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/models/page_open_request',
    cfiNavigationLogic: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/views/cfi_navigation_logic',
    reflowableView: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/views/reflowable_view',
    onePageView: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/views/one_page_view',
    fixedView: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/views/fixed_view',
    readerView: '../Readium-Web-Components/epub-modules/epub-renderer/src/readium-shared-js/js/views/reader_view'
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
        },

        readiumSDK: "readiumSDK",
        helpers: "helpers",
        triggers: "triggers",
        bookmarkData: "bookmarkData",
        spineItem: "spineItem",
        spine: "spine",
        fixedPageSpread: "fixedPageSpread",
        package: "package",
        viewerSettings: "viewerSettings",
        currentPagesInfo: "currentPagesInfo",
        pageOpenRequest: "openPageRequest",
        epubCfi: "epubCfi",
        cfiNavigationLogic: "cfiNavigationLogic",
        reflowableView: "reflowableView",
        onePageView: "onePageView",
        fixedView: "fixedView",
        readerView: "readerView"
    },
    paths: pathsReadium
});

// TODO: eliminate this global
RJSDemoApp = {};

require(['jquery', 'underscore', 'bootstrap', 'readium_js/Readium'],
    function ($, _, bootstrap, Readium) {

    RJSDemoApp.getInputValue = function (inputId) {
        return $("#" + inputId).val();
    };

    RJSDemoApp.setModuleContainerHeight = function () {
        $("#epub-reader-container").css({ "height" : $(window).height() * 0.85 + "px" });
    };

    RJSDemoApp.addLibraryList = function ($ulElementContainer, libraryJson) {

        _.each(libraryJson.library_epubs, function (currEpub) {

            var $currLi = $('<li><a id="' + currEpub.url_to_package_doc + '" href="#">' + currEpub.title + '</a></li>');
            $currLi.on("click", function () {
                RJSDemoApp.loadAndRenderEpub(currEpub.url_to_package_doc);
            });
            $ulElementContainer.append($currLi);
        });
    };

    // This function will retrieve a package document and load an EPUB
    RJSDemoApp.loadAndRenderEpub = function (packageDocumentURL) {

        // Set a fixed height for the epub viewer container
        RJSDemoApp.setModuleContainerHeight();

        var that = this;
        var jsLibDir = './lib/';
        var elementToBindReaderTo = $("#epub-reader-container");
        $(elementToBindReaderTo).html("");

        // Clear the viewer, if it has been defined -> to load a new epub
        RJSDemoApp.epubViewer = undefined;

        RJSDemoApp.readium = new Readium(elementToBindReaderTo, packageDocumentURL, jsLibDir, function (epubViewer) {
            RJSDemoApp.epubViewer = epubViewer;
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
    };

    // When the document is ready, choose an EPUB to show.
    $(document).ready(function () {

        RJSDemoApp.currLayoutIsSynthetic = true;

        // "epub_content/moby_dick/OPS/package.opf"

        // Load Moby Dick by default
        RJSDemoApp.loadAndRenderEpub("epub_content/page-blanche/EPUB/package.opf");

        // Generate the library
        $.getJSON('epub_content/epub_library.json', function (data) {

            $(".show-on-load").hide();
            $("#library-list").html("");
            RJSDemoApp.addLibraryList($("#library-list"), data);
            $(".show-on-load").show();

        }).fail(function (result) {
            console.log("The library could not be loaded");
        });
    });
});
