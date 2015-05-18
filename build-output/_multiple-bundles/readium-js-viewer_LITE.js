define('readium_js_viewer/Spinner',['spin'], function(Spinner){
	var opts = {
      lines: 17, // The number of lines to draw
      length: 0, // The length of each line
      width: 10, // The line thickness
      radius: 48, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 66, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent in px
      left: '50%' // Left position relative to parent in px
    };
    return new Spinner(opts);
});
define('readium_js_viewer/storage/Settings',[],function(){
    
    // localStorage may be disabled due to zero-quota issues (e.g. iPad in private browsing mode)
    var _isLocalStorageEnabled = undefined;
    var isLocalStorageEnabled = function() {
        if (_isLocalStorageEnabled) return true;
        if (typeof _isLocalStorageEnabled === "undefined") {
            _isLocalStorageEnabled = false;
            if (localStorage) {
                try {
                    localStorage.setItem("_isLocalStorageEnabled", "?");
                    localStorage.removeItem("_isLocalStorageEnabled");
                    _isLocalStorageEnabled = true;
                } catch(e) {
                }
            }
            return _isLocalStorageEnabled;
        } else {
            return false;
        }
    };
    
	Settings = {
		put : function(key, val, callback){
            if (!isLocalStorageEnabled()) {
                if (callback) callback();
                return;
            }
            
            var val = JSON.stringify(val);
			localStorage[key] = val;
            
			if (callback){
				callback();
			}
		},
		get : function(key, callback){
            if (!isLocalStorageEnabled()) {
                if (callback) callback(null);
                return;
            }
            
			var val = localStorage[key];
			if (val){
				callback(JSON.parse(val));
			}
			else{
				callback(null);
			}
			
		},
		getMultiple : function(keys, callback){
            if (!isLocalStorageEnabled()) {
                if (callback) callback({});
                return;
            }
            
			var retVal = {};
			for (var i = 0; i < keys.length; i++){
				if (localStorage[keys[i]]){
					retVal[keys[i]] = localStorage[keys[i]];
				}
			}
			callback(retVal);
		}
	}
	return Settings;
});

define('text!readium_js_viewer_i18n/_locales/de/messages.json',[],function () { return '{ "about": {\r\n    "message": "Über Readium"\r\n    },\r\n    "preview": {\r\n        "message": "Vorschau"\r\n    },\r\n    "list_view": {\r\n        "message": "Listenansicht"\r\n    },\r\n    "thumbnail_view": {\r\n        "message": "Kachelansicht"\r\n    },\r\n    "view_library": {\r\n        "message": "Bibliothek"\r\n    },\r\n    "highlight_selection": {\r\n        "message": "Ausgewählten Text hervorheben"\r\n    },\r\n    "toc": {\r\n        "message": "Inhaltsverzeichnis"\r\n    },\r\n    "settings": {\r\n        "message": "Einstellungen"\r\n    },\r\n    "enter_fullscreen": {\r\n        "message": "Vollbildmodus"\r\n    },\r\n    "exit_fullscreen": {\r\n        "message": "Vollbildmodus verlassen"\r\n    },\r\n    "chrome_extension_name": {\r\n        "message": "Readium"\r\n    },\r\n    "chrome_extension_description": {\r\n        "message": "Ein Leseprogramm für EPUB3 Bücher."\r\n    },\r\n    "ok" : {\r\n        "message" : "Ok"\r\n    },\r\n    "i18n_readium_library": {\r\n        "message": "Readium Bibliothek"\r\n    },\r\n    "i18n_loading": {\r\n        "message": "Bibliothek wird geladen"\r\n    },\r\n    "i18n_readium_options": {\r\n        "message": "Readium Einstellungen:"\r\n    },\r\n    "i18n_save_changes": {\r\n        "message": "Änderungen speichern"\r\n    },\r\n    "i18n_close": {\r\n        "message": "Schließen"\r\n    },\r\n    "i18n_keyboard_shortcuts": {\r\n        "message": "Funktionstasten"\r\n    },\r\n    "i18n_keyboard_reload": {\r\n        "message": "Bitte laden Sie die Seite im Browser neu, damit die Änderungen der Tastaturkürzel wirksam werden."\r\n    },\r\n    "i18n_reset_key": {\r\n        "message": "Taste zurücksetzen"\r\n    },\r\n    "i18n_reset_key_all": {\r\n        "message": "Alle Funktionstasten auf Standard zurücksetzen"\r\n    },\r\n    "i18n_duplicate_keyboard_shortcut": {\r\n        "message": "Doppelbelegung"\r\n    },\r\n    "i18n_invalid_keyboard_shortcut": {\r\n        "message": "Nicht zulässig"\r\n    },\r\n    "i18n_paginate_all": {\r\n        "message": "Fließtext des EPUB Inhalts paginieren"\r\n    },\r\n    "i18n_automatically": {\r\n        "message": "*.epub URLs automatisch in Readium öffnen"\r\n    },\r\n    "i18n_show_warning": {\r\n        "message": "Warnhinweise beim Entpacken von EPUB Dateien anzeigen"\r\n    },\r\n    "i18n_details": {\r\n        "message": "Details"\r\n    },\r\n    "i18n_read": {\r\n        "message": "Lesen"\r\n    },\r\n    "i18n_delete": {\r\n        "message": "Löschen"\r\n    },\r\n    "i18n_are_you_sure": {\r\n        "message": "Möchten Sie diese Datei wirklich unwiderruflich löschen?"\r\n    },\r\n    "delete_dlg_title": {\r\n        "message": "Löschen bestätigen"\r\n    },\r\n\r\n    "i18n_auto_page_turn_enable": {\r\n        "message": "Automatisches Umblättern einschalten"\r\n    },\r\n    "i18n_auto_page_turn_disable": {\r\n        "message": "Automatisches Umblättern ausschalten"\r\n    },\r\n\r\n    "i18n_playback_scroll_enable": {\r\n        "message": "Scrollen während der Wiedergabe"\r\n    },\r\n    "i18n_playback_scroll_disable": {\r\n        "message": "Kein Scrollen während der Wiedergabe"\r\n    },\r\n    "i18n_audio_touch_enable": {\r\n        "message": "Touch-to-play einschalten"\r\n    },\r\n    "i18n_audio_touch_disable": {\r\n        "message": "Touch-to-play ausschalten"\r\n    },\r\n    "i18n_audio_highlight_default": {\r\n        "message": "Standard"\r\n    },\r\n    "i18n_audio_highlight": {\r\n        "message": "Hervorhebungsfarbe"\r\n    },\r\n\r\n    "delete_progress_title": {\r\n        "message": "Löschen wird ausgeführt"\r\n    },\r\n    "delete_progress_message": {\r\n        "message": "Löschen"\r\n    },\r\n    "migrate_dlg_title": {\r\n        "message": "Bücher migrieren"\r\n    },\r\n    "migrate_dlg_message": {\r\n        "message": "Daten werden geladen..."\r\n    },\r\n    "migrating": {\r\n        "message": "Migrieren..."\r\n    },\r\n    "replace_dlg_title": {\r\n        "message": "Konflikt festgestellt"\r\n    },\r\n    "replace_dlg_message": {\r\n        "message": "Soll das bestehende EPUB wirklich ersetzt werden?"\r\n    },\r\n    "import_dlg_title": {\r\n        "message": "EPUB importieren"\r\n    },\r\n    "import_dlg_message": {\r\n        "message": "EPUB Inhalt überprüfen..."\r\n    },\r\n    "storing_file": {\r\n        "message": "Datei speichern"\r\n    },\r\n    "err_unknown": {\r\n        "message": "Unbekannter Fehler. Für Details öffnen Sie die Konsole."\r\n    },\r\n    "err_storage": {\r\n        "message": "Zugriff auf Dateispeicher nicht möglich."\r\n    },\r\n    "err_epub_corrupt": {\r\n        "message": "Ungültiges oder beschädigtes EPUB Paket"\r\n    },\r\n    "err_dlg_title": {\r\n        "message": "Unerwarteter Fehler"\r\n    },\r\n    "replace" : {\r\n        "message": "Ersetzen"\r\n    },\r\n    "i18n_author": {\r\n        "message": "Autor: "\r\n    },\r\n    "i18n_publisher": {\r\n        "message": "Verlag: "\r\n    },\r\n    "i18n_source": {\r\n        "message": "Quelle: "\r\n    },\r\n    "i18n_pub_date": {\r\n        "message": "Veröffentlicht am: "\r\n    },\r\n    "i18n_modified_date": {\r\n        "message": "Zuletzt geändert am: "\r\n    },\r\n    "i18n_id": {\r\n        "message": "ID: "\r\n    },\r\n    "i18n_epub_version": {\r\n        "message": "EPUB Version: "\r\n    },\r\n    "i18n_created_at": {\r\n        "message": "Erstellt am: "\r\n    },\r\n    "i18n_format": {\r\n        "message": "Format: "\r\n    },\r\n    "i18n_added": {\r\n        "message": "Hinzugefügt am: "\r\n    },\r\n    "i18n_unknown": {\r\n        "message": "Unbekannt"\r\n    },\r\n    "i18n_sorry": {\r\n        "message": "Das aktuelle EPUB enthält für diesen Inhalt keine Media Overlays."\r\n    },\r\n    "i18n_add_items": {\r\n        "message": "Füge Werke zur Bibliothek hinzu."\r\n    },\r\n    "i18n_extracting": {\r\n        "message": "Entpacke: "\r\n    },\r\n    "i18n_add_book_to_readium_library": {\r\n        "message": "Buch zur Readium Bibliothek hinzufügen:"\r\n    },\r\n    "i18n_add_book": {\r\n        "message": "Buch hinzufügen"\r\n    },\r\n    "i18n_cancel": {\r\n        "message": "Abbrechen"\r\n    },\r\n    "i18n_from_the_web": {\r\n        "message": "Internet:"\r\n    },\r\n    "i18n_from_local_file": {\r\n        "message": "Lokale Datei:"\r\n    },\r\n    "i18n_enter_a_url": {\r\n        "message": "URL einer .epub Datei eingeben"\r\n    },\r\n    "i18n_unpacked_directory": {\r\n        "message": "Entpacktes Verzeichnis:"\r\n    },\r\n    "i18n_validate": {\r\n        "message": "Prüfe:"\r\n    },\r\n    "i18n_confirm_that_this_book": {\r\n        "message": "Bestätigung, dass dieses Buch mit EPUB Standards übereinstimmt"\r\n    },\r\n    "i18n_single_pages": {\r\n        "message": "Einzelseiten"\r\n    },\r\n    "i18n_double_pages": {\r\n        "message": "Doppelseiten"\r\n    },\r\n    "i18n_save_settings": {\r\n        "message": "Einstellungen speichern"\r\n    },\r\n    "i18n_font_size": {\r\n        "message": "Schriftgröße"\r\n    },\r\n    "i18n_margins": {\r\n        "message": "Rand"\r\n    },\r\n    "i18n_text_and_background_color": {\r\n        "message": "Text- und Hintergrundfarbe"\r\n    },\r\n    "i18n_author_theme": {\r\n        "message": "Vorgabe des Autors"\r\n    },\r\n    "i18n_black_and_white": {\r\n        "message": "Schwarzweiss"\r\n    },\r\n    "i18n_arabian_nights": {\r\n        "message": "Arabian Nights"\r\n    },\r\n    "i18n_sands_of_dune": {\r\n        "message": "Sands of Dune"\r\n    },\r\n    "i18n_ballard_blues": {\r\n        "message": "Ballard Blues"\r\n    },\r\n    "i18n_vancouver_mist": {\r\n        "message": "Vancouver Mist"\r\n    },\r\n    "i18n_display_format": {\r\n        "message": "Anzeigeformat"\r\n    },\r\n    "i18n_spread_auto": {\r\n        "message": "Automatisch"\r\n    },\r\n    "i18n_scroll_mode": {\r\n        "message": "Scroll Modus"\r\n    },\r\n    "i18n_scroll_mode_auto": {\r\n        "message": "Automatisch"\r\n    },\r\n    "i18n_scroll_mode_doc": {\r\n        "message": "Dokument"\r\n    },\r\n    "i18n_scroll_mode_continuous": {\r\n        "message": "Kontinuierlich"\r\n    },\r\n\r\n    "i18n_page_transition": {\r\n        "message": "Umblätter-Effekt"\r\n    },\r\n    "i18n_page_transition_none": {\r\n        "message": "Keiner"\r\n    },\r\n    "i18n_page_transition_fade": {\r\n        "message": "Fade"\r\n    },\r\n    "i18n_page_transition_slide": {\r\n        "message": "Slide"\r\n    },\r\n    "i18n_page_transition_swoosh": {\r\n        "message": "Swoosh"\r\n    },\r\n    "i18n_page_transition_butterfly": {\r\n        "message": "Butterfly"\r\n    },\r\n    "i18n_html_readium_tm_a_project": {\r\n        "message": "Readium für Chrome ist die Chrome Browser Erweiterung basierend auf ReadiumJS, einem Open-Source Lesesystem und einer JavaScript Bibliothek zur Darstellung von EPUB® Veröffentlichungen in Web-Browsern. ReadiumJS ist ein Projekt der Readium Foundation (Readium.org). Wenn Sie mehr darüber erfahren möchten oder das Projekt unterstützen wollen, besuchen Sie bitte die <a href=\\"http://readium.org/\\">Projekt Homepage</a>."\r\n\r\n    },\r\n    "gethelp": {\r\n        "message": "Falls Sie auf Probleme stoßen, Fragen haben oder \\"Hallo\\" sagen möchten, besuchen Sie <a href=\\"http://idpf.org/forums/readium\\">unser Forum</a>."\r\n    },\r\n    "i18n_toolbar": {\r\n        "message": "Werkzeugleiste"\r\n    },\r\n    "i18n_toolbar_show": {\r\n        "message": "Werkzeugleiste anzeigen"\r\n    },\r\n    "i18n_toolbar_hide": {\r\n        "message": "Werkzeugleiste ausblenden"\r\n    },\r\n    "i18n_audio_play": {\r\n        "message": "Audio - Abspielen"\r\n    },\r\n    "i18n_audio_pause": {\r\n        "message": "Audio - Pause"\r\n    },\r\n    "i18n_audio_play_background": {\r\n        "message": "Hintergrundaudio ein"\r\n    },\r\n    "i18n_audio_pause_background": {\r\n        "message": "Hintergrundaudio aus"\r\n    },\r\n    "i18n_audio_previous": {\r\n        "message": "Vorige Audiophrase"\r\n    },\r\n    "i18n_audio_next": {\r\n        "message": "Nächste Audiophrase"\r\n    },\r\n    "i18n_audio_volume": {\r\n        "message": "Lautstärke"\r\n    },\r\n    "i18n_audio_volume_increase": {\r\n        "message": "Lautstärke erhöhen"\r\n    },\r\n    "i18n_audio_volume_decrease": {\r\n        "message": "Lautstärke verringern"\r\n    },\r\n    "i18n_audio_time": {\r\n        "message": "Audio - Zeitmarke"\r\n    },\r\n    "i18n_audio_mute": {\r\n        "message": "Audio ausschalten"\r\n    },\r\n    "i18n_audio_unmute": {\r\n        "message": "Audio einschalten"\r\n    },\r\n    "i18n_audio_expand": {\r\n        "message": "Erweiterte Audio-Steuerung anzeigen"\r\n    },\r\n    "i18n_audio_collapse": {\r\n        "message": "Erweiterte Audio-Steuerung ausblenden"\r\n    },\r\n    "i18n_audio_esc": {\r\n        "message": "Aktuellen Audio-Bereich verlassen"\r\n    },\r\n    "i18n_audio_rate": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit"\r\n    },\r\n    "i18n_audio_rate_increase": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit erhöhen"\r\n    },\r\n    "i18n_audio_rate_decrease": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit verringern"\r\n    },\r\n    "i18n_audio_rate_reset": {\r\n        "message": "Audio - Wiedergabegeschwindigkeit zurücksetzen"\r\n    },\r\n    "i18n_audio_skip_disable": {\r\n        "message": "Audio - Überspringen unterbinden "\r\n    },\r\n    "i18n_audio_skip_enable": {\r\n        "message": "Audio - Überspringen ermöglichen"\r\n    },\r\n    "i18n_audio_sync": {\r\n        "message": "Text-Audio-Synchronisation"\r\n    },\r\n    "i18n_audio_sync_default": {\r\n        "message": "Nach Vorgabe"\r\n    },\r\n    "i18n_audio_sync_word": {\r\n        "message": "Wort"\r\n    },\r\n    "i18n_audio_sync_sentence": {\r\n        "message": "Satz"\r\n    },\r\n    "i18n_audio_sync_paragraph": {\r\n        "message": "Absatz"\r\n    },\r\n    "i18n_page_previous": {\r\n        "message": "Vorige Seite"\r\n    },\r\n    "i18n_page_next": {\r\n        "message": "Nächste Seite"\r\n    },\r\n    "chrome_accept_languages": {\r\n        "message": "$CHROME$ akzeptiert $languages$ Sprachen",\r\n        "placeholders": {\r\n            "chrome": {\r\n                "content": "Chrome",\r\n                "example": "Chrome"\r\n            },\r\n            "languages": {\r\n                "content": "$1",\r\n                "example": "en-US,ja,sr,de,zh_CN"\r\n            }\r\n        }\r\n    }\r\n}';});


