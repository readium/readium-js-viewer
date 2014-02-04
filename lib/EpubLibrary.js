define(['jquery', 'bootstrap', 'storage/StorageManager', 'storage/Settings', 'EpubLibraryManager', 'i18n/Strings', 'hgn!templates/library-navbar.html', 
		 'hgn!templates/library-body.html', 'hgn!templates/empty-library.html', 'hgn!templates/library-item.html', 'hgn!templates/details-dialog.html', 'hgn!templates/about-dialog.html', 'hgn!templates/details-body.html', 
		 'hgn!templates/add-epub-dialog.html','ReaderSettingsDialog', 'Dialogs', 'workers/Messages', 'analytics/Analytics'], 
		 function($, bootstrap, StorageManager, Settings, libraryManager, Strings, LibraryNavbar, LibraryBody, EmptyLibrary, LibraryItem, DetailsDialog, AboutDialog, DetailsBody, 
		 		  AddEpubDialog, SettingsDialog, Dialogs, Messages, Analytics){

	var heightRule,
		noCoverRule,
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
                	noCoverRule = cssRule;
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
			rowHeight = 1.33 * imgWidth + 60; 
		}
		else if (winWidth >= 768){
			imgWidth = winWidth * (smWidth/12) - 30;
			rowHeight = 1.33 * imgWidth + 60; 
		}
		else{
			imgWidth = winWidth * (xsWidth/12) - 30;
			rowHeight = 1.33 * imgWidth + 20; 
		}
		heightRule.style.height  = rowHeight + 'px';
		scale = imgWidth/300;
		
		noCoverRule.style.width = imgWidth + 'px';
		noCoverRule.style.height = 1.33 * imgWidth + 'px';
		noCoverRule.style.fontSize = 40 * scale + 'px';
		maxHeightRule.style.height = 1.33 * imgWidth + 'px';
		maxHeightRule.style.width = imgWidth + 'px';
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
			url = $this.attr('data-package'),
			bookRoot = $this.attr('data-root'),
			noCoverBg = $this.attr('data-no-cover');

		$('.details-dialog').remove();
		$('#app-container').append(detailsDialogStr);
		$('.details-dialog').modal();
		libraryManager.retrieveFullEpubDetails(url, bookRoot, noCoverBg, showDetailsDialog, showError);
	}

	var loadLibraryItems = function(epubs){
		$('#app-container .library-items').remove();
		$('#app-container').append(LibraryBody({}));
		if (!epubs.length){
			$('#app-container .library-items').append(EmptyLibrary({strings: Strings}));
			return;
		}
		
		var count = 0;
		epubs.forEach(function(epub){
			var noCoverBackground = 'images/covers/cover' + ((count++ % 8) + 1) + '.jpg';
			$('.library-items').append(LibraryItem({epub: epub, strings: Strings, noCoverBackground: noCoverBackground}));
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

	var doMigration = function(){
		Dialogs.showModalProgress(Strings.migrate_dlg_title, Strings.migrate_dlg_message);
		libraryManager.handleMigration({
			success: function(){
				Settings.put('needsMigration', false, $.noop);
				handleLibraryChange();
			}, 
			progress: Dialogs.updateProgress,
			error: showError
		});
	}

	var loadLibraryUI = function(){
		Analytics.trackView('/library');
		var $appContainer = $('#app-container');
		$appContainer.empty();
		SettingsDialog.initDialog();
		$appContainer.append(AddEpubDialog({
			canHandleUrl : libraryManager.canHandleUrl(),
			canHandleDirectory : libraryManager.canHandleDirectory()
		}));
		$appContainer.append(AboutDialog({strings: Strings}));
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
		$('nav').append(LibraryNavbar({strings: Strings}));
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

		Settings.get("needsMigration", function(needsMigration){
			if (needsMigration){
				doMigration();
			}
		});
		document.title = Strings.i18n_readium_library;
	}

	return {
		loadUI : loadLibraryUI,
		unloadUI : unloadLibraryUI
	};
});