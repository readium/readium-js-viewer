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


define('text!version.json',[],function () { return '{"readiumJsViewer":{"sha":"702a0ea584f04525b1eaee6e93f6358e67373454","clean":false,"version":"0.19.0-alpha","chromeVersion":"2.19.0-alpha","tag":"0.17.0-56-g702a0ea","branch":"feature/pluginsX","release":false,"timestamp":1430830560064},"readiumJs":{"sha":"42f9cce30bb6741164c78468482a056a937a93fe","clean":false,"version":"0.19.0-alpha","tag":"0.15-135-g42f9cce","branch":"feature/pluginsX","release":false,"timestamp":1430830560370},"readiumSharedJs":{"sha":"257b1238d20da742c39066701d19171a1eec7526","clean":false,"version":"0.19.0-alpha","tag":"0.16-120-g257b123","branch":"feature/pluginsX","release":false,"timestamp":1430830560660},"readiumCfiJs":{"sha":"0698ab8b5b206bf08c8a8b79be51a60fa7f35647","clean":false,"version":"0.19.0-alpha","tag":"0.1.4-90-g0698ab8","branch":"feature/plugins","release":false,"timestamp":1430830560884}}';});

EPUBcfiParser = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { fragment: peg$parsefragment },
        peg$startRuleFunction  = peg$parsefragment,

        peg$c0 = peg$FAILED,
        peg$c1 = "epubcfi(",
        peg$c2 = { type: "literal", value: "epubcfi(", description: "\"epubcfi(\"" },
        peg$c3 = ")",
        peg$c4 = { type: "literal", value: ")", description: "\")\"" },
        peg$c5 = function(fragmentVal) { 
                
                return { type:"CFIAST", cfiString:fragmentVal };
            },
        peg$c6 = ",",
        peg$c7 = { type: "literal", value: ",", description: "\",\"" },
        peg$c8 = function(stepVal, localPathVal, rangeLocalPath1Val, rangeLocalPath2Val) {

                return { type:"range", path:stepVal, localPath:localPathVal, range1:rangeLocalPath1Val, range2:rangeLocalPath2Val };
          },
        peg$c9 = function(stepVal, localPathVal) { 

                return { type:"path", path:stepVal, localPath:localPathVal }; 
            },
        peg$c10 = [],
        peg$c11 = null,
        peg$c12 = function(localPathStepVal, termStepVal) { 

                return { steps:localPathStepVal, termStep:termStepVal?termStepVal:"" }; 
            },
        peg$c13 = "/",
        peg$c14 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c15 = "[",
        peg$c16 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c17 = "]",
        peg$c18 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c19 = function(stepLengthVal, assertVal) { 

                return { type:"indexStep", stepLength:stepLengthVal, idAssertion:assertVal?assertVal[1]:undefined };
            },
        peg$c20 = "!/",
        peg$c21 = { type: "literal", value: "!/", description: "\"!/\"" },
        peg$c22 = function(stepLengthVal, assertVal) { 

                return { type:"indirectionStep", stepLength:stepLengthVal, idAssertion:assertVal?assertVal[1]:undefined };
            },
        peg$c23 = ":",
        peg$c24 = { type: "literal", value: ":", description: "\":\"" },
        peg$c25 = function(textOffsetValue, textLocAssertVal) { 

                return { type:"textTerminus", offsetValue:textOffsetValue, textAssertion: textLocAssertVal?textLocAssertVal[1]:undefined };
            },
        peg$c26 = function(idVal) { 

                return idVal; 
            },
        peg$c27 = function(csvVal, paramVal) { 

                return { type:"textLocationAssertion", csv:csvVal?csvVal:"", parameter:paramVal?paramVal:"" }; 
            },
        peg$c28 = ";",
        peg$c29 = { type: "literal", value: ";", description: "\";\"" },
        peg$c30 = "=",
        peg$c31 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c32 = function(paramLHSVal, paramRHSVal) { 

                return { type:"parameter", LHSValue:paramLHSVal?paramLHSVal:"", RHSValue:paramRHSVal?paramRHSVal:"" }; 
            },
        peg$c33 = function(preAssertionVal, postAssertionVal) { 

                return { type:"csv", preAssertion:preAssertionVal?preAssertionVal:"", postAssertion:postAssertionVal?postAssertionVal:"" }; 
            },
        peg$c34 = function(stringVal) { 

                return stringVal.join(''); 
            },
        peg$c35 = function(escSpecCharVal) { 
                
                return escSpecCharVal[1]; 
            },
        peg$c36 = /^[1-9]/,
        peg$c37 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c38 = /^[0-9]/,
        peg$c39 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c40 = ".",
        peg$c41 = { type: "literal", value: ".", description: "\".\"" },
        peg$c42 = function(intPartVal, fracPartVal) { 

                return intPartVal.join('') + "." + fracPartVal.join(''); 
            },
        peg$c43 = "0",
        peg$c44 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c45 = function(integerVal) { 

                if (integerVal === "0") { 
                  return "0";
                } 
                else { 
                  return integerVal[0].concat(integerVal[1].join(''));
                }
            },
        peg$c46 = " ",
        peg$c47 = { type: "literal", value: " ", description: "\" \"" },
        peg$c48 = function() { return " "; },
        peg$c49 = "^",
        peg$c50 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c51 = function() { return "^"; },
        peg$c52 = "\"",
        peg$c53 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c54 = function() { return '"'; },
        peg$c55 = function(bracketVal) { return bracketVal; },
        peg$c56 = "(",
        peg$c57 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c58 = function(paraVal) { return paraVal; },
        peg$c59 = function() { return ","; },
        peg$c60 = function() { return ";"; },
        peg$c61 = function() { return "="; },
        peg$c62 = /^[a-z]/,
        peg$c63 = { type: "class", value: "[a-z]", description: "[a-z]" },
        peg$c64 = /^[A-Z]/,
        peg$c65 = { type: "class", value: "[A-Z]", description: "[A-Z]" },
        peg$c66 = "-",
        peg$c67 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c68 = "_",
        peg$c69 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c70 = function(charVal) { return charVal; },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsefragment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c1) {
        s1 = peg$c1;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parserange();
        if (s2 === peg$FAILED) {
          s2 = peg$parsepath();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c3;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c4); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c5(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserange() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseindexStep();
      if (s1 !== peg$FAILED) {
        s2 = peg$parselocal_path();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c6;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c7); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parselocal_path();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c6;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c7); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parselocal_path();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c8(s1, s2, s4, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepath() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseindexStep();
      if (s1 !== peg$FAILED) {
        s2 = peg$parselocal_path();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c9(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parselocal_path() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseindexStep();
      if (s2 === peg$FAILED) {
        s2 = peg$parseindirectionStep();
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseindexStep();
          if (s2 === peg$FAILED) {
            s2 = peg$parseindirectionStep();
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseterminus();
        if (s2 === peg$FAILED) {
          s2 = peg$c11;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c12(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseindexStep() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 47) {
        s1 = peg$c13;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c14); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s4 = peg$c15;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c16); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseidAssertion();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s6 = peg$c17;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c18); }
              }
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c11;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c19(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseindirectionStep() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c20) {
        s1 = peg$c20;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c21); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s4 = peg$c15;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c16); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseidAssertion();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s6 = peg$c17;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c18); }
              }
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c11;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c22(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseterminus() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s1 = peg$c23;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s4 = peg$c15;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c16); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetextLocationAssertion();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s6 = peg$c17;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c18); }
              }
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c11;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c25(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseidAssertion() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsevalue();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c26(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsetextLocationAssertion() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsecsv();
      if (s1 === peg$FAILED) {
        s1 = peg$c11;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseparameter();
        if (s2 === peg$FAILED) {
          s2 = peg$c11;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c27(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseparameter() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 59) {
        s1 = peg$c28;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsevalueNoSpace();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s3 = peg$c30;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c31); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsevalueNoSpace();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c32(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecsv() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsevalue();
      if (s1 === peg$FAILED) {
        s1 = peg$c11;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s2 = peg$c6;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c7); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsevalue();
          if (s3 === peg$FAILED) {
            s3 = peg$c11;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c33(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsevalueNoSpace() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseescapedSpecialChars();
      if (s2 === peg$FAILED) {
        s2 = peg$parsecharacter();
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseescapedSpecialChars();
          if (s2 === peg$FAILED) {
            s2 = peg$parsecharacter();
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c34(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsevalue() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseescapedSpecialChars();
      if (s2 === peg$FAILED) {
        s2 = peg$parsecharacter();
        if (s2 === peg$FAILED) {
          s2 = peg$parsespace();
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseescapedSpecialChars();
          if (s2 === peg$FAILED) {
            s2 = peg$parsecharacter();
            if (s2 === peg$FAILED) {
              s2 = peg$parsespace();
            }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c34(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseescapedSpecialChars() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsecircumflex();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecircumflex();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$parsecircumflex();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesquareBracket();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          s2 = peg$parsecircumflex();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseparentheses();
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
          if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            s2 = peg$parsecircumflex();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsecomma();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$currPos;
              s2 = peg$parsecircumflex();
              if (s2 !== peg$FAILED) {
                s3 = peg$parsesemicolon();
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
              if (s1 === peg$FAILED) {
                s1 = peg$currPos;
                s2 = peg$parsecircumflex();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseequal();
                  if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c0;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c35(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c38.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c38.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c39); }
            }
          }
        } else {
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s2 = peg$c40;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c41); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = [];
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (peg$c38.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c39); }
            }
          }
          if (s4 !== peg$FAILED) {
            if (peg$c36.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c37); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c42(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseinteger() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c43;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        if (peg$c36.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c38.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c39); }
            }
          }
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c45(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsespace() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c46;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c48();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsecircumflex() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 94) {
        s1 = peg$c49;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c50); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c51();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsedoubleQuote() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c52;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c53); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c54();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsesquareBracket() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c15;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c16); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s1 = peg$c17;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c55(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseparentheses() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 41) {
          s1 = peg$c3;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c4); }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c58(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsecomma() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 44) {
        s1 = peg$c6;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c7); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c59();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsesemicolon() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 59) {
        s1 = peg$c28;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c60();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseequal() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c30;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c61();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsecharacter() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c62.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c63); }
      }
      if (s1 === peg$FAILED) {
        if (peg$c64.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s1 === peg$FAILED) {
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
          }
          if (s1 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s1 = peg$c66;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c67); }
            }
            if (s1 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 95) {
                s1 = peg$c68;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c69); }
              }
              if (s1 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s1 = peg$c40;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c41); }
                }
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c70(s1);
      }
      s0 = s1;

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

define("cfi_parser_gen", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.EPUBcfiParser;
    };
}(this)));

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

