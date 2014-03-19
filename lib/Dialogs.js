define(['hgn!templates/managed-dialog.html', 'hgn!templates/progress-dialog.html', 'hgn!templates/managed-buttons.html', 'i18n/Strings', 'workers/Messages', 'keymaster'], function(ManagedDialog, ProgressDialog, ButtonTemplate, Strings, Messages, key){
	var $currentModal,
		lastTitle;
	

	var hideExistingModal = function(){
		if($currentModal){
			$currentModal.modal('hide');
		}
	};

	var showModalDialog = function(dismissable, title, body, buttons){
		if (!$currentModal){
			$currentModal = $(ManagedDialog({}));
			$('#app-container').append($currentModal);
			
		}

		$('#managed-label').text(title);
		$('#managed-dialog .modal-body').empty().append(body);
		$('#managed-dialog .modal-footer').empty().append(buttons);
		if (dismissable){
			$('#managed-dialog .close').show();
		}
		else{
			$('#managed-dialog .close').hide();
		}

		if ($currentModal.is(':hidden')){	
			$('#managed-dialog').modal('show');
		}
		
	};

    var keyBindings = {};

            //https://github.com/termi/DOM-Keyboard-Event-Level-3-polyfill
            //https://gist.github.com/termi/4654819
            void function() {//closure

            var global = this
              , _initKeyboardEvent_type = (function( e ) {
            		try {
            			e.initKeyboardEvent(
            				"keyup" // in DOMString typeArg
            				, false // in boolean canBubbleArg
            				, false // in boolean cancelableArg
            				, global // in views::AbstractView viewArg
            				, "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
            				, 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
            				, true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
            				, false // [test]shift | alt
            				, true // [test]shift | alt
            				, false // meta
            				, false // altGraphKey
            			);
		
		
		
            			/*
            			// Safari and IE9 throw Error here due keyCode, charCode and which is readonly
            			// Uncomment this code block if you need legacy properties
            			delete e.keyCode;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			delete e.charCode;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			delete e.which;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			*/
		
            			return ((e["keyIdentifier"] || e["key"]) == "+" && (e["keyLocation"] || e["location"]) == 3) && (
            				e.ctrlKey ?
            					e.altKey ? // webkit
            						1
            						:
            						3
            					:
            					e.shiftKey ?
            						2 // webkit
            						:
            						4 // IE9
            				) || 9 // FireFox|w3c
            				;
            		}
            		catch ( __e__ ) { _initKeyboardEvent_type = 0 }
            	})( document.createEvent( "KeyboardEvent" ) )

            	, _keyboardEvent_properties_dictionary = {
            		"char": "",
            		"key": "",
            		"location": 0,
            		"ctrlKey": false,
            		"shiftKey": false,
            		"altKey": false,
            		"metaKey": false,
            		"repeat": false,
            		"locale": "",

            		"detail": 0,
            		"bubbles": false,
            		"cancelable": false,
	
            		//legacy properties
            		"keyCode": 0,
            		"charCode": 0,
            		"which": 0
            	}

            	, own = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

            	, _Object_defineProperty = Object.defineProperty || function(obj, prop, val) {
            		if( "value" in val ) {
            			obj[prop] = val["value"];
            		}
            	}
            ;

            function crossBrowser_initKeyboardEvent(type, dict) {
            	var e;
            	if( _initKeyboardEvent_type ) {
            		e = document.createEvent( "KeyboardEvent" );
            	}
            	else {
            		e = document.createEvent( "Event" );
            	}

                // // Chromium Hack
                // try
                // {
                // Object.defineProperty(e, 'keyCode', {
                //             get : function() {
                //                 return this.keyCodeVal;
                //             }
                // });     
                // }catch(){}
                // 
                // try
                // {
                // Object.defineProperty(e, 'which', {
                //             get : function() {
                //                 return this.keyCodeVal;
                //             }
                // });
                // }catch(){} 

            
            	var _prop_name
            		, localDict = {};

            	for( _prop_name in _keyboardEvent_properties_dictionary ) if(own(_keyboardEvent_properties_dictionary, _prop_name) ) {
            		localDict[_prop_name] = (own(dict, _prop_name) && dict || _keyboardEvent_properties_dictionary)[_prop_name];
            	}

            	var _ctrlKey = localDict["ctrlKey"]
            		, _shiftKey = localDict["shiftKey"]
            		, _altKey = localDict["altKey"]
            		, _metaKey = localDict["metaKey"]
            		, _altGraphKey = localDict["altGraphKey"]

            		, _modifiersListArg = _initKeyboardEvent_type > 3 ? (
            			(_ctrlKey ? "Control" : "")
            				+ (_shiftKey ? " Shift" : "")
            				+ (_altKey ? " Alt" : "")
            				+ (_metaKey ? " Meta" : "")
            				+ (_altGraphKey ? " AltGraph" : "")
            			).trim() : null

            		, _key = localDict["key"] + ""
            		, _char = localDict["char"] + ""
            		, _location = localDict["location"]
            		, _keyCode = localDict["keyCode"] || (localDict["keyCode"] = _key && _key.charCodeAt( 0 ) || 0)
            		, _charCode = localDict["charCode"] || (localDict["charCode"] = _char && _char.charCodeAt( 0 ) || 0)

            		, _bubbles = localDict["bubbles"]
            		, _cancelable = localDict["cancelable"]

            		, _repeat = localDict["repeat"]
            		, _locale = localDict["locale"]
            		, _view = global
            	;

            	localDict["which"] || (localDict["which"] = localDict["keyCode"]);

                //e.keyCodeVal = _keyCode;
            
            	if( "initKeyEvent" in e ) {//FF
            		//https://developer.mozilla.org/en/DOM/event.initKeyEvent
            		e.initKeyEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
            	}
            	else if(  _initKeyboardEvent_type && "initKeyboardEvent" in e ) {//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            		if( _initKeyboardEvent_type == 1 ) { // webkit
            			//http://stackoverflow.com/a/8490774/1437207
            			//https://bugs.webkit.org/show_bug.cgi?id=13368
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey );
            		}
            		else if( _initKeyboardEvent_type == 2 ) { // old webkit
            			//http://code.google.com/p/chromium/issues/detail?id=52408
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
            		}
            		else if( _initKeyboardEvent_type == 3 ) { // webkit
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey );
            		}
            		else if( _initKeyboardEvent_type == 4 ) { // IE9
            			//http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale );
            		}
            		else { // FireFox|w3c
            			//http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
            			//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale );
            		}
            	}
            	else {
            		e.initEvent(type, _bubbles, _cancelable)
            	}

            	for( _prop_name in _keyboardEvent_properties_dictionary )if( own( _keyboardEvent_properties_dictionary, _prop_name ) ) {
            		if( e[_prop_name] != localDict[_prop_name] ) {
            			try {
            				delete e[_prop_name];
            				_Object_defineProperty( e, _prop_name, { writable: true, "value": localDict[_prop_name] } );
            			}
            			catch(ex) {
            				//Some properties is read-only
// console.debug("PROP EX: " + ex);
// e[_prop_name] = _keyCode;
// console.debug("PROP AFTER: " + e[_prop_name]);
            			}
		
            		}
            	}

            	return e;
            }

            //export
            global.crossBrowser_initKeyboardEvent = crossBrowser_initKeyboardEvent;

            }.call(window);
            
            
	Dialogs = {	
		showError : function(type, data){
			var msg = Strings.err_unknown;
			switch(type){
				case Messages.ERROR_STORAGE:
					msg = Strings.err_storage;
					break;
				case Messages.ERROR_EPUB:
					msg = Strings.err_epub_corrupt
					break;
				default: 
					msg = Strings.err_unknown;
					console.trace();
					break;
			}
			Dialogs.showModalMessage(Strings.err_dlg_title, msg);
		},
		showModalMessage : function(title, message){
			var body = $('<p></p>').text(message),
				buttons = ButtonTemplate({
					buttons : [
						{
							dismiss : true,
							text : Strings.ok
						}
					]
				});

			showModalDialog(true, title, body, buttons);
		},
		showModalPromptEx : function(title, message, buttons, handlers){

			var body = $('<p></p>').text(message);
			var buttonsStr = ButtonTemplate({buttons: buttons});
			showModalDialog(false, title, body, buttonsStr);

			for (var i = 0; i < handlers.length; i++){
				if (handlers[i]){
					$('#managed-dialog .' + buttons[i].classes[0]).on('click', handlers[i]);
				}
			}
			// if (onOk)
			// 	$('#managed-dialog .yes-button').on('click', onOk);

			// if (onCancel)
			// 	$('#managed-dialog .no-button').on('click', onCancel);
		},
		showModalPrompt : function(title, message, okLabel, cancelLabel, onOk, onCancel){
			
			
			var buttons = [
					{
						dismiss: true,
						text : cancelLabel,
						classes : ['no-button']
					},
					{
						dismiss : true,
						text : okLabel,
						classes : ['yes-button', 'btn-primary']
					}
				];

			handlers = [onCancel, onOk];
			Dialogs.showModalPromptEx(title, message, buttons, handlers);
		},
		showReplaceConfirm : function(title, message, okLabel, cancelLabel, keepBothLabel, onOk, onCancel, onKeepBoth){
			var buttons = [
				
					{
						dismiss: true,
						text : cancelLabel,
						classes : ['no-button']
					},
					{
						dismiss : true,
						text : okLabel,
						classes : ['yes-button', 'btn-danger']
					},
					{
						dismiss : true,
						text : keepBothLabel,
						classes : ['keep-both-button', 'btn-primary']
					}
				
			];
			handlers = [onCancel, onOk, onKeepBoth];
			Dialogs.showModalPromptEx(title, message, buttons, handlers);
		},
		showModalProgress : function(title, message){
			var data = {
				message: message
			}
			lastTitle = title;
			showModalDialog(false, title, ProgressDialog(data), '');
		},
		updateProgress : function(percent, type, data, noForce){
			
			var msg = '';
			switch(type){
				case Messages.PROGRESS_MIGRATING : 
					msg = Strings.migrating + ' ' + data;
					break;
				case Messages.PROGRESS_EXTRACTING: 
					msg = Strings.i18n_extracting + ' ' + data;
					break;
				case Messages.PROGRESS_WRITING: 
					msg = Strings.storing_file + ' ' + data;
					break;
				case Messages.PROGRESS_DELETING:
					msg = Strings.delete_progress_message + ' ' + data;
					break;
			}
			// if (!noForce && $('#managed-dialog').is(':hidden')){
			//  	Dialogs.showModalProgress(lastTitle, msg);
			// }
			$('#managed-dialog .progress-bar').attr('aria-valuenow', percent).css('width', percent + '%');
			$('#managed-dialog .progress-message').text(msg);
		},
		closeModal : function(){
			hideExistingModal();
		},
		reset : function(){
			if ($currentModal){
				$currentModal.remove();
				$currentModal = null;
			}
		},
        keyboard:
        {
            dispatch: function(target, e)
            {
                //$(window).trigger(e);

                // //var newE = jQuery.extend(true, {}, e);// deep copy
                // var newE = $.extend($.Event(e.type), {}, e);
                // 
                // newE.preventDefault();
                // newE.stopPropagation();
                // newE.stopImmediatePropagation();
                // 
                // newE.originalEvent.bubbles = false;
                // newE.originalEvent.srcElement = document.documentElement;
                // newE.originalEvent.target = document.documentElement;
                // newE.originalEvent.view = window;
                
                var ev = crossBrowser_initKeyboardEvent(e.type, {
                    "bubbles": true,
                    "cancelable": false,
                    
                    "keyCode": e.keyCode,
                    "charCode": e.charCode,
                    "which": e.which,
                    
                    "ctrlKey": e.ctrlKey,
                    "shiftKey": e.shiftKey,
                    "altKey": e.altKey,
                    "metaKey": e.metaKey,
                    
                    //https://developer.mozilla.org/en-US/docs/Web/API/event.which
                    "char": e.char ? e.char : String.fromCharCode(e.charCode), // lower/upper case-sensitive
                    "key": e.key ? e.key : e.keyCode // case-insensitive
                });

                target.dispatchEvent(ev);
            },
            scope: function(scope)
            {
                if (!scope) alert("!SCOPE ACTIVATE!");
                
                key.setScope(scope);
            },
            on: function(keys, scope, callback)
            {
                if (!keys) alert("!KEYS!");
                
                if (!keyBindings.hasOwnProperty(scope))
                {
                    keyBindings[scope] = [];
                }
                keyBindings[scope].push(keys);
                
                key.unbind(keys, scope);
                key(keys, scope, function()
                {
                    $(document.body).addClass("keyboard");
                    callback();
                });
            },
            off: function(scope)
            {
                if (!scope) alert("!SCOPE OFF!");
                
                if (!keyBindings.hasOwnProperty(scope)) return;
                
                for (k in keyBindings[scope])
                {
                    key.unbind(k, scope);
                }
            },
            ShowSettingsModal: 'o', //accesskey'ed
            
            SettingsModalSave: 's', //accesskey'ed
            SettingsModalClose: 'c', //accesskey'ed
            
            PagePrevious: 'left', // ALT BELOW
            PageNext: 'right', // ALT BELOW
            PagePreviousAlt: '1', //accesskey'ed
            PageNextAlt: '2', //accesskey'ed
            
            ToolbarShow: 'v', //accesskey'ed
            ToolbarHide: 'x', //accesskey'ed
            
            FullScreenToggle: 'h', //accesskey'ed
            
            SwitchToLibrary: 'b', //accesskey'ed
            
            TocShowHideToggle: 't', //accesskey'ed
            
            NightTheme: 'n', //accesskey'ed
            
            MediaOverlaysEscape: 'r', //accesskey'ed
            
            MediaOverlaysPlayPauseAlt: 'p', // ALT BELOW
            MediaOverlaysPlayPause: 'm', //accesskey'ed
            
            MediaOverlaysRateIncrease: 'l', // TODO
            MediaOverlaysRateDecrease: 'j', // TODO
            MediaOverlaysRateIncreaseAlt: 'F8', //??
            MediaOverlaysRateDecreaseAlt: 'shift+F8', //??
            MediaOverlaysRateReset: 'k', //accesskey'ed
            
            MediaOverlaysVolumeIncrease: 'w', // TODO
            MediaOverlaysVolumeDecrease: 'q', // TODO
            MediaOverlaysVolumeIncreaseAlt: 'F7', //??
            MediaOverlaysVolumeDecreaseAlt: 'shift+F7', //??
            MediaOverlaysVolumeMuteToggle: 'a', //accesskey'ed
            
            MediaOverlaysPrevious: 'y', //accesskey'ed
            MediaOverlaysNext: 'u', //accesskey'ed
            
            MediaOverlaysAdvancedPanelShowHide: 'g' //accesskey'ed
        }
	}
	return Dialogs;
});