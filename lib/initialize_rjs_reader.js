var pathsReadium = {
    jquery: 'jquery-1.9.1',
    underscore: 'underscore-1.4.4',
    backbone: 'backbone-0.9.10',
    bootstrap: 'bootstrap.min',
    readium_js: '../readium-js/epub-modules/readium-js/src',
    epub_fetch: '../readium-js/epub-modules/epub-fetch/src',
    epub: '../readium-js/epub-modules/epub/src',
    epub_ers: '../readium-js/epub-modules/epub-ers/src',
    epub_renderer: '../readium-js/epub-modules/epub-renderer/src',

    jquerySizes: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/lib/jquery.sizes',
    readiumSDK: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/readium_sdk',
    helpers: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/helpers',
    style: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/style',
    styleCollection: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/style_collection',
    triggers: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/trigger',
    smilModel: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/smil_model',
    mediaOverlay: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/media_overlay',
    viewerSettings: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/viewer_settings',
    bookmarkData: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/bookmark_data',
    spineItem: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/spine_item',
    spine: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/spine',
    fixedPageSpread: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/fixed_page_spread',
    package: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/package',
    currentPagesInfo: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/current_pages_info',
    pageOpenRequest: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/page_open_request',
    smilIterator: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/models/smil_iterator',
    epubCfi: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/lib/epub_cfi',
    cfiNavigationLogic: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/cfi_navigation_logic',
    reflowableView: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/reflowable_view',
    onePageView: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/one_page_view',
    fixedView: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/fixed_view',
    readerView: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/reader_view',
    mediaOverlayElementHighlighter: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/media_overlay_element_highlighter',
    audioPlayer: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/audio_player',
    mediaOverlayPlayer: '../readium-js/epub-modules/epub-renderer/src/readium-shared-js/js/views/media_overlay_player'

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

        helpers: {
            deps: ['readiumSDK', 'jquerySizes'],
            exports: 'helpers'
        },

        readiumSDK: {
          exports:'readiumSDK'
        },

        viewerSettings: {
            deps: ['readiumSDK'],
            exports: 'viewerSettings'
        },

        styleCollection: {
            deps:['readiumSDK'],
            exports: 'styleCollection'
        },

        spineItem: {
            deps:['readiumSDK'],
            exports:'spineItem'
        },

        spine: {
            deps:['readiumSDK', 'spineItem'],
            exports: 'spine'
        },

        smilModel: {
            deps: ['readiumSDK'],
            exports: 'smilModel'
        },

        mediaOverlayPlayer: {
            deps:['readiumSDK', 'mediaOverlay', 'audioPlayer', 'mediaOverlayElementHighlighter'],
            exports:'mediaOverlayPlayer'
        },

        mediaOverlay: {
            deps:['readiumSDK', 'smilModel'],
            exports: 'mediaOverlay'
        },

        package: {
            deps:['readiumSDK', 'spine', 'mediaOverlay'],
            exports:'package'
        },

        audioPlayer: {
          deps:['readiumSDK'],
          exports: 'audioPlayer'
        },

        mediaOverlayElementHighlighter: {
            deps:['readiumSDK'],
            exports: 'mediaOverlayElementHighlighter'
        },

        pageOpenRequest: {
            deps:['readiumSDK'],
            exports: 'pageOpenRequest'
        },

        onePageView: {
            deps:['readiumSDK', 'cfiNavigationLogic'],
            exports:'onePageView'
        },


        cfiNavigationLogic: {
            deps: ['readiumSDK', 'epubCfi'],
            exports:'cfiNavigationLogic'
        },

        epubCFI: {
            deps: ['jquery'],
            exports: ['epubCFI']
        },

        jquerySizes: {
            deps: ['jquery'],
            exports: 'jquerySizes'
        },

        style: {
            deps: ['readiumSDK'],
            exports: 'style'
        },

        triggers: {
            deps: ['readiumSDK'],
            exports: 'triggers'
        },

        bookmarkData: {
            deps: ['readiumSDK'],
            exports: 'bookmarkData'
        },

        fixedPageSpread: {
            deps: ['readiumSDK'],
            exports: 'fixedPageSpread'
        },

        currentPagesInfo: {
            deps: ['readiumSDK'],
            exports: 'currentPagesInfo'
        },

        smilIterator: {
            deps: ['readiumSDK'],
            exports: 'smilIterator'
        },

        reflowableView: {
            deps: ['readiumSDK', 'cfiNavigationLogic', 'bookmarkData'],
            exports: 'reflowableView'
        },

        fixedView: {
            deps: ['readiumSDK', 'onePageView', 'currentPagesInfo', 'fixedPageSpread', 'bookmarkData'],
            exports: 'fixedView'
        },

        readerView : {
            deps: [ 'backbone','readiumSDK', 'helpers', 'viewerSettings', 'styleCollection', 'package',
                    'mediaOverlayPlayer', 'pageOpenRequest', 'fixedView', 'reflowableView'],
            exports:'readerView'
        }

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
//            RJSDemoApp.epubViewer.updateSettings({ "columnGap" : 20});
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