define('text!readium_js_viewer_i18n/_locales/es/messages.json',[],function () { return '{\r\n\r\n    "chrome_extension_name": {\r\n        "message": "Readium"\r\n    },\r\n    "about" : {\r\n        "message" : "Acerca de"\r\n    },\r\n    "preview" : {\r\n        "message" : "Vista previa"\r\n    },\r\n    "list_view" : {\r\n        "message" : "Vista en lista"\r\n    },\r\n    "thumbnail_view" : {\r\n        "message" : "Vista en miniaturas"\r\n    },\r\n    "view_library": {\r\n        "message" : "Biblioteca"\r\n    },\r\n    "highlight_selection" : {\r\n        "message" : "Subrayar texto seleccionado"\r\n    },\r\n    "toc" : {\r\n        "message" : "Tabla de contenidos"\r\n    },\r\n    "settings" : {\r\n        "message" : "Preferencias"\r\n    },\r\n    "enter_fullscreen" : {\r\n        "message" : "Abrir modo de pantalla completa"\r\n    },\r\n    "exit_fullscreen" : {\r\n        "message" : "Cerrar modo de pantalla completa"\r\n    },\r\n    "chrome_extension_description": {\r\n        "message": "Lector de libros EPUB3."\r\n    },\r\n    "ok" : {\r\n        "message" : "Ok"\r\n    },\r\n    "delete_dlg_title" : {\r\n        "message" : "Confirmar eliminación"\r\n    },\r\n    "delete_progress_title" : {\r\n        "message" : "Eliminación en progreso"\r\n    },\r\n    "delete_progress_message" : {\r\n        "message" : "Eliminando"\r\n    },\r\n    "migrate_dlg_title" : {\r\n        "message" : "Migrando libros"\r\n    },\r\n    "migrate_dlg_message" : {\r\n        "message" : "Cargando datos..."\r\n    },\r\n    "migrating" : {\r\n        "message" : "Migrando"\r\n    },\r\n    "replace_dlg_title" : {\r\n        "message": "Se ha detectado un conflicto"\r\n    },\r\n    "replace_dlg_message": {\r\n        "message": "Si decide continuar, el siguiente epub será reemplazado por el que está siendo importado"\r\n    },\r\n    "import_dlg_title" : {\r\n        "message": "Importando EPUB"\r\n    },\r\n    "import_dlg_message" : {\r\n        "message": "Examinando contenido del EPUB..."\r\n    },\r\n    "storing_file" : {\r\n        "message": "Guardando archivo"\r\n    },\r\n    "err_unknown" : {\r\n        "message": "Error desconocido. Chequear la consola para conocer más detalles."\r\n    },\r\n    "err_storage" : {\r\n        "message": "No es posible acceder al dispositvo"\r\n    },\r\n    "err_epub_corrupt" : {\r\n        "message": "Paquete EPUB inválido o corrupto"\r\n    },\r\n    "err_dlg_title" : {\r\n        "message": "Error inesperado"\r\n    },\r\n    "replace" : {\r\n        "message": "Reemplazar"\r\n    },\r\n    "gethelp" : {\r\n        "message" : "Si encuentra algún problema, tiene preguntas, o le gustaría decir hola, visite <a href=\\"http://idpf.org/forums/readium\\">nuestro foro</a>"\r\n    },\r\n    "i18n_readium_library" : {\r\n        "message" : "Biblioteca Readium"\r\n    },\r\n    "i18n_loading" : {\r\n        "message" : "Cargando biblioteca"\r\n    },\r\n    "i18n_readium_options" : {\r\n        "message" : "Readium Opciones:"\r\n    },\r\n    "i18n_save_changes" : {\r\n        "message" : "Guardar cambios"\r\n    },\r\n    "i18n_close" : {\r\n        "message" : "Cerrar"\r\n    },\r\n    "i18n_keyboard_shortcuts" : {\r\n        "message" : "Teclas de acceso rápido"\r\n    },\r\n    "i18n_keyboard_reload" : {\r\n        "message" : "Por favor, actualiza la página para que las teclas de acceso rápido tengan efecto."\r\n    },\r\n    "i18n_reset_key" : {\r\n        "message" : "Reestablecer tecla"\r\n    },\r\n    "i18n_reset_key_all" : {\r\n        "message" : "Reestablecer todos las teclas de acceso rápido"\r\n    },\r\n    "i18n_duplicate_keyboard_shortcut" : {\r\n        "message" : "DUPLICADO"\r\n    },\r\n    "i18n_invalid_keyboard_shortcut" : {\r\n        "message" : "INVALIDO"\r\n    },\r\n    "i18n_paginate_all" : {\r\n        "message" : "Paginar todo el contenido ePUB repaginable"\r\n    },\r\n    "i18n_automatically" : {\r\n        "message" : "Abrir automáticamente urls *.epub en readium"\r\n    },\r\n    "i18n_show_warning" : {\r\n        "message" : "Mostrar advertencias al desempaquetar archivos EPUB"\r\n    },\r\n    "i18n_details" : {\r\n        "message" : "Detalles"\r\n    },\r\n    "i18n_read" : {\r\n        "message" : "Leer"\r\n    },\r\n    "i18n_delete" : {\r\n        "message" : "Eliminar"\r\n    },\r\n    "i18n_author" : {\r\n        "message" : "Autor: "\r\n    },\r\n    "i18n_publisher" : {\r\n        "message" : "Editor: "\r\n    },\r\n    "i18n_source" : {\r\n        "message" : "Fuente: "\r\n    },\r\n    "i18n_pub_date" : {\r\n        "message" : "Fecha de publicación: "\r\n    },\r\n    "i18n_modified_date" : {\r\n        "message" : "Fecha de modificación: "\r\n    },\r\n    "i18n_id" : {\r\n        "message" : "ID: "\r\n    },\r\n    "i18n_epub_version" : {\r\n        "message" : "Versión EPUB: "\r\n    },\r\n    "i18n_created_at" : {\r\n        "message" : "Creado en: "\r\n    },\r\n    "i18n_format" : {\r\n        "message" : "Formato: "\r\n    },\r\n    "i18n_added" : {\r\n        "message" : "Añadido: "\r\n    },\r\n    "i18n_unknown" : {\r\n        "message" : "Desconocido"\r\n    },\r\n    "i18n_sorry" : {\r\n        "message" : "Disculpa, el EPUB actual no contiene superposición multimedia para este contenido"\r\n    },\r\n    "i18n_add_items" : {\r\n        "message" : "¡Añade aquí elementos a tu biblioteca!"\r\n    },\r\n    "i18n_extracting" : {\r\n        "message" : "extrayendo: "\r\n    },\r\n    "i18n_are_you_sure" : {\r\n        "message" : "¿Está seguro que desea eliminar de forma permanente"\r\n    },\r\n    "i18n_add_book_to_readium_library" : {\r\n        "message" : "Añadir libro a biblioteca Readium:"\r\n    },\r\n    "i18n_add_book" : {\r\n        "message" : "Añadir a la biblioteca"\r\n    },\r\n    "i18n_cancel" : {\r\n        "message" : "Cancelar"\r\n    },\r\n    "i18n_from_the_web" : {\r\n        "message" : "Desde la web:"\r\n    },\r\n    "i18n_from_local_file" : {\r\n        "message" : "Desde un archivo local:"\r\n    },\r\n    "i18n_enter_a_url" : {\r\n        "message" : "Ingresa una URL a un archivo .epub"\r\n    },\r\n    "i18n_unpacked_directory" : {\r\n        "message" : "Carpeta descomprimida:"\r\n    },\r\n    "i18n_validate" : {\r\n        "message" : "Validar:"\r\n    },\r\n    "i18n_confirm_that_this_book" : {\r\n        "message" : "Confirmar que este libro cumple con los estándares ePUB"\r\n    },\r\n    "i18n_single_pages" : {\r\n        "message" : "Páginas simple"\r\n    },\r\n    "i18n_double_pages" : {\r\n        "message" : "Páginas doble"\r\n    },\r\n    "i18n_save_settings" : {\r\n        "message" : "Guardar preferencias"\r\n    },\r\n    "i18n_font_size" : {\r\n        "message" : "TAMAÑO DE FUENTE"\r\n    },\r\n    "i18n_margins" : {\r\n        "message" : "MARGENES"\r\n    },\r\n    "i18n_text_and_background_color" : {\r\n        "message" : "COLOR DE FUENTE Y FONDO"\r\n    },\r\n    "i18n_black_and_white" : {\r\n        "message" : "Blanco y negro"\r\n    },\r\n    "i18n_arabian_nights" : {\r\n        "message" : "Las mil y una noches"\r\n    },\r\n    "i18n_sands_of_dune" : {\r\n        "message" : "Arenas de duna"\r\n    },\r\n    "i18n_ballard_blues" : {\r\n        "message" : "Ballard Blues"\r\n    },\r\n    "i18n_vancouver_mist" : {\r\n        "message" : "Bruma de Vancouver"\r\n    },\r\n    "i18n_display_format" : {\r\n        "message" : "MOSTRAR FORMATO"\r\n    },\r\n    "i18n_scroll_mode" : {\r\n        "message" : "MODO DE DESPLAZAMIENTO"\r\n    },\r\n    "i18n_scroll_mode_default" : {\r\n        "message" : "Por defecto"\r\n    },\r\n    "i18n_scroll_mode_doc" : {\r\n        "message" : "Documento"\r\n    },\r\n    "i18n_scroll_mode_continuous" : {\r\n        "message" : "Continuo"\r\n    },\r\n    "i18n_html_readium_tm_a_project" : {\r\n        "message" : "Readium para Chrome es la extensión para Chrome de ReadiumJS, un sistema de lectura de código abierto y librería JavaScript para renderizar publicaciones EPUB® en navegadores web. ReadiumJS es un proyecto de Readium Foundation (Readium.org). Para saber más o contribuir, visita el <a href=\\"http://readium.org/projects/readiumjs\\">sitio del proyecto</a>"\r\n    },\r\n    "i18n_toolbar_show" : {\r\n        "message" : "Mostrar barra de herramientas"\r\n    },\r\n    "i18n_toolbar_hide" : {\r\n        "message" : "Ocultar barra de herramientas"\r\n    },\r\n    "i18n_audio_play" : {\r\n        "message" : "Reproducir"\r\n    },\r\n    "i18n_audio_pause" : {\r\n        "message" : "Pausa"\r\n    },\r\n    "i18n_audio_previous" : {\r\n        "message" : "Frase de audio anterior"\r\n    },\r\n    "i18n_audio_next" : {\r\n        "message" : "Frase de audio siguiente"\r\n    },\r\n    "i18n_audio_volume" : {\r\n        "message" : "Volumen de audio"\r\n    },\r\n    "i18n_audio_volume_increase" : {\r\n        "message" : "Incrementar volumen de audio"\r\n    },\r\n    "i18n_audio_volume_decrease" : {\r\n        "message" : "Reducir volumen de audio"\r\n    },\r\n    "i18n_audio_time" : {\r\n        "message" : "Cursor de tiempo de audio"\r\n    },\r\n    "i18n_audio_mute" : {\r\n        "message" : "Desactivar audio"\r\n    },\r\n    "i18n_audio_unmute" : {\r\n        "message" : "Activar audio"\r\n    },\r\n    "i18n_audio_expand" : {\r\n        "message" : "Mostrar controles avanzados de audio"\r\n    },\r\n    "i18n_audio_collapse" : {\r\n        "message" : "Cerrar controles avanzados de audio"\r\n    },\r\n    "i18n_audio_esc" : {\r\n        "message" : "Salir de contexto actual de audio"\r\n    },\r\n    "i18n_audio_rate" : {\r\n        "message" : "Velocidad de reproducción de audio"\r\n    },\r\n    "i18n_audio_rate_increase" : {\r\n        "message" : "Incrementar velocidad de reproducción de audio"\r\n    },\r\n    "i18n_audio_rate_decrease" : {\r\n        "message" : "Reducir velocidad de reproducción de audio"\r\n    },\r\n    "i18n_audio_rate_reset" : {\r\n        "message" : "Reestablecer reproducción de audio a velocidad normal"\r\n    },\r\n    "i18n_audio_skip_disable" : {\r\n        "message" : "Desactivar capacidad de omisión"\r\n    },\r\n    "i18n_audio_skip_enable" : {\r\n        "message" : "Activar capacidad de omisión"\r\n    },\r\n    "i18n_audio_touch_enable" : {\r\n        "message" : "Activar touch-to-play"\r\n    },\r\n    "i18n_audio_touch_disable" : {\r\n        "message" : "Desactivar touch-to-play"\r\n    },\r\n    "i18n_audio_highlight_default" : {\r\n        "message" : "por defecto"\r\n    },\r\n    "i18n_audio_highlight" : {\r\n        "message" : "Color de audio"\r\n    },\r\n    "i18n_audio_sync" : {\r\n        "message" : "Granularidad de sincronización texto/audio"\r\n    },\r\n    "i18n_audio_sync_default" : {\r\n        "message" : "Por defecto"\r\n    },\r\n    "i18n_audio_sync_word" : {\r\n        "message" : "Palabra"\r\n    },\r\n    "i18n_audio_sync_sentence" : {\r\n        "message" : "Oración"\r\n    },\r\n    "i18n_audio_sync_paragraph" : {\r\n        "message" : "Párrafo"\r\n    },\r\n    "i18n_page_previous" : {\r\n        "message" : "Página previa"\r\n    },\r\n    "i18n_page_next" : {\r\n        "message" : "Página siguiente"\r\n    },\r\n    "i18n_author_theme" : {\r\n      "message" : "Por defecto (estilos de autor)"\r\n    },\r\n\r\n  "i18n_spread_auto" : {\r\n       "message" : "Automático"\r\n    },\r\n\r\n  "i18n_scroll_mode_auto" : {\r\n      "message" : "Automático"\r\n    },\r\n\r\n   "i18n_page_transition" : {\r\n      "message" : "EFECTOS DE PÁGINA"\r\n    },\r\n    "i18n_page_transition_none" : {\r\n      "message" : "Desactivado"\r\n    },\r\n    "i18n_page_transition_fade" : {\r\n      "message" : "Apagarse"\r\n    },\r\n    "i18n_page_transition_slide" : {\r\n      "message" : "Deslizar"\r\n    },\r\n    "i18n_page_transition_swoosh" : {\r\n      "message" : "Swoosh"\r\n    },\r\n    "i18n_page_transition_butterfly" : {\r\n      "message" : "Mariposa"\r\n    },\r\n\r\n  "i18n_toolbar" : {\r\n      "message" : "Barra de herramientas"\r\n    },\r\n\r\n   "i18n_audio_play_background" : {\r\n      "message" : "Reproducir pista en segundo plano"\r\n    },\r\n    "i18n_audio_pause_background" : {\r\n      "message" : "Pausar pista en segundo plano"\r\n},\r\n\r\n   "i18n_auto_page_turn_enable" : {\r\n      "message" : "Activar vuelta de página automática"\r\n    },\r\n    "i18n_auto_page_turn_disable" : {\r\n      "message" : "Desactivar vuelta de página automática"\r\n    },\r\n\r\n   "i18n_playback_scroll_enable" : {\r\n      "message" : "Activar desplazamiento durante la reproducción"\r\n    },\r\n\r\n    "i18n_playback_scroll_disable" : {\r\n      "message" : "Desactivar desplazamiento durante la reproducción"\r\n    },\r\n\r\n    "chrome_accept_languages": {\r\n        "message": "$CHROME$ acepta idiomas $languages$",\r\n        "placeholders": {\r\n            "chrome": {\r\n                "content": "Chrome",\r\n                "example": "Chrome"\r\n            },\r\n            "languages": {\r\n                "content": "$1",\r\n                "example": "en-US,ja,sr,de,zh_CN"\r\n            }\r\n        }\r\n    }\r\n}';});


define('text!readium_js_viewer_i18n/_locales/en_US/messages.json',[],function () { return '{\r\n\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "about" : {\r\n    "message" : "About"\r\n  },\r\n  "preview" : {\r\n    "message" : "PREVIEW"\r\n  },\r\n  "list_view" : {\r\n    "message" : "List View"\r\n  },\r\n  "thumbnail_view" : {\r\n    "message" : "Thumbnail View"\r\n  },\r\n  "view_library": {\r\n    "message" : "Library"\r\n  },\r\n  "highlight_selection" : {\r\n    "message" : "Highlight Selected Text"\r\n  },\r\n  "toc" : {\r\n    "message" : "Table of Contents"\r\n  },\r\n  "settings" : {\r\n    "message" : "Settings"\r\n  },\r\n  "layout" : {\r\n    "message" : "Layout"\r\n  },\r\n  "style" : {\r\n    "message" : "Style"\r\n  },\r\n  "enter_fullscreen" : {\r\n    "message" : "Enter Fullscreen"\r\n  },\r\n  "exit_fullscreen" : {\r\n    "message" : "Exit Fullscreen"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "A reader for EPUB3 books."\r\n  },\r\n  "ok" : {\r\n    "message" : "Ok"\r\n  },\r\n  "delete_dlg_title" : {\r\n    "message" : "Confirm Delete"\r\n  },\r\n  "delete_progress_title" : {\r\n    "message" : "Delete in Progress"\r\n  },\r\n  "delete_progress_message" : {\r\n    "message" : "Deleting"\r\n  },\r\n  "migrate_dlg_title" : {\r\n    "message" : "Migrating Books"\r\n  },\r\n  "migrate_dlg_message" : {\r\n    "message" : "Loading data..."\r\n  },\r\n  "migrating" : {\r\n    "message" : "Migrating"\r\n  },\r\n  "replace_dlg_title" : {\r\n    "message": "Conflict Detected"\r\n  },\r\n  "replace_dlg_message": {\r\n    "message": "If you continue, the following epub will be replaced with the one you are importing"\r\n  },\r\n  "import_dlg_title" : {\r\n    "message": "Importing EPUB"\r\n  },\r\n  "import_dlg_message" : {\r\n    "message": "Examining EPUB content..."\r\n  },\r\n  "storing_file" : {\r\n    "message": "Storing file"\r\n  },\r\n  "err_unknown" : {\r\n    "message": "Unknown error. Check console for more details."\r\n  },\r\n  "err_storage" : {\r\n    "message": "Unable to access storage"\r\n  },\r\n  "err_epub_corrupt" : {\r\n    "message": "Invalid or corrupted EPUB package"\r\n  },\r\n  "err_ajax": {\r\n    "message": "Error in ajax request"\r\n  },\r\n  "err_dlg_title" : {\r\n    "message": "Unexpected Error"\r\n  },\r\n  "replace" : {\r\n    "message": "Replace"\r\n  },\r\n  "gethelp" : {\r\n    "message" : "If you encounter any problems, have questions, or would like to say hello, visit <a href=\\"http://idpf.org/forums/readium\\">our forum</a>"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium Library"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium Options:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Save changes"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Close"\r\n  },\r\n  "i18n_keyboard_shortcuts" : {\r\n    "message" : "Keyboard shortcuts"\r\n  },\r\n  "i18n_keyboard_reload" : {\r\n    "message" : "Please reload the page for keyboard shortcuts to take effect."\r\n  },\r\n  "i18n_reset_key" : {\r\n    "message" : "Reset key"\r\n  },\r\n  "i18n_reset_key_all" : {\r\n    "message" : "Reset all keyboard shortcuts"\r\n  },\r\n  "i18n_duplicate_keyboard_shortcut" : {\r\n    "message" : "DUPLICATE"\r\n  },\r\n  "i18n_invalid_keyboard_shortcut" : {\r\n    "message" : "INVALID"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginate all reflowable ePUB content"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Automatically open *.epub urls in readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Show warning messages when unpacking EPUB files"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Details"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Read"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Delete"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Author: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Publisher: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Source: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Pub Date: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Modified Date: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB version: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Created at: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Format: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Added: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Unknown"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Sorry, the current EPUB does not contain a media overlay for this content"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Add items to your library here!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extracting: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Are you sure you want to permanently delete "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Add Book To Readium Library:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Add to Library"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Cancel"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "From the web:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "From Local File:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Enter a URL to a .epub file"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Unpacked Directory:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Validate:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Confirm that this book complies with ePUB standards"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Single Pages"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Double Pages"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Save Settings"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "FONT SIZE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGINS"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "TEXT AND BACKGROUND COLOR"\r\n  },\r\n  "i18n_author_theme" : {\r\n    "message" : "Default (author styles)"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Black and White"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Arabian Nights"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sands of Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Vancouver Mist"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "DISPLAY FORMAT"\r\n  },\r\n  "i18n_spread_auto" : {\r\n     "message" : "Auto"\r\n  },\r\n  "i18n_scroll_mode" : {\r\n    "message" : "SCROLL MODE"\r\n  },\r\n  "i18n_scroll_mode_auto" : {\r\n    "message" : "Auto"\r\n  },\r\n  "i18n_scroll_mode_doc" : {\r\n    "message" : "Document"\r\n  },\r\n  "i18n_scroll_mode_continuous" : {\r\n    "message" : "Continuous"\r\n  },\r\n  \r\n  "i18n_page_transition" : {\r\n    "message" : "PAGE EFFECTS"\r\n  },\r\n  "i18n_page_transition_none" : {\r\n    "message" : "Disabled"\r\n  },\r\n  "i18n_page_transition_fade" : {\r\n    "message" : "Fade"\r\n  },\r\n  "i18n_page_transition_slide" : {\r\n    "message" : "Slide"\r\n  },\r\n  "i18n_page_transition_swoosh" : {\r\n    "message" : "Swoosh"\r\n  },\r\n  "i18n_page_transition_butterfly" : {\r\n    "message" : "Butterfly"\r\n  },\r\n  \r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium for Chrome is the Chrome browser extension configuration of ReadiumJS, an open source reading system and JavaScript library for displaying EPUB® publications in web browsers. ReadiumJS is a project of the Readium Foundation (Readium.org). To learn more or to contribute, visit the <a href=\\"http://readium.org/projects/readiumjs\\">project homepage</a>"\r\n  },\r\n  "i18n_toolbar" : {\r\n    "message" : "Toolbar"\r\n  },\r\n  "i18n_toolbar_show" : {\r\n    "message" : "Show toolbar"\r\n  },\r\n  "i18n_toolbar_hide" : {\r\n    "message" : "Hide toolbar"\r\n  },\r\n  "i18n_audio_play" : {\r\n    "message" : "Play"\r\n  },\r\n  "i18n_audio_pause" : {\r\n    "message" : "Pause"\r\n  },\r\n  "i18n_audio_play_background" : {\r\n    "message" : "Play background track"\r\n  },\r\n  "i18n_audio_pause_background" : {\r\n    "message" : "Pause background track"\r\n  },\r\n  "i18n_audio_previous" : {\r\n    "message" : "Previous audio phrase"\r\n  },\r\n  "i18n_audio_next" : {\r\n    "message" : "Next audio phrase"\r\n  },\r\n  "i18n_audio_volume" : {\r\n    "message" : "Audio volume"\r\n  },\r\n  "i18n_audio_volume_increase" : {\r\n    "message" : "Increase audio volume"\r\n  },\r\n  "i18n_audio_volume_decrease" : {\r\n    "message" : "Decrease audio volume"\r\n  },\r\n  "i18n_audio_time" : {\r\n    "message" : "Audio time cursor"\r\n  },\r\n  "i18n_audio_mute" : {\r\n    "message" : "Mute audio"\r\n  },\r\n  "i18n_audio_unmute" : {\r\n    "message" : "Unmute audio"\r\n  },\r\n  "i18n_audio_expand" : {\r\n    "message" : "Show advanced audio controls"\r\n  },\r\n  "i18n_audio_collapse" : {\r\n    "message" : "Close advanced audio controls"\r\n  },\r\n  "i18n_audio_esc" : {\r\n    "message" : "Escape current audio context"\r\n  },\r\n  "i18n_audio_rate" : {\r\n    "message" : "Audio playback rate"\r\n  },\r\n  "i18n_audio_rate_increase" : {\r\n    "message" : "Increase audio playback rate"\r\n  },\r\n  "i18n_audio_rate_decrease" : {\r\n    "message" : "Decrease audio playback rate"\r\n  },\r\n  "i18n_audio_rate_reset" : {\r\n    "message" : "Reset audio playback to normal speed"\r\n  },\r\n  "i18n_audio_skip_disable" : {\r\n    "message" : "Disable skippability"\r\n  },\r\n  "i18n_audio_skip_enable" : {\r\n    "message" : "Enable skippability"\r\n  },\r\n\r\n  "i18n_auto_page_turn_enable" : {\r\n    "message" : "Enable automatic page turn"\r\n  },\r\n  "i18n_auto_page_turn_disable" : {\r\n    "message" : "Disable automatic page turn"\r\n  },\r\n\r\n  "i18n_playback_scroll_enable" : {\r\n    "message" : "Enable scroll during playback"\r\n  },\r\n  "i18n_playback_scroll_disable" : {\r\n    "message" : "Disable scroll during playback"\r\n  },\r\n  \r\n  "i18n_audio_touch_enable" : {\r\n    "message" : "Enable touch-to-play"\r\n  },\r\n  "i18n_audio_touch_disable" : {\r\n    "message" : "Disable touch-to-play"\r\n  },\r\n  "i18n_audio_highlight_default" : {\r\n    "message" : "default"\r\n  },\r\n  "i18n_audio_highlight" : {\r\n    "message" : "Audio color"\r\n  },\r\n  "i18n_audio_sync" : {\r\n    "message" : "Text/audio synchronization granularity"\r\n  },\r\n  "i18n_audio_sync_default" : {\r\n    "message" : "Default"\r\n  },\r\n  "i18n_audio_sync_word" : {\r\n    "message" : "Word"\r\n  },\r\n  "i18n_audio_sync_sentence" : {\r\n    "message" : "Sentence"\r\n  },\r\n  "i18n_audio_sync_paragraph" : {\r\n    "message" : "Paragraph"\r\n  },\r\n  "i18n_page_previous" : {\r\n    "message" : "Previous Page"\r\n  },\r\n  "i18n_page_next" : {\r\n    "message" : "Next Page"\r\n  },\r\n  "i18n_page_navigation" : {\r\n    "message" : "Page Navigation"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/fr/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "Un lecteur de livres numériques EPUB3."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Bibliothèque Readium"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Chargement de la bibliothèque"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Options de Readium :"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Enregistrer les changements"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Fermer"\r\n  },\r\n  "i18n_keyboard_shortcuts" : {\r\n    "message" : "Raccourcis clavier"\r\n  },\r\n  "i18n_keyboard_reload" : {\r\n    "message" : "Veuillez recharger la page pour que les raccourcis clavier prennent effet."\r\n  },\r\n  "i18n_reset_key" : {\r\n    "message" : "Réinitialiser le raccourci clavier par défaut"\r\n  },\r\n  "i18n_reset_key_all" : {\r\n    "message" : "Réinitialiser tous les raccourcis clavier par défaut"\r\n  },\r\n  "i18n_duplicate_keyboard_shortcut" : {\r\n    "message" : "DUPLIQUE"\r\n  },\r\n  "i18n_invalid_keyboard_shortcut" : {\r\n    "message" : "INVALIDE"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginer tout le contenu des EPUB recomposables"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Ouvrir automatiquement les urls *.epub dans Readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Montrer les messages d\'avertissement pendant la décompression des fichiers EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Détails"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Lire"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Supprimer"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Auteur : "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Éditeur : "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Source : "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Date de publication :  "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Date de modification : "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "version de l\'EPUB : "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Ajouté le : "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Format : "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Ajouté le : "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Inconnu"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Désolé, l\'EPUB actuel ne contient pas de média associé (media overlay) pour ce contenu"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Ajoutez des articles à votre bibliothèque ici !"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extraction : "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Voulez-vous vraiment supprimer "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Ajoutez un livre à la bibliothèque de Readium :"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Ajouter un livre"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Annuler"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "À partir du Web :"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "À partir d\'un fichier local :"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Entrez l\'URL d\'un fichier .epub"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Répertoire non-compressé :"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Valider :"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Confirmer que ce livre est conforme aux standards EPUB"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Pages simples"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Doubles-pages"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Enregistrer"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "TAILLE DE LA POLICE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGES"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "COULEUR DU TEXTE ET DU FOND"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Noir et Blanc"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Mille et une Nuits"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sables de Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Le Blues de Ballard"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Le Brouillard de Vancouver"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "FORMAT D\'AFFICHAGE"\r\n  },\r\n  "i18n_scroll_mode" : {\r\n    "message" : "MODE DE DÉFILEMENT"\r\n  },\r\n  "i18n_scroll_mode_auto" : {\r\n    "message" : "Auto"\r\n  },\r\n  "i18n_scroll_mode_doc" : {\r\n    "message" : "Document"\r\n  },\r\n  "i18n_scroll_mode_continuous" : {\r\n    "message" : "Continu"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium pour Chrome est l\'extension du navigateur Chrome de ReadiumJS, un système de lecture open-source et une librairie JavaScript pour afficher des documents EPUB® dans les navigateurs web. ReadiumJS est un projet de la fondation Readium (Readium.org). Pour en savoir plus ou pour contribuer, visiter la <a href=\\"http://readium.org/projects/readiumjs\\">page d\'accueil du projet</a>."\r\n  },\r\n  "i18n_audio_play" : {\r\n    "message" : "Jouer"\r\n  },\r\n  "i18n_audio_pause" : {\r\n    "message" : "Pauser"\r\n  },\r\n  "i18n_audio_previous" : {\r\n    "message" : "Phrase audio précédente"\r\n  },\r\n  "i18n_audio_next" : {\r\n    "message" : "Phrase audio suivante"\r\n  },\r\n  "i18n_audio_volume" : {\r\n    "message" : "Ajustement du volume audio"\r\n  },\r\n  "i18n_audio_time" : {\r\n    "message" : "Contrôle du curseur temporel audio"\r\n  },\r\n  "i18n_audio_mute" : {\r\n    "message" : "Silence audio"\r\n  },\r\n  "i18n_audio_unmute" : {\r\n    "message" : "Restaurer le volume audio"\r\n  },\r\n  "i18n_audio_expand" : {\r\n    "message" : "Afficher les contrôles audio avancés"\r\n  },\r\n  "i18n_audio_collapse" : {\r\n    "message" : "Fermer les contrôles audio avancés"\r\n  },\r\n  "i18n_audio_esc" : {\r\n    "message" : "Échapper le contexte audio actuel"\r\n  },\r\n  "i18n_audio_rate" : {\r\n    "message" : "Vitesse de lecture audio"\r\n  },\r\n  "i18n_audio_rate_reset" : {\r\n    "message" : "Retour à la vitesse normale de lecture audio"\r\n  },\r\n  "i18n_audio_skip_disable" : {\r\n    "message" : "Désactiver la \'skippabilité\'"\r\n  },\r\n  "i18n_audio_skip_enable" : {\r\n    "message" : "Activer la \'skippabilité\'"\r\n  },\r\n  "i18n_audio_touch_enable" : {\r\n    "message" : "Activer la fonction \'toucher pour jouer\'"\r\n  },\r\n  "i18n_audio_touch_disable" : {\r\n    "message" : "Désactiver la fonction \'toucher pour jouer\'"\r\n  },\r\n  "i18n_audio_highlight_default" : {\r\n    "message" : "défaut"\r\n  },\r\n  "i18n_audio_highlight" : {\r\n    "message" : "Couleur audio"\r\n  },\r\n  "i18n_audio_sync" : {\r\n    "message" : "Granularité de synchronisation texte / audio"\r\n  },\r\n  "i18n_audio_sync_default" : {\r\n    "message" : "Défaut"\r\n  },\r\n  "i18n_audio_sync_word" : {\r\n    "message" : "Mot"\r\n  },\r\n  "i18n_audio_sync_sentence" : {\r\n    "message" : "Phrase"\r\n  },\r\n  "i18n_audio_sync_paragraph" : {\r\n    "message" : "Paragraphe"\r\n  },\r\n  "i18n_page_previous" : {\r\n    "message" : "Page précédente"\r\n  },\r\n  "i18n_page_next" : {\r\n    "message" : "Page suivante"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,fr,ja,de"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/it/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "Un visualizzatore di documenti EPUB3"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Biblioteca di Readium"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Caricamento biblioteca"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Opzioni di Readium"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Applica"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Chiudi"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Impagina anche i file EPUB reflowable"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Apri in Readium gli URL che terminano in .epub"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Mostra errori e avvisi relativi ai file EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Dettagli"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Leggi"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Elimina"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Autore: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Editore: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Origine: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Data pubblicazione: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Data ultima modifica: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "Versione EPUB: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Data importazione: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Formato: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Aggiunto: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Sconosciuto"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Spiacente, non ci sono risorse Media Overlays associate a questo elemento."\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Aggiungi libri alla tua biblioteca!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "Decomprimendo: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Sei sicuro di voler cancellare definitivamente "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Aggiungi libro alla Biblioteca di Readium"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Aggiungi libro"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Annulla"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Scarica dal Web:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "Importa file EPUB dal tuo computer:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Indirizzo Web del file EPUB che vuoi aggiungere:"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Importa directory decompressa:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Convalida:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Controlla che i file siano conformi allo standard EPUB prima di aprirli"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Singole"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Affiancate"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Applica"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "DIMENSIONE CARATTERE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGINI"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "COMBINAZIONE COLORE TESTO/SFONDO"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Bianco su nero"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Notturno"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Deserto"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Mediterraneo"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Nebbia"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "VISUALIZZAZIONE PAGINE"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>, progetto dell\'International Digital Publishing Forum (IDPF) e dei suoi sostenitori, è una piattaforma open source di lettura e un motore di rendering per documenti in formato EPUB&reg;. Per saperne di più, visita la <a href=\\"http://readium.org/\\">pagina principale del progetto</a>. Lo sviluppo del progetto è stato guidato da <a href=\\"http://evidentpoint.com/\\">Evident Point</a> e <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>. Per contribuire, visita il <a href=\\"https://github.com/readium/readium-js-viewer\\">repository github</a>."\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accetta le seguenti lingue: $languages$",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,it,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/id/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "reader untuk buku-buku EPUB3 ."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Perpustakaan Readium"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Pilihan Readium :"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Simpan perubahan"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Tutup"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginate all reflowable ePUB content"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Secara otomatis buka *.epub urls di readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Tampilkan pesan peringatan ketika unpacking file EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Detail"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Baca"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Hapus"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Penulis: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Penerbit: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Sumber: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Tgl Terbit: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Tgl Modifikasi: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "Versi EPUB: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Dibuat di: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Format: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Menambahkan: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Tidak dikenal"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Maaf, EPUB saat ini tidak berisi overlay media untuk konten ini "\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Masukkan item r Library disini!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extracting: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Apakah and yakin ingin menghapus secara permanen "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Masukkan Buku ke Readium Library:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Add Book"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Batal"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Dari Web:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "Dari File local:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Masukkan  URL ke file .epub "\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Unpacked Directory:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Validasi:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Konfirmasikan bahwa buku ini sesuai dengan standar EPUB"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Single Pages"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Double Pages"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Save Settings"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "FONT SIZE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGINS"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "TEKS DAN WARNA LATAR"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Black and White"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Arabian Nights"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sands of Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Vancouver Mist"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "DISPLAY FORMAT"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>, a project of the International Digital Publishing Forum (IDPF) and supporters, adalah sistem referensi open source DAN rendering engine untuk EPUB&reg; publikasi.  Untuk mengetahui lebih lanjut, kunjungi <a href=\\"http://readium.org/\\">project homepage</a>. Sampai saat ini, pengembangan project telah dipimpin oleh  <a href=\\"http://evidentpoint.com/\\">Evident Point</a> and <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>. Untuk kontribusi, kunjungi <a href=\\"https://github.com/readium/readium-js-viewer\\">github repository</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/ja/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3ブックリーダ"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readiumライブラリ"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readiumオプション:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "変更を保存"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "閉じる"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "リフロー可能なEPUBコンテンツをすべてページネートする"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "URLが*.epubなら自動でReadiumで開く"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "EPUBファイルを展開する際には警告メッセージを表示する"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "詳細"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "読む"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "削除"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "著者: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "出版社: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "ソース: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "出版日時: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "更新日時: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUBバージョン: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "追加日時: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "フォーマット: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "追加日時: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "不明"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "現在のEPUBにはこのコンテンツのメディアオーバーレイが含まれていません"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "ここをクリックして本を登録します!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "展開しています: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "本を削除します: "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Readiumライブラリに本を追加します:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "本の追加"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "キャンセル"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Webから:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "ローカルファイルから:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : ".epubファイルのURLを入力してください"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "パッケージ化されていないフォルダ:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "検証（バリデート）:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "この本がEPUB仕様に準拠していることを確認する"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "単ページ"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "ダブル"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "設定を保存する"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "文字サイズ"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "マージン"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "文字色と背景色"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "白背景に黒文字"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "アラビアンナイト"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "砂丘の砂"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "バラード ブルース"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "バンクーバーの霧"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "表示形式"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>とは, International Digital Publishing Forum (IDPF) と支援企業によるプロジェクトで, EPUB&reg; 出版のためのシステムとレンダリングエンジンのオープンソースリファレンスです。詳しくは、<a href=\\"http://readium.org/\\">プロジェクトホームページ</a>をご覧ください。これまでは<a href=\\"http://evidentpoint.com/\\">Evident Point</a>と<a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>がプロジェクト開発をリードしてきました。 コントリビュートするには<a href=\\"https://github.com/readium/readium-js-viewer\\">githubレポジトリ</a>をご覧ください。"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/ko/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3책 리더."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium 라이브러리"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium 옵션:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "변경사항 저장"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "닫기"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "모든 리플로우 컨텐츠의 페이지네이션"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "*.epub url들을 radium에서 자동으로 열기"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "EPUB파일들을 열 때 경고메시지 표시"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "세부항목"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "읽기"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "삭제"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "저자: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "출판사: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "소스: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "출판일: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "개정일: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB 버전: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "생성: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "포맷: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "추가일시: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "미상"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "현재 EPUB은 이 컨텐츠를 위한 미디어 오버레이가 포함되어 있지 않습니다."\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "책을 등록하기 위하여 여기를 클릭하세요!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "정보 추출 중: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "영구히 삭제하시길 원하십니까? "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Readium 라이브러리에 책 추가:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "책 추가"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "취소"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "웹에서:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "로컬 파일에서:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : ".epub 파일의 URL을 입력하세요"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "추출된 디렉토리:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "승인:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "이 책이 ePUB표준을 따르는지 확인"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "단일 페이지"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "더블 페이지"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "설정 저장"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "폰트 크기"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "여백"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "글자와 배경 색"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "흑백"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "아라비안 나이트"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "샌즈 오브 듄"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "발라드 블루스"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "밴쿠버 안개"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "디스플레이 포맷"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>는 EPUB&reg;컨텐츠의 출판을 위한 국제디지털출판포럼(IDPF, International Digital Publishing Forum)과 지원 기업들의 오픈소스 시스템 및 렌더링 엔진 프로젝트입니다. 자세한 내용은 <a href=\\"http://readium.org/\\">프로젝트 홈페이지</a>를 참조하세요. 지금까지, 프로젝트 개발은 <a href=\\"http://evidentpoint.com/\\">Evident Point</a>와 <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>에 의해서 주도 되었습니다. 프로젝트에 기여하시기 위해서는 <a href=\\"https://github.com/readium/readium-js-viewer\\">github 저장소</a>를 확인하시기 바랍니다."\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n\r\n';});


