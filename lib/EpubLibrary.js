define(['jquery', 'bootstrap', 'storage/StorageManager', 'EpubLibraryManager', 'i18n/Strings', 'hgn!templates/library-navbar.html',
		 'hgn!templates/library-body.html', 'hgn!templates/library-item.html', 'hgn!templates/details-dialog.html', 'hgn!templates/details-body.html', 
		 'hgn!templates/add-epub-dialog.html','ReaderSettingsDialog', 'Dialogs', 'workers/Messages'], 
		 function($, bootstrap, StorageManager, libraryManager, Strings, LibraryNavbar, LibraryBody, LibraryItem, DetailsDialog, DetailsBody, 
		 		  AddEpubDialog, SettingsDialog, Dialogs, Messages){

	var heightRule,
		transformRule,
		maxHeightRule,
		detailsDialogStr = DetailsDialog({strings: Strings});

	var findHeightRule = function(){
		
 		var styleSheet=document.styleSheets[0];          
 		var ii=0;                                        
 		var cssRule;                               
        do {                                             
            if (styleSheet.cssRules) {                    
            	cssRule = styleSheet.cssRules[ii];         
            } else {                                      
            	cssRule = styleSheet.rules[ii];            
            }                                             
            if (cssRule)  {                               
            	if (cssRule.selectorText.toLowerCase()=='.library-item') {          
                    heightRule = cssRule;                    
                } 
                else if (cssRule.selectorText.toLowerCase()=='.library-item img') {          
                    maxHeightRule = cssRule;                    
                }                      
                else if (cssRule.selectorText.toLowerCase() == '.library-item .no-cover'){
                	transformRule = cssRule;
                }       
                                                         
            }                                             
            ii++;                                         
        } while (cssRule);                                       
   	}                                                      
   
	
	var setItemHeight = function(){
		var medWidth = 2,
			smWidth = 3,
			xsWidth = 4,
			rowHeight = 0,
			imgWidth = 0,
			scale = 1;

		var winWidth = window.innerWidth;

		if (winWidth >= 992){
			imgWidth = winWidth * (medWidth/12) - 30;
			rowHeight = 1.33 * imgWidth + 105; 
		}
		else if (winWidth >= 768){
			imgWidth = winWidth * (smWidth/12) - 30;
			rowHeight = 1.33 * imgWidth + 105; 
		}
		else{
			imgWidth = winWidth * (xsWidth/12) - 30;
			rowHeight = 1.33 * imgWidth + 20; 
		}
		heightRule.style.height  = rowHeight + 'px';
		scale = imgWidth/300;
		
		var styleRule = 'translate(-' + ((1 - scale) * 300)/2 + 'px, -' +  ((1 - scale) * 400)/2 + 'px) ' + 'scale(' + scale + ',' + scale + ')';
		transformRule.style.webkitTransform = styleRule;
		transformRule.style.transform = styleRule;
		transformRule.style.msTransform = styleRule;
		maxHeightRule.style.maxHeight = 1.33 * imgWidth + 'px';
	};

	var showDetailsDialog = function(details){
		var bodyStr = DetailsBody({
			data: details,
			strings: Strings
		});

		$('.details-dialog .modal-body').html(bodyStr);
		$('.details-dialog .delete').on('click', function(){
			$('.details-dialog').modal('hide');
			var success = function(){
				libraryManager.retrieveAvailableEpubs(loadLibraryItems);
				Dialogs.closeModal();
			}

			var promptMsg = Strings.i18n_are_you_sure + ' \'' + details.title + '\'';

			Dialogs.showModalPrompt(Strings.delete_dlg_title, promptMsg, 
									Strings.i18n_delete, Strings.i18n_cancel,
									function(){
										Dialogs.showModalProgress(Strings.delete_progress_title, '');
										Dialogs.updateProgress(100, Messages.PROGRESS_DELETING, details.title, true); 
										libraryManager.deleteEpubWithId(details.id, success, showError)
									});
		});
	}

	var showError = function(errorCode){
		Dialogs.showError(errorCode);
	}

	var loadDetails = function(e){
		var $this = $(this),
			url = $this.attr('data-book');

		$('.details-dialog').remove();
		$('#app-container').append(detailsDialogStr);
		$('.details-dialog').modal();
		libraryManager.retrieveFullEpubDetails(url, showDetailsDialog, showError);
	}

	var loadLibraryItems = function(epubs){
		$('#app-container .library-items').remove();
		$('#app-container').append(LibraryBody({}));
		epubs.forEach(function(epub){
			$('.library-items').append(LibraryItem({epub: epub, strings: Strings}));
		});
		$('.details').on('click', loadDetails);
	}

	var readClick = function(e){
		var epubUrl = $(this).attr('data-book');
		$(window).triggerHandler('readepub', [epubUrl]);
		return false;
	}

	var unloadLibraryUI = function(){
		$(window).off('resize');
		$(document.body).off('click');
		$(window).off('storageReady');
		$('#app-container').attr('style', '');
	}

	var promptForReplace = function(originalData, callback){
		Dialogs.showModalPrompt(Strings.replace_dlg_title, Strings.replace_dlg_message + ' \'' + originalData.title + '\'' , Strings.replace, Strings.i18n_cancel, callback, $.noop);
	}

	var handleLibraryChange = function(){
		Dialogs.closeModal();
		libraryManager.retrieveAvailableEpubs(loadLibraryItems);
	}

	var handleFileSelect = function(evt){
		var file = evt.target.files[0];
		$('#add-epub-dialog').modal('hide');
		Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
		libraryManager.handleZippedEpub({
			file: file,
			overwrite: promptForReplace,
			success: handleLibraryChange, 
			progress: Dialogs.updateProgress,
			error: showError
		});

	}

	var handleDirSelect = function(evt){
		var files = evt.target.files;
		$('#add-epub-dialog').modal('hide');
		Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
		libraryManager.handleDirectoryImport({
			files: files,
			overwrite: promptForReplace,
			success: handleLibraryChange, 
			progress: Dialogs.updateProgress,
			error: showError
		});
	}
	var handleUrlSelect = function(){
		var url = $('#url-upload').val();
		$('#add-epub-dialog').modal('hide');
		Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
		libraryManager.handleUrlImport({
			url: url,
			overwrite: promptForReplace,
			success: handleLibraryChange, 
			progress: Dialogs.updateProgress,
			error: showError
		});
	}

	var loadLibraryUI = function(){
		var $appContainer = $('#app-container');
		$appContainer.empty();
		SettingsDialog.initDialog();
		$appContainer.append(AddEpubDialog({
			canHandleUrl : libraryManager.canHandleUrl(),
			canHandleDirectory : libraryManager.canHandleDirectory()
		}));
		$('#add-epub-dialog').on('show.bs.modal', function(){
			$('#add-epub-dialog input').val('');
		});
		$('#url-upload').on('keyup', function(){
			var val = $(this).val();
			if (val && val.length){
				$('#add-epub-dialog .add-book').prop('disabled', false);
			}
			else{
				$('#add-epub-dialog .add-book').prop('disabled', true);
			}
		});
		$('.add-book').on('click', handleUrlSelect);
		$('nav').empty();
		$('nav').append(LibraryNavbar({}));
		$('.icon-list-view').on('click', function(){
			$(document.body).addClass('list-view');
		});
		$('.icon-thumbnails').on('click', function(){
			$(document.body).removeClass('list-view');
		});
		findHeightRule();
		setItemHeight();
		StorageManager.initStorage(function(){
			libraryManager.retrieveAvailableEpubs(loadLibraryItems);
		}, showError);


		
		$(window).trigger('libraryUIReady');
		$(window).on('resize', setItemHeight);

		var setAppSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
        }
        $(window).on('resize', setAppSize);
        $('#app-container').css('overflowY', 'auto');

        setAppSize();
		$(document.body).on('click', '.read', readClick);
		$('#epub-upload').on('change', handleFileSelect);
		$('#dir-upload').on('change', handleDirSelect);

		
	}

	return {
		loadUI : loadLibraryUI,
		unloadUI : unloadLibraryUI
	};
});