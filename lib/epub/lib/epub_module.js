var EpubModule = function(packageDocumentObject, packageDocumentXML) {

    var Epub = {};

    // Rationale: The order of these matters
    Epub.ManifestItem = Backbone.Model.extend({

	isSvg : function () {
		
		return this.get("media_type") === "image/svg+xml";
	},

	isImage : function () {
		
		var media_type = this.get("media_type");
		if (media_type && media_type.indexOf("image/") > -1) {
			// we want to treat svg as a special case, so they
			// are not images
			return media_type !== "image/svg+xml";
		}
		return false;
	}	
});
    Epub.Manifest = Backbone.Collection.extend({

    model : Epub.ManifestItem
});
    Epub.Metadata = Backbone.Model.extend({});
    // Description: This is a delegate that provides information about the appropriate page-spread property for fixed layout spine items
Epub.PageSpreadProperty = Backbone.Model.extend({

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
    Epub.SpineItem = Epub.ManifestItem.extend({

    defaults : {
        "pageSpreadClass" : ""
    },

    initialize : function () {

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

    isFixedLayout : function () {

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
    firstPageOffset : function () {

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
            }
            else {

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
    Epub.Spine = Backbone.Collection.extend({

    model: Epub.SpineItem,
});
    // Description: This model provides an interface for navigating an EPUB's package document
Epub.PackageDocument = Backbone.Model.extend({

    initialize : function (attributes, options) {

        var packageDocument = this.get("packageDocumentObject");
        this.manifest = new Epub.Manifest(packageDocument.manifest);
        this.spine = new Epub.Spine(packageDocument.spine);
        this.metadata = new Epub.Metadata(packageDocument.metadata);
        this.bindings = new Epub.Spine(packageDocument.bindings);
        this.pageSpreadProperty = new Epub.PageSpreadProperty();

        // If this book is fixed layout, assign the page spread class
        if (this.isFixedLayout()) {
            this.assignPageSpreadClass();
        }
    },

    getSpineInfo : function () {

        var that = this;
        var spineInfo = [];
        this.spine.each(function (spineItem) {
            spineInfo.push(that.generateSpineInfo(spineItem));
        });

        return {
            spine : spineInfo, 
            bindings : this.bindings.toJSON()
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

    generateSpineInfo : function (spineItem) {

        var isFixedLayout = false;
        var fixedLayoutType = undefined;
        var manifestItem = this.getManifestModelByIdref(spineItem.get("idref"));
        var isLinear;
        var firstPageIsOffset;
        var pageSpread;

        // Get fixed layout properties
        if (spineItem.isFixedLayout() || this.isFixedLayout()) {
            isFixedLayout = true;
            
            if (manifestItem.isSvg()) {
                fixedLayoutType = "svg";
            }
            else if (manifestItem.isImage()) {
                fixedLayoutType = "image";
            }
            else {
                fixedLayoutType = "xhtml";
            }
        }

        // Set primary reading order attribute
        if (spineItem.get("linear").trim() === "no") {
            isLinear = false;
        }
        else {
            isLinear = true;
        }

        // Set first page is offset parameter
        pageSpread = spineItem.get("page_spread");
        if (!isFixedLayout) {
            if (this.pageProgressionDirection() === "ltr" && pageSpread === "right") {
                firstPageIsOffset = true;
            }
            else if (this.pageProgressionDirection() === "rtl" && pageSpread === "left") {
                firstPageIsOffset = true;
            }
            else {
                firstPageIsOffset = false;
            }
        }

        return {
            contentDocumentURI : this.getManifestItemByIdref(spineItem.get("idref")).contentDocumentURI,
            title : this.metadata.get("title"),
            firstPageIsOffset : firstPageIsOffset,
            pageProgressionDirection : this.pageProgressionDirection(),
            spineIndex : this.getSpineIndex(spineItem),
            pageSpread : pageSpread,
            isFixedLayout : isFixedLayout, 
            fixedLayoutType : fixedLayoutType,
            mediaType : manifestItem.get("media_type"),
            linear : isLinear
        };
    },

    getPackageDocumentDOM : function () {

        var parser = new window.DOMParser;
        var packageDocumentDom = parser.parseFromString(this.get("packageDocument"), "text/xml");
        return packageDocumentDom;
    },

    getToc : function () {

        var item = this.getTocItem();
        if (item) {
            var href = item.get("contentDocumentURI");
            return href;
        }
        return null;
    },

    // Description: This is a convenience method that will generate an html list structure from an ncx XML 
    //   document. 
    generateTocListDOM : function (ncxXML) {

        var that = this;
        var ncxDOM;
        var $ncxOrderedList;

        if (typeof ncxXML !== "string") {
            return undefined;
        }

        ncxDOM = (new DOMParser()).parseFromString(ncxXML,"text/xml");
        $ncxOrderedList = this.getNcxOrderedList($("navMap", ncxDOM));
        return $ncxOrderedList[0];
    },

    tocIsNcx : function () {

        var contentDocURI = this.getTocItem().get("contentDocumentURI");
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


    var packageDoc = new Epub.PackageDocument({
        packageDocumentObject : packageDocumentObject,
        packageDocument : packageDocumentXML
    });

    // Description: The public interface
    return {

        getSpineInfo : function () {
            return packageDoc.getSpineInfo();
        },
        isFixedLayout : function () {
            return packageDoc.isFixedLayout();
        },
        getManifestItemById : function (id) {
            return packageDoc.getManifestItemById(id);
        },
        getManifestItemByIdref : function (idref) {
            return packageDoc.getManifestItemByIdref(idref);
        },
        getSpineItemByIdref : function (idref) {
            return packageDoc.getSpineItemByIdref(idref);
        },
        getSpineItemByIndex : function (spineIndex) {
            return packageDoc.getSpineItem(spineIndex);
        },
        spineLength : function () {
            return packageDoc.spineLength();
        },
        getNextLinearSpinePosition : function (currSpineIndex) {
            return packageDoc.getNextLinearSpinePosition(currSpineIndex);
        },
        getPrevLinearSpinePosition : function (currSpineIndex) {
            return packageDoc.getPrevLinearSpinePosition(currSpineIndex);
        },
        hasNextSection : function (currSpineIndex) {
            return packageDoc.hasNextSection(currSpineIndex);
        },
        hasPrevSection : function (currSpineIndex) {
            return packageDoc.hasPrevSection(currSpineIndex);
        },
        pageProgressionDirection : function () {
            return packageDoc.pageProgressionDirection();
        },
        getSpineIndexByHref : function (manifestHref) {
            return packageDoc.getSpineIndexByHref(manifestHref);
        },
        getPackageDocumentDOM : function () {
            return packageDoc.getPackageDocumentDOM();
        },
        getTocURL : function () {
            return packageDoc.getToc();
        },
        generateTocListDOM : function (ncxXML) {
            return packageDoc.generateTocListDOM(ncxXML);
        },
        tocIsNcx : function () {
            return packageDoc.tocIsNcx();
        }
    };
};
