define(['require', 'module', 'jquery', 'underscore', 'backbone', '../lib/epub-fetch/src/models/package_fetcher' ],
    function (require, module, $, _, Backbone, PackageFetcher) {

        console.log('epub_fetch_module module id: ' + module.id);
        console.log(module.id + 'Backbone:' + Backbone);

        var EpubFetchModule = Backbone.Model.extend({
            initialize: function (attributes) {
                this.set('packageFetcher', new PackageFetcher({
                    packageDocumentURL: this.get('packageDocumentURL'),
                    libDir: this.get('libDir')
                }));
            },

            // Description: The public interface
            getPackageContentType: function () {
                return this.get('packageFetcher').getPackageContentType();
            },
            getPackageDom: function (callback) {
                this.get('packageFetcher').getPackageDom(callback);
            },
            getPackageDocumentURL: function (callback) {
                return this.get('packageDocumentURL');
            },
            isPackageExploded: function () {
                return this.get('packageFetcher').isPackageExploded();
            },
            resolveURI: function (epubResourceURI) {
                return this.get('packageFetcher').resolveURI(epubResourceURI);
            },
            relativeToPackageFetchFileContents: function (relativePath, fetchMode, fetchCallback, onerror) {
                this.get('packageFetcher').relativeToPackageFetchFileContents(relativePath, fetchMode, fetchCallback,
                    onerror);
            },
            resolveInternalPackageResources: function (contentDocumentURI, contentDocumentType, contentDocumentText,
                                                       resolvedDocumentCallback) {
                this.get('packageFetcher').resolveInternalPackageResources(contentDocumentURI, contentDocumentType,
                    contentDocumentText, resolvedDocumentCallback);
            }

        });
        return EpubFetchModule;
    });
