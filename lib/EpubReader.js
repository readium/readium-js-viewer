
define(['module','jquery', 'bootstrap', 'URIjs', 'Readium', 'Spinner', 'storage/Settings', 'i18n/Strings', 'ReaderSettingsDialog', 
        'hgn!templates/about-dialog.html', 'hgn!templates/reader-navbar.html', 'hgn!templates/reader-body.html', 'analytics/Analytics', 'Dialogs'], 
        function (module, $, bootstrap, URI, Readium, spinner, Settings, Strings, SettingsDialog, AboutDialog, ReaderNavbar, ReaderBody, Analytics, Dialogs) {

            //TODO: move to own module?
            /*!
            * screenfull
            * v1.1.1 - 2013-11-20
            * https://github.com/sindresorhus/screenfull.js
            * (c) Sindre Sorhus; MIT License
            */
            /*global Element */
            (function (window, document) {
            	'use strict';

            	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element, // IE6 throws without typeof check

            		fn = (function () {
            			var val, valLength;
            			var fnMap = [
            				[
            					'requestFullscreen',
            					'exitFullscreen',
            					'fullscreenElement',
            					'fullscreenEnabled',
            					'fullscreenchange',
            					'fullscreenerror'
            				],
            				// new WebKit
            				[
            					'webkitRequestFullscreen',
            					'webkitExitFullscreen',
            					'webkitFullscreenElement',
            					'webkitFullscreenEnabled',
            					'webkitfullscreenchange',
            					'webkitfullscreenerror'

            				],
            				// old WebKit (Safari 5.1)
            				[
            					'webkitRequestFullScreen',
            					'webkitCancelFullScreen',
            					'webkitCurrentFullScreenElement',
            					'webkitCancelFullScreen',
            					'webkitfullscreenchange',
            					'webkitfullscreenerror'

            				],
            				[
            					'mozRequestFullScreen',
            					'mozCancelFullScreen',
            					'mozFullScreenElement',
            					'mozFullScreenEnabled',
            					'mozfullscreenchange',
            					'mozfullscreenerror'
            				],
            				[
            					'msRequestFullscreen',
            					'msExitFullscreen',
            					'msFullscreenElement',
            					'msFullscreenEnabled',
            					'MSFullscreenChange',
            					'MSFullscreenError'
            				]
            			];
            			var i = 0;
            			var l = fnMap.length;
            			var ret = {};

            			for (; i < l; i++) {
            				val = fnMap[i];
            				if (val && val[1] in document) {
            					for (i = 0, valLength = val.length; i < valLength; i++) {
            						ret[fnMap[0][i]] = val[i];
            					}
            					return ret;
            				}
            			}
            			return false;
            		})(),

            		screenfull = {
            			request: function (elem) {
            				var request = fn.requestFullscreen;

            				elem = elem || document.documentElement;

            				// Work around Safari 5.1 bug: reports support for
            				// keyboard in fullscreen even though it doesn't.
            				// Browser sniffing, since the alternative with
            				// setTimeout is even worse.
            				if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
            					elem[request]();
            				} else {
            					elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
            				}
            			},
            			exit: function () {
            				document[fn.exitFullscreen]();
            			},
            			toggle: function (elem) {
            				if (this.isFullscreen) {
            					this.exit();
            				} else {
            					this.request(elem);
            				}
            			},
            			onchange: function () {},
            			onerror: function () {},
            			raw: fn
            		};

            	if (!fn) {
            		window.screenfull = false;
            		return;
            	}

            	Object.defineProperties(screenfull, {
            		isFullscreen: {
            			get: function () {
            				return !!document[fn.fullscreenElement];
            			}
            		},
            		element: {
            			enumerable: true,
            			get: function () {
            				return document[fn.fullscreenElement];
            			}
            		},
            		enabled: {
            			enumerable: true,
            			get: function () {
            				// Coerce to boolean in case of old WebKit
            				return !!document[fn.fullscreenEnabled];
            			}
            		}
            	});

            	document.addEventListener(fn.fullscreenchange, function (e) {
            		screenfull.onchange.call(screenfull, e);
            	});

            	document.addEventListener(fn.fullscreenerror, function (e) {
            		screenfull.onerror.call(screenfull, e);
            	});

            	window.screenfull = screenfull;
            })(window, document);

    var readium, 
        embedded,
        url,
        el = document.documentElement,
        currentDocument;

    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL, readerSettings, openPageRequest) {

        readium.openPackageDocument(packageDocumentURL, function(packageDocument, options){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
            });
            SettingsDialog.updateBookLayout(readium.reader, readerSettings);
            var metadata = options.metadata;

            $('<h2 class="book-title-header"></h2>').insertAfter('.navbar').text(metadata.title);

        }, openPageRequest);
    };


    var spin = function()
    {
        if (spinner.willSpin || spinner.isSpinning) return;
        
        spinner.willSpin = true;
        
        setTimeout(function()
        {
            if (spinner.stopRequested)
            {
                spinner.willSpin = false;
                spinner.stopRequested = false;
                return;
            }

            spinner.isSpinning = true;
            spinner.spin($('#reading-area')[0]);
            
            spinner.willSpin = false;
            
        }, 100);
    };

    var tocShowHideToggle = function(){
        var $appContainer = $('#app-container'),
            hide = $appContainer.hasClass('toc-visible');
        var bookmark;
        if (readium.reader.handleViewportResize && !embedded){
            bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
        }
        if (hide){
            $appContainer.removeClass('toc-visible');

            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ $('#tocButt')[0].focus(); }, 100);
        }
        else{
            $appContainer.addClass('toc-visible');

            setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
        }

        if(embedded){
            hideLoop(null, true);
        }else if (readium.reader.handleViewportResize){
            readium.reader.handleViewportResize();
            readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
        }
        
    };

    var loadToc = function(dom){
        $('script', dom).remove();

        var tocNav;

        var $navs = $('nav', dom);
        Array.prototype.every.call($navs, function(nav){
            if (nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') == 'toc'){
                tocNav = nav;
                return false;
            }
            return true;
        });

        
        var toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();
        var tocUrl = currentDocument.getToc();

        if (toc && toc.length)
        {
            if (true) // button wrap, force-enables tab navigation in Safari (links nav is disabled by default on OSX)
            {
                var $toc = $(toc);
                $('a', $toc).each(function(index)
                {
                    $(this).wrap(function()
                    {
                        var $that = $(this);
                        $that.attr("tabindex", "-1");
                        $that.attr("aria-hidden", "true");
                        var href = $that.attr("href");
                        var title = $that.attr("title");
                        var text = $that[0].textContent; //.innerText (CSS display sensitive + script + style tags)
                        var label = text + ((title && title.length) ? " *** " + title : "") + " --- " + href;
                        return "<button tabindex='60' style='border:0;background:none;padding:0;margin:0;' role='link' aria-label='"+label+"' title='"+label+"'></button>";
                    });
                });
            
                //toc = $(toc).html();
                //$('#readium-toc-body').html(toc);
                $('#readium-toc-body').append($toc);

                $('#readium-toc-body').on('click', 'button', function(e)
                {
                    $("a", $(this)).trigger("click");
                    return false;
                });
            }
            else
            {
                $('#readium-toc-body').html(toc);
            }
        }

        var tocLinkActivated = false;
        
        var lastIframe = undefined;
        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem)
        {
            //TODO not picked-up by all screen readers, so for now this short description will suffice
            $iframe.attr("title", "EPUB");
            $iframe.attr("aria-label", "EPUB");
            
            lastIframe = $iframe[0];
        });
        
        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData)
        {
            if (spinner.isSpinning)
            {
                spinner.stop();
                spinner.isSpinning = false;
            }
            else if (spinner.willSpin)
            {
                spinner.stopRequested = true;
            }
            
            if (!tocLinkActivated) return;
            tocLinkActivated = false;
            
try
{
            var iframe = undefined;
            var element = undefined;
            
            var id = pageChangeData.elementId;
            if (!id)
            {
                var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());

                //bookmark.idref; //manifest item
                if (pageChangeData.spineItem)
                {
                    element = readium.reader.getElementByCfi(pageChangeData.spineItem, bookmark.contentCFI,
                        ["cfi-marker", "mo-cfi-highlight"],
                        [],
                        ["MathJax_Message"]);
                    element = element[0];
                    
                    if (element)
                    {
                        iframe = $("#epub-reader-frame iframe")[0];
                        var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                        if (element.ownerDocument !== doc)
                        {
                            iframe = $("#epub-reader-frame iframe")[1];
                            if (iframe)
                            {
                                doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                                if (element.ownerDocument !== doc)
                                {
                                    iframe = undefined;
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                iframe = $("#epub-reader-frame iframe")[0];
                var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                element = doc.getElementById(id);
                if (!element)
                {
                    iframe = $("#epub-reader-frame iframe")[1];
                    if (iframe)
                    {
                        doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                        element = doc.getElementById(id);
                        if (!element)
                        {
                            iframe = undefined;
                        }
                    }
                }
            }

            if (!iframe)
            {
                iframe = lastIframe;
            }
            
            if (iframe)
            {
                //var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                var toFocus = iframe; //doc.body
                setTimeout(function(){ toFocus.focus(); }, 50);
            }
}
catch (e)
{
    //
}
        });

        $('#readium-toc-body').on('click', 'a', function(e)
        {
            spin();
            
            var href = $(this).attr('href');
            href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href; 

            tocLinkActivated = true;
            readium.reader.openContentUrl(href);
            
            if (embedded){
                $('.toc-visible').removeClass('toc-visible');
                $(document.body).removeClass('hide-ui');
            }
            savePlace();

            return false;
        });
        $('#readium-toc-body').prepend('<button tabindex="50" type="button" class="close" data-dismiss="modal" aria-label="'+Strings.i18n_close+' '+Strings.toc+'" title="'+Strings.i18n_close+' '+Strings.toc+'"><span aria-hidden="true">&times;</span></button>');
        $('#readium-toc-body button.close').on('click', function(){
            tocShowHideToggle();
            /*
            var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
            $('#app-container').removeClass('toc-visible');
            if (embedded){
                $(document.body).removeClass('hide-ui');
            }else if (readium.reader.handleViewportResize){
                readium.reader.handleViewportResize();
                readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
            }
            */
            return false;
        })
    }

    var toggleFullScreen = function(){
        
        if (!screenfull.enabled) return;

        screenfull.toggle();
        
        setTimeout(function()
        {
            if (screenfull.isFullscreen)
            {
                $('#buttFullScreenOn').removeAttr("accesskey");
                $('#buttFullScreenOff').attr("accesskey", Dialogs.keyboard.FullScreenToggle);
            }
            else
            {
                $('#buttFullScreenOff').removeAttr("accesskey");
                $('#buttFullScreenOn').attr("accesskey", Dialogs.keyboard.FullScreenToggle);
            }
        },200);
    }

    var hideUI = function(){
        hideTimeoutId = null;
        // don't hide it toolbar while toc open in non-embedded mode
        if (!embedded && $('#app-container').hasClass('toc-visible')){
            return;
        }
        
        var navBar = document.getElementById("app-navbar");
        if (document.activeElement) {
            var within = jQuery.contains(navBar, document.activeElement);
            if (within) return;
        }
        
        var $navBar = $(navBar);
        // BROEKN! $navBar.is(':hover')
        var isMouseOver = $navBar.find(':hover').length > 0;
        if (isMouseOver) return;
        
        if ($('#audioplayer').hasClass('expanded-audio')) return;

        $(document.body).addClass('hide-ui');
    }

    var hideTimeoutId;

    var hideLoop = function(e, immediate){

        // if (!embedded){
        //     return;
        // }
        if (hideTimeoutId){
            window.clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
        if (!$('#app-container').hasClass('toc-visible') && $(document.body).hasClass('hide-ui')){
            $(document.body).removeClass('hide-ui');
        }
        if (immediate){
            hideUI();
        }
        else{
            hideTimeoutId = window.setTimeout(hideUI, 4000000);
        }
    }
    
    var savePlace = function(){
        Settings.put(url, readium.reader.bookmarkCurrentPage(), $.noop);
    }

    var nextPage = function () {
        readium.reader.openPageRight();
        savePlace();
        return false;
    };

    var prevPage = function () {
        readium.reader.openPageLeft();
        savePlace();
        return false;
    };

    var installReaderEventHandlers = function(){
        
        // Set handlers for click events
        $(".icon-annotations").on("click", function () {
            readium.reader.addSelectionHighlight(Math.floor((Math.random()*1000000)), "highlight");
        });

        var isWithinForbiddenNavKeysArea = function()
        {
            return document.activeElement &&
            (
                document.activeElement === document.getElementById('volume-range-slider')
                || document.activeElement === document.getElementById('time-range-slider')
                || document.activeElement === document.getElementById('rate-range-slider')
                || jQuery.contains(document.getElementById("mo-sync-form"), document.activeElement)
                || jQuery.contains(document.getElementById("mo-highlighters"), document.activeElement)
                
                // jQuery.contains(document.getElementById("app-navbar"), document.activeElement)
                // || jQuery.contains(document.getElementById("settings-dialog"), document.activeElement)
                // || jQuery.contains(document.getElementById("about-dialog"), document.activeElement)
            )
            ;
        };

        var hideTB = function(){
            $(document.body).addClass('hide-ui');
            if (document.activeElement) document.activeElement.blur();
        };
        $("#buttHideToolBar").on("click", hideTB);
        Dialogs.keyboard.on(Dialogs.keyboard.ToolbarHide, 'reader', hideTB);

        var showTB = function(){
            $("#aboutButt1")[0].focus();
            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ $("#aboutButt1")[0].focus(); }, 50);
        };
        $("#buttShowToolBar").on("click", showTB);
        Dialogs.keyboard.on(Dialogs.keyboard.ToolbarShow, 'reader', showTB);

        Dialogs.keyboard.on(Dialogs.keyboard.PagePrevious, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) prevPage();
        });
        
        Dialogs.keyboard.on(Dialogs.keyboard.PagePreviousAlt, 'reader', prevPage);
        
        $("#previous-page-btn").unbind("click");
        $("#previous-page-btn").on("click", prevPage);

        Dialogs.keyboard.on(Dialogs.keyboard.PageNextAlt, 'reader', nextPage);
        
        Dialogs.keyboard.on(Dialogs.keyboard.PageNext, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) nextPage();
        });

        $("#next-page-btn").unbind("click");
        $("#next-page-btn").on("click", nextPage);


        Dialogs.keyboard.on(Dialogs.keyboard.FullScreenToggle, 'reader', toggleFullScreen);
        
        $('#buttFullScreenOn').on('click', toggleFullScreen);
        $('#buttFullScreenOff').on('click', toggleFullScreen);

        var loadlibrary = function()
        {
            $(window).trigger('loadlibrary');
        };

        Dialogs.keyboard.on(Dialogs.keyboard.SwitchToLibrary, 'reader', loadlibrary /* function(){setTimeout(, 30);} */ );
        
        $('.icon-library').on('click', function(){
            loadlibrary();
            return false;
        });

        Dialogs.keyboard.on(Dialogs.keyboard.TocShowHideToggle, 'reader', function()
        {
            var visible = $('#app-container').hasClass('toc-visible');
            if (!visible)
            {
                tocShowHideToggle();
            }
            else
            {
                setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
            }
        });
        
        $('.icon-toc').on('click', tocShowHideToggle);

        var setTocSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
            $('#readium-toc-body').height(appHeight);
        };

        Dialogs.keyboard.on(Dialogs.keyboard.ShowSettingsModal, 'reader', function(){$('#settings-dialog').modal("show")});

        $(window).on('mousemove', hideLoop);
        $(window).on('resize', setTocSize);
        setTocSize();
        hideLoop();

        // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
        // so I'm using DOM api directly
        document.addEventListener('click', hideLoop, true);
    };

    var loadReaderUIPrivate = function(){
        $('.modal-backdrop').remove();
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({strings: Strings, dialogs: Dialogs}));
        $appContainer.append(AboutDialog({strings: Strings, dialogs: Dialogs}));
        $('nav').empty();
        $('nav').append(ReaderNavbar({strings: Strings, dialogs: Dialogs}));
        installReaderEventHandlers();
        document.title = "Readium";
        
        spin();
    }
    
    var loadReaderUI = function (data) {
        
        Dialogs.keyboard.scope('reader');
        
        
        url = data.epub;
        Analytics.trackView('/reader');
        embedded = data.embedded;

        if (embedded){
            $(document.body).addClass('embedded');
            currLayoutIsSynthetic = false;
        }
        else{
            currLayoutIsSynthetic = true;
        }
        
        loadReaderUIPrivate();
        
        //because we reinitialize the reader we have to unsubscribe to all events for the previews reader instance
        if(readium && readium.reader) {
            readium.reader.off();
        }
        initReadium(); //async
    };

    var initReadium = function(){

        Settings.getMultiple(['reader', url], function(settings){

            var prefix = (self.location && self.location.origin && self.location.pathname) ? (self.location.origin + self.location.pathname + "/..") : "";
            var readerOptions =  {
                el: "#epub-reader-frame", 
                annotationCSSUrl: module.config().annotationCssUrl || (prefix + "/css/annotations.css"),
                enablePageTransitions: true
            };

            var readiumOptions = {
                jsLibRoot: './lib/thirdparty/',
                openBookOptions: {}
            };

            var openPageRequest;
            if (settings[url]){
                var bookmark = JSON.parse(JSON.parse(settings[url]));
                openPageRequest = {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
            }

            readium = new Readium(readiumOptions, readerOptions);

            window.navigator.epubReadingSystem.name = "epub-js-viewer";
            window.navigator.epubReadingSystem.version = "0.0.1";

            readium.reader.addIFrameEventListener('mousemove', function() {
                hideLoop();
            });
            
            readium.reader.addIFrameEventListener('keydown', function(e) {
                Dialogs.keyboard.dispatch(document.documentElement, e.originalEvent);
            });
            
            readium.reader.addIFrameEventListener('keyup', function(e) {
                Dialogs.keyboard.dispatch(document.documentElement, e.originalEvent);
            });
            
            readium.reader.addIFrameEventListener('focus', function(e) {
                $(window).trigger("focus");
            });

            SettingsDialog.initDialog(readium.reader);

            $('#settings-dialog').on('hidden.bs.modal', function () {

                Dialogs.keyboard.scope('reader');

                $(document.body).removeClass('hide-ui');
                setTimeout(function(){ $("#settbutt1").focus(); }, 50);
    
                $("#buttSave").removeAttr("accesskey");
                $("#buttClose").removeAttr("accesskey");
            });
            $('#settings-dialog').on('shown.bs.modal', function () {

                Dialogs.keyboard.scope('settings');
    
                $("#buttSave").attr("accesskey", Dialogs.keyboard.SettingsModalSave);
                $("#buttClose").attr("accesskey", Dialogs.keyboard.SettingsModalClose);
            });


            $('#about-dialog').on('hidden.bs.modal', function () {
                Dialogs.keyboard.scope('reader');

                $(document.body).removeClass('hide-ui');
                setTimeout(function(){ $("#aboutButt1").focus(); }, 50);
            });
    		$('#about-dialog').on('shown.bs.modal', function(){
                Dialogs.keyboard.scope('about');
    		});
    
            var readerSettings;
            if (settings.reader){
                readerSettings = JSON.parse(settings.reader);
            }
            if (!embedded){
                readerSettings = readerSettings || SettingsDialog.defaultSettings;
                SettingsDialog.updateReader(readium.reader, readerSettings);
                
                Settings.get('reader', function(json)
                {
                    if (!json)
                    {
                        json = {};
                    }
            
                    for (prop in readerSettings)
                    {
                        if (readerSettings.hasOwnProperty(prop))
                        {
                            json[prop] = readerSettings[prop];
                        }
                    }
                    
                    Settings.put('reader', json);
                });
            }
            else{
                readium.reader.updateSettings({
                    isSyntheticSpread: false
                });
            }
            

            var toggleNightTheme = function(){

                if (!embedded){
            
                    Settings.get('reader', function(json)
                    {
                        if (!json)
                        {
                            json = {};
                        }

                        var isNight = json.theme === "night-theme";
                        json.theme = isNight ? "default-theme" : "night-theme";
                        
                        Settings.put('reader', json);

                        SettingsDialog.updateReader(readium.reader, json);
                    });
                }
            };
            $("#buttNightTheme").on("click", toggleNightTheme);
            Dialogs.keyboard.on(Dialogs.keyboard.NightTheme, 'reader', toggleNightTheme);
        

            readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
                // That's after mediaOverlayPlayer.onPageChanged()
                
                if (readium.reader.isMediaOverlayAvailable()) {
                    $('#audioplayer').show();
                }
                
                if (!pageChangeData.spineItem) return;
                
                var smil = readium.reader.package().media_overlay.getSmilBySpineItem(pageChangeData.spineItem);

                var atLeastOneIsEnabled = false;

                var $moSyncWord = $('#mo-sync-word');
                if (!smil || !smil.hasSync("word"))
                {
                    $moSyncWord.attr('disabled', "disabled");
                }
                else
                {
                    atLeastOneIsEnabled = true;
                    $moSyncWord.removeAttr('disabled');
                }
                
                var $moSyncSentence = $('#mo-sync-sentence');
                if (!smil || !smil.hasSync("sentence"))
                {
                    $moSyncSentence.attr('disabled', "disabled");
                }
                else
                {
                    atLeastOneIsEnabled = true;
                    $moSyncSentence.removeAttr('disabled');
                }

                var $moSyncParagraph = $('#mo-sync-paragraph');
                if (!smil || !smil.hasSync("paragraph"))
                {
                    $moSyncParagraph.attr('disabled', "disabled");
                }
                else
                {
                    atLeastOneIsEnabled = true;
                    $moSyncParagraph.removeAttr('disabled');
                }
                
                var $moSyncDefault = $('#mo-sync-default');
                if (!atLeastOneIsEnabled)
                {
                    $moSyncDefault.attr('disabled', "disabled");
                }
                else
                {
                    $moSyncDefault.removeAttr('disabled');
                }
            });
            
            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem) {
                // That's after MO injection.

            });

            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                spin();
            });
            
            loadEbook(url, readerSettings, openPageRequest);
            
            initMediaOverlay();
        });
    }

    var initMediaOverlay = function(){
        
        var $audioPlayer = $('#audioplayer');

        Settings.get('reader', function(json)
        {
            if (!json) return;

            if (json.mediaOverlaysSkipSkippables) // excludes typeof json.mediaOverlaysSkipSkippables === "undefined", so the default is to disable skippability
            {
                $audioPlayer.addClass('skip');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysSkipSkippables: true
                });
            }
            else
            {
                $audioPlayer.removeClass('skip');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysSkipSkippables: false
                });
            }

            if (typeof json.mediaOverlaysEnableClick === "undefined" || json.mediaOverlaysEnableClick) // includes typeof json.mediaOverlaysEnableClick === "undefined", so the default is to enable "touch-to-play"
            {
                $audioPlayer.removeClass('no-touch');
        
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysEnableClick: true
                });
            }
            else
            {
                $audioPlayer.addClass('no-touch');
                
                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysEnableClick: false
                });
            }
        });
        
        var $moSyncDefault = $('#mo-sync-default');
        $moSyncDefault.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: ""
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncWord = $('#mo-sync-word');
        $moSyncWord.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "word"
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncSentence = $('#mo-sync-sentence');
        $moSyncSentence.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "sentence"
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncParagraph = $('#mo-sync-paragraph');
        $moSyncParagraph.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "paragraph"
            });
            
            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        
        
        var $highlighterButts = $('.btn-mo-highlighter');
        $highlighterButts.on("click", function () {
            $highlighterButts.attr("aria-selected", "false");
            $(this).attr("aria-selected", "true");
            
            var index = $(this).attr("data-mohighlight");

            readium.reader.setStyles([
                {
                    selector: ".mo-active-default",
                    declarations: undefined
                }
            ], true);
            
            if (index === "1")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "yellow !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important",
                            "box-shadow": "0px 0px 0.4em #333333 !important"
                        }
                    }
                ], true);
            }
            else if (index === "2")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "black !important",
                            "color": "white !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "3")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "orange !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "4")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "blue !important",
                            "color": "white !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "5")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "magenta !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "6")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "#00FF00 !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
        });



        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysEscape, 'reader', readium.reader.escapeMediaOverlay);
        
        var $escAudioBtn = $("#btn-esc-audio");
        $escAudioBtn.on("click", readium.reader.escapeMediaOverlay);
        
        var $previousAudioBtn = $("#btn-previous-audio");
        var $nextAudioBtn = $("#btn-next-audio");
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysPlayPause, 'reader', readium.reader.toggleMediaOverlay);
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysPlayPauseAlt, 'reader', readium.reader.toggleMediaOverlay);
        
        var $playAudioBtn = $("#btn-play-audio");
        var $pauseAudioBtn = $("#btn-pause-audio");
        
        $playAudioBtn.on("click", function () {
            //readium.reader[$(this).hasClass('pause-audio') ? 'pauseMediaOverlay' : 'playMediaOverlay']();
            //readium.reader.toggleMediaOverlay();
            var wasFocused = document.activeElement === $playAudioBtn[0];
            readium.reader.playMediaOverlay();
            
            $playAudioBtn.removeAttr("accesskey");
            $pauseAudioBtn.attr("accesskey", Dialogs.keyboard.MediaOverlaysPlayPause);
            
            if (wasFocused) setTimeout(function(){ $pauseAudioBtn[0].focus(); }, 50);
        });
        
        $pauseAudioBtn.on("click", function () {
            var wasFocused = document.activeElement === $pauseAudioBtn[0];
            readium.reader.pauseMediaOverlay();
            
            $pauseAudioBtn.removeAttr("accesskey");
            $playAudioBtn.attr("accesskey", Dialogs.keyboard.MediaOverlaysPlayPause);
            
            if (wasFocused) setTimeout(function(){ $playAudioBtn[0].focus(); }, 50);
        });
        
        
        var $expandAudioBtn = $("#btn-expand-audio");
        var $collapseAudioBtn = $("#btn-collapse-audio");

        var updateAudioExpand = function(expand)
        {
            if (expand)
            {
                $audioPlayer.addClass('expanded-audio');
                
                $expandAudioBtn.removeAttr("accesskey");
                $collapseAudioBtn.attr("accesskey", Dialogs.keyboard.MediaOverlaysAdvancedPanelShowHide);
            }
            else
            {
                $audioPlayer.removeClass('expanded-audio');
                
                $collapseAudioBtn.removeAttr("accesskey");
                $expandAudioBtn.attr("accesskey", Dialogs.keyboard.MediaOverlaysAdvancedPanelShowHide);
            }
        };
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysAdvancedPanelShowHide, 'reader', function(){
            var toFocus = undefined;
            if ($audioPlayer.hasClass('expanded-audio'))
            {
                updateAudioExpand(false);
                toFocus = $expandAudioBtn[0];
            }
            else
            {
                updateAudioExpand(true);
                toFocus = $collapseAudioBtn[0];
            }

            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ toFocus.focus(); }, 50);
        });
        
        $expandAudioBtn.on("click", function() {
            var wasFocused = document.activeElement === $expandAudioBtn[0];
            updateAudioExpand(true);
            if (wasFocused) setTimeout(function(){ $collapseAudioBtn[0].focus(); }, 50);
        });
        
        $collapseAudioBtn.on("click", function() {
            var wasFocused = document.activeElement === $collapseAudioBtn[0];
            updateAudioExpand(false);
            if (wasFocused) setTimeout(function(){ $expandAudioBtn[0].focus(); }, 50);
        });

        var $changeTimeControl = $('#time-range-slider');
        
        var debouncedTimeRangeSliderChange = _.debounce(
            function() {
        
                inDebounce = false;
                
                var percent = $changeTimeControl.val();

                var package = readium.reader.package();
                if (!package) return;
                if (!package.media_overlay) return;

                var par = {par: undefined};
                var smilData = {smilData: undefined};
                var milliseconds = {milliseconds: undefined};
        
                package.media_overlay.percentToPosition(percent, smilData, par, milliseconds);
        
                if (!par.par || !par.par.text || !smilData.smilData)
                {
                    return;
                }
        
                var smilSrc = smilData.smilData.href;
        
                var offsetS = milliseconds.milliseconds / 1000.0;
        
                readium.reader.mediaOverlaysOpenContentUrl(par.par.text.src, smilSrc, offsetS);
            }
        , 800);
        
        var updateSliderLabels = function($slider, val, txt)
        {
            $slider.attr("aria-valuenow", val+"");
            $slider.attr("aria-value-now", val+"");
            
            $slider.attr("aria-valuetext", txt+"");
            $slider.attr("aria-value-text", txt+"");
        };
        
        $changeTimeControl.on("change",
        function() {
            
            var percent = $changeTimeControl.val();
            percent = Math.round(percent);
            
            $changeTimeControl.attr("data-value", percent);
            updateSliderLabels($changeTimeControl, percent, percent + "%");
            
            if (readium.reader.isPlayingMediaOverlay())
            {
                readium.reader.pauseMediaOverlay();
            }
            debouncedTimeRangeSliderChange();
        }
        );
        
        readium.reader.on(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value) {

            //var $audioPlayerControls = $('#audioplayer button, #audioplayer input:not(.mo-sync)');

            var percent = 0;

            var isPlaying = 'isPlaying' in value
                ? value.isPlaying   // for all the other events
                : true;             // for events raised by positionChanged, as `isPlaying` flag isn't even set

            var wasFocused = document.activeElement === $playAudioBtn[0] || document.activeElement === $pauseAudioBtn[0];

            if (isPlaying)
            {
                $playAudioBtn.removeAttr("accesskey");
                $pauseAudioBtn.attr("accesskey", Dialogs.keyboard.MediaOverlaysPlayPause);
            }
            else
            {
                $pauseAudioBtn.removeAttr("accesskey");
                $playAudioBtn.attr("accesskey", Dialogs.keyboard.MediaOverlaysPlayPause);
            }

            $audioPlayer.toggleClass('isPlaying', isPlaying);

            if (wasFocused) setTimeout(function(){ (isPlaying ? $pauseAudioBtn[0] : $playAudioBtn[0]).focus(); }, 50);
            
            percent = -1; // to prevent flickering slider position (pause callback is raised between each audio phrase!)

            // if (readium.reader.isMediaOverlayAvailable()) {
            //     $audioPlayer.show();
            //     //$audioPlayerControls.attr('disabled', false);
            //     
            // } else {
            //     //$audioPlayerControls.attr('disabled', true);
            // }

            if ((typeof value.playPosition !== "undefined") && (typeof value.smilIndex !== "undefined") && (typeof value.parIndex !== "undefined"))
            {
                var package = readium.reader.package();
                
                var playPositionMS = value.playPosition * 1000;
                percent = package.media_overlay.positionToPercent(value.smilIndex, value.parIndex, playPositionMS);

                if (percent < 0)
                {
                    percent = 0;
                }
            }

            if (percent >= 0)
            {
                $changeTimeControl.val(percent);
                percent = Math.round(percent);
                $changeTimeControl.attr("data-value", percent);
                updateSliderLabels($changeTimeControl, percent, percent + "%");
            }
        });

        var $buttonSkipDisable = $('#btn-skip-audio-disable');
        var $buttonSkipEnable = $('#btn-skip-audio-enable');
        
        $buttonSkipDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttonSkipDisable[0];
            
            $audioPlayer.removeClass('skip');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysSkipSkippables = false;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonSkipEnable[0].focus(); }, 50);
        });

        $buttonSkipEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonSkipEnable[0];
            
            $audioPlayer.addClass('skip');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: true
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysSkipSkippables = true;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonSkipDisable[0].focus(); }, 50);
        });
        
        var $buttonTouchEnable = $('#btn-touch-audio-enable');
        var $buttonTouchDisable = $('#btn-touch-audio-disable');
        
        $buttonTouchEnable.on("click", function() {
            
            var wasFocused = document.activeElement === $buttonTouchEnable[0];
            
            $audioPlayer.removeClass('no-touch');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: true
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysEnableClick = true;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonTouchDisable[0].focus(); }, 50);
        });
        
        $buttonTouchDisable.on("click", function() {
            
            var wasFocused = document.activeElement === $buttonTouchDisable[0];
            
            $audioPlayer.addClass('no-touch');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: false
            });
            
            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }
                
                json.mediaOverlaysEnableClick = false;
                Settings.put('reader', json);
            });
            
            if (wasFocused) setTimeout(function(){ $buttonTouchEnable[0].focus(); }, 50);
        });
        
        var $changeRateControl = $('#rate-range-slider');
        var $changeRateControl_label = $('#rate-range-slider-label');
        
        var changeRate = function(minus)
        {
            var rateMin = parseFloat($changeRateControl.attr("min"));
            var rateMax = parseFloat($changeRateControl.attr("max"));
            var rateStep = parseFloat($changeRateControl.attr("step"));
            var rateVal = parseFloat($changeRateControl.val());

            rateVal += (minus ? (-rateStep) : rateStep);

            if (rateVal > rateMax) rateVal = rateMax;
            if (rateVal < rateMin) rateVal = rateMin;
            
            var txt = ((rateVal === 0 ? "~0" : ""+rateVal) + "x");
            
            updateSliderLabels($changeRateControl, rateVal, txt);
            
            $changeRateControl_label[0].textContent = txt;
            
            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });
            
            $changeRateControl.val(""+rateVal);
        };
        
        $("#buttRatePlus").on("click", function(){
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysRateIncrease, 'reader', function(){        
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        
        $("#buttRateMinus").on("click", function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysRateDecrease, 'reader', function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysRateIncreaseAlt, 'reader', function(){        
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysRateDecreaseAlt, 'reader', function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        
        $changeRateControl.on("change", function() {
            var rateVal = $(this).val();
            var txt = ((rateVal === '0' ? "~0" : rateVal) + "x");
            
            updateSliderLabels($(this), rateVal, txt);

            $changeRateControl_label[0].textContent = txt;
            
            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });
        });
        
        var resetRate = function() {
            $changeRateControl.val(1);

            updateSliderLabels($changeRateControl, "1", "1x");

            $changeRateControl_label[0].textContent = "1x";
            
            //readium.reader.setRateMediaOverlay(1);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: 1
            });
        };

        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysRateReset, 'reader', resetRate);
        
        var $rateButton = $('#btn-audio-rate');
        $rateButton.on("click", resetRate);
        
        var $changeVolumeControl = $('#volume-range-slider');
        
        var changeVolume = function(minus)
        {
            var volumeVal = parseInt($changeVolumeControl.val());

            volumeVal += (minus ? (-20) : 20);

            if (volumeVal < 0) volumeVal = 0;
            if (volumeVal > 100) volumeVal = 100;

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            $changeVolumeControl.val(""+volumeVal);

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");
            
            if (volumeVal === 0) {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        };
        
        $("#buttVolumePlus").on("click", function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysVolumeIncrease, 'reader', function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        
        $("#buttVolumeMinus").on("click", function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysVolumeDecrease, 'reader', function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysVolumeIncreaseAlt, 'reader', function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysVolumeDecreaseAlt, 'reader', function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        
        $changeVolumeControl.on("change", function() {
            var volumeVal = $(this).val();

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");
            
            if (volumeVal === '0') {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        });
                
        $volumeButtonMute = $('#btn-audio-volume-mute');
        $volumeButtonUnMute = $('#btn-audio-volume-unmute');
        
        var _lastVolumeBeforeMute = '0';
        
        var muteVolume = function(){

            _lastVolumeBeforeMute = $changeVolumeControl.val();

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: 0
            });
            
            $changeVolumeControl.val(0);

            updateSliderLabels($changeVolumeControl, 0, 0 + "%");
            
            $volumeButtonMute.removeAttr("accesskey");
            $volumeButtonUnMute.attr("accesskey", Dialogs.keyboard.MediaOverlaysVolumeMuteToggle);
            
            $audioPlayer.addClass('no-volume');
        };
        
        var unMuteVolume = function(){

            //var currentVolume = $changeVolumeControl.val();
            var volumeVal = _lastVolumeBeforeMute === '0' ? '100' : _lastVolumeBeforeMute;

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            $changeVolumeControl.val(volumeVal);

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");
            
            $volumeButtonUnMute.removeAttr("accesskey");
            $volumeButtonMute.attr("accesskey", Dialogs.keyboard.MediaOverlaysVolumeMuteToggle);

            $audioPlayer.removeClass('no-volume');
        };

        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysVolumeMuteToggle, 'reader', function(){
            ($audioPlayer.hasClass('no-volume') ? unMuteVolume : muteVolume)();
        });
        
        $volumeButtonMute.on("click", function() {
            
            var wasFocused = document.activeElement === $volumeButtonMute[0];
                
            muteVolume();
                
            if (wasFocused) setTimeout(function(){ $volumeButtonUnMute[0].focus(); }, 50);
        });
        
        $volumeButtonUnMute.on("click", function() {
            
            var wasFocused = document.activeElement === $volumeButtonUnMute[0];
            
            unMuteVolume();
            
            if (wasFocused) setTimeout(function(){ $volumeButtonMute[0].focus(); }, 50);
        });
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysPrevious, 'reader', readium.reader.previousMediaOverlay);
        
        $previousAudioBtn.on("click", readium.reader.previousMediaOverlay);
        
        Dialogs.keyboard.on(Dialogs.keyboard.MediaOverlaysNext, 'reader', readium.reader.nextMediaOverlay);
        
        $nextAudioBtn.on("click", readium.reader.nextMediaOverlay);

        readium.reader.on("annotationClicked", function(type, idref, cfi, id) {
            readium.reader.removeHighlight(id);
        });
    }

    var unloadReaderUI = function(){

        Dialogs.keyboard.off('reader');
        Dialogs.keyboard.off('settings');

        $('#settings-dialog').off('hidden.bs.modal');
        $('#settings-dialog').off('shown.bs.modal');

        $('#about-dialog').off('hidden.bs.modal');
        $('#about-dialog').off('shown.bs.modal');

        // visibility check fails because iframe is unloaded
        //if (readium.reader.isMediaOverlayAvailable())
        if (readium.reader) // window.popstate woes
            readium.reader.pauseMediaOverlay();
        
        $(window).off('resize');
        $(window).off('mousemove');
        $(window).off('keyup');
        $(window).off('message');
        window.clearTimeout(hideTimeoutId);
        $(document.body).removeClass('embedded');
        document.removeEventListener('click', hideLoop, true);
        $('.book-title-header').remove();

        $(document.body).removeClass('hide-ui');
    }

    return {
        loadUI : loadReaderUI,
        unloadUI : unloadReaderUI
    };
    
});
