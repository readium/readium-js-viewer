
// TODO: eliminate this global
RJSDemoApp = {};

require(['jquery', 'underscore', 'bootstrap', 'Readium'],
    function ($, _, bootstrap, Readium) {

    RJSDemoApp.lastAnnotationId = 1;

    RJSDemoApp.currentSpineIndex = -1;

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
        var fontSize = 100;
        $(elementToBindReaderTo).html("");

        // Clear the viewer, if it has been defined -> to load a new epub
        RJSDemoApp.epubViewer = undefined;

        RJSDemoApp.readium = new Readium(elementToBindReaderTo, packageDocumentURL, jsLibDir, function (epubViewer) {
            RJSDemoApp.epubViewer = epubViewer;
            RJSDemoApp.epubViewer.openBook();

            ReadiumSDK.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (args) {
                var newSpineIndex = args.paginationInfo.openPages[0].spineItemIndex;
                if (newSpineIndex !== RJSDemoApp.currentSpineIndex) {
                    RJSDemoApp.resetAnnotations();
                    RJSDemoApp.currentSpineIndex = newSpineIndex;
                }
                console.log("PAGINATION_CHANGED: Current spine=" + newSpineIndex);
            });

            ReadiumSDK.reader.on("annotationClicked", function () {
                console.log("Annotation clicked:" + JSON.stringify(arguments));
            });





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

        $("#annotations-highlight").on("click", function () {
            RJSDemoApp.epubViewer.addSelectionHighlight(RJSDemoApp.lastAnnotationId, "highlight");
            RJSDemoApp.lastAnnotationId++;
        });

        $("#annotations-underline").on("click", function () {
            RJSDemoApp.epubViewer.addSelectionHighlight(RJSDemoApp.lastAnnotationId, "underline");
            RJSDemoApp.lastAnnotationId++;
        });

        $("#annotations-image-highlight").on("click", function () {
            RJSDemoApp.epubViewer.addSelectionImageAnnotation(RJSDemoApp.lastAnnotationId, "highlight");
            RJSDemoApp.lastAnnotationId++;
        });






    };

    // When the document is ready, choose an EPUB to show.
    $(document).ready(function () {

        RJSDemoApp.currLayoutIsSynthetic = true;

        // "epub_content/moby_dick/OPS/package.opf"

        // Load Moby Dick by default
        RJSDemoApp.loadAndRenderEpub("epub_content/moby_dick/OPS/package.opf");

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

    RJSDemoApp.resetAnnotations = function() {
        console.log("Resetting annotations");
//        RJSDemoApp.epubViewer.addHighlight("epubcfi(/6/2!/4/2,/3:5,/3:23)",1, "underline");
//        RJSDemoApp.epubViewer.addHighlight("epubcfi(/6/12!/4/2/6,/1:656,/1:669)",2, "highlight");
    };

});
