//  LauncherOSX
//
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('globals',['underscore','eventEmitter'], function(_, EventEmitter) {
/**
 * Top level ReadiumSDK namespace
 * @namespace
 */
var Globals = {

    /**
     * Current version of the JS SDK
     * @static
     * @return {string} version
     */
    version: function () {
        return "0.8.0";
    },
    /**
     * @namespace
     */
    Views: {
        /**
         * Landscape Orientation
         */
        ORIENTATION_LANDSCAPE: "orientation_landscape",
        /**
         * Portrait Orientation
         */
        ORIENTATION_PORTRAIT: "orientation_portrait"
    },
    /**
     * @namespace
     */
    Events: {
        /**
         * @event
         */
        READER_INITIALIZED: "ReaderInitialized",
        /**
         * This gets triggered on every page turnover. It includes spine information and such.
         * @event
         */
        PAGINATION_CHANGED: "PaginationChanged",
        /**
         * @event
         */
        SETTINGS_APPLIED: "SettingsApplied",
        /**
         * @event
         */
        FXL_VIEW_RESIZED: "FXLViewResized",
        /**
         * @event
         */
        READER_VIEW_CREATED: "ReaderViewCreated",
        /**
         * @event
         */
        READER_VIEW_DESTROYED: "ReaderViewDestroyed",
        /**
         * @event
         */
        CONTENT_DOCUMENT_LOAD_START: "ContentDocumentLoadStart",
        /**
         * @event
         */
        CONTENT_DOCUMENT_LOADED: "ContentDocumentLoaded",
        /**
         * @event
         */
        MEDIA_OVERLAY_STATUS_CHANGED: "MediaOverlayStatusChanged",
        /**
         * @event
         */
        MEDIA_OVERLAY_TTS_SPEAK: "MediaOverlayTTSSpeak",
        /**
         * @event
         */
        MEDIA_OVERLAY_TTS_STOP: "MediaOverlayTTSStop",
        /**
         * @event
         */
        PLUGINS_LOADED: "PluginsLoaded"
    },
    /**
     * Internal Events
     *
     * @desc Should not be triggered outside of {@link Views.ReaderView}.
     * @namespace
     */
    InternalEvents: {
        /**
         * @event
         */
        CURRENT_VIEW_PAGINATION_CHANGED: "CurrentViewPaginationChanged",
    }

};
_.extend(Globals, new EventEmitter());

return Globals;

});

//This is default implementation of reading system object that will be available for the publication's javascript to analyze at runtime
//To extend/modify/replace this object reading system should subscribe Globals.Events.READER_INITIALIZED and apply changes in reaction to this event
navigator.epubReadingSystem = {
    name: "",
    version: "0.0.0",
    layoutStyle: "paginated",

    hasFeature: function (feature, version) {

        // for now all features must be version 1.0 so fail fast if the user has asked for something else
        if (version && version !== "1.0") {
            return false;
        }

        if (feature === "dom-manipulation") {
            // Scripts may make structural changes to the document???s DOM (applies to spine-level scripting only).
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
};
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

//'text!empty:'
define('globalsSetup',['console_shim', 'eventEmitter', 'URIjs', 'epubCfi', 'globals'], function (console_shim, EventEmitter, URI, epubCfi, Globals) {

    console.log("Globals...");

    if (window["ReadiumSDK"]) {
        console.log("ReadiumSDK extend.");
        _.extend(window.ReadiumSDK, Globals);
    } else {
        console.log("ReadiumSDK set.");
        window.ReadiumSDK = Globals;
    }
    
    
    // TODO: refactor client code to use emit instead of trigger?
    EventEmitter.prototype.trigger = EventEmitter.prototype.emit;

    // TODO pass as dependency injection define() function parameter, not window global!
    window.EventEmitter = EventEmitter;

    // TODO pass as dependency injection define() function parameter, not window global!
    window.URI = URI;

    // window.URL accessor to window.webkitURL (Safari 6 support)
    if ('URL' in window === false) {
        if ('webkitURL' in window === false) {
            throw Error('Browser does not support window.URL');
        }

        window.URL = window.webkitURL;
    }
});

//
//  Created by Juan Corona
//  Based on original proposal by Mickaël Menu
//  Portions adapted from Rangy's Module system: Copyright (c) 2014 Tim Down
//
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
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('plugins-controller',["jquery", "underscore", "eventEmitter", "globals"], function ($, _, EventEmitter, Globals) {
    
    /**
     * A  plugins controller used to easily add plugins from the host app, eg.
     * ReadiumSDK.Plugins.register("footnotes", function(api){ ... });
     *
     * @constructor
     */
    var PluginsController = function () {
        var self = this;

        var _pluginConstructors = {};

        function _initializePlugins(reader) {
            var apiFactory = new PluginApiFactory(reader);

            if (!reader.plugins) {
                //attach an object to the reader that will be
                // used for plugin namespaces and their extensions
                reader.plugins = {};
            } else {
                throw new Error("Already initialized on reader!");
            }
            _.each(_pluginConstructors, function (plugin) {
                plugin().init(apiFactory);
            });
        }

        function _getExceptionMessage(ex) {
            return ex.message || ex.description || String(ex);
        }

        // Creates a new instance of the given plugin constructor.
        this.register = function (name, optDependencies, initFunc) {

            if (_pluginConstructors[name]) {
                throw new Error("Duplicate registration for plugin with name: " + name);
            }

            _pluginConstructors[name] = function () {
                var dependencies;
                if (typeof optDependencies === 'function') {
                    initFunc = optDependencies;
                } else {
                    dependencies = optDependencies;
                }

                return new Plugin(name, dependencies, function (plugin, api) {
                    if (!plugin.initialized) {
                        plugin.initialized = true;
                        try {
                            initFunc.call({}, api);
                            plugin.supported = true;
                        } catch (ex) {
                            plugin.fail(_getExceptionMessage(ex));
                        }
                    }
                });
            };
        };

        Globals.on(Globals.Events.READER_INITIALIZED, function (reader) {

            try {
                _initializePlugins(reader);
            } catch (ex) {
                console.error("Plugins failed to initialize:" + _getExceptionMessage(ex));
            }

            _.defer(function () {
                Globals.emit(Globals.Events.PLUGINS_LOADED, reader);
            });
        });
    };

    function PluginApi(reader, plugin) {
        this.reader = reader;
        this.plugin = plugin;

        this.extendReader = function (extendWith) {
            if (reader.plugins) {
                var obj = {};
                obj[plugin.name] = _.extend(extendWith, new EventEmitter());

                _(reader.plugins).extend(obj);
            }
        };
    }

    function PluginApiFactory(reader) {
        this.create = function (plugin) {
            return new PluginApi(reader, plugin);
        };
    }

//
//  The following is adapted from Rangy's Module class:
//
//  Copyright (c) 2014 Tim Down
//
//  The MIT License (MIT)
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.

    function Plugin(name, dependencies, initializer) {
        this.name = name;
        this.dependencies = dependencies;
        this.initialized = false;
        this.supported = false;
        this.initializer = initializer;
    }

    Plugin.prototype = {
        init: function (apiFactory) {
            var requiredPluginNames = this.dependencies || [];
            for (var i = 0, len = requiredPluginNames.length, requiredPlugin, PluginName; i < len; ++i) {
                PluginName = requiredPluginNames[i];

                requiredPlugin = Plugins[PluginName];
                if (!requiredPlugin || !(requiredPlugin instanceof Plugin)) {
                    throw new Error("required Plugin '" + PluginName + "' not found");
                }

                requiredPlugin.init(apiFactory);

                if (!requiredPlugin.supported) {
                    throw new Error("required Plugin '" + PluginName + "' not supported");
                }
            }

            // Now run initializer
            this.initializer(this, apiFactory.create(this));
        },

        fail: function (reason) {
            this.initialized = true;
            this.supported = false;
            throw new Error("Plugin '" + this.name + "' failed to load: " + reason);
        },

        warn: function (msg) {
            console.warn("Plugin " + this.name + ": " + msg);
        },

        deprecationNotice: function (deprecated, replacement) {
            console.warn("DEPRECATED: " + deprecated + " in Plugin " + this.name + "is deprecated. Please use "
            + replacement + " instead");
        },

        createError: function (msg) {
            return new Error("Error in " + this.name + " Plugin: " + msg);
        }
    };

    var instance = new PluginsController();
    Globals.Plugins = instance;
    return instance;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/bookmark_data',[],function() {
/**
 * @class Models.BookmarkData
 */
var BookmarkData = function(idref, contentCFI) {

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

    this.toString = function () {
        return JSON.stringify(this);
    }
};

return BookmarkData;
});
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/current_pages_info',[],function() {

/**
 * Used to report pagination state back to the host application
 *
 * @class Models.CurrentPagesInfo
 *
 * @constructor
 *
 * @param {Models.Spine} spine
 * @param {boolean} isFixedLayout is fixed or reflowable spine item
*/
var CurrentPagesInfo = function(spine, isFixedLayout) {


    this.isRightToLeft = spine.isRightToLeft();
    this.isFixedLayout = isFixedLayout;
    this.spineItemCount = spine.items.length
    this.openPages = [];

    this.addOpenPage = function(spineItemPageIndex, spineItemPageCount, idref, spineItemIndex) {
        this.openPages.push({spineItemPageIndex: spineItemPageIndex, spineItemPageCount: spineItemPageCount, idref: idref, spineItemIndex: spineItemIndex});

        this.sort();
    };

    this.canGoLeft = function () {
        return this.isRightToLeft ? this.canGoNext() : this.canGoPrev();
    };

    this.canGoRight = function () {
        return this.isRightToLeft ? this.canGoPrev() : this.canGoNext();
    };

    this.canGoNext = function() {

        if(this.openPages.length == 0)
            return false;

        var lastOpenPage = this.openPages[this.openPages.length - 1];

        // TODO: handling of non-linear spine items ("ancillary" documents), allowing page turn within the reflowable XHTML, but preventing previous/next access to sibling spine items. Also needs "go back" feature to navigate to source hyperlink location that led to the non-linear document.
        // See https://github.com/readium/readium-shared-js/issues/26

        // Removed, needs to be implemented properly as per above.
        // See https://github.com/readium/readium-shared-js/issues/108
        // if(!spine.isValidLinearItem(lastOpenPage.spineItemIndex))
        //     return false;

        return lastOpenPage.spineItemIndex < spine.last().index || lastOpenPage.spineItemPageIndex < lastOpenPage.spineItemPageCount - 1;
    };

    this.canGoPrev = function() {

        if(this.openPages.length == 0)
            return false;

        var firstOpenPage = this.openPages[0];

        // TODO: handling of non-linear spine items ("ancillary" documents), allowing page turn within the reflowable XHTML, but preventing previous/next access to sibling spine items. Also needs "go back" feature to navigate to source hyperlink location that led to the non-linear document.
        // See https://github.com/readium/readium-shared-js/issues/26

        // Removed, needs to be implemented properly as per above.
        // //https://github.com/readium/readium-shared-js/issues/108
        // if(!spine.isValidLinearItem(firstOpenPage.spineItemIndex))
        //     return false;

        return spine.first().index < firstOpenPage.spineItemIndex || 0 < firstOpenPage.spineItemPageIndex;
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

return CurrentPagesInfo;
});
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/fixed_page_spread',[],function() {
/**
 *
 * @param {Models.Spine} spine
 * @constructor
 */
var Spread = function(spine, isSyntheticSpread) {

    var self = this;

    this.spine = spine;

    this.leftItem = undefined;
    this.rightItem = undefined;
    this.centerItem = undefined;

    var _isSyntheticSpread = isSyntheticSpread;

    this.setSyntheticSpread = function(isSyntheticSpread) {
        _isSyntheticSpread = isSyntheticSpread;
    };

    this.isSyntheticSpread = function() {
        return _isSyntheticSpread;
    };

    this.openFirst = function() {

        if( this.spine.items.length == 0 ) {
            resetItems();
        }
        else {
            this.openItem(this.spine.first());
        }
    };

    this.openLast = function() {

        if( this.spine.items.length == 0 ) {
            resetItems();
        }
        else {
            this.openItem(this.spine.last());
        }
    };

    this.openItem = function(item) {

        resetItems();

        var position = getItemPosition(item);
        setItemToPosition(item, position);

        if(position != Spread.POSITION_CENTER && this.spine.isValidLinearItem(item.index)) { // && item.isRenditionSpreadAllowed() not necessary, see getItemPosition() below
            var neighbour = getNeighbourItem(item);
            if(neighbour) {
                var neighbourPos = getItemPosition(neighbour);
                if(neighbourPos != position
                    && neighbourPos != Spread.POSITION_CENTER
                    && !neighbour.isReflowable()
                    && neighbour.isRenditionSpreadAllowed())  {
                    setItemToPosition(neighbour, neighbourPos);
                }
            }
        }
    };

    function resetItems() {

        self.leftItem = undefined;
        self.rightItem = undefined;
        self.centerItem = undefined;
    }

    function setItemToPosition(item, position) {

        if(position == Spread.POSITION_LEFT) {
            self.leftItem = item;
        }
        else if (position == Spread.POSITION_RIGHT) {
            self.rightItem = item;
        }
        else {

            if(position != Spread.POSITION_CENTER) {
                console.error("Unrecognized position value");
            }

            self.centerItem = item;
        }
    }

    function getItemPosition(item) {
        
        // includes !item.isRenditionSpreadAllowed() ("rendition:spread-none") ==> force center position
        if(!_isSyntheticSpread) {
            return Spread.POSITION_CENTER;
        }

        if(item.isLeftPage()) {
            return Spread.POSITION_LEFT;
        }

        if (item.isRightPage()) {
            return Spread.POSITION_RIGHT;
        }

        return Spread.POSITION_CENTER;
    }

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
    };

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
    };

    function getNeighbourItem(item) {

        if(item.isLeftPage()) {
            return self.spine.isRightToLeft() ? self.spine.prevItem(item) : self.spine.nextItem(item);
        }

        if(item.isRightPage()) {
            return self.spine.isRightToLeft() ? self.spine.nextItem(item) : self.spine.prevItem(item);
        }

        return undefined;
    }

};

Spread.POSITION_LEFT = "left";
Spread.POSITION_RIGHT = "right";
Spread.POSITION_CENTER = "center";

return Spread;
});
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/spine_item',[], function() {

/**
 * Wrapper of the SpineItem object received from the host application
 *
 * @class Models.SpineItem
 *
 * @param itemData spine item properties container
 * @param {Number} index
 * @param {Models.Spine} spine
 *
 */
var SpineItem = function(itemData, index, spine){

    var self = this;

    this.idref = itemData.idref;
    this.href = itemData.href;

    this.linear = itemData.linear ? itemData.linear.toLowerCase() : itemData.linear;

    this.page_spread = itemData.page_spread;
    
    this.rendition_viewport = itemData.rendition_viewport;
    
    this.rendition_spread = itemData.rendition_spread;
    
    //TODO: unused yet!
    this.rendition_orientation = itemData.rendition_orientation;

    this.rendition_layout = itemData.rendition_layout;
    
    this.rendition_flow = itemData.rendition_flow;
    
    
    
    this.media_overlay_id = itemData.media_overlay_id;

    this.media_type = itemData.media_type;

    this.index = index;
    this.spine = spine;

    validateSpread();

    this.setSpread = function(spread) {
        this.page_spread = spread;

        validateSpread();
    };

    this.isRenditionSpreadAllowed = function() {
        
        var rendition_spread = self.getRenditionSpread();
        return !rendition_spread || rendition_spread != SpineItem.RENDITION_SPREAD_NONE;
    };

    function validateSpread() {

        if(!self.page_spread) {
            return;
        }

        if( self.page_spread != SpineItem.SPREAD_LEFT &&
            self.page_spread != SpineItem.SPREAD_RIGHT &&
            self.page_spread != SpineItem.SPREAD_CENTER ) {

            console.error(self.page_spread + " is not a recognized spread type");
        }

    }

    this.isLeftPage = function() {
        return self.page_spread == SpineItem.SPREAD_LEFT;
    };

    this.isRightPage = function() {
        return self.page_spread == SpineItem.SPREAD_RIGHT;
    };

    this.isCenterPage = function() {
        return self.page_spread == SpineItem.SPREAD_CENTER;
    };

    this.isReflowable = function() {
        return !self.isFixedLayout();
    };

    this.isFixedLayout = function() {
        
        // cannot use isPropertyValueSetForItemOrPackage() here!

        var isLayoutExplicitlyDefined = self.getRenditionLayout();

        if(isLayoutExplicitlyDefined) {

            if (self.rendition_layout)
            {
                if (self.rendition_layout === SpineItem.RENDITION_LAYOUT_PREPAGINATED) return true;
                if (self.rendition_layout === SpineItem.RENDITION_LAYOUT_REFLOWABLE) return false;
            }

            return self.spine.package.isFixedLayout();
        }

        // if image or svg use fixed layout
        return self.media_type.indexOf("image/") >= 0;

    };

    this.getRenditionFlow = function() {

        if(self.rendition_flow) {
            return self.rendition_flow;
        }

        return self.spine.package.rendition_flow;
    };
    
    this.getRenditionViewport = function() {

        if(self.rendition_viewport) {
            return self.rendition_viewport;
        }

        return self.spine.package.rendition_viewport;
    };

    this.getRenditionSpread = function() {

        if(self.rendition_spread) {
            return self.rendition_spread;
        }

        return self.spine.package.rendition_spread;
    };

    this.getRenditionOrientation = function() {

        if(self.rendition_orientation) {
            return self.rendition_orientation;
        }

        return self.spine.package.rendition_orientation;
    };

    this.getRenditionLayout = function() {

        if(self.rendition_layout) {
            return self.rendition_layout;
        }

        return self.spine.package.rendition_layout;
    };

    function isPropertyValueSetForItemOrPackage(propName, propValue) {

        if(self[propName]) {
            return self[propName] === propValue;
        }

        if(self.spine.package[propName]) {
            return self.spine.package[propName] === propValue;
        }

        return false;
    }

    this.isFlowScrolledContinuous = function() {

        return isPropertyValueSetForItemOrPackage("rendition_flow", SpineItem.RENDITION_FLOW_SCROLLED_CONTINUOUS);
    };

    this.isFlowScrolledDoc = function() {

        return isPropertyValueSetForItemOrPackage("rendition_flow", SpineItem.RENDITION_FLOW_SCROLLED_DOC);
    };
};

SpineItem.RENDITION_LAYOUT_REFLOWABLE = "reflowable";
SpineItem.RENDITION_LAYOUT_PREPAGINATED = "pre-paginated";

SpineItem.RENDITION_ORIENTATION_LANDSCAPE = "landscape";
SpineItem.RENDITION_ORIENTATION_PORTRAIT = "portrait";
SpineItem.RENDITION_ORIENTATION_AUTO = "auto";

SpineItem.SPREAD_LEFT = "page-spread-left";
SpineItem.SPREAD_RIGHT = "page-spread-right";
SpineItem.SPREAD_CENTER = "page-spread-center";

SpineItem.RENDITION_SPREAD_NONE = "none";
SpineItem.RENDITION_SPREAD_LANDSCAPE = "landscape";
SpineItem.RENDITION_SPREAD_PORTRAIT = "portrait";
SpineItem.RENDITION_SPREAD_BOTH = "both";
SpineItem.RENDITION_SPREAD_AUTO = "auto";

SpineItem.RENDITION_FLOW_PAGINATED = "paginated";
SpineItem.RENDITION_FLOW_SCROLLED_CONTINUOUS = "scrolled-continuous";
SpineItem.RENDITION_FLOW_SCROLLED_DOC = "scrolled-doc";
SpineItem.RENDITION_FLOW_AUTO = "auto";

SpineItem.alternateSpread = function(spread) {

    if(spread === SpineItem.SPREAD_LEFT) {
        return SpineItem.SPREAD_RIGHT;
    }

    if(spread === SpineItem.SPREAD_RIGHT) {
        return SpineItem.SPREAD_LEFT;
    }

    return spread;

};
    return SpineItem;
});



//  LauncherOSX
//
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.
define('helpers',['underscore', "jquery", "jquerySizes", "./models/spine_item", "./globals"], function(_, $, JQuerySizes, SpineItem, Globals) {

var Helpers = {};

/**
 *
 * @param left
 * @param top
 * @param width
 * @param height
 * @constructor
 */
Helpers.Rect = function (left, top, width, height) {

    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;

    this.right = function () {
        return this.left + this.width;
    };

    this.bottom = function () {
        return this.top + this.height;
    };

    this.isOverlap = function (rect, tolerance) {

        if (tolerance == undefined) {
            tolerance = 0;
        }

        return !(rect.right() < this.left + tolerance ||
        rect.left > this.right() - tolerance ||
        rect.bottom() < this.top + tolerance ||
        rect.top > this.bottom() - tolerance);
    }
};

/**
 *
 * @param $element
 * @returns {Helpers.Rect}
 */
//This method treats multicolumn view as one long column and finds the rectangle of the element in this "long" column
//we are not using jQuery Offset() and width()/height() function because for multicolumn rendition_layout it produces rectangle as a bounding box of element that
// reflows between columns this is inconstant and difficult to analyze .
Helpers.Rect.fromElement = function ($element) {

    var e;
    if (_.isArray($element) || $element instanceof jQuery)
        e = $element[0];
    else
        e = $element;
    // TODODM this is somewhat hacky. Text (range?) elements don't have a position so we have to ask the parent.
    if (e.nodeType === 3) {
        e = $element.parent()[0];
    }


    var offsetLeft = e.offsetLeft;
    var offsetTop = e.offsetTop;
    var offsetWidth = e.offsetWidth;
    var offsetHeight = e.offsetHeight;

    while (e = e.offsetParent) {
        offsetLeft += e.offsetLeft;
        offsetTop += e.offsetTop;
    }

    return new Helpers.Rect(offsetLeft, offsetTop, offsetWidth, offsetHeight);
};

Helpers.UpdateHtmlFontSize = function ($epubHtml, fontSize) {


    var factor = fontSize / 100;
    var win = $epubHtml[0].ownerDocument.defaultView;
    var $textblocks = $('p, div, span, h1, h2, h3, h4, h5, h6, li, blockquote, td, pre', $epubHtml);
    var originalLineHeight;


    // need to do two passes because it is possible to have nested text blocks.
    // If you change the font size of the parent this will then create an inaccurate
    // font size for any children.
    for (var i = 0; i < $textblocks.length; i++) {
        var ele = $textblocks[i],
            fontSizeAttr = ele.getAttribute('data-original-font-size');

        if (!fontSizeAttr) {
            var style = win.getComputedStyle(ele);
            var originalFontSize = parseInt(style.fontSize);
            originalLineHeight = parseInt(style.lineHeight);

            ele.setAttribute('data-original-font-size', originalFontSize);
            // getComputedStyle will not calculate the line-height if the value is 'normal'. In this case parseInt will return NaN
            if (originalLineHeight) {
                ele.setAttribute('data-original-line-height', originalLineHeight);
            }
        }
    }

    // reset variable so the below logic works. All variables in JS are function scoped.
    originalLineHeight = 0;
    for (var i = 0; i < $textblocks.length; i++) {
        var ele = $textblocks[i],
            fontSizeAttr = ele.getAttribute('data-original-font-size'),
            lineHeightAttr = ele.getAttribute('data-original-line-height'),
            originalFontSize = Number(fontSizeAttr);

        if (lineHeightAttr) {
            originalLineHeight = Number(lineHeightAttr);
        }
        else {
            originalLineHeight = 0;
        }

        ele.style.fontSize = (originalFontSize * factor) + 'px';
        if (originalLineHeight) {
            ele.style.lineHeight = (originalLineHeight * factor) + 'px';
        }

    }
    $epubHtml.css("font-size", fontSize + "%");
};


/**
 *
 * @param contentRef
 * @param sourceFileHref
 * @returns {string}
 * @constructor
 */
Helpers.ResolveContentRef = function (contentRef, sourceFileHref) {

    if (!sourceFileHref) {
        return contentRef;
    }

    var sourceParts = sourceFileHref.split("/");
    sourceParts.pop(); //remove source file name

    var pathComponents = contentRef.split("/");

    while (sourceParts.length > 0 && pathComponents[0] === "..") {

        sourceParts.pop();
        pathComponents.splice(0, 1);
    }

    var combined = sourceParts.concat(pathComponents);

    return combined.join("/");

};

/**
 *
 * @param str
 * @param suffix
 * @returns {boolean}
 * @static
 */
Helpers.EndsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 *
 * @param str
 * @param suffix
 * @returns {boolean}
 * @static
 */
Helpers.BeginsWith = function (str, suffix) {

    return str.indexOf(suffix) === 0;
};

/**
 *
 * @param str
 * @param toRemove
 * @returns {string}
 * @static
 */
Helpers.RemoveFromString = function (str, toRemove) {

    var startIx = str.indexOf(toRemove);

    if (startIx == -1) {
        return str;
    }

    return str.substring(0, startIx) + str.substring(startIx + toRemove.length);
};

/**
 *
 * @param margin
 * @param border
 * @param padding
 * @constructor
 */
Helpers.Margins = function (margin, border, padding) {

    this.margin = margin;
    this.border = border;
    this.padding = padding;

    this.left = this.margin.left + this.border.left + this.padding.left;
    this.right = this.margin.right + this.border.right + this.padding.right;
    this.top = this.margin.top + this.border.top + this.padding.top;
    this.bottom = this.margin.bottom + this.border.bottom + this.padding.bottom;

    this.width = function () {
        return this.left + this.right;
    };

    this.height = function () {
        return this.top + this.bottom;
    }
};

/**
 *
 * @param $iframe
 */
Helpers.triggerLayout = function ($iframe) {

    var doc = $iframe[0].contentDocument;

    if (!doc) {
        return;
    }

    var ss = undefined;
    try {
        ss = doc.styleSheets && doc.styleSheets.length ? doc.styleSheets[0] : undefined;
        if (!ss) {
            var style = doc.createElement('style');
            doc.head.appendChild(style);
            style.appendChild(doc.createTextNode(''));
            ss = style.sheet;
        }

        if (ss)
            ss.insertRule('body:first-child::before {content:\'READIUM\';color: red;font-weight: bold;}', ss.cssRules.length);
    }
    catch (ex) {
        console.error(ex);
    }

    try {
        var el = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
        el.appendChild(doc.createTextNode("*{}"));
        doc.body.appendChild(el);
        doc.body.removeChild(el);

        if (ss)
            ss.deleteRule(ss.cssRules.length - 1);
    }
    catch (ex) {
        console.error(ex);
    }

    if (doc.body) {
        var val = doc.body.offsetTop; // triggers layout
    }

};

/**
 *
 * @param $viewport
 * @param spineItem
 * @param settings
 * @returns {boolean}
 */
//Based on https://docs.google.com/spreadsheet/ccc?key=0AoPMUkQhc4wcdDI0anFvWm96N0xRT184ZE96MXFRdFE&usp=drive_web#gid=0 doc
// Returns falsy and truthy
// true and false mean that the synthetic-spread or single-page is "forced" (to be respected whatever the external conditions)
// 1 and 0 mean that the synthetic-spread or single-page is "not forced" (is allowed to be overriden by external conditions, such as optimum column width / text line number of characters, etc.)
Helpers.deduceSyntheticSpread = function ($viewport, spineItem, settings) {

    if (!$viewport || $viewport.length == 0) {
        return 0; // non-forced
    }

    //http://www.idpf.org/epub/fxl/#property-spread-values

    var rendition_spread = spineItem ? spineItem.getRenditionSpread() : undefined;

    if (rendition_spread === SpineItem.RENDITION_SPREAD_NONE) {
        return false; // forced

        //"Reading Systems must not incorporate this spine item in a synthetic spread."
    }

    if (settings.syntheticSpread == "double") {
        return true; // forced
    }
    else if (settings.syntheticSpread == "single") {
        return false; // forced
    }

    if (!spineItem) {
        return 0; // non-forced
    }

    if (rendition_spread === SpineItem.RENDITION_SPREAD_BOTH) {
        return true; // forced

        //"Reading Systems should incorporate this spine item in a synthetic spread regardless of device orientation."
    }

    var orientation = Helpers.getOrientation($viewport);

    if (rendition_spread === SpineItem.RENDITION_SPREAD_LANDSCAPE) {
        return orientation === Globals.Views.ORIENTATION_LANDSCAPE; // forced

        //"Reading Systems should incorporate this spine item in a synthetic spread only when the device is in landscape orientation."
    }

    if (rendition_spread === SpineItem.RENDITION_SPREAD_PORTRAIT) {
        return orientation === Globals.Views.ORIENTATION_PORTRAIT; // forced

        //"Reading Systems should incorporate this spine item in a synthetic spread only when the device is in portrait orientation."
    }

    if (!rendition_spread || rendition_spread === SpineItem.RENDITION_SPREAD_AUTO) {
        // if no spread set in document and user didn't set in in setting we will do double for landscape
        var landscape = orientation === Globals.Views.ORIENTATION_LANDSCAPE;
        return landscape ? 1 : 0; // non-forced

        //"Reading Systems may use synthetic spreads in specific or all device orientations as part of a display area utilization optimization process."
    }

    console.warn("Helpers.deduceSyntheticSpread: spread properties?!");
    return 0; // non-forced
};

/**
 *
 * @param $element
 * @returns {Helpers.Rect}
 */
Helpers.Margins.fromElement = function ($element) {
    return new this($element.margin(), $element.border(), $element.padding());
};

/**
 * @returns {Helpers.Rect}
 */
Helpers.Margins.empty = function () {

    return new this({left: 0, right: 0, top: 0, bottom: 0}, {left: 0, right: 0, top: 0, bottom: 0}, {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    });

};

/**
 *
 * @param name
 * @param params
 * @returns {Helpers.loadTemplate.cache}
 */
Helpers.loadTemplate = function (name, params) {
    return Helpers.loadTemplate.cache[name];
};

/**
 *
 * @type {{fixed_book_frame: string, single_page_frame: string, scrolled_book_frame: string, reflowable_book_frame: string, reflowable_book_page_frame: string}}
 */
Helpers.loadTemplate.cache = {
    "fixed_book_frame": '<div id="fixed-book-frame" class="clearfix book-frame fixed-book-frame"></div>',

    "single_page_frame": '<div><div id="scaler"><iframe scrolling="no" class="iframe-fixed"></iframe></div></div>',
    //"single_page_frame" : '<div><iframe scrolling="no" class="iframe-fixed" id="scaler"></iframe></div>',

    "scrolled_book_frame": '<div id="reflowable-book-frame" class="clearfix book-frame reflowable-book-frame"><div id="scrolled-content-frame"></div></div>',
    "reflowable_book_frame": '<div id="reflowable-book-frame" class="clearfix book-frame reflowable-book-frame"></div>',
    "reflowable_book_page_frame": '<div id="reflowable-content-frame" class="reflowable-content-frame"><iframe scrolling="no" id="epubContentIframe"></iframe></div>'
};

/**
 *
 * @param styles
 * @param $element
 */
Helpers.setStyles = function (styles, $element) {

    var count = styles.length;

    if (!count) {
        return;
    }

    for (var i = 0; i < count; i++) {
        var style = styles[i];
        if (style.selector) {
            $(style.selector, $element).css(style.declarations);
        }
        else {
            $element.css(style.declarations);
        }
    }

};

/**
 *
 * @param iframe
 * @returns {boolean}
 */
Helpers.isIframeAlive = function (iframe) {
    var w = undefined;
    var d = undefined;
    try {
        w = iframe.contentWindow;
        d = iframe.contentDocument;
    }
    catch (ex) {
        console.error(ex);
        return false;
    }

    return w && d;
};

/**
 *
 * @param $viewport
 * @returns {Globals.Views.ORIENTATION_LANDSCAPE|Globals.Views.ORIENTATION_PORTRAIT}
 */
Helpers.getOrientation = function ($viewport) {

    var viewportWidth = $viewport.width();
    var viewportHeight = $viewport.height();

    if (!viewportWidth || !viewportHeight) {
        return undefined;
    }

    return viewportWidth >= viewportHeight ? Globals.Views.ORIENTATION_LANDSCAPE : Globals.Views.ORIENTATION_PORTRAIT;
};

/**
 *
 * @param item
 * @param orientation
 * @returns {boolean}
 */
Helpers.isRenditionSpreadPermittedForItem = function (item, orientation) {

    var rendition_spread = item.getRenditionSpread();

    return !rendition_spread
        || rendition_spread == SpineItem.RENDITION_SPREAD_BOTH
        || rendition_spread == SpineItem.RENDITION_SPREAD_AUTO
        || (rendition_spread == SpineItem.RENDITION_SPREAD_LANDSCAPE
        && orientation == Globals.Views.ORIENTATION_LANDSCAPE)
        || (rendition_spread == SpineItem.RENDITION_SPREAD_PORTRAIT
        && orientation == Globals.Views.ORIENTATION_PORTRAIT );
};

Helpers.CSSTransition = function ($el, trans) {

    // does not work!
    //$el.css('transition', trans);

    var css = {};
    // empty '' prefix FIRST!
    _.each(['', '-webkit-', '-moz-', '-ms-'], function (prefix) {
        css[prefix + 'transition'] = prefix + trans;
    });
    $el.css(css);
}

//scale, left, top, angle, origin
Helpers.CSSTransformString = function (options) {
    var enable3D = options.enable3D ? true : false;

    var translate, scale, rotation,
        origin = options.origin;

    if (options.left || options.top) {
        var left = options.left || 0,
            top = options.top || 0;

        translate = enable3D ? ("translate3D(" + left + "px, " + top + "px, 0)") : ("translate(" + left + "px, " + top + "px)");
    }
    if (options.scale) {
        scale = enable3D ? ("scale3D(" + options.scale + ", " + options.scale + ", 0)") : ("scale(" + options.scale + ")");
    }
    if (options.angle) {
        rotation = enable3D ? ("rotate3D(0,0," + options.angle + "deg)") : ("rotate(" + options.angle + "deg)");
    }

    if (!(translate || scale || rotation)) {
        return {};
    }

    var transformString = (translate && scale) ? (translate + " " + scale) : (translate ? translate : scale); // the order is important!
    if (rotation) {
        transformString = transformString + " " + rotation;
        //transformString = rotation + " " + transformString;
    }

    var css = {};
    css['transform'] = transformString;
    css['transform-origin'] = origin ? origin : (enable3D ? '0 0 0' : '0 0');
    return css;
};

Helpers.extendedThrottle = function (startCb, tickCb, endCb, tickRate, waitThreshold, context) {
    if (!tickRate) tickRate = 250;
    if (!waitThreshold) waitThreshold = tickRate;

    var first = true,
        last,
        deferTimer;

    return function () {
        var ctx = context || this,
            now = (Date.now && Date.now()) || new Date().getTime(),
            args = arguments;

        if (!(last && now < last + tickRate)) {
            last = now;
            if (first) {
                startCb.apply(ctx, args);
                first = false;
            } else {
                tickCb.apply(ctx, args);
            }
        }

        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
            last = now;
            first = true;
            endCb.apply(ctx, args);
        }, waitThreshold);
    };
};


//TODO: consider using CSSOM escape() or polyfill
//https://github.com/mathiasbynens/CSS.escape/blob/master/css.escape.js
//http://mathiasbynens.be/notes/css-escapes
/**
 *
 * @param sel
 * @returns {string}
 */
Helpers.escapeJQuerySelector = function (sel) {
    //http://api.jquery.com/category/selectors/
    //!"#$%&'()*+,./:;<=>?@[\]^`{|}~
    // double backslash escape

    if (!sel) return undefined;

    var selector = sel.replace(/([;&,\.\+\*\~\?':"\!\^#$%@\[\]\(\)<=>\|\/\\{}`])/g, '\\$1');

    // if (selector !== sel)
    // {
    //     console.debug("---- SELECTOR ESCAPED");
    //     console.debug("1: " + sel);
    //     console.debug("2: " + selector);
    // }
    // else
    // {
    //     console.debug("---- SELECTOR OKAY: " + sel);
    // }

    return selector;
};


return Helpers;
});
//  LauncherOSX
//
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

/**
 * CFI navigation helper class
 *
 * @param $viewport
 * @param $iframe
 * @param options Additional settings for NavigationLogic object
 *      - rectangleBased    If truthy, clientRect-based geometry will be used
 *      - paginationInfo    Layout details, used by clientRect-based geometry
 * @constructor
 */
define('views/cfi_navigation_logic',["jquery", "underscore", "../helpers", 'epubCfi'], function($, _, Helpers, epubCfi) {

var CfiNavigationLogic = function($viewport, $iframe, options){

    options = options || {};

    this.getRootElement = function(){

        return $iframe[0].contentDocument.documentElement;
    };
    
    // FIXED LAYOUT if (!options.rectangleBased) alert("!!!options.rectangleBased");
    
    var visibilityCheckerFunc = options.rectangleBased
        ? checkVisibilityByRectangles
        : checkVisibilityByVerticalOffsets;

    /**
     * @private
     * Checks whether or not pages are rendered right-to-left
     *
     * @returns {boolean}
     */
    function isPageProgressionRightToLeft() {
        return options.paginationInfo && !!options.paginationInfo.rightToLeft;
    }

    /**
     * @private
     * Checks whether or not pages are rendered with vertical writing mode
     *
     * @returns {boolean}
     */
    function isVerticalWritingMode() {
        return options.paginationInfo && !!options.paginationInfo.isVerticalWritingMode;
    }


    /**
     * @private
     * Checks whether or not a (fully adjusted) rectangle is at least partly visible
     *
     * @param {Object} rect
     * @param {Object} frameDimensions
     * @param {boolean} [isVwm]           isVerticalWritingMode
     * @returns {boolean}
     */
    function isRectVisible(rect, frameDimensions, isVwm) {
        if (isVwm) {
            return rect.top >= 0 && rect.top < frameDimensions.height;
        }
        return rect.left >= 0 && rect.left < frameDimensions.width;
    }

    /**
     * @private
     * Retrieves _current_ full width of a column (including its gap)
     *
     * @returns {number} Full width of a column in pixels
     */
    function getColumnFullWidth() {
        
        if (!options.paginationInfo || isVerticalWritingMode())
        {
            return $iframe.width();
        }
        
        return options.paginationInfo.columnWidth + options.paginationInfo.columnGap;
    }

    /**
     * @private
     *
     * Retrieves _current_ offset of a viewport
     * (related to the beginning of the chapter)
     *
     * @returns {Object}
     */
    function getVisibleContentOffsets() {
        if(isVerticalWritingMode()){
            return {
                top: (options.paginationInfo ? options.paginationInfo.pageOffset : 0)
            };
        }
        return {
            left: (options.paginationInfo ? options.paginationInfo.pageOffset : 0)
                * (isPageProgressionRightToLeft() ? -1 : 1)
        };
    }

    // Old (offsetTop-based) algorithm, useful in top-to-bottom layouts
    function checkVisibilityByVerticalOffsets(
            $element, visibleContentOffsets, shouldCalculateVisibilityOffset) {

        var elementRect = Helpers.Rect.fromElement($element);
        if (_.isNaN(elementRect.left)) {
            // this is actually a point element, doesnt have a bounding rectangle
            elementRect = new Helpers.Rect(
                    $element.position().top, $element.position().left, 0, 0);
        }
        var topOffset = visibleContentOffsets.top || 0;
        var isBelowVisibleTop = elementRect.bottom() > topOffset;
        var isAboveVisibleBottom = visibleContentOffsets.bottom !== undefined
            ? elementRect.top < visibleContentOffsets.bottom
            : true; //this check always passed, if corresponding offset isn't set

        var percentOfElementHeight = 0;
        if (isBelowVisibleTop && isAboveVisibleBottom) { // element is visible
            if (!shouldCalculateVisibilityOffset) {
                return 100;
            }
            else if (elementRect.top <= topOffset) {
                percentOfElementHeight = Math.ceil(
                    100 * (topOffset - elementRect.top) / elementRect.height
                );

                // below goes another algorithm, which has been used in getVisibleElements pattern,
                // but it seems to be a bit incorrect
                // (as spatial offset should be measured at the first visible point of the element):
                //
                // var visibleTop = Math.max(elementRect.top, visibleContentOffsets.top);
                // var visibleBottom = Math.min(elementRect.bottom(), visibleContentOffsets.bottom);
                // var visibleHeight = visibleBottom - visibleTop;
                // var percentVisible = Math.round((visibleHeight / elementRect.height) * 100);
            }
            return 100 - percentOfElementHeight;
        }
        return 0; // element isn't visible
    }

    /**
     * New (rectangle-based) algorithm, useful in multi-column layouts
     *
     * Note: the second param (props) is ignored intentionally
     * (no need to use those in normalization)
     *
     * @param {jQuery} $element
     * @param {Object} _props
     * @param {boolean} shouldCalculateVisibilityPercentage
     * @returns {number|null}
     *      0 for non-visible elements,
     *      0 < n <= 100 for visible elements
     *      (will just give 100, if `shouldCalculateVisibilityPercentage` => false)
     *      null for elements with display:none
     */
    function checkVisibilityByRectangles(
            $element, _props, shouldCalculateVisibilityPercentage) {

        var elementRectangles = getNormalizedRectangles($element);
        var clientRectangles = elementRectangles.clientRectangles;
        if (clientRectangles.length === 0) { // elements with display:none, etc.
            return null;
        }

        var isRtl = isPageProgressionRightToLeft();
        var isVwm = isVerticalWritingMode();
        var columnFullWidth = getColumnFullWidth();
        var frameDimensions = {
            width: $iframe.width(),
            height: $iframe.height()
        };

        if (clientRectangles.length === 1) {
            // because of webkit inconsistency, that single rectangle should be adjusted
            // until it hits the end OR will be based on the FIRST column that is visible
            adjustRectangle(clientRectangles[0], frameDimensions, columnFullWidth,
                    isRtl, isVwm, true);
        }

        // for an element split between several CSS columns,
        // both Firefox and IE produce as many client rectangles;
        // each of those should be checked
        var visibilityPercentage = 0;
        for (var i = 0, l = clientRectangles.length; i < l; ++i) {
            if (isRectVisible(clientRectangles[i], frameDimensions, isVwm)) {
                visibilityPercentage = shouldCalculateVisibilityPercentage
                    ? measureVisibilityPercentageByRectangles(clientRectangles, i)
                    : 100;
                break;
            }
        }
        return visibilityPercentage;
    }

    /**
     * Finds a page index (0-based) for a specific element.
     * Calculations are based on rectangles retrieved with getClientRects() method.
     *
     * @param {jQuery} $element
     * @param {number} spatialVerticalOffset
     * @returns {number|null}
     */
    function findPageByRectangles($element, spatialVerticalOffset) {
        var visibleContentOffsets = getVisibleContentOffsets();
        var elementRectangles = getNormalizedRectangles($element, visibleContentOffsets);
        var clientRectangles  = elementRectangles.clientRectangles;
        if (clientRectangles.length === 0) { // elements with display:none, etc.
            return null;
        }

        var isRtl = isPageProgressionRightToLeft();
        var isVwm = isVerticalWritingMode();
        var columnFullWidth = getColumnFullWidth();

        var frameHeight = $iframe.height();
        var frameWidth  = $iframe.width();

        if (spatialVerticalOffset) {
            trimRectanglesByVertOffset(clientRectangles, spatialVerticalOffset,
                frameHeight, columnFullWidth, isRtl, isVwm);
        }

        var firstRectangle = _.first(clientRectangles);
        if (clientRectangles.length === 1) {
            adjustRectangle(firstRectangle, {
                height: frameHeight, width: frameWidth
            }, columnFullWidth, isRtl, isVwm);
        }

        var pageIndex;

        if (isVwm) {
            var topOffset = firstRectangle.top;
            pageIndex = Math.floor(topOffset / frameHeight);
        } else {
            var leftOffset = firstRectangle.left;
            if (isRtl) {
                leftOffset = (columnFullWidth * (options.paginationInfo ? options.paginationInfo.visibleColumnCount : 1)) - leftOffset;
            }
            pageIndex = Math.floor(leftOffset / columnFullWidth);
        }

        if (pageIndex < 0) {
            pageIndex = 0;
        }
        else if (pageIndex >= (options.paginationInfo ? options.paginationInfo.columnCount : 1)) {
            pageIndex = (options.paginationInfo ? (options.paginationInfo.columnCount - 1) : 0);
        }

        return pageIndex;
    }

    /**
     * @private
     * Calculates the visibility offset percentage based on ClientRect dimensions
     *
     * @param {Array} clientRectangles (should already be normalized)
     * @param {number} firstVisibleRectIndex
     * @returns {number} - visibility percentage (0 < n <= 100)
     */
    function measureVisibilityPercentageByRectangles(
            clientRectangles, firstVisibleRectIndex) {

        var heightTotal = 0;
        var heightVisible = 0;

        if (clientRectangles.length > 1) {
            _.each(clientRectangles, function(rect, index) {
                heightTotal += rect.height;
                if (index >= firstVisibleRectIndex) {
                    // in this case, all the rectangles after the first visible
                    // should be counted as visible
                    heightVisible += rect.height;
                }
            });
        }
        else {
            // should already be normalized and adjusted
            heightTotal   = clientRectangles[0].height;
            heightVisible = clientRectangles[0].height - Math.max(
                    0, -clientRectangles[0].top);
        }
        return heightVisible === heightTotal
            ? 100 // trivial case: element is 100% visible
            : Math.floor(100 * heightVisible / heightTotal);
    }

    /**
     * @private
     * Retrieves the position of $element in multi-column layout
     *
     * @param {jQuery} $el
     * @param {Object} [visibleContentOffsets]
     * @returns {Object}
     */
    function getNormalizedRectangles($el, visibleContentOffsets) {

        visibleContentOffsets = visibleContentOffsets || {};
        var leftOffset = visibleContentOffsets.left || 0;
        var topOffset  = visibleContentOffsets.top  || 0;

        // union of all rectangles wrapping the element
        var wrapperRectangle = normalizeRectangle(
                $el[0].getBoundingClientRect(), leftOffset, topOffset);

        // all the separate rectangles (for detecting position of the element
        // split between several columns)
        var clientRectangles = [];
        var clientRectList = $el[0].getClientRects();
        for (var i = 0, l = clientRectList.length; i < l; ++i) {
            if (clientRectList[i].height > 0) {
                // Firefox sometimes gets it wrong,
                // adding literally empty (height = 0) client rectangle preceding the real one,
                // that empty client rectanle shouldn't be retrieved
                clientRectangles.push(
                    normalizeRectangle(clientRectList[i], leftOffset, topOffset));
            }
        }

        if (clientRectangles.length === 0) {
            // sometimes an element is either hidden or empty, and that means
            // Webkit-based browsers fail to assign proper clientRects to it
            // in this case we need to go for its sibling (if it exists)
            $el = $el.next();
            if ($el.length) {
                return getNormalizedRectangles($el, visibleContentOffsets);
            }
        }

        return {
            wrapperRectangle: wrapperRectangle,
            clientRectangles: clientRectangles
        };
    }

    /**
     * @private
     * Converts TextRectangle object into a plain object,
     * taking content offsets (=scrolls, position shifts etc.) into account
     *
     * @param {TextRectangle} textRect
     * @param {number} leftOffset
     * @param {number} topOffset
     * @returns {Object}
     */
    function normalizeRectangle(textRect, leftOffset, topOffset) {

        var plainRectObject = {
            left: textRect.left,
            right: textRect.right,
            top: textRect.top,
            bottom: textRect.bottom,
            width: textRect.right - textRect.left,
            height: textRect.bottom - textRect.top
        };
        offsetRectangle(plainRectObject, leftOffset, topOffset);
        return plainRectObject;
    }

    /**
     * @private
     * Offsets plain object (which represents a TextRectangle).
     *
     * @param {Object} rect
     * @param {number} leftOffset
     * @param {number} topOffset
     */
    function offsetRectangle(rect, leftOffset, topOffset) {

        rect.left   += leftOffset;
        rect.right  += leftOffset;
        rect.top    += topOffset;
        rect.bottom += topOffset;
    }

    /**
     * @private
     *
     * When element is spilled over two or more columns,
     * most of the time Webkit-based browsers
     * still assign a single clientRectangle to it, setting its `top` property to negative value
     * (so it looks like it's rendered based on the second column)
     * Alas, sometimes they decide to continue the leftmost column - from _below_ its real height.
     * In this case, `bottom` property is actually greater than element's height and had to be adjusted accordingly.
     *
     * Ugh.
     *
     * @param {Object} rect
     * @param {Object} frameDimensions
     * @param {number} columnFullWidth
     * @param {boolean} isRtl
     * @param {boolean} isVwm               isVerticalWritingMode
     * @param {boolean} shouldLookForFirstVisibleColumn
     *      If set, there'll be two-phase adjustment
     *      (to align a rectangle with a viewport)

     */
    function adjustRectangle(rect, frameDimensions, columnFullWidth, isRtl, isVwm,
            shouldLookForFirstVisibleColumn) {

        // Rectangle adjustment is not needed in VWM since it does not deal with columns
        if (isVwm) {
            return;
        }

        if (isRtl) {
            columnFullWidth *= -1; // horizontal shifts are reverted in RTL mode
        }

        // first we go left/right (rebasing onto the very first column available)
        while (rect.top < 0) {
            offsetRectangle(rect, -columnFullWidth, frameDimensions.height);
        }

        // ... then, if necessary (for visibility offset checks),
        // each column is tried again (now in reverse order)
        // the loop will be stopped when the column is aligned with a viewport
        // (i.e., is the first visible one).
        if (shouldLookForFirstVisibleColumn) {
            while (rect.bottom >= frameDimensions.height) {
                if (isRectVisible(rect, frameDimensions, isVwm)) {
                    break;
                }
                offsetRectangle(rect, columnFullWidth, -frameDimensions.height);
            }
        }
    }

    /**
     * @private
     * Trims the rectangle(s) representing the given element.
     *
     * @param {Array} rects
     * @param {number} verticalOffset
     * @param {number} frameHeight
     * @param {number} columnFullWidth
     * @param {boolean} isRtl
     * @param {boolean} isVwm               isVerticalWritingMode
     */
    function trimRectanglesByVertOffset(
            rects, verticalOffset, frameHeight, columnFullWidth, isRtl, isVwm) {

        //TODO: Support vertical writing mode
        if (isVwm) {
            return;
        }
        
        var totalHeight = _.reduce(rects, function(prev, cur) {
            return prev + cur.height;
        }, 0);

        var heightToHide = totalHeight * verticalOffset / 100;
        if (rects.length > 1) {
            var heightAccum = 0;
            do {
                heightAccum += rects[0].height;
                if (heightAccum > heightToHide) {
                    break;
                }
                rects.shift();
            } while (rects.length > 1);
        }
        else {
            // rebase to the last possible column
            // (so that adding to top will be properly processed later)
            if (isRtl) {
                columnFullWidth *= -1;
            }
            while (rects[0].bottom >= frameHeight) {
                offsetRectangle(rects[0], columnFullWidth, -frameHeight);
            }

            rects[0].top += heightToHide;
            rects[0].height -= heightToHide;
        }
    }

    //we look for text and images
    this.findFirstVisibleElement = function (props) {

        if (typeof props !== 'object') {
            // compatibility with legacy code, `props` is `topOffset` actually
            props = { top: props };
        }

        var $elements;
        var $firstVisibleTextNode = null;
        var percentOfElementHeight = 0;

        $elements = $("body", this.getRootElement()).find(":not(iframe)").contents().filter(function () {
            return isValidTextNode(this) || this.nodeName.toLowerCase() === 'img';
        });

        // Find the first visible text node
        $.each($elements, function() {

            var $element;

            if(this.nodeType === Node.TEXT_NODE)  { //text node
                $element = $(this).parent();
            }
            else {
                $element = $(this); //image
            }

            var visibilityResult = visibilityCheckerFunc($element, props, true);
            if (visibilityResult) {
                $firstVisibleTextNode = $element;
                percentOfElementHeight = 100 - visibilityResult;
                return false;
            }
            return true;
        });

        return {$element: $firstVisibleTextNode, percentY: percentOfElementHeight};
    };

    this.getFirstVisibleElementCfi = function(topOffset) {

        var foundElement = this.findFirstVisibleElement(topOffset);

        if(!foundElement.$element) {
            console.log("Could not generate CFI no visible element on page");
            return undefined;
        }

        //noinspection JSUnresolvedVariable
        var cfi = EPUBcfi.Generator.generateElementCFIComponent(foundElement.$element[0]);

        if(cfi[0] == "!") {
            cfi = cfi.substring(1);
        }

        return cfi + "@0:" + foundElement.percentY;
    };

    this.getPageForElementCfi = function(cfi, classBlacklist, elementBlacklist, idBlacklist) {

        var cfiParts = splitCfi(cfi);

        var $element = getElementByPartialCfi(cfiParts.cfi, classBlacklist, elementBlacklist, idBlacklist);

        if(!$element) {
            return -1;
        }

        return this.getPageForPointOnElement($element, cfiParts.x, cfiParts.y);
    };

    function getElementByPartialCfi(cfi, classBlacklist, elementBlacklist, idBlacklist) {

        var contentDoc = $iframe[0].contentDocument;

        var wrappedCfi = "epubcfi(" + cfi + ")";
        //noinspection JSUnresolvedVariable
        var $element = EPUBcfi.getTargetElementWithPartialCFI(wrappedCfi, contentDoc, classBlacklist, elementBlacklist, idBlacklist);

        if(!$element || $element.length == 0) {
            console.log("Can't find element for CFI: " + cfi);
            return undefined;
        }

        return $element;
    }

    this.getElementByCfi = function(cfi, classBlacklist, elementBlacklist, idBlacklist) {

        var cfiParts = splitCfi(cfi);
        return getElementByPartialCfi(cfiParts.cfi, classBlacklist, elementBlacklist, idBlacklist);
    };

    this.getPageForElement = function($element) {

        return this.getPageForPointOnElement($element, 0, 0);
    };

    this.getPageForPointOnElement = function($element, x, y) {

        var pageIndex;
        if (options.rectangleBased) {
            pageIndex = findPageByRectangles($element, y);
            if (pageIndex === null) {
                console.warn('Impossible to locate a hidden element: ', $element);
                return 0;
            }
            return pageIndex;
        }

        var posInElement = this.getVerticalOffsetForPointOnElement($element, x, y);
        return Math.floor(posInElement / $viewport.height());
    };

    this.getVerticalOffsetForElement = function($element) {

        return this.getVerticalOffsetForPointOnElement($element, 0, 0);
    };

    this.getVerticalOffsetForPointOnElement = function($element, x, y) {

        var elementRect = Helpers.Rect.fromElement($element);
        return Math.ceil(elementRect.top + y * elementRect.height / 100);
    };

    this.getElementById = function(id) {

        var contentDoc = $iframe[0].contentDocument;

        var $element = $(contentDoc.getElementById(id));
        //$("#" + Helpers.escapeJQuerySelector(id), contentDoc);
        
        if($element.length == 0) {
            return undefined;
        }

        return $element;
    };

    this.getPageForElementId = function(id) {

        var $element = this.getElementById(id);
        if(!$element) {
            return -1;
        }

        return this.getPageForElement($element);
    };

    function splitCfi(cfi) {

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
    }

    // returns raw DOM element (not $ jQuery-wrapped)
    this.getFirstVisibleMediaOverlayElement = function(visibleContentOffsets)
    {
        var docElement = this.getRootElement();
        if (!docElement) return undefined;

        var $root = $("body", docElement);
        if (!$root || !$root.length || !$root[0]) return undefined;

        var that = this;

        var firstPartial = undefined;

        function traverseArray(arr)
        {
            if (!arr || !arr.length) return undefined;

            for (var i = 0, count = arr.length; i < count; i++)
            {
                var item = arr[i];
                if (!item) continue;

                var $item = $(item);

                if($item.data("mediaOverlayData"))
                {
                    var visible = that.getElementVisibility($item, visibleContentOffsets);
                    if (visible)
                    {
                        if (!firstPartial) firstPartial = item;

                        if (visible == 100) return item;
                    }
                }
                else
                {
                    var elem = traverseArray(item.children);
                    if (elem) return elem;
                }
            }

            return undefined;
        }

        var el = traverseArray([$root[0]]);
        if (!el) el = firstPartial;
        return el;

        // var $elements = this.getMediaOverlayElements($root);
        // return this.getVisibleElements($elements, visibleContentOffsets);
    };

    this.getElementVisibility = function($element, visibleContentOffsets) {
        return visibilityCheckerFunc($element, visibleContentOffsets, true);
    };



    this.isElementVisible = visibilityCheckerFunc;





    function isValidTextNode(node) {

        if(node.nodeType === Node.TEXT_NODE) {

            // Heuristic to find a text node with actual text
            var nodeText = node.nodeValue.replace(/\n/g, "");
            nodeText = nodeText.replace(/ /g, "");

             return nodeText.length > 0;
        }

        return false;

    }

    this.getElement = function(selector) {

        var $element = $(selector, this.getRootElement());

        if($element.length > 0) {
            return $element;
        }

        return undefined;
    };

};
return CfiNavigationLogic;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/viewer_settings',[], function() {
/**
 *
 * @param settingsData
 * @constructor
 */
var ViewerSettings = function(settingsData) {

    var self = this;

    this.syntheticSpread = "auto";
    this.fontSize = 100;
    this.columnGap = 20;

    this.mediaOverlaysPreservePlaybackWhenScroll = false;

    this.mediaOverlaysSkipSkippables = false;
    this.mediaOverlaysEscapeEscapables = true;

    this.mediaOverlaysSkippables = [];
    this.mediaOverlaysEscapables = [];
    
    this.mediaOverlaysEnableClick = true;
    this.mediaOverlaysRate = 1;
    this.mediaOverlaysVolume = 100;
    
    this.mediaOverlaysSynchronizationGranularity = "";

    this.mediaOverlaysAutomaticPageTurn = true;

    this.enableGPUHardwareAccelerationCSS3D = false;

    // -1 ==> disable
    // [0...n] ==> index of transition in pre-defined array
    this.pageTransition = -1;
    
    this.scroll = "auto";

    function buildArray(str)
    {
        var retArr = [];
        var arr = str.split(/[\s,;]+/); //','
        for (var i = 0; i < arr.length; i++)
        {
            var item = arr[i].trim();
            if (item !== "")
            {
                retArr.push(item);
            }
        }
        return retArr;
    }

    function mapProperty(propName, settingsData, functionToApply) {

        if(settingsData[propName] !== undefined) {
            if(functionToApply) {

                self[propName] = functionToApply(settingsData[propName]);
            }
            else {
                self[propName] = settingsData[propName];
            }
        }

    }

    this.update = function(settingsData) {

        mapProperty("columnGap", settingsData);
        mapProperty("fontSize", settingsData);
        mapProperty("mediaOverlaysPreservePlaybackWhenScroll", settingsData);
        mapProperty("mediaOverlaysSkipSkippables", settingsData);
        mapProperty("mediaOverlaysEscapeEscapables", settingsData);
        mapProperty("mediaOverlaysSkippables", settingsData, buildArray);
        mapProperty("mediaOverlaysEscapables", settingsData, buildArray);
        mapProperty("mediaOverlaysEnableClick", settingsData);
        mapProperty("mediaOverlaysRate", settingsData);
        mapProperty("mediaOverlaysVolume", settingsData);
        mapProperty("mediaOverlaysSynchronizationGranularity", settingsData);
        mapProperty("mediaOverlaysAutomaticPageTurn", settingsData);
        mapProperty("scroll", settingsData);
        mapProperty("syntheticSpread", settingsData);
        mapProperty("pageTransition", settingsData);
        mapProperty("enableGPUHardwareAccelerationCSS3D", settingsData);
    };

    this.update(settingsData);
};
    return ViewerSettings;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.


define('views/one_page_view',["jquery", "underscore", "eventEmitter", "./cfi_navigation_logic", "../helpers", "../models/viewer_settings"],
    function ($, _, EventEmitter, CfiNavigationLogic, Helpers, ViewerSettings) {

/**
 * Renders one page of fixed layout spread
 *
 * @param options
 * @param classes
 * @param enableBookStyleOverrides
 * @constructor
 */
var OnePageView = function (options, classes, enableBookStyleOverrides, reader) {

    _.extend(this, new EventEmitter());

    var self = this;

    var _$epubHtml;
    var _$el;
    var _$iframe;
    var _currentSpineItem;
    var _spine = options.spine;
    var _iframeLoader = options.iframeLoader;
    var _bookStyles = options.bookStyles;

    var _$viewport = options.$viewport;

    var _isIframeLoaded = false;

    var _$scaler;

    var PageTransitionHandler = function (opts) {
        var PageTransition = function (begin, end) {
            this.begin = begin;
            this.end = end;
        };

        var _pageTransition_OPACITY = new PageTransition(
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "0");
            },
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("transform", "none");

                Helpers.CSSTransition($el, "opacity 150ms ease-out");

                $el.css("opacity", "1");
            }
        );

        var _pageTransition_TRANSLATE = new PageTransition(
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "0");

                var elWidth = Math.ceil(meta_width * scale);

                var initialLeft = elWidth * 0.8 * (pageSwitchDir === 2 ? 1 : -1);
                var move = Helpers.CSSTransformString({
                    left: Math.round(initialLeft),
                    origin: "50% 50% 0",
                    enable3D: _enable3D
                });
                $el.css(move);
            },
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "1");

                Helpers.CSSTransition($el, "transform 150ms ease-out");

                $el.css("transform", "none");
            }
        );

        var _pageTransition_ROTATE = new PageTransition(
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "0");

                var elWidth = Math.ceil(meta_width * scale);

                var initialLeft = elWidth * 1.7 * (pageSwitchDir === 2 ? 1 : -1);
                var trans = Helpers.CSSTransformString({
                    left: Math.round(initialLeft),
                    angle: (pageSwitchDir === 2 ? -1 : 1) * 30,
                    origin: "50% 50% 0",
                    enable3D: _enable3D
                }); //(pageSwitchDir === 2 ? '0% 0%' : '100% 0%')
                $el.css(trans);
            },
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "1");

                Helpers.CSSTransition($el, "transform 300ms ease-in-out");

                $el.css("transform", "none");
            }
        );

        var _pageTransition_SWING = new PageTransition(
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "0");

                // SUPER HACKY!! (just for demo)
                var isLeft = false;
                var isCenter = false;
                var isRight = false;
                for (var i = 0; i < classes.length; i++) {
                    var c = classes[i].toLowerCase();
                    if (c.indexOf("left") >= 0) {
                        isLeft = true;
                        break;
                    }
                    if (c.indexOf("right") >= 0) {
                        isRight = true;
                        break;
                    }
                    if (c.indexOf("center") >= 0) {
                        isCenter = true;
                        break;
                    }
                }

                var elWidth = Math.ceil(meta_width * scale);

                var initialLeft = elWidth * 0.5 * ((isLeft || isCenter && pageSwitchDir === 1) ? 1 : -1);
                var trans = Helpers.CSSTransformString({
                    scale: 0.2,
                    left: Math.round(initialLeft),
                    angle: ((isLeft || isCenter && pageSwitchDir === 1) ? 1 : -1) * 30,
                    origin: '50% 50% 0',
                    enable3D: _enable3D
                });
                $el.css(trans);
            },
            function (scale, left, top, $el, meta_width, meta_height, pageSwitchDir) {
                $el.css("opacity", "1");

                Helpers.CSSTransition($el, "transform 400ms ease-out");

                $el.css("transform", "none");
            }
        );

        var _pageTransitions = [];
        _pageTransitions.push(_pageTransition_OPACITY); // 0
        _pageTransitions.push(_pageTransition_TRANSLATE); // 1
        _pageTransitions.push(_pageTransition_ROTATE); // 2
        _pageTransitions.push(_pageTransition_SWING); // 3

        var _disablePageTransitions = opts.disablePageTransitions || false;

        var _pageTransition = -1;

        var _enable3D = new ViewerSettings({}).enableGPUHardwareAccelerationCSS3D;

        var _viewerSettings = undefined;
        this.updateOptions = function (o) {
            _viewerSettings = o;

            var settings = _viewerSettings;
            if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined") {
                //defaults
                settings = new ViewerSettings({});
            }
            if (settings.enableGPUHardwareAccelerationCSS3D) {
                _enable3D = true;
            }

            if (o.pageTransition !== null && typeof o.pageTransition !== "undefined") {
                _pageTransition = o.pageTransition;
            }
        };
        this.updateOptions(opts);

        var _pageSwitchDir = 0;
        var _pageSwitchActuallyChanged = false;
        var _pageSwitchActuallyChanged_IFRAME_LOAD = false;

        // dir: 0 => new or same page, 1 => previous, 2 => next
        this.updatePageSwitchDir = function (dir, hasChanged) {
            if (_pageSwitchActuallyChanged_IFRAME_LOAD) {
                return;
            }

            _pageSwitchDir = dir;
            _pageSwitchActuallyChanged = hasChanged;
        };

        this.onIFrameLoad = function () {
            _pageSwitchActuallyChanged_IFRAME_LOAD = true; // second pass, but initial display for transition
        };

        this.transformContentImmediate_BEGIN = function ($el, scale, left, top) {
            var pageSwitchActuallyChanged = _pageSwitchActuallyChanged || _pageSwitchActuallyChanged_IFRAME_LOAD;
            _pageSwitchActuallyChanged_IFRAME_LOAD = false;

            if (_disablePageTransitions || _pageTransition === -1) return;

            Helpers.CSSTransition($el, "all 0 ease 0");

            if (!pageSwitchActuallyChanged) return;

            var pageTransition = (_pageTransition >= 0 && _pageTransition < _pageTransitions.length) ? _pageTransitions[_pageTransition] : undefined;

            if (_pageSwitchDir === 0 || !pageTransition) {
                $el.css("opacity", "0");
            }
            else {
                pageTransition.begin(scale, left, top, $el, self.meta_width(), self.meta_height(), _pageSwitchDir);
            }
        };

        this.transformContentImmediate_END = function ($el, scale, left, top) {
            if (_disablePageTransitions || _pageTransition === -1) {
                $el.css("transform", "none");
                return;
            }

            setTimeout(function () {
                var pageTransition = (_pageTransition >= 0 && _pageTransition < _pageTransitions.length) ? _pageTransitions[_pageTransition] : undefined;

                if (_pageSwitchDir === 0 || !pageTransition) {
                    $el.css("transform", "none");

                    Helpers.CSSTransition($el, "opacity 250ms linear");

                    $el.css("opacity", "1");
                }
                else {
                    pageTransition.end(scale, left, top, $el, self.meta_width(), self.meta_height(), _pageSwitchDir);
                }

            }, 10);
        };
    };
    var _pageTransitionHandler = new PageTransitionHandler(options);


    // fixed layout does not apply user styles to publisher content, but reflowable scroll view does
    var _enableBookStyleOverrides = enableBookStyleOverrides || false;

    var _meta_size = {
        width: 0,
        height: 0
    };

    this.element = function () {
        return _$el;
    };

    this.meta_height = function () {
        return _meta_size.height;
    };

    this.meta_width = function () {
        return _meta_size.width;
    };

    this.isDisplaying = function () {

        return _isIframeLoaded;
    };

    this.render = function () {

        var template = Helpers.loadTemplate("single_page_frame", {});

        _$el = $(template);

        _$scaler = $("#scaler", _$el);

        Helpers.CSSTransition(_$el, "all 0 ease 0");

        _$el.css("transform", "none");

        var settings = reader.viewerSettings();
        if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined") {
            //defaults
            settings = new ViewerSettings({});
        }
        if (settings.enableGPUHardwareAccelerationCSS3D) {

            // This fixes rendering issues with WebView (native apps), which crops content embedded in iframes unless GPU hardware acceleration is enabled for CSS rendering.
            _$el.css("transform", "translateZ(0)");
        }

        _$el.css("height", "100%");
        _$el.css("width", "100%");

        for (var i = 0, count = classes.length; i < count; i++) {
            _$el.addClass(classes[i]);
        }

        _$iframe = $("iframe", _$el);

        return this;
    };


    this.decorateIframe = function () {
        if (!_$iframe || !_$iframe.length) return;

        _$iframe.css("border-bottom", "1px dashed silver");
        _$iframe.css("border-top", "1px dashed silver");
    };

    this.remove = function () {
        _isIframeLoaded = false;
        _currentSpineItem = undefined;
        _$el.remove();
    };

    this.clear = function () {
        _isIframeLoaded = false;
        _$iframe[0].src = "";
    };

    this.currentSpineItem = function () {

        return _currentSpineItem;
    };

    function onIFrameLoad(success) {

        if (success) {
            _isIframeLoaded = true;
            var epubContentDocument = _$iframe[0].contentDocument;
            _$epubHtml = $("html", epubContentDocument);
            if (!_$epubHtml || _$epubHtml.length == 0) {
                _$epubHtml = $("svg", epubContentDocument);
            }

            //_$epubHtml.css("overflow", "hidden");

            if (_enableBookStyleOverrides) {
                self.applyBookStyles();
            }

            updateMetaSize();

            _pageTransitionHandler.onIFrameLoad();
        }
    }

    var _viewSettings = undefined;
    this.setViewSettings = function (settings) {

        _viewSettings = settings;

        if (_enableBookStyleOverrides) {
            self.applyBookStyles();
        }

        updateMetaSize();

        _pageTransitionHandler.updateOptions(settings);
    };

    function updateHtmlFontSize() {

        if (!_enableBookStyleOverrides) return;

        if (_$epubHtml && _viewSettings) {
            Helpers.UpdateHtmlFontSize(_$epubHtml, _viewSettings.fontSize);
        }
    }

    this.applyBookStyles = function () {

        if (!_enableBookStyleOverrides) return;

        if (_$epubHtml) {
            Helpers.setStyles(_bookStyles.getStyles(), _$epubHtml);
            updateHtmlFontSize();
        }
    };

    //this is called by scroll_view for fixed spine item
    this.scaleToWidth = function (width) {

        if (_meta_size.width <= 0) return; // resize event too early!

        var scale = width / _meta_size.width;
        self.transformContentImmediate(scale, 0, 0);
    };

    //this is called by scroll_view for reflowable spine item
    this.resizeIFrameToContent = function () {
        var contHeight = getContentDocHeight();
        //console.log("resizeIFrameToContent: " + contHeight);

        self.setHeight(contHeight);

        self.showIFrame();
    };

    this.setHeight = function (height) {

        _$scaler.css("height", height + "px");
        _$el.css("height", height + "px");

//        _$iframe.css("height", height + "px");
    };

    var _useCSSTransformToHideIframe = true;

    this.showIFrame = function () {

        _$iframe.css("visibility", "visible");

        if (_useCSSTransformToHideIframe) {
            _$iframe.css("transform", "none");

            var enable3D = false;
            var settings = _viewSettings;
            if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined") {
                //defaults
                settings = new ViewerSettings({});
            }
            if (settings.enableGPUHardwareAccelerationCSS3D) {
                enable3D = true;
                _$iframe.css("transform", "translateZ(0)");
            }
        }
        else {
            _$iframe.css({left: "0px", top: "0px"});
        }
    };

    this.hideIFrame = function () {

        _$iframe.css("visibility", "hidden");

        // With some books, despite the iframe and its containing div wrapper being hidden,
        // the iframe's contentWindow / contentDocument is still visible!
        // Thus why we translate the iframe out of view instead.

        if (_useCSSTransformToHideIframe) {
            var enable3D = false;
            var settings = _viewSettings;
            if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined") {
                //defaults
                settings = new ViewerSettings({});
            }
            if (settings.enableGPUHardwareAccelerationCSS3D) {
                enable3D = true;
            }

            var css = Helpers.CSSTransformString({left: "10000", top: "10000", enable3D: enable3D});
            _$iframe.css(css);
        }
        else {
            _$iframe.css({left: "10000px", top: "10000px"});
        }
    };

    function getContentDocHeight() {

        if (!_$iframe || !_$iframe.length) {
            return 0;
        }

        if (Helpers.isIframeAlive(_$iframe[0])) {
            var win = _$iframe[0].contentWindow;
            var doc = _$iframe[0].contentDocument;

            var height = Math.round(parseFloat(win.getComputedStyle(doc.documentElement).height)); //body can be shorter!
            return height;
        }
        else if (_$epubHtml) {
            console.error("getContentDocHeight ??");

            var jqueryHeight = _$epubHtml.height();
            return jqueryHeight;
        }

        return 0;
    }

    // dir: 0 => new or same page, 1 => previous, 2 => next
    this.updatePageSwitchDir = function (dir, hasChanged) {
        _pageTransitionHandler.updatePageSwitchDir(dir, hasChanged);
    };


    this.transformContentImmediate = function (scale, left, top) {

        var elWidth = Math.ceil(_meta_size.width * scale);
        var elHeight = Math.floor(_meta_size.height * scale);

        _pageTransitionHandler.transformContentImmediate_BEGIN(_$el, scale, left, top);

        _$el.css("left", left + "px");
        _$el.css("top", top + "px");
        _$el.css("width", elWidth + "px");
        _$el.css("height", elHeight + "px");

        if (!_$epubHtml) {
//                  debugger;
            return;
        }

        var enable3D = false;
        var settings = _viewSettings;
        if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined") {
            //defaults
            settings = new ViewerSettings({});
        }
        if (settings.enableGPUHardwareAccelerationCSS3D) {
            enable3D = true;
        }

        if (reader.needsFixedLayoutScalerWorkAround()) {
            var css1 = Helpers.CSSTransformString({scale: scale, enable3D: enable3D});
            _$epubHtml.css(css1);

            var css2 = Helpers.CSSTransformString({scale: 1, enable3D: enable3D});
            css2["width"] = _meta_size.width;
            css2["height"] = _meta_size.height;
            _$scaler.css(css2);
        }
        else {
            var css = Helpers.CSSTransformString({scale: scale, enable3D: enable3D});
            css["width"] = _meta_size.width;
            css["height"] = _meta_size.height;
            _$scaler.css(css);
        }

        // Chrome workaround: otherwise text is sometimes invisible (probably a rendering glitch due to the 3D transform graphics backend?)
        //_$epubHtml.css("visibility", "hidden"); // "flashing" in two-page spread mode is annoying :(
        _$epubHtml.css("opacity", "0.999");

        self.showIFrame();

        setTimeout(function () {
            //_$epubHtml.css("visibility", "visible");
            _$epubHtml.css("opacity", "1");
        }, 0);

        _pageTransitionHandler.transformContentImmediate_END(_$el, scale, left, top);
    };

    this.getCalculatedPageHeight = function () {
        return _$el.height();
    };

    this.transformContent = _.bind(_.debounce(this.transformContentImmediate, 50), self);

    function updateMetaSize() {

        _meta_size.width = 0;
        _meta_size.height = 0;

        var size = undefined;

        var isFallbackDimension = false;
        var widthPercent = undefined;
        var heightPercent = undefined;

        var contentDocument = _$iframe[0].contentDocument;

        // first try to read viewport size
        var content = $('meta[name=viewport]', contentDocument).attr("content");

        // if not found try viewbox (used for SVG)
        if (!content) {
            content = $('meta[name=viewbox]', contentDocument).attr("content");
        }

        if (content) {
            size = parseMetaSize(content);
        }

        if (!size) {

            //var $svg = $(contentDocument).find('svg');
            // if($svg.length > 0) {
            if (contentDocument && contentDocument.documentElement && contentDocument.documentElement.nodeName && contentDocument.documentElement.nodeName.toLowerCase() == "svg") {

                var width = undefined;
                var height = undefined;

                var wAttr = contentDocument.documentElement.getAttribute("width");
                var isWidthPercent = wAttr && wAttr.length >= 1 && wAttr[wAttr.length - 1] == '%';
                if (wAttr) {
                    try {
                        width = parseInt(wAttr, 10);
                    }
                    catch (err) {}
                }
                if (width && isWidthPercent) {
                    widthPercent = width;
                    width = undefined;
                }

                var hAttr = contentDocument.documentElement.getAttribute("height");
                var isHeightPercent = hAttr && hAttr.length >= 1 && hAttr[hAttr.length - 1] == '%';
                if (hAttr) {
                    try {
                        height = parseInt(hAttr, 10);
                    }
                    catch (err) {}
                }
                if (height && isHeightPercent) {
                    heightPercent = height;
                    height = undefined;
                }

                if (width && height) {
                    size = {
                        width: width,
                        height: height
                    }
                }
                else {
                    /// DISABLED (not a satisfactory fallback)
                    // content = $svg.attr('viewBox');
                    // if(content) {
                    //     size = parseViewBoxSize(content);
                    // }
                    //
                    // if (size) {
                    //     console.warn("Viewport SVG: using viewbox!");
                    // }
                }
            }
        }

        if (!size && _currentSpineItem) {
            content = _currentSpineItem.getRenditionViewport();

            if (content) {
                size = parseMetaSize(content);
                if (size) {
                    console.log("Viewport: using rendition:viewport dimensions");
                }
            }
        }

        if (!size) {
            // Image fallback (auto-generated HTML template when WebView / iFrame is fed with image media type)
            var $img = $(contentDocument).find('img');
            if ($img.length > 0) {
                size = {
                    width: $img.width(),
                    height: $img.height()
                };

                var isImage = _currentSpineItem && _currentSpineItem.media_type && _currentSpineItem.media_type.length && _currentSpineItem.media_type.indexOf("image/") == 0;
                if (!isImage) {
                    console.warn("Viewport: using img dimensions!");
                }
            }
            else {
                $img = $(contentDocument).find('image');
                if ($img.length > 0) {
                    var width = undefined;
                    var height = undefined;

                    var wAttr = $img[0].getAttribute("width");
                    if (wAttr) {
                        try {
                            width = parseInt(wAttr, 10);
                        }
                        catch (err) {}
                    }
                    var hAttr = $img[0].getAttribute("height");
                    if (hAttr) {
                        try {
                            height = parseInt(hAttr, 10);
                        }
                        catch (err) {}
                    }


                    if (width && height) {
                        size = {
                            width: width,
                            height: height
                        };

                        isFallbackDimension = true;

                        console.warn("Viewport: using image dimensions!");
                    }
                }
            }
        }

        if (!size) {
            // Not a great fallback, as it has the aspect ratio of the full window, but it is better than no display at all.
            width = _$viewport.width();
            height = _$viewport.height();

            // hacky method to determine the actual available horizontal space (half the two-page spread is a reasonable approximation, this means that whatever the size of the other iframe / one_page_view, the aspect ratio of this one exactly corresponds to half the viewport rendering surface)
            var isTwoPageSyntheticSpread = $("iframe.iframe-fixed", _$viewport).length > 1;
            if (isTwoPageSyntheticSpread) width *= 0.5;

            // the original SVG width/height might have been specified as a percentage of the containing viewport
            if (widthPercent) {
                width *= (widthPercent / 100);
            }
            if (heightPercent) {
                height *= (heightPercent / 100);
            }

            size = {
                width: width,
                height: height
            };

            isFallbackDimension = true;

            console.warn("Viewport: using browser / e-reader viewport dimensions!");
        }

        if (size) {
            _meta_size.width = size.width;
            _meta_size.height = size.height;

            // Not strictly necessary, let's preserve the percentage values
            // if (isFallbackDimension && contentDocument && contentDocument.documentElement && contentDocument.documentElement.nodeName && contentDocument.documentElement.nodeName.toLowerCase() == "svg") {
            //     contentDocument.documentElement.setAttribute("width", size.width + "px");
            //     contentDocument.documentElement.setAttribute("height", size.height + "px");
            // }
        }
    }

    //expected callback signature: function(success, $iframe, spineItem, isNewlyLoaded, context)
    this.loadSpineItem = function (spineItem, callback, context) {

        if (_currentSpineItem != spineItem) {

            _currentSpineItem = spineItem;
            var src = _spine.package.resolveRelativeUrl(spineItem.href);

            //if (spineItem && spineItem.isFixedLayout())
            if (true) // both fixed layout and reflowable documents need hiding due to flashing during layout/rendering
            {
                //hide iframe until content is scaled
                self.hideIFrame();
            }

            self.emit(OnePageView.SPINE_ITEM_OPEN_START, _$iframe, _currentSpineItem);
            _iframeLoader.loadIframe(_$iframe[0], src, function (success) {

                if (success && callback) {
                    var func = function () {
                        callback(success, _$iframe, _currentSpineItem, true, context);
                    };

                    if (Helpers.isIframeAlive(_$iframe[0])) {
                        onIFrameLoad(success); // applies styles

                        func();
                    }
                    else {
                        console.error("onIFrameLoad !! doc && win + TIMEOUT");
                        console.debug(spineItem.href);

                        onIFrameLoad(success);

                        setTimeout(func, 500);
                    }
                }
                else {
                    onIFrameLoad(success);
                }

            }, self, {spineItem: _currentSpineItem});
        }
        else {
            if (callback) {
                callback(true, _$iframe, _currentSpineItem, false, context);
            }
        }
    };
    //
    // function parseViewBoxSize(viewBoxString) {
    //
    //     var parts = viewBoxString.split(' ');
    //
    //     if(parts.length < 4) {
    //         console.warn(viewBoxString + " value is not valid viewBox size")
    //         return undefined;
    //     }
    //
    //     var width = parseInt(parts[2]);
    //     var height = parseInt(parts[3]);
    //
    //     if(!isNaN(width) && !isNaN(height)) {
    //         return { width: width, height: height} ;
    //     }
    //
    //     return undefined;
    // }

    function parseMetaSize(content) {

        var pairs = content.replace(/\s/g, '').split(",");

        var dict = {};

        for (var i = 0; i < pairs.length; i++) {
            var nameVal = pairs[i].split("=");
            if (nameVal.length == 2) {

                dict[nameVal[0]] = nameVal[1];
            }
        }

        var width = Number.NaN;
        var height = Number.NaN;

        if (dict["width"]) {
            width = parseInt(dict["width"]);
        }

        if (dict["height"]) {
            height = parseInt(dict["height"]);
        }

        if (!isNaN(width) && !isNaN(height)) {
            return {width: width, height: height};
        }

        return undefined;
    }

    this.getFirstVisibleElementCfi = function () {

        var navigation = new CfiNavigationLogic(_$el, _$iframe);
        return navigation.getFirstVisibleElementCfi(0);

    };

    this.getNavigator = function () {

        return new CfiNavigationLogic(_$el, _$iframe);
    };

    this.getElementByCfi = function (spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        if (spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        var navigation = new CfiNavigationLogic(_$el, _$iframe);
        return navigation.getElementByCfi(cfi, classBlacklist, elementBlacklist, idBlacklist);
    };

    this.getElementById = function (spineItem, id) {

        if (spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        var navigation = new CfiNavigationLogic(_$el, _$iframe);
        return navigation.getElementById(id);
    };

    this.getElement = function (spineItem, selector) {

        if (spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        var navigation = new CfiNavigationLogic(_$el, _$iframe);
        return navigation.getElement(selector);
    };

    this.getFirstVisibleMediaOverlayElement = function () {
        var navigation = new CfiNavigationLogic(_$el, _$iframe);
        return navigation.getFirstVisibleMediaOverlayElement({top: 0, bottom: _$iframe.height()});
    };

    this.offset = function () {
        if (_$iframe) {
            return _$iframe.offset();
        }
        return undefined;
    }
};

OnePageView.SPINE_ITEM_OPEN_START = "SpineItemOpenStart";
return OnePageView;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/page_open_request',[],function() {
/**
 * Representation of opening page request
 * Provides the spine item to be opened and one of the following properties:
 *  spineItemPageIndex {Number},
 *  elementId {String},
 *  elementCfi {String},
 *  firstPage {bool},
 *  lastPage {bool}
 *
 * @param {Models.SpineItem} spineItem
 * @param {object} [initiator]
 *
 * @constructor
 */
var PageOpenRequest = function(spineItem, initiator) {

    this.spineItem = spineItem;
    this.spineItemPageIndex = undefined;
    this.elementId = undefined;
    this.elementCfi = undefined;
    this.firstPage = false;
    this.lastPage = false;
    this.initiator = initiator;

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

return PageOpenRequest;
});
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define ('views/fixed_view',["jquery", "underscore", "eventEmitter", "../models/bookmark_data", "../models/current_pages_info",
    "../models/fixed_page_spread", "./one_page_view", "../models/page_open_request", "../helpers", "../globals"],
    function($, _, EventEmitter, BookmarkData, CurrentPagesInfo,
             Spread, OnePageView, PageOpenRequest, Helpers, Globals) {
/**
 * View for rendering fixed layout page spread
 * @param options
 * @param reader
 * @constructor
 */
var FixedView = function(options, reader){

    _.extend(this, new EventEmitter());

    var self = this;

    var _$el;
    var _$viewport = options.$viewport;
    var _spine = options.spine;
    var _userStyles = options.userStyles;
    var _bookStyles = options.bookStyles;
    var _zoom = options.zoom || {style: 'default'};
    var _currentScale;
    var _iframeLoader = options.iframeLoader;
    var _viewSettings = undefined;

    var _leftPageView = createOnePageView("fixed-page-frame-left");
    var _rightPageView = createOnePageView("fixed-page-frame-right");
    var _centerPageView = createOnePageView("fixed-page-frame-center");

    var _pageViews = [];
    _pageViews.push(_leftPageView);
    _pageViews.push(_rightPageView);
    _pageViews.push(_centerPageView);

    var _spread = new Spread(_spine, false);
    var _bookMargins;
    var _contentMetaSize;
    var _isRedrowing = false;
    var _redrawRequest = false;

    function createOnePageView(elementClass) {

        var pageView = new OnePageView(options,
        [elementClass],
        false, //enableBookStyleOverrides
        reader
        );

        pageView.on(OnePageView.SPINE_ITEM_OPEN_START, function($iframe, spineItem) {

            self.emit(Globals.Events.CONTENT_DOCUMENT_LOAD_START, $iframe, spineItem);
        });   
    
        return pageView;
    }

    this.isReflowable = function() {
        return false;
    };

    this.setZoom = function(zoom){
        _zoom = zoom;

        resizeBook(false); 
    }

    this.render = function(){

        var template = Helpers.loadTemplate("fixed_book_frame", {});

        _$el = $(template);

        Helpers.CSSTransition(_$el, "all 0 ease 0");
        
        _$el.css("overflow", "hidden");
        
        // Removed, see one_page_view@render()
        // var settings = reader.viewerSettings();
        // if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined")
        // {
        //     //defaults
        //     settings = new Globals.Models.ViewerSettings({});
        // }
        // if (settings.enableGPUHardwareAccelerationCSS3D) {
        //
        //     // This fixes rendering issues with WebView (native apps), which crops content embedded in iframes unless GPU hardware acceleration is enabled for CSS rendering.
        //     _$el.css("transform", "translateZ(0)");
        // }
        
        _$viewport.append(_$el);

        self.applyStyles();

        return this;
    };

    this.remove = function() {

        _$el.remove();
    };


    this.setViewSettings = function(settings) {
        
        _viewSettings = settings;
        
        _spread.setSyntheticSpread(Helpers.deduceSyntheticSpread(_$viewport, getFirstVisibleItem(), _viewSettings) == true); // force boolean value (from truthy/falsey return value)

        var views = getDisplayingViews();
        for(var i = 0, count = views.length; i < count; i++) {
            views[i].setViewSettings(settings);
        }
    };

    function getFirstVisibleItem() {

        var visibleItems = _spread.validItems();
        return visibleItems[0];
    }

    function redraw(initiator, paginationRequest) {

        if(_isRedrowing) {
            _redrawRequest = {initiator: initiator, paginationRequest: paginationRequest};
            return;
        }

        _isRedrowing = true;

        var context = {isElementAdded : false};

        var pageLoadDeferrals = createPageLoadDeferrals([{pageView: _leftPageView, spineItem: _spread.leftItem, context: context},
                                                              {pageView: _rightPageView, spineItem: _spread.rightItem, context: context},
                                                              {pageView: _centerPageView, spineItem: _spread.centerItem, context: context}]);

        $.when.apply($, pageLoadDeferrals).done(function(){
            _isRedrowing = false;

            if(_redrawRequest) {
                var p1 = _redrawRequest.initiator;
                var p2 = _redrawRequest.paginationRequest;
                _redrawRequest = undefined;
                redraw(p1, p2);
            }
            else {
                if(context.isElementAdded) {
                    self.applyStyles();
                }

                if (paginationRequest)
                {
                    onPagesLoaded(initiator, paginationRequest.spineItem, paginationRequest.elementId)
                }
                else
                {
                    onPagesLoaded(initiator);
                }
            }

        });

    }

    // dir: 0 => new or same page, 1 => previous, 2 => next
    var updatePageSwitchDir = function(dir, hasChanged)
    {
        // irrespective of display state
        if (_leftPageView) _leftPageView.updatePageSwitchDir(dir, hasChanged);
        if (_rightPageView) _rightPageView.updatePageSwitchDir(dir, hasChanged);
        if (_centerPageView) _centerPageView.updatePageSwitchDir(dir, hasChanged);

        // var views = getDisplayingViews();
        // for(var i = 0, count = views.length; i < count; i++) {
        //     views[i].updatePageSwitchDir(dir, hasChanged);
        // }
    };
    

    this.applyStyles = function() {

        Helpers.setStyles(_userStyles.getStyles(), _$el.parent());

        updateBookMargins();
        updateContentMetaSize();

        resizeBook();
    };

    this.applyBookStyles = function() {

        var views = getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {
            views[i].applyBookStyles();
        }
    };

    function createPageLoadDeferrals(viewItemPairs) {

        var pageLoadDeferrals = [];

        for(var i = 0; i < viewItemPairs.length; i++) {

            var dfd = updatePageViewForItem(viewItemPairs[i].pageView, viewItemPairs[i].spineItem, viewItemPairs[i].context);
            pageLoadDeferrals.push(dfd);
        }

        return pageLoadDeferrals;

    }

    function onPagesLoaded(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        updateContentMetaSize();
        resizeBook();
        
        self.emit(Globals.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: self.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
    }

    this.onViewportResize = function() {

        //because change of the viewport orientation can alter pagination behaviour we have to check if
        //visible content stays same

        var firstVisibleItem = getFirstVisibleItem();
        if(!firstVisibleItem) {
            return;
        }

        var isSyntheticSpread = Helpers.deduceSyntheticSpread(_$viewport, firstVisibleItem, _viewSettings) == true; // force boolean value (from truthy/falsey return value)

        if(isSpreadChanged(firstVisibleItem, isSyntheticSpread)) {
            _spread.setSyntheticSpread(isSyntheticSpread);
            var paginationRequest = new PageOpenRequest(firstVisibleItem, self);
            self.openPage(paginationRequest);
        }
        else {
            resizeBook(true);
        }
    };

    function isSpreadChanged(firstVisibleItem, isSyntheticSpread) {

        var tmpSpread = new Spread(_spine, isSyntheticSpread);
        tmpSpread.openItem(firstVisibleItem);

        return _spread.leftItem != tmpSpread.leftItem || _spread.rightItem != tmpSpread.rightItem || _spread.centerItem != tmpSpread.centerItem;
    }

    this.getViewScale = function(){
        return _currentScale;
    };

    function isContentRendered() {

        if(!_contentMetaSize || !_bookMargins) {
            return false;
        }

        var viewportWidth = _$viewport.width();
        var viewportHeight = _$viewport.height();

        return viewportWidth && viewportHeight;
    }

    function resizeBook(viewportIsResizing) {

        updatePageSwitchDir(0, false);
        
        if(!isContentRendered()) {
            return;
        }

        var viewportWidth = _$viewport.width();
        var viewportHeight = _$viewport.height();

        var leftPageMargins = _leftPageView.isDisplaying() ? Helpers.Margins.fromElement(_leftPageView.element()) : Helpers.Margins.empty();
        var rightPageMargins = _rightPageView.isDisplaying() ? Helpers.Margins.fromElement(_rightPageView.element()) : Helpers.Margins.empty();
        var centerPageMargins = _centerPageView.isDisplaying() ? Helpers.Margins.fromElement(_centerPageView.element()) : Helpers.Margins.empty();

        var pageMargins = getMaxPageMargins(leftPageMargins, rightPageMargins, centerPageMargins);

        var potentialTargetElementSize = {   width: viewportWidth - _bookMargins.width(),
                                             height: viewportHeight - _bookMargins.height()};

        var potentialContentSize = {    width: potentialTargetElementSize.width - pageMargins.width(),
                                        height: potentialTargetElementSize.height - pageMargins.height() };

        if(potentialTargetElementSize.width <= 0 || potentialTargetElementSize.height <= 0) {
            return;
        }

        var horScale = potentialContentSize.width / _contentMetaSize.width;
        var verScale = potentialContentSize.height / _contentMetaSize.height;
        
        _$viewport.css("overflow", "auto");
            
        var scale;
        if (_zoom.style == 'fit-width'){
            scale = horScale;
        }
        else if (_zoom.style == 'fit-height'){
            scale = verScale;
        }
        else if (_zoom.style == 'user'){
            scale = _zoom.scale;
        }
        else{
            scale = Math.min(horScale, verScale);

            // no need for pan during "viewport fit" zoom
            _$viewport.css("overflow", "hidden");
        }

        _currentScale = scale;

        var contentSize = { width: _contentMetaSize.width * scale,
                            height: _contentMetaSize.height * scale };

        var targetElementSize = {   width: contentSize.width + pageMargins.width(),
                                    height: contentSize.height + pageMargins.height() };

        var bookSize = {    width: targetElementSize.width + _bookMargins.width(),
                            height: targetElementSize.height + _bookMargins.height() };


        var bookLeft = Math.floor((viewportWidth - bookSize.width) / 2);
        var bookTop = Math.floor((viewportHeight - bookSize.height) / 2);

        if(bookLeft < 0) bookLeft = 0;
        if(bookTop < 0) bookTop = 0;
        
        _$el.css("left", bookLeft + "px");
        _$el.css("top", bookTop + "px");
        _$el.css("width", targetElementSize.width + "px");
        _$el.css("height", targetElementSize.height + "px");

        var left = _bookMargins.padding.left;
        var top = _bookMargins.padding.top;

        var transFunc = viewportIsResizing ? "transformContentImmediate" : "transformContent";

        if(_leftPageView.isDisplaying()) {

             _leftPageView[transFunc](scale, left, top);
        }

        if(_rightPageView.isDisplaying()) {

            left += _contentMetaSize.separatorPosition * scale;

            if(_leftPageView.isDisplaying()) {
                left += leftPageMargins.left;
            }

            _rightPageView[transFunc](scale, left, top);
        }

        if(_centerPageView.isDisplaying()) {

            _centerPageView[transFunc](scale, left, top);
        }
        
        self.emit(Globals.Events.FXL_VIEW_RESIZED);
    }

    function getMaxPageMargins(leftPageMargins, rightPageMargins, centerPageMargins) {

         var sumMargin = {
            left: Math.max(leftPageMargins.margin.left, rightPageMargins.margin.left, centerPageMargins.margin.left),
            right: Math.max(leftPageMargins.margin.right, rightPageMargins.margin.right, centerPageMargins.margin.right),
            top: Math.max(leftPageMargins.margin.top, rightPageMargins.margin.top, centerPageMargins.margin.top),
            bottom: Math.max(leftPageMargins.margin.bottom, rightPageMargins.margin.bottom, centerPageMargins.margin.bottom)
        };

        var sumBorder = {
            left: Math.max(leftPageMargins.border.left, rightPageMargins.border.left, centerPageMargins.border.left),
            right: Math.max(leftPageMargins.border.right, rightPageMargins.border.right, centerPageMargins.border.right),
            top: Math.max(leftPageMargins.border.top, rightPageMargins.border.top, centerPageMargins.border.top),
            bottom: Math.max(leftPageMargins.border.bottom, rightPageMargins.border.bottom, centerPageMargins.border.bottom)
        };

        var sumPAdding = {
            left: Math.max(leftPageMargins.padding.left, rightPageMargins.padding.left, centerPageMargins.padding.left),
            right: Math.max(leftPageMargins.padding.right, rightPageMargins.padding.right, centerPageMargins.padding.right),
            top: Math.max(leftPageMargins.padding.top, rightPageMargins.padding.top, centerPageMargins.padding.top),
            bottom: Math.max(leftPageMargins.padding.bottom, rightPageMargins.padding.bottom, centerPageMargins.padding.bottom)
        };

        return new Helpers.Margins(sumMargin, sumBorder, sumPAdding);

    }

    function updateContentMetaSize() {

        _contentMetaSize = {};

        if(_centerPageView.isDisplaying()) {
            _contentMetaSize.width = _centerPageView.meta_width();
            _contentMetaSize.height = _centerPageView.meta_height();
            _contentMetaSize.separatorPosition = 0;
        }
        else if(_leftPageView.isDisplaying() && _rightPageView.isDisplaying()) {
            if(_leftPageView.meta_height() == _rightPageView.meta_height()) {
                _contentMetaSize.width = _leftPageView.meta_width() + _rightPageView.meta_width();
                _contentMetaSize.height = _leftPageView.meta_height();
                _contentMetaSize.separatorPosition = _leftPageView.meta_width();
            }
            else {
                //normalize by height
                _contentMetaSize.width = _leftPageView.meta_width() + _rightPageView.meta_width() * (_leftPageView.meta_height() / _rightPageView.meta_height());
                _contentMetaSize.height = _leftPageView.meta_height();
                _contentMetaSize.separatorPosition = _leftPageView.meta_width();
            }
        }
        else if(_leftPageView.isDisplaying()) {
            _contentMetaSize.width = _leftPageView.meta_width() * 2;
            _contentMetaSize.height = _leftPageView.meta_height();
            _contentMetaSize.separatorPosition = _leftPageView.meta_width();
        }
        else if(_rightPageView.isDisplaying()) {
            _contentMetaSize.width = _rightPageView.meta_width() * 2;
            _contentMetaSize.height = _rightPageView.meta_height();
            _contentMetaSize.separatorPosition = _rightPageView.meta_width();
        }
        else {
            _contentMetaSize = undefined;
        }

    }

    function updateBookMargins() {
        _bookMargins = Helpers.Margins.fromElement(_$el);
    }

    // dir: 0 => new or same page, 1 => previous, 2 => next
    this.openPage =  function(paginationRequest, dir) {

        if(!paginationRequest.spineItem) {
            return;
        }

        var leftItem = _spread.leftItem;
        var rightItem = _spread.rightItem;
        var centerItem = _spread.centerItem;

        var isSyntheticSpread = Helpers.deduceSyntheticSpread(_$viewport, paginationRequest.spineItem, _viewSettings) == true; // force boolean value (from truthy/falsey return value)
        _spread.setSyntheticSpread(isSyntheticSpread);
        _spread.openItem(paginationRequest.spineItem);
        
        var hasChanged = leftItem !== _spread.leftItem || rightItem !== _spread.rightItem || centerItem !== _spread.centerItem;
        
        if (dir === null || typeof dir === "undefined") dir = 0;
        
        updatePageSwitchDir(dir === 0 ? 0 : (_spread.spine.isRightToLeft() ? (dir === 1 ? 2 : 1) : dir), hasChanged);
        
        redraw(paginationRequest.initiator, paginationRequest);
    };


    this.openPagePrev = function(initiator) {

        _spread.openPrev();
        
        updatePageSwitchDir(_spread.spine.isRightToLeft() ? 2 : 1, true);
        
        redraw(initiator, undefined);
    };

    this.openPageNext = function(initiator) {

        _spread.openNext();
        
        updatePageSwitchDir(_spread.spine.isRightToLeft() ? 1 : 2, true);
        
        redraw(initiator, undefined);
    };

    function updatePageViewForItem(pageView, item, context) {

        var dfd = $.Deferred();

        if(!item) {
            if(pageView.isDisplaying()) {
                pageView.remove();
            }

            dfd.resolve();
        }
        else {

            if(!pageView.isDisplaying()) {

                _$el.append(pageView.render().element());

                context.isElementAdded = true;
            }

            pageView.loadSpineItem(item, function(success, $iframe, spineItem, isNewContentDocumentLoaded, context){

                if(success && isNewContentDocumentLoaded) {

                    //if we a re loading fixed view meta size should be defined
                    if(!pageView.meta_height() || !pageView.meta_width()) {
                        console.error("Invalid document " + spineItem.href + ": viewport is not specified!");
                    }

                    self.emit(Globals.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);
                }

                dfd.resolve();

            }, context);
        }

        return dfd.promise();
    }

    this.getPaginationInfo = function() {

        var paginationInfo = new CurrentPagesInfo(_spine, true);

        var spreadItems = [_spread.leftItem, _spread.rightItem, _spread.centerItem];

        for(var i = 0; i < spreadItems.length; i++) {

            var spreadItem = spreadItems[i];

            if(spreadItem) {
                paginationInfo.addOpenPage(0, 1, spreadItem.idref, spreadItem.index);
            }
        }

        return paginationInfo;
    };

    this.bookmarkCurrentPage = function() {

        var views = getDisplayingViews();

        if(views.length > 0) {

            var idref = views[0].currentSpineItem().idref;
            var cfi = views[0].getFirstVisibleElementCfi();

            if(cfi == undefined) {
                cfi = "";
            }

            return new BookmarkData(idref, cfi);
        }

        return new BookmarkData("", "");
    };

    function getDisplayingViews() {

        var viewsToCheck = [];

        if( _spine.isLeftToRight() ) {
            viewsToCheck = [_leftPageView, _centerPageView, _rightPageView];
        }
        else {
            viewsToCheck = [_rightPageView, _centerPageView, _leftPageView];
        }

        var views = [];

        for(var i = 0, count = viewsToCheck.length; i < count; i++) {
            if(viewsToCheck[i].isDisplaying()) {
                views.push(viewsToCheck[i]);
            }
        }

        return views;
    }

    this.getLoadedSpineItems = function() {

        return _spread.validItems();
    };

    this.getElement = function(spineItem, selector) {

        var views = getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {

            var view = views[i];
            if(view.currentSpineItem() == spineItem) {
                return view.getElement(spineItem, selector);
            }
        }

        console.error("spine item is not loaded");
        return undefined;
    };

    this.getElementById = function(spineItem, id) {

        var views = getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {

            var view = views[i];
            if(view.currentSpineItem() == spineItem) {
                return view.getElementById(spineItem, id);
            }
        }

        console.error("spine item is not loaded");
        return undefined;
    };

    this.getElementByCfi = function(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        var views = getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {

            var view = views[i];
            if(view.currentSpineItem() == spineItem) {
                return view.getElementByCfi(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist);
            }
        }

        console.error("spine item is not loaded");
        return undefined;
    };

    this.getFirstVisibleMediaOverlayElement = function() {

        var views = getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {
            var el = views[i].getFirstVisibleMediaOverlayElement();
            if (el) return el;
        }

        return undefined;
    };

    this.insureElementVisibility = function(spineItemId, element, initiator) {

        //TODO: during zoom+pan, playing element might not actualy be visible

    }

};
    return FixedView;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('views/iframe_loader',["jquery", "underscore"], function($, _) {
/**
 *
 * @constructor
 */
var IFrameLoader = function() {

    var self = this;
    var eventListeners = {};


    this.addIFrameEventListener = function (eventName, callback, context) {

        if (eventListeners[eventName] == undefined) {
            eventListeners[eventName] = [];
        }

        eventListeners[eventName].push({callback: callback, context: context});
    };

    this.updateIframeEvents = function (iframe) {

        _.each(eventListeners, function (value, key) {
            for (var i = 0, count = value.length; i < count; i++) {
                $(iframe.contentWindow).off(key);
                $(iframe.contentWindow).on(key, value[i].callback, value[i].context);
            }
        });
    };

    this.loadIframe = function (iframe, src, callback, context, attachedData) {

        if (!iframe.baseURI) {
            if (typeof location !== 'undefined') {
                iframe.baseURI = location.href + "";
            }
            console.log("!iframe.baseURI => " + iframe.baseURI);
        }
    
        iframe.setAttribute("data-baseUri", iframe.baseURI);
        iframe.setAttribute("data-src", src);

        var loadedDocumentUri = new URI(src).absoluteTo(iframe.baseURI).search('').hash('').toString();

        self._loadIframeWithUri(iframe, attachedData, loadedDocumentUri, function () {
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            $('svg', doc).load(function(){
                console.log('loaded');
            });
            callback.call(context, true, attachedData);
        });
    };

    this._loadIframeWithUri = function (iframe, attachedData, contentUri, callback) {

        iframe.onload = function () {

            self.updateIframeEvents(iframe);

            var mathJax = iframe.contentWindow.MathJax;
            if (mathJax) {
                // If MathJax is being used, delay the callback until it has completed rendering
                var mathJaxCallback = _.once(callback);
                try {
                    mathJax.Hub.Queue(mathJaxCallback);
                } catch (err) {
                    console.error("MathJax fail!");
                    callback();
                }
                // Or at an 8 second timeout, which ever comes first
                //window.setTimeout(mathJaxCallback, 8000);
            } else {
                callback();
            }
        };

        iframe.setAttribute("src", contentUri);
        
    };

};

return IFrameLoader;
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('views/internal_links_support',['jquery', '../helpers', 'epubCfi'], function($, Helpers, epubCfi) {
/**
 *
 * @param reader
 * @constructor
 */
var InternalLinksSupport = function(reader) {

    var self = this;

    function splitCfi(fullCfi) {

        var startIx = fullCfi.indexOf("(");
        var bungIx = fullCfi.indexOf("!");
        var endIx = fullCfi.indexOf(")");

        if(bungIx == -1) {
            return undefined;
        }

        if(endIx == -1) {
            endIx = fullCfi.length;
        }

        return {

            spineItemCfi: fullCfi.substring(startIx + 1, bungIx),
            elementCfi: fullCfi.substring(bungIx + 1, endIx)
        }
    }

    function getAbsoluteUriRelativeToSpineItem(hrefUri, spineItem) {

        var fullPath = reader.package().resolveRelativeUrl(spineItem.href);

        var absUrl = hrefUri.absoluteTo(fullPath);

        return absUrl;
    }

    function processDeepLink(hrefUri, spineItem) {

        var absoluteOpfUri = getAbsoluteUriRelativeToSpineItem(hrefUri, spineItem);

        if(!absoluteOpfUri) {
            console.error("Unable to resolve " + hrefUri.href())
            return;
        }

        var fullCfi = hrefUri.fragment();

        var absPath = absoluteOpfUri.toString();

        absPath = Helpers.RemoveFromString(absPath, "#" +  fullCfi);

        readOpfFile(absPath, function(opfText) {

            if(!opfText) {
                return;
            }

            var parser = new window.DOMParser;
            var packageDom = parser.parseFromString(opfText, 'text/xml');
            var cfi = splitCfi(fullCfi);

            if(!cfi) {
                console.warn("Unable to split cfi:" + fullCfi);
                return;
            }

            var contentDocRef = EPUBcfi.Interpreter.getContentDocHref("epubcfi(" + cfi.spineItemCfi + ")", packageDom);

            if(contentDocRef) {

                var newSpineItem = reader.spine().getItemByHref(contentDocRef);
                if(newSpineItem) {

                    reader.openSpineItemElementCfi(newSpineItem.idref, cfi.elementCfi, self);
                }
                else {
                    console.warn("Unable to find spineItem with href=" + contentDocRef);
                }

            }
            else {
                console.warn("Unable to find document ref from " +  fullCfi +" cfi");
            }

        });

    }

    function readOpfFile(path, callback) {

        $.ajax({
            // encoding: "UTF-8",
            // mimeType: "text/plain; charset=UTF-8",
            // beforeSend: function( xhr ) {
            //     xhr.overrideMimeType("text/plain; charset=UTF-8");
            // },
            isLocal: path.indexOf("http") === 0 ? false : true,
            url: path,
            dataType: 'text',
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

    //checks if href includes path to opf file and full cfi
    function isDeepLikHref(uri) {

        var fileName = uri.filename();
        return fileName && Helpers.EndsWith(fileName, ".opf");
    }

    function processLinkWithHash(hrefUri, spineItem) {

        var fileName = hrefUri.filename();

        var idref;

        //reference to another file
        if(fileName) {
            var normalizedUri = new URI(hrefUri, spineItem.href);
            
            var pathname = decodeURIComponent(normalizedUri.pathname());
            
            var newSpineItem = reader.spine().getItemByHref(pathname);

            if(!newSpineItem) {
                console.error("spine item with href=" + pathname + " not found");
                return;
            }

            idref = newSpineItem.idref;
        }
        else { //hush in the same file
            idref = spineItem.idref;
        }

        var hashFrag = hrefUri.fragment();

        reader.openSpineItemElementId(idref, hashFrag, self);

    }

    this.processLinkElements = function($iframe, spineItem) {

        var epubContentDocument = $iframe[0].contentDocument;

        $('a', epubContentDocument).click(function (clickEvent) {
            // Check for both href and xlink:href attribute and get value
            var href;
            if (clickEvent.currentTarget.attributes["xlink:href"]) {
                
                href = clickEvent.currentTarget.attributes["xlink:href"].value;
            }
            else {
                href = clickEvent.currentTarget.attributes["href"].value;
            }

            var overrideClickEvent = false;
            var hrefUri = new URI(href);
            var hrefIsRelative = hrefUri.is('relative');

            if (hrefIsRelative) {

                if(isDeepLikHref(hrefUri)) {
                    processDeepLink(hrefUri, spineItem);
                    overrideClickEvent = true;
                }
                else {
                    processLinkWithHash(hrefUri, spineItem);
                    overrideClickEvent = true;
                }

            } else {
                // It's an absolute URL to a remote site - open it in a separate window outside the reader
                window.open(href, '_blank');
                overrideClickEvent = true;
            }

            if (overrideClickEvent) {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
            }
        });

    }

};

return InternalLinksSupport;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.
define ('models/smil_iterator',["jquery", "../helpers"], function($, Helpers) {
/**
 *
 * @param smil
 * @constructor
 */
var SmilIterator = function(smil) {

    this.smil = smil;
    this.currentPar = undefined;

    this.reset = function() {
        this.currentPar = findParNode(0, this.smil, false);
    };

    /*
    this.firstDeep = function(container) {
        var par = container.nodeType === "par" ? container : findParNode(0, container, false);

        return par;
    };
    */
//
//    this.ensureNextValidTextElement = function()
//    {
//        if (!this.currentPar)
//        {
//            console.debug("Par iterator is out of range");
//            return;
//        }
//
//        while (this.currentPar && !this.currentPar.element)
//        {
//            this.next();
//        }
//    };

    this.findTextId = function(id)
    {
        if (!this.currentPar)
        {
            console.debug("Par iterator is out of range");
            return;
        }

        if (!id)
        {
            return false;
        }

        while (this.currentPar)
        {
            if (this.currentPar.element)
            {
                if (id === this.currentPar.text.srcFragmentId) //this.currentPar.element.id
                {
                    return true;
                }

                // OUTER match
                var parent = this.currentPar.element.parentNode;
                while(parent)
                {
                    if (parent.id && parent.id == id)
                    {
                        return true;
                    }

                    parent = parent.parentNode;
                }

                // INNER match
                //var inside = this.currentPar.element.ownerDocument.getElementById(id);
                var inside = $("#" + Helpers.escapeJQuerySelector(id), this.currentPar.element);
                if (inside && inside.length && inside[0])
                {
                    return true;
                }
            }

            this.next();
        }

        return false;
    }

    this.next = function() {

        if(!this.currentPar) {
            console.debug("Par iterator is out of range");
            return;
        }

        this.currentPar = findParNode(this.currentPar.index + 1, this.currentPar.parent, false);
    };

    this.previous = function() {

        if(!this.currentPar) {
            console.debug("Par iterator is out of range");
            return;
        }

        this.currentPar = findParNode(this.currentPar.index - 1, this.currentPar.parent, true);
    };

    this.isLast = function() {

        if(!this.currentPar) {
            console.debug("Par iterator is out of range");
            return;
        }

        if (findParNode(this.currentPar.index + 1, this.currentPar.parent, false))
        {
            return false;
        }

        return true;
    }

    this.goToPar =  function(par) {

        while(this.currentPar) {
            if(this.currentPar == par) {
                break;
            }

            this.next();
        }
    };

    function findParNode(startIndex, container, previous) {

        for(var i = startIndex, count = container.children.length;
            i >= 0 && i < count;
            i += (previous ? -1 : 1)) {

            var node = container.children[i];
            if(node.nodeType == "par") {
                return node;
            }

            // assert(node.nodeType == "seq")
            node = findParNode(previous ? node.children.length - 1 : 0, node, previous);

            if(node) {
                return node;
            }
        }

        if(container.parent) {
            return findParNode(container.index + (previous ? -1 : 1), container.parent, previous);
        }

        return undefined;
    }

    this.reset();
};

return SmilIterator;
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define ('views/media_overlay_data_injector',["jquery", "underscore", "../helpers", "../models/smil_iterator", "rangy", 'epubCfi'], function($, _, Helpers, SmilIterator, rangy, epubCfi) {
/**
 *
 * @param mediaOverlay
 * @param mediaOverlayPlayer
 * @constructor
 */
var MediaOverlayDataInjector = function (mediaOverlay, mediaOverlayPlayer) {

    this.attachMediaOverlayData = function ($iframe, spineItem, mediaOverlaySettings) {

        var contentDocElement = $iframe[0].contentDocument.documentElement;

        if (!spineItem.media_overlay_id && mediaOverlay.smil_models.length === 0) {
            return;
        }

        var $body = $("body", contentDocElement);
        if ($body.length == 0) {
            console.error("! BODY ???");
        }
        else {
            var click = $body.data("mediaOverlayClick");
            if (click) {
                console.error("[WARN] already mediaOverlayClick");
            }
            else {
                $body.data("mediaOverlayClick", {ping: "pong"});

                var touchClickMOEventHandler = function (event)
                {
                    //console.debug("MO TOUCH-DOWN: "+event.type);
                    
                    var elem = $(this)[0]; // body
                    elem = event.target; // body descendant

                    if (!elem)
                    {
                        mediaOverlayPlayer.touchInit();
                        return true;
                    }

//console.debug("MO CLICK: " + elem.id);

                    var data = undefined;
                    var el = elem;

                    var inLink = false;
                    if (el.nodeName.toLowerCase() === "a")
                    {
                        inLink = true;
                    }

                    while (!(data = $(el).data("mediaOverlayData")))
                    {
                        if (el.nodeName.toLowerCase() === "a")
                        {
                            inLink = true;
                        }
                        el = el.parentNode;
                        if (!el)
                        {
                            break;
                        }
                    }
                    
                    if (data && (data.par || data.pars))
                    {
                        if (el !== elem)
                        {
//console.log("MO CLICK REDIRECT: " + el.id);
                        }

                        if (!mediaOverlaySettings.mediaOverlaysEnableClick)
                        {
console.log("MO CLICK DISABLED");
                            mediaOverlayPlayer.touchInit();
                            return true;
                        }

                        if (inLink)
                        {
console.log("MO CLICKED LINK");
                            mediaOverlayPlayer.touchInit();
                            return true;
                        }

                        var par = data.par ? data.par : data.pars[0];

                        if (data.pars && (typeof rangy !== "undefined"))
                        {
                            var wasPaused = false;
                            
                            // To remove highlight which may have altered DOM (and break CFI expressions)
                            if (mediaOverlayPlayer.isPlayingCfi())
                            {
                                wasPaused = true;
                                mediaOverlayPlayer.pause();
                            }
                         
                            // /////////////////////
                            // 
                            // var p = {x: event.pageX, y: event.pageY};
                            // if (webkitConvertPointFromPageToNode)
                            // {
                            //     p = webkitConvertPointFromPageToNode(elem.ownerDocument.body, new WebKitPoint(event.pageX, event.pageY));
                            // }
                            // 
                            // var div = elem.ownerDocument.getElementById("CLICKED");
                            // if (div)
                            // {
                            //     div.parentNode.removeChild(div);
                            // }
                            // 
                            // div = elem.ownerDocument.createElementNS("http://www.w3.org/1999/xhtml", 'div');
                            // div.setAttribute("style", "background-color: red; position: absolute; z-index: 999; width: 50px; height: 50px; left: " + p.x + "px; top: " + p.y + "px;");
                            // div.id = "CLICKED";
                            // div.setAttribute("id", div.id);
                            // var divTxt = elem.ownerDocument.createTextNode(" ");
                            // div.appendChild(divTxt);
                            // elem.ownerDocument.body.appendChild(div);
                            //                          
                            // /////////////////////


                            //rangy.init();
                            try
                            {
// THIS WORKS (same as Rangy's method below)
//                                 var r;
//                                 if (elem.ownerDocument.caretRangeFromPoint)
//                                 {
//                                     r = elem.ownerDocument.caretRangeFromPoint(event.pageX, event.pageY);
//                                 }
//                                 else if (event.rangeParent)
//                                 {
//                                     r = elem.ownerDocument.createRange();
//                                     range.setStart(event.rangeParent, event.rangeOffset);
//                                 }
//                                 
// console.log("------ 1");
// console.log(elem.ownerDocument);
// console.log(event.pageX);
// console.log(event.pageY);
// console.log(r.startContainer);
// console.log(r.startOffset);
// console.log("------");

                                var pos = rangy.positionFromPoint(event.pageX, event.pageY, elem.ownerDocument);
// console.log("------ 2");
// console.log(pos.node.textContent);
// console.log(pos.offset);
// console.log("------");

                                par = undefined;
                                
                                for (var iPar = 0; iPar < data.pars.length; iPar++)
                                {
                                    var p = data.pars[iPar];

                                    var startCFI = "epubcfi(" + p.cfi.partialStartCfi + ")";
                                    var infoStart = EPUBcfi.getTextTerminusInfoWithPartialCFI(startCFI, elem.ownerDocument,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoStart);

                                    var endCFI = "epubcfi(" + p.cfi.partialEndCfi + ")";
                                    var infoEnd = EPUBcfi.getTextTerminusInfoWithPartialCFI(endCFI, elem.ownerDocument,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoEnd);

                                    var range = rangy.createRange(elem.ownerDocument); //createNativeRange
                                    range.setStartAndEnd(
                                        infoStart.textNode[0], infoStart.textOffset,
                                        infoEnd.textNode[0], infoEnd.textOffset
                                    );
        
                                    if (range.isPointInRange(pos.node, pos.offset))
                                    {
// console.log(p.cfi.partialStartCfi);
// console.log(p.cfi.partialEndCfi);
                                        // DOUBLE CHECK WITH getClientRects ??
                                        
                                        par = p;
                                        break;
                                    }
                                }
                            }
                            catch (e)
                            {
                                console.error(e);
                            }
                            
                            if (!par)
                            {
                                if (wasPaused)
                                {
                                    mediaOverlayPlayer.toggleMediaOverlay();
                                }
                                return true;
                            }
                        }


                        if (el && el != elem && el.nodeName.toLowerCase() === "body" && par && !par.getSmil().id)
                        {
//console.debug("MO CLICKED BLANK BODY");
                            mediaOverlayPlayer.touchInit();
                            return true;
                        }

                        mediaOverlayPlayer.playUserPar(par);
                        return true;
                    }
                    else
                    {
                        var readaloud = $(elem).attr("ibooks:readaloud");
                        if (!readaloud)
                        {
                            readaloud = $(elem).attr("epub:readaloud");
                        }
                        if (readaloud)
                        {
console.debug("MO readaloud attr: " + readaloud);

                            var isPlaying = mediaOverlayPlayer.isPlaying();
                            if (readaloud === "start" && !isPlaying ||
                                readaloud === "stop" && isPlaying ||
                                readaloud === "startstop")
                            {
                                mediaOverlayPlayer.toggleMediaOverlay();
                                return true;
                            }
                        }
                    }

                    mediaOverlayPlayer.touchInit();
                    return true;
                };

                var touchClickMOEventHandler_ = _.debounce(touchClickMOEventHandler, 200);
                
                if ('ontouchstart' in document.documentElement)
                {
                  $body[0].addEventListener("touchstart", touchClickMOEventHandler_, false);
                }
                $body[0].addEventListener("mousedown", touchClickMOEventHandler_, false);

                //var clickEvent = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
                //$body.bind(clickEvent, touchClickMOEventHandler);
            }
        }

        var smil = mediaOverlay.getSmilBySpineItem(spineItem);
        if (!smil)
        {
            console.error("NO SMIL?? " + spineItem.idref + " /// " + spineItem.media_overlay_id);
            return;
        }

        var traverseSmilSeqs = function(root)
        {
            if (!root) return;
            
            if (root.nodeType && root.nodeType === "seq")
            {
               // if (root.element)
               // {
               //     console.error("WARN: seq.element already set: " + root.textref);
               // }
                   
               if (root.textref)
               {
                   var parts = root.textref.split('#');
                   var file = parts[0];
                   var fragmentId = (parts.length === 2) ? parts[1] : "";
                   // 
                   // console.debug(root.textref);
                   // console.debug(fragmentId);
                   // console.log("---- SHOULD BE EQUAL:");
                   // console.debug(file);
                   // console.debug(par.text.srcFile);
                   // 
                   // if (file !== par.text.srcFile)
                   // {
                   //     console.error("adjustParToSeqSyncGranularity textref.file !== par.text.srcFile ???");
                   //     return par;
                   // }
                   // 
                   // if (!fragmentId)
                   // {
                   //     console.error("adjustParToSeqSyncGranularity !fragmentId ???");
                   //     return par;
                   // }

                   if (file && fragmentId)
                   {
                       var textRelativeRef = Helpers.ResolveContentRef(file, smil.href);
                       var same = textRelativeRef === spineItem.href;
                       if (same)
                       {                       
                           root.element = $iframe[0].contentDocument.getElementById(fragmentId);
                   
                           if (!root.element)
                           {
                               console.error("seq.textref !element? " + root.textref);
                           }

                           // var selector = "#" + Helpers.escapeJQuerySelector(fragmentId);
                           // var $element = $(selector, element.ownerDocument.documentElement);
                           // if ($element)
                           // {
                           //     seq.element = $element[0];
                           // }
                       }
                   }
               }
            }
            
            if (root.children && root.children.length)
            {
                for (var i = 0; i < root.children.length; i++)
                {
                    var child = root.children[i];
                    traverseSmilSeqs(child);
                }
            }
        };
        traverseSmilSeqs(smil);

//console.debug("[[MO ATTACH]] " + spineItem.idref + " /// " + spineItem.media_overlay_id + " === " + smil.id);

        var iter = new SmilIterator(smil);
        
        var fakeOpfRoot = "/99!";
        var epubCfiPrefix = "epubcfi";
        
        while (iter.currentPar) {
            iter.currentPar.element = undefined;
            iter.currentPar.cfi = undefined;

            if (true) { //iter.currentPar.text.srcFragmentId (includes empty frag ID)

                var textRelativeRef = Helpers.ResolveContentRef(iter.currentPar.text.srcFile, iter.smil.href);

                var same = textRelativeRef === spineItem.href;
                if (same) {
                    var selectBody = !iter.currentPar.text.srcFragmentId || iter.currentPar.text.srcFragmentId.length == 0;
                    var selectId = iter.currentPar.text.srcFragmentId.indexOf(epubCfiPrefix) == 0 ? undefined : iter.currentPar.text.srcFragmentId;

                    var $element = undefined;
                    var isCfiTextRange = false;
                    if (!selectBody && !selectId)
                    {
                        if (iter.currentPar.text.srcFragmentId.indexOf(epubCfiPrefix) === 0)
                        {
                            var partial = iter.currentPar.text.srcFragmentId.substr(epubCfiPrefix.length + 1, iter.currentPar.text.srcFragmentId.length - epubCfiPrefix.length - 2);
                            
                            if (partial.indexOf(fakeOpfRoot) === 0)
                            {
                                partial = partial.substr(fakeOpfRoot.length, partial.length - fakeOpfRoot.length);
                            }
//console.log(partial);
                            var parts = partial.split(",");
                            if (parts && parts.length === 3)
                            {
                                try
                                {
                                    var partialStartCfi = parts[0] + parts[1];
                                    var startCFI = "epubcfi(" + partialStartCfi + ")";
                                    var infoStart = EPUBcfi.getTextTerminusInfoWithPartialCFI(startCFI, $iframe[0].contentDocument,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoStart);

                                    var partialEndCfi = parts[0] + parts[2];
                                    var endCFI = "epubcfi(" + partialEndCfi + ")";
                                    var infoEnd = EPUBcfi.getTextTerminusInfoWithPartialCFI(endCFI, $iframe[0].contentDocument,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoEnd);

                                    var cfiTextParent = infoStart.textNode[0].parentNode;

                                    iter.currentPar.cfi = {
                                        smilTextSrcCfi: iter.currentPar.text.srcFragmentId,
                                        partialRangeCfi: partial,
                                        partialStartCfi: partialStartCfi,
                                        partialEndCfi: partialEndCfi,
                                        
                                        cfiTextParent: cfiTextParent
                                        
                                        // textNode becomes invalid after highlighting! (dynamic span insertion/removal changes DOM)
                                        // cfiRangeStart: infoStart,
                                        // cfiRangeEnd: infoEnd
                                    };
                                    
                                    // TODO: not just start textNode, but all of them between start and end...
                                    // ...that being said, CFI text ranges likely to be used only within a single common parent,
                                    // so this is an acceptable implementation shortcut for this CFI experimentation (word-level text/audio synchronisation).
                                    isCfiTextRange = true;
                                    $element = $(cfiTextParent);
                                    var modata = $element.data("mediaOverlayData");
                                    if (!modata)
                                    {
                                        modata = {pars: [iter.currentPar]};
                                        $element.data("mediaOverlayData", modata);
                                    }
                                    else
                                    {
                                        if (modata.par)
                                        {
                                            console.error("[WARN] non-CFI MO DATA already exists!");
                                            modata.par = undefined;
                                        }

                                        var found = false;
                                        if (modata.pars)
                                        {
                                            for (var iPars = 0; iPars < modata.pars.length; iPars++)
                                            {
                                                var par = modata.pars[iPars];

                                                if (par === iter.currentPar)
                                                {
                                                    found = true;
                                                    console.error("[WARN] mediaOverlayData CFI PAR already registered!");
                                                }
                                            }
                                        }
                                        else
                                        {
                                            modata.pars = [];
                                        }

                                        if (!found)
                                        {
                                            modata.pars.push(iter.currentPar);
                                        }
                                    }

                                }
                                catch (error)
                                {
                                    console.error(error);
                                }
                            }
                            else
                            {
                                try
                                {
                                    var cfi = "epubcfi(" + partial + ")";
                                    $element = EPUBcfi.getTargetElementWithPartialCFI(cfi, $iframe[0].contentDocument,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
                                }
                                catch (error)
                                {
                                    console.error(error);
                                }
                            }
                        }
                        else 
                        {
                            console.error("SMIL text@src CFI fragment identifier scheme not supported: " + iter.currentPar.text.srcFragmentId);
                        }
                    }
                    else
                    {
                        if (selectBody)
                        {
                            $element = $body; //$("body", contentDocElement);
                        }
                        else
                        {
                            $element = $($iframe[0].contentDocument.getElementById(selectId));
                            //$element = $("#" + Helpers.escapeJQuerySelector(iter.currentPar.text.srcFragmentId), contentDocElement);
                        }
                    }

                    if ($element && $element.length > 0) {

                        if (!isCfiTextRange)
                        {
                            if (iter.currentPar.element && iter.currentPar.element !== $element[0]) {
                                console.error("DIFFERENT ELEMENTS??! " + iter.currentPar.text.srcFragmentId + " /// " + iter.currentPar.element.id);
                            }

                            var name = $element[0].nodeName ? $element[0].nodeName.toLowerCase() : undefined;
                            if (name === "audio" || name === "video") {
                                $element.attr("preload", "auto");
                            }

                            iter.currentPar.element = $element[0];

                            var modata = $element.data("mediaOverlayData");
                            if (modata) {
                                console.error("[WARN] MO DATA already exists.");

                                if (modata.par && modata.par !== iter.currentPar) {
                                    console.error("DIFFERENT PARS??!");
                                }
                            }

                            $element.data("mediaOverlayData", {par: iter.currentPar});

                            /*
                             $element.click(function() {
                             var elem = $(this)[0];
                             console.debug("MO CLICK (ELEM): " + elem.id);

                             var par = $(this).data("mediaOverlayData").par;
                             mediaOverlayPlayer.playUserPar(par);
                             });
                             */
                        }
                    }
                    else {
                        console.error("!! CANNOT FIND ELEMENT: " + iter.currentPar.text.srcFragmentId + " == " + iter.currentPar.text.srcFile + " /// " + spineItem.href);
                    }
                }
                else {
//console.debug("[INFO] " + spineItem.href + " != " + textRelativeRef + " # " + iter.currentPar.text.srcFragmentId);
                }
            }

            iter.next();
        }
    }
};

return MediaOverlayDataInjector;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck, Andrey Kavarma
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.


define('views/audio_player',['jquery'],function($) {

    var _iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;
    var _Android = navigator.userAgent.toLowerCase().indexOf('android') > -1;
    var _isMobile = _iOS || _Android;

    //var _isReadiumJS = typeof window.requirejs !== "undefined";

    var DEBUG = false;

    var _audioElement = new Audio();
    
    if (DEBUG)
    {
        _audioElement.addEventListener("load", function()
            {
                console.debug("0) load");
            }
        );

        _audioElement.addEventListener("loadstart", function()
            {
                console.debug("1) loadstart");
            }
        );

        _audioElement.addEventListener("durationchange", function()
            {
                console.debug("2) durationchange");
            }
        );

        _audioElement.addEventListener("loadedmetadata", function()
            {
                console.debug("3) loadedmetadata");
            }
        );

        _audioElement.addEventListener("loadeddata", function()
            {
                console.debug("4) loadeddata");
            }
        );

        _audioElement.addEventListener("progress", function()
            {
                console.debug("5) progress");
            }
        );

        _audioElement.addEventListener("canplay", function()
            {
                console.debug("6) canplay");
            }
        );

        _audioElement.addEventListener("canplaythrough", function()
            {
                console.debug("7) canplaythrough");
            }
        );

        _audioElement.addEventListener("play", function()
            {
                console.debug("8) play");
            }
        );

        _audioElement.addEventListener("pause", function()
            {
                console.debug("9) pause");
            }
        );

        _audioElement.addEventListener("ended", function()
            {
                console.debug("10) ended");
            }
        );

        _audioElement.addEventListener("seeked", function()
            {
                console.debug("X) seeked");
            }
        );

        _audioElement.addEventListener("timeupdate", function()
            {
                console.debug("Y) timeupdate");
            }
        );

        _audioElement.addEventListener("seeking", function()
            {
                console.debug("Z) seeking");
            }
        );
    }

    /**
     *
     * @param onStatusChanged
     * @param onPositionChanged
     * @param onAudioEnded
     * @param onAudioPlay
     * @param onAudioPause
     * @constructor
     */
    var AudioPlayer = function(onStatusChanged, onPositionChanged, onAudioEnded, onAudioPlay, onAudioPause)
    {
        var self = this;
     
        //_audioElement.setAttribute("preload", "auto");
    
        var _currentEpubSrc = undefined;
    
        var _currentSmilSrc = undefined;
        this.currentSmilSrc = function() {
            return _currentSmilSrc;
        };

        var _rate = 1.0;
        this.setRate = function(rate)
        {
            _rate = rate;
            if (_rate < 0.5)
            {
                _rate = 0.5;
            }
            if (_rate > 4.0)
            {
                _rate = 4.0;
            }
    
            _audioElement.playbackRate = _rate;
        }
        self.setRate(_rate);
        this.getRate = function()
        {
            return _rate;
        }
    
    
        var _volume = 100.0;
        this.setVolume = function(volume)
        {
            _volume = volume;
            if (_volume < 0.0)
            {
                _volume = 0.0;
            }
            if (_volume > 1.0)
            {
                _volume = 1.0;
            }
            _audioElement.volume = _volume;
        }
        self.setVolume(_volume);
        this.getVolume = function()
        {
            return _volume;
        }
    
        this.play = function()
        {
            if (DEBUG)
            {
                console.error("this.play()");
            }
    
            if(!_currentEpubSrc)
            {
                return false;
            }
    
            startTimer();
    
            self.setVolume(_volume);
            self.setRate(_rate);
    
            _audioElement.play();
    
            return true;
        };
    
        this.pause = function()
        {
            if (DEBUG)
            {
                console.error("this.pause()");
            }
    
            stopTimer();
    
            _audioElement.pause();
        };
    
        _audioElement.addEventListener('play', onPlay, false);
        _audioElement.addEventListener('pause', onPause, false);
        _audioElement.addEventListener('ended', onEnded, false);
    
        function onPlay()
        {
            onStatusChanged({isPlaying: true});
            onAudioPlay();
        }
    
        function onPause()
        {
            onAudioPause();
            onStatusChanged({isPlaying: false});
        }
    
        function onEnded()
        {
            if (_audioElement.moSeeking)
            {
                if (DEBUG)
                {
                    console.debug("onEnded() skipped (still seeking...)");
                }
    
                return;
            }
    
            stopTimer();
    
            onAudioEnded();
            onStatusChanged({isPlaying: false});
        }
        
        var _intervalTimerSkips = 0;
        
        var _intervalTimer = undefined;
        function startTimer()
        {
            if(_intervalTimer)
            {
                return;
            }
    
            _intervalTimer = setInterval(
                function()
                {
                    if (_audioElement.moSeeking)
                    {
                        if (DEBUG)
                        {
//console.debug("interval timer skipped (still seeking...)");
                        }
                                         
                        _intervalTimerSkips++;
                        if (_intervalTimerSkips > 1000)
                        {
                            _intervalTimerSkips = 0;
                            stopTimer();
                        }
                        return;
                    }
                    
                    var currentTime = undefined;
                    try
                    {
                        currentTime = _audioElement.currentTime;
                    }
                    catch (ex)
                    {
                        console.error(ex.message);
                    }
    
    //                if (DEBUG)
    //                {
    //                    console.debug("currentTime: " + currentTime);
    //                }
    
                    if (currentTime)
                    {
                        onPositionChanged(currentTime, 1);
                    }
                }, 20);
        }
    
        function stopTimer()
        {
            if (_intervalTimer)
            {
                clearInterval(_intervalTimer);
            }
            _intervalTimer = undefined;
        }
    
        this.isPlaying = function()
        {
            return _intervalTimer !== undefined;
        };
    
        this.reset = function()
        {
            if (DEBUG)
            {
                console.error("this.reset()");
            }
    
            this.pause();
    
            _audioElement.moSeeking = undefined;
    
            _currentSmilSrc = undefined;
            _currentEpubSrc = undefined;
    
            setTimeout(function()
            {
                _audioElement.setAttribute("src", "");
            }, 1);
        };
    

        _audioElement.addEventListener("loadstart", function()
            {
                _touchInited = true;
            }
        );
        var _touchInited = false;
        this.touchInit = function()
        {
            if (!_iOS)
            {
                return false;
            }
    
            if (_touchInited)
            {
                return false;
            }
    
            _touchInited = true;
    
            _audioElement.setAttribute("src", "touch/init/html5/audio.mp3");
            _audioElement.load();
    
            return true;
        };
    
        var _playId = 0;
    
        var _seekQueuing = 0;
        
        this.playFile = function(smilSrc, epubSrc, seekBegin) //element
        {
            _playId++;
            if (_playId > 99999)
            {
                _playId = 0;
            }
    
            var playId = _playId;
    
            if (_audioElement.moSeeking)
            {
                _seekQueuing++;
                if (_seekQueuing > MAX_SEEK_RETRIES)
                {
                    _seekQueuing = 0;
                    return;
                }
                
                if (DEBUG)
                {
                    console.debug("this.playFile(" + epubSrc + ")" + " @" + seekBegin + " (POSTPONE, SEEKING...)");
                }
    
                setTimeout(function()
                {
                    self.playFile(smilSrc, epubSrc, seekBegin);
                }, 20);
                
                return;
            }
    
            _audioElement.moSeeking = {};
    
            if (DEBUG)
            {
                console.debug("this.playFile(" + epubSrc + ")" + " @" + seekBegin + " #" + playId);
            }
    
            var audioNeedsNewSrc = !_currentEpubSrc || _currentEpubSrc !== epubSrc;
    
            if (!audioNeedsNewSrc)
            {
                if (DEBUG)
                {
                    console.debug("this.playFile() SAME SRC");
                }
    
                this.pause();
    
                _currentSmilSrc = smilSrc;
                _currentEpubSrc = epubSrc;
    
                playSeekCurrentTime(seekBegin, playId, false);
    
                return;
            }
    
            if (DEBUG)
            {
                console.debug("this.playFile() NEW SRC");
                console.debug("_currentEpubSrc: " + _currentEpubSrc);
                console.debug("epubSrc: " + epubSrc);
            }
    
            this.reset();
            _audioElement.moSeeking = {};
    
            _currentSmilSrc = smilSrc;
            _currentEpubSrc = epubSrc;
    
            //element.parentNode.insertBefore(_audioElement, element); //element.parentNode.childNodes[0]);
            
            if (!_Android)
            {
                _audioElement.addEventListener('play', onPlayToForcePreload, false);
            }
    
            $(_audioElement).on(_readyEvent, {seekBegin: seekBegin, playId: playId}, onReadyToSeek);
            
            setTimeout(function()
            {
                   _audioElement.setAttribute("src", _currentEpubSrc);
                   // _audioElement.src = _currentEpubSrc;
                   // $(_audioElement).attr("src", _currentEpubSrc);
    
                   // if (_Android)
                   // {
                   //     _audioElement.addEventListener('loadstart', onReadyToPlayToForcePreload, false);
                   // }
                   
                   _audioElement.load();
    
                   if (!_Android)
                   {
                       playToForcePreload();
                   }
            }, 1);
        };
    
        // var onReadyToPlayToForcePreload = function ()
        // {
        //     _audioElement.removeEventListener('loadstart', onReadyToPlayToForcePreload, false);
        //     
        //     if (DEBUG)
        //     {
        //         console.debug("onReadyToPlayToForcePreload");
        //     }
        //     
        //     playToForcePreload();
        // };
        
        var playToForcePreload = function()
        {
            if (DEBUG)
            {
                console.debug("playToForcePreload");
            }
            
            //_audioElement.volume = 0;
            //_audioElement.play();
            var vol = _volume;
            _volume = 0;
            self.play();
            _volume = vol;
        };
    
        var onPlayToForcePreload = function ()
        {
            _audioElement.removeEventListener('play', onPlayToForcePreload, false);
            
            if (DEBUG)
            {
                console.debug("onPlayToForcePreload");
            }
            _audioElement.pause(); // note: interval timer continues (immediately follows self.play())
        };
    
        var _readyEvent = _Android ? "canplaythrough" : "canplay";
        function onReadyToSeek_(event)
        {
            if (DEBUG)
            {
                console.debug("onReadyToSeek #" + event.data.playId);
            }
            playSeekCurrentTime(event.data.seekBegin, event.data.playId, true);
        }
        function onReadyToSeek(event)
        {
            $(_audioElement).off(_readyEvent, onReadyToSeek);
            
            if (!_Android)
            {
                onReadyToSeek_(event);
            }
            else
            {
                if (DEBUG)
                {
                    console.debug("onReadyToSeek ANDROID ... waiting a bit ... #" + event.data.playId);
                }
                
                //self.play();
                playToForcePreload();
                
                setTimeout(function() {
                    onReadyToSeek_(event);
                }, 1000);
            }
        }
    
        function playSeekCurrentTime(newCurrentTime, playId, isNewSrc)
        {
            if (DEBUG)
            {
                console.debug("playSeekCurrentTime() #" + playId);
            }
    
            if (newCurrentTime == 0)
            {
                newCurrentTime = 0.01;
            }
    
            if(Math.abs(newCurrentTime - _audioElement.currentTime) < 0.3)
            {
                if (DEBUG)
                {
                    console.debug("playSeekCurrentTime() CONTINUE");
                }
    
                _audioElement.moSeeking = undefined;
                self.play();
                return;
            }
    
            var ev = isNewSrc ? _seekedEvent1 : _seekedEvent2;
    
            if (DEBUG)
            {
                console.debug("playSeekCurrentTime() NEED SEEK, EV: " + ev);
            }
    
            self.pause();
    
            $(_audioElement).on(ev, {newCurrentTime: newCurrentTime, playId: playId, isNewSrc: isNewSrc}, onSeeked);
    
            try
            {
                _audioElement.currentTime = newCurrentTime;
            }
            catch (ex)
            {
                console.error(ex.message);
    
                setTimeout(function()
                {
                    try
                    {
                        _audioElement.currentTime = newCurrentTime;
                    }
                    catch (ex)
                    {
                        console.error(ex.message);
                    }
                }, 5);
            }
        }
        
        var MAX_SEEK_RETRIES = 10;
        var _seekedEvent1 = _iOS ? "canplaythrough" : "seeked"; //"progress"
        var _seekedEvent2 = _iOS ? "timeupdate" : "seeked";
        function onSeeked(event)
        {
            var ev = event.data.isNewSrc ? _seekedEvent1 : _seekedEvent2;
    
            var notRetry = event.data.seekRetries == undefined;
    
            if (notRetry || event.data.seekRetries == MAX_SEEK_RETRIES) // first retry
            {
                $(_audioElement).off(ev, onSeeked);
            }
    
            if (DEBUG)
            {
                console.debug("onSeeked() #" + event.data.playId + " FIRST? " + notRetry + " EV: " + ev);
            }
    
            var curTime = _audioElement.currentTime;
            var diff = Math.abs(event.data.newCurrentTime - curTime);
    
            if((notRetry || event.data.seekRetries >= 0) &&
                diff >= 1)
            {
                if (DEBUG)
                {
                    console.debug("onSeeked() time diff: " + event.data.newCurrentTime + " vs. " + curTime + " ("+diff+")");
                }
                
                if (notRetry)
                {
                    event.data.seekRetries = MAX_SEEK_RETRIES;
    
                    // if (DEBUG)
                    // {
                    //     console.debug("onSeeked() fail => first retry, EV: " + _seekedEvent2);
                    // }
    
                    event.data.isNewSrc = false;
                    //$(_audioElement).on(_seekedEvent2, event.data, onSeeked);
                }
                
                //else
                {
                    event.data.seekRetries--;
    
                    if (DEBUG)
                    {
                        console.debug("onSeeked() FAIL => retry again (timeout)");
                    }
    
                    setTimeout(function()
                    {
                        onSeeked(event);
                    }, _Android ? 1000 : 200);
                }
    
                setTimeout(function()
                {
                    _audioElement.pause();
                    try
                    {
                        _audioElement.currentTime = event.data.newCurrentTime;
                    }
                    catch (ex)
                    {
                        console.error(ex.message);
    
                        setTimeout(function()
                        {
                            try
                            {
                                _audioElement.currentTime = event.data.newCurrentTime;
                            }
                            catch (ex)
                            {
                                console.error(ex.message);
                            }
                        }, 4);
                    }
                }, 5);
            }
            else
            {
                if (DEBUG)
                {
                    console.debug("onSeeked() STATE:");
                    console.debug(notRetry);
                    console.debug(event.data.seekRetries);
                    console.debug(diff);
                }
    
                if (diff >= 1)
                {
                    if (DEBUG)
                    {
                        console.debug("onSeeked() ABORT, TRY AGAIN FROM SCRATCH!");
                    }
                    
                    var smilSrc = _currentSmilSrc;
                    var epubSrc = _currentEpubSrc;
                    var seekBegin = event.data.newCurrentTime;
                    
                    self.reset();
                    
                    setTimeout(function()
                    {
                        self.playFile(smilSrc, epubSrc, seekBegin);
                    }, 10);
                    
                    return;
                }

                if (DEBUG)
                {
                    console.debug("onSeeked() OKAY => play!");
                }
                
                event.data.seekRetries = undefined;
    
                self.play();
    
                _audioElement.moSeeking = undefined;
            }
        }
    };

    return AudioPlayer;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('views/media_overlay_element_highlighter',['jquery', 'rangy', 'epubCfi'], function($, rangy, epubCfi) {
/**
 *
 * @param reader
 * @constructor
 */
var MediaOverlayElementHighlighter = function(reader) {

    this.includeParWhenAdjustingToSeqSyncGranularity = true;

    var DEFAULT_MO_ACTIVE_CLASS = "mo-active-default";
    var DEFAULT_MO_SUB_SYNC_CLASS = "mo-sub-sync";
    
    //var BACK_COLOR = "#99CCCC";

    var _highlightedElementPar = undefined;
    this.isElementHighlighted = function(par)
    {
        return _highlightedElementPar && par === _highlightedElementPar;
    };
    
    var _highlightedCfiPar = undefined;
    this.isCfiHighlighted = function(par)
    {
        return _highlightedCfiPar && par === _highlightedCfiPar;
    };

    var _activeClass = "";
    var _playbackActiveClass = "";

    var _reader = reader;
    
    var USE_RANGY = true && (typeof rangy !== "undefined");
    var _rangyCSS = undefined;
    var _rangyRange = undefined;
    
    var HIGHLIGHT_ID = "MO_SPEAK";
    
    var self = this;

    var $userStyle = undefined;
    
    this.reDo = function()
    {
        //this.reset();
        
        if ($userStyle)
        {
            $userStyle.remove();
        }
        $userStyle = undefined;

        var he = _highlightedElementPar;
        var hc = _highlightedCfiPar;
        var c1 = _activeClass;
        var c2 = _playbackActiveClass;
        
        if (_highlightedElementPar)
        {
            this.reset();

            this.highlightElement(he, c1, c2);
        }
        else if (_highlightedCfiPar)
        {
            this.reset();

            this.highlightCfi(hc, c1, c2);
        }
    };

    function ensureUserStyle($element, hasAuthorStyle, overrideWithUserStyle)
    {
        if ($userStyle)
        {
            try
            {
                if ($userStyle[0].ownerDocument === $element[0].ownerDocument)
                {
                    return;
                }
            }
            catch (e)
            {
                
            }
        }


        $head = $("head", $element[0].ownerDocument.documentElement);

        $userStyle = $("<style type='text/css'> </style>");

        $userStyle.append("." + DEFAULT_MO_ACTIVE_CLASS + " {");
        
        var fallbackUserStyle = "background-color: yellow !important; color: black !important; border-radius: 0.4em;";
        
        var style = overrideWithUserStyle; //_reader.userStyles().findStyle("." + DEFAULT_MO_ACTIVE_CLASS);
        if (style)
        {
            var atLeastOne = false;
            for(var prop in style.declarations)
            {
                if(!style.declarations.hasOwnProperty(prop))
                {
                    continue;
                }

                atLeastOne = true;
                $userStyle.append(prop + ": " + style.declarations[prop] + "; ");
            }
            
            if (!atLeastOne && !hasAuthorStyle)
            {
                $userStyle.append(fallbackUserStyle);
            }
        }
        else if (!hasAuthorStyle)
        {
            $userStyle.append(fallbackUserStyle);
        }
        
        $userStyle.append("}");
        
        
        // ---- CFI
        //$userStyle.append(" .highlight {background-color: blue; border: 2x solid green;}"); //.hover-highlight
        
        
        $userStyle.appendTo($head);

//console.debug($userStyle[0].textContent);
    };
    
    this.highlightElement = function(par, activeClass, playbackActiveClass) {

        if(!par || par === _highlightedElementPar) {
            return;
        }

        this.reset();

        _highlightedElementPar = par;
        _highlightedCfiPar = undefined;
        
        _activeClass = activeClass;
        _playbackActiveClass = playbackActiveClass;

        var seq = this.adjustParToSeqSyncGranularity(_highlightedElementPar);
        var element = seq.element;
        
        if (_playbackActiveClass && _playbackActiveClass !== "")
        {
            //console.debug("MO playbackActiveClass: " + _playbackActiveClass);
            $(element.ownerDocument.documentElement).addClass(_playbackActiveClass);
            //console.debug("MO playbackActiveClass 2: " + element.ownerDocument.documentElement.classList);
        }

        var $hel = $(element);

        var hasAuthorStyle = _activeClass && _activeClass !== "";
        var overrideWithUserStyle = _reader.userStyles().findStyle("." + DEFAULT_MO_ACTIVE_CLASS);

        ensureUserStyle($hel, hasAuthorStyle, overrideWithUserStyle);
                
        if (overrideWithUserStyle || !hasAuthorStyle)
        {
            //console.debug("MO active NO CLASS: " + _activeClass);

            if (hasAuthorStyle)
            {
                $hel.addClass(_activeClass);
            }
            
            $hel.addClass(DEFAULT_MO_ACTIVE_CLASS);

            //$(element).css("background", BACK_COLOR);
        }
        else
        {
            //console.debug("MO activeClass: " + _activeClass);
            $hel.addClass(_activeClass);
        }
        
        if (this.includeParWhenAdjustingToSeqSyncGranularity || _highlightedElementPar !== seq)
        {
            $(_highlightedElementPar.element).addClass(DEFAULT_MO_SUB_SYNC_CLASS);
        }
        
// ---- CFI
//         try
//         {
//             // //noinspection JSUnresolvedVariable
//             // var cfi = EPUBcfi.Generator.generateElementCFIComponent(element); //$hel[0]
//             // if(cfi[0] == "!") {
//             //     cfi = cfi.substring(1);
//             // }
// 
// //console.log(element);
//         
//             var firstTextNode = getFirstTextNode(element);
//             var txtFirst = firstTextNode.textContent;
// //console.log(txtFirst);
// 
//             var lastTextNode = getLastTextNode(element);
//             var txtLast = lastTextNode.textContent;
// //console.log(txtLast);
//         
//             var cfi = EPUBcfi.Generator.generateCharOffsetRangeComponent(
//                     firstTextNode, 
//                     0, 
//                     lastTextNode, 
//                     txtLast.length,
//                     ["cfi-marker"],
//                     [],
//                     ["MathJax_Message"]
//                     );
//             
//             var id = $hel.data("mediaOverlayData").par.getSmil().spineItemId;
//             _reader.addHighlight(id, cfi, HIGHLIGHT_ID,
//             "highlight", //"underline"
//             undefined // styles
//                         );
//         }
//         catch(error)
//         {
//             console.error(error);
//         
//             removeHighlight();
//         }
    };
    
    this.highlightCfi = function(par, activeClass, playbackActiveClass) {

        if(!par || par === _highlightedCfiPar) {
            return;
        }

        this.reset();

        _highlightedElementPar = undefined;
        _highlightedCfiPar = par;
        
        _activeClass = activeClass;
        _playbackActiveClass = playbackActiveClass;

        var $hel = $(_highlightedCfiPar.cfi.cfiTextParent);

        var hasAuthorStyle = _activeClass && _activeClass !== "";
        var overrideWithUserStyle = _reader.userStyles().findStyle("." + DEFAULT_MO_ACTIVE_CLASS); // TODO: performance issue?

        ensureUserStyle($hel, hasAuthorStyle, overrideWithUserStyle);

        var clazz = (overrideWithUserStyle || !hasAuthorStyle) ? ((hasAuthorStyle ? (_activeClass + " ") : "") + DEFAULT_MO_ACTIVE_CLASS) : _activeClass;

        if (USE_RANGY)
        {
            var doc = _highlightedCfiPar.cfi.cfiTextParent.ownerDocument;

            _rangyRange = rangy.createRange(doc); //createNativeRange

            var startCFI = "epubcfi(" + _highlightedCfiPar.cfi.partialStartCfi + ")";
            var infoStart = EPUBcfi.getTextTerminusInfoWithPartialCFI(startCFI, doc,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoStart);

            var endCFI = "epubcfi(" + _highlightedCfiPar.cfi.partialEndCfi + ")";
            var infoEnd = EPUBcfi.getTextTerminusInfoWithPartialCFI(endCFI, doc,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoEnd);
            
            _rangyRange.setStartAndEnd(
                infoStart.textNode[0], infoStart.textOffset,
                infoEnd.textNode[0], infoEnd.textOffset
            );
            
            if (false && // we use CssClassApplier instead, because surroundContents() has no trivial undoSurroundContents() function (inc. text nodes normalisation, etc.)
                _rangyRange.canSurroundContents())
            {
                _rangyRange.MO_createCssClassApplier = false;
                
                var span = doc.createElementNS("http://www.w3.org/1999/xhtml", 'span');
                span.id = HIGHLIGHT_ID;
                span.setAttribute("id", span.id);
                span.setAttribute("class", clazz + " mo-cfi-highlight");
            
                _rangyRange.surroundContents(span);
            }
            else
            {
                _rangyRange.MO_createCssClassApplier = true;
                
                if (!_rangyCSS || _rangyCSS.cssClass !== clazz)
                {
                    _rangyCSS = rangy.createCssClassApplier(clazz,
                    {
                        elementTagName: "span",
                        elementProperties: {className: "mo-cfi-highlight"},
                        ignoreWhiteSpace: true,
                        applyToEditableOnly: false,
                        normalize: true
                    },
                    ["span"]);
                }

                _rangyCSS.applyToRange(_rangyRange);
            }
        }
        else if (_reader.plugins.annotations)
        {
            try
            {
                //var id = $hel.data("mediaOverlayData").par.getSmil().spineItemId;
                var id = par.getSmil().spineItemId;
                _reader.plugins.annotations.addHighlight(id, par.cfi.partialRangeCfi, HIGHLIGHT_ID,
                "highlight", //"underline"
                undefined // styles
                            );
            }
            catch(error)
            {
                console.error(error);
            }
        }
    };
    
// ---- CFI
//     
//     function getFirstTextNode(node)
//     {
//         if (node.nodeType === Node.TEXT_NODE)
//         {
//             if (node.textContent.trim().length > 0)
//                 return node;
//         }
//         
//         for (var i = 0; i < node.childNodes.length; i++)
//         {
//             var child = node.childNodes[i];
//             var first = getFirstTextNode(child);
//             if (first)
//             {
//                 return first;
//             }
//         }
//         
//         return undefined;
//     }
//     
//     function getLastTextNode(node)
//     {
//         if (node.nodeType === Node.TEXT_NODE)
//         {
//             if (node.textContent.trim().length > 0)
//                 return node;
//         }
//         
//         for (var i = node.childNodes.length-1; i >= 0; i--)
//         {
//             var child = node.childNodes[i];
//             var last = getLastTextNode(child);
//             if (last)
//             {
//                 return last;
//             }
//         }
//         
//         return undefined;
//     }
//     

    this.reset = function() {
        
        if (_highlightedCfiPar)
        {
            var doc = _highlightedCfiPar.cfi.cfiTextParent.ownerDocument;
            if (USE_RANGY)
            {
                if (_rangyCSS && _rangyRange.MO_createCssClassApplier)
                {
                    _rangyCSS.undoToRange(_rangyRange);
                }
                else
                {
                    var toRemove = undefined;
                    while ((toRemove = doc.getElementById(HIGHLIGHT_ID)) !== null)
                    {
                        var txt = toRemove.textContent; // TODO: innerHTML? or better: hasChildNodes loop + detach and re-attach
                        var txtNode = doc.createTextNode(txt);
                        
                        toRemove.parentNode.replaceChild(txtNode, toRemove);
                        txtNode.parentNode.normalize();
                    }
                }
        
                //_rangyCSS = undefined;
                _rangyRange = undefined;
            }
            else if (_reader.plugins.annotations)
            {
                try
                {
                    _reader.plugins.annotations.removeHighlight(HIGHLIGHT_ID);
        
                    var toRemove = undefined;
                    while ((toRemove = doc.getElementById("start-" + HIGHLIGHT_ID)) !== null)
                    {
            console.log("toRemove START");
            console.log(toRemove);
                        toRemove.parentNode.removeChild(toRemove);
                    }
                    while ((toRemove = doc.getElementById("end-" + HIGHLIGHT_ID)) !== null)
                    {
            console.log("toRemove END");
            console.log(toRemove);
                        toRemove.parentNode.removeChild(toRemove);
                    }
                }
                catch(error)
                {
                    console.error(error);
                }
            }
            
            _highlightedCfiPar = undefined;
        }
        
        
        

        if(_highlightedElementPar) {

            var seq = this.adjustParToSeqSyncGranularity(_highlightedElementPar);
            var element = seq.element;
            if (this.includeParWhenAdjustingToSeqSyncGranularity || _highlightedElementPar !== seq)
            {
                $(_highlightedElementPar.element).removeClass(DEFAULT_MO_SUB_SYNC_CLASS);
            }
            
            if (_playbackActiveClass && _playbackActiveClass !== "")
            {
                //console.debug("MO RESET playbackActiveClass: " + _playbackActiveClass);
                $(element.ownerDocument.documentElement).removeClass(_playbackActiveClass);
            }

            if (_activeClass && _activeClass !== "")
            {
                //console.debug("MO RESET activeClass: " + _activeClass);
                $(element).removeClass(_activeClass);
            }
            //else
            //{
                //console.debug("MO RESET active NO CLASS: " + _activeClass);
                $(element).removeClass(DEFAULT_MO_ACTIVE_CLASS);
                //$(element).css("background", '');
            //}

            _highlightedElementPar = undefined;
        }

        _activeClass = "";
        _playbackActiveClass = "";
    };

    this.adjustParToSeqSyncGranularity = function(par)
    {
        if (!par) return undefined;
        
        var sync = _reader.viewerSettings().mediaOverlaysSynchronizationGranularity;
        if (sync && sync.length > 0)
        {
            var element = par.element || (par.cfi ? par.cfi.cfiTextParent : undefined);
            if (!element)
            {
                console.error("adjustParToSeqSyncGranularity !element ???");
                return par; // should never happen!
            }

            var seq = par.getFirstSeqAncestorWithEpubType(sync, this.includeParWhenAdjustingToSeqSyncGranularity);
            if (seq && seq.element)
            {
                return seq;
            }
        }
        
        return par;
    };
};
    return MediaOverlayElementHighlighter;
});

//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.
define('views/scroll_view',["jquery", "underscore", "eventEmitter", "../models/bookmark_data", "../models/current_pages_info", "../helpers",
        "./one_page_view", "../models/page_open_request", "../globals", "../models/viewer_settings"],
    function ($, _, EventEmitter, BookmarkData, CurrentPagesInfo, Helpers,
              OnePageView, PageOpenRequest, Globals, ViewerSettings) {
/**
 * Renders content inside a scrollable view port
 * @param options
 * @param isContinuousScroll
 * @param reader
 * @constructor
 */
var ScrollView = function (options, isContinuousScroll, reader) {

    var _DEBUG = false;

    _.extend(this, new EventEmitter());

    var SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE = 5;
    var ITEM_LOAD_SCROLL_BUFFER = 2000;
    var ON_SCROLL_TIME_DALAY = 300;

    var self = this;

    var _$viewport = options.$viewport;
    var _spine = options.spine;
    var _userStyles = options.userStyles;
    var _deferredPageRequest;
    var _$contentFrame;
    var _$el;

    var _stopTransientViewUpdate = false;

    //this flags used to prevent onScroll event triggering pagination changed when internal layout modifications happens
    //if we trigger pagination change without reference to the original request that started the change - we brake the
    //Media Overlay bechaviyour
    //We can't reuse same flag for all of this action because this actions mey happen in parallel
    var _isPerformingLayoutModifications = false; //performing asynch  actions that may trigger onScroll;
    var _isSettingScrollPosition = false; //this happens when we set scroll position based on open element request
    var _isLoadingNewSpineItemOnPageRequest = false; //

    this.isContinuousScroll = function () {
        return isContinuousScroll;
    };

    this.render = function () {

        var template = Helpers.loadTemplate("scrolled_book_frame", {});

        _$el = $(template);
        _$viewport.append(_$el);

        _$contentFrame = $("#scrolled-content-frame", _$el);
        _$contentFrame.css("overflow", "");
        _$contentFrame.css("overflow-y", "auto");
        _$contentFrame.css("overflow-x", "hidden");
        _$contentFrame.css("-webkit-overflow-scrolling", "touch");
        _$contentFrame.css("width", "100%");
        _$contentFrame.css("height", "100%");
        _$contentFrame.css("position", "relative");

        var settings = reader.viewerSettings();
if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined")
{
            //defaults
            settings = new ViewerSettings({});
        }
        if (settings.enableGPUHardwareAccelerationCSS3D) {
            // This is a necessary counterpart for the same CSS GPU hardware acceleration trick in one_page_view.js
            // This affects the stacking order and re-enables the scrollbar in Safari (works fine in Chrome otherwise)
            _$contentFrame.css("transform", "translateZ(0)");
        }

        // _$contentFrame.css("box-sizing", "border-box");
        // _$contentFrame.css("border", "20px solid red");

        self.applyStyles();

        var lazyScroll = _.debounce(onScroll, ON_SCROLL_TIME_DALAY);

        _$contentFrame.on('scroll', function (e) {
            lazyScroll(e);
            onScrollDirect();
        });

        return self;
    };

    function updateLoadedViewsTop(callback, assertScrollPosition) {

        if (_stopTransientViewUpdate) {
            callback();
            return;
        }

        var viewPage = firstLoadedView();
        if (!viewPage) {
            callback();
            return;
        }

        var viewPortRange = getVisibleRange(0);
        var firstViewRange = getPageViewRange(viewPage);

        if ((viewPortRange.top - firstViewRange.bottom) > ITEM_LOAD_SCROLL_BUFFER) {
            var scrollPos = scrollTop();
            removePageView(viewPage);
            scrollTo(scrollPos - (firstViewRange.bottom - firstViewRange.top), undefined);
            assertScrollPosition("updateLoadedViewsTop 1");
            updateLoadedViewsTop(callback, assertScrollPosition); //recursion
        }
        else if ((viewPortRange.top - firstViewRange.top) < ITEM_LOAD_SCROLL_BUFFER) {
            addToTopOf(viewPage, function (isElementAdded) {
                if (isElementAdded) {
                    assertScrollPosition("updateLoadedViewsTop 2");
                    updateLoadedViewsTop(callback, assertScrollPosition); //recursion
                }
                else {
                    callback();
                }
            });
        }
        else {
            callback();
        }

    }

    function updateLoadedViewsBottom(callback, assertScrollPosition) {

        if (_stopTransientViewUpdate) {
            callback();
            return;
        }

        var viewPage = lastLoadedView();
        if (!viewPage) {
            callback();
            return;
        }

        var viewPortRange = getVisibleRange(0);
        var lastViewRange = getPageViewRange(viewPage);

        if ((lastViewRange.top - viewPortRange.bottom) > ITEM_LOAD_SCROLL_BUFFER) {
            removePageView(viewPage);
            assertScrollPosition("updateLoadedViewsBottom 1");
            updateLoadedViewsBottom(callback, assertScrollPosition); //recursion
        }
        else if ((lastViewRange.bottom - viewPortRange.bottom) < ITEM_LOAD_SCROLL_BUFFER) {
            addToBottomOf(viewPage, function (newPageLoaded) {
                assertScrollPosition("updateLoadedViewsBottom 2");
                if (newPageLoaded) {
                    updateLoadedViewsBottom(callback, assertScrollPosition); //recursion
                }
                else {
                    callback();
                }
            });
        }
        else {
            callback();
        }

    }

    function updateTransientViews(pageView) {

        if (!isContinuousScroll) {
            return;
        }

        var scrollPosBefore = undefined;
if (_DEBUG)
{
    if (pageView)
{
                var offset = pageView.offset();
                if (offset) scrollPosBefore = offset.top;
            }
        }

        // This function double-checks whether the browser has shifted the scroll position because of unforeseen rendering issues.
        // (this should never happen because we handle scroll adjustments during iframe height resizes explicitely in this code)
var assertScrollPosition = function(msg)
{
    if (_DEBUG)
    {
                if (!scrollPosBefore) return;
                var scrollPosAfter = undefined;

                var offset = pageView.offset();
                if (offset) scrollPosAfter = offset.top;

                if (!scrollPosAfter) return;

                var diff = scrollPosAfter - scrollPosBefore;
        if (Math.abs(diff) > 1)
        {
                    console.debug("@@@@@@@@@@@@@@@ SCROLL ADJUST (" + msg + ") " + diff + " -- " + pageView.currentSpineItem().href);
                    //_$contentFrame[0].scrollTop = _$contentFrame[0].scrollTop + diff;
                }
            }
        };

        _isPerformingLayoutModifications = true;
        updateLoadedViewsBottom(function () {
            updateLoadedViewsTop(function () {
                setTimeout(function () {
                    _isPerformingLayoutModifications = false;
                }, ON_SCROLL_TIME_DALAY + 100);
            }, assertScrollPosition);
        }, assertScrollPosition);
    }

    var _mediaOverlaysWasPlayingLastTimeScrollStarted = false;

function onScrollDirect(e)
{
        var settings = reader.viewerSettings();
if (!settings.mediaOverlaysPreservePlaybackWhenScroll)
{
    if (!_mediaOverlaysWasPlayingLastTimeScrollStarted && reader.isMediaOverlayAvailable())
    {
                _mediaOverlaysWasPlayingLastTimeScrollStarted = reader.isPlayingMediaOverlay();
        if (_mediaOverlaysWasPlayingLastTimeScrollStarted)
        {
                    reader.pauseMediaOverlay();
                }
            }
        }
    }

function onScroll(e)
{
        if (!_isPerformingLayoutModifications
            && !_isSettingScrollPosition
            && !_isLoadingNewSpineItemOnPageRequest) {

            updateTransientViews();
            onPaginationChanged(self);

            var settings = reader.viewerSettings();
    if (!settings.mediaOverlaysPreservePlaybackWhenScroll)
    {
        if (_mediaOverlaysWasPlayingLastTimeScrollStarted)
        {
            setTimeout(function()
            {
                        reader.playMediaOverlay();
                        _mediaOverlaysWasPlayingLastTimeScrollStarted = false;
                    }, 100);
                }
            }
        }
    }

    function scrollTo(offset, pageRequest) {

        _$contentFrame[0].scrollTop = offset;

        if (pageRequest) {
            onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
        }
    }

function updatePageViewSizeAndAdjustScroll(pageView)
{
        var scrollPos = scrollTop();
        var rangeBeforeResize = getPageViewRange(pageView);

        updatePageViewSize(pageView);

        var rangeAfterResize = getPageViewRange(pageView);

        var heightAfter = rangeAfterResize.bottom - rangeAfterResize.top;
        var heightBefore = rangeBeforeResize.bottom - rangeBeforeResize.top;

        var delta = heightAfter - heightBefore;

if (Math.abs(delta) > 0)
{
    if (_DEBUG)
    {
                console.debug("IMMEDIATE SCROLL ADJUST: " + pageView.currentSpineItem().href + " == " + delta);
            }
            scrollTo(scrollPos + delta);
        }
    }

function reachStableContentHeight(updateScroll, pageView, iframe, href, fixedLayout, metaWidth, msg, callback)
{
if (!Helpers.isIframeAlive(iframe))
{
    if (_DEBUG)
    {
                console.log("reachStableContentHeight ! win && doc (iFrame disposed?)");
            }

            if (callback) callback(false);
            return;
        }

        var MAX_ATTEMPTS = 10;
        var TIME_MS = 300;

        var w = iframe.contentWindow;
        var d = iframe.contentDocument;

        var previousPolledContentHeight = parseInt(Math.round(parseFloat(w.getComputedStyle(d.documentElement).height))); //body can be shorter!;

        var initialContentHeight = previousPolledContentHeight;

if (updateScroll === 0)
{
            updatePageViewSizeAndAdjustScroll(pageView);
        }
else
{
            updatePageViewSize(pageView);
        }

var tryAgainFunc = function(tryAgain)
{
    if (_DEBUG && tryAgain !== MAX_ATTEMPTS)
    {
                console.log("tryAgainFunc - " + tryAgain + ": " + href + "  <" + initialContentHeight + " -- " + previousPolledContentHeight + ">");
            }

            tryAgain--;
    if (tryAgain < 0)
    {
        if (_DEBUG)
        {
                    console.error("tryAgainFunc abort: " + href);
                }

                if (callback) callback(true);
                return;
            }

    setTimeout(function()
    {
        try
        {
            if (Helpers.isIframeAlive(iframe))
            {
                        var win = iframe.contentWindow;
                        var doc = iframe.contentDocument;

                        var iframeHeight = parseInt(Math.round(parseFloat(window.getComputedStyle(iframe).height)));

                        var docHeight = parseInt(Math.round(parseFloat(win.getComputedStyle(doc.documentElement).height))); //body can be shorter!

                if (previousPolledContentHeight !== docHeight)
                {
                            previousPolledContentHeight = docHeight;

                            tryAgainFunc(tryAgain);
                            return;
                        }

                        // CONTENT HEIGHT IS NOW STABILISED

                        var diff = iframeHeight - docHeight;
                if (Math.abs(diff) > 4)
                {
                    if (_DEBUG)
                    {
                                console.log("$$$ IFRAME HEIGHT ADJUST: " + href + "  [" + diff + "]<" + initialContentHeight + " -- " + previousPolledContentHeight + ">");
                                console.log(msg);
                            }

                    if (updateScroll === 0)
                    {
                                updatePageViewSizeAndAdjustScroll(pageView);
                            }
                    else
                    {
                                updatePageViewSize(pageView);
                            }

                    if (Helpers.isIframeAlive(iframe))
                    {
                                var win = iframe.contentWindow;
                                var doc = iframe.contentDocument;

                                var docHeightAfter = parseInt(Math.round(parseFloat(win.getComputedStyle(doc.documentElement).height))); //body can be shorter!
                                var iframeHeightAfter = parseInt(Math.round(parseFloat(window.getComputedStyle(iframe).height)));

                                var newdiff = iframeHeightAfter - docHeightAfter;
                        if (Math.abs(newdiff) > 4)
                        {
                            if (_DEBUG)
                            {
                                        console.error("## IFRAME HEIGHT ADJUST: " + href + "  [" + newdiff + "]<" + initialContentHeight + " -- " + previousPolledContentHeight + ">");
                                        console.log(msg);
                                    }

                                    tryAgainFunc(tryAgain);
                                    return;
                                }
                        else
                        {
                            if (_DEBUG)
                            {
                                        console.log(">> IFRAME HEIGHT ADJUSTED OKAY: " + href + "  [" + diff + "]<" + initialContentHeight + " -- " + previousPolledContentHeight + ">");
                                        // console.log(msg);
                                    }
                                }
                            }
                    else
                    {
                        if (_DEBUG)
                        {
                                    console.log("tryAgainFunc ! win && doc (iFrame disposed?)");
                                }

                                if (callback) callback(false);
                                return;
                            }
                        }
                else
                {
                            //if (_DEBUG)
                            // console.debug("IFRAME HEIGHT NO NEED ADJUST: " + href);
                            // console.log(msg);
                        }
                    }
            else
            {
                if (_DEBUG)
                {
                            console.log("tryAgainFunc ! win && doc (iFrame disposed?)");
                        }

                        if (callback) callback(false);
                        return;
                    }
                }
        catch(ex)
        {
                    console.error(ex);

                    if (callback) callback(false);
                    return;
                }

                if (callback) callback(true);

            }, TIME_MS);
        };

        tryAgainFunc(MAX_ATTEMPTS);
    }


    function addToTopOf(topView, callback) {

        var prevSpineItem = _spine.prevItem(topView.currentSpineItem(), true);
        if (!prevSpineItem) {
            callback(false);
            return;
        }

        var tmpView = createPageViewForSpineItem(true);

        // add to the end first to avoid scrolling during load
        var lastView = lastLoadedView();
        tmpView.element().insertAfter(lastView.element());

        tmpView.loadSpineItem(prevSpineItem, function (success, $iframe, spineItem, isNewlyLoaded, context) {
            if (success) {

                updatePageViewSize(tmpView);
                var range = getPageViewRange(tmpView);

                removePageView(tmpView);


                var scrollPos = scrollTop();

                var newView = createPageViewForSpineItem();
                var originalHeight = range.bottom - range.top;


                newView.setHeight(originalHeight);
                // iframe is loaded hidden here
                //this.showIFrame();
                //===> not necessary here (temporary iframe)

                newView.element().insertBefore(topView.element());

                scrollPos = scrollPos + originalHeight;

                scrollTo(scrollPos, undefined);

                newView.loadSpineItem(prevSpineItem, function (success, $iframe, spineItem, isNewlyLoaded, context) {
                    if (success) {

                var continueCallback = function(successFlag)
                {
                            onPageViewLoaded(newView, success, $iframe, spineItem, isNewlyLoaded, context);

                            callback(successFlag);
                        };

                reachStableContentHeight(0, newView, $iframe[0], spineItem.href, spineItem.isFixedLayout(), spineItem.isFixedLayout() ? newView.meta_width() : 0, "addToTopOf", continueCallback); // //onIFrameLoad called before this callback, so okay.
                    }
                    else {
                        console.error("Unable to open 2 " + prevSpineItem.href);
                        removePageView(newView);
                        callback(false);
                    }

                });
            }
            else {
                console.error("Unable to open 1 " + prevSpineItem.href);
                removePageView(tmpView);
                callback(false);
            }

        });
    }

    function updatePageViewSize(pageView) {

        if (pageView.currentSpineItem().isFixedLayout()) {
            pageView.scaleToWidth(_$contentFrame.width());
        }
        else {
            pageView.resizeIFrameToContent();
        }
    }

    function addToBottomOf(bottomView, callback) {

        var nexSpineItem = _spine.nextItem(bottomView.currentSpineItem(), true);
        if (!nexSpineItem) {
            callback(false);
            return;
        }

        var scrollPos = scrollTop();

        var newView = createPageViewForSpineItem();
        newView.element().insertAfter(bottomView.element());

        newView.loadSpineItem(nexSpineItem, function (success, $iframe, spineItem, isNewlyLoaded, context) {
            if (success) {

        var continueCallback = function(successFlag)
        {
                    onPageViewLoaded(newView, success, $iframe, spineItem, isNewlyLoaded, context);

                    callback(successFlag);
                };

        reachStableContentHeight(2, newView, $iframe[0], spineItem.href, spineItem.isFixedLayout(), spineItem.isFixedLayout() ? newView.meta_width() : 0, "addToBottomOf", continueCallback); // //onIFrameLoad called before this callback, so okay.
            }
            else {
                console.error("Unable to load " + nexSpineItem.href);
                callback(false);
            }

        });
    }

    function removeLoadedItems() {

        var loadedPageViews = [];

        forEachItemView(function (pageView) {
            loadedPageViews.push(pageView);
        }, false);

        for (var i = 0, count = loadedPageViews.length; i < count; i++) {
            removePageView(loadedPageViews[i]);
        }
    }

    function removePageView(pageView) {

        pageView.element().remove();

    }


    function setFrameSizesToRectangle(rectangle) {

        _$contentFrame.css("left", rectangle.left);
        _$contentFrame.css("top", rectangle.top);
        _$contentFrame.css("right", rectangle.right);
        _$contentFrame.css("bottom", rectangle.bottom);

    }

    this.remove = function () {
        _$el.remove();
    };

    this.onViewportResize = function () {

        if (!_$contentFrame) {
            return;
        }

        forEachItemView(function (pageView) {

            updatePageViewSize(pageView);
        }, false);

        onPaginationChanged(self);

        updateTransientViews();
    };

    var _viewSettings = undefined;
    this.setViewSettings = function (settings) {

        _viewSettings = settings;

        forEachItemView(function (pageView) {

            pageView.setViewSettings(settings);

        }, false);
    };

    function createPageViewForSpineItem(isTemporaryView) {

        options.disablePageTransitions = true; // force

        var pageView = new OnePageView(
            options,
            ["content-doc-frame"],
            true, //enableBookStyleOverrides
            reader);

        pageView.render();
        if (_viewSettings) pageView.setViewSettings(_viewSettings);

        if (!isTemporaryView) {
            pageView.element().data("pageView", pageView);
        }


if (isContinuousScroll)
{
            pageView.decorateIframe();
        }

        return pageView;
    }

    function findPageViewForSpineItem(spineItem, reverse) {

        var retView = undefined;

        forEachItemView(function (pageView) {
            if (pageView.currentSpineItem() == spineItem) {
                retView = pageView;
                //brake the iteration
                return false;
            }
            else {
                return true;
            }

        }, reverse);

        return retView;
    }

    function forEachItemView(func, reverse) {

        var pageNodes = _$contentFrame.children();

        var count = pageNodes.length;
var iter = reverse ? function(ix) { return ix - 1}
                   : function(ix) { return ix + 1};

var compare = reverse ? function(ix) { return ix >= 0}
                      : function(ix) { return ix < count };

        var start = reverse ? count - 1 : 0;

        for (var i = start; compare(i); i = iter(i)) {

            var $element = pageNodes.eq(i);
            var curView = $element.data("pageView");

            if (curView) {

                if (func(curView) === false) {
                    return;
                }
            }
        }
    }

    function firstLoadedView() {

        var firstView = undefined;

        forEachItemView(function (pageView) {

            firstView = pageView;
            return false;

        }, false);

        return firstView;
    }

    function lastLoadedView() {

        var lastView = undefined;

        forEachItemView(function (pageView) {
            lastView = pageView;
            return false;

        }, true);

        return lastView;
    }

    function onPageViewLoaded(pageView, success, $iframe, spineItem, isNewlyLoaded, context) {

        if (success && isNewlyLoaded) {
            self.emit(Globals.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);
        }

    }

    function loadSpineItem(spineItem, callback) {

        removeLoadedItems();

        var scrollPos = scrollTop();

        var loadedView = createPageViewForSpineItem();

        _$contentFrame.append(loadedView.element());

        loadedView.loadSpineItem(spineItem, function (success, $iframe, spineItem, isNewlyLoaded, context) {

            if (success) {

        var continueCallback = function(successFlag)
        {
                    onPageViewLoaded(loadedView, success, $iframe, spineItem, isNewlyLoaded, context);

                    callback(loadedView);

                    //successFlag should always be true as loadedView iFrame cannot be dead at this stage.
                };

        reachStableContentHeight(1, loadedView, $iframe[0], spineItem.href, spineItem.isFixedLayout(), spineItem.isFixedLayout() ? loadedView.meta_width() : 0, "openPage", continueCallback); // //onIFrameLoad called before this callback, so okay.
            }
            else {
                console.error("Unable to load " + spineItem.href);

                removePageView(loadedView);
                loadedView = undefined;
            }

            callback(loadedView);

        });

    }

    this.applyStyles = function () {

        Helpers.setStyles(_userStyles.getStyles(), _$el.parent());

        //because left, top, bottom, right setting ignores padding of parent container
        //we have to take it to account manually
        var elementMargins = Helpers.Margins.fromElement(_$el);

        setFrameSizesToRectangle(elementMargins.padding);

    };

    this.applyBookStyles = function () {

        forEachItemView(function (pageView) {
            pageView.applyBookStyles();
        }, false);
    };


    this.openPage = function (pageRequest) {

        _stopTransientViewUpdate = true;

        //local helper function
        var doneLoadingSpineItem = function (pageView, pageRequest) {

            _deferredPageRequest = undefined;
            openPageViewElement(pageView, pageRequest);
            _stopTransientViewUpdate = false;
            updateTransientViews(pageView);
        };

        if (pageRequest.spineItem) {

            var pageView = findPageViewForSpineItem(pageRequest.spineItem);
            if (pageView) {
                doneLoadingSpineItem(pageView, pageRequest);
            }
            else {
                _deferredPageRequest = pageRequest;
                _isLoadingNewSpineItemOnPageRequest = true;

                loadSpineItem(pageRequest.spineItem, function (pageView) {

                    setTimeout(function () {
                        _isLoadingNewSpineItemOnPageRequest = false;
                    }, ON_SCROLL_TIME_DALAY + 100);

                    if (pageView && _deferredPageRequest) {
                        if (pageView.currentSpineItem() === _deferredPageRequest.spineItem) {
                            doneLoadingSpineItem(pageView, _deferredPageRequest);
                        }
                        else { //while we where waiting for load new request come
                            self.openPage(_deferredPageRequest); //recursion
                        }
                    }
                    else {
                        onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
                    }

                });
            }
        }
        else {
            doneLoadingSpineItem(undefined, pageRequest);
        }
    };

    function openPageViewElement(pageView, pageRequest) {

        var topOffset = 0;
        var pageCount;
        var $element;
        var sfiNav;
        var pageRange;

        if (pageRequest.scrollTop !== undefined) {

            topOffset = pageRequest.scrollTop;
        }
        else if (pageRequest.spineItemPageIndex !== undefined) {

            var pageIndex;
            pageCount = calculatePageCount();
            if (pageRequest.spineItemPageIndex < 0) {
                pageIndex = 0;
            }
            else if (pageRequest.spineItemPageIndex >= pageCount) {
                pageIndex = pageCount - 1;
            }
            else {
                pageIndex = pageRequest.spineItemPageIndex;
            }

            topOffset = pageIndex * viewHeight();
        }
        else if (pageView && pageRequest.elementId) {

            pageRange = getPageViewRange(pageView);
            sfiNav = pageView.getNavigator();
            $element = sfiNav.getElementById(pageRequest.elementId);

            if (!$element || !$element.length) {
                console.warn("Element id=" + pageRequest.elementId + " not found!");
                return;
            }

            if (isElementVisibleOnScreen(pageView, $element, 60)) {
                //TODO refactoring required
                // this is artificial call because MO player waits for this event to continue playing.
                onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
                return;
            }

            topOffset = sfiNav.getVerticalOffsetForElement($element) + pageRange.top;

        }
        else if (pageView && pageRequest.elementCfi) {

            pageRange = getPageViewRange(pageView);
            sfiNav = pageView.getNavigator();
            $element = sfiNav.getElementByCfi(pageRequest.elementCfi);

            if (!$element || !$element.length) {
                console.warn("Element cfi=" + pageRequest.elementCfi + " not found!");
                return;
            }

            if (isElementVisibleOnScreen(pageView, $element, 60)) {
                //TODO refactoring required
                // this is artificial call because MO player waits for this event to continue playing.
                onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
                return;
            }

            topOffset = sfiNav.getVerticalOffsetForElement($element) + pageRange.top;

        }
        else if (pageRequest.firstPage) {

            topOffset = 0;
        }
        else if (pageRequest.lastPage) {
            pageCount = calculatePageCount();

            if (pageCount === 0) {
                return;
            }

            topOffset = scrollHeight() - viewHeight() - 5;
        }
        else if (pageView) {

            pageRange = getPageViewRange(pageView);
            topOffset = pageRange.top;
        }
        else {
            topOffset = 0;
        }

        if (scrollTop() != topOffset) {

            _isSettingScrollPosition = true;
            scrollTo(topOffset, pageRequest);

            setTimeout(function () {
                _isSettingScrollPosition = false;
            }, ON_SCROLL_TIME_DALAY + 100); //we have to wait more than scroll delay to make sure that we don't react on onScroll

        }
        else {
            onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
        }
    }

    function calculatePageCount() {

        return Math.ceil(scrollHeight() / viewHeight());
    }

    function onPaginationChanged(initiator, paginationRequest_spineItem, paginationRequest_elementId) {
        self.emit(Globals.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, {
            paginationInfo: self.getPaginationInfo(),
            initiator: initiator,
            spineItem: paginationRequest_spineItem,
            elementId: paginationRequest_elementId
        });
    }

    function scrollTop() {
        return _$contentFrame[0].scrollTop;
    }

    function scrollBottom() {
        return scrollHeight() - (scrollTop() + viewHeight());
    }

    function viewHeight() {
        return _$contentFrame.height();
    }

    function scrollHeight() {
        return _$contentFrame[0].scrollHeight;
    }

    this.openPageNext = function (initiator) {

        var pageRequest;

        if (scrollBottom() > 0) {

            pageRequest = new PageOpenRequest(undefined, initiator);
            pageRequest.scrollTop = scrollTop() + Math.min(scrollBottom(), viewHeight() - SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE);
            openPageViewElement(undefined, pageRequest);
        }

    };

    this.openPagePrev = function (initiator) {

        var pageRequest;

        if (scrollTop() > 0) {

            pageRequest = new PageOpenRequest(undefined, initiator);
            pageRequest.scrollTop = scrollTop() - (viewHeight() - SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE);
            if (pageRequest.scrollTop < 0) {
                pageRequest.scrollTop = 0;
            }

            openPageViewElement(undefined, pageRequest);
        }
    };

    function getVisiblePageViews() {

        var views = [];

        var range = getVisibleRange(-SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE);

        forEachItemView(function (pageView) {

            if (isPageViewVisibleInRange(pageView, range)) {

                views.push(pageView);
            }
            else if (views.length > 0) {

                return false;
            }

            return true;

        }, false);

        return views;

    }


    function getFirstVisiblePageView() {

        var visibleViews = getVisiblePageViews();

        return visibleViews[0];
    }

    function isPageViewVisibleInRange(pageView, range) {
        var pageViewRange = getPageViewRange(pageView);
        return rangeLength(intersectRanges(pageViewRange, range)) > 0;
    }

    function getPageViewRange(pageView) {
        var range = {top: 0, bottom: 0};

        range.top = pageView.element().position().top + scrollTop();
        range.bottom = range.top + pageView.getCalculatedPageHeight();

        return range;
    }

    this.getFirstVisibleElementCfi = function () {
        var visibleViewPage = getFirstVisiblePageView();
        if (visibleViewPage) {
            return visibleViewPage.getNavigator().getFirstVisibleElementCfi(scrollTop());
        }

        return undefined;
    };

    this.getPaginationInfo = function () {
        var spineItem;
        var pageCount;
        var pageView;
        var pageViewRange;
        var heightAboveViewport;
        var heightBelowViewport;
        var pageCountAbove;
        var pageCountBelow;

        var viewPortRange = getVisibleRange();
        var viewPortHeight = viewPortRange.bottom - viewPortRange.top;

        var paginationInfo = new CurrentPagesInfo(_spine, false);

        var visibleViews = getVisiblePageViews();

        for (var i = 0, count = visibleViews.length; i < count; i++) {

            pageView = visibleViews[i];
            spineItem = pageView.currentSpineItem();
            pageViewRange = getPageViewRange(pageView);

            heightAboveViewport = Math.max(viewPortRange.top - pageViewRange.top, 0);
            heightBelowViewport = Math.max(pageViewRange.bottom - viewPortRange.bottom, 0);

            pageCountAbove = Math.ceil(heightAboveViewport / viewPortHeight);
            pageCountBelow = Math.ceil(heightBelowViewport / viewPortHeight);
            pageCount = pageCountAbove + pageCountBelow + 1;

            paginationInfo.addOpenPage(pageCountAbove, pageCount, spineItem.idref, spineItem.index);
        }

        return paginationInfo;
    };

    this.bookmarkCurrentPage = function () {
        var pageView = getFirstVisiblePageView();

        if (!pageView) {

            return new BookmarkData("", "");
        }

        return new BookmarkData(pageView.currentSpineItem().idref, self.getFirstVisibleElementCfi());
    };


    this.getLoadedSpineItems = function () {
        var spineItems = [];

        forEachItemView(function (pageView) {
            spineItems.push(pageView.currentSpineItem());
        }, false);

        return spineItems;
    };

    this.getElement = function (spineItem, selector) {
        var element = undefined;

        forEachItemView(function (pageView) {
            if (pageView.currentSpineItem() == spineItem) {

                element = pageView.getNavigator().getElement(selector);

                return false;
            }

            return true;

        }, false);

        return element;
    };

    this.getElementByCfi = function (spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        var found = undefined;

        forEachItemView(function (pageView) {
            if (pageView.currentSpineItem() == spineItem) {

                found = pageView.getElementByCfi(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist);
                return false;
            }

            return true;

        }, false);

        if (!found) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return found;
    };

    this.getElementById = function (spineItem, id) {

        var found = undefined;

        forEachItemView(function (pageView) {
            if (pageView.currentSpineItem() == spineItem) {

                found = pageView.getNavigator().getElementById(id);
                return false;
            }

            return true;

        }, false);

        if (!found) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return found;
    };

    this.getFirstVisibleMediaOverlayElement = function () {
        var viewPortRange = getVisibleRange();

        var moElement = undefined;
        var normalizedRange = {top: 0, bottom: 0};
        var pageViewRange;

        var steppedToVisiblePage = false;

        forEachItemView(function (pageView) {
            pageViewRange = getPageViewRange(pageView);

            normalizedRange.top = Math.max(pageViewRange.top, viewPortRange.top) - pageViewRange.top;
            normalizedRange.bottom = Math.min(pageViewRange.bottom, viewPortRange.bottom) - pageViewRange.top;

            if (rangeLength(normalizedRange) > 0) {
                steppedToVisiblePage = true;

                moElement = pageView.getNavigator().getFirstVisibleMediaOverlayElement(normalizedRange);
                if (moElement) {
                    return false;
                }
            }
            else if (steppedToVisiblePage) {
                return false;
            }

            return true; //continue iteration

        }, false);

        return moElement;
    };

    // /**
    //  * @deprecated
    //  */
    // this.getVisibleMediaOverlayElements = function() {
    //     var viewPortRange = getVisibleRange();
    //
    //     var pageMoElements;
    //     var moElements = [];
    //     var normalizedRange = {top: 0, bottom: 0};
    //     var pageViewRange;
    //
    //     forEachItemView(function(pageView){
    //         pageViewRange = getPageViewRange(pageView);
    //
    //         normalizedRange.top = Math.max(pageViewRange.top, viewPortRange.top) - pageViewRange.top;
    //         normalizedRange.bottom = Math.min(pageViewRange.bottom, viewPortRange.bottom) - pageViewRange.top;
    //
    //         if(rangeLength(normalizedRange) > 0) {
    //             pageMoElements = pageView.getNavigator().getVisibleMediaOverlayElements(normalizedRange);
    //             moElements.push.apply(moElements, pageMoElements);
    //         }
    //     }, false);
    //
    //     return moElements;
    // };

    function getVisibleRange(expand) {
        if (expand !== 0 && !expand) {
            expand = 0;
        }

        var range = {

            top: scrollTop() - expand,
            bottom: scrollTop() + viewHeight() + expand
        };

        if (range.top < 0) {
            range.top = 0;
        }

        if (range.bottom > scrollHeight()) {
            range.bottom = scrollHeight();
        }

        return range;

    }

    function intersectRanges(r1, r2) {
        return {

            top: Math.max(r1.top, r2.top),
            bottom: Math.min(r1.bottom, r2.bottom)
        };
    }

    function rangeLength(range) {
        if (range.bottom < range.top) {
            return 0;
        }

        return range.bottom - range.top;
    }

    function isElementVisibleOnScreen(pageView, $element, percentVisible) {

        var elementRange = getElementRange(pageView, $element);

        return isRangeIsVisibleOnScreen(elementRange, percentVisible);
    }

    function isRangeIsVisibleOnScreen(range, percentVisible) {

        var visibleRange = getVisibleRange();

        var smallestVisibleLength = Math.min(rangeLength(visibleRange), rangeLength(range));
        if (smallestVisibleLength === 0) {
            smallestVisibleLength = 5; // if element is 0 height we will set it to arbitrary 5 pixels - not to divide by 0
        }

        var intersectionRange = intersectRanges(visibleRange, range);

        var visiblePercent = (rangeLength(intersectionRange) / smallestVisibleLength) * 100;

        return visiblePercent >= percentVisible;
    }

    function getElementRange(pageView, $element) {

        var pageRange = getPageViewRange(pageView);

        var elementRange = {top: 0, bottom: 0};
        elementRange.top = $element.offset().top + pageRange.top;
        elementRange.bottom = elementRange.top + $element.height();

        return elementRange;
    }

    this.insureElementVisibility = function (spineItemId, element, initiator) {
        var pageView = undefined;

        forEachItemView(function (pv) {
            if (pv.currentSpineItem().idref === spineItemId) {

                pageView = pv;
                return false;
            }

            return true;
        }, false);

        if (!pageView) {
            console.warn("Page for element " + element + " not found");
            return;
        }

        var $element = $(element);

        var elementRange = getElementRange(pageView, $element);

        if (!isRangeIsVisibleOnScreen(elementRange, 60)) {

            var spineItem = _spine.getItemById(spineItemId);
            var openPageRequest = new PageOpenRequest(spineItem, initiator);
            openPageRequest.scrollTop = elementRange.top;

            self.openPage(openPageRequest);
        }

    }

};
return ScrollView;
});
//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('views/media_overlay_player',["jquery", "../helpers", "./audio_player", "./media_overlay_element_highlighter", "../globals", "../models/smil_iterator", "rangy", 'epubCfi', './scroll_view'],
    function($, Helpers, AudioPlayer, MediaOverlayElementHighlighter, Globals, SmilIterator, rangy, epubCfi, ScrollView) {
/**
 *
 * @param reader
 * @param onStatusChanged
 * @constructor
 */
var MediaOverlayPlayer = function(reader, onStatusChanged) {


    var _smilIterator = undefined;

    var _audioPlayer = new AudioPlayer(onStatusChanged, onAudioPositionChanged, onAudioEnded, onPlay, onPause);

    var _ttsIsPlaying = false;
    var _currentTTS = undefined;
    var _enableHTMLSpeech = true && typeof window.speechSynthesis !== "undefined" && speechSynthesis != null; // set to false to force "native" platform TTS engine, rather than HTML Speech API
    
    var _SpeechSynthesisUtterance = undefined;
    //var _skipTTSEndEvent = false;
    var TOKENIZE_TTS = false;

    var _embeddedIsPlaying = false;
    var _currentEmbedded = undefined;


    this.isPlaying = function()
    {
        return _audioPlayer.isPlaying() || _ttsIsPlaying || _embeddedIsPlaying || _blankPagePlayer;
    }

    //var _currentPagination = undefined;
    var _package = reader.package();
    var _settings = reader.viewerSettings();
    var self = this;
    var _elementHighlighter = new MediaOverlayElementHighlighter(reader);

    reader.on(Globals.Events.READER_VIEW_DESTROYED, function(){

        self.reset();

    });


    this.applyStyles = function()
    {
        _elementHighlighter.reDo();
    };

//
// should use this.onSettingsApplied() instead!
//    this.setRate = function(rate) {
//        _audioPlayer.setRate(rate);
//    };
//    this.setVolume = function(volume) {
//        _audioPlayer.setVolume(volume);
//    };


    this.onSettingsApplied = function() {
//console.debug(_settings);
        _audioPlayer.setRate(_settings.mediaOverlaysRate);
        _audioPlayer.setVolume(_settings.mediaOverlaysVolume / 100.0);
    };
    self.onSettingsApplied();
    //Globals.
    reader.on(Globals.Events.SETTINGS_APPLIED, this.onSettingsApplied, this);

    /*
    var lastElement = undefined;
    var lastElementColor = "";
    */

    var _wasPlayingAtDocLoadStart = false;
    this.onDocLoadStart = function() {
        // 1) Globals.Events.CONTENT_DOCUMENT_LOAD_START
        // (maybe 2-page fixed-layout or reflowable spread == 2 documents == 2x events)
        // MOPLayer.onDocLoad()
        
        // 2) Globals.Events.CONTENT_DOCUMENT_LOADED
        // (maybe 2-page fixed-layout or reflowable spread == 2 documents == 2x events)
        //_mediaOverlayDataInjector.attachMediaOverlayData($iframe, spineItem, _viewerSettings);
        
        // 3) Globals.Events.PAGINATION_CHANGED (layout finished, notified before rest of app, just once)
        // MOPLayer.onPageChanged()

        var wasPlaying = self.isPlaying();
        if (wasPlaying)
        {
            _wasPlayingAtDocLoadStart = true;
            self.pause();
        }
    };
    
    var _lastPaginationData = undefined;
    
    this.onPageChanged = function(paginationData) {
        
        _lastPaginationData = paginationData;
        
        var wasPausedBecauseNoAutoNextSmil = _wasPausedBecauseNoAutoNextSmil;
        _wasPausedBecauseNoAutoNextSmil = false;
        
        var wasPlayingAtDocLoadStart = _wasPlayingAtDocLoadStart;
        _wasPlayingAtDocLoadStart = false;

        if(!paginationData) {
            self.reset();
            return;
        }

//        if (paginationData.paginationInfo)
//        {
//            _currentPagination = paginationData.paginationInfo;
//        }

        /*
        if (lastElement)
        {
            $(lastElement).css("background-color", lastElementColor);
            lastElement = undefined;
        }
        */

        var element = undefined;
        var isCfiTextRange = false;
        
        var fakeOpfRoot = "/99!";
        var epubCfiPrefix = "epubcfi";
        
        if (paginationData.elementId || paginationData.initiator == self)
        {
            var spineItems = reader.getLoadedSpineItems();

            var rtl = reader.spine().isRightToLeft();

            for(var i = (rtl ? (spineItems.length - 1) : 0); rtl && i >=0 || !rtl && i < spineItems.length; i += (rtl ? -1: 1))
            {
                var spineItem = spineItems[i];
                if (paginationData.spineItem && paginationData.spineItem != spineItem)
                {
                    continue;
                }
                
                if (paginationData.elementId && paginationData.elementId.indexOf(epubCfiPrefix) === 0)
                {
                    _elementHighlighter.reset(); // ensure clean DOM (no CFI span markers)
                    
                    var partial = paginationData.elementId.substr(epubCfiPrefix.length + 1, paginationData.elementId.length - epubCfiPrefix.length - 2);
                    
                    if (partial.indexOf(fakeOpfRoot) === 0)
                    {
                        partial = partial.substr(fakeOpfRoot.length, partial.length - fakeOpfRoot.length);
                    }
//console.log(partial);
                    var parts = partial.split(",");
                    if (parts && parts.length === 3)
                    {
                        try
                        {
                            var cfi = parts[0] + parts[1];
                            var $element = reader.getElementByCfi(spineItem, cfi,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);

                            element = ($element && $element.length > 0) ? $element[0] : undefined;
                            if (element)
                            {
                                if (element.nodeType === Node.TEXT_NODE)
                                {
                                    element = element.parentNode;
                                }
                                break;
                            }
                        }
                        catch (error)
                        {
                            console.error(error);
                        }
                    }
                    else
                    {
                        try
                        {
                            //var cfi = "epubcfi(" + partial + ")";
                            //var $element = EPUBcfi.getTargetElementWithPartialCFI(cfi, DOC);
                            var $element = reader.getElementByCfi(spineItem, partial,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
                                
                            element = ($element && $element.length > 0) ? $element[0] : undefined;
                            if (element)
                            {
                                if (element.nodeType === Node.TEXT_NODE)
                                {
                                    element = element.parentNode;
                                }
                                break;
                            }
                        }
                        catch (error)
                        {
                            console.error(error);
                        }
                    }
                }

                if (!element)
                {
                    if (paginationData.initiator == self && !paginationData.elementId)
                    {
                        var $element = reader.getElement(spineItem, "body");
                        element = ($element && $element.length > 0) ? $element[0] : undefined;
                    }
                    else
                    {
                        var $element = reader.getElementById(spineItem, paginationData.elementId);
                        element = ($element && $element.length > 0) ? $element[0] : undefined;
                        //("#" + Globals.Helpers.escapeJQuerySelector(paginationData.elementId))
                    }
                    
                    if (element)
                    {
                        /*
                        console.error("GREEN: " + paginationData.elementId);
                        lastElement = element;
                        lastElementColor = $(element).css("background-color");
                        $(element).css("background-color", "green");
                         */
                        break;
                    }
                }
            }

            if (!element)
            {
                console.error("paginationData.elementId BUT !element: " + paginationData.elementId);
            }
        }

        var wasPlaying = self.isPlaying() || wasPlayingAtDocLoadStart;

        if(!_smilIterator || !_smilIterator.currentPar) {
            if(paginationData.initiator !== self) {
                clipBeginOffset = 0.0;
                self.reset();

                if (paginationData.elementId && element)
                {
                    if (wasPlaying || wasPausedBecauseNoAutoNextSmil)
                    {
                        paginationData.elementIdResolved = element;
                        self.toggleMediaOverlayRefresh(paginationData);
                    }
                }
                else if (wasPlaying || wasPausedBecauseNoAutoNextSmil)
                {
                    self.toggleMediaOverlay();
                }
                return;
            }

            //paginationData.initiator === self
//
//            if (!paginationData.elementId)
//            {
//                console.error("!paginationData.elementId");
//                clipBeginOffset = 0.0;
//                return;
//            }

            if(!element)
            {
                console.error("!element: " + paginationData.elementId);
                clipBeginOffset = 0.0;
                return;
            }

            var moData = $(element).data("mediaOverlayData");
            if(!moData) {
                console.error("!moData: " + paginationData.elementId);
                clipBeginOffset = 0.0;
                return;
            }

            var parToPlay = moData.par ? moData.par : moData.pars[0];

            if (moData.pars)
            {
                for (var iPar = 0; iPar < moData.pars.length; iPar++)
                {
                    var p = moData.pars[iPar];
                    
                    if (paginationData.elementId === p.cfi.smilTextSrcCfi)
                    {
                        parToPlay = p;
                        break;
                    }
                }
            }
            
            playPar(parToPlay);
            return;
        }

        var noReverseData = !_smilIterator.currentPar.element && !_smilIterator.currentPar.cfi;
        if(noReverseData) {
            console.error("!! _smilIterator.currentPar.element ??");
        }

//console.debug("+++> paginationData.elementId: " + paginationData.elementId + " /// " + _smilIterator.currentPar.text.srcFile + " # " + _smilIterator.currentPar.text.srcFragmentId); //PageOpenRequest.elementId


        if(paginationData.initiator == self)
        {
            var notSameTargetID = paginationData.elementId && paginationData.elementId !== _smilIterator.currentPar.text.srcFragmentId;

            if(notSameTargetID) {
                console.error("!! paginationData.elementId !== _smilIterator.currentPar.text.srcFragmentId");
            }

            if(notSameTargetID || noReverseData) {
                clipBeginOffset = 0.0;
                return;
            }

            if(wasPlaying)
            {
                highlightCurrentElement();
            }
            else
            {
                playCurrentPar();
            }
        }
        else
        {
            if(!wasPlaying && !wasPausedBecauseNoAutoNextSmil)
            {
                self.reset();
                return;
            }

            if(!paginationData.elementId)
            {
                //self.reset();
            }

            if(paginationData.elementId && !element)
            {
                //self.reset();
                return;
            }

            if(paginationData.elementId)
            {
                paginationData.elementIdResolved = element;
            }
            
            self.toggleMediaOverlayRefresh(paginationData);
        }
    };

    function playPar(par) {

        var parSmil = par.getSmil();
        if(!_smilIterator || _smilIterator.smil != parSmil)
        {
            _smilIterator = new SmilIterator(parSmil);
        }
        else {
            _smilIterator.reset();
        }

        _smilIterator.goToPar(par);

        if(!_smilIterator.currentPar) {
            console.error("playPar !_smilIterator.currentPar");
            return;
        }

        playCurrentPar();
    }

    var clipBeginOffset = 0.0;

    var _blankPagePlayer = undefined;

    function initBlankPagePlayer()
    {
        self.resetBlankPage();

        _blankPagePlayer = setTimeout(function() {

            if (!_blankPagePlayer)
            {
                return;
            }

            self.resetBlankPage();

            if (!_smilIterator || !_smilIterator.currentPar)
            {
                self.reset();
                return;
            }

            audioCurrentTime = 0.0;
//console.log("BLANK END.");
            //nextSmil(true);
            onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1, 2);

        }, 2000);

        onStatusChanged({isPlaying: true});
    }

    function playCurrentPar() {
        _wasPlayingScrolling = false;
        
        if (!_smilIterator || !_smilIterator.currentPar)
        {
            console.error("playCurrentPar !_smilIterator || !_smilIterator.currentPar ???");
            return;
        }

        if (!_smilIterator.smil.id)
        {
            _audioPlayer.reset();

            self.resetTTS();
            self.resetEmbedded();

            setTimeout(function()
            {
                initBlankPagePlayer();
            }, 100);

            return;
        }
        else if (!_smilIterator.currentPar.audio.src)
        {
            clipBeginOffset = 0.0;

//            if (_currentTTS)
//            {
//                _skipTTSEnded = true;
//            }

            _audioPlayer.reset();

            var element = _smilIterator.currentPar.element;
            if (element)
            {
                audioCurrentTime = 0.0;

                var name = element.nodeName ? element.nodeName.toLowerCase() : undefined;

                if (name === "audio" || name === "video")
                {
                    self.resetTTS();
                    self.resetBlankPage();

                    if (_currentEmbedded)
                    {
                        self.resetEmbedded();
                    }

                    _currentEmbedded = element;

                    _currentEmbedded.pause();

                    // DONE at reader_view.attachMO()
                    //$(_currentEmbedded).attr("preload", "auto");

                    _currentEmbedded.currentTime = 0;

                    _currentEmbedded.play();

                    $(_currentEmbedded).on("ended", self.onEmbeddedEnd);

                    _embeddedIsPlaying = true;
                    
                    // gives the audio player some dispatcher time to raise the onPause event
                    setTimeout(function(){
                        onStatusChanged({isPlaying: true});
                    }, 80);

//                    $(element).on("seeked", function()
//                    {
//                        $(element).off("seeked", onSeeked);
//                    });
                }
                else
                {
                    self.resetEmbedded();
                    self.resetBlankPage();

                    _currentTTS = element.textContent; //.innerText (CSS display sensitive + script + style tags)
                    if (!_currentTTS || _currentTTS == "")
                    {
                        _currentTTS = undefined;
                    }
                    else
                    {
                        speakStart(_currentTTS);
                    }
                }
            }
            
            var cfi = _smilIterator.currentPar.cfi;
            if (cfi)
            {
                audioCurrentTime = 0.0;
                self.resetEmbedded();
                self.resetBlankPage();

                _elementHighlighter.reset(); // ensure clean DOM (no CFI span markers)
                
                var doc = cfi.cfiTextParent.ownerDocument;

                var startCFI = "epubcfi(" + cfi.partialStartCfi + ")";
                var infoStart = EPUBcfi.getTextTerminusInfoWithPartialCFI(startCFI, doc,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoStart);

                var endCFI = "epubcfi(" + cfi.partialEndCfi + ")";
                var infoEnd = EPUBcfi.getTextTerminusInfoWithPartialCFI(endCFI, doc,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]);
//console.log(infoEnd);

                if (rangy)
                {
                    //infoStart.textNode[0].parentNode.ownerDocument
                    var range = rangy.createRange(doc); //createNativeRange
                    range.setStartAndEnd(
                        infoStart.textNode[0], infoStart.textOffset,
                        infoEnd.textNode[0], infoEnd.textOffset
                    );
                    _currentTTS = range.toString(); //.text()
                }
                else
                {
                    _currentTTS = undefined;
                }

                if (!_currentTTS || _currentTTS == "")
                {
                    _currentTTS = undefined;
                }
                else
                {
                    speakStart(_currentTTS);
                }
            }
        }
        else
        {
            self.resetTTS();
            self.resetEmbedded();
            self.resetBlankPage();

            var dur = _smilIterator.currentPar.audio.clipEnd - _smilIterator.currentPar.audio.clipBegin;
            if (dur <= 0 || clipBeginOffset > dur)
            {
                console.error("### MO XXX PAR OFFSET: " + clipBeginOffset + " / " + dur);
                clipBeginOffset = 0.0;
            }
            else
            {
//console.debug("### MO PAR OFFSET: " + clipBeginOffset);
            }

            var audioContentRef = Helpers.ResolveContentRef(_smilIterator.currentPar.audio.src, _smilIterator.smil.href);

            var audioSource = _package.resolveRelativeUrlMO(audioContentRef);

            var startTime = _smilIterator.currentPar.audio.clipBegin + clipBeginOffset;

//console.debug("PLAY START TIME: " + startTime + "("+_smilIterator.currentPar.audio.clipBegin+" + "+clipBeginOffset+")");

            _audioPlayer.playFile(_smilIterator.currentPar.audio.src, audioSource, startTime); //_smilIterator.currentPar.element ? _smilIterator.currentPar.element : _smilIterator.currentPar.cfi.cfiTextParent
        }

        clipBeginOffset = 0.0;

        highlightCurrentElement();
    }

    function nextSmil(goNext)
    {
        self.pause();

//console.debug("current Smil: " + _smilIterator.smil.href + " /// " + _smilIterator.smil.id);

        var nextSmil = goNext ? _package.media_overlay.getNextSmil(_smilIterator.smil) : _package.media_overlay.getPreviousSmil(_smilIterator.smil);
        if(nextSmil) {

//console.debug("nextSmil: " + nextSmil.href + " /// " + nextSmil.id);

            _smilIterator = new SmilIterator(nextSmil);
            if(_smilIterator.currentPar) {
                if (!goNext)
                {
                    while (!_smilIterator.isLast())
                    {
                        _smilIterator.next();
                    }
                }

//console.debug("openContentUrl (nextSmil): " + _smilIterator.currentPar.text.src + " -- " + _smilIterator.smil.href);

                reader.openContentUrl(_smilIterator.currentPar.text.src, _smilIterator.smil.href, self);
            }
        }
        else
        {
            console.log("No more SMIL");
            self.reset();
        }
    }


    var _skipAudioEnded = false;
//    var _skipTTSEnded = false;

    var audioCurrentTime = 0.0;

    var DIRECTION_MARK = -999;

//    var _letPlay = false;

//from
//1 = audio player
//2 = blank page
//3 = video/audio embbeded
//4 = TTS
//5 = audio end
//6 = user previous/next/escape
    function onAudioPositionChanged(position, from, skipping) { //noLetPlay

        audioCurrentTime = position;

//        if (_letPlay)
//        {
//            return;
//        }

        _skipAudioEnded = false;
//        _skipTTSEnded = false;

        if (!_smilIterator || !_smilIterator.currentPar)
        {
            return;
        }

        var parFrom = _smilIterator.currentPar;
        
        var audio = _smilIterator.currentPar.audio;

        //var TOLERANCE = 0.05;
        if(
            //position >= (audio.clipBegin - TOLERANCE) &&
        position > DIRECTION_MARK &&
            position <= audio.clipEnd) {

//console.debug("onAudioPositionChanged: " + position);
            return;
        }

        _skipAudioEnded = true;

//console.debug("PLAY NEXT: " + "(" + audio.clipBegin + " -- " + audio.clipEnd + ") [" + from + "] " +  position);
//console.debug(_smilIterator.currentPar.text.srcFragmentId);

        var isPlaying = _audioPlayer.isPlaying();
        if (isPlaying && from === 6)
        {
            console.debug("from userNav _audioPlayer.isPlaying() ???");
        }

        var goNext = position > audio.clipEnd;

        var doNotNextSmil = !_autoNextSmil && from !== 6 && goNext;

        var spineItemIdRef = (_smilIterator && _smilIterator.smil && _smilIterator.smil.spineItemId) ? _smilIterator.smil.spineItemId : ((_lastPaginationData && _lastPaginationData.spineItem && _lastPaginationData.spineItem.idref) ? _lastPaginationData.spineItem.idref : undefined);
        if (doNotNextSmil && spineItemIdRef && _lastPaginationData && _lastPaginationData.paginationInfo && _lastPaginationData.paginationInfo.openPages && _lastPaginationData.paginationInfo.openPages.length > 1)
        {
            //var iPage = _lastPaginationData.paginationInfo.isRightToLeft ? _lastPaginationData.paginationInfo.openPages.length - 1 : 0;
            var iPage = 0;
            
            var openPage = _lastPaginationData.paginationInfo.openPages[iPage];
            if (spineItemIdRef === openPage.idref)
            {
                doNotNextSmil = false;
            }
        }
        
        if (goNext)
        {
            _smilIterator.next();
        }
        else //position <= DIRECTION_MARK
        {
            _smilIterator.previous();
        }

        if(!_smilIterator.currentPar)
        {
            //
            //        if (!noLetPlay)
            //        {
            //            _letPlay = true;
            //            setTimeout(function()
            //            {
            //                _letPlay = false;
            //                nextSmil(goNext);
            //            }, 200);
            //        }
            //        else
            //        {
            //            nextSmil(goNext);
            //        }

//console.debug("NEXT SMIL ON AUDIO POS");
        
            if (doNotNextSmil)
            {
                _wasPausedBecauseNoAutoNextSmil = true;
                self.reset();
                //self.pause();
            }
            else
            {
                nextSmil(goNext);
            }
            return;
        }

//console.debug("ITER: " + _smilIterator.currentPar.text.srcFragmentId);

        if(!_smilIterator.currentPar.audio) {
            self.pause();
            return;
        }
        
        if(_settings.mediaOverlaysSkipSkippables)
        {
            var skip = false;
            var parent = _smilIterator.currentPar;
            while (parent)
            {
                if (parent.isSkippable && parent.isSkippable(_settings.mediaOverlaysSkippables))
                {
                    skip = true;
                    break;
                }
                parent = parent.parent;
            }

            if (skip)
            {
                console.log("MO SKIP: " + parent.epubtype);

                self.pause();

                var pos = goNext ? _smilIterator.currentPar.audio.clipEnd + 0.1 : DIRECTION_MARK - 1;

                onAudioPositionChanged(pos, from, true); //noLetPlay
                return;
            }
        }

        // _settings.mediaOverlaysSynchronizationGranularity
        if (!isPlaying && (_smilIterator.currentPar.element || _smilIterator.currentPar.cfi && _smilIterator.currentPar.cfi.cfiTextParent))
        {
            var scopeTo = _elementHighlighter.adjustParToSeqSyncGranularity(_smilIterator.currentPar);
            if (scopeTo && scopeTo !== _smilIterator.currentPar)
            {
                var scopeFrom = _elementHighlighter.adjustParToSeqSyncGranularity(parFrom);
                if (scopeFrom && (scopeFrom === scopeTo || !goNext))
                {
                    if (scopeFrom === scopeTo)
                    {
                        do
                        {
                            if (goNext) _smilIterator.next();
                            else  _smilIterator.previous();
                        } while (_smilIterator.currentPar && _smilIterator.currentPar.hasAncestor(scopeFrom));

                        if (!_smilIterator.currentPar)
                        {
    //console.debug("adjustParToSeqSyncGranularity nextSmil(goNext)");

                            if (doNotNextSmil)
                            {
                                _wasPausedBecauseNoAutoNextSmil = true;
                                self.reset();
                                //self.pause();
                            }
                            else
                            {
                                nextSmil(goNext);
                            }
                            
                            return;
                        }
                    }
                    
//console.debug("ADJUSTED: " + _smilIterator.currentPar.text.srcFragmentId);
                    if (!goNext)
                    {
                        var landed = _elementHighlighter.adjustParToSeqSyncGranularity(_smilIterator.currentPar);
                        if (landed && landed !== _smilIterator.currentPar)
                        {
                            var backup = _smilIterator.currentPar;
                    
                            var innerPar = undefined;
                            do
                            {
                                innerPar = _smilIterator.currentPar;
                                _smilIterator.previous();
                            }
                            while (_smilIterator.currentPar && _smilIterator.currentPar.hasAncestor(landed));
                        
                            if (_smilIterator.currentPar)
                            {
                                _smilIterator.next();
                                
                                if (!_smilIterator.currentPar.hasAncestor(landed))
                                {
                                    console.error("adjustParToSeqSyncGranularity !_smilIterator.currentPar.hasAncestor(landed) ???");
                                }
                                //assert 
                            }
                            else
                            {
//console.debug("adjustParToSeqSyncGranularity reached begin");

                                _smilIterator.reset();
                                
                                if (_smilIterator.currentPar !== innerPar)
                                {
                                    console.error("adjustParToSeqSyncGranularity _smilIterator.currentPar !=== innerPar???");
                                }
                            }

                            if (!_smilIterator.currentPar)
                            {
                                console.error("adjustParToSeqSyncGranularity !_smilIterator.currentPar ?????");
                                _smilIterator.goToPar(backup);
                            }
                            
//console.debug("ADJUSTED PREV: " + _smilIterator.currentPar.text.srcFragmentId);
                        }
                    }
                }
            }
        }
        
        if(_audioPlayer.isPlaying()
            && _smilIterator.currentPar.audio.src
            && _smilIterator.currentPar.audio.src == _audioPlayer.currentSmilSrc()
                && position >= _smilIterator.currentPar.audio.clipBegin
                && position <= _smilIterator.currentPar.audio.clipEnd)
        {
//console.debug("ONLY highlightCurrentElement");
            highlightCurrentElement();
            return;
        }

        //position <= DIRECTION_MARK goes here (goto previous):

//            if (!noLetPlay && position > DIRECTION_MARK
//                && _audioPlayer.isPlaying() && _audioPlayer.srcRef() != _smilIterator.currentPar.audio.src)
//            {
//                _letPlay = true;
//                setTimeout(function()
//                {
//                    _letPlay = false;
//                    playCurrentPar();
//                }, 100);
//
//                playCurrentPar();
//
//                return;
//            }

        playCurrentPar();
    }

    this.touchInit = function()
    {
        var todo = _audioPlayer.touchInit();
        if (todo)
        {
            if (_enableHTMLSpeech)
            {
                speakStart("o", 0);
            }
        }
    };

    var tokeniseTTS = function(element)
    {
        var BLOCK_DELIMITERS = ['p', 'div', 'pagenum', 'td', 'table', 'li', 'ul', 'ol'];
        var BOUNDARY_PUNCTUATION = [',', ';', '.', '-', '??', '??', '?', '!'];
        var IGNORABLE_PUNCTUATION = ['"', '\'', '??', '??', '??', '??'];

        var flush = function(t, r)
        {
            if (t.word.length <= 0)
            {
                return;
            }

            var pos = t.text.length;
            r.spanMap[pos] = t.counter;
            t.text += t.word;
            t.markup += t.html.substring(0, t.wordStart) +
                '<span class="tts_off" id="tts_' + t.counter + '">' +
                t.html.substring(t.wordStart, t.wordEnd) +
                '</span>' + t.html.substring(t.wordEnd, t.html.length);
            t.word = "";
            t.html = "";
            t.wordStart = -1;
            t.wordEnd = -1;
            t.counter++;
        };

        var r =
        {
            element : element,
            innerHTML_tts : "",
            spanMap : {},
            text : "",
            lastCharIndex : undefined
        };
        r.element.innerHTML_original = element.innerHTML;

        var t =
        {
            inTag : false,
            counter : 0,
            wordStart : -1,
            wordEnd : -1,
            text : '',
            markup : '',
            word : '',
            html : ''
        };

        var limit = r.element.innerHTML_original.length;
        var i = 0;
        while (i <= limit)
        {
            if (t.inTag)
            {
                t.html += r.element.innerHTML_original[i];
                if (r.element.innerHTML_original[i] == ">") {
                    t.inTag = false;
                    // if it's a block element delimiter, flush
                    var blockCheck = t.html.match(/<\/(.*?)>$/);
                    if (blockCheck && BLOCK_DELIMITERS.indexOf(blockCheck[1]) > -1)
                    {
                        flush(t, r);
                        t.text += ' ';
                    }
                }
            }
            else
            {
                if (i == limit || r.element.innerHTML_original[i].match(/\s/))
                {
                    flush(t, r);

                    // append the captured whitespace
                    if (i < limit)
                    {
                        t.text += r.element.innerHTML_original[i];
                        t.markup += r.element.innerHTML_original[i];
                    }
                }
                else if (BOUNDARY_PUNCTUATION.indexOf(r.element.innerHTML_original[i]) > -1)
                {
                    flush(t, r);

                    t.wordStart = t.html.length;
                    t.wordEnd = t.html.length + 1;
                    t.word += r.element.innerHTML_original[i];
                    t.html += r.element.innerHTML_original[i];

                    flush(t, r);
                }
                else if (r.element.innerHTML_original[i] == "<")
                {
                    t.inTag = true;
                    t.html += r.element.innerHTML_original[i];
                }
                else
                {
                    if (t.word.length == 0)
                    {
                        t.wordStart = t.html.length;
                    }
                    t.wordEnd = t.html.length + 1;
                    t.word += r.element.innerHTML_original[i];
                    t.html += r.element.innerHTML_original[i];
                }
            }
            i++;
        }
//
//console.debug(t.text);
//        console.debug("----");
//console.debug(t.markup);

        r.text = t.text;
        r.innerHTML_tts = t.markup;
        r.element.innerHTML = r.innerHTML_tts;

        return r;
    };

    var $ttsStyle = undefined;
    function ensureTTSStyle($element)
    {
        if ($ttsStyle && $ttsStyle[0].ownerDocument === $element[0].ownerDocument)
        {
            return;
        }

        var style = ".tts_on{background-color:red;color:white;} .tts_off{}";

        $head = $("head", $element[0].ownerDocument.documentElement);

        $ttsStyle = $("<style type='text/css'> </style>").appendTo($head);

        $ttsStyle.append(style);
    }

    var speakStart = function(txt, volume)
    {
        var tokenData = undefined;
        var curPar = (_smilIterator && _smilIterator.currentPar) ? _smilIterator.currentPar : undefined;
        var element = curPar ? curPar.element : undefined;
        var cfi = curPar ? curPar.cfi : undefined;

        if (!volume || volume > 0)
        {
            // gives the audio player some dispatcher time to raise the onPause event
            setTimeout(function(){
                onStatusChanged({isPlaying: true});
            }, 80);
            
            _ttsIsPlaying = true;

            if (TOKENIZE_TTS && element)
            {
                var $el = $(element);
                ensureTTSStyle($el);


                if (element.innerHTML_original)
                {
                    element.innerHTML = element.innerHTML_original;
                    element.innerHTML_original = undefined;
                }
                tokenData = tokeniseTTS(element);
            }
        }

        if (!_enableHTMLSpeech)
        {
            reader.emit(Globals.Events.MEDIA_OVERLAY_TTS_SPEAK, {tts: txt}); // resume if txt == undefined
            return;
        }

        if (!txt && window.speechSynthesis.paused)
        {
//console.debug("TTS resume");
            window.speechSynthesis.resume();

            return;
        }

        var text = txt || _currentTTS;

        if (text)
        {
            if (_SpeechSynthesisUtterance)
            {
//console.debug("_SpeechSynthesisUtterance nullify");

                if (TOKENIZE_TTS)
                {
                    if (_SpeechSynthesisUtterance.onend)
                    {
                        _SpeechSynthesisUtterance.onend({forceSkipEnd: true, target: _SpeechSynthesisUtterance});
                    }
                    
                    _SpeechSynthesisUtterance.tokenData = undefined;
                    
                    _SpeechSynthesisUtterance.onboundary = undefined;
    //                 _SpeechSynthesisUtterance.onboundary = function(event)
    //                 {
    // console.debug("OLD TTS boundary");
    //                 
    //                         event.target.tokenData = undefined;
    //  
    //                 };
                }

                _SpeechSynthesisUtterance.onend = undefined;
//                 _SpeechSynthesisUtterance.onend = function(event)
//                 {
// console.debug("OLD TTS ended");
//                     if (TOKENIZE_TTS)
//                     {
//                         event.target.tokenData = undefined;
//                     }
//                 };
                
                _SpeechSynthesisUtterance.onerror = undefined;
//                 _SpeechSynthesisUtterance.onerror = function(event)
//                 {
// console.debug("OLD TTS error");
// //console.debug(event);
//                     if (TOKENIZE_TTS)
//                     {
//                         event.target.tokenData = undefined;
//                     }
//                 };

                _SpeechSynthesisUtterance = undefined;
            }
//
//            if (window.speechSynthesis.pending ||
//                window.speechSynthesis.speaking)
//            {
//                _skipTTSEndEvent = true;
//            }
            
console.debug("paused: "+window.speechSynthesis.paused);
console.debug("speaking: "+window.speechSynthesis.speaking);
console.debug("pending: "+window.speechSynthesis.pending);

//             if (!window.speechSynthesis.paused)
//             {
// console.debug("TTS pause before speak");
//                 window.speechSynthesis.pause();
//             }
            
            function cancelTTS(first)
            {
                if (first || window.speechSynthesis.pending)
                {
    console.debug("TTS cancel before speak");
                    window.speechSynthesis.cancel();

                    setTimeout(function()
                    {
                        cancelTTS(false);
                    }, 5);
                }
                else
                {
                    updateTTS();
                }
            }
            cancelTTS(true);
            
            function updateTTS()
            {
            // setTimeout(function()
            // {

                _SpeechSynthesisUtterance = new SpeechSynthesisUtterance();

                if (TOKENIZE_TTS && tokenData)
                {
                    _SpeechSynthesisUtterance.tokenData = tokenData;
                
                    _SpeechSynthesisUtterance.onboundary = function(event)
                    //_SpeechSynthesisUtterance.addEventListener("boundary", function(event)
                    {
                        if (!_SpeechSynthesisUtterance)
                        {
                            return;
                        }

        console.debug("TTS boundary: " + event.name + " / " + event.charIndex);
        //console.debug(event);

                        var tokenised = event.target.tokenData;
                        if (!tokenised || !tokenised.spanMap.hasOwnProperty(event.charIndex))
                        {
                            return;
                        }

                        if (false && tokenised.lastCharIndex)
                        {
        //console.debug("TTS lastCharIndex: " + tokenised.lastCharIndex);
                            var id = 'tts_' + tokenised.spanMap[tokenised.lastCharIndex];
        //console.debug("TTS lastCharIndex ID: " + id);
                            var spanPrevious = tokenised.element.querySelector("#"+id);
                            if (spanPrevious)
                            {
        //console.debug("TTS OFF");
                                spanPrevious.className = 'tts_off';
                                //spanPrevious.style.backgroundColor = "white";
                            }
                        }
                        else
                        {
                            [].forEach.call(
                                tokenised.element.querySelectorAll(".tts_on"),
                                function(el)
                                {
        console.debug("TTS OFF " + el.id);
                                    el.className = 'tts_off';
                                }
                            );
                        }

                        var id = 'tts_' + tokenised.spanMap[event.charIndex];
        console.debug("TTS charIndex ID: " + id);
                        var spanNew = tokenised.element.querySelector("#"+id);
                        if (spanNew)
                        {
        console.debug("TTS ON");
                            spanNew.className = 'tts_on';
                            //spanNew.style.backgroundColor = "transparent";
                        }

                        tokenised.lastCharIndex = event.charIndex;
                    };
                }

                _SpeechSynthesisUtterance.onend = function(event)
                //_SpeechSynthesisUtterance.addEventListener("end", function(event)
                {
                    if (!_SpeechSynthesisUtterance)
                    {
                        //_skipTTSEndEvent = false;
                        return;
                    }
    //
    //                if (_skipTTSEndEvent)
    //                {
    //                    _skipTTSEndEvent = false;
    //                    return;
    //                }

console.debug("TTS ended");
    //console.debug(event);

                    if (TOKENIZE_TTS)
                    {
                        var tokenised = event.target.tokenData;

                        var doEnd = !event.forceSkipEnd && (_SpeechSynthesisUtterance === event.target) && (!tokenised || tokenised.element.innerHTML_original);

                        if (tokenised)
                        {
                            if (tokenised.element.innerHTML_original)
                            {
                                tokenised.element.innerHTML = tokenised.element.innerHTML_original;
                            }
                            else
                            {
                                [].forEach.call(
                                    tokenised.element.querySelectorAll(".tts_on"),
                                    function(el)
                                    {
        console.debug("TTS OFF (end)" + el.id);
                                        el.className = 'tts_off';
                                    }
                                );
                            }

                            tokenised.element.innerHTML_original = undefined;
                        }


                        if (doEnd)
                        {
                            self.onTTSEnd();
                        }
                        else
                        {
    console.debug("TTS end SKIPPED");
                        }
                    }
                    else
                    {
                        self.onTTSEnd();
                    }
                };

                _SpeechSynthesisUtterance.onerror = function(event)
                //_SpeechSynthesisUtterance.addEventListener("error", function(event)
                {
                    if (!_SpeechSynthesisUtterance)
                    {
                        return;
                    }

console.error("TTS error");
//console.debug(event);
console.debug(_SpeechSynthesisUtterance.text);
console.debug(window.speechSynthesis.paused);
console.debug(window.speechSynthesis.pending);
console.debug(window.speechSynthesis.speaking);

                    if (TOKENIZE_TTS)
                    {
                        var tokenised = event.target.tokenData;
                        if (tokenised)
                        {
                            if (tokenised.element.innerHTML_original)
                            {
                                tokenised.element.innerHTML = tokenised.element.innerHTML_original;
                            }
                            else
                            {
                                [].forEach.call(
                                    tokenised.element.ownerDocument.querySelectorAll(".tts_on"),
                                    function(el)
                                    {
        console.debug("TTS OFF (error)" + el.id);
                                        el.className = 'tts_off';
                                    }
                                );
                            }
                            tokenised.element.innerHTML_original = undefined;
                        }
                    }
                };

                var vol = volume || _audioPlayer.getVolume();
                _SpeechSynthesisUtterance.volume = vol;

                _SpeechSynthesisUtterance.rate = _audioPlayer.getRate();
                _SpeechSynthesisUtterance.pitch = 1;

                //_SpeechSynthesisUtterance.lang = "en-US";

                _SpeechSynthesisUtterance.text = text;

    //console.debug("TTS speak: " + text);
                window.speechSynthesis.speak(_SpeechSynthesisUtterance);

                if (window.speechSynthesis.paused)
                {
console.debug("TTS resume");
                    window.speechSynthesis.resume();
                }

           //}, 5);
           }
        }
    };

    var speakStop = function()
    {
        onStatusChanged({isPlaying: false});
        _ttsIsPlaying = false;

        if (!_enableHTMLSpeech)
        {
            reader.emit(Globals.Events.MEDIA_OVERLAY_TTS_STOP, undefined);
            return;
        }

//console.debug("TTS pause");
        window.speechSynthesis.pause();
    };

    var _timerTick = undefined;

    function onPlay() {
        onPause();

        var func = function() {

            if (!_smilIterator || !_smilIterator.currentPar)
            {
                return;
            }

            var smil = _smilIterator.smil; //currentPar.getSmil();
            if (!smil.mo)
            {
                return;
            }

//            if (!_smilIterator.currentPar.audio.src)
//            {
//                return;
//            }

            var playPosition = audioCurrentTime - _smilIterator.currentPar.audio.clipBegin;
            if (playPosition <= 0)
            {
                return;
            }

            var smilIndex = smil.mo.smil_models.indexOf(smil);

            var smilIterator = new SmilIterator(smil);
            var parIndex = -1;
            while (smilIterator.currentPar)
            {
                parIndex++;
                if (smilIterator.currentPar == _smilIterator.currentPar)
                {
                    break;
                }
                smilIterator.next();
            }

            onStatusChanged({playPosition: playPosition, smilIndex: smilIndex, parIndex: parIndex});
        };

        setTimeout(func, 500);

        _timerTick = setInterval(func, 1500);
    }

    function onPause() {

        audioCurrentTime = 0.0;
        if (_timerTick !== undefined)
        {
            clearInterval(_timerTick);
        }
        _timerTick = undefined;
    }


    this.onEmbeddedEnd = function()
    {
        audioCurrentTime = 0.0;

        _embeddedIsPlaying = false;
        //_currentEmbedded = undefined;

        if (!_smilIterator || !_smilIterator.currentPar)
        {
            self.reset();
            return;
        }

        onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1, 3);
    };

    this.onTTSEnd = function()
    {
        audioCurrentTime = 0.0;

        _ttsIsPlaying = false;
        //_currentTTS = undefined;

//        if(_skipTTSEnded)
//        {
//            _skipTTSEnded = false;
//            return;
//        }

        if (!_smilIterator || !_smilIterator.currentPar)
        {
            self.reset();
            return;
        }

        onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1, 4);
    };

    function onAudioEnded() {

        onPause();
//
//        if (_letPlay)
//        {
//            return;
//        }

        if(_skipAudioEnded)
        {
            _skipAudioEnded = false;
            return;
        }

        if (!_smilIterator || !_smilIterator.currentPar)
        {
            self.reset();
            return;
        }

        onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1, 5);
    }

    function highlightCurrentElement() {

        if(!_smilIterator) {
            return;
        }

        if(!_smilIterator.currentPar) {
            return;
        }

        if (_smilIterator.currentPar.text.srcFragmentId && _smilIterator.currentPar.text.srcFragmentId.length > 0)
        {
            if (_smilIterator.currentPar.element) {
    //console.error(_smilIterator.currentPar.element.id + ": " + _smilIterator.currentPar.audio.clipBegin + " / " + _smilIterator.currentPar.audio.clipEnd);

                if (!_elementHighlighter.isElementHighlighted(_smilIterator.currentPar))
                {
                    _elementHighlighter.highlightElement(_smilIterator.currentPar, _package.media_overlay.activeClass, _package.media_overlay.playbackActiveClass);

                    if (!_wasPlayingScrolling)
                    {
                        reader.insureElementVisibility(_smilIterator.currentPar.getSmil().spineItemId, _smilIterator.currentPar.element, self);
                    }
                }
            
                return;
            
            } else if (_smilIterator.currentPar.cfi) {

                if (!_elementHighlighter.isCfiHighlighted(_smilIterator.currentPar))
                {
                    _elementHighlighter.highlightCfi(_smilIterator.currentPar, _package.media_overlay.activeClass, _package.media_overlay.playbackActiveClass);

                    if (!_wasPlayingScrolling)
                    {
                        reader.insureElementVisibility(_smilIterator.currentPar.getSmil().spineItemId, _smilIterator.currentPar.cfi.cfiTextParent, self);
                    }
                }
                
                return;
            }
        }
        
        // body (not FRAG ID)
        if (_smilIterator.currentPar.element) {
            return;
        }
        
        //else: single SMIL per multiple XHTML? ==> open new spine item
        
        /*
        var textRelativeRef = Globals.Helpers.ResolveContentRef(_smilIterator.currentPar.text.srcFile, _smilIterator.smil.href);
console.debug("textRelativeRef: " + textRelativeRef);
        if (textRelativeRef)
        {
            var textAbsoluteRef = _package.resolveRelativeUrl(textRelativeRef);
console.debug("textAbsoluteRef: " + textAbsoluteRef);
        }
        */

        var src = _smilIterator.currentPar.text.src;
        var base = _smilIterator.smil.href;

        //self.pause();
        //self.reset();
        _smilIterator = undefined;

        reader.openContentUrl(src, base, self);
    }

    this.escape = function() {
        
        if(!_smilIterator || !_smilIterator.currentPar) {

            this.toggleMediaOverlay();
            return;
        }

        if(!self.isPlaying())
        {
            //playCurrentPar();
            self.play();
            return;
        }

        if(_settings.mediaOverlaysEscapeEscapables)
        {
            var parent = _smilIterator.currentPar;
            while (parent)
            {
                if (parent.isEscapable && parent.isEscapable(_settings.mediaOverlaysEscapables))
                {
                    do
                    {
                        _smilIterator.next();
                    } while (_smilIterator.currentPar && _smilIterator.currentPar.hasAncestor(parent));

                    if (!_smilIterator.currentPar)
                    {
                        nextSmil(true);
                        return;
                    }

                    //_smilIterator.goToPar(_smilIterator.currentPar);
                    playCurrentPar();
                    return;
                }

                parent = parent.parent;
            }
        }

        this.nextMediaOverlay(true);
    };


    this.playUserPar = function(par) {
        if(self.isPlaying())
        {
            self.pause();
        }

        if (par.element || par.cfi && par.cfi.cfiTextParent)
        {
            var seq = _elementHighlighter.adjustParToSeqSyncGranularity(par);
            if (seq && seq !== par)
            {
                var findFirstPar = function(smilNode)
                {
                    if (smilNode.nodeType && smilNode.nodeType === "par") return smilNode;
                    
                    if (!smilNode.children || smilNode.children.length <= 0) return undefined;
                    
                    for (var i = 0; i < smilNode.children.length; i++)
                    {
                        var child = smilNode.children[i];
                        var inPar = findFirstPar(child);
                        if (inPar) return inPar;
                    }
                };
                var firstPar = findFirstPar(seq);
                if (firstPar) par = firstPar;
            }
        }

        playPar(par);
    };

    this.resetTTS = function() {
        _currentTTS = undefined;
//        _skipTTSEnded = false;
        speakStop();
    };

    this.resetBlankPage = function() {
        if (_blankPagePlayer)
        {
            var timer = _blankPagePlayer;
            _blankPagePlayer = undefined;
            clearTimeout(timer);
        }
        _blankPagePlayer = undefined;

        onStatusChanged({isPlaying: false});
    };

    this.resetEmbedded = function() {
        if (_currentEmbedded)
        {
            $(_currentEmbedded).off("ended", self.onEmbeddedEnd);
            _currentEmbedded.pause();
        }
        _currentEmbedded = undefined;
        onStatusChanged({isPlaying: false});
        _embeddedIsPlaying = false;
    };

    this.reset = function() {
        clipBeginOffset = 0.0;
        _audioPlayer.reset();
        self.resetTTS();
        self.resetEmbedded();
        self.resetBlankPage();
        _elementHighlighter.reset();
        _smilIterator = undefined;
        _skipAudioEnded = false;
    };

    this.play = function ()
    {
        if (_smilIterator && _smilIterator.smil && !_smilIterator.smil.id)
        {
            initBlankPagePlayer();
            return;
        }
        else if (_currentEmbedded)
        {
            _embeddedIsPlaying = true;
            _currentEmbedded.play();
            onStatusChanged({isPlaying: true});
        }
        else if (_currentTTS)
        {
            speakStart(undefined);
        }
        else
        {
            if (!_audioPlayer.play())
            {
                console.log("Audio player was dead, reactivating...");

                this.reset();
                this.toggleMediaOverlay();
                return;
            }
        }

        highlightCurrentElement();
    }

    this.pause = function()
    {
        _wasPlayingScrolling = false;
        
        if (_blankPagePlayer)
        {
            this.resetBlankPage();
        }
        else if (_embeddedIsPlaying)
        {
            _embeddedIsPlaying = false;
            if (_currentEmbedded)
            {
                _currentEmbedded.pause();
            }
            onStatusChanged({isPlaying: false});
        }
        else if (_ttsIsPlaying)
        {
            speakStop();
        }
        else
        {
            _audioPlayer.pause();
        }

        _elementHighlighter.reset();
    }

    this.isMediaOverlayAvailable = function() {

//        console.debug("isMediaOverlayAvailable()");
//
//        var now1 = window.performance && window.performance.now ? window.performance.now() : Date.now();
//
//        if (console.time)
//        {
//            console.time("MO");
//        }

        var visibleMediaElement = reader.getFirstVisibleMediaOverlayElement();

//        if (console.timeEnd)
//        {
//            console.timeEnd("MO");
//        }
//
//        var now2 = window.performance && window.performance.now ? window.performance.now() : Date.now();
//
//        console.debug(now2 - now1);

        return typeof visibleMediaElement !== "undefined";
    };

    this.nextOrPreviousMediaOverlay = function(previous) {
        if(self.isPlaying())
        {
            self.pause();
        }
        else
        {
            if (_smilIterator && _smilIterator.currentPar)
            {
                //playCurrentPar();
                self.play();
                return;
            }
        }

        if(!_smilIterator)
        {
            this.toggleMediaOverlay();
            return;
        }

        var position = previous ? DIRECTION_MARK - 1 : _smilIterator.currentPar.audio.clipEnd + 0.1;

        onAudioPositionChanged(position, 6);
        // setTimeout(function(){
        //     
        // }, 1);

        //self.play();
        //playCurrentPar();
    };

    this.nextMediaOverlay = function() {
        this.nextOrPreviousMediaOverlay(false);
    };

    this.previousMediaOverlay = function() {
        this.nextOrPreviousMediaOverlay(true);
    };

    /*
    this.setMediaOverlaySkippables = function(items) {

    };

    this.setMediaOverlayEscapables = function(items) {

    };
    */

    this.mediaOverlaysOpenContentUrl = function(contentRefUrl, sourceFileHref, offset)
    {
        clipBeginOffset = offset;

        //self.pause();
        //self.reset();
        _smilIterator = undefined;

        reader.openContentUrl(contentRefUrl, sourceFileHref, self);

        /*
        if (_currentPagination && _currentPagination.isFixedLayout && _currentPagination.openPages && _currentPagination.openPages.length > 0)
        {
            var combinedPath = Globals.Helpers.ResolveContentRef(contentRefUrl, sourceFileHref);

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

            var spineItem = reader.spine.getItemByHref(hrefPart);
            var spineItemIndex = _currentPagination.openPages[0].spineItemIndex;

            //var idref = _currentPagination.openPages[0].idref;
            //spineItem.idref === idref
            //var currentSpineItem = reader.spine.getItemById(idref);
            //currentSpineItem == spineItem
            if (spineItem.index === spineItemIndex)
            {
                self.onPageChanged({
                    paginationInfo: _currentPagination,
                    elementId: elementId,
                    initiator: self
                });
            }
        }
        */
    };

    this.toggleMediaOverlay = function() {
        if(self.isPlaying()) {
            self.pause();
            return;
        }

        //if we have position to continue from (reset wasn't called)
        if(_smilIterator) {
            self.play();
            return;
        }

        this.toggleMediaOverlayRefresh(undefined);
    };

    var _wasPlayingScrolling = false;

    this.toggleMediaOverlayRefresh = function(paginationData)
    {
//console.debug("moData SMIL: " + moData.par.getSmil().href + " // " + + moData.par.getSmil().id);

        var spineItems = reader.getLoadedSpineItems();

        //paginationData.isRightToLeft
        var rtl = reader.spine().isRightToLeft();

        //paginationData.spineItemCount
        //paginationData.openPages
        //{spineItemPageIndex: , spineItemPageCount: , idref: , spineItemIndex: }

        var playingPar = undefined;
        var wasPlaying = self.isPlaying();
        if(wasPlaying && _smilIterator)
        {
            var isScrollView = paginationData.initiator && paginationData.initiator instanceof ScrollView;
            if (isScrollView && _settings.mediaOverlaysPreservePlaybackWhenScroll)
            {
                _wasPlayingScrolling = true;
                return;
            }
            
            playingPar = _smilIterator.currentPar;
            self.pause();
        }
        
        _wasPlayingScrolling = false;

        //paginationData && paginationData.elementId
        //paginationData.initiator != self

        //_package.isFixedLayout()

        var element = (paginationData && paginationData.elementIdResolved) ? paginationData.elementIdResolved : undefined;

        var id = (paginationData && paginationData.elementId) ? paginationData.elementId : undefined;

        if (!element)
        {
            if (id)
            {
                console.error("[WARN] id did not resolve to element?");
            }
            
            for(var i = (rtl ? (spineItems.length - 1) : 0); (rtl && i >=0) || (!rtl && i < spineItems.length); i += (rtl ? -1: 1))
            {
                var spineItem = spineItems[i];
                if (!spineItem)
                {
                    console.error("spineItems[i] is undefined??");
                    continue;
                }
            
                if (paginationData && paginationData.spineItem && paginationData.spineItem != spineItem)
                {
                    continue;
                }

                if (id)
                {
                    var $element = reader.getElementById(spineItem, id);
                    //var $element = reader.getElement(spineItem, "#" + Globals.Helpers.escapeJQuerySelector(id));
                    element = ($element && $element.length > 0) ? $element[0] : undefined;
                }
                else if (spineItem.isFixedLayout())
                {
                    if (paginationData && paginationData.paginationInfo && paginationData.paginationInfo.openPages)
                    {
                        // openPages are sorted by spineItem index, so the smallest index on display is the one we need to play (page on the left in LTR, or page on the right in RTL progression)
                        var index = 0; // !paginationData.paginationInfo.isRightToLeft ? 0 : paginationData.paginationInfo.openPages.length - 1;
                    
                        if (paginationData.paginationInfo.openPages[index] && paginationData.paginationInfo.openPages[index].idref && paginationData.paginationInfo.openPages[index].idref === spineItem.idref)
                        {
                            var $element = reader.getElement(spineItem, "body");
                            element = ($element && $element.length > 0) ? $element[0] : undefined;
                        }
                    }
                }

                if (element)
                {
                    break;
                }
            }
        }

        if (!element)
        {
            element = reader.getFirstVisibleMediaOverlayElement();
        }

        if (!element)
        {
            self.reset();
            return;
        }

        var moData = $(element).data("mediaOverlayData");

        if (!moData)
        {
            var foundMe = false;
            var depthFirstTraversal = function(elements)
            {
                if (!elements)
                {
                    return false;
                }

                for (var i = 0; i < elements.length; i++)
                {
                    if (element === elements[i]) foundMe = true;
                    
                    if (foundMe)
                    {
                        var d = $(elements[i]).data("mediaOverlayData");
                        if (d)
                        {
                            moData = d;
                            return true;
                        }
                    }

                    var found = depthFirstTraversal(elements[i].children);
                    if (found)
                    {
                        return true;
                    }
                }

                return false;
            }

            var root = element;
            while (root && root.nodeName.toLowerCase() !== "body")
            {
                root = root.parentNode;
            }

            if (!root)
            {
                self.reset();
                return;
            }

            depthFirstTraversal([root]);
        }

        if (!moData)
        {
            self.reset();
            return;
        }

        var zPar = moData.par ? moData.par : moData.pars[0];
        var parSmil = zPar.getSmil();
        if(!_smilIterator || _smilIterator.smil != parSmil)
        {
            _smilIterator = new SmilIterator(parSmil);
        }
        else
        {
            _smilIterator.reset();
        }
        
        _smilIterator.goToPar(zPar);
        
        if (!_smilIterator.currentPar && id)
        {
            _smilIterator.reset();
            _smilIterator.findTextId(id);
        }
        
        if (!_smilIterator.currentPar)
        {
            self.reset();
            return;
        }

        if (wasPlaying && playingPar && playingPar === _smilIterator.currentPar)
        {
            self.play();
        }
        else
        {
            playCurrentPar();
            //playPar(zPar);
        }
    };

    this.isPlayingCfi = function()
    {
        return _smilIterator && _smilIterator.currentPar && _smilIterator.currentPar.cfi;
    };
    
    var _wasPausedBecauseNoAutoNextSmil = false;
    var _autoNextSmil = true;
    this.setAutomaticNextSmil = function(autoNext)
    {
        _autoNextSmil = autoNext;
    };
};
    return MediaOverlayPlayer;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/spine',["./spine_item"], function(SpineItem) {
/**
 *  Wrapper of the spine object received from hosting application
 *
 *  @class  Models.Spine
 */

var Spine = function(epubPackage, spineDTO) {

    var self = this;

    /*
     * Collection of spine items
     * @property items
     * @type {Array}
     */
    this.items = [];

    /*
     * Page progression direction ltr|rtl|default
     * @property direction
     * @type {string}
     */
    this.direction = "ltr";

    /*
     * @property package
     * @type {Models.Package}
     *
     */
    this.package = epubPackage;

    var _handleLinear = false;

    this.handleLinear = function(handleLinear) {
        _handleLinear = handleLinear;
    };

    function isValidLinearItem(item) {
        return !_handleLinear || item.linear !== "no";
    }


    this.isValidLinearItem = function(index) {
        
        if(!isValidIndex(index)) {
            return undefined;
        }

        return isValidLinearItem(this.item(index));
    };

    this.prevItem = function(item) {

        return lookForPrevValidItem(item.index - 1);
    };

    function lookForNextValidItem(ix) {

        if(!isValidIndex(ix)) {
            return undefined;
        }

        var item = self.items[ix];

        if(isValidLinearItem(item)) {
            return item;
        }

        return lookForNextValidItem(item.index + 1);
    }

    function lookForPrevValidItem(ix) {

        if(!isValidIndex(ix)) {
            return undefined;
        }

        var item = self.items[ix];

        if(isValidLinearItem(item)) {
            return item;
        }

        return lookForPrevValidItem(item.index - 1);
    }

    this.nextItem = function(item){

        return lookForNextValidItem(item.index + 1);
    };

    this.getItemUrl = function(item) {

        return self.package.resolveRelativeUrl(item.href);

    };

    function isValidIndex(index) {

        return index >= 0 && index < self.items.length;
    }

    this.first = function() {

        return lookForNextValidItem(0);
    };

    this.last = function() {

        return lookForPrevValidItem(this.items.length - 1);
    };

    this.isFirstItem = function(item) {

        return self.first() === item;
    };

    this.isLastItem = function(item) {

        return self.last() === item;
    };

    this.item = function(index) {
		
		if (isValidIndex(index))
        	return self.items[index];
			
		return undefined;
    };

    this.isRightToLeft = function() {

        return self.direction == "rtl";
    };

    this.isLeftToRight = function() {

        return !self.isRightToLeft();
    };

    this.getItemById = function(idref) {

        var length = self.items.length;

        for(var i = 0; i < length; i++) {
            if(self.items[i].idref == idref) {

                return self.items[i];
            }
        }

        return undefined;
    };

    this.getItemByHref = function(href) {

        var length = self.items.length;

        for(var i = 0; i < length; i++) {
            if(self.items[i].href == href) {

                return self.items[i];
            }
        }

        return undefined;
    };

    function updateSpineItemsSpread() {

        var len = self.items.length;

        var isFirstPageInSpread = false;
        var baseSide = self.isLeftToRight() ? SpineItem.SPREAD_LEFT : SpineItem.SPREAD_RIGHT;

        for(var i = 0; i < len; i++) {

            var spineItem = self.items[i];
            if( !spineItem.page_spread) {

                var spread = spineItem.isRenditionSpreadAllowed() ? (isFirstPageInSpread ? baseSide : SpineItem.alternateSpread(baseSide)) : SpineItem.SPREAD_CENTER;
                spineItem.setSpread(spread);
            }

            isFirstPageInSpread = !spineItem.isRenditionSpreadAllowed() || spineItem.page_spread != baseSide;
        }
    }

    if(spineDTO) {

        if(spineDTO.direction) {
            this.direction = spineDTO.direction;
        }

        var length = spineDTO.items.length;
        for(var i = 0; i < length; i++) {
            var item = new SpineItem(spineDTO.items[i], i, this);
            this.items.push(item);
        }

        updateSpineItemsSpread();
    }

};
    return Spine;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.
define ('models/smil_model',["../helpers"], function(Helpers) {

/**
 *
 * @param parent
 * @constructor
 */
var Smil = {};

Smil.SmilNode = function(parent) {

    this.parent = parent;
    
    this.id = "";
    
    //root node is a smil model
    this.getSmil = function() {

        var node = this;
        while(node.parent) {
            node = node.parent;
        }

        return node;
    };
    
    this.hasAncestor = function(node)
    {
        var parent = this.parent;
        while(parent)
        {
            if (parent == node)
            {
                return true;
            }

            parent = parent.parent;
        }

        return false;
    };
};

Smil.TimeContainerNode = function(parent) {

    this.parent = parent;
    
    this.children = undefined;
    this.index = undefined;
    
    this.epubtype = "";

    this.isEscapable = function(userEscapables)
    {
        if (this.epubtype === "")
        {
            return false;
        }

        var smilModel = this.getSmil();
        if (!smilModel.mo)
        {
            return false;
        }

        var arr = smilModel.mo.escapables;
        if (userEscapables.length > 0)
        {
            arr = userEscapables;
        }

        for (var i = 0; i < arr.length; i++)
        {
            if (this.epubtype.indexOf(arr[i]) >= 0)
            {
                return true;
            }
        }

        return false;
    };

    this.isSkippable = function(userSkippables)
    {
        if (this.epubtype === "")
        {
            return false;
        }
        
        var smilModel = this.getSmil();
        if (!smilModel.mo)
        {
            return false;
        }

        var arr = smilModel.mo.skippables;
        if (userSkippables.length > 0)
        {
            arr = userSkippables;
        }

        for (var i = 0; i < arr.length; i++)
        {
            if (this.epubtype.indexOf(arr[i]) >= 0)
            {
                return true;
            }
        }

        return false;
    };
};

Smil.TimeContainerNode.prototype = new Smil.SmilNode();

//////////////////////////
//MediaNode

Smil.MediaNode = function(parent) {

    this.parent = parent;
    
    this.src = "";
};

Smil.MediaNode.prototype = new Smil.SmilNode();

////////////////////////////
//SeqNode

Smil.SeqNode = function(parent) {

    this.parent = parent;
    
    this.children = [];
    this.nodeType = "seq";
    this.textref = "";
    
    this.durationMilliseconds = function()
    {
        var smilData = this.getSmil();
            
        var total = 0;
        
        for (var i = 0; i < this.children.length; i++)
        {
            var container = this.children[i];
            if (container.nodeType === "par")
            {
                if (!container.audio)
                {
                    continue;
                }
                if (container.text && (!container.text.manifestItemId || container.text.manifestItemId != smilData.spineItemId))
                {
// console.log(container.text);
// console.log(smilData.spineItemId);
                    continue;
                }
                
                var clipDur = container.audio.clipDurationMilliseconds();
                total += clipDur;
            }
            else if (container.nodeType === "seq")
            {
                total += container.durationMilliseconds();
            }
        }

        return total;
    };
    
    this.clipOffset = function(offset, par)
    {
        var smilData = this.getSmil();
        
        for (var i = 0; i < this.children.length; i++)
        {
            var container = this.children[i];
            if (container.nodeType === "par")
            {
                if (container == par)
                {
                    return true;
                }

                if (!container.audio)
                {
                    continue;
                }

                if (container.text && (!container.text.manifestItemId || container.text.manifestItemId != smilData.spineItemId))
                {
                    continue;
                }

                var clipDur = container.audio.clipDurationMilliseconds();
                offset.offset += clipDur;
            }
            else if (container.nodeType === "seq")
            {
                var found = container.clipOffset(offset, par);
                if (found)
                {
                    return true;
                }
            }
        }

        return false;
    };

    this.parallelAt = function(timeMilliseconds)
    {
        var smilData = this.getSmil();
        
        var offset = 0;

        for (var i = 0; i < this.children.length; i++)
        {
            var timeAdjusted = timeMilliseconds - offset;

            var container = this.children[i];
            
            if (container.nodeType === "par")
            {
                if (!container.audio)
                {
                    continue;
                }

                if (container.text && (!container.text.manifestItemId || container.text.manifestItemId != smilData.spineItemId))
                {
                    continue;
                }

                var clipDur = container.audio.clipDurationMilliseconds();

                if (clipDur > 0 && timeAdjusted <= clipDur)
                {
                    return container;
                }

                offset += clipDur;
            }
            else if (container.nodeType === "seq")
            {
                var para = container.parallelAt(timeAdjusted);
                if (para)
                {
                    return para;
                }

                offset += container.durationMilliseconds();
            }
        }

        return undefined;
    };

    this.nthParallel = function(index, count)
    {
        for (var i = 0; i < this.children.length; i++)
        {
            var container = this.children[i];
            
            if (container.nodeType === "par")
            {
                count.count++;

                if (count.count == index)
                {
                    return container;
                }
            }
            else if (container.nodeType === "seq")
            {
                var para = container.nthParallel(index, count);
                if (para)
                {
                    return para;
                }
            }
        }

        return undefined;
    };
    
};

Smil.SeqNode.prototype = new Smil.TimeContainerNode();

//////////////////////////
//ParNode

Smil.ParNode = function(parent) {

    this.parent = parent;
    
    this.children = [];
    this.nodeType = "par";
    this.text = undefined;
    this.audio = undefined;
    this.element = undefined;
    

    this.getFirstSeqAncestorWithEpubType = function(epubtype, includeSelf) {
        if (!epubtype) return undefined;
        
        var parent = includeSelf ? this : this.parent;
        while (parent)
        {
            if (parent.epubtype && parent.epubtype.indexOf(epubtype) >= 0)
            {
                return parent; // assert(parent.nodeType === "seq")
            }
            
            parent = parent.parent;
        }
        
        return undefined;
    };
};

Smil.ParNode.prototype = new Smil.TimeContainerNode();

//////////////////////////
//TextNode

Smil.TextNode = function(parent) {

    this.parent = parent;

    this.nodeType = "text";
    this.srcFile = "";
    this.srcFragmentId = "";
    
    
    this.manifestItemId = undefined;
    this.updateMediaManifestItemId = function()
    {
        var smilData = this.getSmil();
        
        if (!smilData.href || !smilData.href.length)
        {
            return; // Blank MO page placeholder, no real SMIL
        }
        
        // var srcParts = item.src.split('#');
//         item.srcFile = srcParts[0];
//         item.srcFragmentId = (srcParts.length === 2) ? srcParts[1] : "";
        
        var src = this.srcFile ? this.srcFile : this.src;
// console.log("src: " + src);
// console.log("smilData.href: " + smilData.href);
        var ref = Helpers.ResolveContentRef(src, smilData.href);
//console.log("ref: " + ref);
        var full = smilData.mo.package.resolveRelativeUrlMO(ref);
// console.log("full: " + full);
// console.log("---");
        for (var j = 0; j < smilData.mo.package.spine.items.length; j++)
        {
            var item = smilData.mo.package.spine.items[j];
//console.log("item.href: " + item.href);
            var url = smilData.mo.package.resolveRelativeUrl(item.href);
//console.log("url: " + url);
            if (url === full)
            {
//console.error("FOUND: " + item.idref);
                this.manifestItemId = item.idref;
                return;
            }
        }
        
        console.error("Cannot set the Media ManifestItemId? " + this.src + " && " + smilData.href);
        
//        throw "BREAK";
    };
    
};

Smil.TextNode.prototype = new Smil.MediaNode();

///////////////////////////
//AudioNode

Smil.AudioNode = function(parent) {

    this.parent = parent;

    this.nodeType = "audio";

    this.clipBegin = 0;

    this.MAX = 1234567890.1; //Number.MAX_VALUE - 0.1; //Infinity;
    this.clipEnd = this.MAX;
    

    this.clipDurationMilliseconds = function()
    {
        var _clipBeginMilliseconds = this.clipBegin * 1000;
        var _clipEndMilliseconds = this.clipEnd * 1000;
        
        if (this.clipEnd >= this.MAX || _clipEndMilliseconds <= _clipBeginMilliseconds)
        {
            return 0;
        }

        return _clipEndMilliseconds - _clipBeginMilliseconds;
    };  
};

Smil.AudioNode.prototype = new Smil.MediaNode();

//////////////////////////////
//SmilModel

var SmilModel = function() {

    this.parent = undefined;
    
    
    
    this.children = []; //collection of seq or par smil nodes
    this.id = undefined; //manifest item id
    this.href = undefined; //href of the .smil source file
    this.duration = undefined;
    this.mo = undefined;
    
    this.parallelAt = function(timeMilliseconds)
    {
        return this.children[0].parallelAt(timeMilliseconds);
    };

    this.nthParallel = function(index)
    {
        var count = {count: -1};
        return this.children[0].nthParallel(index, count);
    };

    this.clipOffset = function(par)
    {
        var offset = {offset: 0};
        if (this.children[0].clipOffset(offset, par))
        {
            return offset.offset;
        }

        return 0;
    };
    
    this.durationMilliseconds_Calculated = function()
    {
        return this.children[0].durationMilliseconds();
    };
    

    var _epubtypeSyncs = [];
    // 
    // this.clearSyncs = function()
    // {
    //     _epubtypeSyncs = [];
    // };

    this.hasSync = function(epubtype)
    {
        for (var i = 0; i < _epubtypeSyncs.length; i++)
        {
            if (_epubtypeSyncs[i] === epubtype)
            {
//console.debug("hasSync OK: ["+epubtype+"]");
                return true;
            }
        }
        
//console.debug("hasSync??: ["+epubtype+"] " + _epubtypeSyncs);
        return false;
    };
    
    this.addSync = function(epubtypes)
    {
        if (!epubtypes) return;
        
//console.debug("addSyncs: "+epubtypes);

        var parts = epubtypes.split(' ');
        for (var i = 0; i < parts.length; i++)
        {
            var epubtype = parts[i].trim();

            if (epubtype.length > 0 && !this.hasSync(epubtype))
            {
                _epubtypeSyncs.push(epubtype);

//console.debug("addSync: "+epubtype);
            }
        }
    };
    
};

SmilModel.fromSmilDTO = function(smilDTO, mo) {

    if (mo.DEBUG)
    {
        console.debug("Media Overlay DTO import...");
    }

    var indent = 0;
    var getIndent = function()
    {
        var str = "";
        for (var i = 0; i < indent; i++)
        {
            str += "   ";
        }
        return str;
    }

    var smilModel = new SmilModel();
    smilModel.id = smilDTO.id;
    smilModel.spineItemId = smilDTO.spineItemId;
    smilModel.href = smilDTO.href;
    
    smilModel.smilVersion = smilDTO.smilVersion;
    
    smilModel.duration = smilDTO.duration;
    if (smilModel.duration && smilModel.duration.length && smilModel.duration.length > 0)
    {
        console.error("SMIL duration is string, parsing float... (" + smilModel.duration + ")");
        smilModel.duration = parseFloat(smilModel.duration);
    }
    
    smilModel.mo = mo; //Models.MediaOverlay

    if (smilModel.mo.DEBUG)
    {
        console.log("JS MO smilVersion=" + smilModel.smilVersion);
        console.log("JS MO id=" + smilModel.id);
        console.log("JS MO spineItemId=" + smilModel.spineItemId);
        console.log("JS MO href=" + smilModel.href);
        console.log("JS MO duration=" + smilModel.duration);
    }

    var safeCopyProperty = function(property, from, to, isRequired) {

        if((property in from))
        { // && from[property] !== ""

            if( !(property in to) ) {
                console.debug("property " + property + " not declared in smil node " + to.nodeType);
            }

            to[property] = from[property];

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO: [" + property + "=" + to[property] + "]");
            }
        }
        else if(isRequired) {
            console.log("Required property " + property + " not found in smil node " + from.nodeType);
        }
    };

    var createNodeFromDTO = function(nodeDTO, parent) {

        var node;

        if(nodeDTO.nodeType == "seq") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO seq");
            }

            node = new Smil.SeqNode(parent);

            safeCopyProperty("textref", nodeDTO, node, ((parent && parent.parent) ? true : false));
            safeCopyProperty("id", nodeDTO, node);
            safeCopyProperty("epubtype", nodeDTO, node);

            if (node.epubtype)
            {
                node.getSmil().addSync(node.epubtype);
            }
            
            indent++;
            copyChildren(nodeDTO, node);
            indent--;
        }
        else if (nodeDTO.nodeType == "par") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO par");
            }

            node = new Smil.ParNode(parent);

            safeCopyProperty("id", nodeDTO, node);
            safeCopyProperty("epubtype", nodeDTO, node);

            if (node.epubtype)
            {
                node.getSmil().addSync(node.epubtype);
            }

            indent++;
            copyChildren(nodeDTO, node);
            indent--;
			
            for(var i = 0, count = node.children.length; i < count; i++) {
                var child = node.children[i];

                if(child.nodeType == "text") {
                    node.text = child;
                }
                else if(child.nodeType == "audio") {
                    node.audio = child;
                }
                else {
                    console.error("Unexpected smil node type: " + child.nodeType);
                }
            }

////////////////
var forceTTS = false; // for testing only!
////////////////

            if (forceTTS || !node.audio)
            {
                // synthetic speech (playback using TTS engine), or embedded media, or blank page
                var fakeAudio = new Smil.AudioNode(node);

                fakeAudio.clipBegin = 0;
                fakeAudio.clipEnd = fakeAudio.MAX;
                fakeAudio.src = undefined;

                node.audio = fakeAudio;
            }
        }
        else if (nodeDTO.nodeType == "text") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO text");
            }

            node = new Smil.TextNode(parent);

            safeCopyProperty("src", nodeDTO, node, true);
            safeCopyProperty("srcFile", nodeDTO, node, true);
            safeCopyProperty("srcFragmentId", nodeDTO, node, false);
            safeCopyProperty("id", nodeDTO, node);
            
            node.updateMediaManifestItemId();
        }
        else if (nodeDTO.nodeType == "audio") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO audio");
            }

            node = new Smil.AudioNode(parent);

            safeCopyProperty("src", nodeDTO, node, true);
            safeCopyProperty("id", nodeDTO, node);

            safeCopyProperty("clipBegin", nodeDTO, node);
            if (node.clipBegin && node.clipBegin.length && node.clipBegin.length > 0)
            {
                console.error("SMIL clipBegin is string, parsing float... (" + node.clipBegin + ")");
                node.clipBegin = parseFloat(node.clipBegin);
            }
            if (node.clipBegin < 0)
            {
                if (smilModel.mo.DEBUG)
                {
                    console.log(getIndent() + "JS MO clipBegin adjusted to ZERO");
                }
                node.clipBegin = 0;
            }

            safeCopyProperty("clipEnd", nodeDTO, node);
            if (node.clipEnd && node.clipEnd.length && node.clipEnd.length > 0)
            {
                console.error("SMIL clipEnd is string, parsing float... (" + node.clipEnd + ")");
                node.clipEnd = parseFloat(node.clipEnd);
            }
            if (node.clipEnd <= node.clipBegin)
            {
                if (smilModel.mo.DEBUG)
                {
                    console.log(getIndent() + "JS MO clipEnd adjusted to MAX");
                }
                node.clipEnd = node.MAX;
            }
            
            //node.updateMediaManifestItemId(); ONLY XHTML SPINE ITEMS 
        }
        else {
            console.error("Unexpected smil node type: " + nodeDTO.nodeType);
            return undefined;
        }

        return node;

    };

    var copyChildren = function(from, to) {

        var count = from.children.length;

        for(var i = 0; i < count; i++) {
            var node = createNodeFromDTO(from.children[i], to);
            node.index = i;
            to.children.push(node);
        }

    };

    copyChildren(smilDTO, smilModel);

    return smilModel;

};

return SmilModel;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/media_overlay',["./smil_model"], function(SmilModel) {
/**
 *
 * @param package
 * @constructor
 */
var MediaOverlay = function(package) {

    this.package = package;
    

    this.parallelAt = function(timeMilliseconds)
    {
        var offset = 0;
        
        for (var i = 0; i < this.smil_models.length; i++)
        {
            var smilData = this.smil_models[i];
            
            var timeAdjusted = timeMilliseconds - offset;

            var para = smilData.parallelAt(timeAdjusted);
            if (para)
            {
                return para;
            }

            offset += smilData.durationMilliseconds_Calculated();
        }

        return undefined;
    };
    
    this.percentToPosition = function(percent, smilData, par, milliseconds)
    {
        if (percent < 0.0 || percent > 100.0)
        {
            percent = 0.0;
        }
            
        var total = this.durationMilliseconds_Calculated();

        var timeMs = total * (percent / 100.0);

        par.par = this.parallelAt(timeMs);
        if (!par.par)
        {
            return;
        }
        
        var smilDataPar = par.par.getSmil();
        if (!smilDataPar)
        {
            return;
        }
        
        var smilDataOffset = 0;
        
        for (var i = 0; i < this.smil_models.length; i++)
        {
            smilData.smilData = this.smil_models[i];
            if (smilData.smilData == smilDataPar)
            {
                break;
            }
            smilDataOffset += smilData.smilData.durationMilliseconds_Calculated();
        }

        milliseconds.milliseconds = timeMs - (smilDataOffset + smilData.smilData.clipOffset(par.par));
    };

    this.durationMilliseconds_Calculated = function()
    {
        var total = 0;
        
        for (var i = 0; i < this.smil_models.length; i++)
        {
            var smilData = this.smil_models[i];

            total += smilData.durationMilliseconds_Calculated();
        }
        
        return total;
    };
    
    this.smilAt = function(smilIndex)
    {
        if (smilIndex < 0 || smilIndex >= this.smil_models.length)
        {
            return undefined;
        }
        
        return this.smil_models[smilIndex];
    }
    
    this.positionToPercent = function(smilIndex, parIndex, milliseconds)
    {
// console.log(">>>>>>>>>>");
// console.log(milliseconds);
// console.log(smilIndex);
// console.log(parIndex);
// console.log("-------");
                
        if (smilIndex >= this.smil_models.length)
        {
            return -1.0;
        }

        var smilDataOffset = 0;
        for (var i = 0; i < smilIndex; i++)
        {
            var sd = this.smil_models[i];
            smilDataOffset += sd.durationMilliseconds_Calculated();
        }

//console.log(smilDataOffset);
        
        var smilData = this.smil_models[smilIndex];

        var par = smilData.nthParallel(parIndex);
        if (!par)
        {
            return -1.0;
        }

        var offset = smilDataOffset + smilData.clipOffset(par) + milliseconds;

//console.log(offset);
        
        var total = this.durationMilliseconds_Calculated();

///console.log(total);

        var percent = (offset / total) * 100;

//console.log("<<<<<<<<<<< " + percent);
        
        return percent;
      };
      
    this.smil_models = [];

    this.skippables = [];
    this.escapables = [];

    this.duration = undefined;
    this.narrator = undefined;


    this.activeClass = undefined;
    this.playbackActiveClass = undefined;

    this.DEBUG = false;


    this.getSmilBySpineItem = function (spineItem) {
        if (!spineItem) return undefined;

        for(var i = 0, count = this.smil_models.length; i < count; i++)
        {
            var smil = this.smil_models[i];
            if(smil.spineItemId === spineItem.idref) {
                if (spineItem.media_overlay_id !== smil.id)
                {
                    console.error("SMIL INCORRECT ID?? " + spineItem.media_overlay_id + " /// " + smil.id);
                }
                return smil;
            }
        }

        return undefined;
    };

    /*
    this.getSmilById = function (id) {

        for(var i = 0, count = this.smil_models.length; i < count; i++) {

            var smil = this.smil_models[i];
            if(smil.id === id) {
                return smil;
            }
        }

        return undefined;
    };
    */

    this.getNextSmil = function(smil) {

        var index = this.smil_models.indexOf(smil);
        if(index == -1 || index == this.smil_models.length - 1) {
            return undefined;
        }

        return this.smil_models[index + 1];
    }

    this.getPreviousSmil = function(smil) {

        var index = this.smil_models.indexOf(smil);
        if(index == -1 || index == 0) {
            return undefined;
        }

        return this.smil_models[index - 1];
    }
};

MediaOverlay.fromDTO = function(moDTO, package) {

    var mo = new MediaOverlay(package);

    if(!moDTO) {
        console.debug("No Media Overlay.");
        return mo;
    }

    console.debug("Media Overlay INIT...");

    // if (mo.DEBUG)
    //     console.debug(JSON.stringify(moDTO));
        
    mo.duration = moDTO.duration;
    if (mo.duration && mo.duration.length && mo.duration.length > 0)
    {
        console.error("SMIL total duration is string, parsing float... (" + mo.duration + ")");
        mo.duration = parseFloat(mo.duration);
    }
    if (mo.DEBUG)
        console.debug("Media Overlay Duration (TOTAL): " + mo.duration);

    mo.narrator = moDTO.narrator;
    if (mo.DEBUG)
        console.debug("Media Overlay Narrator: " + mo.narrator);

    mo.activeClass = moDTO.activeClass;
    if (mo.DEBUG)
        console.debug("Media Overlay Active-Class: " + mo.activeClass);

    mo.playbackActiveClass = moDTO.playbackActiveClass;
    if (mo.DEBUG)
        console.debug("Media Overlay Playback-Active-Class: " + mo.playbackActiveClass);

    var count = moDTO.smil_models.length;
    if (mo.DEBUG)
        console.debug("Media Overlay SMIL count: " + count);

    for(var i = 0; i < count; i++) {
        var smilModel = SmilModel.fromSmilDTO(moDTO.smil_models[i], mo);
        mo.smil_models.push(smilModel);

        if (mo.DEBUG)
            console.debug("Media Overlay Duration (SPINE ITEM): " + smilModel.duration);
    }

    count = moDTO.skippables.length;
    if (mo.DEBUG)
        console.debug("Media Overlay SKIPPABLES count: " + count);

    for(var i = 0; i < count; i++) {
        mo.skippables.push(moDTO.skippables[i]);

        //if (mo.DEBUG)
        //    console.debug("Media Overlay SKIPPABLE: " + mo.skippables[i]);
    }

    count = moDTO.escapables.length;
    if (mo.DEBUG)
        console.debug("Media Overlay ESCAPABLES count: " + count);

    for(var i = 0; i < count; i++) {
        mo.escapables.push(moDTO.escapables[i]);

        //if (mo.DEBUG)
        //    console.debug("Media Overlay ESCAPABLE: " + mo.escapables[i]);
    }

    return mo;
};

return MediaOverlay;
});



//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.


define('models/package_data',[],function() {
/**
 * This object is not instantiated directly but provided by the host application to the DOMAccess layer in the
 * Views.ReaderView.openBook function
 *
 * Provided for reference only
 *
 * @class Models.PackageData
 */
var PackageData = {

    /**
     * @property rootUrl Url of the package file
     * @type {string}
     *
     */
    rootUrl: "",
    /**
     * @property rootUrl Url of the package file, to prefix Media Overlays SMIL audio references
     * @type {string}
     *
     */
    rootUrlMO: "",
    /**
     *
     * @property rendering_layout expected values "reflowable"|rendering_layout="pre-paginated"
     * @type {string}
     */
    rendering_layout: "",

    spine: {

        direction: "ltr",
        items: [
            {
                href:"",
                idref:"",
                page_spread:"", //"page-spread-left"|"page-spread-right"|"page-spread-center"
                rendering_layout:"" //"reflowable"|"pre-paginated"
            }
        ]
    }
};

return PackageData;
});
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.
define('models/package',['../helpers','./spine_item','./spine','./media_overlay', './package_data'], function (Helpers, SpineItem, Spine, MediaOverlay, PackageData) {
/**
 *
 * @class Package
 * @constructor
 */
var Package = function(packageData){

    var self = this;

    this.spine = undefined;
    
    this.rootUrl = undefined;
    this.rootUrlMO = undefined;
    
    this.media_overlay = undefined;
    
    this.rendition_viewport = undefined;
    
    this.rendition_flow = undefined;
    
    this.rendition_layout = undefined;

    //TODO: unused yet!
    this.rendition_spread = undefined;

    //TODO: unused yet!
    this.rendition_orientation = undefined;

    this.resolveRelativeUrlMO = function(relativeUrl) {

        if(self.rootUrlMO && self.rootUrlMO.length > 0) {

            if(Helpers.EndsWith(self.rootUrlMO, "/")){
                return self.rootUrlMO + relativeUrl;
            }
            else {
                return self.rootUrlMO + "/" + relativeUrl;
            }
        }

        return self.resolveRelativeUrl(relativeUrl);
    };

    this.resolveRelativeUrl = function(relativeUrl) {

        if(self.rootUrl) {

            if(Helpers.EndsWith(self.rootUrl, "/")){
                return self.rootUrl + relativeUrl;
            }
            else {
                return self.rootUrl + "/" + relativeUrl;
            }
        }

        return relativeUrl;
    };

    this.isFixedLayout = function() {
        return self.rendition_layout === SpineItem.RENDITION_LAYOUT_PREPAGINATED;
    };

    this.isReflowable = function() {
        return !self.isFixedLayout();
    };
    

    if(packageData) {
        
        this.rootUrl = packageData.rootUrl;
        this.rootUrlMO = packageData.rootUrlMO;

        this.rendition_viewport = packageData.rendition_viewport;

        this.rendition_layout = packageData.rendition_layout;

        this.rendition_flow = packageData.rendition_flow;
        this.rendition_orientation = packageData.rendition_orientation;
        this.rendition_spread = packageData.rendition_spread;
        
        this.spine = new Spine(this, packageData.spine);

        this.media_overlay = MediaOverlay.fromDTO(packageData.media_overlay, this);
    }
};

return Package;
});



//  LauncherOSX
//
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('views/reflowable_view',["jquery", "underscore", "eventEmitter", "../models/bookmark_data", "./cfi_navigation_logic",
    "../models/current_pages_info", "../helpers", "../models/page_open_request", "../globals",
    "../models/viewer_settings"],
    function($, _, EventEmitter, BookmarkData, CfiNavigationLogic,
             CurrentPagesInfo, Helpers, PageOpenRequest, Globals,
             ViewerSettings) {
/**
 * Renders reflowable content using CSS columns
 * @param options
 * @constructor
 */
var ReflowableView = function(options, reader){

    _.extend(this, new EventEmitter());

    var self = this;
    
    var _$viewport = options.$viewport;
    var _spine = options.spine;
    var _userStyles = options.userStyles;
    var _bookStyles = options.bookStyles;
    var _iframeLoader = options.iframeLoader;
    
    var _currentSpineItem;
    var _isWaitingFrameRender = false;    
    var _deferredPageRequest;
    var _fontSize = 100;
    var _$contentFrame;
    var _navigationLogic;
    var _$el;
    var _$iframe;
    var _$epubHtml;
    
    var _$htmlBody;
    
    var _htmlBodyIsVerticalWritingMode;
    var _htmlBodyIsLTRDirection;
    var _htmlBodyIsLTRWritingMode;
    
    
    var _currentOpacity = -1;

    var _lastViewPortSize = {
        width: undefined,
        height: undefined
    };

    var _paginationInfo = {

        visibleColumnCount : 2,
        columnGap : 20,
        spreadCount : 0,
        currentSpreadIndex : 0,
        columnWidth : undefined,
        pageOffset : 0,
        columnCount: 0
    };

    this.render = function(){

        var template = Helpers.loadTemplate("reflowable_book_frame", {});

        _$el = $(template);
        _$viewport.append(_$el);

        var settings = reader.viewerSettings();
        if (!settings || typeof settings.enableGPUHardwareAccelerationCSS3D === "undefined")
        {
            //defaults
            settings = new ViewerSettings({});
        }
        if (settings.enableGPUHardwareAccelerationCSS3D) {
            // This fixes rendering issues with WebView (native apps), which clips content embedded in iframes unless GPU hardware acceleration is enabled for CSS rendering.
            _$el.css("transform", "translateZ(0)");
        }

        // See ReaderView.handleViewportResize
        // var lazyResize = _.debounce(self.onViewportResize, 100);
        // $(window).on("resize.ReadiumSDK.reflowableView", _.bind(lazyResize, self));
        renderIframe();

        return self;
    };

    function setFrameSizesToRectangle(rectangle) {
        _$contentFrame.css("left", rectangle.left + "px");
        _$contentFrame.css("top", rectangle.top + "px");
        _$contentFrame.css("right", rectangle.right + "px");
        _$contentFrame.css("bottom", rectangle.bottom + "px");

    }

    this.remove = function() {

        //$(window).off("resize.ReadiumSDK.reflowableView");
        _$el.remove();

    };

    this.isReflowable = function() {
        return true;
    };

    this.onViewportResize = function() {

        if(updateViewportSize()) {
            updatePagination();
        }
    };

    var _viewSettings = undefined;
    this.setViewSettings = function(settings) {
        
        _viewSettings = settings;

        _paginationInfo.columnGap = settings.columnGap;
        _fontSize = settings.fontSize;

        updateHtmlFontSize();
        updateColumnGap();
        
        updateViewportSize();
        updatePagination();
    };

    function renderIframe() {
        if (_$contentFrame) {
            //destroy old contentFrame
            _$contentFrame.remove();
        }

        var template = Helpers.loadTemplate("reflowable_book_page_frame", {});
        var $bookFrame = $(template);
        $bookFrame = _$el.append($bookFrame);

        _$contentFrame = $("#reflowable-content-frame", $bookFrame);

        _$iframe = $("#epubContentIframe", $bookFrame);

        _$iframe.css("left", "");
        _$iframe.css("right", "");
        _$iframe.css("position", "relative");
        //_$iframe.css(_spine.isLeftToRight() ? "left" : "right", "0px");
        _$iframe.css("overflow", "hidden");

        _navigationLogic = new CfiNavigationLogic(
            _$contentFrame, _$iframe,
            { rectangleBased: true, paginationInfo: _paginationInfo });
    }

    function loadSpineItem(spineItem) {

        if(_currentSpineItem != spineItem) {

            //create & append iframe to container frame
            renderIframe();

            _paginationInfo.pageOffset = 0;
            _paginationInfo.currentSpreadIndex = 0;
            _currentSpineItem = spineItem;
            _isWaitingFrameRender = true;

            var src = _spine.package.resolveRelativeUrl(spineItem.href);
            self.emit(Globals.Events.CONTENT_DOCUMENT_LOAD_START, _$iframe, spineItem);

            _$iframe.css("opacity", "0.01");
            
            _iframeLoader.loadIframe(_$iframe[0], src, onIFrameLoad, self, {spineItem : spineItem});
        }
    }

    function updateHtmlFontSize() {

        if(_$epubHtml) {
            Helpers.UpdateHtmlFontSize(_$epubHtml, _fontSize);
        }
    }

    function updateColumnGap() {

        if(_$epubHtml) {

            _$epubHtml.css("column-gap", _paginationInfo.columnGap + "px");
        }
    }

    function onIFrameLoad(success) {

        _isWaitingFrameRender = false;

        //while we where loading frame new request came
        if(_deferredPageRequest && _deferredPageRequest.spineItem != _currentSpineItem) {
            loadSpineItem(_deferredPageRequest.spineItem);
            return;
        }

        if(!success) {
            _$iframe.css("opacity", "1");
            _deferredPageRequest = undefined;
            return;
        }

        self.emit(Globals.Events.CONTENT_DOCUMENT_LOADED, _$iframe, _currentSpineItem);

        var epubContentDocument = _$iframe[0].contentDocument;
        _$epubHtml = $("html", epubContentDocument);
        _$htmlBody = $("body", _$epubHtml);

        // TODO: how to address this correctly across all the affected platforms?!
        // Video surface sometimes (depends on the video codec) disappears from CSS column (i.e. reflow page) during playback
        // (audio continues to play normally, but video canvas is invisible).
        // https://github.com/readium/readium-js-viewer/issues/265#issuecomment-73018762
        // ...Meanwhile, reverting https://github.com/readium/readium-js-viewer/issues/239
        // by commenting the code below (which unfortunately only works with some GPU / codec configurations,
        // but actually fails on several other machines!!)
        /*
        if(window.chrome
            && window.navigator.vendor === "Google Inc.") // TODO: Opera (WebKit) sometimes suffers from this rendering bug too (depends on the video codec), but unfortunately GPU-accelerated rendering makes the video controls unresponsive!!
        {
            $("video", _$htmlBody).css("transform", "translateZ(0)");
        }
        */
        
        _htmlBodyIsVerticalWritingMode = false;
        _htmlBodyIsLTRDirection = true;
        _htmlBodyIsLTRWritingMode = undefined;
        
        var win = _$iframe[0].contentDocument.defaultView || _$iframe[0].contentWindow;
        
        //Helpers.isIframeAlive
        var htmlBodyComputedStyle = win.getComputedStyle(_$htmlBody[0], null);
        if (htmlBodyComputedStyle)
        {
            _htmlBodyIsLTRDirection = htmlBodyComputedStyle.direction === "ltr";

            var writingMode = undefined;
            if (htmlBodyComputedStyle.getPropertyValue)
            {
                writingMode = htmlBodyComputedStyle.getPropertyValue("-webkit-writing-mode") || htmlBodyComputedStyle.getPropertyValue("-moz-writing-mode") || htmlBodyComputedStyle.getPropertyValue("-ms-writing-mode") || htmlBodyComputedStyle.getPropertyValue("-o-writing-mode") || htmlBodyComputedStyle.getPropertyValue("-epub-writing-mode") || htmlBodyComputedStyle.getPropertyValue("writing-mode");
            }
            else
            {
                writingMode = htmlBodyComputedStyle.webkitWritingMode || htmlBodyComputedStyle.mozWritingMode || htmlBodyComputedStyle.msWritingMode || htmlBodyComputedStyle.oWritingMode || htmlBodyComputedStyle.epubWritingMode || htmlBodyComputedStyle.writingMode;
            }

            if (writingMode)
            {
                _htmlBodyIsLTRWritingMode = writingMode.indexOf("-lr") >= 0; // || writingMode.indexOf("horizontal-") >= 0; we need explicit!
            
                if (writingMode.indexOf("vertical") >= 0 || writingMode.indexOf("tb-") >= 0 || writingMode.indexOf("bt-") >= 0)
                {
                    _htmlBodyIsVerticalWritingMode = true;
                }
            }
        }

        if (_htmlBodyIsLTRDirection)
        {
            if (_$htmlBody[0].getAttribute("dir") === "rtl" || _$epubHtml[0].getAttribute("dir") === "rtl")
            {
                _htmlBodyIsLTRDirection = false;
            }
        }

        // Some EPUBs may not have explicit RTL content direction (via CSS "direction" property or @dir attribute) despite having a RTL page progression direction. Readium consequently tweaks the HTML in order to restore the correct block flow in the browser renderer, resulting in the appropriate CSS columnisation (which is used to emulate pagination).
        if (!_spine.isLeftToRight() && _htmlBodyIsLTRDirection && !_htmlBodyIsVerticalWritingMode)
        {
            _$htmlBody[0].setAttribute("dir", "rtl");
            _htmlBodyIsLTRDirection = false;
            _htmlBodyIsLTRWritingMode = false;
        }
        
        _paginationInfo.isVerticalWritingMode = _htmlBodyIsVerticalWritingMode;
        
        hideBook();
        _$iframe.css("opacity", "1");
        
        updateViewportSize();
        _$epubHtml.css("height", _lastViewPortSize.height + "px");
        
        _$epubHtml.css("position", "relative");
        _$epubHtml.css("margin", "0");
        _$epubHtml.css("padding", "0");

        _$epubHtml.css("column-axis", (_htmlBodyIsVerticalWritingMode ? "vertical" : "horizontal"));

        //
        // /////////
        // //Columns Debugging
        //
        //     _$epubHtml.css("column-rule-color", "red");
        //     _$epubHtml.css("column-rule-style", "dashed");
        //     _$epubHtml.css("column-rule-width", "1px");
        // _$epubHtml.css("background-color", '#b0c4de');
        //
        // ////
        
        self.applyBookStyles();
        resizeImages();

        updateHtmlFontSize();
        updateColumnGap();


        self.applyStyles();
    }

    this.applyStyles = function() {

        Helpers.setStyles(_userStyles.getStyles(), _$el.parent());

        //because left, top, bottom, right setting ignores padding of parent container
        //we have to take it to account manually
        var elementMargins = Helpers.Margins.fromElement(_$el);
        setFrameSizesToRectangle(elementMargins.padding);


        updateViewportSize();
        updatePagination();
    };

    this.applyBookStyles = function() {

        if(_$epubHtml) {
            Helpers.setStyles(_bookStyles.getStyles(), _$epubHtml);
        }
    };

    function openDeferredElement() {

        if(!_deferredPageRequest) {
            return;
        }

        var deferredData = _deferredPageRequest;
        _deferredPageRequest = undefined;
        self.openPage(deferredData);

    }

    this.openPage = function(pageRequest) {

        if(_isWaitingFrameRender) {
            _deferredPageRequest = pageRequest;
            return;
        }

        // if no spine item specified we are talking about current spine item
        if(pageRequest.spineItem && pageRequest.spineItem != _currentSpineItem) {
            _deferredPageRequest = pageRequest;
            loadSpineItem(pageRequest.spineItem);
            return;
        }

        var pageIndex = undefined;


        if(pageRequest.spineItemPageIndex !== undefined) {
            pageIndex = pageRequest.spineItemPageIndex;
        }
        else if(pageRequest.elementId) {
            pageIndex = _navigationLogic.getPageForElementId(pageRequest.elementId);
        }
        else if(pageRequest.elementCfi) {
            try
            {
                pageIndex = _navigationLogic.getPageForElementCfi(pageRequest.elementCfi,
                    ["cfi-marker", "mo-cfi-highlight"],
                    [],
                    ["MathJax_Message"]);
            }
            catch (e)
            {
                pageIndex = 0;
                console.error(e);
            }
        }
        else if(pageRequest.firstPage) {
            pageIndex = 0;
        }
        else if(pageRequest.lastPage) {
            pageIndex = _paginationInfo.columnCount - 1;
        }
        else {
            console.debug("No criteria in pageRequest");
            pageIndex = 0;
        }

        if(pageIndex >= 0 && pageIndex < _paginationInfo.columnCount) {
            _paginationInfo.currentSpreadIndex = Math.floor(pageIndex / _paginationInfo.visibleColumnCount) ;
            onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
        }
        else {
            console.log('Illegal pageIndex value: ', pageIndex, 'column count is ', _paginationInfo.columnCount);
        }
    };

    function redraw() {

        var offsetVal =  -_paginationInfo.pageOffset + "px";

        if (_htmlBodyIsVerticalWritingMode)
        {
            _$epubHtml.css("top", offsetVal);
        }
        else
        {
            var ltr = _htmlBodyIsLTRDirection || _htmlBodyIsLTRWritingMode;

            _$epubHtml.css("left", ltr ? offsetVal : "");
            _$epubHtml.css("right", !ltr ? offsetVal : "");
        }

        showBook(); // as it's no longer hidden by shifting the position
    }

    function updateViewportSize() {

        var newWidth = _$contentFrame.width();
        var newHeight = _$contentFrame.height();

        if(_lastViewPortSize.width !== newWidth || _lastViewPortSize.height !== newHeight){

            _lastViewPortSize.width = newWidth;
            _lastViewPortSize.height = newHeight;
            return true;
        }

        return false;
    }

    function onPaginationChanged(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        _paginationInfo.pageOffset = (_paginationInfo.columnWidth + _paginationInfo.columnGap) * _paginationInfo.visibleColumnCount * _paginationInfo.currentSpreadIndex;
        
        redraw();
        self.emit(Globals.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: self.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
    }

    this.openPagePrev = function (initiator) {

        if(!_currentSpineItem) {
            return;
        }

        if(_paginationInfo.currentSpreadIndex > 0) {
            _paginationInfo.currentSpreadIndex--;
            onPaginationChanged(initiator);
        }
        else {

            var prevSpineItem = _spine.prevItem(_currentSpineItem, true);
            if(prevSpineItem) {

                var pageRequest = new PageOpenRequest(prevSpineItem, initiator);
                pageRequest.setLastPage();
                self.openPage(pageRequest);
            }
        }
    };

    this.openPageNext = function (initiator) {

        if(!_currentSpineItem) {
            return;
        }

        if(_paginationInfo.currentSpreadIndex < _paginationInfo.spreadCount - 1) {
            _paginationInfo.currentSpreadIndex++;
            onPaginationChanged(initiator);
        }
        else {

            var nextSpineItem = _spine.nextItem(_currentSpineItem, true);
            if(nextSpineItem) {

                var pageRequest = new PageOpenRequest(nextSpineItem, initiator);
                pageRequest.setFirstPage();
                self.openPage(pageRequest);
            }
        }
    };


    function updatePagination() {
        
        // At 100% font-size = 16px (on HTML, not body or descendant markup!)
        var MAXW = 550; //TODO user/vendor-configurable?
        var MINW = 400;
        
        var isDoublePageSyntheticSpread = Helpers.deduceSyntheticSpread(_$viewport, _currentSpineItem, _viewSettings);
        
        var forced = (isDoublePageSyntheticSpread === false) || (isDoublePageSyntheticSpread === true);
        // excludes 0 and 1 falsy/truthy values which denote non-forced result
        
// console.debug("isDoublePageSyntheticSpread: " + isDoublePageSyntheticSpread);
// console.debug("forced: " + forced);
//
        if (isDoublePageSyntheticSpread === 0)
        {
            isDoublePageSyntheticSpread = 1; // try double page, will shrink if doesn't fit
// console.debug("TRYING SPREAD INSTEAD OF SINGLE...");
        }
        
        _paginationInfo.visibleColumnCount = isDoublePageSyntheticSpread ? 2 : 1;
   
        if (_htmlBodyIsVerticalWritingMode)
        {
            MAXW *= 2;
            isDoublePageSyntheticSpread = false;
            forced = true;
            _paginationInfo.visibleColumnCount = 1;
// console.debug("Vertical Writing Mode => single CSS column, but behaves as if two-page spread");
        }

        if(!_$epubHtml) {
            return;
        }
        
        hideBook(); // shiftBookOfScreen();
        
        var borderLeft = parseInt(_$viewport.css("border-left-width"));
        var borderRight = parseInt(_$viewport.css("border-right-width"));
        var adjustedGapLeft = _paginationInfo.columnGap/2;
        adjustedGapLeft = Math.max(0, adjustedGapLeft-borderLeft)
        var adjustedGapRight = _paginationInfo.columnGap/2;
        adjustedGapRight = Math.max(0, adjustedGapRight-borderRight)

        var filler = 0;
        
//         var win = _$iframe[0].contentDocument.defaultView || _$iframe[0].contentWindow;
//         var htmlBodyComputedStyle = win.getComputedStyle(_$htmlBody[0], null);
//         if (htmlBodyComputedStyle)
//         {
//             var fontSize = undefined;
//             if (htmlBodyComputedStyle.getPropertyValue)
//             {
//                 fontSize = htmlBodyComputedStyle.getPropertyValue("font-size");
//             }
//             else
//             {
//                 fontSize = htmlBodyComputedStyle.fontSize;
//             }
// console.debug(fontSize);
//         }
        
        if (_viewSettings.fontSize)
        {
            var fontSizeAdjust = (_viewSettings.fontSize*0.8)/100;
            MAXW = Math.floor(MAXW * fontSizeAdjust);
            MINW = Math.floor(MINW * fontSizeAdjust);
        }
        
        var availableWidth = _$viewport.width();
        var textWidth = availableWidth - borderLeft - borderRight - adjustedGapLeft - adjustedGapRight;
        if (isDoublePageSyntheticSpread)
        {
            textWidth = (textWidth - _paginationInfo.columnGap) * 0.5;
        }
        
        if (textWidth > MAXW)
        {
// console.debug("LIMITING WIDTH");
            filler = Math.floor((textWidth - MAXW) * (isDoublePageSyntheticSpread ? 1 : 0.5));
        }
        else if (!forced && textWidth < MINW && isDoublePageSyntheticSpread)
        {
//console.debug("REDUCING SPREAD TO SINGLE");
            isDoublePageSyntheticSpread = false;
            _paginationInfo.visibleColumnCount = 1;
            
            textWidth = availableWidth - borderLeft - borderRight - adjustedGapLeft - adjustedGapRight;
            if (textWidth > MAXW)
            {
                filler = Math.floor((textWidth - MAXW) * 0.5);
            }
        }
        
        _$el.css({"left": (filler+adjustedGapLeft + "px"), "right": (filler+adjustedGapRight + "px")});
        updateViewportSize(); //_$contentFrame ==> _lastViewPortSize

        
        _$iframe.css("width", _lastViewPortSize.width + "px");
        _$iframe.css("height", _lastViewPortSize.height + "px");

        _$epubHtml.css("height", _lastViewPortSize.height + "px");
        
        // below min- max- are required in vertical writing mode (height is not enough, in some cases...weird!)
        _$epubHtml.css("min-height", _lastViewPortSize.height + "px");
        _$epubHtml.css("max-height", _lastViewPortSize.height + "px");

        //normalise spacing to avoid interference with column-isation
        _$epubHtml.css('margin', 0);
        _$epubHtml.css('padding', 0);
        _$epubHtml.css('border', 0);
        _$htmlBody.css('margin', 0);
        _$htmlBody.css('padding', 0);

        _paginationInfo.rightToLeft = _spine.isRightToLeft();

        _paginationInfo.columnWidth = Math.round(((_htmlBodyIsVerticalWritingMode ? _lastViewPortSize.height : _lastViewPortSize.width) - _paginationInfo.columnGap * (_paginationInfo.visibleColumnCount - 1)) / _paginationInfo.visibleColumnCount);

        var useColumnCountNotWidth = _paginationInfo.visibleColumnCount > 1; // column-count == 1 does not work in Chrome, and is not needed anyway (HTML width is full viewport width, no Firefox video flickering)
        if (useColumnCountNotWidth) {
            _$epubHtml.css("width", _lastViewPortSize.width + "px");
            _$epubHtml.css("column-count", _paginationInfo.visibleColumnCount);
        } else {
            _$epubHtml.css("width", (_htmlBodyIsVerticalWritingMode ? _lastViewPortSize.width : _paginationInfo.columnWidth) + "px");
            _$epubHtml.css("column-width", _paginationInfo.columnWidth + "px");
        }

        _$epubHtml.css("column-fill", "auto");
        
        _$epubHtml.css({left: "0", right: "0", top: "0"});
        
        Helpers.triggerLayout(_$iframe);

        _paginationInfo.columnCount = ((_htmlBodyIsVerticalWritingMode ? _$epubHtml[0].scrollHeight : _$epubHtml[0].scrollWidth) + _paginationInfo.columnGap) / (_paginationInfo.columnWidth + _paginationInfo.columnGap);
        _paginationInfo.columnCount = Math.round(_paginationInfo.columnCount);

        var totalGaps = (_paginationInfo.columnCount-1) * _paginationInfo.columnGap;
        var colWidthCheck = ((_htmlBodyIsVerticalWritingMode ? _$epubHtml[0].scrollHeight : _$epubHtml[0].scrollWidth) - totalGaps) / _paginationInfo.columnCount;
        colWidthCheck = Math.round(colWidthCheck);

        if (colWidthCheck > _paginationInfo.columnWidth)
        {
            console.debug("ADJUST COLUMN");
            console.log(_paginationInfo.columnWidth);
            console.log(colWidthCheck);
            
            _paginationInfo.columnWidth = colWidthCheck;
        }

        _paginationInfo.spreadCount =  Math.ceil(_paginationInfo.columnCount / _paginationInfo.visibleColumnCount);

        if(_paginationInfo.currentSpreadIndex >= _paginationInfo.spreadCount) {
            _paginationInfo.currentSpreadIndex = _paginationInfo.spreadCount - 1;
        }

        if(_deferredPageRequest) {

            //if there is a request for specific page we get here
            openDeferredElement();
        }
        else {

            //we get here on resizing the viewport
            
            onPaginationChanged(self); // => redraw() => showBook(), so the trick below is not needed

            // //We do this to force re-rendering of the document in the iframe.
            // //There is a bug in WebView control with right to left columns layout - after resizing the window html document
            // //is shifted in side the containing div. Hiding and showing the html element puts document in place.
            // _$epubHtml.hide();
            // setTimeout(function() {
            //     _$epubHtml.show();
            //     onPaginationChanged(self); // => redraw() => showBook()
            // }, 50);

        }
    }

//    function shiftBookOfScreen() {
//
//        if(_spine.isLeftToRight()) {
//            _$epubHtml.css("left", (_lastViewPortSize.width + 1000) + "px");
//        }
//        else {
//            _$epubHtml.css("right", (_lastViewPortSize.width + 1000) + "px");
//        }
//    }

    function hideBook()
    {
        if (_currentOpacity != -1) return; // already hidden
        
        _currentOpacity = _$epubHtml.css('opacity');
        _$epubHtml.css('opacity', "0");
    }

    function showBook()
    {
        if (_currentOpacity != -1)
        {
            _$epubHtml.css('opacity', _currentOpacity);
        }
        _currentOpacity = -1;
    }

    this.getFirstVisibleElementCfi = function() {

        var contentOffsets = getVisibleContentOffsets();
        return _navigationLogic.getFirstVisibleElementCfi(contentOffsets);
    };

    this.getPaginationInfo = function() {

        var paginationInfo = new CurrentPagesInfo(_spine, false);

        if(!_currentSpineItem) {
            return paginationInfo;
        }

        var pageIndexes = getOpenPageIndexes();

        for(var i = 0, count = pageIndexes.length; i < count; i++) {

            paginationInfo.addOpenPage(pageIndexes[i], _paginationInfo.columnCount, _currentSpineItem.idref, _currentSpineItem.index);
        }

        return paginationInfo;

    };

    function getOpenPageIndexes() {

        var indexes = [];

        var currentPage = _paginationInfo.currentSpreadIndex * _paginationInfo.visibleColumnCount;

        for(var i = 0; i < _paginationInfo.visibleColumnCount && (currentPage + i) < _paginationInfo.columnCount; i++) {

            indexes.push(currentPage + i);
        }

        return indexes;

    }

    //we need this styles for css columnizer not to chop big images
    function resizeImages() {

        if(!_$epubHtml) {
            return;
        }

        var $elem;
        var height;
        var width;

        $('img, svg', _$epubHtml).each(function(){

            $elem = $(this);

            // if we set max-width/max-height to 100% columnizing engine chops images embedded in the text
            // (but not if we set it to 99-98%) go figure.
            // TODO: CSS min-w/h is content-box, not border-box (does not take into account padding + border)? => images may still overrun?
            $elem.css('max-width', '98%');
            $elem.css('max-height', '98%');

            if(!$elem.css('height')) {
                $elem.css('height', 'auto');
            }

            if(!$elem.css('width')) {
                $elem.css('width', 'auto');
            }

        });
    }

    this.bookmarkCurrentPage = function() {

        if(!_currentSpineItem) {

            return new BookmarkData("", "");
        }

        return new BookmarkData(_currentSpineItem.idref, self.getFirstVisibleElementCfi());
    };

    function getVisibleContentOffsets() {
        //TODO: _htmlBodyIsVerticalWritingMode ? (_lastViewPortSize.height * _paginationInfo.currentSpreadIndex)
        // NOT used with options.rectangleBased anyway (see CfiNavigationLogic constructor call, here in this reflow engine class)
        var columnsLeftOfViewport = Math.round(_paginationInfo.pageOffset / (_paginationInfo.columnWidth + _paginationInfo.columnGap));

        var topOffset =  columnsLeftOfViewport * _$contentFrame.height();
        var bottomOffset = topOffset + _paginationInfo.visibleColumnCount * _$contentFrame.height();

        return {top: topOffset, bottom: bottomOffset};
    }

    this.getLoadedSpineItems = function() {
        return [_currentSpineItem];
    };

    this.getElementByCfi = function(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        if(spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return _navigationLogic.getElementByCfi(cfi, classBlacklist, elementBlacklist, idBlacklist);
    };

    this.getElementById = function(spineItem, id) {

        if(spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return _navigationLogic.getElementById(id);
    };

    this.getElement = function(spineItem, selector) {

        if(spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return _navigationLogic.getElement(selector);
    };

    this.getFirstVisibleMediaOverlayElement = function() {

        var visibleContentOffsets = getVisibleContentOffsets();
        return _navigationLogic.getFirstVisibleMediaOverlayElement(visibleContentOffsets);
    };
    
    // /**
    //  * @deprecated
    //  */
    // this.getVisibleMediaOverlayElements = function() {
    // 
    //     var visibleContentOffsets = getVisibleContentOffsets();
    //     return _navigationLogic.getVisibleMediaOverlayElements(visibleContentOffsets);
    // };

    this.insureElementVisibility = function(spineItemId, element, initiator) {

        var $element = $(element);
        if(_navigationLogic.isElementVisible($element, getVisibleContentOffsets()))
        {
            return;
        }

        var page = _navigationLogic.getPageForElement($element);

        if(page == -1)
        {
            return;
        }

        var openPageRequest = new PageOpenRequest(_currentSpineItem, initiator);
        openPageRequest.setPageIndex(page);

        var id = element.id;
        if (!id)
        {
            id = element.getAttribute("id");
        }
        
        if (id)
        {
            openPageRequest.setElementId(id);
        }

        self.openPage(openPageRequest);
    }

};
    return ReflowableView;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/style',[], function() {
/**
 *
 * @param selector
 * @param declarations
 * @constructor
 */
var Style = function(selector, declarations) {

    this.selector = selector;
    this.declarations = declarations;

    this.setDeclarations = function(declarations) {

        for(var prop in declarations) {
            if(declarations.hasOwnProperty(prop)) {
                this.declarations[prop] = declarations[prop];
            }
        }

    }
};
    return Style;
});

//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/style_collection',["./style"], function(Style) {
/**
 *
 * @constructor
 */
var StyleCollection = function() {

    var _styles = [];

    this.clear = function() {
        _styles.length = 0;

    };

    this.findStyle = function(selector) {

        var count = _styles.length;
        for(var i = 0; i < count; i++) {
            if(_styles[i].selector === selector) {
                return _styles[i];
            }
        }

        return undefined;
    };

    this.addStyle = function(selector, declarations) {

        var style = this.findStyle(selector);

        if(style) {
            style.setDeclarations(declarations);
        }
        else {
            style = new Style(selector, declarations);
            _styles.push(style);
        }

        return style;
    };

    this.removeStyle = function(selector) {
        
        var count = _styles.length;

        for(var i = 0; i < count; i++) {

            if(_styles[i].selector === selector) {
                _styles.splice(i, 1);
                return;
            }
        }
    };

    this.getStyles = function() {
        return _styles;
    };

    this.resetStyleValues = function() {

        var count = _styles.length;

        for(var i = 0; i < count; i++) {

            var style = _styles[i];
            var declarations = style.declarations;

            for(var prop in declarations) {
                if(declarations.hasOwnProperty(prop)) {
                    declarations[prop] = '';
                }
            }
        }
    }

};
    return StyleCollection;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.
define('models/switches',["jquery", "underscore"], function($, _) {
/**
 *
 * @constructor
 */
var Switches = function() {

};

// Description: Parse the epub "switch" tags and hide
// cases that are not supported
Switches.apply = function(dom) {


    // helper method, returns true if a given case node
    // is supported, false otherwise
    function isSupported(caseNode) {

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
    }

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
};
    return Switches;
});

//  LauncherOSX
//
//  Created by Boris Schneiderman.
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('models/trigger',["jquery", "../helpers"], function($, Helpers) {
/**
 * Setter fot epub Triggers
 *
 *
 * @param domNode
 */

var Trigger = function(domNode) {
    var $el = $(domNode);
    this.action 	= $el.attr("action");
    this.ref 		= $el.attr("ref");
    this.event 		= $el.attr("ev:event");
    this.observer 	= $el.attr("ev:observer");
    this.ref 		= $el.attr("ref");
};

Trigger.register = function(dom) {
    $('trigger', dom).each(function() {
        var trigger = new Trigger(this);
        trigger.subscribe(dom);
    });
};

Trigger.prototype.subscribe = function(dom) {
    var selector = "#" + this.observer;
    var that = this;
    $(selector, dom).on(this.event, function() {
        that.execute(dom);
    });
};

Trigger.prototype.execute = function(dom) {
    var $target = $( "#" + Helpers.escapeJQuerySelector(this.ref), dom);
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
    return Trigger;
});

//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.

define('views/reader_view',["jquery", "underscore", "eventEmitter", "./fixed_view", "../helpers", "./iframe_loader", "./internal_links_support",
        "./media_overlay_data_injector", "./media_overlay_player", "../models/package", "../models/page_open_request",
        "./reflowable_view", "./scroll_view", "../models/style_collection", "../models/switches", "../models/trigger",
        "../models/viewer_settings", "../globals"],
    function ($, _, EventEmitter, FixedView, Helpers, IFrameLoader, InternalLinksSupport,
              MediaOverlayDataInjector, MediaOverlayPlayer, Package, PageOpenRequest,
              ReflowableView, ScrollView, StyleCollection, Switches, Trigger,
              ViewerSettings, Globals) {
/**
 * Options passed on the reader from the readium loader/initializer
 *
 * @typedef {object} Globals.Views.ReaderView.ReaderOptions
 * @property {jQueryElement|string} el   The element the reader view should create itself in. Can be a jquery wrapped element or a query selector.
 * @property {Globals.Views.IFrameLoader} iframeLoader   An instance of an iframe loader or one expanding it.
 * @property {boolean} needsFixedLayoutScalerWorkAround
 */

/**
 * Top level View object. Interface for view manipulation public APIs
 * @param {Views.ReaderView.ReaderOptions} options
 * @constructor
 */
var ReaderView = function (options) {

    _.extend(this, new EventEmitter());

    var self = this;
    var _currentView = undefined;
    var _package = undefined;
    var _spine = undefined;
    var _viewerSettings = new ViewerSettings({});
    //styles applied to the container divs
    var _userStyles = new StyleCollection();
    //styles applied to the content documents
    var _bookStyles = new StyleCollection();
    var _internalLinksSupport = new InternalLinksSupport(this);
    var _mediaOverlayPlayer;
    var _mediaOverlayDataInjector;
    var _iframeLoader;
    var _$el;

    //We will call onViewportResize after user stopped resizing window
    var lazyResize = Helpers.extendedThrottle(
        handleViewportResizeStart,
        handleViewportResizeTick,
        handleViewportResizeEnd, 250, 1000, self);

    $(window).on("resize.ReadiumSDK.readerView", lazyResize);

    if (options.el instanceof $) {
        _$el = options.el;
        console.log("** EL is a jQuery selector:" + options.el.attr('id'));
    } else {
        _$el = $(options.el);
        console.log("** EL is a string:" + _$el.attr('id'));
    }

    if (options.iframeLoader) {
        _iframeLoader = options.iframeLoader;
    }
    else {
        _iframeLoader = new IFrameLoader({mathJaxUrl: options.mathJaxUrl});
    }


    _needsFixedLayoutScalerWorkAround = options.needsFixedLayoutScalerWorkAround;
    /**
     * @returns {boolean}
     */
    this.needsFixedLayoutScalerWorkAround = function () {
        return _needsFixedLayoutScalerWorkAround;
    };

    /**
     * Create a view based on the given view type.
     * @param {Views.ReaderView.ViewType} viewType
     * @param {Views.ReaderView.ViewCreationOptions} options
     * @returns {*}
     */
    this.createViewForType = function (viewType, options) {
        var createdView;

        // NOTE: _$el == options.$viewport
        _$el.css("overflow", "hidden");

        switch (viewType) {
            case ReaderView.VIEW_TYPE_FIXED:

                _$el.css("overflow", "auto"); // for content pan, see self.setZoom()

                createdView = new FixedView(options, self);
                break;
            case ReaderView.VIEW_TYPE_SCROLLED_DOC:
                createdView = new ScrollView(options, false, self);
                break;
            case ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS:
                createdView = new ScrollView(options, true, self);
                break;
            default:
                createdView = new ReflowableView(options, self);
                break;
        }

        return createdView;
    };

    /**
     * Returns the current view type of the reader view
     * @returns {ReaderView.ViewType}
     */
    this.getCurrentViewType = function () {

        if (!_currentView) {
            return undefined;
        }

        if (_currentView instanceof ReflowableView) {
            return ReaderView.VIEW_TYPE_COLUMNIZED;
        }

        if (_currentView instanceof FixedView) {
            return ReaderView.VIEW_TYPE_FIXED;
        }

        if (_currentView instanceof ScrollView) {
            if (_currentView.isContinuousScroll()) {
                return ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS;
            }

            return ReaderView.VIEW_TYPE_SCROLLED_DOC;
        }

        console.error("Unrecognized view type");
        return undefined;
    };

    //based on https://docs.google.com/spreadsheet/ccc?key=0AoPMUkQhc4wcdDI0anFvWm96N0xRT184ZE96MXFRdFE&usp=drive_web#gid=0 document
    function deduceDesiredViewType(spineItem) {

        //check settings
        if (_viewerSettings.scroll == "scroll-doc") {
            return ReaderView.VIEW_TYPE_SCROLLED_DOC;
        }

        if (_viewerSettings.scroll == "scroll-continuous") {
            return ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS;
        }

        //is fixed layout ignore flow
        if (spineItem.isFixedLayout()) {
            return ReaderView.VIEW_TYPE_FIXED;
        }

        //flow
        if (spineItem.isFlowScrolledDoc()) {
            return ReaderView.VIEW_TYPE_SCROLLED_DOC;
        }

        if (spineItem.isFlowScrolledContinuous()) {
            return ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS;
        }

        return ReaderView.VIEW_TYPE_COLUMNIZED;
    }

    // returns true is view changed
    function initViewForItem(spineItem, callback) {

        var desiredViewType = deduceDesiredViewType(spineItem);

        if (_currentView) {

            if (self.getCurrentViewType() == desiredViewType) {
                callback(false);
                return;
            }

            resetCurrentView();
        }

        /**
         * View creation options
         * @typedef {object} Globals.Views.ReaderView.ViewCreationOptions
         * @property {jQueryElement} $viewport  The view port element the reader view has created.
         * @property {Globals.Models.Spine} spine The spine item collection object
         * @property {Globals.Collections.StyleCollection} userStyles User styles
         * @property {Globals.Collections.StyleCollection} bookStyles Book styles
         * @property {Globals.Views.IFrameLoader} iframeLoader   An instance of an iframe loader or one expanding it.
         */
        var viewCreationParams = {
            $viewport: _$el,
            spine: _spine,
            userStyles: _userStyles,
            bookStyles: _bookStyles,
            iframeLoader: _iframeLoader
        };


        _currentView = self.createViewForType(desiredViewType, viewCreationParams);
        self.emit(Globals.Events.READER_VIEW_CREATED, desiredViewType);

        _currentView.on(Globals.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem) {

            if (!Helpers.isIframeAlive($iframe[0])) return;

            // performance degrades with large DOM (e.g. word-level text-audio sync)
            _mediaOverlayDataInjector.attachMediaOverlayData($iframe, spineItem, _viewerSettings);

            _internalLinksSupport.processLinkElements($iframe, spineItem);

            var contentDoc = $iframe[0].contentDocument;
            Trigger.register(contentDoc);
            Switches.apply(contentDoc);

            self.emit(Globals.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);
        });

        _currentView.on(Globals.Events.CONTENT_DOCUMENT_LOAD_START, function ($iframe, spineItem) {
            self.emit(Globals.Events.CONTENT_DOCUMENT_LOAD_START, $iframe, spineItem);
        });

        _currentView.on(Globals.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, function (pageChangeData) {

            //we call on onPageChanged explicitly instead of subscribing to the Globals.Events.PAGINATION_CHANGED by
            //mediaOverlayPlayer because we hve to guarantee that mediaOverlayPlayer will be updated before the host
            //application will be notified by the same Globals.Events.PAGINATION_CHANGED event
            _mediaOverlayPlayer.onPageChanged(pageChangeData);

            self.emit(Globals.Events.PAGINATION_CHANGED, pageChangeData);
        });

        _currentView.on(Globals.Events.FXL_VIEW_RESIZED, function () {
            self.emit(Globals.Events.FXL_VIEW_RESIZED);
        })

        _currentView.render();
        _currentView.setViewSettings(_viewerSettings);

        // we do this to wait until elements are rendered otherwise book is not able to determine view size.
        setTimeout(function () {

            callback(true);

        }, 50);

    }

    /**
     * Returns a list of the currently active spine items
     *
     * @returns {Models.SpineItem[]}
     */
    this.getLoadedSpineItems = function () {

        if (_currentView) {
            return _currentView.getLoadedSpineItems();
        }

        return [];
    };

    function resetCurrentView() {

        if (!_currentView) {
            return;
        }

        self.emit(Globals.Events.READER_VIEW_DESTROYED);

        _currentView.off(Globals.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED);
        _currentView.remove();
        _currentView = undefined;
    }

    /**
     * Returns the currently instanced viewer settings
     *
     * @returns {Models.ViewerSettings}
     */
    this.viewerSettings = function () {
        return _viewerSettings;
    };

    /**
     * Returns a data object based on the package document
     *
     * @returns {Models.Package}
     */
    this.package = function () {
        return _package;
    };

    /**
     * Returns a representation of the spine as a data object, also acts as list of spine items
     *
     * @returns {Models.Spine}
     */
    this.spine = function () {
        return _spine;
    };

    /**
     * Returns the user CSS styles collection
     *
     * @returns {Collections.StyleCollection}
     */
    this.userStyles = function () {
        return _userStyles;
    };

    /**
     * Open Book Data
     *
     * @typedef {object} Globals.Views.ReaderView.OpenBookData
     * @property {Globals.Models.Package} package - packageData (required)
     * @property {Globals.Models.PageOpenRequest} openPageRequest - openPageRequestData, (optional) data related to open page request
     * @property {Globals.Views.ReaderView.SettingsData} [settings]
     * @property {Globals.Collections.StyleCollection} styles: [cssStyles]
     * @todo Define missing types
     */

    /**
     * Triggers the process of opening the book and requesting resources specified in the packageData
     *
     * @param {Views.ReaderView.OpenBookData} openBookData - object with open book data
     */
    this.openBook = function (openBookData) {

        var packageData = openBookData.package ? openBookData.package : openBookData;

        _package = new Package(packageData);

        _spine = _package.spine;
        _spine.handleLinear(true);

        if (_mediaOverlayPlayer) {
            _mediaOverlayPlayer.reset();
        }

        _mediaOverlayPlayer = new MediaOverlayPlayer(self, $.proxy(onMediaPlayerStatusChanged, self));
        _mediaOverlayPlayer.setAutomaticNextSmil(_viewerSettings.mediaOverlaysAutomaticPageTurn ? true : false); // just to ensure the internal var is set to the default settings (user settings are applied below at self.updateSettings(openBookData.settings);)

        _mediaOverlayDataInjector = new MediaOverlayDataInjector(_package.media_overlay, _mediaOverlayPlayer);


        resetCurrentView();

        if (openBookData.settings) {
            self.updateSettings(openBookData.settings);
        }

        if (openBookData.styles) {
            self.setStyles(openBookData.styles);
        }

        var pageRequestData = undefined;

        if (openBookData.openPageRequest) {

            if (openBookData.openPageRequest.idref || (openBookData.openPageRequest.contentRefUrl && openBookData.openPageRequest.sourceFileHref)) {
                pageRequestData = openBookData.openPageRequest;
            }
            else {
                console.log("Invalid page request data: idref required!");
            }
        }

        var fallback = false;
        if (pageRequestData) {

            pageRequestData = openBookData.openPageRequest;

            try {
                if (pageRequestData.idref) {

                    if (pageRequestData.spineItemPageIndex) {
                        fallback = !self.openSpineItemPage(pageRequestData.idref, pageRequestData.spineItemPageIndex, self);
                    }
                    else if (pageRequestData.elementCfi) {
                        fallback = !self.openSpineItemElementCfi(pageRequestData.idref, pageRequestData.elementCfi, self);
                    }
                    else {
                        fallback = !self.openSpineItemPage(pageRequestData.idref, 0, self);
                    }
                }
                else {
                    fallback = !self.openContentUrl(pageRequestData.contentRefUrl, pageRequestData.sourceFileHref, self);
                }
            } catch (err) {
                console.error("openPageRequest fail: fallback to first page!")
                console.log(err);
                fallback = true;
            }
        }
        else {
            fallback = true;
        }

        if (fallback) {// if we where not asked to open specific page we will open the first one

            var spineItem = _spine.first();
            if (spineItem) {
                var pageOpenRequest = new PageOpenRequest(spineItem, self);
                pageOpenRequest.setFirstPage();
                openPage(pageOpenRequest, 0);
            }

        }

    };

    function onMediaPlayerStatusChanged(status) {
        self.emit(Globals.Events.MEDIA_OVERLAY_STATUS_CHANGED, status);
    }

    /**
     * Flips the page from left to right.
     * Takes to account the page progression direction to decide to flip to prev or next page.
     */
    this.openPageLeft = function () {

        if (_package.spine.isLeftToRight()) {
            self.openPagePrev();
        }
        else {
            self.openPageNext();
        }
    };

    /**
     * Flips the page from right to left.
     * Takes to account the page progression direction to decide to flip to prev or next page.
     */
    this.openPageRight = function () {

        if (_package.spine.isLeftToRight()) {
            self.openPageNext();
        }
        else {
            self.openPagePrev();
        }

    };

    /**
     * Returns if the current child view is an instance of a fixed page view
     *
     * @returns {boolean}
     */
    this.isCurrentViewFixedLayout = function () {
        return _currentView instanceof FixedView;
    };

    /**
     * Zoom options
     *
     * @typedef {object} Globals.Views.ReaderView.ZoomOptions
     * @property {string} style - "user"|"fit-screen"|"fit-width"
     * @property {number} scale - 0.0 to 1.0
     */

    /**
     * Set the zoom options.
     *
     * @param {Views.ReaderView.ZoomOptions} zoom Zoom options
     */
    this.setZoom = function (zoom) {
        // zoom only handled by fixed layout views
        if (self.isCurrentViewFixedLayout()) {
            _currentView.setZoom(zoom);
        }
    };

    /**
     * Returns the current view scale as a percentage
     *
     * @returns {number}
     */
    this.getViewScale = function () {
        if (self.isCurrentViewFixedLayout()) {
            return 100 * _currentView.getViewScale();
        }
        else {
            return 100;
        }
    };

    /**
     * Settings Data
     *
     * @typedef {object} Globals.Views.ReaderView.SettingsData
     * @property {number} fontSize - Font size as percentage
     * @property {(string|boolean)} syntheticSpread - "auto"|true|false
     * @property {(string|boolean)} scroll - "auto"|true|false
     * @property {boolean} doNotUpdateView - Indicates whether the view should be updated after the settings are applied
     * @property {boolean} mediaOverlaysEnableClick - Indicates whether media overlays are interactive on mouse clicks
     */

    /**
     * Updates reader view based on the settings specified in settingsData object
     *
     * @param {Globals.Views.ReaderView.SettingsData} settingsData Settings data
     * @fires Globals.Events.SETTINGS_APPLIED
     */
    this.updateSettings = function (settingsData) {

//console.debug("UpdateSettings: " + JSON.stringify(settingsData));

        _viewerSettings.update(settingsData);

        if (_mediaOverlayPlayer) {
            _mediaOverlayPlayer.setAutomaticNextSmil(_viewerSettings.mediaOverlaysAutomaticPageTurn ? true : false);
        }

        if (_currentView && !settingsData.doNotUpdateView) {

            var bookMark = _currentView.bookmarkCurrentPage();

            if (bookMark && bookMark.idref) {

                var wasPlaying = false;
                if (_currentView.isReflowable && _currentView.isReflowable()) {
                    wasPlaying = self.isPlayingMediaOverlay();
                    if (wasPlaying) {
                        self.pauseMediaOverlay();
                    }
                }

                var spineItem = _spine.getItemById(bookMark.idref);

                initViewForItem(spineItem, function (isViewChanged) {

                    if (!isViewChanged) {
                        _currentView.setViewSettings(_viewerSettings);
                    }

                    self.openSpineItemElementCfi(bookMark.idref, bookMark.contentCFI, self);

                    if (wasPlaying) {
                        self.playMediaOverlay();
                        // setTimeout(function()
                        // {
                        // }, 60);
                    }

                    self.emit(Globals.Events.SETTINGS_APPLIED);
                    return;
                });
            }
        }

        self.emit(Globals.Events.SETTINGS_APPLIED);
    };

    /**
     * Opens the next page.
     */
    this.openPageNext = function () {

        if (self.getCurrentViewType() === ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS) {
            _currentView.openPageNext(self);
            return;
        }

        var paginationInfo = _currentView.getPaginationInfo();

        if (paginationInfo.openPages.length == 0) {
            return;
        }

        var lastOpenPage = paginationInfo.openPages[paginationInfo.openPages.length - 1];

        if (lastOpenPage.spineItemPageIndex < lastOpenPage.spineItemPageCount - 1) {
            _currentView.openPageNext(self);
            return;
        }

        var currentSpineItem = _spine.getItemById(lastOpenPage.idref);

        var nextSpineItem = _spine.nextItem(currentSpineItem);

        if (!nextSpineItem) {
            return;
        }

        var openPageRequest = new PageOpenRequest(nextSpineItem, self);
        openPageRequest.setFirstPage();

        openPage(openPageRequest, 2);
    };

    /**
     * Opens the previous page.
     */
    this.openPagePrev = function () {

        if (self.getCurrentViewType() === ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS) {
            _currentView.openPagePrev(self);
            return;
        }

        var paginationInfo = _currentView.getPaginationInfo();

        if (paginationInfo.openPages.length == 0) {
            return;
        }

        var firstOpenPage = paginationInfo.openPages[0];

        if (firstOpenPage.spineItemPageIndex > 0) {
            _currentView.openPagePrev(self);
            return;
        }

        var currentSpineItem = _spine.getItemById(firstOpenPage.idref);

        var prevSpineItem = _spine.prevItem(currentSpineItem);

        if (!prevSpineItem) {
            return;
        }

        var openPageRequest = new PageOpenRequest(prevSpineItem, self);
        openPageRequest.setLastPage();

        openPage(openPageRequest, 1);
    };

    function getSpineItem(idref) {

        if (!idref) {

            console.log("idref parameter value missing!");
            return undefined;
        }

        var spineItem = _spine.getItemById(idref);
        if (!spineItem) {
            console.log("Spine item with id " + idref + " not found!");
            return undefined;
        }

        return spineItem;

    }

    /**
     * Opens the page of the spine item with element with provided cfi
     *
     * @param {string} idref Id of the spine item
     * @param {string} elementCfi CFI of the element to be shown
     * @param {object} initiator optional
     */
    this.openSpineItemElementCfi = function (idref, elementCfi, initiator) {

        var spineItem = getSpineItem(idref);

        if (!spineItem) {
            return false;
        }

        var pageData = new PageOpenRequest(spineItem, initiator);
        if (elementCfi) {
            pageData.setElementCfi(elementCfi);
        }

        openPage(pageData, 0);

        return true;
    };

    /**
     * Opens specified page index of the current spine item
     *
     * @param {number} pageIndex Zero based index of the page in the current spine item
     * @param {object} initiator optional
     */
    this.openPageIndex = function (pageIndex, initiator) {

        if (!_currentView) {
            return false;
        }

        var pageRequest;

        if (_package.isFixedLayout()) {
            var spineItem = _spine.items[pageIndex];
            if (!spineItem) {
                return false;
            }

            pageRequest = new PageOpenRequest(spineItem, initiator);
            pageRequest.setPageIndex(0);
        }
        else {

            var spineItems = this.getLoadedSpineItems();
            if (spineItems.length > 0) {
                pageRequest = new PageOpenRequest(spineItems[0], initiator);
                pageRequest.setPageIndex(pageIndex);
            }
        }

        openPage(pageRequest, 0);

        return true;
    };

    // dir: 0 => new or same page, 1 => previous, 2 => next
    function openPage(pageRequest, dir) {

        initViewForItem(pageRequest.spineItem, function (isViewChanged) {

            if (!isViewChanged) {
                _currentView.setViewSettings(_viewerSettings);
            }

            _currentView.openPage(pageRequest, dir);
        });
    }


    /**
     * Opens page index of the spine item with idref provided
     *
     * @param {string} idref Id of the spine item
     * @param {number} pageIndex Zero based index of the page in the spine item
     * @param {object} initiator optional
     */
    this.openSpineItemPage = function (idref, pageIndex, initiator) {

        var spineItem = getSpineItem(idref);

        if (!spineItem) {
            return false;
        }

        var pageData = new PageOpenRequest(spineItem, initiator);
        if (pageIndex) {
            pageData.setPageIndex(pageIndex);
        }

        openPage(pageData, 0);

        return true;
    };

    /**
     * Set CSS Styles to the reader container
     *
     * @param {Collections.StyleCollection} styles   Style collection containing selector property and declarations object
     * @param {boolean} doNotUpdateView                         Whether to update the view after the styles are applied.
     */
    this.setStyles = function (styles, doNotUpdateView) {

        var count = styles.length;

        for (var i = 0; i < count; i++) {
            if (styles[i].declarations) {
                _userStyles.addStyle(styles[i].selector, styles[i].declarations);
            }
            else {
                _userStyles.removeStyle(styles[i].selector);
            }
        }

        applyStyles(doNotUpdateView);

    };

    /**
     * Set CSS Styles to the content documents
     *
     * @param {Collections.StyleCollection} styles    Style collection containing selector property and declarations object
     */
    this.setBookStyles = function (styles) {

        var count = styles.length;

        for (var i = 0; i < count; i++) {
            _bookStyles.addStyle(styles[i].selector, styles[i].declarations);
        }

        if (_currentView) {
            _currentView.applyBookStyles();
        }

    };

    /**
     * Gets an element from active content documents based on a query selector.
     *
     * @param {Models.SpineItem} spineItem       The spine item object associated with an active content document
     * @param {string} selector                      The query selector
     * @returns {HTMLElement|undefined}
     */
    this.getElement = function (spineItem, selector) {

        if (_currentView) {
            return _currentView.getElement(spineItem, selector);
        }

        return undefined;
    };

    /**
     * Gets an element from active content documents based on an element id.
     *
     * @param {Models.SpineItem} spineItem      The spine item object associated with an active content document
     * @param {string} id                                  The element id
     * @returns {HTMLElement|undefined}
     */
    this.getElementById = function (spineItem, id) {

        if (_currentView) {
            return _currentView.getElementById(spineItem, id);
        }

        return undefined;
    };

    /**
     * Gets an element from active content documents based on a content CFI.
     *
     * @param {Models.SpineItem} spineItem     The spine item idref associated with an active content document
     * @param {string} cfi                                The partial content CFI
     * @param {string[]} [classBlacklist]
     * @param {string[]} [elementBlacklist]
     * @param {string[]} [idBlacklist]
     * @returns {HTMLElement|undefined}
     */
    this.getElementByCfi = function (spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        if (_currentView) {
            return _currentView.getElementByCfi(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist);
        }

        return undefined;

    };

    function applyStyles(doNotUpdateView) {

        Helpers.setStyles(_userStyles.getStyles(), _$el);

        if (_mediaOverlayPlayer)
            _mediaOverlayPlayer.applyStyles();

        if (doNotUpdateView) return;

        if (_currentView) {
            _currentView.applyStyles();
        }
    }

    /**
     * Opens a content url from a media player context
     *
     * @param {string} contentRefUrl
     * @param {string} sourceFileHref
     * @param offset
     */
    this.mediaOverlaysOpenContentUrl = function (contentRefUrl, sourceFileHref, offset) {
        _mediaOverlayPlayer.mediaOverlaysOpenContentUrl(contentRefUrl, sourceFileHref, offset);
    };


    /**
     * Opens the content document specified by the url
     *
     * @param {string} contentRefUrl Url of the content document
     * @param {string | undefined} sourceFileHref Url to the file that contentRefUrl is relative to. If contentRefUrl is
     * relative ot the source file that contains it instead of the package file (ex. TOC file) We have to know the
     * sourceFileHref to resolve contentUrl relative to the package file.
     * @param {object} initiator optional
     */
    this.openContentUrl = function (contentRefUrl, sourceFileHref, initiator) {

        var combinedPath = Helpers.ResolveContentRef(contentRefUrl, sourceFileHref);

        var hashIndex = combinedPath.indexOf("#");
        var hrefPart;
        var elementId;
        if (hashIndex >= 0) {
            hrefPart = combinedPath.substr(0, hashIndex);
            elementId = combinedPath.substr(hashIndex + 1);
        }
        else {
            hrefPart = combinedPath;
            elementId = undefined;
        }

        var spineItem = _spine.getItemByHref(hrefPart);
        if (!spineItem) {
            console.warn('spineItem ' + hrefPart + ' not found');
            // sometimes that happens because spine item's URI gets encoded,
            // yet it's compared with raw strings by `getItemByHref()` -
            // so we try to search with decoded link as well
            var decodedHrefPart = decodeURIComponent(hrefPart);
            spineItem = _spine.getItemByHref(decodedHrefPart);
            if (!spineItem) {
                console.warn('decoded spineItem ' + decodedHrefPart + ' missing as well');
                return false;
            }
        }

        return self.openSpineItemElementId(spineItem.idref, elementId, initiator);
    };

    /**
     * Opens the page of the spine item with element with provided cfi
     *
     * @param {string} idref Id of the spine item
     * @param {string} elementId id of the element to be shown
     * @param {object} initiator optional
     */
    this.openSpineItemElementId = function (idref, elementId, initiator) {

        var spineItem = _spine.getItemById(idref);
        if (!spineItem) {
            return false;
        }

        var pageData = new PageOpenRequest(spineItem, initiator);

        if (elementId) {
            pageData.setElementId(elementId);
        }


        openPage(pageData, 0);

        return true;
    };

    /**
     * Returns the bookmark associated with currently opened page.
     *
     * @returns {string} Serialized Globals.Models.BookmarkData object as JSON string.
     */
    this.bookmarkCurrentPage = function () {
        return JSON.stringify(_currentView.bookmarkCurrentPage());
    };

    /**
     * Resets all the custom styles set by setStyle callers at runtime
     */
    this.clearStyles = function () {

        _userStyles.resetStyleValues();
        applyStyles();
        _userStyles.clear();
    };

    /**
     * Resets all the custom styles set by setBookStyle callers at runtime
     */
    this.clearBookStyles = function () {

        if (_currentView) {

            _bookStyles.resetStyleValues();
            _currentView.applyBookStyles();
        }

        _bookStyles.clear();
    };

    /**
     * Returns true if media overlay available for one of the open pages.
     *
     * @returns {boolean}
     */
    this.isMediaOverlayAvailable = function () {

        if (!_mediaOverlayPlayer) return false;

        return _mediaOverlayPlayer.isMediaOverlayAvailable();
    };

    /*
     this.setMediaOverlaySkippables = function(items) {

     _mediaOverlayPlayer.setMediaOverlaySkippables(items);
     };

     this.setMediaOverlayEscapables = function(items) {

     _mediaOverlayPlayer.setMediaOverlayEscapables(items);
     };
     */

    /**
     * Starts/Stop playing media overlay on current page
     */
    this.toggleMediaOverlay = function () {

        _mediaOverlayPlayer.toggleMediaOverlay();
    };


    /**
     * Plays next fragment media overlay
     */
    this.nextMediaOverlay = function () {

        _mediaOverlayPlayer.nextMediaOverlay();

    };

    /**
     * Plays previous fragment media overlay
     */
    this.previousMediaOverlay = function () {

        _mediaOverlayPlayer.previousMediaOverlay();

    };

    /**
     * Plays next available fragment media overlay that is outside of the current escapable scope
     */
    this.escapeMediaOverlay = function () {

        _mediaOverlayPlayer.escape();
    };

    /**
     * End media overlay TTS
     * @todo Clarify what this does with Daniel.
     */
    this.ttsEndedMediaOverlay = function () {

        _mediaOverlayPlayer.onTTSEnd();
    };

    /**
     * Pause currently playing media overlays.
     */
    this.pauseMediaOverlay = function () {

        _mediaOverlayPlayer.pause();
    };

    /**
     * Start/Resume playback of media overlays.
     */
    this.playMediaOverlay = function () {

        _mediaOverlayPlayer.play();
    };

    /**
     * Determine if media overlays are currently playing.
     * @returns {boolean}
     */
    this.isPlayingMediaOverlay = function () {

        return _mediaOverlayPlayer.isPlaying();
    };

//
// should use Globals.Events.SETTINGS_APPLIED instead!
//    this.setRateMediaOverlay = function(rate) {
//
//        _mediaOverlayPlayer.setRate(rate);
//    };
//    this.setVolumeMediaOverlay = function(volume){
//
//        _mediaOverlayPlayer.setVolume(volume);
//    };

    /**
     * Get the first visible media overlay element from the currently active content document(s)
     * @returns {HTMLElement|undefined}
     */
    this.getFirstVisibleMediaOverlayElement = function () {

        if (_currentView) {
            return _currentView.getFirstVisibleMediaOverlayElement();
        }

        return undefined;
    };

    /**
     * Used to jump to an element to make sure it is visible when a content document is paginated
     * @param {string}      spineItemId   The spine item idref associated with an active content document
     * @param {HTMLElement} element       The element to make visible
     * @param [initiator]
     */
    this.insureElementVisibility = function (spineItemId, element, initiator) {

        if (_currentView) {
            _currentView.insureElementVisibility(spineItemId, element, initiator);
        }
    };

    var _resizeBookmark = null;
    var _resizeMOWasPlaying = false;

    function handleViewportResizeStart() {

        _resizeBookmark = null;
        _resizeMOWasPlaying = false;

        if (_currentView) {

            if (_currentView.isReflowable && _currentView.isReflowable()) {
                _resizeMOWasPlaying = self.isPlayingMediaOverlay();
                if (_resizeMOWasPlaying) {
                    self.pauseMediaOverlay();
                }
            }

            _resizeBookmark = _currentView.bookmarkCurrentPage(); // not self! (JSON string)
        }
    }

    function handleViewportResizeTick() {
        if (_currentView) {
            self.handleViewportResize(_resizeBookmark);
        }
    }

    function handleViewportResizeEnd() {
        //same as doing one final tick for now
        handleViewportResizeTick();

        if (_resizeMOWasPlaying) self.playMediaOverlay();
    }

    this.handleViewportResize = function (bookmarkToRestore) {
        if (!_currentView) return;

        var bookMark = bookmarkToRestore || _currentView.bookmarkCurrentPage(); // not self! (JSON string)

        if (_currentView.isReflowable && _currentView.isReflowable() && bookMark && bookMark.idref) {
            var spineItem = _spine.getItemById(bookMark.idref);

            initViewForItem(spineItem, function (isViewChanged) {
                self.openSpineItemElementCfi(bookMark.idref, bookMark.contentCFI, self);
                return;
            });
        }
        else {
            _currentView.onViewportResize();
        }
    };

    /**
     * Lets user to subscribe to iframe's window events
     *
     * @param {string} eventName              Event name.
     * @param {function} callback             Callback function.
     * @param {object} context                User specified data passed to the callback function.
     * @returns {undefined}
     */
    this.addIFrameEventListener = function (eventName, callback, context) {
        _iframeLoader.addIFrameEventListener(eventName, callback, context);
    };

    var BackgroundAudioTrackManager = function () {
        var _spineItemIframeMap = {};
        var _wasPlaying = false;

        var _callback_playPause = undefined;
        this.setCallback_PlayPause = function (callback) {
            _callback_playPause = callback;
        };

        var _callback_isAvailable = undefined;
        this.setCallback_IsAvailable = function (callback) {
            _callback_isAvailable = callback;
        };

        this.playPause = function (doPlay) {
            _playPause(doPlay);
        };

        var _playPause = function (doPlay) {
            if (_callback_playPause) {
                _callback_playPause(doPlay);
            }

            try {
                var $iframe = undefined;

                for (var prop in _spineItemIframeMap) {
                    if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;

                    var data = _spineItemIframeMap[prop];
                    if (!data || !data.active) continue;

                    if ($iframe) console.error("More than one active iframe?? (pagination)");

                    $iframe = data["$iframe"];
                    if (!$iframe) continue;

                    var $audios = $("audio", $iframe[0].contentDocument);

                    $.each($audios, function () {

                        var attr = this.getAttribute("epub:type") || this.getAttribute("type");

                        if (!attr) return true; // continue

                        if (attr.indexOf("ibooks:soundtrack") < 0 && attr.indexOf("media:soundtrack") < 0 && attr.indexOf("media:background") < 0) return true; // continue

                        if (doPlay && this.play) {
                            this.play();
                        }
                        else if (this.pause) {
                            this.pause();
                        }

                        return true; // continue (more than one track?)
                    });
                }
            }
            catch (err) {
                console.error(err);
            }
        };

        this.setPlayState = function (wasPlaying) {
            _wasPlaying = wasPlaying;
        };

        self.on(Globals.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem) {
            try {
                if (spineItem && spineItem.idref && $iframe && $iframe[0]) {
                    // console.log("CONTENT_DOCUMENT_LOADED");
                    // console.debug(spineItem.href);
                    // console.debug(spineItem.idref);

                    _spineItemIframeMap[spineItem.idref] = {"$iframe": $iframe, href: spineItem.href};
                }
            }
            catch (err) {
                console.error(err);
            }
        });

        self.on(Globals.Events.PAGINATION_CHANGED, function (pageChangeData) {
            // console.log("PAGINATION_CHANGED");
            // console.debug(pageChangeData);
            //
            // if (pageChangeData.spineItem)
            // {
            //     console.debug(pageChangeData.spineItem.href);
            //     console.debug(pageChangeData.spineItem.idref);
            // }
            // else
            // {
            //     //console.error(pageChangeData);
            // }
            //
            // if (pageChangeData.paginationInfo && pageChangeData.paginationInfo.openPages && pageChangeData.paginationInfo.openPages.length)
            // {
            //     for (var i = 0; i < pageChangeData.paginationInfo.openPages.length; i++)
            //     {
            //         console.log(pageChangeData.paginationInfo.openPages[i].idref);
            //     }
            // }

            var atLeastOne = false;

            try {
                for (var prop in _spineItemIframeMap) {
                    if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;

                    var isActive = pageChangeData.spineItem && pageChangeData.spineItem.idref === prop;

                    var isDisplayed = false;

                    if (pageChangeData.paginationInfo && pageChangeData.paginationInfo.openPages.length) {
                        var allSame = true;

                        for (var i = 0; i < pageChangeData.paginationInfo.openPages.length; i++) {
                            if (pageChangeData.paginationInfo.openPages[i].idref === prop) {
                                isDisplayed = true;
                            }
                            else {
                                allSame = false;
                            }
                        }

                        if (!isActive && allSame) isActive = true;
                    }

                    if (isActive || isDisplayed) {
                        var data = _spineItemIframeMap[prop];
                        if (!data) continue;

                        _spineItemIframeMap[prop]["active"] = isActive;

                        var $iframe = data["$iframe"];
                        var href = data.href;

                        var $audios = $("audio", $iframe[0].contentDocument);
                        $.each($audios, function () {

                            var attr = this.getAttribute("epub:type") || this.getAttribute("type");

                            if (!attr) return true; // continue

                            if (attr.indexOf("ibooks:soundtrack") < 0 && attr.indexOf("media:soundtrack") < 0 && attr.indexOf("media:background") < 0) return true; // continue

                            this.setAttribute("loop", "loop");
                            this.removeAttribute("autoplay");

                            // DEBUG!
                            //this.setAttribute("controls", "controls");

                            if (isActive) {
                                // DEBUG!
                                //$(this).css({border:"2px solid green"});
                            }
                            else {
                                if (this.pause) this.pause();

                                // DEBUG!
                                //$(this).css({border:"2px solid red"});
                            }

                            atLeastOne = true;

                            return true; // continue (more than one track?)
                        });

                        continue;
                    }
                    else {
                        if (_spineItemIframeMap[prop]) _spineItemIframeMap[prop]["$iframe"] = undefined;
                        _spineItemIframeMap[prop] = undefined;
                    }
                }
            }
            catch (err) {
                console.error(err);
            }

            if (_callback_isAvailable) {
                _callback_isAvailable(atLeastOne);
            }

            if (atLeastOne) {
                if (_wasPlaying) {
                    _playPause(true);
                }
                else {
                    _playPause(false); // ensure correct paused state
                }
            }
            else {
                _playPause(false); // ensure correct paused state
            }
        });

        self.on(Globals.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value) {
            if (!value.smilIndex) return;
            var package = self.package();
            var smil = package.media_overlay.smilAt(value.smilIndex);
            if (!smil || !smil.spineItemId) return;

            var needUpdate = false;
            for (var prop in _spineItemIframeMap) {
                if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;

                var data = _spineItemIframeMap[prop];
                if (!data) continue;

                if (data.active) {
                    if (prop !== smil.spineItemId) {
                        _playPause(false); // ensure correct paused state
                        data.active = false;
                        needUpdate = true;
                    }
                }
            }

            if (needUpdate) {
                for (var prop in _spineItemIframeMap) {
                    if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;

                    var data = _spineItemIframeMap[prop];
                    if (!data) continue;

                    if (!data.active) {
                        if (prop === smil.spineItemId) {
                            data.active = true;
                        }
                    }
                }

                if (_wasPlaying) {
                    _playPause(true);
                }
            }
        });
    };
    this.backgroundAudioTrackManager = new BackgroundAudioTrackManager();
};

/**
 * View Type
 * @typedef {object} Globals.Views.ReaderView.ViewType
 * @property {number} VIEW_TYPE_COLUMNIZED          Reflowable document view
 * @property {number} VIEW_TYPE_FIXED               Fixed layout document view
 * @property {number} VIEW_TYPE_SCROLLED_DOC        Scrollable document view
 * @property {number} VIEW_TYPE_SCROLLED_CONTINUOUS Continuous scrollable document view
 */
ReaderView.VIEW_TYPE_COLUMNIZED = 1;
ReaderView.VIEW_TYPE_FIXED = 2;
ReaderView.VIEW_TYPE_SCROLLED_DOC = 3;
ReaderView.VIEW_TYPE_SCROLLED_CONTINUOUS = 4;
return ReaderView;
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

define('readium-shared-js',['globalsSetup', 'plugins-controller', 'views/reader_view'], function (globalsSetup, PluginsController, ReaderView) {
//noop
});


require(["globalsSetup"]);

//# sourceMappingURL=readium-shared-js.js.map