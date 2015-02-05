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

define(['jquery','hammer'], function($,Hammer) {

    var gesturesHandler = function(reader, viewport){

		var quiet = false;
	
        var onSwipeLeft = function() {
if (!quiet) console.debug("READIUM swipeleft (openPageRight)");
            reader.openPageRight();
        };

        var onSwipeRight = function() {
if (!quiet) console.debug("READIUM swiperight (openPageLeft)");
            reader.openPageLeft();
        };

        var isGestureHandled = function() {
            var viewType = reader.getCurrentViewType();
            return viewType === ReadiumSDK.Views.ReaderView.VIEW_TYPE_FIXED || viewType == ReadiumSDK.Views.ReaderView.VIEW_TYPE_COLUMNIZED; // Excludes SCROLL
        };

		/*
		if (window.navigator.msPointerEnabled) {

if (!quiet) console.debug("-ms-touch-action");
			$("readium-toc-body").css("-ms-touch-action", "none");
		}
		*/
		
		/*
				if (typeof document.documentElement.style.msTouchAction != 'undefined')
					document.documentElement.style.msTouchAction = "none";
		*/
		if (navigator.msMaxTouchPoints) {
    if (/Windows Phone/.test(navigator.userAgent)) {
        document.documentElement.classList.add('disable-ie-back-swipe');
    } else {
        try {
            var metroTestElement = document.createElement('div');
            metroTestElement.style.cssText = 'position:absolute;z-index:-1;top:0;right:0;bottom:-10px;width:1px';
            document.body.appendChild(metroTestElement);
            if (Math.round(window.outerWidth - metroTestElement.offsetLeft) === 1) {
                document.documentElement.classList.add('disable-ie-back-swipe');
            }
            document.body.removeChild(metroTestElement);
        } catch (e) {   // window.outerWidth throws error if in IE showModalDialog
        }
    }
}
		var setupTouchDefaultActionSuppressor = function(doc) {
			
			var touchDown = false;
			var touchStartX = 0;
			var touchStartY = 0;
			var lockDragX = false;
			var lockDragY = false;

if (window.navigator.msPointerEnabled) {
doc.addEventListener("MSPointerCancel", function (e) {
if (!quiet) console.debug("DOC MSPointerCancel");
e.preventDefault();
}, false);
doc.addEventListener("MSGestureInit", function (e) {
if (!quiet) console.debug("DOC MSGestureInit");
e.preventDefault();
}, false);
doc.addEventListener("MSHoldVisual", function (e) {
if (!quiet) console.debug("DOC MSHoldVisual");
e.preventDefault();
}, false);
}
			doc.addEventListener(window.navigator.msPointerEnabled ? "MSPointerDown" : "touchstart", function(ev) {
				//if (window.navigator.msPointerEnabled && !ev.isPrimary) return;
				touchDown = true;
				
				/*
				var toc = doc.getElementById("readium-toc-body");
				if (toc && typeof toc.style.msTouchAction != 'undefined')
					toc.style.msTouchAction = "none";
				*/
				
if (!quiet) console.debug("DOC touchstart");
			});
			
			var upOut1 = function(ev) {
				//if (window.navigator.msPointerEnabled && !ev.isPrimary) return;
				touchDown = false;
				
if (!quiet) console.debug("DOC touchend");
			};
			doc.addEventListener(window.navigator.msPointerEnabled ? "MSPointerUp" : "touchend", upOut1);
			if (window.navigator.msPointerEnabled) {
				//doc.addEventListener("MSPointerOut", upOut1);
			}
			
			doc.addEventListener(window.navigator.msPointerEnabled ? "MSPointerMove" : "touchmove", function(ev) {
				//if (window.navigator.msPointerEnabled && !ev.isPrimary) return;
				
				if (!touchDown) return;
if (!quiet) console.debug("DOC touchmove");
		
				if (!ev.cancelable) {
if (!quiet) console.debug("DOC !CANCELABLE");
					return;
				}
if (!quiet) console.debug("DOC preventDefault");
					ev.preventDefault();
			});
			
			doc.documentElement.addEventListener(window.navigator.msPointerEnabled ? "MSPointerDown" : "touchstart", function(ev) {
				if (window.navigator.msPointerEnabled && !ev.isPrimary) return;
				
				lockDragX = false;
				lockDragY = false;
				
if (!quiet) console.debug("touchstart");
				if (window.navigator.msPointerEnabled || ev.touches && ev.touches.item && ev.touches.item(0)) {
					touchStartX = window.navigator.msPointerEnabled ? ev.clientX : ev.touches.item(0).clientX;
					touchStartY = window.navigator.msPointerEnabled ? ev.clientY : ev.touches.item(0).clientY;
				}
			});
			
			var upOut2 = function(ev) {
				if (window.navigator.msPointerEnabled && !ev.isPrimary) return;
				
				lockDragX = false;
				lockDragY = false;
				
if (!quiet) console.debug("touchend");
			};
			doc.documentElement.addEventListener(window.navigator.msPointerEnabled ? "MSPointerUp" : "touchend", upOut2);
			if (window.navigator.msPointerEnabled) {
				//doc.documentElement.addEventListener("MSPointerOut", upOut2);
			}
			
			doc.documentElement.addEventListener(window.navigator.msPointerEnabled ? "MSPointerMove" : "touchmove", function(ev) {
				if (window.navigator.msPointerEnabled && !ev.isPrimary) return;
				
				if (!touchDown) return;
if (!quiet) console.debug("touchmove");
				if (!ev.cancelable) {
if (!quiet) console.debug("!CANCELABLE");
					return;
				}
				
				if (ev.target && (window.navigator.msPointerEnabled || ev.touches && ev.touches.item && ev.touches.item(0))) {
					
if (!quiet) console.debug("touchStartX: " + touchStartX);
if (!quiet) console.debug("touchStartY: " + touchStartY);

					var touchStartX_ = window.navigator.msPointerEnabled ? ev.clientX : ev.touches.item(0).clientX;
					var touchStartY_ = window.navigator.msPointerEnabled ? ev.clientY : ev.touches.item(0).clientY;
					
if (!quiet) console.debug("touchStartX_: " + touchStartX_);
if (!quiet) console.debug("touchStartY_: " + touchStartY_);

					var touchDeltaX = touchStartX - touchStartX_;
					var touchDeltaY = touchStartY - touchStartY_;

if (!quiet) console.debug("touchDeltaX: " + touchDeltaX);
if (!quiet) console.debug("touchDeltaY: " + touchDeltaY);

					if (Math.abs(touchDeltaX) <= 1 && Math.abs(touchDeltaY) <= 1) {
						return;
					}

					if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
						lockDragX = true;
						lockDragY = false;
					} else {
						lockDragX = false;
						lockDragY = true;
					}

if (!quiet) console.debug("lockDragX: " + lockDragX);
if (!quiet) console.debug("lockDragY: " + lockDragY);

					touchStartX = touchStartX_;
					touchStartY = touchStartY_;
					
					var target = ev.target;
					while (target && typeof target.scrollTop !== "undefined") {
						
						var $target = $(target);
						
						var scrollTop = target.scrollTop;
						var scrollLeft = target.scrollLeft;

						var scrollBottom = scrollTop + $target.height();
						var scrollRight = scrollLeft + $target.width();

						var needsScroll =
							lockDragX && touchDeltaX < 0 && scrollLeft != 0 ||
							lockDragX && touchDeltaX > 0 && scrollRight != target.scrollWidth ||
							lockDragY && touchDeltaY < 0 && scrollTop != 0 ||
							lockDragY && touchDeltaY > 0 && scrollBottom != target.scrollHeight;
				
						if (needsScroll) {
if (!quiet) console.debug("needsScroll");

if (!quiet) console.debug("target: ");
if (!quiet) console.debug(target);

if (!quiet) console.debug("scrollLeft: " + scrollLeft);
if (!quiet) console.debug("scrollTop: " + scrollTop);
if (!quiet) console.debug("scrollBottom: " + scrollBottom);
if (!quiet) console.debug("scrollRight: " + scrollRight);
if (!quiet) console.debug("target.scrollWidth: " + target.scrollWidth);
if (!quiet) console.debug("target.scrollHeight: " + target.scrollHeight);

							ev.stopPropagation();
							return;
						}
						
						target = target.parentNode;
					}
				}
			});
		}
		
        this.initialize = function() {
			
			delete Hammer.defaults.cssProps.userSelect;

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function(iframe,s) {
                
                var iframeDocument = iframe[0].contentWindow.document;
				
				setupTouchDefaultActionSuppressor(iframeDocument);
				
				/*
				
				var iframeHtml = iframeDocument.documentElement;
				
				var iframeHammer = new Hammer.Manager(iframeHtml, { touchAction: "pan-x pan-y" });
	
				var swipe = new Hammer.Swipe({ enable: isGestureHandled, direction: Hammer.DIRECTION_HORIZONTAL });
				
				iframeHammer.add([swipe]);
				
                iframeHammer.on("swipeleft", function(ev) {
					console.debug("HAMMER swipeleft");
					
					ev.preventDefault();
					
					if (isGestureHandled()) {
						onSwipeLeft();
					}
                });
				
                iframeHammer.on("swiperight", function(ev) {
					console.debug("HAMMER swiperight");
					
					ev.preventDefault();
					
					if (isGestureHandled()) {
						onSwipeRight();
					}
                });
				
				*/
            });

			setupTouchDefaultActionSuppressor(document);			
        };
    };
	
    return gesturesHandler;
});