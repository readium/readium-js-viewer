RWCDemoApp.getInputValue = function (inputId) {
    return $("#" + inputId).val();
};

RWCDemoApp.setModuleContainerHeight = function () {
    $("#epub-reader-container").css({ "height" : $(window).height() * 0.85 + "px" });
};

RWCDemoApp.parseXMLFromDOM = function (data) {
    var serializer = new XMLSerializer();
    var packageDocumentXML = serializer.serializeToString(data);
    return packageDocumentXML;
};

RWCDemoApp.addLibraryList = function ($ulElementContainer, libraryJson) {

    _.each(libraryJson.library_epubs, function (currEpub) {

        var $currLi = $('<li><a id="' + currEpub.url_to_package_doc + '" href="#">' + currEpub.title + '</a></li>');
        $currLi.on("click", function () {
            RWCDemoApp.loadAndRenderEpub(currEpub.url_to_package_doc);
        });
        $ulElementContainer.append($currLi);
    });
};