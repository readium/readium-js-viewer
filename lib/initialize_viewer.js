
// TODO: eliminate this global
RJSDemoApp = {};

require(['require', 'jquery', 'underscore', 'bootstrap', 'Readium'],
    function (require, $, _, bootstrap, Readium) {

    var _readium;

    RJSDemoApp.getInputValue = function (inputId) {
        return $("#" + inputId).val();
    };

    RJSDemoApp.addLibraryList = function ($ulElementContainer, libraryJson) {

        _.each(libraryJson.library_epubs, function (currEpub) {

            var $currLi = $('<li><a id="' + currEpub.url_to_book_root + '" href="#">' + currEpub.title + '</a></li>');
            $currLi.on("click", function () {
                RJSDemoApp.loadAndRenderEpub(currEpub.url_to_book_root);
            });
            $ulElementContainer.append($currLi);
        });
    };

    // This function will retrieve a package document and load an EPUB
    RJSDemoApp.loadAndRenderEpub = function (packageDocumentURL) {

        _readium.openPackageDocument(packageDocumentURL);

    };

    // When the document is ready, choose an EPUB to show.
    $(document).ready(function () {

        // Generate the library
        $.getJSON('epub_content/epub_library.json', function (data) {

            $(".show-on-load").hide();
            $("#library-list").html("");
            RJSDemoApp.addLibraryList($("#library-list"), data);
            $(".show-on-load").show();

        }).fail(function (result) {
                console.log("The library could not be loaded");
            });

        RJSDemoApp.isNightMode = false;

        _readium = new Readium("#epub-reader-container", './lib/');

        RJSDemoApp.currLayoutIsSynthetic = true;

        // These are application specific handlers that wire the HTML to the SimpleReadiumJs module API

        // Set handlers for click events
        $("#previous-page-btn").on("click", function () {
            _readium.reader.openPageLeft();
        });

        $("#next-page-btn").on("click", function () {
            _readium.reader.openPageRight();
        });

        $("#toggle-synthetic-btn").on("click", function () {

            if (RJSDemoApp.currLayoutIsSynthetic) {
                _readium.reader.updateSettings({ "isSyntheticSpread" : false });
                RJSDemoApp.currLayoutIsSynthetic = false;
                $("#toggle-synthetic-btn").removeClass('synthetic-page-ico');
                $("#toggle-synthetic-btn").addClass('single-page-ico');
            }
            else {
                _readium.reader.updateSettings({ "isSyntheticSpread" : true });
                RJSDemoApp.currLayoutIsSynthetic = true;
                $("#toggle-synthetic-btn").removeClass('single-page-ico');
                $("#toggle-synthetic-btn").addClass('synthetic-page-ico');
            }
        });

        $("#toggle-night-mode-btn").on("click", function () {

            RJSDemoApp.isNightMode = !RJSDemoApp.isNightMode;

            if (RJSDemoApp.isNightMode) {

                var readerStyles = [{
                    // we do not specify selector because we want styles to be applied to the viewport element
                    declarations: {
                        color : "white",
                        background: "black"
                    }
                }];

                var bookStyles = [{
                    selector: "body",
                    declarations: {
                        color : "white",
                        background: "black"
                    }
                }];

                //we set reader styles to avoid flickering of white background while we load pages
                _readium.reader.setStyles(readerStyles);
                _readium.reader.setBookStyles(bookStyles);

                $("#toggle-night-mode-btn").removeClass('night-mode-off-ico');
                $("#toggle-night-mode-btn").addClass('night-mode-on-ico');
            }
            else {

                _readium.reader.clearStyles();
                _readium.reader.clearBookStyles();


                $("#toggle-night-mode-btn").removeClass('night-mode-on-ico');
                $("#toggle-night-mode-btn").addClass('night-mode-off-ico');
            }
        });

        var fontSize = 100;

        $("#increase-font-size-btn").on("click", function () {
            fontSize = fontSize + 10;
            _readium.reader.updateSettings({ "fontSize" : fontSize });
        });

        $("#decrease-font-size-btn").on("click", function () {
            fontSize = fontSize - 10;
            _readium.reader.updateSettings({ "fontSize" : fontSize });
        });

        // "epub_content/moby_dick/OPS/package.opf"

        // Load Moby Dick by default
//        RJSDemoApp.loadAndRenderEpub("epub_content/moby_dick/OPS/package.opf");
        RJSDemoApp.loadAndRenderEpub("epub_content/moby_dick");


    });
});