define('text!readium_js_viewer_i18n/_locales/pt_BR/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description" : {\r\n    "message": "Um leitor para livros para EPUB3."\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Biblioteca Readium"\r\n  },\r\n  "i18n_loading" : {\r\n   "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Opções do Readium:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "Salvar mudanças"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "Fechar"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "Paginar todo o conteúdo ePUB fluído"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "Abrir automaticamente urls *.epub no readium"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "Exibir mensagem de alerta quando extraindo arquivos EPUB"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "Detalhes"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "Ler"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "Excluir"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "Autor: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "Editora: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "Origem: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "Publicação: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "Data de Modificação: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "Versão do EPUB: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "Criado aos: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "Formato: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "Adicionado: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "Desconhecido"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "Desculpe, o atual EPUB não contém uma mídia de sobreposição para este conteúdo"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "Adicione itens para sua biblioteca aqui!"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "extraindo: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "Você tem certeza de que deseja excluir permanentemente "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "Adicionar Livro à Biblioteca Readium:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "Adicionar Livro"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "Cancelar"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "Da Rede:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "De Arquivo Local:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "Insira uma URL para um arquivo .epub"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "Diretório Extraido:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "Validar:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "Confirmar que este livro obedece aos padrões ePUB"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "Pág. Simples"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "Pág. Duplas"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "Salvar Configurações"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "TAMANHO DA FONTE"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "MARGENS"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "COR DO TEXTO E PLANO DE FUNDO"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Preto e Branco"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Noites Árabes"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Areias de Duna"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Névoa de Vancouver"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "FORMATO DE EXIBIÇÃO"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>, a project of the International Digital Publishing Forum (IDPF) and supporters, is an open source reference system and rendering engine for EPUB&reg; publications.  To learn more, visit the <a href=\\"http://readium.org/\\">project homepage</a>. To date, the project development has been lead by <a href=\\"http://evidentpoint.com/\\">Evident Point</a> and <a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>. To contribute visit the <a href=\\"https://github.com/readium/readium-js-viewer\\">github repository</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,pt-BR,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/zh_CN/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3电子书阅览器"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium书库"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium选项:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "保存更改"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "关闭"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "分页显示所有可重排版EPUB文件"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "自动用Readium打开*.epub网址"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "解压缩EPUB文件时显示警告消息"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "详细信息"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "阅读"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "删除"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "作者: "\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "出版社: "\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "源自: "\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "出版日期: "\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "更新日期: "\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID: "\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB版本: "\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "创建日期: "\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "格式: "\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "添加: "\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "未知"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "目前EPUB不支持此内容的媒体格式"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "点击这里添加新书"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "解压中: "\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "确定永久删除 "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "添加新书到Readium书库:"\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "添加"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "取消"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "从网络:"\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "从本地文件:"\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "请输入一个.EPUB文件的URL"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "未打包目录:"\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "验证:"\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "确认这本书是否符合EPUB标准"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "单页"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "双页"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "保存设置"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "字体大小"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "页边距"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "字体和背景颜色"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "Black and White"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "Arabian Nights"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "Sands of Dune"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "Ballard Blues"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "Vancouver Mist"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "显示格式"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>，是一个International Digital Publishing Forum (IDPF)和技术支持者们共同开发的项目，也是一个开放源代码的EPUB格式出版物的渲染引擎。要了解更多信息，请访问<a href=\\"http://readium.org/\\">项目主页</a>。迄今为止，该项目的开发一直由<a href=\\"http://evidentpoint.com/\\">Evident Point</a>和<a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>来领导。要贡献请访问<a href=\\"https://github.com/readium/readium-js-viewer\\">GitHub资料库</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,ja,sr,de,zh_CN"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});


define('text!readium_js_viewer_i18n/_locales/zh_TW/messages.json',[],function () { return '{\r\n  "chrome_extension_name": {\r\n    "message": "Readium"\r\n  },\r\n  "chrome_extension_description": {\r\n    "message": "EPUB3電子書閱讀器"\r\n  },\r\n  "i18n_readium_library" : {\r\n    "message" : "Readium書櫃"\r\n  },\r\n  "i18n_loading" : {\r\n    "message" : "Loading Library"\r\n  },\r\n  "i18n_readium_options" : {\r\n    "message" : "Readium設定:"\r\n  },\r\n  "i18n_save_changes" : {\r\n    "message" : "儲存變更"\r\n  },\r\n  "i18n_close" : {\r\n    "message" : "關閉"\r\n  },\r\n  "i18n_paginate_all" : {\r\n    "message" : "分頁呈現所有文字順走型的EPUB內容"\r\n  },\r\n  "i18n_automatically" : {\r\n    "message" : "自動以Readium開啟任何以.epub結尾的網址"\r\n  },\r\n  "i18n_show_warning" : {\r\n    "message" : "解壓縮EPUB檔案時顯示警告訊息"\r\n  },\r\n  "i18n_details" : {\r\n    "message" : "詳細"\r\n  },\r\n  "i18n_read" : {\r\n    "message" : "閱讀"\r\n  },\r\n  "i18n_delete" : {\r\n    "message" : "刪除"\r\n  },\r\n  "i18n_author" : {\r\n    "message" : "作者："\r\n  },\r\n  "i18n_publisher" : {\r\n    "message" : "出版社："\r\n  },\r\n  "i18n_source" : {\r\n    "message" : "來源："\r\n  },\r\n  "i18n_pub_date" : {\r\n    "message" : "出版日期："\r\n  },\r\n  "i18n_modified_date" : {\r\n    "message" : "更新日期："\r\n  },\r\n  "i18n_id" : {\r\n    "message" : "ID："\r\n  },\r\n  "i18n_epub_version" : {\r\n    "message" : "EPUB版本："\r\n  },\r\n  "i18n_created_at" : {\r\n    "message" : "建立日期："\r\n  },\r\n  "i18n_format" : {\r\n    "message" : "格式："\r\n  },\r\n  "i18n_added" : {\r\n    "message" : "加入日期："\r\n  },\r\n  "i18n_unknown" : {\r\n    "message" : "未知"\r\n  },\r\n  "i18n_sorry" : {\r\n    "message" : "目前的EPUB內容並不包含朗讀聲音"\r\n  },\r\n  "i18n_add_items" : {\r\n    "message" : "按下這裡加入新書"\r\n  },\r\n  "i18n_extracting" : {\r\n    "message" : "解壓縮中："\r\n  },\r\n  "i18n_are_you_sure" : {\r\n    "message" : "你確定要永久刪除 "\r\n  },\r\n  "i18n_add_book_to_readium_library" : {\r\n    "message" : "將書籍加入Readium書櫃："\r\n  },\r\n  "i18n_add_book" : {\r\n    "message" : "加入書籍"\r\n  },\r\n  "i18n_cancel" : {\r\n    "message" : "取消"\r\n  },\r\n  "i18n_from_the_web" : {\r\n    "message" : "從網站加入："\r\n  },\r\n  "i18n_from_local_file" : {\r\n    "message" : "從檔案加入："\r\n  },\r\n  "i18n_enter_a_url" : {\r\n    "message" : "請輸入 .epub 檔案所在網址"\r\n  },\r\n  "i18n_unpacked_directory" : {\r\n    "message" : "未壓縮目錄："\r\n  },\r\n  "i18n_validate" : {\r\n    "message" : "檢證："\r\n  },\r\n  "i18n_confirm_that_this_book" : {\r\n    "message" : "確認這本書是否符合EPUB標準"\r\n  },\r\n  "i18n_single_pages" : {\r\n    "message" : "單頁呈現"\r\n  },\r\n  "i18n_double_pages" : {\r\n    "message" : "跨頁呈現"\r\n  },\r\n  "i18n_save_settings" : {\r\n    "message" : "儲存設定"\r\n  },\r\n  "i18n_font_size" : {\r\n    "message" : "文字尺寸"\r\n  },\r\n  "i18n_margins" : {\r\n    "message" : "頁緣餘白"\r\n  },\r\n  "i18n_text_and_background_color" : {\r\n    "message" : "文字與背景色彩"\r\n  },\r\n  "i18n_black_and_white" : {\r\n    "message" : "黑底與白字"\r\n  },\r\n  "i18n_arabian_nights" : {\r\n    "message" : "阿拉伯之夜"\r\n  },\r\n  "i18n_sands_of_dune" : {\r\n    "message" : "砂丘之黃砂"\r\n  },\r\n  "i18n_ballard_blues" : {\r\n    "message" : "抒情曲藍調"\r\n  },\r\n  "i18n_vancouver_mist" : {\r\n    "message" : "溫哥華之霧"\r\n  },\r\n  "i18n_display_format" : {\r\n    "message" : "顯示格式"\r\n  },\r\n  "i18n_html_readium_tm_a_project" : {\r\n    "message" : "Readium<sup>TM</sup>是由是International Digital Publishing Forum (IDPF)與技術協助者們共同開發的專案，是供EPUB&reg; 出版品使用的開放原始碼參考系統與排版引擎。要了解更多訊息，請前往<a href=\\"http://readium.org/\\">專案網頁</a>。迄今為止，本專案持續由<a href=\\"http://evidentpoint.com/\\">Evident Point</a>和<a href=\\"http://www.bluefirereader.com/\\">Bluefire Productions</a>所主導。若想協助開發，請前往<a href=\\"https://github.com/readium/readium-js-viewer\\">GitHub專案</a>"\r\n  },\r\n  "chrome_accept_languages": {\r\n    "message": "$CHROME$ accepts $languages$ languages",\r\n    "placeholders": {\r\n      "chrome": {\r\n        "content": "Chrome",\r\n        "example": "Chrome"\r\n      },\r\n      "languages": {\r\n        "content": "$1",\r\n        "example": "en-US,zh-TW,zh-HK,ja,sr,de"\r\n      }\r\n    }\r\n  }\r\n}\r\n';});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('readium_js_viewer_i18n/Strings',['text!./_locales/de/messages.json',
        'text!./_locales/es/messages.json',
		'text!./_locales/en_US/messages.json',
		'text!./_locales/fr/messages.json',
		'text!./_locales/it/messages.json',
		'text!./_locales/id/messages.json',
		'text!./_locales/ja/messages.json',
		'text!./_locales/ko/messages.json',
		'text!./_locales/pt_BR/messages.json',
		'text!./_locales/zh_CN/messages.json',
		'text!./_locales/zh_TW/messages.json'], 
function(de, es, en_US, fr, id, it, ja, ko, pt_BR, zh_CN, zh_TW){
	var Strings = {};

	Strings['de'] = de;
	Strings['es'] = es;
	Strings['en_US'] = en_US;
	Strings['fr'] = fr;
	Strings['id'] = id;
	Strings['it'] = it;
	Strings['ja'] = ja;
	Strings['ko'] = ko;
	Strings['pt_BR'] = pt_BR;
	Strings['zh_CN'] = zh_CN;
	Strings['zh_TW'] = zh_TW;

	var language = navigator.userLanguage || navigator.language;
//FORCE HERE (for testing)
//language="es";
    console.log("Language: [" + language + "]");

    var allowEnglishFallback = true;

	var i18nStr = Strings[language] || en_US;

	var i18nObj = JSON.parse(i18nStr);
    var i18nObj_en = i18nStr === en_US ? i18nObj : JSON.parse(en_US);

	for(var prop in i18nObj_en){
        var okay = prop in i18nObj;
        if (!okay) console.log("Language [" + language + "], missing string: [" + prop + "]");

		i18nObj[prop] = okay ? i18nObj[prop].message : (allowEnglishFallback ? ("*"+i18nObj_en[prop].message) : "");
	}
	return i18nObj;

});

define('readium_js_viewer_i18n', ['readium_js_viewer_i18n/Strings'], function (main) { return main; });

/**@license
 * RequireJS Hogan Plugin | v0.3.0 (2013/06/11)
 * Author: Miller Medeiros | MIT License
 */
define('hgn',['hogan', 'text'], function (hogan, text) {

    var DEFAULT_EXTENSION = '.mustache';

    var _buildMap = {};
    var _buildTemplateText = 'define("{{pluginName}}!{{moduleName}}", ["hogan"], function(hogan){'+
                             '  var tmpl = new hogan.Template({{{fn}}}, "", hogan);'+
                             // need to use apply to bind the proper scope.
                             '  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;'+
                             '});\n';
    var _buildTemplate;


    function load(name, req, onLoad, config){
        var hgnConfig = config.hgn || {};
        var fileName = name;
        fileName += hgnConfig && hgnConfig.templateExtension != null? hgnConfig.templateExtension : DEFAULT_EXTENSION;

        // load text files with text plugin
        text.get(req.toUrl(fileName), function(data){
            var compilationOptions = hgnConfig.compilationOptions? mixIn({}, hgnConfig.compilationOptions) : {};

            if (config.isBuild) {
                // store compiled function if build
                // and should always be a string
                compilationOptions.asString = true;
                _buildMap[name] = hogan.compile(data, compilationOptions);
            }

            // maybe it's required by some other plugin during build
            // so return the compiled template even during build
            var template = hogan.compile(data, compilationOptions);
            var render = bind(template.render, template);
            // add text property for debugging if needed.
            // it's important to notice that this value won't be available
            // after build.
            render.text = template.text;
            render.template = template;
            // return just the render method so it's easier to use
            onLoad( render );
        });
    }

    function bind(fn, context) {
        return function(){
            return fn.apply(context, arguments);
        };
    }

    function mixIn(target, source) {
        var key;
        for (key in source){
            if ( Object.prototype.hasOwnProperty.call(source, key) ) {
                target[key] = source[key];
            }
        }
        return target;
    }

    function write(pluginName, moduleName, writeModule){
        if(moduleName in _buildMap){
            if (! _buildTemplate) {
                // using templates to generate compiled templates, so meta :P
                _buildTemplate = hogan.compile( _buildTemplateText );
            }
            var fn = _buildMap[moduleName];
            writeModule( _buildTemplate.render({
                pluginName : pluginName,
                moduleName : moduleName,
                fn : fn
            }) );
        }
    }

    return {
        load : load,
        write : write
    };

});


define("hgn!readium_js_viewer_html_templates/managed-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"modal fade\" id=\"managed-dialog\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"managed-label\">\r");t.b("\n" + i);t.b("    <div class=\"modal-dialog\">\r");t.b("\n" + i);t.b("        <div class=\"modal-content\">\r");t.b("\n" + i);t.b("            <div class=\"modal-header\">\r");t.b("\n" + i);t.b("                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"close\" title=\"close\"><span aria-hidden=\"true\">&times;<span></button>\r");t.b("\n" + i);t.b("                <h4 class=\"modal-title\" id=\"managed-label\"></h4>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            <div class=\"modal-body\">\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            <div class=\"modal-footer\">\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("        <!-- /.modal-content --> \r");t.b("\n" + i);t.b("    </div><!-- /.modal-dialog -->\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("<!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!readium_js_viewer_html_templates/progress-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"progress progress-striped active\">\r");t.b("\n" + i);t.b("  <div class=\"progress-bar\"  role=\"progressbar\" aria-valuenow=\"1\" aria-valuemin=\"1\" aria-valuemax=\"100\" style=\"width: 1%\">\r");t.b("\n" + i);t.b("    <!-- <span class=\"progress-message sr-only\">");t.b(t.v(t.f("message",c,p,0)));t.b("</span> -->\r");t.b("\n" + i);t.b("  </div>\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("<div class=\"progress-message\">");t.b(t.v(t.f("message",c,p,0)));t.b("</div>\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!readium_js_viewer_html_templates/managed-buttons.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("buttons",c,p,1),c,p,0,12,157,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<button type=\"button\" class=\"btn btn-default ");if(t.s(t.f("classes",c,p,1),c,p,0,71,77,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(t.v(t.d(".",c,p,0)));t.b(" ");});c.pop();}t.b("\" ");if(t.s(t.f("dismiss",c,p,1),c,p,0,103,125,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" data-dismiss=\"modal\" ");});c.pop();}t.b(">");t.b(t.v(t.f("text",c,p,0)));t.b("</button>\r");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});

