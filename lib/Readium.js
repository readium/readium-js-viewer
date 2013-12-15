
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
                PAGINATION_CHANGED: "PaginationChanged",
                SETTINGS_APPLIED: "SettingsApplied",
                CONTENT_DOCUMENT_LOADED: "ContentDocumentLoaded",
                CURRENT_VIEW_PAGINATION_CHANGED: "CurrentViewPaginationChanged", // used internally
                MEDIA_OVERLAY_STATUS_CHANGED: "MediaOverlayStatusChanged",
                MEDIA_OVERLAY_TTS_SPEAK: "MediaOverlayTTSSpeak",
                MEDIA_OVERLAY_TTS_STOP: "MediaOverlayTTSStop"
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

        if(settingsData.mediaOverlaysSkipSkippables !== undefined) {
            this.mediaOverlaysSkipSkippables = settingsData.mediaOverlaysSkipSkippables;
        }

        if(settingsData.mediaOverlaysEscapeEscapables !== undefined) {
            this.mediaOverlaysEscapeEscapables = settingsData.mediaOverlaysEscapeEscapables;
        }

        if(settingsData.mediaOverlaysSkippables !== undefined) {
            this.mediaOverlaysSkippables = buildArray(settingsData.mediaOverlaysSkippables);
        }

        if(settingsData.mediaOverlaysEscapables !== undefined) {
            this.mediaOverlaysEscapables = buildArray(settingsData.mediaOverlaysEscapables);
        }

        if(settingsData.mediaOverlaysEnableClick !== undefined) {
            this.mediaOverlaysEnableClick = settingsData.mediaOverlaysEnableClick;
        }

        if(settingsData.mediaOverlaysRate !== undefined) {
            this.mediaOverlaysRate = settingsData.mediaOverlaysRate;
        }

        if(settingsData.mediaOverlaysVolume !== undefined) {
            this.mediaOverlaysVolume = settingsData.mediaOverlaysVolume;
        }
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
    }

};

ReadiumSDK.Models.SpineItem.SPREAD_LEFT = "page-spread-left";
ReadiumSDK.Models.SpineItem.SPREAD_RIGHT = "page-spread-right";
ReadiumSDK.Models.SpineItem.SPREAD_CENTER = "page-spread-center";

ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_NONE = "none";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_LANDSCAPE = "landscape";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_PORTRAIT = "portrait";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_BOTH = "both";
ReadiumSDK.Models.SpineItem.RENDITION_SPREAD_AUTO = "auto";


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

ReadiumSDK.Models.Smil.SmilNode = function() {

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
    }
};

ReadiumSDK.Models.Smil.TimeContainerNode = function() {
    this.id = "";
    this.epubtype = "";
    this.index = undefined;
    this.parent = undefined;
    this.children = undefined;
	
    //root node is a smil model
    this.getSmil = function() {

        var node = this;
        while(node.parent) {
            node = node.parent;
        }

        return node;
    }

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
    }

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
    }
};

ReadiumSDK.Models.Smil.TimeContainerNode.prototype = new ReadiumSDK.Models.Smil.SmilNode();

//////////////////////////
//MediaNode

ReadiumSDK.Models.Smil.MediaNode = function() {
    this.src = "";
};

ReadiumSDK.Models.Smil.MediaNode.prototype = new ReadiumSDK.Models.Smil.SmilNode();

////////////////////////////
//SeqNode

ReadiumSDK.Models.Smil.SeqNode = function() {
    this.children = [];
    this.nodeType = "seq";
    this.textref = "";
};

ReadiumSDK.Models.Smil.SeqNode.prototype = new ReadiumSDK.Models.Smil.TimeContainerNode();

//////////////////////////
//ParNode

ReadiumSDK.Models.Smil.ParNode = function() {
    this.children = [];
    this.nodeType = "par";
    this.text = undefined;
    this.audio = undefined;
    this.element = undefined;
};

ReadiumSDK.Models.Smil.ParNode.prototype = new ReadiumSDK.Models.Smil.TimeContainerNode();

//////////////////////////
//TextNode

ReadiumSDK.Models.Smil.TextNode = function() {

    this.nodeType = "text";
    this.srcFile = "";
    this.srcFragmentId = "";
};

ReadiumSDK.Models.Smil.TextNode.prototype = new ReadiumSDK.Models.Smil.MediaNode();

///////////////////////////
//AudioNode

ReadiumSDK.Models.Smil.AudioNode = function() {

    this.nodeType = "audio";

    this.clipBegin = 0;

    this.MAX = 1234567890.1; //Number.MAX_VALUE - 0.1; //Infinity;
    this.clipEnd = this.MAX;
};

ReadiumSDK.Models.Smil.AudioNode.prototype = new ReadiumSDK.Models.Smil.MediaNode();

//////////////////////////////
//SmilModel

