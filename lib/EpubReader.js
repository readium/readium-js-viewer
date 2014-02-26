
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
            parent.postMessage({type:'mousemove'}, parent.location.origin);
        });

         window.addEventListener('keydown', function(e){
            parent.postMessage({type: 'keydown', keyCode: e.keyCode}, parent.location.origin)
         });
    }

    var receiveHook = function(){
        $(window).on('message', function(e){
            var data = e.originalEvent.data;
            if (data.type == 'mousemove'){
                hideLoop();
            }
            else if (data.type == 'keydown'){
                switch (data.keyCode){
                    case 37:
                        prevPage();
                        break;
                    case 39 :
                        nextPage();
                        break;
                }
            }
        });

    }
    
    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL, readerSettings) {

        readium.openPackageDocument(packageDocumentURL, function(packageDocument, options){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
            });
            SettingsDialog.updateBookLayout(readium.reader, readerSettings);
            var metadata = options.metadata;

            $('<h2 class="book-title-header"></h2>').insertAfter('.navbar').text(metadata.title);

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
                el: "#epub-reader-frame", 
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

            readium.reader.addIFrameEventListener('mousemove', function() {
                hideLoop();
            });

            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                spinner.spin($('#reading-area')[0]);
            });

            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function () {

                spinner.stop();
            });

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

            loadEbook(url, readerSettings);
            
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
                            "border-radius": "0.4em",
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
                            "border-radius": "0.4em"
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
                            "border-radius": "0.4em"
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
                            "border-radius": "0.4em"
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
                            "border-radius": "0.4em"
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
                            "border-radius": "0.4em"
                        }
                    }
                ], true);
            }
        });



        var $escAudioBtn = $("#btn-esc-audio");
        $escAudioBtn.on("click", function () {
            readium.reader.escapeMediaOverlay();
        });
        
        var $previousAudioBtn = $("#btn-previous-audio");
        var $nextAudioBtn = $("#btn-next-audio");
        
        
        var $playAudioBtn = $("#btn-play-audio");
        $playAudioBtn.on("click", function () {
            //readium.reader[$(this).hasClass('pause-audio') ? 'pauseMediaOverlay' : 'playMediaOverlay']();
            //readium.reader.toggleMediaOverlay();
            readium.reader.playMediaOverlay();
        });
        var $pauseAudioBtn = $("#btn-pause-audio");
        $pauseAudioBtn.on("click", function () {
            readium.reader.pauseMediaOverlay();
        });
        
        var $expandAudioBtn = $("#btn-expand-audio");
        $expandAudioBtn.on("click", function() {
            $audioPlayer.addClass('expanded-audio');
        });
        var $collapseAudioBtn = $("#btn-collapse-audio");
        $collapseAudioBtn.on("click", function() {
            $audioPlayer.removeClass('expanded-audio');
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
        
        $changeTimeControl.on("change",
        function() {
            
            var percent = $changeTimeControl.val();
            $changeTimeControl.attr("data-value", Math.round(percent));
            
            if (readium.reader.isPlayingMediaOverlay())
            {
                readium.reader.pauseMediaOverlay();
            }
            debouncedTimeRangeSliderChange();
        }
        );
        
        readium.reader.on(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value) {

            var $audioPlayerControls = $('#audioplayer button, #audioplayer input');

            var percent = 0;

            if (readium.reader.isMediaOverlayAvailable()) {
                $audioPlayer.show();
                $audioPlayerControls.attr('disabled', false);

                var isPlaying = 'isPlaying' in value
                    ? value.isPlaying   // for all the other events
                    : true;             // for events raised by positionChanged, as `isPlaying` flag isn't even set

                $audioPlayer.toggleClass('isPlaying', isPlaying);
                
                percent = -1; // to prevent flickering slider position (pause callback is raised between each audio phrase!)
                
            } else {
                $audioPlayerControls.attr('disabled', true);
            }
            
            if ((typeof value.playPosition !== "undefined") && (typeof value.smilIndex !== "undefined") && (typeof value.parIndex !== "undefined"))
            {
                var package = readium.reader.package();
                
                var playPositionMS = value.playPosition * 1000;
                percent = package.media_overlay.positionToPercent(value.smilIndex, value.parIndex, playPositionMS);

                //console.log("<<<<<<<<<<< " + percent);
                
                if (percent < 0)
                {
                    percent = 0;
                }
            }

            if (percent >= 0)
            {
                $changeTimeControl.val(percent);
                $changeTimeControl.attr("data-value", Math.round(percent));
            }
        });

        var $buttonSkipDisable = $('#btn-skip-audio-disable');
        $buttonSkipDisable.on("click", function() {

            $audioPlayer.removeClass('skip');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: false
            });

            Settings.get('reader', function(json)
            {
                if (json)
                {
                    json.mediaOverlaysSkipSkippables = false;
                    Settings.put('reader', json);
                }
            });
        });

        var $buttonSkipEnable = $('#btn-skip-audio-enable');
        $buttonSkipEnable.on("click", function() {

            $audioPlayer.addClass('skip');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: true
            });
            
            Settings.get('reader', function(json)
            {
                if (json)
                {
                    json.mediaOverlaysSkipSkippables = true;
                    Settings.put('reader', json);
                }
            });
        });
        
        var $buttonTouchEnable = $('#btn-touch-audio-enable');
        $buttonTouchEnable.on("click", function() {
            $audioPlayer.removeClass('no-touch');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: true
            });
            
            Settings.get('reader', function(json)
            {
                if (json)
                {
                    json.mediaOverlaysEnableClick = true;
                    Settings.put('reader', json);
                }
            });
        });
        var $buttonTouchDisable = $('#btn-touch-audio-disable');
        $buttonTouchDisable.on("click", function() {
            $audioPlayer.addClass('no-touch');
            
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: false
            });
            
            Settings.get('reader', function(json)
            {
                if (json)
                {
                    json.mediaOverlaysEnableClick = false;
                    Settings.put('reader', json);
                }
            });
        });
        
        var $changeRateControl = $('#rate-range-slider');
        var $changeRateControl_label = $('#rate-range-slider-label');
        $changeRateControl.on("change", function() {
            var rateVal = $(this).val();

            $changeRateControl_label[0].textContent = ((rateVal === '0' ? "~0" : rateVal) + "x");
            
            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });
        });
        
        var $rateButton = $('#btn-audio-rate');
        $rateButton.on("click", function() {
            $changeRateControl.val(1);

            $changeRateControl_label[0].textContent = "1x";
            
            //readium.reader.setRateMediaOverlay(1);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: 1
            });
        });
        
        var $changeVolumeControl = $('#volume-range-slider');
        $changeVolumeControl.on("change", function() {
            var volumeVal = $(this).val();

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            if (volumeVal === '0') {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        });

        var _lastVolumeBeforeMute = '0';
        
        $volumeButtonMute = $('#btn-audio-volume-mute');
        $volumeButtonMute.on("click", function() {
            
            _lastVolumeBeforeMute = $changeVolumeControl.val();

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: 0
            });
            
            $changeVolumeControl.val(0);

            $audioPlayer.addClass('no-volume');
        });
        
        $volumeButtonUnMute = $('#btn-audio-volume-unmute');
        $volumeButtonUnMute.on("click", function() {
            //var currentVolume = $changeVolumeControl.val();
            var volumeVal = _lastVolumeBeforeMute === '0' ? '100' : _lastVolumeBeforeMute;

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });
            
            $changeVolumeControl.val(volumeVal);

            $audioPlayer.removeClass('no-volume');
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
        readium.reader.pauseMediaOverlay();
        $(window).off('resize');
        $(window).off('mousemove');
        $(window).off('keydown');
        $(window).off('message');
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
