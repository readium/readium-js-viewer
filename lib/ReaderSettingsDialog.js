define(['hgn!templates/settings-dialog.html', 'i18n/Strings'], function(SettingsDialog, Strings){
	var defaultSettings = {
        fontSize: 100,
        isSyntheticSpread: true,
        columnGap: 60
    }
    
    var getBookStyles = function(theme){
    	var $previewText = $('.preview-text');
    	setPreviewTheme($previewText, theme);
    	var previewStyle = window.getComputedStyle($previewText[0]);
    	var bookStyles = [{selector: 'body', declarations: {
            backgroundColor: previewStyle.backgroundColor,
            color: previewStyle.color
        }}];
        return bookStyles;
    }
    var setPreviewTheme = function($previewText, newTheme){
        var previewTheme = $previewText.attr('data-theme');
        $previewText.removeClass(previewTheme);
        $previewText.addClass(newTheme);
        $previewText.attr('data-theme', newTheme);
    }

    var getWidthFactor = function(readerSettings){
        var gapNumber = readerSettings.columnGap/20;
        widthFactor = 1.0;
        switch (gapNumber){
            case 1:
                widthFactor = readerSettings.isSyntheticSpread ? .95 : .90;
                break;
            case 2:
                widthFactor = readerSettings.isSyntheticSpread ? .89 : .80;
                break;
            case 3:
                widthFactor = readerSettings.isSyntheticSpread ? .83 : .70;
                break;
            case 4:
                widthFactor = readerSettings.isSyntheticSpread ? .77 : .60;
                break;
            case 5:
                widthFactor = readerSettings.isSyntheticSpread ? .70 : .50;
                break;
        }
        return widthFactor;
    }

    var updateBookLayout = function(reader, readerSettings){
        var columnGap = 0;
        if ($('#reflowable-book-frame').length){
            var widthFactor = getWidthFactor(readerSettings);
            var iframeWidth = Math.floor($("#reading-area").width() * widthFactor);
            columnGap = readerSettings.columnGap;
            $('#epub-reader-frame').css({width: widthFactor * 100 + "%"});
        }
        else{
            $('#epub-reader-frame').css({width: "100%"});
            $('#epub-reader-container').css({padding: "30px"});
        }
        return columnGap;
    }

    var updateReader = function(reader, readerSettings, doLayout){
        var columnGap = readerSettings.columnGap;
        if (doLayout){
            columnGap = updateBookLayout(reader, readerSettings);
        }
        //$('#epub-reader-container').css({margin: readerSettings.columnGap + 'px'});
        var needViewRefresh = reader.viewerSettings.columnGap != columnGap;
        
        reader.updateSettings(readerSettings);

        if (readerSettings.theme){
            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
        }

        if (needViewRefresh){
            window.setTimeout(reader.handleViewportResize, 100);
        }
    }

	var initDialog = function(reader){
		$('#app-container').append(SettingsDialog({strings: Strings}));

		$previewText = $('.preview-text');
        $('.theme-option').on('click', function(){
            var newTheme = $(this).attr('data-theme');
            setPreviewTheme($previewText, newTheme);
        });

        $('#font-size-input').on('change', function(){
            var fontSize = $(this).val();
            $previewText.css({fontSize: (fontSize/100) + 'em'});
        });

        $('#settings-dialog').on('show.bs.modal', function(){
            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                
                $('#font-size-input').val(readerSettings.fontSize);
                $('#margin-size-input').val(readerSettings.columnGap);
                if (readerSettings.isSyntheticSpread){
                    $('#two-up-option input').prop('checked', true);
                }
                else{
                    $('#one-up-option input').prop('checked', true);
                }
                
                if (readerSettings.theme){
                    setPreviewTheme($previewText, readerSettings.theme);
                }
                
                $previewText.css({fontSize: readerSettings.fontSize/100 + 'em'});
            });
        });

        $('#settings-dialog .btn-primary').on('click', function(){
            
            var readerSettings = {
                fontSize : Number($('#font-size-input').val()),
                isSyntheticSpread :  $('#two-up-option input').prop('checked'),
                columnGap : Number($('#margin-size-input').val())
            }
            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){
               updateReader(reader, readerSettings, true);
	        }
            Settings.put('reader', readerSettings);
        });
	}
	return {
		initDialog : initDialog,
		updateReader : updateReader,
		defaultSettings : defaultSettings,
        updateBookLayout : updateBookLayout
	}
});