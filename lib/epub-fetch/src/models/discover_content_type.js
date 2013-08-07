define(['require', 'module', 'jquery', 'backbone', 'URIjs/URI'], function (require, module, $, Backbone, URI) {
    console.log('discover_content_type module id: ' + module.id);

    var ContentTypeDiscovery = Backbone.Model.extend({

        initialize: function (attributes) {
        },

        identifyContentTypeFromFileName: function (contentUrl) {
            var contentUrlSuffix = URI(contentUrl).suffix();
            var contentType = 'application/octet-stream';
            if (typeof this.constructor.suffixContentTypeMap[contentUrlSuffix] !== 'undefined') {
                contentType = this.constructor.suffixContentTypeMap[contentUrlSuffix];
            }
            return contentType;
        },

        identifyContentType: function () {
            // TODO: Make the call asynchronous (which would require a callback and would probably make sense
            // when calling functions are also remodelled for async).
            var contentUrl = this.get('contentUrl');
            var contentType = $.ajax({
                type: "HEAD",
                url: contentUrl,
                async: false
            }).getResponseHeader('Content-Type');
            if (contentType === null) {
                contentType = this.identifyContentTypeFromFileName(contentUrl);
                console.log('guessed contentType [' + contentType + '] from URI [' + contentUrl +
                    ']. Configuring the web server to provide the content type is recommended.');

            }
            return contentType;
        }

    }, {
        suffixContentTypeMap: {
            css: 'text/css',
            epub: 'application/epub+zip',
            gif: 'image/gif',
            html: 'text/html',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            ncx: 'application/x-dtbncx+xml',
            opf: 'application/oebps-package+xml',
            png: 'image/png',
            svg: 'image/svg+xml',
            xhtml: 'application/xhtml+xml'
        }
    });

    return ContentTypeDiscovery;
});
