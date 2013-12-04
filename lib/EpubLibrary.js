define(['jquery', 'bootstrap', 'EpubLibraryManager', 'i18n/Strings', 'hgn!templates/library-navbar.html',
		 'hgn!templates/library-item.html', 'hgn!templates/details-dialog.html', 'hgn!templates/details-body.html', 'hgn!templates/settings-dialog.html'], 
		 function($, bootstrap, libraryManager, Strings, LibraryNavbar, LibraryBody, DetailsDialog, DetailsBody, SettingsDialog){

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
	}

	var showError = function(){

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
		$('#app-container').append(LibraryBody({
			epubs: epubs,
			strings: Strings
		}));

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
	}

	var loadLibraryUI = function(){
		var $appContainer = $('#app-container');
		$appContainer.empty();
		$appContainer.append(SettingsDialog({}));
		$('nav').empty();
		$('nav').append(LibraryNavbar({}));
		findHeightRule();
		setItemHeight();
		libraryManager.retrieveAvailableEpubs(loadLibraryItems);
		$(window).on('resize', setItemHeight);
		$(document.body).on('click', '.read', readClick);
	}

	return {
		loadUI : loadLibraryUI,
		unloadUI : unloadLibraryUI
	};
});