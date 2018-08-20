define(['hgn!readium_js_viewer_html_templates/managed-dialog.html', 'hgn!readium_js_viewer_html_templates/progress-dialog.html', 'hgn!readium_js_viewer_html_templates/managed-buttons.html', 'i18nStrings', './workers/Messages'], function(ManagedDialog, ProgressDialog, ButtonTemplate, Strings, Messages){
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
            
            if (dismissable) {
                $('#managed-dialog').modal({
                    backdrop: true,
                    keyboard: true,
                    show: true
                });
            } else {
                $('#managed-dialog').modal({
                    backdrop: 'static',
                    keyboard: false,
                    show: true
                });
            }
        }

    };

    Dialogs = {
        showError : function(type, data){
            var msg = Strings.err_unknown;
            switch(type){
                case Messages.ERROR_PACKAGE_PARSE:
                    Dialogs.showErrorWithDetails(Strings.err_epub_corrupt, data);
                    return;
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
        showErrorWithDetails : function(title, details){
            var body = $('<pre></pre>').text(details || "Unknown Error"),
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
        showModalHTML : function(title, html){
            var body = $(html),
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
        showModalMessageEx : function(title, body){
            var buttons = ButtonTemplate({
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
            //     $('#managed-dialog .yes-button').on('click', onOk);

            // if (onCancel)
            //     $('#managed-dialog .no-button').on('click', onCancel);
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

        // UNUSED!
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

        showModalProgress : function(title, message, onCancel){
            var data = {
                message: message
            }
            lastTitle = title;

            var buttons = ButtonTemplate({
                buttons : [
                    {
                        //dismiss : true,
                        text : Strings.i18n_cancel,
                        classes : ['cancel-button', 'btn-primary']
                    }
                ]
            });

            showModalDialog(false, title, ProgressDialog(data), onCancel ? buttons : '');

            if (onCancel) {
                $('#managed-dialog .cancel-button').on('click', onCancel);
            }
        },
        updateModalProgressTitle : function(title){
            $('#managed-label').text(title);
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
            //      Dialogs.showModalProgress(lastTitle, msg);
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
