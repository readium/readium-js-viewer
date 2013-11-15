
// TODO: eliminate this global
RJSDemoApp = {};

require(['jquery', 'underscore', 'bootstrap', 'readerView', 'epub-fetch', 'emub-model/package_document_parser', 'emub-model/package_document', 'iframe_load_interceptor'],
    function ($, _, bootstrap, readerView, ResourceFetcher, PackageParser, PackageDocument, IFrameLoadInterceptor) {

    var _jsLibDir = './lib/';
    var _currentResourceFetcher;
    var _reader = new ReadiumSDK.Views.ReaderView({el:"#epub-reader-container"});
    ReadiumSDK.trigger(ReadiumSDK.Events.READER_INITIALIZED);

    var _loadIFrameInteceptor = new IFrameLoadInterceptor(ReadiumSDK, _reader, function() { return _currentResourceFetcher; });

    RJSDemoApp.getInputValue = function (inputId) {
        return $("#" + inputId).val();
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

        _currentResourceFetcher = new ResourceFetcher(packageDocumentURL, _jsLibDir);
        var _packageParser = new PackageParser(_currentResourceFetcher);

        _packageParser.parse(function(docJson){

            var packageDocument = new PackageDocument(packageDocumentURL, docJson);
            _reader.openBook(packageDocument.getPackageData())

        });


        // These are application specific handlers that wire the HTML to the SimpleReadiumJs module API

        // Set handlers for click events
        $("#previous-page-btn").unbind("click");
        $("#previous-page-btn").on("click", function () {
            _reader.openPageLeft();
        });

        $("#next-page-btn").unbind("click");
        $("#next-page-btn").on("click", function () {
            _reader.openPageRight();
        });

        $("#toggle-synthetic-btn").unbind("click");
        $("#toggle-synthetic-btn").on("click", function () {

            if (RJSDemoApp.currLayoutIsSynthetic) {
                _reader.updateSettings({ "isSyntheticSpread" : false });
                RJSDemoApp.currLayoutIsSynthetic = false;
                $("#toggle-synthetic-btn").removeClass('synthetic-page-ico');
                $("#toggle-synthetic-btn").addClass('single-page-ico');
            }
            else {
                _reader.updateSettings({ "isSyntheticSpread" : true });
                RJSDemoApp.currLayoutIsSynthetic = true;
                $("#toggle-synthetic-btn").removeClass('single-page-ico');
                $("#toggle-synthetic-btn").addClass('synthetic-page-ico');
            }
        });


        $("#increase-font-size-btn").on("click", function () {
            fontSize = fontSize + 10;
            _reader.updateSettings({ "fontSize" : fontSize });
        });

        $("#decrease-font-size-btn").on("click", function () {
            fontSize = fontSize - 10;
            _reader.epubViewer.updateSettings({ "fontSize" : fontSize });
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
});
