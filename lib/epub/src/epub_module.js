define(['require', 'module', 'jquery', 'underscore', 'backbone', '../lib/epub/src/models/package_document' ],
    function (require, module, $, _, Backbone, PackageDocument) {

        var EpubModule = function (epubFetch, callback) {

            var packageDoc = new PackageDocument({
                epubFetch : epubFetch,
                onParsedCallback : callback
            });

            // Description: The public interface
            return {

                getPackageData: function () {
                    return packageDoc.getPackageData();
                },
                isFixedLayout: function () {
                    return packageDoc.isFixedLayout();
                },
                getManifestItemById: function (id) {
                    return packageDoc.getManifestItemById(id);
                },
                getManifestItemByIdref: function (idref) {
                    return packageDoc.getManifestItemByIdref(idref);
                },
                getSpineItemByIdref: function (idref) {
                    return packageDoc.getSpineItemByIdref(idref);
                },
                getSpineItemByIndex: function (spineIndex) {
                    return packageDoc.getSpineItem(spineIndex);
                },
                spineLength: function () {
                    return packageDoc.spineLength();
                },
                getNextLinearSpinePosition: function (currSpineIndex) {
                    return packageDoc.getNextLinearSpinePosition(currSpineIndex);
                },
                getPrevLinearSpinePosition: function (currSpineIndex) {
                    return packageDoc.getPrevLinearSpinePosition(currSpineIndex);
                },
                hasNextSection: function (currSpineIndex) {
                    return packageDoc.hasNextSection(currSpineIndex);
                },
                hasPrevSection: function (currSpineIndex) {
                    return packageDoc.hasPrevSection(currSpineIndex);
                },
                pageProgressionDirection: function () {
                    return packageDoc.pageProgressionDirection();
                },
                getSpineIndexByHref: function (manifestHref) {
                    return packageDoc.getSpineIndexByHref(manifestHref);
                },
                getTocURL: function () {
                    return packageDoc.getToc();
                },
                getTocText: function (callback) {
                    return packageDoc.getTocText(callback);
                },
                getTocDom: function (callback) {
                    return packageDoc.getTocDom(callback);
                },
                generateTocListDOM: function (callback) {
                    return packageDoc.generateTocListDOM(callback);
                },
                tocIsNcx: function () {
                    return packageDoc.tocIsNcx();
                }
            };
        };
        return EpubModule;
    });