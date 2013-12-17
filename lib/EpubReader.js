
define(['jquery', 'bootstrap', 'URIjs', 'Readium', 'storage/Settings', 'ReaderSettingsDialog', 'hgn!templates/reader-navbar.html', 'hgn!templates/reader-body.html'], function ($, bootstrap, URI, Readium, Settings, SettingsDialog, ReaderNavbar, ReaderBody) {

    var readium, 
        el = document.documentElement,
        currentDocument,
        requestFullScreen = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen, 
        cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;


    
    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL) {

        readium.openPackageDocument(packageDocumentURL, function(packageDocument){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
            });
        });
    };

    var loadToc = function(dom){
        $('script', dom).remove();
        var toc = $('body', dom).html() || $(dom).html();
        var tocUrl = currentDocument.getTocURL();

        $('#readium-toc-body').html(toc);
        $('#readium-toc-body').on('click', 'a', function(e){
            var href = $(this).attr('href');
            href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href; 

            readium.reader.openContentUrl(href);
            return false;
        });
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

    var installReaderEventHandlers = function(){

        // Set handlers for click events
        $("#previous-page-btn").unbind("click");
        $("#previous-page-btn").on("click", function () {
            readium.reader.openPageLeft();
            return false;
        });

        $("#next-page-btn").unbind("click");
        $("#next-page-btn").on("click", function () {
            readium.reader.openPageRight();
            return false;
        });

        $('.icon-full-screen').on('click', toggleFullScreen);

        $('.icon-library').on('click', function(){
            $(window).trigger('loadlibrary');
            return false;
        });

        $('.icon-toc').on('click', function(){
            var $appContainer = $('#app-container');
            if ($appContainer.hasClass('toc-visible')){
                $appContainer.removeClass('toc-visible');
            }
            else{
                $appContainer.addClass('toc-visible');
            }
            readium.reader.handleViewportResize();
        });

        var setTocSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
            $('#readium-toc-body').height(appHeight);
        }

        $(window).on('resize', setTocSize);
        setTocSize();

    };



    var loadReaderUIPrivate = function(){
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({}));
        $('nav').empty();
        $('nav').append(ReaderNavbar({}));
        installReaderEventHandlers();

    }
    
    var loadReaderUI = function (data) {
        var url = data.url;
        loadReaderUIPrivate();
        currLayoutIsSynthetic = true;

        readium = new Readium("#epub-reader-container", './lib/thirdparty/');
        SettingsDialog.initDialog(readium.reader);
        
        Settings.get('reader', function(readerSettings){
            readerSettings = readerSettings || SettingsDialog.defaultSettings;
            readium.reader.updateSettings(readerSettings);
            if (readerSettings.theme){
                var bookStyles = SettingsDialog.getBookStyles(readerSettings.theme);
                readium.reader.setBookStyles(bookStyles);
            }
            loadEbook(url);
        });
        
        
        
    }

    var unloadReaderUI = function(){
        $(window).off('resize');
    }

    return {
        loadUI : loadReaderUI,
        unloadUI : unloadReaderUI
    };
    
});
