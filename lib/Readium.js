
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
        return "0.8.0";
    },

    Models :    {
                    Smil: {}
                },
    Views : {
        ORIENTATION_LANDSCAPE: "orientation_landscape",
        ORIENTATION_PORTRAIT: "orientation_portrait"
    },
    Collections: {},
    Routers: {},
    Helpers: {},
    Events: {
                READER_INITIALIZED: "ReaderInitialized",
                // PAGINATION_CHANGED gets triggered on every page turnover. it includes spine information and such.
                PAGINATION_CHANGED: "PaginationChanged",
                SETTINGS_APPLIED: "SettingsApplied",
                CONTENT_DOCUMENT_LOAD_START: "ContentDocumentLoadStart",
                CONTENT_DOCUMENT_LOADED: "ContentDocumentLoaded",
                MEDIA_OVERLAY_STATUS_CHANGED: "MediaOverlayStatusChanged",
                MEDIA_OVERLAY_TTS_SPEAK: "MediaOverlayTTSSpeak",
                MEDIA_OVERLAY_TTS_STOP: "MediaOverlayTTSStop"
            },

    InternalEvents: {
        CURRENT_VIEW_PAGINATION_CHANGED: "CurrentViewPaginationChanged",
    }

};


//This is default implementation of reading system object that will be available for the publication's javascript to analyze at runtime
//To extend/modify/replace this object reading system should subscribe ReadiumSDK.Events.READER_INITIALIZED and apply changes in reaction to this event
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
};


_.extend(ReadiumSDK, Backbone.Events);



define("readiumSDK", ["backbone"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.readiumSDK;
    };
}(this)));

/**
 * @preserve JSizes - JQuery plugin v0.33
 *
 * Licensed under the revised BSD License.
 * Copyright 2008-2010 Bram Stein
 * All rights reserved.
 */
/*global jQuery*/
(function ($) {
	var num = function (value) {
			return parseInt(value, 10) || 0;
		};

	/**
	 * Sets or gets the values for min-width, min-height, max-width
	 * and max-height.
	 */
	$.each(['min', 'max'], function (i, name) {
		$.fn[name + 'Size'] = function (value) {
			var width, height;
			if (value) {
				if (value.width !== undefined) {
					this.css(name + '-width', value.width);
				}
				if (value.height !== undefined) {
					this.css(name + '-height', value.height);
				}
				return this;
			}
			else {
				width = this.css(name + '-width');
				height = this.css(name + '-height');
				// Apparently:
				//  * Opera returns -1px instead of none
				//  * IE6 returns undefined instead of none
				return {'width': (name === 'max' && (width === undefined || width === 'none' || num(width) === -1) && Number.MAX_VALUE) || num(width), 
						'height': (name === 'max' && (height === undefined || height === 'none' || num(height) === -1) && Number.MAX_VALUE) || num(height)};
			}
		};
	});

	/**
	 * Returns whether or not an element is visible.
	 */
	$.fn.isVisible = function () {
		return this.is(':visible');
	};

	/**
	 * Sets or gets the values for border, margin and padding.
	 */
	$.each(['border', 'margin', 'padding'], function (i, name) {
		$.fn[name] = function (value) {
			if (value) {
				if (value.top !== undefined) {
					this.css(name + '-top' + (name === 'border' ? '-width' : ''), value.top);
				}
				if (value.bottom !== undefined) {
					this.css(name + '-bottom' + (name === 'border' ? '-width' : ''), value.bottom);
				}
				if (value.left !== undefined) {
					this.css(name + '-left' + (name === 'border' ? '-width' : ''), value.left);
				}
				if (value.right !== undefined) {
					this.css(name + '-right' + (name === 'border' ? '-width' : ''), value.right);
				}
				return this;
			}
			else {
				return {top: num(this.css(name + '-top' + (name === 'border' ? '-width' : ''))),
						bottom: num(this.css(name + '-bottom' + (name === 'border' ? '-width' : ''))),
						left: num(this.css(name + '-left' + (name === 'border' ? '-width' : ''))),
						right: num(this.css(name + '-right' + (name === 'border' ? '-width' : '')))};
			}
		};
	});
}(jQuery));

define("jquerySizes", ["jquery"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.jquerySizes;
    };
}(this)));

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

        return !(rect.right() < this.left + tolerance ||
            rect.left > this.right() - tolerance ||
            rect.bottom() < this.top + tolerance ||
            rect.top > this.bottom() - tolerance);
    }
};


//This method treats multicolumn view as one long column and finds the rectangle of the element in this "long" column
//we are not using jQuery Offset() and width()/height() function because for multicolumn rendition_layout it produces rectangle as a bounding box of element that
// reflows between columns this is inconstant and difficult to analyze .
ReadiumSDK.Helpers.Rect.fromElement = function($element) {

    var e;
    if (_.isArray($element) || $element instanceof jQuery)
       e = $element[0];
    else
        e = $element;
    // TODODM this is somewhat hacky. Text (range?) elements don't have a position so we have to ask the parent.
    if (e.nodeType === 3)
    {
        e = $element.parent()[0];
    }


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

ReadiumSDK.Helpers.BeginsWith = function (str, suffix) {

    return str.indexOf(suffix) === 0;
};

ReadiumSDK.Helpers.RemoveFromString = function(str, toRemove) {

    var startIx = str.indexOf(toRemove);

    if(startIx == -1) {
        return str;
    }

    return str.substring(0, startIx) + str.substring(startIx + toRemove.length);
};

ReadiumSDK.Helpers.Margins = function(margin, border, padding) {

    this.margin = margin;
    this.border = border;
    this.padding = padding;

    this.left =  this.margin.left + this.border.left + this.padding.left;
    this.right = this.margin.right + this.border.right + this.padding.right;
    this.top = this.margin.top + this.border.top + this.padding.top;
    this.bottom = this.margin.bottom + this.border.bottom + this.padding.bottom;

    this.width = function() {
        return this.left + this.right;
    };

    this.height = function() {
        return this.top + this.bottom;
    }
};

ReadiumSDK.Helpers.Margins.fromElement = function($element) {
    return new this($element.margin(), $element.border(), $element.padding());
};

ReadiumSDK.Helpers.Margins.empty = function() {

    return new this({left:0, right:0, top:0, bottom: 0}, {left:0, right:0, top:0, bottom: 0}, {left:0, right:0, top:0, bottom: 0});

};

ReadiumSDK.Helpers.loadTemplate = function(name, params) {
    return ReadiumSDK.Helpers.loadTemplate.cache[name];
};

ReadiumSDK.Helpers.loadTemplate.cache = {
    "fixed_book_frame" : '<div id="fixed-book-frame" class="clearfix book-frame fixed-book-frame"></div>',
    "fixed_page_frame" : '<div class="fixed-page-frame"><iframe scrolling="no" class="iframe-fixed"></iframe></div>',
    "reflowable_book_frame" : '<div id="reflowable-book-frame" class="clearfix book-frame reflowable-book-frame"><div id="reflowable-content-frame" class="reflowable-content-frame"><iframe scrolling="no" id="epubContentIframe"></iframe></div></div>'
};

ReadiumSDK.Helpers.setStyles = function(styles, $element) {

    var count = styles.length;

    if(!count) {
        return;
    }

    for(var i = 0; i < count; i++) {
        var style = styles[i];
        if(style.selector) {
            $(style.selector, $element).css(style.declarations);
        }
        else {
            $element.css(style.declarations);
        }
    }

};

ReadiumSDK.Helpers.getOrientation = function($viewport) {

    var viewportWidth = $viewport.width();
    var viewportHeight = $viewport.height();

    if(!viewportWidth || !viewportHeight) {
        return undefined;
    }

    return viewportWidth >= viewportHeight ? ReadiumSDK.Views.ORIENTATION_LANDSCAPE : ReadiumSDK.Views.ORIENTATION_PORTRAIT;
};

ReadiumSDK.Helpers.isRenditionSpreadPermittedForItem = function(item, orientation) {

    return  !item.rendition_spread
        ||  item.rendition_spread == ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_BOTH
        ||  item.rendition_spread == ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_AUTO
        ||  (item.rendition_spread == ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_LANDSCAPE
        && orientation == ReadiumSDK.Views.ORIENTATION_LANDSCAPE)
        ||  (item.rendition_spread == ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_PORTRAIT
        && orientation == ReadiumSDK.Views.ORIENTATION_PORTRAIT );
};

ReadiumSDK.Helpers.escapeJQuerySelector = function(sel) {
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
    // TESTS BELOW ALL WORKING FINE :)
    // (RegExp typos are hard to spot!)
    // escapeSelector('!');
    // escapeSelector('"');
    // escapeSelector('#');
    // escapeSelector('$');
    // escapeSelector('%');
    // escapeSelector('&');
    // escapeSelector("'");
    // escapeSelector('(');
    // escapeSelector(')');
    // escapeSelector('*');
    // escapeSelector('+');
    // escapeSelector(',');
    // escapeSelector('.');
    // escapeSelector('/');
    // escapeSelector(':');
    // escapeSelector(';');
    // escapeSelector('<');
    // escapeSelector('=');
    // escapeSelector('>');
    // escapeSelector('?');
    // escapeSelector('@');
    // escapeSelector('[');
    // escapeSelector('\\');
    // escapeSelector(']');
    // escapeSelector('^');
    // escapeSelector('`');
    // escapeSelector('{');
    // escapeSelector('|');
    // escapeSelector('}');
    // escapeSelector('~');
define("helpers", ["readiumSDK","jquerySizes"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.helpers;
    };
}(this)));

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

    var self = this;
    this.isSyntheticSpread = true;
    this.fontSize = 100;
    this.columnGap = 20;
    this.mediaOverlaysSkipSkippables = false;
    this.mediaOverlaysEscapeEscapables = true;

    this.mediaOverlaysSkippables = [];
    this.mediaOverlaysEscapables = [];
    
    this.mediaOverlaysEnableClick = true;
    this.mediaOverlaysRate = 1;
    this.mediaOverlaysVolume = 100;
    
    this.mediaOverlaysSynchronizationGranularity = undefined;
    
    this.isScrollViewDoc = false;
    this.isScrollViewContinuous = false;

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

        mapProperty("isSyntheticSpread", settingsData);
        mapProperty("columnGap", settingsData);
        mapProperty("fontSize", settingsData);
        mapProperty("mediaOverlaysSkipSkippables", settingsData);
        mapProperty("mediaOverlaysEscapeEscapables", settingsData);
        mapProperty("mediaOverlaysSkippables", settingsData, buildArray);
        mapProperty("mediaOverlaysEscapables", settingsData, buildArray);
        mapProperty("mediaOverlaysEnableClick", settingsData);
        mapProperty("mediaOverlaysRate", settingsData);
        mapProperty("mediaOverlaysVolume", settingsData);
        mapProperty("mediaOverlaysSynchronizationGranularity", settingsData);
        mapProperty("isScrollViewDoc", settingsData);
        mapProperty("isScrollViewContinuous", settingsData);
    };

    this.update(settingsData);
};
define("viewerSettings", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.viewerSettings;
    };
}(this)));

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


ReadiumSDK.Models.Style = function(selector, declarations) {

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
define("style", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.style;
    };
}(this)));

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

ReadiumSDK.Collections.StyleCollection = function() {

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
            style = new ReadiumSDK.Models.Style(selector, declarations);
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
define("styleCollection", ["readiumSDK","style"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.styleCollection;
    };
}(this)));

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

    var self = this;

    this.idref = itemData.idref;
    this.href = itemData.href;

    this.page_spread = itemData.page_spread;
    this.rendition_spread = itemData.rendition_spread;

    this.rendition_layout = itemData.rendition_layout;
    this.rendition_flow = itemData.rendition_flow;
    this.media_overlay_id = itemData.media_overlay_id;

    this.media_type = itemData.media_type;

    this.index = index;
    this.spine = spine;

    validateSpread();

    this.isLeftPage = function() {
        return this.page_spread == ReadiumSDK.Models.SpineItem.SPREAD_LEFT;
    };

    this.setSpread = function(spread) {
        this.page_spread = spread;

        validateSpread();
    };

    this.isRenditionSpreadAllowed = function() {
        return !this.rendition_spread || this.rendition_spread != ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_NONE;
    };

    function validateSpread() {

        if(!self.page_spread) {
            return;
        }

        if( self.page_spread != ReadiumSDK.Models.SpineItem.SPREAD_LEFT &&
            self.page_spread != ReadiumSDK.Models.SpineItem.SPREAD_RIGHT &&
            self.page_spread != ReadiumSDK.Models.SpineItem.SPREAD_CENTER ) {

            console.error(self.page_spread + " is not a recognized spread type");
        }

    }

    this.isRightPage = function() {
        return this.page_spread == ReadiumSDK.Models.SpineItem.SPREAD_RIGHT;
    };

    this.isCenterPage = function() {
        return this.page_spread == ReadiumSDK.Models.SpineItem.SPREAD_CENTER;
    };

    this.isReflowable = function() {
        return !this.isFixedLayout();
    };

    this.isFixedLayout = function() {
        return this.rendition_layout ? this.rendition_layout === "pre-paginated" : this.spine.package.isFixedLayout();
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

    this.isScrolledContinuous = function() {

        return isPropertyValueSetForItemOrPackage("rendition_flow", ReadiumSDK.Models.SpineItem.RENDITION_FLOW_SCROLLED_CONTINUOUS);
    };

    this.isScrolledDoc = function() {

        return isPropertyValueSetForItemOrPackage("rendition_flow", ReadiumSDK.Models.SpineItem.RENDITION_FLOW_SCROLLED_DOC);
    };
};

ReadiumSDK.Models.SpineItem.SPREAD_LEFT = "page-spread-left";
ReadiumSDK.Models.SpineItem.SPREAD_RIGHT = "page-spread-right";
ReadiumSDK.Models.SpineItem.SPREAD_CENTER = "page-spread-center";

ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_NONE = "none";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_LANDSCAPE = "landscape";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_PORTRAIT = "portrait";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_BOTH = "both";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_AUTO = "auto";

ReadiumSDK.Models.SpineItem.RENDITION_FLOW_PAGINATED = "paginated";
ReadiumSDK.Models.SpineItem.RENDITION_FLOW_SCROLLED_CONTINUOUS = "scrolled-continuous";
ReadiumSDK.Models.SpineItem.RENDITION_FLOW_SCROLLED_DOC = "scrolled-doc";
ReadiumSDK.Models.SpineItem.RENDITION_FLOW_AUTO = "auto";

ReadiumSDK.Models.SpineItem.alternateSpread = function(spread) {

    if(spread === ReadiumSDK.Models.SpineItem.SPREAD_LEFT) {
        return ReadiumSDK.Models.SpineItem.SPREAD_RIGHT;
    }

    if(spread === ReadiumSDK.Models.SpineItem.SPREAD_RIGHT) {
        return ReadiumSDK.Models.SpineItem.SPREAD_LEFT;
    }

    return spread;

};


define("spineItem", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.spineItem;
    };
}(this)));

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

