define(['require', 'module', 'jquery', 'underscore', 'backbone', 'URIjs/URI', './manifest', './spine', './metadata',
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
            this.spine.each(function (spineItem) {
                spinePackageData.push(that.generatePackageData(spineItem));
            });

            var packageDocRoot = packageDocumentURL.substr(0, packageDocumentURL.lastIndexOf("/"));

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
