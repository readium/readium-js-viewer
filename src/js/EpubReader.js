define([
"readium_shared_js/globalsSetup",
 "readium_shared_js/globals",
'./ModuleConfig',
'jquery',
'bootstrap',
'bootstrapA11y',
'URIjs',
'./Spinner',
'Settings',
'i18nStrings',
'./Dialogs',
'./ReaderSettingsDialog',
'hgn!readium_js_viewer_html_templates/about-dialog.html',
'hgn!readium_js_viewer_html_templates/reader-navbar.html',
'hgn!readium_js_viewer_html_templates/reader-body.html',
'hgn!readium_js_viewer_html_templates/reader-body-page-btns.html',
'Analytics',
'screenfull',
'./Keyboard',
'./EpubReaderMediaOverlays',
'./EpubReaderBackgroundAudioTrack',
'./gestures',
'./versioning/ReadiumVersioning',
'readium_js/Readium',
'readium_shared_js/helpers',
'readium_shared_js/models/bookmark_data'],

function (
globalSetup,
Globals,
moduleConfig,
$,
bootstrap,
bootstrapA11y,
URI,
spinner,
Settings,
Strings,
Dialogs,
SettingsDialog,
AboutDialog,
ReaderNavbar,
ReaderBody,
ReaderBodyPageButtons,
Analytics,
screenfull,
Keyboard,
EpubReaderMediaOverlays,
EpubReaderBackgroundAudioTrack,
GesturesHandler,
Versioning,
Readium,
Helpers,
BookmarkData){

    // initialised in initReadium()
    var readium = undefined;

    // initialised in loadReaderUI(), with passed data.embedded
    var embedded = undefined;
    
    // initialised in loadReaderUI(), with passed data.epub
    var ebookURL = undefined;
    var ebookURL_filepath = undefined;
    
    // initialised in loadEbook() >> readium.openPackageDocument()
    var currentPackageDocument = undefined;
    
    // initialised in initReadium()
    // (variable not actually used anywhere here, but top-level to indicate that its lifespan is that of the reader object (not to be garbage-collected))
    var gesturesHandler = undefined;
    
    
    // TODO: is this variable actually used anywhere here??
    // (bad naming convention, hard to find usages of "el")
    var el = document.documentElement;

    var tooltipSelector = function() {
        return 'nav *[title], #readium-page-btns *[title]';
    };
   
    var ensureUrlIsRelativeToApp = function(ebookURL) {

        if (!ebookURL) {
            return ebookURL;
        }
        
        if (ebookURL.indexOf("http") != 0) {
            return ebookURL;
        }
            
        var isHTTPS = (ebookURL.indexOf("https") == 0);
    
        var CORS_PROXY_HTTP_TOKEN = "/http://";
        var CORS_PROXY_HTTPS_TOKEN = "/https://";
        
        // Ensures URLs like http://crossorigin.me/http://domain.com/etc
        // do not end-up loosing the double forward slash in http://domain.com
        // (because of URI.absoluteTo() path normalisation)
        var CORS_PROXY_HTTP_TOKEN_ESCAPED = "/http%3A%2F%2F";
        var CORS_PROXY_HTTPS_TOKEN_ESCAPED = "/https%3A%2F%2F";
        
        // case-insensitive regexp for percent-escapes
        var regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED = new RegExp("/(http[s]?)%3A%2F%2F", "gi");
        
        var appUrl =
        window.location ? (
            window.location.protocol
            + "//"
            + window.location.hostname
            + (window.location.port ? (':' + window.location.port) : '')
            + window.location.pathname
        ) : undefined;
        
        if (appUrl) {
            console.log("EPUB URL absolute: " + ebookURL);
            console.log("App URL: " + appUrl);
            
            ebookURL = ebookURL.replace(CORS_PROXY_HTTP_TOKEN, CORS_PROXY_HTTP_TOKEN_ESCAPED);
            ebookURL = ebookURL.replace(CORS_PROXY_HTTPS_TOKEN, CORS_PROXY_HTTPS_TOKEN_ESCAPED);
            
            ebookURL = new URI(ebookURL).relativeTo(appUrl).toString();
            if (ebookURL.indexOf("//") == 0) { // URI.relativeTo() sometimes returns "//domain.com/path" without the protocol
                ebookURL = (isHTTPS ? "https:" : "http:") + ebookURL;
            }
            
            ebookURL = ebookURL.replace(regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED, "/$1://");
            
            console.log("EPUB URL relative to app: " + ebookURL);
        }
        
        return ebookURL;
    };

    function setBookTitle(title) {
    
        var $titleEl = $('.book-title-header');
        if ($titleEl.length) {
            $titleEl.text(title);
        } else {
            $('<h2 class="book-title-header"></h2>').insertAfter('.navbar').text(title);
        }
    };

    var _debugBookmarkData_goto = undefined;
    var debugBookmarkData = function(cfi) {
                
        if (!readium) return;
        readium.reader.debugBookmarkData(cfi);
    };
    
    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (readerSettings, openPageRequest) {

        readium.openPackageDocument(
            
            ebookURL,
            
            function(packageDocument, options){
                
                if (!packageDocument) {
                    
                    console.error("ERROR OPENING EBOOK: " + ebookURL_filepath);
                    
                    spin(false);
                    setBookTitle(ebookURL_filepath);
                            
                    Dialogs.showErrorWithDetails(Strings.err_epub_corrupt, ebookURL_filepath);
                    //Dialogs.showModalMessage(Strings.err_dlg_title, ebookURL_filepath);
                            
                    return;
                }
                
                currentPackageDocument = packageDocument;
                currentPackageDocument.generateTocListDOM(function(dom){
                    loadToc(dom)
                });
    
                wasFixed = readium.reader.isCurrentViewFixedLayout();
                var metadata = options.metadata;
    
                setBookTitle(metadata.title);

                $("#left-page-btn").unbind("click");
                $("#right-page-btn").unbind("click");
                var $pageBtnsContainer = $('#readium-page-btns');
                $pageBtnsContainer.empty();
                var rtl = currentPackageDocument.getPageProgressionDirection() === "rtl"; //_package.spine.isLeftToRight()
                $pageBtnsContainer.append(ReaderBodyPageButtons({strings: Strings, dialogs: Dialogs, keyboard: Keyboard,
                    pageProgressionDirectionIsRTL: rtl
                }));
                $("#left-page-btn").on("click", prevPage);
                $("#right-page-btn").on("click", nextPage);
                $("#left-page-btn").mouseleave(function() {
                  $(tooltipSelector()).tooltip('destroy');
                });
                $("#right-page-btn").mouseleave(function() {
                  $(tooltipSelector()).tooltip('destroy');
                });
            },
            openPageRequest
        );
    };

    var spin = function(on)
    {
        if (on) {
    //console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
            if (spinner.willSpin || spinner.isSpinning) return;
    
            spinner.willSpin = true;
    
            setTimeout(function()
            {
                if (spinner.stopRequested)
                {
    //console.debug("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                    spinner.willSpin = false;
                    spinner.stopRequested = false;
                    return;
                }
    //console.debug("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.isSpinning = true;
                spinner.spin($('#reading-area')[0]);
    
                spinner.willSpin = false;
    
            }, 100);
        } else {
            
            if (spinner.isSpinning)
            {
//console.debug("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stop();
                spinner.isSpinning = false;
            }
            else if (spinner.willSpin)
            {
//console.debug("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stopRequested = true;
            }
        }
    };

    var tocShowHideToggle = function(){

        unhideUI();

        var $appContainer = $('#app-container'),
            hide = $appContainer.hasClass('toc-visible');
        var bookmark;
        if (readium.reader.handleViewportResize && !embedded){
            bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
        }

        if (hide){
            $appContainer.removeClass('toc-visible');

            // clear tabindex off of any previously focused ToC item
            var existsFocusable = $('#readium-toc-body a[tabindex="60"]');
            if (existsFocusable.length > 0){
              existsFocusable[0].setAttribute("tabindex", "-1");
            }
            /* end of clear focusable tab item */
            setTimeout(function(){ $('#tocButt')[0].focus(); }, 100);
        }
        else{
            $appContainer.addClass('toc-visible');

            setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
        }

        if(embedded){
            hideLoop(null, true);
        }else if (readium.reader.handleViewportResize){

            readium.reader.handleViewportResize(bookmark);

            // setTimeout(function()
            // {
            //     readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
            // }, 90);
        }
    };

    var showScaleDisplay = function(){
        $('.zoom-wrapper').show();
    }
    var setScaleDisplay = function(){
        var scale = readium.reader.getViewScale();
        $('.zoom-wrapper input').val(Math.round(scale) + "%");
    }

    var hideScaleDisplay = function(){
        $('.zoom-wrapper').hide();
    }

    var loadToc = function(dom){

        if (dom) {
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

            var isRTL = false;
            var pparent = tocNav;

            while (pparent && pparent.getAttributeNS)
            {
                var dir = pparent.getAttributeNS("http://www.w3.org/1999/xhtml", "dir") || pparent.getAttribute("dir");

                if (dir && dir === "rtl")
                {
                    isRTL = true;
                    break;
                }
                pparent = pparent.parentNode;
            }

            var toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();
            var tocUrl = currentPackageDocument.getToc();

            if (toc && toc.length)
            {
                var $toc = $(toc);

                // "iframe" elements need to be stripped out, because of potential vulnerability when loading malicious EPUBs
                // e.g. src="javascript:doHorribleThings(window.top)"
                // Note that "embed" and "object" elements with AllowScriptAccess="always" do not need to be removed,
                // because unlike "iframe" the @src URI does not trigger the execution of the "javascript:" statement,
                // and because the "data:" base64 encoding of an image/svg that contains ecmascript
                // automatically results in origin/domain restrictions (thereby preventing access to window.top / window.parent).
                // Also note that "script" elements are discarded automatically by jQuery.
                $('iframe', $toc).remove();

                $('#readium-toc-body').append($toc);

                if (isRTL)
                {
                    $toc[0].setAttributeNS("http://www.w3.org/1999/xhtml", "dir", "rtl");
                    $toc[0].style.direction = "rtl"; // The CSS stylesheet property does not trigger :(
                }

                // remove default focus from anchor elements in TOC after added to #readium-toc-body
                var $items = $('#readium-toc-body li >a');
                $items.each(function(){
                  $(this).attr("tabindex", "-1");
                   $(this).on("focus", function(event){
                    //console.log("toc item focus: " + event.target);
                    // remove tabindex from previously focused
                    var $prevFocus = $('#readium-toc-body a[tabindex="60"]');
                    if ($prevFocus.length>0 && $prevFocus[0] !== event.target){
                      //console.log("previous focus: " + $prevFocus[0]);
                      $prevFocus.attr("tabindex","-1");
                    }
                    // add to newly focused
                    event.target.setAttribute("tabindex", "60");
                  });
                });

            }

        } else {
            var tocUrl = currentPackageDocument.getToc();

            $('#readium-toc-body').append("?? " + tocUrl);
        }

        var _tocLinkActivated = false;

        var lastIframe = undefined,
            wasFixed;

        readium.reader.on(ReadiumSDK.Events.FXL_VIEW_RESIZED, function() {
            Globals.logEvent("FXL_VIEW_RESIZED", "ON", "EpubReader.js");
            setScaleDisplay();
        });
        
        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem)
        {
            Globals.logEvent("CONTENT_DOCUMENT_LOADED", "ON", "EpubReader.js [ " + spineItem.href + " ]");
            
            var isFixed = readium.reader.isCurrentViewFixedLayout();

            // TODO: fix the pan-zoom feature!
            if (isFixed){
                showScaleDisplay();
            }
            else{
                hideScaleDisplay();
            }

            //TODO not picked-up by all screen readers, so for now this short description will suffice
            $iframe.attr("title", "EPUB");
            $iframe.attr("aria-label", "EPUB");

            lastIframe = $iframe[0];
        });

        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData)
        {
            Globals.logEvent("PAGINATION_CHANGED", "ON", "EpubReader.js");

            if (_debugBookmarkData_goto) {
                
                debugBookmarkData(_debugBookmarkData_goto);
                _debugBookmarkData_goto = undefined;
            }
            
            savePlace();
            updateUI(pageChangeData);

            spin(false);

            if (!_tocLinkActivated) return;
            _tocLinkActivated = false;

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
                        element = readium.reader.getElementByCfi(pageChangeData.spineItem.idref, bookmark.contentCFI,
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


/* Remove because is removing focus from the toc
                if (iframe)
                {
                    //var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    var toFocus = iframe; //doc.body
                    setTimeout(function(){ toFocus.focus(); }, 50);
                }
*/
            }
            catch (e)
            {
                //
            }
        });

        $('#readium-toc-body').on('click', 'a', function(e)
        {
            try {
                spin(true);
    
                var href = $(this).attr('href');
                //href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href;
    
                _tocLinkActivated = true;
    
                readium.reader.openContentUrl(href, tocUrl, undefined);
    
                if (embedded) {
                    $('.toc-visible').removeClass('toc-visible');
                    unhideUI();
                }
            } catch (err) {
                
                console.error(err);
                
            } finally {
                //e.preventDefault();
                //e.stopPropagation();
                return false;
            }
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
//        var KEY_ENTER = 0x0D;
//        var KEY_SPACE = 0x20;
        var KEY_END = 0x23;
        var KEY_HOME = 0x24;
//        var KEY_LEFT = 0x25;
        var KEY_UP = 0x26;
//        var KEY_RIGHT = 0x27;
        var KEY_DOWN = 0x28;

        $('#readium-toc-body').keydown( function(event){
            var next = null;
            var blurNode = event.target;
            switch (event.which) {
              case KEY_HOME:
                  //find first li >a
                  next = $('#readium-toc-body li >a')[0];
              break;

              case KEY_END:
              // find last a within toc
                next = $('#readium-toc-body a').last()[0];
              break;

              case KEY_DOWN:
                if (blurNode.tagName == "BUTTON") {
                    var existsFocusable = $('#readium-toc-body a[tabindex="60"]');
                    if (existsFocusable.length > 0) {
                      next = existsFocusable[0];
                    } else {
                      // go to first entry
                      next = $('#readium-toc-body li >a')[0];
                    }
                } else {
                  // find all the a elements, find previous focus (tabindex=60) then get next
                  var $items = $('#readium-toc-body a');
                  var index = $('a[tabindex="60"]').index('#readium-toc-body a');
                  //var index = $('a[tabindex="60"]').index($items); // not sure why this won't work?
                  if (index > -1 && index < $items.length-1) {
                    next = $items.get(index+1);
                  } 
                }
              break;

              case KEY_UP:
                // find all the a elements, find previous focus (tabindex=60) then get previous
                var $items = $('#readium-toc-body a');
                var index = $('a[tabindex="60"]').index('#readium-toc-body a');
                if (index > -1 && index > 0 ) {
                  next = $items.get(index-1);
                } 
              break;

              default:
                return;
            }
            if (next) {
              event.preventDefault();
              setTimeout(next.focus(), 5);
            }
          return;
      }); // end of onkeyup
    } // end of loadToc

    var toggleFullScreen = function(){

        if (!screenfull.enabled) return;

        screenfull.toggle();
    }

    var isChromeExtensionPackagedApp = (typeof chrome !== "undefined") && chrome.app
              && chrome.app.window && chrome.app.window.current; // a bit redundant?

    if (isChromeExtensionPackagedApp) {
        screenfull.onchange = function(e) {
            if (chrome.app.window.current().isFullscreen()) {
                chrome.app.window.current().restore();
            }
        };
    }
    var oldOnChange = screenfull.onchange;
    screenfull.onchange = function(e){
        var titleText;

        if (screenfull.isFullscreen)
        {
            titleText = Strings.exit_fullscreen+ ' [' + Keyboard.FullScreenToggle + ']';
            $('#buttFullScreenToggle span').removeClass('glyphicon-resize-full');
            $('#buttFullScreenToggle span').addClass('glyphicon-resize-small');
            $('#buttFullScreenToggle').attr('aria-label', titleText);
            $('#buttFullScreenToggle').attr('title', titleText);
        }
        else
        {
            titleText = Strings.enter_fullscreen + ' [' + Keyboard.FullScreenToggle + ']';
            $('#buttFullScreenToggle span').removeClass('glyphicon-resize-small');
            $('#buttFullScreenToggle span').addClass('glyphicon-resize-full');
            $('#buttFullScreenToggle').attr('aria-label', titleText);
            $('#buttFullScreenToggle').attr('title', titleText);
        }
        oldOnChange.call(this, e);
    }
    var unhideUI = function(){
        hideLoop();
    }

    var hideUI = function(){
        hideTimeoutId = null;
        // don't hide it toolbar while toc open in non-embedded mode
        if (!embedded && $('#app-container').hasClass('toc-visible')){
            hideLoop()
            return;
        }

        var navBar = document.getElementById("app-navbar");
        if (document.activeElement) {
            var within = jQuery.contains(navBar, document.activeElement);
            if (within){
                hideLoop();
                return;
            } 
        }

        var $navBar = $(navBar);
        // BROEKN! $navBar.is(':hover')
        var isMouseOver = $navBar.find(':hover').length > 0;
        if (isMouseOver){
            hideLoop()
            return;  
        } 

        if ($('#audioplayer').hasClass('expanded-audio')){
            hideLoop();
            return;  
        } 

        $(tooltipSelector()).tooltip('destroy');

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
            hideTimeoutId = window.setTimeout(hideUI, 8000);
        }
    }

    //TODO: also update "previous/next page" commands status (disabled/enabled), not just button visibility.
    // https://github.com/readium/readium-js-viewer/issues/188
    // See onSwipeLeft() onSwipeRight() in gesturesHandler.
    // See nextPage() prevPage() in this class.
    var updateUI = function(pageChangeData){
        if(pageChangeData.paginationInfo.canGoLeft())
            $("#left-page-btn").show();
        else
            $("#left-page-btn").hide();
        if(pageChangeData.paginationInfo.canGoRight())
            $("#right-page-btn").show();
        else
            $("#right-page-btn").hide();
    }

    var savePlace = function(){

        var urlParams = Helpers.getURLQueryParams();
        var ebookURL = urlParams['epub'];
        if (!ebookURL) return;

        var bookmark = readium.reader.bookmarkCurrentPage();

        // Note: automatically JSON.stringify's the passed value!
        // ... and bookmarkCurrentPage() is already JSON.toString'ed, so that's twice!
        Settings.put(ebookURL_filepath, bookmark, $.noop);

        if (!isChromeExtensionPackagedApp // History API is disabled in packaged apps
              && window.history && window.history.replaceState) {

            bookmark = JSON.parse(bookmark);

            bookmark.elementCfi = bookmark.contentCFI;
            bookmark.contentCFI = undefined;
            bookmark = JSON.stringify(bookmark);

            ebookURL = ensureUrlIsRelativeToApp(ebookURL);

            var url = Helpers.buildUrlQueryParameters(undefined, {
                epub: ebookURL,
                epubs: " ",
                embedded: " ",
                goto: bookmark
            });

            history.replaceState(
                {epub: ebookURL, epubs: undefined},
                "Readium Viewer",
                url
            );
        }
    };

    var nextPage = function () {

        readium.reader.openPageRight();
        return false;
    };

    var prevPage = function () {

        readium.reader.openPageLeft();
        return false;
    };

    var installReaderEventHandlers = function(){

        if (isChromeExtensionPackagedApp) {
            $('.icon-shareUrl').css("display", "none");
        } else {
            $(".icon-shareUrl").on("click", function () {
                
                var urlParams = Helpers.getURLQueryParams();
                var ebookURL = urlParams['epub'];
                if (!ebookURL) return;
                
                var bookmark = readium.reader.bookmarkCurrentPage();
                bookmark = JSON.parse(bookmark);
                
                var bookmarkData = new BookmarkData(bookmark.idref, bookmark.contentCFI);
                debugBookmarkData(bookmarkData);

                // TODO: remove dependency on highlighter plugin (selection DOM range convert to BookmarkData)
                if (readium.reader.plugins.highlights) {
                    var tempId = Math.floor((Math.random()*1000000));
                    //BookmarkData
                    var bookmarkDataSelection = readium.reader.plugins.highlights.addSelectionHighlight(tempId, "temp-highlight");
                    if (bookmarkDataSelection) {
                        setTimeout(function(){
                            readium.reader.plugins.highlights.removeHighlight(tempId);
                        }, 500);

                        console.log("Selection shared bookmark:");
                        debugBookmarkData(bookmarkDataSelection);
                        bookmark.contentCFI = bookmarkDataSelection.contentCFI;
                    }
                }

                bookmark.elementCfi = bookmark.contentCFI;
                bookmark.contentCFI = undefined;
                bookmark = JSON.stringify(bookmark);
                
                ebookURL = ensureUrlIsRelativeToApp(ebookURL);

                var url = Helpers.buildUrlQueryParameters(undefined, {
                    epub: ebookURL,
                    epubs: " ",
                    embedded: " ",
                    goto: bookmark
                });

                var injectCoverImageURI = function(uri) {
                    var style = 'margin-top: 1em; margin-bottom: 0.5em; height:400px; width:100%; background-repeat: no-repeat; background-size: contain; background-position: center; background-attachment: scroll; background-clip: content-box; background-origin: content-box; box-sizing: border-box; background-image: url('+uri+');';

                    var $div = $("#readium_book_cover_image");
                    if ($div && $div[0]) {
                        $div.attr("style", style);
                    }

                    return style;
                };

                var ebookCoverImageURL = undefined;
                try {
                    var fetcher = readium.getCurrentPublicationFetcher();

                    var coverHref = currentPackageDocument.getMetadata().cover_href;
                    if (coverHref) {
                        var coverPath = fetcher.convertPathRelativeToPackageToRelativeToBase(coverHref);
                        var relPath = "/" + coverPath; //  "/META-INF/container.xml"

                        if (fetcher.shouldConstructDomProgrammatically()) {

                            fetcher.relativeToPackageFetchFileContents(relPath, 'blob', function (res) {
                                if(res) {
                                    try {
                                        var blobURI = window.URL.createObjectURL(res);
                                        injectCoverImageURI(blobURI);
                                    } catch (err) {
                                        // ignore
                                        console.error(err);
                                    }
                                }
                            }, function (err) {
                                // ignore
                                console.error(err);
                            });
                        } else {
                            ebookCoverImageURL = fetcher.getEbookURL_FilePath() + relPath;
                        }
                    }
                } catch(err) {
                    // ignore
                    console.error(err);
                }
                
                var styleAttr = "";
                if (ebookCoverImageURL) {
                    styleAttr = ' style="' + injectCoverImageURI(ebookCoverImageURL) + '" ';
                }

                //showModalMessage
                //showErrorWithDetails
                Dialogs.showModalMessageEx(Strings.share_url, $('<p id="share-url-dialog-input-label">'+Strings.share_url_label+'</p><input id="share-url-dialog-input-id" aria-labelledby="share-url-dialog-input-label" type="text" value="'+url+'" readonly="readonly" style="width:100%" /><div id="readium_book_cover_image" '+styleAttr+'> </div>'));
                
                setTimeout(function(){
                    $('#share-url-dialog-input-id').focus().select();
                }, 500);
            });
        }

        // Set handlers for click events
        $(".icon-annotations").on("click", function () {
            readium.reader.plugins.highlights.addSelectionHighlight(Math.floor((Math.random()*1000000)), "test-highlight");
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
            if (!embedded && $('#app-container').hasClass('toc-visible')){
                return;
            }
            hideUI();
            if (document.activeElement) document.activeElement.blur();
        };
        $("#buttHideToolBar").on("click", hideTB);
        Keyboard.on(Keyboard.ToolbarHide, 'reader', hideTB);

        var showTB = function(){
            $("#aboutButt1")[0].focus();
            unhideUI();
            setTimeout(function(){ $("#aboutButt1")[0].focus(); }, 50);
        };
        $("#buttShowToolBar").on("click", showTB);
        Keyboard.on(Keyboard.ToolbarShow, 'reader', showTB);

        Keyboard.on(Keyboard.PagePrevious, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) prevPage();
        });

        Keyboard.on(Keyboard.PagePreviousAlt, 'reader', prevPage);

        Keyboard.on(Keyboard.PageNextAlt, 'reader', nextPage);

        Keyboard.on(Keyboard.PageNext, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) nextPage();
        });

        Keyboard.on(Keyboard.FullScreenToggle, 'reader', toggleFullScreen);

        $('#buttFullScreenToggle').on('click', toggleFullScreen);

        var loadlibrary = function()
        {
            $("html").attr("data-theme", "library");
            
            var urlParams = Helpers.getURLQueryParams();
            //var ebookURL = urlParams['epub'];
            var libraryURL = urlParams['epubs'];
            
            $(window).triggerHandler('loadlibrary', libraryURL);
            //$(window).trigger('loadlibrary');
        };

        Keyboard.on(Keyboard.SwitchToLibrary, 'reader', loadlibrary /* function(){setTimeout(, 30);} */ );

        $('.icon-library').on('click', function(){
            loadlibrary();
            return false;
        });

        $('.zoom-wrapper input').on('click', function(){
            if (!this.disabled){
                this.focus();
                return false;
            }
        });

        Keyboard.on(Keyboard.TocShowHideToggle, 'reader', function()
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

        Keyboard.on(Keyboard.ShowSettingsModal, 'reader', function(){$('#settings-dialog').modal("show")});

        $('#app-navbar').on('mousemove', hideLoop);
        
        $(window).on('resize', setTocSize);
        setTocSize();
        hideLoop();

            // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
            // so I'm using DOM api directly
            //document.addEventListener('click', hideLoop, true);
    };

    var setFitScreen = function(e){
        readium.reader.setZoom({style: 'fit-screen'});
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-fit-screen').addClass('active-zoom');
        $('.zoom-wrapper input').prop('disabled', true);
        $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var setFitWidth = function(e){
        readium.reader.setZoom({style: 'fit-width'});
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-fit-width').addClass('active-zoom');
        $('.zoom-wrapper input').prop('disabled', true);
         $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var enableCustom = function(e){
        $('.zoom-wrapper input').prop('disabled', false).focus();
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-custom').addClass('active-zoom');
         $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var zoomRegex = /^\s*(\d+)%?\s*$/;
    var setCustom = function(e){
        var percent = $('.zoom-wrapper input').val();
        var matches = zoomRegex.exec(percent);
        if (matches){
            var percentVal = Number(matches[1])/100;
            readium.reader.setZoom({style: 'user', scale: percentVal});
        }
        else{
            setScaleDisplay();
        }
    }

    var loadReaderUIPrivate = function(){
        $('.modal-backdrop').remove();
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));
        $('nav').empty();
        $('nav').attr("aria-label", Strings.i18n_toolbar);
        $('nav').append(ReaderNavbar({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));
        installReaderEventHandlers();
        document.title = "Readium";
        $('#zoom-fit-width a').on('click', setFitWidth);
        $('#zoom-fit-screen a').on('click', setFitScreen);
        $('#zoom-custom a').on('click', enableCustom);
        $('.zoom-wrapper input').on('change', setCustom);

        spin(true);
    }

    var loadReaderUI = function (data) {

        Keyboard.scope('reader');

        ebookURL = data.epub;
        ebookURL_filepath = Helpers.getEbookUrlFilePath(ebookURL);


        Analytics.trackView('/reader');
        embedded = data.embedded;

        loadReaderUIPrivate();

        //because we reinitialize the reader we have to unsubscribe to all events for the previews reader instance
        if(readium && readium.reader) {
            
            Globals.logEvent("__ALL__", "OFF", "EpubReader.js");
            readium.reader.off();
        }

        if (window.ReadiumSDK) {
            Globals.logEvent("PLUGINS_LOADED", "OFF", "EpubReader.js");
            ReadiumSDK.off(ReadiumSDK.Events.PLUGINS_LOADED);
        }

        setTimeout(function()
        {
            initReadium(); //async
        }, 0);
    };

    var initReadium = function(){

        console.log("MODULE CONFIG:");
        console.log(moduleConfig);

        Settings.getMultiple(['reader', ebookURL_filepath], function(settings){

            // Note that unlike Settings.get(), Settings.getMultiple() returns raw string values (from the key/value store), not JSON.parse'd ! 

            // Ensures default settings are saved from the start (as the readium-js-viewer defaults can differ from the readium-shared-js).
            if (!settings.reader)
            {
                settings.reader = {};
            } else {
                settings.reader = JSON.parse(settings.reader);
            }
            for (prop in SettingsDialog.defaultSettings)
            {
                if (SettingsDialog.defaultSettings.hasOwnProperty(prop))
                {
                    if (!settings.reader.hasOwnProperty(prop) || (typeof settings.reader[prop] == "undefined")) {
                        settings.reader[prop] = SettingsDialog.defaultSettings[prop];
                    }
                }
            }
            // Note: automatically JSON.stringify's the passed value!
            Settings.put('reader', settings.reader);


            var readerOptions =  {
                el: "#epub-reader-frame",
                annotationCSSUrl: moduleConfig.annotationCSSUrl,
                mathJaxUrl : moduleConfig.mathJaxUrl,
                fonts : moduleConfig.fonts
            };

            var readiumOptions = {
                jsLibRoot: moduleConfig.jsLibRoot,
                openBookOptions: {}
            };

            if (moduleConfig.useSimpleLoader){
                readiumOptions.useSimpleLoader = true;
            }

            _debugBookmarkData_goto = undefined;
            var openPageRequest;
            if (settings[ebookURL_filepath]){
                // JSON.parse() *first* because Settings.getMultiple() returns raw string values from the key/value store (unlike Settings.get()) 
                var bookmark = JSON.parse(settings[ebookURL_filepath]);
                // JSON.parse() a *second time* because the stored value is readium.reader.bookmarkCurrentPage(), which is JSON.toString'ed
                bookmark = JSON.parse(bookmark);
                //console.log("Bookmark restore: " + JSON.stringify(bookmark));
                openPageRequest = {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
                console.debug("Open request (bookmark): " + JSON.stringify(openPageRequest));
            }

            var urlParams = Helpers.getURLQueryParams();
            var goto = urlParams['goto'];
            if (goto) {
                console.log("Goto override? " + goto);
                
                try {
                    var gotoObj = JSON.parse(goto);
                    
                    var openPageRequest_ = undefined;
                    
                    
                    // See ReaderView.openBook()
                    // e.g. with accessible_epub_3:
                    // &goto={"contentRefUrl":"ch02.xhtml%23_data_integrity","sourceFileHref":"EPUB"}
                    // or: {"idref":"id-id2635343","elementCfi":"/4/2[building_a_better_epub]@0:10"} (the legacy spatial bookmark is wrong here, but this is fixed in intel-cfi-improvement feature branch)
                    if (gotoObj.idref) {
                        if (gotoObj.spineItemPageIndex) {
                            openPageRequest_ = {idref: gotoObj.idref, spineItemPageIndex: gotoObj.spineItemPageIndex};
                        }
                        else if (gotoObj.elementCfi) {
                                        
                            _debugBookmarkData_goto = new BookmarkData(gotoObj.idref, gotoObj.elementCfi);
                            
                            openPageRequest_ = {idref: gotoObj.idref, elementCfi: gotoObj.elementCfi};
                        }
                        else {
                            openPageRequest_ = {idref: gotoObj.idref};
                        }
                    }
                    else if (gotoObj.contentRefUrl && gotoObj.sourceFileHref) {
                        openPageRequest_ = {contentRefUrl: gotoObj.contentRefUrl, sourceFileHref: gotoObj.sourceFileHref};
                    }
                    
                    
                    if (openPageRequest_) {
                        openPageRequest = openPageRequest_;
                        console.debug("Open request (goto): " + JSON.stringify(openPageRequest));
                    }
                } catch(err) {
                    console.error(err);
                }
            }

            readium = new Readium(readiumOptions, readerOptions);

            window.READIUM = readium;

            ReadiumSDK.on(ReadiumSDK.Events.PLUGINS_LOADED, function () {
                Globals.logEvent("PLUGINS_LOADED", "ON", "EpubReader.js");
                
                console.log('PLUGINS INITIALIZED!');

                if (!readium.reader.plugins.highlights) {
                    $('.icon-annotations').css("display", "none");
                } else {

                    readium.reader.plugins.highlights.initialize({
                        annotationCSSUrl: readerOptions.annotationCSSUrl
                    });

                    readium.reader.plugins.highlights.on("annotationClicked", function(type, idref, cfi, id) {
        console.debug("ANNOTATION CLICK: " + id);
                        readium.reader.plugins.highlights.removeHighlight(id);
                    });
                }
    
                if (readium.reader.plugins.example) {
                    readium.reader.plugins.example.on("exampleEvent", function(message) {
                        alert(message);
                    });
                }

                if (readium.reader.plugins.hypothesis) {
                    // Respond to requests for UI controls to make space for the Hypothesis sidebar
                    readium.reader.plugins.hypothesis.on("offsetPageButton", function (offset) {
                        var $rightPageButton = $('#right-page-btn');
                        $rightPageButton.css('right', offset);
                    });
                    readium.reader.plugins.hypothesis.on("offsetNavBar", function (offset) {
                        $('nav').css('margin-right', offset);
                    });
                }
            });

            gesturesHandler = new GesturesHandler(readium.reader, readerOptions.el);
            gesturesHandler.initialize();

            $(window).on('keyup', function(e)
            {
                if (e.keyCode === 9 || e.which === 9)
                {
                    unhideUI();
                }
            });

            readium.reader.addIFrameEventListener('keydown', function(e) {
                Keyboard.dispatch(document.documentElement, e.originalEvent);
            });

            readium.reader.addIFrameEventListener('keyup', function(e) {
                Keyboard.dispatch(document.documentElement, e.originalEvent);
            });

            readium.reader.addIFrameEventListener('focus', function(e) {
                $('#reading-area').addClass("contentFocus");
                $(window).trigger("focus");
            });
            
            readium.reader.addIFrameEventListener('blur', function(e) {
                $('#reading-area').removeClass("contentFocus");
            });

            SettingsDialog.initDialog(readium.reader);

            $('#settings-dialog').on('hidden.bs.modal', function () {

                Keyboard.scope('reader');

                unhideUI()
                setTimeout(function(){ $("#settbutt1").focus(); }, 50);

                $("#buttSave").removeAttr("accesskey");
                $("#buttClose").removeAttr("accesskey");
            });
            $('#settings-dialog').on('shown.bs.modal', function () {

                Keyboard.scope('settings');

                $("#buttSave").attr("accesskey", Keyboard.accesskeys.SettingsModalSave);
                $("#buttClose").attr("accesskey", Keyboard.accesskeys.SettingsModalClose);
            });


            $('#about-dialog').on('hidden.bs.modal', function () {
                Keyboard.scope('reader');

                unhideUI();
                setTimeout(function(){ $("#aboutButt1").focus(); }, 50);
            });
            $('#about-dialog').on('shown.bs.modal', function(){
                Keyboard.scope('about');
            });

            var readerSettings;
            if (settings.reader){
                readerSettings = settings.reader;
            }
            if (!embedded){
                readerSettings = readerSettings || SettingsDialog.defaultSettings;
                SettingsDialog.updateReader(readium.reader, readerSettings);
            }
            else{
                readium.reader.updateSettings({
                    syntheticSpread:  "auto",
                    scroll: "auto"
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
                        json.theme = isNight ? "author-theme" : "night-theme";

                        // Note: automatically JSON.stringify's the passed value!
                        Settings.put('reader', json);

                        SettingsDialog.updateReader(readium.reader, json);
                    });
                }
            };
            $("#buttNightTheme").on("click", toggleNightTheme);
            Keyboard.on(Keyboard.NightTheme, 'reader', toggleNightTheme);

            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                Globals.logEvent("CONTENT_DOCUMENT_LOAD_START", "ON", "EpubReader.js [ " + spineItem.href + " ]");
                
                spin(true);
            });

            EpubReaderMediaOverlays.init(readium);

            EpubReaderBackgroundAudioTrack.init(readium);

            //epubReadingSystem

            Versioning.getVersioningInfo(function(version){

                $('#app-container').append(AboutDialog({imagePathPrefix: moduleConfig.imagePathPrefix, strings: Strings, dateTimeString: version.dateTimeString, viewerJs: version.readiumJsViewer, readiumJs: version.readiumJs, sharedJs: version.readiumSharedJs, cfiJs: version.readiumCfiJs}));


                window.navigator.epubReadingSystem.name = "readium-js-viewer";
                window.navigator.epubReadingSystem.version = version.readiumJsViewer.chromeVersion;

                window.navigator.epubReadingSystem.readium = {};

                window.navigator.epubReadingSystem.readium.buildInfo = {};

                window.navigator.epubReadingSystem.readium.buildInfo.dateTime = version.dateTimeString; //new Date(timestamp).toString();
                window.navigator.epubReadingSystem.readium.buildInfo.version = version.readiumJsViewer.version;
                window.navigator.epubReadingSystem.readium.buildInfo.chromeVersion = version.readiumJsViewer.chromeVersion;

                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories = [];

                var repo1 = {};
                repo1.name = "readium-js-viewer";
                repo1.sha = version.readiumJsViewer.sha;
                repo1.tag = version.readiumJsViewer.tag;
                repo1.version = version.readiumJsViewer.version;
                repo1.clean = version.readiumJsViewer.clean;
                repo1.branch = version.readiumJsViewer.branch;
                repo1.release = version.readiumJsViewer.release;
                repo1.timestamp = version.readiumJsViewer.timestamp;
                repo1.url = "https://github.com/readium/" + repo1.name + "/tree/" + repo1.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo1);

                var repo2 = {};
                repo2.name = "readium-js";
                repo2.sha = version.readiumJs.sha;
                repo2.tag = version.readiumJs.tag;
                repo2.version = version.readiumJs.version;
                repo2.clean = version.readiumJs.clean;
                repo2.branch = version.readiumJs.branch;
                repo2.release = version.readiumJs.release;
                repo2.timestamp = version.readiumJs.timestamp;
                repo2.url = "https://github.com/readium/" + repo2.name + "/tree/" + repo2.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo2);

                var repo3 = {};
                repo3.name = "readium-shared-js";
                repo3.sha = version.readiumSharedJs.sha;
                repo3.tag = version.readiumSharedJs.tag;
                repo3.version = version.readiumSharedJs.version;
                repo3.clean = version.readiumSharedJs.clean;
                repo3.branch = version.readiumSharedJs.branch;
                repo3.release = version.readiumSharedJs.release;
                repo3.timestamp = version.readiumSharedJs.timestamp;
                repo3.url = "https://github.com/readium/" + repo3.name + "/tree/" + repo3.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo3);

                var repo4 = {};
                repo4.name = "readium-cfi-js";
                repo4.sha = version.readiumCfiJs.sha;
                repo4.tag = version.readiumCfiJs.tag;
                repo4.version = version.readiumCfiJs.version;
                repo4.clean = version.readiumCfiJs.clean;
                repo4.branch = version.readiumCfiJs.branch;
                repo4.release = version.readiumCfiJs.release;
                repo4.timestamp = version.readiumCfiJs.timestamp;
                repo4.url = "https://github.com/readium/" + repo4.name + "/tree/" + repo4.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo4);

                // Debug check:
                //console.debug(JSON.stringify(window.navigator.epubReadingSystem, undefined, 2));


                loadEbook(readerSettings, openPageRequest);
            });
        });
    }

    var unloadReaderUI = function(){

        if (readium) {
            readium.closePackageDocument();
        }

        // needed only if access keys can potentially be used to open a book while a dialog is opened, because keyboard.scope() is not accounted for with HTML access keys :(
        // for example: settings dialogs is open => SHIFT CTRL [B] access key => library view opens with transparent black overlay!
        Dialogs.closeModal();
        Dialogs.reset();
        $('#settings-dialog').modal('hide');
        $('#about-dialog').modal('hide');
        $('.modal-backdrop').remove();
        $('#app-navbar').off('mousemove');


        Keyboard.off('reader');
        Keyboard.off('settings');

        $('#settings-dialog').off('hidden.bs.modal');
        $('#settings-dialog').off('shown.bs.modal');

        $('#about-dialog').off('hidden.bs.modal');
        $('#about-dialog').off('shown.bs.modal');

        // visibility check fails because iframe is unloaded
        //if (readium.reader.isMediaOverlayAvailable())
        if (readium && readium.reader) // window.push/popstate
        {
            try{
                readium.reader.pauseMediaOverlay();
            }catch(err){
                //ignore error.
                //can occur when ReaderView._mediaOverlayPlayer is null, for example when openBook() fails 
            }
        }

        $(window).off('resize');
        $(window).off('mousemove');
        $(window).off('keyup');
        $(window).off('message');
        window.clearTimeout(hideTimeoutId);
        $(document.body).removeClass('embedded');
        $('.book-title-header').remove();

        $(document.body).removeClass('hide-ui');
    }

    var applyKeyboardSettingsAndLoadUi = function(data)
    {
        // override current scheme with user options
        Settings.get('reader', function(json)
        {
           Keyboard.applySettings(json);

           loadReaderUI(data);
        });
    };

    return {
        loadUI : applyKeyboardSettingsAndLoadUi,
        unloadUI : unloadReaderUI,
        tooltipSelector : tooltipSelector,
        ensureUrlIsRelativeToApp : ensureUrlIsRelativeToApp 
    };

});
