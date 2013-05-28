RWCDemoApp.getInputValue = function (inputId) {
    return $("#" + inputId).val();
};

RWCDemoApp.setModuleContainerHeight = function () {
    $("#epub-reader-container").css({ "height" : document.height * 0.85 + "px" });
};

RWCDemoApp.parseXMLFromDOM = function (data) {
    var serializer = new XMLSerializer();
    var packageDocumentXML = serializer.serializeToString(data);
    return packageDocumentXML;
};