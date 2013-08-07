define(['backbone'], function (Backbone) {

    var EpubFetchBase = Backbone.Model.extend({
        _handleError: function (err) {
            console.log(err);
            console.trace();
        },
        parseXml: function (xmlString) {
            return this.parseMarkup(xmlString, 'text/xml');
        },
        parseMarkup: function (markupString, contentType) {
            var parser = new window.DOMParser;
            var parsedDom = parser.parseFromString(markupString, contentType);
            return parsedDom;
        }
    });

    return EpubFetchBase;
});