define('readium_js_viewer/workers/Messages',[],function(){
	return {
		// window -> worker messages
		IMPORT_ZIP : 0,
		OVERWRITE_CONTINUE : 1,
		FIND_PACKAGE_RESPONSE: 2,
		PARSE_PACKAGE_RESPONSE: 3,
		DELETE_EPUB : 4,
		IMPORT_DIR : 5,
		IMPORT_URL: 6,
		MIGRATE: 7,
		OVERWRITE_SIDE_BY_SIDE: 8,
		CONTINUE_IMPORT_ZIP: 9,

		// worker -> window messages
		SUCCESS : 100,
		PROGRESS : 101,
		ERROR : 102,
		OVERWRITE : 103,
		FIND_PACKAGE : 104,
		PARSE_PACKAGE: 105,


		PROGRESS_EXTRACTING : 200,
		PROGRESS_WRITING: 201,
		PROGRESS_DELETING: 202,
		PROGRESS_MIGRATING: 203,

		ERROR_STORAGE : 300,
		ERROR_EPUB : 301,
		ERROR_AJAX : 302,

	}
});
define('readium_js_viewer/Dialogs',['hgn!readium_js_viewer_html_templates/managed-dialog.html', 'hgn!readium_js_viewer_html_templates/progress-dialog.html', 'hgn!readium_js_viewer_html_templates/managed-buttons.html', 'readium_js_viewer_i18n/Strings', './workers/Messages'], function(ManagedDialog, ProgressDialog, ButtonTemplate, Strings, Messages){
	var $currentModal,
		lastTitle;


	var hideExistingModal = function(){
		if($currentModal){
			$currentModal.modal('hide');
		}
	};

	var showModalDialog = function(dismissable, title, body, buttons){
		if (!$currentModal){
			$currentModal = $(ManagedDialog({}));
			$('#app-container').append($currentModal);

		}

		$('#managed-label').text(title);
		$('#managed-dialog .modal-body').empty().append(body);
		$('#managed-dialog .modal-footer').empty().append(buttons);
		if (dismissable){
			$('#managed-dialog .close').show();
		}
		else{
			$('#managed-dialog .close').hide();
		}

		if ($currentModal.is(':hidden')){
			$('#managed-dialog').modal('show');
		}

	};

	Dialogs = {
		showError : function(type, data){
			var msg = Strings.err_unknown;
			switch(type){
				case Messages.ERROR_STORAGE:
					msg = Strings.err_storage;
					break;
				case Messages.ERROR_EPUB:
					msg = Strings.err_epub_corrupt;
					break;
				case Messages.ERROR_AJAX:
        				msg = Strings.err_ajax;
                			break;
				default:
					msg = Strings.err_unknown;
					console.trace();
					break;
			}
			Dialogs.showModalMessage(Strings.err_dlg_title, msg);
		},
		showModalMessage : function(title, message){
			var body = $('<p></p>').text(message),
				buttons = ButtonTemplate({
					buttons : [
						{
							dismiss : true,
							text : Strings.ok
						}
					]
				});

			showModalDialog(true, title, body, buttons);
		},
		showModalPromptEx : function(title, message, buttons, handlers){

			var body = $('<p></p>').text(message);
			var buttonsStr = ButtonTemplate({buttons: buttons});
			showModalDialog(false, title, body, buttonsStr);

			for (var i = 0; i < handlers.length; i++){
				if (handlers[i]){
					$('#managed-dialog .' + buttons[i].classes[0]).on('click', handlers[i]);
				}
			}
			// if (onOk)
			// 	$('#managed-dialog .yes-button').on('click', onOk);

			// if (onCancel)
			// 	$('#managed-dialog .no-button').on('click', onCancel);
		},
		showModalPrompt : function(title, message, okLabel, cancelLabel, onOk, onCancel){


			var buttons = [
					{
						dismiss: true,
						text : cancelLabel,
						classes : ['no-button']
					},
					{
						dismiss : true,
						text : okLabel,
						classes : ['yes-button', 'btn-primary']
					}
				];

			handlers = [onCancel, onOk];
			Dialogs.showModalPromptEx(title, message, buttons, handlers);
		},
		showReplaceConfirm : function(title, message, okLabel, cancelLabel, keepBothLabel, onOk, onCancel, onKeepBoth){
			var buttons = [

					{
						dismiss: true,
						text : cancelLabel,
						classes : ['no-button']
					},
					{
						dismiss : true,
						text : okLabel,
						classes : ['yes-button', 'btn-danger']
					},
					{
						dismiss : true,
						text : keepBothLabel,
						classes : ['keep-both-button', 'btn-primary']
					}

			];
			handlers = [onCancel, onOk, onKeepBoth];
			Dialogs.showModalPromptEx(title, message, buttons, handlers);
		},
		showModalProgress : function(title, message){
			var data = {
				message: message
			}
			lastTitle = title;
			showModalDialog(false, title, ProgressDialog(data), '');
		},
		updateProgress : function(percent, type, data, noForce){

			var msg = '';
			switch(type){
				case Messages.PROGRESS_MIGRATING :
					msg = Strings.migrating + ' ' + data;
					break;
				case Messages.PROGRESS_EXTRACTING:
					msg = Strings.i18n_extracting + ' ' + data;
					break;
				case Messages.PROGRESS_WRITING:
					msg = Strings.storing_file + ' ' + data;
					break;
				case Messages.PROGRESS_DELETING:
					msg = Strings.delete_progress_message + ' ' + data;
					break;
			}
			// if (!noForce && $('#managed-dialog').is(':hidden')){
			//  	Dialogs.showModalProgress(lastTitle, msg);
			// }
			$('#managed-dialog .progress-bar').attr('aria-valuenow', percent).css('width', percent + '%');
			$('#managed-dialog .progress-message').text(msg);
		},
		closeModal : function(){
			hideExistingModal();
		},
		reset : function(){
			if ($currentModal){
				$currentModal.remove();
				$currentModal = null;
			}
		}
	};

	return Dialogs;
});