ReadiumSDK.Models.Spine = function(epubPackage, spineDTO) {

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
     * @type {ReadiumSDK.Models.Package}
     *
     */
    this.package = epubPackage;



    this.prevItem = function(item) {

        if(isValidIndex(item.index - 1)) {
            return this.items[item.index - 1];
        }

        return undefined;
    };

    this.nextItem = function(item){

        if(isValidIndex(item.index + 1)) {
            return this.items[item.index + 1];
        }

        return undefined;
    };

    this.getItemUrl = function(item) {

        self.package.resolveRelativeUrl(item.href);

    };

    function isValidIndex(index) {

        return index >= 0 && index < self.items.length;
    }

    this.first = function() {
        return self.items[0];
    };

    this.last = function() {
        return self.items[self.items.length - 1];
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
        var baseSide = self.isLeftToRight() ? ReadiumSDK.Models.SpineItem.SPREAD_LEFT : ReadiumSDK.Models.SpineItem.SPREAD_RIGHT;

        for(var i = 0; i < len; i++) {

            var spineItem = self.items[i];
            if( !spineItem.page_spread) {

                var spread = isFirstPageInSpread ? baseSide : ReadiumSDK.Models.SpineItem.alternateSpread(baseSide);
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
            var item = new ReadiumSDK.Models.SpineItem(spineDTO.items[i], i, this);
            this.items.push(item);
        }

        updateSpineItemsSpread();
    }

};

define("spine", ["readiumSDK","spineItem"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.spine;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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



/////////////////////////
//SmilNode

ReadiumSDK.Models.Smil.SmilNode = function(parent) {

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

ReadiumSDK.Models.Smil.TimeContainerNode = function(parent) {

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

ReadiumSDK.Models.Smil.TimeContainerNode.prototype = new ReadiumSDK.Models.Smil.SmilNode();

//////////////////////////
//MediaNode

ReadiumSDK.Models.Smil.MediaNode = function(parent) {

    this.parent = parent;
    
    this.src = "";
};

ReadiumSDK.Models.Smil.MediaNode.prototype = new ReadiumSDK.Models.Smil.SmilNode();

////////////////////////////
//SeqNode

ReadiumSDK.Models.Smil.SeqNode = function(parent) {

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

ReadiumSDK.Models.Smil.SeqNode.prototype = new ReadiumSDK.Models.Smil.TimeContainerNode();

//////////////////////////
//ParNode

ReadiumSDK.Models.Smil.ParNode = function(parent) {

    this.parent = parent;
    
    this.children = [];
    this.nodeType = "par";
    this.text = undefined;
    this.audio = undefined;
    this.element = undefined;
    

    this.getFirstSeqAncestorWithEpubType = function(epubtype) {
        if (!epubtype) return undefined;
        
        var parent = this.parent;
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

ReadiumSDK.Models.Smil.ParNode.prototype = new ReadiumSDK.Models.Smil.TimeContainerNode();

//////////////////////////
//TextNode

ReadiumSDK.Models.Smil.TextNode = function(parent) {

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
        var ref = ReadiumSDK.Helpers.ResolveContentRef(src, smilData.href);
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

ReadiumSDK.Models.Smil.TextNode.prototype = new ReadiumSDK.Models.Smil.MediaNode();

///////////////////////////
//AudioNode

ReadiumSDK.Models.Smil.AudioNode = function(parent) {

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

ReadiumSDK.Models.Smil.AudioNode.prototype = new ReadiumSDK.Models.Smil.MediaNode();

//////////////////////////////
//SmilModel

ReadiumSDK.Models.SmilModel = function() {

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

ReadiumSDK.Models.SmilModel.fromSmilDTO = function(smilDTO, mo) {

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

    var smilModel = new ReadiumSDK.Models.SmilModel();
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
    
    smilModel.mo = mo; //ReadiumSDK.Models.MediaOverlay

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

            node = new ReadiumSDK.Models.Smil.SeqNode(parent);

            safeCopyProperty("textref", nodeDTO, node, true);
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

            node = new ReadiumSDK.Models.Smil.ParNode(parent);

            safeCopyProperty("id", nodeDTO, node);
            safeCopyProperty("epubtype", nodeDTO, node);

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
                var fakeAudio = new ReadiumSDK.Models.Smil.AudioNode(node);

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

            node = new ReadiumSDK.Models.Smil.TextNode(parent);

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

            node = new ReadiumSDK.Models.Smil.AudioNode(parent);

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

define("smilModel", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.smilModel;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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


ReadiumSDK.Models.MediaOverlay = function(package) {

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

ReadiumSDK.Models.MediaOverlay.fromDTO = function(moDTO, package) {

    var mo = new ReadiumSDK.Models.MediaOverlay(package);

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
        var smilModel = ReadiumSDK.Models.SmilModel.fromSmilDTO(moDTO.smil_models[i], mo);
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



define("mediaOverlay", ["readiumSDK","smilModel"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.mediaOverlay;
    };
}(this)));

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

ReadiumSDK.Models.Package = function(packageData){

    var self = this;

    this.spine = undefined;
    this.rendition_layout = undefined;
    this.rootUrl = undefined;
    this.rootUrlMO = undefined;
    this.media_overlay = undefined;
    this.rendition_flow = undefined;

    this.resolveRelativeUrlMO = function(relativeUrl) {

        if(self.rootUrlMO && self.rootUrlMO.length > 0) {

            if(ReadiumSDK.Helpers.EndsWith(self.rootUrlMO, "/")){
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

            if(ReadiumSDK.Helpers.EndsWith(self.rootUrl, "/")){
                return self.rootUrl + relativeUrl;
            }
            else {
                return self.rootUrl + "/" + relativeUrl;
            }
        }

        return relativeUrl;
    };

    this.isFixedLayout = function() {
        return self.rendition_layout === "pre-paginated";
    };

    this.isReflowable = function() {
        return !self.isFixedLayout();
    };
    

    if(packageData) {

        this.rootUrl = packageData.rootUrl;
        this.rootUrlMO = packageData.rootUrlMO;

        this.rendition_layout = packageData.rendition_layout;

        if(!this.rendition_layout) {
            this.rendition_layout = "reflowable";
        }
        
        this.rendition_flow = packageData.rendition_flow;
        
        this.spine = new ReadiumSDK.Models.Spine(this, packageData.spine);

        this.media_overlay = ReadiumSDK.Models.MediaOverlay.fromDTO(packageData.media_overlay, this);
        
    }
    
};

define("package", ["readiumSDK","spine","mediaOverlay"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.package;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck, Andrey Kavarma
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


(function(){

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
    }

    ReadiumSDK.Views.AudioPlayer = function(onStatusChanged, onPositionChanged, onAudioEnded, onAudioPlay, onAudioPause)
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
                console.debug("this.play()");
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
                console.debug("this.pause()");
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
                            console.debug("interval timer skipped (still seeking...)");
                        }
                                         
                        _intervalTimerSkips++;
                        if (_intervalTimerSkips > 1000)
                        {
                            _intervalTimerSkips = 0;
                            stopTimer();
                        }
                        return;
                    }
    
                    var currentTime = _audioElement.currentTime;
    
    //                if (DEBUG)
    //                {
    //                    console.debug("currentTime: " + currentTime);
    //                }
    
                    onPositionChanged(currentTime, 1);
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
                console.debug("this.reset()");
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
        }
    
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
        function onReadyToSeek(event)
        {
            $(_audioElement).off(_readyEvent, onReadyToSeek);
            
            if (DEBUG)
            {
                console.debug("onReadyToSeek #" + event.data.playId);
            }
            playSeekCurrentTime(event.data.seekBegin, event.data.playId, true);
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
        var _seekedEvent1 = _iOS ? "progress" : "seeked";
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
    
                    if (DEBUG)
                    {
                        console.debug("onSeeked() fail => first retry, EV: " + _seekedEvent2);
                    }
    
                    event.data.isNewSrc = false;
                    $(_audioElement).on(_seekedEvent2, event.data, onSeeked);
                }
                else
                {
                    event.data.seekRetries--;
    
                    if (DEBUG)
                    {
                        console.debug("onSeeked() FAIL => retry again (timeout)");
                    }
    
                    setTimeout(function()
                    {
                        onSeeked(event);
                    }, 50);
                }
    
                setTimeout(function()
                {
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
                    console.debug("onSeeked() OKAY => play!");
                }
    
                event.data.seekRetries = undefined;
    
                self.play();
    
                _audioElement.moSeeking = undefined;
            }
        }
    };

})()
;
define("audioPlayer", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.audioPlayer;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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

ReadiumSDK.Views.MediaOverlayElementHighlighter = function(reader) {

    var DEFAULT_MO_ACTIVE_CLASS = "mo-active-default";
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
            if ($userStyle[0].ownerDocument === $element[0].ownerDocument)
            {
                return;
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
        if (_highlightedElementPar !== seq)
        {
            $(_highlightedElementPar.element).addClass("mo-sub-sync");
        }
        
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
        else
        {
            try
            {
                //var id = $hel.data("mediaOverlayData").par.getSmil().spineItemId;
                var id = par.getSmil().spineItemId;
                _reader.addHighlight(id, par.cfi.partialRangeCfi, HIGHLIGHT_ID,
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
            else
            {
                try
                {
                    _reader.removeHighlight(HIGHLIGHT_ID);
        
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
            if (_highlightedElementPar !== seq)
            {
                $(_highlightedElementPar.element).removeClass("mo-sub-sync");
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
        if (sync)
        {
            var element = par.element || (par.cfi ? par.cfi.cfiTextParent : undefined);
            if (!element)
            {
                console.error("adjustParToSeqSyncGranularity !element ???");
                return par; // should never happen!
            }

            var seq = par.getFirstSeqAncestorWithEpubType(sync);
            if (seq && seq.element)
            {
                return seq;
            }
        }
        
        return par;
    };
};
define("mediaOverlayElementHighlighter", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.mediaOverlayElementHighlighter;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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

ReadiumSDK.Views.MediaOverlayPlayer = function(reader, onStatusChanged) {


    var _smilIterator = undefined;

    var _audioPlayer = new ReadiumSDK.Views.AudioPlayer(onStatusChanged, onAudioPositionChanged, onAudioEnded, onPlay, onPause);

    var _ttsIsPlaying = false;
    var _currentTTS = undefined;
    var _enableHTMLSpeech = true && window.speechSynthesis !== undefined; // set to false to force "native" platform TTS engine, rather than HTML Speech API
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
    var _elementHighlighter = new ReadiumSDK.Views.MediaOverlayElementHighlighter(reader);

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
    //ReadiumSDK.
    reader.on(ReadiumSDK.Events.SETTINGS_APPLIED, this.onSettingsApplied, this);

    /*
    var lastElement = undefined;
    var lastElementColor = "";
    */

    var _wasPlayingAtDocLoadStart = false;
    this.onDocLoadStart = function() {
        // 1) ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START
        // (maybe 2-page fixed-layout or reflowable spread == 2 documents == 2x events)
        // MOPLayer.onDocLoad()
        
        // 2) ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED
        // (maybe 2-page fixed-layout or reflowable spread == 2 documents == 2x events)
        //_mediaOverlayDataInjector.attachMediaOverlayData($iframe, spineItem, _viewerSettings);
        
        // 3) ReadiumSDK.Events.PAGINATION_CHANGED (layout finished, notified before rest of app, just once)
        // MOPLayer.onPageChanged()

        var wasPlaying = self.isPlaying();
        if (wasPlaying)
        {
            _wasPlayingAtDocLoadStart = true;
            self.pause();
        }
    };
    
    this.onPageChanged = function(paginationData) {

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
                    element = reader.getElement(spineItem, (paginationData.initiator == self && !paginationData.elementId) ? "body" : ("#" + ReadiumSDK.Helpers.escapeJQuerySelector(paginationData.elementId)));
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
                    if (wasPlaying)
                    {
                        paginationData.elementIdResolved = element;
                        self.toggleMediaOverlayRefresh(paginationData);
                    }
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
            if(!wasPlaying)
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
            _smilIterator = new ReadiumSDK.Models.SmilIterator(parSmil);
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

            var audioContentRef = ReadiumSDK.Helpers.ResolveContentRef(_smilIterator.currentPar.audio.src, _smilIterator.smil.href);

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

            _smilIterator = new ReadiumSDK.Models.SmilIterator(nextSmil);
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
        
            nextSmil(goNext);
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
                console.Log("MO SKIP: " + parent.epubtype);

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
                            nextSmil(goNext);
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
        var BOUNDARY_PUNCTUATION = [',', ';', '.', '-', 'Ð', 'Ñ', '?', '!'];
        var IGNORABLE_PUNCTUATION = ['"', '\'', 'Ò', 'Ó', 'Ô', 'Õ'];

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
            reader.trigger(ReadiumSDK.Events.MEDIA_OVERLAY_TTS_SPEAK, {tts: txt}); // resume if txt == undefined
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
            reader.trigger(ReadiumSDK.Events.MEDIA_OVERLAY_TTS_STOP, undefined);
            return;
        }

//console.debug("TTS pause");
        window.speechSynthesis.pause();
    };

    var _timerTick = undefined;

    function onPlay() {
        onPause();

        _timerTick = setInterval(function() {

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

            var smilIterator = new ReadiumSDK.Models.SmilIterator(smil);
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

        }, 1500);
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

                    reader.insureElementVisibility(_smilIterator.currentPar.element, self);
                }
            
                return;
            
            } else if (_smilIterator.currentPar.cfi) {

                if (!_elementHighlighter.isCfiHighlighted(_smilIterator.currentPar))
                {
                    _elementHighlighter.highlightCfi(_smilIterator.currentPar, _package.media_overlay.activeClass, _package.media_overlay.playbackActiveClass);

                    reader.insureElementVisibility(_smilIterator.currentPar.cfi.cfiTextParent, self);
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
        var textRelativeRef = ReadiumSDK.Helpers.ResolveContentRef(_smilIterator.currentPar.text.srcFile, _smilIterator.smil.href);
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

    this.toggleMediaOverlayRefresh = function(paginationData)
    {

//console.debug("moData SMIL: " + moData.par.getSmil().href + " // " + + moData.par.getSmil().id);


        var spineItems = reader.getLoadedSpineItems();

        //paginationData.pageProgressionDirection === "rtl"
        var rtl = reader.spine().isRightToLeft();

        //paginationData.spineItemCount

        //paginationData.openPages
        //{spineItemPageIndex: , spineItemPageCount: , idref: , spineItemIndex: }

        var playingPar = undefined;
        var wasPlaying = self.isPlaying();
        if(wasPlaying && _smilIterator)
        {
            self.pause();
            playingPar = _smilIterator.currentPar;
        }

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
                    element = reader.getElement(spineItem, "#" + ReadiumSDK.Helpers.escapeJQuerySelector(id));
                }
                else if (spineItem.isFixedLayout())
                {
                    element = reader.getElement(spineItem, "body");
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
            var depthFirstTraversal = function(elements)
            {
                if (!elements)
                {
                    return false;
                }

                for (var i = 0; i < elements.length; i++)
                {
                    var d = $(elements[i]).data("mediaOverlayData");
                    if (d)
                    {
                        moData = d;
                        return true;
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
            _smilIterator = new ReadiumSDK.Models.SmilIterator(parSmil);
        }
        else
        {
            _smilIterator.reset();
        }

        if (id)
        {
            _smilIterator.findTextId(id);
        }
        else
        {
            _smilIterator.goToPar(zPar);
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
};
define("mediaOverlayPlayer", ["readiumSDK","mediaOverlay","audioPlayer","mediaOverlayElementHighlighter"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.mediaOverlayPlayer;
    };
}(this)));

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
ReadiumSDK.Models.PageOpenRequest = function(spineItem, initiator) {

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

define("pageOpenRequest", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.pageOpenRequest;
    };
}(this)));

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
        "range": parse_range,
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
          result1 = parse_range();
          if (result1 === null) {
            result1 = parse_path();
          }
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
          result0 = (function(offset, fragmentVal) { 
                
                return { type:"CFIAST", cfiString:fragmentVal };
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_range() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_indexStep();
        if (result0 !== null) {
          result1 = parse_local_path();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result2 = ",";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_local_path();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 44) {
                  result4 = ",";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\",\"");
                  }
                }
                if (result4 !== null) {
                  result5 = parse_local_path();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
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
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepVal, localPathVal, rangeLocalPath1Val, rangeLocalPath2Val) {
        
                return { type:"range", path:stepVal, localPath:localPathVal, range1:rangeLocalPath1Val, range2:rangeLocalPath2Val };
          })(pos0, result0[0], result0[1], result0[3], result0[5]);
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
        
                return { type:"path", path:stepVal, localPath:localPathVal }; 
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
                if (result0 === null) {
                  if (input.charCodeAt(pos) === 46) {
                    result0 = ".";
                    pos++;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\".\"");
                    }
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

		var $injectedElement;
		// Get the first node, this should be a text node
		if ($currNode === undefined) {

			throw EPUBcfi.NodeTypeError($currNode, "expected a terminating node, or node list");
		} 
		else if ($currNode.length === 0) {

			throw EPUBcfi.TerminusError("Text", "Text offset:" + textOffset, "no nodes found for termination condition");
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
            }
        }

        throw EPUBcfi.TerminusError("Text", "Text offset:" + textOffset, "The offset exceeded the length of the text");
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
					if (this.nodeType === Node.TEXT_NODE) {
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

					if (this.nodeType === Node.TEXT_NODE) {
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
			throw EPUBcfi.OutOfRangeError(logicalTargetTextNodeIndex, currLogicalTextNodeIndex, "Index out of range");
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

        var $packageDocument = $(packageDocument);
        var decodedCFI = decodeURI(CFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);

        if (!CFIAST || CFIAST.type !== "CFIAST") { 
            throw EPUBcfi.NodeTypeError(CFIAST, "expected CFI AST root node");
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
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
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
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
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
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
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

    getRangeTargetElements : function (rangeCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(rangeCFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
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

        // Return the element at the end of the CFI
        return {
            startElement : $range1TargetElement[0],
            endElement : $range2TargetElement[0]
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
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
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
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);
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
    //   to inject content into the found node. This will not always be the case, and different types of interpretation
    //   are probably desired. 
    interpretTextTerminusNode : function (terminusNode, $currElement, elementToInject) {

        if (terminusNode === undefined || terminusNode.type !== "textTerminus") {

            throw EPUBcfi.NodeTypeError(terminusNode, "expected text terminus node");
        }

        var $injectedElement = EPUBcfi.CFIInstructions.textTermination(
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

                return EPUBcfi.CFIInstructions.retrieveItemRefHref($currElement, $packageDocument);
            }
        }

        return undefined;
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

    generateCharOffsetRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var docRange;
        var commonAncestor;
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
            range1CFI = this.createCFIElementSteps($(rangeStartElement).parent(), commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range1OffsetStep;

            // Generate terminating offset and range 2
            range2OffsetStep = this.createCFITextNodeStep($(rangeEndElement), endOffset, classBlacklist, elementBlacklist, idBlacklist);
            range2CFI = this.createCFIElementSteps($(rangeEndElement).parent(), commonAncestor, classBlacklist, elementBlacklist, idBlacklist) + range2OffsetStep;

            // Generate shared component
            commonCFIComponent = this.createCFIElementSteps($(commonAncestor), "html", classBlacklist, elementBlacklist, idBlacklist);

            // Return the result
            return commonCFIComponent.substring(1, commonCFIComponent.length) + "," + range1CFI + "," + range2CFI;
        }
    },

    generateElementRangeComponent : function (rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist) {

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
        docRange.setStart(rangeStartElement);
        docRange.setEnd(rangeEndElement);
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

    validateStartElement : function (startElement) {

        if (!startElement) {
            throw new EPUBcfi.NodeTypeError(startElement, "CFI target element is undefined");
        }

        if (!(startElement.nodeType && startElement.nodeType === 1)) {
            throw new EPUBcfi.NodeTypeError(startElement, "CFI target element is not an HTML element");
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
        $contentsExcludingMarkers = EPUBcfi.CFIInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node index in the parent list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var indexOfFirstInSequence;
        var textNodeOnlyIndex = 0;
        var characterOffsetSinceUnsplit = 0;
        var finalCharacterOffsetInSequence = 0;
        $.each($contentsExcludingMarkers, 
            function (index) {

                // If this is a text node, check if it matches and return the current index
                if (this.nodeType === Node.TEXT_NODE) {

                    if (this === $startTextNode[0]) {

                        // Set index as the first in the adjacent sequence of text nodes, or as the index of the current node if this 
                        //   node is a standard one sandwiched between two element nodes. 
                        if (prevNodeWasTextNode) {
                            indexOfTextNode = indexOfFirstInSequence;
                            finalCharacterOffsetInSequence = characterOffsetSinceUnsplit;
                        }
                        else {
                            indexOfTextNode = textNodeOnlyIndex;
                        }
                        
                        // Break out of .each loop
                        return false; 
                    }

                    // Save this index as the first in sequence of adjacent text nodes, if it is not already set by this point
                    prevNodeWasTextNode = true;
                    characterOffsetSinceUnsplit = characterOffsetSinceUnsplit + this.length
                    if (indexOfFirstInSequence === undefined) {
                        indexOfFirstInSequence = textNodeOnlyIndex;
                        textNodeOnlyIndex = textNodeOnlyIndex + 1;
                    }
                }
                // This node is not a text node
                else {
                    prevNodeWasTextNode = false;
                    indexOfFirstInSequence = undefined;
                    characterOffsetSinceUnsplit  = 0;
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

    var interpreter = EPUBcfi.Interpreter;
    var generator = EPUBcfi.Generator;
    var instructions = EPUBcfi.CFIInstructions;

        if (global.EPUBcfi) {

        throw new Error('The EPUB cfi library has already been defined');
    }
    else {

        global.EPUBcfi = EPUBcfi;
    }

    // The public interface
    var CFIInstructions = EPUBcfi.CFIInstructions;
    var Parser = EPUBcfi.Parser;
    var OError = EPUBcfi.OutOfRangeError;
    var Interp = EPUBcfi.Interpreter;
    
    var NodeTypeError = EPUBcfi.NodeTypeError;
    var OutOfRangeError = EPUBcfi.OutOfRangeError;
    var TerminusError = EPUBcfi.TerminusError;
    var CFIAssertionError = EPUBcfi.CFIAssertionError;
    
    global.EPUBcfi = EPUBcfi =  {
        getContentDocHref : function (CFI, packageDocument) {
            return interpreter.getContentDocHref(CFI, packageDocument);
        },
        injectElement : function (CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist) {
            return interpreter.injectElement(CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist);
        },
        getTargetElement : function (CFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return interpreter.getTargetElement(CFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        getTargetElementWithPartialCFI : function (contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return interpreter.getTargetElementWithPartialCFI(contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        getTextTerminusInfoWithPartialCFI : function (contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return interpreter.getTextTerminusInfoWithPartialCFI(contentDocumentCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateCharacterOffsetCFIComponent : function (startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {
            return generator.generateCharacterOffsetCFIComponent(startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateElementCFIComponent : function (startElement, classBlacklist, elementBlacklist, idBlacklist) {
            return generator.generateElementCFIComponent(startElement, classBlacklist, elementBlacklist, idBlacklist);
        },
        generatePackageDocumentCFIComponent : function (contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return generator.generatePackageDocumentCFIComponent(contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generatePackageDocumentCFIComponentWithSpineIndex : function (spineIndex, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return generator.generatePackageDocumentCFIComponentWithSpineIndex(spineIndex, packageDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateCompleteCFI : function (packageDocumentCFIComponent, contentDocumentCFIComponent) {
            return generator.generateCompleteCFI(packageDocumentCFIComponent, contentDocumentCFIComponent);
        },
        injectElementAtOffset : function ($textNodeList, textOffset, elementToInject) {
            return instructions.injectCFIMarkerIntoText($textNodeList, textOffset, elementToInject);
        },
        injectRangeElements : function (rangeCFI, contentDocument, startElementToInject, endElementToInject, classBlacklist, elementBlacklist, idBlacklist) {
            return interpreter.injectRangeElements(rangeCFI, contentDocument, startElementToInject, endElementToInject, classBlacklist, elementBlacklist, idBlacklist);
        },
        getRangeTargetElements : function (rangeCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist) {
            return interpreter.getRangeTargetElements(rangeCFI, contentDocument, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateCharOffsetRangeComponent : function (rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist) {
            return generator.generateCharOffsetRangeComponent(rangeStartElement, startOffset, rangeEndElement, endOffset, classBlacklist, elementBlacklist, idBlacklist);
        },
        generateElementRangeComponent : function (rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist) {
            return generator.generateElementRangeComponent(rangeStartElement, rangeEndElement, classBlacklist, elementBlacklist, idBlacklist);
        }
    };

    EPUBcfi.CFIInstructions = CFIInstructions;
    EPUBcfi.Parser = Parser;
    EPUBcfi.OutOfRangeError = OError;
    EPUBcfi.Interpreter = Interp;
    EPUBcfi.Generator = generator;
    
    EPUBcfi.NodeTypeError = NodeTypeError;
    EPUBcfi.OutOfRangeError = OutOfRangeError;
    EPUBcfi.TerminusError = TerminusError;
    EPUBcfi.CFIAssertionError = CFIAssertionError;
    
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

    this.getRootElement = function(){

        return $iframe[0].contentDocument.documentElement;
    };

    //we look for text and images
    this.findFirstVisibleElement = function (topOffset) {

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

        var posInElement = this.getVerticalOffsetForPointOnElement($element, x, y);
        return Math.floor(posInElement / $viewport.height());
    };

    this.getVerticalOffsetForElement = function($element) {

        return this.getVerticalOffsetForPointOnElement($element, 0, 0);
    };

    this.getVerticalOffsetForPointOnElement = function($element, x, y) {

        var elementRect = ReadiumSDK.Helpers.Rect.fromElement($element);
        return Math.ceil(elementRect.top + y * elementRect.height / 100);
    };

    this.getElementById = function(id) {

        var contentDoc = $iframe[0].contentDocument;

        var $element = $("#" + ReadiumSDK.Helpers.escapeJQuerySelector(id), contentDoc);
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

    this.getFirstVisibleMediaOverlayElement = function(visibleContentOffsets)
    {
        var docElement = this.getRootElement();
        if (!docElement) return undefined;
        
        var $root = $("body", docElement);
        if (!$root || !$root[0]) return undefined;

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

        var elementRect = ReadiumSDK.Helpers.Rect.fromElement($element);
        // this is actually a point element, doesnt have a bounding rectangle
        if (_.isNaN(elementRect.left)) {
            var left = $element.position().left;
            var top = $element.position().top;
            elementRect = new ReadiumSDK.Helpers.Rect(top, left, 0, 0);
        }

        var visible = !(elementRect.bottom() <= visibleContentOffsets.top || elementRect.top >= visibleContentOffsets.bottom);
        if (!visible) return 0;

        var visibleTop = Math.max(elementRect.top, visibleContentOffsets.top);
        var visibleBottom = Math.min(elementRect.bottom(), visibleContentOffsets.bottom);

        var visibleHeight = visibleBottom - visibleTop;
        var percentVisible = Math.round((visibleHeight / elementRect.height) * 100);

        return percentVisible;
    };

    // 
    // this.getAllVisibleElementsWithSelector = function(selector, visibleContentOffset) {
    //     var elements = $(selector,this.getRootElement()).filter(function(e) { return true; });
    //     var $newElements = [];
    //     $.each(elements, function() {
    //         $newElements.push($(this));
    //     });
    //     var visibleDivs = this.getVisibleElements($newElements, visibleContentOffset);
    //     return visibleDivs;
    // 
    // };
    // 
    // this.getVisibleElements = function($elements, visibleContentOffsets) {
    // 
    //     var visibleElements = [];
    //     var that = this;
    //     
    //     var previousWasVisible = false;
    // 
    //     $.each($elements, function() {
    // 
    //         var visibility = that.getElementVisibility(this, visibleContentOffsets);
    // 
    //         if (visibility > 0) {
    //             visibleElements.push({element: this[0], percentVisible: visibility});
    // 
    //             previousWasVisible = true;
    //             return true; //continue
    //         }
    //         
    //         if (previousWasVisible) return false; // break
    //         
    //         return true; // continue (not reached the first visible one yet)
    // 
    // 
    //         // var elementRect = ReadiumSDK.Helpers.Rect.fromElement(this);
    //         // // this is actually a point element, doesnt have a bounding rectangle
    //         // if (_.isNaN(elementRect.left)) {
    //         //     var left = this.position().left;
    //         //     var top = this.position().top;
    //         //     elementRect = new ReadiumSDK.Helpers.Rect(top, left, 0, 0);
    //         // }
    //         // 
    //         // if(elementRect.bottom() <= visibleContentOffsets.top) {
    //         //     return true; //next element
    //         // }
    //         // 
    //         // if(elementRect.top >= visibleContentOffsets.bottom) {
    //         // 
    //         //     // Break the loop
    //         //     return false;
    //         // }
    //         // 
    //         // var visibleTop = Math.max(elementRect.top, visibleContentOffsets.top);
    //         // var visibleBottom = Math.min(elementRect.bottom(), visibleContentOffsets.bottom);
    //         // 
    //         // var visibleHeight = visibleBottom - visibleTop;
    //         // var percentVisible = Math.round((visibleHeight / elementRect.height) * 100);
    //         // 
    //         // visibleElements.push({element: this[0], percentVisible: percentVisible});
    //         // 
    //         // return true;
    //     });
    // 
    //     return visibleElements;
    // };

    // this.getVisibleTextElements = function(visibleContentOffsets) {
    // 
    //     var $elements = this.getTextElements($("body", this.getRootElement()));
    // 
    //     return this.getVisibleElements($elements, visibleContentOffsets);
    // };
    // 
    // this.getTextElements = function($root) {
    // 
    //     var $textElements = [];
    // 
    //     $root.find(":not(iframe)").contents().each(function () {
    // 
    //         if( isValidTextNode(this) ) {
    //             $textElements.push($(this).parent());
    //         }
    // 
    //     });
    // 
    //     return $textElements;
    // 
    // };

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
            return $element[0];
        }

        return 0;
    };

};

define("cfiNavigationLogic", ["readiumSDK","epubCfi"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.cfiNavigationLogic;
    };
}(this)));

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
ReadiumSDK.Views.OnePageView = function(options){

    _.extend(this, Backbone.Events);

    var self = this;

    var _$epubHtml;
    var _$el;
    var _$iframe;
    var _currentSpineItem;
    var _spine = options.spine;
    var _contentAlignment = options.contentAlignment;
    var _iframeLoader = options.iframeLoader;
    var _bookStyles = options.bookStyles;

    var _meta_size = {
        width: 0,
        height: 0
    };


    this.element = function() {
        return _$el;
    };

    this.meta_height = function() {
        return _meta_size.height;
    };

    this.meta_width = function() {
        return _meta_size.width;
    };

    this.isDisplaying = function() {

        return _currentSpineItem != undefined && _$epubHtml != null && _$epubHtml.length > 0;
    };

    this.render = function() {

        if(!_$iframe) {

            var template = ReadiumSDK.Helpers.loadTemplate("fixed_page_frame", {});

            _$el = $(template);

            _$el.css("height", "100%");
            _$el.css("width", "100%");

            _$el.addClass(options.class);
            _$iframe = $("iframe", _$el);
        }

        return this;
    };

    this.remove = function() {
        _currentSpineItem = undefined;
        _$el.remove();
    };

    this.currentSpineItem = function() {

        return _currentSpineItem;
    };

    function onIFrameLoad(success) {

        if(success) {
            var epubContentDocument = _$iframe[0].contentDocument;
            _$epubHtml = $("html", epubContentDocument);
            if (!_$epubHtml || _$epubHtml.length == 0) {
                _$epubHtml = $("svg", epubContentDocument);
            }
            _$epubHtml.css("overflow", "hidden");
            self.applyBookStyles();
            updateMetaSize();

            self.trigger(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED, _$iframe, _currentSpineItem, self);
        }
    }

    this.applyBookStyles = function() {

        if(_$epubHtml) {
            ReadiumSDK.Helpers.setStyles(_bookStyles.getStyles(), _$epubHtml);
        }
    };

    this.transformContent = function(scale, left, top) {

        var elWidth = Math.floor(_meta_size.width * scale);
        var elHeight = Math.floor(_meta_size.height * scale);
                                                    
        _$el.css("left", left + "px");
        _$el.css("top", top + "px");
        _$el.css("width", elWidth + "px");
        _$el.css("height", elHeight + "px");
                                                    
        _$iframe.css("width", elWidth + "px");
        _$iframe.css("height", elHeight + "px");

        var css = generateTransformCSS(scale, 0, 0);

        css["width"] = _meta_size.width;
        css["height"] = _meta_size.height;

        if(!_$epubHtml) {
            debugger;
        }

        _$epubHtml.css(css);
        _$iframe.css("visibility", "visible");
    };

    function generateTransformCSS(scale, left, top) {

        var transformString = "translate(" + left + "px, " + top + "px) scale(" + scale + ")";

        //TODO modernizer library can be used to get browser independent transform attributes names (implemented in readium-web fixed_layout_book_zoomer.js)
        var css = {};
        css["-webkit-transform"] = transformString;
        css["-webkit-transform-origin"] = "0 0";

        return css;
    }

    function updateMetaSize() {

        var contentDocument = _$iframe[0].contentDocument;

        // first try to read viewport size
        var content = $('meta[name=viewport]', contentDocument).attr("content");

        // if not found try viewbox (used for SVG)
        if(!content) {
            content = $('meta[name=viewbox]', contentDocument).attr("content");
        }

        if(content) {
            var size = parseSize(content);
            if(size) {
                _meta_size.width = size.width;
                _meta_size.height = size.height;
            }
        }
        else { //try to get direct image size
            
            // try SVG element's width/height first
            var $svg = $(contentDocument).find('svg');
            if ($svg) {
                var width = parseInt($svg.attr("width"), 10);
                var height = parseInt($svg.attr("height"), 10);
                if (width > 0) {
                    _meta_size.width = width;
                    _meta_size.height = height;
                }
                return;
            }

            var $img = $(contentDocument).find('img');
            var width = $img.width();
            var height = $img.height();

            if( width > 0) {
                _meta_size.width = width;
                _meta_size.height = height;
            }
        }

    }

    this.loadSpineItem = function(spineItem) {

        if(_currentSpineItem != spineItem) {

            _currentSpineItem = spineItem;
            var src = _spine.package.resolveRelativeUrl(spineItem.href);

            //hide iframe until content is scaled
            _$iframe.css("visibility", "hidden");
            self.trigger(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPEN_START, _$iframe, _currentSpineItem);
            _iframeLoader.loadIframe(_$iframe[0], src, onIFrameLoad, self, {spineItem : spineItem});
        }
        else
        {
            this.trigger(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED, _$iframe, _currentSpineItem, false);
        }
    };

    function parseSize(content) {

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
    }

    this.getFirstVisibleElementCfi = function(){

        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(_$el, _$iframe);
        return navigation.getFirstVisibleElementCfi(0);

    };

    this.getElementByCfi = function(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        if(spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(_$el, _$iframe);
        return navigation.getElementByCfi(cfi, classBlacklist, elementBlacklist, idBlacklist);
    };

    this.getElement = function(spineItem, selector) {

        if(spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(_$el, _$iframe);
        return navigation.getElement(selector);
    };

    this.getFirstVisibleMediaOverlayElement = function() {
        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(_$el, _$iframe);
        return navigation.getFirstVisibleMediaOverlayElement({top:0, bottom: _$iframe.height()});
    }

};

ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPEN_START = "SpineItemOpenStart";
ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED = "SpineItemOpened";

define("onePageView", ["readiumSDK","cfiNavigationLogic"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.onePageView;
    };
}(this)));

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

define("currentPagesInfo", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.currentPagesInfo;
    };
}(this)));

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

ReadiumSDK.Models.Spread = function(spine, orientation) {

    var self = this;

    this.orientation = orientation;
    this.spine = spine;

    this.leftItem = undefined;
    this.rightItem = undefined;
    this.centerItem = undefined;

    var _isSyntheticSpread = true;

    this.setSyntheticSpread = function(isSyntheticSpread) {
        _isSyntheticSpread = isSyntheticSpread;
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

        if(position != ReadiumSDK.Models.Spread.POSITION_CENTER) {
            var neighbour = getNeighbourItem(item);
            if(neighbour) {
                var neighbourPos = getItemPosition(neighbour);
                if(neighbourPos != position && position != ReadiumSDK.Models.Spread.POSITION_CENTER)  {
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

        if(position == ReadiumSDK.Models.Spread.POSITION_LEFT) {
            self.leftItem = item;
        }
        else if (position == ReadiumSDK.Models.Spread.POSITION_RIGHT) {
            self.rightItem = item;
        }
        else {

            if(position != ReadiumSDK.Models.Spread.POSITION_CENTER) {
                console.error("Unrecognized position value");
            }

            self.centerItem = item;
        }

    }

    function getItemPosition(item) {

        if(!_isSyntheticSpread) {
            return ReadiumSDK.Models.Spread.POSITION_CENTER;
        }

        if(!ReadiumSDK.Helpers.isRenditionSpreadPermittedForItem(item, self.orientation)) {
            return ReadiumSDK.Models.Spread.POSITION_CENTER;
        }

        if(item.isLeftPage()) {
            return ReadiumSDK.Models.Spread.POSITION_LEFT;
        }

        if (item.isRightPage()) {
            return ReadiumSDK.Models.Spread.POSITION_RIGHT;
        }

        return ReadiumSDK.Models.Spread.POSITION_CENTER;
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

ReadiumSDK.Models.Spread.POSITION_LEFT = "left";
ReadiumSDK.Models.Spread.POSITION_RIGHT = "right";
ReadiumSDK.Models.Spread.POSITION_CENTER = "center";

define("fixedPageSpread", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.fixedPageSpread;
    };
}(this)));

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
define("bookmarkData", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.bookmarkData;
    };
}(this)));

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
    var $target = $( "#" + ReadiumSDK.Helpers.escapeJQuerySelector(this.ref), dom);
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

define("triggers", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.triggers;
    };
}(this)));

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

ReadiumSDK.Views.FixedView = function(options){

    _.extend(this, Backbone.Events);

    var self = this;

    var _$el;
    var _$viewport = options.$viewport;
    var _spine = options.spine;
    var _userStyles = options.userStyles;
    var _bookStyles = options.bookStyles;
    var _iframeLoader = options.iframeLoader;

    var _leftPageView = createOnePageView("fixed-page-frame-left", "right");
    var _rightPageView = createOnePageView("fixed-page-frame-right", "left");
    var _centerPageView = createOnePageView("fixed-page-frame-center", "center");

    var _pageViews = [];
    _pageViews.push(_leftPageView);
    _pageViews.push(_rightPageView);
    _pageViews.push(_centerPageView);

    var _spread = new ReadiumSDK.Models.Spread(_spine, ReadiumSDK.Helpers.getOrientation(_$viewport));
    var _bookMargins;
    var _contentMetaSize;

    function createOnePageView(cssclass, contentAlignment) {

        var pageView = new ReadiumSDK.Views.OnePageView({

            iframeLoader: _iframeLoader,
            spine: _spine,
            bookStyles: _bookStyles,
            class: cssclass,
            contentAlignment: contentAlignment
        });

        pageView.on(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPEN_START, function($iframe, spineItem) {

            self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, $iframe, spineItem);
        });


        return pageView;
    }

    this.isReflowable = function() {
        return false;
    };

    this.render = function(){

        var template = ReadiumSDK.Helpers.loadTemplate("fixed_book_frame", {});

        _$el = $(template);
        _$viewport.append(_$el);

        self.applyStyles();

        //event with namespace for clean unbinding
        $(window).on("resize.ReadiumSDK.readerView", _.bind(self.onViewportResize, self));


        return this;
    };

    this.remove = function() {

        $(window).off("resize.ReadiumSDK.readerView");
        _$el.remove();
    };

    this.setViewSettings = function(settings) {
        _spread.setSyntheticSpread(settings.isSyntheticSpread);
    };

    function redraw(initiator, paginationRequest) {

        var context = {isElementAdded : false};
        var pageLoadDeferrals = createPageLoadDeferrals([{pageView: _leftPageView, spineItem: _spread.leftItem, context: context},
                                                              {pageView: _rightPageView, spineItem: _spread.rightItem, context: context},
                                                              {pageView: _centerPageView, spineItem: _spread.centerItem, context: context}]);
        if(pageLoadDeferrals.length > 0) {

            $.when.apply($, pageLoadDeferrals).done(function(){
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
            });
        }
    }

    this.applyStyles = function() {

        ReadiumSDK.Helpers.setStyles(_userStyles.getStyles(), _$el.parent());

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
            if(dfd) {
                pageLoadDeferrals.push(dfd);
            }

        }

        return pageLoadDeferrals;

    }

    function onPagesLoaded(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        updateContentMetaSize();
        resizeBook();

        self.trigger(ReadiumSDK.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: self.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
    }

    this.onViewportResize = function() {

        //because change of the viewport orientation can alter pagination behaviour we have to check if
        //visible content stays same
        var newOrientation = ReadiumSDK.Helpers.getOrientation(_$viewport);
        if(!newOrientation) {
            return;
        }

        var spreadChanged = false;
        var itemToDisplay = undefined;
        if(_spread.orientation != newOrientation) {

            var newPageSpread = new ReadiumSDK.Models.Spread(_spine, newOrientation);

            spreadChanged = (  _spread.leftItem != newPageSpread.leftItem
                            || _spread.rightItem != newPageSpread.rightItem
                            || _spread.centerItem != newPageSpread.centerItem );

            _spread.orientation = newOrientation;
        }

        if(spreadChanged) {
            itemToDisplay = _spread.validItems()[0];
            if(itemToDisplay) {
                var paginationRequest = new ReadiumSDK.Models.PageOpenRequest(itemToDisplay, self);
                self.openPage(paginationRequest);
            }
        }
        else {
            resizeBook();
        }
    };

    //event with namespace for clean unbinding
    $(window).on("resize.ReadiumSDK.readerView", _.bind(self.onViewportResize, self));

    function isContentRendered() {

        if(!_contentMetaSize || !_bookMargins) {
            return false;
        }

        var viewportWidth = _$viewport.width();
        var viewportHeight = _$viewport.height();

        return viewportWidth && viewportHeight;
    }

    function resizeBook() {

        if(!isContentRendered()) {
            return;
        }

        var viewportWidth = _$viewport.width();
        var viewportHeight = _$viewport.height();

        var leftPageMargins = _leftPageView.isDisplaying() ? ReadiumSDK.Helpers.Margins.fromElement(_leftPageView.element()) : ReadiumSDK.Helpers.Margins.empty();
        var rightPageMargins = _rightPageView.isDisplaying() ? ReadiumSDK.Helpers.Margins.fromElement(_rightPageView.element()) : ReadiumSDK.Helpers.Margins.empty();
        var centerPageMargins = _centerPageView.isDisplaying() ? ReadiumSDK.Helpers.Margins.fromElement(_centerPageView.element()) : ReadiumSDK.Helpers.Margins.empty();

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

        var scale = Math.min(horScale, verScale);

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

        if(_leftPageView.isDisplaying()) {

             _leftPageView.transformContent(scale, left, top);
        }

        if(_rightPageView.isDisplaying()) {

            left += _contentMetaSize.separatorPosition * scale;

            if(_leftPageView.isDisplaying()) {
                left += leftPageMargins.left;
            }

            _rightPageView.transformContent(scale, left, top);
        }

        if(_centerPageView.isDisplaying()) {

            _centerPageView.transformContent(scale, left, top);
        }
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

        return new ReadiumSDK.Helpers.Margins(sumMargin, sumBorder, sumPAdding);

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
        _bookMargins = ReadiumSDK.Helpers.Margins.fromElement(_$el);
    }

    this.openPage =  function(paginationRequest) {

        if(!paginationRequest.spineItem) {
            return;
        }

        _spread.openItem(paginationRequest.spineItem);
        redraw(paginationRequest.initiator, paginationRequest);
    };


    this.openPagePrev = function(initiator) {

        _spread.openPrev();
        redraw(initiator);
    };

    this.openPageNext = function(initiator) {

        _spread.openNext();
        redraw(initiator);
    };

    function updatePageViewForItem(pageView, item, context) {

        if(!item) {
            if(pageView.isDisplaying()) {
                pageView.remove();
            }

            return undefined;
        }

        if(!pageView.isDisplaying()) {

            _$el.append(pageView.render().element());

            context.isElementAdded = true;
        }

        var dfd = $.Deferred();

        pageView.on(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED, function($iframe, spineItem, isNewContentDocumentLoaded){

            pageView.off(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED);

            if(isNewContentDocumentLoaded) {
                self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);
            }

            dfd.resolve();
        });

        pageView.loadSpineItem(item);

        return dfd.promise();

    }

    this.getPaginationInfo = function() {

        var paginationInfo = new ReadiumSDK.Models.CurrentPagesInfo(_spine.items.length, true, _spine.direction);

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

            return new ReadiumSDK.Models.BookmarkData(idref, cfi);
        }

        return new ReadiumSDK.Models.BookmarkData("", "");
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

    this.insureElementVisibility = function(element, initiator) {

        //for now we assume that for fixed layout element is always visible

    }

};
define("fixedView", ["readiumSDK","onePageView","currentPagesInfo","fixedPageSpread","bookmarkData","triggers"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.fixedView;
    };
}(this)));


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

ReadiumSDK.Views.ReflowableView = function(options){

    _.extend(this, Backbone.Events);

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
    var _isSyntheticSpread;
    var _$el;
    var _$iframe;
    var _$epubHtml;

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

        var template = ReadiumSDK.Helpers.loadTemplate("reflowable_book_frame", {});

        _$el = $(template);
        _$viewport.append(_$el);

        _$contentFrame = $("#reflowable-content-frame", _$el);

        _$iframe = $("#epubContentIframe", _$el);

        _$iframe.css("left", "");
        _$iframe.css("right", "");
        _$iframe.css(_spine.isLeftToRight() ? "left" : "right", "0px");
        _$iframe.css("overflow", "hidden");

        _navigationLogic = new ReadiumSDK.Views.CfiNavigationLogic(_$contentFrame, _$iframe);

        //we need this styles for css columnizer not to chop big images
        var declarations = {};
        declarations["max-width"] = "100%";
        declarations["max-height"] = "100%";
        _bookStyles.addStyle("img", declarations);

        //We will call onViewportResize after user stopped resizing window
        var lazyResize = _.debounce(self.onViewportResize, 100);
        $(window).on("resize.ReadiumSDK.reflowableView", _.bind(lazyResize, self));

        return self;
    };

    function setFrameSizesToRectangle(rectangle) {
        _$contentFrame.css("left", rectangle.left);
        _$contentFrame.css("top", rectangle.top);
        _$contentFrame.css("right", rectangle.right);
        _$contentFrame.css("bottom", rectangle.bottom);

    }

    this.remove = function() {

        $(window).off("resize.ReadiumSDK.reflowableView");
        _$el.remove();

    };

    this.isReflowable = function() {
        return true;
    };

    this.onViewportResize = function() {

        if(updateViewportSize()) {
            //depends on aspect ratio of viewport and rendition:spread-* setting we may have to switch spread on/off
            _paginationInfo.visibleColumnCount = calculateVisibleColumnCount();
            updatePagination();
        }

    };

    this.setViewSettings = function(settings) {

        _isSyntheticSpread = settings.isSyntheticSpread;
        _paginationInfo.visibleColumnCount = calculateVisibleColumnCount();
        _paginationInfo.columnGap = settings.columnGap;
        _fontSize = settings.fontSize;

        updateHtmlFontSize();
        updateColumnGap();
        updatePagination();
    };

    function calculateVisibleColumnCount() {

        if(_isSyntheticSpread) {

            if(!_currentSpineItem) {
                return 2;
            }

            var orientation = ReadiumSDK.Helpers.getOrientation(_$viewport);
            if(!orientation) {
                return 2;
            }

            return ReadiumSDK.Helpers.isRenditionSpreadPermittedForItem(_currentSpineItem, orientation)
                ? 2 : 1;
        }
        else {

            return 1;
        }
    }

    function registerTriggers(doc) {
        $('trigger', doc).each(function() {
            var trigger = new ReadiumSDK.Models.Trigger(this);
            trigger.subscribe(doc);

        });
    }

    function loadSpineItem(spineItem) {

        if(_currentSpineItem != spineItem) {

            _paginationInfo.currentSpreadIndex = 0;
            _currentSpineItem = spineItem;
            _isWaitingFrameRender = true;

            var src = _spine.package.resolveRelativeUrl(spineItem.href);
            self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, _$iframe, spineItem);
            _iframeLoader.loadIframe(_$iframe[0], src, onIFrameLoad, self, {spineItem : spineItem});
        }
    }

    function updateHtmlFontSize() {

        if(_$epubHtml) {
            _$epubHtml.css("font-size", _fontSize + "%");
        }
    }

    function updateColumnGap() {

        if(_$epubHtml) {
            _$epubHtml.css("-webkit-column-gap", _paginationInfo.columnGap + "px");
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
            _deferredPageRequest = undefined;
            return;
        }

        self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, _$iframe, _currentSpineItem);

        var epubContentDocument = _$iframe[0].contentDocument;
        _$epubHtml = $("html", epubContentDocument);

        _$epubHtml.css("height", "100%");
        _$epubHtml.css("position", "fixed");
        _$epubHtml.css("-webkit-column-axis", "horizontal");

        self.applyBookStyles();

        updateHtmlFontSize();
        updateColumnGap();


/////////
//Columns Debugging
//                    $epubHtml.css("-webkit-column-rule-color", "red");
//                    $epubHtml.css("-webkit-column-rule-style", "dashed");
//                    $epubHtml.css("background-color", '#b0c4de');
/////////

        self.applyStyles();

        applySwitches(epubContentDocument);
        registerTriggers(epubContentDocument);

    }

    this.applyStyles = function() {

        ReadiumSDK.Helpers.setStyles(_userStyles.getStyles(), _$el.parent());

        //because left, top, bottom, right setting ignores padding of parent container
        //we have to take it to account manually
        var elementMargins = ReadiumSDK.Helpers.Margins.fromElement(_$el);
        setFrameSizesToRectangle(elementMargins.padding);

        updateViewportSize();
        updatePagination();

    };

    this.applyBookStyles = function() {

        if(_$epubHtml) {
            ReadiumSDK.Helpers.setStyles(_bookStyles.getStyles(), _$epubHtml);
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
    };

    function redraw() {

        var offsetVal =  -_paginationInfo.pageOffset + "px";

        _$epubHtml.css("left", _spine.isLeftToRight() ? offsetVal : "");
        _$epubHtml.css("right", _spine.isRightToLeft() ? offsetVal : "");
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

    // Description: Parse the epub "switch" tags and hide
    // cases that are not supported
    function applySwitches(dom) {

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
    }


    function onPaginationChanged(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        _paginationInfo.pageOffset = (_paginationInfo.columnWidth + _paginationInfo.columnGap) * _paginationInfo.visibleColumnCount * _paginationInfo.currentSpreadIndex;
        redraw();
        self.trigger(ReadiumSDK.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: self.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
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

            var prevSpineItem = _spine.prevItem(_currentSpineItem);
            if(prevSpineItem) {

                var pageRequest = new ReadiumSDK.Models.PageOpenRequest(prevSpineItem, initiator);
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

            var nextSpineItem = _spine.nextItem(_currentSpineItem);
            if(nextSpineItem) {

                var pageRequest = new ReadiumSDK.Models.PageOpenRequest(nextSpineItem, initiator);
                pageRequest.setFirstPage();
                self.openPage(pageRequest);
            }
        }
    };

    function updatePagination() {

        if(!_$epubHtml) {
            return;
        }

        _$iframe.css("width", _lastViewPortSize.width + "px");
        _$iframe.css("height", _lastViewPortSize.height + "px");

        _$epubHtml.css("height", _lastViewPortSize.height + "px");

        _paginationInfo.columnWidth = (_lastViewPortSize.width - _paginationInfo.columnGap * (_paginationInfo.visibleColumnCount - 1)) / _paginationInfo.visibleColumnCount;

        //we do this because CSS will floor column with by itself if it is not a round number
        _paginationInfo.columnWidth = Math.floor(_paginationInfo.columnWidth);

        _$epubHtml.css("width", _paginationInfo.columnWidth);

        shiftBookOfScreen();

        _$epubHtml.css("-webkit-column-width", _paginationInfo.columnWidth + "px");

        //TODO it takes time for rendition_layout engine to arrange columns we waite
        //it would be better to react on rendition_layout column reflow finished event
        setTimeout(function(){

            var columnizedContentWidth = _$epubHtml[0].scrollWidth;

            _paginationInfo.columnCount = Math.round((columnizedContentWidth + _paginationInfo.columnGap) / (_paginationInfo.columnWidth + _paginationInfo.columnGap));

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

                //We do this to force re-rendering of the document in the iframe.
                //There is a bug in WebView control with right to left columns layout - after resizing the window html document
                //is shifted in side the containing div. Hiding and showing the html element puts document in place.
                _$epubHtml.hide();
                setTimeout(function() {
                    _$epubHtml.show();
                    onPaginationChanged(self);
                }, 50);

            }

        }, 100);

    }

    function shiftBookOfScreen() {

        if(_spine.isLeftToRight()) {
            _$epubHtml.css("left", (_lastViewPortSize.width + 1000) + "px");
        }
        else {
            _$epubHtml.css("right", (_lastViewPortSize.width + 1000) + "px");
        }
    }

    this.getFirstVisibleElementCfi = function() {

        var contentOffsets = getVisibleContentOffsets();
        return _navigationLogic.getFirstVisibleElementCfi(contentOffsets.top);
    };

    this.getPaginationInfo = function() {

        var paginationInfo = new ReadiumSDK.Models.CurrentPagesInfo(_spine.items.length, false, _spine.direction);

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

    this.bookmarkCurrentPage = function() {

        if(!_currentSpineItem) {

            return new ReadiumSDK.Models.BookmarkData("", "");
        }

        return new ReadiumSDK.Models.BookmarkData(_currentSpineItem.idref, self.getFirstVisibleElementCfi());
    };

    function getVisibleContentOffsets() {
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

    this.insureElementVisibility = function(element, initiator) {

        var $element = $(element);
        if(_navigationLogic.getElementVisibility($element, getVisibleContentOffsets()) > 0) {
            return;
        }

        var page = _navigationLogic.getPageForElement($element);

        if(page == -1) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(_currentSpineItem, initiator);
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

define("reflowableView", ["readiumSDK","cfiNavigationLogic","bookmarkData","triggers"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.reflowableView;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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

ReadiumSDK.Models.SmilIterator = function(smil) {

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
                var inside = $("#" + ReadiumSDK.Helpers.escapeJQuerySelector(id), this.currentPar.element);
                if (inside && inside[0])
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
define("smilIterator", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.smilIterator;
    };
}(this)));

ReadiumSDK.Views.MediaOverlayDataInjector = function (mediaOverlay, mediaOverlayPlayer) {

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

                var clickEvent = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
                $body.bind(clickEvent, function (event)
                {
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
//console.debug("MO CLICK REDIRECT: " + el.id);
                        }

                        if (!mediaOverlaySettings.mediaOverlaysEnableClick)
                        {
console.debug("MO CLICK DISABLED");
                            mediaOverlayPlayer.touchInit();
                            return true;
                        }

                        if (inLink)
                        {
console.debug("MO CLICKED LINK");
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
                });
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
                       var textRelativeRef = ReadiumSDK.Helpers.ResolveContentRef(file, smil.href);
                       var same = textRelativeRef === spineItem.href;
                       if (same)
                       {                       
                           root.element = $iframe[0].contentDocument.getElementById(fragmentId);
                   
                           if (!root.element)
                           {
                               console.error("seq.textref !element? " + root.textref);
                           }

                           // var selector = "#" + ReadiumSDK.Helpers.escapeJQuerySelector(fragmentId);
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

        var iter = new ReadiumSDK.Models.SmilIterator(smil);
        
        var fakeOpfRoot = "/99!";
        var epubCfiPrefix = "epubcfi";
        
        while (iter.currentPar) {
            iter.currentPar.element = undefined;
            iter.currentPar.cfi = undefined;

            if (true) { //iter.currentPar.text.srcFragmentId (includes empty frag ID)

                var textRelativeRef = ReadiumSDK.Helpers.ResolveContentRef(iter.currentPar.text.srcFile, iter.smil.href);

                var same = textRelativeRef === spineItem.href;
                if (same) {
                    var selector = (!iter.currentPar.text.srcFragmentId || iter.currentPar.text.srcFragmentId.length == 0) ? "body" : (iter.currentPar.text.srcFragmentId.indexOf(epubCfiPrefix) == 0 ? undefined : "#" + ReadiumSDK.Helpers.escapeJQuerySelector(iter.currentPar.text.srcFragmentId));

                    var $element = undefined;
                    var isCfiTextRange = false;
                    if (!selector)
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
                        $element = $(selector, contentDocElement);
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
define("mediaOvelayDataInjector", ["readiumSDK","mediaOverlay","mediaOverlayPlayer","smilModel","spineItem","smilIterator"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.mediaOvelayDataInjector;
    };
}(this)));



ReadiumSDK.Views.InternalLinksSupport = function(reader) {

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

        absPath = ReadiumSDK.Helpers.RemoveFromString(absPath, "#" +  fullCfi);

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
        return fileName && ReadiumSDK.Helpers.EndsWith(fileName, ".opf");
    }

    function processLinkWithHash(hrefUri, spineItem) {

        var normalizedUri = new URI(hrefUri, spineItem.href);
        var hashFrag = hrefUri.fragment();

        var newSpineItem = reader.spine().getItemByHref(normalizedUri.pathname());

        if(newSpineItem) {
            reader.openSpineItemElementId(newSpineItem.idref, hashFrag, self);
        }
        else {
            console.error("spine item with href=" + normalizedUri.pathname() + " not found");
        }
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

                    var hrefUriHasFilename = hrefUri.filename();

                    // TODO:
                    if (hrefUriHasFilename /* TODO: && check whether href actually resolves to a spine item */) {
                        processLinkWithHash(hrefUri, spineItem);
                        overrideClickEvent = true;
                    } // otherwise it's probably just a hash frag that needs to be handled by browser's default handling
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

define("internalLinksSupport", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.internalLinksSupport;
    };
}(this)));

//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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

ReadiumSDK.Views.IFrameLoader = function() {

    var eventListeners = {};

    this.addIFrameEventListener = function(eventName, callback, context) {

        if(eventListeners[eventName] == undefined) {
            eventListeners[eventName] = [];
        }

        eventListeners[eventName].push({callback: callback, context: context});
    };

    this.loadIframe = function(iframe, src, callback, context) {

        //iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        
        var isWaitingForFrameLoad = true;

        iframe.onload = function() {

            _.each(eventListeners, function(value, key){
                for(var i = 0, count = value.length; i< count; i++) {
                    $(iframe.contentWindow).on(key, value[i].callback, value[i].context);
                }
            });

            try
            {
                iframe.contentWindow.navigator.epubReadingSystem = navigator.epubReadingSystem;
                console.debug("epubReadingSystem name:"
                    + iframe.contentWindow.navigator.epubReadingSystem.name
                    + " version:"
                    + iframe.contentWindow.navigator.epubReadingSystem.version
                    + " is loaded to iframe");
            }
            catch(ex)
            {
                console.log("epubReadingSystem INJECTION ERROR! " + ex.message);
            }

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

        }, 8000);

        iframe.src = src;
    };
};

define("iframeLoader", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.iframeLoader;
    };
}(this)));

var EpubAnnotationsModule = function (contentDocumentDOM, bbPageSetView, annotationCSSUrl) {
    
    var EpubAnnotations = {};

    // Rationale: The order of these matters
    EpubAnnotations.TextLineInferrer = Backbone.Model.extend({

    initialize : function (attributes, options) {},

    // ----------------- PUBLIC INTERFACE --------------------------------------------------------------

    inferLines : function (rectList) {

        var inferredLines = [];
        var numRects = rectList.length;
        var numLines = 0;
        var currLine;
        var currRect;
        var rectAppended;

        // Iterate through each rect
        for (var currRectNum = 0; currRectNum <= numRects - 1; currRectNum++) {
            currRect = rectList[currRectNum];

            // Check if the rect can be added to any of the current lines
            rectAppended = false;
            for (var currLineNum = 0; currLineNum <= numLines - 1; currLineNum++) {
                currLine = inferredLines[currLineNum];

                if (this.includeRectInLine(currLine, currRect.top, currRect.left, currRect.width, currRect.height)) {
                    this.expandLine(currLine, currRect.left, currRect.top, currRect.width, currRect.height);
                    rectAppended = true;
                    break;   
                }
            } 
            
            if (rectAppended) {
                continue;
            }
            // If the rect can't be added to any existing lines, create a new line
            else {
                inferredLines.push(this.createNewLine(currRect.left, currRect.top, currRect.width, currRect.height));
                numLines = numLines + 1; // Update the number of lines, so we're not using .length on every iteration
            }
        }

        return inferredLines;
    },


    // ----------------- PRIVATE HELPERS ---------------------------------------------------------------

    includeRectInLine : function (currLine, rectTop, rectLeft, rectWidth, rectHeight) {

        // is on an existing line : based on vertical position
        if (this.rectIsWithinLineVertically(rectTop, rectHeight, currLine.maxTop, currLine.maxBottom)) {
            if (this.rectIsWithinLineHorizontally(rectLeft, rectWidth, currLine.left, currLine.width, currLine.avgHeight)) {
                return true;
            }
        }

        return false;
    },

    rectIsWithinLineVertically : function (rectTop, rectHeight, currLineMaxTop, currLineMaxBottom) {

        var rectBottom = rectTop + rectHeight;
        var lineHeight = currLineMaxBottom - currLineMaxTop;
        var lineHeightAdjustment = (lineHeight * 0.75) / 2;
        var rectHeightAdjustment = (rectHeight * 0.75) / 2;

        rectTop = rectTop + rectHeightAdjustment;
        rectBottom = rectBottom - rectHeightAdjustment;
        currLineMaxTop = currLineMaxTop + lineHeightAdjustment;
        currLineMaxBottom = currLineMaxBottom - lineHeightAdjustment;

        if (rectTop === currLineMaxTop && rectBottom === currLineMaxBottom) {
            return true;
        }
        else if (rectTop < currLineMaxTop && rectBottom < currLineMaxBottom && rectBottom > currLineMaxTop) {
            return true;
        }
        else if (rectTop > currLineMaxTop && rectBottom > currLineMaxBottom && rectTop < currLineMaxBottom) {
            return true;
        }
        else if (rectTop > currLineMaxTop && rectBottom < currLineMaxBottom) {
            return true;
        }
        else if (rectTop < currLineMaxTop && rectBottom > currLineMaxBottom) {
            return true;
        }
        else {
            return false;
        }
    },

    rectIsWithinLineHorizontally : function (rectLeft, rectWidth, currLineLeft, currLineWidth, currLineAvgHeight) {

        var lineGapHeuristic = 2 * currLineAvgHeight;
        var rectRight = rectLeft + rectWidth;
        var currLineRight = rectLeft + currLineWidth;

        if ((currLineLeft - rectRight) > lineGapHeuristic) {
            return false;
        }
        else if ((rectLeft - currLineRight) > lineGapHeuristic) {
            return false;
        }
        else {
            return true;
        }
    },

    createNewLine : function (rectLeft, rectTop, rectWidth, rectHeight) {

        var maxBottom = rectTop + rectHeight;

        return {
            left : rectLeft,
            startTop : rectTop,
            width : rectWidth, 
            avgHeight : rectHeight, 
            maxTop : rectTop,
            maxBottom : maxBottom,
            numRects : 1
        };
    },

    expandLine : function (currLine, rectLeft, rectTop, rectWidth, rectHeight) {

        var lineOldRight = currLine.left + currLine.width; 

        // Update all the properties of the current line with rect dimensions
        var rectRight = rectLeft + rectWidth;
        var rectBottom = rectTop + rectHeight;
        var numRectsPlusOne = currLine.numRects + 1;

        // Average height calculation
        var currSumHeights = currLine.avgHeight * currLine.numRects;
        var avgHeight = ((currSumHeights + rectHeight) / numRectsPlusOne);
        currLine.avgHeight = avgHeight;
        currLine.numRects = numRectsPlusOne;

        // Expand the line vertically
        currLine = this.expandLineVertically(currLine, rectTop, rectBottom);
        currLine = this.expandLineHorizontally(currLine, rectLeft, rectRight);        

        return currLine;
    },

    expandLineVertically : function (currLine, rectTop, rectBottom) {

        if (rectTop < currLine.maxTop) {
            currLine.maxTop = rectTop;
        } 
        if (rectBottom > currLine.maxBottom) {
            currLine.maxBottom = rectBottom;
        }

        return currLine;
    },

    expandLineHorizontally : function (currLine, rectLeft, rectRight) {

        var newLineLeft = currLine.left <= rectLeft ? currLine.left : rectLeft;
        var lineRight = currLine.left + currLine.width;
        var newLineRight = lineRight >= rectRight ? lineRight : rectRight;
        var newLineWidth = newLineRight - newLineLeft;
        currLine.left = newLineLeft;
        currLine.width = newLineWidth;

        return currLine;
    }
});
    EpubAnnotations.Highlight = Backbone.Model.extend({

    defaults : {
        "isVisible" : false
    },

    initialize : function (attributes, options) {}
});
    EpubAnnotations.HighlightGroup = Backbone.Model.extend({

    defaults : function () {
        return {
            "selectedNodes" : [],
            "highlightViews" : []
        };
    },

    initialize : function (attributes, options) {
        this.set("scale", attributes.scale);
        this.constructHighlightViews();
    },

    // --------------- PRIVATE HELPERS ---------------------------------------

    highlightGroupCallback : function (event) {

        var that = this;
        
        // Trigger this event on each of the highlight views (except triggering event)
        if (event.type === "click") {
            that.get("bbPageSetView").trigger("annotationClicked", "highlight", that.get("CFI"), that.get("id"), event);
            return;
        }


        // Trigger this event on each of the highlight views (except triggering event)
        if (event.type === "contextmenu") {
            that.get("bbPageSetView").trigger("annotationRightClicked", "highlight", that.get("CFI"), that.get("id"), event);
            return;
        }


        // Events that are called on each member of the group
        _.each(this.get("highlightViews"), function (highlightView) {

            if (event.type === "mouseenter") {
                highlightView.setHoverHighlight();    
            }
            else if (event.type === "mouseleave") {
                highlightView.setBaseHighlight();
            }
        });
    },

    constructHighlightViews : function () {

        var that = this;
        var rectList = [];
        var inferrer;
        var inferredLines;

        _.each(this.get("selectedNodes"), function (node, index) {

            var rects;
            var range = document.createRange();
            range.selectNodeContents(node);
            rects = range.getClientRects();

            // REFACTORING CANDIDATE: Maybe a better way to append an array here
            _.each(rects, function (rect) {
                rectList.push(rect);
            });
        });

        inferrer = new EpubAnnotations.TextLineInferrer();
        inferredLines = inferrer.inferLines(rectList);

        var scale = this.get("scale");

        _.each(inferredLines, function (line, index) {

            var highlightTop = line.startTop / scale;;
            var highlightLeft = line.left / scale;;
            var highlightHeight = line.avgHeight / scale;
            var highlightWidth = line.width / scale;;

            var highlightView = new EpubAnnotations.HighlightView({
                CFI : that.get("CFI"),
                top : highlightTop + that.get("offsetTopAddition"),
                left : highlightLeft + that.get("offsetLeftAddition"),
                height : highlightHeight,
                width : highlightWidth,
                styles : that.get('styles'),
                highlightGroupCallback : that.highlightGroupCallback,
                callbackContext : that
            });

            that.get("highlightViews").push(highlightView);
        });
    },

    resetHighlights : function (viewportElement, offsetTop, offsetLeft) {

        if (offsetTop) {
            this.set({ offsetTopAddition : offsetTop });
        }
        if (offsetLeft) {
            this.set({ offsetLeftAddition : offsetLeft });
        }

        this.destroyCurrentHighlights();
        this.constructHighlightViews();
        this.renderHighlights(viewportElement);
    },

    // REFACTORING CANDIDATE: Ensure that event listeners are being properly cleaned up. 
    destroyCurrentHighlights : function () { 

        _.each(this.get("highlightViews"), function (highlightView) {
            highlightView.remove();
            highlightView.off();
        });

        this.get("highlightViews").length = 0;
    },

    renderHighlights : function (viewportElement) {

        _.each(this.get("highlightViews"), function (view, index) {
            $(viewportElement).append(view.render());
        });
    },

    toInfo : function () {

        return {

            id : this.get("id"),
            type : "highlight",
            CFI : this.get("CFI")
        };
    },

    setStyles : function (styles) {
        var highlightViews = this.get('highlightViews');

        this.set({styles : styles});

        _.each(highlightViews, function(view, index) {
            view.setStyles(styles);
        });
    }
});

    EpubAnnotations.Underline = Backbone.Model.extend({

    defaults : {
        "isVisible" : false
    },

    initialize : function (attributes, options) {}
});
    EpubAnnotations.UnderlineGroup = Backbone.Model.extend({

    defaults : function () {
        return {
            "selectedNodes" : [],
            "underlineViews" : []
        };
    },

    initialize : function (attributes, options) {

        this.constructUnderlineViews();
    },

    // --------------- PRIVATE HELPERS ---------------------------------------

    underlineGroupCallback : function (event) {

        var that = this;

        // Trigger this event on each of the underline views (except triggering event)
        if (event.type === "click") {
            that.get("bbPageSetView").trigger("annotationClicked", "underline", that.get("CFI"), that.get("id"), event);
            return;
        }

        // Events that are called on each member of the group
        _.each(this.get("underlineViews"), function (underlineView) {

            if (event.type === "mouseenter") {
                underlineView.setHoverUnderline();
            }
            else if (event.type === "mouseleave") {
                underlineView.setBaseUnderline();
            }
        });
    },

    constructUnderlineViews : function () {

        var that = this;
        var rectList = [];
        var inferrer;
        var inferredLines;

        _.each(this.get("selectedNodes"), function (node, index) {

            var rects;
            var range = document.createRange();
            range.selectNodeContents(node);
            rects = range.getClientRects();

            // REFACTORING CANDIDATE: Maybe a better way to append an array here
            _.each(rects, function (rect) {
                rectList.push(rect);
            });
        });

        inferrer = new EpubAnnotations.TextLineInferrer();
        inferredLines = inferrer.inferLines(rectList);

        _.each(inferredLines, function (line, index) {

            var underlineTop = line.startTop;
            var underlineLeft = line.left;
            var underlineHeight = line.avgHeight;
            var underlineWidth = line.width;

            var underlineView = new EpubAnnotations.UnderlineView({
                CFI : that.get("CFI"),
                top : underlineTop + that.get("offsetTopAddition"),
                left : underlineLeft + that.get("offsetLeftAddition"),
                height : underlineHeight,
                width : underlineWidth,
                styles : that.get("styles"),
                underlineGroupCallback : that.underlineGroupCallback,
                callbackContext : that
            });

            that.get("underlineViews").push(underlineView);
        });
    },

    resetUnderlines : function (viewportElement, offsetTop, offsetLeft) {

        if (offsetTop) {
            this.set({ offsetTopAddition : offsetTop });
        }
        if (offsetLeft) {
            this.set({ offsetLeftAddition : offsetLeft });
        }

        this.destroyCurrentUnderlines();
        this.constructUnderlineViews();
        this.renderUnderlines(viewportElement);
    },

    // REFACTORING CANDIDATE: Ensure that event listeners are being properly cleaned up. 
    destroyCurrentUnderlines : function () { 

        _.each(this.get("underlineViews"), function (underlineView) {
            underlineView.remove();
            underlineView.off();
        });

        this.get("underlineViews").length = 0;
    },

    renderUnderlines : function (viewportElement) {

        _.each(this.get("underlineViews"), function (view, index) {
            $(viewportElement).append(view.render());
        });
    },

    toInfo : function () {

        return {

            id : this.get("id"),
            type : "underline",
            CFI : this.get("CFI")
        };
    },

    setStyles : function (styles) {
        
        var underlineViews = this.get('underlineViews');

        this.set({styles : styles});

        _.each(underlineViews, function(view, index) {
            view.setStyles(styles);
        });
    },
});

    EpubAnnotations.Bookmark = Backbone.Model.extend({

    defaults : {
        "isVisible" : false,
        "bookmarkCenteringAdjustment" : 15,
        "bookmarkTopAdjustment" : 45
    },

    initialize : function (attributes, options) {

        // Figure out the top and left of the bookmark
        // This should include the additional offset provided by the annotations object
    },

    getAbsoluteTop : function () {

        var targetElementTop = $(this.get("targetElement")).offset().top;
        var bookmarkAbsoluteTop = this.get("offsetTopAddition") + targetElementTop - this.get("bookmarkTopAdjustment");
        return bookmarkAbsoluteTop;
    },

    getAbsoluteLeft : function () {

        var targetElementLeft = $(this.get("targetElement")).offset().left;
        var bookmarkAbsoluteLeft = this.get("offsetLeftAddition") + targetElementLeft - this.get("bookmarkCenteringAdjustment");
        return bookmarkAbsoluteLeft;
    },

    toInfo : function () {

        return {

            id : this.get("id"),
            type : "bookmark",
            CFI : this.get("CFI")
        };
    }
});
    EpubAnnotations.ReflowableAnnotations = Backbone.Model.extend({

    initialize : function (attributes, options) {
        
        this.epubCFI = EPUBcfi;
        this.annotations = new EpubAnnotations.Annotations({
            offsetTopAddition : 0, 
            offsetLeftAddition : 0, 
            readerBoundElement : $("html", this.get("contentDocumentDOM"))[0],
            scale: 0,
            bbPageSetView : this.get("bbPageSetView")
        });
        // inject annotation CSS into iframe 

        
        var annotationCSSUrl = this.get("annotationCSSUrl");
        if (annotationCSSUrl)
        {
            this.injectAnnotationCSS(annotationCSSUrl);
        }

        // emit an event when user selects some text.
        var epubWindow = $(this.get("contentDocumentDOM"));
        var self = this;
        epubWindow.on("mouseup", function(event) {
            var range = self.getCurrentSelectionRange();
            if (range === undefined) {
                return;
            }
            if (range.startOffset - range.endOffset) {
                self.annotations.get("bbPageSetView").trigger("textSelectionEvent", event);
            }
        });


    },

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    redraw : function () {

        var leftAddition = -this.getPaginationLeftOffset();
        this.annotations.redrawAnnotations(0, leftAddition);
    },

   removeHighlight: function(annotationId) {
        return this.annotations.removeHighlight(annotationId)
    },



    addHighlight : function (CFI, id, type, styles) {

        var CFIRangeInfo;
        var range;
        var rangeStartNode;
        var rangeEndNode;
        var selectedElements;
        var leftAddition;
        var startMarkerHtml = this.getRangeStartMarker(CFI, id);
        var endMarkerHtml = this.getRangeEndMarker(CFI, id);

        // TODO webkit specific?
        var $html = $(this.get("contentDocumentDOM"));
        var matrix = $('html', $html).css('-webkit-transform');
        var scale = new WebKitCSSMatrix(matrix).a;
        this.set("scale", scale);

        try {
            CFIRangeInfo = this.epubCFI.injectRangeElements(
                CFI,
                this.get("contentDocumentDOM"),
                startMarkerHtml,
                endMarkerHtml,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]
                );

            // Get start and end marker for the id, using injected into elements
            // REFACTORING CANDIDATE: Abstract range creation to account for no previous/next sibling, for different types of
            //   sibiling, etc. 
            rangeStartNode = CFIRangeInfo.startElement.nextSibling ? CFIRangeInfo.startElement.nextSibling : CFIRangeInfo.startElement;
            rangeEndNode = CFIRangeInfo.endElement.previousSibling ? CFIRangeInfo.endElement.previousSibling : CFIRangeInfo.endElement;
            range = document.createRange();
            range.setStart(rangeStartNode, 0);
            range.setEnd(rangeEndNode, rangeEndNode.length);

            selectionInfo = this.getSelectionInfo(range);
            leftAddition = -this.getPaginationLeftOffset();

            if (type === "highlight") {
                this.annotations.set('scale', this.get('scale'));
                this.annotations.addHighlight(CFI, selectionInfo.selectedElements, id, 0, leftAddition, CFIRangeInfo.startElement, CFIRangeInfo.endElement, styles);
            }
            else if (type === "underline") {
                this.annotations.addUnderline(CFI, selectionInfo.selectedElements, id, 0, leftAddition, styles);
            }

            return {
                CFI : CFI, 
                selectedElements : selectionInfo.selectedElements
            };

        } catch (error) {
            console.log(error.message);
        }
    },

    addBookmark : function (CFI, id, type) {

        var selectedElements;
        var bookmarkMarkerHtml = this.getBookmarkMarker(CFI, id);
        var $injectedElement;
        var leftAddition;

        try {
            $injectedElement = this.epubCFI.injectElement(
                CFI,
                this.get("contentDocumentDOM"),
                bookmarkMarkerHtml,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]
            );

            // Add bookmark annotation here
            leftAddition = -this.getPaginationLeftOffset();
            this.annotations.addBookmark(CFI, $injectedElement[0], id, 0, leftAddition, type);

            return {

                CFI : CFI, 
                selectedElements : $injectedElement[0]
            };

        } catch (error) {
            console.log(error.message);
        }
    },

    addImageAnnotation : function (CFI, id) {

        var selectedElements;
        var bookmarkMarkerHtml = this.getBookmarkMarker(CFI, id);
        var $targetImage;

        try {
            $targetImage = this.epubCFI.getTargetElement(
                CFI,
                this.get("contentDocumentDOM"),
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]
            );
            this.annotations.addImageAnnotation(CFI, $targetImage[0], id);

            return {

                CFI : CFI, 
                selectedElements : $targetImage[0]
            };

        } catch (error) {
            console.log(error.message);
        }
    },

    // this returns a partial CFI only!!
    getCurrentSelectionCFI: function() {
        var currentSelection = this.getCurrentSelectionRange();
        var CFI;
        if (currentSelection) {
            selectionInfo = this.getSelectionInfo(currentSelection);
            CFI = selectionInfo.CFI;
        }

        return CFI;
    },

    // this returns a partial CFI only!!
    getCurrentSelectionOffsetCFI: function() {
        var currentSelection = this.getCurrentSelectionRange();

        var CFI;
        if (currentSelection) {
            CFI = this.generateCharOffsetCFI(currentSelection);
        }
        return CFI;
    },


    /// TODODM refactor thhis using getCurrentSelectionCFI (above)


    addSelectionHighlight : function (id, type, styles) {

        var arbitraryPackageDocCFI = "/99!"
        var generatedContentDocCFI;
        var CFI;
        var selectionInfo;
        var currentSelection = this.getCurrentSelectionRange();
        var annotationInfo;

        if (currentSelection) {

            selectionInfo = this.getSelectionInfo(currentSelection);
            generatedContentDocCFI = selectionInfo.CFI;
            CFI = "epubcfi(" + arbitraryPackageDocCFI + generatedContentDocCFI + ")";
            if (type === "highlight") {
                annotationInfo = this.addHighlight(CFI, id, type, styles);
            }
            else if (type === "underline") {
                annotationInfo = this.addHighlight(CFI, id, type, styles);
            }

            // Rationale: The annotationInfo object returned from .addBookmark(...) contains the same value of 
            //   the CFI variable in the current scope. Since this CFI variable contains a "hacked" CFI value -
            //   only the content document portion is valid - we want to replace the annotationInfo.CFI property with
            //   the partial content document CFI portion we originally generated.
            annotationInfo.CFI = generatedContentDocCFI;            
            return annotationInfo;
        }
        else {
            throw new Error("Nothing selected");
        }
    },

    addSelectionBookmark : function (id, type) {

        var arbitraryPackageDocCFI = "/99!"
        var generatedContentDocCFI;
        var CFI;
        var currentSelection = this.getCurrentSelectionRange();
        var annotationInfo;

        if (currentSelection) {

            generatedContentDocCFI = this.generateCharOffsetCFI(currentSelection);
            CFI = "epubcfi(" + arbitraryPackageDocCFI + generatedContentDocCFI + ")";
            annotationInfo = this.addBookmark(CFI, id, type);

            // Rationale: The annotationInfo object returned from .addBookmark(...) contains the same value of 
            //   the CFI variable in the current scope. Since this CFI variable contains a "hacked" CFI value -
            //   only the content document portion is valid - we want to replace the annotationInfo.CFI property with
            //   the partial content document CFI portion we originally generated.
            annotationInfo.CFI = generatedContentDocCFI;
            return annotationInfo;
        }
        else {
            throw new Error("Nothing selected");
        }
    },

    addSelectionImageAnnotation : function (id) {

        var arbitraryPackageDocCFI = "/99!"
        var generatedContentDocCFI;
        var CFI;
        var selectionInfo;
        var currentSelection = this.getCurrentSelectionRange();
        var annotationInfo;
        var firstSelectedImage;

        if (currentSelection) {

            selectionInfo = this.getSelectionInfo(currentSelection, ["img"]);
            firstSelectedImage = selectionInfo.selectedElements[0];
            generatedContentDocCFI = this.epubCFI.generateElementCFIComponent(
                firstSelectedImage,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]
            );
            CFI = "epubcfi(" + arbitraryPackageDocCFI + generatedContentDocCFI + ")";
            annotationInfo = this.addImageAnnotation(CFI, id);

            // Rationale: The annotationInfo object returned from .addBookmark(...) contains the same value of 
            //   the CFI variable in the current scope. Since this CFI variable contains a "hacked" CFI value -
            //   only the content document portion is valid - we want to replace the annotationInfo.CFI property with
            //   the partial content document CFI portion we originally generated.
            annotationInfo.CFI = generatedContentDocCFI;
            return annotationInfo;
        }
        else {
            throw new Error("Nothing selected");
        }
    },

    updateAnnotationView : function (id, styles) {

        var annotationViews = this.annotations.updateAnnotationView(id, styles);

        return annotationViews;
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    getSelectionInfo : function (selectedRange, elementType) {

        // Generate CFI for selected text
        var CFI = this.generateRangeCFI(selectedRange);
        var intervalState = {
            startElementFound : false,
            endElementFound : false
        };
        var selectedElements = [];

        if (!elementType) {
            var elementType = ["text"];
        }

        this.findSelectedElements(
            selectedRange.commonAncestorContainer, 
            selectedRange.startContainer, 
            selectedRange.endContainer,
            intervalState,
            selectedElements, 
            elementType
        );

        // Return a list of selected text nodes and the CFI
        return {
            CFI : CFI,
            selectedElements : selectedElements
        };
    },

    generateRangeCFI : function (selectedRange) {

        var startNode = selectedRange.startContainer;
        var endNode = selectedRange.endContainer;
        var startOffset;
        var endOffset;
        var rangeCFIComponent;

        if (startNode.nodeType === Node.TEXT_NODE && endNode.nodeType === Node.TEXT_NODE) {

            startOffset = selectedRange.startOffset;
            endOffset = selectedRange.endOffset;

            rangeCFIComponent = this.epubCFI.generateCharOffsetRangeComponent(
                startNode, 
                startOffset, 
                endNode, 
                endOffset,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]
                );
            return rangeCFIComponent;
        }
        else {
            throw new Error("Selection start and end must be text nodes");
        }
    },

    generateCharOffsetCFI : function (selectedRange) {

        // Character offset
        var startNode = selectedRange.startContainer;
        var startOffset = selectedRange.startOffset;
        var charOffsetCFI;

        if (startNode.nodeType === Node.TEXT_NODE) {
            charOffsetCFI = this.epubCFI.generateCharacterOffsetCFIComponent(
                startNode,
                startOffset,
                ["cfi-marker", "mo-cfi-highlight"],
                [],
                ["MathJax_Message"]
            );
        }
        return charOffsetCFI;
    },

    // REFACTORING CANDIDATE: Convert this to jquery
    findSelectedElements : function (currElement, startElement, endElement, intervalState, selectedElements, elementTypes) {

        if (currElement === startElement) {
            intervalState.startElementFound = true;
        }

        if (intervalState.startElementFound === true) {
            this.addElement(currElement, selectedElements, elementTypes);
        }

        if (currElement === endElement) {
            intervalState.endElementFound = true;
            return;
        }

        if (currElement.firstChild) {
            this.findSelectedElements(currElement.firstChild, startElement, endElement, intervalState, selectedElements, elementTypes);
            if (intervalState.endElementFound) {
                return;
            }
        }

        if (currElement.nextSibling) {
            this.findSelectedElements(currElement.nextSibling, startElement, endElement, intervalState, selectedElements, elementTypes);
            if (intervalState.endElementFound) {
                return;
            }
        }
    },

    addElement : function (currElement, selectedElements, elementTypes) {

        // Check if the node is one of the types
        _.each(elementTypes, function (elementType) {

            if (elementType === "text") {
                if (currElement.nodeType === Node.TEXT_NODE) {
                    selectedElements.push(currElement);
                }
            }
            else {
                if ($(currElement).is(elementType)) {
                    selectedElements.push(currElement);    
                }
            }
        });
    },

    // Rationale: This is a cross-browser method to get the currently selected text
    getCurrentSelectionRange : function () {

        var currentSelection;
        var iframeDocument = this.get("contentDocumentDOM");
        if (iframeDocument.getSelection) {
            currentSelection = iframeDocument.getSelection();

            if (currentSelection && currentSelection.rangeCount && (currentSelection.anchorOffset !== currentSelection.focusOffset)) {
                return currentSelection.getRangeAt(0);
            }else{
                return undefined;
            }
        }
        else if (iframeDocument.selection) {
            return iframeDocument.selection.createRange();
        }
        else {
            return undefined;
        }
    },

    getPaginationLeftOffset : function () {

        var $htmlElement = $("html", this.get("contentDocumentDOM"));
        var offsetLeftPixels = $htmlElement.css("left");
        var offsetLeft = parseInt(offsetLeftPixels.replace("px", ""));
        return offsetLeft;
    },

    getBookmarkMarker : function (CFI, id) {

        return "<span class='bookmark-marker cfi-marker' id='" + id + "' data-cfi='" + CFI + "'></span>";
    },

    getRangeStartMarker : function (CFI, id) {

        return "<span class='range-start-marker cfi-marker' id='start-" + id + "' data-cfi='" + CFI + "'></span>";
    },

    getRangeEndMarker : function (CFI, id) {

        return "<span class='range-end-marker cfi-marker' id='end-" + id + "' data-cfi='" + CFI + "'></span>";
    },

    injectAnnotationCSS : function (annotationCSSUrl) {

        var $contentDocHead = $("head", this.get("contentDocumentDOM"));
        $contentDocHead.append(
            $("<link/>", { rel : "stylesheet", href : annotationCSSUrl, type : "text/css" })
        );
    }
});

    EpubAnnotations.Annotations = Backbone.Model.extend({

    defaults : function () {
        return {
            "bookmarkViews" : [],
            "highlights" : [],
            "markers"    : {},
            "underlines" : [],
            "imageAnnotations" : [],
            "annotationHash" : {},
            "offsetTopAddition" : 0,
            "offsetLeftAddition" : 0,
            "readerBoundElement" : undefined
        };
    },

    initialize : function (attributes, options) {},


    remove: function() {
        var that = this;
        _.each(this.get("highlights"), function (highlightGroup) {
            highlightGroup.remove();
        });
    },

    redrawAnnotations : function (offsetTop, offsetLeft) {

        var that = this;
        // Highlights
        _.each(this.get("highlights"), function (highlightGroup) {
            highlightGroup.resetHighlights(that.get("readerBoundElement"), offsetTop, offsetLeft);
        });

        // Bookmarks
        _.each(this.get("bookmarkViews"), function (bookmarkView) {
            bookmarkView.resetBookmark(offsetTop, offsetLeft);
        });

        // Underlines
        _.each(this.get("underlines"), function (underlineGroup) {
            underlineGroup.resetUnderlines(that.get("readerBoundElement"), offsetTop, offsetLeft);
        });
    },

    getBookmark : function (id) {

        var bookmarkView = this.get("annotationHash")[id];
        if (bookmarkView) {
            return bookmarkView.bookmark.toInfo();
        }
        else {
            return undefined;
        }
    },

    getHighlight : function (id) {

        var highlight = this.get("annotationHash")[id];
        if (highlight) {
            return highlight.toInfo();
        }
        else {
            return undefined;
        }
    },

    getUnderline : function (id) {

        var underline = this.get("annotationHash")[id];
        if (underline) {
            return underline.toInfo();
        }
        else {
            return undefined;
        }
    },

    getBookmarks : function () {

        var bookmarks = [];
        _.each(this.get("bookmarkViews"), function (bookmarkView) {

            bookmarks.push(bookmarkView.bookmark.toInfo());
        });
        return bookmarks;
    },

    getHighlights : function () {

        var highlights = [];
        _.each(this.get("highlights"), function (highlight) {

            highlights.push(highlight.toInfo());
        });
        return highlights;
    },

    getUnderlines : function () {

        var underlines = [];
        _.each(this.get("underlines"), function (underline) {

            underlines.push(underline.toInfo());
        });
        return underlines;
    },

    getImageAnnotations : function () {

        var imageAnnotations = [];
        _.each(this.get("imageAnnotations"), function (imageAnnotation) {

            imageAnnotations.push(imageAnnotation.toInfo());
        });
        return imageAnnotations;
    },

    addBookmark : function (CFI, targetElement, annotationId, offsetTop, offsetLeft, type) {

        if (!offsetTop) {
            offsetTop = this.get("offsetTopAddition");
        }
        if (!offsetLeft) {
            offsetLeft = this.get("offsetLeftAddition");
        }

        annotationId = annotationId.toString();
        this.validateAnnotationId(annotationId);

        var bookmarkView = new EpubAnnotations.BookmarkView({
            CFI : CFI,
            targetElement : targetElement, 
            offsetTopAddition : offsetTop,
            offsetLeftAddition : offsetLeft,
            id : annotationId.toString(),
            bbPageSetView : this.get("bbPageSetView"),
            type : type
        });
        this.get("annotationHash")[annotationId] = bookmarkView;
        this.get("bookmarkViews").push(bookmarkView);
        $(this.get("readerBoundElement")).append(bookmarkView.render());
    },

    removeHighlight: function(annotationId) {
        var annotationHash = this.get("annotationHash");
        var highlights = this.get("highlights");
        var markers = this.get("markers");

        if (!markers[annotationId])
            return;

        var startMarker =  markers[annotationId].startMarker;
        var endMarker = markers[annotationId].endMarker;

        startMarker.remove();
        endMarker.remove();

        delete markers[annotationId];

        delete annotationHash[annotationId];

        highlights = _.reject(highlights, 
                              function(obj) { 
                                  if (obj.id == annotationId) {
                                      obj.destroyCurrentHighlights();
                                      return true;
                                  } else {
                                      return false;
                                  }
                              }
                             );


                             this.set("highlights", highlights);
    },

    addHighlight : function (CFI, highlightedTextNodes, annotationId, offsetTop, offsetLeft, startMarker, endMarker, styles) {
        if (!offsetTop) {
            offsetTop = this.get("offsetTopAddition");
        }
        if (!offsetLeft) {
            offsetLeft = this.get("offsetLeftAddition");
        }

        annotationId = annotationId.toString();
        this.validateAnnotationId(annotationId);

        var highlightGroup = new EpubAnnotations.HighlightGroup({
            CFI : CFI,
            selectedNodes : highlightedTextNodes,
            offsetTopAddition : offsetTop,
            offsetLeftAddition : offsetLeft,
            styles: styles, 
            id : annotationId,
            bbPageSetView : this.get("bbPageSetView"),
            scale: this.get("scale")
        });
        this.get("annotationHash")[annotationId] = highlightGroup;
        this.get("highlights").push(highlightGroup);
        this.get("markers")[annotationId] = {"startMarker": startMarker, "endMarker":endMarker};
        highlightGroup.renderHighlights(this.get("readerBoundElement"));
    },

    addUnderline : function (CFI, underlinedTextNodes, annotationId, offsetTop, offsetLeft, styles) {

        if (!offsetTop) {
            offsetTop = this.get("offsetTopAddition");
        }
        if (!offsetLeft) {
            offsetLeft = this.get("offsetLeftAddition");
        }

        annotationId = annotationId.toString();
        this.validateAnnotationId(annotationId);

        var underlineGroup = new EpubAnnotations.UnderlineGroup({
            CFI : CFI,
            selectedNodes : underlinedTextNodes,
            offsetTopAddition : offsetTop,
            offsetLeftAddition : offsetLeft,
            styles: styles,
            id : annotationId,
            bbPageSetView : this.get("bbPageSetView")
        });
        this.get("annotationHash")[annotationId] = underlineGroup;
        this.get("underlines").push(underlineGroup);
        underlineGroup.renderUnderlines(this.get("readerBoundElement"));
    },

    addImageAnnotation : function (CFI, imageNode, annotationId) {

        annotationId = annotationId.toString();
        this.validateAnnotationId(annotationId);

        var imageAnnotation = new EpubAnnotations.ImageAnnotation({
            CFI : CFI,
            imageNode : imageNode,
            id : annotationId,
            bbPageSetView : this.get("bbPageSetView")
        });
        this.get("annotationHash")[annotationId] = imageAnnotation;
        this.get("imageAnnotations").push(imageAnnotation);
        imageAnnotation.render();
    },

    updateAnnotationView : function (id, styles) {
        var annotationViews = this.get("annotationHash")[id];

        annotationViews.setStyles(styles);

        return annotationViews;
    },

    // REFACTORING CANDIDATE: Some kind of hash lookup would be more efficient here, might want to 
    //   change the implementation of the annotations as an array
    validateAnnotationId : function (id) {

        if (this.get("annotationHash")[id]) {
            throw new Error("That annotation id already exists; annotation not added");
        }
    }
});

    EpubAnnotations.BookmarkView = Backbone.View.extend({

    el : "<div></div>",

    events : {
        "mouseenter" : "setHoverBookmark",
        "mouseleave" : "setBaseBookmark",
        "click" : "clickHandler"
    },

    initialize : function (options) {

        this.bookmark = new EpubAnnotations.Bookmark({
            CFI : options.CFI,
            targetElement : options.targetElement, 
            offsetTopAddition : options.offsetTopAddition,
            offsetLeftAddition : options.offsetLeftAddition,
            id : options.id,
            bbPageSetView : options.bbPageSetView,
            type : options.type
        });
    },

    resetBookmark : function (offsetTop, offsetLeft) {

        if (offsetTop) {
            this.bookmark.set({ offsetTopAddition : offsetTop });
        }

        if (offsetLeft) {
            this.bookmark.set({ offsetLeftAddition : offsetLeft });
        }
        this.setCSS();
    },

    render : function () {

        this.setCSS();
        return this.el;
    },

    setCSS : function () {

        var absoluteTop;
        var absoluteLeft;

        if (this.bookmark.get("type") === "comment") {
            absoluteTop = this.bookmark.getAbsoluteTop();
            absoluteLeft = this.bookmark.getAbsoluteLeft();
            this.$el.css({ 
                "top" : absoluteTop + "px",
                "left" : absoluteLeft + "px",
                "width" : "50px",
                "height" : "50px",
                "position" : "absolute"
            });
            this.$el.addClass("comment");
        }
        else {
            this.$el.addClass("bookmark");
        }
    },

    setHoverBookmark : function (event) {

        event.stopPropagation();
        if (this.$el.hasClass("comment")) {
            this.$el.removeClass("comment");
            this.$el.addClass("hover-comment");
        }
    },

    setBaseBookmark : function (event) {

        event.stopPropagation();
        if (this.$el.hasClass("hover-comment")) {
            this.$el.removeClass("hover-comment");
            this.$el.addClass("comment");
        }
    },

    clickHandler : function (event) {

        event.stopPropagation();
        var type;
        if (this.bookmark.get("type") === "comment") {
            type = "comment";
        }
        else {
            type = "bookmark";
        }

        this.bookmark.get("bbPageSetView").trigger("annotationClicked", 
            type, 
            this.bookmark.get("CFI"), 
            this.bookmark.get("id"),
            this.$el.css("top"),
            this.$el.css("left"),
            event
        );
    }
});

    EpubAnnotations.HighlightView = Backbone.View.extend({

    el : "<div class='highlight'></div>",

    events : {
        "mouseenter" : "highlightEvent",
        "mouseleave" : "highlightEvent",
        "click" : "highlightEvent",
        "contextmenu" : "highlightEvent"
    },

    initialize : function (options) {

        this.highlight = new EpubAnnotations.Highlight({
            CFI : options.CFI,
            top : options.top,
            left : options.left,
            height : options.height,
            width : options.width,
            styles: options.styles,
            highlightGroupCallback : options.highlightGroupCallback,
            callbackContext : options.callbackContext
        });
    },

    render : function () {

        this.setCSS();
        return this.el;
    },

    resetPosition : function (top, left, height, width) {

        this.highlight.set({
            top : top,
            left : left,
            height : height,
            width : width
        });
        this.setCSS();
    },

    setStyles : function (styles) {

        this.highlight.set({
            styles : styles,
        });
        this.render();
    },

    setCSS : function () {

        var styles = this.highlight.get("styles") || {};
        
        this.$el.css({ 
            "top" : this.highlight.get("top") + "px",
            "left" : this.highlight.get("left") + "px",
            "height" : this.highlight.get("height") + "px",
            "width" : this.highlight.get("width") + "px",
            "background-color" : styles.fill_color || "normal",
        });
    },

    setBaseHighlight : function () {

        this.$el.addClass("highlight");
        this.$el.removeClass("hover-highlight");
    },

    setHoverHighlight : function () {

        this.$el.addClass("hover-highlight");
        this.$el.removeClass("highlight");
    },

    highlightEvent : function (event) {

        event.stopPropagation();
        var highlightGroupCallback = this.highlight.get("highlightGroupCallback");
        var highlightGroupContext = this.highlight.get("callbackContext");
        highlightGroupContext.highlightGroupCallback(event);
    }
});

    EpubAnnotations.UnderlineView = Backbone.View.extend({

    el : "<div class='underline-range'> \
             <div class='transparent-part'></div> \
             <div class='underline-part'></div> \
          </div>",

    events : {
        "mouseenter" : "underlineEvent",
        "mouseleave" : "underlineEvent",
        "click" : "underlineEvent"
    },

    initialize : function (options) {

        this.underline = new EpubAnnotations.Underline({
            CFI : options.CFI,
            top : options.top,
            left : options.left,
            height : options.height,
            width : options.width,
            styles : options.styles,
            underlineGroupCallback : options.underlineGroupCallback,
            callbackContext : options.callbackContext
        });

        this.$transparentElement = $(".transparent-part", this.$el);
        this.$underlineElement = $(".underline-part", this.$el);
    },

    render : function () {

        this.setCSS();
        return this.el;
    },

    resetPosition : function (top, left, height, width) {

        this.underline.set({
            top : top,
            left : left,
            height : height,
            width : width
        });
        this.setCSS();
    },

    setStyles : function (styles) {

        this.underline.set({
            styles : styles,
        });
        this.render();
    },

    setCSS : function () {
        var styles = this.underline.get("styles") || {};
        
        this.$el.css({ 
            "top" : this.underline.get("top") + "px",
            "left" : this.underline.get("left") + "px",
            "height" : this.underline.get("height") + "px",
            "width" : this.underline.get("width") + "px",
        });

        // Underline part
        this.$underlineElement.css({
            "background-color" : styles.fill_color || "normal",
        });

        
        this.$underlineElement.addClass("underline");
    },

    underlineEvent : function (event) {

        event.stopPropagation();
        var underlineGroupCallback = this.underline.get("underlineGroupCallback");
        var underlineGroupContext = this.underline.get("callbackContext");
        underlineGroupContext.underlineGroupCallback(event);
    },

    setBaseUnderline : function () {

        this.$underlineElement.addClass("underline");
        this.$underlineElement.removeClass("hover-underline");
    },

    setHoverUnderline : function () {

        this.$underlineElement.addClass("hover-underline");
        this.$underlineElement.removeClass("underline");
    },
});

    // Rationale: An image annotation does NOT have a view, as we don't know the state of an image element within an EPUB; it's entirely
//   possible that an EPUB image element could have a backbone view associated with it already, which would cause problems if we 
//   tried to associate another backbone view. As such, this model modifies CSS properties for an annotated image element.
//   
//   An image annotation view that manages an absolutely position element (similar to bookmarks, underlines and highlights) can be
//   added if more functionality is required. 

EpubAnnotations.ImageAnnotation = Backbone.Model.extend({

    initialize : function (attributes, options) {

        // Set handlers here. Can use jquery handlers
        var that = this;
        var $imageElement = $(this.get("imageNode"));
        $imageElement.on("mouseenter", function () {
            that.setMouseenterBorder();
        });
        $imageElement.on("mouseleave", function () {
            that.setMouseleaveBorder();
        });
        $imageElement.on("click", function () {
            that.get("bbPageSetView").trigger("annotationClicked", "image", that.get("CFI"), that.get("id"),event);
        });
    },

    render : function () {

        this.setCSS();
    },

    setCSS : function () {
        
        $(this.get("imageNode")).css({
            "border" : "5px solid rgb(255, 0, 0)",
            "border" : "5px solid rgba(255, 0, 0, 0.2)",
            "-webkit-background-clip" : "padding-box",
            "background-clip" : "padding-box"
        });
    },

    setMouseenterBorder : function () {

        $(this.get("imageNode")).css({
            "border" : "5px solid rgba(255, 0, 0, 0.4)"
        });
    },

    setMouseleaveBorder : function () {

        $(this.get("imageNode")).css({
            "border" : "5px solid rgba(255, 0, 0, 0.2)"
        });
    }
});



    var reflowableAnnotations = new EpubAnnotations.ReflowableAnnotations({
        contentDocumentDOM : contentDocumentDOM, 
        bbPageSetView : bbPageSetView,
        annotationCSSUrl : annotationCSSUrl,
    });

    // Description: The public interface
    return {

        addSelectionHighlight : function (id, type, styles) { 
            return reflowableAnnotations.addSelectionHighlight(id, type, styles); 
        },
        addSelectionBookmark : function (id, type) { 
            return reflowableAnnotations.addSelectionBookmark(id, type); 
        },
        addSelectionImageAnnotation : function (id) {
            return reflowableAnnotations.addSelectionImageAnnotation(id);
        },
        addHighlight : function (CFI, id, type, styles) { 
            return reflowableAnnotations.addHighlight(CFI, id, type, styles); 
        },
        addBookmark : function (CFI, id, type) { 
            return reflowableAnnotations.addBookmark(CFI, id, type);
        },
        addImageAnnotation : function (CFI, id) { 
            return reflowableAnnotations.addImageAnnotation(CFI, id); 
        },
        updateAnnotationView : function (id, styles) {
            return reflowableAnnotations.updateAnnotationView(id, styles);
        },
        redraw : function () { 
            return reflowableAnnotations.redraw(); 
        },
        getBookmark : function (id) { 
            return reflowableAnnotations.annotations.getBookmark(id); 
        },
        getBookmarks : function () { 
            return reflowableAnnotations.annotations.getBookmarks(); 
        }, 
        getHighlight : function (id) { 
            return reflowableAnnotations.annotations.getHighlight(id); 
        },
        getHighlights : function () { 
            return reflowableAnnotations.annotations.getHighlights(); 
        },
        getUnderline : function (id) { 
            return reflowableAnnotations.annotations.getUnderline(id); 
        },
        getUnderlines : function () { 
            return reflowableAnnotations.annotations.getUnderlines();
        },
        getImageAnnotation : function () {

        },
        getImageAnnotations : function () {

        }, 
        removeAnnotation: function (annotationId) {
            return reflowableAnnotations.remove(annotationId);
        },
        getCurrentSelectionCFI: function () {
            return reflowableAnnotations.getCurrentSelectionCFI();
        },
        getCurrentSelectionOffsetCFI: function () {
            return reflowableAnnotations.getCurrentSelectionOffsetCFI();
        },
        removeHighlight: function (annotationId) {
            return reflowableAnnotations.removeHighlight(annotationId);
        }
    };
};

define("annotations_module", ["epubCfi"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.annotations_module;
    };
}(this)));

//  Created by Dmitry Markushevich (dmitrym@evidentpoint.com)
// 
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



# Highlighting in Readium - A primer

Please note:

- only simple text highlighting is currently supported
- it's the job of the reading system to keep track of annotations. readium-js simply displays your annotations.
- full CFIs for annotations are not currently available. We use so called "partial CFI"s, a tuple containing idref of the spine item and the CFI definition relative to the root of the spine item.

Currently, the API exposed via `ReaderView` exposes 4 functions and 1 even which should be sufficient for a simple highlighting workflow.


# API

For the purposes of the examples below, `RReader` is a previously instantiated `ReaderView` instance.


## Is anything selected (getCurrentSelectionCfi())

Before proceeding with the highlighting workflow it is sometimes necessary to determine whether the user has in fact selected anything. This can be accomplished with the following:


	> RReader.getCurrentSelectionCfi()
	Object {idref: "id-id2604743", cfi: "/4/2/6,/1:74,/1:129"}

The response contains a partial CFI that is sufficient to create a highlight based on selection. If nothing is selected *undefined* is returned. 

You can also use partial Cfi with `openSpineItemElementCfi()` to navigate to where this selection is later.

## Highlighting (addHighlight and addSelectionHighlight)

Once we've determined what needs to be highlighted (by generating a partial CFI from a selection, or having an existing partial CFI stored externally) we can add it to the reader by calling `addHighlight()`:

	> RReader.addHighlight('id-id2604743', "/4/2/6,/1:74,/1:129", 123, "highlight")
	Object {CFI: "/4/2/6,/1:74,/1:129", selectedElements: Array[1], idref: "id-id2604743"}

*addHighligh*t takes the following parameters:

- *id-id2604743* - `idref` is the idref value from `getCurrentSelectionCfi()
- * /4/2/6,/1:74,/1:129* - `cfi` is the cfi value from `getCurrentSelectionCfi()
- *123* - `id` is the unique id that defines this annotation
- *highlight* - 'type' of annotation. only 'highlight' is currently supported.

### addSelectioHighlight

Alternatively, you can call addSelectionHighlight(). It combines both getCurrentSelectionCfi() and addHighlight into one call:

	> RReader.addSelectionHighlight(124, "highlight")
	Object {CFI: "/4/2/4,/1:437,/1:503", selectedElements: Array[1], idref: "id-id2604743"}

Note that it provides no validation. If nothing is selected, `undefined` is returned.


## Removing highlights 

To remove the highlight, call `removeHighlight`:

	> RReader.removeHighlight(123)
	undefined


# Handling annotation click events

When a user clicks on a highlight `annotationClicked` event is dispatched with the following arguments:

- type of annotation
- idref of the spine item
- partial Cfi of the annotation
- annotationdId


	> RReader.on('annotationClicked', function(type, idref, cfi, annotationId) { console.log (type, idref, cfi, annotationId)});
	ReadiumSDK.Views.ReaderView {on: function, once: function, off: function, trigger: function, listenTo: function…}
	
Then when the user clicks on the highlight the following will show up in the console:

	highlight id-id2604743 /4/2/6,/1:74,/1:129 123 
	

*/


ReadiumSDK.Views.AnnotationsManager = function (proxyObj, options) {

    var self = this;
    var liveAnnotations = {};
    var spines = {};
    var proxy = proxyObj; 
    var annotationCSSUrl = options.annotationCSSUrl;

    if (!annotationCSSUrl) {
        console.warn("WARNING! Annotations CSS not supplied. Highlighting is not going to work.");
    }

    _.extend(self, Backbone.Events);

    // we want to bubble up all of the events that annotations module may trigger up.
    this.on("all", function(eventName) {
        var args = Array.prototype.slice.call(arguments);
        // mangle annotationClicked event. What really needs to happen is, the annotation_module needs to return a 
        // bare Cfi, and this class should append the idref.
        var annotationClickedEvent = 'annotationClicked';
        if (args.length && args[0] === annotationClickedEvent) {
            for (var spineIndex in liveAnnotations)
            {
                var jQueryEvent = args[4];
                var annotationId = args[3];
                var fullFakeCfi = args[2];
                var type = args[1];
                if (liveAnnotations[spineIndex].getHighlight(annotationId)) {
                    var idref = spines[spineIndex].idref;
                    var partialCfi = getPartialCfi(fullFakeCfi);
                    args = [annotationClickedEvent, type, idref, partialCfi, annotationId, jQueryEvent];
                }
            }
        }
        self['trigger'].apply(proxy, args);
    });

    this.attachAnnotations = function($iframe, spineItem) {
        var epubDocument = $iframe[0].contentDocument;
        liveAnnotations[spineItem.index] = new EpubAnnotationsModule(epubDocument, self, annotationCSSUrl);
        spines[spineItem.index] = spineItem;

        // check to see which spine indecies can be culled depending on the distance from current spine item
        for(var spineIndex in liveAnnotations) {
            if (Math.abs(spineIndex - spineIndex.index) > 3) {
                delete liveAnnotations[spineIndex];
            }
        }
    };


    this.getCurrentSelectionCfi = function() {
        for(var spine in liveAnnotations) {
            var annotationsForView = liveAnnotations[spine]; 
            var partialCfi = annotationsForView.getCurrentSelectionCFI();
            if (partialCfi) {
                return {"idref":spines[spine].idref, "cfi":partialCfi};
            }
        }
        return undefined;
    };

    this.addSelectionHighlight = function(id, type) {
        for(spine in liveAnnotations) {
            var annotationsForView = liveAnnotations[spine]; 
            if (annotationsForView.getCurrentSelectionCFI()) {
                var annotation = annotationsForView.addSelectionHighlight(id, type);
                annotation.idref = spines[spine].idref;
                return annotation;
            }
        }
        return undefined;
    };

    this.addHighlight = function(spineIdRef, partialCfi, id, type, styles) {
        for(var spine in liveAnnotations) {
            if (spines[spine].idref === spineIdRef) {
                var fakeCfi = "epubcfi(/99!" + partialCfi + ")";
                var annotationsForView = liveAnnotations[spine]; 
                var annotation = annotationsForView.addHighlight(fakeCfi, id, type, styles);
                annotation.idref = spineIdRef;
                annotation.CFI = getPartialCfi(annotation.CFI);
                return annotation;
            }
        }
        return undefined;
    };

    this.removeHighlight = function(id) {
        var result = undefined;
        for(var spine in liveAnnotations) {
            var annotationsForView = liveAnnotations[spine]; 
            result  = annotationsForView.removeHighlight(id);
        }
        return result;
    };



    function getPartialCfi(CFI) {
        var cfiWrapperPattern = new RegExp("^.*!")
        // remove epubcfi( and indirection step
        var partiallyNakedCfi = CFI.replace(cfiWrapperPattern, "");
        // remove last paren
        var nakedCfi = partiallyNakedCfi.substring(0, partiallyNakedCfi.length -1);
        return nakedCfi;
    }


};

define("annotationsManager", ["epubCfi","annotations_module"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.annotationsManager;
    };
}(this)));

//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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

ReadiumSDK.Views.ScrollView = function(options){

    _.extend(this, Backbone.Events);

    var SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE = 5;

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
    var _pageRequest;


    this.render = function(){

        var template = ReadiumSDK.Helpers.loadTemplate("reflowable_book_frame", {});

        _$el = $(template);
        _$viewport.append(_$el);

        _$contentFrame = $("#reflowable-content-frame", _$el);
        _$contentFrame.css("overflow", "");
        _$contentFrame.css("overflow-y", "auto");
        _$contentFrame.css("-webkit-overflow-scrolling", "touch");
        _$contentFrame.css("width", "100%");
        _$contentFrame.css("height", "100%");

        _$iframe = $("#epubContentIframe", _$el);
        _$iframe.css("width", "100%");
        _$iframe.css("height", "100%");

        _$iframe.css("left", "");
        _$iframe.css("right", "");
        _$iframe.css(_spine.isLeftToRight() ? "left" : "right", "0px");
        _$iframe.css("width", "100%");


        _navigationLogic = new ReadiumSDK.Views.CfiNavigationLogic(_$contentFrame, _$iframe);

        //We will call onViewportResize after user stopped resizing window
        var lazyResize = _.debounce(self.onViewportResize, 100);
        $(window).on("resize.ReadiumSDK.reflowableView", _.bind(lazyResize, self));

        var lazyScroll = _.debounce(onScroll, 100);

        _$contentFrame.scroll(function(){
            lazyScroll();
        });

        return self;
    };

    function onScroll() {

        var initiator = _pageRequest ? _pageRequest.initiator : self;
        var elementId = _pageRequest ? _pageRequest.elementId : undefined;

        _pageRequest = undefined;

        onPaginationChanged(initiator, _currentSpineItem, elementId);
    }

    function setFrameSizesToRectangle(rectangle) {
        _$contentFrame.css("left", rectangle.left);
        _$contentFrame.css("top", rectangle.top);
        _$contentFrame.css("right", rectangle.right);
        _$contentFrame.css("bottom", rectangle.bottom);

    }

    this.remove = function() {

        $(window).off("resize.ReadiumSDK.reflowableView");
        _$el.remove();
    };

    this.isReflowable = function() {
        return true;
    };

    this.onViewportResize = function() {
        resizeIFrameToContent();
        onPaginationChanged(self);
    };

    this.setViewSettings = function(settings) {

        _fontSize = settings.fontSize;

        updateHtmlFontSize();

        resizeIFrameToContent();
    };


    function registerTriggers(doc) {
        $('trigger', doc).each(function() {
            var trigger = new ReadiumSDK.Models.Trigger(this);
            trigger.subscribe(doc);

        });
    }

    function loadSpineItem(spineItem) {

        if(_currentSpineItem != spineItem) {

            _currentSpineItem = spineItem;
            _isWaitingFrameRender = true;

            self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, _$iframe, spineItem);

            _iframeLoader.loadIframe(_$iframe[0], src, onIFrameLoad, self, {spineItem : spineItem});
        }
    }

    function updateHtmlFontSize() {

        if(_$epubHtml) {
            _$epubHtml.css("font-size", _fontSize + "%");
        }
    }

    function resizeIFrameToContent() {

        if(!_$iframe || !_$epubHtml) {
            return;
        }

        var contHeight = _$epubHtml.height();
        _$iframe.css("height", contHeight + "px");
    }

    function onIFrameLoad(success) {

        _isWaitingFrameRender = false;

        //while we where loading frame new request came
        if(_deferredPageRequest && _deferredPageRequest.spineItem != _currentSpineItem) {
            loadSpineItem(_deferredPageRequest.spineItem);
            return;
        }

        if(!success) {
            _deferredPageRequest = undefined;
            return;
        }

        self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, _$iframe, _currentSpineItem);

        var epubContentDocument = _$iframe[0].contentDocument;
        _$epubHtml = $("html", epubContentDocument);

        self.applyBookStyles();

        updateHtmlFontSize();

        self.applyStyles();

        setTimeout(function(){
            resizeIFrameToContent();
            openDeferredElement();
        }, 50);

        applySwitches(epubContentDocument);
        registerTriggers(epubContentDocument);

    }

    function openDeferredElement() {

        if(!_deferredPageRequest) {
            return;
        }

        var deferredData = _deferredPageRequest;
        _deferredPageRequest = undefined;
        self.openPage(deferredData);

    }

    this.applyStyles = function() {

        ReadiumSDK.Helpers.setStyles(_userStyles.getStyles(), _$el.parent());

        //because left, top, bottom, right setting ignores padding of parent container
        //we have to take it to account manually
        var elementMargins = ReadiumSDK.Helpers.Margins.fromElement(_$el);
        setFrameSizesToRectangle(elementMargins.padding);

    };

    this.applyBookStyles = function() {

        if(_$epubHtml) {
            ReadiumSDK.Helpers.setStyles(_bookStyles.getStyles(), _$epubHtml);
        }
    };


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

        var topOffset = 0;
        var pageCount;
        var $element;

        if(pageRequest.scrollTop !== undefined) {

            topOffset = pageRequest.scrollTop;
        }
        else if(pageRequest.spineItemPageIndex !== undefined) {

            var pageIndex;
            pageCount = calculatePageCount();
            if(pageRequest.spineItemPageIndex < 0) {
                pageIndex = 0;
            }
            else if(pageRequest.spineItemPageIndex >= pageCount) {
                pageIndex = pageCount - 1;
            }
            else {
                pageIndex = pageRequest.spineItemPageIndex;
            }

            topOffset = pageIndex * viewHeight();
        }
        else if(pageRequest.elementId) {

            $element = _navigationLogic.getElementById(pageRequest.elementId);

            if(!$element) {
                console.warn("Element id=" + pageRequest.elementId + " not found!");
                return;
            }

            topOffset = _navigationLogic.getVerticalOffsetForElement($element);
        }
        else if(pageRequest.elementCfi) {

            try
            {
                $element = _navigationLogic.getElementByCfi(pageRequest.elementCfi,
                    ["cfi-marker", "mo-cfi-highlight"],
                    [],
                    ["MathJax_Message"]);
            }
            catch (e)
            {
                $element = undefined;
                console.error(e);
            }

            if(!$element) {
                console.warn("Element cfi=" + pageRequest.elementCfi + " not found!");
                return;
            }

            topOffset = _navigationLogic.getVerticalOffsetForElement($element);
        }
        else if(pageRequest.firstPage) {

            topOffset = 0;
        }
        else if(pageRequest.lastPage) {
            pageCount = calculatePageCount();

            if(pageCount === 0) {
                return;
            }

            topOffset = scrollHeight() - viewHeight() - 5;
        }
        else {
            console.debug("No criteria in pageRequest");
        }

        if(scrollTop() != topOffset ) {
            //store request for onScroll event
            _pageRequest = pageRequest;
            scrollTo(topOffset);
        }
    };

    function scrollTo(offset) {
        _$contentFrame.animate({
            scrollTop: offset
        }, 50);
    }

    function calculatePageCount() {

        return Math.ceil(scrollHeight() / viewHeight());
    }

    // Description: Parse the epub "switch" tags and hide
    // cases that are not supported
    function applySwitches(dom) {

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
    }


    function onPaginationChanged(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        self.trigger(ReadiumSDK.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: self.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
    }

    function scrollTop() {
        return  _$contentFrame.scrollTop()
    }

    function scrollBottom() {
        return scrollHeight() - (scrollTop() + viewHeight());
    }

    function getCurrentPageIndex() {

        return Math.ceil(scrollTop() / _$contentFrame.height());
    }

    function viewHeight() {
        return _$contentFrame.height();
    }

    function scrollHeight() {
        return _$contentFrame[0].scrollHeight;
    }

    this.openPagePrev = function (initiator) {

        if(!_currentSpineItem) {
            return;
        }

        var pageRequest;

        if(scrollTop() > 0) {

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(_currentSpineItem, initiator);
            pageRequest.scrollTop = scrollTop() - (viewHeight() - SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE);
            if(pageRequest.scrollTop < 0) {
                pageRequest.scrollTop = 0;
            }

        }
        else {

            var prevSpineItem = _spine.prevItem(_currentSpineItem);
            if(prevSpineItem) {

                pageRequest = new ReadiumSDK.Models.PageOpenRequest(prevSpineItem, initiator);
                pageRequest.scrollTop = scrollHeight() - viewHeight();
            }

        }

        if(pageRequest) {
            self.openPage(pageRequest);
        }
    };

    this.openPageNext = function (initiator) {

        if(!_currentSpineItem) {
            return;
        }

        var pageRequest;

        if(scrollBottom() > 0) {

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(_currentSpineItem, initiator);
            pageRequest.scrollTop = scrollTop() + Math.min(scrollBottom(), viewHeight() - SCROLL_MARGIN_TO_SHOW_LAST_VISBLE_LINE);

        }
        else {

            var nextSpineItem = _spine.nextItem(_currentSpineItem);
            if(nextSpineItem) {

                pageRequest = new ReadiumSDK.Models.PageOpenRequest(nextSpineItem, initiator);
                pageRequest.scrollTop = 0;
            }
        }

        if(pageRequest) {
            self.openPage(pageRequest);
        }
    };


    this.getFirstVisibleElementCfi = function() {

        return _navigationLogic.getFirstVisibleElementCfi(scrollTop());
    };

    this.getPaginationInfo = function() {

        var paginationInfo = new ReadiumSDK.Models.CurrentPagesInfo(_spine.items.length, false, _spine.direction);

        if(!_currentSpineItem) {
            return paginationInfo;
        }

        paginationInfo.addOpenPage(getCurrentPageIndex(), calculatePageCount(), _currentSpineItem.idref, _currentSpineItem.index);

        return paginationInfo;

    };


    this.bookmarkCurrentPage = function() {

        if(!_currentSpineItem) {

            return new ReadiumSDK.Models.BookmarkData("", "");
        }

        return new ReadiumSDK.Models.BookmarkData(_currentSpineItem.idref, self.getFirstVisibleElementCfi());
    };


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
    
    this.getElement = function(spineItem, selector) {

        if(spineItem != _currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return _navigationLogic.getElement(selector);
    };

    this.getFirstVisibleMediaOverlayElement = function() {

        return _navigationLogic.getFirstVisibleMediaOverlayElement(visibleOffsets());
    };

    function visibleOffsets() {

        return {

            top: scrollTop(),
            bottom: scrollTop() + viewHeight()
        }
    }

    this.insureElementVisibility = function(element, initiator) {

        var $element = $(element);


        if(_navigationLogic.getElementVisibility($element, visibleOffsets()) > 0) {
            return;
        }

        var page = _navigationLogic.getPageForElement($element);

        if(page == -1) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(_currentSpineItem, initiator);
        openPageRequest.setPageIndex(page);

        self.openPage(openPageRequest);
    }

};

define("scrollView", ["readiumSDK","cfiNavigationLogic","bookmarkData","triggers","onePageView"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.scrollView;
    };
}(this)));

//  Created by Boris Schneiderman.
// Modified by Daniel Weck
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
ReadiumSDK.Views.ReaderView = function(options) {

    _.extend(this, Backbone.Events);

    var self = this;
    var _currentView = undefined;
    var _package = undefined;
    var _spine = undefined;
    var _viewerSettings = new ReadiumSDK.Models.ViewerSettings({});
    //styles applied to the container divs
    var _userStyles = new ReadiumSDK.Collections.StyleCollection();
    //styles applied to the content documents
    var _bookStyles = new ReadiumSDK.Collections.StyleCollection();
    var _internalLinksSupport = new ReadiumSDK.Views.InternalLinksSupport(this);
    var _mediaOverlayPlayer;
    var _mediaOverlayDataInjector;
    var _iframeLoader;
    var _$el;
    var _annotationsManager = new ReadiumSDK.Views.AnnotationsManager(self, options);
    
    if (options.el instanceof $) {
        _$el = options.el;
        console.log("** EL is a jQuery selector:" + options.el.attr('id'));
    } else {
        _$el = $(options.el);
        console.log("** EL is a string:" + _$el.attr('id'));
    }

    if(options.iframeLoader) {
        _iframeLoader = options.iframeLoader;
    }
    else {
        _iframeLoader = new ReadiumSDK.Views.IFrameLoader();
    }

    // returns true is view changed
    function initViewForItem(spineItem) {

        var desiredViewType;

        if(_viewerSettings.isScrollViewDoc || _viewerSettings.isScrollViewContinuous) {
            desiredViewType = ReadiumSDK.Views.ScrollView;
        }
        else if(spineItem.isFixedLayout()) {
            desiredViewType = ReadiumSDK.Views.FixedView;
        }
        //we don't support scroll continues yet we will create scroll doc instead
        else if(spineItem.isScrolledDoc() || spineItem.isScrolledContinuous()) {
            desiredViewType = ReadiumSDK.Views.ScrollView;
        }
        else {
            desiredViewType = ReadiumSDK.Views.ReflowableView;
        }

        if(_currentView) {
            //current view is already rendered
            if(_currentView instanceof desiredViewType) {
                return false;
            }

            resetCurrentView();
        }

        var viewCreationParams = {
            $viewport: _$el,
            spine: _spine,
            userStyles: _userStyles,
            bookStyles: _bookStyles,
            iframeLoader: _iframeLoader
        };


        _currentView = new desiredViewType(viewCreationParams);


        _currentView.setViewSettings(_viewerSettings);

        _currentView.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
            _mediaOverlayPlayer.onDocLoadStart();
        });

        _currentView.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function($iframe, spineItem) {

            _mediaOverlayDataInjector.attachMediaOverlayData($iframe, spineItem, _viewerSettings);
            
            _internalLinksSupport.processLinkElements($iframe, spineItem);
            _annotationsManager.attachAnnotations($iframe, spineItem);

            self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);
        });

        _currentView.on(ReadiumSDK.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED, function( pageChangeData ){

            //we call on onPageChanged explicitly instead of subscribing to the ReadiumSDK.Events.PAGINATION_CHANGED by
            //mediaOverlayPlayer because we hve to guarantee that mediaOverlayPlayer will be updated before the host
            //application will be notified by the same ReadiumSDK.Events.PAGINATION_CHANGED event
            _mediaOverlayPlayer.onPageChanged(pageChangeData);

            self.trigger(ReadiumSDK.Events.PAGINATION_CHANGED, pageChangeData);
        });

        _currentView.render();

        return true;
    }

    this.getLoadedSpineItems = function() {

        if(_currentView) {
            return _currentView.getLoadedSpineItems();
        }

        return [];
    };

    function resetCurrentView() {

        if(!_currentView) {
            return;
        }

        _currentView.off(ReadiumSDK.InternalEvents.CURRENT_VIEW_PAGINATION_CHANGED);

        _currentView.remove();
        _currentView = undefined;
    }

    this.viewerSettings = function() {
        return _viewerSettings;
    };

    this.package = function() {
        return _package;
    };

    this.spine = function() {
        return _spine;
    };

    this.userStyles = function() {
        return _userStyles;
    };

    /**
     * Triggers the process of opening the book and requesting resources specified in the packageData
     *
     * @method openBook
     * @param openBookData object with open book data:
     *
     *     openBookData.package: packageData, (required)
     *     openBookData.openPageRequest: openPageRequestData, (optional) data related to open page request
     *     openBookData.settings: readerSettings, (optional)
     *     openBookData.styles: cssStyles (optional)
     *
     *
     */
    this.openBook = function(openBookData) {

		var packageData = openBookData.package ? openBookData.package : openBookData;

        _package = new ReadiumSDK.Models.Package(packageData);

        _spine = _package.spine;

        if(_mediaOverlayPlayer) {
            
            _mediaOverlayPlayer.reset();
        }

        _mediaOverlayPlayer = new ReadiumSDK.Views.MediaOverlayPlayer(self, $.proxy(onMediaPlayerStatusChanged, self));

        _mediaOverlayDataInjector = new ReadiumSDK.Views.MediaOverlayDataInjector(_package.media_overlay, _mediaOverlayPlayer);


        resetCurrentView();

        if(openBookData.settings) {
            self.updateSettings(openBookData.settings);
        }

        if(openBookData.styles) {
            self.setStyles(openBookData.styles);
        }

        if(openBookData.openPageRequest) {

            var pageRequestData = openBookData.openPageRequest;

            if(pageRequestData.idref) {

                if(pageRequestData.spineItemPageIndex) {
                    self.openSpineItemPage(pageRequestData.idref, pageRequestData.spineItemPageIndex, self);
                }
                else if(pageRequestData.elementCfi) {
                    self.openSpineItemElementCfi(pageRequestData.idref, pageRequestData.elementCfi, self);
                }
                else {
                    self.openSpineItemPage(pageRequestData.idref, 0, self);
                }
            }
            else if(pageRequestData.contentRefUrl && pageRequestData.sourceFileHref) {
                self.openContentUrl(pageRequestData.contentRefUrl, pageRequestData.sourceFileHref, self);
            }
            else {
                console.log("Invalid page request data: idref required!");
            }
        }
        else {// if we where not asked to open specific page we will open the first one

            var spineItem = _spine.first();
            if(spineItem) {
                var pageOpenRequest = new ReadiumSDK.Models.PageOpenRequest(spineItem, self);
                pageOpenRequest.setFirstPage();
                openPage(pageOpenRequest);
            }

        }

    };

    function onMediaPlayerStatusChanged(status) {
        self.trigger(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, status);
    }

    /**
     * Flips the page from left to right. Takes to account the page progression direction to decide to flip to prev or next page.
     * @method openPageLeft
     */
    this.openPageLeft = function() {

        if(_package.spine.isLeftToRight()) {
            self.openPagePrev();
        }
        else {
            self.openPageNext();
        }
    };

    /**
     * Flips the page from right to left. Takes to account the page progression direction to decide to flip to prev or next page.
     * @method openPageRight
     */
    this.openPageRight = function() {

        if(_package.spine.isLeftToRight()) {
            self.openPageNext();
        }
        else {
            self.openPagePrev();
        }

    };

    /**
     * Updates reader view based on the settings specified in settingsData object
     * @param settingsData
     */
    this.updateSettings = function(settingsData) {

//console.debug("UpdateSettings: " + JSON.stringify(settingsData));

        _viewerSettings.update(settingsData);

        if(_currentView && !settingsData.doNotUpdateView) {

            var bookMark = _currentView.bookmarkCurrentPage();

            if(bookMark) {

                var spineItem = _spine.getItemById(bookMark.idref);
                var isViewChanged = initViewForItem(spineItem);

                if(!isViewChanged) {
                    _currentView.setViewSettings(_viewerSettings);
                }

                self.openSpineItemElementCfi(bookMark.idref, bookMark.contentCFI, self);
            }
        }

        self.trigger(ReadiumSDK.Events.SETTINGS_APPLIED);
    };

    /**
     * Opens the next page.
     */
    this.openPageNext = function() {

        var paginationInfo = _currentView.getPaginationInfo();

        if(paginationInfo.openPages.length == 0) {
            return;
        }

        var lastOpenPage = paginationInfo.openPages[paginationInfo.openPages.length - 1];

        if(lastOpenPage.spineItemPageIndex < lastOpenPage.spineItemPageCount - 1) {
            _currentView.openPageNext(this);
            return;
        }

        var currentSpineItem = _spine.getItemById(lastOpenPage.idref);

        var nextSpineItem = _spine.nextItem(currentSpineItem);

        if(!nextSpineItem) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(nextSpineItem, self);
        openPageRequest.setFirstPage();

        openPage(openPageRequest);
    };

    /**
     * Opens the previews page.
     */
    this.openPagePrev = function() {

        var paginationInfo = _currentView.getPaginationInfo();

        if(paginationInfo.openPages.length == 0) {
            return;
        }

        var firstOpenPage = paginationInfo.openPages[0];

        if(firstOpenPage.spineItemPageIndex > 0) {
            _currentView.openPagePrev(self);
            return;
        }

        var currentSpineItem = _spine.getItemById(firstOpenPage.idref);

        var prevSpineItem = _spine.prevItem(currentSpineItem);

        if(!prevSpineItem) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(prevSpineItem, self);
        openPageRequest.setLastPage();

        openPage(openPageRequest);
    };

    function getSpineItem(idref) {

        if(!idref) {

            console.log("idref parameter value missing!");
            return undefined;
        }

        var spineItem = _spine.getItemById(idref);
        if(!spineItem) {
            console.log("Spine item with id " + idref + " not found!");
            return undefined;
        }

        return spineItem;

    }

    /**
     * Opens the page of the spine item with element with provided cfi
     *
     * @method openSpineItemElementCfi
     *
     * @param {string} idref Id of the spine item
     * @param {string} elementCfi CFI of the element to be shown
     * @param {object} initiator optional
     */
    this.openSpineItemElementCfi = function(idref, elementCfi, initiator) {

        var spineItem = getSpineItem(idref);

        if(!spineItem) {
            return;
        }

        var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem, initiator);
        if(elementCfi) {
            pageData.setElementCfi(elementCfi);
        }

        openPage(pageData);
    };


    /**
     *
     * Opens specified page index of the current spine item
     *
     * @method openPageIndex
     *
     * @param {number} pageIndex Zero based index of the page in the current spine item
     * @param {object} initiator optional
     */
    this.openPageIndex = function(pageIndex, initiator) {

        if(!_currentView) {
            return;
        }

        var pageRequest;
        var spineItem = _spine.items[pageIndex];
        if(!spineItem) {
            return;
        }


        if(_package.isFixedLayout()) {
            var spineItem = _spine.items[pageIndex];
            if(!spineItem) {
                return;
            }

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(spineItem, initiator);
            pageRequest.setPageIndex(0);
        }
        else {

            var spineItems = this.getLoadedSpineItems();
            if(spineItems.length > 0) {
                pageRequest = new ReadiumSDK.Models.PageOpenRequest(spineItems[0], initiator);
                pageRequest.setPageIndex(pageIndex);
            }
        }

        openPage(pageRequest);
    };

    function openPage(pageRequest) {

        initViewForItem(pageRequest.spineItem);
        _currentView.openPage(pageRequest);
    }


    /**
     *
     * Opens page index of the spine item with idref provided
     *
     * @param {string} idref Id of the spine item
     * @param {number} pageIndex Zero based index of the page in the spine item
     * @param {object} initiator optional
     */
    this.openSpineItemPage = function(idref, pageIndex, initiator) {

        var spineItem = getSpineItem(idref);

        if(!spineItem) {
            return;
        }

        var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem, initiator);
        if(pageIndex) {
            pageData.setPageIndex(pageIndex);
        }

        openPage(pageData);
    };

    /**
     * Set CSS Styles to the reader container
     *
     * @method setStyles
     *
     * @param styles {object} style object contains selector property and declarations object
     */
    this.setStyles = function(styles, doNotUpdateView) {

        var count = styles.length;

        for(var i = 0; i < count; i++) {
            if (styles[i].declarations)
            {
                _userStyles.addStyle(styles[i].selector, styles[i].declarations);
            }
            else
            {
                _userStyles.removeStyle(styles[i].selector);
            }
        }

        applyStyles(doNotUpdateView);

    };

    /**
     * Set CSS Styles to the content documents
     *
     * @method setBookStyles
     *
     * @param styles {object} style object contains selector property and declarations object
     */
    this.setBookStyles = function(styles) {

        var count = styles.length;

        for(var i = 0; i < count; i++) {
            _bookStyles.addStyle(styles[i].selector, styles[i].declarations);
        }

        if(_currentView) {
            _currentView.applyBookStyles();
        }

    };

    this.getElement = function(spineItem, selector) {

        if(_currentView) {
            return _currentView.getElement(spineItem, selector);
        }

        return undefined;

    };

    this.getElementByCfi = function(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist) {

        if(_currentView) {
            return _currentView.getElementByCfi(spineItem, cfi, classBlacklist, elementBlacklist, idBlacklist);
        }

        return undefined;

    };

    function applyStyles(doNotUpdateView) {

        ReadiumSDK.Helpers.setStyles(_userStyles.getStyles(), _$el);

        if (_mediaOverlayPlayer)
            _mediaOverlayPlayer.applyStyles();

        if(doNotUpdateView) return;

        if(_currentView) {
            _currentView.applyStyles();
        }
    }

    //TODO: this is public function - should be JS Doc-ed
    this.mediaOverlaysOpenContentUrl = function(contentRefUrl, sourceFileHref, offset) {
        _mediaOverlayPlayer.mediaOverlaysOpenContentUrl(contentRefUrl, sourceFileHref, offset);
    };


    /**
     * Opens the content document specified by the url
     *
     * @method openContentUrl
     *
     * @param {string} contentRefUrl Url of the content document
     * @param {string | undefined} sourceFileHref Url to the file that contentRefUrl is relative to. If contentRefUrl is
     * relative ot the source file that contains it instead of the package file (ex. TOC file) We have to know the
     * sourceFileHref to resolve contentUrl relative to the package file.
     * @param {object} initiator optional
     */
    this.openContentUrl = function(contentRefUrl, sourceFileHref, initiator) {

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
//console.debug("============ openContentUrl - hrefPart: " + hrefPart);

        var spineItem = _spine.getItemByHref(hrefPart);
        if(!spineItem) {
            return;
        }

        self.openSpineItemElementId(spineItem.idref, elementId, initiator);

//console.debug("------- openContentUrl - elementId: " + elementId);

    };

    /**
     * Opens the page of the spine item with element with provided cfi
     *
     * @method openSpineItemElementId
     *
     * @param {string} idref Id of the spine item
     * @param {string} elementId id of the element to be shown
     * @param {object} initiator optional
     */
    this.openSpineItemElementId = function(idref, elementId, initiator) {

        var spineItem = _spine.getItemById(idref);
        if(!spineItem) {
            return;
        }

        var pageData = new ReadiumSDK.Models.PageOpenRequest(spineItem, initiator);

        if(elementId){
            pageData.setElementId(elementId);
        }


        openPage(pageData);
    };

    /**
     *
     * Returns the bookmark associated with currently opened page.
     *
     * @method bookmarkCurrentPage
     *
     * @returns {string} Stringified ReadiumSDK.Models.BookmarkData object.
     */
    this.bookmarkCurrentPage = function() {
        return JSON.stringify(_currentView.bookmarkCurrentPage());
    };

    /**
     * Resets all the custom styles set by setStyle callers at runtime
     *
     * @method clearStyles
     */
    this.clearStyles = function() {

        _userStyles.resetStyleValues();
        applyStyles();
        _userStyles.clear();
    };

    /**
     * Resets all the custom styles set by setBookStyle callers at runtime
     *
     * @method clearBookStyles
     */
    this.clearBookStyles = function() {

        if(_currentView) {

            _bookStyles.resetStyleValues();
            _currentView.applyBookStyles();
        }

        _bookStyles.clear();
    };

    /**
     *
     * Returns true if media overlay available for one of the open pages.
     *
     * @method isMediaOverlayAvailable
     *
     * @returns {boolean}
     */
    this.isMediaOverlayAvailable = function() {

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
     *
     */
    this.toggleMediaOverlay = function() {

        _mediaOverlayPlayer.toggleMediaOverlay();
    };


    /**
    * Plays next fragment media overlay
    *
    */
   this.nextMediaOverlay = function() {

        _mediaOverlayPlayer.nextMediaOverlay();

   };

    /**
     * Plays previous fragment media overlay
     *
     */
    this.previousMediaOverlay = function() {

        _mediaOverlayPlayer.previousMediaOverlay();

    };

    /**
     * Plays next available fragment media overlay that is outside of the current escapable scope
     *
     */
    this.escapeMediaOverlay = function() {

        _mediaOverlayPlayer.escape();
    };

    this.ttsEndedMediaOverlay = function() {

        _mediaOverlayPlayer.onTTSEnd();
    };

    this.pauseMediaOverlay = function() {

        _mediaOverlayPlayer.pause();
    };

    this.playMediaOverlay = function() {

        _mediaOverlayPlayer.play();
    };

    this.isPlayingMediaOverlay = function() {

        return _mediaOverlayPlayer.isPlaying();
    };
    
//
// should use ReadiumSDK.Events.SETTINGS_APPLIED instead!
//    this.setRateMediaOverlay = function(rate) {
//
//        _mediaOverlayPlayer.setRate(rate);
//    };
//    this.setVolumeMediaOverlay = function(volume){
//
//        _mediaOverlayPlayer.setVolume(volume);
//    };


    this.getFirstVisibleMediaOverlayElement = function() {

        if(_currentView) {
            return _currentView.getFirstVisibleMediaOverlayElement();
        }

        return undefined;
    };

    this.insureElementVisibility = function(element, initiator) {

        if(_currentView) {
            _currentView.insureElementVisibility(element, initiator);
        }
    }

    this.handleViewportResize = function(){
        if (_currentView){
            _currentView.onViewportResize();
        }
    }

    /**
     * Returns current selection partial Cfi, useful for workflows that need to check whether the user has selected something.
     *
     * @method getCurrentSelectionCfi
     * @returns {object | undefined} partial cfi object or undefined if nothing is selected
    *
     */

    this.getCurrentSelectionCfi =  function() {
        return _annotationsManager.getCurrentSelectionCfi();
    };

    /**
     * Creates a higlight based on given parameters
     *
     * @method addHighlight
     * @param {string} spineIdRef spine idref that defines the partial Cfi
     * @param {string} CFI partial CFI (withouth the indirection step) relative to the spine index
     * @param {string} id id of the highlight. must be unique
     * @param {string} type currently "highlight" only
     *
     * @returns {object | undefined} partial cfi object of the created highlight
    *
     */

    this.addHighlight = function(spineIdRef, Cfi, id, type, styles) {
        return _annotationsManager.addHighlight(spineIdRef, Cfi, id, type, styles) ;
    };


    /**
     * Creates a higlight based on current selection
     *
     * @method addSelectionHighlight
     * @param {string} id id of the highlight. must be unique
     * @param {string} type currently "highlight" only
     *
     * @returns {object | undefined} partial cfi object of the created highlight
    *
     */

    this.addSelectionHighlight =  function(id, type) {
        return _annotationsManager.addSelectionHighlight(id,type);
    };

    /**
     * Removes given highlight
     *
     * @method removeHighlight
     * @param {string} id id of the highlight.
     *
     * @returns {undefined}
    *
     */

    this.removeHighlight = function(id) {
        return _annotationsManager.removeHighlight(id);
    };

    /**
     * Lets user to subscribe to iframe's window events
     *
     * @method addIFrameEventsListener
     * @param {string} eventName event name.
     * @param {string} callback callback function.
     * @param {string} context user specified data passed to the callback function.
     *
     * @returns {undefined}
     */
    this.addIFrameEventListener = function(eventName, callback, context) {
        _iframeLoader.addIFrameEventListener(eventName, callback, context);
    }

};

define("readerView", ["backbone","readiumSDK","helpers","viewerSettings","styleCollection","package","mediaOverlayPlayer","pageOpenRequest","fixedView","reflowableView","mediaOvelayDataInjector","internalLinksSupport","iframeLoader","annotationsManager","scrollView","URIjs"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.readerView;
    };
}(this)));

define(
    'epub-fetch/markup_parser',[],function () {

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

define('epub-fetch/discover_content_type',['require', 'module', 'jquery', 'backbone', 'URIjs'], function (require, module, $, Backbone, URI) {
    console.log('discover_content_type module id: ' + module.id);

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

define('epub-fetch/plain_resource_fetcher',['require', 'module', 'jquery', 'URIjs', './discover_content_type'], function (require, module, $, URI, ContentTypeDiscovery) {

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
                url: fileUrl,
                dataType: 'text',
                async: true,
                success: function (result) {
                    fetchCallback(result);
                },
                error: function (xhr, status, errorThrown) {
                    console.error('Error when AJAX fetching ' + fileUrl);
                    console.error(status);
                    console.error(errorThrown);
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

        this.relativeToPackageFetchFileContents = function (pathRelativeToPackageRoot, fetchMode, fetchCallback, onerror) {
            // TODO: implement other (binary) fetch modes
            self.fetchFileContentsText(pathRelativeToPackageRoot, fetchCallback, onerror);
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

define('epub-fetch/zip_resource_fetcher',['require', 'module', 'jquery', 'URIjs', './discover_content_type'], function (require, module, $, URI, ContentTypeDiscovery) {

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

                zip.workerScriptsPath = libDir;
                _zipFs = new zip.fs.FS();
                _zipFs.importHttpContent(baseUrl, true, function () {

                    callback(_zipFs, onerror);

                }, onerror)
            }
        }

        function fetchFileContents (relativePathRelativeToPackageRoot, readCallback, onerror) {

            if (typeof relativePathRelativeToPackageRoot === 'undefined') {
                throw 'Fetched file relative path is undefined!';
            }

            withZipFsPerform(function (zipFs, onerror) {
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
            }, onerror);
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

define('epub-fetch/resource_cache',[],function () {

        var ResourceCache = function () {

            var self = this;
            var _resourcesHash = {};

            this.getResourceURL = function (resourceAbsoluteHref) {
                var resourceObjectUrl = _resourcesHash[resourceAbsoluteHref];
                return resourceObjectUrl;
            };

            this.putResourceURL = function (resourceAbsoluteHref, resourceObjectUrl) {
                _resourcesHash[resourceAbsoluteHref] = resourceObjectUrl;
            };
            // TODO: methods to evict resource, destroy cache and release object URLs using window.URL.revokeObjectURL(), automatic
            // cache size accounting and management algorithms like LRU.
        };

        return ResourceCache;
    });

define('epub-fetch/publication_fetcher',['require', 'module', 'jquery', 'URIjs', './markup_parser', './discover_content_type', './plain_resource_fetcher',
    './zip_resource_fetcher', './resource_cache'],
    function (require, module, $, URI, MarkupParser, ContentTypeDiscovery, PlainResourceFetcher, ZipResourceFetcher,
              ResourceCache) {

    var ResourceFetcher = function(rootUrl, libDir) {

        var self = this;

        ResourceFetcher.contentTypePackageReadStrategyMap = {
            'application/oebps-package+xml': 'exploded',
            'application/epub+zip': 'zipped',
            'application/zip': 'zipped'
        };

        var ENCRYPTION_METHODS = {
            'http://www.idpf.org/2008/embedding': embeddedFontDeobfuscateIdpf,
            'http://ns.adobe.com/pdf/enc#RC': embeddedFontDeobfuscateAdobe
        };
        var _isExploded;
        var _dataFetcher;
        var _packageFullPath;
        var _packageDom;
        var _packageDomInitializationDeferred;
        var _encryptionDom;
        var _encryptionHash;
        var _packageJson;

        this.markupParser = new MarkupParser();

        this.initialize =  function(callback) {

            _isExploded = isExploded();

            createDataFetcher(_isExploded, callback);
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
            return rootUrl.indexOf(ext, rootUrl.length - ext.length) === -1;
        }

        function createDataFetcher(isExploded, callback) {
            if (isExploded) {
                console.log('using new PlainResourceFetcher');
                _dataFetcher = new PlainResourceFetcher(self, rootUrl);
                _dataFetcher.initialize(function () {
                    callback(_dataFetcher);
                });
                return;
            } else {
                console.log('using new ZipResourceFetcher');
                _dataFetcher = new ZipResourceFetcher(self, rootUrl, libDir);
                callback(_dataFetcher);
            }
        }

        function fetchResourceForElement(resolvedElem, refAttrOrigVal, refAttr, contentDocumentURI, fetchMode,
                                         resolutionDeferreds, onerror, resourceDataPreprocessing) {
            var resourceUriRelativeToPackageDocument = (new URI(refAttrOrigVal)).absoluteTo(contentDocumentURI).toString();

            var ownerDocument;
            if (resolvedElem.ownerDocument) {
                ownerDocument = resolvedElem.ownerDocument;
            }
            if (resolvedElem[0] && resolvedElem[0].ownerDocument) {
                ownerDocument = resolvedElem[0].ownerDocument;
            }

            var documentResourcesCache = obtainDocumentResourcesCache(ownerDocument);
            var cachedResourceUrl = documentResourcesCache.getResourceURL(resourceUriRelativeToPackageDocument);
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

                self.relativeToPackageFetchFileContents(resourceUriRelativeToPackageDocument, fetchMode, function (resourceData) {

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
                        documentResourcesCache.putResourceURL(resourceUriRelativeToPackageDocument, resourceObjectURL);
                        // TODO: take care of releasing object URLs when no longer needed
                        replaceRefAttrInElem(resourceObjectURL);
                        resolutionDeferred.resolve();
                    };

                    if (resourceDataPreprocessing) {
                        resourceDataPreprocessing(resourceData, resourceUriRelativeToPackageDocument, ownerDocument,
                            replaceResourceURL);
                    } else {
                        replaceResourceURL(resourceData);
                    }
                }, onerror);
            }
        }

        function fetchResourceForCssUrlMatch(cssUrlMatch, cssResourceDownloadDeferreds,
                                             styleSheetUriRelativeToPackageDocument, stylesheetCssResourceUrlsMap,
                                             contextDocument, isStyleSheetResource) {
            var origMatchedUrlString = cssUrlMatch[0];
            var extractedUrl = cssUrlMatch[2];
            var extractedUri = new URI(extractedUrl);
            var isCssUrlRelative = extractedUri.scheme() === '';
            if (!isCssUrlRelative) {
                // Absolute URLs don't need programmatic fetching
                return;
            }
            var resourceUriRelativeToPackageDocument = (new URI(extractedUrl)).absoluteTo(styleSheetUriRelativeToPackageDocument).toString();

            var documentResourcesCache = obtainDocumentResourcesCache(contextDocument);
            var cachedResourceURL = documentResourcesCache.getResourceURL(resourceUriRelativeToPackageDocument);


            if (cachedResourceURL) {
                stylesheetCssResourceUrlsMap[origMatchedUrlString] = {
                    isStyleSheetResource: isStyleSheetResource,
                    resourceObjectURL:  cachedResourceURL
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
                    documentResourcesCache.putResourceURL(resourceUriRelativeToPackageDocument, resourceObjectURL);
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
                    fetchCallback = function(styleSheetResourceData) {
                        preprocessCssStyleSheetData(styleSheetResourceData, resourceUriRelativeToPackageDocument,
                            contextDocument, function(preprocessedStyleSheetData) {
                                var resourceDataBlob = new Blob([preprocessedStyleSheetData], {type: 'text/css'});
                                processedBlobCallback(resourceDataBlob);
                            })
                    }
                } else {
                    fetchMode = 'blob';
                    fetchCallback = processedBlobCallback;
                }

                self.relativeToPackageFetchFileContents(resourceUriRelativeToPackageDocument, fetchMode,  fetchCallback, fetchErrorCallback);
            }
        }

        function preprocessCssStyleSheetData(styleSheetResourceData, styleSheetUriRelativeToPackageDocument,
                                             contextDocument, callback) {
            // TODO: regexp probably invalid for url('someUrl"ContainingQuote'):
            var cssUrlRegexp = /[Uu][Rr][Ll]\(\s*(['"]?)([^']+)\1\s*\)/g;
            var nonUrlCssImportRegexp = /@[Ii][Mm][Pp][Oo][Rr][Tt]\s*(['"])([^"']+)\1/g;
            var stylesheetCssResourceUrlsMap = {};
            var cssResourceDownloadDeferreds = [];
            // Go through the stylesheet text using all regexps and process according to those regexp matches, if any:
            [nonUrlCssImportRegexp, cssUrlRegexp].forEach(function(processingRegexp) {
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
                        styleSheetUriRelativeToPackageDocument, stylesheetCssResourceUrlsMap,
                        contextDocument, isStyleSheetResource);
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
                        var origMatchedUrlStringEscaped = origMatchedUrlString.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
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

        function resolveResourceElements(elemName, refAttr, fetchMode, contentDocumentDom, contentDocumentURI,
                                         resolutionDeferreds, onerror, resourceDataPreprocessing) {

            var resolvedElems = $(elemName + '[' + refAttr + ']', contentDocumentDom);

            resolvedElems.each(function (index, resolvedElem) {
                var refAttrOrigVal = $(resolvedElem).attr(refAttr);
                var refAttrUri = new URI(refAttrOrigVal);

                if (refAttrUri.scheme() === '') {
                    // Relative URI, fetch from packed EPUB archive:

                    fetchResourceForElement(resolvedElem, refAttrOrigVal, refAttr, contentDocumentURI, fetchMode,
                        resolutionDeferreds, onerror, resourceDataPreprocessing);
                }
            });
        }

        function resolveDocumentImages(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror) {
            resolveResourceElements('img', 'src', 'blob', contentDocumentDom, contentDocumentURI, resolutionDeferreds,
                onerror);
        }

        function resolveDocumentLinkStylesheets(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror) {
            resolveResourceElements('link', 'href', 'text', contentDocumentDom, contentDocumentURI, resolutionDeferreds,
                onerror, preprocessCssStyleSheetData);
        }

        function resolveDocumentEmbeddedStylesheets(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror) {
            var resolvedElems = $('style', contentDocumentDom);
            resolvedElems.each(function (index, resolvedElem) {
                var resolutionDeferred = $.Deferred();
                resolutionDeferreds.push(resolutionDeferred);
                var styleSheetData = $(resolvedElem).text();
                var styleSheetUriRelativeToPackageDocument = contentDocumentURI;
                preprocessCssStyleSheetData(styleSheetData, styleSheetUriRelativeToPackageDocument,
                    contentDocumentDom, function(resolvedStylesheetData) {
                        $(resolvedElem).text(resolvedStylesheetData);
                        resolutionDeferred.resolve();
                    });
            });
        }

        /**
         * Obtain the reference to the ResourceCache object that caches already fetched resources - used so that
         * the given resource referenced by relative path is fetched only once. The cache is attached to the content document body.
         * // TODO: use it on global EPUB book level to share caching of resources referenced multiple times within the book.
         *
         * @param {Object} contentDocumentDom The content document whose body element has/will have the cache attached to.
         * @return {Object} The cache with hrefs relative to the package document (.opf) as keys
         * and browser object URL as values for fetched resources.
         */
        function obtainDocumentResourcesCache(contentDocumentDom) {
            // The hash of already loaded/imported stylesheet hrefs is being tracked globally on the content document level:
            var documentResourcesCache = $(contentDocumentDom.body).data('epubResourcesCache');
            if (typeof documentResourcesCache === 'undefined') {
                // first use, initialize:
                documentResourcesCache = new ResourceCache;
                $(contentDocumentDom.body).data('epubResourcesCache', documentResourcesCache);
            }
            return documentResourcesCache;
        }

        function blob2BinArray(blob, callback) {
            var fileReader = new FileReader();
            fileReader.onload = function(){
                var arrayBuffer = this.result;
                callback(new Uint8Array(arrayBuffer));
            };
            fileReader.readAsArrayBuffer(blob);
        }

        // TODO: move out to the epub module, as a new "encryption" submodule?
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

        // TODO: move out to the epub module, as a new "encryption" submodule?
        function embeddedFontDeobfuscateIdpf(obfuscatedResourceBlob, callback) {
            var uid = _packageJson.metadata.id;
            var hashedUid = window.Crypto.SHA1(unescape(encodeURIComponent(uid.trim())), { asBytes: true });
            var prefixLength = 1040;
            // Shamelessly copied from
            // https://github.com/readium/readium-chrome-extension/blob/26d4b0cafd254cfa93bf7f6225887b83052642e0/scripts/models/path_resolver.js#L102 :
            xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, hashedUid, callback);
        }

        // TODO: move out to the epub module, as a new "encryption" submodule?
        function urnUuidToByteArray(id) {
            var uuidRegexp = /(urn:uuid:)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/i;
            var matchResults = uuidRegexp.exec(id);
            var rawUuid =  matchResults[2]+matchResults[3]+matchResults[4]+matchResults[5]+matchResults[6];
            if (! rawUuid || rawUuid.length != 32) {
                console.error('Bad UUID format for ID :' + id);
            }
            var byteArray = [];
            for (var i = 0; i < 16; i++) {
                var byteHex =  rawUuid.substr(i*2, 2);
                var byteNumber = parseInt(byteHex, 16);
                byteArray.push(byteNumber);
            }
            return byteArray;
        }

        // TODO: move out to the epub module, as a new "encryption" submodule?
        function embeddedFontDeobfuscateAdobe(obfuscatedResourceBlob, callback) {
            var uid = _packageJson.metadata.id;
            // extract the UUID and convert to big-endian binary form (16 bytes):
            var uidWordArray = urnUuidToByteArray(uid);
            var prefixLength = 1024;
            xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, uidWordArray, callback)
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
        this.shouldFetchProgrammatically = function (){
            return _isExploded;
        };

        this.getPackageUrl = function() {
            return _dataFetcher.getPackageUrl();
        };

        this.getFileContentsFromPackage = function(filePathRelativeToPackageRoot, callback, onerror) {

            _dataFetcher.fetchFileContentsText(filePathRelativeToPackageRoot, function (fileContents) {
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

        this.getEncryptionDom = function (callback, onerror) {
            if (_encryptionDom) {
                callback(_encryptionDom);
            } else {
                self.getXmlFileDom('META-INF/encryption.xml', function (encryptionDom) {
                    _encryptionDom = encryptionDom;
                    callback(_encryptionDom);
                }, onerror);
            }
        };

        // TODO: move out to the epub module, as a new "encryption" submodule?
        this._initializeEncryptionHash = function (encryptionInitializedCallback) {
            self.getEncryptionDom(function (encryptionDom) {
                if (!_encryptionHash) {
                    _encryptionHash = {};
                }

                var isEncryptionSpecified = false;

                var encryptedData = $('EncryptedData', encryptionDom);
                encryptedData.each(function (index, encryptedData) {
                    var encryptionAlgorithm = $('EncryptionMethod', encryptedData).first().attr('Algorithm');

                    // For some reason, jQuery selector "" against XML DOM sometimes doesn't match properly
                    var cipherReference = $('CipherReference', encryptedData);
                    cipherReference.each(function (index, CipherReference) {
                        var cipherReferenceURI = $(CipherReference).attr('URI');
                        console.log('Encryption/obfuscation algorithm ' + encryptionAlgorithm + ' specified for ' +
                            cipherReferenceURI);
                        isEncryptionSpecified = true;
                        _encryptionHash[cipherReferenceURI] = encryptionAlgorithm;
                    });
                });
                if (_isExploded && isEncryptionSpecified) {
                    _isExploded = false;
                }
                encryptionInitializedCallback();
            }, function (error) {
                console.log(error.message);
                console.log("Document doesn't make use of encryption.");
                encryptionInitializedCallback();
            });
        };

        // TODO: move out to the epub module, as a new "encryption" submodule?
        this.getEncryptionMethodForRelativePath = function(pathRelativeToRoot) {
            if (_encryptionHash){
                return _encryptionHash[pathRelativeToRoot];
            }   else {
                return undefined;
            }
        };

        this.getDecryptionFunctionForRelativePath = function (pathRelativeToRoot) {
            var encryptionMethod = self.getEncryptionMethodForRelativePath(pathRelativeToRoot);
            if (ENCRYPTION_METHODS[encryptionMethod]) {
                return ENCRYPTION_METHODS[encryptionMethod];
            } else {
                return undefined;
            }
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

            var pathRelativeToZipRoot = decodeURIComponent(self.convertPathRelativeToPackageToRelativeToBase(relativeToPackagePath));
            var fetchFunction = _dataFetcher.fetchFileContentsText;
            if (fetchMode === 'blob') {
                fetchFunction = _dataFetcher.fetchFileContentsBlob;
            } else if (fetchMode === 'data64uri') {
                fetchFunction = _dataFetcher.fetchFileContentsData64Uri;
            }
            fetchFunction.call(_dataFetcher, pathRelativeToZipRoot, fetchCallback, onerror);
        };

        this.resolveInternalPackageResources = function(contentDocumentURI, contentDocumentType, contentDocumentText,
                                                         resolvedDocumentCallback, onerror) {

            var contentDocumentDom = self.markupParser.parseMarkup(contentDocumentText, contentDocumentType);

            var resolutionDeferreds = [];

            resolveDocumentImages(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror);
            resolveDocumentLinkStylesheets(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror);
            resolveDocumentEmbeddedStylesheets(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror);

            $.when.apply($, resolutionDeferreds).done(function () {
                resolvedDocumentCallback(contentDocumentDom);
            });

        };

        this.getRelativeXmlFileDom = function (filePath, callback, errorCallback) {
            self.getXmlFileDom(self.convertPathRelativeToPackageToRelativeToBase(filePath), callback, errorCallback);
        };
//        this.getPackageDom = function (callback, onerror) {
//            return _dataFetcher.getPackageDom(callback, onerror);
//        };

        // Currently needed for deobfuscating fonts
        this.setPackageJson = function(packageJson, settingFinishedCallback) {
            _packageJson = packageJson;
            this._initializeEncryptionHash(settingFinishedCallback);
        };

    };

    return ResourceFetcher

});

define('epub-fetch', ['epub-fetch/publication_fetcher'], function (main) { return main; });

define('emub-model/package_document_parser',['require', 'module', 'jquery', 'underscore', 'backbone', 'epub-fetch/markup_parser', 'URIjs'], function (require, module, $, _, Backbone, MarkupParser, URI) {
    console.log('package_document_parser module id: ' + module.id);

    // `PackageDocumentParser` is used to parse the xml of an epub package
    // document and build a javascript object. The constructor accepts an
    // instance of `URI` that is used to resolve paths during the process
    var PackageDocumentParser = function(bookRoot, packageFetcher) {

// TODO: duplicate in smil_document_parser.js
        // parse the timestamp and return the value in seconds
        // supports this syntax:
        // http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
        function resolveClockValue(value) {
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
                arr = value.split(":");
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

        var _packageFetcher = packageFetcher;
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

        packageFetcher.getPackageDom(function(packageDom){
            _xmlDom = packageDom;
            _deferredXmlDom.resolve(packageDom);
        }, onError);


        // Parse an XML package document into a javascript object
        this.parse = function(callback) {

            _deferredXmlDom.done(function (xmlDom) {
                var json, cover;

                json = {};
                json.metadata = getJsonMetadata(xmlDom);
                json.bindings = getJsonBindings(xmlDom);
                json.spine = getJsonSpine(xmlDom);
                json.manifest = getJsonManifest(xmlDom);

                // parse the page-progression-direction if it is present
                json.paginate_backwards = paginateBackwards(xmlDom);

                // try to find a cover image
                cover = getCoverHref(xmlDom);
                if (cover) {
                    json.metadata.cover_href = cover;
                }

                $.when(updateMetadataWithIBookProperties(json.metadata)).then(function() {

                    if (json.metadata.layout === "pre-paginated") {
                        json.metadata.fixed_layout = true;
                    }

                    // THIS SHOULD BE LEFT IN (BUT COMMENTED OUT), AS MO SUPPORT IS TEMPORARILY DISABLED
                    // create a map of all the media overlay objects
                    // json.mo_map = this.resolveMediaOverlays(json.manifest);

                    // parse the spine into a proper collection
                    json.spine = parseSpineProperties(json.spine);

                    _packageFetcher.setPackageJson(json, function () {
                        // return the parse result
                        callback(json)
                    });
                });

            });
        };

        function updateMetadataWithIBookProperties(metadata) {

            var dff = $.Deferred();

            //if layout not set
            if(!metadata.layout)
            {
                var pathToIBooksSpecificXml = new URI("/META-INF/com.apple.ibooks.display-options.xml");

                packageFetcher.relativeToPackageFetchFileContents(pathToIBooksSpecificXml, 'text', function (ibookPropText) {
                    if(ibookPropText) {
                        var parser = new MarkupParser();
                        var propModel = parser.parseXml(ibookPropText);
                        var fixLayoutProp = $("option[name=fixed-layout]", propModel)[0];
                        if(fixLayoutProp) {
                            var fixLayoutVal = $(fixLayoutProp).text();
                            if(fixLayoutVal === "true") {
                                metadata.layout = "pre-paginated";
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


        function getJsonSpine(xmlDom) {

            var $spineElements;
            var jsonSpine = [];

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
        }

        function getJsonMetadata(xmlDom) {

            var $metadata = $("metadata", xmlDom);
            var jsonMetadata = {};

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
            
            
            // Media part
            jsonMetadata.mediaItems = [];

            var $overlays = $("meta[property='media:duration'][refines]", $metadata);

            $.each($overlays, function(elementIndex, $currItem) {
               jsonMetadata.mediaItems.push({
                  refines: $currItem.getAttribute("refines"),
                  duration: resolveClockValue($($currItem).text())
               });
            });
               
            jsonMetadata.mediaDuration =  resolveClockValue($("meta[property='media:duration']:not([refines])", $metadata).text());
            jsonMetadata.mediaNarrator =  $("meta[property='media:narrator']", $metadata).text();
            jsonMetadata.mediaActiveClass =   $("meta[property='media:active-class']", $metadata).text();
            jsonMetadata.mediaPlaybackActiveClass =   $("meta[property='media:playback-active-class']", $metadata).text();
            
            return jsonMetadata;
        }

        function getJsonManifest(xmlDom) {

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
                // console.log('pushing manifest item to JSON manifest. currManifestElementHref: [' + currManifestElementHref + 
                //     '], manifestItem.contentDocumentURI: [' + manifestItem.contentDocumentURI + 
                //     '], manifestItem:');
                // console.log(manifestItem);
                jsonManifest.push(manifestItem);
            });

            return jsonManifest;
        }

        function getJsonBindings(xmlDom) {

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
        }

        function getCoverHref(xmlDom) {

            var manifest;
            var $imageNode;
            manifest = xmlDom.getElementsByTagName('manifest')[0];

            // epub3 spec for a cover image is like this:
            /*<item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />*/
            $imageNode = $('item[properties~="cover-image"]', manifest);
            if ($imageNode.length === 1 && $imageNode.attr("href")) {
                return $imageNode.attr("href");
            }

            // some epub2's cover image is like this:
            /*<meta name="cover" content="cover-image-item-id" />*/
            var metaNode = $('meta[name="cover"]', xmlDom);
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
        }

        function parseSpineProperties(spine) {

            var parsePropertiesString = function (str) {
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

            };

            for (var i = 0; i < spine.length; i++) {
                var props = parsePropertiesString(spine[i].properties);
                // add all the properties to the spine item
                _.extend(spine[i], props);
            }
            return spine;
        }

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
        function paginateBackwards (xmlDom) {

            return $('spine', xmlDom).attr('page-progression-direction') === "rtl";
        }
    };

    return PackageDocumentParser;
});

define('emub-model/manifest_item',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {

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

define('emub-model/manifest',['require', 'module', 'jquery', 'underscore', 'backbone', './manifest_item'],
    function (require, module, $, _, Backbone, ManifestItem) {
        console.log('manifest module id: ' + module.id);

        var Manifest = Backbone.Collection.extend({

            model: ManifestItem
        });
        return Manifest;
    });
define('emub-model/spine_item',['require', 'module', 'jquery', 'underscore', 'backbone', './manifest_item'],
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

define('emub-model/spine',['require', 'module', 'jquery', 'underscore', 'backbone', './spine_item'],
    function (require, module, $, _, Backbone, SpineItem) {
        var Spine = Backbone.Collection.extend({
            model: SpineItem
        });
        return Spine;
    });
define('emub-model/metadata',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {
    var Metadata = Backbone.Model.extend({});
    return Metadata;
});
define('emub-model/page_spread_property',['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {
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
define('emub-model/package_document',['require', 'module', 'jquery', 'underscore', 'backbone', 'URIjs', './manifest', './spine', './metadata',
    './page_spread_property'],
    function (require, module, $, _, Backbone, URI, Manifest, Spine, Metadata, PageSpreadProperty) {
    console.log('package_document module id: ' + module.id);

    // Description: This model provides an interface for navigating an EPUB's package document
    var PackageDocument = function(packageDocumentURL, jsonData, resourceFetcher) {

        var _spine = new Spine(jsonData.spine);
        var _manifest = new Manifest(jsonData.manifest);
        var _metadata = new Metadata(jsonData.metadata);
        var _bindings = new Spine(jsonData.bindings);
        var _pageSpreadProperty = new PageSpreadProperty();
        var _moMap = jsonData.mo_map;

        // If this book is fixed layout, assign the page spread class
        if (isFixedLayout()) {
            assignPageSpreadClass();
        }

        this.getPackageData = function () {

            var spinePackageData = [];
            var packageDocRoot = packageDocumentURL.substr(0, packageDocumentURL.lastIndexOf("/"));

            _spine.each(function (spineItem) {
                spinePackageData.push(generatePackageData(spineItem));
            });
            
            // This is where the package data format thing is generated
            return {
                rootUrl : packageDocRoot,
                rendition_layout : _metadata.get("layout"),
                media_overlay : getMediaOverlay(),
                spine : {
                    direction : pageProgressionDirection(),
                    items : spinePackageData    
                }
            };
        };

        function getMediaOverlay(){
           var result = {
                 duration : _metadata.get('mediaDuration'),
                 narrator : _metadata.get('mediaNarrator'),
                 activeClass : _metadata.get('mediaActiveClass'),
                 playbackActiveClass : _metadata.get('mediaPlaybackActiveClass'),
                 smil_models : _moMap,
                 
                 skippables: ["sidebar", "practice", "marginalia", "annotation", "help", "note", "footnote", "rearnote", "table", "table-row", "table-cell", "list", "list-item", "pagebreak"],
                 escapables: ["sidebar", "bibliography", "toc", "loi", "appendix", "landmarks", "lot", "index", "colophon", "epigraph", "conclusion", "afterword", "warning", "epilogue", "foreword", "introduction", "prologue", "preface", "preamble", "notice", "errata", "copyright-page", "acknowledgments", "other-credits", "titlepage", "imprimatur", "contributors", "halftitlepage", "dedication", "help", "annotation", "marginalia", "practice", "note", "footnote", "rearnote", "footnotes", "rearnotes", "bridgehead", "page-list", "table", "table-row", "table-cell", "list", "list-item", "glossary"]
           };

           return result;
        }
        
        function isFixedLayout() {

            return _metadata.get("fixed_layout");
        }

        function getManifestItemById(id) {

            var foundManifestItem = _manifest.find(
                function (manifestItem) {
                    if (manifestItem.get("id") === id) {
                        return manifestItem;
                    }

                    return undefined;
                });

            if (foundManifestItem) {
                return foundManifestItem.toJSON();
            }
            else {
                return undefined;
            }
        }

        function getManifestItemByIdref(idref) {

            var foundManifestItem = getManifestItemById(idref);
            if (foundManifestItem) {
                return foundManifestItem;
            }
            else {
                return undefined;
            }
        }

        function getSpineItemByIdref(idref) {

            var foundSpineItem = getSpineModelByIdref(idref);
            if (foundSpineItem) {
                return foundSpineItem.toJSON();
            }
            else {
                return undefined;
            }
        }

        function getSpineItem(spineIndex) {

            var spineItem = _spine.at(spineIndex);
            if (spineItem) {
                return spineItem.toJSON();
            }
            else {
                return undefined;
            }
        }

        function spineLength() {
            return _spine.length;
        }

        // Description: gets the next position in the spine for which the
        // spineItem does not have `linear='no'`. The start
        // param is the non-inclusive position to begin the search
        // from. If start is not supplied, the search will begin at
        // postion 0. If no linear position can be found, this
        // function returns undefined
        function getNextLinearSpinePosition(currSpineIndex) {

            if (currSpineIndex === undefined || currSpineIndex < 0) {
                currSpineIndex = 0;

                if (_spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            while (currSpineIndex < spineLength() - 1) {
                currSpineIndex += 1;
                if (_spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            // No next linear spine position.
            return undefined;
        }

        // Description: gets the previous position in the spine for which the
        // spineItem does not have `linear='no'`. The start
        // param is the non-inclusive position to begin the search
        // from. If start is not supplied, the search will begin at
        // the end of the spine. If no linear position can be found,
        // this function returns undefined
        function getPrevLinearSpinePosition(currSpineIndex) {

            if (currSpineIndex === undefined || currSpineIndex > spineLength() - 1) {
                currSpineIndex = spineLength() - 1;

                if (_spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            while (currSpineIndex > 0) {
                currSpineIndex -= 1;
                if (_spine.at(currSpineIndex).get("linear") !== "no") {
                    return currSpineIndex;
                }
            }

            // No previous linear spine position.
            return undefined;
        }

        function hasNextSection(currSpineIndex) {

            if (currSpineIndex >= 0 &&
                currSpineIndex <= spineLength() - 1) {

                return getNextLinearSpinePosition(currSpineIndex) > -1;
            }
            else {
                return false;
            }
        }

        function hasPrevSection(currSpineIndex) {

            if (currSpineIndex >= 0 &&
                currSpineIndex <= spineLength() - 1) {

                return getPrevLinearSpinePosition(currSpineIndex) > -1;
            }
            else {
                return false;
            }
        }

        function pageProgressionDirection() {

            if (_metadata.get("page_prog_dir") === "rtl") {
                return "rtl";
            }
            else if (_metadata.get("page_prog_dir") === "default") {
                return "default";
            }
            else {
                return "ltr";
            }
        }

        function getSpineIndexByHref(manifestHref) {

            var spineItem = getSpineModelFromHref(manifestHref);
            return getSpineIndex(spineItem);
        }

        function getBindingByHandler(handler) {

            var binding = _bindings.find(
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
        }

        function generatePackageData(spineItem) {

            var fixedLayoutProperty = "reflowable";
            // var fixedLayoutType = undefined;
            var manifestItem = getManifestModelByIdref(spineItem.get("idref"));
            // var isLinear;
            // var firstPageIsOffset;
            var pageSpread;

            // Get fixed layout properties
            if (spineItem.isFixedLayout() || isFixedLayout()) {

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
            //     if (pageProgressionDirection() === "ltr" && pageSpread === "right") {
            //         firstPageIsOffset = true;
            //     }
            //     else if (pageProgressionDirection() === "rtl" && pageSpread === "left") {
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
                href : manifestItem.get('contentDocumentURI'),
                media_type : manifestItem.get('media_type'),
                media_overlay_id : manifestItem.get('media_overlay'),
                idref : spineItem.get("idref"),
                page_spread : pageSpread,
                rendition_layout : fixedLayoutProperty
            };

            return spineInfo;
        }

        this.getToc = function() {
            var item = getTocItem();
            if (item) {
                return item.get("contentDocumentURI");
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

        // 
        this.getEpub3Toc = function(callback) {
            this.generateTocListDOM(function(dom) {
                var olTocList =  $($('nav#toc', dom)[0]).children()[0];
                callback(olTocList);
            });
        };

        function tocIsNcx() {

            var tocItem = getTocItem();
            var contentDocURI = tocItem.get("contentDocumentURI");
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
            var $navPointLi = $("<li class='nav-elem'><a href='" + navHref + "'>'" + navText + "'</a></li>");

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

        // Refactoring candidate: This search will always iterate through entire manifest; this should be modified to
        //   return when the manifest item is found.
        function getSpineModelFromHref(manifestHref) {

            var resourceURI = new URI(manifestHref);
            var resourceName = resourceURI.filename();
            var foundSpineModel;

            _manifest.each(function (manifestItem) {

                var manifestItemURI = new URI(manifestItem.get("href"));
                var manifestItemName = manifestItemURI.filename();

                // Rationale: Return a spine model based on the manifest item id, which is the idref of the spine item
                if (manifestItemName === resourceName) {
                    foundSpineModel = getSpineModelByIdref(manifestItem.get("id"));
                }
            });

            return foundSpineModel;
        }

        function getSpineModelByIdref(idref) {

            var foundSpineItem = _spine.find(
                function (spineItem) {
                    if (spineItem.get("idref") === idref) {
                        return spineItem;
                    }
                });

            return foundSpineItem;
        }

        function getManifestModelByIdref(idref) {

            var foundManifestItem = _manifest.find(
                function (manifestItem) {
                    if (manifestItem.get("id") === idref) {
                        return manifestItem;
                    }
                });

            return foundManifestItem;
        }

        function getSpineIndex(spineItem) {

            return _spine.indexOf(spineItem);
        }

        // Description: When rendering fixed layout pages we need to determine whether the page
        //   should be on the left or the right in two up mode, options are:
        //     left_page:      render on the left side
        //     right_page:     render on the right side
        //     center_page:    always center the page horizontally
        //   This property must be assigned when the package document is initialized
        // NOTE: Look into how spine items with the linear="no" property affect this algorithm
        function assignPageSpreadClass() {

            var pageSpreadClass;
            var numSpineItems;

            // If the epub is apple fixed layout
            if (_metadata.get("apple_fixed")) {

                numSpineItems = _spine.length;
                _spine.each(function (spineItem, spineIndex) {

                    pageSpreadClass = _pageSpreadProperty.inferiBooksPageSpread(spineIndex, numSpineItems);
                    spineItem.set({ pageSpreadClass : pageSpreadClass });
                });
            }
            else {
                // For each spine item
                _spine.each(function (spineItem, spineIndex) {

                    if (spineItem.get("page_spread")) {

                        pageSpreadClass = _pageSpreadProperty.getPageSpreadFromProperties(spineItem.get("page_spread"));
                        spineItem.set({ pageSpreadClass : pageSpreadClass });
                    }
                    else {

                        pageSpreadClass = _pageSpreadProperty.inferUnassignedPageSpread(spineIndex, _spine, pageProgressionDirection());
                        spineItem.set({ pageSpreadClass : pageSpreadClass });
                    }
                });
            }
        }

        function getTocItem(){

            var manifest = _manifest;
            var spine_id = _metadata.get("ncx");

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

    };

    return PackageDocument;
});

define('epub-fetch/iframe_zip_loader',[], function(){

    var zipIframeLoader = function(ReadiumSDK, getCurrentResourceFetcher) {

        var basicIframeLoader = new ReadiumSDK.Views.IFrameLoader();

        this.addIFrameEventListener = function(eventName, callback, context) {
            basicIframeLoader.addIFrameEventListener(eventName, callback, context);
        };

        this.loadIframe = function(iframe, src, callback, caller, attachedData) {

            if (getCurrentResourceFetcher().shouldFetchProgrammatically()) {
                basicIframeLoader.loadIframe(iframe, src, callback, caller, attachedData);
            } else {
                var basicLoadCallback = function(success) {

                    var itemHref = attachedData.spineItem.href;
                    getCurrentResourceFetcher().relativeToPackageFetchFileContents(itemHref, 'text', function(contentDocumentText) {
                        var srcMediaType = attachedData.spineItem.media_type;

                        getCurrentResourceFetcher().resolveInternalPackageResources(itemHref, srcMediaType, contentDocumentText,
                            function (resolvedContentDocumentDom) {
                                var contentDocument = iframe.contentDocument;
                                contentDocument.replaceChild(resolvedContentDocumentDom.documentElement,
                                    contentDocument.documentElement);
                                callback.call(caller, success, attachedData);
                            });
                    }, function(err) {
                        if (err.message) {
                            console.error(err.message);
                        }

                        console.error(err);
                        callback.call(caller, success, attachedData);
                    });
                };
                // Feed an artificial empty HTML document to the IFRAME, then let the wrapper onload function
                // take care of actual document loading (from zipped EPUB) and calling callbacks:
                var emptyDocumentDataUri = window.URL.createObjectURL(
                    new Blob(['<html><body></body></html>'], {'type': 'text/html'})
                );

                basicIframeLoader.loadIframe(iframe, emptyDocumentDataUri, basicLoadCallback, caller, attachedData);
            }
        };
    };

    return zipIframeLoader;
});

define('emub-model/smil_document_parser',[ 'require', 'module', 'jquery', 'underscore', 'backbone', 'epub-fetch' ], function(require, module, $, _, Backbone, ResourceFetcher) {
    console.log('smil_document_parser module id: ' + module.id);

    // `SmilDocumentParser` is used to parse the xml of an epub package
    // document and build a javascript object. The constructor accepts an
    // instance of `URI` that is used to resolve paths during the process
    var SmilDocumentParser = function(packageFetcher, itemHref) {

        // Parse an XML package document into a javascript object
        this.parse = function(callback) {
            packageFetcher.getRelativeXmlFileDom(itemHref, function(xmlDom){
                var json, cover;

                json = {};

                var smil = $("smil", xmlDom)[0];
                json.smilVersion = smil.getAttribute('version');

                //var body = $("body", xmlDom)[0];
                json.children = getChildren(smil);

                callback(json);
            })
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

// TODO: duplicate in package_document_parser.js
        // parse the timestamp and return the value in seconds
        // supports this syntax:
        // http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
        function resolveClockValue(value) {
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
                arr = value.split(":");
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

        function getChildren(element) {
            var children = [];

            $.each(element.childNodes, function(elementIndex, currElement) {

                if (currElement.nodeType === 1) { // ELEMENT
                    var item = createItemFromElement(currElement);
                    if (item) {
                        children.push(item);
                    }
                }
            });

            return children;
        }

        function createItemFromElement(element) {
            var item = {};
            item.nodeType = element.nodeName;
            if (item.nodeType === "body")
            {
                item.nodeType = "seq";
            }

            if (item.nodeType === "seq") {

                safeCopyProperty("epub:textref", element, item, true);
                safeCopyProperty("id", element, item);
                safeCopyProperty("epub:type", element, item);

                item.children = getChildren(element);

            } else if (item.nodeType === "par") {

                safeCopyProperty("id", element, item);
                safeCopyProperty("epub:type", element, item);

                item.children = getChildren(element);

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
                item.clipBegin = resolveClockValue(element.getAttribute("clipBegin"));
                item.clipEnd = resolveClockValue(element.getAttribute("clipEnd"));
            }
            else
            {
                return undefined;
            }

            return item;
        }

    };

    
    function fillSmilData(docJson, bookRoot, jsLibRoot, currentResourceFetcher, callback) {

        if (docJson.spine.length <= 0) {
            docJson.mo_map = [];
            callback(docJson);
            return;
        }

        var allFakeSmil = true;
        docJson.mo_map = [];
        
        var processSpineItem = function(ii) {

            if (ii >= docJson.spine.length) {
                if (allFakeSmil) {
                    console.log("No Media Overlays");
                    docJson.mo_map = [];
                }

                callback(docJson);
                return;
            }
            
            var spineItem = docJson.spine[ii];
            
            var manifestItem = undefined;
            for (var jj = 0; jj < docJson.manifest.length; jj++) {
                var item = docJson.manifest[jj];
                if (item.id === spineItem.idref) {
                    manifestItem = item;
                    break;
                }
            }
            if (!manifestItem) {
                console.error("Cannot find manifest item for spine item?! " + spineItem.idref);
                processSpineItem(ii+1);
                return;
            }
            
            if (manifestItem.media_overlay) {
            
                var manifestItemSMIL = undefined;
                for (var jj = 0; jj < docJson.manifest.length; jj++) {
                    var item = docJson.manifest[jj];
                    if (item.id === manifestItem.media_overlay) {
                        manifestItemSMIL = item;
                        break;
                    }
                }
                if (!manifestItemSMIL) {
                    console.error("Cannot find SMIL manifest item for spine/manifest item?! " + manifestItem.media_overlay);
                    processSpineItem(ii+1);
                    return;
                }
                //ASSERT manifestItemSMIL.media_type === "application/smil+xml"
                
                var smilParser = new SmilDocumentParser(currentResourceFetcher, manifestItemSMIL.href);
                smilParser.parse(function(smilJson) {
                    smilJson.href = manifestItemSMIL.href;
                    smilJson.id = manifestItemSMIL.id;
                    smilJson.spineItemId = spineItem.idref; // same as manifestItem.id

                    if (docJson.metadata.mediaItems) {
                        for (var idx = 0; idx < docJson.metadata.mediaItems.length; idx++) {
                            var item = docJson.metadata.mediaItems[idx];
                            if (!item.refines) continue;
                            
                            var id = item.refines;
                            var hash = id.indexOf('#');
                            if (hash >= 0) {
                                var start = hash+1;
                                var end = id.length-1;
                                id = id.substr(start, end);
                            }
                            id = id.trim();

                            if (id === manifestItemSMIL.id) {
                                smilJson.duration = item.duration; //resolveClockValue already done.
                                break;
                            }
                        }
                    }

                    allFakeSmil = false;
                    docJson.mo_map.push(smilJson);
                    
                    setTimeout(function(){ processSpineItem(ii+1); }, 0);
                    return;
                });
            }
            else {
                docJson.mo_map.push({
                    id: "",
                    href: "",
                    spineItemId: spineItem.idref, // same as manifestItem.id
                    children: [{
                        nodeType: 'seq',
                        textref: manifestItem.href,
                        children: [{
                            nodeType: 'par',
                            children: [{
                                nodeType: 'text',
                                src: manifestItem.href,
                                srcFile: manifestItem.href,
                                srcFragmentId: ""
                            }]
                        }]
                    }]
                });
                
                setTimeout(function(){ processSpineItem(ii+1); }, 0);
                return;
            }
        };
        
        processSpineItem(0);
    }
    
    
    var SmilParser = {
        fillSmilData: fillSmilData,
        Parser: SmilDocumentParser
    }
    
    return SmilParser;
});

/*! Hammer.JS - v1.0.6 - 2014-01-02
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
  

/**
 * Hammer
 * use this to create instances
 * @param   {HTMLElement}   element
 * @param   {Object}        options
 * @returns {Hammer.Instance}
 * @constructor
 */
var Hammer = function(element, options) {
  return new Hammer.Instance(element, options || {});
};

// default settings
Hammer.defaults = {
  // add styles and attributes to the element to prevent the browser from doing
  // its native behavior. this doesnt prevent the scrolling, but cancels
  // the contextmenu, tap highlighting etc
  // set to false to disable this
  stop_browser_behavior: {
    // this also triggers onselectstart=false for IE
    userSelect       : 'none',
    // this makes the element blocking in IE10 >, you could experiment with the value
    // see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241
    touchAction      : 'none',
    touchCallout     : 'none',
    contentZooming   : 'none',
    userDrag         : 'none',
    tapHighlightColor: 'rgba(0,0,0,0)'
  }

  //
  // more settings are defined per gesture at gestures.js
  //
};

// detect touchevents
Hammer.HAS_POINTEREVENTS = window.navigator.pointerEnabled || window.navigator.msPointerEnabled;
Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);

// dont use mouseevents on mobile devices
Hammer.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android|silk/i;
Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && window.navigator.userAgent.match(Hammer.MOBILE_REGEX);

// eventtypes per touchevent (start, move, end)
// are filled by Hammer.event.determineEventTypes on setup
Hammer.EVENT_TYPES = {};

// direction defines
Hammer.DIRECTION_DOWN = 'down';
Hammer.DIRECTION_LEFT = 'left';
Hammer.DIRECTION_UP = 'up';
Hammer.DIRECTION_RIGHT = 'right';

// pointer type
Hammer.POINTER_MOUSE = 'mouse';
Hammer.POINTER_TOUCH = 'touch';
Hammer.POINTER_PEN = 'pen';

// touch event defines
Hammer.EVENT_START = 'start';
Hammer.EVENT_MOVE = 'move';
Hammer.EVENT_END = 'end';

// hammer document where the base events are added at
Hammer.DOCUMENT = window.document;

// plugins and gestures namespaces
Hammer.plugins = Hammer.plugins || {};
Hammer.gestures = Hammer.gestures || {};

// if the window events are set...
Hammer.READY = false;

/**
 * setup events to detect gestures on the document
 */
function setup() {
  if(Hammer.READY) {
    return;
  }

  // find what eventtypes we add listeners to
  Hammer.event.determineEventTypes();

  // Register all gestures inside Hammer.gestures
  Hammer.utils.each(Hammer.gestures, function(gesture){
    Hammer.detection.register(gesture);
  });

  // Add touch events on the document
  Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
  Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

  // Hammer is ready...!
  Hammer.READY = true;
}

Hammer.utils = {
  /**
   * extend method,
   * also used for cloning when dest is an empty object
   * @param   {Object}    dest
   * @param   {Object}    src
   * @parm  {Boolean}  merge    do a merge
   * @returns {Object}    dest
   */
  extend: function extend(dest, src, merge) {
    for(var key in src) {
      if(dest[key] !== undefined && merge) {
        continue;
      }
      dest[key] = src[key];
    }
    return dest;
  },


  /**
   * for each
   * @param obj
   * @param iterator
   */
  each: function(obj, iterator, context) {
    var i, length;
    // native forEach on arrays
    if ('forEach' in obj) {
      obj.forEach(iterator, context);
    }
    // arrays
    else if(obj.length !== undefined) {
      for (i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
    }
    // objects
    else {
      for (i in obj) {
        if (obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
    }
  },

  /**
   * find if a node is in the given parent
   * used for event delegation tricks
   * @param   {HTMLElement}   node
   * @param   {HTMLElement}   parent
   * @returns {boolean}       has_parent
   */
  hasParent: function(node, parent) {
    while(node) {
      if(node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },


  /**
   * get the center of all the touches
   * @param   {Array}     touches
   * @returns {Object}    center
   */
  getCenter: function getCenter(touches) {
    var valuesX = [], valuesY = [];

    Hammer.utils.each(touches, function(touch) {
      // I prefer clientX because it ignore the scrolling position
      valuesX.push(typeof touch.clientX !== 'undefined' ? touch.clientX : touch.pageX );
      valuesY.push(typeof touch.clientY !== 'undefined' ? touch.clientY : touch.pageY );
    });

    return {
      pageX: ((Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2),
      pageY: ((Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2)
    };
  },


  /**
   * calculate the velocity between two points
   * @param   {Number}    delta_time
   * @param   {Number}    delta_x
   * @param   {Number}    delta_y
   * @returns {Object}    velocity
   */
  getVelocity: function getVelocity(delta_time, delta_x, delta_y) {
    return {
      x: Math.abs(delta_x / delta_time) || 0,
      y: Math.abs(delta_y / delta_time) || 0
    };
  },


  /**
   * calculate the angle between two coordinates
   * @param   {Touch}     touch1
   * @param   {Touch}     touch2
   * @returns {Number}    angle
   */
  getAngle: function getAngle(touch1, touch2) {
    var y = touch2.pageY - touch1.pageY,
      x = touch2.pageX - touch1.pageX;
    return Math.atan2(y, x) * 180 / Math.PI;
  },


  /**
   * angle to direction define
   * @param   {Touch}     touch1
   * @param   {Touch}     touch2
   * @returns {String}    direction constant, like Hammer.DIRECTION_LEFT
   */
  getDirection: function getDirection(touch1, touch2) {
    var x = Math.abs(touch1.pageX - touch2.pageX),
      y = Math.abs(touch1.pageY - touch2.pageY);

    if(x >= y) {
      return touch1.pageX - touch2.pageX > 0 ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
    }
    else {
      return touch1.pageY - touch2.pageY > 0 ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
    }
  },


  /**
   * calculate the distance between two touches
   * @param   {Touch}     touch1
   * @param   {Touch}     touch2
   * @returns {Number}    distance
   */
  getDistance: function getDistance(touch1, touch2) {
    var x = touch2.pageX - touch1.pageX,
      y = touch2.pageY - touch1.pageY;
    return Math.sqrt((x * x) + (y * y));
  },


  /**
   * calculate the scale factor between two touchLists (fingers)
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param   {Array}     start
   * @param   {Array}     end
   * @returns {Number}    scale
   */
  getScale: function getScale(start, end) {
    // need two fingers...
    if(start.length >= 2 && end.length >= 2) {
      return this.getDistance(end[0], end[1]) /
        this.getDistance(start[0], start[1]);
    }
    return 1;
  },


  /**
   * calculate the rotation degrees between two touchLists (fingers)
   * @param   {Array}     start
   * @param   {Array}     end
   * @returns {Number}    rotation
   */
  getRotation: function getRotation(start, end) {
    // need two fingers
    if(start.length >= 2 && end.length >= 2) {
      return this.getAngle(end[1], end[0]) -
        this.getAngle(start[1], start[0]);
    }
    return 0;
  },


  /**
   * boolean if the direction is vertical
   * @param    {String}    direction
   * @returns  {Boolean}   is_vertical
   */
  isVertical: function isVertical(direction) {
    return (direction == Hammer.DIRECTION_UP || direction == Hammer.DIRECTION_DOWN);
  },


  /**
   * stop browser default behavior with css props
   * @param   {HtmlElement}   element
   * @param   {Object}        css_props
   */
  stopDefaultBrowserBehavior: function stopDefaultBrowserBehavior(element, css_props) {
    if(!css_props || !element || !element.style) {
      return;
    }

    // with css properties for modern browsers
    Hammer.utils.each(['webkit', 'khtml', 'moz', 'Moz', 'ms', 'o', ''], function(vendor) {
      Hammer.utils.each(css_props, function(prop) {
          // vender prefix at the property
          if(vendor) {
            prop = vendor + prop.substring(0, 1).toUpperCase() + prop.substring(1);
          }
          // set the style
          if(prop in element.style) {
            element.style[prop] = prop;
          }
      });
    });

    // also the disable onselectstart
    if(css_props.userSelect == 'none') {
      element.onselectstart = function() {
        return false;
      };
    }

    // and disable ondragstart
    if(css_props.userDrag == 'none') {
      element.ondragstart = function() {
        return false;
      };
    }
  }
};


/**
 * create new hammer instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @param   {Object}            [options={}]
 * @returns {Hammer.Instance}
 * @constructor
 */
Hammer.Instance = function(element, options) {
  var self = this;

  // setup HammerJS window events and register all gestures
  // this also sets up the default options
  setup();

  this.element = element;

  // start/stop detection option
  this.enabled = true;

  // merge options
  this.options = Hammer.utils.extend(
    Hammer.utils.extend({}, Hammer.defaults),
    options || {});

  // add some css to the element to prevent the browser from doing its native behavoir
  if(this.options.stop_browser_behavior) {
    Hammer.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior);
  }

  // start detection on touchstart
  Hammer.event.onTouch(element, Hammer.EVENT_START, function(ev) {
    if(self.enabled) {
      Hammer.detection.startDetect(self, ev);
    }
  });

  // return instance
  return this;
};


Hammer.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {String}      gesture
   * @param   {Function}    handler
   * @returns {Hammer.Instance}
   */
  on: function onEvent(gesture, handler) {
    var gestures = gesture.split(' ');
    Hammer.utils.each(gestures, function(gesture) {
      this.element.addEventListener(gesture, handler, false);
    }, this);
    return this;
  },


  /**
   * unbind events to the instance
   * @param   {String}      gesture
   * @param   {Function}    handler
   * @returns {Hammer.Instance}
   */
  off: function offEvent(gesture, handler) {
    var gestures = gesture.split(' ');
    Hammer.utils.each(gestures, function(gesture) {
      this.element.removeEventListener(gesture, handler, false);
    }, this);
    return this;
  },


  /**
   * trigger gesture event
   * @param   {String}      gesture
   * @param   {Object}      [eventData]
   * @returns {Hammer.Instance}
   */
  trigger: function triggerEvent(gesture, eventData) {
    // optional
    if(!eventData) {
      eventData = {};
    }

    // create DOM event
    var event = Hammer.DOCUMENT.createEvent('Event');
    event.initEvent(gesture, true, true);
    event.gesture = eventData;

    // trigger on the target if it is in the instance element,
    // this is for event delegation tricks
    var element = this.element;
    if(Hammer.utils.hasParent(eventData.target, element)) {
      element = eventData.target;
    }

    element.dispatchEvent(event);
    return this;
  },


  /**
   * enable of disable hammer.js detection
   * @param   {Boolean}   state
   * @returns {Hammer.Instance}
   */
  enable: function enable(state) {
    this.enabled = state;
    return this;
  }
};


/**
 * this holds the last move event,
 * used to fix empty touchend issue
 * see the onTouch event for an explanation
 * @type {Object}
 */
var last_move_event = null;


/**
 * when the mouse is hold down, this is true
 * @type {Boolean}
 */
var enable_detect = false;


/**
 * when touch events have been fired, this is true
 * @type {Boolean}
 */
var touch_triggered = false;


Hammer.event = {
  /**
   * simple addEventListener
   * @param   {HTMLElement}   element
   * @param   {String}        type
   * @param   {Function}      handler
   */
  bindDom: function(element, type, handler) {
    var types = type.split(' ');
    Hammer.utils.each(types, function(type){
      element.addEventListener(type, handler, false);
    });
  },


  /**
   * touch events with mouse fallback
   * @param   {HTMLElement}   element
   * @param   {String}        eventType        like Hammer.EVENT_MOVE
   * @param   {Function}      handler
   */
  onTouch: function onTouch(element, eventType, handler) {
    var self = this;

    this.bindDom(element, Hammer.EVENT_TYPES[eventType], function bindDomOnTouch(ev) {
      var sourceEventType = ev.type.toLowerCase();

      // onmouseup, but when touchend has been fired we do nothing.
      // this is for touchdevices which also fire a mouseup on touchend
      if(sourceEventType.match(/mouse/) && touch_triggered) {
        return;
      }

      // mousebutton must be down or a touch event
      else if(sourceEventType.match(/touch/) ||   // touch events are always on screen
        sourceEventType.match(/pointerdown/) || // pointerevents touch
        (sourceEventType.match(/mouse/) && ev.which === 1)   // mouse is pressed
        ) {
        enable_detect = true;
      }

      // mouse isn't pressed
      else if(sourceEventType.match(/mouse/) && !ev.which) {
        enable_detect = false;
      }


      // we are in a touch event, set the touch triggered bool to true,
      // this for the conflicts that may occur on ios and android
      if(sourceEventType.match(/touch|pointer/)) {
        touch_triggered = true;
      }

      // count the total touches on the screen
      var count_touches = 0;

      // when touch has been triggered in this detection session
      // and we are now handling a mouse event, we stop that to prevent conflicts
      if(enable_detect) {
        // update pointerevent
        if(Hammer.HAS_POINTEREVENTS && eventType != Hammer.EVENT_END) {
          count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
        }
        // touch
        else if(sourceEventType.match(/touch/)) {
          count_touches = ev.touches.length;
        }
        // mouse
        else if(!touch_triggered) {
          count_touches = sourceEventType.match(/up/) ? 0 : 1;
        }

        // if we are in a end event, but when we remove one touch and
        // we still have enough, set eventType to move
        if(count_touches > 0 && eventType == Hammer.EVENT_END) {
          eventType = Hammer.EVENT_MOVE;
        }
        // no touches, force the end event
        else if(!count_touches) {
          eventType = Hammer.EVENT_END;
        }

        // store the last move event
        if(count_touches || last_move_event === null) {
          last_move_event = ev;
        }

        // trigger the handler
        handler.call(Hammer.detection, self.collectEventData(element, eventType, self.getTouchList(last_move_event, eventType), ev));

        // remove pointerevent from list
        if(Hammer.HAS_POINTEREVENTS && eventType == Hammer.EVENT_END) {
          count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
        }
      }

      // on the end we reset everything
      if(!count_touches) {
        last_move_event = null;
        enable_detect = false;
        touch_triggered = false;
        Hammer.PointerEvent.reset();
      }
    });
  },


  /**
   * we have different events for each device/browser
   * determine what we need and set them in the Hammer.EVENT_TYPES constant
   */
  determineEventTypes: function determineEventTypes() {
    // determine the eventtype we want to set
    var types;

    // pointerEvents magic
    if(Hammer.HAS_POINTEREVENTS) {
      types = Hammer.PointerEvent.getEvents();
    }
    // on Android, iOS, blackberry, windows mobile we dont want any mouseevents
    else if(Hammer.NO_MOUSEEVENTS) {
      types = [
        'touchstart',
        'touchmove',
        'touchend touchcancel'];
    }
    // for non pointer events browsers and mixed browsers,
    // like chrome on windows8 touch laptop
    else {
      types = [
        'touchstart mousedown',
        'touchmove mousemove',
        'touchend touchcancel mouseup'];
    }

    Hammer.EVENT_TYPES[Hammer.EVENT_START] = types[0];
    Hammer.EVENT_TYPES[Hammer.EVENT_MOVE] = types[1];
    Hammer.EVENT_TYPES[Hammer.EVENT_END] = types[2];
  },


  /**
   * create touchlist depending on the event
   * @param   {Object}    ev
   * @param   {String}    eventType   used by the fakemultitouch plugin
   */
  getTouchList: function getTouchList(ev/*, eventType*/) {
    // get the fake pointerEvent touchlist
    if(Hammer.HAS_POINTEREVENTS) {
      return Hammer.PointerEvent.getTouchList();
    }
    // get the touchlist
    else if(ev.touches) {
      return ev.touches;
    }
    // make fake touchlist from mouse position
    else {
      ev.identifier = 1;
      return [ev];
    }
  },


  /**
   * collect event data for Hammer js
   * @param   {HTMLElement}   element
   * @param   {String}        eventType        like Hammer.EVENT_MOVE
   * @param   {Object}        eventData
   */
  collectEventData: function collectEventData(element, eventType, touches, ev) {
    // find out pointerType
    var pointerType = Hammer.POINTER_TOUCH;
    if(ev.type.match(/mouse/) || Hammer.PointerEvent.matchType(Hammer.POINTER_MOUSE, ev)) {
      pointerType = Hammer.POINTER_MOUSE;
    }

    return {
      center     : Hammer.utils.getCenter(touches),
      timeStamp  : new Date().getTime(),
      target     : ev.target,
      touches    : touches,
      eventType  : eventType,
      pointerType: pointerType,
      srcEvent   : ev,

      /**
       * prevent the browser default actions
       * mostly used to disable scrolling of the browser
       */
      preventDefault: function() {
        if(this.srcEvent.preventManipulation) {
          this.srcEvent.preventManipulation();
        }

        if(this.srcEvent.preventDefault) {
          this.srcEvent.preventDefault();
        }
      },

      /**
       * stop bubbling the event up to its parents
       */
      stopPropagation: function() {
        this.srcEvent.stopPropagation();
      },

      /**
       * immediately stop gesture detection
       * might be useful after a swipe was detected
       * @return {*}
       */
      stopDetect: function() {
        return Hammer.detection.stopDetect();
      }
    };
  }
};

Hammer.PointerEvent = {
  /**
   * holds all pointers
   * @type {Object}
   */
  pointers: {},

  /**
   * get a list of pointers
   * @returns {Array}     touchlist
   */
  getTouchList: function() {
    var self = this;
    var touchlist = [];

    // we can use forEach since pointerEvents only is in IE10
    Hammer.utils.each(self.pointers, function(pointer){
      touchlist.push(pointer);
    });
    
    return touchlist;
  },

  /**
   * update the position of a pointer
   * @param   {String}   type             Hammer.EVENT_END
   * @param   {Object}   pointerEvent
   */
  updatePointer: function(type, pointerEvent) {
    if(type == Hammer.EVENT_END) {
      this.pointers = {};
    }
    else {
      pointerEvent.identifier = pointerEvent.pointerId;
      this.pointers[pointerEvent.pointerId] = pointerEvent;
    }

    return Object.keys(this.pointers).length;
  },

  /**
   * check if ev matches pointertype
   * @param   {String}        pointerType     Hammer.POINTER_MOUSE
   * @param   {PointerEvent}  ev
   */
  matchType: function(pointerType, ev) {
    if(!ev.pointerType) {
      return false;
    }

    var pt = ev.pointerType,
      types = {};
    types[Hammer.POINTER_MOUSE] = (pt === ev.MSPOINTER_TYPE_MOUSE || pt === Hammer.POINTER_MOUSE);
    types[Hammer.POINTER_TOUCH] = (pt === ev.MSPOINTER_TYPE_TOUCH || pt === Hammer.POINTER_TOUCH);
    types[Hammer.POINTER_PEN] = (pt === ev.MSPOINTER_TYPE_PEN || pt === Hammer.POINTER_PEN);
    return types[pointerType];
  },


  /**
   * get events
   */
  getEvents: function() {
    return [
      'pointerdown MSPointerDown',
      'pointermove MSPointerMove',
      'pointerup pointercancel MSPointerUp MSPointerCancel'
    ];
  },

  /**
   * reset the list
   */
  reset: function() {
    this.pointers = {};
  }
};


Hammer.detection = {
  // contains all registred Hammer.gestures in the correct order
  gestures: [],

  // data of the current Hammer.gesture detection session
  current : null,

  // the previous Hammer.gesture session data
  // is a full clone of the previous gesture.current object
  previous: null,

  // when this becomes true, no gestures are fired
  stopped : false,


  /**
   * start Hammer.gesture detection
   * @param   {Hammer.Instance}   inst
   * @param   {Object}            eventData
   */
  startDetect: function startDetect(inst, eventData) {
    // already busy with a Hammer.gesture detection on an element
    if(this.current) {
      return;
    }

    this.stopped = false;

    this.current = {
      inst      : inst, // reference to HammerInstance we're working for
      startEvent: Hammer.utils.extend({}, eventData), // start eventData for distances, timing etc
      lastEvent : false, // last eventData
      name      : '' // current gesture we're in/detected, can be 'tap', 'hold' etc
    };

    this.detect(eventData);
  },


  /**
   * Hammer.gesture detection
   * @param   {Object}    eventData
   */
  detect: function detect(eventData) {
    if(!this.current || this.stopped) {
      return;
    }

    // extend event data with calculations about scale, distance etc
    eventData = this.extendEventData(eventData);

    // instance options
    var inst_options = this.current.inst.options;

    // call Hammer.gesture handlers
    Hammer.utils.each(this.gestures, function(gesture) {
      // only when the instance options have enabled this gesture
      if(!this.stopped && inst_options[gesture.name] !== false) {
        // if a handler returns false, we stop with the detection
        if(gesture.handler.call(gesture, eventData, this.current.inst) === false) {
          this.stopDetect();
          return false;
        }
      }
    }, this);

    // store as previous event event
    if(this.current) {
      this.current.lastEvent = eventData;
    }

    // endevent, but not the last touch, so dont stop
    if(eventData.eventType == Hammer.EVENT_END && !eventData.touches.length - 1) {
      this.stopDetect();
    }

    return eventData;
  },


  /**
   * clear the Hammer.gesture vars
   * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
   * to stop other Hammer.gestures from being fired
   */
  stopDetect: function stopDetect() {
    // clone current data to the store as the previous gesture
    // used for the double tap gesture, since this is an other gesture detect session
    this.previous = Hammer.utils.extend({}, this.current);

    // reset the current
    this.current = null;

    // stopped!
    this.stopped = true;
  },


  /**
   * extend eventData for Hammer.gestures
   * @param   {Object}   ev
   * @returns {Object}   ev
   */
  extendEventData: function extendEventData(ev) {
    var startEv = this.current.startEvent;

    // if the touches change, set the new touches over the startEvent touches
    // this because touchevents don't have all the touches on touchstart, or the
    // user must place his fingers at the EXACT same time on the screen, which is not realistic
    // but, sometimes it happens that both fingers are touching at the EXACT same time
    if(startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {
      // extend 1 level deep to get the touchlist with the touch objects
      startEv.touches = [];
      Hammer.utils.each(ev.touches, function(touch) {
        startEv.touches.push(Hammer.utils.extend({}, touch));
      });
    }

    var delta_time = ev.timeStamp - startEv.timeStamp
      , delta_x = ev.center.pageX - startEv.center.pageX
      , delta_y = ev.center.pageY - startEv.center.pageY
      , velocity = Hammer.utils.getVelocity(delta_time, delta_x, delta_y)
      , interimAngle
      , interimDirection;

    // end events (e.g. dragend) don't have useful values for interimDirection & interimAngle
    // because the previous event has exactly the same coordinates
    // so for end events, take the previous values of interimDirection & interimAngle
    // instead of recalculating them and getting a spurious '0'
    if(ev.eventType === 'end') {
      interimAngle = this.current.lastEvent && this.current.lastEvent.interimAngle;
      interimDirection = this.current.lastEvent && this.current.lastEvent.interimDirection;
    }
    else {
      interimAngle = this.current.lastEvent && Hammer.utils.getAngle(this.current.lastEvent.center, ev.center);
      interimDirection = this.current.lastEvent && Hammer.utils.getDirection(this.current.lastEvent.center, ev.center);
    }

    Hammer.utils.extend(ev, {
      deltaTime: delta_time,

      deltaX: delta_x,
      deltaY: delta_y,

      velocityX: velocity.x,
      velocityY: velocity.y,

      distance: Hammer.utils.getDistance(startEv.center, ev.center),

      angle: Hammer.utils.getAngle(startEv.center, ev.center),
      interimAngle: interimAngle,

      direction: Hammer.utils.getDirection(startEv.center, ev.center),
      interimDirection: interimDirection,

      scale: Hammer.utils.getScale(startEv.touches, ev.touches),
      rotation: Hammer.utils.getRotation(startEv.touches, ev.touches),

      startEvent: startEv
    });

    return ev;
  },


  /**
   * register new gesture
   * @param   {Object}    gesture object, see gestures.js for documentation
   * @returns {Array}     gestures
   */
  register: function register(gesture) {
    // add an enable gesture options if there is no given
    var options = gesture.defaults || {};
    if(options[gesture.name] === undefined) {
      options[gesture.name] = true;
    }

    // extend Hammer default options with the Hammer.gesture options
    Hammer.utils.extend(Hammer.defaults, options, true);

    // set its index
    gesture.index = gesture.index || 1000;

    // add Hammer.gesture to the list
    this.gestures.push(gesture);

    // sort the list by index
    this.gestures.sort(function(a, b) {
      if(a.index < b.index) { return -1; }
      if(a.index > b.index) { return 1; }
      return 0;
    });

    return this.gestures;
  }
};


/**
 * Drag
 * Move with x fingers (default 1) around on the page. Blocking the scrolling when
 * moving left and right is a good practice. When all the drag events are blocking
 * you disable scrolling on that area.
 * @events  drag, drapleft, dragright, dragup, dragdown
 */
Hammer.gestures.Drag = {
  name     : 'drag',
  index    : 50,
  defaults : {
    drag_min_distance            : 10,
    
    // Set correct_for_drag_min_distance to true to make the starting point of the drag
    // be calculated from where the drag was triggered, not from where the touch started.
    // Useful to avoid a jerk-starting drag, which can make fine-adjustments
    // through dragging difficult, and be visually unappealing.
    correct_for_drag_min_distance: true,
    
    // set 0 for unlimited, but this can conflict with transform
    drag_max_touches             : 1,
    
    // prevent default browser behavior when dragging occurs
    // be careful with it, it makes the element a blocking element
    // when you are using the drag gesture, it is a good practice to set this true
    drag_block_horizontal        : false,
    drag_block_vertical          : false,
    
    // drag_lock_to_axis keeps the drag gesture on the axis that it started on,
    // It disallows vertical directions if the initial direction was horizontal, and vice versa.
    drag_lock_to_axis            : false,
    
    // drag lock only kicks in when distance > drag_lock_min_distance
    // This way, locking occurs only when the distance has become large enough to reliably determine the direction
    drag_lock_min_distance       : 25
  },
  
  triggered: false,
  handler  : function dragGesture(ev, inst) {
    // current gesture isnt drag, but dragged is true
    // this means an other gesture is busy. now call dragend
    if(Hammer.detection.current.name != this.name && this.triggered) {
      inst.trigger(this.name + 'end', ev);
      this.triggered = false;
      return;
    }

    // max touches
    if(inst.options.drag_max_touches > 0 &&
      ev.touches.length > inst.options.drag_max_touches) {
      return;
    }

    switch(ev.eventType) {
      case Hammer.EVENT_START:
        this.triggered = false;
        break;

      case Hammer.EVENT_MOVE:
        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(ev.distance < inst.options.drag_min_distance &&
          Hammer.detection.current.name != this.name) {
          return;
        }

        // we are dragging!
        if(Hammer.detection.current.name != this.name) {
          Hammer.detection.current.name = this.name;
          if(inst.options.correct_for_drag_min_distance && ev.distance > 0) {
            // When a drag is triggered, set the event center to drag_min_distance pixels from the original event center.
            // Without this correction, the dragged distance would jumpstart at drag_min_distance pixels instead of at 0.
            // It might be useful to save the original start point somewhere
            var factor = Math.abs(inst.options.drag_min_distance / ev.distance);
            Hammer.detection.current.startEvent.center.pageX += ev.deltaX * factor;
            Hammer.detection.current.startEvent.center.pageY += ev.deltaY * factor;

            // recalculate event data using new start point
            ev = Hammer.detection.extendEventData(ev);
          }
        }

        // lock drag to axis?
        if(Hammer.detection.current.lastEvent.drag_locked_to_axis || (inst.options.drag_lock_to_axis && inst.options.drag_lock_min_distance <= ev.distance)) {
          ev.drag_locked_to_axis = true;
        }
        var last_direction = Hammer.detection.current.lastEvent.direction;
        if(ev.drag_locked_to_axis && last_direction !== ev.direction) {
          // keep direction on the axis that the drag gesture started on
          if(Hammer.utils.isVertical(last_direction)) {
            ev.direction = (ev.deltaY < 0) ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
          }
          else {
            ev.direction = (ev.deltaX < 0) ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
          }
        }

        // first time, trigger dragstart event
        if(!this.triggered) {
          inst.trigger(this.name + 'start', ev);
          this.triggered = true;
        }

        // trigger normal event
        inst.trigger(this.name, ev);

        // direction event, like dragdown
        inst.trigger(this.name + ev.direction, ev);

        // block the browser events
        if((inst.options.drag_block_vertical && Hammer.utils.isVertical(ev.direction)) ||
          (inst.options.drag_block_horizontal && !Hammer.utils.isVertical(ev.direction))) {
          ev.preventDefault();
        }
        break;

      case Hammer.EVENT_END:
        // trigger dragend
        if(this.triggered) {
          inst.trigger(this.name + 'end', ev);
        }

        this.triggered = false;
        break;
    }
  }
};

/**
 * Hold
 * Touch stays at the same place for x time
 * @events  hold
 */
Hammer.gestures.Hold = {
  name    : 'hold',
  index   : 10,
  defaults: {
    hold_timeout  : 500,
    hold_threshold: 1
  },
  timer   : null,
  handler : function holdGesture(ev, inst) {
    switch(ev.eventType) {
      case Hammer.EVENT_START:
        // clear any running timers
        clearTimeout(this.timer);

        // set the gesture so we can check in the timeout if it still is
        Hammer.detection.current.name = this.name;

        // set timer and if after the timeout it still is hold,
        // we trigger the hold event
        this.timer = setTimeout(function() {
          if(Hammer.detection.current.name == 'hold') {
            inst.trigger('hold', ev);
          }
        }, inst.options.hold_timeout);
        break;

      // when you move or end we clear the timer
      case Hammer.EVENT_MOVE:
        if(ev.distance > inst.options.hold_threshold) {
          clearTimeout(this.timer);
        }
        break;

      case Hammer.EVENT_END:
        clearTimeout(this.timer);
        break;
    }
  }
};

/**
 * Release
 * Called as last, tells the user has released the screen
 * @events  release
 */
Hammer.gestures.Release = {
  name   : 'release',
  index  : Infinity,
  handler: function releaseGesture(ev, inst) {
    if(ev.eventType == Hammer.EVENT_END) {
      inst.trigger(this.name, ev);
    }
  }
};

/**
 * Swipe
 * triggers swipe events when the end velocity is above the threshold
 * @events  swipe, swipeleft, swiperight, swipeup, swipedown
 */
Hammer.gestures.Swipe = {
  name    : 'swipe',
  index   : 40,
  defaults: {
    // set 0 for unlimited, but this can conflict with transform
    swipe_min_touches: 1,
    swipe_max_touches: 1,
    swipe_velocity   : 0.7
  },
  handler : function swipeGesture(ev, inst) {
    if(ev.eventType == Hammer.EVENT_END) {
      // max touches
      if(inst.options.swipe_max_touches > 0 &&
        ev.touches.length < inst.options.swipe_min_touches &&
        ev.touches.length > inst.options.swipe_max_touches) {
        return;
      }

      // when the distance we moved is too small we skip this gesture
      // or we can be already in dragging
      if(ev.velocityX > inst.options.swipe_velocity ||
        ev.velocityY > inst.options.swipe_velocity) {
        // trigger swipe events
        inst.trigger(this.name, ev);
        inst.trigger(this.name + ev.direction, ev);
      }
    }
  }
};

/**
 * Tap/DoubleTap
 * Quick touch at a place or double at the same place
 * @events  tap, doubletap
 */
Hammer.gestures.Tap = {
  name    : 'tap',
  index   : 100,
  defaults: {
    tap_max_touchtime : 250,
    tap_max_distance  : 10,
    tap_always        : true,
    doubletap_distance: 20,
    doubletap_interval: 300
  },
  handler : function tapGesture(ev, inst) {
    if(ev.eventType == Hammer.EVENT_END && ev.srcEvent.type != 'touchcancel') {
      // previous gesture, for the double tap since these are two different gesture detections
      var prev = Hammer.detection.previous,
        did_doubletap = false;

      // when the touchtime is higher then the max touch time
      // or when the moving distance is too much
      if(ev.deltaTime > inst.options.tap_max_touchtime ||
        ev.distance > inst.options.tap_max_distance) {
        return;
      }

      // check if double tap
      if(prev && prev.name == 'tap' &&
        (ev.timeStamp - prev.lastEvent.timeStamp) < inst.options.doubletap_interval &&
        ev.distance < inst.options.doubletap_distance) {
        inst.trigger('doubletap', ev);
        did_doubletap = true;
      }

      // do a single tap
      if(!did_doubletap || inst.options.tap_always) {
        Hammer.detection.current.name = 'tap';
        inst.trigger(Hammer.detection.current.name, ev);
      }
    }
  }
};

/**
 * Touch
 * Called as first, tells the user has touched the screen
 * @events  touch
 */
Hammer.gestures.Touch = {
  name    : 'touch',
  index   : -Infinity,
  defaults: {
    // call preventDefault at touchstart, and makes the element blocking by
    // disabling the scrolling of the page, but it improves gestures like
    // transforming and dragging.
    // be careful with using this, it can be very annoying for users to be stuck
    // on the page
    prevent_default    : false,

    // disable mouse events, so only touch (or pen!) input triggers events
    prevent_mouseevents: false
  },
  handler : function touchGesture(ev, inst) {
    if(inst.options.prevent_mouseevents && ev.pointerType == Hammer.POINTER_MOUSE) {
      ev.stopDetect();
      return;
    }

    if(inst.options.prevent_default) {
      ev.preventDefault();
    }

    if(ev.eventType == Hammer.EVENT_START) {
      inst.trigger(this.name, ev);
    }
  }
};

/**
 * Transform
 * User want to scale or rotate with 2 fingers
 * @events  transform, pinch, pinchin, pinchout, rotate
 */
Hammer.gestures.Transform = {
  name     : 'transform',
  index    : 45,
  defaults : {
    // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
    transform_min_scale   : 0.01,
    // rotation in degrees
    transform_min_rotation: 1,
    // prevent default browser behavior when two touches are on the screen
    // but it makes the element a blocking element
    // when you are using the transform gesture, it is a good practice to set this true
    transform_always_block: false
  },
  triggered: false,
  handler  : function transformGesture(ev, inst) {
    // current gesture isnt drag, but dragged is true
    // this means an other gesture is busy. now call dragend
    if(Hammer.detection.current.name != this.name && this.triggered) {
      inst.trigger(this.name + 'end', ev);
      this.triggered = false;
      return;
    }

    // atleast multitouch
    if(ev.touches.length < 2) {
      return;
    }

    // prevent default when two fingers are on the screen
    if(inst.options.transform_always_block) {
      ev.preventDefault();
    }

    switch(ev.eventType) {
      case Hammer.EVENT_START:
        this.triggered = false;
        break;

      case Hammer.EVENT_MOVE:
        var scale_threshold = Math.abs(1 - ev.scale);
        var rotation_threshold = Math.abs(ev.rotation);

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(scale_threshold < inst.options.transform_min_scale &&
          rotation_threshold < inst.options.transform_min_rotation) {
          return;
        }

        // we are transforming!
        Hammer.detection.current.name = this.name;

        // first time, trigger dragstart event
        if(!this.triggered) {
          inst.trigger(this.name + 'start', ev);
          this.triggered = true;
        }

        inst.trigger(this.name, ev); // basic transform event

        // trigger rotate event
        if(rotation_threshold > inst.options.transform_min_rotation) {
          inst.trigger('rotate', ev);
        }

        // trigger pinch event
        if(scale_threshold > inst.options.transform_min_scale) {
          inst.trigger('pinch', ev);
          inst.trigger('pinch' + ((ev.scale < 1) ? 'in' : 'out'), ev);
        }
        break;

      case Hammer.EVENT_END:
        // trigger dragend
        if(this.triggered) {
          inst.trigger(this.name + 'end', ev);
        }

        this.triggered = false;
        break;
    }
  }
};

  // Based off Lo-Dash's excellent UMD wrapper (slightly modified) - https://github.com/bestiejs/lodash/blob/master/lodash.js#L5515-L5543
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module
    define('hammer',[],function() {
      return Hammer;
    });
    // check for `exports` after `define` in case a build optimizer adds an `exports` object
  }
  else if(typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Hammer;
  }
  else {
    window.Hammer = Hammer;
  }
})(this);
/*! jQuery plugin for Hammer.JS - v1.0.0 - 2014-01-02
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */(function(window, undefined) {
  

function setup(Hammer, $) {
  /**
   * bind dom events
   * this overwrites addEventListener
   * @param   {HTMLElement}   element
   * @param   {String}        eventTypes
   * @param   {Function}      handler
   */
  Hammer.event.bindDom = function(element, eventTypes, handler) {
    $(element).on(eventTypes, function(ev) {
      var data = ev.originalEvent || ev;

      if(data.pageX === undefined) {
        data.pageX = ev.pageX;
        data.pageY = ev.pageY;
      }

      if(!data.target) {
        data.target = ev.target;
      }

      if(data.which === undefined) {
        data.which = data.button;
      }

      if(!data.preventDefault) {
        data.preventDefault = ev.preventDefault;
      }

      if(!data.stopPropagation) {
        data.stopPropagation = ev.stopPropagation;
      }

      handler.call(this, data);
    });
  };

  /**
   * the methods are called by the instance, but with the jquery plugin
   * we use the jquery event methods instead.
   * @this    {Hammer.Instance}
   * @return  {jQuery}
   */
  Hammer.Instance.prototype.on = function(types, handler) {
    return $(this.element).on(types, handler);
  };
  Hammer.Instance.prototype.off = function(types, handler) {
    return $(this.element).off(types, handler);
  };


  /**
   * trigger events
   * this is called by the gestures to trigger an event like 'tap'
   * @this    {Hammer.Instance}
   * @param   {String}    gesture
   * @param   {Object}    eventData
   * @return  {jQuery}
   */
  Hammer.Instance.prototype.trigger = function(gesture, eventData) {
    var el = $(this.element);
    if(el.has(eventData.target).length) {
      el = $(eventData.target);
    }

    return el.trigger({
      type   : gesture,
      gesture: eventData
    });
  };


  /**
   * jQuery plugin
   * create instance of Hammer and watch for gestures,
   * and when called again you can change the options
   * @param   {Object}    [options={}]
   * @return  {jQuery}
   */
  $.fn.hammer = function(options) {
    return this.each(function() {
      var el = $(this);
      var inst = el.data('hammer');
      // start new hammer instance
      if(!inst) {
        el.data('hammer', new Hammer(this, options || {}));
      }
      // change the options
      else if(inst && options) {
        Hammer.utils.extend(inst.options, options);
      }
    });
  };
}

  // Based off Lo-Dash's excellent UMD wrapper (slightly modified) - https://github.com/bestiejs/lodash/blob/master/lodash.js#L5515-L5543
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module
    define('jquery_hammer',['hammer', 'jquery'], setup);
  
  }
  else {
    setup(window.Hammer, window.jQuery || window.Zepto);
  }
})(this);
define('epub-ui/gestures',['jquery','jquery_hammer','hammer'], function($,jqueryHammer,Hammer){

    var gesturesHandler = function(reader,viewport){

        var nextPage = function(){
            reader.openPageRight();
        };

        var prevPage = function(){
            reader.openPageLeft();
        };

        this.initialize= function(){

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function(iframe,s) {
                //set hammer's document root
                Hammer.DOCUMENT = iframe.contents();
                //hammer's internal touch events need to be redefined? (doesn't work without)
                Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
                Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

                //set up the hammer gesture events
                //swiping handlers
                var swipingOptions = {prevent_mouseevents: true};
                Hammer(Hammer.DOCUMENT,swipingOptions).on("swipeleft", function() {
                    nextPage();
                });
                Hammer(Hammer.DOCUMENT,swipingOptions).on("swiperight", function() {
                    prevPage();
                });

                //remove stupid ipad safari elastic scrolling
                //TODO: test this with reader ScrollView and FixedView
                $(Hammer.DOCUMENT).on(
                    'touchmove',
                    function(e) {
                        //hack: check if we are not dealing with a scrollview
                        if(iframe.height()<=iframe.parent().height()){
                            e.preventDefault();
                        }
                    }
                );
            });

            //remove stupid ipad safari elastic scrolling (improves UX for gestures)
            //TODO: test this with reader ScrollView and FixedView
            $(viewport).on(
                'touchmove',
                function(e) {
                    e.preventDefault();
                }
            );

            //handlers on viewport
            $(viewport).hammer().on("swipeleft", function() {
                nextPage();
            });
            $(viewport).hammer().on("swiperight", function() {
                prevPage();
            });
        };

    };
    return gesturesHandler;
});

define('Readium',['require', 'module', 'jquery', 'underscore', 'readerView', 'epub-fetch', 'emub-model/package_document_parser', 'emub-model/package_document', 'epub-fetch/iframe_zip_loader', 'emub-model/smil_document_parser', 'URIjs', 'epub-ui/gestures'],
    function (require, module, $, _, readerView, ResourceFetcher, PackageParser, PackageDocument, IframeZipLoader, SmilParser, URI, GesturesHandler) {

    console.log('Readium module id: ' + module.id);

    //hack to make URI object global for readers consumption.
    window.URI = URI;

    var Readium = function(readiumOptions, readerOptions){

        var self = this;

        var _currentResourceFetcher;

        var _iframeZipLoader = new IframeZipLoader(ReadiumSDK, function() { return _currentResourceFetcher; });

        var jsLibRoot = readiumOptions.jsLibRoot;
        var renderingViewport = readerOptions.el;

        readerOptions.iframeLoader = _iframeZipLoader;

        this.reader = new ReadiumSDK.Views.ReaderView(readerOptions);

        var _gesturesHandler = new GesturesHandler(this.reader,renderingViewport);
        _gesturesHandler.initialize();


        this.openPackageDocument = function(bookRoot, callback)  {

            _currentResourceFetcher = new ResourceFetcher(bookRoot, jsLibRoot);

            _currentResourceFetcher.initialize(function() {

                var _packageParser = new PackageParser(bookRoot, _currentResourceFetcher);

                _packageParser.parse(function(docJson){
                    SmilParser.fillSmilData(docJson, bookRoot, jsLibRoot, _currentResourceFetcher, function() {
                        var packageDocument = new PackageDocument(_currentResourceFetcher.getPackageUrl(), docJson, _currentResourceFetcher);
                        var openBookOptions = readiumOptions.openBookOptions || {};
                        var openBookData = $.extend(packageDocument.getPackageData(), openBookOptions);
                        self.reader.openBook(openBookData);

                        var options = { 
                            packageDocumentUrl : _currentResourceFetcher.getPackageUrl(),
                            metadata: docJson.metadata
                        };

                        if (callback){
                            // gives caller access to document metadata like the table of contents
                            callback(packageDocument, options);
                        }
                    })
                });
            });
        }

        ReadiumSDK.trigger(ReadiumSDK.Events.READER_INITIALIZED, this.reader);
    };


    return Readium;

});
