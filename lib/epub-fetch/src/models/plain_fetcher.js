define(['require', 'module', 'jquery', 'URIjs/URI', './fetch_base'], function (require, module, $, URI, EpubFetchBase) {
    console.log('plain_fetcher module id: ' + module.id);

    var PlainExplodedFetcher = EpubFetchBase.extend({

        initialize: function (attributes) {
        },

        // Plain exploded EPUB packages are exploded by definition:
        isExploded: function () {
            return true;
        },

        resolveURI: function (epubResourceURI) {
            // Make absolute to the package document path
            var epubResourceRelURI = new URI(epubResourceURI);
            var epubResourceAbsURI = epubResourceRelURI.absoluteTo(this.get('baseUrl'));
            return epubResourceAbsURI.toString();
        },

        fetchFileContentsText: function (fileUrl, fetchCallback, onerror) {
            var thisFetcher = this;
            $.ajax({
                url: fileUrl,
                dataType: 'text',
                success: function (result) {
                    fetchCallback(result);
                },
                error: function (xhr, status, errorThrown) {
                    console.log('Error when AJAX fetching ' + fullUrl);
                    console.log(status);
                    console.log(errorThrown);
                    onerror(errorThrown);
                }
            });
        },

        relativeToPackageFetchFileContents: function (relativeToPackagePath, fetchMode, fetchCallback, onerror) {
            // Not translating relativeToPackagePath, as with exploded EPUB all the URLs are relative
            // to the current page context and are good to go verbatim for fetching:
            this.fetchFileContentsText(relativeToPackagePath, fetchCallback, onerror);
        },

        getPackageDom: function (callback) {
            console.log('getting package DOM');

            var thisFetcher = this;
            var baseUrl = thisFetcher.get('baseUrl');
            console.log('baseUrl: ' + baseUrl);

            thisFetcher.fetchFileContentsText(baseUrl, function (packageXml) {
                var packageDom = thisFetcher.parseXml(packageXml);
                callback(packageDom);
            }, this._handleError);
        }
    });
    return PlainExplodedFetcher;
});