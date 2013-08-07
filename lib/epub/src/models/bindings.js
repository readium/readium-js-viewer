define(['require', 'module', 'jquery', 'underscore', 'backbone', './binding'],
    function (require, module, $, _, Backbone, Binding) {
        var Bindings = Backbone.Collection.extend({
            model: Binding
        });
        return Bindings;
    });