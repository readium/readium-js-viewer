
define(['jquery', 'bootstrap', 'Readium', 'hgn!templates/reader-navbar.html', 'hgn!templates/reader-body.html', 'hgn!templates/settings-dialog.html'], function ($, bootstrap, Readium, ReaderNavbar, ReaderBody, SettingsDialog) {

    var readium, 
        el = document.documentElement,
        requestFullScreen = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen, 
        cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;



    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL) {

        readium.openPackageDocument(packageDocumentURL);
    };

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

        $previewText = $('.preview-text');
        $('.theme-option').on('click', function(){
            var newTheme = $(this).attr('data-theme');
            var previewTheme = $previewText.attr('data-theme');
            $previewText.removeClass(previewTheme);
            $previewText.addClass(newTheme);
            $previewText.attr('data-theme', newTheme);
        });

        $('#font-size-input').on('change', function(){
            var fontSize = $(this).val();
            $previewText.css({fontSize: (fontSize * .1 + .6) + 'em'});
        });

        $('#settings-dialog .btn-primary').on('click', function(){
            var style = window.getComputedStyle($previewText[0]);
            var epubStyles = [{
                selector : '.reflowable-content-frame',
                declarations : {
                    color : style.color,
                    backgroundColor : style.backgroundColor
                }
            }];
            readium.reader.setStyles(epubStyles);
        });
    };

    var loadReaderUIPrivate = function(){
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({}));
        $appContainer.append(SettingsDialog({}));
        $('nav').empty();
        $('nav').append(ReaderNavbar({}));
        installReaderEventHandlers();
    }


   
    
    var loadReaderUI = function (data) {
        var url = data.url;
        loadReaderUIPrivate();
        currLayoutIsSynthetic = true;

        readium = new Readium("#epub-reader-container", './lib/');
        
        loadEbook(url);
        
    }

    return {
        loadUI : loadReaderUI,
        unloadUI : $.noop
    };
    
});
