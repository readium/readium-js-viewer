define(['hgn!templates/settings-dialog.html'], function(SettingsDialog){
	var defaultSettings = {
        fontSize: 100,
        isSyntheticSpread: true
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
	var initDialog = function(reader){
		$('#app-container').append(SettingsDialog({}));

		$previewText = $('.preview-text');
        $('.theme-option').on('click', function(){
            var newTheme = $(this).attr('data-theme');
            setPreviewTheme($previewText, newTheme);
        });

        $('#font-size-input').on('change', function(){
            var fontSize = $(this).val();
            $previewText.css({fontSize: (fontSize * .1 + .6) + 'em'});
        });

        $('#settings-dialog').on('show.bs.modal', function(){
            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                
                $('#font-size-input').val((readerSettings.fontSize-60)/10);
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
                fontSize : $('#font-size-input').val() * 10 + 60,
                isSyntheticSpread :  $('#two-up-option input').prop('checked'),
            }
            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){

	            reader.updateSettings(readerSettings);
	            if (readerSettings.theme)
	            	reader.setBookStyles(getBookStyles(readerSettings.theme));
	        }
            
            Settings.put('reader', readerSettings);
        });
	}
	return {
		initDialog : initDialog,
		getBookStyles : getBookStyles,
		defaultSettings : defaultSettings
	}
});