define("hgn!readium_js_viewer_html_templates/settings-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div tabindex=\"-1\" class=\"modal fade\" id=\"settings-dialog\" role=\"dialog\" aria-label=\"");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("    <div class=\"modal-dialog\">\r");t.b("\n" + i);t.b("        <div class=\"modal-content\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("           <!-- div class=\"modal-header\">\r");t.b("\n" + i);t.b("            <h4 class=\"modal-title\" id=\"settings-label\">");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("</h4>\r");t.b("\n" + i);t.b("           </div -->\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <div class=\"modal-body\">\r");t.b("\n" + i);t.b("           <button type=\"button\" class=\"close\" id=\"closeSettingsCross\" data-dismiss=\"modal\" title=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.settings",c,p,0)));t.b("\"><span aria-hidden=\"true\">&times;</span></button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("           <ul class=\"nav nav-tabs\" role=\"tablist\" aria-owns=\"tab-butt-style tab-butt-layout tab-butt-keys\">\r");t.b("\n" + i);t.b("             <li class=\"active\" role=\"presentation\"><button id=\"tab-butt-style\"  title=\"");t.b(t.v(t.d("strings.style",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.style",c,p,0)));t.b("\" role='tab' aria-controls=\"tab-style\" data-toggle=\"tab\" data-target=\"#tab-style\">");t.b(t.v(t.d("strings.style",c,p,0)));t.b("</button></li>\r");t.b("\n" + i);t.b("             <li role=\"presentation\"><button id=\"tab-butt-layout\"  title=\"");t.b(t.v(t.d("strings.layout",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.layout",c,p,0)));t.b("\" role='tab' aria-controls=\"tab-layout\" data-toggle=\"tab\" data-target=\"#tab-layout\">");t.b(t.v(t.d("strings.layout",c,p,0)));t.b("</button></li>\r");t.b("\n" + i);t.b("             <li role=\"presentation\"><button id=\"tab-butt-keys\"  title=\"");t.b(t.v(t.d("strings.i18n_keyboard_shortcuts",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_keyboard_shortcuts",c,p,0)));t.b("\" role='tab' aria-controls=\"tab-keyboard\" data-toggle=\"tab\" data-target=\"#tab-keyboard\">");t.b(t.v(t.d("strings.i18n_keyboard_shortcuts",c,p,0)));t.b("</button></li>\r");t.b("\n" + i);t.b("           </ul>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("           <div class=\"tab-content\">\r");t.b("\n" + i);t.b("                <div id=\"tab-style\" class=\"tab-pane active\" role=\"tabpanel\" aria-expanded=\"true\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                <h5 aria-hidden=\"true\">");t.b(t.v(t.d("strings.preview",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                <div  aria-hidden=\"true\" class=\"row\">\r");t.b("\n" + i);t.b("                    <div data-theme=\"default-theme\" class=\"col-xs-10 col-xs-offset-1 preview-text default-theme\">\r");t.b("\n" + i);t.b("                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus neque dui, congue a suscipit non, feugiat eu urna. Cras in felis sed orci aliquam sagittis.\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("<!-- button  type=\"button\" title=\"TESTING\" aria-label=\"TESTING\">TESTING DANIEL</button -->\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-font-size\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_font_size",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    <div class=\"row\">\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2 icon-scale-down\">\r");t.b("\n" + i);t.b("                            <img src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/glyphicons_115_text_smaller.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-8\">\r");t.b("\n" + i);t.b("                            <input  type=\"range\" role=\"slider\" aria-labelledby=\"setting-header-font-size\" id=\"font-size-input\" min=\"60\" aria-value-min=\"60\" aria-valuemin=\"60\" step=\"10\" max=\"170\" aria-value-max=\"170\" aria-valuemax=\"170\" value=\"100\" aria-valuenow=\"100\" aria-value-now=\"100\" aria-valuetext=\"1em\" aria-value-text=\"1em\" title=\"");t.b(t.v(t.d("strings.i18n_font_size",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_font_size",c,p,0)));t.b("\" />\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2\">\r");t.b("\n" + i);t.b("                            <img src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/glyphicons_116_text_bigger.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-color-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_text_and_background_color",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                    <div role=\"group\" aria-labelledby=\"setting-header-color-legend\" id=\"theme-radio-group\" class=\"row\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"author-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_author_theme",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_author_theme",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option author-theme clickable\">");t.b(t.v(t.d("strings.i18n_author_theme",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"default-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_black_and_white",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_black_and_white",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option default-theme clickable\">");t.b(t.v(t.d("strings.i18n_black_and_white",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"night-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_arabian_nights",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_arabian_nights",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("]\" class=\"col-xs-8 col-xs-offset-2 theme-option night-theme clickable\" >");t.b(t.v(t.d("strings.i18n_arabian_nights",c,p,0)));t.b("</button> <!-- accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.NightTheme",c,p,0)));t.b("\" -->\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"parchment-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_sands_of_dune",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_sands_of_dune",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option parchment-theme clickable\">");t.b(t.v(t.d("strings.i18n_sands_of_dune",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"ballard-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_ballard_blues",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_ballard_blues",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option ballard-theme clickable\">");t.b(t.v(t.d("strings.i18n_ballard_blues",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <button role=\"button\" data-theme=\"vancouver-theme\"  title=\"");t.b(t.v(t.d("strings.i18n_vancouver_mist",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_vancouver_mist",c,p,0)));t.b("\" class=\"col-xs-8 col-xs-offset-2 theme-option vancouver-theme clickable\">");t.b(t.v(t.d("strings.i18n_vancouver_mist",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                </div>\r");t.b("\n" + i);t.b("                <div id=\"tab-layout\" class=\"tab-pane\" role=\"tabpanel\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-margins-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_margins",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("                     <div class=\"row\">\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2 icon-scale-down\">\r");t.b("\n" + i);t.b("                            <img style=\"height: 32px;\" src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/margin1_off.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-8\">\r");t.b("\n" + i);t.b("                            <input  type=\"range\" role=\"slider\" aria-labelledby=\"setting-header-margins-legend\" id=\"margin-size-input\" min=\"20\" aria-value-min=\"20\" aria-valuemin=\"20\" step=\"20\" max=\"100\" aria-value-max=\"100\" aria-valuemax=\"100\" value=\"20\" aria-valuenow=\"20\" aria-value-now=\"20\" aria-valuetext=\"20\" aria-value-text=\"20\" title=\"");t.b(t.v(t.d("strings.i18n_margins",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_margins",c,p,0)));t.b("\"/>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div class=\"col-xs-2\">\r");t.b("\n" + i);t.b("                            <img style=\"height: 32px;\" src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/margin4_off.png\" alt=\"\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-display-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_display_format",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <div role=\"radiogroup\" class=\"row\" style=\"width:100%;text-align:center;\" aria-labelledby=\"setting-header-display-legend\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"spread-default-option\"\r");t.b("\n" + i);t.b("                        style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"display-format\" value=\"single\" type=\"radio\" id=\"spread-default-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"spread-default-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_spread_auto",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"one-up-option\"\r");t.b("\n" + i);t.b("                        style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                            <input  name=\"display-format\" value=\"single\" type=\"radio\" id=\"single-page-radio\" />\r");t.b("\n" + i);t.b("                                            <label for=\"single-page-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                            <img src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/ico_singlepage_up.png\" alt=\"");t.b(t.v(t.d("strings.i18n_display_format",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_single_pages",c,p,0)));t.b("\"/>\r");t.b("\n" + i);t.b("                                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"two-up-option\"\r");t.b("\n" + i);t.b("                        style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                                <input  name=\"display-format\" value=\"double\" type=\"radio\" id=\"double-page-radio\" />\r");t.b("\n" + i);t.b("                                            <label for=\"double-page-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                            <img src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/ico_doublepage_up.png\" alt=\"");t.b(t.v(t.d("strings.i18n_display_format",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_double_pages",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("                                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 id=\"setting-header-scroll-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_scroll_mode",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <div role=\"radiogroup\" class=\"row\" style=\"width:100%;text-align:center;\" aria-labelledby=\"setting-header-scroll-legend\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"scroll-default-option\" style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"scrolling\" value=\"single\" type=\"radio\" id=\"scroll-default-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"scroll-default-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_scroll_mode_auto",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"scroll-doc-option\" style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"scrolling\" value=\"single\" type=\"radio\" id=\"scroll-doc-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"scroll-doc-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                <span style=\"font-size:150%;color:#888888;\" class=\"glyphicon glyphicon-file\" aria-hidden=\"true\"></span> ");t.b(t.v(t.d("strings.i18n_scroll_mode_doc",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"scroll-continuous-option\" style=\"vertical-align:middle;width:30%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"scrolling\" value=\"single\" type=\"radio\" id=\"scroll-continuous-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"scroll-continuous-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                <span style=\"font-size:150%;color:#888888;\" class=\"glyphicon glyphicon-road\" aria-hidden=\"true\"></span> ");t.b(t.v(t.d("strings.i18n_scroll_mode_continuous",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <h5 hiddenx=\"hidden\" id=\"setting-header-pageTransition-legend\" class=\"setting-header\">");t.b(t.v(t.d("strings.i18n_page_transition",c,p,0)));t.b("</h5>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <div hiddenx=\"hidden\" role=\"radiogroup\" class=\"row\" style=\"width:100%;text-align:center;\" aria-labelledby=\"setting-header-pageTransition-legend\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-none-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-none-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-none-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_none",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-1-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-1-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-1-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_fade",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-2-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-2-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-2-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_slide",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-3-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-3-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-3-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_swoosh",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div role=\"radio\" id=\"pageTransition-4-option\" style=\"vertical-align:middle;width:15%;display:inline-block;position:relative;\">\r");t.b("\n" + i);t.b("                            <input style=\"\"  name=\"pageTransition\" value=\"single\" type=\"radio\" id=\"pageTransition-4-radio\"/>\r");t.b("\n" + i);t.b("                            <label style=\"\" for=\"pageTransition-4-radio\" class=\"underlinedLabel\">\r");t.b("\n" + i);t.b("                                ");t.b(t.v(t.d("strings.i18n_page_transition_butterfly",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                            </label>\r");t.b("\n" + i);t.b("                        </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                    <div id=\"tab-keyboard\" class=\"tab-pane\" role=\"tabpanel\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                    <div class=\"row\" style=\"position:relative;\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <div id=\"invalid_keyboard_shortcut_ALERT\"></div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                        <ul id=\"keyboard-list\">\r");t.b("\n" + i);t.b("                        </ul>\r");t.b("\n" + i);t.b("                    </div>\r");t.b("\n" + i);t.b("                     </div>\r");t.b("\n" + i);t.b("                </div>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            <div class=\"modal-footer\">\r");t.b("\n" + i);t.b("                <button id=\"buttClose\"  type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\" title=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalClose",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalClose",c,p,0)));t.b("]\">");t.b(t.v(t.d("strings.i18n_close",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("                <button id=\"buttSave\"  type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" title=\"");t.b(t.v(t.d("strings.i18n_save_changes",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalSave",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_save_changes",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SettingsModalSave",c,p,0)));t.b("]\">");t.b(t.v(t.d("strings.i18n_save_changes",c,p,0)));t.b("</button>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("        <!-- /.modal-content -->\r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("    <!-- /.modal-dialog -->\r");t.b("\n" + i);t.b("</div>\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!readium_js_viewer_html_templates/settings-keyboard-item.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("name",c,p,1),c,p,0,9,747,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<li>\r");t.b("\n" + i);t.b("<label id=\"label_");t.b(t.v(t.f("name",c,p,0)));t.b("\">");t.b(t.v(t.f("i18n",c,p,0)));t.b("<br/><span>");t.b(t.v(t.f("name",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("<input id=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" name=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\" class=\"keyboardInput\" type=\"text\"  placeholder=\"");t.b(t.v(t.f("shortcut",c,p,0)));t.b("\" value=\"");t.b(t.v(t.f("shortcut",c,p,0)));t.b("\" aria-labelledbyxxx=\"label_");t.b(t.v(t.f("name",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.f("i18n",c,p,0)));t.b("\" title=\"");t.b(t.v(t.f("i18n",c,p,0)));t.b("\"></input>\r");t.b("\n" + i);t.b("<button class=\"resetKey captureKeyboardShortcut\" role=\"button\" data-key=\"");t.b(t.v(t.f("name",c,p,0)));t.b("\"  title=\"");t.b(t.v(t.d("strings.i18n_reset_key",c,p,0)));t.b(" (");t.b(t.v(t.f("def",c,p,0)));t.b(")\" aria-label=\"");t.b(t.v(t.d("strings.i18n_reset_key",c,p,0)));t.b(" (");t.b(t.v(t.f("def",c,p,0)));t.b(")\"><span aria-hidden=\"true\">&#8855;</span></button>\r");t.b("\n" + i);t.b("<span id=\"duplicate_keyboard_shortcut\" aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_duplicate_keyboard_shortcut",c,p,0)));t.b("</span>\r");t.b("\n" + i);t.b("<span id=\"invalid_keyboard_shortcut\" aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_invalid_keyboard_shortcut",c,p,0)));t.b("</span>\r");t.b("\n" + i);t.b("</li>\r");t.b("\n" + i);});c.pop();}if(!t.s(t.f("name",c,p,1),c,p,1,0,0,"")){t.b("<li id=\"resetAllKeys");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"resetAllKeys\">\r");t.b("\n" + i);t.b("<button class=\"resetKey\" role=\"button\"  title=\"");t.b(t.v(t.d("strings.i18n_reset_key_all",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_reset_key_all",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_reset_key_all",c,p,0)));t.b("  &#8855;</span></button>\r");t.b("\n" + i);t.b("</li>\r");t.b("\n" + i);};return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});

define('readium_js_viewer/Keyboard',['readium_js_viewer_i18n/Strings', 'keymaster', './storage/Settings'], function(Strings, key, Settings){

    var keyBindings = {};

            //https://github.com/termi/DOM-Keyboard-Event-Level-3-polyfill
            //https://gist.github.com/termi/4654819
            void function() {//closure

            var global = this
              , _initKeyboardEvent_type = (function( e ) {
            		try {
            			e.initKeyboardEvent(
            				"keyup" // in DOMString typeArg
            				, false // in boolean canBubbleArg
            				, false // in boolean cancelableArg
            				, global // in views::AbstractView viewArg
            				, "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
            				, 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
            				, true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
            				, false // [test]shift | alt
            				, true // [test]shift | alt
            				, false // meta
            				, false // altGraphKey
            			);



            			/*
            			// Safari and IE9 throw Error here due keyCode, charCode and which is readonly
            			// Uncomment this code block if you need legacy properties
            			delete e.keyCode;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			delete e.charCode;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			delete e.which;
            			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
            			*/

            			return ((e["keyIdentifier"] || e["key"]) == "+" && (e["keyLocation"] || e["location"]) == 3) && (
            				e.ctrlKey ?
            					e.altKey ? // webkit
            						1
            						:
            						3
            					:
            					e.shiftKey ?
            						2 // webkit
            						:
            						4 // IE9
            				) || 9 // FireFox|w3c
            				;
            		}
            		catch ( __e__ ) { _initKeyboardEvent_type = 0 }
            	})( document.createEvent( "KeyboardEvent" ) )

            	, _keyboardEvent_properties_dictionary = {
            		"char": "",
            		"key": "",
            		"location": 0,
            		"ctrlKey": false,
            		"shiftKey": false,
            		"altKey": false,
            		"metaKey": false,
            		"repeat": false,
            		"locale": "",

            		"detail": 0,
            		"bubbles": false,
            		"cancelable": false,

            		//legacy properties
            		"keyCode": 0,
            		"charCode": 0,
            		"which": 0
            	}

            	, own = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

            	, _Object_defineProperty = Object.defineProperty || function(obj, prop, val) {
            		if( "value" in val ) {
            			obj[prop] = val["value"];
            		}
            	}
            ;

            function crossBrowser_initKeyboardEvent(type, dict) {
            	var e;
            	if( _initKeyboardEvent_type ) {
            		e = document.createEvent( "KeyboardEvent" );
            	}
            	else {
            		e = document.createEvent( "Event" );
            	}

                // // Chromium Hack
                // try
                // {
                // Object.defineProperty(e, 'keyCode', {
                //             get : function() {
                //                 return this.keyCodeVal;
                //             }
                // });
                // }catch(){}
                //
                // try
                // {
                // Object.defineProperty(e, 'which', {
                //             get : function() {
                //                 return this.keyCodeVal;
                //             }
                // });
                // }catch(){}


            	var _prop_name
            		, localDict = {};

            	for( _prop_name in _keyboardEvent_properties_dictionary ) if(own(_keyboardEvent_properties_dictionary, _prop_name) ) {
            		localDict[_prop_name] = (own(dict, _prop_name) && dict || _keyboardEvent_properties_dictionary)[_prop_name];
            	}

            	var _ctrlKey = localDict["ctrlKey"]
            		, _shiftKey = localDict["shiftKey"]
            		, _altKey = localDict["altKey"]
            		, _metaKey = localDict["metaKey"]
            		, _altGraphKey = localDict["altGraphKey"]

            		, _modifiersListArg = _initKeyboardEvent_type > 3 ? (
            			(_ctrlKey ? "Control" : "")
            				+ (_shiftKey ? " Shift" : "")
            				+ (_altKey ? " Alt" : "")
            				+ (_metaKey ? " Meta" : "")
            				+ (_altGraphKey ? " AltGraph" : "")
            			).trim() : null

            		, _key = localDict["key"] + ""
            		, _char = localDict["char"] + ""
            		, _location = localDict["location"]
            		, _keyCode = localDict["keyCode"] || (localDict["keyCode"] = _key && _key.charCodeAt( 0 ) || 0)
            		, _charCode = localDict["charCode"] || (localDict["charCode"] = _char && _char.charCodeAt( 0 ) || 0)

            		, _bubbles = localDict["bubbles"]
            		, _cancelable = localDict["cancelable"]

            		, _repeat = localDict["repeat"]
            		, _locale = localDict["locale"]
            		, _view = global
            	;

            	localDict["which"] || (localDict["which"] = localDict["keyCode"]);

                //e.keyCodeVal = _keyCode;

            	if( "initKeyEvent" in e ) {//FF
            		//https://developer.mozilla.org/en/DOM/event.initKeyEvent
            		e.initKeyEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
            	}
            	else if(  _initKeyboardEvent_type && "initKeyboardEvent" in e ) {//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            		if( _initKeyboardEvent_type == 1 ) { // webkit
            			//http://stackoverflow.com/a/8490774/1437207
            			//https://bugs.webkit.org/show_bug.cgi?id=13368
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey );
            		}
            		else if( _initKeyboardEvent_type == 2 ) { // old webkit
            			//http://code.google.com/p/chromium/issues/detail?id=52408
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
            		}
            		else if( _initKeyboardEvent_type == 3 ) { // webkit
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey );
            		}
            		else if( _initKeyboardEvent_type == 4 ) { // IE9
            			//http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale );
            		}
            		else { // FireFox|w3c
            			//http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
            			//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
            			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale );
            		}
            	}
            	else {
            		e.initEvent(type, _bubbles, _cancelable)
            	}

            	for( _prop_name in _keyboardEvent_properties_dictionary )if( own( _keyboardEvent_properties_dictionary, _prop_name ) ) {
            		if( e[_prop_name] != localDict[_prop_name] ) {
            			try {
            				delete e[_prop_name];
            				_Object_defineProperty( e, _prop_name, { writable: true, "value": localDict[_prop_name] } );
            			}
            			catch(ex) {
            				//Some properties is read-only
// console.debug("PROP EX: " + ex);
// e[_prop_name] = _keyCode;
// console.debug("PROP AFTER: " + e[_prop_name]);
            			}

            		}
            	}

            	return e;
            }

            //export
            global.crossBrowser_initKeyboardEvent = crossBrowser_initKeyboardEvent;

            }.call(window);


	Keyboard = {
        resetToDefaults: function()
        {
            // reset current scheme to defaultOptions
            for (prop in Keyboard.defaultOptions)
            {
                if (!Keyboard.defaultOptions.hasOwnProperty(prop)) continue;

                if (typeof Keyboard.defaultOptions[prop] !== 'string') continue;

                Keyboard[prop] = Keyboard.defaultOptions[prop];
            }
        },
        resetAccessKeys: function()
        {
            // reset access keys
            var extractAccessKey = function(keyboardShortcut)
            {
                if (!keyboardShortcut || !keyboardShortcut.length) return "";

                var char = keyboardShortcut[keyboardShortcut.length-1];
                if (/^[a-z0-9]+$/i.test(char)) return char;

                return "";
            };
            Keyboard.accesskeys = {};
            for (prop in Keyboard)
            {
                if (!Keyboard.hasOwnProperty(prop)) continue;

                var str = Keyboard[prop];

                if (typeof str !== 'string') continue;

                Keyboard.accesskeys[prop] = extractAccessKey(str);
            }
        },
        applySettings: function(json)
        {
            this.resetToDefaults();

            if (json && json.keyboard)
            {
                // override with user options
                for (prop in Keyboard)
                {
                    if (!Keyboard.hasOwnProperty(prop)) continue;

                    if (typeof Keyboard[prop] !== 'string') continue;

                    if (typeof json.keyboard[prop] !== 'string') continue;

                    Keyboard[prop] = json.keyboard[prop];
                }
            }

            this.resetAccessKeys();
        },
        dispatch: function(target, e)
        {
            //THIS FUNCTION NOT REACHED WHEN e.stopPropagation(); INVOKED IN IFRAME's HTML

            if (e.cancelBubble)
            {
                //WHEN e.cancelBubble = true IN IFRAME's HTML's own event callback
                return;
            }

            if (e.defaultPrevented)
            {
                //WHEN e.preventDefault() INVOKED IN IFRAME's HTML
                return;
            }

            if (typeof e.returnValue !== "undefined" && !e.returnValue)
            {
                //WHEN e.returnValue = false IN IFRAME's HTML's own event callback
                return;
            }

            var source = e.srcElement || e.target;
            if (source)
            {
                var parent = source;
                while (parent)
                {
                    var name = parent.nodeName;
                    if (name === "input" || name === "textarea")
                    {
                        return;
                    }

                    if (parent.getAttribute)
                    {
                        var ce = parent.getAttribute("contenteditable");
                        if (ce === "true" || ce === "contenteditable")
                        {
                            return;
                        }
                    }

                    if (parent.classList && parent.classList.contains("keyboard-input"))
                    {
                        return;
                    }

                    parent = parent.parentNode;
                }
            }


            // //var newE = jQuery.extend(true, {}, e);// deep copy
            // var newE = $.extend($.Event(e.type), {}, e);
            //
            // newE.preventDefault();
            // newE.stopPropagation();
            // newE.stopImmediatePropagation();
            //
            // newE.originalEvent.bubbles = false;
            // newE.originalEvent.srcElement = document.documentElement;
            // newE.originalEvent.target = document.documentElement;
            // newE.originalEvent.view = window;

            var ev = crossBrowser_initKeyboardEvent(e.type, {
                "bubbles": true,
                "cancelable": false,

                "keyCode": e.keyCode,
                "charCode": e.charCode,
                "which": e.which,

                "ctrlKey": e.ctrlKey,
                "shiftKey": e.shiftKey,
                "altKey": e.altKey,
                "metaKey": e.metaKey,

                //https://developer.mozilla.org/en-US/docs/Web/API/event.which
                "char": e.char ? e.char : String.fromCharCode(e.charCode), // lower/upper case-sensitive
                "key": e.key ? e.key : e.keyCode // case-insensitive
            });

            //$(target).trigger(e);
            target.dispatchEvent(ev);
        },
        scope: function(scope)
        {
            if (!scope) alert("!SCOPE ACTIVATE!");

            key.setScope(scope);
        },
        on: function(keys, scope, callback)
        {
            if (!keys) console.error("!KEYS!");

            if (!keyBindings.hasOwnProperty(scope))
            {
                keyBindings[scope] = [];
            }
            keyBindings[scope].push(keys);

            key.unbind(keys, scope);
            key(keys, scope, function()
            {
                $(document.body).addClass("keyboard");
                callback();
            });
        },
        off: function(scope)
        {
            if (!scope) alert("!SCOPE OFF!");

            if (!keyBindings.hasOwnProperty(scope)) return;

            for (k in keyBindings[scope])
            {
                key.unbind(k, scope);
            }
        },
        i18n:
        {
            ShowSettingsModal: Strings.settings,

            SettingsModalSave: Strings.settings + " - " + Strings.i18n_save_changes,
            SettingsModalClose: Strings.settings + " - " + Strings.i18n_close,

            PagePrevious: Strings.i18n_page_previous,
            PageNext: Strings.i18n_page_next,
            PagePreviousAlt: Strings.i18n_page_previous + " (access key)",
            PageNextAlt: Strings.i18n_page_next + " (access key)",

            ToolbarShow: Strings.i18n_toolbar_show,
            ToolbarHide: Strings.i18n_toolbar_hide,

            FullScreenToggle: Strings.enter_fullscreen + " / " + Strings.exit_fullscreen,

            SwitchToLibrary: Strings.view_library,

            TocShowHideToggle: Strings.toc,

            NightTheme: Strings.i18n_arabian_nights,

            //MediaOverlaysPlayPauseAlt: Strings.i18n_audio_play + " / " + Strings.i18n_audio_pause,
            MediaOverlaysPlayPause: Strings.i18n_audio_play + " / " + Strings.i18n_audio_pause,

            MediaOverlaysPrevious: Strings.i18n_audio_previous,
            MediaOverlaysNext: Strings.i18n_audio_next,

            MediaOverlaysEscape: Strings.i18n_audio_esc,

            MediaOverlaysRateIncrease: Strings.i18n_audio_rate_increase,
            MediaOverlaysRateDecrease: Strings.i18n_audio_rate_decrease,
            //MediaOverlaysRateIncreaseAlt: "",
            //MediaOverlaysRateDecreaseAlt: "",
            MediaOverlaysRateReset: Strings.i18n_audio_rate_reset,

            MediaOverlaysVolumeIncrease: Strings.i18n_audio_volume_increase,
            MediaOverlaysVolumeDecrease: Strings.i18n_audio_volume_decrease,
            //MediaOverlaysVolumeIncreaseAlt: "",
            //MediaOverlaysVolumeDecreaseAlt: "",
            MediaOverlaysVolumeMuteToggle: Strings.i18n_audio_mute + " / " + Strings.i18n_audio_unmute,

            MediaOverlaysAdvancedPanelShowHide: Strings.i18n_audio_expand,

            BackgroundAudioPlayPause: Strings.i18n_audio_play_background + " / " + Strings.i18n_audio_pause_background
        },
        defaultOptions:  {},
        accesskeys: {}, // single key strokes are dynamically populated, based on the full shortcuts below:
        ShowSettingsModal: 'o', //accesskey'ed

        SettingsModalSave: 's', //accesskey'ed
        SettingsModalClose: 'c', //accesskey'ed

        PagePrevious: 'left', // ALT BELOW
        PageNext: 'right', // ALT BELOW
        PagePreviousAlt: '1', //accesskey'ed
        PageNextAlt: '2', //accesskey'ed

        ToolbarShow: 'v', //accesskey'ed
        ToolbarHide: 'x', //accesskey'ed

        FullScreenToggle: 'h', //accesskey'ed

        SwitchToLibrary: 'b', //accesskey'ed

        TocShowHideToggle: 't', //accesskey'ed

        NightTheme: 'n', //accesskey'ed

        MediaOverlaysEscape: 'r', //accesskey'ed

        //MediaOverlaysPlayPauseAlt: 'p', // ALT BELOW
        MediaOverlaysPlayPause: 'm', //accesskey'ed

        MediaOverlaysRateIncrease: 'l', //accesskey'ed
        MediaOverlaysRateDecrease: 'j', //accesskey'ed
        //MediaOverlaysRateIncreaseAlt: 'F8', //??
        //MediaOverlaysRateDecreaseAlt: 'shift+F8', //??
        MediaOverlaysRateReset: 'k', //accesskey'ed

        MediaOverlaysVolumeIncrease: 'w', //accesskey'ed
        MediaOverlaysVolumeDecrease: 'q', //accesskey'ed
        //MediaOverlaysVolumeIncreaseAlt: 'F7', //??
        //MediaOverlaysVolumeDecreaseAlt: 'shift+F7', //??
        MediaOverlaysVolumeMuteToggle: 'a', //accesskey'ed

        MediaOverlaysPrevious: 'y', //accesskey'ed
        MediaOverlaysNext: 'u', //accesskey'ed

        MediaOverlaysAdvancedPanelShowHide: 'g', //accesskey'ed

        BackgroundAudioPlayPause: 'd'
	};

    try
    {
        // reset defaultOptions with the hard-coded values
        Keyboard.defaultOptions = {};
        for (prop in Keyboard)
        {
            if (!Keyboard.hasOwnProperty(prop)) continue;

            if (typeof Keyboard[prop] !== 'string') continue;

            Keyboard.defaultOptions[prop] = Keyboard[prop];
        }

        // too early (async reader.options storage lookup)
        // Settings.get('reader', function(json)
        // {
        //    Keyboard.applySettings(json);
        // });

        //unnecessary
        //Keyboard.resetToDefaults();

        //necessary!
        Keyboard.resetAccessKeys();
    }
    catch(e)
    {
        console.error(e);
    }

	return Keyboard;
});

define('readium_js_viewer/ReaderSettingsDialog_Keyboard',['hgn!readium_js_viewer_html_templates/settings-keyboard-item.html', 'readium_js_viewer_i18n/Strings', './Dialogs', './storage/Settings', './Keyboard', 'underscore'], function(KeyboardItem, Strings, Dialogs, Settings, Keyboard, _){


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

        for (var i = 0; i < 2; i++) // 2-pass process
        {
            // duplicates
            $inputs.each(function()
            {
                var $that = $(this);

                var thatInvalid = $that.parent().hasClass("invalidShortcut");
                var thatDuplicate = $that.parent().hasClass("duplicateShortcut");
                var thatOriginal = $that.attr("placeholder");

                var thatVal = thatInvalid || thatDuplicate ? thatOriginal : $that.attr("data-val");

                if (thatDuplicate) return true; // continue (second pass)

                $inputs.each(function()
                {
                    var $self = $(this);
                    if ($self[0] === $that[0]) return true; //continue

                    var selfOriginal = $self.attr("placeholder");

                    var selfInvalid = $self.parent().hasClass("invalidShortcut");

                    var selfDuplicate = $self.parent().hasClass("duplicateShortcut");

                    var selfVal = selfInvalid || selfDuplicate ? selfOriginal : $self.attr("data-val");

                    if (thatVal === selfVal)
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
        }

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

    var saveKeys = function()
    {
        var atLeastOneChanged = false;
        var keys = {};

        checkKeyboardShortcuts();
        $(".keyboardInput").each(function()
        {
            var $that = $(this);

            var original = $that.attr("placeholder");
            var id = $that.attr("id");

            var val = $that.attr("data-val");
            //var valShown = $that.val();

            if ($that.parent().hasClass("invalidShortcut") || $that.parent().hasClass("duplicateShortcut"))
            {
                // if (original === val) return true; // continue (effectively resets to the default valid value)
                val = original;
            }

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

        return keys;
    };

	return {
		initKeyboardList : initKeyboardList,
        saveKeys : saveKeys
	}
});

define('readium_js_viewer/ReaderSettingsDialog',['module', 'hgn!readium_js_viewer_html_templates/settings-dialog.html', './ReaderSettingsDialog_Keyboard', 'readium_js_viewer_i18n/Strings', './Dialogs', './storage/Settings', './Keyboard'], function(module, SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){

  var image_path_prefix = module.config().imagePathPrefix || "";

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
		$('#app-container').append(SettingsDialog({image_path_prefix: image_path_prefix, strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));

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


define("hgn!readium_js_viewer_html_templates/about-dialog.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"modal fade\" id=\"about-dialog\" tabindex=\"-1\" role=\"dialog\" aria-label=\"");t.b(t.t(t.d("strings.about",c,p,0)));t.b("\" aria-hidden=\"true\">\r");t.b("\n" + i);t.b("  <div class=\"modal-dialog\">\r");t.b("\n" + i);t.b("    <div class=\"modal-content\">\r");t.b("\n" + i);t.b("      <div class=\"modal-body\">\r");t.b("\n" + i);t.b("      	<div class=\"splash-logo\">\r");t.b("\n" + i);t.b("      		<img src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/about_readium_logo.png\" alt=\"\">\r");t.b("\n" + i);t.b("      	</div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("      	<div class=\"about-message\">\r");t.b("\n" + i);t.b("	      	<span>");t.b(t.t(t.d("strings.i18n_html_readium_tm_a_project",c,p,0)));t.b("</span>\r");t.b("\n" + i);t.b("      	</div>\r");t.b("\n" + i);t.b("      	<div>\r");t.b("\n" + i);t.b("			     <img src=\"");t.b(t.t(t.f("image_path_prefix",c,p,0)));t.b("images/partner_logos.png\">\r");t.b("\n" + i);t.b("		    </div>\r");t.b("\n" + i);t.b("        <h4 style=\"color:#111155\">");t.b(t.t(t.d("strings.gethelp",c,p,0)));t.b("</h4>\r");t.b("\n" + i);t.b("        <div class=\"version\">");t.b(t.v(t.d("viewer.chromeVersion",c,p,0)));t.b("</div>\r");t.b("\n" + i);t.b("        <div class=\"build-date\">");t.b(t.v(t.d("viewer.dateTimeString",c,p,0)));t.b("</div>\r");t.b("\n" + i);t.b("        <div class=\"version-details\">\r");t.b("\n" + i);t.b("        <div><a target=\"_blank\" href=\"https://github.com/readium/readium-js-viewer/tree/");t.b(t.v(t.d("viewer.sha",c,p,0)));t.b("\">readium-js-viewer@");t.b(t.v(t.d("viewer.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("viewer.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("          <div><a target=\"_blank\" href=\"https://github.com/readium/readium-js/tree/");t.b(t.v(t.d("readium.sha",c,p,0)));t.b("\">readium-js@");t.b(t.v(t.d("readium.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("readium.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("          <div><a target=\"_blank\" href=\"https://github.com/readium/readium-shared-js/tree/");t.b(t.v(t.d("sharedJs.sha",c,p,0)));t.b("\">readium-shared-js@");t.b(t.v(t.d("sharedJs.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("sharedJs.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("          <div><a target=\"_blank\" href=\"https://github.com/readium/readium-cfi-js/tree/");t.b(t.v(t.d("cfiJs.sha",c,p,0)));t.b("\">readium-cfi-js@");t.b(t.v(t.d("cfiJs.sha",c,p,0)));t.b("</a>");if(!t.s(t.d("cfiJs.clean",c,p,1),c,p,1,0,0,"")){t.b("<span class=\"local-changes-alert\">(with local changes)</span>");};t.b("</div>\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("      </div>\r");t.b("\n" + i);t.b("    </div><!-- /.modal-content -->\r");t.b("\n" + i);t.b("  </div><!-- /.modal-dialog -->\r");t.b("\n" + i);t.b("</div><!-- /.modal -->\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!readium_js_viewer_html_templates/reader-navbar.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"btn-group navbar-left\">\r");t.b("\n" + i);t.b("        <!-- <button type=\"button\" class=\"btn btn-default icon icon-show-hide\"></button>  -->\r");t.b("\n" + i);t.b("    <button id=\"aboutButt1\" tabindex=\"1\" type=\"button\" class=\"btn icon-logo\" data-toggle=\"modal\" data-target=\"#about-dialog\" title=\"");t.b(t.v(t.d("strings.about",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.about",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"icon-readium\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button id=\"buttShowToolBar\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:1px;height=1px;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.ToolbarShow",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.ToolbarShow",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.ToolbarShow",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button id=\"buttHideToolBar\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.ToolbarHide",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.ToolbarHide",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.ToolbarHide",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button id=\"buttNightTheme\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.NightTheme",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.NightTheme",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttRatePlus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysRateIncrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttRateMinus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysRateDecrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttVolumePlus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysVolumeIncrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <button id=\"buttVolumeMinus\" style=\"opacity:0;visibility:hidden;border:0;outline:0;padding:0;margin:0;width:0;height=0;\" tabindex=\"-1\" aria-hidden=\"true\" type=\"button\" title=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("\" aria-label=\"access key ");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysVolumeDecrease",c,p,0)));t.b("\"> </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("<div class=\"btn-group navbar-right\">\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("    <div id=\"backgroundAudioTrack-div\">\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"backgroundAudioTrack-button-play\" type=\"button\" class=\"btn icon-play-audio-background\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_play_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_play_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.BackgroundAudioPlayPause",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-music\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"backgroundAudioTrack-button-pause\" type=\"button\" class=\"btn icon-pause-audio-background\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_pause_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_pause_background",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.BackgroundAudioPlayPause",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-volume-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <!--Audioplayer Controls START-->\r");t.b("\n" + i);t.b("    <div id=\"audioplayer\">\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-collapse-audio\" type=\"button\" class=\"btn icon-collapse-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_collapse",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_collapse",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-open\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-expand-audio\" type=\"button\" class=\"btn icon-expand-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_expand",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_expand",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysAdvancedPanelShowHide",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-save\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-previous-audio\" type=\"button\" class=\"btn icon-previous-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPrevious",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPrevious",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysPrevious",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-backward\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-play-audio\" type=\"button\" class=\"btn icon-play-audio\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_play",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_play",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysPlayPause",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-play\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-pause-audio\" type=\"button\" class=\"btn icon-pause-audio\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_pause",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\"  aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_pause",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysPlayPause",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-pause\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-next-audio\" type=\"button\" class=\"btn icon-next-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysNext",c,p,0)));t.b("]\" arial-label=\"");t.b(t.v(t.d("strings.i18n_audio_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysNext",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysNext",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-forward\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <div id=\"audioResponsive\">\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-audio-volume-mute\" type=\"button\" class=\"btn icon-audio-volume-mute\" title=\"");t.b(t.v(t.d("strings.i18n_audio_mute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_mute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-volume-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-audio-volume-unmute\" type=\"button\" class=\"btn icon-audio-volume-unmute\" title=\"");t.b(t.v(t.d("strings.i18n_audio_unmute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_unmute",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeMuteToggle",c,p,0)));t.b("]\">\r");t.b("\n" + i);t.b("            <span class=\"glyphicon glyphicon-volume-off\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("        <input tabindex=\"1\" id=\"volume-range-slider\" type=\"range\" role=\"slider\" min=\"0\" aria-value-min=\"0\" aria-valuemin=\"0\" max=\"100\" aria-value-max=\"100\" aria-valuemax=\"100\" value=\"100\" aria-valuenow=\"100\" aria-value-now=\"100\" aria-valuetext=\"100%\" aria-value-text=\"100%\" title=\"");t.b(t.v(t.d("strings.i18n_audio_volume",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("]\" arial-label=\"");t.b(t.v(t.d("strings.i18n_audio_volume",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysVolumeIncrease",c,p,0)));t.b("]\" />\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" tabindex=\"1\" id=\"btn-touch-audio-enable\" type=\"button\" class=\"btn icon-touch-audio-enable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_touch_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_touch_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-off-hand\" class=\"glyphicon glyphicon-hand-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-off\" class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <button tabindex=\"1\" id=\"btn-touch-audio-disable\" type=\"button\" class=\"btn icon-touch-audio-disable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_touch_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_touch_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-on-hand\" class=\"glyphicon glyphicon-hand-up\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <span id=\"icon-touch-on\" class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("        </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        \r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("        <div id=\"audioExpanded\" role=\"alert\">\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <input tabindex=\"1\" id=\"time-range-slider\" type=\"range\" role=\"slider\" min=\"0\" aria-value-min=\"0\" aria-valuemin=\"0\" max=\"100\" aria-value-max=\"100\" aria-valuemax=\"100\" value=\"0\" aria-valuenow=\"0\" aria-value-now=\"0\" aria-valuetext=\"0%\" aria-value-text=\"0%\" data-value=\"0\" title=\"");t.b(t.v(t.d("strings.i18n_audio_time",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_time",c,p,0)));t.b("\"  />\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-audio-rate\" type=\"button\" class=\"btn icon-rate-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_rate_reset",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateReset",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_rate_reset",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateReset",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysRateReset",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("                <span class=\"glyphicon glyphicon-play-circle\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <input tabindex=\"1\" id=\"rate-range-slider\" type=\"range\" role=\"slider\" min=\"0\" aria-value-min=\"0\" aria-valuemin=\"0\" max=\"4\" aria-value-max=\"4\" aria-valuemax=\"4\" value=\"1\" aria-valuenow=\"1\" aria-value-now=\"1\" aria-valuetext=\"1x\" aria-value-text=\"1x\" step=\"0.5\" title=\"");t.b(t.v(t.d("strings.i18n_audio_rate",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_rate",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysRateDecrease",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.MediaOverlaysRateIncrease",c,p,0)));t.b("]\" />\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <span aria-hidden=\"true\" tabindex=\"-1\" id=\"rate-range-slider-label\">1x</span>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <form action=\"\" id=\"mo-sync-form\">\r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"default\" id=\"mo-sync-default\" class=\"mo-sync\" checked=\"checked\"  title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_default",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_default",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-default\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_default",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">&#8855;</span></label>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"word\" id=\"mo-sync-word\" class=\"mo-sync\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-word\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_audio_sync_word",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("                \r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"sentence\" id=\"mo-sync-sentence\" class=\"mo-sync\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-sentence\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_audio_sync_sentence",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("                \r");t.b("\n" + i);t.b("                <input tabindex=\"1\" type=\"radio\" name=\"mo-sync\" value=\"paragraph\" id=\"mo-sync-paragraph\" class=\"mo-sync\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"> </input>\r");t.b("\n" + i);t.b("                <label tabindex=\"1\" for=\"mo-sync-paragraph\" title=\"");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b(" ");t.b(t.v(t.d("strings.i18n_audio_sync",c,p,0)));t.b("\"><span aria-hidden=\"true\">");t.b(t.v(t.d("strings.i18n_audio_sync_paragraph",c,p,0)));t.b("</span></label>\r");t.b("\n" + i);t.b("            </form>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <div id=\"audio-block\">\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <div id=\"mo-highlighters\">\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-0\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": ");t.b(t.v(t.d("strings.i18n_audio_highlight_default",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": ");t.b(t.v(t.d("strings.i18n_audio_highlight_default",c,p,0)));t.b("\" aria-selected=\"true\" data-mohighlight=\"0\" >\r");t.b("\n" + i);t.b("                    ");t.b(t.v(t.d("strings.i18n_audio_highlight_default",c,p,0)));t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-1\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #1\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #1\" data-mohighlight=\"1\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-2\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #2\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #2\" data-mohighlight=\"2\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-3\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #3\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #3\" data-mohighlight=\"3\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-4\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #4\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #4\" data-mohighlight=\"4\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-5\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #5\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #5\" data-mohighlight=\"5\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("                <button tabindex=\"1\" id=\"mo-highlighter-6\" type=\"button\" class=\"btn btn-mo-highlighter\" title=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #6\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_highlight",c,p,0)));t.b(": #6\" data-mohighlight=\"6\" >\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("                </button>\r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-playback-scroll-enable\" type=\"button\" class=\"btn icon-playback-scroll-enable\" title=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-playback-scroll-off\" class=\"glyphicon glyphicon-sort-by-attributes\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-playback-scroll-disable\" type=\"button\" class=\"btn icon-playback-scroll-disable\" title=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_playback_scroll_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-playback-scroll-on\" class=\"glyphicon glyphicon-sort\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-auto-page-turn-enable\" type=\"button\" class=\"btn icon-auto-page-turn-enable\" title=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-auto-page-turn-off\" class=\"glyphicon glyphicon-sound-stereo\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-auto-page-turn-disable\" type=\"button\" class=\"btn icon-auto-page-turn-disable\" title=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_auto_page_turn_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-auto-page-turn-on\" class=\"glyphicon glyphicon-sound-dolby\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-skip-audio-enable\" type=\"button\" class=\"btn icon-skip-audio-enable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_skip_enable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_skip_enable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-skip-off\" class=\"glyphicon glyphicon-remove-circle\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-skip-audio-disable\" type=\"button\" class=\"btn icon-skip-audio-disable\" title=\"");t.b(t.v(t.d("strings.i18n_audio_skip_disable",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_skip_disable",c,p,0)));t.b("\" >\r");t.b("\n" + i);t.b("                <span id=\"icon-skip-on\" class=\"glyphicon glyphicon-ok-circle\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("            <button tabindex=\"1\" id=\"btn-esc-audio\" type=\"button\" class=\"btn icon-esc-audio\" title=\"");t.b(t.v(t.d("strings.i18n_audio_esc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysEscape",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.i18n_audio_esc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.MediaOverlaysEscape",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.MediaOverlaysEscape",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("                <span class=\"glyphicon glyphicon-eject\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("            </button>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            </div>\r");t.b("\n" + i);t.b("            \r");t.b("\n" + i);t.b("            <!-- div class=\"checkbox\">\r");t.b("\n" + i);t.b("              <label>\r");t.b("\n" + i);t.b("                <input type=\"checkbox\" value=\"false\"> Skip\r");t.b("\n" + i);t.b("              </label>\r");t.b("\n" + i);t.b("            </div -->\r");t.b("\n" + i);t.b("        </div>\r");t.b("\n" + i);t.b("    </div> \r");t.b("\n" + i);t.b("    <!--Audioplayer Controls END-->\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <div class=\"zoom-wrapper dropdown\" style=\"display:none\">\r");t.b("\n" + i);t.b("        <a tabindex=\"1\" href=\"#\" data-toggle=\"dropdown\"><input tabindex=\"1\" type=\"text\" value=\"100%\" disabled/><span class=\"caret\"></span></a>\r");t.b("\n" + i);t.b("        <ul id=\"zoom-menu\" class=\"dropdown-menu\" role=\"menu\">\r");t.b("\n" + i);t.b("            <li id=\"zoom-custom\"><a href=\"#\" tabindex=\"1\">Custom <span class=\"glyphicon glyphicon-ok\"></span></a></li>\r");t.b("\n" + i);t.b("            <li id=\"zoom-fit-width\"><a href=\"#\" tabindex=\"1\">Fit Width <span class=\"glyphicon glyphicon-ok\"></span></a></li>\r");t.b("\n" + i);t.b("            <li id=\"zoom-fit-screen\" class=\"active-zoom\"><a href=\"#\" tabindex=\"1\">Fit Screen <span class=\"glyphicon glyphicon-ok\"></span></a></li>\r");t.b("\n" + i);t.b("        </ul>\r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("    <button tabindex=\"1\" type=\"button\" class=\"btn icon-library\" title=\"");t.b(t.v(t.d("strings.view_library",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SwitchToLibrary",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.view_library",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.SwitchToLibrary",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.SwitchToLibrary",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-folder-open\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    <button tabindex=\"1\" type=\"button\" class=\"btn icon-annotations\" title=\"");t.b(t.v(t.d("strings.highlight_selection",c,p,0)));t.b("\" aria-label=\"");t.b(t.v(t.d("strings.highlight_selection",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-edit\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    <button id=\"tocButt\" tabindex=\"1\" tabindex=\"1\" type=\"button\" class=\"btn icon-toc\" title=\"");t.b(t.v(t.d("strings.toc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.TocShowHideToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.toc",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.TocShowHideToggle",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.TocShowHideToggle",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-list\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    <button id=\"settbutt1\" tabindex=\"1\" type=\"button\" class=\"btn icon-settings\" data-toggle=\"modal\" data-target=\"#settings-dialog\" title=\"");t.b(t.v(t.d("strings.settings",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.ShowSettingsModal",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.settings",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.ShowSettingsModal",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.ShowSettingsModal",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-cog\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <button tabindex=\"1\" id=\"buttFullScreenToggle\" type=\"button\" class=\"btn icon-full-screen\" title=\"");t.b(t.v(t.d("strings.enter_fullscreen",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.FullScreenToggle",c,p,0)));t.b("]\" aria-label=\"");t.b(t.v(t.d("strings.enter_fullscreen",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.FullScreenToggle",c,p,0)));t.b("]\" accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.FullScreenToggle",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("        <span class=\"glyphicon glyphicon-resize-full\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("    </button>\r");t.b("\n" + i);t.b("    \r");t.b("\n" + i);t.b("    <!-- <button type=\"button\" class=\"btn btn-default icon icon-bookmark\"></button>-->\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!readium_js_viewer_html_templates/reader-body.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div id=\"readium-toc-body\"\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.toc",c,p,0)));t.b("\"\r");t.b("\n" + i);t.b("role=\"navigation\"\r");t.b("\n" + i);t.b(">\r");t.b("\n" + i);t.b("</div>\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("<div id=\"reading-area\" role=\"main\">  \r");t.b("\n" + i);t.b("  <div id=\"epub-reader-container\">\r");t.b("\n" + i);t.b("    <div id=\"epub-reader-frame\">\r");t.b("\n" + i);t.b("    </div>\r");t.b("\n" + i);t.b("  </div>\r");t.b("\n" + i);t.b("  \r");t.b("\n" + i);t.b("  <div id=\"readium-page-btns\" role=\"region\" aria-label=\"");t.b(t.v(t.d("strings.i18n_page_navigation",c,p,0)));t.b("\">\r");t.b("\n" + i);t.b("  <!-- page left/right buttons inserted here when EPUB is loaded (page progression direction) -->\r");t.b("\n" + i);t.b("  </div>\r");t.b("\n" + i);t.b("  \r");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});


define("hgn!readium_js_viewer_html_templates/reader-body-page-btns.html", ["hogan"], function(hogan){  var tmpl = new hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<!-- Left page -->\r");t.b("\n" + i);t.b("<button tabindex=\"0\" id=\"left-page-btn\" class=\"page-switch-overlay-icon\" type=\"button\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);if(t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,0,144,402,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PagePreviousAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);});c.pop();}t.b("\r");t.b("\n" + i);if(!t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,1,0,0,"")){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PagePrevious",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PagePreviousAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PagePreviousAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);};t.b("\r");t.b("\n" + i);t.b(">\r");t.b("\n" + i);t.b("<!-- img aria-hidden=\"true\" src=\"images/pagination1.svg\" -->\r");t.b("\n" + i);t.b("<span class=\"glyphicon glyphicon-chevron-left\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("</button>\r");t.b("\n" + i);t.b("  \r");t.b("\n" + i);t.b("<!-- Right page -->\r");t.b("\n" + i);t.b("<button tabindex=\"0\" id=\"right-page-btn\" class=\"page-switch-overlay-icon\" type=\"button\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);if(t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,0,1079,1325,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_previous",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PageNextAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);});c.pop();}t.b("\r");t.b("\n" + i);if(!t.s(t.f("pageProgressionDirectionIsRTL",c,p,1),c,p,1,0,0,"")){t.b("title=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("aria-label=\"");t.b(t.v(t.d("strings.i18n_page_next",c,p,0)));t.b(" [");t.b(t.v(t.d("keyboard.PageNext",c,p,0)));t.b("] / [");t.b(t.v(t.d("keyboard.PageNextAlt",c,p,0)));t.b("]\"\r");t.b("\n" + i);t.b("\r");t.b("\n" + i);t.b("accesskey=\"");t.b(t.v(t.d("keyboard.accesskeys.PageNextAlt",c,p,0)));t.b("\"\r");t.b("\n" + i);};t.b("\r");t.b("\n" + i);t.b(">\r");t.b("\n" + i);t.b("<!-- img aria-hidden=\"true\" src=\"images/pagination1.svg\" -->\r");t.b("\n" + i);t.b("<span class=\"glyphicon glyphicon-chevron-right\" aria-hidden=\"true\"></span>\r");t.b("\n" + i);t.b("</button>\r");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "", hogan);  function render(){ return tmpl.render.apply(tmpl, arguments); } render.template = tmpl; return render;});

define('readium_js_viewer/analytics/Analytics',[],function(){
	return{
		trackView : function(){},
		sendEvent : function(){}
	}
});

define('readium_js_viewer/EpubReaderMediaOverlays',['module','jquery', 'underscore', 'bootstrap', 'readium_js/Readium', './Spinner', './storage/Settings', 'readium_js_viewer_i18n/Strings', './Dialogs', './Keyboard'], 
        function (module, $, _, bootstrap, Readium, spinner, Settings, Strings, Dialogs, Keyboard) {

    var init = function(readium) {

        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
            // That's after mediaOverlayPlayer.onPageChanged()

            if (readium.reader.isMediaOverlayAvailable()) {
                $('#audioplayer').show();
            }

            if (!pageChangeData.spineItem) return;

            var smil = readium.reader.package().media_overlay.getSmilBySpineItem(pageChangeData.spineItem);

            var atLeastOneIsEnabled = false;

            var $moSyncWord = $('#mo-sync-word');
            if (!smil || !smil.hasSync("word"))
            {
                $moSyncWord.attr('disabled', "disabled");
            }
            else
            {
                atLeastOneIsEnabled = true;
                $moSyncWord.removeAttr('disabled');
            }

            var $moSyncSentence = $('#mo-sync-sentence');
            if (!smil || !smil.hasSync("sentence"))
            {
                $moSyncSentence.attr('disabled', "disabled");
            }
            else
            {
                atLeastOneIsEnabled = true;
                $moSyncSentence.removeAttr('disabled');
            }

            var $moSyncParagraph = $('#mo-sync-paragraph');
            if (!smil || !smil.hasSync("paragraph"))
            {
                $moSyncParagraph.attr('disabled', "disabled");
            }
            else
            {
                atLeastOneIsEnabled = true;
                $moSyncParagraph.removeAttr('disabled');
            }

            var $moSyncDefault = $('#mo-sync-default');
            if (!atLeastOneIsEnabled)
            {
                $moSyncDefault.attr('disabled', "disabled");
            }
            else
            {
                $moSyncDefault.removeAttr('disabled');
            }
        });

        var $audioPlayer = $('#audioplayer');

        Settings.get('reader', function(json)
        {
            if (!json)
            {
                json = {};

                var settings = readium.reader.viewerSettings();

                json.mediaOverlaysSkipSkippables = settings.mediaOverlaysSkipSkippables;
                json.mediaOverlaysAutomaticPageTurn = settings.mediaOverlaysAutomaticPageTurn;
                json.mediaOverlaysEnableClick = settings.mediaOverlaysEnableClick;
                json.mediaOverlaysPreservePlaybackWhenScroll = settings.mediaOverlaysPreservePlaybackWhenScroll;

                Settings.put('reader', json);
            }

            if (json.mediaOverlaysSkipSkippables) // excludes typeof json.mediaOverlaysSkipSkippables === "undefined", so the default is to disable skippability
            {
                $audioPlayer.addClass('skip');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysSkipSkippables: true
                });
            }
            else
            {
                $audioPlayer.removeClass('skip');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysSkipSkippables: false
                });
            }

            if (json.mediaOverlaysPreservePlaybackWhenScroll)
            {
                $audioPlayer.addClass('playScroll');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysPreservePlaybackWhenScroll: true
                });
            }
            else
            {
                $audioPlayer.removeClass('playScroll');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysPreservePlaybackWhenScroll: false
                });
            }

            if (json.mediaOverlaysAutomaticPageTurn)
            {
                $audioPlayer.addClass('autoPageTurn');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysAutomaticPageTurn: true
                });
            }
            else
            {
                $audioPlayer.removeClass('autoPageTurn');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysAutomaticPageTurn: false
                });
            }

            if (json.mediaOverlaysEnableClick)
            {
                $audioPlayer.removeClass('no-touch');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysEnableClick: true
                });
            }
            else
            {
                $audioPlayer.addClass('no-touch');

                readium.reader.updateSettings({
                    doNotUpdateView: true,
                    mediaOverlaysEnableClick: false
                });
            }
        });

        var $moSyncDefault = $('#mo-sync-default');
        $moSyncDefault.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: ""
            });

            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncWord = $('#mo-sync-word');
        $moSyncWord.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "word"
            });

            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncSentence = $('#mo-sync-sentence');
        $moSyncSentence.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "sentence"
            });

            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });
        var $moSyncParagraph = $('#mo-sync-paragraph');
        $moSyncParagraph.on("click", function () {
            var wasPlaying = readium.reader.isPlayingMediaOverlay();
            if (wasPlaying)
            {
                readium.reader.pauseMediaOverlay();
            }

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSynchronizationGranularity: "paragraph"
            });

            if (wasPlaying)
            {
                readium.reader.playMediaOverlay();
            }
        });


        var $highlighterButts = $('.btn-mo-highlighter');
        $highlighterButts.on("click", function () {
            $highlighterButts.attr("aria-selected", "false");
            $(this).attr("aria-selected", "true");

            var index = $(this).attr("data-mohighlight");

            readium.reader.setStyles([
                {
                    selector: ".mo-active-default",
                    declarations: undefined
                }
            ], true);

            if (index === "1")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "yellow !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important",
                            "box-shadow": "0px 0px 0.4em #333333 !important"
                        }
                    }
                ], true);
            }
            else if (index === "2")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "black !important",
                            "color": "white !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "3")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "orange !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "4")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "blue !important",
                            "color": "white !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "5")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "magenta !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
            else if (index === "6")
            {
                readium.reader.setStyles([
                    {
                        selector: ".mo-active-default",
                        declarations: {
                            "background-color": "#00FF00 !important",
                            "color": "black !important",
                            "border-color": "transparent !important",
                            "border-radius": "0.4em !important"
                        }
                    }
                ], true);
            }
        });

        Keyboard.on(Keyboard.MediaOverlaysEscape, 'reader', readium.reader.escapeMediaOverlay);

        var $escAudioBtn = $("#btn-esc-audio");
        $escAudioBtn.on("click", readium.reader.escapeMediaOverlay);

        var $previousAudioBtn = $("#btn-previous-audio");
        var $nextAudioBtn = $("#btn-next-audio");

        Keyboard.on(Keyboard.MediaOverlaysPlayPause, 'reader', readium.reader.toggleMediaOverlay);
        //Keyboard.on(Keyboard.MediaOverlaysPlayPauseAlt, 'reader', readium.reader.toggleMediaOverlay);

        var $playAudioBtn = $("#btn-play-audio");
        var $pauseAudioBtn = $("#btn-pause-audio");

        $playAudioBtn.on("click", function () {
            //readium.reader[$(this).hasClass('pause-audio') ? 'pauseMediaOverlay' : 'playMediaOverlay']();
            //readium.reader.toggleMediaOverlay();
            var wasFocused = document.activeElement === $playAudioBtn[0];
            readium.reader.playMediaOverlay();

            $playAudioBtn.removeAttr("accesskey");
            $pauseAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);

            if (wasFocused) setTimeout(function(){ $pauseAudioBtn[0].focus(); }, 50);
        });

        $pauseAudioBtn.on("click", function () {
            var wasFocused = document.activeElement === $pauseAudioBtn[0];
            readium.reader.pauseMediaOverlay();

            $pauseAudioBtn.removeAttr("accesskey");
            $playAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);

            if (wasFocused) setTimeout(function(){ $playAudioBtn[0].focus(); }, 50);
        });


        var $expandAudioBtn = $("#btn-expand-audio");
        var $collapseAudioBtn = $("#btn-collapse-audio");

        var updateAudioExpand = function(expand)
        {
            if (expand)
            {
                $audioPlayer.addClass('expanded-audio');

                $expandAudioBtn.removeAttr("accesskey");
                $collapseAudioBtn.attr("accesskey", Keyboard.MediaOverlaysAdvancedPanelShowHide);
            }
            else
            {
                $audioPlayer.removeClass('expanded-audio');

                $collapseAudioBtn.removeAttr("accesskey");
                $expandAudioBtn.attr("accesskey", Keyboard.MediaOverlaysAdvancedPanelShowHide);
            }
        };

        Keyboard.on(Keyboard.MediaOverlaysAdvancedPanelShowHide, 'reader', function(){
            var toFocus = undefined;
            if ($audioPlayer.hasClass('expanded-audio'))
            {
                updateAudioExpand(false);
                toFocus = $expandAudioBtn[0];
            }
            else
            {
                updateAudioExpand(true);
                toFocus = $collapseAudioBtn[0];
            }

            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ toFocus.focus(); }, 50);
        });

        $expandAudioBtn.on("click", function() {
            var wasFocused = document.activeElement === $expandAudioBtn[0];
            updateAudioExpand(true);
            if (wasFocused) setTimeout(function(){ $collapseAudioBtn[0].focus(); }, 50);
        });

        $collapseAudioBtn.on("click", function() {
            var wasFocused = document.activeElement === $collapseAudioBtn[0];
            updateAudioExpand(false);
            if (wasFocused) setTimeout(function(){ $expandAudioBtn[0].focus(); }, 50);
        });

        var $changeTimeControl = $('#time-range-slider');

        var debouncedTimeRangeSliderChange = _.debounce(
            function() {

                inDebounce = false;

                var percent = $changeTimeControl.val();

                var package = readium.reader.package();
                if (!package) return;
                if (!package.media_overlay) return;

                var par = {par: undefined};
                var smilData = {smilData: undefined};
                var milliseconds = {milliseconds: undefined};

                package.media_overlay.percentToPosition(percent, smilData, par, milliseconds);

                if (!par.par || !par.par.text || !smilData.smilData)
                {
                    return;
                }

                var smilSrc = smilData.smilData.href;

                var offsetS = milliseconds.milliseconds / 1000.0;

                readium.reader.mediaOverlaysOpenContentUrl(par.par.text.src, smilSrc, offsetS);
            }
        , 800);

        var updateSliderLabels = function($slider, val, txt)
        {
            $slider.attr("aria-valuenow", val+"");
            $slider.attr("aria-value-now", val+"");

            $slider.attr("aria-valuetext", txt+"");
            $slider.attr("aria-value-text", txt+"");
        };

        $changeTimeControl.on("change",
        function() {

            var percent = $changeTimeControl.val();
            percent = Math.round(percent);

            $changeTimeControl.attr("data-value", percent);
            updateSliderLabels($changeTimeControl, percent, percent + "%");

            if (readium.reader.isPlayingMediaOverlay())
            {
                readium.reader.pauseMediaOverlay();
            }
            debouncedTimeRangeSliderChange();
        }
        );

        readium.reader.on(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value) {

            //var $audioPlayerControls = $('#audioplayer button, #audioplayer input:not(.mo-sync)');

            var percent = 0;

            var isPlaying = 'isPlaying' in value
                ? value.isPlaying   // for all the other events
                : true;             // for events raised by positionChanged, as `isPlaying` flag isn't even set

            var wasFocused = document.activeElement === $playAudioBtn[0] || document.activeElement === $pauseAudioBtn[0];

            if (isPlaying)
            {
                $playAudioBtn.removeAttr("accesskey");
                $pauseAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);
            }
            else
            {
                $pauseAudioBtn.removeAttr("accesskey");
                $playAudioBtn.attr("accesskey", Keyboard.MediaOverlaysPlayPause);
            }

            $audioPlayer.toggleClass('isPlaying', isPlaying);

            if (wasFocused) setTimeout(function(){ (isPlaying ? $pauseAudioBtn[0] : $playAudioBtn[0]).focus(); }, 50);

            percent = -1; // to prevent flickering slider position (pause callback is raised between each audio phrase!)

            // if (readium.reader.isMediaOverlayAvailable()) {
            //     $audioPlayer.show();
            //     //$audioPlayerControls.attr('disabled', false);
            //
            // } else {
            //     //$audioPlayerControls.attr('disabled', true);
            // }

            if ((typeof value.playPosition !== "undefined") && (typeof value.smilIndex !== "undefined") && (typeof value.parIndex !== "undefined"))
            {
                var package = readium.reader.package();

                var playPositionMS = value.playPosition * 1000;
                percent = package.media_overlay.positionToPercent(value.smilIndex, value.parIndex, playPositionMS);

                if (percent < 0)
                {
                    percent = 0;
                }
            }

            if (percent >= 0)
            {
                $changeTimeControl.val(percent);
                percent = Math.round(percent);
                $changeTimeControl.attr("data-value", percent);
                updateSliderLabels($changeTimeControl, percent, percent + "%");
            }
        });

        var $buttondPreservePlaybackWhenScrollDisable = $('#btn-playback-scroll-disable');
        var $buttonPreservePlaybackWhenScrollEnable = $('#btn-playback-scroll-enable');

        $buttondPreservePlaybackWhenScrollDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttondPreservePlaybackWhenScrollDisable[0];

            $audioPlayer.removeClass('playScroll');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysPreservePlaybackWhenScroll: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysPreservePlaybackWhenScroll = false;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonPreservePlaybackWhenScrollEnable[0].focus(); }, 50);
        });

        $buttonPreservePlaybackWhenScrollEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonPreservePlaybackWhenScrollEnable[0];

            $audioPlayer.addClass('playScroll');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysPreservePlaybackWhenScroll: true
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysPreservePlaybackWhenScroll = true;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttondPreservePlaybackWhenScrollDisable[0].focus(); }, 50);
        });

        var $buttonAutoPageTurnDisable = $('#btn-auto-page-turn-disable');
        var $buttonAutoPageTurnEnable = $('#btn-auto-page-turn-enable');

        $buttonAutoPageTurnDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttonAutoPageTurnDisable[0];

            $audioPlayer.removeClass('autoPageTurn');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysAutomaticPageTurn: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysAutomaticPageTurn = false;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonAutoPageTurnEnable[0].focus(); }, 50);
        });

        $buttonAutoPageTurnEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonAutoPageTurnEnable[0];

            $audioPlayer.addClass('autoPageTurn');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysAutomaticPageTurn: true
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysAutomaticPageTurn = true;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonAutoPageTurnDisable[0].focus(); }, 50);
        });


        var $buttonSkipDisable = $('#btn-skip-audio-disable');
        var $buttonSkipEnable = $('#btn-skip-audio-enable');

        $buttonSkipDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttonSkipDisable[0];

            $audioPlayer.removeClass('skip');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysSkipSkippables = false;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonSkipEnable[0].focus(); }, 50);
        });

        $buttonSkipEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonSkipEnable[0];

            $audioPlayer.addClass('skip');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysSkipSkippables: true
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysSkipSkippables = true;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonSkipDisable[0].focus(); }, 50);
        });

        var $buttonTouchEnable = $('#btn-touch-audio-enable');
        var $buttonTouchDisable = $('#btn-touch-audio-disable');

        $buttonTouchEnable.on("click", function() {

            var wasFocused = document.activeElement === $buttonTouchEnable[0];

            $audioPlayer.removeClass('no-touch');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: true
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysEnableClick = true;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonTouchDisable[0].focus(); }, 50);
        });

        $buttonTouchDisable.on("click", function() {

            var wasFocused = document.activeElement === $buttonTouchDisable[0];

            $audioPlayer.addClass('no-touch');

            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysEnableClick: false
            });

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                json.mediaOverlaysEnableClick = false;
                Settings.put('reader', json);
            });

            if (wasFocused) setTimeout(function(){ $buttonTouchEnable[0].focus(); }, 50);
        });

        var $changeRateControl = $('#rate-range-slider');
        var $changeRateControl_label = $('#rate-range-slider-label');

        var changeRate = function(minus)
        {
            var rateMin = parseFloat($changeRateControl.attr("min"));
            var rateMax = parseFloat($changeRateControl.attr("max"));
            var rateStep = parseFloat($changeRateControl.attr("step"));
            var rateVal = parseFloat($changeRateControl.val());

            rateVal += (minus ? (-rateStep) : rateStep);

            if (rateVal > rateMax) rateVal = rateMax;
            if (rateVal < rateMin) rateVal = rateMin;

            var txt = ((rateVal === 0 ? "~0" : ""+rateVal) + "x");

            updateSliderLabels($changeRateControl, rateVal, txt);

            $changeRateControl_label[0].textContent = txt;

            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });

            $changeRateControl.val(""+rateVal);
        };

        $("#buttRatePlus").on("click", function(){
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysRateIncrease, 'reader', function(){
            changeRate(false);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });

        $("#buttRateMinus").on("click", function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysRateDecrease, 'reader', function(){
            changeRate(true);
            //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        });

        // Keyboard.on(Keyboard.MediaOverlaysRateIncreaseAlt, 'reader', function(){
        //     changeRate(false);
        //     //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        // });
        //
        // Keyboard.on(Keyboard.MediaOverlaysRateDecreaseAlt, 'reader', function(){
        //     changeRate(true);
        //     //setTimeout(function(){ $changeRateControl[0].focus(); }, 50);
        // });

        $changeRateControl.on("change", function() {
            var rateVal = $(this).val();
            var txt = ((rateVal === '0' ? "~0" : rateVal) + "x");

            updateSliderLabels($(this), rateVal, txt);

            $changeRateControl_label[0].textContent = txt;

            //readium.reader.setRateMediaOverlay(rateVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: rateVal
            });
        });

        var resetRate = function() {
            $changeRateControl.val(1);

            updateSliderLabels($changeRateControl, "1", "1x");

            $changeRateControl_label[0].textContent = "1x";

            //readium.reader.setRateMediaOverlay(1);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysRate: 1
            });
        };

        Keyboard.on(Keyboard.MediaOverlaysRateReset, 'reader', resetRate);

        var $rateButton = $('#btn-audio-rate');
        $rateButton.on("click", resetRate);

        var $changeVolumeControl = $('#volume-range-slider');

        var changeVolume = function(minus)
        {
            var volumeVal = parseInt($changeVolumeControl.val());

            volumeVal += (minus ? (-20) : 20);

            if (volumeVal < 0) volumeVal = 0;
            if (volumeVal > 100) volumeVal = 100;

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });

            $changeVolumeControl.val(""+volumeVal);

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");

            if (volumeVal === 0) {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        };

        $("#buttVolumePlus").on("click", function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysVolumeIncrease, 'reader', function(){
            changeVolume(false);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });

        $("#buttVolumeMinus").on("click", function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });
        Keyboard.on(Keyboard.MediaOverlaysVolumeDecrease, 'reader', function(){
            changeVolume(true);
            //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        });

        // Keyboard.on(Keyboard.MediaOverlaysVolumeIncreaseAlt, 'reader', function(){
        //     changeVolume(false);
        //     //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        // });

        // Keyboard.on(Keyboard.MediaOverlaysVolumeDecreaseAlt, 'reader', function(){
        //     changeVolume(true);
        //     //setTimeout(function(){ $changeVolumeControl[0].focus(); }, 50);
        // });

        $changeVolumeControl.on("change", function() {
            var volumeVal = $(this).val();

            //readium.reader.setVolumeMediaOverlay(volumeVal / 100);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");

            if (volumeVal === '0') {
                $audioPlayer.addClass('no-volume');
            } else {
                $audioPlayer.removeClass('no-volume');
            }
        });

        $volumeButtonMute = $('#btn-audio-volume-mute');
        $volumeButtonUnMute = $('#btn-audio-volume-unmute');

        var _lastVolumeBeforeMute = '0';

        var muteVolume = function(){

            _lastVolumeBeforeMute = $changeVolumeControl.val();

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: 0
            });

            $changeVolumeControl.val(0);

            updateSliderLabels($changeVolumeControl, 0, 0 + "%");

            $volumeButtonMute.removeAttr("accesskey");
            $volumeButtonUnMute.attr("accesskey", Keyboard.MediaOverlaysVolumeMuteToggle);

            $audioPlayer.addClass('no-volume');
        };

        var unMuteVolume = function(){

            //var currentVolume = $changeVolumeControl.val();
            var volumeVal = _lastVolumeBeforeMute === '0' ? '100' : _lastVolumeBeforeMute;

            //readium.reader.setVolumeMediaOverlay(volumeVal);
            readium.reader.updateSettings({
                doNotUpdateView: true,
                mediaOverlaysVolume: volumeVal
            });

            $changeVolumeControl.val(volumeVal);

            updateSliderLabels($changeVolumeControl, volumeVal, volumeVal + "%");

            $volumeButtonUnMute.removeAttr("accesskey");
            $volumeButtonMute.attr("accesskey", Keyboard.MediaOverlaysVolumeMuteToggle);

            $audioPlayer.removeClass('no-volume');
        };

        Keyboard.on(Keyboard.MediaOverlaysVolumeMuteToggle, 'reader', function(){
            ($audioPlayer.hasClass('no-volume') ? unMuteVolume : muteVolume)();
        });

        $volumeButtonMute.on("click", function() {

            var wasFocused = document.activeElement === $volumeButtonMute[0];

            muteVolume();

            if (wasFocused) setTimeout(function(){ $volumeButtonUnMute[0].focus(); }, 50);
        });

        $volumeButtonUnMute.on("click", function() {

            var wasFocused = document.activeElement === $volumeButtonUnMute[0];

            unMuteVolume();

            if (wasFocused) setTimeout(function(){ $volumeButtonMute[0].focus(); }, 50);
        });

        Keyboard.on(Keyboard.MediaOverlaysPrevious, 'reader', readium.reader.previousMediaOverlay);

        $previousAudioBtn.on("click", readium.reader.previousMediaOverlay);

        Keyboard.on(Keyboard.MediaOverlaysNext, 'reader', readium.reader.nextMediaOverlay);

        $nextAudioBtn.on("click", readium.reader.nextMediaOverlay);
    };

    return {
        init : init
    };
});