define('cfi_parser',["./cfi_parser_gen"], function (cfi_parser_gen) {
return cfi_parser_gen;
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

(function(global) {


// Description: This is a set of runtime errors that the CFI interpreter can throw. 
// Rationale: These error types extend the basic javascript error object so error things like the stack trace are 
//   included with the runtime errors. 

// REFACTORING CANDIDATE: This type of error may not be required in the long run. The parser should catch any syntax errors, 
//   provided it is error-free, and as such, the AST should never really have any node type errors, which are essentially errors
//   in the structure of the AST. This error should probably be refactored out when the grammar and interpreter are more stable.

var obj = {

NodeTypeError: function (node, message) {

    function NodeTypeError () {

        this.node = node;
    }

    NodeTypeError.prototype = new Error(message);
    NodeTypeError.constructor = NodeTypeError;

    return new NodeTypeError();
},

// REFACTORING CANDIDATE: Might make sense to include some more specifics about the out-of-rangeyness.
OutOfRangeError: function (targetIndex, maxIndex, message) {

    function OutOfRangeError () {

        this.targetIndex = targetIndex;
        this.maxIndex = maxIndex;
    }

    OutOfRangeError.prototype = new Error(message);
    OutOfRangeError.constructor = OutOfRangeError()

    return new OutOfRangeError();
},

// REFACTORING CANDIDATE: This is a bit too general to be useful. When I have a better understanding of the type of errors
//   that can occur with the various terminus conditions, it'll make more sense to revisit this. 
TerminusError: function (terminusType, terminusCondition, message) {

    function TerminusError () {

        this.terminusType = terminusType;
        this.terminusCondition = terminusCondition;
    }

    TerminusError.prototype = new Error(message);
    TerminusError.constructor = TerminusError();

    return new TerminusError();
},

CFIAssertionError: function (expectedAssertion, targetElementAssertion, message) {

    function CFIAssertionError () {

        this.expectedAssertion = expectedAssertion;
        this.targetElementAssertion = targetElementAssertion;
    }

    CFIAssertionError.prototype = new Error(message);
    CFIAssertionError.constructor = CFIAssertionError();

    return new CFIAssertionError();
}

};










if (typeof define == 'function' && typeof define.amd == 'object') {
    console.log("RequireJS ... cfi_errors");
    
    define('cfi_runtime_errors',[],
    function () {
        return obj;
    });
} else {
    console.log("!RequireJS ... cfi_errors");
    
    if (!global["EPUBcfi"]) {
        throw new Error("EPUBcfi not initialised on global object?! (window or this context)");
    }
    
    global.EPUBcfi.NodeTypeError = obj.NodeTypeError;
    global.EPUBcfi.OutOfRangeError = obj.OutOfRangeError;
    global.EPUBcfi.TerminusError = obj.TerminusError;
    global.EPUBcfi.CFIAssertionError = obj.CFIAssertionError;
}

})(typeof window !== "undefined" ? window : this);

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

(function(global) {

var init = function($, cfiRuntimeErrors) {
    
var obj = {

// Description: This model contains the implementation for "instructions" included in the EPUB CFI domain specific language (DSL). 
//   Lexing and parsing a CFI produces a set of executable instructions for processing a CFI (represented in the AST). 
//   This object contains a set of functions that implement each of the executable instructions in the AST. 

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

			throw cfiRuntimeErrors.NodeTypeError($currNode, "expected an iframe element");
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

		var $injectedElement;
		// Get the first node, this should be a text node
		if ($currNode === undefined) {

			throw cfiRuntimeErrors.NodeTypeError($currNode, "expected a terminating node, or node list");
		} 
		else if ($currNode.length === 0) {

			throw cfiRuntimeErrors.TerminusError("Text", "Text offset:" + textOffset, "no nodes found for termination condition");
		}

		$injectedElement = this.injectCFIMarkerIntoText($currNode, textOffset, elementToInject);
		return $injectedElement;
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

			throw cfiRuntimeErrors.OutOfRangeError(jqueryTargetNodeIndex, numElements - 1, "");
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
        var document = $textNodeList[0].ownerDocument;

        var nodeNum;
        var currNodeLength;
        var currTextPosition = 0;
        var nodeOffset;
        var originalText;
        var $injectedNode;
        var $newTextNode;
        // The iteration counter may be incorrect here (should be $textNodeList.length - 1 ??)
        for (nodeNum = 0; nodeNum <= $textNodeList.length; nodeNum++) {

            if ($textNodeList[nodeNum].nodeType === Node.TEXT_NODE) {

                currNodeMaxIndex = $textNodeList[nodeNum].nodeValue.length  + currTextPosition;
                nodeOffset = textOffset - currTextPosition;

                if (currNodeMaxIndex > textOffset) {

                    // This node is going to be split and the components re-inserted
                    originalText = $textNodeList[nodeNum].nodeValue;	

                    // Before part
                    $textNodeList[nodeNum].nodeValue = originalText.slice(0, nodeOffset);

                    // Injected element
                    $injectedNode = $(elementToInject).insertAfter($textNodeList.eq(nodeNum));

                    // After part
                    $newTextNode = $(document.createTextNode(originalText.slice(nodeOffset, originalText.length)));
                    $($newTextNode).insertAfter($injectedNode);

                    return $injectedNode;
                } else if (currNodeMaxIndex == textOffset){
                    $injectedNode = $(elementToInject).insertAfter($textNodeList.eq(nodeNum));
                    return $injectedNode;
                }
                else {
                    currTextPosition = currNodeMaxIndex;
                }
            } else if($textNodeList[nodeNum].nodeType === Node.COMMENT_NODE){
            	currNodeMaxIndex = $textNodeList[nodeNum].nodeValue.length + 7 + currTextPosition;
                currTextPosition = currNodeMaxIndex;
            } else if($textNodeList[nodeNum].nodeType === Node.PROCESSING_INSTRUCTION_NODE){
            	currNodeMaxIndex = $textNodeList[nodeNum].nodeValue.length + $textNodeList[nodeNum].target.length + 5
                currTextPosition = currNodeMaxIndex;
            }
        }

        throw cfiRuntimeErrors.TerminusError("Text", "Text offset:" + textOffset, "The offset exceeded the length of the text");
    },

	// Rationale: In order to inject an element into a specific position, access to the parent object 
	//   is required. This is obtained with the jquery parent() method. An alternative would be to 
	//   pass in the parent with a filtered list containing only children that are part of the target text node.

	// Description: This method finds a target text node and then injects an element into the appropriate node
	// Rationale: The possibility that cfi marker elements have been injected into a text node at some point previous to 
	//   this method being called (and thus splitting the original text node into two separate text nodes) necessitates that
	//   the set of nodes that compromised the original target text node are inferred and returned.
	// Notes: Passed a current node. This node should have a set of elements under it. This will include at least one text node, 
	//   element nodes (maybe), or possibly a mix. 
	// REFACTORING CANDIDATE: This method is pretty long (and confusing). Worth investigating to see if it can be refactored into something clearer.
	inferTargetTextNode : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {
		
		var $elementsWithoutMarkers;
		var currLogicalTextNodeIndex;
		var targetLogicalTextNodeIndex;
		var nodeNum;
		var $targetTextNodeList;
		var prevNodeWasTextNode;

		// Remove any cfi marker elements from the set of elements. 
		// Rationale: A filtering function is used, as simply using a class selector with jquery appears to 
		//   result in behaviour where text nodes are also filtered out, along with the class element being filtered.
		$elementsWithoutMarkers = this.applyBlacklist($currNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

		// Convert CFIStepValue to logical index; assumes odd integer for the step value
		targetLogicalTextNodeIndex = ((parseInt(CFIStepValue) + 1) / 2) - 1;

		// Set text node position counter
		currLogicalTextNodeIndex = 0;
		prevNodeWasTextNode = false;
		$targetTextNodeList = $elementsWithoutMarkers.filter(
			function () {

				if (currLogicalTextNodeIndex === targetLogicalTextNodeIndex) {

					// If it's a text node
					if (this.nodeType === Node.TEXT_NODE || this.nodeType === Node.COMMENT_NODE || this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
						prevNodeWasTextNode = true;
						return true;
					}
					// Rationale: The logical text node position is only incremented once a group of text nodes (a single logical
					//   text node) has been passed by the loop. 
					else if (prevNodeWasTextNode && (this.nodeType !== Node.TEXT_NODE)) {
						currLogicalTextNodeIndex++;
						prevNodeWasTextNode = false;
						return false;
					}
				}
				// Don't return any elements
				else {

					if (this.nodeType === Node.TEXT_NODE || this.nodeType === Node.COMMENT_NODE || this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
						prevNodeWasTextNode = true;
					}else if (!prevNodeWasTextNode && this.nodeType === Node.ELEMENT_NODE){
                        currLogicalTextNodeIndex++;
						prevNodeWasTextNode = true;
					}
					else if (prevNodeWasTextNode && (this.nodeType !== Node.TEXT_NODE) && (this !== $elementsWithoutMarkers.lastChild)) {
						currLogicalTextNodeIndex++;
						prevNodeWasTextNode = false;
					}

					return false;
				}
			}
		);

		// The filtering above should have counted the number of "logical" text nodes; this can be used to 
		// detect out of range errors
		if ($targetTextNodeList.length === 0) {
			throw cfiRuntimeErrors.OutOfRangeError(targetLogicalTextNodeIndex, currLogicalTextNodeIndex, "Index out of range");
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

return obj;
}










if (typeof define == 'function' && typeof define.amd == 'object') {
    console.log("RequireJS ... cfi_instructions");
    
    define('cfi_instructions',['jquery', './cfi_runtime_errors'],
    function ($, cfiRuntimeErrors) {
        return init($, cfiRuntimeErrors);
    });
} else {
    console.log("!RequireJS ... cfi_instructions");
    
    if (!global["EPUBcfi"]) {
        throw new Error("EPUBcfi not initialised on global object?! (window or this context)");
    }
    global.EPUBcfi.CFIInstructions = 
    init($,
        {
            NodeTypeError: global.EPUBcfi.NodeTypeError,
            OutOfRangeError: global.EPUBcfi.OutOfRangeError,
            TerminusError: global.EPUBcfi.TerminusError,
            CFIAssertionError: global.EPUBcfi.CFIAssertionError
        });
}

})(typeof window !== "undefined" ? window : this);

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

(function(global) {

var init = function($, cfiParser, cfiInstructions, cfiRuntimeErrors) {
    
    if (typeof cfiParser === "undefined") {
        throw new Error("UNDEFINED?! cfiParser");
    }
    
    if (typeof cfiInstructions === "undefined") {
        throw new Error("UNDEFINED?! cfiInstructions");
    }
    
    if (typeof cfiRuntimeErrors === "undefined") {
        throw new Error("UNDEFINED?! cfiRuntimeErrors");
    }
    
var obj = {

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

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    // Description: Find the content document referenced by the spine item. This should be the spine item 
    //   referenced by the first indirection step in the CFI.
    // Rationale: This method is a part of the API so that the reading system can "interact" the content document 
    //   pointed to by a CFI. If this is not a separate step, the processing of the CFI must be tightly coupled with 
    //   the reading system, as it stands now. 
    getContentDocHref : function (CFI, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var $packageDocument = $(packageDocument);
        var decodedCFI = decodeURI(CFI);
        var CFIAST = cfiParser.parse(decodedCFI);

        if (!CFIAST || CFIAST.type !== "CFIAST") { 
            throw cfiRuntimeErrors.NodeTypeError(CFIAST, "expected CFI AST root node");
        }

        // Interpet the path node (the package document step)
        var $packageElement = $($("package", $packageDocument)[0]);
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $packageElement, classBlacklist, elementBlacklist, idBlacklist);
        foundHref = this.searchLocalPathForHref($currElement, $packageDocument, CFIAST.cfiString.localPath, classBlacklist, elementBlacklist, idBlacklist);

        if (foundHref) {
            return foundHref;
        }
        else {
            return undefined;
        }
    },

    // Description: Inject an arbitrary html element into a position in a content document referenced by a CFI
    injectElement : function (CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(CFI);
        var CFIAST = cfiParser.parse(decodedCFI);
        var indirectionNode;
        var indirectionStepNum;
        var $currElement;

        // Rationale: Since the correct content document for this CFI is already being passed, we can skip to the beginning 
        //   of the indirection step that referenced the content document.
        // Note: This assumes that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
        indirectionStepNum = this.getFirstIndirectionStepNum(CFIAST);
        indirectionNode = CFIAST.cfiString.localPath.steps[indirectionStepNum];
        indirectionNode.type = "indexStep";

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString.localPath, indirectionStepNum, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // TODO: detect what kind of terminus; for now, text node termini are the only kind implemented
        $currElement = this.interpretTextTerminusNode(CFIAST.cfiString.localPath.termStep, $currElement, elementToInject);

        // Return the element that was injected into
        return $currElement;
    },

    // Description: Inject an arbitrary html element into a position in a content document referenced by a CFI
    injectRangeElements : function (rangeCFI, contentDocument, startElementToInject, endElementToInject, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(rangeCFI);
        var CFIAST = cfiParser.parse(decodedCFI);
        var indirectionNode;
        var indirectionStepNum;
        var $currElement;
        var $range1TargetElement;
        var $range2TargetElement;

        // Rationale: Since the correct content document for this CFI is already being passed, we can skip to the beginning 
        //   of the indirection step that referenced the content document.
        // Note: This assumes that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
        indirectionStepNum = this.getFirstIndirectionStepNum(CFIAST);
        indirectionNode = CFIAST.cfiString.localPath.steps[indirectionStepNum];
        indirectionNode.type = "indexStep";

        // Interpret the rest of the steps in the first local path
        $currElement = this.interpretLocalPath(CFIAST.cfiString.localPath, indirectionStepNum, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the first range local_path
        $range1TargetElement = this.interpretLocalPath(CFIAST.cfiString.range1, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);
        $range1TargetElement = this.interpretTextTerminusNode(CFIAST.cfiString.range1.termStep, $range1TargetElement, startElementToInject);

        // Interpret the second range local_path
        $range2TargetElement = this.interpretLocalPath(CFIAST.cfiString.range2, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);
        $range2TargetElement = this.interpretTextTerminusNode(CFIAST.cfiString.range2.termStep, $range2TargetElement, endElementToInject);

        // Return the element that was injected into
        return {
            startElement : $range1TargetElement[0],
            endElement : $range2TargetElement[0]
        };
    },

    // Description: This method will return the element or node (say, a text node) that is the final target of the 
    //   the CFI.
    getTargetElement : function (CFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(CFI);
        var CFIAST = cfiParser.parse(decodedCFI);
        var indirectionNode;
        var indirectionStepNum;
        var $currElement;
        
        // Rationale: Since the correct content document for this CFI is already being passed, we can skip to the beginning 
        //   of the indirection step that referenced the content document.
        // Note: This assumes that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
        indirectionStepNum = this.getFirstIndirectionStepNum(CFIAST);
        indirectionNode = CFIAST.cfiString.localPath.steps[indirectionStepNum];
        indirectionNode.type = "indexStep";

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString.localPath, indirectionStepNum, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Return the element at the end of the CFI
        return $currElement;
    },

    // Description: This method will return the start and end elements (along with their char offsets) that are the final targets of the range CFI.
    getRangeTargetElements : function (rangeCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(rangeCFI);
        var CFIAST = cfiParser.parse(decodedCFI);
        var indirectionNode;
        var indirectionStepNum;
        var $currElement;
        var $range1TargetElement;
        var $range2TargetElement;
        
        // Rationale: Since the correct content document for this CFI is already being passed, we can skip to the beginning 
        //   of the indirection step that referenced the content document.
        // Note: This assumes that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
        indirectionStepNum = this.getFirstIndirectionStepNum(CFIAST);
        indirectionNode = CFIAST.cfiString.localPath.steps[indirectionStepNum];
        indirectionNode.type = "indexStep";

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString.localPath, indirectionStepNum, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Interpret first range local_path
        $range1TargetElement = this.interpretLocalPath(CFIAST.cfiString.range1, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Interpret second range local_path
        $range2TargetElement = this.interpretLocalPath(CFIAST.cfiString.range2, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Get the start and end character offsets
        var startOffset = parseInt(CFIAST.cfiString.range1.termStep.offsetValue) || undefined;
        var endOffset = parseInt(CFIAST.cfiString.range2.termStep.offsetValue) || undefined;

        // Return the element (and char offsets) at the end of the CFI
        return {
            startElement: $range1TargetElement[0],
            startOffset: startOffset,
            endElement: $range2TargetElement[0],
            endOffset: endOffset
        };
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
        var CFIAST = cfiParser.parse(decodedCFI);
        var indirectionNode;
        
        // Interpret the path node 
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString.localPath, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);

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
        var CFIAST = cfiParser.parse(decodedCFI);
        var indirectionNode;
        var textOffset;
        
        // Interpret the path node 
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString.localPath, 0, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Return the element at the end of the CFI
        textOffset = parseInt(CFIAST.cfiString.localPath.termStep.offsetValue);
        return { textNode : $currElement,
                 textOffset : textOffset
            };
    },
    // Description: This function will determine if the input CFI is expressed as a range
    isRangeCfi: function (cfi) {
        var CFIAST = cfiParser.parse(cfi);
        return CFIAST.cfiString.range1 ? true : false;
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
    //   starting step... probably a good idea, this would make the meaning of this method clearer.
    interpretLocalPath : function (localPathNode, startStepNum, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        var stepNum = startStepNum;
        var nextStepNode;
        for (stepNum; stepNum <= localPathNode.steps.length - 1 ; stepNum++) {
        
            nextStepNode = localPathNode.steps[stepNum];
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

            throw cfiRuntimeErrors.NodeTypeError(indexStepNode, "expected index step node");
        }

        // Index step
        var $stepTarget = cfiInstructions.getNextNode(indexStepNode.stepLength, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Check the id assertion, if it exists
        if (indexStepNode.idAssertion) {

            if (!cfiInstructions.targetIdMatchesIdAssertion($stepTarget, indexStepNode.idAssertion)) {

                throw cfiRuntimeErrors.CFIAssertionError(indexStepNode.idAssertion, $stepTarget.attr('id'), "Id assertion failed");
            }
        }

        return $stepTarget;
    },

    interpretIndirectionStepNode : function (indirectionStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        // Check node type; throw error if wrong type
        if (indirectionStepNode === undefined || indirectionStepNode.type !== "indirectionStep") {

            throw cfiRuntimeErrors.NodeTypeError(indirectionStepNode, "expected indirection step node");
        }

        // Indirection step
        var $stepTarget = cfiInstructions.followIndirectionStep(
            indirectionStepNode.stepLength, 
            $currElement, 
            classBlacklist, 
            elementBlacklist);

        // Check the id assertion, if it exists
        if (indirectionStepNode.idAssertion) {

            if (!cfiInstructions.targetIdMatchesIdAssertion($stepTarget, indirectionStepNode.idAssertion)) {

                throw cfiRuntimeErrors.CFIAssertionError(indirectionStepNode.idAssertion, $stepTarget.attr('id'), "Id assertion failed");
            }
        }

        return $stepTarget;
    },

    // REFACTORING CANDIDATE: The logic here assumes that a user will always want to use this terminus
    //   to inject content into the found node. This will not always be the case, and different types of interpretation
    //   are probably desired. 
    interpretTextTerminusNode : function (terminusNode, $currElement, elementToInject) {

        if (terminusNode === undefined || terminusNode.type !== "textTerminus") {

            throw cfiRuntimeErrors.NodeTypeError(terminusNode, "expected text terminus node");
        }

        var $injectedElement = cfiInstructions.textTermination(
            $currElement, 
            terminusNode.offsetValue, 
            elementToInject
            );

        return $injectedElement;
    },

    searchLocalPathForHref : function ($currElement, $packageDocument, localPathNode, classBlacklist, elementBlacklist, idBlacklist) {

        // Interpret the first local_path node, which is a set of steps and and a terminus condition
        var stepNum = 0;
        var nextStepNode;
        for (stepNum = 0 ; stepNum <= localPathNode.steps.length - 1 ; stepNum++) {
        
            nextStepNode = localPathNode.steps[stepNum];
            if (nextStepNode.type === "indexStep") {
                
                $currElement = this.interpretIndexStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }
            else if (nextStepNode.type === "indirectionStep") {

                $currElement = this.interpretIndirectionStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }

            // Found the content document href referenced by the spine item 
            if ($currElement.is("itemref")) {

                return cfiInstructions.retrieveItemRefHref($currElement, $packageDocument);
            }
        }

        return undefined;
    }
};

return obj;
}










if (typeof define == 'function' && typeof define.amd == 'object') {
    console.log("RequireJS ... cfi_interpreter");
    
    define('cfi_interpreter',['jquery', './cfi_parser', './cfi_instructions', './cfi_runtime_errors'],
    function ($, cfiParser, cfiInstructions, cfiRuntimeErrors) {
        return init($, cfiParser, cfiInstructions, cfiRuntimeErrors);
    });
} else {
    console.log("!RequireJS ... cfi_interpreter");
    
    if (!global["EPUBcfi"]) {
        throw new Error("EPUBcfi not initialised on global object?! (window or this context)");
    }
    global.EPUBcfi.Interpreter = 
    init($,
        global.EPUBcfi.Parser,
        global.EPUBcfi.CFIInstructions,
        {
            NodeTypeError: global.EPUBcfi.NodeTypeError,
            OutOfRangeError: global.EPUBcfi.OutOfRangeError,
            TerminusError: global.EPUBcfi.TerminusError,
            CFIAssertionError: global.EPUBcfi.CFIAssertionError
        });
}

})(typeof window !== "undefined" ? window : this);

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

(function(global) {

var init = function($, cfiInstructions, cfiRuntimeErrors) {
    
    if (typeof cfiInstructions === "undefined") {
        throw new Error("UNDEFINED?! cfiInstructions");
    }
    
    if (typeof cfiRuntimeErrors === "undefined") {
        throw new Error("UNDEFINED?! cfiRuntimeErrors");
    }
    
var obj = {

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    generateCharOffsetRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
        var document = rangeStartElement.ownerDocument;

        var docRange;
        var commonAncestor;
        var $rangeStartParent;
        var $rangeEndParent;
        var range1OffsetStep;
        var range1CFI;
        var range2OffsetStep;
        var range2CFI;
        var commonCFIComponent;

        this.validateStartTextNode(rangeStartElement);
        this.validateStartTextNode(rangeEndElement);

        // Parent element is the same
        if ($(rangeStartElement).parent()[0] === $(rangeEndElement).parent()[0]) {
            range1OffsetStep = this.createCFITextNodeStep($(rangeStartElement), startOffset, classBlacklist, elementBlacklist, idBlacklist);
            range2OffsetStep = this.createCFITextNodeStep($(rangeEndElement), endOffset, classBlacklist, elementBlacklist, idBlacklist);          
            commonCFIComponent = this.createCFIElementSteps($(rangeStartElement).parent(), "html", classBlacklist, elementBlacklist, idBlacklist);
            return commonCFIComponent.substring(1, commonCFIComponent.length) + "," + range1OffsetStep + "," + range2OffsetStep;
        }
        else {

            // Create a document range to find the common ancestor
            docRange = document.createRange();
            docRange.setStart(rangeStartElement, startOffset);
            docRange.setEnd(rangeEndElement, endOffset);
            commonAncestor = docRange.commonAncestorContainer;

            // Generate terminating offset and range 1
            range1OffsetStep = this.createCFITextNodeStep($(rangeStartElement), startOffset, classBlacklist, elementBlacklist, idBlacklist);
            $rangeStartParent = $(rangeStartElement).parent();
            if ($rangeStartParent[0] === commonAncestor) {
              // rangeStartElement is a text child node of the commonAncestor, so it's CFI sub-path is only the text node step:
              range1CFI = range1OffsetStep;
            } else {
              range1CFI = this.createCFIElementSteps($rangeStartParent, commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range1OffsetStep;
            }

            // Generate terminating offset and range 2
            range2OffsetStep = this.createCFITextNodeStep($(rangeEndElement), endOffset, classBlacklist, elementBlacklist, idBlacklist);
            $rangeEndParent = $(rangeEndElement).parent();
            if ($rangeEndParent[0] === commonAncestor) {
              // rangeEndElement is a text child node of the commonAncestor, so it's CFI sub-path is only the text node step:
              range2CFI = range2OffsetStep;
            } else {
              range2CFI = this.createCFIElementSteps($rangeEndParent, commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range2OffsetStep;
            }

            // Generate shared component
            commonCFIComponent = this.createCFIElementSteps($(commonAncestor), "html", classBlacklist, elementBlacklist, idBlacklist);

            // Return the result
            return commonCFIComponent.substring(1, commonCFIComponent.length) + "," + range1CFI + "," + range2CFI;
        }
    },

    generateElementRangeComponent : function (rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist) {
        var document = rangeStartElement.ownerDocument;

        var docRange;
        var commonAncestor;
        var range1CFI;
        var range2CFI;
        var commonCFIComponent;

        this.validateStartElement(rangeStartElement);
        this.validateStartElement(rangeEndElement);

        if (rangeStartElement === rangeEndElement) {
            throw new Error("Start and end element cannot be the same for a CFI range");
        }

        // Create a document range to find the common ancestor
        docRange = document.createRange();
        docRange.setStart(rangeStartElement, 0);
        docRange.setEnd(rangeEndElement, rangeEndElement.childNodes.length);
        commonAncestor = docRange.commonAncestorContainer;

        // Generate range 1
        range1CFI = this.createCFIElementSteps($(rangeStartElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);

        // Generate range 2
        range2CFI = this.createCFIElementSteps($(rangeEndElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);

        // Generate shared component
        commonCFIComponent = this.createCFIElementSteps($(commonAncestor), "html", classBlacklist, elementBlacklist, idBlacklist);

        // Return the result
        return commonCFIComponent.substring(1, commonCFIComponent.length) + "," + range1CFI + "," + range2CFI;
    },

    generateRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
        var document = rangeStartElement.ownerDocument;

        if(rangeStartElement.nodeType === Node.ELEMENT_NODE && rangeEndElement.nodeType === Node.ELEMENT_NODE){
            return this.generateElementRangeComponent(rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist);
        } else if(rangeStartElement.nodeType === Node.TEXT_NODE && rangeEndElement.nodeType === Node.TEXT_NODE){
            return this.generateCharOffsetRangeComponent(rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist);
        } else {
            var docRange;
            var range1CFI;
            var range1OffsetStep;
            var range2CFI;
            var range2OffsetStep;
            var commonAncestor;
            var commonCFIComponent;

            // Create a document range to find the common ancestor
            docRange = document.createRange();
            docRange.setStart(rangeStartElement, startOffset);
            docRange.setEnd(rangeEndElement, endOffset);
            commonAncestor = docRange.commonAncestorContainer;

            if(rangeStartElement.nodeType === Node.ELEMENT_NODE){
                this.validateStartElement(rangeStartElement);
                range1CFI = this.createCFIElementSteps($(rangeStartElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);
            } else {
                this.validateStartTextNode(rangeStartElement);
                // Generate terminating offset and range 1
                range1OffsetStep = this.createCFITextNodeStep($(rangeStartElement), startOffset, classBlacklist, elementBlacklist, idBlacklist);
                if($(rangeStartElement).parent().is(commonAncestor)){
                    range1CFI = range1OffsetStep;
                } else {
                    range1CFI = this.createCFIElementSteps($(rangeStartElement).parent(), commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range1OffsetStep;    
                }
            }

            if(rangeEndElement.nodeType === Node.ELEMENT_NODE){
                this.validateStartElement(rangeEndElement);
                range2CFI = this.createCFIElementSteps($(rangeEndElement), commonAncestor, classBlacklist, elementBlacklist, idBlacklist);
            } else {
                this.validateStartTextNode(rangeEndElement);
                // Generate terminating offset and range 2
                range2OffsetStep = this.createCFITextNodeStep($(rangeEndElement), endOffset, classBlacklist, elementBlacklist, idBlacklist);
                if($(rangeEndElement).parent().is(commonAncestor)){
                    range2CFI = range2OffsetStep;
                } else {
                    range2CFI = this.createCFIElementSteps($(rangeEndElement).parent(), commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range2OffsetStep;    
                }                
            }

            // Generate shared component
            commonCFIComponent = this.createCFIElementSteps($(commonAncestor), "html", classBlacklist, elementBlacklist, idBlacklist);

            // Return the result
            return commonCFIComponent.substring(1, commonCFIComponent.length) + "," + range1CFI + "," + range2CFI;
        }
    },

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

        this.validateStartElement(startElement);

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

    generatePackageDocumentCFIComponentWithSpineIndex : function (spineIndex, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        // Get the start node (itemref element) that references the content document
        $itemRefStartNode = $($("spine", packageDocument).children()[spineIndex]);

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
            throw new cfiRuntimeErrors.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        } else if (startTextNode.nodeType != 3) {
            throw new cfiRuntimeErrors.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        }

        // Check that the character offset is within a valid range for the text node supplied
        if (characterOffset < 0) {
            throw new cfiRuntimeErrors.OutOfRangeError(characterOffset, 0, "Character offset cannot be less than 0");
        }
        else if (characterOffset > startTextNode.nodeValue.length) {
            throw new cfiRuntimeErrors.OutOfRangeError(characterOffset, startTextNode.nodeValue.length - 1, "character offset cannot be greater than the length of the text node");
        }
    },

    validateStartElement : function (startElement) {

        if (!startElement) {
            throw new cfiRuntimeErrors.NodeTypeError(startElement, "CFI target element is undefined");
        }

        if (!(startElement.nodeType && startElement.nodeType === 1)) {
            throw new cfiRuntimeErrors.NodeTypeError(startElement, "CFI target element is not an HTML element");
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

    // Description: Creates a CFI terminating step to a text node, with a character offset
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
        $contentsExcludingMarkers = cfiInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node index in the parent list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var indexOfFirstInSequence;
        var textNodeOnlyIndex = 0;
        var characterOffsetSinceUnsplit = 0;
        var finalCharacterOffsetInSequence = 0;
        $.each($contentsExcludingMarkers, 
            function (index) {

            // If this is a text node, check if it matches and return the current index
            if (this.nodeType === Node.TEXT_NODE || !prevNodeWasTextNode) {

                if (this.nodeType === Node.TEXT_NODE) {
                    if (this === $startTextNode[0]) {

                        // Set index as the first in the adjacent sequence of text nodes, or as the index of the current node if this 
                        //   node is a standard one sandwiched between two element nodes. 
                        if (prevNodeWasTextNode) {
                            indexOfTextNode = indexOfFirstInSequence;
                            finalCharacterOffsetInSequence = characterOffsetSinceUnsplit;
                        } else {
                            indexOfTextNode = textNodeOnlyIndex;
                        }
                        
                        // Break out of .each loop
                        return false; 
                    }

                    // Save this index as the first in sequence of adjacent text nodes, if it is not already set by this point
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length;
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                        textNodeOnlyIndex = textNodeOnlyIndex + 1;
                    }
                } else if (this.nodeType === Node.ELEMENT_NODE) {
                    textNodeOnlyIndex = textNodeOnlyIndex + 1;
                } else if (this.nodeType === Node.COMMENT_NODE) {
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length + 7; // 7 is the size of the html comment tag <!--[comment]-->
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                    }
                } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.data.length + this.target.length + 5; // 5 is the size of the instruction processing tag including the required space between the target and the data <?[target] [data]?>
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                    }
                }
            }
            // This node is not a text node
            else if (this.nodeType === Node.ELEMENT_NODE) {
                prevNodeWasTextNode = false;
                indexOfFirstInSequence = undefined;
                characterOffsetSinceUnsplit  = 0;
            } else if (this.nodeType === Node.COMMENT_NODE) {
                characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length + 7; // <!--[comment]-->
            } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
                characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.data.length + this.target.length + 5; // <?[target] [data]?>
            }
        });

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
        return "/" + CFIIndex + ":" + (finalCharacterOffsetInSequence + characterOffset);
         // + "[" + preAssertion + "," + postAssertion + "]";
    },

    createCFIElementSteps : function ($currNode, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) {

        var $blacklistExcluded;
        var $parentNode;
        var currNodePosition;
        var CFIPosition;
        var idAssertion;
        var elementStep; 



        // per https://github.com/readium/readium-cfi-js/issues/28
        // if the currentNode is the same as top level element, we're looking at a text node 
        // that's a direct child of "topLevelElement" so we don't need to include it in the element step.
        if ($currNode[0] === topLevelElement) {
            return "";
        }

        // Find position of current node in parent list
        $blacklistExcluded = cfiInstructions.applyBlacklist($currNode.parent().children(), classBlacklist, elementBlacklist, idBlacklist);
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

return obj;
}







if (typeof define == 'function' && typeof define.amd == 'object') {
    console.log("RequireJS ... cfi_generator");
    
    define('cfi_generator',['jquery', './cfi_instructions', './cfi_runtime_errors'],
    function ($, cfiInstructions, cfiRuntimeErrors) {
        return init($, cfiInstructions, cfiRuntimeErrors);
    });
} else {
    console.log("!RequireJS ... cfi_generator");
    
    if (!global["EPUBcfi"]) {
        throw new Error("EPUBcfi not initialised on global object?! (window or this context)");
    }
    global.EPUBcfi.Generator = 
    init($,
        global.EPUBcfi.CFIInstructions,
        {
            NodeTypeError: global.EPUBcfi.NodeTypeError,
            OutOfRangeError: global.EPUBcfi.OutOfRangeError,
            TerminusError: global.EPUBcfi.TerminusError,
            CFIAssertionError: global.EPUBcfi.CFIAssertionError
        });
}

})(typeof window !== "undefined" ? window : this);

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

(function(global) {

var init = function(cfiParser, cfiInterpreter, cfiInstructions, cfiRuntimeErrors, cfiGenerator) {
    
    if (typeof cfiParser === "undefined") {
        throw new Error("UNDEFINED?! cfiParser");
    }
    
    if (typeof cfiInterpreter === "undefined") {
        throw new Error("UNDEFINED?! cfiInterpreter");
    }
    
    if (typeof cfiInstructions === "undefined") {
        throw new Error("UNDEFINED?! cfiInstructions");
    }
    
    if (typeof cfiRuntimeErrors === "undefined") {
        throw new Error("UNDEFINED?! cfiRuntimeErrors");
    }
    
    if (typeof cfiGenerator === "undefined") {
        throw new Error("UNDEFINED?! cfiGenerator");
    }
    
    var obj = {
    
        getContentDocHref : function (CFI, packageDocument) {
            return cfiInterpreter.getContentDocHref(CFI, packageDocument);
        },
        injectElement : function (CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiInterpreter.injectElement(CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist);
        },
        getTargetElement : function (CFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiInterpreter.getTargetElement(CFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        getTargetElementWithPartialCFI : function (contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiInterpreter.getTargetElementWithPartialCFI(contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        injectRangeElements : function (rangeCFI, contentDocument, startElementToInject, endElementToInject, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiInterpreter.injectRangeElements(rangeCFI, contentDocument, startElementToInject, endElementToInject, classBlacklist, elementBlacklist, idBlacklist);
        },
        getRangeTargetElements : function (rangeCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiInterpreter.getRangeTargetElements(rangeCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        isRangeCfi : function (cfi) {
          return cfiInterpreter.isRangeCfi(cfi);
        },
        getTextTerminusInfoWithPartialCFI : function (contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiInterpreter.getTextTerminusInfoWithPartialCFI(contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateCharacterOffsetCFIComponent : function (startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generateCharacterOffsetCFIComponent(startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateElementCFIComponent : function (startElement, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generateElementCFIComponent(startElement, classBlacklist, elementBlacklist, idBlacklist);
        },
        generatePackageDocumentCFIComponent : function (contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generatePackageDocumentCFIComponent(contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generatePackageDocumentCFIComponentWithSpineIndex : function (spineIndex, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generatePackageDocumentCFIComponentWithSpineIndex(spineIndex, packageDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateCompleteCFI : function (packageDocumentCFIComponent, contentDocumentCFIComponent) {
            return cfiGenerator.generateCompleteCFI(packageDocumentCFIComponent, contentDocumentCFIComponent);
        },
        generateCharOffsetRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generateCharOffsetRangeComponent(rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateElementRangeComponent : function (rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generateElementRangeComponent(rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
            return cfiGenerator.generateRangeComponent(rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist);
        },
        injectElementAtOffset : function ($textNodeList, textOffset, elementToInject) {
            return cfiInstructions.injectCFIMarkerIntoText($textNodeList, textOffset, elementToInject);
        }
    };
    
    
    // TODO: remove global (should not be necessary in properly-configured RequireJS build!)
    // ...but we leave it here as a "legacy" mechanism to access the CFI lib functionality
    // -----
    obj.CFIInstructions = cfiInstructions;
    obj.Parser = cfiParser;
    obj.Interpreter = cfiInterpreter;
    obj.Generator = cfiGenerator;
    
    obj.NodeTypeError= cfiRuntimeErrors.NodeTypeError;
    obj.OutOfRangeError = cfiRuntimeErrors.OutOfRangeError;
    obj.TerminusError = cfiRuntimeErrors.TerminusError;
    obj.CFIAssertionError = cfiRuntimeErrors.CFIAssertionError;
    
    global.EPUBcfi = obj;
    // -----
    
    console.log("#######################################");
    // console.log(global.EPUBcfi);
    // console.log("#######################################");
    
    return obj;
}






if (typeof define == 'function' && typeof define.amd == 'object') {
    console.log("RequireJS ... cfi_API");
    
    define('cfi_API',['./cfi_parser', './cfi_interpreter', './cfi_instructions', './cfi_runtime_errors', './cfi_generator'],
    function (cfiParser, cfiInterpreter, cfiInstructions, cfiRuntimeErrors, cfiGenerator) {
        
        return init(cfiParser, cfiInterpreter, cfiInstructions, cfiRuntimeErrors, cfiGenerator);
    });
} else {
    console.log("!RequireJS ... cfi_API");
    
    if (!global["EPUBcfi"]) {
        throw new Error("EPUBcfi not initialised on global object?! (window or this context)");
    }
    
    init(global.EPUBcfi.Parser,
        global.EPUBcfi.Interpreter,
        global.EPUBcfi.CFIInstructions,
        {
            NodeTypeError: global.EPUBcfi.NodeTypeError,
            OutOfRangeError: global.EPUBcfi.OutOfRangeError,
            TerminusError: global.EPUBcfi.TerminusError,
            CFIAssertionError: global.EPUBcfi.CFIAssertionError
        },
        global.EPUBcfi.Generator);
}

})(typeof window !== "undefined" ? window : this);


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

define('readium-cfi-js',['cfi_API'], function (cfi) {
return cfi;
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

define('epubCfi',['readium-cfi-js'], function (cfi) {
return cfi;
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

define('epub-fetch/markup_parser',[],
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

define('epub-fetch/discover_content_type',['jquery', 'URIjs'], function ($, URI) {

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

define('epub-fetch/plain_resource_fetcher',['jquery', 'URIjs', './discover_content_type'], function ($, URI, ContentTypeDiscovery) {

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

/*
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function(obj) {
	"use strict";

	var ERR_BAD_FORMAT = "File format is not recognized.";
	var ERR_CRC = "CRC failed.";
	var ERR_ENCRYPTED = "File contains encrypted entry.";
	var ERR_ZIP64 = "File is using Zip64 (4gb+ file size).";
	var ERR_READ = "Error while reading zip file.";
	var ERR_WRITE = "Error while writing zip file.";
	var ERR_WRITE_DATA = "Error while writing file data.";
	var ERR_READ_DATA = "Error while reading file data.";
	var ERR_DUPLICATED_NAME = "File already exists.";
	var CHUNK_SIZE = 512 * 1024;
	
	var TEXT_PLAIN = "text/plain";

	var appendABViewSupported;
	try {
		appendABViewSupported = new Blob([ new DataView(new ArrayBuffer(0)) ]).size === 0;
	} catch (e) {
	}

	function Crc32() {
		this.crc = -1;
	}
	Crc32.prototype.append = function append(data) {
		var crc = this.crc | 0, table = this.table;
		for (var offset = 0, len = data.length | 0; offset < len; offset++)
			crc = (crc >>> 8) ^ table[(crc ^ data[offset]) & 0xFF];
		this.crc = crc;
	};
	Crc32.prototype.get = function get() {
		return ~this.crc;
	};
	Crc32.prototype.table = (function() {
		var i, j, t, table = []; // Uint32Array is actually slower than []
		for (i = 0; i < 256; i++) {
			t = i;
			for (j = 0; j < 8; j++)
				if (t & 1)
					t = (t >>> 1) ^ 0xEDB88320;
				else
					t = t >>> 1;
			table[i] = t;
		}
		return table;
	})();
	
	// "no-op" codec
	function NOOP() {}
	NOOP.prototype.append = function append(bytes, onprogress) {
		return bytes;
	};
	NOOP.prototype.flush = function flush() {};

	function blobSlice(blob, index, length) {
		if (index < 0 || length < 0 || index + length > blob.size)
			throw new RangeError('offset:' + index + ', length:' + length + ', size:' + blob.size);
		if (blob.slice)
			return blob.slice(index, index + length);
		else if (blob.webkitSlice)
			return blob.webkitSlice(index, index + length);
		else if (blob.mozSlice)
			return blob.mozSlice(index, index + length);
		else if (blob.msSlice)
			return blob.msSlice(index, index + length);
	}

	function getDataHelper(byteLength, bytes) {
		var dataBuffer, dataArray;
		dataBuffer = new ArrayBuffer(byteLength);
		dataArray = new Uint8Array(dataBuffer);
		if (bytes)
			dataArray.set(bytes, 0);
		return {
			buffer : dataBuffer,
			array : dataArray,
			view : new DataView(dataBuffer)
		};
	}

	// Readers
	function Reader() {
	}

	function TextReader(text) {
		var that = this, blobReader;

		function init(callback, onerror) {
			var blob = new Blob([ text ], {
				type : TEXT_PLAIN
			});
			blobReader = new BlobReader(blob);
			blobReader.init(function() {
				that.size = blobReader.size;
				callback();
			}, onerror);
		}

		function readUint8Array(index, length, callback, onerror) {
			blobReader.readUint8Array(index, length, callback, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	TextReader.prototype = new Reader();
	TextReader.prototype.constructor = TextReader;

	function Data64URIReader(dataURI) {
		var that = this, dataStart;

		function init(callback) {
			var dataEnd = dataURI.length;
			while (dataURI.charAt(dataEnd - 1) == "=")
				dataEnd--;
			dataStart = dataURI.indexOf(",") + 1;
			that.size = Math.floor((dataEnd - dataStart) * 0.75);
			callback();
		}

		function readUint8Array(index, length, callback) {
			var i, data = getDataHelper(length);
			var start = Math.floor(index / 3) * 4;
			var end = Math.ceil((index + length) / 3) * 4;
			var bytes = obj.atob(dataURI.substring(start + dataStart, end + dataStart));
			var delta = index - Math.floor(start / 4) * 3;
			for (i = delta; i < delta + length; i++)
				data.array[i - delta] = bytes.charCodeAt(i);
			callback(data.array);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	Data64URIReader.prototype = new Reader();
	Data64URIReader.prototype.constructor = Data64URIReader;

	function BlobReader(blob) {
		var that = this;

		function init(callback) {
			that.size = blob.size;
			callback();
		}

		function readUint8Array(index, length, callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(new Uint8Array(e.target.result));
			};
			reader.onerror = onerror;
			try {
				reader.readAsArrayBuffer(blobSlice(blob, index, length));
			} catch (e) {
				onerror(e);
			}
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	BlobReader.prototype = new Reader();
	BlobReader.prototype.constructor = BlobReader;

	// Writers

	function Writer() {
	}
	Writer.prototype.getData = function(callback) {
		callback(this.data);
	};

	function TextWriter(encoding) {
		var that = this, blob;

		function init(callback) {
			blob = new Blob([], {
				type : TEXT_PLAIN
			});
			callback();
		}

		function writeUint8Array(array, callback) {
			blob = new Blob([ blob, appendABViewSupported ? array : array.buffer ], {
				type : TEXT_PLAIN
			});
			callback();
		}

		function getData(callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(e.target.result);
			};
			reader.onerror = onerror;
			reader.readAsText(blob, encoding);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	TextWriter.prototype = new Writer();
	TextWriter.prototype.constructor = TextWriter;

	function Data64URIWriter(contentType) {
		var that = this, data = "", pending = "";

		function init(callback) {
			data += "data:" + (contentType || "") + ";base64,";
			callback();
		}

		function writeUint8Array(array, callback) {
			var i, delta = pending.length, dataString = pending;
			pending = "";
			for (i = 0; i < (Math.floor((delta + array.length) / 3) * 3) - delta; i++)
				dataString += String.fromCharCode(array[i]);
			for (; i < array.length; i++)
				pending += String.fromCharCode(array[i]);
			if (dataString.length > 2)
				data += obj.btoa(dataString);
			else
				pending = dataString;
			callback();
		}

		function getData(callback) {
			callback(data + obj.btoa(pending));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	Data64URIWriter.prototype = new Writer();
	Data64URIWriter.prototype.constructor = Data64URIWriter;

	function BlobWriter(contentType) {
		var data = [], that = this;

		function init(callback) {
			callback();
		}

		function writeUint8Array(array, callback) {
			data.push(appendABViewSupported ? array : array.buffer);
			callback();
		}

		function getData(callback) {
			callback(new Blob(data, {type: contentType}));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	BlobWriter.prototype = new Writer();
	BlobWriter.prototype.constructor = BlobWriter;

	/** 
	 * inflate/deflate core functions
	 * @param worker {Worker} web worker for the task.
	 * @param initialMessage {Object} initial message to be sent to the worker. should contain
	 *   sn(serial number for distinguishing multiple tasks sent to the worker), and codecClass.
	 *   This function may add more properties before sending.
	 */
	function launchWorkerProcess(worker, initialMessage, reader, writer, offset, size, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize, sn = initialMessage.sn, crc;

		function onflush() {
			worker.removeEventListener('message', onmessage, false);
			onend(outputSize, crc);
		}

		function onmessage(event) {
			var message = event.data, data = message.data, err = message.error;
			if (err) {
				err.toString = function () { return 'Error: ' + this.message; };
				onreaderror(err);
				return;
			}
			if (message.sn !== sn)
				return;
			if (typeof message.codecTime === 'number')
				worker.codecTime += message.codecTime; // should be before onflush()
			if (typeof message.crcTime === 'number')
				worker.crcTime += message.crcTime;

			switch (message.type) {
				case 'append':
					if (data) {
						outputSize += data.length;
						writer.writeUint8Array(data, function() {
							step();
						}, onwriteerror);
					} else
						step();
					break;
				case 'flush':
					crc = message.crc;
					if (data) {
						outputSize += data.length;
						writer.writeUint8Array(data, function() {
							onflush();
						}, onwriteerror);
					} else
						onflush();
					break;
				case 'progress':
					if (onprogress)
						onprogress(index + message.loaded, size);
					break;
				case 'importScripts': //no need to handle here
				case 'newTask':
				case 'echo':
					break;
				default:
					console.warn('zip.js:launchWorkerProcess: unknown message: ', message);
			}
		}

		function step() {
			index = chunkIndex * CHUNK_SIZE;
			if (index < size) {
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
					if (onprogress)
						onprogress(index, size);
					var msg = index === 0 ? initialMessage : {sn : sn};
					msg.type = 'append';
					msg.data = array;
					worker.postMessage(msg, [array.buffer]);
					chunkIndex++;
				}, onreaderror);
			} else {
				worker.postMessage({
					sn: sn,
					type: 'flush'
				});
			}
		}

		outputSize = 0;
		worker.addEventListener('message', onmessage, false);
		step();
	}

	function launchProcess(process, reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize = 0,
			crcInput = crcType === 'input',
			crcOutput = crcType === 'output',
			crc = new Crc32();
		function step() {
			var outputData;
			index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(inputData) {
					var outputData;
					try {
						outputData = process.append(inputData, function(loaded) {
							if (onprogress)
								onprogress(index + loaded, size);
						});
					} catch (e) {
						onreaderror(e);
						return;
					}
					if (outputData) {
						outputSize += outputData.length;
						writer.writeUint8Array(outputData, function() {
							chunkIndex++;
							setTimeout(step, 1);
						}, onwriteerror);
						if (crcOutput)
							crc.append(outputData);
					} else {
						chunkIndex++;
						setTimeout(step, 1);
					}
					if (crcInput)
						crc.append(inputData);
					if (onprogress)
						onprogress(index, size);
				}, onreaderror);
			else {
				try {
					outputData = process.flush();
				} catch (e) {
					onreaderror(e);
					return;
				}
				if (outputData) {
					if (crcOutput)
						crc.append(outputData);
					outputSize += outputData.length;
					writer.writeUint8Array(outputData, function() {
						onend(outputSize, crc.get());
					}, onwriteerror);
				} else
					onend(outputSize, crc.get());
			}
		}

		step();
	}

	function inflate(worker, sn, reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var crcType = computeCrc32 ? 'output' : 'none';
		if (obj.zip.useWebWorkers) {
			var initialMessage = {
				sn: sn,
				codecClass: 'Inflater',
				crcType: crcType,
			};
			launchWorkerProcess(worker, initialMessage, reader, writer, offset, size, onprogress, onend, onreaderror, onwriteerror);
		} else
			launchProcess(new obj.zip.Inflater(), reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror);
	}

	function deflate(worker, sn, reader, writer, level, onend, onprogress, onreaderror, onwriteerror) {
		var crcType = 'input';
		if (obj.zip.useWebWorkers) {
			var initialMessage = {
				sn: sn,
				options: {level: level},
				codecClass: 'Deflater',
				crcType: crcType,
			};
			launchWorkerProcess(worker, initialMessage, reader, writer, 0, reader.size, onprogress, onend, onreaderror, onwriteerror);
		} else
			launchProcess(new obj.zip.Deflater(), reader, writer, 0, reader.size, crcType, onprogress, onend, onreaderror, onwriteerror);
	}

	function copy(worker, sn, reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var crcType = 'input';
		if (obj.zip.useWebWorkers && computeCrc32) {
			var initialMessage = {
				sn: sn,
				codecClass: 'NOOP',
				crcType: crcType,
			};
			launchWorkerProcess(worker, initialMessage, reader, writer, offset, size, onprogress, onend, onreaderror, onwriteerror);
		} else
			launchProcess(new NOOP(), reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror);
	}

	// ZipReader

	function decodeASCII(str) {
		var i, out = "", charCode, extendedASCII = [ '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4', '\u00E0', '\u00E5', '\u00E7', '\u00EA', '\u00EB',
				'\u00E8', '\u00EF', '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6', '\u00C6', '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9',
				'\u00FF', '\u00D6', '\u00DC', '\u00F8', '\u00A3', '\u00D8', '\u00D7', '\u0192', '\u00E1', '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1',
				'\u00AA', '\u00BA', '\u00BF', '\u00AE', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB', '\u00BB', '_', '_', '_', '\u00A6', '\u00A6',
				'\u00C1', '\u00C2', '\u00C0', '\u00A9', '\u00A6', '\u00A6', '+', '+', '\u00A2', '\u00A5', '+', '+', '-', '-', '+', '-', '+', '\u00E3',
				'\u00C3', '+', '+', '-', '-', '\u00A6', '-', '+', '\u00A4', '\u00F0', '\u00D0', '\u00CA', '\u00CB', '\u00C8', 'i', '\u00CD', '\u00CE',
				'\u00CF', '+', '+', '_', '_', '\u00A6', '\u00CC', '_', '\u00D3', '\u00DF', '\u00D4', '\u00D2', '\u00F5', '\u00D5', '\u00B5', '\u00FE',
				'\u00DE', '\u00DA', '\u00DB', '\u00D9', '\u00FD', '\u00DD', '\u00AF', '\u00B4', '\u00AD', '\u00B1', '_', '\u00BE', '\u00B6', '\u00A7',
				'\u00F7', '\u00B8', '\u00B0', '\u00A8', '\u00B7', '\u00B9', '\u00B3', '\u00B2', '_', ' ' ];
		for (i = 0; i < str.length; i++) {
			charCode = str.charCodeAt(i) & 0xFF;
			if (charCode > 127)
				out += extendedASCII[charCode - 128];
			else
				out += String.fromCharCode(charCode);
		}
		return out;
	}

	function decodeUTF8(string) {
		return decodeURIComponent(escape(string));
	}

	function getString(bytes) {
		var i, str = "";
		for (i = 0; i < bytes.length; i++)
			str += String.fromCharCode(bytes[i]);
		return str;
	}

	function getDate(timeRaw) {
		var date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & 0x0000ffff;
		try {
			return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5,
					(time & 0x001F) * 2, 0);
		} catch (e) {
		}
	}

	function readCommonHeader(entry, data, index, centralDirectory, onerror) {
		entry.version = data.view.getUint16(index, true);
		entry.bitFlag = data.view.getUint16(index + 2, true);
		entry.compressionMethod = data.view.getUint16(index + 4, true);
		entry.lastModDateRaw = data.view.getUint32(index + 6, true);
		entry.lastModDate = getDate(entry.lastModDateRaw);
		if ((entry.bitFlag & 0x01) === 0x01) {
			onerror(ERR_ENCRYPTED);
			return;
		}
		if (centralDirectory || (entry.bitFlag & 0x0008) != 0x0008) {
			entry.crc32 = data.view.getUint32(index + 10, true);
			entry.compressedSize = data.view.getUint32(index + 14, true);
			entry.uncompressedSize = data.view.getUint32(index + 18, true);
		}
		if (entry.compressedSize === 0xFFFFFFFF || entry.uncompressedSize === 0xFFFFFFFF) {
			onerror(ERR_ZIP64);
			return;
		}
		entry.filenameLength = data.view.getUint16(index + 22, true);
		entry.extraFieldLength = data.view.getUint16(index + 24, true);
	}

	function createZipReader(reader, callback, onerror) {
		var inflateSN = 0;

		function Entry() {
		}

		Entry.prototype.getData = function(writer, onend, onprogress, checkCrc32) {
			var that = this;

			function testCrc32(crc32) {
				var dataCrc32 = getDataHelper(4);
				dataCrc32.view.setUint32(0, crc32);
				return that.crc32 == dataCrc32.view.getUint32(0);
			}

			function getWriterData(uncompressedSize, crc32) {
				if (checkCrc32 && !testCrc32(crc32))
					onerror(ERR_CRC);
				else
					writer.getData(function(data) {
						onend(data);
					});
			}

			function onreaderror(err) {
				onerror(err || ERR_READ_DATA);
			}

			function onwriteerror(err) {
				onerror(err || ERR_WRITE_DATA);
			}

			reader.readUint8Array(that.offset, 30, function(bytes) {
				var data = getDataHelper(bytes.length, bytes), dataOffset;
				if (data.view.getUint32(0) != 0x504b0304) {
					onerror(ERR_BAD_FORMAT);
					return;
				}
				readCommonHeader(that, data, 4, false, onerror);
				dataOffset = that.offset + 30 + that.filenameLength + that.extraFieldLength;
				writer.init(function() {
					if (that.compressionMethod === 0)
						copy(that._worker, inflateSN++, reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
					else
						inflate(that._worker, inflateSN++, reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
				}, onwriteerror);
			}, onreaderror);
		};

		function seekEOCDR(eocdrCallback) {
			// "End of central directory record" is the last part of a zip archive, and is at least 22 bytes long.
			// Zip file comment is the last part of EOCDR and has max length of 64KB,
			// so we only have to search the last 64K + 22 bytes of a archive for EOCDR signature (0x06054b50).
			var EOCDR_MIN = 22;
			if (reader.size < EOCDR_MIN) {
				onerror(ERR_BAD_FORMAT);
				return;
			}
			var ZIP_COMMENT_MAX = 256 * 256, EOCDR_MAX = EOCDR_MIN + ZIP_COMMENT_MAX;

			// In most cases, the EOCDR is EOCDR_MIN bytes long
			doSeek(EOCDR_MIN, function() {
				// If not found, try within EOCDR_MAX bytes
				doSeek(Math.min(EOCDR_MAX, reader.size), function() {
					onerror(ERR_BAD_FORMAT);
				});
			});

			// seek last length bytes of file for EOCDR
			function doSeek(length, eocdrNotFoundCallback) {
				reader.readUint8Array(reader.size - length, length, function(bytes) {
					for (var i = bytes.length - EOCDR_MIN; i >= 0; i--) {
						if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
							eocdrCallback(new DataView(bytes.buffer, i, EOCDR_MIN));
							return;
						}
					}
					eocdrNotFoundCallback();
				}, function() {
					onerror(ERR_READ);
				});
			}
		}

		var zipReader = {
			getEntries : function(callback) {
				var worker = this._worker;
				// look for End of central directory record
				seekEOCDR(function(dataView) {
					var datalength, fileslength;
					datalength = dataView.getUint32(16, true);
					fileslength = dataView.getUint16(8, true);
					if (datalength < 0 || datalength >= reader.size) {
						onerror(ERR_BAD_FORMAT);
						return;
					}
					reader.readUint8Array(datalength, reader.size - datalength, function(bytes) {
						var i, index = 0, entries = [], entry, filename, comment, data = getDataHelper(bytes.length, bytes);
						for (i = 0; i < fileslength; i++) {
							entry = new Entry();
							entry._worker = worker;
							if (data.view.getUint32(index) != 0x504b0102) {
								onerror(ERR_BAD_FORMAT);
								return;
							}
							readCommonHeader(entry, data, index + 6, true, onerror);
							entry.commentLength = data.view.getUint16(index + 32, true);
							entry.directory = ((data.view.getUint8(index + 38) & 0x10) == 0x10);
							entry.offset = data.view.getUint32(index + 42, true);
							filename = getString(data.array.subarray(index + 46, index + 46 + entry.filenameLength));
							entry.filename = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(filename) : decodeASCII(filename);
							if (!entry.directory && entry.filename.charAt(entry.filename.length - 1) == "/")
								entry.directory = true;
							comment = getString(data.array.subarray(index + 46 + entry.filenameLength + entry.extraFieldLength, index + 46
									+ entry.filenameLength + entry.extraFieldLength + entry.commentLength));
							entry.comment = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(comment) : decodeASCII(comment);
							entries.push(entry);
							index += 46 + entry.filenameLength + entry.extraFieldLength + entry.commentLength;
						}
						callback(entries);
					}, function() {
						onerror(ERR_READ);
					});
				});
			},
			close : function(callback) {
				if (this._worker) {
					this._worker.terminate();
					this._worker = null;
				}
				if (callback)
					callback();
			},
			_worker: null
		};

		if (!obj.zip.useWebWorkers)
			callback(zipReader);
		else {
			createWorker('inflater',
				function(worker) {
					zipReader._worker = worker;
					callback(zipReader);
				},
				function(err) {
					onerror(err);
				}
			);
		}
	}

	// ZipWriter

	function encodeUTF8(string) {
		return unescape(encodeURIComponent(string));
	}

	function getBytes(str) {
		var i, array = [];
		for (i = 0; i < str.length; i++)
			array.push(str.charCodeAt(i));
		return array;
	}

	function createZipWriter(writer, callback, onerror, dontDeflate) {
		var files = {}, filenames = [], datalength = 0;
		var deflateSN = 0;

		function onwriteerror(err) {
			onerror(err || ERR_WRITE);
		}

		function onreaderror(err) {
			onerror(err || ERR_READ_DATA);
		}

		var zipWriter = {
			add : function(name, reader, onend, onprogress, options) {
				var header, filename, date;
				var worker = this._worker;

				function writeHeader(callback) {
					var data;
					date = options.lastModDate || new Date();
					header = getDataHelper(26);
					files[name] = {
						headerArray : header.array,
						directory : options.directory,
						filename : filename,
						offset : datalength,
						comment : getBytes(encodeUTF8(options.comment || ""))
					};
					header.view.setUint32(0, 0x14000808);
					if (options.version)
						header.view.setUint8(0, options.version);
					if (!dontDeflate && options.level !== 0 && !options.directory)
						header.view.setUint16(4, 0x0800);
					header.view.setUint16(6, (((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2, true);
					header.view.setUint16(8, ((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate(), true);
					header.view.setUint16(22, filename.length, true);
					data = getDataHelper(30 + filename.length);
					data.view.setUint32(0, 0x504b0304);
					data.array.set(header.array, 4);
					data.array.set(filename, 30);
					datalength += data.array.length;
					writer.writeUint8Array(data.array, callback, onwriteerror);
				}

				function writeFooter(compressedLength, crc32) {
					var footer = getDataHelper(16);
					datalength += compressedLength || 0;
					footer.view.setUint32(0, 0x504b0708);
					if (typeof crc32 != "undefined") {
						header.view.setUint32(10, crc32, true);
						footer.view.setUint32(4, crc32, true);
					}
					if (reader) {
						footer.view.setUint32(8, compressedLength, true);
						header.view.setUint32(14, compressedLength, true);
						footer.view.setUint32(12, reader.size, true);
						header.view.setUint32(18, reader.size, true);
					}
					writer.writeUint8Array(footer.array, function() {
						datalength += 16;
						onend();
					}, onwriteerror);
				}

				function writeFile() {
					options = options || {};
					name = name.trim();
					if (options.directory && name.charAt(name.length - 1) != "/")
						name += "/";
					if (files.hasOwnProperty(name)) {
						onerror(ERR_DUPLICATED_NAME);
						return;
					}
					filename = getBytes(encodeUTF8(name));
					filenames.push(name);
					writeHeader(function() {
						if (reader)
							if (dontDeflate || options.level === 0)
								copy(worker, deflateSN++, reader, writer, 0, reader.size, true, writeFooter, onprogress, onreaderror, onwriteerror);
							else
								deflate(worker, deflateSN++, reader, writer, options.level, writeFooter, onprogress, onreaderror, onwriteerror);
						else
							writeFooter();
					}, onwriteerror);
				}

				if (reader)
					reader.init(writeFile, onreaderror);
				else
					writeFile();
			},
			close : function(callback) {
				if (this._worker) {
					this._worker.terminate();
					this._worker = null;
				}

				var data, length = 0, index = 0, indexFilename, file;
				for (indexFilename = 0; indexFilename < filenames.length; indexFilename++) {
					file = files[filenames[indexFilename]];
					length += 46 + file.filename.length + file.comment.length;
				}
				data = getDataHelper(length + 22);
				for (indexFilename = 0; indexFilename < filenames.length; indexFilename++) {
					file = files[filenames[indexFilename]];
					data.view.setUint32(index, 0x504b0102);
					data.view.setUint16(index + 4, 0x1400);
					data.array.set(file.headerArray, index + 6);
					data.view.setUint16(index + 32, file.comment.length, true);
					if (file.directory)
						data.view.setUint8(index + 38, 0x10);
					data.view.setUint32(index + 42, file.offset, true);
					data.array.set(file.filename, index + 46);
					data.array.set(file.comment, index + 46 + file.filename.length);
					index += 46 + file.filename.length + file.comment.length;
				}
				data.view.setUint32(index, 0x504b0506);
				data.view.setUint16(index + 8, filenames.length, true);
				data.view.setUint16(index + 10, filenames.length, true);
				data.view.setUint32(index + 12, length, true);
				data.view.setUint32(index + 16, datalength, true);
				writer.writeUint8Array(data.array, function() {
					writer.getData(callback);
				}, onwriteerror);
			},
			_worker: null
		};

		if (!obj.zip.useWebWorkers)
			callback(zipWriter);
		else {
			createWorker('deflater',
				function(worker) {
					zipWriter._worker = worker;
					callback(zipWriter);
				},
				function(err) {
					onerror(err);
				}
			);
		}
	}

	function resolveURLs(urls) {
		var a = document.createElement('a');
		return urls.map(function(url) {
			a.href = url;
			return a.href;
		});
	}

	var DEFAULT_WORKER_SCRIPTS = {
		deflater: ['z-worker.js', 'deflate.js'],
		inflater: ['z-worker.js', 'inflate.js']
	};
	function createWorker(type, callback, onerror) {
		if (obj.zip.workerScripts !== null && obj.zip.workerScriptsPath !== null) {
			onerror(new Error('Either zip.workerScripts or zip.workerScriptsPath may be set, not both.'));
			return;
		}
		var scripts;
		if (obj.zip.workerScripts) {
			scripts = obj.zip.workerScripts[type];
			if (!Array.isArray(scripts)) {
				onerror(new Error('zip.workerScripts.' + type + ' is not an array!'));
				return;
			}
			scripts = resolveURLs(scripts);
		} else {
			scripts = DEFAULT_WORKER_SCRIPTS[type].slice(0);
			scripts[0] = (obj.zip.workerScriptsPath || '') + scripts[0];
		}
		var worker = new Worker(scripts[0]);
		// record total consumed time by inflater/deflater/crc32 in this worker
		worker.codecTime = worker.crcTime = 0;
		worker.postMessage({ type: 'importScripts', scripts: scripts.slice(1) });
		worker.addEventListener('message', onmessage);
		function onmessage(ev) {
			var msg = ev.data;
			if (msg.error) {
				worker.terminate(); // should before onerror(), because onerror() may throw.
				onerror(msg.error);
				return;
			}
			if (msg.type === 'importScripts') {
				worker.removeEventListener('message', onmessage);
				worker.removeEventListener('error', errorHandler);
				callback(worker);
			}
		}
		// catch entry script loading error and other unhandled errors
		worker.addEventListener('error', errorHandler);
		function errorHandler(err) {
			worker.terminate();
			onerror(err);
		}
	}

	function onerror_default(error) {
		console.error(error);
	}
	obj.zip = {
		Reader : Reader,
		Writer : Writer,
		BlobReader : BlobReader,
		Data64URIReader : Data64URIReader,
		TextReader : TextReader,
		BlobWriter : BlobWriter,
		Data64URIWriter : Data64URIWriter,
		TextWriter : TextWriter,
		createReader : function(reader, callback, onerror) {
			onerror = onerror || onerror_default;

			reader.init(function() {
				createZipReader(reader, callback, onerror);
			}, onerror);
		},
		createWriter : function(writer, callback, onerror, dontDeflate) {
			onerror = onerror || onerror_default;
			dontDeflate = !!dontDeflate;

			writer.init(function() {
				createZipWriter(writer, callback, onerror, dontDeflate);
			}, onerror);
		},
		useWebWorkers : true,
		/**
		 * Directory containing the default worker scripts (z-worker.js, deflate.js, and inflate.js), relative to current base url.
		 * E.g.: zip.workerScripts = './';
		 */
		workerScriptsPath : null,
		/**
		 * Advanced option to control which scripts are loaded in the Web worker. If this option is specified, then workerScriptsPath must not be set.
		 * workerScripts.deflater/workerScripts.inflater should be arrays of urls to scripts for deflater/inflater, respectively.
		 * Scripts in the array are executed in order, and the first one should be z-worker.js, which is used to start the worker.
		 * All urls are relative to current base url.
		 * E.g.:
		 * zip.workerScripts = {
		 *   deflater: ['z-worker.js', 'deflate.js'],
		 *   inflater: ['z-worker.js', 'inflate.js']
		 * };
		 */
		workerScripts : null,
	};

})(this);

define("zip", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.zip;
    };
}(this)));

/*
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {
	"use strict";
	var table = {
		"application" : {
			"andrew-inset" : "ez",
			"annodex" : "anx",
			"atom+xml" : "atom",
			"atomcat+xml" : "atomcat",
			"atomserv+xml" : "atomsrv",
			"bbolin" : "lin",
			"cap" : [ "cap", "pcap" ],
			"cu-seeme" : "cu",
			"davmount+xml" : "davmount",
			"dsptype" : "tsp",
			"ecmascript" : [ "es", "ecma" ],
			"futuresplash" : "spl",
			"hta" : "hta",
			"java-archive" : "jar",
			"java-serialized-object" : "ser",
			"java-vm" : "class",
			"javascript" : "js",
			"m3g" : "m3g",
			"mac-binhex40" : "hqx",
			"mathematica" : [ "nb", "ma", "mb" ],
			"msaccess" : "mdb",
			"msword" : [ "doc", "dot" ],
			"mxf" : "mxf",
			"oda" : "oda",
			"ogg" : "ogx",
			"pdf" : "pdf",
			"pgp-keys" : "key",
			"pgp-signature" : [ "asc", "sig" ],
			"pics-rules" : "prf",
			"postscript" : [ "ps", "ai", "eps", "epsi", "epsf", "eps2", "eps3" ],
			"rar" : "rar",
			"rdf+xml" : "rdf",
			"rss+xml" : "rss",
			"rtf" : "rtf",
			"smil" : [ "smi", "smil" ],
			"xhtml+xml" : [ "xhtml", "xht" ],
			"xml" : [ "xml", "xsl", "xsd" ],
			"xspf+xml" : "xspf",
			"zip" : "zip",
			"vnd.android.package-archive" : "apk",
			"vnd.cinderella" : "cdy",
			"vnd.google-earth.kml+xml" : "kml",
			"vnd.google-earth.kmz" : "kmz",
			"vnd.mozilla.xul+xml" : "xul",
			"vnd.ms-excel" : [ "xls", "xlb", "xlt", "xlm", "xla", "xlc", "xlw" ],
			"vnd.ms-pki.seccat" : "cat",
			"vnd.ms-pki.stl" : "stl",
			"vnd.ms-powerpoint" : [ "ppt", "pps", "pot" ],
			"vnd.oasis.opendocument.chart" : "odc",
			"vnd.oasis.opendocument.database" : "odb",
			"vnd.oasis.opendocument.formula" : "odf",
			"vnd.oasis.opendocument.graphics" : "odg",
			"vnd.oasis.opendocument.graphics-template" : "otg",
			"vnd.oasis.opendocument.image" : "odi",
			"vnd.oasis.opendocument.presentation" : "odp",
			"vnd.oasis.opendocument.presentation-template" : "otp",
			"vnd.oasis.opendocument.spreadsheet" : "ods",
			"vnd.oasis.opendocument.spreadsheet-template" : "ots",
			"vnd.oasis.opendocument.text" : "odt",
			"vnd.oasis.opendocument.text-master" : "odm",
			"vnd.oasis.opendocument.text-template" : "ott",
			"vnd.oasis.opendocument.text-web" : "oth",
			"vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "xlsx",
			"vnd.openxmlformats-officedocument.spreadsheetml.template" : "xltx",
			"vnd.openxmlformats-officedocument.presentationml.presentation" : "pptx",
			"vnd.openxmlformats-officedocument.presentationml.slideshow" : "ppsx",
			"vnd.openxmlformats-officedocument.presentationml.template" : "potx",
			"vnd.openxmlformats-officedocument.wordprocessingml.document" : "docx",
			"vnd.openxmlformats-officedocument.wordprocessingml.template" : "dotx",
			"vnd.smaf" : "mmf",
			"vnd.stardivision.calc" : "sdc",
			"vnd.stardivision.chart" : "sds",
			"vnd.stardivision.draw" : "sda",
			"vnd.stardivision.impress" : "sdd",
			"vnd.stardivision.math" : [ "sdf", "smf" ],
			"vnd.stardivision.writer" : [ "sdw", "vor" ],
			"vnd.stardivision.writer-global" : "sgl",
			"vnd.sun.xml.calc" : "sxc",
			"vnd.sun.xml.calc.template" : "stc",
			"vnd.sun.xml.draw" : "sxd",
			"vnd.sun.xml.draw.template" : "std",
			"vnd.sun.xml.impress" : "sxi",
			"vnd.sun.xml.impress.template" : "sti",
			"vnd.sun.xml.math" : "sxm",
			"vnd.sun.xml.writer" : "sxw",
			"vnd.sun.xml.writer.global" : "sxg",
			"vnd.sun.xml.writer.template" : "stw",
			"vnd.symbian.install" : [ "sis", "sisx" ],
			"vnd.visio" : [ "vsd", "vst", "vss", "vsw" ],
			"vnd.wap.wbxml" : "wbxml",
			"vnd.wap.wmlc" : "wmlc",
			"vnd.wap.wmlscriptc" : "wmlsc",
			"vnd.wordperfect" : "wpd",
			"vnd.wordperfect5.1" : "wp5",
			"x-123" : "wk",
			"x-7z-compressed" : "7z",
			"x-abiword" : "abw",
			"x-apple-diskimage" : "dmg",
			"x-bcpio" : "bcpio",
			"x-bittorrent" : "torrent",
			"x-cbr" : [ "cbr", "cba", "cbt", "cb7" ],
			"x-cbz" : "cbz",
			"x-cdf" : [ "cdf", "cda" ],
			"x-cdlink" : "vcd",
			"x-chess-pgn" : "pgn",
			"x-cpio" : "cpio",
			"x-csh" : "csh",
			"x-debian-package" : [ "deb", "udeb" ],
			"x-director" : [ "dcr", "dir", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa" ],
			"x-dms" : "dms",
			"x-doom" : "wad",
			"x-dvi" : "dvi",
			"x-httpd-eruby" : "rhtml",
			"x-font" : "pcf.Z",
			"x-freemind" : "mm",
			"x-gnumeric" : "gnumeric",
			"x-go-sgf" : "sgf",
			"x-graphing-calculator" : "gcf",
			"x-gtar" : [ "gtar", "taz" ],
			"x-hdf" : "hdf",
			"x-httpd-php" : [ "phtml", "pht", "php" ],
			"x-httpd-php-source" : "phps",
			"x-httpd-php3" : "php3",
			"x-httpd-php3-preprocessed" : "php3p",
			"x-httpd-php4" : "php4",
			"x-httpd-php5" : "php5",
			"x-ica" : "ica",
			"x-info" : "info",
			"x-internet-signup" : [ "ins", "isp" ],
			"x-iphone" : "iii",
			"x-iso9660-image" : "iso",
			"x-java-jnlp-file" : "jnlp",
			"x-jmol" : "jmz",
			"x-killustrator" : "kil",
			"x-koan" : [ "skp", "skd", "skt", "skm" ],
			"x-kpresenter" : [ "kpr", "kpt" ],
			"x-kword" : [ "kwd", "kwt" ],
			"x-latex" : "latex",
			"x-lha" : "lha",
			"x-lyx" : "lyx",
			"x-lzh" : "lzh",
			"x-lzx" : "lzx",
			"x-maker" : [ "frm", "maker", "frame", "fm", "fb", "book", "fbdoc" ],
			"x-ms-wmd" : "wmd",
			"x-ms-wmz" : "wmz",
			"x-msdos-program" : [ "com", "exe", "bat", "dll" ],
			"x-msi" : "msi",
			"x-netcdf" : [ "nc", "cdf" ],
			"x-ns-proxy-autoconfig" : [ "pac", "dat" ],
			"x-nwc" : "nwc",
			"x-object" : "o",
			"x-oz-application" : "oza",
			"x-pkcs7-certreqresp" : "p7r",
			"x-python-code" : [ "pyc", "pyo" ],
			"x-qgis" : [ "qgs", "shp", "shx" ],
			"x-quicktimeplayer" : "qtl",
			"x-redhat-package-manager" : "rpm",
			"x-ruby" : "rb",
			"x-sh" : "sh",
			"x-shar" : "shar",
			"x-shockwave-flash" : [ "swf", "swfl" ],
			"x-silverlight" : "scr",
			"x-stuffit" : "sit",
			"x-sv4cpio" : "sv4cpio",
			"x-sv4crc" : "sv4crc",
			"x-tar" : "tar",
			"x-tcl" : "tcl",
			"x-tex-gf" : "gf",
			"x-tex-pk" : "pk",
			"x-texinfo" : [ "texinfo", "texi" ],
			"x-trash" : [ "~", "%", "bak", "old", "sik" ],
			"x-troff" : [ "t", "tr", "roff" ],
			"x-troff-man" : "man",
			"x-troff-me" : "me",
			"x-troff-ms" : "ms",
			"x-ustar" : "ustar",
			"x-wais-source" : "src",
			"x-wingz" : "wz",
			"x-x509-ca-cert" : [ "crt", "der", "cer" ],
			"x-xcf" : "xcf",
			"x-xfig" : "fig",
			"x-xpinstall" : "xpi",
			"applixware" : "aw",
			"atomsvc+xml" : "atomsvc",
			"ccxml+xml" : "ccxml",
			"cdmi-capability" : "cdmia",
			"cdmi-container" : "cdmic",
			"cdmi-domain" : "cdmid",
			"cdmi-object" : "cdmio",
			"cdmi-queue" : "cdmiq",
			"docbook+xml" : "dbk",
			"dssc+der" : "dssc",
			"dssc+xml" : "xdssc",
			"emma+xml" : "emma",
			"epub+zip" : "epub",
			"exi" : "exi",
			"font-tdpfr" : "pfr",
			"gml+xml" : "gml",
			"gpx+xml" : "gpx",
			"gxf" : "gxf",
			"hyperstudio" : "stk",
			"inkml+xml" : [ "ink", "inkml" ],
			"ipfix" : "ipfix",
			"json" : "json",
			"jsonml+json" : "jsonml",
			"lost+xml" : "lostxml",
			"mads+xml" : "mads",
			"marc" : "mrc",
			"marcxml+xml" : "mrcx",
			"mathml+xml" : "mathml",
			"mbox" : "mbox",
			"mediaservercontrol+xml" : "mscml",
			"metalink+xml" : "metalink",
			"metalink4+xml" : "meta4",
			"mets+xml" : "mets",
			"mods+xml" : "mods",
			"mp21" : [ "m21", "mp21" ],
			"mp4" : "mp4s",
			"oebps-package+xml" : "opf",
			"omdoc+xml" : "omdoc",
			"onenote" : [ "onetoc", "onetoc2", "onetmp", "onepkg" ],
			"oxps" : "oxps",
			"patch-ops-error+xml" : "xer",
			"pgp-encrypted" : "pgp",
			"pkcs10" : "p10",
			"pkcs7-mime" : [ "p7m", "p7c" ],
			"pkcs7-signature" : "p7s",
			"pkcs8" : "p8",
			"pkix-attr-cert" : "ac",
			"pkix-crl" : "crl",
			"pkix-pkipath" : "pkipath",
			"pkixcmp" : "pki",
			"pls+xml" : "pls",
			"prs.cww" : "cww",
			"pskc+xml" : "pskcxml",
			"reginfo+xml" : "rif",
			"relax-ng-compact-syntax" : "rnc",
			"resource-lists+xml" : "rl",
			"resource-lists-diff+xml" : "rld",
			"rls-services+xml" : "rs",
			"rpki-ghostbusters" : "gbr",
			"rpki-manifest" : "mft",
			"rpki-roa" : "roa",
			"rsd+xml" : "rsd",
			"sbml+xml" : "sbml",
			"scvp-cv-request" : "scq",
			"scvp-cv-response" : "scs",
			"scvp-vp-request" : "spq",
			"scvp-vp-response" : "spp",
			"sdp" : "sdp",
			"set-payment-initiation" : "setpay",
			"set-registration-initiation" : "setreg",
			"shf+xml" : "shf",
			"sparql-query" : "rq",
			"sparql-results+xml" : "srx",
			"srgs" : "gram",
			"srgs+xml" : "grxml",
			"sru+xml" : "sru",
			"ssdl+xml" : "ssdl",
			"ssml+xml" : "ssml",
			"tei+xml" : [ "tei", "teicorpus" ],
			"thraud+xml" : "tfi",
			"timestamped-data" : "tsd",
			"vnd.3gpp.pic-bw-large" : "plb",
			"vnd.3gpp.pic-bw-small" : "psb",
			"vnd.3gpp.pic-bw-var" : "pvb",
			"vnd.3gpp2.tcap" : "tcap",
			"vnd.3m.post-it-notes" : "pwn",
			"vnd.accpac.simply.aso" : "aso",
			"vnd.accpac.simply.imp" : "imp",
			"vnd.acucobol" : "acu",
			"vnd.acucorp" : [ "atc", "acutc" ],
			"vnd.adobe.air-application-installer-package+zip" : "air",
			"vnd.adobe.formscentral.fcdt" : "fcdt",
			"vnd.adobe.fxp" : [ "fxp", "fxpl" ],
			"vnd.adobe.xdp+xml" : "xdp",
			"vnd.adobe.xfdf" : "xfdf",
			"vnd.ahead.space" : "ahead",
			"vnd.airzip.filesecure.azf" : "azf",
			"vnd.airzip.filesecure.azs" : "azs",
			"vnd.amazon.ebook" : "azw",
			"vnd.americandynamics.acc" : "acc",
			"vnd.amiga.ami" : "ami",
			"vnd.anser-web-certificate-issue-initiation" : "cii",
			"vnd.anser-web-funds-transfer-initiation" : "fti",
			"vnd.antix.game-component" : "atx",
			"vnd.apple.installer+xml" : "mpkg",
			"vnd.apple.mpegurl" : "m3u8",
			"vnd.aristanetworks.swi" : "swi",
			"vnd.astraea-software.iota" : "iota",
			"vnd.audiograph" : "aep",
			"vnd.blueice.multipass" : "mpm",
			"vnd.bmi" : "bmi",
			"vnd.businessobjects" : "rep",
			"vnd.chemdraw+xml" : "cdxml",
			"vnd.chipnuts.karaoke-mmd" : "mmd",
			"vnd.claymore" : "cla",
			"vnd.cloanto.rp9" : "rp9",
			"vnd.clonk.c4group" : [ "c4g", "c4d", "c4f", "c4p", "c4u" ],
			"vnd.cluetrust.cartomobile-config" : "c11amc",
			"vnd.cluetrust.cartomobile-config-pkg" : "c11amz",
			"vnd.commonspace" : "csp",
			"vnd.contact.cmsg" : "cdbcmsg",
			"vnd.cosmocaller" : "cmc",
			"vnd.crick.clicker" : "clkx",
			"vnd.crick.clicker.keyboard" : "clkk",
			"vnd.crick.clicker.palette" : "clkp",
			"vnd.crick.clicker.template" : "clkt",
			"vnd.crick.clicker.wordbank" : "clkw",
			"vnd.criticaltools.wbs+xml" : "wbs",
			"vnd.ctc-posml" : "pml",
			"vnd.cups-ppd" : "ppd",
			"vnd.curl.car" : "car",
			"vnd.curl.pcurl" : "pcurl",
			"vnd.dart" : "dart",
			"vnd.data-vision.rdz" : "rdz",
			"vnd.dece.data" : [ "uvf", "uvvf", "uvd", "uvvd" ],
			"vnd.dece.ttml+xml" : [ "uvt", "uvvt" ],
			"vnd.dece.unspecified" : [ "uvx", "uvvx" ],
			"vnd.dece.zip" : [ "uvz", "uvvz" ],
			"vnd.denovo.fcselayout-link" : "fe_launch",
			"vnd.dna" : "dna",
			"vnd.dolby.mlp" : "mlp",
			"vnd.dpgraph" : "dpg",
			"vnd.dreamfactory" : "dfac",
			"vnd.ds-keypoint" : "kpxx",
			"vnd.dvb.ait" : "ait",
			"vnd.dvb.service" : "svc",
			"vnd.dynageo" : "geo",
			"vnd.ecowin.chart" : "mag",
			"vnd.enliven" : "nml",
			"vnd.epson.esf" : "esf",
			"vnd.epson.msf" : "msf",
			"vnd.epson.quickanime" : "qam",
			"vnd.epson.salt" : "slt",
			"vnd.epson.ssf" : "ssf",
			"vnd.eszigno3+xml" : [ "es3", "et3" ],
			"vnd.ezpix-album" : "ez2",
			"vnd.ezpix-package" : "ez3",
			"vnd.fdf" : "fdf",
			"vnd.fdsn.mseed" : "mseed",
			"vnd.fdsn.seed" : [ "seed", "dataless" ],
			"vnd.flographit" : "gph",
			"vnd.fluxtime.clip" : "ftc",
			"vnd.framemaker" : [ "fm", "frame", "maker", "book" ],
			"vnd.frogans.fnc" : "fnc",
			"vnd.frogans.ltf" : "ltf",
			"vnd.fsc.weblaunch" : "fsc",
			"vnd.fujitsu.oasys" : "oas",
			"vnd.fujitsu.oasys2" : "oa2",
			"vnd.fujitsu.oasys3" : "oa3",
			"vnd.fujitsu.oasysgp" : "fg5",
			"vnd.fujitsu.oasysprs" : "bh2",
			"vnd.fujixerox.ddd" : "ddd",
			"vnd.fujixerox.docuworks" : "xdw",
			"vnd.fujixerox.docuworks.binder" : "xbd",
			"vnd.fuzzysheet" : "fzs",
			"vnd.genomatix.tuxedo" : "txd",
			"vnd.geogebra.file" : "ggb",
			"vnd.geogebra.tool" : "ggt",
			"vnd.geometry-explorer" : [ "gex", "gre" ],
			"vnd.geonext" : "gxt",
			"vnd.geoplan" : "g2w",
			"vnd.geospace" : "g3w",
			"vnd.gmx" : "gmx",
			"vnd.grafeq" : [ "gqf", "gqs" ],
			"vnd.groove-account" : "gac",
			"vnd.groove-help" : "ghf",
			"vnd.groove-identity-message" : "gim",
			"vnd.groove-injector" : "grv",
			"vnd.groove-tool-message" : "gtm",
			"vnd.groove-tool-template" : "tpl",
			"vnd.groove-vcard" : "vcg",
			"vnd.hal+xml" : "hal",
			"vnd.handheld-entertainment+xml" : "zmm",
			"vnd.hbci" : "hbci",
			"vnd.hhe.lesson-player" : "les",
			"vnd.hp-hpgl" : "hpgl",
			"vnd.hp-hpid" : "hpid",
			"vnd.hp-hps" : "hps",
			"vnd.hp-jlyt" : "jlt",
			"vnd.hp-pcl" : "pcl",
			"vnd.hp-pclxl" : "pclxl",
			"vnd.hydrostatix.sof-data" : "sfd-hdstx",
			"vnd.ibm.minipay" : "mpy",
			"vnd.ibm.modcap" : [ "afp", "listafp", "list3820" ],
			"vnd.ibm.rights-management" : "irm",
			"vnd.ibm.secure-container" : "sc",
			"vnd.iccprofile" : [ "icc", "icm" ],
			"vnd.igloader" : "igl",
			"vnd.immervision-ivp" : "ivp",
			"vnd.immervision-ivu" : "ivu",
			"vnd.insors.igm" : "igm",
			"vnd.intercon.formnet" : [ "xpw", "xpx" ],
			"vnd.intergeo" : "i2g",
			"vnd.intu.qbo" : "qbo",
			"vnd.intu.qfx" : "qfx",
			"vnd.ipunplugged.rcprofile" : "rcprofile",
			"vnd.irepository.package+xml" : "irp",
			"vnd.is-xpr" : "xpr",
			"vnd.isac.fcs" : "fcs",
			"vnd.jam" : "jam",
			"vnd.jcp.javame.midlet-rms" : "rms",
			"vnd.jisp" : "jisp",
			"vnd.joost.joda-archive" : "joda",
			"vnd.kahootz" : [ "ktz", "ktr" ],
			"vnd.kde.karbon" : "karbon",
			"vnd.kde.kchart" : "chrt",
			"vnd.kde.kformula" : "kfo",
			"vnd.kde.kivio" : "flw",
			"vnd.kde.kontour" : "kon",
			"vnd.kde.kpresenter" : [ "kpr", "kpt" ],
			"vnd.kde.kspread" : "ksp",
			"vnd.kde.kword" : [ "kwd", "kwt" ],
			"vnd.kenameaapp" : "htke",
			"vnd.kidspiration" : "kia",
			"vnd.kinar" : [ "kne", "knp" ],
			"vnd.koan" : [ "skp", "skd", "skt", "skm" ],
			"vnd.kodak-descriptor" : "sse",
			"vnd.las.las+xml" : "lasxml",
			"vnd.llamagraphics.life-balance.desktop" : "lbd",
			"vnd.llamagraphics.life-balance.exchange+xml" : "lbe",
			"vnd.lotus-1-2-3" : "123",
			"vnd.lotus-approach" : "apr",
			"vnd.lotus-freelance" : "pre",
			"vnd.lotus-notes" : "nsf",
			"vnd.lotus-organizer" : "org",
			"vnd.lotus-screencam" : "scm",
			"vnd.lotus-wordpro" : "lwp",
			"vnd.macports.portpkg" : "portpkg",
			"vnd.mcd" : "mcd",
			"vnd.medcalcdata" : "mc1",
			"vnd.mediastation.cdkey" : "cdkey",
			"vnd.mfer" : "mwf",
			"vnd.mfmp" : "mfm",
			"vnd.micrografx.flo" : "flo",
			"vnd.micrografx.igx" : "igx",
			"vnd.mif" : "mif",
			"vnd.mobius.daf" : "daf",
			"vnd.mobius.dis" : "dis",
			"vnd.mobius.mbk" : "mbk",
			"vnd.mobius.mqy" : "mqy",
			"vnd.mobius.msl" : "msl",
			"vnd.mobius.plc" : "plc",
			"vnd.mobius.txf" : "txf",
			"vnd.mophun.application" : "mpn",
			"vnd.mophun.certificate" : "mpc",
			"vnd.ms-artgalry" : "cil",
			"vnd.ms-cab-compressed" : "cab",
			"vnd.ms-excel.addin.macroenabled.12" : "xlam",
			"vnd.ms-excel.sheet.binary.macroenabled.12" : "xlsb",
			"vnd.ms-excel.sheet.macroenabled.12" : "xlsm",
			"vnd.ms-excel.template.macroenabled.12" : "xltm",
			"vnd.ms-fontobject" : "eot",
			"vnd.ms-htmlhelp" : "chm",
			"vnd.ms-ims" : "ims",
			"vnd.ms-lrm" : "lrm",
			"vnd.ms-officetheme" : "thmx",
			"vnd.ms-powerpoint.addin.macroenabled.12" : "ppam",
			"vnd.ms-powerpoint.presentation.macroenabled.12" : "pptm",
			"vnd.ms-powerpoint.slide.macroenabled.12" : "sldm",
			"vnd.ms-powerpoint.slideshow.macroenabled.12" : "ppsm",
			"vnd.ms-powerpoint.template.macroenabled.12" : "potm",
			"vnd.ms-project" : [ "mpp", "mpt" ],
			"vnd.ms-word.document.macroenabled.12" : "docm",
			"vnd.ms-word.template.macroenabled.12" : "dotm",
			"vnd.ms-works" : [ "wps", "wks", "wcm", "wdb" ],
			"vnd.ms-wpl" : "wpl",
			"vnd.ms-xpsdocument" : "xps",
			"vnd.mseq" : "mseq",
			"vnd.musician" : "mus",
			"vnd.muvee.style" : "msty",
			"vnd.mynfc" : "taglet",
			"vnd.neurolanguage.nlu" : "nlu",
			"vnd.nitf" : [ "ntf", "nitf" ],
			"vnd.noblenet-directory" : "nnd",
			"vnd.noblenet-sealer" : "nns",
			"vnd.noblenet-web" : "nnw",
			"vnd.nokia.n-gage.data" : "ngdat",
			"vnd.nokia.n-gage.symbian.install" : "n-gage",
			"vnd.nokia.radio-preset" : "rpst",
			"vnd.nokia.radio-presets" : "rpss",
			"vnd.novadigm.edm" : "edm",
			"vnd.novadigm.edx" : "edx",
			"vnd.novadigm.ext" : "ext",
			"vnd.oasis.opendocument.chart-template" : "otc",
			"vnd.oasis.opendocument.formula-template" : "odft",
			"vnd.oasis.opendocument.image-template" : "oti",
			"vnd.olpc-sugar" : "xo",
			"vnd.oma.dd2+xml" : "dd2",
			"vnd.openofficeorg.extension" : "oxt",
			"vnd.openxmlformats-officedocument.presentationml.slide" : "sldx",
			"vnd.osgeo.mapguide.package" : "mgp",
			"vnd.osgi.dp" : "dp",
			"vnd.osgi.subsystem" : "esa",
			"vnd.palm" : [ "pdb", "pqa", "oprc" ],
			"vnd.pawaafile" : "paw",
			"vnd.pg.format" : "str",
			"vnd.pg.osasli" : "ei6",
			"vnd.picsel" : "efif",
			"vnd.pmi.widget" : "wg",
			"vnd.pocketlearn" : "plf",
			"vnd.powerbuilder6" : "pbd",
			"vnd.previewsystems.box" : "box",
			"vnd.proteus.magazine" : "mgz",
			"vnd.publishare-delta-tree" : "qps",
			"vnd.pvi.ptid1" : "ptid",
			"vnd.quark.quarkxpress" : [ "qxd", "qxt", "qwd", "qwt", "qxl", "qxb" ],
			"vnd.realvnc.bed" : "bed",
			"vnd.recordare.musicxml" : "mxl",
			"vnd.recordare.musicxml+xml" : "musicxml",
			"vnd.rig.cryptonote" : "cryptonote",
			"vnd.rn-realmedia" : "rm",
			"vnd.rn-realmedia-vbr" : "rmvb",
			"vnd.route66.link66+xml" : "link66",
			"vnd.sailingtracker.track" : "st",
			"vnd.seemail" : "see",
			"vnd.sema" : "sema",
			"vnd.semd" : "semd",
			"vnd.semf" : "semf",
			"vnd.shana.informed.formdata" : "ifm",
			"vnd.shana.informed.formtemplate" : "itp",
			"vnd.shana.informed.interchange" : "iif",
			"vnd.shana.informed.package" : "ipk",
			"vnd.simtech-mindmapper" : [ "twd", "twds" ],
			"vnd.smart.teacher" : "teacher",
			"vnd.solent.sdkm+xml" : [ "sdkm", "sdkd" ],
			"vnd.spotfire.dxp" : "dxp",
			"vnd.spotfire.sfs" : "sfs",
			"vnd.stepmania.package" : "smzip",
			"vnd.stepmania.stepchart" : "sm",
			"vnd.sus-calendar" : [ "sus", "susp" ],
			"vnd.svd" : "svd",
			"vnd.syncml+xml" : "xsm",
			"vnd.syncml.dm+wbxml" : "bdm",
			"vnd.syncml.dm+xml" : "xdm",
			"vnd.tao.intent-module-archive" : "tao",
			"vnd.tcpdump.pcap" : [ "pcap", "cap", "dmp" ],
			"vnd.tmobile-livetv" : "tmo",
			"vnd.trid.tpt" : "tpt",
			"vnd.triscape.mxs" : "mxs",
			"vnd.trueapp" : "tra",
			"vnd.ufdl" : [ "ufd", "ufdl" ],
			"vnd.uiq.theme" : "utz",
			"vnd.umajin" : "umj",
			"vnd.unity" : "unityweb",
			"vnd.uoml+xml" : "uoml",
			"vnd.vcx" : "vcx",
			"vnd.visionary" : "vis",
			"vnd.vsf" : "vsf",
			"vnd.webturbo" : "wtb",
			"vnd.wolfram.player" : "nbp",
			"vnd.wqd" : "wqd",
			"vnd.wt.stf" : "stf",
			"vnd.xara" : "xar",
			"vnd.xfdl" : "xfdl",
			"vnd.yamaha.hv-dic" : "hvd",
			"vnd.yamaha.hv-script" : "hvs",
			"vnd.yamaha.hv-voice" : "hvp",
			"vnd.yamaha.openscoreformat" : "osf",
			"vnd.yamaha.openscoreformat.osfpvg+xml" : "osfpvg",
			"vnd.yamaha.smaf-audio" : "saf",
			"vnd.yamaha.smaf-phrase" : "spf",
			"vnd.yellowriver-custom-menu" : "cmp",
			"vnd.zul" : [ "zir", "zirz" ],
			"vnd.zzazz.deck+xml" : "zaz",
			"voicexml+xml" : "vxml",
			"widget" : "wgt",
			"winhlp" : "hlp",
			"wsdl+xml" : "wsdl",
			"wspolicy+xml" : "wspolicy",
			"x-ace-compressed" : "ace",
			"x-authorware-bin" : [ "aab", "x32", "u32", "vox" ],
			"x-authorware-map" : "aam",
			"x-authorware-seg" : "aas",
			"x-blorb" : [ "blb", "blorb" ],
			"x-bzip" : "bz",
			"x-bzip2" : [ "bz2", "boz" ],
			"x-cfs-compressed" : "cfs",
			"x-chat" : "chat",
			"x-conference" : "nsc",
			"x-dgc-compressed" : "dgc",
			"x-dtbncx+xml" : "ncx",
			"x-dtbook+xml" : "dtb",
			"x-dtbresource+xml" : "res",
			"x-eva" : "eva",
			"x-font-bdf" : "bdf",
			"x-font-ghostscript" : "gsf",
			"x-font-linux-psf" : "psf",
			"x-font-otf" : "otf",
			"x-font-pcf" : "pcf",
			"x-font-snf" : "snf",
			"x-font-ttf" : [ "ttf", "ttc" ],
			"x-font-type1" : [ "pfa", "pfb", "pfm", "afm" ],
			"x-font-woff" : "woff",
			"x-freearc" : "arc",
			"x-gca-compressed" : "gca",
			"x-glulx" : "ulx",
			"x-gramps-xml" : "gramps",
			"x-install-instructions" : "install",
			"x-lzh-compressed" : [ "lzh", "lha" ],
			"x-mie" : "mie",
			"x-mobipocket-ebook" : [ "prc", "mobi" ],
			"x-ms-application" : "application",
			"x-ms-shortcut" : "lnk",
			"x-ms-xbap" : "xbap",
			"x-msbinder" : "obd",
			"x-mscardfile" : "crd",
			"x-msclip" : "clp",
			"x-msdownload" : [ "exe", "dll", "com", "bat", "msi" ],
			"x-msmediaview" : [ "mvb", "m13", "m14" ],
			"x-msmetafile" : [ "wmf", "wmz", "emf", "emz" ],
			"x-msmoney" : "mny",
			"x-mspublisher" : "pub",
			"x-msschedule" : "scd",
			"x-msterminal" : "trm",
			"x-mswrite" : "wri",
			"x-nzb" : "nzb",
			"x-pkcs12" : [ "p12", "pfx" ],
			"x-pkcs7-certificates" : [ "p7b", "spc" ],
			"x-research-info-systems" : "ris",
			"x-silverlight-app" : "xap",
			"x-sql" : "sql",
			"x-stuffitx" : "sitx",
			"x-subrip" : "srt",
			"x-t3vm-image" : "t3",
			"x-tads" : "gam",
			"x-tex" : "tex",
			"x-tex-tfm" : "tfm",
			"x-tgif" : "obj",
			"x-xliff+xml" : "xlf",
			"x-xz" : "xz",
			"x-zmachine" : [ "z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8" ],
			"xaml+xml" : "xaml",
			"xcap-diff+xml" : "xdf",
			"xenc+xml" : "xenc",
			"xml-dtd" : "dtd",
			"xop+xml" : "xop",
			"xproc+xml" : "xpl",
			"xslt+xml" : "xslt",
			"xv+xml" : [ "mxml", "xhvml", "xvml", "xvm" ],
			"yang" : "yang",
			"yin+xml" : "yin",
			"envoy" : "evy",
			"fractals" : "fif",
			"internet-property-stream" : "acx",
			"olescript" : "axs",
			"vnd.ms-outlook" : "msg",
			"vnd.ms-pkicertstore" : "sst",
			"x-compress" : "z",
			"x-compressed" : "tgz",
			"x-gzip" : "gz",
			"x-perfmon" : [ "pma", "pmc", "pml", "pmr", "pmw" ],
			"x-pkcs7-mime" : [ "p7c", "p7m" ],
			"ynd.ms-pkipko" : "pko"
		},
		"audio" : {
			"amr" : "amr",
			"amr-wb" : "awb",
			"annodex" : "axa",
			"basic" : [ "au", "snd" ],
			"flac" : "flac",
			"midi" : [ "mid", "midi", "kar", "rmi" ],
			"mpeg" : [ "mpga", "mpega", "mp2", "mp3", "m4a", "mp2a", "m2a", "m3a" ],
			"mpegurl" : "m3u",
			"ogg" : [ "oga", "ogg", "spx" ],
			"prs.sid" : "sid",
			"x-aiff" : [ "aif", "aiff", "aifc" ],
			"x-gsm" : "gsm",
			"x-ms-wma" : "wma",
			"x-ms-wax" : "wax",
			"x-pn-realaudio" : "ram",
			"x-realaudio" : "ra",
			"x-sd2" : "sd2",
			"x-wav" : "wav",
			"adpcm" : "adp",
			"mp4" : "mp4a",
			"s3m" : "s3m",
			"silk" : "sil",
			"vnd.dece.audio" : [ "uva", "uvva" ],
			"vnd.digital-winds" : "eol",
			"vnd.dra" : "dra",
			"vnd.dts" : "dts",
			"vnd.dts.hd" : "dtshd",
			"vnd.lucent.voice" : "lvp",
			"vnd.ms-playready.media.pya" : "pya",
			"vnd.nuera.ecelp4800" : "ecelp4800",
			"vnd.nuera.ecelp7470" : "ecelp7470",
			"vnd.nuera.ecelp9600" : "ecelp9600",
			"vnd.rip" : "rip",
			"webm" : "weba",
			"x-aac" : "aac",
			"x-caf" : "caf",
			"x-matroska" : "mka",
			"x-pn-realaudio-plugin" : "rmp",
			"xm" : "xm",
			"mid" : [ "mid", "rmi" ]
		},
		"chemical" : {
			"x-alchemy" : "alc",
			"x-cache" : [ "cac", "cache" ],
			"x-cache-csf" : "csf",
			"x-cactvs-binary" : [ "cbin", "cascii", "ctab" ],
			"x-cdx" : "cdx",
			"x-chem3d" : "c3d",
			"x-cif" : "cif",
			"x-cmdf" : "cmdf",
			"x-cml" : "cml",
			"x-compass" : "cpa",
			"x-crossfire" : "bsd",
			"x-csml" : [ "csml", "csm" ],
			"x-ctx" : "ctx",
			"x-cxf" : [ "cxf", "cef" ],
			"x-embl-dl-nucleotide" : [ "emb", "embl" ],
			"x-gamess-input" : [ "inp", "gam", "gamin" ],
			"x-gaussian-checkpoint" : [ "fch", "fchk" ],
			"x-gaussian-cube" : "cub",
			"x-gaussian-input" : [ "gau", "gjc", "gjf" ],
			"x-gaussian-log" : "gal",
			"x-gcg8-sequence" : "gcg",
			"x-genbank" : "gen",
			"x-hin" : "hin",
			"x-isostar" : [ "istr", "ist" ],
			"x-jcamp-dx" : [ "jdx", "dx" ],
			"x-kinemage" : "kin",
			"x-macmolecule" : "mcm",
			"x-macromodel-input" : [ "mmd", "mmod" ],
			"x-mdl-molfile" : "mol",
			"x-mdl-rdfile" : "rd",
			"x-mdl-rxnfile" : "rxn",
			"x-mdl-sdfile" : [ "sd", "sdf" ],
			"x-mdl-tgf" : "tgf",
			"x-mmcif" : "mcif",
			"x-mol2" : "mol2",
			"x-molconn-Z" : "b",
			"x-mopac-graph" : "gpt",
			"x-mopac-input" : [ "mop", "mopcrt", "mpc", "zmt" ],
			"x-mopac-out" : "moo",
			"x-ncbi-asn1" : "asn",
			"x-ncbi-asn1-ascii" : [ "prt", "ent" ],
			"x-ncbi-asn1-binary" : [ "val", "aso" ],
			"x-pdb" : [ "pdb", "ent" ],
			"x-rosdal" : "ros",
			"x-swissprot" : "sw",
			"x-vamas-iso14976" : "vms",
			"x-vmd" : "vmd",
			"x-xtel" : "xtel",
			"x-xyz" : "xyz"
		},
		"image" : {
			"gif" : "gif",
			"ief" : "ief",
			"jpeg" : [ "jpeg", "jpg", "jpe" ],
			"pcx" : "pcx",
			"png" : "png",
			"svg+xml" : [ "svg", "svgz" ],
			"tiff" : [ "tiff", "tif" ],
			"vnd.djvu" : [ "djvu", "djv" ],
			"vnd.wap.wbmp" : "wbmp",
			"x-canon-cr2" : "cr2",
			"x-canon-crw" : "crw",
			"x-cmu-raster" : "ras",
			"x-coreldraw" : "cdr",
			"x-coreldrawpattern" : "pat",
			"x-coreldrawtemplate" : "cdt",
			"x-corelphotopaint" : "cpt",
			"x-epson-erf" : "erf",
			"x-icon" : "ico",
			"x-jg" : "art",
			"x-jng" : "jng",
			"x-nikon-nef" : "nef",
			"x-olympus-orf" : "orf",
			"x-photoshop" : "psd",
			"x-portable-anymap" : "pnm",
			"x-portable-bitmap" : "pbm",
			"x-portable-graymap" : "pgm",
			"x-portable-pixmap" : "ppm",
			"x-rgb" : "rgb",
			"x-xbitmap" : "xbm",
			"x-xpixmap" : "xpm",
			"x-xwindowdump" : "xwd",
			"bmp" : "bmp",
			"cgm" : "cgm",
			"g3fax" : "g3",
			"ktx" : "ktx",
			"prs.btif" : "btif",
			"sgi" : "sgi",
			"vnd.dece.graphic" : [ "uvi", "uvvi", "uvg", "uvvg" ],
			"vnd.dwg" : "dwg",
			"vnd.dxf" : "dxf",
			"vnd.fastbidsheet" : "fbs",
			"vnd.fpx" : "fpx",
			"vnd.fst" : "fst",
			"vnd.fujixerox.edmics-mmr" : "mmr",
			"vnd.fujixerox.edmics-rlc" : "rlc",
			"vnd.ms-modi" : "mdi",
			"vnd.ms-photo" : "wdp",
			"vnd.net-fpx" : "npx",
			"vnd.xiff" : "xif",
			"webp" : "webp",
			"x-3ds" : "3ds",
			"x-cmx" : "cmx",
			"x-freehand" : [ "fh", "fhc", "fh4", "fh5", "fh7" ],
			"x-pict" : [ "pic", "pct" ],
			"x-tga" : "tga",
			"cis-cod" : "cod",
			"pipeg" : "jfif"
		},
		"message" : {
			"rfc822" : [ "eml", "mime", "mht", "mhtml", "nws" ]
		},
		"model" : {
			"iges" : [ "igs", "iges" ],
			"mesh" : [ "msh", "mesh", "silo" ],
			"vrml" : [ "wrl", "vrml" ],
			"x3d+vrml" : [ "x3dv", "x3dvz" ],
			"x3d+xml" : [ "x3d", "x3dz" ],
			"x3d+binary" : [ "x3db", "x3dbz" ],
			"vnd.collada+xml" : "dae",
			"vnd.dwf" : "dwf",
			"vnd.gdl" : "gdl",
			"vnd.gtw" : "gtw",
			"vnd.mts" : "mts",
			"vnd.vtu" : "vtu"
		},
		"text" : {
			"cache-manifest" : [ "manifest", "appcache" ],
			"calendar" : [ "ics", "icz", "ifb" ],
			"css" : "css",
			"csv" : "csv",
			"h323" : "323",
			"html" : [ "html", "htm", "shtml", "stm" ],
			"iuls" : "uls",
			"mathml" : "mml",
			"plain" : [ "txt", "text", "brf", "conf", "def", "list", "log", "in", "bas" ],
			"richtext" : "rtx",
			"scriptlet" : [ "sct", "wsc" ],
			"texmacs" : [ "tm", "ts" ],
			"tab-separated-values" : "tsv",
			"vnd.sun.j2me.app-descriptor" : "jad",
			"vnd.wap.wml" : "wml",
			"vnd.wap.wmlscript" : "wmls",
			"x-bibtex" : "bib",
			"x-boo" : "boo",
			"x-c++hdr" : [ "h++", "hpp", "hxx", "hh" ],
			"x-c++src" : [ "c++", "cpp", "cxx", "cc" ],
			"x-component" : "htc",
			"x-dsrc" : "d",
			"x-diff" : [ "diff", "patch" ],
			"x-haskell" : "hs",
			"x-java" : "java",
			"x-literate-haskell" : "lhs",
			"x-moc" : "moc",
			"x-pascal" : [ "p", "pas" ],
			"x-pcs-gcd" : "gcd",
			"x-perl" : [ "pl", "pm" ],
			"x-python" : "py",
			"x-scala" : "scala",
			"x-setext" : "etx",
			"x-tcl" : [ "tcl", "tk" ],
			"x-tex" : [ "tex", "ltx", "sty", "cls" ],
			"x-vcalendar" : "vcs",
			"x-vcard" : "vcf",
			"n3" : "n3",
			"prs.lines.tag" : "dsc",
			"sgml" : [ "sgml", "sgm" ],
			"troff" : [ "t", "tr", "roff", "man", "me", "ms" ],
			"turtle" : "ttl",
			"uri-list" : [ "uri", "uris", "urls" ],
			"vcard" : "vcard",
			"vnd.curl" : "curl",
			"vnd.curl.dcurl" : "dcurl",
			"vnd.curl.scurl" : "scurl",
			"vnd.curl.mcurl" : "mcurl",
			"vnd.dvb.subtitle" : "sub",
			"vnd.fly" : "fly",
			"vnd.fmi.flexstor" : "flx",
			"vnd.graphviz" : "gv",
			"vnd.in3d.3dml" : "3dml",
			"vnd.in3d.spot" : "spot",
			"x-asm" : [ "s", "asm" ],
			"x-c" : [ "c", "cc", "cxx", "cpp", "h", "hh", "dic" ],
			"x-fortran" : [ "f", "for", "f77", "f90" ],
			"x-opml" : "opml",
			"x-nfo" : "nfo",
			"x-sfv" : "sfv",
			"x-uuencode" : "uu",
			"webviewhtml" : "htt"
		},
		"video" : {
			"3gpp" : "3gp",
			"annodex" : "axv",
			"dl" : "dl",
			"dv" : [ "dif", "dv" ],
			"fli" : "fli",
			"gl" : "gl",
			"mpeg" : [ "mpeg", "mpg", "mpe", "m1v", "m2v", "mp2", "mpa", "mpv2" ],
			"mp4" : [ "mp4", "mp4v", "mpg4" ],
			"quicktime" : [ "qt", "mov" ],
			"ogg" : "ogv",
			"vnd.mpegurl" : [ "mxu", "m4u" ],
			"x-flv" : "flv",
			"x-la-asf" : [ "lsf", "lsx" ],
			"x-mng" : "mng",
			"x-ms-asf" : [ "asf", "asx", "asr" ],
			"x-ms-wm" : "wm",
			"x-ms-wmv" : "wmv",
			"x-ms-wmx" : "wmx",
			"x-ms-wvx" : "wvx",
			"x-msvideo" : "avi",
			"x-sgi-movie" : "movie",
			"x-matroska" : [ "mpv", "mkv", "mk3d", "mks" ],
			"3gpp2" : "3g2",
			"h261" : "h261",
			"h263" : "h263",
			"h264" : "h264",
			"jpeg" : "jpgv",
			"jpm" : [ "jpm", "jpgm" ],
			"mj2" : [ "mj2", "mjp2" ],
			"vnd.dece.hd" : [ "uvh", "uvvh" ],
			"vnd.dece.mobile" : [ "uvm", "uvvm" ],
			"vnd.dece.pd" : [ "uvp", "uvvp" ],
			"vnd.dece.sd" : [ "uvs", "uvvs" ],
			"vnd.dece.video" : [ "uvv", "uvvv" ],
			"vnd.dvb.file" : "dvb",
			"vnd.fvt" : "fvt",
			"vnd.ms-playready.media.pyv" : "pyv",
			"vnd.uvvu.mp4" : [ "uvu", "uvvu" ],
			"vnd.vivo" : "viv",
			"webm" : "webm",
			"x-f4v" : "f4v",
			"x-m4v" : "m4v",
			"x-ms-vob" : "vob",
			"x-smv" : "smv"
		},
		"x-conference" : {
			"x-cooltalk" : "ice"
		},
		"x-world" : {
			"x-vrml" : [ "vrm", "vrml", "wrl", "flr", "wrz", "xaf", "xof" ]
		}
	};

	var mimeTypes = (function() {
		var type, subtype, val, index, mimeTypes = {};
		for (type in table) {
			if (table.hasOwnProperty(type)) {
				for (subtype in table[type]) {
					if (table[type].hasOwnProperty(subtype)) {
						val = table[type][subtype];
						if (typeof val == "string") {
							mimeTypes[val] = type + "/" + subtype;
						} else {
							for (index = 0; index < val.length; index++) {
								mimeTypes[val[index]] = type + "/" + subtype;
							}
						}
					}
				}
			}
		}
		return mimeTypes;
	})();

	zip.getMimeType = function(filename) {
		var defaultValue = "application/octet-stream";
		return filename && mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
	};

})();

define("mime-types", ["zip"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.zip;
    };
}(this)));

/*
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {
	"use strict";

	var CHUNK_SIZE = 512 * 1024;

	var TextWriter = zip.TextWriter, //
	BlobWriter = zip.BlobWriter, //
	Data64URIWriter = zip.Data64URIWriter, //
	Reader = zip.Reader, //
	TextReader = zip.TextReader, //
	BlobReader = zip.BlobReader, //
	Data64URIReader = zip.Data64URIReader, //
	createReader = zip.createReader, //
	createWriter = zip.createWriter;

	function ZipBlobReader(entry) {
		var that = this, blobReader;

		function init(callback) {
			that.size = entry.uncompressedSize;
			callback();
		}

		function getData(callback) {
			if (that.data)
				callback();
			else
				entry.getData(new BlobWriter(), function(data) {
					that.data = data;
					blobReader = new BlobReader(data);
					callback();
				}, null, that.checkCrc32);
		}

		function readUint8Array(index, length, callback, onerror) {
			getData(function() {
				blobReader.readUint8Array(index, length, callback, onerror);
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	ZipBlobReader.prototype = new Reader();
	ZipBlobReader.prototype.constructor = ZipBlobReader;
	ZipBlobReader.prototype.checkCrc32 = false;

	function getTotalSize(entry) {
		var size = 0;

		function process(entry) {
			size += entry.uncompressedSize || 0;
			entry.children.forEach(process);
		}

		process(entry);
		return size;
	}

	function initReaders(entry, onend, onerror) {
		var index = 0;

		function next() {
			index++;
			if (index < entry.children.length)
				process(entry.children[index]);
			else
				onend();
		}

		function process(child) {
			if (child.directory)
				initReaders(child, next, onerror);
			else {
				child.reader = new child.Reader(child.data, onerror);
				child.reader.init(function() {
					child.uncompressedSize = child.reader.size;
					next();
				});
			}
		}

		if (entry.children.length)
			process(entry.children[index]);
		else
			onend();
	}

	function detach(entry) {
		var children = entry.parent.children;
		children.forEach(function(child, index) {
			if (child.id == entry.id)
				children.splice(index, 1);
		});
	}

	function exportZip(zipWriter, entry, onend, onprogress, totalSize) {
		var currentIndex = 0;

		function process(zipWriter, entry, onend, onprogress, totalSize) {
			var childIndex = 0;

			function exportChild() {
				var child = entry.children[childIndex];
				if (child)
					zipWriter.add(child.getFullname(), child.reader, function() {
						currentIndex += child.uncompressedSize || 0;
						process(zipWriter, child, function() {
							childIndex++;
							exportChild();
						}, onprogress, totalSize);
					}, function(index) {
						if (onprogress)
							onprogress(currentIndex + index, totalSize);
					}, {
						directory : child.directory,
						version : child.zipVersion
					});
				else
					onend();
			}

			exportChild();
		}

		process(zipWriter, entry, onend, onprogress, totalSize);
	}

	function addFileEntry(zipEntry, fileEntry, onend, onerror) {
		function getChildren(fileEntry, callback) {
			if (fileEntry.isDirectory)
				fileEntry.createReader().readEntries(callback);
			if (fileEntry.isFile)
				callback([]);
		}

		function process(zipEntry, fileEntry, onend) {
			getChildren(fileEntry, function(children) {
				var childIndex = 0;

				function addChild(child) {
					function nextChild(childFileEntry) {
						process(childFileEntry, child, function() {
							childIndex++;
							processChild();
						});
					}

					if (child.isDirectory)
						nextChild(zipEntry.addDirectory(child.name));
					if (child.isFile)
						child.file(function(file) {
							var childZipEntry = zipEntry.addBlob(child.name, file);
							childZipEntry.uncompressedSize = file.size;
							nextChild(childZipEntry);
						}, onerror);
				}

				function processChild() {
					var child = children[childIndex];
					if (child)
						addChild(child);
					else
						onend();
				}

				processChild();
			});
		}

		if (fileEntry.isDirectory)
			process(zipEntry, fileEntry, onend);
		else
			fileEntry.file(function(file) {
				zipEntry.addBlob(fileEntry.name, file);
				onend();
			}, onerror);
	}

	function getFileEntry(fileEntry, entry, onend, onprogress, onerror, totalSize, checkCrc32) {
		var currentIndex = 0;

		function process(fileEntry, entry, onend, onprogress, onerror, totalSize) {
			var childIndex = 0;

			function addChild(child) {
				function nextChild(childFileEntry) {
					currentIndex += child.uncompressedSize || 0;
					process(childFileEntry, child, function() {
						childIndex++;
						processChild();
					}, onprogress, onerror, totalSize);
				}

				if (child.directory)
					fileEntry.getDirectory(child.name, {
						create : true
					}, nextChild, onerror);
				else
					fileEntry.getFile(child.name, {
						create : true
					}, function(file) {
						child.getData(new zip.FileWriter(file, zip.getMimeType(child.name)), nextChild, function(index) {
							if (onprogress)
								onprogress(currentIndex + index, totalSize);
						}, checkCrc32);
					}, onerror);
			}

			function processChild() {
				var child = entry.children[childIndex];
				if (child)
					addChild(child);
				else
					onend();
			}

			processChild();
		}

		if (entry.directory)
			process(fileEntry, entry, onend, onprogress, onerror, totalSize);
		else
			entry.getData(new zip.FileWriter(fileEntry, zip.getMimeType(entry.name)), onend, onprogress, checkCrc32);
	}

	function resetFS(fs) {
		fs.entries = [];
		fs.root = new ZipDirectoryEntry(fs);
	}

	function bufferedCopy(reader, writer, onend, onprogress, onerror) {
		var chunkIndex = 0;

		function stepCopy() {
			var index = chunkIndex * CHUNK_SIZE;
			if (onprogress)
				onprogress(index, reader.size);
			if (index < reader.size)
				reader.readUint8Array(index, Math.min(CHUNK_SIZE, reader.size - index), function(array) {
					writer.writeUint8Array(new Uint8Array(array), function() {
						chunkIndex++;
						stepCopy();
					});
				}, onerror);
			else
				writer.getData(onend);
		}

		stepCopy();
	}

	function addChild(parent, name, params, directory) {
		if (parent.directory)
			return directory ? new ZipDirectoryEntry(parent.fs, name, params, parent) : new ZipFileEntry(parent.fs, name, params, parent);
		else
			throw "Parent entry is not a directory.";
	}

	function ZipEntry() {
	}

	ZipEntry.prototype = {
		init : function(fs, name, params, parent) {
			var that = this;
			if (fs.root && parent && parent.getChildByName(name))
				throw "Entry filename already exists.";
			if (!params)
				params = {};
			that.fs = fs;
			that.name = name;
			that.id = fs.entries.length;
			that.parent = parent;
			that.children = [];
			that.zipVersion = params.zipVersion || 0x14;
			that.uncompressedSize = 0;
			fs.entries.push(that);
			if (parent)
				that.parent.children.push(that);
		},
		getFileEntry : function(fileEntry, onend, onprogress, onerror, checkCrc32) {
			var that = this;
			initReaders(that, function() {
				getFileEntry(fileEntry, that, onend, onprogress, onerror, getTotalSize(that), checkCrc32);
			}, onerror);
		},
		moveTo : function(target) {
			var that = this;
			if (target.directory) {
				if (!target.isDescendantOf(that)) {
					if (that != target) {
						if (target.getChildByName(that.name))
							throw "Entry filename already exists.";
						detach(that);
						that.parent = target;
						target.children.push(that);
					}
				} else
					throw "Entry is a ancestor of target entry.";
			} else
				throw "Target entry is not a directory.";
		},
		getFullname : function() {
			var that = this, fullname = that.name, entry = that.parent;
			while (entry) {
				fullname = (entry.name ? entry.name + "/" : "") + fullname;
				entry = entry.parent;
			}
			return fullname;
		},
		isDescendantOf : function(ancestor) {
			var entry = this.parent;
			while (entry && entry.id != ancestor.id)
				entry = entry.parent;
			return !!entry;
		}
	};
	ZipEntry.prototype.constructor = ZipEntry;

	var ZipFileEntryProto;

	function ZipFileEntry(fs, name, params, parent) {
		var that = this;
		ZipEntry.prototype.init.call(that, fs, name, params, parent);
		that.Reader = params.Reader;
		that.Writer = params.Writer;
		that.data = params.data;
		if (params.getData) {
			that.getData = params.getData;
		}
	}

	ZipFileEntry.prototype = ZipFileEntryProto = new ZipEntry();
	ZipFileEntryProto.constructor = ZipFileEntry;
	ZipFileEntryProto.getData = function(writer, onend, onprogress, onerror) {
		var that = this;
		if (!writer || (writer.constructor == that.Writer && that.data))
			onend(that.data);
		else {
			if (!that.reader)
				that.reader = new that.Reader(that.data, onerror);
			that.reader.init(function() {
				writer.init(function() {
					bufferedCopy(that.reader, writer, onend, onprogress, onerror);
				}, onerror);
			});
		}
	};

	ZipFileEntryProto.getText = function(onend, onprogress, checkCrc32, encoding) {
		this.getData(new TextWriter(encoding), onend, onprogress, checkCrc32);
	};
	ZipFileEntryProto.getBlob = function(mimeType, onend, onprogress, checkCrc32) {
		this.getData(new BlobWriter(mimeType), onend, onprogress, checkCrc32);
	};
	ZipFileEntryProto.getData64URI = function(mimeType, onend, onprogress, checkCrc32) {
		this.getData(new Data64URIWriter(mimeType), onend, onprogress, checkCrc32);
	};

	var ZipDirectoryEntryProto;

	function ZipDirectoryEntry(fs, name, params, parent) {
		var that = this;
		ZipEntry.prototype.init.call(that, fs, name, params, parent);
		that.directory = true;
	}

	ZipDirectoryEntry.prototype = ZipDirectoryEntryProto = new ZipEntry();
	ZipDirectoryEntryProto.constructor = ZipDirectoryEntry;
	ZipDirectoryEntryProto.addDirectory = function(name) {
		return addChild(this, name, null, true);
	};
	ZipDirectoryEntryProto.addText = function(name, text) {
		return addChild(this, name, {
			data : text,
			Reader : TextReader,
			Writer : TextWriter
		});
	};
	ZipDirectoryEntryProto.addBlob = function(name, blob) {
		return addChild(this, name, {
			data : blob,
			Reader : BlobReader,
			Writer : BlobWriter
		});
	};
	ZipDirectoryEntryProto.addData64URI = function(name, dataURI) {
		return addChild(this, name, {
			data : dataURI,
			Reader : Data64URIReader,
			Writer : Data64URIWriter
		});
	};
	ZipDirectoryEntryProto.addFileEntry = function(fileEntry, onend, onerror) {
		addFileEntry(this, fileEntry, onend, onerror);
	};
	ZipDirectoryEntryProto.addData = function(name, params) {
		return addChild(this, name, params);
	};
	ZipDirectoryEntryProto.importBlob = function(blob, onend, onerror) {
		this.importZip(new BlobReader(blob), onend, onerror);
	};
	ZipDirectoryEntryProto.importText = function(text, onend, onerror) {
		this.importZip(new TextReader(text), onend, onerror);
	};
	ZipDirectoryEntryProto.importData64URI = function(dataURI, onend, onerror) {
		this.importZip(new Data64URIReader(dataURI), onend, onerror);
	};
	ZipDirectoryEntryProto.exportBlob = function(onend, onprogress, onerror) {
		this.exportZip(new BlobWriter("application/zip"), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.exportText = function(onend, onprogress, onerror) {
		this.exportZip(new TextWriter(), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.exportFileEntry = function(fileEntry, onend, onprogress, onerror) {
		this.exportZip(new zip.FileWriter(fileEntry, "application/zip"), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.exportData64URI = function(onend, onprogress, onerror) {
		this.exportZip(new Data64URIWriter("application/zip"), onend, onprogress, onerror);
	};
	ZipDirectoryEntryProto.importZip = function(reader, onend, onerror) {
		var that = this;
		createReader(reader, function(zipReader) {
			zipReader.getEntries(function(entries) {
				entries.forEach(function(entry) {
					var parent = that, path = entry.filename.split("/"), name = path.pop();
					path.forEach(function(pathPart) {
						parent = parent.getChildByName(pathPart) || new ZipDirectoryEntry(that.fs, pathPart, null, parent);
					});
					if (!entry.directory)
						addChild(parent, name, {
							data : entry,
							Reader : ZipBlobReader
						});
				});
				onend();
			});
		}, onerror);
	};
	ZipDirectoryEntryProto.exportZip = function(writer, onend, onprogress, onerror) {
		var that = this;
		initReaders(that, function() {
			createWriter(writer, function(zipWriter) {
				exportZip(zipWriter, that, function() {
					zipWriter.close(onend);
				}, onprogress, getTotalSize(that));
			}, onerror);
		}, onerror);
	};
	ZipDirectoryEntryProto.getChildByName = function(name) {
		var childIndex, child, that = this;
		for (childIndex = 0; childIndex < that.children.length; childIndex++) {
			child = that.children[childIndex];
			if (child.name == name)
				return child;
		}
	};

	function FS() {
		resetFS(this);
	}
	FS.prototype = {
		remove : function(entry) {
			detach(entry);
			this.entries[entry.id] = null;
		},
		find : function(fullname) {
			var index, path = fullname.split("/"), node = this.root;
			for (index = 0; node && index < path.length; index++)
				node = node.getChildByName(path[index]);
			return node;
		},
		getById : function(id) {
			return this.entries[id];
		},
		importBlob : function(blob, onend, onerror) {
			resetFS(this);
			this.root.importBlob(blob, onend, onerror);
		},
		importText : function(text, onend, onerror) {
			resetFS(this);
			this.root.importText(text, onend, onerror);
		},
		importData64URI : function(dataURI, onend, onerror) {
			resetFS(this);
			this.root.importData64URI(dataURI, onend, onerror);
		},
		exportBlob : function(onend, onprogress, onerror) {
			this.root.exportBlob(onend, onprogress, onerror);
		},
		exportText : function(onend, onprogress, onerror) {
			this.root.exportText(onend, onprogress, onerror);
		},
		exportFileEntry : function(fileEntry, onend, onprogress, onerror) {
			this.root.exportFileEntry(fileEntry, onend, onprogress, onerror);
		},
		exportData64URI : function(onend, onprogress, onerror) {
			this.root.exportData64URI(onend, onprogress, onerror);
		}
	};

	zip.fs = {
		FS : FS,
		ZipDirectoryEntry : ZipDirectoryEntry,
		ZipFileEntry : ZipFileEntry
	};

	zip.getMimeType = function() {
		return "application/octet-stream";
	};

})();

define("zip-fs", ["mime-types"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.zip;
    };
}(this)));

/*
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {
	"use strict";

	var ERR_HTTP_RANGE = "HTTP Range not supported.";

	var Reader = zip.Reader;
	var Writer = zip.Writer;
	
	var ZipDirectoryEntry;

	var appendABViewSupported;
	try {
		appendABViewSupported = new Blob([ new DataView(new ArrayBuffer(0)) ]).size === 0;
	} catch (e) {
	}

	function HttpReader(url) {
		var that = this;

		function getData(callback, onerror) {
			var request;
			if (!that.data) {
				request = new XMLHttpRequest();
				request.addEventListener("load", function() {
					if (!that.size)
						that.size = Number(request.getResponseHeader("Content-Length"));
					that.data = new Uint8Array(request.response);
					callback();
				}, false);
				request.addEventListener("error", onerror, false);
				request.open("GET", url);
				request.responseType = "arraybuffer";
				request.send();
			} else
				callback();
		}

		function init(callback, onerror) {
			var request = new XMLHttpRequest();
			request.addEventListener("load", function() {
				that.size = Number(request.getResponseHeader("Content-Length"));
				callback();
			}, false);
			request.addEventListener("error", onerror, false);
			request.open("HEAD", url);
			request.send();
		}

		function readUint8Array(index, length, callback, onerror) {
			getData(function() {
				callback(new Uint8Array(that.data.subarray(index, index + length)));
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	HttpReader.prototype = new Reader();
	HttpReader.prototype.constructor = HttpReader;

	function HttpRangeReader(url) {
		var that = this;

		function init(callback, onerror) {
			var request = new XMLHttpRequest();
			request.addEventListener("load", function() {
				that.size = Number(request.getResponseHeader("Content-Length"));
				if (true || request.getResponseHeader("Accept-Ranges") == "bytes")
					callback();
				else
					onerror(ERR_HTTP_RANGE);
			}, false);
			request.addEventListener("error", onerror, false);
			request.open("HEAD", url);
			request.send();
		}

		function readArrayBuffer(index, length, callback, onerror) {
			var request = new XMLHttpRequest();
			request.open("GET", url);
			request.responseType = "arraybuffer";
			request.setRequestHeader("Range", "bytes=" + index + "-" + (index + length - 1));
			request.addEventListener("load", function() {
				callback(request.response);
			}, false);
			request.addEventListener("error", onerror, false);
			request.send();
		}

		function readUint8Array(index, length, callback, onerror) {
			readArrayBuffer(index, length, function(arraybuffer) {
				callback(new Uint8Array(arraybuffer));
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	HttpRangeReader.prototype = new Reader();
	HttpRangeReader.prototype.constructor = HttpRangeReader;

	function ArrayBufferReader(arrayBuffer) {
		var that = this;

		function init(callback, onerror) {
			that.size = arrayBuffer.byteLength;
			callback();
		}

		function readUint8Array(index, length, callback, onerror) {
			callback(new Uint8Array(arrayBuffer.slice(index, index + length)));
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	ArrayBufferReader.prototype = new Reader();
	ArrayBufferReader.prototype.constructor = ArrayBufferReader;

	function ArrayBufferWriter() {
		var array, that = this;

		function init(callback, onerror) {
			array = new Uint8Array();
			callback();
		}

		function writeUint8Array(arr, callback, onerror) {
			var tmpArray = new Uint8Array(array.length + arr.length);
			tmpArray.set(array);
			tmpArray.set(arr, array.length);
			array = tmpArray;
			callback();
		}

		function getData(callback) {
			callback(array.buffer);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	ArrayBufferWriter.prototype = new Writer();
	ArrayBufferWriter.prototype.constructor = ArrayBufferWriter;

	function FileWriter(fileEntry, contentType) {
		var writer, that = this;

		function init(callback, onerror) {
			fileEntry.createWriter(function(fileWriter) {
				writer = fileWriter;
				callback();
			}, onerror);
		}

		function writeUint8Array(array, callback, onerror) {
			var blob = new Blob([ appendABViewSupported ? array : array.buffer ], {
				type : contentType
			});
			writer.onwrite = function() {
				writer.onwrite = null;
				callback();
			};
			writer.onerror = onerror;
			writer.write(blob);
		}

		function getData(callback) {
			fileEntry.file(callback);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	FileWriter.prototype = new Writer();
	FileWriter.prototype.constructor = FileWriter;

	zip.FileWriter = FileWriter;
	zip.HttpReader = HttpReader;
	zip.HttpRangeReader = HttpRangeReader;
	zip.ArrayBufferReader = ArrayBufferReader;
	zip.ArrayBufferWriter = ArrayBufferWriter;

	if (zip.fs) {
		ZipDirectoryEntry = zip.fs.ZipDirectoryEntry;
		ZipDirectoryEntry.prototype.addHttpContent = function(name, URL, useRangeHeader) {
			function addChild(parent, name, params, directory) {
				if (parent.directory)
					return directory ? new ZipDirectoryEntry(parent.fs, name, params, parent) : new zip.fs.ZipFileEntry(parent.fs, name, params, parent);
				else
					throw "Parent entry is not a directory.";
			}

			return addChild(this, name, {
				data : URL,
				Reader : useRangeHeader ? HttpRangeReader : HttpReader
			});
		};
		ZipDirectoryEntry.prototype.importHttpContent = function(URL, useRangeHeader, onend, onerror) {
			this.importZip(useRangeHeader ? new HttpRangeReader(URL) : new HttpReader(URL), onend, onerror);
		};
		zip.fs.FS.prototype.importHttpContent = function(URL, useRangeHeader, onend, onerror) {
			this.entries = [];
			this.root = new ZipDirectoryEntry(this);
			this.root.importHttpContent(URL, useRangeHeader, onend, onerror);
		};
	}

})();

define("zip-ext", ["zip-fs"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.zip;
    };
}(this)));

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

define('epub-fetch/zip_resource_fetcher',['jquery', 'URIjs', './discover_content_type', 'zip-ext'], function ($, URI, ContentTypeDiscovery, zip) {

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
    'epub-fetch/content_document_fetcher',['jquery', 'underscore', 'URIjs', './discover_content_type'],
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
                var resourceUriRelativeToPackageDocument = (new URI(refAttrOrigVal)).absoluteTo(_contentDocumentPathRelativeToPackage).toString();

                var cachedResourceUrl = _publicationResourcesCache.getResourceURL(resourceUriRelativeToPackageDocument);

                function replaceRefAttrInElem(newResourceUrl) {
                    // Store original refAttrVal in a special attribute to provide access to the original href:
                    $(resolvedElem).data('epubZipOrigHref', refAttrOrigVal);
                    $(resolvedElem).attr(refAttr, newResourceUrl);
                }

                if (cachedResourceUrl) {
                    replaceRefAttrInElem(cachedResourceUrl);
                } else {
                    var resolutionDeferred = $.Deferred();
                    resolutionDeferreds.push(resolutionDeferred);

                    _publicationFetcher.relativeToPackageFetchFileContents(resourceUriRelativeToPackageDocument,
                        fetchMode,
                        function (resourceData) {

                            // Generate a function to replace element's resource URL with URL of fetched data.
                            // The function will either be called directly, immediately (if no preprocessing of resourceData is in effect)
                            // or indirectly, later after resourceData preprocessing finishes:
                            var replaceResourceURL = function (finalResourceData) {
                                // Creating an object URL requires a Blob object, so resource data fetched in text mode needs to be wrapped in a Blob:
                                if (fetchMode === 'text') {
                                    var textResourceContentType = ContentTypeDiscovery.identifyContentTypeFromFileName(resourceUriRelativeToPackageDocument);
                                    var declaredType = $(resolvedElem).attr('type');
                                    if (declaredType) {
                                        textResourceContentType = declaredType;
                                    }
                                    finalResourceData = new Blob([finalResourceData], {type: textResourceContentType});
                                }
                                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                var resourceObjectURL = window.URL.createObjectURL(finalResourceData);
                                _publicationResourcesCache.putResource(resourceUriRelativeToPackageDocument,
                                    resourceObjectURL, finalResourceData);
                                // TODO: take care of releasing object URLs when no longer needed
                                replaceRefAttrInElem(resourceObjectURL);
                                resolutionDeferred.resolve();
                            };

                            if (resourceDataPreprocessing) {
                                resourceDataPreprocessing(resourceData, resourceUriRelativeToPackageDocument,
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
                var resourceUriRelativeToPackageDocument = (new URI(extractedUrl)).absoluteTo(styleSheetUriRelativeToPackageDocument).toString();

                var cachedResourceURL = _publicationResourcesCache.getResourceURL(resourceUriRelativeToPackageDocument);


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
                        _publicationResourcesCache.putResource(resourceUriRelativeToPackageDocument,
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
                            preprocessCssStyleSheetData(styleSheetResourceData, resourceUriRelativeToPackageDocument,
                                function (preprocessedStyleSheetData) {
                                    var resourceDataBlob = new Blob([preprocessedStyleSheetData], {type: 'text/css'});
                                    processedBlobCallback(resourceDataBlob);
                                })
                        }
                    } else {
                        fetchMode = 'blob';
                        fetchCallback = processedBlobCallback;
                    }

                    _publicationFetcher.relativeToPackageFetchFileContents(resourceUriRelativeToPackageDocument,
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
                    var refAttrUri = new URI(refAttrOrigVal);

                    if (refAttrUri.scheme() === '') {
                        // Relative URI, fetch from packed EPUB archive:

                        fetchResourceForElement(resolvedElem, refAttrOrigVal, refAttr, fetchMode, resolutionDeferreds,
                            onerror, resourceDataPreprocessing);
                    }
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
                resolveResourceElements('iframe', 'src', 'blob', resolutionDeferreds, onerror);
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

define('epub-fetch/resource_cache',['underscore'], function (_) {

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
                                downshiftedEntry.orderingByLastUseTimestampIdx + ', i: ' + i);
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

;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory();
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define('cryptoJs/core',[], factory);
	}
	else {
		// Global (browser)
		root.CryptoJS = factory();
	}
}(this, function () {

	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {
	    /**
	     * CryptoJS namespace.
	     */
	    var C = {};

	    /**
	     * Library namespace.
	     */
	    var C_lib = C.lib = {};

	    /**
	     * Base object for prototypal inheritance.
	     */
	    var Base = C_lib.Base = (function () {
	        function F() {}

	        return {
	            /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */
	            extend: function (overrides) {
	                // Spawn
	                F.prototype = this;
	                var subtype = new F();

	                // Augment
	                if (overrides) {
	                    subtype.mixIn(overrides);
	                }

	                // Create default initializer
	                if (!subtype.hasOwnProperty('init')) {
	                    subtype.init = function () {
	                        subtype.$super.init.apply(this, arguments);
	                    };
	                }

	                // Initializer's prototype is the subtype object
	                subtype.init.prototype = subtype;

	                // Reference supertype
	                subtype.$super = this;

	                return subtype;
	            },

	            /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */
	            create: function () {
	                var instance = this.extend();
	                instance.init.apply(instance, arguments);

	                return instance;
	            },

	            /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */
	            init: function () {
	            },

	            /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */
	            mixIn: function (properties) {
	                for (var propertyName in properties) {
	                    if (properties.hasOwnProperty(propertyName)) {
	                        this[propertyName] = properties[propertyName];
	                    }
	                }

	                // IE won't copy toString using the loop above
	                if (properties.hasOwnProperty('toString')) {
	                    this.toString = properties.toString;
	                }
	            },

	            /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */
	            clone: function () {
	                return this.init.prototype.extend(this);
	            }
	        };
	    }());

	    /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    var WordArray = C_lib.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 4;
	            }
	        },

	        /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */
	        toString: function (encoder) {
	            return (encoder || Hex).stringify(this);
	        },

	        /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */
	        concat: function (wordArray) {
	            // Shortcuts
	            var thisWords = this.words;
	            var thatWords = wordArray.words;
	            var thisSigBytes = this.sigBytes;
	            var thatSigBytes = wordArray.sigBytes;

	            // Clamp excess bits
	            this.clamp();

	            // Concat
	            if (thisSigBytes % 4) {
	                // Copy one byte at a time
	                for (var i = 0; i < thatSigBytes; i++) {
	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
	                }
	            } else if (thatWords.length > 0xffff) {
	                // Copy one word at a time
	                for (var i = 0; i < thatSigBytes; i += 4) {
	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
	                }
	            } else {
	                // Copy all words at once
	                thisWords.push.apply(thisWords, thatWords);
	            }
	            this.sigBytes += thatSigBytes;

	            // Chainable
	            return this;
	        },

	        /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */
	        clamp: function () {
	            // Shortcuts
	            var words = this.words;
	            var sigBytes = this.sigBytes;

	            // Clamp
	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
	            words.length = Math.ceil(sigBytes / 4);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone.words = this.words.slice(0);

	            return clone;
	        },

	        /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */
	        random: function (nBytes) {
	            var words = [];

	            var r = (function (m_w) {
	                var m_w = m_w;
	                var m_z = 0x3ade68b1;
	                var mask = 0xffffffff;

	                return function () {
	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
	                    var result = ((m_z << 0x10) + m_w) & mask;
	                    result /= 0x100000000;
	                    result += 0.5;
	                    return result * (Math.random() > .5 ? 1 : -1);
	                }
	            });

	            for (var i = 0, rcache; i < nBytes; i += 4) {
	                var _r = r((rcache || Math.random()) * 0x100000000);

	                rcache = _r() * 0x3ade67b7;
	                words.push((_r() * 0x100000000) | 0);
	            }

	            return new WordArray.init(words, nBytes);
	        }
	    });

	    /**
	     * Encoder namespace.
	     */
	    var C_enc = C.enc = {};

	    /**
	     * Hex encoding strategy.
	     */
	    var Hex = C_enc.Hex = {
	        /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var hexChars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                hexChars.push((bite >>> 4).toString(16));
	                hexChars.push((bite & 0x0f).toString(16));
	            }

	            return hexChars.join('');
	        },

	        /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */
	        parse: function (hexStr) {
	            // Shortcut
	            var hexStrLength = hexStr.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < hexStrLength; i += 2) {
	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
	            }

	            return new WordArray.init(words, hexStrLength / 2);
	        }
	    };

	    /**
	     * Latin1 encoding strategy.
	     */
	    var Latin1 = C_enc.Latin1 = {
	        /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var latin1Chars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                latin1Chars.push(String.fromCharCode(bite));
	            }

	            return latin1Chars.join('');
	        },

	        /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */
	        parse: function (latin1Str) {
	            // Shortcut
	            var latin1StrLength = latin1Str.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < latin1StrLength; i++) {
	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
	            }

	            return new WordArray.init(words, latin1StrLength);
	        }
	    };

	    /**
	     * UTF-8 encoding strategy.
	     */
	    var Utf8 = C_enc.Utf8 = {
	        /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            try {
	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
	            } catch (e) {
	                throw new Error('Malformed UTF-8 data');
	            }
	        },

	        /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */
	        parse: function (utf8Str) {
	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	        }
	    };

	    /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
	        /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */
	        reset: function () {
	            // Initial values
	            this._data = new WordArray.init();
	            this._nDataBytes = 0;
	        },

	        /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */
	        _append: function (data) {
	            // Convert string to WordArray, else assume WordArray already
	            if (typeof data == 'string') {
	                data = Utf8.parse(data);
	            }

	            // Append
	            this._data.concat(data);
	            this._nDataBytes += data.sigBytes;
	        },

	        /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */
	        _process: function (doFlush) {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;
	            var dataSigBytes = data.sigBytes;
	            var blockSize = this.blockSize;
	            var blockSizeBytes = blockSize * 4;

	            // Count blocks ready
	            var nBlocksReady = dataSigBytes / blockSizeBytes;
	            if (doFlush) {
	                // Round up to include partial blocks
	                nBlocksReady = Math.ceil(nBlocksReady);
	            } else {
	                // Round down to include only full blocks,
	                // less the number of blocks that must remain in the buffer
	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
	            }

	            // Count words ready
	            var nWordsReady = nBlocksReady * blockSize;

	            // Count bytes ready
	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

	            // Process blocks
	            if (nWordsReady) {
	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
	                    // Perform concrete-algorithm logic
	                    this._doProcessBlock(dataWords, offset);
	                }

	                // Remove processed words
	                var processedWords = dataWords.splice(0, nWordsReady);
	                data.sigBytes -= nBytesReady;
	            }

	            // Return processed words
	            return new WordArray.init(processedWords, nBytesReady);
	        },

	        /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone._data = this._data.clone();

	            return clone;
	        },

	        _minBufferSize: 0
	    });

	    /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */
	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         */
	        cfg: Base.extend(),

	        /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */
	        init: function (cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-hasher logic
	            this._doReset();
	        },

	        /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            // Append
	            this._append(messageUpdate);

	            // Update the hash
	            this._process();

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Final message update
	            if (messageUpdate) {
	                this._append(messageUpdate);
	            }

	            // Perform concrete-hasher logic
	            var hash = this._doFinalize();

	            return hash;
	        },

	        blockSize: 512/32,

	        /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */
	        _createHelper: function (hasher) {
	            return function (message, cfg) {
	                return new hasher.init(cfg).finalize(message);
	            };
	        },

	        /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */
	        _createHmacHelper: function (hasher) {
	            return function (message, key) {
	                return new C_algo.HMAC.init(hasher, key).finalize(message);
	            };
	        }
	    });

	    /**
	     * Algorithm namespace.
	     */
	    var C_algo = C.algo = {};

	    return C;
	}(Math));


	return CryptoJS;

}));
define('cryptoJs', ['cryptoJs/core'], function (main) { return main; });

;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define('cryptoJs/sha1',["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var Hasher = C_lib.Hasher;
	    var C_algo = C.algo;

	    // Reusable object
	    var W = [];

	    /**
	     * SHA-1 hash algorithm.
	     */
	    var SHA1 = C_algo.SHA1 = Hasher.extend({
	        _doReset: function () {
	            this._hash = new WordArray.init([
	                0x67452301, 0xefcdab89,
	                0x98badcfe, 0x10325476,
	                0xc3d2e1f0
	            ]);
	        },

	        _doProcessBlock: function (M, offset) {
	            // Shortcut
	            var H = this._hash.words;

	            // Working variables
	            var a = H[0];
	            var b = H[1];
	            var c = H[2];
	            var d = H[3];
	            var e = H[4];

	            // Computation
	            for (var i = 0; i < 80; i++) {
	                if (i < 16) {
	                    W[i] = M[offset + i] | 0;
	                } else {
	                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
	                    W[i] = (n << 1) | (n >>> 31);
	                }

	                var t = ((a << 5) | (a >>> 27)) + e + W[i];
	                if (i < 20) {
	                    t += ((b & c) | (~b & d)) + 0x5a827999;
	                } else if (i < 40) {
	                    t += (b ^ c ^ d) + 0x6ed9eba1;
	                } else if (i < 60) {
	                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
	                } else /* if (i < 80) */ {
	                    t += (b ^ c ^ d) - 0x359d3e2a;
	                }

	                e = d;
	                d = c;
	                c = (b << 30) | (b >>> 2);
	                b = a;
	                a = t;
	            }

	            // Intermediate hash value
	            H[0] = (H[0] + a) | 0;
	            H[1] = (H[1] + b) | 0;
	            H[2] = (H[2] + c) | 0;
	            H[3] = (H[3] + d) | 0;
	            H[4] = (H[4] + e) | 0;
	        },

	        _doFinalize: function () {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;

	            var nBitsTotal = this._nDataBytes * 8;
	            var nBitsLeft = data.sigBytes * 8;

	            // Add padding
	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
	            data.sigBytes = dataWords.length * 4;

	            // Hash final blocks
	            this._process();

	            // Return final computed hash
	            return this._hash;
	        },

	        clone: function () {
	            var clone = Hasher.clone.call(this);
	            clone._hash = this._hash.clone();

	            return clone;
	        }
	    });

	    /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.SHA1('message');
	     *     var hash = CryptoJS.SHA1(wordArray);
	     */
	    C.SHA1 = Hasher._createHelper(SHA1);

	    /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacSHA1(message, key);
	     */
	    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
	}());


	return CryptoJS.SHA1;

}));
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

define('epub-fetch/encryption_handler',['cryptoJs/sha1'], function (SHA1) {

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

define('epub-fetch/publication_fetcher',['jquery', 'URIjs', './markup_parser', './plain_resource_fetcher', './zip_resource_fetcher',
    './content_document_fetcher', './resource_cache', './encryption_handler'],
    function ($, URI, MarkupParser, PlainResourceFetcher, ZipResourceFetcher, ContentDocumentFetcher,
              ResourceCache, EncryptionHandler) {

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

        this.convertPathRelativeToPackageToRelativeToBase = function (relativeToPackagePath) {
            return new URI(relativeToPackagePath).absoluteTo(_packageFullPath).toString();
        };

        this.relativeToPackageFetchFileContents = function(relativeToPackagePath, fetchMode, fetchCallback, onerror) {

            if (! onerror) {
                onerror = _handleError;
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

define('epub-fetch', ['epub-fetch/publication_fetcher'], function (main) { return main; });

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

define('epub-model/package_document',['jquery', 'underscore', 'URIjs'],
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

define('epub-model/smil_document_parser',['jquery', 'underscore'], function ($, _) {

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

define('epub-model/metadata',['underscore'],
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

define('epub-model/manifest',['underscore'],
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

define('epub-model/package_document_parser',['jquery', 'underscore', 'epub-fetch/markup_parser', 'URIjs', './package_document',
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

define('epub-model', ['epub-model/package_document_parser'], function (main) { return main; });

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

define('epub-fetch/iframe_zip_loader',['URIjs', 'views/iframe_loader', 'underscore'], function(URI, IFrameLoader, _){

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


define('Readium',['text!version.json', 'jquery', 'underscore', 'views/reader_view', 'epub-fetch',
        'epub-model/package_document_parser', 'epub-fetch/iframe_zip_loader', 'views/iframe_loader',
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
       
        // is false by default, but just making this initialisation setting more explicit here.
        readerOptions.needsFixedLayoutScalerWorkAround = false;
        
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

define('readium-js',['Readium'], function (Readium) {
//noop
});


//# sourceMappingURL=readium-js.js.map