define(['./ModuleConfig', 'hgn!readium_js_viewer_html_templates/settings-dialog.html', './ReaderSettingsDialog_Keyboard', 'i18nStrings', './Dialogs', 'Settings', './Keyboard'], function(moduleConfig, SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){

    // change these values to affec the default state of the application's preferences at first-run.
    var defaultSettings = {
        fontSize: 100,
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

                // reset column gap top default, as page width control is now used (see readerSettings.columnMaxWidth) 
                readerSettings.columnGap = defaultSettings.columnGap;
                //
                $marginSlider.val(readerSettings.columnGap);
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap + "px", Strings.i18n_margins);

                var maxVal = Number($columnMaxWidthSlider.attr("max"));

                var columnMaxWidth_text = (readerSettings.columnMaxWidth >= maxVal) ? Strings.i18n_pageMaxWidth_Disabled : (readerSettings.columnMaxWidth + "px");
                $columnMaxWidthSlider.val(readerSettings.columnMaxWidth);
                updateSliderLabels($columnMaxWidthSlider, readerSettings.columnMaxWidth, columnMaxWidth_text, Strings.i18n_pageMaxWidth);

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

            var readerSettings = {
                fontSize: Number($fontSizeSlider.val()),
                syntheticSpread: "auto",
                columnGap: Number($marginSlider.val()),
                columnMaxWidth: Number($columnMaxWidthSlider.val()),
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
        defaultSettings : defaultSettings
    }
});