define('readium_js_viewer/EpubReaderBackgroundAudioTrack',['module','jquery', 'bootstrap', 'readium_js/Readium', './Spinner', './storage/Settings', 'readium_js_viewer_i18n/Strings', './Dialogs', './Keyboard'], 
        function (module, $, bootstrap, Readium, spinner, Settings, Strings, Dialogs, Keyboard) {

    var init = function(readium) {

        if (!readium.reader.backgroundAudioTrackManager) return; // safety (out-of-date readium-shared-js?)

        var $audioTrackDiv = $("#backgroundAudioTrack-div");

        var $playAudioTrackBtn = $("#backgroundAudioTrack-button-play");
        var $pauseAudioTrackBtn = $("#backgroundAudioTrack-button-pause");

        readium.reader.backgroundAudioTrackManager.setCallback_PlayPause(function(doPlay)
            {
                if (doPlay)
                {
                    $audioTrackDiv.addClass('isPlaying');

                    $playAudioTrackBtn.removeAttr("accesskey");
                    $pauseAudioTrackBtn.attr("accesskey", Keyboard.BackgroundAudioPlayPause);
                }
                else
                {
                    $audioTrackDiv.removeClass('isPlaying');

                    $pauseAudioTrackBtn.removeAttr("accesskey");
                    $playAudioTrackBtn.attr("accesskey", Keyboard.BackgroundAudioPlayPause);
                }
            }
        );

        readium.reader.backgroundAudioTrackManager.setCallback_IsAvailable(function(yes)
            {
                if (yes)
                {
                    $audioTrackDiv.removeClass("none");
                }
                else
                {
                    $audioTrackDiv.addClass("none");
                }
            }
        );


        Keyboard.on(Keyboard.BackgroundAudioPlayPause, 'reader', function()
        {
            var play = !$audioTrackDiv.hasClass('isPlaying');

            readium.reader.backgroundAudioTrackManager.setPlayState(play);
            readium.reader.backgroundAudioTrackManager.playPause(play);
        });

        $playAudioTrackBtn.on("click", function ()
        {
            var wasFocused = document.activeElement === $playAudioTrackBtn[0];

            readium.reader.backgroundAudioTrackManager.setPlayState(true);
            readium.reader.backgroundAudioTrackManager.playPause(true);

            if (wasFocused) setTimeout(function(){ $pauseAudioTrackBtn[0].focus(); }, 50);
        });

        $pauseAudioTrackBtn.on("click", function ()
        {
            var wasFocused = document.activeElement === $pauseAudioTrackBtn[0];

            readium.reader.backgroundAudioTrackManager.setPlayState(false);
            readium.reader.backgroundAudioTrackManager.playPause(false);

            if (wasFocused) setTimeout(function(){ $playAudioTrackBtn[0].focus(); }, 50);
        });
    };

    return {
        init : init
    };
});

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define('readium_js_viewer/gestures',['jquery','jquery_hammer','hammerjs'], function($,jqueryHammer,Hammer) {

    var gesturesHandler = function(reader, viewport){
        
this.initialize= function(){};
return; // TODO upgrade to Hammer API v2

        var onSwipeLeft = function(){
            reader.openPageRight();
        };

        var onSwipeRight = function(){
            reader.openPageLeft();
        };

        var isGestureHandled = function() {
            var viewType = reader.getCurrentViewType();

            return viewType === ReadiumSDK.Views.ReaderView.VIEW_TYPE_FIXED || viewType == ReadiumSDK.Views.ReaderView.VIEW_TYPE_COLUMNIZED;
        };

        this.initialize= function(){

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function(iframe,s) {
                //set hammer's document root
                Hammer.DOCUMENT = iframe.contents();
                //hammer's internal touch events need to be redefined? (doesn't work without)
                Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
                Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

                //set up the hammer gesture events
                //swiping handlers
                var swipingOptions = {prevent_mouseevents: true};
                Hammer(Hammer.DOCUMENT,swipingOptions).on("swipeleft", function() {
                    onSwipeLeft();
                });
                Hammer(Hammer.DOCUMENT,swipingOptions).on("swiperight", function() {
                    onSwipeRight();
                });

                //remove stupid ipad safari elastic scrolling
                //TODO: test this with reader ScrollView and FixedView
                $(Hammer.DOCUMENT).on(
                    'touchmove',
                    function(e) {
                        //hack: check if we are not dealing with a scrollview
                        if(isGestureHandled()){
                            e.preventDefault();
                        }
                    }
                );
            });

            //remove stupid ipad safari elastic scrolling (improves UX for gestures)
            //TODO: test this with reader ScrollView and FixedView
            $(viewport).on(
                'touchmove',
                function(e) {
                    if(isGestureHandled()) {
                        e.preventDefault();
                    }
                }
            );

            //handlers on viewport
            $(viewport).hammer().on("swipeleft", function() {
                onSwipeLeft();
            });
            $(viewport).hammer().on("swiperight", function() {
                onSwipeRight();
            });
        };

    };
    return gesturesHandler;
});
define('readium_js_viewer/versioning/ReadiumVersioning',['readium_js/Readium'], function(Readium){

	var PackagedVersioning = {
		getVersioningInfo : function(callback){
			var versionInfo = {};

            versionInfo = Readium.version;
            versionInfo.dateTimeString = new Date(Readium.version.readiumJsViewer.timestamp).toString();

			callback(versionInfo);
		}
	}
	return PackagedVersioning;
});

