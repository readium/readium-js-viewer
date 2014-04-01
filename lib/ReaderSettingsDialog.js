define(['hgn!templates/settings-keyboard-item.html', 'hgn!templates/settings-dialog.html', 'i18n/Strings', 'Dialogs', 'storage/Settings', 'Keyboard'], function(KeyboardItem, SettingsDialog, Strings, Dialogs, Settings, Keyboard){
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
            $('#epub-reader-frame').css({width: "100%"});
            $('#epub-reader-container').css({padding: "30px"});
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

    
    var checkKeyboardShortcuts = function($focusedInput, typing)
    {
        var duplicate = false;
        var invalid = false;

        var $keyboardList = $("#keyboard-list");
    
        var wasAlert = $keyboardList.hasClass("atLeastOneInvalidOrDuplicateShortcut");
    
        $keyboardList.removeClass("atLeastOneInvalidOrDuplicateShortcut");
        
        var alertInvalidKeyboard = $("#invalid_keyboard_shortcut_ALERT")[0];
        
        alertInvalidKeyboard.removeAttribute("role");
        alertInvalidKeyboard.removeAttribute("aria-live");
        alertInvalidKeyboard.removeAttribute("aria-atomic");

        //alertInvalidKeyboard.style.clip = "rect(0px,0px,0px,0px)";
        
        while (alertInvalidKeyboard.firstChild) {
            alertInvalidKeyboard.removeChild(alertInvalidKeyboard.firstChild);
        }
        
        var focusedInputIsInvalid = false;
        
        var $inputs = $(".keyboardInput");
        $inputs.each(function()
        {
            var $that = $(this);

            $that.parent().removeClass("duplicateShortcut");
            $that[0].removeAttribute("aria-invalid");
            
            checkKeyboardShortcut($that, typing);
            
            if ($that.parent().hasClass("invalidShortcut"))
            {
                $that[0].setAttribute("aria-invalid", "true");
                invalid = true;
                
                if ($focusedInput && $focusedInput.length && $focusedInput[0] === $that[0])
                {
                    focusedInputIsInvalid = true;
                }
            }
        });

        var focusedInputIsDuplicate = false;

        // duplicates
        $inputs.each(function()
        {
            var $that = $(this);
            $inputs.each(function()
            {
                var $self = $(this);
                if ($self[0] === $that[0]) return true; //continue
                
                if ($self.attr("data-val") === $that.attr("data-val"))
                {
                    duplicate = true;
                    
                
                    if ($focusedInput && $focusedInput.length && ($focusedInput[0] === $that[0] || $focusedInput[0] === $self[0]))
                    {
                        focusedInputIsDuplicate = true;
                    }

                    $that[0].setAttribute("aria-invalid", "true");
                    $self[0].setAttribute("aria-invalid", "true");
                    
                    if (!$self.parent().hasClass("duplicateShortcut")) $self.parent().addClass("duplicateShortcut");
                    if (!$that.parent().hasClass("duplicateShortcut")) $that.parent().addClass("duplicateShortcut");
                }
            });
        });
        
        if (duplicate || invalid)
        {
            $keyboardList.addClass("atLeastOneInvalidOrDuplicateShortcut");

            if (focusedInputIsInvalid || focusedInputIsDuplicate)
            {
                if (wasAlert)
                    alertInvalidKeyboard.setAttribute("aria-live", "polite");
                else
                    alertInvalidKeyboard.setAttribute("role", "alert"); //alertInvalidKeyboard.setAttribute("aria-live", "assertive");
                                
                alertInvalidKeyboard.setAttribute("aria-atomic", "true");
            
                var txt = document.createTextNode(focusedInputIsInvalid ? Strings.i18n_invalid_keyboard_shortcut : Strings.i18n_duplicate_keyboard_shortcut);
                alertInvalidKeyboard.appendChild(txt);
            
                //alertInvalidKeyboard.style.clip = "auto";
                
                alertInvalidKeyboard.style.visibility = "hidden";
                alertInvalidKeyboard.style.visibility = "visible";
            }
        }
    };
    
    var checkKeyboardShortcut = function($input, typing)
    {
        $input.parent().removeClass("invalidShortcut");
        $input.attr("data-val", $input.val());
        
        var current = $input.val().toLowerCase().trim();
        
        var shift = false;
        var ctrl = false;
        var alt = false;
        
        if (current.indexOf("shift") >= 0) shift = true;
        if (current.indexOf("ctrl") >= 0) ctrl = true;
        if (current.indexOf("alt") >= 0) alt = true;
        
        var hasPlus = current.lastIndexOf("+") === current.length - 1;
        
        current = current.replace(/shift/g, '');
        current = current.replace(/ctrl/g, '');
        current = current.replace(/alt/g, '');
        current = current.replace(/\+/g, '');
        current = current.replace(/\s/g, '');
        current = current.trim();
        
        if (hasPlus)
        {
            current = current + "+";
        }
        
        if (current.match(/^[0-9A-Za-z]$/) || current.match(/^backspace$/) || current.match(/^space$/) || current.match(/^return$/) || current.match(/^enter$/) || current.match(/^left$/) || current.match(/^right$/) || current.match(/^up$/) || current.match(/^down$/))
        {
            var normalised = (shift?"shift + ":"") + (ctrl?"ctrl + ":"") + (alt?"alt + ":"") + current;
            $input.attr("data-val", normalised);
            if (!typing) $input.val(normalised);
        }
        else
        {
            $input.parent().addClass("invalidShortcut");
        }
    };
    
    var initKeyboardList = function()
    {
        var $keyboardList = $("#keyboard-list");
    
        $keyboardList.empty();
        
        $keyboardList.append(KeyboardItem({strings: Strings, id: "TOP" }));
        
        for (prop in Keyboard)
        {
            if (!Keyboard.hasOwnProperty(prop)) continue;

            if (typeof Keyboard[prop] !== 'string') continue;

            $keyboardList.append(KeyboardItem({strings: Strings, keyboard: Keyboard, name: prop, shortcut: Keyboard[prop], i18n: Keyboard.i18n[prop], def: Keyboard.defaultOptions[prop] }));
        }

        $keyboardList.append(KeyboardItem({strings: Strings, id: "BOTTOM" }));
        
        checkKeyboardShortcuts();
        
        var _previousInputVal = undefined;
        
        $(".keyboardInput").on("blur",
        function(e)
        {
            var $that = $(this);
            _previousInputVal = undefined;
            checkKeyboardShortcuts();
        });
        
        $(".keyboardInput").on("focus",
        function(e)
        {
            var $that = $(this);
            checkKeyboardShortcuts($that, true);
        });

        var debouncedKeyboardValidator = _.bind(_.debounce(checkKeyboardShortcuts, 700), this);
        
        $(".keyboardInput").on("keyup", function(){
            var $that = $(this);
            var val = $that.val();
            if (val !== _previousInputVal)
            {
                debouncedKeyboardValidator($that, true);
            }
            _previousInputVal = val;
        });
         
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
                var $input = $("input#"+id);
                
                //$input.val($input.attr("placeholder"));
                $input.val(Keyboard.defaultOptions[id]);
            }
            else
            {
                //$(".resetKey[data-key]").trigger("click");
                $(".resetKey[data-key]").each(function()
                {
                    var $self = $(this);
                    var id = $self.attr("data-key");
                    if (id)
                    {
                        var $input = $("input#"+id);
                
                        //$input.val($input.attr("placeholder"));
                        $input.val(Keyboard.defaultOptions[id]);
                    }
                });
            }

            checkKeyboardShortcuts();
        });
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
            initKeyboardList();

            setTimeout(function(){ $('#closeSettingsCross')[0].focus(); }, 1000); //tab-butt-main
        
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
            
            checkKeyboardShortcuts();
            $(".keyboardInput").each(function()
            {
                var $that = $(this);
                
                if ($that.parent().hasClass("invalidShortcut") || $that.parent().hasClass("duplicateShortcut")) return true; // continue
                
                var original = $that.attr("placeholder");
                var id = $that.attr("id");
                
                var val = $that.attr("data-val"); //$that.val();
                
                //already normalised by checkKeyboardShortcuts()
                //.trim();
                //val = val.replace(/ /g, "");

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