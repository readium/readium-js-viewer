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
    
    var updateReader = function(reader, readerSettings) {
		
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme){
            //$("html").addClass("_" + readerSettings.theme);
            $("html").attr("data-theme", readerSettings.theme);
            
            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
        }
    }
	
	var setRenditionInfo = function(readerSettings) {

		if (readerSettings.renditionSelectionAccessMode === "textual")
		{
			$('#renditions-AccessMode-textual-option input').prop('checked', true);
		}
		else if (readerSettings.renditionSelectionAccessMode === "visual")
		{
			$('#renditions-AccessMode-visual-option input').prop('checked', true);
		}
		else if (readerSettings.renditionSelectionAccessMode === "auditory")
		{
			$('#renditions-AccessMode-auditory-option input').prop('checked', true);
		}
		else if (readerSettings.renditionSelectionAccessMode === "tactile")
		{
			$('#renditions-AccessMode-tactile-option input').prop('checked', true);
		}
		else
		{
			$('#renditions-AccessMode-none-option input').prop('checked', true);
		}
		
		if (readerSettings.renditionSelectionLayout === "reflowable")
		{
			$('#renditions-Layout-reflowable-option input').prop('checked', true);
		}
		else if (readerSettings.renditionSelectionLayout === "pre-paginated")
		{
			$('#renditions-Layout-prepaginated-option input').prop('checked', true);
		}
		else
		{
			$('#renditions-Layout-none-option input').prop('checked', true);
		}
		
		if (!readerSettings.renditionSelectionLanguage || readerSettings.renditionSelectionLanguage === "")
		{
			$('#renditions-Language-text').val('');
		}
		else
		{
			$('#renditions-Language-text').val(readerSettings.renditionSelectionLanguage);
		}
	}
    
	var updateMultipleRenditions = function(multipleRenditions, renditionSelection) {
		var $list = $('#multipleRenditionsList');
		$list.empty();
		$list.data("renditions", multipleRenditions);
		$list.data("renditionsSelection", renditionSelection);
		
		if (!multipleRenditions || !multipleRenditions.renditions) {
			$list.html("");
			return;
		}
		
		for (var i = 0; i < multipleRenditions.renditions.length; i++) {
			var rendition = multipleRenditions.renditions[i];
			$list.append("<li style='border: 1px solid #ccbbcc;" + (i == multipleRenditions.selectedIndex ? "background-color:#ddddee;" : "") + "'>" + "<button style='float: right;' class='renditionSelect' id='renditionSelect_" + i + "' data-renditionIndex='"+i+"'>" + Strings.i18n_multipleRenditionsSelect + "</button>" + "<strong><u>Label</u>: </strong>" + (rendition.Label ? rendition.Label : "") + "<br/>" + "<strong>Layout: </strong>" + (rendition.Layout ? rendition.Layout : "") + "<br/>" + "<strong>Language: </strong>" + (rendition.Language ? rendition.Language : "") + "<br/>" + "<strong>AccessMode: </strong>" + (rendition.AccessMode ? rendition.AccessMode : "") + "<br/>" + "<strong>Media: </strong>" + (rendition.Media ? rendition.Media : "") + "<br/>" + "<strong>OPF: </strong>" + (rendition.opfPath ? rendition.opfPath : "") + "</li>");
		}
		
		$(".renditionSelect").on("click", function() {
			var i = parseInt($(this).attr("data-renditionIndex"));
			var rendition = $list.data("renditions").renditions[i];
		
			setRenditionInfo({
				renditionSelectionAccessMode: rendition.AccessMode,
				renditionSelectionLayout: rendition.Layout,
				renditionSelectionLanguage: rendition.Language
			});
		});
	}
	
    var updateSliderLabels = function($slider, val, txt, label)
    {
        $slider.attr("aria-valuenow", val+"");
        $slider.attr("aria-value-now", val+"");
        
        $slider.attr("aria-valuetext", txt+"");
        $slider.attr("aria-value-text", txt+"");
        
        $slider.attr("title", label + " " + txt);
        $slider.attr("aria-label", label + " " + txt);
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
            
            updateSliderLabels($marginSlider, val, val + "px", Strings.i18n_margins);
        }
        );
        
        var $fontSizeSlider = $("#font-size-input");
        $fontSizeSlider.on('change', function(){
            var fontSize = $fontSizeSlider.val();
            
            $previewText.css({fontSize: (fontSize/100) + 'em'});
            
            updateSliderLabels($fontSizeSlider, fontSize, fontSize + '%', Strings.i18n_font_size);
        });

        $('#tab-butt-main').on('click', function(){
            $("#tab-keyboard").attr('aria-expanded', "false");
            $("#tab-main").attr('aria-expanded', "true");
        });
        $('#tab-butt-keys').on('click', function(){
            $("#tab-main").attr('aria-expanded', "false");
            $("#tab-keyboard").attr('aria-expanded', "true");
        });
        $('#buttSave').on('keydown',function(evt) {
            if(evt.which === 9 && !(evt.shiftKey | evt.ctrlKey | evt.metaKey | evt.altKey)) { // TAB pressed
              evt.preventDefault();
              $('#closeSettingsCross').focus();
            }
        });
        $('#closeSettingsCross').on('keydown',function(evt) {
            if(evt.which === 9 && evt.shiftKey) { // shift-TAB pressed
              evt.preventDefault();
              $('#buttSave').focus();
            }
        });
        
        $('#settings-dialog').on('hide.bs.modal', function(){ // IMPORTANT: not "hidden.bs.modal"!! (because .off() in
        
            // Safety: "save" button click
            setTimeout(function(){
                $("#keyboard-list").empty();
            }, 500);
        });
        
        $('#settings-dialog').on('show.bs.modal', function(){ // IMPORTANT: not "shown.bs.modal"!! (because .off() in library vs. reader context)

            $('#tab-butt-main').trigger("click");
            KeyboardSettings.initKeyboardList();

            setTimeout(function(){ $('#closeSettingsCross')[0].focus(); }, 1000); //tab-butt-main
        
            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                for (prop in defaultSettings)
                {
                    if (defaultSettings.hasOwnProperty(prop) && !readerSettings.hasOwnProperty(prop) && !readerSettings[prop])
                    {
                        readerSettings[prop] = defaultSettings[prop];
                    }
                }

                $fontSizeSlider.val(readerSettings.fontSize);
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize, readerSettings.fontSize + '%', Strings.i18n_font_size);
                
                
                $marginSlider.val(readerSettings.columnGap);
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap + "px", Strings.i18n_margins);

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
                
				setRenditionInfo(readerSettings);
				
                if (readerSettings.theme){
                    setPreviewTheme($previewText, readerSettings.theme);
                }
                
                $previewText.css({fontSize: (readerSettings.fontSize/100) + 'em'});
            });
        });

        var save = function(){
            
            var readerSettings = {
                fontSize: Number($fontSizeSlider.val()),
                syntheticSpread: "auto",
                columnGap: Number($marginSlider.val()),
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

		
			if ($('#renditions-AccessMode-textual-option input').prop('checked'))
			{
				readerSettings.renditionSelectionAccessMode = "textual";
			}
			else if ($('#renditions-AccessMode-visual-option input').prop('checked'))
			{
				readerSettings.renditionSelectionAccessMode = "visual";
			}
			else if ($('#renditions-AccessMode-auditory-option input').prop('checked'))
			{
				readerSettings.renditionSelectionAccessMode = "auditory";
			}
			else if ($('#renditions-AccessMode-tactile-option input').prop('checked'))
			{
				readerSettings.renditionSelectionAccessMode = "tactile";
			}
			else
			{
				readerSettings.renditionSelectionAccessMode = "";
			}
			
			if ($('#renditions-Layout-reflowable-option input').prop('checked'))
			{
				readerSettings.renditionSelectionLayout = "reflowable";
			}
			else if ($('#renditions-Layout-prepaginated-option input').prop('checked'))
			{
				readerSettings.renditionSelectionLayout = "pre-paginated";
			}
			else
			{
				readerSettings.renditionSelectionLayout = "";
			}
			
			// TODO check input syntax? (IETF language tag + script subtag)
			readerSettings.renditionSelectionLanguage = $('#renditions-Language-text').val();
			
			
			
            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){
               updateReader(reader, readerSettings);
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
					
					var $list = $('#multipleRenditionsList');
			
					//var multipleRenditions = $list.data("renditions");
					var renditionSelection = $list.data("renditionsSelection");
					if (renditionSelection && renditionSelection.renditionReload) {
						renditionSelection.renditionReload();
					}
					
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
		updateMultipleRenditions : updateMultipleRenditions
	}
});
