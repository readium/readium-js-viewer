define(['./ModuleConfig', 'hgn!readium_js_viewer_html_templates/settings-dialog.html', './ReaderSettingsDialog_Keyboard', 'i18nStrings', './Dialogs', 'Settings', './Keyboard'], function(moduleConfig, SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){

    // change these values to affec the default state of the application's preferences at first-run.
    var defaultSettings = {
        fontSize: 100,
        fontSelection: 0, //0 is the index of default for our purposes.
        syntheticSpread: "auto",
        scroll: "auto",
        columnGap: 60,
        columnMaxWidth: 550,
        columnMinWidth: 400
    }

    var getBookStyles = function(theme){
        var isAuthorTheme = theme === "author-theme";
        var $previewText = $('.preview-text');
        setPreviewTheme($previewText, theme);
        var previewStyle = window.getComputedStyle($previewText[0]);
        var bookStyles = [{
            selector: ':not(a):not(hypothesis-highlight)', // or "html", or "*", or "", or undefined (styles applied to whole document)
            declarations: {
            backgroundColor: isAuthorTheme ? "" : previewStyle.backgroundColor,
            color: isAuthorTheme ? "" : previewStyle.color
        }},
        {
            selector: 'a', // so that hyperlinks stand out (otherwise they are invisible, and we do not have a configured colour scheme for each theme (TODO? add hyperlinks colours in addition to basic 2x params backgroundColor and color?).
            declarations: {
            backgroundColor: isAuthorTheme ? "" : previewStyle.color,
            color: isAuthorTheme ? "" : previewStyle.backgroundColor
        }}];
        return bookStyles;
    }
    var setPreviewTheme = function($previewText, newTheme){
        var previewTheme = $previewText.attr('data-theme');
        $previewText.removeClass(previewTheme);
        $previewText.addClass(newTheme);
        $previewText.attr('data-theme', newTheme);
    }

    var updateReader = function(reader, readerSettings){
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme){
            //$("html").addClass("_" + readerSettings.theme);
            $("html").attr("data-theme", readerSettings.theme);

            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
        }
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
        $('#app-container').append(SettingsDialog({imagePathPrefix: moduleConfig.imagePathPrefix, strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));

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
        
        var $columnMaxWidthSlider = $("#column-max-width-input");
        $columnMaxWidthSlider.on("change",
        function() {
            var val = $columnMaxWidthSlider.val();
            
            var maxVal = Number($columnMaxWidthSlider.attr("max"));

            var columnMaxWidth_text = (val >= maxVal) ? Strings.i18n_pageMaxWidth_Disabled : (val + "px");
            
            updateSliderLabels($columnMaxWidthSlider, val, columnMaxWidth_text, Strings.i18n_pageMaxWidth);
        }
        );
        

        var $fontSizeSlider = $("#font-size-input");
        $fontSizeSlider.on('change', function(){
            var fontSize = $fontSizeSlider.val();

            $previewText.css({fontSize: (fontSize/100) + 'em'});

            updateSliderLabels($fontSizeSlider, fontSize, fontSize + '%', Strings.i18n_font_size);
        });

        var $fontSelectionList = $("#font-selection-input");
        $fontSelectionList.change(function(){
            var fontSelection = Number($fontSelectionList.find("option:selected").val());
            if(fontSelection === 0){
                $previewText.css({fontFamily: ""});
			} else {
                var font = moduleConfig.fonts[fontSelection-1].fontFamily;
                $previewText.css({fontFamily: font});
			}
		});
    

        $('#tab-butt-main').on('click', function(){
            $("#tab-keyboard").attr('aria-expanded', "false");
            $("#tab-main").attr('aria-expanded', "true");
        });
        $('#tab-butt-keys').on('click', function(){
            $("#tab-main").attr('aria-expanded', "false");
            $("#tab-keyboard").attr('aria-expanded', "true");
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
                    if (defaultSettings.hasOwnProperty(prop) && (!readerSettings.hasOwnProperty(prop) || (typeof readerSettings[prop] == "undefined")))
                    {
                        readerSettings[prop] = defaultSettings[prop];
                    }
                }

                $fontSizeSlider.val(readerSettings.fontSize);
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize, readerSettings.fontSize + '%', Strings.i18n_font_size);

                var loadedUrls = []; //contains the URL's for fonts. If it exists already, we won't load it again.
                if($fontSelectionList[0].childElementCount == 1){ 
                    //If this settings dialog has been created before, (If the user loaded the settings dialog for example) the combo box isn't destroyed on save. Therefore, we must only populate it on the first instance.
                    $.each(moduleConfig.fonts, function(index, fontObj){
                        index++;
                        var curName = fontObj.displayName;
                        if(fontObj.url){ //No url, no problem so long as there's a font that works.
                            var fontPayload  = '<link id="fontStyle_'+index+'" rel="stylesheet" type="text/css" href="'+fontObj.url+'"/>';
                            if(loadedUrls.indexOf(fontObj.url) < 0){
                                var item = $("head").append(fontPayload);
                                loadedUrls.push(fontObj.url)
                            }
                        }
                        
                        var isSelected = (readerSettings.fontSelection === index ? "selected" : "");
                        var curOption = '<option   '+isSelected+' value="'+index+'" aria-label="'+curName+'" title="'+curName+'">'+curName+'</option>';
                        $fontSelectionList.append(curOption);
                        if(isSelected) {
                            //Works because if it's not selected, it's the empty string.
                            $previewText.css({
                                fontFamily : fontObj.fontFamily
                            });
                        }
                    });
                }

                // reset column gap top default, as page width control is now used (see readerSettings.columnMaxWidth) 
                readerSettings.columnGap = defaultSettings.columnGap;
                //
                $marginSlider.val(readerSettings.columnGap);
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap + "px", Strings.i18n_margins);

                var maxVal = Number($columnMaxWidthSlider.attr("max"));
                
                var columnMaxWidth = readerSettings.columnMaxWidth;
                if (columnMaxWidth >= maxVal) columnMaxWidth = maxVal;
                
                var columnMaxWidth_text = (columnMaxWidth >= maxVal) ? Strings.i18n_pageMaxWidth_Disabled : (columnMaxWidth + "px");
                $columnMaxWidthSlider.val(columnMaxWidth);
                updateSliderLabels($columnMaxWidthSlider, columnMaxWidth, columnMaxWidth_text, Strings.i18n_pageMaxWidth);

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

                $previewText.css({fontSize: (readerSettings.fontSize/100) + 'em'});
            });
        });

        var save = function(){

            var maxVal = Number($columnMaxWidthSlider.attr("max"));
            var columnMaxWidth = Number($columnMaxWidthSlider.val());
            if (columnMaxWidth >= maxVal) columnMaxWidth = 99999; // really big pixel distance
            
            var readerSettings = {
                fontSize: Number($fontSizeSlider.val()),
                fontSelection: Number($fontSelectionList.val()),
                syntheticSpread: "auto",
                columnGap: Number($marginSlider.val()),
                columnMaxWidth: columnMaxWidth,
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

                // Note: automatically JSON.stringify's the passed value!
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
                    
                    // Note: automatically JSON.stringify's the passed value!
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
        defaultSettings : defaultSettings
    }
});
