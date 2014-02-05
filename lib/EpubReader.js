
define(['module','jquery', 'bootstrap', 'URIjs', 'Readium', 'Spinner', 'storage/Settings', 'i18n/Strings', 'ReaderSettingsDialog', 
        'hgn!templates/about-dialog.html', 'hgn!templates/reader-navbar.html', 'hgn!templates/reader-body.html', 'analytics/Analytics'], 
        function (module, $, bootstrap, URI, Readium, spinner, Settings, Strings, SettingsDialog, AboutDialog, ReaderNavbar, ReaderBody, Analytics) {

    var readium, 
        embedded,
        url,
        el = document.documentElement,
        currentDocument,
        requestFullScreen = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen, 
        cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;

    var installHookFunc = function(){
         window.addEventListener('mousemove', function(){
            parent.postMessage('mousemove', parent.location.origin);
        });
    }

    var receiveHook = function(){
        $(window).on('message', function(e){
            if (e.originalEvent.data == 'mousemove'){
                hideLoop();
            }
        });
    }
    
    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL) {

        readium.openPackageDocument(packageDocumentURL, function(packageDocument, options){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
            });
            var metadata = options.metadata;

            $('<h2 class="book-title-header"></h2>').insertAfter('.navbar').text(metadata.title);

            $('iframe').on('load', function(){
                
                spinner.stop();
               
                
                frames[0].window.eval('(' + installHookFunc.toString() + ')()');

                $(frames[0].window).on('beforeunload', function(){
                    spinner.spin($('#reading-area')[0]);
                });
            });    
            receiveHook();
        });
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

        $('#readium-toc-body').html(toc);
        $('#readium-toc-body').on('click', 'a', function(e){
            var href = $(this).attr('href');
            href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href; 

            readium.reader.openContentUrl(href);
            if (embedded){
                $('.toc-visible').removeClass('toc-visible');
                $(document.body).removeClass('hide-ui');
            }
            savePlace();
            return false;
        });
        $('#readium-toc-body').prepend('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
        $('#readium-toc-body button.close').on('click', function(){
            $('#app-container').removeClass('toc-visible');
            if (embedded){
                $(document.body).removeClass('hide-ui');
            }else{
                readium.reader.handleViewportResize();
            }
            return false;
        })
    }

    var toggleFullScreen = function(){
        if ((document.fullScreenElement && document.fullScreenElement !== null) || 
            (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            requestFullScreen.call(document.documentElement);
        }
        else{
            cancelFullScreen.call(document);
        }
    }

    var hideUI = function(){
        hideTimeoutId = null;
        // don't hide it toolbar while toc open in non-embedded mode
        if (!embedded && $('#app-container').hasClass('toc-visible')){
            return;
        }
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
            hideTimeoutId = window.setTimeout(hideUI, 4000);
        }
    }
    
    var savePlace = function(){
        Settings.put(url, readium.reader.bookmarkCurrentPage(), $.noop);
    }

    var nextPage = function () {
        readium.reader.openPageRight();
        savePlace();
        return false;
    }

    var prevPage = function () {
        readium.reader.openPageLeft();
        savePlace();
        return false;
    }

    var installReaderEventHandlers = function(){
        // Set handlers for click events
        $(".icon-annotations").on("click", function () {
            readium.reader.addSelectionHighlight(Math.floor((Math.random()*1000000)), "highlight");
        });


        $("#previous-page-btn").unbind("click");
        $("#previous-page-btn").on("click", prevPage);

        $("#next-page-btn").unbind("click");
        $("#next-page-btn").on("click", nextPage);

        $(window).on('keydown', function(e){
            switch (e.keyCode){
                case 37:
                    prevPage();
                    break;
                case 39 :
                    nextPage();
                    break;
            }
        })

        $('.icon-full-screen, .icon-exit-full-screen').on('click', toggleFullScreen);

        $('.icon-library').on('click', function(){
            $(window).trigger('loadlibrary');
            return false;
        });

        $('.icon-toc').on('click', function(){
            var $appContainer = $('#app-container'),
                hide = $appContainer.hasClass('toc-visible');
            if (hide){
                $appContainer.removeClass('toc-visible');
            }
            else{
                $appContainer.addClass('toc-visible');
            }

            if(embedded){
                hideLoop(null, true);
            }else{
                readium.reader.handleViewportResize();
            }
            
        });

        var setTocSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
            $('#readium-toc-body').height(appHeight);
        }

        $(window).on('mousemove', hideLoop);
        $(window).on('resize', setTocSize);
        setTocSize();
        hideLoop();

        // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
        // so I'm using DOM api directly
        document.addEventListener('click', hideLoop, true);
        spinner.spin($('#reading-area')[0]);
    };

   

    var loadReaderUIPrivate = function(){
        $('.modal-backdrop').remove();
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({strings: Strings}));
        $appContainer.append(AboutDialog({strings: Strings}));
        $('nav').empty();
        $('nav').append(ReaderNavbar({strings: Strings}));
        installReaderEventHandlers();
        document.title = "Readium";

    }
    
    var loadReaderUI = function (data) {
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

       
        initReadium();

    };

    var initReadium = function(){

        Settings.getMultiple(['reader', url], function(settings){

            var readerOptions =  {
                el: "#epub-reader-container", 
                annotationCSSUrl: module.config().annotationCssUrl || "/css/annotations.css"
            };

            var readiumOptions = {
                jsLibRoot: './lib/thirdparty/',
                openBookOptions: {}
            };

            if (settings[url]){
                var bookmark = JSON.parse(JSON.parse(settings[url]));
                readiumOptions.openBookOptions.openPageRequest = {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
            }

            readium = new Readium(readiumOptions, readerOptions);

            window.navigator.epubReadingSystem.name = "epub-js-viewer";
            window.navigator.epubReadingSystem.version = "0.0.1";

            SettingsDialog.initDialog(readium.reader);

            var readerSettings;
            if (settings.reader){
                readerSettings = JSON.parse(settings.reader);
            }
            if (!embedded){
                readerSettings = readerSettings || SettingsDialog.defaultSettings;
                SettingsDialog.updateReader(readium.reader, readerSettings);
            }
            else{
                readium.reader.updateSettings({
                    isSyntheticSpread: false
                });
            }  
            loadEbook(url);
            initMediaOverlay();

            if (false) // true => override authored Media Overlays CSS with user-provided style (can be called during playback)
            {
                readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function () {
                    readium.reader.setStyles(
                        [
                            {
                                selector: ".mo-active-default",
                                declarations: {
                                    "background-color": "blue !important",
                                    "color": "white !important",
                                    "padding": "0.2em",
                                    "font-weight": "bold"
                                }
                            }
                        ]);
                });
            }

        });
        
    }

    var initMediaOverlay = function(){
        var $toggleAudioBtn = $("#btn-toggle-audio");
        
        var $previousAudioBtn = $("#btn-previous-audio");
        var $nextAudioBtn = $("#btn-next-audio");

        readium.reader.on(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value) {

            var $audioPlayer = $('#audioplayer');
            var $audioPlayerControls = $('#audioplayer button, #audioplayer input');

            if (readium.reader.isMediaOverlayAvailable()) {
                $audioPlayer.show();
                $audioPlayerControls.attr('disabled', false);

                var isPlaying = 'isPlaying' in value
                    ? value.isPlaying   // for all the other events
                    : true;             // for events raised by positionChanged, as `isPlaying` flag isn't even set
                $toggleAudioBtn.toggleClass('pause-audio', isPlaying);
                $audioPlayer.toggleClass('isPlaying', isPlaying);
            } else {
                $audioPlayerControls.attr('disabled', true);
            }
        });

        var $buttonTouch = $('#btn-touch-audio');
        $buttonTouch.on("click", function() {
            var noTouch = $buttonTouch.hasClass('no-touch');
            if (noTouch) {
                $buttonTouch.removeClass('no-touch');
            } else {
                $buttonTouch.addClass('no-touch');
            }
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: noTouch
            });
        });

        var $changeVolumeControl = $('#volume-range-slider'),
            $volumeButton = $('#btn-audio-volume');

        function volumeButtonAppearance ($button, volumeValue) {
            if (volumeValue === '0') {
                $button.addClass('no-volume');
            } else {
                $button.removeClass('no-volume');
            }
        }

        $changeVolumeControl.on("change", function() {
            var volumeVal = $(this).val();

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });

            volumeButtonAppearance($volumeButton, volumeVal);
        });

        var _lastVolumeBeforeMute = '0';
        
        $volumeButton.on("click", function() {
            var currentVolume = $changeVolumeControl.val();
            var volumeVal = currentVolume === '0' ? _lastVolumeBeforeMute : '0';
            _lastVolumeBeforeMute = currentVolume;

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            $changeVolumeControl.val(volumeVal);
            volumeButtonAppearance($(this), volumeVal);
        });

        $toggleAudioBtn.on("click", function () {
            //readium.reader[$(this).hasClass('pause-audio') ? 'pauseMediaOverlay' : 'playMediaOverlay']();
            readium.reader.toggleMediaOverlay();
        });

        $previousAudioBtn.on("click", function () {
            readium.reader.previousMediaOverlay();
        });

        $nextAudioBtn.on("click", function () {
            readium.reader.nextMediaOverlay();
        });

        readium.reader.on("annotationClicked", function(type, idref, cfi, id) {
            readium.reader.removeHighlight(id);
        });
    }

    var unloadReaderUI = function(){
        $(window).off('resize');
        $(window).off('mousemove');
        window.clearTimeout(hideTimeoutId);
        $(document.body).removeClass('embedded');
        document.removeEventListener('click', hideLoop, true);
        $('.book-title-header').remove();
    }

    return {
        loadUI : loadReaderUI,
        unloadUI : unloadReaderUI
    };
    
});
