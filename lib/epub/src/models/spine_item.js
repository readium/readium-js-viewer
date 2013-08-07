define(['require', 'module', 'jquery', 'underscore', 'backbone', './manifest_item'],
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
