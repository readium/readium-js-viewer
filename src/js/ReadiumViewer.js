define(['jquery', './EpubLibrary', './EpubReader', 'readium_shared_js/helpers', 'URIjs'], function($, EpubLibrary, EpubReader, Helpers, URI){

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
    };

    var pushState = $.noop;
    var replaceState = $.noop;

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

    var libraryView = function(libraryURL, importEPUB){
        $(EpubReader.tooltipSelector()).tooltip('destroy');
        
        EpubReader.unloadUI();
        EpubLibrary.unloadUI();
        
        if (libraryURL) {
            EpubLibrary.loadUI({epubs: libraryURL});
        } else {
            
            EpubLibrary.loadUI({epubs: undefined, importEPUB: importEPUB});
        }
    };

    var readerView = function(data){
        $(EpubReader.tooltipSelector()).tooltip('destroy');
        
        EpubLibrary.unloadUI();
        EpubReader.unloadUI();
        
        EpubReader.loadUI(data);
    };

    $(window).on('readepub', function(e, eventPayload){
        
        if (!eventPayload || !eventPayload.epub) return;
        
        var ebookURL_filepath = Helpers.getEbookUrlFilePath(eventPayload.epub);
        
        var epub = eventPayload.epub;
        if (epub && (typeof epub !== "string")) {
            epub = ebookURL_filepath;
        }
        
        ebookURL_filepath = EpubReader.ensureUrlIsRelativeToApp(ebookURL_filepath);
        
        var epubs = eventPayload.epubs;
        epubs = EpubReader.ensureUrlIsRelativeToApp(epubs);
        
        var urlState = Helpers.buildUrlQueryParameters(undefined, {
            epub: ebookURL_filepath,
            epubs: (epubs ? epubs : undefined),
            embedded: (eventPayload.embedded ? eventPayload.embedded : undefined)
        });
        
        var func = _initialLoad ? replaceState : pushState;
        func(
            {epub: epub, epubs: epubs},
            "Readium Viewer",
            urlState
        );
    
        _initialLoad = false;
        
        readerView(eventPayload);
    });

    $(window).on('loadlibrary', function(e, eventPayload){
        var libraryURL = undefined;
        var importEPUB = undefined;
        if (typeof eventPayload === "string") { 
            libraryURL = eventPayload;
        } else { //File/Blob
            importEPUB = eventPayload;
        }
        
        libraryURL = EpubReader.ensureUrlIsRelativeToApp(libraryURL);
        
        var urlState = Helpers.buildUrlQueryParameters(undefined, {
            epubs: (libraryURL ? libraryURL : undefined),
            epub: " ",
            goto: " "
        });
        
        var func = _initialLoad ? replaceState : pushState;
        func(
            {epubs: libraryURL},
            "Readium Library",
            urlState
        );
        
        _initialLoad = false;

        libraryView(libraryURL, importEPUB);
    });

    $(document.body).tooltip({
        selector : EpubReader.tooltipSelector(),
        placement: function(tip, element){
          var placeValue = 'auto';
          if (element.id == 'left-page-btn'){
            placeValue = 'right';
          } else if (element.id == 'right-page-btn') {
            placeValue = 'left'
          }
          return placeValue;
        },
        container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted
    }).on('show.bs.tooltip', function(e){
        $(EpubReader.tooltipSelector()).not(e.target).tooltip('destroy');
        var target = e.target; 
        setTimeout(function(){
            $(target).tooltip('destroy');
        }, 8000);
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

                if (isChromeExtensionPackagedApp) {

                    var filesArray = []; // files is a FileList, we prefer a more "primitive" array type
                    for (var i=0; i<files.length; i++) {
                        filesArray.push(files[i]); // files.item(i) 
                    }
                    var arr = [];
                    arr.push(filesArray); // because jQuery triggerHandler() optionally takes a parameter Array!
                    $(window).triggerHandler('loadlibrary', arr);
                } else {

                    var file = files[0];
                    console.log("File drag-n-drop:");
                    console.log(file.name);
                    console.log(file.type);
                    console.log(file.size);
                    
                    if (file.type == "application/epub+zip" || (/\.epub[3?]$/.test(file.name))) {
                        var urlParams = Helpers.getURLQueryParams();
                        //var ebookURL = urlParams['epub'];
                        var libraryURL = urlParams['epubs'];
                        var embedded = urlParams['embedded'];
                        
                        var eventPayload = {embedded: embedded, epub: file, epubs: libraryURL};
                        $(window).triggerHandler('readepub', eventPayload);
                    }
                }

                // var reader = new FileReader();
                // reader.onload = function(e) {
                    
                //     console.log(e.target.result);
                    
                //     var ebookURL = e.target.result;
                //     $(window).triggerHandler('readepub', ...);
                // }
                // reader.readAsDataURL(file);

            }
        });
    }

    $(initialLoad);
});
