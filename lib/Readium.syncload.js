(function (root, ReadiumModuleFactory) {
    root.Readium = ReadiumModuleFactory();
}(this, function () {

/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../../build/almond", function(){});

define('jquery',[],function () {
    return jQuery;
});
define('underscore',[],function () {
    return _;
});
define('backbone',[],function () {
    return Backbone;
});
define('URIjs/URI',[],function () {
    return URI;
});



define("define-sync", function(){});


define('models/fetch_base',['backbone'], function (Backbone) {

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

define('models/discover_content_type',['require', 'module', 'jquery', 'backbone', 'URIjs/URI'], function (require, module, $, Backbone, URI) {
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

define('models/plain_fetcher',['require', 'module', 'jquery', 'URIjs/URI', './fetch_base'], function (require, module, $, URI, EpubFetchBase) {
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
            if (typeof fileUrl === 'undefined') {
                throw 'Fetched file URL is undefined!';
            }
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
define('models/zip_fetcher',['require', 'module', 'jquery', 'URIjs/URI', './fetch_base'], function (require, module, $, URI, EpubFetchBase) {
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
            if (typeof relativePath === 'undefined') {
                throw 'Fetched file relative path is undefined!';
            }
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
define('models/resource_resolver',['require', 'module', 'jquery', 'URIjs/URI', './fetch_base'], function (require, module, $, URI, EpubFetchBase) {
    console.log('resource_resolver module id: ' + module.id);

    var ResourceResolver = EpubFetchBase.extend({
        initialize: function (attributes) {
        },

        _resolveResourceElements: function (elemName, refAttr, contentDocumentDom, contentDocumentURI,
                                            resolutionDeferreds) {
            var thisResolver = this;
            var fetcher = thisResolver.get('_resourceFetcher');
            var resolvedElems = $(elemName + '[' + refAttr + ']', contentDocumentDom);

            resolvedElems.each(function (index, resolvedElem) {
                var refAttrVal = $(resolvedElem).attr(refAttr);
                var refAttrUri = new URI(refAttrVal);

                if (refAttrUri.scheme() === '') {
                    // Relative URI, fetch from packed EPUB archive:

                    var resolutionDeferred = $.Deferred();
                    resolutionDeferreds.push(resolutionDeferred);
                    var uriRelativeToZipRoot = refAttrUri.absoluteTo(contentDocumentURI).toString();

                    fetcher.relativeToPackageFetchFileContents(uriRelativeToZipRoot, 'blob', function (resourceData) {
                        $(resolvedElem).attr(refAttr, window.URL.createObjectURL(resourceData));
                        resolutionDeferred.resolve();
                    });
                }
            });
        },

        resolveInternalPackageResources: function (contentDocumentURI, contentDocumentType, contentDocumentText,
                                                   resolvedDocumentCallback) {
            var thisResolver = this;

            var contentDocumentDom = this.parseMarkup(contentDocumentText, contentDocumentType);

            var resolutionDeferreds = [];

            thisResolver._resolveResourceElements('img', 'src', contentDocumentDom, contentDocumentURI,
                resolutionDeferreds);
            thisResolver._resolveResourceElements('link', 'href', contentDocumentDom, contentDocumentURI,
                resolutionDeferreds);

            $.when.apply($, resolutionDeferreds).done(function () {
                resolvedDocumentCallback(contentDocumentDom);
            });


        }
    });

    return ResourceResolver;
});
define('models/package_fetcher',['require', 'module', './fetch_base', './discover_content_type', './plain_fetcher', './zip_fetcher',
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
define('epub_fetch_module',['require', 'module', 'jquery', 'underscore', 'backbone', './models/package_fetcher' ],
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


define('models/manifest_item',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {

        var ManifestItem = Backbone.Model.extend({

            isSvg: function () {

                return this.get("media_type") === "image/svg+xml";
            },

            isImage: function () {

                var media_type = this.get("media_type");
                if (media_type && media_type.indexOf("image/") > -1) {
                    // we want to treat svg as a special case, so they
                    // are not images
                    return media_type !== "image/svg+xml";
                }
                return false;
            }
        });
        return ManifestItem;
    });

define('models/manifest',['require', 'module', 'jquery', 'underscore', 'backbone', './manifest_item'],
    function (require, module, $, _, Backbone, ManifestItem) {
        console.log('manifest module id: ' + module.id);

        var Manifest = Backbone.Collection.extend({

            model: ManifestItem
        });
        return Manifest;
    });
define('models/spine_item',['require', 'module', 'jquery', 'underscore', 'backbone', './manifest_item'],
    function (require, module, $, _, Backbone, ManifestItem) {

        var SpineItem = ManifestItem.extend({

            defaults: {
                "pageSpreadClass": ""
            },

            initialize: function () {

                // if (this.isFixedLayout()) {
                //     this.on("change:content", this.parseMetaTags, this);
                //     this.loadContent();
                // }
            },

            // REFACTORING CANDIDATE: The meta tags thing has to be worked out
            // toJSON : function () {

            // var json = {};
            // json.width = this.get("meta_width") || 0;
            // json.height = this.get("meta_height") || 0;
            // json.uri = this.resolveUri(this.get('href'));
            // json.page_class = this.getPageSpreadClass();
            // return json;
            // },

            // REFACTORING CANDIDATE: This needs to change

            isFixedLayout: function () {

                // if it an svg or image then it is fixed layout
                if (this.isSvg() || this.isImage()) {
                    return true;
                }

                // if there is a fixed_flow property, then it takes precedence
                if (typeof this.get("fixed_flow") !== 'undefined') {
                    return this.get("fixed_flow");
                }

                // nothing special about this spine item, fall back to the books settings
                return false;
            },

            // Description: Determines if the first page of the content document should be offset in a synthetic layout
            firstPageOffset: function () {

                // Get book properties
                var notFixedLayout = !this.isFixedLayout();
                var pageProgDirIsRTL = this.get("page_prog_dir") === "rtl" ? true : false;
                var pageSpreadLeft = this.get("page_spread") === "left" ? true : false;
                var pageSpreadRight = this.get("page_spread") === "right" ? true : false;

                // Default to no page spread specified if they are both set on the spine item
                if (pageSpreadRight && pageSpreadLeft) {
                    pageSpreadRight = false;
                    pageSpreadLeft = false;
                }

                if (notFixedLayout) {

                    if (pageProgDirIsRTL) {

                        if (pageSpreadLeft) {
                            return true;
                        }
                    } else {

                        if (pageSpreadRight) {
                            return true;
                        }
                    }
                }

                return false;
            },

            // NOTE: Media overlays have been disabled for the time being, which is why these methods are commented out.

            // hasMediaOverlay : function() {
            //     return !!this.get("media_overlay") && !!this.getMediaOverlay();
            // },

            // getMediaOverlay : function() {
            //     return this.collection.getMediaOverlay(this.get("media_overlay"));
            // }
        });
        return SpineItem;
    });

define('models/spine',['require', 'module', 'jquery', 'underscore', 'backbone', './spine_item'],
    function (require, module, $, _, Backbone, SpineItem) {
        var Spine = Backbone.Collection.extend({
            model: SpineItem
        });
        return Spine;
    });
define('models/metadata',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {
    var Metadata = Backbone.Model.extend({});
    return Metadata;
});
define('models/page_spread_property',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {
    // Description: This is a delegate that provides information about the appropriate page-spread property for fixed layout spine items
    var PageSpreadProperty = Backbone.Model.extend({

        initialize : function () {

            // "Constants" for page spread class
            this.CENTER_PAGE = "center_page";
            this.LEFT_PAGE = "left_page";
            this.RIGHT_PAGE = "right_page";
        },

        inferiBooksPageSpread : function (spineIndex, numSpineItems) {

            var pageNum = spineIndex + 1;

            // Rationale: For ibooks, odd pages go on the right. This means
            // the first page will always be on the right
            // without a left counterpart, so center it
            if (pageNum === 1) {

                return this.CENTER_PAGE;
            }
            // Rationale: If the last spine item in the book would be on the left, then
            //   it would have no left counterpart, so center it
            else if (pageNum % 2 === 0 && pageNum === numSpineItems) {

                return this.CENTER_PAGE;
            }
            // Rationale: Otherwise first page goes on the right, and then alternate
            // left - right - left - right etc
            else {

                if (pageNum % 2 === 1) {
                    return this.RIGHT_PAGE;
                }
                else {
                    return this.LEFT_PAGE;
                }
            }
        },

        getPageSpreadFromProperties : function (pageSpreadProperty) {

            if (pageSpreadProperty === "left") {

                return this.LEFT_PAGE;
            }
            else if (pageSpreadProperty === "right") {

                return this.RIGHT_PAGE;
            }
            else if (pageSpreadProperty === "center") {

                return this.CENTER_PAGE;
            }
            else {

                return "";
            }
        },

        // NOTE: This method still cannot infer the page spread value when center pages are sporadically specified
        // REFACTORING CANDIDATE: Could still use some refactoring to enhance the clarity of the algorithm

        // Rationale: If the page spread property is not set, we must iterate back through the EPUB's spine items to find
        //   the last spine item with a page-spread value set. We can use that value, whether there are an even or odd
        //   number of pages between this spine item and the "last" one, and the page progression direction of the EPUB
        //   to determine the appropriate page spread value for this spine item.
        inferUnassignedPageSpread : function (spineIndex, spine, pageProgDirection) {

            var lastSpecifiedPageSpread;
            var numPagesBetween;

            if (spine.at(spineIndex).get("page_spread") === "left" ||
                spine.at(spineIndex).get("page_spread") === "right" ||
                spine.at(spineIndex).get("page_spread") === "center") {

                return this.getPageSpreadFromProperties(spine.at(spineIndex).get("page_spread"));
            }
            // If this is the first spine item, assign left or right based on page progression direction
            else if (spineIndex === 0) {

                return pageProgDirection === "rtl" ? this.RIGHT_PAGE : this.LEFT_PAGE;
            }
            else {

                // Find last spine item with page-spread value and use it to determine the appropriate value for
                //   this spine item. This loop iterates, in reverse order, from the current spine index to the
                //   spine item that had a specified page spread specified.
                for (var currSpineIndex = spineIndex - 1; currSpineIndex >= 0; currSpineIndex--) {

                    // REFACTORING CANDIDATE: This would be clearer if the currSpineIndex === 0 case was
                    //   handled seperately.
                    if (currSpineIndex === 0 || spine.at(currSpineIndex).get("page_spread")) {

                        lastSpecifiedPageSpread = this.lastSpecifiedPageSpread(
                            spine.at(currSpineIndex).get("page_spread"),
                            pageProgDirection
                            );
                        numPagesBetween = spineIndex - currSpineIndex;

                        // Even number of pages between current and last spine item
                        if (numPagesBetween % 2 === 0) {

                            return lastSpecifiedPageSpread === "left" ? this.LEFT_PAGE :
                                lastSpecifiedPageSpread === "right" ? this.RIGHT_PAGE :
                                pageProgDirection === "rtl" ? this.LEFT_PAGE : this.RIGHT_PAGE;
                        }
                        // Odd number of pages between current and last spine item with a specified page-spread value
                        else {

                            return lastSpecifiedPageSpread === "left" ? this.RIGHT_PAGE :
                                lastSpecifiedPageSpread === "right" ? this.LEFT_PAGE :
                                pageProgDirection === "rtl" ? this.RIGHT_PAGE : this.LEFT_PAGE;
                        }
                    }
                }
            }
        },

        lastSpecifiedPageSpread : function (pageSpreadValue, pageProgDirection) {

            // Handles the case where currSpineIndex === 0 and a page-spread value has not been specified
            if (pageSpreadValue && pageSpreadValue !== "") {
                return pageSpreadValue;
            }
            else {
                return pageProgDirection === "rtl" ? "right" : "left";
            }
        }
    });
    return PageSpreadProperty;
});
define('models/package_document_parser',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {
    console.log('package_document_parser module id: ' + module.id);

    // `PackageDocumentParser` is used to parse the xml of an epub package
    // document and build a javascript object. The constructor accepts an
    // instance of `URI` that is used to resolve paths during the process
    var PackageDocumentParser = Backbone.Model.extend({

        initialize: function (attributes, options) {
            var thisParser = this;
            var epubFetch = thisParser.get('epubFetch');
            var deferredXmlDom = $.Deferred();
            thisParser.set('deferredXmlDom', deferredXmlDom);
            epubFetch.getPackageDom(function (packageDom) {
                thisParser.set('xmlDom', packageDom);
                deferredXmlDom.resolve(packageDom);
            });
        },

        // Parse an XML package document into a javascript object
        parse: function (callback) {
            var thisParser = this;
            var deferredXmlDom = thisParser.get('deferredXmlDom');
            deferredXmlDom.done(function (xmlDom) {
                var json, manifest, cover;

                json = {};
                json.metadata = thisParser.getJsonMetadata(xmlDom);
                json.bindings = thisParser.getJsonBindings(xmlDom);
                json.spine = thisParser.getJsonSpine(xmlDom);
                json.manifest = thisParser.getJsonManifest(xmlDom);

                // parse the page-progression-direction if it is present
                json.paginate_backwards = thisParser.paginateBackwards(xmlDom);

                // try to find a cover image
                cover = thisParser.getCoverHref(xmlDom);
                if (cover) {
                    json.metadata.cover_href = cover;
                }
                if (json.metadata.layout === "pre-paginated") {
                    json.metadata.fixed_layout = true;
                }

                // THIS SHOULD BE LEFT IN (BUT COMMENTED OUT), AS MO SUPPORT IS TEMPORARILY DISABLED
                // create a map of all the media overlay objects
                // json.mo_map = this.resolveMediaOverlays(json.manifest);

                // parse the spine into a proper collection
                json.spine = thisParser.parseSpineProperties(json.spine);

                // return the parse result
                callback(json);
            });
        },

        getJsonSpine: function () {
            var thisParser = this;

            var $spineElements;
            var jsonSpine = [];
            var xmlDom = thisParser.get("xmlDom");

            $spineElements = $("spine", xmlDom).children();
            $.each($spineElements, function (spineElementIndex, currSpineElement) {

                var $currSpineElement = $(currSpineElement);
                var spineItem = {

                    idref: $currSpineElement.attr("idref") ? $currSpineElement.attr("idref") : "",
                    linear: $currSpineElement.attr("linear") ? $currSpineElement.attr("linear") : "",
                    properties: $currSpineElement.attr("properties") ? $currSpineElement.attr("properties") : ""
                };

                jsonSpine.push(spineItem);
            });

            return jsonSpine;
        },

        getJsonMetadata: function () {
            var thisParser = this;

            var xmlDom = thisParser.get("xmlDom");
            var $metadata = $("metadata", xmlDom);
            var jsonMetadata = {};

            jsonMetadata.active_class = $("meta[property='media:active-class']", $metadata).text();
            jsonMetadata.author = $("creator", $metadata).text();
            jsonMetadata.description = $("description", $metadata).text();
            jsonMetadata.epub_version =
                $("package", xmlDom).attr("version") ? $("package", xmlDom).attr("version") : "";
            jsonMetadata.id = $("identifier", $metadata).text();
            jsonMetadata.language = $("language", $metadata).text();
            jsonMetadata.layout = $("meta[property='rendition:layout']", $metadata).text();
            jsonMetadata.modified_date = $("meta[property='dcterms:modified']", $metadata).text();
            jsonMetadata.ncx = $("spine", xmlDom).attr("toc") ? $("spine", xmlDom).attr("toc") : "";
            jsonMetadata.orientation = $("meta[property='rendition:orientation']", $metadata).text();
            jsonMetadata.page_prog_dir = $("spine", xmlDom).attr("page-progression-direction") ?
                $("spine", xmlDom).attr("page-progression-direction") : "";
            jsonMetadata.pubdate = $("date", $metadata).text();
            jsonMetadata.publisher = $("publisher", $metadata).text();
            jsonMetadata.rights = $("rights").text();
            jsonMetadata.spread = $("meta[property='rendition:spread']", $metadata).text();
            jsonMetadata.title = $("title", $metadata).text();

            return jsonMetadata;
        },

        getJsonManifest: function () {

            var thisParser = this;
            var epubFetch = thisParser.get('epubFetch');
            var xmlDom = thisParser.get("xmlDom");
            var $manifestItems = $("manifest", xmlDom).children();
            var jsonManifest = [];

            $.each($manifestItems, function (manifestElementIndex, currManifestElement) {

                var $currManifestElement = $(currManifestElement);
                var currManifestElementHref = $currManifestElement.attr("href") ? $currManifestElement.attr("href") :
                    "";
                var manifestItem = {

                    contentDocumentURI: currManifestElementHref,
                    href: currManifestElementHref,
                    id: $currManifestElement.attr("id") ? $currManifestElement.attr("id") : "",
                    media_overlay: $currManifestElement.attr("media-overlay") ?
                        $currManifestElement.attr("media-overlay") : "",
                    media_type: $currManifestElement.attr("media-type") ? $currManifestElement.attr("media-type") : "",
                    properties: $currManifestElement.attr("properties") ? $currManifestElement.attr("properties") : ""
                };
                console.log('pushing manifest item to JSON manifest. currManifestElementHref: [' + currManifestElementHref
                    + '], manifestItem.contentDocumentURI: [' + manifestItem.contentDocumentURI
                    + '], manifestItem:');
                console.log(manifestItem);
                jsonManifest.push(manifestItem);
            });

            return jsonManifest;
        },

        getJsonBindings: function () {

            var xmlDom = this.get("xmlDom");
            var $bindings = $("bindings", xmlDom).children();
            var jsonBindings = [];

            $.each($bindings, function (bindingElementIndex, currBindingElement) {

                var $currBindingElement = $(currBindingElement);
                var binding = {

                    handler: $currBindingElement.attr("handler") ? $currBindingElement.attr("handler") : "",
                    media_type: $currBindingElement.attr("media-type") ? $currBindingElement.attr("media-type") : ""
                };

                jsonBindings.push(binding);
            });

            return jsonBindings;
        },

        getCoverHref: function () {

            var dom = this.get("xmlDom");
            var manifest;
            var $imageNode;
            manifest = dom.getElementsByTagName('manifest')[0];

            // epub3 spec for a cover image is like this:
            /*<item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />*/
            $imageNode = $('item[properties~="cover-image"]', manifest);
            if ($imageNode.length === 1 && $imageNode.attr("href")) {
                return $imageNode.attr("href");
            }

            // some epub2's cover image is like this:
            /*<meta name="cover" content="cover-image-item-id" />*/
            var metaNode = $('meta[name="cover"]', dom);
            var contentAttr = metaNode.attr("content");
            if (metaNode.length === 1 && contentAttr) {
                $imageNode = $('item[id="' + contentAttr + '"]', manifest);
                if ($imageNode.length === 1 && $imageNode.attr("href")) {
                    return $imageNode.attr("href");
                }
            }

            // that didn't seem to work so, it think epub2 just uses item with id=cover
            $imageNode = $('#cover', manifest);
            if ($imageNode.length === 1 && $imageNode.attr("href")) {
                return $imageNode.attr("href");
            }

            // seems like there isn't one, thats ok...
            return null;
        },

        parseSpineProperties: function (spine) {

            var parseProperiesString = function (str) {
                var properties = {};
                var allPropStrs = str.split(" "); // split it on white space
                for (var i = 0; i < allPropStrs.length; i++) {
                    // brute force!!!
                    //rendition:orientation landscape | portrait | auto
                    //rendition:spread none | landscape | portrait | both | auto

                    //rendition:page-spread-center
                    //page-spread | left | right
                    //rendition:layout reflowable | pre-paginated
                    if (allPropStrs[i] === "rendition:page-spread-center") properties.page_spread = "center";
                    if (allPropStrs[i] === "page-spread-left") properties.page_spread = "left";
                    if (allPropStrs[i] === "page-spread-right") properties.page_spread = "right";
                    if (allPropStrs[i] === "page-spread-right") properties.page_spread = "right";
                    if (allPropStrs[i] === "rendition:layout-reflowable") properties.fixed_flow = false;
                    if (allPropStrs[i] === "rendition:layout-pre-paginated") properties.fixed_flow = true;
                }
                return properties;

            }

            for (var i = 0; i < spine.length; i++) {
                var props = parseProperiesString(spine[i].properties);
                // add all the properties to the spine item
                _.extend(spine[i], props);
            }
            return spine;
        },

        // resolve the url of smils on any manifest items that have a MO
        // attribute

        // NOTE: Removed media overlay support for the module refactoring

        // resolveMediaOverlays : function(manifest) {
        //     var that = this;
        //     var momap = {};

        //     // create a bunch of media overlay objects
        //     manifest.forEach( function(item) {
        //         if(item.get("media_type") === "application/smil+xml") {
        //             var url = that.resolveUri(item.get("href"));
        //             var moObject = new EpubParser.MediaOverlay();
        //             moObject.setUrl(url);
        //             moObject.fetch();
        //             momap[item.id] = moObject;
        //         }
        //     });
        //     return momap;
        // },

        // parse the EPUB3 `page-progression-direction` attribute
        paginateBackwards: function () {

            var xmlDom = this.get("xmlDom");
            return $('spine', xmlDom).attr('page-progression-direction') === "rtl";
        }
    });
    return PackageDocumentParser;
});

define('models/package_document',['require', 'module', 'jquery', 'underscore', 'backbone', 'URIjs/URI', './manifest', './spine', './metadata',
    './page_spread_property', './package_document_parser'],
    function (require, module, $, _, Backbone, URI, Manifest, Spine, Metadata, PageSpreadProperty, PackageDocumentParser) {
    console.log('package_document module id: ' + module.id);

    // Description: This model provides an interface for navigating an EPUB's package document
    var PackageDocument = Backbone.Model.extend({

        initialize : function (attributes, options) {

            var that = this;
            // Initialize package document parser 
            var packageDocParser = new PackageDocumentParser({
                epubFetch : this.get("epubFetch")
            });

            packageDocParser.parse(function (packageDocument) {

                that.manifest = new Manifest(packageDocument.manifest);
                that.spine = new Spine(packageDocument.spine);
                that.metadata = new Metadata(packageDocument.metadata);
                that.bindings = new Spine(packageDocument.bindings);
                that.pageSpreadProperty = new PageSpreadProperty();

                // If this book is fixed layout, assign the page spread class
                if (that.isFixedLayout()) {
                    that.assignPageSpreadClass();
                }

                that.get("onParsedCallback")();
            });
        },

        getPackageData : function () {

            var that = this;
            var spinePackageData = [];
            var packageDocumentURL = this.get("epubFetch").get("packageDocumentURL");
            var packageDocRoot = packageDocumentURL.substr(0, packageDocumentURL.lastIndexOf("/"));

            this.spine.each(function (spineItem) {
                spinePackageData.push(that.generatePackageData(spineItem));
            });
            
            // This is where the package data format thing is generated
            return {
                rootUrl : packageDocRoot,
                rendition_layout : this.isFixedLayout(),
                spine : {
                    direction : this.pageProgressionDirection(),
                    items : spinePackageData    
                }
            };
        },

        isFixedLayout : function () {

            if (this.metadata.get("fixed_layout")) {
                return true;
            }
            else {
                return false;
            }
        },

        getManifestItemById : function (id) {

            var foundManifestItem = this.manifest.find(
                function (manifestItem) {
                    if (manifestItem.get("id") === id) {
                        return manifestItem;
                    }
                });

            if (foundManifestItem) {
                return foundManifestItem.toJSON();
            }
            else {
                return undefined;
            }
        },

        getManifestItemByIdref : function (idref) {

            var foundManifestItem = this.getManifestItemById(idref);
            if (foundManifestItem) {
                return foundManifestItem;
            }
            else {
                return undefined;
            }
        },

        getSpineItemByIdref : function (idref) {

            var foundSpineItem = this.getSpineModelByIdref(idref);
            if (foundSpineItem) {
                return foundSpineItem.toJSON();
            }
            else {
                return undefined;
            }
        },

        getSpineItem : function (spineIndex) {

            var spineItem = this.spine.at(spineIndex);
            if (spineItem) {
                return spineItem.toJSON();
            }
            else {
                return undefined;
            }
        },

        spineLength : function () {
            return this.spine.length;
        },

        // Description: gets the next position in the spine for which the
        // spineItem does not have `linear='no'`. The start
        // param is the non-inclusive position to begin the search
        // from. If start is not supplied, the search will begin at
        // postion 0. If no linear position can be found, this
        // function returns undefined
        getNextLinearSpinePosition : function (currSpineIndex) {

            var spine = this.spine;
            if (currSpineIndex === undefined || currSpineIndex < 0) {
                currSpineIndex = 0;

                if (spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            while (currSpineIndex < this.spineLength() - 1) {
                currSpineIndex += 1;
                if (spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            // No next linear spine position.
            return undefined;
        },

        // Description: gets the previous position in the spine for which the
        // spineItem does not have `linear='no'`. The start
        // param is the non-inclusive position to begin the search
        // from. If start is not supplied, the search will begin at
        // the end of the spine. If no linear position can be found,
        // this function returns undefined
        getPrevLinearSpinePosition : function(currSpineIndex) {

            var spine = this.spine;
            if (currSpineIndex === undefined || currSpineIndex > this.spineLength() - 1) {
                currSpineIndex = this.spineLength() - 1;

                if (spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            while (currSpineIndex > 0) {
                currSpineIndex -= 1;
                if (spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            // No previous linear spine position.
            return undefined;
        },

        hasNextSection: function(currSpineIndex) {

            if (currSpineIndex >= 0 &&
                currSpineIndex <= this.spineLength() - 1) {

                return this.getNextLinearSpinePosition(currSpineIndex) > -1;
            }
            else {
                return false;
            }
        },

        hasPrevSection: function(currSpineIndex) {

            if (currSpineIndex >= 0 &&
                currSpineIndex <= this.spineLength() - 1) {

                return this.getPrevLinearSpinePosition(currSpineIndex) > -1;
            }
            else {
                return false;
            }
        },

        pageProgressionDirection : function () {

            if (this.metadata.get("page_prog_dir") === "rtl") {
                return "rtl";
            }
            else if (this.metadata.get("page_prog_dir") === "default") {
                return "default";
            }
            else {
                return "ltr";
            }
        },

        getSpineIndexByHref : function (manifestHref) {

            var spineItem = this.getSpineModelFromHref(manifestHref);
            return this.getSpineIndex(spineItem);
        },

        getBindingByHandler : function (handler) {

            var binding = this.bindings.find(
                function (binding) {

                    if (binding.get("handler") === handler) {
                        return binding;
                    }
                });

            if (binding) {
                return binding.toJSON();
            }
            else {
                return undefined;
            }
        },

        generatePackageData : function (spineItem) {

            var fixedLayoutProperty = "reflowable";
            // var fixedLayoutType = undefined;
            var manifestItem = this.getManifestModelByIdref(spineItem.get("idref"));
            // var isLinear;
            // var firstPageIsOffset;
            var pageSpread;

            // Get fixed layout properties
            if (spineItem.isFixedLayout() || this.isFixedLayout()) {
                isFixedLayout = true;
                fixedLayoutProperty = "pre-paginated";
                // if (manifestItem.isSvg()) {
                //     fixedLayoutType = "svg";
                // }
                // else if (manifestItem.isImage()) {
                //     fixedLayoutType = "image";
                // }
                // else {
                //     fixedLayoutType = "xhtml";
                // }
            }

            // Set primary reading order attribute
            // if (spineItem.get("linear").trim() === "no") {
            //     isLinear = false;
            // }
            // else {
            //     isLinear = true;
            // }

            pageSpread = spineItem.get("page_spread");
            // Set first page is offset parameter
            // if (!isFixedLayout) {
            //     if (this.pageProgressionDirection() === "ltr" && pageSpread === "right") {
            //         firstPageIsOffset = true;
            //     }
            //     else if (this.pageProgressionDirection() === "rtl" && pageSpread === "left") {
            //         firstPageIsOffset = true;
            //     }
            //     else {
            //         firstPageIsOffset = false;
            //     }
            // }

            if (pageSpread === "left") {
                pageSpread = "page-spread-left";
            }
            else if (pageSpread === "right") {
                pageSpread = "page-spread-right";
            }
            else if (pageSpread === "center") {
                pageSpread = "page-spread-center";
            }

            var spineInfo = {
                href : this.getManifestItemByIdref(spineItem.get("idref")).contentDocumentURI,
                idref : spineItem.get("idref"),
                page_spread : pageSpread,
                rendition_layout : fixedLayoutProperty
            };

            return spineInfo;
        },

        // TODO apparently unused method, and in the incorrect module (should be in epub-parser?)
        getPackageDocumentDOM : function (callback) {
            this.get('epubFetch').getPackageDom(callback);
        },

        getToc : function () {

            var item = this.getTocItem();
            if (item) {
                var href = item.get("contentDocumentURI");
                return href;
            }
            return null;
        },

        getTocText: function (callback) {
            var tocUrl = this.getToc();
            console.log('tocUrl: [' + tocUrl + ']');

            this.get('epubFetch').relativeToPackageFetchFileContents(tocUrl, 'text', function (tocDocumentText) {
                callback(tocDocumentText)
            }, function (err) {
                console.error('ERROR fetching TOC from [' + this.getToc() + ']:');
                console.error(err);
                callback(undefined);
            });
        },

        getTocDom: function (callback) {
            this.getTocText(function (tocText) {
                if (typeof tocText === 'string') {
                    var tocDom = (new DOMParser()).parseFromString(tocText, "text/xml");
                    callback(tocDom);
                } else {
                    callback(undefined);
                }
            });
        },

        // Description: This is a convenience method that will generate an html list structure from an ncx XML
        //   document.
        generateTocListDOM: function (callback) {
            var that = this;
            that.getTocDom(function (tocDom) {
                if (tocDom) {
                    if (that.tocIsNcx()) {
                        var $ncxOrderedList;
                        $ncxOrderedList = that.getNcxOrderedList($("navMap", tocDom));
                        callback($ncxOrderedList[0]);
                    } else {
                        var packageDocumentURL = that.get('epubFetch').getPackageDocumentURL();
                        var packageDocumentAbsoluteURL = new URI(packageDocumentURL).absoluteTo(document.URL);
                        var tocDocumentAbsoluteURL = new URI(that.getToc()).absoluteTo(document.URL);
                        // add a BASE tag to change the TOC document's baseURI.
                        var oldBaseTag = $(tocDom).remove('base');
                        var newBaseTag = $('<base></base>');
                        $(newBaseTag).attr('href', tocDocumentAbsoluteURL);
                        $(tocDom).find('head').append(newBaseTag);
                        // TODO: fix TOC hrefs both for exploded in zipped EPUBs
                        callback(tocDom);
                    }
                } else {
                    callback(undefined);
                }
            });
        },

        tocIsNcx : function () {

            var tocItem = this.getTocItem();
            var contentDocURI = tocItem.get("contentDocumentURI");
            var fileExtension = contentDocURI.substr(contentDocURI.lastIndexOf('.') + 1);

            if (fileExtension.trim().toLowerCase() === "ncx") {
                return true;
            }
            else {
                return false;
            }
        },

        // ----------------------- PRIVATE HELPERS -------------------------------- //

        getNcxOrderedList : function ($navMapDOM) {

            var that = this;
            var $ol = $("<ol></ol>");
            $.each($navMapDOM.children("navPoint"), function (index, navPoint) {
                that.addNavPointElements($(navPoint), $ol);
            });
            return $ol;
        },

        // Description: Constructs an html representation of NCX navPoints, based on an object of navPoint information
        // Rationale: This is a recursive method, as NCX navPoint elements can nest 0 or more of themselves as children
        addNavPointElements : function ($navPointDOM, $ol) {

            var that = this;

            // Add the current navPoint element to the TOC html
            var navText = $navPointDOM.children("navLabel").text().trim();
            var navHref = $navPointDOM.children("content").attr("src");
            var $navPointLi = $("<li class='nav-elem'><a href='" + navHref + "'>'" + navText + "'</a></li>");

            // Append nav point info
            $ol.append($navPointLi);

            // Append ordered list of nav points
            if ($navPointDOM.children("navPoint").length > 0 ) {

                var $newLi = $("<li></li>");
                var $newOl = $("<ol></ol>");
                $.each($navPointDOM.children("navPoint"), function (navIndex, navPoint) {
                    $newOl.append(that.addNavPointElements($(navPoint), $newOl));
                });

                $newLi.append($newOl);
                $ol.append($newLi);
            }
        },

        // Refactoring candidate: This search will always iterate through entire manifest; this should be modified to
        //   return when the manifest item is found.
        getSpineModelFromHref : function (manifestHref) {

            var that = this;
            var resourceURI = new URI(manifestHref);
            var resourceName = resourceURI.filename();
            var foundSpineModel;

            this.manifest.each(function (manifestItem) {

                var manifestItemURI = new URI(manifestItem.get("href"));
                var manifestItemName = manifestItemURI.filename();

                // Rationale: Return a spine model based on the manifest item id, which is the idref of the spine item
                if (manifestItemName === resourceName) {
                    foundSpineModel = that.getSpineModelByIdref(manifestItem.get("id"));
                }
            });

            return foundSpineModel;
        },

        getSpineModelByIdref : function (idref) {

            var foundSpineItem = this.spine.find(
                function (spineItem) {
                    if (spineItem.get("idref") === idref) {
                        return spineItem;
                    }
                });

            return foundSpineItem;
        },

        getManifestModelByIdref : function (idref) {

            var foundManifestItem = this.manifest.find(
                function (manifestItem) {
                    if (manifestItem.get("id") === idref) {
                        return manifestItem;
                    }
                });

            return foundManifestItem;
        },

        getSpineIndex : function (spineItem) {

            return this.spine.indexOf(spineItem);
        },

        // Description: When rendering fixed layout pages we need to determine whether the page
        //   should be on the left or the right in two up mode, options are:
        //     left_page:      render on the left side
        //     right_page:     render on the right side
        //     center_page:    always center the page horizontally
        //   This property must be assigned when the package document is initialized
        // NOTE: Look into how spine items with the linear="no" property affect this algorithm
        assignPageSpreadClass : function () {

            var that = this;
            var pageSpreadClass;
            var numSpineItems;

            // If the epub is apple fixed layout
            if (this.metadata.get("apple_fixed")) {

                numSpineItems = this.spine.length;
                this.spine.each(function (spineItem, spineIndex) {

                    pageSpreadClass = that.pageSpreadProperty.inferiBooksPageSpread(spineIndex, numSpineItems);
                    spineItem.set({ pageSpreadClass : pageSpreadClass });
                });
            }
            else {
                // For each spine item
                this.spine.each(function (spineItem, spineIndex) {

                    if (spineItem.get("page_spread")) {

                        pageSpreadClass = that.pageSpreadProperty.getPageSpreadFromProperties(spineItem.get("page_spread"));
                        spineItem.set({ pageSpreadClass : pageSpreadClass });
                    }
                    else {

                        pageSpreadClass = that.pageSpreadProperty.inferUnassignedPageSpread(spineIndex, that.spine, that.pageProgressionDirection());
                        spineItem.set({ pageSpreadClass : pageSpreadClass });
                    }
                });
            }
        },

        getTocItem : function() {

            var manifest = this.manifest;
            var metadata = this.metadata;
            var spine_id = this.metadata.get("ncx");

            var item = manifest.find(function(item){

                if (item.get("properties").indexOf("nav") !== -1) {
                    return true;
                }
                else {
                    return false;
                }
            });

            if( item ) {
                return item;
            }

            if( spine_id && spine_id.length > 0 ) {
                return manifest.find(function(item) {
                    return item.get("id") === spine_id;
                });
            }

            return null;
        }

        // NOTE: Media overlays are temporarily disabled
        // getMediaOverlayItem : function(idref) {
        //     // just look up the object in the mo_map
        //     var map = this.get("mo_map");
        //     return map && map[idref];
        // },
    });
    return PackageDocument;
});

define('epub_module',['require', 'module', 'jquery', 'underscore', 'backbone', './models/package_document' ],
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

define('epub_reading_system',['require', 'module'], function (require, module) {

    // Taken from https://raw.github.com/readium/readium/master/scripts/epub_reading_system.js

    // The epubReadingSystem object provides an interface through which a Scripted Content
    // Document can query information about a User's Reading System.
    //
    // More information is available [here](http://idpf.org/epub/30/spec/epub30-contentdocs.html#app-epubReadingSystem)

    // Has to be global per spec.
    navigator.epubReadingSystem = {
        name: "Readium.js",
        version: "0.0.1",
        layoutStyle: "paginated",

        hasFeature: function (feature, version) {

            // for now all features must be version 1.0 so fail fast if the user has asked for something else
            if (version && version !== "1.0") {
                return false;
            }

            if (feature === "dom-manipulation") {
                // Scripts may make structural changes to the document’s DOM (applies to spine-level scripting only).
                return true;
            }
            if (feature === "layout-changes") {
                // Scripts may modify attributes and CSS styles that affect content layout (applies to spine-level scripting only).
                return true;
            }
            if (feature === "touch-events") {
                // The device supports touch events and the Reading System passes touch events to the content.
                return false;
            }
            if (feature === "mouse-events") {
                // The device supports mouse events and the Reading System passes mouse events to the content.
                return true;
            }
            if (feature === "keyboard-events") {
                // The device supports keyboard events and the Reading System passes keyboard events to the content.
                return true;
            }
            if (feature === "spine-scripting") {
                //Spine-level scripting is supported.
                return true;
            }

            return false;

        }
    }
    return navigator.epubReadingSystem;
});
define('epub_renderer_module', ['require', 'module', 'jquery', 'underscore', 'backbone'],

    function (require, module, $, _, Backbone) {

//  LauncherOSX
//
//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.


/**
 * Top level ReadiumSDK namespace
 * @class ReadiumSDK
 * @static
 */
ReadiumSDK = {

    /**
     Current version of the JS SDK
     @method version
     @static
     @return {string} version
     */
    version: function() {
        return "0.5.1";
    },

    Models : {},
    Views : {},
    Collections: {},
    Routers: {},
    Helpers: {}

};

_.extend(ReadiumSDK, Backbone.Events);

define("readiumSDK", function(){});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.


ReadiumSDK.Helpers.Rect = function(left, top, width, height) {

    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;

    this.right = function () {
        return this.left + this.width;
    };

    this.bottom = function() {
        return this.top + this.height;
    };

    this.isOverlap = function(rect, tolerance) {

        if(tolerance == undefined) {
            tolerance = 0;
        }

        return !(rect.right() < this.left + tolerance
            || rect.left > this.right() - tolerance
            || rect.bottom() < this.top + tolerance
            || rect.top > this.bottom() - tolerance);


    }
};


//This method treats multicolumn view as one long column and finds the rectangle of the element in this "long" column
//we are not using jQuery Offset() and width()/height() function because for multicolumn rendition_layout it produces rectangle as a bounding box of element that
// reflows between columns this is inconstant and difficult to analyze .
ReadiumSDK.Helpers.Rect.fromElement = function($element) {

    var e = $element[0];

    var offsetLeft = e.offsetLeft;
    var offsetTop = e.offsetTop;
    var offsetWidth = e.offsetWidth;
    var offsetHeight = e.offsetHeight;

    while(e = e.offsetParent) {
        offsetLeft += e.offsetLeft;
        offsetTop += e.offsetTop;
    }

    return new ReadiumSDK.Helpers.Rect(offsetLeft, offsetTop, offsetWidth, offsetHeight);
};

ReadiumSDK.Helpers.LoadIframe = function(iframe, src, callback, context) {

    var isWaitingForFrameLoad = true;

    iframe.onload = function() {

        isWaitingForFrameLoad = false;
        callback.call(context, true);

    };

    //yucks! iframe doesn't trigger onerror event - there is no reliable way to know that iframe finished
    // attempt tot load resource (successfully or not;
    window.setTimeout(function(){

        if(isWaitingForFrameLoad) {
            isWaitingForFrameLoad = false;
            callback.call(context, false);
        }

    }, 500);

    iframe.src = src;
};


/**
 * @return {string}
 */
ReadiumSDK.Helpers.ResolveContentRef = function(contentRef, sourceFileHref) {

    if(!sourceFileHref) {
        return contentRef;
    }

    var sourceParts = sourceFileHref.split("/");
    sourceParts.pop(); //remove source file name

    var pathComponents = contentRef.split("/");

    while(sourceParts.length  > 0 && pathComponents[0] === "..") {

        sourceParts.pop();
        pathComponents.splice(0, 1);
    }

    var combined = sourceParts.concat(pathComponents);

    return combined.join("/");

};

/**
 * @return {boolean}
 */
ReadiumSDK.Helpers.EndsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};


define("helpers", function(){});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * Setter fot epub Triggers
 *
 *
 * @param domNode
 */

ReadiumSDK.Models.Trigger = function(domNode) {
    var $el = $(domNode);
    this.action 	= $el.attr("action");
    this.ref 		= $el.attr("ref");
    this.event 		= $el.attr("ev:event");
    this.observer 	= $el.attr("ev:observer");
    this.ref 		= $el.attr("ref");
};

ReadiumSDK.Models.Trigger.prototype.subscribe = function(dom) {
    var selector = "#" + this.observer;
    var that = this;
    $(selector, dom).on(this.event, function() {
        that.execute(dom);
    });
};

ReadiumSDK.Models.Trigger.prototype.execute = function(dom) {
    var $target = $( "#" + this.ref, dom);
    switch(this.action)
    {
        case "show":
            $target.css("visibility", "visible");
            break;
        case "hide":
            $target.css("visibility", "hidden");
            break;
        case "play":
            $target[0].currentTime = 0;
            $target[0].play();
            break;
        case "pause":
            $target[0].pause();
            break;
        case "resume":
            $target[0].play();
            break;
        case "mute":
            $target[0].muted = true;
            break;
        case "unmute":
            $target[0].muted = false;
            break;
        default:
            console.log("do not no how to handle trigger " + this.action);
    }
};

define("triggers", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.


/**
 @class ReadiumSDK.Models.BookmarkData
 */
ReadiumSDK.Models.BookmarkData = function(idref, contentCFI) {

    /**
     * spine item idref
     * @property idref
     * @type {string}
     */
    this.idref = idref;

    /**
     * cfi of the first visible element
     * @property contentCFI
     * @type {string}
     */
    this.contentCFI = contentCFI;

};
define("bookmarkData", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * Wrapper of the SpineItem object received from the host application
 *
 * @class ReadiumSDK.Models.SpineItem
 *
 * @param itemData spine item properties container
 * @param {Number} index
 * @param {ReadiumSDK.Models.Spine} spine
 *
 */

ReadiumSDK.Models.SpineItem = function(itemData, index, spine){

    this.idref = itemData.idref;
    this.href = itemData.href;
    this.page_spread = itemData.page_spread;
    this.rendition_layout = itemData.rendition_layout;
    this.index = index;
    this.spine = spine;

    this.isLeftPage = function() {
        return this.page_spread === "page-spread-left";
    };

    this.isRightPage = function() {
        return this.page_spread === "page-spread-right";
    };

    this.isCenterPage = function() {
        return !this.isLeftPage() && !this.isRightPage();
    };

    this.isReflowable = function() {
        return !this.isFixedLayout();
    };

    this.isFixedLayout = function() {
        return this.rendition_layout ? this.rendition_layout === "pre-paginated" : this.spine.package.isFixedLayout();
    }

};
define("spineItem", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 *  Wrapper of the spine object received from hosting application
 *
 *  @class  ReadiumSDK.Models.Spine
 */

ReadiumSDK.Models.Spine = Backbone.Model.extend({

    /*
     * Collection of spine items
     * @property items
     * @type {Array}
     */
    items: [],

    /*
     * Page progression direction ltr|rtl|default
     * @property direction
     * @type {string}
     */
    direction: undefined,

    /*
     * @property package
     * @type {ReadiumSDK.Models.Package}
     *
     */
    package: undefined,

    initialize : function() {

        this.reset();

        this.package = this.get("package");
        var spineData = this.get("spineData");

        if(spineData) {

            this.direction = spineData.direction;
            if(!this.direction) {
                this.direction = "ltr";
            }

            var length = spineData.items.length;
            for(var i = 0; i < length; i++) {
                var item = new ReadiumSDK.Models.SpineItem(spineData.items[i], i, this);
                this.items.push(item);
            }
        }

    },

    reset: function() {
        this.items = [];
        this.direction = undefined;
        this.package = undefined;
    },

    prevItem:  function(item) {

        if(this.isValidIndex(item.index - 1)) {
            return this.items[item.index - 1];
        }

        return undefined;
    },

    nextItem: function(item){

        if(this.isValidIndex(item.index + 1)) {
            return this.items[item.index + 1];
        }

        return undefined;
    },

    getItemUrl: function(item) {

        if(this.package.rootUrl) {

            if(ReadiumSDK.Helpers.EndsWith(this.package.rootUrl, "/")){
                return this.package.rootUrl + item.href;
            }
            else {
                return this.package.rootUrl + "/" + item.href;
            }
        }

        return item.href;

    },

    isValidIndex: function(index) {

        return index >= 0 && index < this.items.length;
    },

    first: function() {
        return this.items[0];
    },

    last: function() {
        return this.items[this.items.length - 1];
    },

    item: function(index) {
        return this.item(index);
    },

    isRightToLeft: function() {

        return this.direction == "rtl";
    },

    isLeftToRight: function() {

        return !this.isRightToLeft();
    },

    getItemById: function(idref) {

        var length = this.items.length;

        for(var i = 0; i < length; i++) {
            if(this.items[i].idref == idref) {

                return this.items[i];
            }
        }

        return undefined;
    },

    getItemByHref: function(href) {

        var length = this.items.length;

        for(var i = 0; i < length; i++) {
            if(this.items[i].href == href) {

                return this.items[i];
            }
        }

        return undefined;
    }

});

define("spine", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 *
 *
 *
 * @param {ReadiumSDK.Models.Spine} spine
 * @constructor
 */

ReadiumSDK.Models.Spread = function(spine) {

    this.spine = spine;

    this.leftItem = undefined;
    this.rightItem = undefined;
    this.centerItem = undefined;

    this.isSyntheticSpread = true;

    this.setSyntheticSpread = function(isSyntheticSpread) {
        this.isSyntheticSpread = isSyntheticSpread;
    };

    this.openFirst = function() {

        if( this.spine.items.length == 0 ) {
            this.resetItems();
        }
        else {
            this.openItem(this.spine.first());
        }
    };

    this.openLast = function() {

        if( this.spine.items.length == 0 ) {
            this.resetItems();
        }
        else {
            this.openItem(this.spine.last());
        }
    };

    this.openItem = function(item) {

        this.resetItems();
        this.setItem(item);

        var neighbourItem = this.getNeighbourItem(item);

        if(neighbourItem) {
            this.setItem(neighbourItem);
        }
    };

    this.resetItems = function() {

        this.leftItem = undefined;
        this.rightItem = undefined;
        this.centerItem = undefined;

    };

    this.setItem = function(item) {

        if(!this.isSyntheticSpread) {
            this.centerItem = item;
            return;
        }

        if(item.isLeftPage()) {
            this.leftItem = item;
        }
        else if (item.isRightPage()) {
            this.rightItem = item;
        }
        else {
            this.centerItem = item;
        }
    };

    this.openNext = function() {

        var items = this.validItems();

        if(items.length == 0) {

            this.openFirst();
        }
        else {

            var nextItem = this.spine.nextItem(items[items.length - 1]);
            if(nextItem) {

                this.openItem(nextItem);
            }
        }
    }

    this.openPrev = function() {

        var items = this.validItems();

        if(items.length == 0) {
            this.openLast();
        }
        else {

            var prevItem = this.spine.prevItem(items[0]);
            if(prevItem) {

                this.openItem(prevItem);

            }
        }
    };

    this.validItems = function() {

        var arr = [];

        if(this.leftItem) arr.push(this.leftItem);
        if(this.rightItem) arr.push(this.rightItem);
        if(this.centerItem) arr.push(this.centerItem);

        arr.sort(function(a, b) {
            return a.index - b.index;
        });

        return arr;
    }

    this.getNeighbourItem = function(item) {

        var neighbourItem = undefined;

        if(!this.isSyntheticSpread) {
            return neighbourItem;
        }

        if(item.isLeftPage()) {

            neighbourItem = this.spine.isRightToLeft() ? this.spine.prevItem(item) : this.spine.nextItem(item);
        }
        else if(item.isRightPage()) {

            neighbourItem = this.spine.isRightToLeft() ? this.spine.nextItem(item) : this.spine.prevItem(item);
        }

        if(neighbourItem && (neighbourItem.isCenterPage() || neighbourItem.page_spread === item.page_spread) ) {

            neighbourItem = undefined;
        }

        return neighbourItem;
    };

};
define("fixedPageSpread", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 *
 * @class ReadiumSDK.Models.Package
 */

ReadiumSDK.Models.Package = Backbone.Model.extend({


    spine: undefined,


    rendition_layout: undefined,
    rootUrl: undefined,


    initialize : function() {

        this.reset();

        var packageData = this.get("packageData");

        if(packageData) {

            this.rootUrl = packageData.rootUrl;
            this.rendition_layout = packageData.rendition_layout;

            if(!this.rendition_layout) {
                this.rendition_layout = "reflowable";
            }

            this.spine = new ReadiumSDK.Models.Spine({spineData: packageData.spine, package: this});

        }

    },

    reset: function() {
        this.spine = undefined;
        this.rendition_layout = undefined;
        this.rootUrl = undefined;
    },

    isFixedLayout: function() {
        return this.rendition_layout === "pre-paginated";
    },

    isReflowable: function() {
        return !this.isFixedLayout();
    }
});

define("package", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.


ReadiumSDK.Models.ViewerSettings = function(settingsData) {

    this.isSyntheticSpread = true;
    this.fontSize = 100;
    this.columnGap = 20;

    this.update = function(settingsData) {

        if(settingsData.isSyntheticSpread !== undefined) {
            this.isSyntheticSpread = settingsData.isSyntheticSpread;
        }

        if(settingsData.columnGap !== undefined) {
            this.columnGap = settingsData.columnGap;
        }

        if(settingsData.fontSize !== undefined) {
            this.fontSize = settingsData.fontSize;
        }
    };

    this.update(settingsData);
};
define("viewerSettings", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
Used to report pagination state back to the host application

@class ReadiumSDK.Models.CurrentPagesInfo

@constructor

@param {Number} spineItemCount Number of spine items
@param {boolean} isFixedLayout is fixed or reflowable spine item
@param {string} pageProgressionDirection ltr | rtl
*/

ReadiumSDK.Models.CurrentPagesInfo = function(spineItemCount, isFixedLayout, pageProgressionDirection) {


    this.pageProgressionDirection = pageProgressionDirection;
    this.isFixedLayout = isFixedLayout;
    this.spineItemCount = spineItemCount;
    this.openPages = [];

    this.addOpenPage = function(spineItemPageIndex, spineItemPageCount, idref, spineItemIndex) {
        this.openPages.push({spineItemPageIndex: spineItemPageIndex, spineItemPageCount: spineItemPageCount, idref: idref, spineItemIndex: spineItemIndex});

        this.sort();
    };

    this.sort = function() {

        this.openPages.sort(function(a, b) {

            if(a.spineItemIndex != b.spineItemIndex) {
                return a.spineItemIndex - b.spineItemIndex;
            }

            return a.pageIndex - b.pageIndex;

        });

    };

};

define("currentPagesInfo", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * Representation of opening page request
 * Provides the spine item to be opened and one of the following properties:
 *  spineItemPageIndex {Number},
 *  elementId {String},
 *  elementCfi {String},
 *  firstPage {bool},
 *  lastPage {bool}
 *
 * @param {ReadiumSDK.Models.SpineItem} spineItem
 *
 * @constructor
 */
ReadiumSDK.Models.PageOpenRequest = function(spineItem) {

    this.spineItem = spineItem;
    this.spineItemPageIndex = undefined;
    this.elementId = undefined;
    this.elementCfi = undefined;
    this.firstPage = false;
    this.lastPage = false;

    this.reset = function() {
        this.spineItemPageIndex = undefined;
        this.elementId = undefined;
        this.elementCfi = undefined;
        this.firstPage = false;
        this.lastPage = false;
    };

    this.setFirstPage = function() {
        this.reset();
        this.firstPage = true;
    };

    this.setLastPage = function() {
        this.reset();
        this.lastPage = true;
    };

    this.setPageIndex = function(pageIndex) {
        this.reset();
        this.spineItemPageIndex = pageIndex;
    };

    this.setElementId = function(elementId) {
        this.reset();
        this.elementId = elementId;
    };

    this.setElementCfi = function(elementCfi) {

        this.reset();
        this.elementCfi = elementCfi;
    };


};

define("pageOpenRequest", function(){});

(function(global) {
    
    var EPUBcfi = {};

    EPUBcfi.Parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "fragment": parse_fragment,
        "path": parse_path,
        "local_path": parse_local_path,
        "indexStep": parse_indexStep,
        "indirectionStep": parse_indirectionStep,
        "terminus": parse_terminus,
        "idAssertion": parse_idAssertion,
        "textLocationAssertion": parse_textLocationAssertion,
        "parameter": parse_parameter,
        "csv": parse_csv,
        "valueNoSpace": parse_valueNoSpace,
        "value": parse_value,
        "escapedSpecialChars": parse_escapedSpecialChars,
        "number": parse_number,
        "integer": parse_integer,
        "space": parse_space,
        "circumflex": parse_circumflex,
        "doubleQuote": parse_doubleQuote,
        "squareBracket": parse_squareBracket,
        "parentheses": parse_parentheses,
        "comma": parse_comma,
        "semicolon": parse_semicolon,
        "equal": parse_equal,
        "character": parse_character
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "fragment";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_fragment() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 8) === "epubcfi(") {
          result0 = "epubcfi(";
          pos += 8;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"epubcfi(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_path();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 41) {
              result2 = ")";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\")\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, pathVal) { 
                
                return { type:"CFIAST", cfiString:pathVal }; 
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_path() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_indexStep();
        if (result0 !== null) {
          result1 = parse_local_path();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepVal, localPathVal) { 
        
                return { type:"cfiString", path:stepVal, localPath:localPathVal }; 
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_local_path() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result1 = parse_indexStep();
        if (result1 === null) {
          result1 = parse_indirectionStep();
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_indexStep();
            if (result1 === null) {
              result1 = parse_indirectionStep();
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse_terminus();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, localPathStepVal, termStepVal) { 
        
                return { steps:localPathStepVal, termStep:termStepVal }; 
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_indexStep() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 47) {
          result0 = "/";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 91) {
              result2 = "[";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"[\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_idAssertion();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepLengthVal, assertVal) { 
        
                return { type:"indexStep", stepLength:stepLengthVal, idAssertion:assertVal[1] };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_indirectionStep() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "!/") {
          result0 = "!/";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"!/\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 91) {
              result2 = "[";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"[\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_idAssertion();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepLengthVal, assertVal) { 
        
                return { type:"indirectionStep", stepLength:stepLengthVal, idAssertion:assertVal[1] };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_terminus() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 91) {
              result2 = "[";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"[\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_textLocationAssertion();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, textOffsetValue, textLocAssertVal) { 
        
                return { type:"textTerminus", offsetValue:textOffsetValue, textAssertion:textLocAssertVal[1] };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_idAssertion() {
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_value();
        if (result0 !== null) {
          result0 = (function(offset, idVal) { 
        
                return idVal; 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_textLocationAssertion() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_csv();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_parameter();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, csvVal, paramVal) { 
        
                return { type:"textLocationAssertion", csv:csvVal, parameter:paramVal }; 
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_parameter() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 59) {
          result0 = ";";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_valueNoSpace();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 61) {
              result2 = "=";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_valueNoSpace();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, paramLHSVal, paramRHSVal) { 
        
                return { type:"parameter", LHSValue:paramLHSVal, RHSValue:paramRHSVal }; 
            })(pos0, result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_csv() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_value();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 44) {
            result1 = ",";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\",\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_value();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, preAssertionVal, postAssertionVal) { 
        
                return { type:"csv", preAssertion:preAssertionVal, postAssertion:postAssertionVal }; 
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_valueNoSpace() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_escapedSpecialChars();
        if (result1 === null) {
          result1 = parse_character();
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_escapedSpecialChars();
            if (result1 === null) {
              result1 = parse_character();
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, stringVal) { 
        
                return stringVal.join(''); 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_value() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_escapedSpecialChars();
        if (result1 === null) {
          result1 = parse_character();
          if (result1 === null) {
            result1 = parse_space();
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_escapedSpecialChars();
            if (result1 === null) {
              result1 = parse_character();
              if (result1 === null) {
                result1 = parse_space();
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, stringVal) { 
        
                return stringVal.join(''); 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_escapedSpecialChars() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_circumflex();
        if (result0 !== null) {
          result1 = parse_circumflex();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 === null) {
          pos1 = pos;
          result0 = parse_circumflex();
          if (result0 !== null) {
            result1 = parse_squareBracket();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 === null) {
            pos1 = pos;
            result0 = parse_circumflex();
            if (result0 !== null) {
              result1 = parse_parentheses();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 === null) {
              pos1 = pos;
              result0 = parse_circumflex();
              if (result0 !== null) {
                result1 = parse_comma();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 === null) {
                pos1 = pos;
                result0 = parse_circumflex();
                if (result0 !== null) {
                  result1 = parse_semicolon();
                  if (result1 !== null) {
                    result0 = [result0, result1];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
                if (result0 === null) {
                  pos1 = pos;
                  result0 = parse_circumflex();
                  if (result0 !== null) {
                    result1 = parse_equal();
                    if (result1 !== null) {
                      result0 = [result0, result1];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, escSpecCharVal) { 
                
                return escSpecCharVal[1]; 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_number() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        if (/^[1-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[1-9]");
          }
        }
        if (result0 !== null) {
          if (/^[0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos2;
          }
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            pos2 = pos;
            result2 = [];
            if (/^[0-9]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            while (result3 !== null) {
              result2.push(result3);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
            if (result2 !== null) {
              if (/^[1-9]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[1-9]");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, intPartVal, fracPartVal) { 
        
                return intPartVal.join('') + "." + fracPartVal.join(''); 
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_integer() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 48) {
          result0 = "0";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"0\"");
          }
        }
        if (result0 === null) {
          pos1 = pos;
          if (/^[1-9]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[1-9]");
            }
          }
          if (result0 !== null) {
            result1 = [];
            if (/^[0-9]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            while (result2 !== null) {
              result1.push(result2);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, integerVal) { 
        
                if (integerVal === "0") { 
                  return "0";
                } 
                else { 
                  return integerVal[0].concat(integerVal[1].join(''));
                }
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_space() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 32) {
          result0 = " ";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return " "; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_circumflex() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 94) {
          result0 = "^";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"^\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "^"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_doubleQuote() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return '"'; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_squareBracket() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 91) {
          result0 = "[";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 93) {
            result0 = "]";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"]\"");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, bracketVal) { return bracketVal; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_parentheses() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 41) {
            result0 = ")";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\")\"");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, paraVal) { return paraVal; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comma() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 44) {
          result0 = ",";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\",\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ","; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_semicolon() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 59) {
          result0 = ";";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ";"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_equal() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 61) {
          result0 = "=";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"=\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "="; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_character() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (/^[a-z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-z]");
          }
        }
        if (result0 === null) {
          if (/^[A-Z]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[A-Z]");
            }
          }
          if (result0 === null) {
            if (/^[0-9]/.test(input.charAt(pos))) {
              result0 = input.charAt(pos);
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            if (result0 === null) {
              if (input.charCodeAt(pos) === 45) {
                result0 = "-";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"-\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 95) {
                  result0 = "_";
                  pos++;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"_\"");
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, charVal) { return charVal; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
 

    // Description: This model contains the implementation for "instructions" included in the EPUB CFI domain specific language (DSL). 
//   Lexing and parsing a CFI produces a set of executable instructions for processing a CFI (represented in the AST). 
//   This object contains a set of functions that implement each of the executable instructions in the AST. 

EPUBcfi.CFIInstructions = {

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	// Description: Follows a step
	// Rationale: The use of children() is important here, as this jQuery method returns a tree of xml nodes, EXCLUDING
	//   CDATA and text nodes. When we index into the set of child elements, we are assuming that text nodes have been 
	//   excluded.
	// REFACTORING CANDIDATE: This should be called "followIndexStep"
	getNextNode : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {

		// Find the jquery index for the current node
		var $targetNode;
		if (CFIStepValue % 2 == 0) {

			$targetNode = this.elementNodeStep(CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist);
		}
		else {

			$targetNode = this.inferTargetTextNode(CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist);
		}

		return $targetNode;
	},

	// Description: This instruction executes an indirection step, where a resource is retrieved using a 
	//   link contained on a attribute of the target element. The attribute that contains the link differs
	//   depending on the target. 
	// Note: Iframe indirection will (should) fail if the iframe is not from the same domain as its containing script due to 
	//   the cross origin security policy
	followIndirectionStep : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {

		var that = this;
		var $contentDocument; 
		var $blacklistExcluded;
		var $startElement;
		var $targetNode;

		// TODO: This check must be expanded to all the different types of indirection step
		// Only expects iframes, at the moment
		if ($currNode === undefined || !$currNode.is("iframe")) {

			throw EPUBcfi.NodeTypeError($currNode, "expected an iframe element");
		}

		// Check node type; only iframe indirection is handled, at the moment
		if ($currNode.is("iframe")) {

			// Get content
			$contentDocument = $currNode.contents();

			// Go to the first XHTML element, which will be the first child of the top-level document object
			$blacklistExcluded = this.applyBlacklist($contentDocument.children(), classBlacklist, elementBlacklist, idBlacklist);
			$startElement = $($blacklistExcluded[0]);

			// Follow an index step
			$targetNode = this.getNextNode(CFIStepValue, $startElement, classBlacklist, elementBlacklist, idBlacklist);

			// Return that shit!
			return $targetNode; 
		}

		// TODO: Other types of indirection
		// TODO: $targetNode.is("embed")) : src
		// TODO: ($targetNode.is("object")) : data
		// TODO: ($targetNode.is("image") || $targetNode.is("xlink:href")) : xlink:href
	},

	// Description: Injects an element at the specified text node
	// Arguments: a cfi text termination string, a jquery object to the current node
	// REFACTORING CANDIDATE: Rename this to indicate that it injects into a text terminus
	textTermination : function ($currNode, textOffset, elementToInject) {

		// Get the first node, this should be a text node
		if ($currNode === undefined) {

			throw EPUBcfi.NodeTypeError($currNode, "expected a terminating node, or node list");
		} 
		else if ($currNode.length === 0) {

			throw EPUBcfi.TerminusError("Text", "Text offset:" + textOffset, "no nodes found for termination condition");
		}

		$currNode = this.injectCFIMarkerIntoText($currNode, textOffset, elementToInject);
		return $currNode;
	},

	// Description: Checks that the id assertion for the node target matches that on 
	//   the found node. 
	targetIdMatchesIdAssertion : function ($foundNode, idAssertion) {

		if ($foundNode.attr("id") === idAssertion) {

			return true;
		}
		else {

			return false;
		}
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: Step reference for xml element node. Expected that CFIStepValue is an even integer
	elementNodeStep : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {

		var $targetNode;
		var $blacklistExcluded;
		var numElements;
		var jqueryTargetNodeIndex = (CFIStepValue / 2) - 1;

		$blacklistExcluded = this.applyBlacklist($currNode.children(), classBlacklist, elementBlacklist, idBlacklist);
		numElements = $blacklistExcluded.length;

		if (this.indexOutOfRange(jqueryTargetNodeIndex, numElements)) {

			throw EPUBcfi.OutOfRangeError(jqueryTargetNodeIndex, numElements - 1, "");
		}

	    $targetNode = $($blacklistExcluded[jqueryTargetNodeIndex]);
		return $targetNode;
	},

	retrieveItemRefHref : function ($itemRefElement, $packageDocument) {

		return $("#" + $itemRefElement.attr("idref"), $packageDocument).attr("href");
	},

	indexOutOfRange : function (targetIndex, numChildElements) {

		return (targetIndex > numChildElements - 1) ? true : false;
	},

	// Rationale: In order to inject an element into a specific position, access to the parent object 
	//   is required. This is obtained with the jquery parent() method. An alternative would be to 
	//   pass in the parent with a filtered list containing only children that are part of the target text node.
	injectCFIMarkerIntoText : function ($textNodeList, textOffset, elementToInject) {

		var nodeNum;
		var currNodeLength;
		var currTextPosition = 0;
		var nodeOffset;
		var originalText;
		var $injectedNode;
		var $newTextNode;
		// The iteration counter may be incorrect here (should be $textNodeList.length - 1 ??)
		for (nodeNum = 0; nodeNum <= $textNodeList.length; nodeNum++) {

			if ($textNodeList[nodeNum].nodeType === 3) {

				currNodeMaxIndex = ($textNodeList[nodeNum].nodeValue.length - 1) + currTextPosition;
				nodeOffset = textOffset - currTextPosition;

				if (currNodeMaxIndex >= textOffset) {

					// This node is going to be split and the components re-inserted
					originalText = $textNodeList[nodeNum].nodeValue;	

					// Before part
				 	$textNodeList[nodeNum].nodeValue = originalText.slice(0, nodeOffset);

					// Injected element
					$injectedNode = $(elementToInject).insertAfter($textNodeList.eq(nodeNum));

					// After part
					$newTextNode = $(document.createTextNode(originalText.slice(nodeOffset, originalText.length)));
					$($newTextNode).insertAfter($injectedNode);

					return $textNodeList.parent();
				}
				else {

					currTextPosition = currTextPosition + currNodeMaxIndex;
				}
			}
		}

		throw EPUBcfi.TerminusError("Text", "Text offset:" + textOffset, "The offset exceeded the length of the text");
	},

	// Description: This method finds a target text node and then injects an element into the appropriate node
	// Arguments: A step value that is an odd integer. A current node with a set of child elements.
	// Rationale: The possibility that cfi marker elements have been injected into a text node at some point previous to 
	//   this method being called (and thus splitting the original text node into two separate text nodes) necessitates that
	//   the set of nodes that compromised the original target text node are inferred and returned.
	// Notes: Passed a current node. This node should have a set of elements under it. This will include at least one text node, 
	//   element nodes (maybe), or possibly a mix. 
	// REFACTORING CANDIDATE: This method is pretty long. Worth investigating to see if it can be refactored into something clearer.
	inferTargetTextNode : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {
		
		var $elementsWithoutMarkers;
		var currTextNodePosition;
		var logicalTargetPosition;
		var nodeNum;
		var $targetTextNodeList;

		// Remove any cfi marker elements from the set of elements. 
		// Rationale: A filtering function is used, as simply using a class selector with jquery appears to 
		//   result in behaviour where text nodes are also filtered out, along with the class element being filtered.
		$elementsWithoutMarkers = this.applyBlacklist($currNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

		// Convert CFIStepValue to logical index; assumes odd integer for the step value
		logicalTargetPosition = (parseInt(CFIStepValue) + 1) / 2;

		// Set text node position counter
		currTextNodePosition = 1;
		$targetTextNodeList = $elementsWithoutMarkers.filter(
			function () {

				if (currTextNodePosition === logicalTargetPosition) {

					// If it's a text node
					if (this.nodeType === 3) {
						return true; 
					}
					// Any other type of node, move onto the next text node
					else {
						currTextNodePosition++; 
						return false;
					}
				}
				// In this case, don't return any elements
				else {

					// If its the last child and it's not a text node, there are no text nodes after it
					// and the currTextNodePosition shouldn't be incremented
					if (this.nodeType !== 3 && this !== $elementsWithoutMarkers.lastChild) {
						currTextNodePosition++;
					}

					return false;
				}
			}
		);

		// The filtering above should have counted the number of "logical" text nodes; this can be used to 
		// detect out of range errors
		if ($targetTextNodeList.length === 0) {

			throw EPUBcfi.OutOfRangeError(logicalTargetPosition, currTextNodePosition - 1, "Index out of range");
		}

		// return the text node list
		return $targetTextNodeList;
	},

	applyBlacklist : function ($elements, classBlacklist, elementBlacklist, idBlacklist) {

        var $filteredElements;

        $filteredElements = $elements.filter(
            function () {

                var $currElement = $(this);
                var includeInList = true;

                if (classBlacklist) {

                	// Filter each element with the class type
                	$.each(classBlacklist, function (index, value) {

	                    if ($currElement.hasClass(value)) {
	                    	includeInList = false;

	                    	// Break this loop
	                        return false;
	                    }
                	});
                }

                if (elementBlacklist) {
                	
	                // For each type of element
	                $.each(elementBlacklist, function (index, value) {

	                    if ($currElement.is(value)) {
	                    	includeInList = false;

	                    	// Break this loop
	                        return false;
	                    }
	                });
				}

				if (idBlacklist) {
                	
	                // For each type of element
	                $.each(idBlacklist, function (index, value) {

	                    if ($currElement.attr("id") === value) {
	                    	includeInList = false;

	                    	// Break this loop
	                        return false;
	                    }
	                });
				}

                return includeInList;
            }
        );

        return $filteredElements;
    }
};




    // Description: This is an interpreter that inteprets an Abstract Syntax Tree (AST) for a CFI. The result of executing the interpreter
//   is to inject an element, or set of elements, into an EPUB content document (which is just an XHTML document). These element(s) will
//   represent the position or area in the EPUB referenced by a CFI.
// Rationale: The AST is a clean and readable expression of the step-terminus structure of a CFI. Although building an interpreter adds to the
//   CFI infrastructure, it provides a number of benefits. First, it emphasizes a clear separation of concerns between lexing/parsing a
//   CFI, which involves some complexity related to escaped and special characters, and the execution of the underlying set of steps 
//   represented by the CFI. Second, it will be easier to extend the interpreter to account for new/altered CFI steps (say for references
//   to vector objects or multiple CFIs) than if lexing, parsing and interpretation were all handled in a single step. Finally, Readium's objective is 
//   to demonstrate implementation of the EPUB 3.0 spec. An implementation with a strong separation of concerns that conforms to 
//   well-understood patterns for DSL processing should be easier to communicate, analyze and understand. 
// REFACTORING CANDIDATE: node type errors shouldn't really be possible if the CFI syntax is correct and the parser is error free. 
//   Might want to make the script die in those instances, once the grammar and interpreter are more stable. 
// REFACTORING CANDIDATE: The use of the 'nodeType' property is confusing as this is a DOM node property and the two are unrelated. 
//   Whoops. There shouldn't be any interference, however, I think this should be changed. 

EPUBcfi.Interpreter = {

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    // Description: Find the content document referenced by the spine item. This should be the spine item 
    //   referenced by the first indirection step in the CFI.
    // Rationale: This method is a part of the API so that the reading system can "interact" the content document 
    //   pointed to by a CFI. If this is not a separate step, the processing of the CFI must be tightly coupled with 
    //   the reading system, as it stands now. 
    getContentDocHref : function (CFI, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        // Decode for URI/IRI escape characters
        var $packageDocument = $(packageDocument);
        var decodedCFI = decodeURI(CFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);

        // Check node type; throw error if wrong type
        if (CFIAST === undefined || CFIAST.type !== "CFIAST") { 

            throw EPUBcfi.NodeTypeError(CFIAST, "expected CFI AST root node");
        }

        var $packageElement = $($("package", $packageDocument)[0]);

        // Interpet the path node (the package document step)
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $packageElement, classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the local_path node, which is a set of steps and and a terminus condition
        var stepNum = 0;
        var nextStepNode;
        for (stepNum = 0 ; stepNum <= CFIAST.cfiString.localPath.steps.length - 1 ; stepNum++) {
        
            nextStepNode = CFIAST.cfiString.localPath.steps[stepNum];
            if (nextStepNode.type === "indexStep") {

                $currElement = this.interpretIndexStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }
            else if (nextStepNode.type === "indirectionStep") {

                $currElement = this.interpretIndirectionStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }

            // Found the content document href referenced by the spine item 
            if ($currElement.is("itemref")) {

                return EPUBcfi.CFIInstructions.retrieveItemRefHref($currElement, $packageDocument);
            }
        }

        // TODO: If you get to here, an itemref element was never found - a runtime error. The cfi is misspecified or 
        //   the package document is messed up.
    },

    // Description: Inject an arbitrary html element into a position in a content document referenced by a CFI
    injectElement : function (CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(CFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
        var indirectionNode;
        var indirectionStepNum;

        // Rationale: Since the correct content document for this CFI is already being passed, we can skip to the beginning 
        //   of the indirection step that referenced the content document.
        // Note: This assumes that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
        indirectionStepNum = this.getFirstIndirectionStepNum(CFIAST);
        indirectionNode = CFIAST.cfiString.localPath.steps[indirectionStepNum];
        indirectionNode.type = "indexStep";

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString, indirectionStepNum, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // TODO: detect what kind of terminus; for now, text node termini are the only kind implemented
        $currElement = this.interpretTextTerminusNode(CFIAST.cfiString.localPath.termStep, $currElement, elementToInject);

        // Return the element that was injected into
        return $currElement;
    },

    // Description: This method will return the element or node (say, a text node) that is the final target of the 
    //   the CFI.
    getTargetElement : function (CFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(CFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
        var indirectionNode;
        var indirectionStepNum;
        
        // Rationale: Since the correct content document for this CFI is already being passed, we can skip to the beginning 
        //   of the indirection step that referenced the content document.
        // Note: This assumes that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
        indirectionStepNum = this.getFirstIndirectionStepNum(CFIAST);
        indirectionNode = CFIAST.cfiString.localPath.steps[indirectionStepNum];
        indirectionNode.type = "indexStep";

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString, indirectionStepNum, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Return the element at the end of the CFI
        return $currElement;
    },

    // Description: This method allows a "partial" CFI to be used to reference a target in a content document, without a 
    //   package document CFI component. 
    // Arguments: {
    //     contentDocumentCFI : This is a partial CFI that represents a path in a content document only. This partial must be 
    //        syntactically valid, even though it references a path starting at the top of a content document (which is a CFI that
    //        that has no defined meaning in the spec.)
    //     contentDocument : A DOM representation of the content document to which the partial CFI refers. 
    // }
    // Rationale: This method exists to meet the requirements of the Readium-SDK and should be used with care
    getTargetElementWithPartialCFI : function (contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(contentDocumentCFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
        var indirectionNode;
        
        // Interpret the path node 
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Return the element at the end of the CFI
        return $currElement;        
    },

    // Description: This method allows a "partial" CFI to be used, with a content document, to return the text node and offset 
    //    referenced by the partial CFI.
    // Arguments: {
    //     contentDocumentCFI : This is a partial CFI that represents a path in a content document only. This partial must be 
    //        syntactically valid, even though it references a path starting at the top of a content document (which is a CFI that
    //        that has no defined meaning in the spec.)
    //     contentDocument : A DOM representation of the content document to which the partial CFI refers. 
    // }
    // Rationale: This method exists to meet the requirements of the Readium-SDK and should be used with care
    getTextTerminusInfoWithPartialCFI : function (contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(contentDocumentCFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
        var indirectionNode;
        var textOffset;
        
        // Interpret the path node 
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Return the element at the end of the CFI
        textOffset = parseInt(CFIAST.cfiString.localPath.termStep.offsetValue);
        return { textNode : $currElement,
                 textOffset : textOffset
            };
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    getFirstIndirectionStepNum : function (CFIAST) {

        // Find the first indirection step in the local path; follow it like a regular step, as the step in the content document it 
        //   references is already loaded and has been passed to this method
        var stepNum = 0;
        for (stepNum; stepNum <= CFIAST.cfiString.localPath.steps.length - 1 ; stepNum++) {
        
            nextStepNode = CFIAST.cfiString.localPath.steps[stepNum];
            if (nextStepNode.type === "indirectionStep") {
                return stepNum;
            }
        }
    },

    // REFACTORING CANDIDATE: cfiString node and start step num could be merged into one argument, by simply passing the 
    //   starting step. 
    interpretLocalPath : function (cfiStringNode, startStepNum, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        var stepNum = startStepNum;
        var nextStepNode;
        for (stepNum; stepNum <= cfiStringNode.localPath.steps.length - 1 ; stepNum++) {
        
            nextStepNode = cfiStringNode.localPath.steps[stepNum];
            if (nextStepNode.type === "indexStep") {

                $currElement = this.interpretIndexStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }
            else if (nextStepNode.type === "indirectionStep") {

                $currElement = this.interpretIndirectionStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }
        }

        return $currElement;
    },

    interpretIndexStepNode : function (indexStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        // Check node type; throw error if wrong type
        if (indexStepNode === undefined || indexStepNode.type !== "indexStep") {

            throw EPUBcfi.NodeTypeError(indexStepNode, "expected index step node");
        }

        // Index step
        var $stepTarget = EPUBcfi.CFIInstructions.getNextNode(indexStepNode.stepLength, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Check the id assertion, if it exists
        if (indexStepNode.idAssertion) {

            if (!EPUBcfi.CFIInstructions.targetIdMatchesIdAssertion($stepTarget, indexStepNode.idAssertion)) {

                throw EPUBcfi.CFIAssertionError(indexStepNode.idAssertion, $stepTarget.attr('id'), "Id assertion failed");
            }
        }

        return $stepTarget;
    },

    interpretIndirectionStepNode : function (indirectionStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        // Check node type; throw error if wrong type
        if (indirectionStepNode === undefined || indirectionStepNode.type !== "indirectionStep") {

            throw EPUBcfi.NodeTypeError(indirectionStepNode, "expected indirection step node");
        }

        // Indirection step
        var $stepTarget = EPUBcfi.CFIInstructions.followIndirectionStep(
            indirectionStepNode.stepLength, 
            $currElement, 
            classBlacklist, 
            elementBlacklist);

        // Check the id assertion, if it exists
        if (indirectionStepNode.idAssertion) {

            if (!EPUBcfi.CFIInstructions.targetIdMatchesIdAssertion($stepTarget, indirectionStepNode.idAssertion)) {

                throw EPUBcfi.CFIAssertionError(indirectionStepNode.idAssertion, $stepTarget.attr('id'), "Id assertion failed");
            }
        }

        return $stepTarget;
    },

    // REFACTORING CANDIDATE: The logic here assumes that a user will always want to use this terminus
    //   to inject content into the found node. This should be changed to be more flexible.
    interpretTextTerminusNode : function (terminusNode, $currElement, elementToInject) {

        if (terminusNode === undefined || terminusNode.type !== "textTerminus") {

            throw EPUBcfi.NodeTypeError(terminusNode, "expected text terminus node");
        }

        var $elementInjectedInto = EPUBcfi.CFIInstructions.textTermination(
            $currElement, 
            terminusNode.offsetValue, 
            elementToInject);

        return $elementInjectedInto;
    }
};

    // Description: This is a set of runtime errors that the CFI interpreter can throw. 
// Rationale: These error types extend the basic javascript error object so error things like the stack trace are 
//   included with the runtime errors. 

// REFACTORING CANDIDATE: This type of error may not be required in the long run. The parser should catch any syntax errors, 
//   provided it is error-free, and as such, the AST should never really have any node type errors, which are essentially errors
//   in the structure of the AST. This error should probably be refactored out when the grammar and interpreter are more stable.
EPUBcfi.NodeTypeError = function (node, message) {

    function NodeTypeError () {

        this.node = node;
    }

    NodeTypeError.prototype = new Error(message);
    NodeTypeError.constructor = NodeTypeError;

    return new NodeTypeError();
};

// REFACTORING CANDIDATE: Might make sense to include some more specifics about the out-of-rangeyness.
EPUBcfi.OutOfRangeError = function (targetIndex, maxIndex, message) {

    function OutOfRangeError () {

        this.targetIndex = targetIndex;
        this.maxIndex = maxIndex;
    }

    OutOfRangeError.prototype = new Error(message);
    OutOfRangeError.constructor = OutOfRangeError()

    return new OutOfRangeError();
};

// REFACTORING CANDIDATE: This is a bit too general to be useful. When I have a better understanding of the type of errors
//   that can occur with the various terminus conditions, it'll make more sense to revisit this. 
EPUBcfi.TerminusError = function (terminusType, terminusCondition, message) {

    function TerminusError () {

        this.terminusType = terminusType;
        this.terminusCondition = terminusCondition;
    }

    TerminusError.prototype = new Error(message);
    TerminusError.constructor = TerminusError();

    return new TerminusError();
};

EPUBcfi.CFIAssertionError = function (expectedAssertion, targetElementAssertion, message) {

    function CFIAssertionError () {

        this.expectedAssertion = expectedAssertion;
        this.targetElementAssertion = targetElementAssertion;
    }

    CFIAssertionError.prototype = new Error(message);
    CFIAssertionError.constructor = CFIAssertionError();

    return new CFIAssertionError();
};


    EPUBcfi.Generator = {

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    // Description: Generates a character offset CFI 
    // Arguments: The text node that contains the offset referenced by the cfi, the offset value, the name of the 
    //   content document that contains the text node, the package document for this EPUB.
    generateCharacterOffsetCFIComponent : function (startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var textNodeStep;
        var contentDocCFI;
        var $itemRefStartNode;
        var packageDocCFI;

        this.validateStartTextNode(startTextNode, characterOffset);

        // Create the text node step
        textNodeStep = this.createCFITextNodeStep($(startTextNode), characterOffset, classBlacklist, elementBlacklist, idBlacklist);

        // Call the recursive method to create all the steps up to the head element of the content document (the "html" element)
        contentDocCFI = this.createCFIElementSteps($(startTextNode).parent(), "html", classBlacklist, elementBlacklist, idBlacklist) + textNodeStep;
        return contentDocCFI.substring(1, contentDocCFI.length);
    },

    generateElementCFIComponent : function (startElement, classBlacklist, elementBlacklist, idBlacklist) {

        var contentDocCFI;
        var $itemRefStartNode;
        var packageDocCFI;

        // Call the recursive method to create all the steps up to the head element of the content document (the "html" element)
        contentDocCFI = this.createCFIElementSteps($(startElement), "html", classBlacklist, elementBlacklist, idBlacklist);

        // Remove the ! 
        return contentDocCFI.substring(1, contentDocCFI.length);
    },

    generatePackageDocumentCFIComponent : function (contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        this.validateContentDocumentName(contentDocumentName);
        this.validatePackageDocument(packageDocument, contentDocumentName);

        // Get the start node (itemref element) that references the content document
        $itemRefStartNode = $("itemref[idref='" + contentDocumentName + "']", $(packageDocument));

        // Create the steps up to the top element of the package document (the "package" element)
        packageDocCFIComponent = this.createCFIElementSteps($itemRefStartNode, "package", classBlacklist, elementBlacklist, idBlacklist);

        // Append an !; this assumes that a CFI content document CFI component will be appended at some point
        return packageDocCFIComponent + "!";
    },

    generateCompleteCFI : function (packageDocumentCFIComponent, contentDocumentCFIComponent) {

        return "epubcfi(" + packageDocumentCFIComponent + contentDocumentCFIComponent + ")";  
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    validateStartTextNode : function (startTextNode, characterOffset) {
        
        // Check that the text node to start from IS a text node
        if (!startTextNode) {
            throw new EPUBcfi.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        } else if (startTextNode.nodeType != 3) {
            throw new EPUBcfi.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        }

        // Check that the character offset is within a valid range for the text node supplied
        if (characterOffset < 0) {
            throw new EPUBcfi.OutOfRangeError(characterOffset, 0, "Character offset cannot be less than 0");
        }
        else if (characterOffset > startTextNode.nodeValue.length) {
            throw new EPUBcfi.OutOfRangeError(characterOffset, startTextNode.nodeValue.length - 1, "character offset cannot be greater than the length of the text node");
        }
    },

    validateContentDocumentName : function (contentDocumentName) {

        // Check that the idref for the content document has been provided
        if (!contentDocumentName) {
            throw new Error("The idref for the content document, as found in the spine, must be supplied");
        }
    },

    validatePackageDocument : function (packageDocument, contentDocumentName) {
        
        // Check that the package document is non-empty and contains an itemref element for the supplied idref
        if (!packageDocument) {
            throw new Error("A package document must be supplied to generate a CFI");
        }
        else if ($($("itemref[idref='" + contentDocumentName + "']", packageDocument)[0]).length === 0) {
            throw new Error("The idref of the content document could not be found in the spine");
        }
    },

    // Description: Creates a CFI terminating step, to a text node, with a character offset
    // REFACTORING CANDIDATE: Some of the parts of this method could be refactored into their own methods
    createCFITextNodeStep : function ($startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var $parentNode;
        var $contentsExcludingMarkers;
        var CFIIndex;
        var indexOfTextNode;
        var preAssertion;
        var preAssertionStartIndex;
        var textLength;
        var postAssertion;
        var postAssertionEndIndex;

        // Find text node position in the set of child elements, ignoring any blacklisted elements 
        $parentNode = $startTextNode.parent();
        $contentsExcludingMarkers = EPUBcfi.CFIInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node index in the parent list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var indexOfFirstInSequence;
        $.each($contentsExcludingMarkers, 
            function (index) {

                // If this is a text node, check if it matches and return the current index
                if (this.nodeType === 3) {

                    if (this === $startTextNode[0]) {

                        // Set index as the first in the adjacent sequence of text nodes, or as the index of the current node if this 
                        //   node is a standard one sandwiched between two element nodes. 
                        if (prevNodeWasTextNode) {
                            indexOfTextNode = indexOfFirstInSequence;
                        }
                        else {
                            indexOfTextNode = index;
                        }
                        
                        // Break out of .each loop
                        return false; 
                    }

                    // Save this index as the first in sequence of adjacent text nodes, if it is not already set by this point
                    prevNodeWasTextNode = true;
                    if (!indexOfFirstInSequence) {
                        indexOfFirstInSequence = index;
                    }
                }
                // This node is not a text node
                else {
                    prevNodeWasTextNode = false;
                    indexOfFirstInSequence = undefined;
                }
            }
        );

        // Convert the text node index to a CFI odd-integer representation
        CFIIndex = (indexOfTextNode * 2) + 1;

        // TODO: text assertions are not in the grammar yet, I think, or they're just causing problems. This has
        //   been temporarily removed. 

        // Add pre- and post- text assertions
        // preAssertionStartIndex = (characterOffset - 3 >= 0) ? characterOffset - 3 : 0;
        // preAssertion = $startTextNode[0].nodeValue.substring(preAssertionStartIndex, characterOffset);

        // textLength = $startTextNode[0].nodeValue.length;
        // postAssertionEndIndex = (characterOffset + 3 <= textLength) ? characterOffset + 3 : textLength;
        // postAssertion = $startTextNode[0].nodeValue.substring(characterOffset, postAssertionEndIndex);

        // Gotta infer the correct character offset, as well

        // Return the constructed CFI text node step
        return "/" + CFIIndex + ":" + characterOffset;
         // + "[" + preAssertion + "," + postAssertion + "]";
    },

    // Description: A set of adjacent text nodes can be inferred to have been a single text node in the original document. As such, 
    //   if the character offset is specified for one of the adjacent text nodes, the true offset for the original node must be
    //   inferred.
    findOriginalTextNodeCharOffset : function ($startTextNode, specifiedCharacterOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var $parentNode;
        var $contentsExcludingMarkers;
        var textLength;
        
        // Find text node position in the set of child elements, ignoring any cfi markers 
        $parentNode = $startTextNode.parent();
        $contentsExcludingMarkers = EPUBcfi.CFIInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node number in the list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var originalCharOffset = -1; // So the character offset is a 0-based index; we'll be adding lengths of text nodes to this number
        $.each($contentsExcludingMarkers, 
            function (index) {

                // If this is a text node, check if it matches and return the current index
                if (this.nodeType === 3) {

                    if (this === $startTextNode[0]) {

                        if (prevNodeWasTextNode) {
                            originalCharOffset = originalCharOffset + specifiedCharacterOffset;
                        }
                        else {
                            originalCharOffset = specifiedCharacterOffset;
                        }

                        return false; // Break out of .each loop
                    }
                    else {

                        originalCharOffset = originalCharOffset + this.length;
                    }

                    // save this index as the first in sequence of adjacent text nodes, if not set
                    prevNodeWasTextNode = true;
                }
                // This node is not a text node
                else {
                    prevNodeWasTextNode = false;
                }
            }
        );

        return originalCharOffset;
    },

    createCFIElementSteps : function ($currNode, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) {

        var $blacklistExcluded;
        var $parentNode;
        var currNodePosition;
        var CFIPosition;
        var idAssertion;
        var elementStep; 

        // Find position of current node in parent list
        $blacklistExcluded = EPUBcfi.CFIInstructions.applyBlacklist($currNode.parent().children(), classBlacklist, elementBlacklist, idBlacklist);
        $.each($blacklistExcluded, 
            function (index, value) {

                if (this === $currNode[0]) {

                    currNodePosition = index;

                    // Break loop
                    return false;
                }
        });

        // Convert position to the CFI even-integer representation
        CFIPosition = (currNodePosition + 1) * 2;

        // Create CFI step with id assertion, if the element has an id
        if ($currNode.attr("id")) {
            elementStep = "/" + CFIPosition + "[" + $currNode.attr("id") + "]";
        }
        else {
            elementStep = "/" + CFIPosition;
        }

        // If a parent is an html element return the (last) step for this content document, otherwise, continue.
        //   Also need to check if the current node is the top-level element. This can occur if the start node is also the
        //   top level element.
        $parentNode = $currNode.parent();
        if ($parentNode.is(topLevelElement) || $currNode.is(topLevelElement)) {
            
            // If the top level node is a type from which an indirection step, add an indirection step character (!)
            // REFACTORING CANDIDATE: It is possible that this should be changed to: if (topLevelElement = 'package') do
            //   not return an indirection character. Every other type of top-level element may require an indirection
            //   step to navigate to, thus requiring that ! is always prepended. 
            if (topLevelElement === 'html') {
                return "!" + elementStep;
            }
            else {
                return elementStep;
            }
        }
        else {
            return this.createCFIElementSteps($parentNode, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) + elementStep;
        }
    }
};

    if (global.EPUBcfi) {

        throw new Error('The EPUB cfi library has already been defined');
    }
    else {

        global.EPUBcfi = EPUBcfi;
    }
}) (typeof window === 'undefined' ? this : window);

define("epubCfi", function(){});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * CFI navigation helper class
 *
 * @param $viewport
 * @param $iframe
 * @constructor
 */

ReadiumSDK.Views.CfiNavigationLogic = function($viewport, $iframe){

    this.$viewport = $viewport;
    this.$iframe = $iframe;

    this.getRootElement = function(){

        return this.$iframe[0].contentDocument.documentElement

    };

    //we look for text and images
    this.findFirstVisibleElement = function (topOffset) {

        var $elements;
        var $firstVisibleTextNode = null;
        var percentOfElementHeight = 0;

        $elements = $("body", this.getRootElement()).find(":not(iframe)").contents().filter(function () {
            return this.nodeType === Node.TEXT_NODE || this.nodeName.toLowerCase() === 'img';
        });

        // Find the first visible text node
        $.each($elements, function() {

            var $element;

            if(this.nodeType === Node.TEXT_NODE)  { //text node
                // Heuristic to find a text node with actual text
                var nodeText = this.nodeValue.replace(/\n/g, "");
                nodeText = nodeText.replace(/ /g, "");

                if(nodeText.length > 0) {
                    $element = $(this).parent();
                }
                else {
                    return true; //next element
                }
            }
            else {
                $element = $(this); //image
            }

            var elementRect = ReadiumSDK.Helpers.Rect.fromElement($element);

            if (elementRect.bottom() > topOffset) {

                $firstVisibleTextNode = $element;

                if(elementRect.top > topOffset) {
                    percentOfElementHeight = 0;
                }
                else {
                    percentOfElementHeight = Math.ceil(((topOffset - elementRect.top) / elementRect.height) * 100);
                }

                // Break the loop
                return false;
            }

            return true; //next element
        });

        return {$element: $firstVisibleTextNode, percentY: percentOfElementHeight};
    };

    this.getFirstVisibleElementCfi = function(topOffset) {

        var foundElement = this.findFirstVisibleElement(topOffset);

        if(!foundElement.$element) {
            console.log("Could not generate CFI no visible element on page");
            return undefined;
        }

        var cfi = EPUBcfi.Generator.generateElementCFIComponent(foundElement.$element[0]);

        if(cfi[0] == "!") {
            cfi = cfi.substring(1);
        }

        return cfi + "@0:" + foundElement.percentY;
    };

    this.getPageForElementCfi = function(cfi) {

        var contentDoc = this.$iframe[0].contentDocument;
        var cfiParts = this.splitCfi(cfi);

        var wrappedCfi = "epubcfi(" + cfiParts.cfi + ")";
        var $element = EPUBcfi.Interpreter.getTargetElementWithPartialCFI(wrappedCfi, contentDoc);

        if(!$element || $element.length == 0) {
            console.log("Can't find element for CFI: " + cfi);
            return undefined;
        }

        return this.getPageForElement($element, cfiParts.x, cfiParts.y);
    };

    this.getPageForElement = function($element, x, y) {

        var elementRect = ReadiumSDK.Helpers.Rect.fromElement($element);
        var posInElement = Math.ceil(elementRect.top + y * elementRect.height / 100);

        var column = Math.floor(posInElement / this.$viewport.height());

        return column;
    };

    this.getPageForElementId = function(id) {

        var contentDoc = this.$iframe[0].contentDocument;

        var $element = $("#" + id, contentDoc);
        if($element.length == 0) {
            return -1;
        }

        return this.getPageForElement($element, 0, 0);
    };

    this.splitCfi = function(cfi) {

        var ret = {
            cfi: "",
            x: 0,
            y: 0
        };

        var ix = cfi.indexOf("@");

        if(ix != -1) {
            var terminus = cfi.substring(ix + 1);

            var colIx = terminus.indexOf(":");
            if(colIx != -1) {
                ret.x = parseInt(terminus.substr(0, colIx));
                ret.y = parseInt(terminus.substr(colIx + 1));
            }
            else {
                console.log("Unexpected terminating step format");
            }

            ret.cfi = cfi.substring(0, ix);
        }
        else {

            ret.cfi = cfi;
        }

        return ret;
    };

};
define("cfiNavigationLogic", function(){});


//  LauncherOSX
//
//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * Renders reflowable content using CSS columns
 *
 * @class ReadiumSDK.Views.ReflowableView
 */

ReadiumSDK.Views.ReflowableView = Backbone.View.extend({

    currentSpineItem: undefined,
    isWaitingFrameRender: false,
    deferredPageRequest: undefined,
    spine: undefined,
    fontSize:100,

    lastViewPortSize : {
        width: undefined,
        height: undefined
    },

    paginationInfo : {

        visibleColumnCount : 2,
        columnGap : 20,
        spreadCount : 0,
        currentSpreadIndex : 0,
        columnWidth : undefined,
        pageOffset : 0,
        columnCount: 0
    },

    initialize: function() {

        this.spine = this.options.spine;
    },

    render: function(){

        this.template = _.template($("#template-reflowable-view").html(), {});
        this.setElement(this.template);

        this.$iframe = $("#epubContentIframe", this.$el);

        this.$iframe.css("left", "");
        this.$iframe.css("right", "");
        this.$iframe.css(this.spine.isLeftToRight() ? "left" : "right", "0px");

        //We will call onViewportResize after user stopped resizing window
        var lazyResize = _.debounce(this.onViewportResize, 100);
        $(window).on("resize.ReadiumSDK.reflowableView", _.bind(lazyResize, this));

        return this;
    },

    remove: function() {

        $(window).off("resize.ReadiumSDK.reflowableView");

        //base remove
        Backbone.View.prototype.remove.call(this);
    },

    isReflowable: function() {
        return true;
    },

    onViewportResize: function() {

        if(this.updateViewportSize()) {
            this.updatePagination();
        }

    },

    setViewSettings: function(settings) {

        this.paginationInfo.visibleColumnCount = settings.isSyntheticSpread ? 2 : 1;
        this.paginationInfo.columnGap = settings.columnGap;
        this.fontSize = settings.fontSize;
        this.updateHtmlFontSizeAndColumnGap();

        this.updatePagination();
    },

    registerTriggers: function (doc) {
        $('trigger', doc).each(function() {
            var trigger = new ReadiumSDK.Models.Trigger(this);
            trigger.subscribe(doc);

        });
    },

    loadSpineItem: function(spineItem) {

        if(this.currentSpineItem != spineItem) {

            this.paginationInfo.currentSpreadIndex = 0;
            this.currentSpineItem = spineItem;
            this.isWaitingFrameRender = true;

            var src = this.spine.getItemUrl(spineItem);
            ReadiumSDK.Helpers.LoadIframe(this.$iframe[0], src, this.onIFrameLoad, this);
        }
    },

    updateHtmlFontSizeAndColumnGap: function() {

        if(this.$epubHtml) {
            this.$epubHtml.css("font-size", this.fontSize + "%");
            this.$epubHtml.css("-webkit-column-gap", this.paginationInfo.columnGap + "px");
        }
    },

    onIFrameLoad : function(success) {

        this.isWaitingFrameRender = false;

        //while we where loading frame new request came
        if(this.deferredPageRequest && this.deferredPageRequest.spineItem != this.currentSpineItem) {
            this.loadSpineItem(this.deferredPageRequest.spineItem);
            return;
        }

        if(!success) {
            this.deferredPageRequest = undefined;
            return;
        }

        var epubContentDocument = this.$iframe[0].contentDocument;
        this.$epubHtml = $("html", epubContentDocument);

        this.$epubHtml.css("height", "100%");
        this.$epubHtml.css("position", "absolute");
        this.$epubHtml.css("-webkit-column-axis", "horizontal");

        this.updateHtmlFontSizeAndColumnGap();


/////////
//Columns Debugging
//                    $epubHtml.css("-webkit-column-rule-color", "red");
//                    $epubHtml.css("-webkit-column-rule-style", "dashed");
//                    $epubHtml.css("background-color", '#b0c4de');
/////////

        this.updateViewportSize();
        this.updatePagination();

        this.applySwitches(epubContentDocument);
        this.registerTriggers(epubContentDocument);
    },

    openDeferredElement: function() {

        if(!this.deferredPageRequest) {
            return;
        }

        var deferredData = this.deferredPageRequest;
        this.deferredPageRequest = undefined;
        this.openPage(deferredData);

    },

    openPage: function(pageRequest) {

        if(this.isWaitingFrameRender) {
            this.deferredPageRequest = pageRequest;
            return;
        }

        // if no spine item specified we are talking about current spine item
        if(pageRequest.spineItem && pageRequest.spineItem != this.currentSpineItem) {
            this.deferredPageRequest = pageRequest;
            this.loadSpineItem(pageRequest.spineItem);
            return;
        }

        var pageIndex = undefined;
        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(this.$el, this.$iframe);

        if(pageRequest.spineItemPageIndex !== undefined) {
            pageIndex = pageRequest.spineItemPageIndex;
        }
        else if(pageRequest.elementId) {
            pageIndex = navigation.getPageForElementId(pageRequest.elementId);
        }
        else if(pageRequest.elementCfi) {
            pageIndex = navigation.getPageForElementCfi(pageRequest.elementCfi);
        }
        else if(pageRequest.firstPage) {
            pageIndex = 0;
        }
        else if(pageRequest.lastPage) {
            pageIndex = this.paginationInfo.columnCount - 1;
        }

        if(pageIndex !== undefined && pageIndex >= 0 && pageIndex < this.paginationInfo.columnCount) {

            this.paginationInfo.currentSpreadIndex = Math.floor(pageIndex / this.paginationInfo.visibleColumnCount) ;
            this.onPaginationChanged();
        }
    },

    redraw: function() {

        var offsetVal =  -this.paginationInfo.pageOffset + "px";

        this.$epubHtml.css("left", this.spine.isLeftToRight() ? offsetVal : "");
        this.$epubHtml.css("right", this.spine.isRightToLeft() ? offsetVal : "");
    },

    updateViewportSize: function() {

        var newWidth = this.$el.width();
        var newHeight = this.$el.height();

        if(this.lastViewPortSize.width !== newWidth || this.lastViewPortSize.height !== newHeight){

            this.lastViewPortSize.width = newWidth;
            this.lastViewPortSize.height = newHeight;
            return true;
        }

        return false;
    },

    // Description: Parse the epub "switch" tags and hide
    // cases that are not supported
    applySwitches: function(dom) {

        // helper method, returns true if a given case node
        // is supported, false otherwise
        var isSupported = function(caseNode) {

            var ns = caseNode.attributes["required-namespace"];
            if(!ns) {
                // the namespace was not specified, that should
                // never happen, we don't support it then
                console.log("Encountered a case statement with no required-namespace");
                return false;
            }
            // all the xmlns that readium is known to support
            // TODO this is going to require maintenance
            var supportedNamespaces = ["http://www.w3.org/1998/Math/MathML"];
            return _.include(supportedNamespaces, ns);
        };

        $('switch', dom).each( function() {

            // keep track of whether or now we found one
            var found = false;

            $('case', this).each(function() {

                if( !found && isSupported(this) ) {
                    found = true; // we found the node, don't remove it
                }
                else {
                    $(this).remove(); // remove the node from the dom
//                    $(this).prop("hidden", true);
                }
            });

            if(found) {
                // if we found a supported case, remove the default
                $('default', this).remove();
//                $('default', this).prop("hidden", true);
            }
        })
    },

    onPaginationChanged: function() {

        this.paginationInfo.pageOffset = (this.paginationInfo.columnWidth + this.paginationInfo.columnGap) * this.paginationInfo.visibleColumnCount * this.paginationInfo.currentSpreadIndex;
        this.redraw();
        this.trigger("ViewPaginationChanged");
    },

    openPagePrev:  function () {

        if(!this.currentSpineItem) {
            return;
        }

        if(this.paginationInfo.currentSpreadIndex > 0) {
            this.paginationInfo.currentSpreadIndex--;
            this.onPaginationChanged();
        }
        else {

            var prevSpineItem = this.spine.prevItem(this.currentSpineItem);
            if(prevSpineItem) {

                var pageRequest = new ReadiumSDK.Models.PageOpenRequest(prevSpineItem);
                pageRequest.setLastPage();
                this.openPage(pageRequest);
            }
        }
    },

    openPageNext: function () {

        if(!this.currentSpineItem) {
            return;
        }

        if(this.paginationInfo.currentSpreadIndex < this.paginationInfo.spreadCount - 1) {
            this.paginationInfo.currentSpreadIndex++;
            this.onPaginationChanged();
        }
        else {

            var nextSpineItem = this.spine.nextItem(this.currentSpineItem);
            if(nextSpineItem) {

                var pageRequest = new ReadiumSDK.Models.PageOpenRequest(nextSpineItem);
                pageRequest.setFirstPage();
                this.openPage(pageRequest);
            }
        }
    },

    updatePagination: function() {

        if(!this.$epubHtml) {
            return;
        }

        this.$iframe.css("width", this.lastViewPortSize.width + "px");
        this.$iframe.css("height", this.lastViewPortSize.height + "px");

        this.$epubHtml.css("height", this.lastViewPortSize.height + "px");

        this.paginationInfo.columnWidth = (this.lastViewPortSize.width - this.paginationInfo.columnGap * (this.paginationInfo.visibleColumnCount - 1)) / this.paginationInfo.visibleColumnCount;

        //we do this because CSS will floor column with by itself if it is not a round number
        this.paginationInfo.columnWidth = Math.floor(this.paginationInfo.columnWidth);

        this.$epubHtml.css("width", this.paginationInfo.columnWidth);

        this.shiftBookOfScreen();

        this.$epubHtml.css("-webkit-column-width", this.paginationInfo.columnWidth + "px");

        var self = this;
        //TODO it takes time for rendition_layout engine to arrange columns we waite
        //it would be better to react on rendition_layout column reflow finished event
        setTimeout(function(){

            var columnizedContentWidth = self.$epubHtml[0].scrollWidth;

            self.paginationInfo.columnCount = Math.round((columnizedContentWidth + self.paginationInfo.columnGap) / (self.paginationInfo.columnWidth + self.paginationInfo.columnGap));

            self.paginationInfo.spreadCount =  Math.ceil(self.paginationInfo.columnCount / self.paginationInfo.visibleColumnCount);

            if(self.paginationInfo.currentSpreadIndex >= self.paginationInfo.spreadCount) {
                self.paginationInfo.currentSpreadIndex = self.paginationInfo.spreadCount - 1;
            }

            self.openDeferredElement();

            //We do this to force re-rendering of the document in the iframe.
            //There is a bug in WebView control with right to left columns layout - after resizing the window html document
            //is shifted in side the containing div. Hiding and showing the html element puts document in place.
            self.$epubHtml.hide();
            setTimeout(function() {
                self.$epubHtml.show();
                self.onPaginationChanged();
            }, 50);

        }, 100);

    },

    shiftBookOfScreen: function() {

        if(this.spine.isLeftToRight()) {
            this.$epubHtml.css("left", (this.lastViewPortSize.width + 1000) + "px");
        }
        else {
            this.$epubHtml.css("right", (this.lastViewPortSize.width + 1000) + "px");
        }
    },

    getFirstVisibleElementCfi: function(){

        var columnsLeftOfViewport = Math.round(this.paginationInfo.pageOffset / (this.paginationInfo.columnWidth + this.paginationInfo.columnGap));
        var topOffset = columnsLeftOfViewport * this.$el.height();

        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(this.$el, this.$iframe);
        return navigation.getFirstVisibleElementCfi(topOffset);
    },

    getPaginationInfo: function() {

        var paginationInfo = new ReadiumSDK.Models.CurrentPagesInfo(this.spine.items.length, this.spine.package.isFixedLayout(), this.spine.direction);

        if(!this.currentSpineItem) {
            return paginationInfo;
        }

        var currentPage = this.paginationInfo.currentSpreadIndex * this.paginationInfo.visibleColumnCount;

        for(var i = 0; i < this.paginationInfo.visibleColumnCount && (currentPage + i) < this.paginationInfo.columnCount; i++) {

            paginationInfo.addOpenPage(currentPage + i, this.paginationInfo.columnCount, this.currentSpineItem.idref, this.currentSpineItem.index);
        }

        return paginationInfo;

    },

    bookmarkCurrentPage: function() {

        if(!this.currentSpineItem) {

            return new ReadiumSDK.Models.BookmarkData("", "");
        }

        return new ReadiumSDK.Models.BookmarkData(this.currentSpineItem.idref, this.getFirstVisibleElementCfi());
    }

});

define("reflowableView", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.


/*
 * Renders one page of fixed layout spread
 * @class ReadiumSDK.Views.OnePageView
 */

//Representation of one fixed page
ReadiumSDK.Views.OnePageView = Backbone.View.extend({

    currentSpineItem: undefined,
    spine: undefined,
    contentAlignment: undefined, //expected 'center' 'left' 'right'

    meta_size : {
        width: 0,
        height: 0
    },


    initialize: function() {

        this.spine = this.options.spine;
        this.contentAlignment = this.options.contentAlignment;

    },

    isDisplaying:function() {

        return this.currentSpineItem != undefined;
    },

    render: function() {

        if(!this.$iframe) {

            this.template = _.template($("#template-ope-fixed-page-view").html(), {});
            this.setElement(this.template);
            this.$el.addClass(this.options.class);
            this.$iframe = $("iframe", this.$el);
        }

        return this;
    },

    remove: function() {

        this.currentSpineItem = undefined;

        //base remove
        Backbone.View.prototype.remove.call(this);
    },

    onIFrameLoad:  function(success) {

        if(success) {
            var epubContentDocument = this.$iframe[0].contentDocument;
            this.$epubHtml = $("html", epubContentDocument);
            this.$epubHtml.css("overflow", "hidden");
            this.fitToScreen();
        }

        this.trigger("PageLoaded");
    },

    fitToScreen: function() {

        if(!this.isDisplaying()) {
            return;
        }

        this.updateMetaSize();

        if(this.meta_size.width <= 0 || this.meta_size.height <= 0) {
            return;
        }


        var containerWidth = this.$el.width();
        var containerHeight = this.$el.height();

        var horScale = containerWidth / this.meta_size.width;
        var verScale = containerHeight / this.meta_size.height;

        var scale = Math.min(horScale, verScale);

        var newWidth = this.meta_size.width * scale;
        var newHeight = this.meta_size.height * scale;

        var top = Math.floor((containerHeight - newHeight) / 2);

        var left;
        if(this.contentAlignment == "left") {
            left = 0;
        }
        else if(this.contentAlignment == "right") {
            left = containerWidth - newWidth;
        }
        else { //center
            left = Math.floor((containerWidth - newWidth) / 2);
        }

        if(top < 0) top = 0;
        if(left < 0) left = 0;

        var css = this.generateTransformCSS(left, top, scale);
        css["width"] = this.meta_size.width;
        css["height"] = this.meta_size.height;

        this.$epubHtml.css(css);
    },

    generateTransformCSS: function(left, top, scale) {

        var transformString = "translate(" + left + "px, " + top + "px) scale(" + scale + ")";

        //modernizer library can be used to get browser independent transform attributes names (implemented in readium-web fixed_layout_book_zoomer.js)
        var css = {};
        css["-webkit-transform"] = transformString;
        css["-webkit-transform-origin"] = "0 0";

        return css;
    },

    updateMetaSize: function() {

        var contentDocument = this.$iframe[0].contentDocument;

        // first try to read viewport size
        var content = $('meta[name=viewport]', contentDocument).attr("content");

        // if not found try viewbox (used for SVG)
        if(!content) {
            content = $('meta[name=viewbox]', contentDocument).attr("content");
        }

        if(content) {
            var size = this.parseSize(content);
            if(size) {
                this.meta_size.width = size.width;
                this.meta_size.height = size.height;
            }
        }
        else { //try to get direct image size

            var $img = $(contentDocument).find('img');
            var width = $img.width();
            var height = $img.height();

            if( width > 0) {
                this.meta_size.width = width;
                this.meta_size.height = height;
            }
        }

    },

    loadSpineItem: function(spineItem) {

        if(this.currentSpineItem != spineItem) {

            this.currentSpineItem = spineItem;
            var src = this.spine.getItemUrl(spineItem);

            ReadiumSDK.Helpers.LoadIframe(this.$iframe[0], src, this.onIFrameLoad, this);
        }
    },

    parseSize: function(content) {

        var pairs = content.replace(/\s/g, '').split(",");

        var dict = {};

        for(var i = 0;  i  < pairs.length; i++) {
            var nameVal = pairs[i].split("=");
            if(nameVal.length == 2) {

                dict[nameVal[0]] = nameVal[1];
            }
        }

        var width = Number.NaN;
        var height = Number.NaN;

        if(dict["width"]) {
            width = parseInt(dict["width"]);
        }

        if(dict["height"]) {
            height = parseInt(dict["height"]);
        }

        if(!isNaN(width) && !isNaN(height)) {
            return { width: width, height: height} ;
        }

        return undefined;
    },

    getFirstVisibleElementCfi: function(){

        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(this.$el, this.$iframe);
        return navigation.getFirstVisibleElementCfi(0);

    }

});

define("onePageView", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * View for rendering fixed layout page spread
 * @class ReadiumSDK.Views.FixedView
 */

ReadiumSDK.Views.FixedView = Backbone.View.extend({

    leftPageView: undefined,
    rightPageView: undefined,
    centerPageView: undefined,
    spine: undefined,

    spread: undefined,

    pageViews: [],

    initialize: function() {

        this.spine = this.options.spine;
        this.spread = new ReadiumSDK.Models.Spread(this.spine);

        this.leftPageView = new ReadiumSDK.Views.OnePageView({spine: this.spine, class: "left_page", contentAlignment: "right"});
        this.rightPageView = new ReadiumSDK.Views.OnePageView({spine: this.spine, class: "right_page", contentAlignment: "left"});
        this.centerPageView = new ReadiumSDK.Views.OnePageView({spine: this.spine, class: "center_page", contentAlignment: "center"});

        this.pageViews.push(this.leftPageView);
        this.pageViews.push(this.rightPageView);
        this.pageViews.push(this.centerPageView);

        //event with namespace for clean unbinding
        $(window).on("resize.ReadiumSDK.readerView", _.bind(this.onViewportResize, this));
    },

    isReflowable: function() {
        return false;
    },

    render: function(){

        this.template = _.template($("#template-fixed-view").html(), {});
        this.setElement(this.template);
        this.$spreadWrap = $("#spread-wrap", this.$el);

        return this;
    },

    remove: function() {

        $(window).off("resize.ReadiumSDK.readerView");

        //base remove
        Backbone.View.prototype.remove.call(this);
    },

    setViewSettings: function(settings) {
        this.spread.setSyntheticSpread(settings.isSyntheticSpread);
    },

    redraw: function() {

        var self = this;

        var pageLoadDeferrals = this.createPageLoadDeferrals([{pageView: this.leftPageView, spineItem: this.spread.leftItem},
                                                              {pageView: this.rightPageView, spineItem: this.spread.rightItem},
                                                              {pageView: this.centerPageView, spineItem: this.spread.centerItem}]);

        if(pageLoadDeferrals.length > 0) {
            $.when.apply($, pageLoadDeferrals).done(function(){
                self.onPagesLoaded()
            });
        }

    },

    createPageLoadDeferrals: function(viewItemPairs) {

        var pageLoadDeferrals = [];

        for(var i = 0; i < viewItemPairs.length; i++) {

            var dfd = this.updatePageViewForItem(viewItemPairs[i].pageView, viewItemPairs[i].spineItem);
            if(dfd) {
                pageLoadDeferrals.push(dfd);
            }

        }

        return pageLoadDeferrals;

    },

    onPagesLoaded: function() {
        this.trigger("ViewPaginationChanged");
    },

    onViewportResize: function() {

        for(var i = 0; i < this.pageViews.length; i++) {

            this.pageViews[i].fitToScreen();
        }
    },


    openPage: function(paginationRequest) {

        if(!paginationRequest.spineItem) {
            return;
        }

        this.spread.openItem(paginationRequest.spineItem);
        this.redraw();
    },


    openPagePrev: function() {

        this.spread.openPrev();
        this.redraw();
    },

    openPageNext: function() {

        this.spread.openNext();
        this.redraw();
    },

    updatePageViewForItem: function(pageView, item) {

        if(!item) {
            if(pageView.isDisplaying()) {
                pageView.remove();
            }

            return undefined;
        }

        if(!pageView.isDisplaying()) {
            this.$spreadWrap.append(pageView.render().$el);
        }

        var dfd = $.Deferred();

        pageView.on("PageLoaded", dfd.resolve);

        pageView.loadSpineItem(item);

        return dfd.promise();

    },

    getPaginationInfo: function() {

        var paginationInfo = new ReadiumSDK.Models.CurrentPagesInfo(this.spine.items.length, this.spine.package.isFixedLayout(), this.spine.direction);

        var spreadItems = [this.spread.leftItem, this.spread.rightItem, this.spread.centerItem];

        for(var i = 0; i < spreadItems.length; i++) {

            var spreadItem = spreadItems[i];

            if(spreadItem) {
                paginationInfo.addOpenPage(0, 1, spreadItem.idref, spreadItem.index);
            }
        }

        return paginationInfo;
    },

    bookmarkCurrentPage: function() {

        var viewsToCheck = [];

        if( this.spine.isLeftToRight() ) {
            viewsToCheck = [this.leftPageView, this.centerPageView, this.rightPageView];
        }
        else {
            viewsToCheck = [this.rightPageView, this.centerPageView, this.leftPageView];
        }

        for(var i = 0; i < viewsToCheck.length; i++) {
            if(viewsToCheck[i].isDisplaying()) {

                var idref = viewsToCheck[i].currentSpineItem.idref;
                var cfi = viewsToCheck[i].getFirstVisibleElementCfi();

                if(cfi == undefined) {
                    cfi = "";
                }

                return new ReadiumSDK.Models.BookmarkData(idref, cfi);

            }
        }

        return new ReadiumSDK.Models.BookmarkData("", "");
    }

});
define("fixedView", function(){});

//  Created by Boris Schneiderman.
//  Copyright (c) 2012-2013 The Readium Foundation.
//
//  The Readium SDK is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

/**
 *
 * Top level View object. Interface for view manipulation public APIs
 *
 * @class ReadiumSDK.Views.ReaderView
 *
 * */
ReadiumSDK.Views.ReaderView = Backbone.View.extend({

    currentView: undefined,
    package: undefined,
    spine: undefined,
    viewerSettings:undefined,

    initialize: function() {

        this.viewerSettings = new ReadiumSDK.Models.ViewerSettings({});

    },

    renderCurrentView: function(isReflowable) {

        if(this.currentView){

            //current view is already rendered
            if( this.currentView.isReflowable() === isReflowable) {
                return;
            }

            this.resetCurrentView();
        }

        if(isReflowable) {

            this.currentView = new ReadiumSDK.Views.ReflowableView({spine:this.spine});
        }
        else {

            this.currentView = new ReadiumSDK.Views.FixedView({spine:this.spine});
        }

        this.currentView.setViewSettings(this.viewerSettings);

        this.$el.append(this.currentView.render().$el);

        var self = this;
        this.currentView.on("ViewPaginationChanged", function(){

            var paginationReportData = self.currentView.getPaginationInfo();
            self.trigger("PaginationChanged", paginationReportData);

        });

    },

    resetCurrentView: function() {

        if(!this.currentView) {
            return;
        }

        this.currentView.off("ViewPaginationChanged");
        this.currentView.remove();
        this.currentView = undefined;
    },

    /**
     * Triggers the process of opening the book and requesting resources specified in the packageData
     *
     * @method openBook
     * @param {ReadiumSDK.Models.PackageData} packageData DTO Object hierarchy of Package, Spine, SpineItems passed by
     * host application to the reader
     * @param {ReadiumSDK.Models.PageOpenRequest|undefined} openPageRequestData Optional parameter specifying
     * on what page book should be open when it is loaded. If nothing is specified book will be opened on the first page
     */
    openBook: function(packageData, openPageRequestData) {

        this.package = new ReadiumSDK.Models.Package({packageData: packageData});
        this.spine = this.package.spine;

        this.resetCurrentView();

        if(openPageRequestData) {

            if(openPageRequestData.idref) {

                if(openPageRequestData.spineItemPageIndex) {
                    this.openSpineItemPage(openPageRequestData.idref, openPageRequestData.spineItemPageIndex);
                }
                else if(openPageRequestData.elementCfi) {
                    this.openSpineItemElementCfi(openPageRequestData.idref, openPageRequestData.elementCfi);
                }
                else {
                    this.openSpineItemPage(openPageRequestData.idref, 0);
                }
            }
            else if(openPageRequestData.contentRefUrl && openPageRequestData.sourceFileHref) {
                this.openContentUrl(openPageRequestData.contentRefUrl, openPageRequestData.sourceFileHref);
            }
            else {
                console.log("Invalid page request data: idref required!");
            }
        }
        else {// if we where not asked to open specific page we will open the first one

            var spineItem = this.spine.first();
            if(spineItem) {
                var pageOpenRequest = new ReadiumSDK.Models.PageOpenRequest(spineItem);
                pageOpenRequest.setFirstPage();
                this.openPage(pageOpenRequest);
            }

        }

    },

    /**
     * Flips the page from left to right. Takes to account the page progression direction to decide to flip to prev or next page.
     * @method openPageLeft
     */
    openPageLeft: function() {

        if(this.package.spine.isLeftToRight()) {
            this.openPagePrev();
        }
        else {
            this.openPageNext();
        }
    },

    /**
     * Flips the page from right to left. Takes to account the page progression direction to decide to flip to prev or next page.
     * @method openPageRight
     */
    openPageRight: function() {

        if(this.package.spine.isLeftToRight()) {
            this.openPageNext();
        }
        else {
            this.openPagePrev();
        }

    },

    /**
     * Updates reader view based on the settings specified in settingsData object
     * @param settingsData
     */
    updateSettings: function(settingsData) {

        console.log("UpdateSettings: " + JSON.stringify(settingsData));

        this.viewerSettings.update(settingsData);

        if(this.currentView) {

            var bookMark = this.currentView.bookmarkCurrentPage();

            this.currentView.setViewSettings(this.viewerSettings);

            if(bookMark) {
                this.openSpineItemElementCfi(bookMark.idref, bookMark.elementCfi);
            }
        }
    },

    /**
     * Opens the next page.
     */
    openPageNext: function() {

        var paginationInfo = this.currentView.getPaginationInfo();

        if(paginationInfo.openPages.length == 0) {
            return;
        }

        var lastOpenPage = paginationInfo.openPages[paginationInfo.openPages.length - 1];

        if(lastOpenPage.spineItemPageIndex < lastOpenPage.spineItemPageCount - 1) {
            this.currentView.openPageNext();
            return;
        }

        var currentSpineItem = this.spine.getItemById(lastOpenPage.idref);

        var nextSpineItem = this.spine.nextItem(currentSpineItem);

        if(!nextSpineItem) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(nextSpineItem);
        openPageRequest.setFirstPage();

        this.openPage(openPageRequest);
    },

    /**
     * Opens the previews page.
     */
    openPagePrev: function() {

        var paginationInfo = this.currentView.getPaginationInfo();

        if(paginationInfo.openPages.length == 0) {
            return;
        }

        var firstOpenPage = paginationInfo.openPages[0];

        if(firstOpenPage.spineItemPageIndex > 0) {
            this.currentView.openPagePrev();
            return;
        }

        var currentSpineItem = this.spine.getItemById(firstOpenPage.idref);

        var prevSpineItem = this.spine.prevItem(currentSpineItem);

        if(!prevSpineItem) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(prevSpineItem);
        openPageRequest.setLastPage();

        this.openPage(openPageRequest);
    },

    getSpineItem: function(idref) {

        if(!idref) {

            console.log("idref parameter value missing!");
            return undefined;
        }

        var spineItem = this.spine.getItemById(idref);
        if(!spineItem) {
            console.log("Spine item with id " + idref + " not found!");
            return undefined;
        }

        return spineItem;

    },

    /**
     * Opens the page of the spine item with element with provided cfi
     *
     * @method openSpineItemElementCfi
     *
     * @param {string} idref Id of the spine item
     * @param {string} elementCfi CFI of the element to be shown
     */
    openSpineItemElementCfi: function(idref, elementCfi) {

        var spineItem = this.getSpineItem(idref);

        if(!spineItem) {
            return;
        }

        var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem);
        if(elementCfi) {
            pageData.setElementCfi(elementCfi);
        }

        this.openPage(pageData);
    },

    /**
     *
     * Opens specified page index of the current spine item
     *
     * @method openPageIndex
     *
     * @param {number} pageIndex Zero based index of the page in the current spine item
     */
    openPageIndex: function(pageIndex) {

        if(!this.currentView) {
            return;
        }

        var pageRequest;
        if(this.package.isFixedLayout()) {
            var spineItem = this.package.spine.items[pageIndex];
            if(!spineItem) {
                return;
            }

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(spineItem);
            pageRequest.setPageIndex(0);
        }
        else {

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(undefined);
            pageRequest.setPageIndex(pageIndex);

        }

        this.openPage(pageRequest);
    },

    openPage: function(pageRequest) {

        this.renderCurrentView(pageRequest.spineItem.isReflowable());
        this.currentView.openPage(pageRequest);
    },


    /**
     *
     * Opens page index of the spine item with idref provided
     *
     * @param {string} idref Id of the spine item
     * @param {number} pageIndex Zero based index of the page in the spine item
     */
    openSpineItemPage: function(idref, pageIndex) {

        var spineItem = this.getSpineItem(idref);

        if(!spineItem) {
            return;
        }

        var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem);
        if(pageIndex) {
            pageData.setPageIndex(pageIndex);
        }

        this.openPage(pageData);
    },

    /**
     * Opens the content document specified by the url
     *
     * @method openContentUrl
     *
     * @param {string} contentRefUrl Url of the content document
     * @param {string | undefined} sourceFileHref Url to the file that contentRefUrl is relative to. If contentRefUrl is
     * relative ot the source file that contains it instead of the package file (ex. TOC file) We have to know the
     * sourceFileHref to resolve contentUrl relative to the package file.
     *
     */
    openContentUrl: function(contentRefUrl, sourceFileHref) {

        var combinedPath = ReadiumSDK.Helpers.ResolveContentRef(contentRefUrl, sourceFileHref);


        var hashIndex = combinedPath.indexOf("#");
        var hrefPart;
        var elementId;
        if(hashIndex >= 0) {
            hrefPart = combinedPath.substr(0, hashIndex);
            elementId = combinedPath.substr(hashIndex + 1);
        }
        else {
            hrefPart = combinedPath;
            elementId = undefined;
        }

        var spineItem = this.spine.getItemByHref(hrefPart);

        if(!spineItem) {
            return;
        }

        var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem)
        if(elementId){
            pageData.setElementId(elementId);
        }

        this.openPage(pageData);
    },

    /**
     *
     * Returns the bookmark associated with currently opened page.
     *
     * @method bookmarkCurrentPage
     *
     * @returns {string} Stringified ReadiumSDK.Models.BookmarkData object.
     */
    bookmarkCurrentPage: function() {
        return JSON.stringify(this.currentView.bookmarkCurrentPage());
    }

});
define("readerView", function(){});

define('epub_renderer_module',['require', 'module', 'jquery', 'underscore', 'backbone', 'readiumSDK', 'helpers', 
    'triggers', 'bookmarkData', 'spineItem', 'spine', 'fixedPageSpread',
    'package', 'viewerSettings', 'currentPagesInfo', 'pageOpenRequest', 'epubCfi', 'cfiNavigationLogic', 'reflowableView',
    'onePageView', 'fixedView', 'readerView'],

    function (require, module, $, _, Backbone, ReadiumSDK, helpers, triggers, bookmarkData, spineItem, spine, fixedPageSpread,
        package, viewerSettings, currentPagesInfo, pageOpenRequest, epubCfi, cfiNavigationLogic, reflowableView, onePageView, fixedView, readerView
        ) {

            var ReadiumSDK;

    }
);        var EpubRendererModule = function (elementToBindReaderTo, packageData) {

            var reader = new ReadiumSDK.Views.ReaderView({
              el: elementToBindReaderTo
            });

            // Description: The public interface
            return {

                openBook : function () { 
                    return reader.openBook(packageData);
                },
                openSpineItemElementCfi : function (idref, elementCfi) { 
                    return reader.openSpineItemElementCfi(idref, elementCfi); 
                },
                openSpineItemPage: function(idref, pageIndex) {
                    return reader.openSpineItemPage(idref, pageIndex);
                },
                openPageIndex: function(pageIndex) {
                    return reader.openPageIndex(pageIndex);
                },
                openPageRight : function () { 
                    return reader.openPageRight(); 
                },
                openPageLeft : function () { 
                    return reader.openPageLeft(); 
                },
                updateSettings : function (settingsData) {
                    return reader.updateSettings(settingsData);
                },
                bookmarkCurrentPage : function () {
                    return reader.bookmarkCurrentPage();
                }
            };
        };
        return EpubRendererModule;
});
define('Readium',['require', 'module', 'jquery', 'underscore', 'backbone', 'epub_fetch_module',
    'epub_module', 'epub_reading_system', 'epub_renderer_module'],
    function (require, module, $, _, Backbone, EpubFetchModule, EpubModule, EpubReadingSystem, EpubRendererModule) {
        /**
         * Creates an instance of the Readium.js object.
         *
         * @constructor
         * @param elementToBindReaderTo The document element to bind display of the reader to.
         * @param packageDocumentURL : The URL to the package document
         * @param jsLibDir The path (relative to the current document) in which dependant zip.js libraries can be found.
         * @param definitionCallback The callback function that asynchronously receives the object's public interface once it has been initialized (document has been parsed).
         */
        var Readium = function (elementToBindReaderTo, packageDocumentURL, jsLibDir, definitionCallback) {

            // -------------- Initialization of viewer ------------------ //
            var epubFetch = new EpubFetchModule({
                packageDocumentURL: packageDocumentURL,
                libDir: jsLibDir
            });
            var epub = new EpubModule(epubFetch, function () {

                var renderer = new EpubRendererModule(elementToBindReaderTo, epub.getPackageData());
                
                // Readium.js module api
                definitionCallback({

                    openBook : function () { 
                        return renderer.openBook();
                    },
                    openSpineItemElementCfi : function (idref, elementCfi) { 
                        return renderer.openSpineItemElementCfi(idref, elementCfi);
                    },
                    openSpineItemPage: function(idref, pageIndex) {
                        return renderer.openSpineItemPage(idref, pageIndex);
                    },
                    openPageIndex: function(pageIndex) {
                        return renderer.openPageIndex(pageIndex);
                    },
                    openPageRight : function () { 
                        return renderer.openPageRight();
                    },
                    openPageLeft : function () { 
                        return renderer.openPageLeft();
                    },
                    updateSettings : function (settingsData) {
                        return renderer.updateSettings(settingsData);
                    },
                    bookmarkCurrentPage : function () {
                        return renderer.bookmarkCurrentPage();
                    }
                });    
            });
        };

        // Note: the epubReadingSystem object may not be ready when directly using the
        // window.onload callback function (from within an (X)HTML5 EPUB3 content document's Javascript code)
        // To address this issue, the recommended code is:
        // -----
        console.log(navigator.epubReadingSystem);
        return Readium;
    });
    var Readium = require('Readium');
    return Readium;
}));
