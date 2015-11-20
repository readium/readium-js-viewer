define(['jquery', './EpubLibrary', './EpubReader', 'readium_shared_js/helpers'], function($, EpubLibrary, EpubReader, Helpers){


    var _initialLoad = true; // replaces pushState() with replaceState() at first load 
    var initialLoad = function(){

        var urlParams = Helpers.getURLQueryParams();

        var ebookURL = urlParams['epub'];
        var libraryURL = urlParams['epubs'];
        var embedded = urlParams['embedded'];
         
         // we use triggerHandler() so that the pushState logic is invoked from the first-time open 
         
        if (ebookURL) {
              //EpubReader.loadUI(urlParams);
            var eventPayload = {embedded: embedded, epub: ebookURL, epubs: libraryURL};
            $(window).triggerHandler('readepub', eventPayload);
        }
        else {
            //EpubLibrary.loadUI({epubs: libraryURL});
            var eventPayload = libraryURL;
            $(window).triggerHandler('loadlibrary', eventPayload);
        }

        $(document.body).on('click', function()
        {
            $(document.body).removeClass("keyboard");
        });

        $(document).on('keyup', function(e)
        {
            $(document.body).addClass("keyboard");
        });
    }

    var pushState = $.noop;
    var replaceState = $.noop;

    var isElectron = navigator.userAgent.indexOf("Electron/") >= 0;

    var isChromeExtensionPackagedApp = (typeof chrome !== "undefined") && chrome.app
            && chrome.app.window && chrome.app.window.current; // a bit redundant?

    if (!isChromeExtensionPackagedApp // "history.pushState is not available in packaged apps"
            && window.history && window.history.pushState){
        
        $(window).on('popstate', function(){
            
            var state = history.state;
            
            console.debug("BROWSER HISTORY POP STATE:");
            console.log(state);
            
            if (state && state.epub) {
                readerView(state);
            }
            else if (state && state.epubs) {
                libraryView(state.epubs);
            }
            else {
                libraryView();
            }
        });
        
        pushState = function(data, title, url){
            console.debug("BROWSER HISTORY PUSH STATE:");
            //console.log(title);
            console.log(url);
            console.log(data);
            history.pushState(data, title, url);
        };
        
        replaceState = function(data, title, url){
            console.debug("BROWSER HISTORY REPLACE STATE:");
            //console.log(title);
            console.log(url);
            console.log(data);
            history.replaceState(data, title, url);
        };
    }


    var tooltipSelector = 'nav *[title]';

    var libraryView = function(libraryURL){
        $(tooltipSelector).tooltip('destroy');
        
        EpubReader.unloadUI();
        
        //EpubLibrary.unloadUI();
        EpubLibrary.loadUI({epubs: libraryURL});
    }

    var readerView = function(data){
        $(tooltipSelector).tooltip('destroy');
        
        EpubLibrary.unloadUI();
        
        //EpubReader.unloadUI();
        EpubReader.loadUI(data);
    }

    var URLPATH =
    window.location ? (
        window.location.protocol
        + "//"
        + window.location.hostname
        + (window.location.port ? (':' + window.location.port) : '')
        + window.location.pathname
    ) : 'index.html'
    ;

    $(window).on('readepub', function(e, eventPayload){
        
        if (!eventPayload || !eventPayload.epub) return;
        
        var ebookURL_filepath = Helpers.getEbookUrlFilePath(eventPayload.epub);
        
        var epub = eventPayload.epub;
        if (epub && (typeof epub !== "string")) {
            epub = ebookURL_filepath;
        }
        
        var func = _initialLoad ? replaceState : pushState;
        func(
            {epub: epub, epubs: eventPayload.epubs},
            "Readium Viewer",
            URLPATH + '?epub=' + encodeURIComponent(ebookURL_filepath)
            + (eventPayload.epubs ? ('&epubs=' + encodeURIComponent(eventPayload.epubs)) : '')
            + (eventPayload.embedded ? ('&embedded=' + eventPayload.embedded) : '')
        );
    
        _initialLoad = false;
        
        readerView(eventPayload);
    });

    $(window).on('loadlibrary', function(e, eventPayload){

        var libraryURL = (typeof eventPayload == "string") ? eventPayload : undefined;
        
        if (eventPayload instanceof Blob) { // includes File
            // See below invoke:
            // $(window).triggerHandler('loadlibrary', file);
            
            setTimeout(function() {
                EpubLibrary.importEpub(eventPayload);
            }, 800);
        }
        
        var func = _initialLoad ? replaceState : pushState;
        func(
            {epubs: libraryURL},
            "Readium Library",
            libraryURL ?
            URLPATH + '?epubs=' + encodeURIComponent(libraryURL)
            : URLPATH);
        
        _initialLoad = false;

        libraryView(libraryURL);
    });

    $(document.body).tooltip({
        selector : tooltipSelector,
        placement: 'auto',
        container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted
    }).on('show.bs.tooltip', function(e){
        $(tooltipSelector).not(e.target).tooltip('destroy');
    });
    
    
    
    if (window.File
         //&& window.FileReader
     ) {
        var fileDragNDropHTMLArea = $(document.body);
        fileDragNDropHTMLArea.on("dragover", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            
            //$(ev.target)
            fileDragNDropHTMLArea.addClass("fileDragHover");
        });
        fileDragNDropHTMLArea.on("dragleave", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            
            //$(ev.target)
            fileDragNDropHTMLArea.removeClass("fileDragHover");
        });
        fileDragNDropHTMLArea.on("drop", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            
            //$(ev.target)
            fileDragNDropHTMLArea.removeClass("fileDragHover");
            
            var files = ev.target.files || ev.originalEvent.dataTransfer.files;
            if (files.length) {
                var file = files[0];
                console.log("File drag-n-drop:");
                console.log(file.name);
                console.log(file.type);
                console.log(file.size);
                
                if (file.type == "application/epub+zip" || (/\.epub$/.test(file.name))) {
                    
                    if (isChromeExtensionPackagedApp || isElectron) {
                        
                        $(window).triggerHandler('loadlibrary', file);
                                
                    } else {
                        
                        var urlParams = Helpers.getURLQueryParams();
                        //var ebookURL = urlParams['epub'];
                        var libraryURL = urlParams['epubs'];
                        var embedded = urlParams['embedded'];
                        
                        var eventPayload = {embedded: embedded, epub: file, epubs: libraryURL};
                        $(window).triggerHandler('readepub', eventPayload);
                    }
                    
                    // var reader = new FileReader();
                    // reader.onload = function(e) {
                        
                    //     console.log(e.target.result);
                        
                    //     var ebookURL = e.target.result;
                    //     $(window).triggerHandler('readepub', ...);
                    // }
                    // reader.readAsDataURL(file);
                }
            }
        });
    }

    $(initialLoad);
});