define('readium_js_viewer/EpubReader',[
"readium_shared_js/globalsSetup",
"readium_plugin_example",
'module',
'jquery',
'bootstrap',
'bootstrapA11y',
'URIjs',
'./Spinner',
'./storage/Settings',
'readium_js_viewer_i18n/Strings',
'./Dialogs',
'./ReaderSettingsDialog',
'hgn!readium_js_viewer_html_templates/about-dialog.html',
'hgn!readium_js_viewer_html_templates/reader-navbar.html',
'hgn!readium_js_viewer_html_templates/reader-body.html',
'hgn!readium_js_viewer_html_templates/reader-body-page-btns.html',
'./analytics/Analytics',
'screenfull',
'./Keyboard',
'./EpubReaderMediaOverlays',
'./EpubReaderBackgroundAudioTrack',
'./gestures',
'./versioning/ReadiumVersioning',
'readium_js/Readium'],

function (
globalSetup, examplePluginConfig,
module,
$,
bootstrap,
bootstrapA11y,
URI,
spinner,
Settings,
Strings,
Dialogs,
SettingsDialog,
AboutDialog,
ReaderNavbar,
ReaderBody,
ReaderBodyPageButtons,
Analytics,
screenfull,
Keyboard,
EpubReaderMediaOverlays,
EpubReaderBackgroundAudioTrack,
GesturesHandler,
Versioning,
Readium){

  	var config = module.config();
var image_path_prefix = config.imagePathPrefix || "";
var epubs_path_prefix = config.epubLibraryPathPrefix || "";

        examplePluginConfig.borderColor = "blue";
        examplePluginConfig.backgroundColor = "cyan";

    var readium,
        embedded,
        url,
        el = document.documentElement,
        currentDocument,
        gesturesHandler;

    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL, readerSettings, openPageRequest) {

        readium.openPackageDocument(packageDocumentURL, function(packageDocument, options){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
            });

            wasFixed = readium.reader.isCurrentViewFixedLayout();
            var metadata = options.metadata;

            $('<h2 class="book-title-header"></h2>').insertAfter('.navbar').text(metadata.title);


            $("#left-page-btn").unbind("click");
            $("#right-page-btn").unbind("click");
            var $pageBtnsContainer = $('#readium-page-btns');
            $pageBtnsContainer.empty();
            var rtl = currentDocument.getPageProgressionDirection() === "rtl"; //_package.spine.isLeftToRight()
            $pageBtnsContainer.append(ReaderBodyPageButtons({strings: Strings, dialogs: Dialogs, keyboard: Keyboard,
                pageProgressionDirectionIsRTL: rtl
            }));
            $("#left-page-btn").on("click", prevPage);
            $("#right-page-btn").on("click", nextPage);

        }, openPageRequest);
    };

    var spin = function()
    {
//console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
        if (spinner.willSpin || spinner.isSpinning) return;

        spinner.willSpin = true;

        setTimeout(function()
        {
            if (spinner.stopRequested)
            {
//console.debug("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.willSpin = false;
                spinner.stopRequested = false;
                return;
            }
//console.debug("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
            spinner.isSpinning = true;
            spinner.spin($('#reading-area')[0]);

            spinner.willSpin = false;

        }, 100);
    };

    var tocShowHideToggle = function(){

        $(document.body).removeClass('hide-ui');

        var $appContainer = $('#app-container'),
            hide = $appContainer.hasClass('toc-visible');
        var bookmark;
        if (readium.reader.handleViewportResize && !embedded){
            bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
        }

        if (hide){
            $appContainer.removeClass('toc-visible');

            setTimeout(function(){ $('#tocButt')[0].focus(); }, 100);
        }
        else{
            $appContainer.addClass('toc-visible');

            setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
        }

        if(embedded){
            hideLoop(null, true);
        }else if (readium.reader.handleViewportResize){

            readium.reader.handleViewportResize();

            setTimeout(function()
            {
                readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
            }, 90);
        }
    };

    var showScaleDisplay = function(){
        $('.zoom-wrapper').show();
    }
    var setScaleDisplay = function(){
        var scale = readium.reader.getViewScale();
        $('.zoom-wrapper input').val(Math.round(scale) + "%");
    }

    var hideScaleDisplay = function(){
        $('.zoom-wrapper').hide();
    }

    var loadToc = function(dom){

        if (dom) {
            $('script', dom).remove();

            var tocNav;

            var $navs = $('nav', dom);
            Array.prototype.every.call($navs, function(nav){
                if (nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') == 'toc'){
                    tocNav = nav;
                    return false;
                }
                return true;
            });

            var isRTL = false;
            var pparent = tocNav;

            while (pparent && pparent.getAttributeNS)
            {
                var dir = pparent.getAttributeNS("http://www.w3.org/1999/xhtml", "dir") || pparent.getAttribute("dir");

                if (dir && dir === "rtl")
                {
                    isRTL = true;
                    break;
                }
                pparent = pparent.parentNode;
            }

            var toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();
            var tocUrl = currentDocument.getToc();

            if (toc && toc.length)
            {
                var $toc = $(toc);

                // "iframe" elements need to be stripped out, because of potential vulnerability when loading malicious EPUBs
                // e.g. src="javascript:doHorribleThings(window.top)"
                // Note that "embed" and "object" elements with AllowScriptAccess="always" do not need to be removed,
                // because unlike "iframe" the @src URI does not trigger the execution of the "javascript:" statement,
                // and because the "data:" base64 encoding of an image/svg that contains ecmascript
                // automatically results in origin/domain restrictions (thereby preventing access to window.top / window.parent).
                // Also note that "script" elements are discarded automatically by jQuery.
                $('iframe', $toc).remove();

                $('#readium-toc-body').append($toc);

                if (isRTL)
                {
                    $toc[0].setAttributeNS("http://www.w3.org/1999/xhtml", "dir", "rtl");
                    $toc[0].style.direction = "rtl"; // The CSS stylesheet property does not trigger :(
                }
            }

        } else {
            var tocUrl = currentDocument.getToc();

            $('#readium-toc-body').append("?? " + tocUrl);
        }

        var _tocLinkActivated = false;

        var lastIframe = undefined,
            wasFixed;

        readium.reader.on(ReadiumSDK.Events.FXL_VIEW_RESIZED, setScaleDisplay);
        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem)
        {

            var isFixed = readium.reader.isCurrentViewFixedLayout();

            // TODO: fix the pan-zoom feature!
            if (isFixed){
                showScaleDisplay();
            }
            else{
                hideScaleDisplay();
            }

            //TODO not picked-up by all screen readers, so for now this short description will suffice
            $iframe.attr("title", "EPUB");
            $iframe.attr("aria-label", "EPUB");

            lastIframe = $iframe[0];
        });

        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData)
        {
            savePlace();
            updateUI(pageChangeData);


            if (spinner.isSpinning)
            {
//console.debug("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stop();
                spinner.isSpinning = false;
            }
            else if (spinner.willSpin)
            {
//console.debug("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stopRequested = true;
            }

            if (!_tocLinkActivated) return;
            _tocLinkActivated = false;

            try
            {
                var iframe = undefined;
                var element = undefined;

                var id = pageChangeData.elementId;
                if (!id)
                {
                    var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());

                    //bookmark.idref; //manifest item
                    if (pageChangeData.spineItem)
                    {
                        element = readium.reader.getElementByCfi(pageChangeData.spineItem, bookmark.contentCFI,
                            ["cfi-marker", "mo-cfi-highlight"],
                            [],
                            ["MathJax_Message"]);
                        element = element[0];

                        if (element)
                        {
                            iframe = $("#epub-reader-frame iframe")[0];
                            var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                            if (element.ownerDocument !== doc)
                            {
                                iframe = $("#epub-reader-frame iframe")[1];
                                if (iframe)
                                {
                                    doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                                    if (element.ownerDocument !== doc)
                                    {
                                        iframe = undefined;
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    iframe = $("#epub-reader-frame iframe")[0];
                    var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    element = doc.getElementById(id);
                    if (!element)
                    {
                        iframe = $("#epub-reader-frame iframe")[1];
                        if (iframe)
                        {
                            doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                            element = doc.getElementById(id);
                            if (!element)
                            {
                                iframe = undefined;
                            }
                        }
                    }
                }

                if (!iframe)
                {
                    iframe = lastIframe;
                }

                if (iframe)
                {
                    //var doc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    var toFocus = iframe; //doc.body
                    setTimeout(function(){ toFocus.focus(); }, 50);
                }
            }
            catch (e)
            {
                //
            }
        });

        $('#readium-toc-body').on('click', 'a', function(e)
        {
            spin();

            var href = $(this).attr('href');
            href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href;

            _tocLinkActivated = true;

            readium.reader.openContentUrl(href);

            if (embedded){
                $('.toc-visible').removeClass('toc-visible');
                $(document.body).removeClass('hide-ui');
            }
            return false;
        });
        $('#readium-toc-body').prepend('<button tabindex="50" type="button" class="close" data-dismiss="modal" aria-label="'+Strings.i18n_close+' '+Strings.toc+'" title="'+Strings.i18n_close+' '+Strings.toc+'"><span aria-hidden="true">&times;</span></button>');
        $('#readium-toc-body button.close').on('click', function(){
            tocShowHideToggle();
            /*
            var bookmark = JSON.parse(readium.reader.bookmarkCurrentPage());
            $('#app-container').removeClass('toc-visible');
            if (embedded){
                $(document.body).removeClass('hide-ui');
            }else if (readium.reader.handleViewportResize){
                readium.reader.handleViewportResize();
                readium.reader.openSpineItemElementCfi(bookmark.idref, bookmark.contentCFI, readium.reader);
            }
            */
            return false;
        })
    }

    var toggleFullScreen = function(){

        if (!screenfull.enabled) return;

        screenfull.toggle();
    }

    screenfull.onchange = function(e){
        var titleText;

        if (screenfull.isFullscreen)
        {
            titleText = Strings.exit_fullscreen+ ' [' + Keyboard.FullScreenToggle + ']';
            $('#buttFullScreenToggle span').removeClass('glyphicon-resize-full');
            $('#buttFullScreenToggle span').addClass('glyphicon-resize-small');
            $('#buttFullScreenToggle').attr('aria-label', titleText);
            $('#buttFullScreenToggle').attr('title', titleText);
        }
        else
        {
            titleText = Strings.enter_fullscreen + ' [' + Keyboard.FullScreenToggle + ']';
            $('#buttFullScreenToggle span').removeClass('glyphicon-resize-small');
            $('#buttFullScreenToggle span').addClass('glyphicon-resize-full');
            $('#buttFullScreenToggle').attr('aria-label', titleText);
            $('#buttFullScreenToggle').attr('title', titleText);
        }
    }

    var hideUI = function(){
        hideTimeoutId = null;
        // don't hide it toolbar while toc open in non-embedded mode
        if (!embedded && $('#app-container').hasClass('toc-visible')){
            return;
        }

        var navBar = document.getElementById("app-navbar");
        if (document.activeElement) {
            var within = jQuery.contains(navBar, document.activeElement);
            if (within) return;
        }

        var $navBar = $(navBar);
        // BROEKN! $navBar.is(':hover')
        var isMouseOver = $navBar.find(':hover').length > 0;
        if (isMouseOver) return;

        if ($('#audioplayer').hasClass('expanded-audio')) return;

        $(document.body).addClass('hide-ui');
    }

    var hideTimeoutId;

    var hideLoop = function(e, immediate){

        // if (!embedded){
        //     return;
        // }
        if (hideTimeoutId){
            window.clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
        if (!$('#app-container').hasClass('toc-visible') && $(document.body).hasClass('hide-ui')){
            $(document.body).removeClass('hide-ui');
        }
        if (immediate){
            hideUI();
        }
        else{
            hideTimeoutId = window.setTimeout(hideUI, 4000);
        }
    }

    //TODO: also update "previous/next page" commands status (disabled/enabled), not just button visibility.
    // https://github.com/readium/readium-js-viewer/issues/188
    // See onSwipeLeft() onSwipeRight() in gesturesHandler.
    // See nextPage() prevPage() in this class.
    var updateUI = function(pageChangeData){
        if(pageChangeData.paginationInfo.canGoLeft())
            $("#left-page-btn").show();
        else
            $("#left-page-btn").hide();
        if(pageChangeData.paginationInfo.canGoRight())
            $("#right-page-btn").show();
        else
            $("#right-page-btn").hide();
    }

    var savePlace = function(){
        Settings.put(url, readium.reader.bookmarkCurrentPage(), $.noop);
    }

    var nextPage = function () {

        readium.reader.openPageRight();
        return false;
    };

    var prevPage = function () {

        readium.reader.openPageLeft();
        return false;
    };

    var installReaderEventHandlers = function(){

        // Set handlers for click events
        $(".icon-annotations").on("click", function () {
            readium.reader.plugins.annotations.addSelectionHighlight(Math.floor((Math.random()*1000000)), "highlight");
        });

        var isWithinForbiddenNavKeysArea = function()
        {
            return document.activeElement &&
            (
                document.activeElement === document.getElementById('volume-range-slider')
                || document.activeElement === document.getElementById('time-range-slider')
                || document.activeElement === document.getElementById('rate-range-slider')
                || jQuery.contains(document.getElementById("mo-sync-form"), document.activeElement)
                || jQuery.contains(document.getElementById("mo-highlighters"), document.activeElement)

                // jQuery.contains(document.getElementById("app-navbar"), document.activeElement)
                // || jQuery.contains(document.getElementById("settings-dialog"), document.activeElement)
                // || jQuery.contains(document.getElementById("about-dialog"), document.activeElement)
            )
            ;
        };

        var hideTB = function(){
            if (!embedded && $('#app-container').hasClass('toc-visible')){
                return;
            }
            $(document.body).addClass('hide-ui');
            if (document.activeElement) document.activeElement.blur();
        };
        $("#buttHideToolBar").on("click", hideTB);
        Keyboard.on(Keyboard.ToolbarHide, 'reader', hideTB);

        var showTB = function(){
            $("#aboutButt1")[0].focus();
            $(document.body).removeClass('hide-ui');
            setTimeout(function(){ $("#aboutButt1")[0].focus(); }, 50);
        };
        $("#buttShowToolBar").on("click", showTB);
        Keyboard.on(Keyboard.ToolbarShow, 'reader', showTB);

        Keyboard.on(Keyboard.PagePrevious, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) prevPage();
        });

        Keyboard.on(Keyboard.PagePreviousAlt, 'reader', prevPage);

        Keyboard.on(Keyboard.PageNextAlt, 'reader', nextPage);

        Keyboard.on(Keyboard.PageNext, 'reader', function(){
            if (!isWithinForbiddenNavKeysArea()) nextPage();
        });

        Keyboard.on(Keyboard.FullScreenToggle, 'reader', toggleFullScreen);

        $('#buttFullScreenToggle').on('click', toggleFullScreen);

        var loadlibrary = function()
        {
            $("html").attr("data-theme", "library");

            $(window).trigger('loadlibrary');
        };

        Keyboard.on(Keyboard.SwitchToLibrary, 'reader', loadlibrary /* function(){setTimeout(, 30);} */ );

        $('.icon-library').on('click', function(){
            loadlibrary();
            return false;
        });

        $('.zoom-wrapper input').on('click', function(){
            if (!this.disabled){
                this.focus();
                return false;
            }
        });

        Keyboard.on(Keyboard.TocShowHideToggle, 'reader', function()
        {
            var visible = $('#app-container').hasClass('toc-visible');
            if (!visible)
            {
                tocShowHideToggle();
            }
            else
            {
                setTimeout(function(){ $('#readium-toc-body button.close')[0].focus(); }, 100);
            }
        });

        $('.icon-toc').on('click', tocShowHideToggle);

        var setTocSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
            $('#readium-toc-body').height(appHeight);
        };

        Keyboard.on(Keyboard.ShowSettingsModal, 'reader', function(){$('#settings-dialog').modal("show")});

        $(window).on('mousemove', hideLoop);
        $(window).on('resize', setTocSize);
        setTocSize();
        hideLoop();

        // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
        // so I'm using DOM api directly
        document.addEventListener('click', hideLoop, true);
    };

    var setFitScreen = function(e){
        readium.reader.setZoom({style: 'fit-screen'});
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-fit-screen').addClass('active-zoom');
        $('.zoom-wrapper input').prop('disabled', true);
        $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var setFitWidth = function(e){
        readium.reader.setZoom({style: 'fit-width'});
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-fit-width').addClass('active-zoom');
        $('.zoom-wrapper input').prop('disabled', true);
         $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var enableCustom = function(e){
        $('.zoom-wrapper input').prop('disabled', false).focus();
        $('.active-zoom').removeClass('active-zoom');
        $('#zoom-custom').addClass('active-zoom');
         $('.zoom-wrapper>a').dropdown('toggle');
        return false;
    }

    var zoomRegex = /^\s*(\d+)%?\s*$/;
    var setCustom = function(e){
        var percent = $('.zoom-wrapper input').val();
        var matches = zoomRegex.exec(percent);
        if (matches){
            var percentVal = Number(matches[1])/100;
            readium.reader.setZoom({style: 'user', scale: percentVal});
        }
        else{
            setScaleDisplay();
        }
    }

    var loadReaderUIPrivate = function(){
        $('.modal-backdrop').remove();
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));
        $('nav').empty();
        $('nav').attr("aria-label", Strings.i18n_toolbar);
        $('nav').append(ReaderNavbar({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));
        installReaderEventHandlers();
        document.title = "Readium";
        $('#zoom-fit-width a').on('click', setFitWidth);
        $('#zoom-fit-screen a').on('click', setFitScreen);
        $('#zoom-custom a').on('click', enableCustom);
        $('.zoom-wrapper input').on('change', setCustom);

        spin();
    }

    var loadReaderUI = function (data) {

        Keyboard.scope('reader');

        url = data.epub;
        if (url && url.trim && url.trim().indexOf("http") != 0)
        {
            url = epubs_path_prefix + url;
        }

        Analytics.trackView('/reader');
        embedded = data.embedded;

        loadReaderUIPrivate();

        //because we reinitialize the reader we have to unsubscribe to all events for the previews reader instance
        if(readium && readium.reader) {
            readium.reader.off();
        }

        if (window.ReadiumSDK) {
            ReadiumSDK.off(ReadiumSDK.Events.PLUGINS_LOADED);
        }

        setTimeout(function()
        {
            initReadium(); //async
        }, 0);
    };

    var initReadium = function(){

        console.log("MODULE CONFIG " + module.id);
        console.log(module.config());

        Settings.getMultiple(['reader', url], function(settings){

            var prefix = (self.location && self.location.origin && self.location.pathname) ? (self.location.origin + self.location.pathname + "/..") : "";
            var readerOptions =  {
                el: "#epub-reader-frame",
                annotationCSSUrl: module.config().annotationCSSUrl || "?!module.config().annotationCssUrl", //(prefix + "/css/annotations.css"),
                mathJaxUrl : module.config().mathJaxUrl || "?!module.config().mathJaxUrl" //? (prefix + module.config().mathJaxUrl) : (prefix + "/scripts/mathjax/MathJax.js")
            };

            var readiumOptions = {
                jsLibRoot: module.config().jsLibRoot || "?!module.config().jsLibRoot", //'./scripts/zip/',
                openBookOptions: {}
            };

            if (module.config().useSimpleLoader){
                readiumOptions.useSimpleLoader = true;
            }

            var openPageRequest;
            if (settings[url]){
                var bookmark = JSON.parse(JSON.parse(settings[url]));
                openPageRequest = {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
            }


            readium = new Readium(readiumOptions, readerOptions);

            window.READIUM = readium;

            ReadiumSDK.on(ReadiumSDK.Events.PLUGINS_LOADED, function () {
                console.log('PLUGINS INITIALIZED!');
                readium.reader.plugins.annotations.initialize({annotationCSSUrl: readerOptions.annotationCSSUrl});
            });

            //setup gestures support with hummer
            gesturesHandler = new GesturesHandler(readium.reader, readerOptions.el);
            gesturesHandler.initialize();

            //epubReadingSystem

            Versioning.getVersioningInfo(function(version){

                $('#app-container').append(AboutDialog({image_path_prefix: image_path_prefix, strings: Strings, viewer: version.readiumJsViewer, readium: version.readiumJs, sharedJs: version.readiumSharedJs, cfiJs: version.readiumCfiJs}));

                window.navigator.epubReadingSystem.name = "readium-js-viewer";
                window.navigator.epubReadingSystem.version = version.readiumJsViewer.chromeVersion;

                window.navigator.epubReadingSystem.readium = {};

                window.navigator.epubReadingSystem.readium.buildInfo = {};

                window.navigator.epubReadingSystem.readium.buildInfo.dateTime = version.dateTimeString; //new Date(timestamp).toString();
                window.navigator.epubReadingSystem.readium.buildInfo.version = version.readiumJsViewer.version;
                window.navigator.epubReadingSystem.readium.buildInfo.chromeVersion = version.readiumJsViewer.chromeVersion;

                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories = [];

                var repo1 = {};
                repo1.name = "readium-js-viewer";
                repo1.sha = version.readiumJsViewer.sha;
                repo1.tag = version.readiumJsViewer.tag;
                repo1.version = version.readiumJsViewer.version;
                repo1.clean = version.readiumJsViewer.clean;
                repo1.branch = version.readiumJsViewer.branch;
                repo1.release = version.readiumJsViewer.release;
                repo1.timestamp = version.readiumJsViewer.timestamp;
                repo1.url = "https://github.com/readium/" + repo1.name + "/tree/" + repo1.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo1);

                var repo2 = {};
                repo2.name = "readium-js";
                repo2.sha = version.readiumJs.sha;
                repo2.tag = version.readiumJs.tag;
                repo2.version = version.readiumJs.version;
                repo2.clean = version.readiumJs.clean;
                repo2.branch = version.readiumJs.branch;
                repo2.release = version.readiumJs.release;
                repo2.timestamp = version.readiumJs.timestamp;
                repo2.url = "https://github.com/readium/" + repo2.name + "/tree/" + repo2.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo2);

                var repo3 = {};
                repo3.name = "readium-shared-js";
                repo3.sha = version.readiumSharedJs.sha;
                repo3.tag = version.readiumSharedJs.tag;
                repo3.version = version.readiumSharedJs.version;
                repo3.clean = version.readiumSharedJs.clean;
                repo3.branch = version.readiumSharedJs.branch;
                repo3.release = version.readiumSharedJs.release;
                repo3.timestamp = version.readiumSharedJs.timestamp;
                repo3.url = "https://github.com/readium/" + repo3.name + "/tree/" + repo3.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo3);

                var repo4 = {};
                repo4.name = "readium-cfi-js";
                repo4.sha = version.readiumCfiJs.sha;
                repo4.tag = version.readiumCfiJs.tag;
                repo4.version = version.readiumCfiJs.version;
                repo4.clean = version.readiumCfiJs.clean;
                repo4.branch = version.readiumCfiJs.branch;
                repo4.release = version.readiumCfiJs.release;
                repo4.timestamp = version.readiumCfiJs.timestamp;
                repo4.url = "https://github.com/readium/" + repo4.name + "/tree/" + repo4.sha;
                window.navigator.epubReadingSystem.readium.buildInfo.gitRepositories.push(repo4);

                // Debug check:
                //console.debug(JSON.stringify(window.navigator.epubReadingSystem, undefined, 2));
            });


            $(window).on('keyup', function(e)
            {
                if (e.keyCode === 9 || e.which === 9)
                {
                    $(document.body).removeClass('hide-ui');
                }
            });

            readium.reader.addIFrameEventListener('mousemove', function() {
                hideLoop();
            });

            readium.reader.addIFrameEventListener('keydown', function(e) {
                Keyboard.dispatch(document.documentElement, e.originalEvent);
            });

            readium.reader.addIFrameEventListener('keyup', function(e) {
                Keyboard.dispatch(document.documentElement, e.originalEvent);
            });

            readium.reader.addIFrameEventListener('focus', function(e) {
                $(window).trigger("focus");
            });

            SettingsDialog.initDialog(readium.reader);

            $('#settings-dialog').on('hidden.bs.modal', function () {

                Keyboard.scope('reader');

                $(document.body).removeClass('hide-ui');
                setTimeout(function(){ $("#settbutt1").focus(); }, 50);

                $("#buttSave").removeAttr("accesskey");
                $("#buttClose").removeAttr("accesskey");
            });
            $('#settings-dialog').on('shown.bs.modal', function () {

                Keyboard.scope('settings');

                $("#buttSave").attr("accesskey", Keyboard.accesskeys.SettingsModalSave);
                $("#buttClose").attr("accesskey", Keyboard.accesskeys.SettingsModalClose);
            });


            $('#about-dialog').on('hidden.bs.modal', function () {
                Keyboard.scope('reader');

                $(document.body).removeClass('hide-ui');
                setTimeout(function(){ $("#aboutButt1").focus(); }, 50);
            });
            $('#about-dialog').on('shown.bs.modal', function(){
                Keyboard.scope('about');
            });

            var readerSettings;
            if (settings.reader){
                readerSettings = JSON.parse(settings.reader);
            }
            if (!embedded){
                readerSettings = readerSettings || SettingsDialog.defaultSettings;
                SettingsDialog.updateReader(readium.reader, readerSettings);
            }
            else{
                readium.reader.updateSettings({
                    syntheticSpread:  "auto",
                    scroll: "auto"
                });
            }


            var toggleNightTheme = function(){

                if (!embedded){

                    Settings.get('reader', function(json)
                    {
                        if (!json)
                        {
                            json = {};
                        }

                        var isNight = json.theme === "night-theme";
                        json.theme = isNight ? "author-theme" : "night-theme";

                        Settings.put('reader', json);

                        SettingsDialog.updateReader(readium.reader, json);
                    });
                }
            };
            $("#buttNightTheme").on("click", toggleNightTheme);
            Keyboard.on(Keyboard.NightTheme, 'reader', toggleNightTheme);

            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function($iframe, spineItem) {
                spin();
            });

            EpubReaderMediaOverlays.init(readium);

            EpubReaderBackgroundAudioTrack.init(readium);

            loadEbook(url, readerSettings, openPageRequest);

            readium.reader.plugins.annotations.on("annotationClicked", function(type, idref, cfi, id) {
console.debug("ANNOTATION CLICK: " + id);
                readium.reader.plugins.annotations.removeHighlight(id);
            });

            if (readium.reader.plugins.example) {
                readium.reader.plugins.example.on("exampleEvent", function(message) {
                    alert(message);
                });
            }

        });
    }

    var unloadReaderUI = function(){

        if (readium) {
            readium.closePackageDocument();
        }

        // needed only if access keys can potentially be used to open a book while a dialog is opened, because keyboard.scope() is not accounted for with HTML access keys :(
        // for example: settings dialogs is open => SHIFT CTRL [B] access key => library view opens with transparent black overlay!
        Dialogs.closeModal();
        Dialogs.reset();
        $('#settings-dialog').modal('hide');
        $('#about-dialog').modal('hide');
        $('.modal-backdrop').remove();


        Keyboard.off('reader');
        Keyboard.off('settings');

        $('#settings-dialog').off('hidden.bs.modal');
        $('#settings-dialog').off('shown.bs.modal');

        $('#about-dialog').off('hidden.bs.modal');
        $('#about-dialog').off('shown.bs.modal');

        // visibility check fails because iframe is unloaded
        //if (readium.reader.isMediaOverlayAvailable())
        if (readium && readium.reader) // window.push/popstate
            readium.reader.pauseMediaOverlay();

        $(window).off('resize');
        $(window).off('mousemove');
        $(window).off('keyup');
        $(window).off('message');
        window.clearTimeout(hideTimeoutId);
        $(document.body).removeClass('embedded');
        document.removeEventListener('click', hideLoop, true);
        $('.book-title-header').remove();

        $(document.body).removeClass('hide-ui');
    }

    var applyKeyboardSettingsAndLoadUi = function(data)
    {
        // override current scheme with user options
        Settings.get('reader', function(json)
        {
           Keyboard.applySettings(json);

           loadReaderUI(data);
        });
    };

    return {
        loadUI : applyKeyboardSettingsAndLoadUi,
        unloadUI : unloadReaderUI
    };

});

