define(['require', 'module', './fetch_base', './discover_content_type', './plain_fetcher', './zip_fetcher',
    './resource_resolver'],
    function (require, module, EpubFetchBase, ContentTypeDiscovery, PlainExplodedFetcher, ZipFetcher,
              ResourceResolver) {
        console.log('package_fetcher module id: ' + module.id);


        var PackageFetcher = EpubFetchBase.extend({

            initialize: function (attributes) {
                var contentTypeDiscovery = new ContentTypeDiscovery({'contentUrl': this.get('packageDocumentURL')});
                this.set('_contentTypeDiscovery', contentTypeDiscovery);
                this._setupPackageContentType();
                this._setupResourceFetcher();
            },

            _setupPackageContentType: function () {
                this.set('_packageContentType', this.get('_contentTypeDiscovery').identifyContentType());
            },

            _getPackageReadStrategy: function () {
                var readStrategy = 'exploded';
                var packageContentType = this.getPackageContentType();
                if (packageContentType in this.constructor.contentTypePackageReadStrategyMap) {
                    readStrategy = this.constructor.contentTypePackageReadStrategyMap[packageContentType]
                }
                return readStrategy;
            },

            _setupResourceFetcher: function () {
                var thisFetcher = this;
                var packageReadStrategy = thisFetcher._getPackageReadStrategy();
                if (packageReadStrategy === 'exploded') {
                    console.log('using new PlainExplodedFetcher');
                    thisFetcher.set('_resourceFetcher', new PlainExplodedFetcher({
                        'baseUrl': thisFetcher.get('packageDocumentURL'),
                        '_contentTypeDiscovery': thisFetcher.get('_contentTypeDiscovery')
                    }));
                } else if (packageReadStrategy === 'zipped') {
                    console.log('using new ZipFetcher');
                    thisFetcher.set('_resourceFetcher', new ZipFetcher({
                        'baseUrl': thisFetcher.get('packageDocumentURL'),
                        '_contentTypeDiscovery': thisFetcher.get('_contentTypeDiscovery'),
                        'libDir': thisFetcher.get('libDir')
                    }));
                } else {
                    throw new Error('Unsupported package read strategy: ' + packageReadStrategy);
                }
                thisFetcher.set('_resourceResolver', new ResourceResolver({
                    '_resourceFetcher': thisFetcher.get('_resourceFetcher')
                }));
            },

            isPackageExploded: function () {
                return this.get('_resourceFetcher').isExploded();
            },

            resolveURI: function (epubResourceURI) {
                return this.get('_resourceFetcher').resolveURI(epubResourceURI);
            },

            relativeToPackageFetchFileContents: function (relativePath, fetchMode, fetchCallback, onerror) {
                this.get('_resourceFetcher').relativeToPackageFetchFileContents(relativePath, fetchMode, fetchCallback,
                    onerror);
            },

            getPackageContentType: function () {
                return this.get('_packageContentType');
            },

            getPackageDom: function (callback) {
                this.get('_resourceFetcher').getPackageDom(callback);
            },

            resolveInternalPackageResources: function (contentDocumentURI, contentDocumentType, contentDocumentText,
                                                       resolvedDocumentCallback) {
                this.get('_resourceResolver').resolveInternalPackageResources(contentDocumentURI, contentDocumentType,
                    contentDocumentText, resolvedDocumentCallback);
            }

        }, {
            contentTypePackageReadStrategyMap: {
                'application/oebps-package+xml': 'exploded',
                'application/epub+zip': 'zipped',
                'application/zip': 'zipped'
            }
        });

        return PackageFetcher;
    });