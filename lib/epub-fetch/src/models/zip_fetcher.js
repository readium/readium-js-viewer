define(['require', 'module', 'jquery', 'URIjs/URI', './fetch_base'], function (require, module, $, URI, EpubFetchBase) {
    console.log('zip_fetcher module id: ' + module.id);

    var ZipFetcher = EpubFetchBase.extend({

        defaults: {
            'checkCrc32': false
        },

        initialize: function (attributes) {
        },

        // Description: perform a function with an initialized zip filesystem, making sure that such filesystem is initialized.
        // Note that due to a race condition, more than one zip filesystem may be instantiated.
        // However, the last one to be set on the model object will prevail and others would be garbage collected later.
        _withZipFsPerform: function (callback, onerror) {
            var thisFetcher = this;
            if (thisFetcher.has('_zipFs')) {
                var zipFs = thisFetcher.get('_zipFs');
                callback(zipFs);

            } else {
                var zipUrl = thisFetcher.get('baseUrl');
                var libDir = thisFetcher.get('libDir');
                console.log('zip.workerScriptsPath = ' + libDir);
                zip.workerScriptsPath = libDir;
                var zipFs = new zip.fs.FS();
                zipFs.importHttpContent(zipUrl, true, function () {
                    thisFetcher.set('_zipFs', zipFs);
                    callback(zipFs);

                }, onerror)
            }
        },

        _identifyContentTypeFromFileName: function (fileUri) {
            return this.get('_contentTypeDiscovery').identifyContentTypeFromFileName(fileUri);
        },

        // Zipped EPUB packages are not exploded by definition:
        isExploded: function () {
            return false;
        },

        resolveURI: function (epubResourceURI) {
            return epubResourceURI;
        },

        fetchFileContents: function (relativePath, readCallback, onerror) {
            var thisFetcher = this;
            this._withZipFsPerform(function (zipFs) {
                var entry = zipFs.find(relativePath);
                if (typeof entry === 'undefined' || entry === null) {
                    onerror(new Error('Entry ' + relativePath + ' not found in zip ' + thisFetcher.get('baseUrl')));
                } else {
                    if (entry.directory) {
                        onerror(new Error('Entry ' + relativePath + ' is a directory while a file has been expected'));
                    } else {
                        readCallback(entry);
                    }
                }
            }, thisFetcher._handleError);
        },

        fetchFileContentsText: function (relativePath, fetchCallback, onerror) {
            var thisFetcher = this;
            thisFetcher.fetchFileContents(relativePath, function (entry) {
                entry.getText(fetchCallback, undefined, thisFetcher.get('checkCrc32'));
            }, onerror)
        },

        fetchFileContentsData64Uri: function (relativePath, fetchCallback, onerror) {
            var thisFetcher = this;
            thisFetcher.fetchFileContents(relativePath, function (entry) {
                entry.getData64URI(thisFetcher._identifyContentTypeFromFileName(relativePath), fetchCallback, undefined,
                    thisFetcher.get('checkCrc32'));
            }, onerror)
        },

        fetchFileContentsBlob: function (relativePath, fetchCallback, onerror) {
            var thisFetcher = this;
            thisFetcher.fetchFileContents(relativePath, function (entry) {
                entry.getBlob(thisFetcher._identifyContentTypeFromFileName(relativePath), fetchCallback, undefined,
                    thisFetcher.get('checkCrc32'));
            }, onerror)
        },

        relativeToPackageFetchFileContents: function (relativeToPackagePath, fetchMode, fetchCallback, onerror) {
            var thisFetcher = this;
            var packageFullPath = thisFetcher.get('_packageFullPath');
            console.log('Have got _packageFullPath ' + packageFullPath);
            console.log('packageFullPath: ' + packageFullPath);
            console.log('relativePath: ' + relativeToPackagePath);
            var pathRelativeToPackage = decodeURIComponent(new URI(relativeToPackagePath).absoluteTo(packageFullPath).toString());
            console.log('pathRelativeToPackage: ' + pathRelativeToPackage);
            var fetchFunction = thisFetcher.fetchFileContentsText;
            if (fetchMode === 'blob') {
                fetchFunction = thisFetcher.fetchFileContentsBlob;
            } else if (fetchMode === 'data64uri') {
                fetchFunction = thisFetcher.fetchFileContentsData64Uri;
            }
            fetchFunction.call(thisFetcher, pathRelativeToPackage, fetchCallback, onerror);
        },

        getFileContentsFromPackage: function (fileRelativePath, callback) {
            var thisFetcher = this;
            thisFetcher.fetchFileContentsText(fileRelativePath, function (fileContents) {
                callback(fileContents);
            }, thisFetcher._handleError);
        },

        getContainerXml: function (callback) {
            var fileRelativePath = 'META-INF/container.xml';
            this.getFileContentsFromPackage(fileRelativePath, callback);
        },

        getXmlFileDom: function (xmlFileRelativePath, callback) {
            var thisFetcher = this;
            thisFetcher.getFileContentsFromPackage(xmlFileRelativePath, function (xmlFileContents) {
                var fileDom = thisFetcher.parseXml(xmlFileContents);
                callback(fileDom);
            });
        },

        getPackageFullPath: function (callback) {
            var thisFetcher = this;
            thisFetcher.getXmlFileDom('META-INF/container.xml', function (containerXmlDom) {
                thisFetcher.getRootFile(containerXmlDom, callback);
            });
        },

        getRootFile: function (containerXmlDom, callback) {
            var rootFile = $('rootfile', containerXmlDom);
            var packageFullPath = rootFile.attr('full-path');
            console.log('packageFullPath: ' + packageFullPath);
            callback(packageFullPath);
        },

        getPackageDom: function (callback) {
            var thisFetcher = this;
            if (thisFetcher.has('_packageDom')) {
                callback(thisFetcher.get('_packageDom'));
            } else {
                // TODO: use jQuery's Deferred
                // Register all callbacks interested in initialized packageDom, launch its instantiation only once
                // and broadcast to all callbacks registered during the initialization once it's done:
                if (thisFetcher.has('_packageDomInitializationSubscription')) {
                    thisFetcher.get('_packageDomInitializationSubscription').push(callback);
                } else {
                    thisFetcher.set('_packageDomInitializationSubscription', [callback]);
                    thisFetcher.getPackageFullPath(function (packageFullPath) {
                        thisFetcher.set('_packageFullPath', packageFullPath);
                        console.log('Have set _packageFullPath' + packageFullPath);
                        thisFetcher.getXmlFileDom(packageFullPath, function (packageDom) {
                            thisFetcher.set('_packageDom', packageDom);
                            var initializationSubscriptions = thisFetcher.get('_packageDomInitializationSubscription');
                            thisFetcher.unset('_packageDomInitializationSubscription');
                            initializationSubscriptions.forEach(function (subscriberCallback) {
                                subscriberCallback(packageDom);
                            });
                        })
                    });
                }
            }
        }

    });

    return ZipFetcher;
});