define('readium_js_viewer/ReadiumViewerLite',['jquery', './EpubReader'], function($, EpubReader){

	var getQueryParamData = function(){
        var query = window.location.search;
        if (query && query.length){
            query = query.substring(1);
        }
        data = {};
        if (query.length){
            var keyParams = query.split('&');
            for (var x = 0; x < keyParams.length; x++)
            {
                var keyVal = keyParams[x].split('=');
                if(keyVal.length > 1){
                    data[keyVal[0]] = keyVal[1];
                }

            }

        }
        return data;
    }

    $(function(){

	    var epubUrl = getQueryParamData();
        EpubReader.loadUI(epubUrl);

		$(document.body).on('click', function()
        {
            $(document.body).removeClass("keyboard");
        });

		$(document).on('keyup', function(e)
        {
            $(document.body).addClass("keyboard");
        });
    });

	var tooltipSelector = 'nav *[title]';

	$(document.body).tooltip({
		selector : tooltipSelector,
		placement: 'auto',
		container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted
	}).on('show.bs.tooltip', function(e){
		$(tooltipSelector).not(e.target).tooltip('destroy');
	});
});


define("readium-js-viewer_LITE", function(){});

require(["readium_js_viewer/ReadiumViewerLite"]);

//# sourceMappingURL=readium-js-viewer_LITE.js.map