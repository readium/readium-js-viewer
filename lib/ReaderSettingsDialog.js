define(['hgn!templates/settings-dialog.html', 'ReaderSettingsDialog_Keyboard', 'i18n/Strings', 'Dialogs', 'storage/Settings', 'Keyboard'], function(SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){
	var defaultSettings = {
        fontSize: 100,
        syntheticSpread: "auto",
        scroll: "auto",
        columnGap: 60
    }
    
    var getBookStyles = function(theme){
        var isAuthorTheme = theme === "author-theme";
    	var $previewText = $('.preview-text');
    	setPreviewTheme($previewText, theme);
    	var previewStyle = window.getComputedStyle($previewText[0]);
    	var bookStyles = [{selector: 'body', declarations: {
            backgroundColor: isAuthorTheme ? "" : previewStyle.backgroundColor,
            color: isAuthorTheme ? "" : previewStyle.color
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
        var widthFactor = 1.0;
        var isSyntheticSpread = readerSettings.syntheticSpread == "double";
        switch (gapNumber){
            case 1:
                widthFactor = isSyntheticSpread ? .95 : .90;
                break;
            case 2:
                widthFactor = isSyntheticSpread ? .89 : .80;
                break;
            case 3:
                widthFactor = isSyntheticSpread ? .83 : .70;
                break;
            case 4:
                widthFactor = isSyntheticSpread ? .77 : .60;
                break;
            case 5:
                widthFactor = isSyntheticSpread ? .70 : .50;
                break;
        }
        
        // TODO: this interferes with readium-shared-js layout measurements!!
        //return 1.0;
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
            $('#epub-reader-frame').css({width: "100%", overflow: "auto"});
        }
        return columnGap;
    }

    var updateReader = function(reader, readerSettings, doLayout){
        //TODO: columnGap is assigned to the same readerSettings.columnGap value in updateBookLayout?
        var columnGap = readerSettings.columnGap;
        if (doLayout){
            columnGap = updateBookLayout(reader, readerSettings);
        }
        //$('#epub-reader-container').css({margin: readerSettings.columnGap + 'px'});
        var needViewRefresh = reader.viewerSettings.columnGap != columnGap;
        
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme){
            //$("html").addClass("_" + readerSettings.theme);
            $("html").attr("data-theme", readerSettings.theme);
            
            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
        }

        if (needViewRefresh){
            window.setTimeout(reader.handleViewportResize, 100);
        }
    }
    
    var updateSliderLabels = function($slider, val, txt)
    {
        $slider.attr("aria-valuenow", val+"");
        $slider.attr("aria-value-now", val+"");
        
        $slider.attr("aria-valuetext", txt+"");
        $slider.attr("aria-value-text", txt+"");
    };

	var initDialog = function(reader){
		$('#app-container').append(SettingsDialog({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));

		$previewText = $('.preview-text');
        $('.theme-option').on('click', function(){
            var newTheme = $(this).attr('data-theme');
            setPreviewTheme($previewText, newTheme);
        });
        
        var $marginSlider = $("#margin-size-input");
        $marginSlider.on("change",
        function() {
            var val = $marginSlider.val();
            
            updateSliderLabels($marginSlider, val, val + ""); // TODO: px, em?
        }
        );
        
        var $fontSizeSlider = $("#font-size-input");
        $fontSizeSlider.on('change', function(){
            var fontSize = $fontSizeSlider.val();
            
            var txt = (fontSize/100) + 'em';
            
            $previewText.css({fontSize: txt});
            
            updateSliderLabels($fontSizeSlider, fontSize/100, txt);
        });

        $('#settings-dialog').on('hide.bs.modal', function(){ // IMPORTANT: not "hidden.bs.modal"!! (because .off() in
        
            // Safety: "save" button click
            setTimeout(function(){
                $("#keyboard-list").empty();
            }, 500);
        });
        
        $('#settings-dialog').on('show.bs.modal', function(){ // IMPORTANT: not "shown.bs.modal"!! (because .off() in library vs. reader context)

            $('#tab-a-main').trigger("click");
            KeyboardSettings.initKeyboardList();

            setTimeout(function(){ $('#closeSettingsCross')[0].focus(); }, 1000); //tab-butt-main
        
            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                
                var txt = readerSettings.fontSize/100 + 'em';
                
                $fontSizeSlider.val(readerSettings.fontSize);
                
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize/100, txt);
                
                
                $marginSlider.val(readerSettings.columnGap);
                
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap);

                if (readerSettings.syntheticSpread == "double"){
                    $('#two-up-option input').prop('checked', true);
                }
                else if (readerSettings.syntheticSpread == "single"){
                    $('#one-up-option input').prop('checked', true);
                }
                else {
                    $('#spread-default-option input').prop('checked', true);
                }
                
                if(readerSettings.scroll == "scroll-doc") {
                    $('#scroll-doc-option input').prop('checked', true);
                }
                else if(readerSettings.scroll == "scroll-continuous") {
                    $('#scroll-continuous-option input').prop('checked', true);
                }
                else {
                    $('#scroll-default-option input').prop('checked', true);
                }
                
                if (readerSettings.pageTransition === 0)
                {
                    $('#pageTransition-1-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 1)
                {
                    $('#pageTransition-2-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 2)
                {
                    $('#pageTransition-3-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 3)
                {
                    $('#pageTransition-4-option input').prop('checked', true);
                }
                else
                {
                    $('#pageTransition-none-option input').prop('checked', true);
                }
                
                if (readerSettings.theme){
                    setPreviewTheme($previewText, readerSettings.theme);
                }
                
                $previewText.css({fontSize: txt});
            });
        });

        var save = function(){
            
            var readerSettings = {
                fontSize : Number($fontSizeSlider.val()),
                syntheticSpread: "auto",
                columnGap : Number($marginSlider.val()),
                scroll: "auto"
            };

            if($('#scroll-doc-option input').prop('checked')) {
                readerSettings.scroll = "scroll-doc";
            }
            else if($('#scroll-continuous-option input').prop('checked')) {
                readerSettings.scroll = "scroll-continuous";
            }

            if($('#two-up-option input').prop('checked')) {
                readerSettings.syntheticSpread = "double";
            }
            else if($('#one-up-option input').prop('checked')) {
                readerSettings.syntheticSpread = "single";
            }

            if($('#pageTransition-1-option input').prop('checked')) {
                readerSettings.pageTransition = 0;
            } else if($('#pageTransition-2-option input').prop('checked')) {
                readerSettings.pageTransition = 1;
            } else if($('#pageTransition-3-option input').prop('checked')) {
                readerSettings.pageTransition = 2;
            } else if($('#pageTransition-4-option input').prop('checked')) {
                readerSettings.pageTransition = 3;
            } else {
                readerSettings.pageTransition = -1;
            }

            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){
               updateReader(reader, readerSettings, true);
	        }


            var keys = KeyboardSettings.saveKeys();
            
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

                json.keyboard = keys;
                // if (keys)
                // {
                //     for (prop in keys)
                //     {
                //         if (keys.hasOwnProperty(prop))
                //         {
                //             json.keyboard[prop] = keys[prop];
                //         }
                //     }
                // }

                Settings.put('reader', json);
                
                setTimeout(function()
                {
                    Keyboard.applySettings(json);
                }, 100);
            });
        };
        
        Keyboard.on(Keyboard.NightTheme, 'settings', function(){

                Settings.get('reader', function(json)
                {
                    if (!json)
                    {
                        json = {};
                    }

                    var isNight = json.theme === "night-theme";
                    json.theme = isNight ? "author-theme" : "night-theme";
                    
                    Settings.put('reader', json);

                    if (reader) updateReader(reader, json);
                });
        });
        
        Keyboard.on(Keyboard.SettingsModalSave, 'settings', function() {
            save();
            $('#settings-dialog').modal('hide');
        });

        Keyboard.on(Keyboard.SettingsModalClose, 'settings', function() {
            $('#settings-dialog').modal('hide');
        });
        
        $('#settings-dialog .btn-primary').on('click', save);
	}

	return {
		initDialog : initDialog,
		updateReader : updateReader,
		defaultSettings : defaultSettings,
        updateBookLayout : updateBookLayout
	}
});
