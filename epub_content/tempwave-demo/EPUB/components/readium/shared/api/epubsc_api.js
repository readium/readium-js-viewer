/*
    A sample implementation of the IDPF scripted
    component prototocol.
    
    authors: 
    Greg Davis -- Pearson PLC
    
*/

var epubsc = (function(){
	'use strict';

	var methods = {
		initialize : function(){		    
			// set up the message listener here, needs to be done for widgets and pages
			window.addEventListener("message", subpub.messageHandler);

			// assign an id here
			this.widgetID = subpub.genUuid();

			// setup the publishable browser event stack
			subpub.publishableBrowserEvents.forEach(function(eventName) {
			    // Setup the event listener here - listen for bubble phase, then publish the event when it fires
			    document.addEventListener(eventName, function(e){
			        epubsc.publish("epubsc_event", new epubsc.BrowserEvent(e));
			    });
            });

		    // fire off the loading event
		    this.publish("epubsc_load", "loading");

            // set up the ready event
            if(window.parent != window){
                window.addEventListener("DOMContentLoaded", function(){
                    epubsc.publish("epubsc_ready", "ready");
                }, false);
            }

            // set up the unload event
            if(window.parent != window){
                window.addEventListener("unload", function(){
                    epubsc.send(window.parent, "epubsc_unload", document.URL);
                });
            }
		},

		// sub-pub mechanisms here
		// message constructor
		Message : function(method, topic, message, bubbles){
			// this is a constructor, so when it's invoked as "new" this will refer 
			// only to the created object, not the whole PSO object
			this.type = "epubsc_message";
			this.method = method;
			this.timestamp = +new Date(); // date string
            this.id = subpub.genUuid(); // unique id for the message
			this.widgetId = methods.widgetID; // unique id for the widget during this session

			// make the payload
            this.topic = topic;
            this.topicData = message;
		},

		BrowserEvent : function(e){
		    /* TODO: Decide if assigning undefined properties is bad. It means that
             * this.hasOwnProperty(X) will be true even if e.hasOwnProperty(X) is
             * false.
             */
            this.type = e.type;
            this.screenX = e.screenX;
            this.screenY = e.screenY;
            this.button = e.button;

            this.keyCode = e.keyCode;
            this.charCode = e.charCode;
            this.ctrlKey = e.ctrlKey;
            this.altKey = e.altKey;
            this.shiftKey = e.shiftKey;
            this.metaKey = e.metaKey;

            /* TODO: Test this. */
            if (e.touches) {
                /* TODO: Decide if we want to rely on Array.prototype.map. If not,
                 * we should provide an implementation.
                 */
                this.touches = e.touches.map(function (coord) {
                    return { screenX: coord.screenX, screenY: coord.screenY };
                });
            }

            this.state = e.state;
            this.defaultPrevented = e.defaultPrevented;
		},

		subscriptions : {}, //object to store the subscriptions per window

		subscribers : {}, //object to store the subscribers to broadcast to

		requests : {}, //request objects stored until done

		subscribe : function(topic, handler){
			// subscribe to messages on certain topics
			// only the local instance cares about the subscription
            console.log("subscribing to: "+topic);
            
			// attach the handler here to be fired on receipt of the message
		    if(topic instanceof Array){
		        for(var key in topic){
		            var Topic = topic[key];
		            pushSub(Topic, handler);
		        }
    		}
    		else {
	            pushSub(topic, handler);
    		}
    		
    		function pushSub(topic, handler){
    		    if(epubsc.subscriptions[topic] && epubsc.subscriptions[topic].handlers){
    		        epubsc.subscriptions[topic].handlers.push(handler);
    		    } else {
    			    epubsc.subscriptions[topic] = {};
    			    epubsc.subscriptions[topic].handlers = [];
    			    epubsc.subscriptions[topic].handlers.push(handler);
    		    }
    		}
		},

		unsubscribe : function(topic, handler){
		    console.log("unsubscribing from: "+topic);
		    console.log(topic);
		    // unsubscribe from the locally assigned handler
			for(var key in epubsc.subscriptions[topic].handlers){
			    var Handler = epubsc.subscriptions[topic].handlers[key];
			    if(Handler == handler){
        			delete epubsc.subscriptions[topic].handlers[key];
			    }
			}
		},

		publish : function(topic, message){
			// publish messages to listeners
			var payload = new this.Message("epubsc_publish", topic, message),
			    isEvent = subpub.isEvent(topic);
			    
			// stringify if the browser doesn't support objects
            if(subpub.postmessage_usestring()){
                payload = JSON.stringify(payload);
            }
            
            // publish message to window.parent and any iframes in the window
            if(window.parent != window){
                window.parent.postMessage(payload, "*");
            }

            var iframes = document.getElementsByTagName("iframe");
            for(var i = 0; i < iframes.length; i++){
                var iframe = iframes[i];
                iframe.contentWindow.postMessage(payload, "*");
            }
		},

		send : function(target, topic, message){
		    // send a targeted message, this is used internally for rebroadcasting
		    // using send prevents the message from going recursive by going back up
		    var payload = new epubsc.Message("epubsc_publish", topic, message);
			// stringify if the browser doesn't support objects
            if(subpub.postmessage_usestring()){
                payload = JSON.stringify(payload);
            }
		    target.postMessage(payload, "*");
		}
	}

	// the internal methods for subpub
	var subpub = {
		messageHandler : function(e){
			// respond to messages here
			if(e.data == undefined) e.data = e.originalEvent.data;
			// check to see if it's a string, then parse it (to support older systems that use JSON (< IE 9))
			if(typeof e.data == "string") { e.data = JSON.parse(e.data); }

			// get the topic, then fire the position in
			// descriptions that holds the handler
			if(e.data.type == "epubsc_message") {
    			switch(e.data.method) {
    				case "epubsc_publish" :
    					subpub.publishHandler(e);
    					break;
    				default :
    				    console.log("epubsc: unknown method type");
    				    break;
    			}
			}

		},

        /**
         * An array of all publishable events, used in init to setup the stack.
        */
        publishableBrowserEvents : [
            "load", "unload", "abort", "error", "select", "resize", "scroll",
            "blur", "focus", "focusin", "focusout",
            "click", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup",
            "wheel", "beforeinput", "input", "keydown", "keyup", "compositionstart", "compositionupdate", "compositionend",
            "touchstart", "touchend", "touchmove", "touchcancel",
            "pointerover", "pointerenter", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerout", "pointerleave", "gotpointercapture", "lostpointercapture"
        ],

        isEvent : function(topic){
            var isEvent = false
			for(var key in subpub.publishableBrowserEvents){
			    var Event = subpub.publishableBrowserEvents[key];
			    if(topic == Event){
			        isEvent = true;
			    }
		    }
		    return isEvent;
        },

		publishHandler : function(e){
		    var topic = e.data.topic;

			// fire off the local handler here
			if(epubsc.subscriptions[topic]){
			    for(var key in epubsc.subscriptions[topic].handlers){
			        var Handler = epubsc.subscriptions[topic].handlers[key];
			        Handler(e);
			    }
    		} 
    		
            // rebroadcast to everyone
            subpub.rebroadcast(e);
		},
		rebroadcast : function(e){
		    // blind rebroadcasting of all publishes
		    var iframes = document.getElementsByTagName("iframe");
		    for(var i=0;i<iframes.length;i++){
		        var iframe = iframes[i];
	            if(iframe.contentWindow != e.source){
    	            epubsc.send(iframe.contentWindow, e.data.topic, e.data.topicData);
	            }
		    }
		    // TODO: get the publishes up to parent, but only if they come from children.
		    // DO NOT re-publish to parent, will cause recursion.
		    if(window.parent != e.source && window.parent != window){
		        epubsc.send(window.parent, e.data.topic, e.data.topicData);
		    }
		},
		genUuid : function(){
			var d = new Date().getTime();
		    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		        var r = (d + Math.random() * 16) % 16 | 0;
		        d = Math.floor(d / 16);
		        return (c == "x" ? r : (r & 0x7 | 0x8)).toString(16);
		    });
		    return uuid;
		},
		getObject : function(win){
		    var object = {},
			    iframesOnPage = document.querySelectorAll('iframe'),
			    objectsOnPage = document.querySelectorAll('object');
            for (var i = 0; i < iframesOnPage.length; i++){
                if(win === iframesOnPage[i].contentWindow) object = iframesOnPage[i];
            }
            for (var i = 0; i < objectsOnPage.length; i++){
                var object = objectsOnPage[i];
                if(win === objectsOnPage[i].contentWindow) object = objectsOnPage[i];
            }
			return object;
		},
		postmessage_usestring : function(){
		    if(this.usestring != undefined){
		        return this.usestring;
		    } else {
                try {
                    window.postMessage({ toString: false }, '*');
                    this.usestring = false;
                    return false;
                } catch (e) {
                    this.usestring = true;
                    return true;
                }
		    }
		}
        
	}

	//the internal methods for templating and loading
	var priv = {
		isJsonString : function(str) {
		    try {
		        JSON.parse(str);
		    } catch (e) {
		        return false;
		    }
		    return true;
		}
	}

	// self initialize
	!function(){
	    methods.initialize();
	}()

	return methods;
})()