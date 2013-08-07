define(['require', 'module', 'jquery', 'underscore', 'backbone'], function (require, module, $, _, Backbone) {

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
