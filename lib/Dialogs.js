define(['hgn!templates/managed-dialog.html', 'hgn!templates/progress-dialog.html', 'hgn!templates/managed-buttons.html', 'i18n/Strings', 'workers/Messages', 'keymaster'], function(ManagedDialog, ProgressDialog, ButtonTemplate, Strings, Messages, key){
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
	
    var keyBindings = {};
    
	Dialogs = {	
		showError : function(type, data){
			var msg = Strings.err_unknown;
			switch(type){
				case Messages.ERROR_STORAGE:
					msg = Strings.err_storage;
					break;
				case Messages.ERROR_EPUB:
					msg = Strings.err_epub_corrupt
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
		showModalPrompt : function(title, message, okLabel, cancelLabel, onOk, onCancel){
			
			var buttons = ButtonTemplate({
				buttons : [
					{
						dismiss: true,
						text : cancelLabel,
						class : 'no-button'
					},
					{
						dismiss : true,
						text : okLabel,
						class : 'yes-button btn-primary'
					}
				]
			});

			var body = $('<p></p>').text(message);
			showModalDialog(false, title, body, buttons);

			if (onOk)
				$('#managed-dialog .yes-button').on('click', onOk);

			if (onCancel)
				$('#managed-dialog .no-button').on('click', onCancel);
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
		},
        keyboard:
        {
            scope: function(scope)
            {
                if (!scope) alert("!SCOPE ACTIVATE!");
                
                key.setScope(scope);
            },
            on: function(keys, scope, callback)
            {
                if (!keys) alert("!KEYS!");
                
                if (!keyBindings.hasOwnProperty(scope))
                {
                    keyBindings[scope] = [];
                }
                keyBindings[scope].push(keys);
                
                key.unbind(keys, scope);
                key(keys, scope, callback);
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
            ShowSettingsModal: 'ctrl+alt+o',
            SettingsModalSave: 'ctrl+alt+s',
            SettingsModalClose: 'ctrl+alt+c',
            PagePrevious: 'left',
            PageNext: 'right',
            PagePreviousAlt: 'ctrl+alt+1',
            PageNextAlt: 'ctrl+alt+2',
            ToolbarShow: 'ctrl+alt+v',
            ToolbarHide: 'ctrl+alt+x',
            FullScreenToggle: 'ctrl+alt+f',
            SwitchToLibrary: 'ctrl+alt+b',
            TocShowHideToggle: 'ctrl+alt+t',
            NightTheme: 'ctrl+alt+n',
            MediaOverlaysEscape: 'ctrl+alt+escape',
            MediaOverlaysPlayPause: 'ctrl+alt+m, ctrl+alt+space',
            MediaOverlaysRateIncrease: 'ctrl+alt+l',
            MediaOverlaysRateDecrease: 'ctrl+alt+j',
            MediaOverlaysRateReset: 'ctrl+alt+k',
            MediaOverlaysVolumeIncrease: 'ctrl+alt+w',
            MediaOverlaysVolumeDecrease: 'ctrl+alt+q',
            MediaOverlaysVolumeMuteToggle: 'ctrl+alt+a',
            MediaOverlaysPrevious: 'ctrl+alt+[, ctrl+alt+{',
            MediaOverlaysNext: 'ctrl+alt+], ctrl+alt+}',
            MediaOverlaysAdvancedPanelShowHide: 'ctrl+alt+d',
        }
	}
	return Dialogs;
});