ReadiumSDK.Models.SmilModel = function() {

    this.children = []; //collection of seq or par smil nodes
    this.id = undefined; //manifest item id
    this.href = undefined; //href of the .smil source file
    this.duration = undefined;
    this.mo = undefined;
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

        if(property in from) {

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
            console.error("Required property " + property + " not found in smil node " + from.nodeType);
        }
    };

    var createNodeFromDTO = function(nodeDTO, parent) {

        var node;

        if(nodeDTO.nodeType == "seq") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO seq");
            }

            node = new ReadiumSDK.Models.Smil.SeqNode();
            node.parent = parent;
            safeCopyProperty("textref", nodeDTO, node, true);
            safeCopyProperty("id", nodeDTO, node);
            safeCopyProperty("epubtype", nodeDTO, node);

            indent++;
            copyChildren(nodeDTO, node);
            indent--;
        }
        else if (nodeDTO.nodeType == "par") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO par");
            }

            node = new ReadiumSDK.Models.Smil.ParNode();
            node.parent = parent;
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

            var forceTTS = false; // for testing only!
            if (forceTTS || !node.audio)
            {
                // synthetic speech (playback using TTS engine), or embedded media, or blank page
                var fakeAudio = new ReadiumSDK.Models.Smil.AudioNode();
                fakeAudio.parent = node;
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

            node = new ReadiumSDK.Models.Smil.TextNode();
            node.parent = parent;
            safeCopyProperty("src", nodeDTO, node, true);
            safeCopyProperty("srcFile", nodeDTO, node, true);
            safeCopyProperty("srcFragmentId", nodeDTO, node, false);
            safeCopyProperty("id", nodeDTO, node);
        }
        else if (nodeDTO.nodeType == "audio") {

            if (smilModel.mo.DEBUG)
            {
            console.log(getIndent() + "JS MO audio");
            }

            node = new ReadiumSDK.Models.Smil.AudioNode();
            node.parent = parent;
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


ReadiumSDK.Models.MediaOverlay = function() {

    this.smil_models = [];

    this.skippables = [];
    this.escapables = [];

    this.duration = undefined;
    this.narrator = undefined;


    this.activeClass = undefined;
    this.playbackActiveClass = undefined;

    this.DEBUG = false;


    this.getSmilBySpineItem = function (spineItem) {

        for(var i = 0, count = this.smil_models.length; i < count; i++) {

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

ReadiumSDK.Models.MediaOverlay.fromDTO = function(moDTO) {

    var mo = new ReadiumSDK.Models.MediaOverlay();

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

ReadiumSDK.Models.Package = Backbone.Model.extend({

    spine: undefined,
    rendition_layout: undefined,
    rootUrl: undefined,
    rootUrlMO: undefined,
    media_overlay: undefined,

    initialize : function() {

        this.reset();

        var packageData = this.get("packageData");

        if(packageData) {

            this.rootUrl = packageData.rootUrl;
            this.rootUrlMO = packageData.rootUrlMO;

            this.rendition_layout = packageData.rendition_layout;

            if(!this.rendition_layout) {
                this.rendition_layout = "reflowable";
            }

            this.spine = new ReadiumSDK.Models.Spine(this, packageData.spine);

            this.media_overlay = ReadiumSDK.Models.MediaOverlay.fromDTO(packageData.media_overlay);
        }
    },

    resolveRelativeUrlMO: function(relativeUrl) {

        if(this.rootUrlMO && this.rootUrlMO.length > 0) {

            if(ReadiumSDK.Helpers.EndsWith(this.rootUrlMO, "/")){
                return this.rootUrlMO + relativeUrl;
            }
            else {
                return this.rootUrlMO + "/" + relativeUrl;
            }
        }

        return this.resolveRelativeUrl(relativeUrl);
    },

    resolveRelativeUrl: function(relativeUrl) {

        if(this.rootUrl) {

            if(ReadiumSDK.Helpers.EndsWith(this.rootUrl, "/")){
                return this.rootUrl + relativeUrl;
            }
            else {
                return this.rootUrl + "/" + relativeUrl;
            }
        }

        return relativeUrl;
    },

    reset: function() {
        this.spine = undefined;
        this.rendition_layout = undefined;
        this.rootUrl = undefined;
        this.rootUrlMO = undefined;
    },

    isFixedLayout: function() {
        return this.rendition_layout === "pre-paginated";
    },

    isReflowable: function() {
        return !this.isFixedLayout();
    }
});

define("package", ["readiumSDK","spine","mediaOverlay"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.package;
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

ReadiumSDK.Views.AudioPlayer = function(onStatusChanged, onPositionChanged, onAudioEnded, onAudioPlay, onAudioPause)
{
    var DEBUG = false;

    var self = this;

    var _audioElement = new Audio();
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
        onStatusChanged({isPlaying: false});
        onAudioPause();
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

                onPositionChanged(currentTime);
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
        return _intervalTimer != undefined;
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


    var _iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;
    var _Android = navigator.userAgent.toLowerCase().indexOf('android') > -1;
    var _isMobile = _iOS || _Android;

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
    
    this.playFile = function(smilSrc, epubSrc, seekBegin, element)
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

    var _highlightedElement = undefined;

    var _activeClass = "";
    var _playbackActiveClass = "";

    var _reader = reader;

    var self = this;

    var $userStyle = undefined;
    this.clearUserStyle = function()
    {
        if ($userStyle)
        {
            $userStyle.remove();
        }
        $userStyle = undefined;
    };

    function ensureUserStyle($element)
    {
        if ($userStyle)
        {
            if ($userStyle[0].ownerDocument === $element[0].ownerDocument)
            {
                return;
            }

            //self.clearUserStyle();
        }

        var style = _reader.userStyles().findStyle("." + DEFAULT_MO_ACTIVE_CLASS);
        if (!style)
        {
            return;
        }

        $head = $("head", $element[0].ownerDocument.documentElement);

        $userStyle = $("<style type='text/css'> </style>").appendTo($head);

        $userStyle.append("." + DEFAULT_MO_ACTIVE_CLASS + " {");
        for(var prop in style.declarations)
        {
            if(!style.declarations.hasOwnProperty(prop))
            {
                continue;
            }

            $userStyle.append(prop + ": " + style.declarations[prop] + "; ");
        }
        $userStyle.append("}");

//console.debug($userStyle[0].textContent);
    }

    this.highlightElement = function(element, activeClass, playbackActiveClass) {

        if(!element || element === _highlightedElement) {
            return;
        }

        this.reset();

        _highlightedElement = element;
        _activeClass = activeClass;
        _playbackActiveClass = playbackActiveClass;

        if (_playbackActiveClass && _playbackActiveClass !== "")
        {
            //console.debug("MO playbackActiveClass: " + _playbackActiveClass);
            $(_highlightedElement.ownerDocument.documentElement).addClass(_playbackActiveClass);
            //console.debug("MO playbackActiveClass 2: " + _highlightedElement.ownerDocument.documentElement.classList);
        }

        if (_activeClass && _activeClass !== "")
        {
            //console.debug("MO activeClass: " + _activeClass);
            $(_highlightedElement).addClass(_activeClass);
        }
        else
        {
            //console.debug("MO active NO CLASS: " + _activeClass);

            var $hel = $(_highlightedElement);
            ensureUserStyle($hel);
            $hel.addClass(DEFAULT_MO_ACTIVE_CLASS);

            //$(_highlightedElement).css("background", BACK_COLOR);
        }
    };

    this.reset = function() {

        if(_highlightedElement) {

            if (_playbackActiveClass && _playbackActiveClass !== "")
            {
                //console.debug("MO RESET playbackActiveClass: " + _playbackActiveClass);
                $(_highlightedElement.ownerDocument.documentElement).removeClass(_playbackActiveClass);
            }

            if (_activeClass && _activeClass !== "")
            {
                //console.debug("MO RESET activeClass: " + _activeClass);
                $(_highlightedElement).removeClass(_activeClass);
            }
            else
            {
                //console.debug("MO RESET active NO CLASS: " + _activeClass);
                $(_highlightedElement).removeClass(DEFAULT_MO_ACTIVE_CLASS);
                //$(_highlightedElement).css("background", '');
            }

            _highlightedElement = undefined;
            _activeClass = "";
            _playbackActiveClass = "";
        }
    }

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
        _elementHighlighter.clearUserStyle();
    };

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

    this.onPageChanged = function(paginationData) {

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

                element = reader.getElement(spineItem, paginationData.initiator == self && !paginationData.elementId ? "body" : "#" + paginationData.elementId);
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

            if (!element)
            {
                console.error("paginationData.elementId BUT !element");
            }
        }

        var wasPlaying = self.isPlaying();

        if(!_smilIterator || !_smilIterator.currentPar) {
            if(paginationData.initiator !== self) {
                clipBeginOffset = 0.0;
                self.reset();

                if (paginationData.elementId && element)
                {
                    if (wasPlaying)
                    {
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

            playPar(moData.par);
            return;
        }

        if(!_smilIterator.currentPar.element) {
            console.error("!! _smilIterator.currentPar.element ??");
        }

//console.debug("+++> paginationData.elementId: " + paginationData.elementId + " /// " + _smilIterator.currentPar.text.srcFile + " # " + _smilIterator.currentPar.text.srcFragmentId); //PageOpenRequest.elementId


        if(paginationData.initiator == self)
        {
            var notSameTargetID = paginationData.elementId && paginationData.elementId !== _smilIterator.currentPar.text.srcFragmentId;

            if(notSameTargetID) {
                console.error("!! paginationData.elementId !== _smilIterator.currentPar.text.srcFragmentId");
            }

            if(notSameTargetID || !_smilIterator.currentPar.element) {
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
            onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1);

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

                    onStatusChanged({isPlaying: true});

                    _embeddedIsPlaying = true;

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

            _audioPlayer.playFile(_smilIterator.currentPar.audio.src, audioSource, startTime, _smilIterator.currentPar.element);
        }

        clipBeginOffset = 0.0;

        highlightCurrentElement();
    }

    function nextSmil(goNext)
    {
        pause();

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

    function onAudioPositionChanged(position) { //noLetPlay

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

//console.debug("PLAY NEXT: " + position + " (" + audio.clipBegin + " -- " + audio.clipEnd + ")");

        var goNext = position > audio.clipEnd;
        if (goNext)
        {
            _smilIterator.next();
        }
        else //position <= DIRECTION_MARK
        {
            _smilIterator.previous();
        }

        if(_smilIterator.currentPar) {

            if(!_smilIterator.currentPar.audio) {
                pause();
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
                    console.debug("MO SKIP: " + parent.epubtype);

                    var pos = goNext ? _smilIterator.currentPar.audio.clipEnd + 0.1 : DIRECTION_MARK - 1;

                    onAudioPositionChanged(pos); //noLetPlay
                    return;
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
            return;
        }
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

//console.log("NEXT SMIL ON AUDIO POS");
        nextSmil(goNext);
    }

    var _enableHTMLSpeech = false && window.speechSynthesis !== undefined;

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
        var element = (_smilIterator && _smilIterator.currentPar) ? _smilIterator.currentPar.element : undefined;

        if (!volume || volume > 0)
        {
            onStatusChanged({isPlaying: true});
            _ttsIsPlaying = true;

            if (element)
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
//console.debug("TTS pause before speak");
            window.speechSynthesis.pause();

//console.debug("TTS cancel before speak");
            window.speechSynthesis.cancel();

//            setTimeout(function()
//            {
            var utt = new SpeechSynthesisUtterance();
            if (tokenData)
            {
                utt.tokenData = tokenData;
            }

            utt.onend = function(event)
            //utt.addEventListener("end", function(event)
            {
console.debug("TTS ended");
//console.debug(event);
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

                self.onTTSEnd();
            };

            utt.onboundary = function(event)
            //utt.addEventListener("boundary", function(event)
            {
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

            utt.onerror = function(event)
            //utt.addEventListener("error", function(event)
            {
console.debug("TTS error");
//console.debug(event);

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
            };

            var vol = volume || _audioPlayer.getVolume();
            utt.volume = vol;

            utt.rate = _audioPlayer.getRate();
            utt.pitch = 1;

            //utt.lang = "en-US";

            utt.text = text;

//console.debug("TTS speak: " + text);
            window.speechSynthesis.speak(utt);
//
//            }, 10);
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

console.debug("TTS pause");
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
        if (_timerTick != undefined)
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

        onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1);
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

        onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1);
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

        onAudioPositionChanged(_smilIterator.currentPar.audio.clipEnd + 0.1);
    }

    function highlightCurrentElement() {

        if(!_smilIterator) {
            return;
        }

        if(!_smilIterator.currentPar) {
            return;
        }

        if(_smilIterator.currentPar.element) {
//console.error(_smilIterator.currentPar.element.id + ": " + _smilIterator.currentPar.audio.clipBegin + " / " + _smilIterator.currentPar.audio.clipEnd);

            if (_smilIterator.currentPar.text.srcFragmentId.length > 0)
            {
                _elementHighlighter.highlightElement(_smilIterator.currentPar.element, _package.media_overlay.activeClass, _package.media_overlay.playbackActiveClass);

                reader.insureElementVisibility(_smilIterator.currentPar.element, self);
            }
            return;
        }

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

        //pause();
        //self.reset();
        _smilIterator = undefined;

        reader.openContentUrl(src, base, self);
    }

    this.escape = function() {

        if(!_smilIterator || !_smilIterator.currentPar) {
            return;
        }

        if(!self.isPlaying())
        {
            //playCurrentPar();
            play();
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

        this.nextMediaOverlay();
    };


    this.playUserPar = function(par) {
        if(self.isPlaying())
        {
            pause();
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
    };


    function play()
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

                self.reset();
                self.toggleMediaOverlay();
                return;
            }
        }

        highlightCurrentElement();
    }

    function pause()
    {
        if (_blankPagePlayer)
        {
            self.resetBlankPage();
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

        var visibleMediaElements = reader.getVisibleMediaOverlayElements();

//        if (console.timeEnd)
//        {
//            console.timeEnd("MO");
//        }
//
//        var now2 = window.performance && window.performance.now ? window.performance.now() : Date.now();
//
//        console.debug(now2 - now1);

        return visibleMediaElements.length > 0;
    };

    this.nextOrPreviousMediaOverlay = function(previous) {
        if(self.isPlaying())
        {
            pause();
        }
        else
        {
            if (_smilIterator && _smilIterator.currentPar)
            {
                //playCurrentPar();
                play();
                return;
            }
        }

        if(!_smilIterator)
        {
            this.toggleMediaOverlay();
            return;
        }

        var position = previous ? DIRECTION_MARK - 1 : _smilIterator.currentPar.audio.clipEnd + 0.1;

        onAudioPositionChanged(position); //true

        //play();
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

        //pause();
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
            pause();
            return;
        }

        //if we have position to continue from (reset wasn't called)
        if(_smilIterator) {
            play();
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
            pause();
            playingPar = _smilIterator.currentPar;
        }

        //paginationData && paginationData.elementId
        //paginationData.initiator != self

        //_package.isFixedLayout()

        var element = undefined;

        var id = paginationData && paginationData.elementId ? paginationData.elementId : undefined;

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
                element = reader.getElement(spineItem, "#" + id);
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

        if (!element)
        {
            var visibleMediaOverlayElements = reader.getVisibleMediaOverlayElements();

            if (visibleMediaOverlayElements.length == 0)
            {
                console.error("reader.getVisibleMediaOverlayElements().length == 0");
            }
            else
            {
                if(visibleMediaOverlayElements.length == 1 || visibleMediaOverlayElements[0].percentVisible == 100)
                {
                    element = visibleMediaOverlayElements[0].element;
                }
                else
                {
                    element = visibleMediaOverlayElements[1].element;
                }
            }
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

        var parSmil = moData.par.getSmil();
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
            _smilIterator.goToPar(moData.par);
        }

        if (!_smilIterator.currentPar)
        {
            self.reset();
            return;
        }

        if (wasPlaying && playingPar && playingPar === _smilIterator.currentPar)
        {
            play();
        }
        else
        {
            playCurrentPar();
            //playPar(moData.par);
        }
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
		var currNodeMaxIndex = 0;
		var currTextPosition = 0;
		var nodeOffset;
		var originalText;
		var $injectedNode;
		var $newTextNode;
		// The iteration counter may be incorrect here (should be $textNodeList.length - 1 ??)
		for (nodeNum = 0; nodeNum < $textNodeList.length; nodeNum++) {

			if ($textNodeList[nodeNum].nodeType === 3) {

				currNodeMaxIndex = $textNodeList[nodeNum].nodeValue.length + currTextPosition;
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

					return $textNodeList.parent();
				}
				else if (currNodeMaxIndex === textOffset) {
					//the node should be injected directly after the complete text node
					$injectedNode = $(elementToInject).insertAfter($textNodeList.eq(nodeNum));
					return $textNodeList.parent();
				}
				else {

					currTextPosition = currTextPosition;
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

        return this.$iframe[0].contentDocument.documentElement;

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

    this.getPageForElementCfi = function(cfi) {

        var contentDoc = this.$iframe[0].contentDocument;
        var cfiParts = splitCfi(cfi);

        var wrappedCfi = "epubcfi(" + cfiParts.cfi + ")";
        //noinspection JSUnresolvedVariable
        var $element = EPUBcfi.Interpreter.getTargetElementWithPartialCFI(wrappedCfi, contentDoc);

        if(!$element || $element.length == 0) {
            console.log("Can't find element for CFI: " + cfi);
            return undefined;
        }

        return this.getPageForPointOnElement($element, cfiParts.x, cfiParts.y);
    };

    this.getPageForElement = function($element) {

        return this.getPageForPointOnElement($element, 0, 0);
    };

    this.getPageForPointOnElement = function($element, x, y) {

        var elementRect = ReadiumSDK.Helpers.Rect.fromElement($element);
        var posInElement = Math.ceil(elementRect.top + y * elementRect.height / 100);

        return Math.floor(posInElement / this.$viewport.height());
    };

    this.getPageForElementId = function(id) {

        var contentDoc = this.$iframe[0].contentDocument;

        var $element = $("#" + id, contentDoc);
        if($element.length == 0) {
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

    this.getVisibleMediaOverlayElements = function(visibleContentOffsets) {

        var $elements = this.getMediaOverlayElements($("body", this.getRootElement()));
        return this.getVisibleElements($elements, visibleContentOffsets);

    };

    this.isElementVisible = function($element, visibleContentOffsets) {

        var elementRect = ReadiumSDK.Helpers.Rect.fromElement($element);

        return !(elementRect.bottom() <= visibleContentOffsets.top || elementRect.top >= visibleContentOffsets.bottom);
    };

    this.getVisibleElements = function($elements, visibleContentOffsets) {

        var visibleElements = [];

        // Find the first visible text node
        $.each($elements, function() {

            var elementRect = ReadiumSDK.Helpers.Rect.fromElement(this);

            if(elementRect.bottom() <= visibleContentOffsets.top) {
                return true; //next element
            }

            if(elementRect.top >= visibleContentOffsets.bottom) {

                // Break the loop
                return false;
            }

            var visibleTop = Math.max(elementRect.top, visibleContentOffsets.top);
            var visibleBottom = Math.min(elementRect.bottom(), visibleContentOffsets.bottom);

            var visibleHeight = visibleBottom - visibleTop;
            var percentVisible = Math.round((visibleHeight / elementRect.height) * 100);

            visibleElements.push({element: this[0], percentVisible: percentVisible});

            return true;

        });

        return visibleElements;
    };

    this.getVisibleTextElements = function(visibleContentOffsets) {

        var $elements = this.getTextElements($("body", this.getRootElement()));

        return this.getVisibleElements($elements, visibleContentOffsets);
    };

    this.getMediaOverlayElements = function($root) {

        var $elements = [];

        function traverseCollection(elements) {

            if (elements == undefined) return;
            
            for(var i = 0, count = elements.length; i < count; i++) {

                var $element = $(elements[i]);

                if( $element.data("mediaOverlayData") ) {
                    $elements.push($element);
                }
                else {
                    traverseCollection($element[0].children);
                }

            }
        }

        traverseCollection([$root[0]]);

        return $elements;
    };

    this.getTextElements = function($root) {

        var $textElements = [];

        $root.find(":not(iframe)").contents().each(function () {

            if( isValidTextNode(this) ) {
                $textElements.push($(this).parent());
            }

        });

        return $textElements;

    };

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
    }

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
ReadiumSDK.Views.OnePageView = Backbone.View.extend({


    currentSpineItem: undefined,
    spine: undefined,
    contentAlignment: undefined, //expected 'center' 'left' 'right'
    iframeLoader: undefined,
    bookStyles: undefined,

    meta_size : {
        width: 0,
        height: 0
    },


    initialize: function() {

        this.spine = this.options.spine;
        this.contentAlignment = this.options.contentAlignment;
        this.iframeLoader = this.options.iframeLoader;
        this.bookStyles = this.options.bookStyles;

    },

    isDisplaying:function() {

        return this.currentSpineItem != undefined && this.$epubHtml != null && this.$epubHtml.length > 0;
    },

    render: function() {

        if(!this.$iframe) {

            this.template = ReadiumSDK.Helpers.loadTemplate("fixed_page_frame", {});

            this.setElement(this.template);

            this.$el.css("height", "100%");
            this.$el.css("width", "100%");

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
            this.applyBookStyles();
            this.updateMetaSize();
//            this.fitToScreen();

            this.trigger(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED, this.$iframe, this.currentSpineItem, true);
        }
    },

    applyBookStyles: function() {

        if(this.$epubHtml) {
            ReadiumSDK.Helpers.setStyles(this.bookStyles.getStyles(), this.$epubHtml);
        }
    },

//    fitToScreen: function() {
//
//        if(!this.isDisplaying()) {
//            return;
//        }
//
//        this.updateMetaSize();
//
//        if(this.meta_size.width <= 0 || this.meta_size.height <= 0) {
//            return;
//        }
//
//
//        var containerWidth = this.$el.width();
//        var containerHeight = this.$el.height();
//
//        var horScale = containerWidth / this.meta_size.width;
//        var verScale = containerHeight / this.meta_size.height;
//
//        var scale = Math.min(horScale, verScale);
//
//        var newWidth = this.meta_size.width * scale;
//        var newHeight = this.meta_size.height * scale;
//
//        var top = Math.floor((containerHeight - newHeight) / 2);
//
//        var left;
//        if(this.contentAlignment == "left") {
//            left = 0;
//        }
//        else if(this.contentAlignment == "right") {
//            left = containerWidth - newWidth;
//        }
//        else { //center
//            left = Math.floor((containerWidth - newWidth) / 2);
//        }
//
//        if(top < 0) top = 0;
//        if(left < 0) left = 0;
//
//        var css = this.generateTransformCSS(scale, left, top);
//        css["width"] = this.meta_size.width;
//        css["height"] = this.meta_size.height;
//
//        this.$epubHtml.css(css);
//    },

    transformContent: function(scale, left, top) {

        var elWidth = Math.floor(this.meta_size.width * scale);
        var elHeight = Math.floor(this.meta_size.height * scale);
                                                    
        this.$el.css("left", left + "px");
        this.$el.css("top", top + "px");
        this.$el.css("width", elWidth + "px");
        this.$el.css("height", elHeight + "px");
                                                    
        this.$iframe.css("width", elWidth + "px");
        this.$iframe.css("height", elHeight + "px");

        var css = this.generateTransformCSS(scale, 0, 0);

        css["width"] = this.meta_size.width;
        css["height"] = this.meta_size.height;

        if(!this.$epubHtml) {
            debugger;
        }

        this.$epubHtml.css(css);
        this.$iframe.css("visibility", "visible");
    },

    generateTransformCSS: function(scale, left, top) {

        var transformString = "translate(" + left + "px, " + top + "px) scale(" + scale + ")";

        //TODO modernizer library can be used to get browser independent transform attributes names (implemented in readium-web fixed_layout_book_zoomer.js)
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
            var src = this.spine.package.resolveRelativeUrl(spineItem.href);

            //hide iframe until content is scaled
            this.$iframe.css("visibility", "hidden");
            this.iframeLoader.loadIframe(this.$iframe[0], src, this.onIFrameLoad, this);
        }
        else
        {
            this.trigger(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED, this.$iframe, this.currentSpineItem, false);
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

    },

    getElement: function(spineItem, selector) {

        if(spineItem != this.currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        var navigation = this.navigationLogic;
        if (!navigation)
        {
            navigation = new ReadiumSDK.Views.CfiNavigationLogic(this.$el, this.$iframe);
        }
        return navigation.getElement(selector);
    },

    getVisibleMediaOverlayElements: function() {
        var navigation = new ReadiumSDK.Views.CfiNavigationLogic(this.$el, this.$iframe);
        return navigation.getVisibleMediaOverlayElements({top:0, bottom: this.$iframe.height()});
    }

});

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
    bookMargins: undefined,
    contentMetaSize: undefined,
    userStyles: undefined,
    bookStyles: undefined,
    iframeLoader: undefined,

    $viewport: undefined,

    pageViews: [],

    initialize: function() {

        this.iframeLoader = this.options.iframeLoader;
        this.$viewport = this.options.$viewport;
        this.userStyles = this.options.userStyles;
        this.bookStyles = this.options.bookStyles;

        this.spine = this.options.spine;
        this.spread = new ReadiumSDK.Models.Spread(this.spine, ReadiumSDK.Helpers.getOrientation(this.$viewport));

        this.leftPageView = this.createOnePageView("fixed-page-frame-left", "right");
        this.rightPageView = this.createOnePageView("fixed-page-frame-right", "left");
        this.centerPageView = this.createOnePageView("fixed-page-frame-center", "center");

        this.pageViews.push(this.leftPageView);
        this.pageViews.push(this.rightPageView);
        this.pageViews.push(this.centerPageView);

        //event with namespace for clean unbinding
        $(window).on("resize.ReadiumSDK.readerView", _.bind(this.onViewportResize, this));
    },

    createOnePageView: function(cssclass, contentAlignment) {

        return new ReadiumSDK.Views.OnePageView({

                iframeLoader: this.iframeLoader,
                spine: this.spine,
                bookStyles: this.bookStyles,
                class: cssclass,
                contentAlignment: contentAlignment
            });
    },

    isReflowable: function() {
        return false;
    },

    render: function(){

        this.template = ReadiumSDK.Helpers.loadTemplate("fixed_book_frame", {});

        this.setElement(this.template);

        this.$viewport.append(this.$el);

        this.applyStyles();

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

    redraw: function(initiator, paginationRequest) {

        var self = this;

        var context = {isElementAdded : false};
        var pageLoadDeferrals = this.createPageLoadDeferrals([{pageView: this.leftPageView, spineItem: this.spread.leftItem, context: context},
                                                              {pageView: this.rightPageView, spineItem: this.spread.rightItem, context: context},
                                                              {pageView: this.centerPageView, spineItem: this.spread.centerItem, context: context}]);
        if(pageLoadDeferrals.length > 0) {

            $.when.apply($, pageLoadDeferrals).done(function(){
                if(context.isElementAdded) {
                    self.applyStyles();
                }

                if (paginationRequest)
                {
                    self.onPagesLoaded(initiator, paginationRequest.spineItem, paginationRequest.elementId)
                }
                else
                {
                    self.onPagesLoaded(initiator);
                }
            });
        }
    },

    applyStyles: function() {

        ReadiumSDK.Helpers.setStyles(this.userStyles.getStyles(), this.$el.parent());

        this.updateBookMargins();
        this.updateContentMetaSize();
        this.resizeBook();
    },

    applyBookStyles: function() {

        var views = this.getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {
            views[i].applyBookStyles();
        }
    },

    createPageLoadDeferrals: function(viewItemPairs) {

        var pageLoadDeferrals = [];

        for(var i = 0; i < viewItemPairs.length; i++) {

            var dfd = this.updatePageViewForItem(viewItemPairs[i].pageView, viewItemPairs[i].spineItem, viewItemPairs[i].context);
            if(dfd) {
                pageLoadDeferrals.push(dfd);
            }

        }

        return pageLoadDeferrals;

    },

    onPagesLoaded: function(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        this.updateContentMetaSize();
        this.resizeBook();

        this.trigger(ReadiumSDK.Events.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: this.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
    },

    onViewportResize: function() {

        //because change of the viewport orientation can alter pagination behaviour we have to check if
        //visible content stays same
        var newOrientation = ReadiumSDK.Helpers.getOrientation(this.$viewport);
        if(!newOrientation) {
            return;
        }

        var spreadChanged = false;
        var itemToDisplay = undefined;
        if(this.spread.orientation != newOrientation) {

            var newPageSpread = new ReadiumSDK.Models.Spread(this.spine, newOrientation);

            spreadChanged = (  this.spread.leftItem != newPageSpread.leftItem
                            || this.spread.rightItem != newPageSpread.rightItem
                            || this.spread.centerItem != newPageSpread.centerItem );

            this.spread.orientation = newOrientation;
        }

        if(spreadChanged) {
            itemToDisplay = this.spread.validItems()[0];
            if(itemToDisplay) {
                var paginationRequest = new ReadiumSDK.Models.PageOpenRequest(itemToDisplay, this);
                this.openPage(paginationRequest);
            }
        }
        else {
            this.resizeBook();
        }

    },

    isContentRendered: function() {

        if(!this.contentMetaSize || !this.bookMargins) {
            return false;
        }

        var viewportWidth = this.$viewport.width();
        var viewportHeight = this.$viewport.height();

        return viewportWidth && viewportHeight;
    },

    resizeBook: function() {

        if(!this.isContentRendered()) {
            return;
        }

        var viewportWidth = this.$viewport.width();
        var viewportHeight = this.$viewport.height();

        var leftPageMargins = this.leftPageView.isDisplaying() ? ReadiumSDK.Helpers.Margins.fromElement(this.leftPageView.$el) : ReadiumSDK.Helpers.Margins.empty();
        var rightPageMargins = this.rightPageView.isDisplaying() ? ReadiumSDK.Helpers.Margins.fromElement(this.rightPageView.$el) : ReadiumSDK.Helpers.Margins.empty();
        var centerPageMargins = this.centerPageView.isDisplaying() ? ReadiumSDK.Helpers.Margins.fromElement(this.centerPageView.$el) : ReadiumSDK.Helpers.Margins.empty();

        var pageMargins = this.getMaxPageMargins(leftPageMargins, rightPageMargins, centerPageMargins);

        var potentialTargetElementSize = {   width: viewportWidth - this.bookMargins.width(),
                                             height: viewportHeight - this.bookMargins.height()};

        var potentialContentSize = {    width: potentialTargetElementSize.width - pageMargins.width(),
                                        height: potentialTargetElementSize.height - pageMargins.height() };

        if(potentialTargetElementSize.width <= 0 || potentialTargetElementSize.height <= 0) {
            return;
        }

        var horScale = potentialContentSize.width / this.contentMetaSize.width;
        var verScale = potentialContentSize.height / this.contentMetaSize.height;

        var scale = Math.min(horScale, verScale);

        var contentSize = { width: this.contentMetaSize.width * scale,
                            height: this.contentMetaSize.height * scale };

        var targetElementSize = {   width: contentSize.width + pageMargins.width(),
                                    height: contentSize.height + pageMargins.height() };

        var bookSize = {    width: targetElementSize.width + this.bookMargins.width(),
                            height: targetElementSize.height + this.bookMargins.height() };


        var bookLeft = Math.floor((viewportWidth - bookSize.width) / 2);
        var bookTop = Math.floor((viewportHeight - bookSize.height) / 2);

        if(bookLeft < 0) bookLeft = 0;
        if(bookTop < 0) bookTop = 0;

        this.$el.css("left", bookLeft + "px");
        this.$el.css("top", bookTop + "px");
        this.$el.css("width", targetElementSize.width + "px");
        this.$el.css("height", targetElementSize.height + "px");

        var left = this.bookMargins.padding.left;
        var top = this.bookMargins.padding.top;

        if(this.leftPageView.isDisplaying()) {

             this.leftPageView.transformContent(scale, left, top);
        }

        if(this.rightPageView.isDisplaying()) {

            left += this.contentMetaSize.separatorPosition * scale;

            if(this.leftPageView.isDisplaying()) {
                left += leftPageMargins.left;
            }

            this.rightPageView.transformContent(scale, left, top);
        }

        if(this.centerPageView.isDisplaying()) {

            this.centerPageView.transformContent(scale, left, top);
        }
    },

    getMaxPageMargins: function (leftPageMargins, rightPageMargins, centerPageMargins) {

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

    },

    updateContentMetaSize: function() {

        this.contentMetaSize = {};

        if(this.centerPageView.isDisplaying()) {
            this.contentMetaSize.width = this.centerPageView.meta_size.width;
            this.contentMetaSize.height = this.centerPageView.meta_size.height;
            this.contentMetaSize.separatorPosition = 0;
        }
        else if(this.leftPageView.isDisplaying() && this.rightPageView.isDisplaying()) {
            if(this.leftPageView.meta_size.height == this.rightPageView.meta_size) {
                this.contentMetaSize.width = this.leftPageView.meta_size.width + this.rightPageView.meta_size.width;
                this.contentMetaSize.height = this.leftPageView.meta_size.height;
                this.contentMetaSize.separatorPosition = this.leftPageView.meta_size.width;
            }
            else {
                //normalize by height
                this.contentMetaSize.width = this.leftPageView.meta_size.width + this.rightPageView.meta_size.width * (this.leftPageView.meta_size.height / this.rightPageView.meta_size.height);
                this.contentMetaSize.height = this.leftPageView.meta_size.height;
                this.contentMetaSize.separatorPosition = this.leftPageView.meta_size.width;
            }
        }
        else if(this.leftPageView.isDisplaying()) {
            this.contentMetaSize.width = this.leftPageView.meta_size.width * 2;
            this.contentMetaSize.height = this.leftPageView.meta_size.height;
            this.contentMetaSize.separatorPosition = this.leftPageView.meta_size.width;
        }
        else if(this.rightPageView.isDisplaying()) {
            this.contentMetaSize.width = this.rightPageView.meta_size.width * 2;
            this.contentMetaSize.height = this.rightPageView.meta_size.height;
            this.contentMetaSize.separatorPosition = this.rightPageView.meta_size.width;
        }
        else {
            this.contentMetaSize = undefined;
        }

    },

    updateBookMargins: function() {
        this.bookMargins = ReadiumSDK.Helpers.Margins.fromElement(this.$el);
    },

    openPage: function(paginationRequest) {

        if(!paginationRequest.spineItem) {
            return;
        }

        this.spread.openItem(paginationRequest.spineItem);
        this.redraw(paginationRequest.initiator, paginationRequest);
    },


    openPagePrev: function(initiator) {

        this.spread.openPrev();
        this.redraw(initiator);
    },

    openPageNext: function(initiator) {

        this.spread.openNext();
        this.redraw(initiator);
    },

    updatePageViewForItem: function (pageView, item, context) {

        if(!item) {
            if(pageView.isDisplaying()) {
                pageView.remove();
            }

            return undefined;
        }

        if(!pageView.isDisplaying()) {
            this.$el.append(pageView.render().$el);
            context.isElementAdded = true;
        }

        var dfd = $.Deferred();
        var self = this;

        pageView.on(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED, function($iframe, spineItem, isNewContentDocumentLoaded){

            pageView.off(ReadiumSDK.Views.OnePageView.SPINE_ITEM_OPENED);

            if(isNewContentDocumentLoaded) {
                self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);
            }

            dfd.resolve();
        });

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

        var views = this.getDisplayingViews();

        if(views.length > 0) {

            var idref = views[0].currentSpineItem.idref;
            var cfi = views[0].getFirstVisibleElementCfi();

            if(cfi == undefined) {
                cfi = "";
            }

            return new ReadiumSDK.Models.BookmarkData(idref, cfi);
        }

        return new ReadiumSDK.Models.BookmarkData("", "");
    },

    getDisplayingViews: function() {

        var viewsToCheck = [];

        if( this.spine.isLeftToRight() ) {
            viewsToCheck = [this.leftPageView, this.centerPageView, this.rightPageView];
        }
        else {
            viewsToCheck = [this.rightPageView, this.centerPageView, this.leftPageView];
        }

        var views = [];

        for(var i = 0, count = viewsToCheck.length; i < count; i++) {
            if(viewsToCheck[i].isDisplaying()) {
                views.push(viewsToCheck[i]);
            }
        }

        return views;
    },

    getLoadedSpineItems: function() {

        return this.spread.validItems();
    },

    getElement: function(spineItem, selector) {

        var views = this.getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {

            var view = views[i];
            if(view.currentSpineItem == spineItem) {
                return view.getElement(spineItem, selector);
            }
        }

        console.error("spine item is not loaded");
        return undefined;
    },

    getVisibleMediaOverlayElements: function() {

        var elements = [];

        var views = this.getDisplayingViews();

        for(var i = 0, count = views.length; i < count; i++) {
            elements.push.apply(elements, views[i].getVisibleMediaOverlayElements());
        }

        return elements;
    },

    insureElementVisibility: function(element, initiator) {

        //for now we assume that for fixed layout element is always visible

    }

});
define("fixedView", ["readiumSDK","onePageView","currentPagesInfo","fixedPageSpread","bookmarkData"], (function (global) {
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

ReadiumSDK.Views.ReflowableView = Backbone.View.extend({

    currentSpineItem: undefined,
    isWaitingFrameRender: false,
    deferredPageRequest: undefined,
    spine: undefined,
    fontSize:100,
    $viewport: undefined,
    $contentFrame: undefined,
    userStyles: undefined,
    bookStyles: undefined,
    navigationLogic: undefined,
    iframeLoader: undefined,

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

        this.$viewport = this.options.$viewport;
        this.spine = this.options.spine;
        this.userStyles = this.options.userStyles;
        this.bookStyles = this.options.bookStyles;
        this.iframeLoader = this.options.iframeLoader;
    },

    render: function(){

        this.template = ReadiumSDK.Helpers.loadTemplate("reflowable_book_frame", {});

        this.setElement(this.template);
        this.$viewport.append(this.$el);

        this.$contentFrame = $("#reflowable-content-frame", this.$el);

        this.$iframe = $("#epubContentIframe", this.$el);

        this.$iframe.css("left", "");
        this.$iframe.css("right", "");
        this.$iframe.css(this.spine.isLeftToRight() ? "left" : "right", "0px");

        this.navigationLogic = new ReadiumSDK.Views.CfiNavigationLogic(this.$contentFrame, this.$iframe);

        //We will call onViewportResize after user stopped resizing window
        var lazyResize = _.debounce(this.onViewportResize, 100);
        $(window).on("resize.ReadiumSDK.reflowableView", _.bind(lazyResize, this));

        return this;
    },

    setFrameSizesToRectangle: function(rectangle) {
        this.$contentFrame.css("left", rectangle.left);
        this.$contentFrame.css("top", rectangle.top);
        this.$contentFrame.css("right", rectangle.right);
        this.$contentFrame.css("bottom", rectangle.bottom);

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
            //depends on aspect ratio of viewport and rendition:spread-* setting we may have to switch spread on/off
            this.paginationInfo.visibleColumnCount = this.calculateVisibleColumnCount();
            this.updatePagination();
        }

    },

    setViewSettings: function(settings) {

        this.isSyntheticSpread = settings.isSyntheticSpread;
        this.paginationInfo.visibleColumnCount = this.calculateVisibleColumnCount();
        this.paginationInfo.columnGap = settings.columnGap;
        this.fontSize = settings.fontSize;
        this.updateHtmlFontSizeAndColumnGap();

        this.updatePagination();
    },

    calculateVisibleColumnCount: function() {

        var columnCount = this.isSyntheticSpread ? 2 : 1;

        if(!this.currentSpineItem) {
            return columnCount;
        }

        var orientation = ReadiumSDK.Helpers.getOrientation(this.$viewport);
        if(!orientation) {
            return columnCount;
        }

        return ReadiumSDK.Helpers.isRenditionSpreadPermittedForItem(this.currentSpineItem, orientation)
                ? 2 : 1;
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

            var src = this.spine.package.resolveRelativeUrl(spineItem.href);
            this.iframeLoader.loadIframe(this.$iframe[0], src, this.onIFrameLoad, this);
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

        this.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, this.$iframe, this.currentSpineItem);

        var epubContentDocument = this.$iframe[0].contentDocument;
        this.$epubHtml = $("html", epubContentDocument);

        this.$epubHtml.css("height", "100%");
        this.$epubHtml.css("position", "fixed");
        this.$epubHtml.css("-webkit-column-axis", "horizontal");

        this.applyBookStyles();

        this.updateHtmlFontSizeAndColumnGap();


/////////
//Columns Debugging
//                    $epubHtml.css("-webkit-column-rule-color", "red");
//                    $epubHtml.css("-webkit-column-rule-style", "dashed");
//                    $epubHtml.css("background-color", '#b0c4de');
/////////

        this.applyStyles();

        this.applySwitches(epubContentDocument);
        this.registerTriggers(epubContentDocument);

    },

    applyStyles: function() {

        ReadiumSDK.Helpers.setStyles(this.userStyles.getStyles(), this.$el.parent());

        //because left, top, bottom, right setting ignores padding of parent container
        //we have to take it to account manually
        var elementMargins = ReadiumSDK.Helpers.Margins.fromElement(this.$el);
        this.setFrameSizesToRectangle(elementMargins.padding);

        this.updateViewportSize();
        this.updatePagination();

    },

    applyBookStyles: function() {

        if(this.$epubHtml) {
            ReadiumSDK.Helpers.setStyles(this.bookStyles.getStyles(), this.$epubHtml);
        }
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


        if(pageRequest.spineItemPageIndex !== undefined) {
            pageIndex = pageRequest.spineItemPageIndex;
        }
        else if(pageRequest.elementId) {
            pageIndex = this.navigationLogic.getPageForElementId(pageRequest.elementId);
        }
        else if(pageRequest.elementCfi) {
            pageIndex = this.navigationLogic.getPageForElementCfi(pageRequest.elementCfi);
        }
        else if(pageRequest.firstPage) {
            pageIndex = 0;
        }
        else if(pageRequest.lastPage) {
            pageIndex = this.paginationInfo.columnCount - 1;
        }
        else {
            console.debug("No criteria in pageRequest");
            pageIndex = 0;
        }

        if(pageIndex >= 0 && pageIndex < this.paginationInfo.columnCount) {

            this.paginationInfo.currentSpreadIndex = Math.floor(pageIndex / this.paginationInfo.visibleColumnCount) ;
            this.onPaginationChanged(pageRequest.initiator, pageRequest.spineItem, pageRequest.elementId);
        }
    },

    redraw: function() {

        var offsetVal =  -this.paginationInfo.pageOffset + "px";

        this.$epubHtml.css("left", this.spine.isLeftToRight() ? offsetVal : "");
        this.$epubHtml.css("right", this.spine.isRightToLeft() ? offsetVal : "");
    },

    updateViewportSize: function() {

        var newWidth = this.$contentFrame.width();
        var newHeight = this.$contentFrame.height();

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

    onPaginationChanged: function(initiator, paginationRequest_spineItem, paginationRequest_elementId) {

        this.paginationInfo.pageOffset = (this.paginationInfo.columnWidth + this.paginationInfo.columnGap) * this.paginationInfo.visibleColumnCount * this.paginationInfo.currentSpreadIndex;
        this.redraw();
        this.trigger(ReadiumSDK.Events.CURRENT_VIEW_PAGINATION_CHANGED, { paginationInfo: this.getPaginationInfo(), initiator: initiator, spineItem: paginationRequest_spineItem, elementId: paginationRequest_elementId } );
    },

    openPagePrev:  function (initiator) {

        if(!this.currentSpineItem) {
            return;
        }

        if(this.paginationInfo.currentSpreadIndex > 0) {
            this.paginationInfo.currentSpreadIndex--;
            this.onPaginationChanged(initiator);
        }
        else {

            var prevSpineItem = this.spine.prevItem(this.currentSpineItem);
            if(prevSpineItem) {

                var pageRequest = new ReadiumSDK.Models.PageOpenRequest(prevSpineItem, initiator);
                pageRequest.setLastPage();
                this.openPage(pageRequest);
            }
        }
    },

    openPageNext: function (initiator) {

        if(!this.currentSpineItem) {
            return;
        }

        if(this.paginationInfo.currentSpreadIndex < this.paginationInfo.spreadCount - 1) {
            this.paginationInfo.currentSpreadIndex++;
            this.onPaginationChanged(initiator);
        }
        else {

            var nextSpineItem = this.spine.nextItem(this.currentSpineItem);
            if(nextSpineItem) {

                var pageRequest = new ReadiumSDK.Models.PageOpenRequest(nextSpineItem, initiator);
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

            if(self.deferredPageRequest) {

                //if there is a request for specific page we get here
                self.openDeferredElement();
            }
            else {

                //we get here on resizing the viewport

                //We do this to force re-rendering of the document in the iframe.
                //There is a bug in WebView control with right to left columns layout - after resizing the window html document
                //is shifted in side the containing div. Hiding and showing the html element puts document in place.
                self.$epubHtml.hide();
                setTimeout(function() {
                    self.$epubHtml.show();
                    self.onPaginationChanged(self);
                }, 50);

            }

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

    getFirstVisibleElementCfi: function() {

        var contentOffsets = this.getVisibleContentOffsets();
        return this.navigationLogic.getFirstVisibleElementCfi(contentOffsets.top);
    },

    getPaginationInfo: function() {

        var isFixedLayout = this.currentSpineItem ? this.currentSpineItem.isFixedLayout() : this.spine.package.isFixedLayout();
        var paginationInfo = new ReadiumSDK.Models.CurrentPagesInfo(this.spine.items.length, isFixedLayout, this.spine.direction);

        if(!this.currentSpineItem) {
            return paginationInfo;
        }

        var pageIndexes = this.getOpenPageIndexes();

        for(var i = 0, count = pageIndexes.length; i < count; i++) {

            paginationInfo.addOpenPage(pageIndexes[i], this.paginationInfo.columnCount, this.currentSpineItem.idref, this.currentSpineItem.index);
        }

        return paginationInfo;

    },

    isPageIndexOpen: function(index) {

        var pageIndexes = this.getOpenPageIndexes();

        return pageIndexes.indexOf(index) != -1
    },

    getOpenPageIndexes: function() {

        var indexes = [];

        var currentPage = this.paginationInfo.currentSpreadIndex * this.paginationInfo.visibleColumnCount;

        for(var i = 0; i < this.paginationInfo.visibleColumnCount && (currentPage + i) < this.paginationInfo.columnCount; i++) {

            indexes.push(currentPage + i);
        }

        return indexes;

    },

    bookmarkCurrentPage: function() {

        if(!this.currentSpineItem) {

            return new ReadiumSDK.Models.BookmarkData("", "");
        }

        return new ReadiumSDK.Models.BookmarkData(this.currentSpineItem.idref, this.getFirstVisibleElementCfi());
    },

    getVisibleContentOffsets: function() {
        var columnsLeftOfViewport = Math.round(this.paginationInfo.pageOffset / (this.paginationInfo.columnWidth + this.paginationInfo.columnGap));

        var topOffset =  columnsLeftOfViewport * this.$contentFrame.height();
        var bottomOffset = topOffset + this.paginationInfo.visibleColumnCount * this.$contentFrame.height();

        return {top: topOffset, bottom: bottomOffset};
    },

    getLoadedSpineItems: function() {
        return [this.currentSpineItem];
    },

    getElement: function(spineItem, selector) {

        if(spineItem != this.currentSpineItem) {
            console.error("spine item is not loaded");
            return undefined;
        }

        return this.navigationLogic.getElement(selector);
    },

    getVisibleMediaOverlayElements: function() {

        var visibleContentOffsets = this.getVisibleContentOffsets();
        return this.navigationLogic.getVisibleMediaOverlayElements(visibleContentOffsets);
    },

    insureElementVisibility: function(element, initiator) {

        var $element = $(element);
        if(this.navigationLogic.isElementVisible($element, this.getVisibleContentOffsets())) {
            return;
        }

        var page = this.navigationLogic.getPageForElement($element);

        if(page == -1) {
            return;
        }

        var openPageRequest = new ReadiumSDK.Models.PageOpenRequest(this.currentSpineItem, initiator);
        openPageRequest.setPageIndex(page);

        this.openPage(openPageRequest);
    }

});

define("reflowableView", ["readiumSDK","cfiNavigationLogic","bookmarkData"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.reflowableView;
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

                    console.debug("MO CLICK: " + elem.id);

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

                    if (data && data.par)
                    {
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

                        var par = data.par;

                        if (el && el != elem && el.nodeName.toLowerCase() === "body" && par && !par.getSmil().id)
                        {
                            console.debug("MO CLICKED BLANK BODY");
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

//console.debug("[[MO ATTACH]] " + spineItem.idref + " /// " + spineItem.media_overlay_id + " === " + smil.id);

        var iter = new ReadiumSDK.Models.SmilIterator(smil);

        while (iter.currentPar) {
            iter.currentPar.element = undefined;

            if (true) { //iter.currentPar.text.srcFragmentId (includes empty frag ID)

                var textRelativeRef = ReadiumSDK.Helpers.ResolveContentRef(iter.currentPar.text.srcFile, iter.smil.href);

                var same = textRelativeRef === spineItem.href;
                if (same) {
                    var selector = iter.currentPar.text.srcFragmentId.length == 0 ? "body" : "#" + iter.currentPar.text.srcFragmentId;
                    var $element = $(selector, contentDocElement);

                    if ($element.length > 0) {

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
define("mediaOvelayDataInjector", ["readiumSDK","mediaOverlay","mediaOverlayPlayer","smilModel","spineItem"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.mediaOvelayDataInjector;
    };
}(this)));



ReadiumSDK.Views.InternalLinksSupport = function(reader) {

    this.processLinkElements = function($iframe, spineItem) {

        var epubContentDocument = $iframe[0].contentDocument;

        var self = this;

        $('a', epubContentDocument).click(function (clickEvent) {
            // Check for both href and xlink:href attribute and get value
            var href;
            if (clickEvent.currentTarget.attributes["xlink:href"]) {
                href = clickEvent.currentTarget.attributes["xlink:href"].value;
            }
            else {
                href = clickEvent.currentTarget.attributes["href"].value;
            }
            var hrefUri = new URI(href);
            var hrefIsRelative = hrefUri.is('relative');
            var hrefUriHasFilename = hrefUri.filename();
            var overrideClickEvent = false;

            if (hrefIsRelative) {
                // TODO:
                if (hrefUriHasFilename /* TODO: && check whether href actually resolves to a spine item */) {

                    var currentSpineItemUri = new URI(spineItem.href);
                    var openedSpineItemUri = hrefUri.absoluteTo(currentSpineItemUri);
                    var newSpineItemHref = openedSpineItemUri.pathname();
                    var hashFrag = openedSpineItemUri.fragment();
                    var newSpineItem = reader.spine().getItemByHref(newSpineItemHref);

                    if(newSpineItem) {
                        reader.openSpineItemElementId(newSpineItem.idref, hashFrag, self);
                    }
                    else {
                        console.error("spine item with href=" + newSpineItemHref + " not found");
                    }

                    overrideClickEvent = true;
                } // otherwise it's probably just a hash frag that needs to be handled by browser's default handling
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

    this.loadIframe = function(iframe, src, callback, context) {

        var isWaitingForFrameLoad = true;

        iframe.onload = function() {

            //console.debug("epubReadingSystem (TOP):");
            //console.debug(navigator.epubReadingSystem);

            // Forward the epubReadingSystem object to the IFRAME
            try
            {
                iframe.contentWindow.navigator["epubReadingSystem"] = navigator.epubReadingSystem;
            }
            catch(ex)
            {
                console.log("epubReadingSystem INJECTION ERROR! " + ex.message);
            }

            //console.debug("epubReadingSystem (IFRAME):");
            //console.debug(iframe.contentWindow.navigator.epubReadingSystem);

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
};

define("iframeLoader", ["readiumSDK"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.iframeLoader;
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
    var _$el = $(options.el);
    
 

    if(options.iframeLoader) {
        _iframeLoader = options.iframeLoader;
    }
    else {
        _iframeLoader = new ReadiumSDK.Views.IFrameLoader();
    }


    function renderCurrentView(isReflowable) {

        if(_currentView){

            //current view is already rendered
            if( _currentView.isReflowable() === isReflowable) {
                return;
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

        if(isReflowable) {

            _currentView = new ReadiumSDK.Views.ReflowableView(viewCreationParams);
        }
        else {

            _currentView = new ReadiumSDK.Views.FixedView(viewCreationParams);
        }

        _currentView.setViewSettings(_viewerSettings);


        _currentView.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function($iframe, spineItem) {

            _mediaOverlayDataInjector.attachMediaOverlayData($iframe, spineItem, _viewerSettings);
            _internalLinksSupport.processLinkElements($iframe, spineItem);

            self.trigger(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, $iframe, spineItem);

        });

        _currentView.on(ReadiumSDK.Events.CURRENT_VIEW_PAGINATION_CHANGED, function( pageChangeData ){

            //we call on onPageChanged explicitly instead of subscribing to the ReadiumSDK.Events.PAGINATION_CHANGED by
            //mediaOverlayPlayer because we hve to guarantee that mediaOverlayPlayer will be updated before the host
            //application will be notified by the same ReadiumSDK.Events.PAGINATION_CHANGED event
            _mediaOverlayPlayer.onPageChanged(pageChangeData);

            self.trigger(ReadiumSDK.Events.PAGINATION_CHANGED, pageChangeData);
        });

        _currentView.render();
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

        _currentView.off(ReadiumSDK.Events.CURRENT_VIEW_PAGINATION_CHANGED);
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
     * @param openBookData object with open book data in format:
     * {
     *     package: packageData, (required)
     *     openPageRequest: openPageRequestData, (optional) data related to open page request
     *     settings: readerSettings, (optional)
     *     styles: cssStyles (optional)
     * }
     *
     */
    this.openBook = function(openBookData) {

		var pack = openBookData.package ? openBookData.package : openBookData;

        _package = new ReadiumSDK.Models.Package({packageData: pack});

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

            _currentView.setViewSettings(_viewerSettings);

            if(bookMark) {
                self.openSpineItemElementCfi(bookMark.idref, bookMark.elementCfi, self);
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
        if(_package.isFixedLayout()) {
            var spineItem = _spine.items[pageIndex];
            if(!spineItem) {
                return;
            }

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(spineItem, initiator);
            pageRequest.setPageIndex(0);
        }
        else {

            pageRequest = new ReadiumSDK.Models.PageOpenRequest(undefined, initiator);
            pageRequest.setPageIndex(pageIndex);

        }

        openPage(pageRequest);
    };

    function openPage(pageRequest) {

        renderCurrentView(pageRequest.spineItem.isReflowable());
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
    this.setStyles = function(styles) {

        var count = styles.length;

        for(var i = 0; i < count; i++) {
            _userStyles.addStyle(styles[i].selector, styles[i].declarations);
        }

        applyStyles();

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

    function applyStyles() {

        ReadiumSDK.Helpers.setStyles(_userStyles.getStyles(), _$el);

        if(_currentView) {
            _currentView.applyStyles();
        }

        _mediaOverlayPlayer.applyStyles();
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
     * @method resetStyles
     */
    this.clearStyles = function() {

        _userStyles.resetStyleValues();
        applyStyles();
        _userStyles.clear();
    };

    /**
     * Resets all the custom styles set by setBookStyle callers at runtime
     *
     * @method resetStyles
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


    this.getVisibleMediaOverlayElements = function() {

        if(_currentView) {
            return _currentView.getVisibleMediaOverlayElements();
        }

        return [];
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

};


define("readerView", ["backbone","readiumSDK","helpers","viewerSettings","styleCollection","package","mediaOverlayPlayer","pageOpenRequest","fixedView","reflowableView","mediaOvelayDataInjector","internalLinksSupport","iframeLoader"], (function (global) {
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

define('epub-fetch/plain_fetcher',['require', 'module', 'jquery', 'URIjs', './markup_parser'], function (require, module, $, URI, MarkupParser) {
    console.log('plain_fetcher module id: ' + module.id);

    var PlainExplodedFetcher = function(baseUrl){

        var _parser = new MarkupParser();
        var _jsonMetadata;

        var _packageUrl;

        this.initialize = function(callback) {

            var containerPath = new URI(baseUrl + '/META-INF/container.xml');

            getXmlFileDom(containerPath.path(), function (containerDom) {
                _packageUrl = baseUrl + "/" + getRootFile(containerDom);

                callback();

            }, function(error) {
                console.error("unable to find package document: " + error);
                _packageUrl = baseUrl;

                callback();
            });
        };

        this.resolveURI = function (epubResourceURI) {
            // Make absolute to the package document path
            var epubResourceRelURI = new URI(epubResourceURI);
            var epubResourceAbsURI = epubResourceRelURI.absoluteTo(_packageUrl);
            return epubResourceAbsURI.toString();
        };


        this.getPackageUrl = function() {
            return _packageUrl;
        };


        function getRootFile (containerDom) {
            var rootFile = $('rootfile', containerDom);
            var packageFullPath = rootFile.attr('full-path');
            console.log('packageFullPath: ' + packageFullPath);
            return packageFullPath;
        }

        function getXmlFileDom (filePath, callback, errorCallback) {

            fetchFileContentsText(filePath, function (xmlFileContents) {
                var fileDom = _parser.parseXml(xmlFileContents);
                callback(fileDom);
            }, errorCallback);
        }

        function fetchFileContentsText (fileUrl, fetchCallback, onerror) {

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
                    console.log('Error when AJAX fetching ' + fileUrl);
                    console.log(status);
                    console.log(errorThrown);
                    onerror(errorThrown);
                }
            });
        }

        this.relativeToPackageFetchFileContents = function (relativeToPackagePath, fetchMode, fetchCallback, onerror) {
            fetchFileContentsText(this.resolveURI(relativeToPackagePath), fetchCallback, onerror);
        };

        this.getEncryptionDom = function (callback, onerror) {
            // TODO: need a reliable method of finding META-INF/encryption.xml.
            // This is a challenge since we begin with a path directly to the package document and don't go through META-INF/container.xml.
            onerror(new Error('Getting encryption descriptor not yet implemented!'));
        }

        this.getPackageDom = function (callback, onerror) {
            console.log('getting package DOM');

            console.log('baseUrl: ' + _packageUrl);

            fetchFileContentsText(_packageUrl, function (packageXml) {

                var packageDom = _parser.parseXml(packageXml);
                callback(packageDom);

            }, onerror);
        };

        // Currently needed for deobfuscating fonts
        this.setPackageJson = function(jsonMetadata) {
            _jsonMetadata = jsonMetadata;
        };
    };

    return PlainExplodedFetcher;
});
define('epub-fetch/zip_fetcher',['require', 'module', 'jquery', 'URIjs', './markup_parser', './discover_content_type'], function (require, module, $, URI, MarkupParser, ContentTypeDiscovery) {
    console.log('zip_fetcher module id: ' + module.id);

    var ZipFetcher = function(baseUrl, libDir) {

        var self = this;
        var _checkCrc32 = false;
        var _zipFs;
        var _packageFullPath;
        var _packageJson;
        var _encryptionDom;
        var _encryptionHash;
        var _packageDom;
        var _packageDomInitializationSubscription;
        var _markupParser = new MarkupParser();

        var ENCRYPTION_METHODS = {
            'http://www.idpf.org/2008/embedding': embeddedFontDeobfuscateIdpf,
            'http://ns.adobe.com/pdf/enc#RC': embeddedFontDeobfuscateAdobe
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

        // Description: perform a function with an initialized zip filesystem, making sure that such filesystem is initialized.
        // Note that due to a race condition, more than one zip filesystem may be instantiated.
        // However, the last one to be set on the model object will prevail and others would be garbage collected later.
        function withZipFsPerform(callback, onerror) {

            if (_zipFs) {

                callback(_zipFs, onerror);

            } else {

                console.log('zip.workerScriptsPath = ' + libDir);
                zip.workerScriptsPath = libDir;
                _zipFs = new zip.fs.FS();
                _zipFs.importHttpContent(baseUrl, true, function () {

                    callback(_zipFs, onerror);

                }, onerror)
            }
        }

        this.getPackageUrl = function() {
            return baseUrl;
        };


        this.resolveURI = function (epubResourceURI) {
            return epubResourceURI;
        };

        function fetchFileContents (relativePath, readCallback, onerror) {

            if (typeof relativePath === 'undefined') {
                throw 'Fetched file relative path is undefined!';
            }

            withZipFsPerform(function (zipFs, onerror) {
                var entry = zipFs.find(relativePath);
                if (typeof entry === 'undefined' || entry === null) {
                    onerror(new Error('Entry ' + relativePath + ' not found in zip ' + baseUrl));
                } else {
                    if (entry.directory) {
                        onerror(new Error('Entry ' + relativePath + ' is a directory while a file has been expected'));
                    } else {
                        readCallback(entry);
                    }
                }
            }, onerror);
        }

        function fetchFileContentsText(relativePath, fetchCallback, onerror) {

            fetchFileContents(relativePath, function (entry) {
                entry.getText(fetchCallback, undefined, _checkCrc32);
            }, onerror)
        }

        function fetchFileContentsData64Uri(relativePath, fetchCallback, onerror) {
            fetchFileContents(relativePath, function (entry) {
                entry.getData64URI(ContentTypeDiscovery.identifyContentTypeFromFileName(relativePath), fetchCallback, undefined,  _checkCrc32);
            }, onerror)
        }

        function fetchFileContentsBlob(relativePath, fetchCallback, onerror) {
            var encryptionMethod = this.getEncryptionMethodForRelativePath(relativePath);
            if (encryptionMethod) {
                console.log('== decryption required for ' + relativePath);
                var decryptionFunction = ENCRYPTION_METHODS[encryptionMethod];
                var origFetchCallback = fetchCallback;
                if (decryptionFunction) {
                    fetchCallback = function (unencryptedBlob) {
                        decryptionFunction(unencryptedBlob, function (decryptedBlob) {
                            origFetchCallback(decryptedBlob);
                        });
                    };
                }
            }
            // TODO: implement deobfuscation based on _encryptionDom configuration
            fetchFileContents(relativePath, function (entry) {
                entry.getBlob(ContentTypeDiscovery.identifyContentTypeFromFileName(relativePath), fetchCallback,
                    undefined, _checkCrc32);
            }, onerror)
        }

        this.relativeToPackageFetchFileContents = function(relativeToPackagePath, fetchMode, fetchCallback, onerror) {

            if (! onerror) {
                onerror = _handleError;
            }

            var pathRelativeToZipRoot = decodeURIComponent(new URI(relativeToPackagePath).absoluteTo(_packageFullPath).toString());
            var fetchFunction = fetchFileContentsText;
            if (fetchMode === 'blob') {
                fetchFunction = fetchFileContentsBlob;
            } else if (fetchMode === 'data64uri') {
                fetchFunction = fetchFileContentsData64Uri;
            }
            fetchFunction.call(self, pathRelativeToZipRoot, fetchCallback, onerror);
        };

        function getFileContentsFromPackage(fileRelativePath, callback, onerror) {

            fetchFileContentsText(fileRelativePath, function (fileContents) {
                callback(fileContents);
            }, onerror);
        }

//        function getContainerXml(callback) {
//            var fileRelativePath = 'META-INF/container.xml';
//            getFileContentsFromPackage(fileRelativePath, callback);
//        }

        function getXmlFileDom (xmlFileRelativePath, callback, onerror) {

            getFileContentsFromPackage(xmlFileRelativePath, function (xmlFileContents) {
                var fileDom = _markupParser.parseXml(xmlFileContents);
                callback(fileDom);
            }, onerror);
        }

        function getPackageFullPath(callback, onerror) {

            getXmlFileDom('META-INF/container.xml', function (containerXmlDom) {
                getRootFile(containerXmlDom, callback);
            }, onerror);
        }

        function getRootFile (containerXmlDom, callback) {
            var rootFile = $('rootfile', containerXmlDom);
            var packageFullPath = rootFile.attr('full-path');
            console.log('packageFullPath: ' + packageFullPath);
            callback(packageFullPath);
        }

        function blob2BinArray(blob, callback) {
            var fileReader = new FileReader();
            fileReader.onload = function(){
                var arrayBuffer = this.result;
                callback(new Uint8Array(arrayBuffer));
            }
            fileReader.readAsArrayBuffer(blob);
        }

        // TODO: move to the epub module into a new "encryption" submodule?
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

        // TODO: move to the epub module into a new "encryption" submodule?
        function embeddedFontDeobfuscateIdpf(obfuscatedResourceBlob, callback) {
            var uid = _packageJson.metadata.id;
            var hashedUid = window.Crypto.SHA1(unescape(encodeURIComponent(uid.trim())), { asBytes: true });
            var prefixLength = 1040;
            // Shamelessly copied from
            // https://github.com/readium/readium-chrome-extension/blob/26d4b0cafd254cfa93bf7f6225887b83052642e0/scripts/models/path_resolver.js#L102 :
            //            if ((resourceBlob.indexOf("OTTO") == 0) || (resourceBlob.indexOf("wOFF") == 0)) {
            //                callback(resourceBlob);
            //            }
            //            else {
            xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, hashedUid, callback);
        }

        // TODO: move to the epub module into a new "encryption" submodule?
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

        // TODO: move to the epub module into a new "encryption" submodule?
        function embeddedFontDeobfuscateAdobe(obfuscatedResourceBlob, callback) {
            var uid = _packageJson.metadata.id;
            // TODO: extract the UUID and convert to big-endian binary form (16 bytes):
            var uidWordArray = urnUuidToByteArray(uid);
            var prefixLength = 1024;
            xorObfuscatedBlob(obfuscatedResourceBlob, prefixLength, uidWordArray, callback)
        }

        // TODO: move to the epub module as a new "encryption_config" submodule?
        this._initializeEncryptionHash = function () {
            this.getEncryptionDom(function (encryptionDom) {
                // TODO: build the hash
                if (!_encryptionHash) {
                    _encryptionHash = {};
                }

                var encryptedData = $('EncryptedData', encryptionDom);
                encryptedData.each(function (index, encryptedData) {
                    var encryptionAlgorithm = $('EncryptionMethod', encryptedData).first().attr('Algorithm');

                    // For some reason, jQuery selector "" against XML DOM sometimes doesn't match properly
                    var cipherReference = $('CipherReference', encryptedData);
                    cipherReference.each(function (index, CipherReference) {
                        var cipherReferenceURI = $(CipherReference).attr('URI');
                        console.log('Encryption/obfuscation algorithm ' + encryptionAlgorithm + ' specified for ' +
                            cipherReferenceURI);
                        _encryptionHash[cipherReferenceURI] = encryptionAlgorithm;
                    });
                });
                console.log('_encryptionHash:');
                console.log(_encryptionHash);
            }, function (error) {
                console.log('Found no META-INF/encrypion.xml:');
                console.log(error.message);
                console.log("Document doesn't make use of encryption.");
            });
        };

        // TODO: move to the epub module as a new "encryption_config" submodule?
        this.getEncryptionMethodForRelativePath = function(pathRelativeToRoot) {
            if (_encryptionHash){
                return _encryptionHash[pathRelativeToRoot];
            }   else {
                return undefined;
            }
        };

        this.getEncryptionDom = function (callback, onerror) {
            if (_encryptionDom) {
                callback(_encryptionDom);
            } else {
                getXmlFileDom('META-INF/encryption.xml', function (encryptionDom) {
                    _encryptionDom = encryptionDom;
                    callback(_encryptionDom);
                }, onerror);
            }
        };

        this.getPackageDom = function (callback, onerror) {
            if (_packageDom) {
                callback(_packageDom);
            } else {
                // TODO: use jQuery's Deferred
                // Register all callbacks interested in initialized packageDom, launch its instantiation only once
                // and broadcast to all callbacks registered during the initialization once it's done:
                if (_packageDomInitializationSubscription) {
                    _packageDomInitializationSubscription.push(callback);
                } else {
                    _packageDomInitializationSubscription = [callback];
                    getPackageFullPath(function (packageFullPath) {
                        _packageFullPath = packageFullPath;
                        console.log('Have set _packageFullPath' + packageFullPath);
                        getXmlFileDom(packageFullPath, function (packageDom) {
                            _packageDom = packageDom;
                            _packageDomInitializationSubscription.forEach(function (subscriberCallback) {
                                subscriberCallback(packageDom);
                            });
                            _packageDomInitializationSubscription = undefined;
                        })
                    }, onerror);
                }
            }
        }

        // Currently needed for deobfuscating fonts
        this.setPackageJson = function(packageJson) {
            _packageJson = packageJson;
            this._initializeEncryptionHash();
        };
    };

    return ZipFetcher;
});
define('epub-fetch/processed_items_registry',[],function () {

        var ProcessedItemsRegistry = function () {

            var self = this;
            var _itemsHash = {};

            this.isProcessed = function (itemString) {
                return itemString in _itemsHash;
            };

            this.markProcessed = function (itemString) {
                _itemsHash[itemString] = true;
            };
        };

        return ProcessedItemsRegistry;
    });

define('epub-fetch/resource_cache',[],function () {

        var ResourceCache = function () {

            var self = this;
            var _resourcesHash = {};

            this.getResourceURL = function (resourceAbsoluteHref) {
                return _resourcesHash[resourceAbsoluteHref];
            };

            this.putResourceURL = function (resourceAbsoluteHref, resourceObjectUrl) {
                _resourcesHash[resourceAbsoluteHref] = resourceObjectUrl;
            };
            // TODO: methods to evict resource, destroy cache and release object URLs using window.URL.revokeObjectURL(), automatic
            // cache size accounting and management algorithms like LRU.
        };

        return ResourceCache;
    });

define('epub-fetch/resource_fetcher',['require', 'module', 'jquery', 'URIjs', './markup_parser', './discover_content_type', './plain_fetcher',
    './zip_fetcher', './processed_items_registry', './resource_cache'],
    function (require, module, $, URI, MarkupParser, ContentTypeDiscovery, PlainExplodedFetcher, ZipFetcher,
              ProcessedItemsRegistry, ResourceCache) {
        console.log('resource_resolver module id: ' + module.id);


    var ResourceFetcher = function(rootUrl, libDir) {

        ResourceFetcher.contentTypePackageReadStrategyMap = {
            'application/oebps-package+xml': 'exploded',
            'application/epub+zip': 'zipped',
            'application/zip': 'zipped'
        };

        var _isExploded;
        var _dataFetcher;
        
        this.initialize =  function(callback) {

            _isExploded = isExploded();

            createDataFetcher(_isExploded, function(datafetcher){

                _dataFetcher = datafetcher;
                callback();

            });
        };

        

        

        // INTERNAL FUNCTIONS

        function isExploded() {

            var ext = ".epub";
            return rootUrl.indexOf(ext, this.length - ext.length) === -1;
        }

        function createDataFetcher(isExploded, callback) {

            if(isExploded) {
                console.log('using new PlainExplodedFetcher');
                var plainFetcher =  new PlainExplodedFetcher(rootUrl);
                plainFetcher.initialize(function(){

                    callback(plainFetcher);
                });
            }

            console.log('using new ZipFetcher');
            callback(new ZipFetcher(rootUrl, libDir));
        }

        function fetchResourceForElement(resolvedElem, refAttrOrigVal, refAttr, contentDocumentURI, fetchMode, resolutionDeferreds, onerror, resourceDataPreprocessing) {
            var uriRelativeToPackageDocument = (new URI(refAttrOrigVal)).absoluteTo(contentDocumentURI).toString();
            var resolutionDeferred = $.Deferred();
            resolutionDeferreds.push(resolutionDeferred);

            _dataFetcher.relativeToPackageFetchFileContents(uriRelativeToPackageDocument, fetchMode, function (resourceData) {

                // Generate a function to replace element's resource URL with URL of fetched data.
                // The function will either be called directly, immediately (if no preprocessing of resourceData is in effect)
                // or indirectly, later after resourceData preprocessing finishes:
                var replaceResourceURL = function (finalResourceData) {
                    // Creating an object URL requires a Blob object, so resource data fetched in text mode needs to be wrapped in a Blob:
                    if (fetchMode === 'text') {
                        var textResourceContentType = ContentTypeDiscovery.identifyContentTypeFromFileName(uriRelativeToPackageDocument);
                        var declaredType = $(resolvedElem).attr('type');
                        if (declaredType) {
                            textResourceContentType = declaredType;
                        }
                        finalResourceData = new Blob([finalResourceData], {type: textResourceContentType});
                    }
                    var resourceObjectURL = window.URL.createObjectURL(finalResourceData);
                    // TODO: take care of releasing object URLs when no longer needed
                    $(resolvedElem).attr(refAttr, resourceObjectURL);
                    // Store original refAttrVal in a special attribute to provide access to the original href:
                    $(resolvedElem).data('epubZipOrigHref', refAttrOrigVal);
                    resolutionDeferred.resolve();
                };

                if (resourceDataPreprocessing) {
                    var ownerDocument;
                    if (resolvedElem.ownerDocument) {
                        ownerDocument = resolvedElem.ownerDocument;
                    }
                    if (resolvedElem[0] && resolvedElem[0].ownerDocument) {
                        ownerDocument = resolvedElem[0].ownerDocument;
                    }
                    resourceDataPreprocessing(resourceData, uriRelativeToPackageDocument, ownerDocument,
                        replaceResourceURL);
                } else {
                    replaceResourceURL(resourceData);
                }
            }, onerror);
        }

        // FIXME: function has side effects on globalCssResourcesHash, localStyleSheetCssResourcesHash
        function fetchResourceForCssUrlMatch(cssUrlMatch, cssResourceDownloadDeferreds,
                                             styleSheetUriRelativeToPackageDocument, globalCssResourcesCache,
                                             stylesheetCssResourceUrlsMap) {
            var origMatchedUrlString = cssUrlMatch[0];
            var extractedUrl = cssUrlMatch[2];
            var resourceUriRelativeToPackageDocument = (new URI(extractedUrl)).absoluteTo(styleSheetUriRelativeToPackageDocument).toString();

            var cachedResource = globalCssResourcesCache.getResourceURL(resourceUriRelativeToPackageDocument);
            if (cachedResource) {
                stylesheetCssResourceUrlsMap[origMatchedUrlString] = cachedResource;
            } else {
                var cssUrlFetchDeferred = $.Deferred();
                cssResourceDownloadDeferreds.push(cssUrlFetchDeferred);

                _dataFetcher.relativeToPackageFetchFileContents(resourceUriRelativeToPackageDocument, 'blob',
                    function (resourceDataBlob) {
                        var resourceObjectURL = window.URL.createObjectURL(resourceDataBlob);
                        stylesheetCssResourceUrlsMap[origMatchedUrlString] = resourceObjectURL;
                        globalCssResourcesCache.putResourceURL(resourceUriRelativeToPackageDocument, resourceObjectURL);
                        cssUrlFetchDeferred.resolve();
                    },
                    function (error) {
                        if (error) {
                            if (error.message) {
                                console.error(error.message);
                            }
                            if (error.stack) {
                                console.error(error.stack);
                            }
                        }
                        cssUrlFetchDeferred.resolve();
                    }
                );
            }
        }

        function preprocessCssStyleSheetData(styleSheetResourceData, styleSheetUriRelativeToPackageDocument,
                                             contextDocument, callback) {
            var cssUrlRegexp = /[Uu][Rr][Ll]\(\s*(['"]?)([^']+)\1\s*\)/g;
            var documentCssResourcesCache = obtainCssResourcesCache(contextDocument);
            var stylesheetCssResourceUrlsMap = {};
            var cssResourceDownloadDeferreds = [];

            var cssUrlMatch = cssUrlRegexp.exec(styleSheetResourceData);
            // TODO: extract all "src:url()", fetch and replace with object URLs
            while (cssUrlMatch != null) {
                fetchResourceForCssUrlMatch(cssUrlMatch, cssResourceDownloadDeferreds,
                    styleSheetUriRelativeToPackageDocument, documentCssResourcesCache, stylesheetCssResourceUrlsMap);
                cssUrlMatch = cssUrlRegexp.exec(styleSheetResourceData);
            }

            if (cssResourceDownloadDeferreds.length > 0) {
                $.when.apply($, cssResourceDownloadDeferreds).done(function () {
                    for (var origMatchedUrlString in stylesheetCssResourceUrlsMap) {
                        var resourceObjectURL = stylesheetCssResourceUrlsMap[origMatchedUrlString];
                        styleSheetResourceData =
                            styleSheetResourceData.replace(origMatchedUrlString, "url('" + resourceObjectURL + "')",
                                'g');
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

        /**
         * Obtain the reference to the registry that holds hrefs of already imported stylesheets - needed for keeping track
         * of which stylesheets have been loaded already. The registry is attached to the content document body.
         *
         * @param {Object} contentDocumentDom The content document whose body element has/will have the hashmap attached to.
         * @return {Object} The registry with hrefs as keys and an isProcessed() method returning true for stylesheets that have been loaded.
         */
        function obtainImportedCssHrefsRegistry(contentDocumentDom) {
            // The hash of already loaded/imported stylesheet hrefs is being tracked globally on the content document level:
            var alreadyImportedStylesheetHrefsRegistry = $(contentDocumentDom.body).data('epubImportedCssHrefsReg');
            if (typeof alreadyImportedStylesheetHrefsRegistry === 'undefined') {
                // first use, initialize:
                alreadyImportedStylesheetHrefsRegistry = new ProcessedItemsRegistry();
                $(contentDocumentDom.body).data('epubImportedCssHrefsReg', alreadyImportedStylesheetHrefsRegistry);
            }
            return alreadyImportedStylesheetHrefsRegistry;
        }

        /**
         * Obtain the reference to the ResourceCache object that caches already fetched resources from CSS urls - used so that
         * the given resource referenced by URL from a CSS rule is fetched only once. The cache is attached to the content document body.
         * // TODO: use it on global EPUB book level to share caching of resources referenced multiple times within the book.
         *
         * @param {Object} contentDocumentDom The content document whose body element has/will have the cache attached to.
         * @return {Object} The cache with hrefs relative to the package document (.opf) as keys
         * and browser object URL as values for fetched resources.
         */
        function obtainCssResourcesCache(contentDocumentDom) {
            // The hash of already loaded/imported stylesheet hrefs is being tracked globally on the content document level:
            var cssResourcesCache = $(contentDocumentDom.body).data('epubCssResourcesCache');
            if (typeof cssResourcesCache === 'undefined') {
                // first use, initialize:
                cssResourcesCache = new ResourceCache;
                $(contentDocumentDom.body).data('epubCssResourcesCache', cssResourcesCache);
            }
            return cssResourcesCache;
        }

        /**
         * Get stored original href (if present) from a stylesheet that has possibly been programmatically fetched from zipped EPUB
         *
         * @param {Object} styleSheet The stylesheet DOM object that can possibly have its original href stored in the special data property
         * @return {String} Either null or the original stored href of the stylesheet as present in the document's source (before being
         * programmatically fetched from zipped EPUB, which substitutes href with a blob object URL)
         */
        function getOrigHrefFromStyleSheet(styleSheet) {
            return $(styleSheet.ownerNode).data('epubZipOrigHref');
        }

        function installStylesheetLoadHandlers(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror) {
            var styleSheetLinkElems = $("link[rel~='stylesheet']", contentDocumentDom);
            styleSheetLinkElems.load(function (stylesheetLoadEvent) {
                findRelativeUnfetchedCssImportRules(stylesheetLoadEvent, contentDocumentURI, resolutionDeferreds,
                    onerror)
            });
        }

        function findRelativeUnfetchedCssImportRules(styleSheetLoadEvent, contentDocumentURI, resolutionDeferreds, onerror) {
            var contentDocumentDom = styleSheetLoadEvent.currentTarget.ownerDocument;
            var alreadyImportedStylesheetHrefsRegistry = obtainImportedCssHrefsRegistry(contentDocumentDom);
            var allRelativeCssImportRulesHash = {};
            var styleSheet = styleSheetLoadEvent.currentTarget.sheet;
            // Any processed stylesheet element should be loaded by the resolution mechanism so we have to
            // prevent any duplicate attempts to load it if referenced in an @import rule. We add stylesheet's URLs
            // (both current and pre-resolution) to the already fetched hash so they don't get queued for fetching again:
            alreadyImportedStylesheetHrefsRegistry.markProcessed(styleSheet.href);
            var styleSheetOwnerNodeOrigHref = getOrigHrefFromStyleSheet(styleSheet);
            // TODO: test the behaviour on stylesheets with non-relative href (residing outside the zipped EPUB)
            if (styleSheetOwnerNodeOrigHref) {
                alreadyImportedStylesheetHrefsRegistry.markProcessed(styleSheetOwnerNodeOrigHref);
            }

            var cssRules = styleSheet.cssRules;
            var relativeCssImportRules = $.each(cssRules, function (cssRuleIdx, cssRule) {
                // Cannot compare by references, as CSSImportRule symbol in the global execution context
                // refers to a different prototype instance than the cssRule prototype
                // because of different origin (renderer's iframe.contentWindow vs global window?)
                if (cssRule.constructor.name === 'CSSImportRule') {
                    var ruleHrefUri = new URI(cssRule.href);
                    var isRuleHrefUriRelative = ruleHrefUri.scheme() === '';
                    if (isRuleHrefUriRelative) {
                        var isRuleAlreadyImported = alreadyImportedStylesheetHrefsRegistry.isProcessed(cssRule.href);
                        if (!isRuleAlreadyImported) {
                            // Queue this rule for import:
                            allRelativeCssImportRulesHash[cssRule.href] = cssRule;
                        }
                    }
                }
            });

            var allRelativeCssImportRules = [];
            var hashKeys = Object.keys(allRelativeCssImportRulesHash);
            hashKeys.forEach(function (key) {
                allRelativeCssImportRules.push(allRelativeCssImportRulesHash[key]);
            });

            fetchCssImportRules(allRelativeCssImportRules, contentDocumentURI, resolutionDeferreds, onerror);
        }

        function fetchCssImportRules(unfetchedCssImportRules, contentDocumentURI, resolutionDeferreds, onerror) {
            var alreadyImportedStylesheetHrefsRegistry;
            unfetchedCssImportRules.forEach(function (unfetchedCssImportRule) {
                var parentStyleSheet = unfetchedCssImportRule.parentStyleSheet;
                var contentDocumentDom = parentStyleSheet.ownerNode.ownerDocument;
                if (!alreadyImportedStylesheetHrefsRegistry) {
                    alreadyImportedStylesheetHrefsRegistry = obtainImportedCssHrefsRegistry(contentDocumentDom);
                }
                var ruleHref = unfetchedCssImportRule.href;
                var isRuleAlreadyImported = alreadyImportedStylesheetHrefsRegistry.isProcessed(ruleHref);
                if (!isRuleAlreadyImported) {
                    var baseStyleSheetHref = getOrigHrefFromStyleSheet(parentStyleSheet);
                    if (!baseStyleSheetHref) {
                        baseStyleSheetHref = parentStyleSheet.href;
                    }

                    var cssFetchHref = (new URI(ruleHref)).absoluteTo(baseStyleSheetHref).toString();
                    var appendedStyleSheetLink = $('<link />', contentDocumentDom);
                    appendedStyleSheetLink.attr({
                        type: "text/css",
                        rel: "stylesheet",
                        href: cssFetchHref
                    });
                    appendedStyleSheetLink.load(function (stylesheetLoadEvent) {
                        // TODO: test whether recursion works for nested @import rules with arbitrary indirection depth.
                        findRelativeUnfetchedCssImportRules(stylesheetLoadEvent, contentDocumentURI,
                            resolutionDeferreds, onerror);
                    });

                    fetchResourceForElement(appendedStyleSheetLink, appendedStyleSheetLink.attr('href'), 'href',
                        contentDocumentURI, 'text', resolutionDeferreds, onerror, preprocessCssStyleSheetData);

                    var contentDocumentHeadElement = $('head', contentDocumentDom);
                    contentDocumentHeadElement.append(appendedStyleSheetLink);
                }
            });
        }

        // PUBLIC API

        this.isPackageExploded = function (){
            return _isExploded;
        };

        this.getPackageUrl = function() {
            return _dataFetcher.getPackageUrl();
        };


        this.resolveInternalPackageResources = function(contentDocumentURI, contentDocumentType, contentDocumentText,
                                                         resolvedDocumentCallback, onerror) {

            var contentDocumentDom = _markupParser.parseMarkup(contentDocumentText, contentDocumentType);

            var resolutionDeferreds = [];

            resolveDocumentImages(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror);
            resolveDocumentLinkStylesheets(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror);
            installStylesheetLoadHandlers(contentDocumentDom, contentDocumentURI, resolutionDeferreds, onerror);

            $.when.apply($, resolutionDeferreds).done(function () {
                resolvedDocumentCallback(contentDocumentDom);
            });

        };

        this.relativeToPackageFetchFileContents = function (relativePath, fetchMode, fetchCallback, onerror) {
            _dataFetcher.relativeToPackageFetchFileContents(relativePath, fetchMode, fetchCallback, onerror)
        };

        this.getPackageDom = function (callback, onerror) {
            return _dataFetcher.getPackageDom(callback, onerror);
        };

        this.setPackageJson = function(jsonMetadata) {
            _dataFetcher.setPackageJson(jsonMetadata);
        };

    };

    return ResourceFetcher

});
define('epub-fetch', ['epub-fetch/resource_fetcher'], function (main) { return main; });

define('emub-model/package_document_parser',['require', 'module', 'jquery', 'underscore', 'backbone', 'epub-fetch/markup_parser', 'URIjs'], function (require, module, $, _, Backbone, MarkupParser, URI) {
    console.log('package_document_parser module id: ' + module.id);

    // `PackageDocumentParser` is used to parse the xml of an epub package
    // document and build a javascript object. The constructor accepts an
    // instance of `URI` that is used to resolve paths during the process
    var PackageDocumentParser = function(bookRoot, packageFetcher) {

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

                    _packageFetcher.setPackageJson(json);
                    // return the parse result
                    callback(json);
                });

            });
        };

        function updateMetadataWithIBookProperties(metadata) {

            var dff = $.Deferred();

            //if layout not set
            if(!metadata.layout)
            {
                var absoluteRoot = new URI(bookRoot + "/META-INF/com.apple.ibooks.display-options.xml").absoluteTo(document.URL);

                packageFetcher.relativeToPackageFetchFileContents(absoluteRoot, 'text', function (ibookPropText) {

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
                spine : {
                    direction : pageProgressionDirection(),
                    items : spinePackageData    
                }
            };
        };

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
                media_overlay : manifestItem.get('media_overlay'),
                idref : spineItem.get("idref"),
                page_spread : pageSpread,
                rendition_layout : fixedLayoutProperty
            };

            return spineInfo;
        }

        function getToc() {

            var item = getTocItem();
            if (item) {
                return item.get("contentDocumentURI");
            }
            return null;
        }

        function getTocText(callback) {

            var tocUrl = getToc();
            console.log('tocUrl: [' + tocUrl + ']');

            resourceFetcher.relativeToPackageFetchFileContents(tocUrl, 'text', function (tocDocumentText) {
                callback(tocDocumentText)
            }, function (err) {
                console.error('ERROR fetching TOC from [' + getToc() + ']:');
                console.error(err);
                callback(undefined);
            });
        }

        function getTocDom(callback) {

            getTocText(function (tocText) {
                if (typeof tocText === 'string') {
                    var tocDom = (new DOMParser()).parseFromString(tocText, "text/xml");
                    callback(tocDom);
                } else {
                    callback(undefined);
                }
            });
        }

        function generateTocListDOM(callback) {

            getTocDom(function (tocDom) {
                if (tocDom) {
                    if (tocIsNcx()) {
                        var $ncxOrderedList;
                        $ncxOrderedList = getNcxOrderedList($("navMap", tocDom));
                        callback($ncxOrderedList[0]);
                    } else {
                        var packageDocumentAbsoluteURL = new URI(packageDocumentURL).absoluteTo(document.URL);
                        var tocDocumentAbsoluteURL = new URI(getToc()).absoluteTo(packageDocumentAbsoluteURL);
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
        }

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

        this.generateTocListDOM = generateTocListDOM;
        this.getTocURL = getToc;
    };

    return PackageDocument;
});

define('epub-fetch/iframe_zip_loader',[], function(){

    var zipIframeLoader = function(ReadiumSDK, getCurrentResourceFetcher) {

        var basicIframeLoader = new ReadiumSDK.Views.IFrameLoader();

        this.loadIframe = function(iframe, src, callback, context) {

            if (getCurrentResourceFetcher().isPackageExploded()) {
                basicIframeLoader.loadIframe(iframe, src, callback, context);
            } else {
                var basicLoadCallback = function(success) {
                    var context = this;
                    var itemHref = context.currentSpineItem.href;
                    getCurrentResourceFetcher().relativeToPackageFetchFileContents(itemHref, 'text', function(contentDocumentText) {
                        var srcMediaType = context.currentSpineItem.media_type;

                        getCurrentResourceFetcher().resolveInternalPackageResources(itemHref, srcMediaType, contentDocumentText,
                            function (resolvedContentDocumentDom) {
                                var contentDocument = iframe.contentDocument;
                                contentDocument.replaceChild(resolvedContentDocumentDom.documentElement,
                                    contentDocument.documentElement);
                                callback.call(context, success);
                            });
                    }, function(err) {
                        if (err.message) {
                            console.error(err.message);
                        }

                        console.error(err);
                        callback.call(context, success);
                    });
                };
                // Feed an artificial empty HTML document to the IFRAME, then let the wrapper onload function
                // take care of actual document loading (from zipped EPUB) and calling callbacks:
                var emptyDocumentDataUri = window.URL.createObjectURL(
                    new Blob(['<html><body></body></html>'], {'type': 'text/html'})
                );

                basicIframeLoader.loadIframe(iframe, emptyDocumentDataUri, basicLoadCallback, context);
            }
        };
    };

    return zipIframeLoader;
});


define('Readium',['require', 'module', 'jquery', 'underscore', 'readerView', 'epub-fetch', 'emub-model/package_document_parser', 'emub-model/package_document', 'epub-fetch/iframe_zip_loader'],
    function (require, module, $, _, readerView, ResourceFetcher, PackageParser, PackageDocument, IframeZipLoader) {

    console.log('Readium module id: ' + module.id);

    var Readium = function(renderingViewport, jsLibRoot){

        var self = this;

        var _currentResourceFetcher;

        var _iframeZipLoader = new IframeZipLoader(ReadiumSDK, function() { return _currentResourceFetcher; });

        this.reader = new ReadiumSDK.Views.ReaderView( {el:renderingViewport, iframeLoader: _iframeZipLoader} );
        ReadiumSDK.trigger(ReadiumSDK.Events.READER_INITIALIZED);


        this.openPackageDocument = function(bookRoot, callback)  {

            _currentResourceFetcher = new ResourceFetcher(bookRoot, jsLibRoot);

            _currentResourceFetcher.initialize(function() {

                var _packageParser = new PackageParser(bookRoot, _currentResourceFetcher);

                _packageParser.parse(function(docJson){

                    var packageDocument = new PackageDocument(_currentResourceFetcher.getPackageUrl(), docJson, _currentResourceFetcher);
                    self.reader.openBook(packageDocument.getPackageData())

                    if (callback){
                        // gives caller access to document metadata like the table of contents
                        callback(packageDocument);
                    }

                });
            });
       }
    };


    return Readium;

});