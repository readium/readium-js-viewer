//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define('backbone',['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

define('plugin-annotations/annotations_module',['backbone'], function(Backbone) {
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

        startMarker.parentNode.removeChild(startMarker);
        endMarker.parentNode.removeChild(endMarker);

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

    return EpubAnnotationsModule;
});
//  Created by Dmitry Markushevich (dmitrym@evidentpoint.com)
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
	Views.ReaderView {on: function, once: function, off: function, trigger: function, listenTo: function???}
	
Then when the user clicks on the highlight the following will show up in the console:

	highlight id-id2604743 /4/2/6,/1:74,/1:129 123 
	

*/
define('plugin-annotations/annotations_manager',['jquery', 'underscore', 'eventEmitter', './annotations_module'], function($, _, EventEmitter, EpubAnnotationsModule) {
/**
 *
 * @param proxyObj
 * @param options
 * @constructor
 */
var AnnotationsManager = function (proxyObj, options) {

    var self = this;
    var liveAnnotations = {};
    var spines = {};
    var proxy = proxyObj; 
    var annotationCSSUrl = options.annotationCSSUrl;

    if (!annotationCSSUrl) {
        console.warn("WARNING! Annotations CSS not supplied. Highlighting is not going to work.");
    }

    _.extend(this, new EventEmitter());

    // we want to bubble up all of the events that annotations module may trigger up.
    // this.on("all", function() {
    // });
    //TODO: EventEmitter3 does not support "all" or "*" (catch-all event sink)
    //https://github.com/primus/eventemitter3/blob/master/index.js#L61
    //...so instead we patch trigger() and emit() (which are synonymous, see Bootstrapper.js EventEmitter.prototype.trigger = EventEmitter.prototype.emit;)
        
    var originalEmit = self['emit'];
    
    var triggerEmitPatch = function() {
        var args = Array.prototype.slice.call(arguments);
console.debug(args);

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
                    
console.debug("Corrected CFI:");
console.debug(args);
                }
            }
        }
        
        originalEmit.apply(this, args);
        originalEmit.apply(proxy, args);
    };

    this.trigger = triggerEmitPatch;
    this.emit = triggerEmitPatch;

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

return AnnotationsManager;
});
define('plugin-annotations/main',['plugins-controller', './annotations_manager'], function (Plugins, AnnotationsManager) {
    var config = {};

    Plugins.register("annotations", function (api) {
        var _annotationsManager, _annotationsApi, _initialized = false, _initializedLate = false;

        _annotationsApi = function () {
            var self = this;

            function isInitialized() {
                if (!_initialized) {
                    api.plugin.warn('Not initialized!')
                }
                return _initialized;
            }

            this.initialize = function (options) {
                if (_initialized) {
                    api.plugin.warn('Already initialized!');
                    return;
                }

                _annotationsManager = new AnnotationsManager(self, options);

                if (_initializedLate) {
                    api.plugin.warn('Unable to attach to currently loaded content document.\n' +
                    'Initialize the plugin before loading a content document.');
                }

                _initialized = true;
            };

            /**
             * Returns current selection partial Cfi, useful for workflows that need to check whether the user has selected something.
             *
             * @method getCurrentSelectionCfi
             * @returns {object | undefined} partial cfi object or undefined if nothing is selected
             *
             */
            this.getCurrentSelectionCfi = function () {
                if (!isInitialized()) {
                    return
                }

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
            this.addHighlight = function (spineIdRef, Cfi, id, type, styles) {
                if (!isInitialized()) {
                    return
                }

                return _annotationsManager.addHighlight(spineIdRef, Cfi, id, type, styles);
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
            this.addSelectionHighlight = function (id, type) {
                if (!isInitialized()) {
                    return
                }

                return _annotationsManager.addSelectionHighlight(id, type);
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
            this.removeHighlight = function (id) {
                if (!isInitialized()) {
                    return
                }

                return _annotationsManager.removeHighlight(id);
            };

        };


        api.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem) {
            if (_initialized) {
                _annotationsManager.attachAnnotations($iframe, spineItem);
            } else {
                _initializedLate = true;
            }
        });

        // Extend the Reader API with the Annotations API under its own namespace
        api.extendReader(new _annotationsApi());
    });

    return config;
});
define('plugin-annotations', ['plugin-annotations/main'], function (main) { return main; });

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

define('readium-plugin-annotations',['plugin-annotations'], function (pluginAnnotationsConfig) {
return pluginAnnotationsConfig;
});


require(["readium-plugin-annotations"]);

//# sourceMappingURL=readium-plugin-annotations.js.map