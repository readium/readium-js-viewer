define(['require', 'module', 'jquery', 'underscore', 'backbone', './spine_item'],
    function (require, module, $, _, Backbone, SpineItem) {
        var Spine = Backbone.Collection.extend({
            model: SpineItem
        });
        return Spine;
    });