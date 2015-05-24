/**
 * @license RequireJS text 2.0.12 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.12',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!version.json',[],function () { return '{"readiumJsViewer":{"sha":"d4567907035831b187ad4aeb9121f67eb4bbaa93","clean":false,"version":"0.20.0-alpha","chromeVersion":"2.20.0-alpha","tag":"0.20.0-56-gd456790","branch":"feature/pluginsX","release":false,"timestamp":1432503819977},"readiumJs":{"sha":"cf31116f72924da96c7d5181394767de50d6e682","clean":false,"version":"0.20.0-alpha","tag":"0.17-114-gcf31116","branch":"feature/pluginsX","release":false,"timestamp":1432503820386},"readiumSharedJs":{"sha":"5ae247be68b55aa551d5715e3f6a31d4536c4bc2","clean":true,"version":"0.20.0-alpha","tag":"0.16-141-g5ae247b","branch":"feature/pluginsX","release":false,"timestamp":1432503820667},"readiumCfiJs":{"sha":"b2ee78304f30ae90a8494a513e0f83a10231e86a","clean":true,"version":"0.20.0-alpha","tag":"0.1.4-109-gb2ee783","branch":"feature/plugins","release":false,"timestamp":1432503820904}}';});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-fetch/markup_parser',[],
    function () {

        var MarkupParser = function (){

            var self = this;

            this.parseXml = function(xmlString) {
                return self.parseMarkup(xmlString, 'text/xml');
            };

            this.parseMarkup = function(markupString, contentType) {
                var parser = new window.DOMParser;
                return parser.parseFromString(markupString, contentType);
            };

        };

        return MarkupParser;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-fetch/discover_content_type',['jquery', 'URIjs'], function ($, URI) {

    var _instance = undefined;

    var ContentTypeDiscovery = function() {

        var self = this;

        ContentTypeDiscovery.suffixContentTypeMap = {
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
        };

        this.identifyContentTypeFromFileName = function(contentUrl) {
            var contentUrlSuffix = URI(contentUrl).suffix();
            var contentType = 'application/octet-stream';
            if (typeof ContentTypeDiscovery.suffixContentTypeMap[contentUrlSuffix] !== 'undefined') {
                contentType = ContentTypeDiscovery.suffixContentTypeMap[contentUrlSuffix];
            }
            return contentType;
        };

        this.identifyContentType = function (contentUrl) {
            // TODO: Make the call asynchronous (which would require a callback and would probably make sense
            // when calling functions are also remodelled for async).

            var contentType = $.ajax({
                type: "HEAD",
                url: contentUrl,
                async: false
            }).getResponseHeader('Content-Type');
            if (contentType === null) {
                contentType = self.identifyContentTypeFromFileName(contentUrl);
                console.log('guessed contentType [' + contentType + '] from URI [' + contentUrl +
                    ']. Configuring the web server to provide the content type is recommended.');

            }

            return contentType;
        }

    };

    if(!_instance) {
        _instance = new ContentTypeDiscovery();
    }

    return _instance;

});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-fetch/plain_resource_fetcher',['jquery', 'URIjs', './discover_content_type'], function ($, URI, ContentTypeDiscovery) {

    var PlainResourceFetcher = function(parentFetcher, baseUrl){

        var self = this;
        var _packageDocumentAbsoluteUrl;
        var _packageDocumentRelativePath;

        // INTERNAL FUNCTIONS

        function fetchFileContents(pathRelativeToPackageRoot, readCallback, onerror) {
            var fileUrl = self.resolveURI(pathRelativeToPackageRoot);

            if (typeof pathRelativeToPackageRoot === 'undefined') {
                throw 'Fetched file relative path is undefined!';
            }

            var xhr = new XMLHttpRequest();
            xhr.open('GET', fileUrl, true);
            xhr.responseType = 'arraybuffer';
            xhr.onerror = onerror;

            xhr.onload = function (loadEvent) {
                readCallback(xhr.response);
            };

            xhr.send();
        }


        // PUBLIC API

        this.initialize = function(callback) {

            parentFetcher.getXmlFileDom('META-INF/container.xml', function (containerXmlDom) {
                _packageDocumentRelativePath = parentFetcher.getRootFile(containerXmlDom);
                _packageDocumentAbsoluteUrl = self.resolveURI(_packageDocumentRelativePath);

                callback();

            }, function(error) {
                console.error("unable to find package document: " + error);
                _packageDocumentAbsoluteUrl = baseUrl;

                callback();
            });
        };

        this.resolveURI = function (pathRelativeToPackageRoot) {
            return baseUrl + "/" + pathRelativeToPackageRoot;
        };


        this.getPackageUrl = function() {
            return _packageDocumentAbsoluteUrl;
        };

        this.fetchFileContentsText = function(pathRelativeToPackageRoot, fetchCallback, onerror) {
            var fileUrl = self.resolveURI(pathRelativeToPackageRoot);

            if (typeof fileUrl === 'undefined') {
                throw 'Fetched file URL is undefined!';
            }
            $.ajax({
                // encoding: "UTF-8",
                // mimeType: "text/plain; charset=UTF-8",
                // beforeSend: function( xhr ) {
                //     xhr.overrideMimeType("text/plain; charset=UTF-8");
                // },
                isLocal: fileUrl.indexOf("http") === 0 ? false : true,
                url: fileUrl,
                dataType: 'text', //https://api.jquery.com/jQuery.ajax/
                async: true,
                success: function (result) {
                    fetchCallback(result);
                },
                error: function (xhr, status, errorThrown) {
                    console.error('Error when AJAX fetching ' + fileUrl);
                    console.error(status);
                    console.error(errorThrown);

                    // // isLocal = false with custom URI scheme / protocol results in false fail on Firefox (Chrome okay)
                    // if (status === "error" && (!errorThrown || !errorThrown.length) && xhr.responseText && xhr.responseText.length)
                    // {
                    //     console.error(xhr);
                    //     if (typeof xhr.getResponseHeader !== "undefined") console.error(xhr.getResponseHeader("Content-Type"));
                    //     if (typeof xhr.getAllResponseHeaders !== "undefined") console.error(xhr.getAllResponseHeaders());
                    //     if (typeof xhr.responseText !== "undefined") console.error(xhr.responseText);
                    //     
                    //     // success
                    //     fetchCallback(xhr.responseText);
                    //     return;
                    // }
                    
                    onerror(errorThrown);
                }
            });
        };

        this.fetchFileContentsBlob = function(pathRelativeToPackageRoot, fetchCallback, onerror) {

            var decryptionFunction = parentFetcher.getDecryptionFunctionForRelativePath(pathRelativeToPackageRoot);
            if (decryptionFunction) {
                var origFetchCallback = fetchCallback;
                fetchCallback = function (unencryptedBlob) {
                    decryptionFunction(unencryptedBlob, function (decryptedBlob) {
                        origFetchCallback(decryptedBlob);
                    });
                };
            }
            fetchFileContents(pathRelativeToPackageRoot, function (contentsArrayBuffer) {
                var blob = new Blob([contentsArrayBuffer], {
                    type: ContentTypeDiscovery.identifyContentTypeFromFileName(pathRelativeToPackageRoot)
                });
                fetchCallback(blob);
            }, onerror);
        };

        this.getPackageDom = function (callback, onerror) {
            self.fetchFileContentsText(_packageDocumentRelativePath, function (packageXml) {
                var packageDom = parentFetcher.markupParser.parseXml(packageXml);
                callback(packageDom);
            }, onerror);
        };

    };

    return PlainResourceFetcher;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('readium_js/epub-fetch/zip_resource_fetcher',['jquery', 'URIjs', './discover_content_type', 'zip-ext'], function ($, URI, ContentTypeDiscovery, zip) {

    var ZipResourceFetcher = function(parentFetcher, baseUrl, libDir) {

        var _checkCrc32 = false;
        var _zipFs;

        // INTERNAL FUNCTIONS

        // Description: perform a function with an initialized zip filesystem, making sure that such filesystem is initialized.
        // Note that due to a race condition, more than one zip filesystem may be instantiated.
        // However, the last one to be set on the model object will prevail and others would be garbage collected later.
        function withZipFsPerform(callback, onerror) {

            if (_zipFs) {

                callback(_zipFs, onerror);

            } else {

                // The Web Worker requires standalone z-worker/inflate/deflate.js files in libDir (i.e. cannot be aggregated/minified/optimised in the final generated single-file build)
                zip.useWebWorkers = true; // (true by default)
                zip.workerScriptsPath = libDir;

                _zipFs = new zip.fs.FS();
                _zipFs.importHttpContent(
                    baseUrl,
                    true,
                    function () {
                        callback(_zipFs, onerror);
                    },
                    onerror
                );
            }
        }

        function fetchFileContents (relativePathRelativeToPackageRoot, readCallback, onerror) {

            if (typeof relativePathRelativeToPackageRoot === 'undefined') {
                throw 'Fetched file relative path is undefined!';
            }

            withZipFsPerform(
                function (zipFs, onerror) {
                    var entry = zipFs.find(relativePathRelativeToPackageRoot);

                    if (typeof entry === 'undefined' || entry === null) {
                        onerror(new Error('Entry ' + relativePathRelativeToPackageRoot + ' not found in zip ' + baseUrl));
                    } else {
                        if (entry.directory) {
                            onerror(new Error('Entry ' + relativePathRelativeToPackageRoot + ' is a directory while a file has been expected'));
                        } else {
                            readCallback(entry);
                        }
                    }
                },
                function() {
                    console.log("ERROR");
                    console.log(arguments);
                    onerror(arguments);
                }
            );
        }


        // PUBLIC API

        this.getPackageUrl = function() {
            return baseUrl;
        };

        this.fetchFileContentsText = function(relativePathRelativeToPackageRoot, fetchCallback, onerror) {

            fetchFileContents(relativePathRelativeToPackageRoot, function (entry) {
                entry.getText(fetchCallback, undefined, _checkCrc32);
            }, onerror)
        };

        this.fetchFileContentsData64Uri = function(relativePathRelativeToPackageRoot, fetchCallback, onerror) {
            fetchFileContents(relativePathRelativeToPackageRoot, function (entry) {
                entry.getData64URI(ContentTypeDiscovery.identifyContentTypeFromFileName(relativePathRelativeToPackageRoot),
                    fetchCallback, undefined, _checkCrc32);
            }, onerror)
        };

        this.fetchFileContentsBlob = function(relativePathRelativeToPackageRoot, fetchCallback, onerror) {
            var decryptionFunction = parentFetcher.getDecryptionFunctionForRelativePath(relativePathRelativeToPackageRoot);
            if (decryptionFunction) {
                var origFetchCallback = fetchCallback;
                fetchCallback = function (unencryptedBlob) {
                    decryptionFunction(unencryptedBlob, function (decryptedBlob) {
                        origFetchCallback(decryptedBlob);
                    });
                };
            }
            fetchFileContents(relativePathRelativeToPackageRoot, function (entry) {
                entry.getBlob(ContentTypeDiscovery.identifyContentTypeFromFileName(relativePathRelativeToPackageRoot), fetchCallback,
                    undefined, _checkCrc32);
            }, onerror)
        };

    };

    return ZipResourceFetcher;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define(
    'readium_js/epub-fetch/content_document_fetcher',['jquery', 'underscore', 'URIjs', './discover_content_type'],
    function ($, _, URI, ContentTypeDiscovery) {


        var ContentDocumentFetcher = function (publicationFetcher, spineItem, loadedDocumentUri, publicationResourcesCache, contentDocumentTextPreprocessor) {

            var self = this;

            var _contentDocumentPathRelativeToPackage = spineItem.href;
            var _publicationFetcher = publicationFetcher;
            var _contentDocumentText;
            var _srcMediaType = spineItem.media_type;
            var _contentDocumentDom;
            var _publicationResourcesCache = publicationResourcesCache;
            var _contentDocumentTextPreprocessor = contentDocumentTextPreprocessor;

            // PUBLIC API

            this.fetchContentDocumentAndResolveDom = function (contentDocumentResolvedCallback, errorCallback) {
                _publicationFetcher.relativeToPackageFetchFileContents(_contentDocumentPathRelativeToPackage, 'text',
                    function (contentDocumentText) {
                        _contentDocumentText = contentDocumentText;
                        if (_contentDocumentTextPreprocessor) {
                            _contentDocumentText = _contentDocumentTextPreprocessor(loadedDocumentUri, _contentDocumentText);
                        }
                        self.resolveInternalPackageResources(contentDocumentResolvedCallback, errorCallback);
                    }, errorCallback
                );
            };

            this.resolveInternalPackageResources = function (resolvedDocumentCallback, onerror) {

                _contentDocumentDom = _publicationFetcher.markupParser.parseMarkup(_contentDocumentText, _srcMediaType);
                setBaseUri(_contentDocumentDom, loadedDocumentUri);

                var resolutionDeferreds = [];

                if (_publicationFetcher.shouldFetchMediaAssetsProgrammatically()) {
                    resolveDocumentImages(resolutionDeferreds, onerror);
                    resolveDocumentAudios(resolutionDeferreds, onerror);
                    resolveDocumentVideos(resolutionDeferreds, onerror);
                }

                // TODO: recursive fetching, parsing and DOM construction of documents in IFRAMEs,
                // with CSS preprocessing and obfuscated font handling
                // DANIEL: yep, that's essential for embedded widgets / EPUB scriptable components
                // See https://github.com/readium/readium-js/issues/105
                resolveDocumentIframes(resolutionDeferreds, onerror);

                // TODO: resolution (e.g. using DOM mutation events) of scripts loaded dynamically by scripts
                resolveDocumentScripts(resolutionDeferreds, onerror);
                resolveDocumentLinkStylesheets(resolutionDeferreds, onerror);
                resolveDocumentEmbeddedStylesheets(resolutionDeferreds, onerror);

                $.when.apply($, resolutionDeferreds).done(function () {
                    resolvedDocumentCallback(_contentDocumentDom);
                });

            };

            // INTERNAL FUNCTIONS

            function setBaseUri(documentDom, baseURI) {
                var baseElem = documentDom.getElementsByTagName('base')[0];
                if (!baseElem) {
                    baseElem = documentDom.createElement('base');

                    var anchor = documentDom.getElementsByTagName('head')[0];
                    if (anchor) {
                        anchor.insertBefore(baseElem, anchor.childNodes[0]);
                    }
                }
                baseElem.setAttribute('href', baseURI);
            }

            function _handleError(err) {
                if (err) {
                    if (err.message) {
                        console.error(err.message);
                    }
                    if (err.stack) {
                        console.error(err.stack);
                    }
                }
                console.error(err);
            }

            function fetchResourceForElement(resolvedElem, refAttrOrigVal, refAttr, fetchMode, resolutionDeferreds,
                                             onerror, resourceDataPreprocessing) {

                 function replaceRefAttrInElem(newResourceUrl) {
                     // Store original refAttrVal in a special attribute to provide access to the original href:
                     $(resolvedElem).data('epubZipOrigHref', refAttrOrigVal);
                     $(resolvedElem).attr(refAttr, newResourceUrl);
                 }

                var refAttrUri = new URI(refAttrOrigVal);
                if (refAttrUri.scheme() !== '') {
                    console.log("HTTP / absolute scheme res: " + refAttrOrigVal);

                    return;

                } else if (refAttrOrigVal.indexOf("/") == 0) {
                    console.log("Absolute path res: " + refAttrOrigVal);

                    var HTTPServerRootFolder =
                    window.location ? (
                      window.location.protocol
                      + "//"
                      + window.location.hostname
                      + (window.location.port ? (':' + window.location.port) : '')
                      ) : ''
                    ;

                    replaceRefAttrInElem(HTTPServerRootFolder + refAttrOrigVal);

                    return;
                }

                var contentDocumentPathRelativeToBase = _publicationFetcher.convertPathRelativeToPackageToRelativeToBase(_contentDocumentPathRelativeToPackage);

                var resourceUriRelativeToBase = "/" + (new URI(refAttrOrigVal)).absoluteTo(contentDocumentPathRelativeToBase).toString();


                var cachedResourceUrl = _publicationResourcesCache.getResourceURL(resourceUriRelativeToBase);

                if (cachedResourceUrl) {
                    replaceRefAttrInElem(cachedResourceUrl);
                } else {
                    var resolutionDeferred = $.Deferred();
                    resolutionDeferreds.push(resolutionDeferred);

                    _publicationFetcher.relativeToPackageFetchFileContents(resourceUriRelativeToBase,
                        fetchMode,
                        function (resourceData) {

                            // Generate a function to replace element's resource URL with URL of fetched data.
                            // The function will either be called directly, immediately (if no preprocessing of resourceData is in effect)
                            // or indirectly, later after resourceData preprocessing finishes:
                            var replaceResourceURL = function (finalResourceData) {
                                // Creating an object URL requires a Blob object, so resource data fetched in text mode needs to be wrapped in a Blob:
                                if (fetchMode === 'text') {
                                    var textResourceContentType = ContentTypeDiscovery.identifyContentTypeFromFileName(resourceUriRelativeToBase);
                                    var declaredType = $(resolvedElem).attr('type');
                                    if (declaredType) {
                                        textResourceContentType = declaredType;
                                    }
                                    finalResourceData = new Blob([finalResourceData], {type: textResourceContentType});
                                }
                                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                var resourceObjectURL = window.URL.createObjectURL(finalResourceData);
                                _publicationResourcesCache.putResource(resourceUriRelativeToBase,
                                    resourceObjectURL, finalResourceData);
                                // TODO: take care of releasing object URLs when no longer needed
                                replaceRefAttrInElem(resourceObjectURL);
                                resolutionDeferred.resolve();
                            };

                            if (resourceDataPreprocessing) {
                                resourceDataPreprocessing(resourceData, resourceUriRelativeToBase,
                                    replaceResourceURL);
                            } else {
                                replaceResourceURL(resourceData);
                            }
                        }, onerror);
                }
            }

            function fetchResourceForCssUrlMatch(cssUrlMatch, cssResourceDownloadDeferreds,
                                                 styleSheetUriRelativeToPackageDocument, stylesheetCssResourceUrlsMap,
                                                 isStyleSheetResource) {
                var origMatchedUrlString = cssUrlMatch[0];

                var extractedUrlCandidates = cssUrlMatch.slice(2);
                var extractedUrl = _.find(extractedUrlCandidates, function(matchGroup){ return typeof matchGroup !== 'undefined' });

                var extractedUri = new URI(extractedUrl);
                var isCssUrlRelative = extractedUri.scheme() === '';
                if (!isCssUrlRelative) {
                    // Absolute URLs don't need programmatic fetching
                    return;
                }

                var styleSheetUriRelativeToBase = _publicationFetcher.convertPathRelativeToPackageToRelativeToBase(styleSheetUriRelativeToPackageDocument);

                // fetchResourceForCssUrlMatch() is potentially recursive,
                // so styleSheetUriRelativeToPackageDocument may already be relative to base (i.e. absolute),
                // See preprocessCssStyleSheetData() below
                if (styleSheetUriRelativeToBase.charAt(0) === '/') {
                    styleSheetUriRelativeToBase = styleSheetUriRelativeToBase.substr(1);
                }

                var resourceUriRelativeToBase = "/" + (new URI(extractedUrl)).absoluteTo(styleSheetUriRelativeToBase).toString();

                var cachedResourceURL = _publicationResourcesCache.getResourceURL(resourceUriRelativeToBase);


                if (cachedResourceURL) {
                    stylesheetCssResourceUrlsMap[origMatchedUrlString] = {
                        isStyleSheetResource: isStyleSheetResource,
                        resourceObjectURL: cachedResourceURL
                    };
                } else {
                    var cssUrlFetchDeferred = $.Deferred();
                    cssResourceDownloadDeferreds.push(cssUrlFetchDeferred);

                    var processedBlobCallback = function (resourceDataBlob) {
                        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                        var resourceObjectURL = window.URL.createObjectURL(resourceDataBlob);
                        stylesheetCssResourceUrlsMap[origMatchedUrlString] = {
                            isStyleSheetResource: isStyleSheetResource,
                            resourceObjectURL: resourceObjectURL
                        };
                        _publicationResourcesCache.putResource(resourceUriRelativeToBase,
                            resourceObjectURL, resourceDataBlob);
                        cssUrlFetchDeferred.resolve();
                    };
                    var fetchErrorCallback = function (error) {
                        _handleError(error);
                        cssUrlFetchDeferred.resolve();
                    };

                    var fetchMode;
                    var fetchCallback;
                    if (isStyleSheetResource) {
                        // TODO: test whether recursion works for nested @import rules with arbitrary indirection depth.
                        fetchMode = 'text';
                        fetchCallback = function (styleSheetResourceData) {
                            preprocessCssStyleSheetData(styleSheetResourceData, resourceUriRelativeToBase,
                                function (preprocessedStyleSheetData) {
                                    var resourceDataBlob = new Blob([preprocessedStyleSheetData], {type: 'text/css'});
                                    processedBlobCallback(resourceDataBlob);
                                })
                        }
                    } else {
                        fetchMode = 'blob';
                        fetchCallback = processedBlobCallback;
                    }

                    _publicationFetcher.relativeToPackageFetchFileContents(resourceUriRelativeToBase,
                        fetchMode,
                        fetchCallback, fetchErrorCallback);
                }
            }

            function preprocessCssStyleSheetData(styleSheetResourceData, styleSheetUriRelativeToPackageDocument,
                                                 callback) {
                var cssUrlRegexp = /[Uu][Rr][Ll]\(\s*([']([^']+)[']|["]([^"]+)["]|([^)]+))\s*\)/g;
                var nonUrlCssImportRegexp = /@[Ii][Mm][Pp][Oo][Rr][Tt]\s*('([^']+)'|"([^"]+)")/g;
                var stylesheetCssResourceUrlsMap = {};
                var cssResourceDownloadDeferreds = [];
                // Go through the stylesheet text using all regexps and process according to those regexp matches, if any:
                [nonUrlCssImportRegexp, cssUrlRegexp].forEach(function (processingRegexp) {
                    // extract all URL references in the CSS sheet,
                    var cssUrlMatch = processingRegexp.exec(styleSheetResourceData);
                    while (cssUrlMatch != null) {
                        // then fetch and replace them with corresponding object URLs:
                        var isStyleSheetResource = false;
                        // Special handling of @import-ed stylesheet files - recursive preprocessing:
                        // TODO: will not properly handle @import url(...):
                        if (processingRegexp == nonUrlCssImportRegexp) {
                            // This resource URL points to an @import-ed CSS stylesheet file. Need to preprocess its text
                            // after fetching but before making an object URL of it:
                            isStyleSheetResource = true;
                        }
                        fetchResourceForCssUrlMatch(cssUrlMatch, cssResourceDownloadDeferreds,
                            styleSheetUriRelativeToPackageDocument, stylesheetCssResourceUrlsMap, isStyleSheetResource);
                        cssUrlMatch = processingRegexp.exec(styleSheetResourceData);
                    }

                });

                if (cssResourceDownloadDeferreds.length > 0) {
                    $.when.apply($, cssResourceDownloadDeferreds).done(function () {
                        for (var origMatchedUrlString in stylesheetCssResourceUrlsMap) {
                            var processedResourceDescriptor = stylesheetCssResourceUrlsMap[origMatchedUrlString];


                            var processedUrlString;
                            if (processedResourceDescriptor.isStyleSheetResource) {
                                processedUrlString = '@import "' + processedResourceDescriptor.resourceObjectURL + '"';
                            } else {
                                processedUrlString = "url('" + processedResourceDescriptor.resourceObjectURL + "')";
                            }
                            var origMatchedUrlStringEscaped = origMatchedUrlString.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
                                "\\$&");
                            var origMatchedUrlStringRegExp = new RegExp(origMatchedUrlStringEscaped, 'g');
                            //noinspection JSCheckFunctionSignatures
                            styleSheetResourceData =
                                styleSheetResourceData.replace(origMatchedUrlStringRegExp, processedUrlString, 'g');

                        }
                        callback(styleSheetResourceData);
                    });
                } else {
                    callback(styleSheetResourceData);
                }
            }


            function resolveResourceElements(elemName, refAttr, fetchMode, resolutionDeferreds, onerror,
                                             resourceDataPreprocessing) {

                var resolvedElems = $(elemName + '[' + refAttr.replace(':', '\\:') + ']', _contentDocumentDom);

                resolvedElems.each(function (index, resolvedElem) {
                    var refAttrOrigVal = $(resolvedElem).attr(refAttr);

                    fetchResourceForElement(resolvedElem, refAttrOrigVal, refAttr, fetchMode, resolutionDeferreds,
                        onerror, resourceDataPreprocessing);
                });
            }

            function resolveDocumentImages(resolutionDeferreds, onerror) {
                resolveResourceElements('img', 'src', 'blob', resolutionDeferreds, onerror);
                resolveResourceElements('image', 'xlink:href', 'blob', resolutionDeferreds, onerror);
            }

            function resolveDocumentAudios(resolutionDeferreds, onerror) {
                resolveResourceElements('audio', 'src', 'blob', resolutionDeferreds, onerror);
            }

            function resolveDocumentVideos(resolutionDeferreds, onerror) {
                resolveResourceElements('video', 'src', 'blob', resolutionDeferreds, onerror);
                resolveResourceElements('video', 'poster', 'blob', resolutionDeferreds, onerror);
            }

            function resolveDocumentScripts(resolutionDeferreds, onerror) {
                resolveResourceElements('script', 'src', 'blob', resolutionDeferreds, onerror);
            }

            function resolveDocumentIframes(resolutionDeferreds, onerror) {

                resolveResourceElements('iframe', 'src', 'blob', resolutionDeferreds, onerror,
                function(data, uri, callback) {

                    callback(data);
                });

                // See https://github.com/readium/readium-js/issues/105
                // for an experiment with nested Blob URI iframes
            }

            function resolveDocumentLinkStylesheets(resolutionDeferreds, onerror) {
                resolveResourceElements('link', 'href', 'text', resolutionDeferreds, onerror,
                    preprocessCssStyleSheetData);
            }

            function resolveDocumentEmbeddedStylesheets(resolutionDeferreds, onerror) {
                var resolvedElems = $('style', _contentDocumentDom);
                resolvedElems.each(function (index, resolvedElem) {
                    var resolutionDeferred = $.Deferred();
                    resolutionDeferreds.push(resolutionDeferred);
                    var styleSheetData = $(resolvedElem).text();
                    preprocessCssStyleSheetData(styleSheetData, _contentDocumentPathRelativeToPackage,
                        function (resolvedStylesheetData) {
                            $(resolvedElem).text(resolvedStylesheetData);
                            resolutionDeferred.resolve();
                        });
                });
            }

        };

        return ContentDocumentFetcher;

    }
);

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('readium_js/epub-fetch/resource_cache',['underscore'], function (_) {

        var ResourceCache = function(sourceWindow, configuredCacheSizeEvictThreshold) {

            var self = this;
            var _resourcesHash = {};
            var _orderingByLastUseTimestamp = [];
            var _cacheSize = 0;
            var CACHE_SIZE_EVICT_THRESHOLD_DEFAULT = 100000000;
            var cacheSizeEvictThreshold = determineCacheSizeThreshold();

            function getTimestamp() {
                return new Date().getTime();
            }

            function getBrowserHeapLimitInBytes() {
                if (window.performance && window.performance.memory && window.performance.memory.jsHeapSizeLimit) {
                    return window.performance.memory.jsHeapSizeLimit;
                } else {
                    return null;
                }
            }

            function determineCacheSizeThreshold() {
                if (configuredCacheSizeEvictThreshold) {
                    return configuredCacheSizeEvictThreshold;
                }
                var browserHeapLimitInBytes = getBrowserHeapLimitInBytes();
                if (browserHeapLimitInBytes && browserHeapLimitInBytes / 10 > CACHE_SIZE_EVICT_THRESHOLD_DEFAULT) {
                    return browserHeapLimitInBytes / 10;
                } else {
                    return  CACHE_SIZE_EVICT_THRESHOLD_DEFAULT;
                }
            }

            this.getResourceURL = function(resourceAbsoluteHref) {
                var resourceObjectUrl = null;
                var resourceData = _resourcesHash[resourceAbsoluteHref];
                if (resourceData) {
                    resourceObjectUrl = resourceData.url;
                    resourceData.lastUseTimestamp = getTimestamp();
                    updateOrderedIndex(resourceData);
                }
                return resourceObjectUrl;
            };

            function removeCacheEntryFromOrderedIndex(cacheEntry) {
                // Remove the previous entry from the ordered index, if present:
                if (typeof cacheEntry.orderingByLastUseTimestampIdx !== 'undefined') {
                    var orderingByLastUseTimestampIdx = cacheEntry.orderingByLastUseTimestampIdx;
                    _orderingByLastUseTimestamp.splice(orderingByLastUseTimestampIdx, 1);
                    // Decrement index values for all downshifted entries:
                    for (var i = orderingByLastUseTimestampIdx; i < _orderingByLastUseTimestamp.length; i++) {
                        var downshiftedEntry = _orderingByLastUseTimestamp[i];
                        // Assertion
                        if ((downshiftedEntry.orderingByLastUseTimestampIdx - 1) != i) {
                            console.error('algorithm incorrect: downshiftedEntry.orderingByLastUseTimestampIdx: ' +
                                downshiftedEntry.orderingByLastUseTimestampIdx + ', i: ' + i + " -- " + cacheEntry.absoluteHref);
                        }
                        downshiftedEntry.orderingByLastUseTimestampIdx = i;
                    }
                }
            }

            function updateOrderedIndex(cacheEntry) {
                removeCacheEntryFromOrderedIndex(cacheEntry);
                var insertIdx = _.sortedIndex(_orderingByLastUseTimestamp, cacheEntry, 'lastUseTimestamp');
                _orderingByLastUseTimestamp.splice(insertIdx, 0, cacheEntry);
                cacheEntry.orderingByLastUseTimestampIdx = insertIdx;
            }

            this.putResource = function(resourceAbsoluteHref, resourceObjectUrl, resourceDataBlob) {
                this.trimCache();
                var currentTimestamp = getTimestamp();
                var cacheEntry = {
                    url: resourceObjectUrl,
                    absoluteHref: resourceAbsoluteHref,
                    blob: resourceDataBlob,
                    blobSize: resourceDataBlob.size,
                    creationTimestamp: currentTimestamp,
                    lastUseTimestamp: currentTimestamp,
                    pinned: true
                };
                _resourcesHash[resourceAbsoluteHref] = cacheEntry;
                updateOrderedIndex(cacheEntry);
                _cacheSize += resourceDataBlob.size;
            };

            this.evictResource = function(resourceAbsoluteHref) {
                var resourceData = _resourcesHash[resourceAbsoluteHref];
                if (resourceData) {
                    sourceWindow.URL.revokeObjectURL(resourceData.url);
                    _cacheSize -= resourceData.blobSize;
                    removeCacheEntryFromOrderedIndex(resourceData);
                    delete _resourcesHash[resourceAbsoluteHref];
                }
            };

            this.flushCache = function() {
                // TODO: more efficient, but less code reuse: iterate over _sortedIndex first,
                // then assert an empty cache and perform backup cleanup if assertion failed
                for (var resourceAbsoluteHref in _resourcesHash) {
                    this.evictResource(resourceAbsoluteHref);
                }
                // Assertion
                if (_cacheSize != 0) {
                    console.error('cacheSize accounting error! cacheSize: ' + _cacheSize + ', _resourcesHash:');
                    console.error(_resourcesHash);
                }
                _orderingByLastUseTimestamp = [];
                //console.log('Cache contents:');
                //console.log(_resourcesHash);
                //console.log('_orderingByLastUseTimestamp:');
                //console.log(_orderingByLastUseTimestamp);
                //console.log('Cache size:' + _cacheSize);
            };

            this.unPinResources = function() {
                for (var resourceAbsoluteHref in _resourcesHash) {
                    var resourceData = _resourcesHash[resourceAbsoluteHref];
                    resourceData.pinned = false;
                }
            };

            function orderingByLastUseTimestampToString() {
                return _orderingByLastUseTimestamp.reduce(function(previousValue, currentValue) {
                    return previousValue + (previousValue.length > 1 ? ', ' : '') + '[' +
                        currentValue.absoluteHref + ', pinned: ' + currentValue.pinned +
                        ', orderingByLastUseTimestampIdx: ' + currentValue.orderingByLastUseTimestampIdx + ']'
                }, '');
            }

            this.trimCache = function() {
                if (_cacheSize < cacheSizeEvictThreshold) {
                    return;
                }
                console.log('Trimming cache. Current cache size: ' + _cacheSize);

                // Loop through ordered index (by last use timestamp) starting from the least recently used entries.
                // evict unpinned resources until either:
                // 1) cache size drops below CACHE_SIZE_EVICT_THRESHOLD
                // 2) there are no more unpinned resources to evict
                for (var i = 0; i < _orderingByLastUseTimestamp.length; i++) {
                    if (_cacheSize < cacheSizeEvictThreshold) {
                        break;
                    }
                    var cacheEntry = _orderingByLastUseTimestamp[i];
                    if (!cacheEntry.pinned) {
                        var resourceAbsoluteHref = cacheEntry.absoluteHref;
                        //console.log('Preparing to evict ' + resourceAbsoluteHref);
                        //console.log('_orderingByLastUseTimestamp:');
                        //console.log(orderingByLastUseTimestampToString());
                        this.evictResource(resourceAbsoluteHref);
                        //console.log('Evicted ' + resourceAbsoluteHref);
                        //console.log('Current cache size: ' + _cacheSize);
                        //console.log('_orderingByLastUseTimestamp:');
                        //console.log(orderingByLastUseTimestampToString());
                        //console.log('i: ' + i);

                        // The consequent array elements have downshifted by one position.
                        // The i variable now points to a different element - the evicted element's successor
                        // (if not beyond array's end).
                        // Make the i variable remain in place - compensate for its upcoming incrementation:
                        i--;
                    }
                }
                console.log('Cache size after trimming: ' + _cacheSize);
            };
        };

        return ResourceCache;
    });

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-fetch/encryption_handler',['cryptoJs/sha1'], function (SHA1) {

    var EncryptionHandler = function (encryptionData) {
        var self = this;

        var ENCRYPTION_METHODS = {
            'http://www.idpf.org/2008/embedding': embeddedFontDeobfuscateIdpf,
            'http://ns.adobe.com/pdf/enc#RC': embeddedFontDeobfuscateAdobe
        };

        // INTERNAL FUNCTIONS

        function blob2BinArray(blob, callback) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                var arrayBuffer = this.result;
                callback(new Uint8Array(arrayBuffer));
            };
            fileReader.readAsArrayBuffer(blob);
        }

        function xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, xorKey, callback) {
            var obfuscatedPrefixBlob = obfuscatedResourceBlob.slice(0, prefixLength);
            blob2BinArray(obfuscatedPrefixBlob, function (bytes) {
                var masklen = xorKey.length;
                for (var i = 0; i < prefixLength; i++) {
                    bytes[i] = bytes[i] ^ (xorKey[i % masklen]);
                }
                var deobfuscatedPrefixBlob = new Blob([bytes], { type: obfuscatedResourceBlob.type });
                var remainderBlob = obfuscatedResourceBlob.slice(prefixLength);
                var deobfuscatedBlob = new Blob([deobfuscatedPrefixBlob, remainderBlob],
                    { type: obfuscatedResourceBlob.type });

                callback(deobfuscatedBlob);
            });
        }

        function embeddedFontDeobfuscateIdpf(obfuscatedResourceBlob, callback) {

            var prefixLength = 1040;
            // Shamelessly copied from
            // https://github.com/readium/readium-chrome-extension/blob/26d4b0cafd254cfa93bf7f6225887b83052642e0/scripts/models/path_resolver.js#L102 :
            xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, encryptionData.uidHash, callback);
        }

        function urnUuidToByteArray(id) {
            var uuidRegexp = /(urn:uuid:)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/i;
            var matchResults = uuidRegexp.exec(id);
            var rawUuid = matchResults[2] + matchResults[3] + matchResults[4] + matchResults[5] + matchResults[6];
            if (!rawUuid || rawUuid.length != 32) {
                console.error('Bad UUID format for ID :' + id);
            }
            var byteArray = [];
            for (var i = 0; i < 16; i++) {
                var byteHex = rawUuid.substr(i * 2, 2);
                var byteNumber = parseInt(byteHex, 16);
                byteArray.push(byteNumber);
            }
            return byteArray;
        }

        function embeddedFontDeobfuscateAdobe(obfuscatedResourceBlob, callback) {

            // extract the UUID and convert to big-endian binary form (16 bytes):
            var uidWordArray = urnUuidToByteArray(encryptionData.uid);
            var prefixLength = 1024;
            xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, uidWordArray, callback)
        }


        // PUBLIC API

        this.isEncryptionSpecified = function () {
            return encryptionData && encryptionData.encryptions;
        };


        this.getEncryptionMethodForRelativePath = function (pathRelativeToRoot) {
            if (self.isEncryptionSpecified()) {
                return encryptionData.encryptions[pathRelativeToRoot];
            } else {
                return undefined;
            }
        };

        this.getDecryptionFunctionForRelativePath = function (pathRelativeToRoot) {
            var encryptionMethod = self.getEncryptionMethodForRelativePath(pathRelativeToRoot);
            if (encryptionMethod && ENCRYPTION_METHODS[encryptionMethod]) {
                return ENCRYPTION_METHODS[encryptionMethod];
            } else {
                return undefined;
            }
        };

    };

    EncryptionHandler.CreateEncryptionData =  function(id, encryptionDom) {

        var encryptionData = {
            uid: id,
            uidHash: SHA1(unescape(encodeURIComponent(id.trim())), { asBytes: true }),
            encryptions: undefined
        };

        var encryptedData = $('EncryptedData', encryptionDom);
        encryptedData.each(function (index, encryptedData) {
            var encryptionAlgorithm = $('EncryptionMethod', encryptedData).first().attr('Algorithm');

            // For some reason, jQuery selector "" against XML DOM sometimes doesn't match properly
            var cipherReference = $('CipherReference', encryptedData);
            cipherReference.each(function (index, CipherReference) {
                var cipherReferenceURI = $(CipherReference).attr('URI');
                console.log('Encryption/obfuscation algorithm ' + encryptionAlgorithm + ' specified for ' +
                    cipherReferenceURI);

                if(!encryptionData.encryptions) {
                    encryptionData.encryptions = {};
                }

                encryptionData.encryptions[cipherReferenceURI] = encryptionAlgorithm;
            });
        });

        return encryptionData;
    };

    return EncryptionHandler;
});
//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('readium_js/epub-fetch/publication_fetcher',['jquery', 'URIjs', './markup_parser', './plain_resource_fetcher', './zip_resource_fetcher',
    './content_document_fetcher', './resource_cache', './encryption_handler', './discover_content_type'],
    function ($, URI, MarkupParser, PlainResourceFetcher, ZipResourceFetcher, ContentDocumentFetcher,
              ResourceCache, EncryptionHandler, ContentTypeDiscovery) {

    var PublicationFetcher = function(bookRoot, jsLibRoot, sourceWindow, cacheSizeEvictThreshold, contentDocumentTextPreprocessor) {

        var self = this;

        self.contentTypePackageReadStrategyMap = {
            'application/oebps-package+xml': 'exploded',
            'application/epub+zip': 'zipped',
            'application/zip': 'zipped'
        };

        var _shouldConstructDomProgrammatically;
        var _resourceFetcher;
        var _encryptionHandler;
        var _packageFullPath;
        var _packageDom;
        var _packageDomInitializationDeferred;
        var _publicationResourcesCache = new ResourceCache(sourceWindow, cacheSizeEvictThreshold);

        var _contentDocumentTextPreprocessor = contentDocumentTextPreprocessor;

        this.markupParser = new MarkupParser();

        this.initialize =  function(callback) {

            var isEpubExploded = isExploded();

            // Non exploded EPUBs (i.e. zipped .epub documents) should be fetched in a programmatical manner:
            _shouldConstructDomProgrammatically = !isEpubExploded;
            createResourceFetcher(isEpubExploded, callback);
        };



        // INTERNAL FUNCTIONS

        function _handleError(err) {
            if (err) {
                if (err.message) {
                    console.error(err.message);
                }
                if (err.stack) {
                    console.error(err.stack);
                }
            }
            console.error(err);
        }

        function isExploded() {

            var ext = ".epub";
            return bookRoot.indexOf(ext, bookRoot.length - ext.length) === -1;
        }

        function createResourceFetcher(isExploded, callback) {
            if (isExploded) {
                console.log('using new PlainResourceFetcher');
                _resourceFetcher = new PlainResourceFetcher(self, bookRoot);
                _resourceFetcher.initialize(function () {
                    callback(_resourceFetcher);
                });
                return;
            } else {
                console.log('using new ZipResourceFetcher');
                _resourceFetcher = new ZipResourceFetcher(self, bookRoot, jsLibRoot);
                callback(_resourceFetcher);
            }
        }

        // PUBLIC API

        /**
         * Determine whether the documents fetched using this fetcher require special programmatic handling.
         * (resolving of internal resource references).
         * @returns {*} true if documents fetched using this fetcher require special programmatic handling
         * (resolving of internal resource references). Typically needed for zipped EPUBs or exploded EPUBs that contain
         * encrypted resources specified in META-INF/encryption.xml.
         *
         * false if documents can be fed directly into a window or iframe by src URL without using special fetching logic.
         */
        this.shouldConstructDomProgrammatically = function (){
            return _shouldConstructDomProgrammatically;
        };

        /**
         * Determine whether the media assets (audio, video, images) within content documents require special
         * programmatic handling.
         * @returns {*} true if content documents fetched using this fetcher require programmatic fetching
         * of media assets. Typically needed for zipped EPUBs.
         *
         * false if paths to media assets are accessible directly for the browser through their paths relative to
         * the base URI of their content document.
         */
        this.shouldFetchMediaAssetsProgrammatically = function() {
            return _shouldConstructDomProgrammatically && !isExploded();
        };

        this.getBookRoot = function() {
            return bookRoot;
        };

        this.getJsLibRoot = function() {
            return jsLibRoot;
        };

        this.flushCache = function() {
            _publicationResourcesCache.flushCache();
        };

        this.getPackageUrl = function() {
            return _resourceFetcher.getPackageUrl();
        };

        this.fetchContentDocument = function (attachedData, loadedDocumentUri, contentDocumentResolvedCallback, errorCallback) {

            // Resources loaded for previously fetched document no longer need to be pinned:
            // DANIEL: what about 2-page synthetic spread of fixed layout documents / spine items?
            // See https://github.com/readium/readium-js/issues/104
            _publicationResourcesCache.unPinResources();


            var contentDocumentFetcher = new ContentDocumentFetcher(self, attachedData.spineItem, loadedDocumentUri, _publicationResourcesCache, _contentDocumentTextPreprocessor);
            contentDocumentFetcher.fetchContentDocumentAndResolveDom(contentDocumentResolvedCallback, function (err) {
                _handleError(err);
                errorCallback(err);
            });
        };

        this.getFileContentsFromPackage = function(filePathRelativeToPackageRoot, callback, onerror) {

            _resourceFetcher.fetchFileContentsText(filePathRelativeToPackageRoot, function (fileContents) {
                callback(fileContents);
            }, onerror);
        };



        this.getXmlFileDom = function (xmlFilePathRelativeToPackageRoot, callback, onerror) {
            self.getFileContentsFromPackage(xmlFilePathRelativeToPackageRoot, function (xmlFileContents) {
                var fileDom = self.markupParser.parseXml(xmlFileContents);
                callback(fileDom);
            }, onerror);
        };

        this.getPackageFullPath = function(callback, onerror) {
            self.getXmlFileDom('META-INF/container.xml', function (containerXmlDom) {
                var packageFullPath = self.getRootFile(containerXmlDom);
                callback(packageFullPath);
            }, onerror);
        };

        this.getRootFile = function(containerXmlDom) {
            var rootFile = $('rootfile', containerXmlDom);
            var packageFullPath = rootFile.attr('full-path');
            return packageFullPath;
        };

        this.getPackageDom = function (callback, onerror) {
            if (_packageDom) {
                callback(_packageDom);
            } else {
                // TODO: use jQuery's Deferred
                // Register all callbacks interested in initialized packageDom, launch its instantiation only once
                // and broadcast to all callbacks registered during the initialization once it's done:
                if (_packageDomInitializationDeferred) {
                    _packageDomInitializationDeferred.done(callback);
                } else {
                    _packageDomInitializationDeferred = $.Deferred();
                    _packageDomInitializationDeferred.done(callback);
                    self.getPackageFullPath(function (packageFullPath) {
                        _packageFullPath = packageFullPath;
                        self.getXmlFileDom(packageFullPath, function (packageDom) {
                            _packageDom = packageDom;
                            _packageDomInitializationDeferred.resolve(packageDom);
                            _packageDomInitializationDeferred = undefined;
                        })
                    }, onerror);
                }
            }
        };

        // Note that if the relativeToPackagePath parameter is in fact absolute
        // (starting with "/", already relative to the EPUB archive's base folder)
        // then the returned value is relativeToPackagePath.
        this.convertPathRelativeToPackageToRelativeToBase = function (relativeToPackagePath) {

            return new URI(relativeToPackagePath).absoluteTo(_packageFullPath).toString();
        };

        // Note that the relativeToPackagePath parameter can in fact be absolute
        // (starting with "/", already relative to the EPUB archive's base folder)
        // For example: /META-INF/
        this.relativeToPackageFetchFileContents = function(relativeToPackagePath, fetchMode, fetchCallback, onerror) {

            if (! onerror) {
                onerror = _handleError;
            }

            // ZIP resource fetcher does not support absolute URLs outside of the EPUB archive
            // (e.g. MathJax.js and annotations.css)
            if (//!isExploded()
                _shouldConstructDomProgrammatically // includes isExploded() and obfuscated fonts
                &&
                new URI(relativeToPackagePath).scheme() !== '') {

                  if (fetchMode === 'blob') {

                      var xhr = new XMLHttpRequest();
                      xhr.open('GET', relativeToPackagePath, true);
                      xhr.responseType = 'arraybuffer';
                      xhr.onerror = onerror;

                      xhr.onload = function (loadEvent) {
                        var blob = new Blob([xhr.response], {
                            type: ContentTypeDiscovery.identifyContentTypeFromFileName(relativeToPackagePath)
                        });
                        fetchCallback(blob);
                      };

                      xhr.send();

                  } else if (fetchMode === 'data64uri') {
                      console.error("data64uri??");
                  } else {

                      $.ajax({
                          // encoding: "UTF-8",
                          // mimeType: "text/plain; charset=UTF-8",
                          // beforeSend: function( xhr ) {
                          //     xhr.overrideMimeType("text/plain; charset=UTF-8");
                          // },
                          isLocal: false,
                          url: relativeToPackagePath,
                          dataType: 'text', //https://api.jquery.com/jQuery.ajax/
                          async: true,
                          success: function (result) {
                              fetchCallback(result);
                          },
                          error: function (xhr, status, errorThrown) {
                              console.error('Error when AJAX fetching ' + relativeToPackagePath);
                              console.error(status);
                              console.error(errorThrown);

                              // // isLocal = false with custom URI scheme / protocol results in false fail on Firefox (Chrome okay)
                              // if (status === "error" && (!errorThrown || !errorThrown.length) && xhr.responseText && xhr.responseText.length)
                              // {
                              //     console.error(xhr);
                              //     if (typeof xhr.getResponseHeader !== "undefined") console.error(xhr.getResponseHeader("Content-Type"));
                              //     if (typeof xhr.getAllResponseHeaders !== "undefined") console.error(xhr.getAllResponseHeaders());
                              //     if (typeof xhr.responseText !== "undefined") console.error(xhr.responseText);
                              //
                              //     // success
                              //     fetchCallback(xhr.responseText);
                              //     return;
                              // }

                              onerror(errorThrown);
                          }
                    });
                }

                return;
            }

            var pathRelativeToEpubRoot = decodeURIComponent(self.convertPathRelativeToPackageToRelativeToBase(relativeToPackagePath));

            // In case we received an absolute path, convert it to relative form or the fetch will fail:
            if (pathRelativeToEpubRoot.charAt(0) === '/') {
                pathRelativeToEpubRoot = pathRelativeToEpubRoot.substr(1);
            }

            var fetchFunction = _resourceFetcher.fetchFileContentsText;
            if (fetchMode === 'blob') {
                fetchFunction = _resourceFetcher.fetchFileContentsBlob;
            } else if (fetchMode === 'data64uri') {
                console.error("data64uri??");
                fetchFunction = _resourceFetcher.fetchFileContentsData64Uri;
            }
            fetchFunction.call(_resourceFetcher, pathRelativeToEpubRoot, fetchCallback, onerror);
        };



        this.getRelativeXmlFileDom = function (filePath, callback, errorCallback) {
            self.getXmlFileDom(self.convertPathRelativeToPackageToRelativeToBase(filePath), callback, errorCallback);
        };

        function readEncriptionData(callback) {
            self.getXmlFileDom('META-INF/encryption.xml', function (encryptionDom, error) {

                if(error) {
                    console.log(error);
                    console.log("Document doesn't make use of encryption.");
                    _encryptionHandler = new EncryptionHandler(undefined);
                    callback();
                }
                else {

                    var encryptions = [];


                    var encryptedData = $('EncryptedData', encryptionDom);
                    encryptedData.each(function (index, encryptedData) {
                        var encryptionAlgorithm = $('EncryptionMethod', encryptedData).first().attr('Algorithm');

                        encryptions.push({algorithm: encryptionAlgorithm});

                        // For some reason, jQuery selector "" against XML DOM sometimes doesn't match properly
                        var cipherReference = $('CipherReference', encryptedData);
                        cipherReference.each(function (index, CipherReference) {
                            var cipherReferenceURI = $(CipherReference).attr('URI');
                            console.log('Encryption/obfuscation algorithm ' + encryptionAlgorithm + ' specified for ' +
                                cipherReferenceURI);
                            encryptions[cipherReferenceURI] = encryptionAlgorithm;
                        });
                    });
                }

            });
        }

        // Currently needed for deobfuscating fonts
        this.setPackageMetadata = function(packageMetadata, settingFinishedCallback) {

            self.getXmlFileDom('META-INF/encryption.xml', function (encryptionDom) {

                var encryptionData = EncryptionHandler.CreateEncryptionData(packageMetadata.id, encryptionDom);

                _encryptionHandler = new EncryptionHandler(encryptionData);

                if (_encryptionHandler.isEncryptionSpecified()) {
                    // EPUBs that use encryption for any resources should be fetched in a programmatical manner:
                    _shouldConstructDomProgrammatically = true;
                }

                settingFinishedCallback();


            }, function(error){

                console.log("Document doesn't make use of encryption.");
                _encryptionHandler = new EncryptionHandler(undefined);

                settingFinishedCallback();
            });
        };

        this.getDecryptionFunctionForRelativePath = function(pathRelativeToRoot) {
            return _encryptionHandler.getDecryptionFunctionForRelativePath(pathRelativeToRoot);
        }
    };

    return PublicationFetcher

});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-model/package_document',['jquery', 'underscore', 'URIjs'],
    function ($, _, URI) {

    // Description: This model provides an interface for navigating an EPUB's package document
    var PackageDocument = function(packageDocumentURL, resourceFetcher, metadata, spine, manifest) {

        var _page_prog_dir;

        this.manifest = manifest;

        this.getSharedJsPackageData = function () {

            var packageDocRoot = packageDocumentURL.substr(0, packageDocumentURL.lastIndexOf("/"));
            return {
                rootUrl : packageDocRoot,
                rendition_viewport : metadata.rendition_viewport,
                rendition_layout : metadata.rendition_layout,
                rendition_orientation : metadata.rendition_orientation,
                rendition_flow : metadata.rendition_flow,
                rendition_spread : metadata.rendition_spread,
                media_overlay : metadata.media_overlay,
                spine : {
                    direction : this.getPageProgressionDirection(),
                    items : spine
                }
            };
        };

        /**
         * Get spine item data in readium-shared-js accepted format.
         * @param spineIndex the index of the item within the spine
         * @returns Spine item data in readium-shared-js accepted format.
         */
        this.getSpineItem = function(spineIndex) {
            var spineItem = spine[spineIndex];
            return spineItem;
        };

        this.setPageProgressionDirection = function(page_prog_dir) {
            _page_prog_dir = page_prog_dir;
        };


        this.getPageProgressionDirection = function() {
            if (_page_prog_dir === "rtl") {
                return "rtl";
            }
            else if (_page_prog_dir === "default") {
                return "default";
            }
            else {
                return "ltr";
            }
        };

        this.spineLength = function() {
            return spine.length;
        };

        this.getMetadata = function() {
            return metadata;
        };

        this.getToc = function() {
            var item = getTocItem();
            if (item) {
                return item.href;
            }
            return null;
        };

        this.getTocText = function(callback) {
            var toc = this.getToc();

            resourceFetcher.relativeToPackageFetchFileContents(toc, 'text', function (tocDocumentText) {
                callback(tocDocumentText)
            }, function (err) {
                console.error('ERROR fetching TOC from [' + toc + ']:');
                console.error(err);
                callback(undefined);
            });
        };

        this.getTocDom = function(callback) {

            this.getTocText(function (tocText) {
                if (typeof tocText === 'string') {
                    var tocDom = (new DOMParser()).parseFromString(tocText, "text/xml");
                    callback(tocDom);
                } else {
                    callback(undefined);
                }
            });
        };


        // Used in EpubReader (readium-js-viewer)
        // https://github.com/readium/readium-js-viewer/blob/develop/lib/EpubReader.js#L59
        this.generateTocListDOM = function(callback) {
            var that = this;
            this.getTocDom(function (tocDom) {
                if (tocDom) {
                    if (tocIsNcx()) {
                        var $ncxOrderedList;
                        $ncxOrderedList = getNcxOrderedList($("navMap", tocDom));
                        callback($ncxOrderedList[0]);
                    } else {
                        var packageDocumentAbsoluteURL = new URI(packageDocumentURL).absoluteTo(document.URL);
                        var tocDocumentAbsoluteURL = new URI(that.getToc()).absoluteTo(packageDocumentAbsoluteURL);
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
        };

        function tocIsNcx() {

            var tocItem = getTocItem();
            var contentDocURI = tocItem.href;
            var fileExtension = contentDocURI.substr(contentDocURI.lastIndexOf('.') + 1);

            return fileExtension.trim().toLowerCase() === "ncx";
        }

        // ----------------------- PRIVATE HELPERS -------------------------------- //

        function getNcxOrderedList($navMapDOM) {

            var $ol = $("<ol></ol>");
            $.each($navMapDOM.children("navPoint"), function (index, navPoint) {
                addNavPointElements($(navPoint), $ol);
            });
            return $ol;
        }

        // Description: Constructs an html representation of NCX navPoints, based on an object of navPoint information
        // Rationale: This is a recursive method, as NCX navPoint elements can nest 0 or more of themselves as children
        function addNavPointElements($navPointDOM, $ol) {

            // Add the current navPoint element to the TOC html
            var navText = $navPointDOM.children("navLabel").text().trim();
            var navHref = $navPointDOM.children("content").attr("src");
            var $navPointLi = $('<li class="nav-elem"></li>').append(
                $('<a></a>', { href: navHref, text: navText })
            );

            // Append nav point info
            $ol.append($navPointLi);

            // Append ordered list of nav points
            if ($navPointDOM.children("navPoint").length > 0 ) {

                var $newLi = $("<li></li>");
                var $newOl = $("<ol></ol>");
                $.each($navPointDOM.children("navPoint"), function (navIndex, navPoint) {
                    $newOl.append(addNavPointElements($(navPoint), $newOl));
                });

                $newLi.append($newOl);
                $ol.append($newLi);
            }
        }

        function getTocItem(){

            var item = manifest.getNavItem();
            if (item) {
                return item;
            }

            var spine_id = metadata.ncx;
            if (spine_id && spine_id.length > 0) {
                return manifest.getManifestItemByIdref(spine_id);
            }

            return null;
        }

    };

    return PackageDocument;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-model/smil_document_parser',['jquery', 'underscore'], function ($, _) {

    // `SmilDocumentParser` is used to parse the xml of an epub package
    // document and build a javascript object. The constructor accepts an
    // instance of `URI` that is used to resolve paths during the process
    var SmilDocumentParser = function(packageDocument, publicationFetcher) {

        // Parse a media overlay manifest item XML
        this.parse = function(spineItem, manifestItemSMIL, smilJson, deferred, callback, errorCallback) {
            var that = this;
            publicationFetcher.getRelativeXmlFileDom(manifestItemSMIL.href, function(xmlDom) {

                var smil = $("smil", xmlDom)[0];
                smilJson.smilVersion = smil.getAttribute('version');

                //var body = $("body", xmlDom)[0];
                smilJson.children = that.getChildren(smil);
                smilJson.href = manifestItemSMIL.href;
                smilJson.id = manifestItemSMIL.id;
                smilJson.spineItemId = spineItem.idref;

                var mediaItem = packageDocument.getMetadata().getMediaItemByRefinesId(manifestItemSMIL.id);
                if (mediaItem) {
                    smilJson.duration = mediaItem.duration;
                }

                callback(deferred, smilJson);
            }, function(fetchError) {
                errorCallback(deferred, fetchError);
            });
        };

        var safeCopyProperty = function(property, fromNode, toItem, isRequired, defaultValue) {
            var propParse = property.split(':');
            var destProperty = propParse[propParse.length - 1];

            if (destProperty === "type") {
                destProperty = "epubtype";
            }
            
            if (fromNode.getAttribute(property) != undefined) {
                toItem[destProperty] = fromNode.getAttribute(property);
            } else if (isRequired) {
                if (defaultValue !== undefined) {
                    toItem[destProperty] = defaultValue;
                } else {
                    console.log("Required property " + property + " not found in smil node " + fromNode.nodeName);
                }
            }
        };

        this.getChildren = function(element) {
            var that = this;
            var children = [];

            $.each(element.childNodes, function(elementIndex, currElement) {

                if (currElement.nodeType === 1) { // ELEMENT
                    var item = that.createItemFromElement(currElement);
                    if (item) {
                        children.push(item);
                    }
                }
            });

            return children;
        }

        this.createItemFromElement = function(element) {
            var that = this;

            var item = {};
            item.nodeType = element.nodeName;
            
            var isBody = false;
            if (item.nodeType === "body")
            {
                isBody = true;
                item.nodeType = "seq";
            }

            if (item.nodeType === "seq") {

                safeCopyProperty("epub:textref", element, item, !isBody);
                safeCopyProperty("id", element, item);
                safeCopyProperty("epub:type", element, item);

                item.children = that.getChildren(element);

            } else if (item.nodeType === "par") {

                safeCopyProperty("id", element, item);
                safeCopyProperty("epub:type", element, item);

                item.children = that.getChildren(element);

            } else if (item.nodeType === "text") {

                safeCopyProperty("src", element, item, true);
                var srcParts = item.src.split('#');
                item.srcFile = srcParts[0];
                item.srcFragmentId = (srcParts.length === 2) ? srcParts[1] : "";
                safeCopyProperty("id", element, item);
                // safeCopyProperty("epub:textref", element, item);

            } else if (item.nodeType === "audio") {
                safeCopyProperty("src", element, item, true);
                safeCopyProperty("id", element, item);
                item.clipBegin = SmilDocumentParser.resolveClockValue(element.getAttribute("clipBegin"));
                item.clipEnd = SmilDocumentParser.resolveClockValue(element.getAttribute("clipEnd"));
            }
            else
            {
                return undefined;
            }

            return item;
        }

        function makeFakeSmilJson(spineItem) {
            return {
                id: "",
                href: "",
                spineItemId: spineItem.idref,
                children: [{
                    nodeType: 'seq',
                    textref: spineItem.href,
                    children: [{
                        nodeType: 'par',
                        children: [{
                            nodeType: 'text',
                            src: spineItem.href,
                            srcFile: spineItem.href,
                            srcFragmentId: ""
                        }]
                    }]
                }]
            };
        }

        this.fillSmilData = function(callback) {
            var that = this;

            if (packageDocument.spineLength() <= 0) {
                callback();
                return;
            }

            var allFakeSmil = true;
            var mo_map = [];
            var parsingDeferreds = [];

            for (var spineIdx = 0; spineIdx < packageDocument.spineLength(); spineIdx++) {
                var spineItem = packageDocument.getSpineItem(spineIdx);

                if (spineItem.media_overlay_id) {
                    var manifestItemSMIL = packageDocument.manifest.getManifestItemByIdref(spineItem.media_overlay_id);

                    if (!manifestItemSMIL) {
                        console.error("Cannot find SMIL manifest item for spine/manifest item?! " + spineItem.media_overlay_id);
                        continue;
                    }
                    //ASSERT manifestItemSMIL.media_type === "application/smil+xml"

                    var parsingDeferred = $.Deferred();
                    parsingDeferred.media_overlay_id = spineItem.media_overlay_id;
                    parsingDeferreds.push(parsingDeferred);
                    var smilJson = {};

                    // Push the holder object onto the map early so that order isn't disturbed by asynchronicity:
                    mo_map.push(smilJson);

                    // The local parsingDeferred variable will have its value replaced on next loop iteration.
                    // Must pass the parsingDeferred through async calls as an argument and it arrives back as myDeferred.
                    that.parse(spineItem, manifestItemSMIL, smilJson, parsingDeferred, function(myDeferred, smilJson) {
                        allFakeSmil = false;
                        myDeferred.resolve();
                    }, function(myDeferred, parseError) {
                        console.log('Error when parsing SMIL manifest item ' + manifestItemSMIL.href + ':');
                        console.log(parseError);
                        myDeferred.resolve();
                    });
                } else {
                    mo_map.push(makeFakeSmilJson(spineItem));
                }
            }

            $.when.apply($, parsingDeferreds).done(function() {
                packageDocument.getMetadata().setMoMap(mo_map);
                if (allFakeSmil) {
                    console.log("No Media Overlays");
                    packageDocument.getMetadata().setMoMap([]);
                }
                callback();
            });
        }
    };

    // parse the timestamp and return the value in seconds
    // supports this syntax:
    // http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
    SmilDocumentParser.resolveClockValue = function(value) {
        if (!value) return 0;

        var hours = 0;
        var mins = 0;
        var secs = 0;

        if (value.indexOf("min") != -1) {
            mins = parseFloat(value.substr(0, value.indexOf("min")));
        } else if (value.indexOf("ms") != -1) {
            var ms = parseFloat(value.substr(0, value.indexOf("ms")));
            secs = ms / 1000;
        } else if (value.indexOf("s") != -1) {
            secs = parseFloat(value.substr(0, value.indexOf("s")));
        } else if (value.indexOf("h") != -1) {
            hours = parseFloat(value.substr(0, value.indexOf("h")));
        } else {
            // parse as hh:mm:ss.fraction
            // this also works for seconds-only, e.g. 12.345
            var arr = value.split(":");
            secs = parseFloat(arr.pop());
            if (arr.length > 0) {
                mins = parseFloat(arr.pop());
                if (arr.length > 0) {
                    hours = parseFloat(arr.pop());
                }
            }
        }
        var total = hours * 3600 + mins * 60 + secs;
        return total;
    }
    
    return SmilDocumentParser;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-model/metadata',['underscore'],
    function (_) {

        var Metadata = function () {

            var that = this;

            var _mediaItemIndexByRefinesId = {};

            /**
             * Iterate over media items and apply callback (synchronously) on each one of them.
             * @param iteratorCallback the iterator callback function, will be called once for each media item,
             * and the item will be passed as the (one and only) argument.
             * @returns the Metadata object for chaining.
             */
            this.eachMediaItem = function(iteratorCallback) {
                if (that.mediaItems) {
                    _.each(that.mediaItems, iteratorCallback);
                }
                return this;
            };

            this.getMediaItemByRefinesId = function(id) {
                return _mediaItemIndexByRefinesId[id];
            };

            this.setMoMap = function(mediaOverlaysMap) {
                that.media_overlay.smil_models = mediaOverlaysMap;
            };

            // Initialize indexes
            this.eachMediaItem(function(item) {
                var id = item.refines;
                var hash = id.indexOf('#');
                if (hash >= 0) {
                    var start = hash+1;
                    var end = id.length-1;
                    id = id.substr(start, end);
                }
                id = id.trim();

                _mediaItemIndexByRefinesId[id] = item;
            });


        };
        return Metadata;
    });
//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js/epub-model/manifest',['underscore'],
    function (_) {

        var Manifest = function (manifestJson) {

            var _manifestIndexById = {};
            var _navItem;

            this.manifestLength = function() {
                return manifestJson.length;
            };

            this.getManifestItemByIdref = function (idref) {
                return _manifestIndexById[idref];
            };

            /**
             * Iterate over manifest items and apply callback (synchronously) on each one of them.
             * @param iteratorCallback the iterator callback function, will be called once for each manifest item,
             * and the item will be passed as the (one and only) argument.
             * @returns the Manifest object for chaining.
             */
            this.each = function(iteratorCallback) {
                _.each(manifestJson, iteratorCallback);
                return this;
            };

            this.getNavItem = function () {
                return _navItem;
            };

            // Initialize indexes
            this.each(function(manifestItem) {
                _manifestIndexById[manifestItem.id] = manifestItem;

                if (manifestItem.properties && manifestItem.properties.indexOf("nav") !== -1) {
                    _navItem = manifestItem;
                }
            });

        };
        return Manifest;
    });
//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('readium_js/epub-model/package_document_parser',['jquery', 'underscore', '../epub-fetch/markup_parser', 'URIjs', './package_document',
        './smil_document_parser', './metadata', './manifest'],
    function($, _, MarkupParser, URI, PackageDocument, SmilDocumentParser, Metadata,
             Manifest) {

        // `PackageDocumentParser` is used to parse the xml of an epub package
    // document and build a javascript object. The constructor accepts an
    // instance of `URI` that is used to resolve paths during the process
    var PackageDocumentParser = function(bookRoot, publicationFetcher) {

        var _packageFetcher = publicationFetcher;
        var _deferredXmlDom = $.Deferred();
        var _xmlDom;

        function onError(error) {
            if (error) {
                if (error.message) {
                    console.error(error.message);
                }
                if (error.stack) {
                    console.error(error.stack);
                }
            }
        }

        publicationFetcher.getPackageDom(function(packageDom){
            _xmlDom = packageDom;
            _deferredXmlDom.resolve(packageDom);
        }, onError);

        function fillSmilData(packageDocument, callback) {

            var smilParser = new SmilDocumentParser(packageDocument, publicationFetcher);

            smilParser.fillSmilData(function() {

                // return the parse result
                callback(packageDocument);
            });

        }

        // Parse an XML package document into a javascript object
        this.parse = function(callback) {

            _deferredXmlDom.done(function (xmlDom) {
                var metadata = getMetadata(xmlDom);

                var spineElem = xmlDom.getElementsByTagNameNS("*", "spine")[0];
                var page_prog_dir = getElemAttr(xmlDom, 'spine', "page-progression-direction");

                // TODO: Bindings are unused
                var bindings = getJsonBindings(xmlDom);

                var manifest = new Manifest(getJsonManifest(xmlDom));
                var spine = getJsonSpine(xmlDom, manifest, metadata);

                // try to find a cover image
                var cover = getCoverHref(xmlDom);
                if (cover) {
                    metadata.cover_href = cover;
                }

                $.when(updateMetadataWithIBookProperties(metadata)).then(function() {

                    _packageFetcher.setPackageMetadata(metadata, function () {
                        var packageDocument = new PackageDocument(publicationFetcher.getPackageUrl(),
                            publicationFetcher, metadata, spine, manifest);

                        packageDocument.setPageProgressionDirection(page_prog_dir);
                        fillSmilData(packageDocument, callback);
                    });
                });

            });
        };

        function updateMetadataWithIBookProperties(metadata) {

            var dff = $.Deferred();

            //if layout not set
            if(!metadata.rendition_layout)
            {
                var pathToIBooksSpecificXml = "/META-INF/com.apple.ibooks.display-options.xml";

                publicationFetcher.relativeToPackageFetchFileContents(pathToIBooksSpecificXml, 'text', function (ibookPropText) {
                    if(ibookPropText) {
                        var parser = new MarkupParser();
                        var propModel = parser.parseXml(ibookPropText);
                        var fixLayoutProp = $("option[name=fixed-layout]", propModel)[0];
                        if(fixLayoutProp) {
                            var fixLayoutVal = $(fixLayoutProp).text();
                            if(fixLayoutVal === "true") {
                                metadata.rendition_layout = "pre-paginated";
                                console.log("using com.apple.ibooks.display-options.xml fixed-layout property");
                            }
                        }
                    }

                    dff.resolve();

                }, function (err) {

                    console.log("com.apple.ibooks.display-options.xml not found");
                    dff.resolve();
                });
            }
            else {
                dff.resolve();
            }

            return dff.promise();
        }


        function getJsonSpine(xmlDom, manifest, metadata) {

            var $spineElements;
            var jsonSpine = [];

            $spineElements = $(findXmlElemByLocalNameAnyNS(xmlDom,"spine")).children();
            $.each($spineElements, function (spineElementIndex, currSpineElement) {

                var $currSpineElement = $(currSpineElement);
                var idref = $currSpineElement.attr("idref") ? $currSpineElement.attr("idref") : "";
                var manifestItem = manifest.getManifestItemByIdref(idref);

                var id = $currSpineElement.attr("id");
                var viewport = undefined;
                _.each(metadata.rendition_viewports, function(vp) {
                    if (vp.refines == id) {
                        viewport = vp.viewport;
                        return true; // break
                    }
                });

                var spineItem = {
                    rendition_viewport: viewport,
                    idref: idref,
                    href: manifestItem.href,
                    manifest_id: manifestItem.id,
                    media_type: manifestItem.media_type,
                    media_overlay_id: manifestItem.media_overlay_id,
                    linear: $currSpineElement.attr("linear") ? $currSpineElement.attr("linear") : "",
                    properties: $currSpineElement.attr("properties") ? $currSpineElement.attr("properties") : ""
                };

                var parsedProperties = parsePropertiesString(spineItem.properties);
                _.extend(spineItem, parsedProperties);

                jsonSpine.push(spineItem);
            });

            return jsonSpine;
        }

        function findXmlElemByLocalNameAnyNS(rootElement, localName, predicate) {
            var elements = rootElement.getElementsByTagNameNS("*", localName);
            if (predicate) {
                return _.find(elements, predicate);
            } else {
                return elements[0];
            }
        }

        function filterXmlElemsByLocalNameAnyNS(rootElement, localName, predicate) {
            var elements = rootElement.getElementsByTagNameNS("*", localName);
            return _.filter(elements, predicate);
        }

        function getElemText(rootElement, localName, predicate) {
            var foundElement = findXmlElemByLocalNameAnyNS(rootElement, localName, predicate);
            if (foundElement) {
                return foundElement.textContent;
            } else {
                return '';
            }
        }

        function getElemAttr(rootElement, localName, attrName, predicate) {
            var foundElement = findXmlElemByLocalNameAnyNS(rootElement, localName, predicate);
            if (foundElement) {
                return foundElement.getAttribute(attrName);
            } else {
                return '';
            }
        }

        function getMetaElemPropertyText(rootElement, attrPropertyValue) {

            var foundElement = findXmlElemByLocalNameAnyNS(rootElement, "meta", function (element) {
                return element.getAttribute("property") === attrPropertyValue;
            });

            if (foundElement) {
                return foundElement.textContent;
            } else {
                return '';
            }
        }


        function getMetadata(xmlDom) {

            var metadata = new Metadata();
            var metadataElem = findXmlElemByLocalNameAnyNS(xmlDom, "metadata");
            var packageElem = findXmlElemByLocalNameAnyNS(xmlDom, "package");
            var spineElem = findXmlElemByLocalNameAnyNS(xmlDom, "spine");


            metadata.author = getElemText(metadataElem, "creator");
            metadata.description = getElemText(metadataElem, "description");
            metadata.epub_version =
                packageElem.getAttribute("version") ? packageElem.getAttribute("version") : "";
            metadata.id = getElemText(metadataElem,"identifier");
            metadata.language = getElemText(metadataElem, "language");
            metadata.modified_date = getMetaElemPropertyText(metadataElem, "dcterms:modified");
            metadata.ncx = spineElem.getAttribute("toc") ? spineElem.getAttribute("toc") : "";
            metadata.pubdate = getElemText(metadataElem, "date");
            metadata.publisher = getElemText(metadataElem, "publisher");
            metadata.rights = getElemText(metadataElem, "rights");
            metadata.title = getElemText(metadataElem, "title");

            metadata.rendition_orientation = getMetaElemPropertyText(metadataElem, "rendition:orientation");
            metadata.rendition_layout = getMetaElemPropertyText(metadataElem, "rendition:layout");
            metadata.rendition_spread = getMetaElemPropertyText(metadataElem, "rendition:spread");
            metadata.rendition_flow = getMetaElemPropertyText(metadataElem, "rendition:flow");






            //http://www.idpf.org/epub/301/spec/epub-publications.html#fxl-property-viewport

            //metadata.rendition_viewport = getMetaElemPropertyText(metadataElem, "rendition:viewport");
            metadata.rendition_viewport = getElemText(metadataElem, "meta", function (element) {
                return element.getAttribute("property") === "rendition:viewport" && !element.hasAttribute("refines")
            });

            var viewports = [];
            var viewportMetaElems = filterXmlElemsByLocalNameAnyNS(metadataElem, "meta", function (element) {
                return element.getAttribute("property") === "rendition:viewport" && element.hasAttribute("refines");
            });
            _.each(viewportMetaElems, function(currItem) {
                var id = currItem.getAttribute("refines");
                if (id) {
                    var hash = id.indexOf('#');
                    if (hash >= 0) {
                        var start = hash+1;
                        var end = id.length-1;
                        id = id.substr(start, end);
                    }
                    id = id.trim();
                }

                var vp = {
                  refines: id,
                  viewport: currItem.textContent
                };
                viewports.push(vp);
            });

            metadata.rendition_viewports = viewports;






            // Media part
            metadata.mediaItems = [];

            var overlayElems = filterXmlElemsByLocalNameAnyNS(metadataElem, "meta", function (element) {
                return element.getAttribute("property") === "media:duration" && element.hasAttribute("refines");
            });

            _.each(overlayElems, function(currItem) {
                metadata.mediaItems.push({
                  refines: currItem.getAttribute("refines"),
                  duration: SmilDocumentParser.resolveClockValue(currItem.textContent)
               });
            });

            metadata.media_overlay = {
                duration: SmilDocumentParser.resolveClockValue(
                    getElemText(metadataElem, "meta", function (element) {
                        return element.getAttribute("property") === "media:duration" && !element.hasAttribute("refines")
                    })
                ),
                narrator: getMetaElemPropertyText(metadataElem, "media:narrator"),
                activeClass: getMetaElemPropertyText(metadataElem, "media:active-class"),
                playbackActiveClass: getMetaElemPropertyText(metadataElem, "media:playback-active-class"),
                smil_models: [],
                skippables: ["sidebar", "practice", "marginalia", "annotation", "help", "note", "footnote", "rearnote",
                    "table", "table-row", "table-cell", "list", "list-item", "pagebreak"],
                escapables: ["sidebar", "bibliography", "toc", "loi", "appendix", "landmarks", "lot", "index",
                    "colophon", "epigraph", "conclusion", "afterword", "warning", "epilogue", "foreword",
                    "introduction", "prologue", "preface", "preamble", "notice", "errata", "copyright-page",
                    "acknowledgments", "other-credits", "titlepage", "imprimatur", "contributors", "halftitlepage",
                    "dedication", "help", "annotation", "marginalia", "practice", "note", "footnote", "rearnote",
                    "footnotes", "rearnotes", "bridgehead", "page-list", "table", "table-row", "table-cell", "list",
                    "list-item", "glossary"]
            };

            return metadata;
        }

        function getJsonManifest(xmlDom) {

            var $manifestItems = $(findXmlElemByLocalNameAnyNS(xmlDom, "manifest")).children();
            var jsonManifest = [];

            $.each($manifestItems, function (manifestElementIndex, currManifestElement) {

                var $currManifestElement = $(currManifestElement);
                var currManifestElementHref = $currManifestElement.attr("href") ? $currManifestElement.attr("href") :
                    "";
                var manifestItem = {

                    href: currManifestElementHref,
                    id: $currManifestElement.attr("id") ? $currManifestElement.attr("id") : "",
                    media_overlay_id: $currManifestElement.attr("media-overlay") ?
                        $currManifestElement.attr("media-overlay") : "",
                    media_type: $currManifestElement.attr("media-type") ? $currManifestElement.attr("media-type") : "",
                    properties: $currManifestElement.attr("properties") ? $currManifestElement.attr("properties") : ""
                };
                // console.log('pushing manifest item to JSON manifest. currManifestElementHref: [' + currManifestElementHref +
                //     '], manifestItem.href: [' + manifestItem.href +
                //     '], manifestItem:');
                // console.log(manifestItem);
                jsonManifest.push(manifestItem);
            });

            return jsonManifest;
        }

        function getJsonBindings(xmlDom) {

            var $bindings = $(findXmlElemByLocalNameAnyNS(xmlDom, "bindings")).children();
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
        }

        function getCoverHref(xmlDom) {

            var manifest;
            var $imageNode;
            manifest = findXmlElemByLocalNameAnyNS(xmlDom, "manifest");

            // epub3 spec for a cover image is like this:
            /*<item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />*/
            $imageNode = $(findXmlElemByLocalNameAnyNS(manifest, "item", function (element) {
                var attr = element.getAttribute("properties");
                return attr && _.contains(attr.split(" "), "cover-image");
            }));
            if ($imageNode.length === 1 && $imageNode.attr("href")) {
                return $imageNode.attr("href");
            }

            // some epub2's cover image is like this:
            /*<meta name="cover" content="cover-image-item-id" />*/
            var metaNode = $(findXmlElemByLocalNameAnyNS(xmlDom, "meta", function (element) {
                return element.getAttribute("name") === "cover";
            }));
            var contentAttr = metaNode.attr("content");
            if (metaNode.length === 1 && contentAttr) {
                $imageNode = $(findXmlElemByLocalNameAnyNS(manifest, "item", function (element) {
                    return element.getAttribute("id") === contentAttr;
                }));
                if ($imageNode.length === 1 && $imageNode.attr("href")) {
                    return $imageNode.attr("href");
                }
            }

            // that didn't seem to work so, it think epub2 just uses item with id=cover
            $imageNode = $(findXmlElemByLocalNameAnyNS(manifest, "item", function (element) {
                return element.getAttribute("id") === "cover";
            }));
            if ($imageNode.length === 1 && $imageNode.attr("href")) {
                return $imageNode.attr("href");
            }

            // seems like there isn't one, thats ok...
            return null;
        }

        function parsePropertiesString(str) {
            var properties = {};
            var allPropStrs = str.split(" "); // split it on white space
            for (var i = 0; i < allPropStrs.length; i++) {

                //ReadiumSDK.Models.SpineItem.RENDITION_ORIENTATION_LANDSCAPE
                if (allPropStrs[i] === "rendition:orientation-landscape") properties.rendition_orientation = "landscape";

                //ReadiumSDK.Models.SpineItem.RENDITION_ORIENTATION_PORTRAIT
                if (allPropStrs[i] === "rendition:orientation-portrait") properties.rendition_orientation = "portrait";

                //ReadiumSDK.Models.SpineItem.RENDITION_ORIENTATION_AUTO
                if (allPropStrs[i] === "rendition:orientation-auto") properties.rendition_orientation = "auto";


                //ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_NONE
                if (allPropStrs[i] === "rendition:spread-none") properties.rendition_spread = "none";

                //ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_LANDSCAPE
                if (allPropStrs[i] === "rendition:spread-landscape") properties.rendition_spread = "landscape";

                //ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_PORTRAIT
                if (allPropStrs[i] === "rendition:spread-portrait") properties.rendition_spread = "portrait";

                //ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_BOTH
                if (allPropStrs[i] === "rendition:spread-both") properties.rendition_spread = "both";

                //ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_AUTO
                if (allPropStrs[i] === "rendition:spread-auto") properties.rendition_spread = "auto";


                //ReadiumSDK.Models.SpineItem.RENDITION_FLOW_PAGINATED
                if (allPropStrs[i] === "rendition:flow-paginated") properties.rendition_flow = "paginated";

                //ReadiumSDK.Models.SpineItem.RENDITION_FLOW_SCROLLED_CONTINUOUS
                if (allPropStrs[i] === "rendition:flow-scrolled-continuous") properties.rendition_flow = "scrolled-continuous";

                //ReadiumSDK.Models.SpineItem.RENDITION_FLOW_SCROLLED_DOC
                if (allPropStrs[i] === "rendition:flow-scrolled-doc") properties.rendition_flow = "scrolled-doc";

                //ReadiumSDK.Models.SpineItem.RENDITION_FLOW_AUTO
                if (allPropStrs[i] === "rendition:flow-auto") properties.rendition_flow = "auto";



                //ReadiumSDK.Models.SpineItem.SPREAD_CENTER
                if (allPropStrs[i] === "rendition:page-spread-center") properties.page_spread = "page-spread-center";

                //ReadiumSDK.Models.SpineItem.SPREAD_LEFT
                if (allPropStrs[i] === "page-spread-left") properties.page_spread = "page-spread-left";

                //ReadiumSDK.Models.SpineItem.SPREAD_RIGHT
                if (allPropStrs[i] === "page-spread-right") properties.page_spread = "page-spread-right";

                //ReadiumSDK.Models.SpineItem.RENDITION_LAYOUT_REFLOWABLE
                if (allPropStrs[i] === "rendition:layout-reflowable") {
                    properties.fixed_flow = false; // TODO: only used in spec tests!
                    properties.rendition_layout = "reflowable";
                }

                //ReadiumSDK.Models.SpineItem.RENDITION_LAYOUT_PREPAGINATED
                if (allPropStrs[i] === "rendition:layout-pre-paginated") {
                    properties.fixed_flow = true; // TODO: only used in spec tests!
                    properties.rendition_layout = "pre-paginated";
                }
            }
            return properties;
        }

    };

    return PackageDocumentParser;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('readium_js/epub-fetch/iframe_zip_loader',['URIjs', 'readium_shared_js/views/iframe_loader', 'underscore'], function(URI, IFrameLoader, _){

    var zipIframeLoader = function( getCurrentResourceFetcher, contentDocumentTextPreprocessor) {

        var basicIframeLoader = new IFrameLoader();

        var self = this;

        var _contentDocumentTextPreprocessor = contentDocumentTextPreprocessor;

        this.addIFrameEventListener = function (eventName, callback, context) {
            basicIframeLoader.addIFrameEventListener(eventName, callback, context);
        };

        this.updateIframeEvents = function (iframe) {
            basicIframeLoader.updateIframeEvents(iframe);
        };

        this.loadIframe = function(iframe, src, callback, caller, attachedData) {

            if (!iframe.baseURI) {
                if (typeof location !== 'undefined') {
                    iframe.baseURI = location.href + "";
                }
                console.log("!iframe.baseURI => " + iframe.baseURI);
            }

            iframe.setAttribute("data-baseUri", iframe.baseURI);
            iframe.setAttribute("data-src", src);

            var loadedDocumentUri = new URI(src).absoluteTo(iframe.baseURI).search('').hash('').toString();

            var shouldConstructDomProgrammatically = getCurrentResourceFetcher().shouldConstructDomProgrammatically();
            if (shouldConstructDomProgrammatically) {

                    getCurrentResourceFetcher().fetchContentDocument(attachedData, loadedDocumentUri,
                        function (resolvedContentDocumentDom) {
                            self._loadIframeWithDocument(iframe,
                                attachedData,
                                resolvedContentDocumentDom.documentElement.outerHTML,
                                function () {
                                    callback.call(caller, true, attachedData);
                                });
                        }, function (err) {
                            callback.call(caller, false, attachedData);
                        }
                    );
            } else {
                fetchContentDocument(loadedDocumentUri, function (contentDocumentHtml) {
                      if (!contentDocumentHtml) {
                          //failed to load content document
                          callback.call(caller, false, attachedData);
                      } else {
                          self._loadIframeWithDocument(iframe, attachedData, contentDocumentHtml, function () {
                              callback.call(caller, true, attachedData);
                          });
                      }
                });
            }
        };

        this._loadIframeWithDocument = function (iframe, attachedData, contentDocumentData, callback) {

            var isIE = (window.navigator.userAgent.indexOf("Trident") > 0);
            if (!isIE) {
                var contentType = 'text/html';
                if (attachedData.spineItem.media_type && attachedData.spineItem.media_type.length) {
                    contentType = attachedData.spineItem.media_type;
                }

                var documentDataUri = window.URL.createObjectURL(
                    new Blob([contentDocumentData], {'type': contentType})
                );
            } else {
                // Internet Explorer doesn't handle loading documents from Blobs correctly.
                // TODO: Currently using the document.write() approach only for IE, as it breaks CSS selectors
                // with namespaces for some reason (e.g. the childrens-media-query sample EPUB)
                iframe.contentWindow.document.open();

                // Currently not handled automatically by winstore-jscompat,
                // so we're doing it manually. See:
                // https://github.com/MSOpenTech/winstore-jscompat/
                if (window.MSApp && window.MSApp.execUnsafeLocalFunction) {
                    window.MSApp.execUnsafeLocalFunction(function() {
                        iframe.contentWindow.document.write(contentDocumentData);
                    });
                } else {
                    iframe.contentWindow.document.write(contentDocumentData);
                }
            }

            iframe.onload = function () {

                self.updateIframeEvents(iframe);

                var mathJax = iframe.contentWindow.MathJax;
                if (mathJax) {
                    // If MathJax is being used, delay the callback until it has completed rendering
                    var mathJaxCallback = _.once(callback);
                    mathJax.Hub.Queue(mathJaxCallback);
                    // Or at an 8 second timeout, which ever comes first
                    // window.setTimeout(mathJaxCallback, 8000);
                } else {
                    callback();
                }

                if (!isIE) {
                    window.URL.revokeObjectURL(documentDataUri);
                }
            };

            if (!isIE) {
                iframe.setAttribute("src", documentDataUri);
            } else {
                iframe.contentWindow.document.close();
            }
        };

        function fetchHtmlAsText(path, callback) {

            $.ajax({
                url: path,
                dataType: 'html',
                async: true,
                success: function (result) {

                    callback(result);
                },
                error: function (xhr, status, errorThrown) {
                    console.error('Error when AJAX fetching ' + path);
                    console.error(status);
                    console.error(errorThrown);
                    callback();
                }
            });
        }

        function fetchContentDocument(src, callback) {

            fetchHtmlAsText(src, function (contentDocumentHtml) {

                if (!contentDocumentHtml) {
                    callback();
                    return;
                }

                if (_contentDocumentTextPreprocessor) {
                    contentDocumentHtml = _contentDocumentTextPreprocessor(src, contentDocumentHtml);
                }

                callback(contentDocumentHtml);
            });
        }
    };

    return zipIframeLoader;
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.


define('readium_js/Readium',['text!version.json', 'jquery', 'underscore', 'readium_shared_js/views/reader_view', 'readium_js/epub-fetch/publication_fetcher',
        'readium_js/epub-model/package_document_parser', 'readium_js/epub-fetch/iframe_zip_loader', 'readium_shared_js/views/iframe_loader'
        ],
    function (versionText, $, _, ReaderView, PublicationFetcher,
              PackageParser, IframeZipLoader, IframeLoader) {

    var Readium = function(readiumOptions, readerOptions){

        var _options = { mathJaxUrl: readerOptions.mathJaxUrl };

        var _contentDocumentTextPreprocessor = function(src, contentDocumentHtml) {

            function injectedScript() {

                navigator.epubReadingSystem = window.parent.navigator.epubReadingSystem;
                window.parent = window.self;
                window.top = window.self;
            }

            var sourceParts = src.split("/");
            sourceParts.pop(); //remove source file name

            var base = "<base href=\"" + sourceParts.join("/") + "/" + "\"/>";

            var scripts = "<script type=\"text/javascript\">(" + injectedScript.toString() + ")()<\/script>";

            if (_options && _options.mathJaxUrl && contentDocumentHtml.indexOf("<math") >= 0) {
                scripts += "<script type=\"text/javascript\" src=\"" + _options.mathJaxUrl + "\"><\/script>";
            }

            return contentDocumentHtml.replace(/(<head.*?>)/, "$1" + base + scripts);
        };

        var self = this;

        var _currentPublicationFetcher;

        var jsLibRoot = readiumOptions.jsLibRoot;

        if (!readiumOptions.useSimpleLoader){
            readerOptions.iframeLoader = new IframeZipLoader(function() { return _currentPublicationFetcher; }, _contentDocumentTextPreprocessor);
        }
        else{
            readerOptions.iframeLoader = new IframeLoader();
        }

        // Chrome extension and cross-browser cloud reader build configuration uses this scaling method across the board (no browser sniffing for Chrome)
        // See https://github.com/readium/readium-js-viewer/issues/313#issuecomment-101578284
        // true means: apply CSS scale transform to the root HTML element of spine item documents (fixed layout / pre-paginated)
        // and to any spine items in scroll view (both continuous and document modes). Scroll view layout includes reflowable spine items, but the zoom level is 1x so there is no impact.
        readerOptions.needsFixedLayoutScalerWorkAround = true;

        this.reader = new ReaderView(readerOptions);
        ReadiumSDK.reader = this.reader;
  
        this.openPackageDocument = function(bookRoot, callback, openPageRequest)  {
            if (_currentPublicationFetcher) {
                _currentPublicationFetcher.flushCache();
            }

            var cacheSizeEvictThreshold = null;
            if (readiumOptions.cacheSizeEvictThreshold) {
                cacheSizeEvictThreshold = readiumOptions.cacheSizeEvictThreshold;
            }

            _currentPublicationFetcher = new PublicationFetcher(bookRoot, jsLibRoot, window, cacheSizeEvictThreshold, _contentDocumentTextPreprocessor);

            _currentPublicationFetcher.initialize(function() {

                var _packageParser = new PackageParser(bookRoot, _currentPublicationFetcher);

                _packageParser.parse(function(packageDocument){
                    var openBookOptions = readiumOptions.openBookOptions || {};
                    var openBookData = $.extend(packageDocument.getSharedJsPackageData(), openBookOptions);

                    if (openPageRequest) {
                        openBookData.openPageRequest = openPageRequest;
                    }
                    self.reader.openBook(openBookData);

                    var options = {
                        packageDocumentUrl : _currentPublicationFetcher.getPackageUrl(),
                        metadata: packageDocument.getMetadata()
                    };

                    if (callback){
                        // gives caller access to document metadata like the table of contents
                        callback(packageDocument, options);
                    }
                });
            });
        };

        this.closePackageDocument = function() {
            if (_currentPublicationFetcher) {
                _currentPublicationFetcher.flushCache();
            }
        };

        ReadiumSDK.emit(ReadiumSDK.Events.READER_INITIALIZED, ReadiumSDK.reader);
    };

    Readium.version = JSON.parse(versionText);

    return Readium;

});

define('readium_js', ['readium_js/Readium'], function (main) { return main; });


define("readium-js", function(){});

//# sourceMappingURL=readium-js.js.map