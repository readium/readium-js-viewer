define(['hgn!templates/settings-dialog.html', 'i18n/Strings', 'Dialogs', 'storage/Settings', 'Keyboard'], function(SettingsDialog, Strings, Dialogs, Settings, Keyboard){
	var defaultSettings = {
        fontSize: 100,
        isSyntheticSpread: window.innerWidth >= 800,
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
        
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme){
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

        var $keyboardList = $("#keyboard-list");
        $('#keyboard-button').on('click', function(){

            var hidden = $keyboardList.attr("hidden");
            if (hidden && hidden.length && hidden[0])
            {
                var html = "";

                html += '<li id="resetAllKeysTOP" class="resetAllKeys">';
                //html += "&nbsp;<br/>";
                html += '<button class="resetKey" role="button" tabindex="1000" title="'+Strings.i18n_reset_key_all+'" aria-label="'+Strings.i18n_reset_key_all+'"><span aria-hidden="true">'+Strings.i18n_reset_key_all+'  &#8855;</span></button>';
                html += "</li>";
                
                for (prop in Keyboard)
                {
                    if (!Keyboard.hasOwnProperty(prop)) continue;

                    if (typeof Keyboard[prop] !== 'string') continue;
                    
                    html += '<li>';
                    
                    html += '<label id="label_'+prop+'">';
                    html += Keyboard.i18n[prop];
                    html += "<br/>";
                    html += '<span>';
                    html += prop;
                    html += "</span>";
                    html += "</label>";
                    
                    html += '<input id="'+prop+'" name="'+prop+'" type="text" tabindex="1000" placeholder="'+Keyboard[prop]+'" value="'+Keyboard[prop]+'" aria-labelledbyxxx="label_'+prop+'" aria-label="'+Keyboard.i18n[prop]+'" title="'+Keyboard.i18n[prop]+'"></input>';
                    html += '<button class="resetKey captureKeyboardShortcut" role="button" data-key="'+prop+'" tabindex="1000" title="'+Strings.i18n_reset_key+' ('+Keyboard.defaultOptions[prop]+')" aria-label="'+Strings.i18n_reset_key+' ('+Keyboard.defaultOptions[prop]+')"><span aria-hidden="true">&#8855;</span></button>';
                    
                    html += "</li>";
                }
                
                html += '<li id="resetAllKeysBOTTOM" class="resetAllKeys">';
                //html += "&nbsp;<br/>";
                html += '<button class="resetKey" role="button" tabindex="1000" title="'+Strings.i18n_reset_key_all+'" aria-label="'+Strings.i18n_reset_key_all+'"><span aria-hidden="true">'+Strings.i18n_reset_key_all+'  &#8855;</span></button>';
                html += "</li>";
                    
                $keyboardList.append(html);
                $keyboardList.removeAttr("hidden");
                
                // KEYSTROKE CAPTURE DOES NOT WORK, BECAUSE HTML ACCESSKEYS GET IN THE WAY (e.g. CTRL ALT M => play audio)
                // var oldScope = undefined;
                // $(".captureKeyboardShortcut").on("focus",
                // function(e)
                // {
                //     oldScope = key.getScope();
                //     key.setScope("captureKeyboardShortcut");
                // });
                // $(".captureKeyboardShortcut").on("blur",
                // function(e)
                // {
                //     if (oldScope) key.setScope(oldScope);
                // });
                // $(".captureKeyboardShortcut").on("keydown",
                // //document.addEventListener('keydown',
                // function()
                // {
                //     // var clazz = (e.sourceElement || e.target).getAttribute("class");
                //     // if (!clazz || clazz.indexOf("captureKeyboardShortcut") < 0) return;
                //     
                //     //str.charCodeAt(0);
                //     console.log(key.shift);
                //     console.log(key.control);
                //     console.log(key.alt);
                //     console.log(key.command);
                //     console.log(key.getPressedKeyCodes());
                //     
                //     var keys = key.getPressedKeyCodes();
                //     if (keys && keys.length) keys = keys[0];
                // 
                //     var keystroke = (key.shift ? "shift+" : "") + (key.control ? "ctrl+" : "") + (key.alt ? "alt+" : "") + (key.command ? "command+" : "") + keys;
                // 
                //     $that = $(this);
                //     var id = $that.attr("data-key");
                //     $input = $("input#"+id);
                //     $input.val(keystroke);
                // 
                //     // e.preventDefault();
                //     // e.stopPropagation();
                //     // return false;
                // });

                $(".resetKey").on("click", function()
                {
                    $that = $(this);
                    var id = $that.attr("data-key");
                    if (id)
                    {
                        $input = $("input#"+id);
                        
                        //$input.val($input.attr("placeholder"));
                        $input.val(Keyboard.defaultOptions[id]);
                    }
                    else
                    {
                        $(".resetKey[data-key]").trigger("click");
                    }
                });
            }
            else
            {
                $keyboardList.empty();
                $keyboardList.attr("hidden", "hidden");
            }
        });
        

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
            $keyboardList.empty();
            $keyboardList.attr("hidden", "hidden");
        });
        
        $('#settings-dialog').on('show.bs.modal', function(){ // IMPORTANT: not "shown.bs.modal"!! (because .off() in library vs. reader context)
            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                
                var txt = readerSettings.fontSize/100 + 'em';
                
                $fontSizeSlider.val(readerSettings.fontSize);
                
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize/100, txt);
                
                
                $marginSlider.val(readerSettings.columnGap);
                
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap);
                
                if (readerSettings.isSyntheticSpread){
                    $('#two-up-option input').prop('checked', true);
                }
                else{
                    $('#one-up-option input').prop('checked', true);
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
                isSyntheticSpread :  $('#two-up-option input').prop('checked'),
                columnGap : Number($marginSlider.val())
            }
            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){
               updateReader(reader, readerSettings, true);
	        }

            var atLeastOneChanged = false;
            var keys = {};
            $("#keyboard-list > li > input").each(function()
            {
                var $that = $(this);

                var original = $that.attr("placeholder");
                var id = $that.attr("id");
                var val = $that.val(); //.trim();
                val = val.replace(/ /g, "");

                if (!val.length) return true; // continue

                val = val.toLowerCase();

                if (original !== val) atLeastOneChanged = true;

                if (val !== Keyboard.defaultOptions[id])
                {
                    keys[id] = val;
                }
            });
            if (atLeastOneChanged)
            {
                // TODO: anything more elegant than alert() ?
                //alert(Strings.i18n_keyboard_reload);
                
                Dialogs.showModalMessage("Readium - " + Strings.i18n_keyboard_shortcuts, Strings.i18n_keyboard_reload);
            }
            
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
                    json.theme = isNight ? "default-theme" : "night-theme";
                    
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