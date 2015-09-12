define(['jquery', './EpubLibrary', './EpubReader', 'readium_shared_js/helpers'], function($, EpubLibrary, EpubReader, Helpers){


	var initialLoad = function(){

		var urlParams = Helpers.getURLQueryParams();

		var ebookURL = urlParams['epub'];
		if (ebookURL){
			// embedded, epub
      		EpubReader.loadUI(urlParams); //{epub: ebookURL}
		}
		else{
			EpubLibrary.loadUI();
		}

		$(document.body).on('click', function()
        {
            $(document.body).removeClass("keyboard");
        });

		$(document).on('keyup', function(e)
        {
            $(document.body).addClass("keyboard");
        });
	}

	$(initialLoad);

	var pushState = $.noop;

	var isChromeExtensionPackagedApp = (typeof chrome !== "undefined") && chrome.app
			&& chrome.app.window && chrome.app.window.current; // a bit redundant?

	if (!isChromeExtensionPackagedApp // "history.pushState is not available in packaged apps"
			&& window.history && window.history.pushState){
		$(window).on('popstate', function(){
			var state = history.state;
			if (state && state.epub){
				readerView(state.epub);
			}
			else{
				libraryView();
			}
		});
		pushState = function(data, title, url){
			history.pushState(data, title, url);
		};
	}


	var tooltipSelector = 'nav *[title]';

	var libraryView = function(){
		$(tooltipSelector).tooltip('destroy');
		EpubReader.unloadUI();
		EpubLibrary.loadUI();
	}

	var readerView = function(ebookURL){
		$(tooltipSelector).tooltip('destroy');
		EpubLibrary.unloadUI();
		
		EpubReader.loadUI({epub: ebookURL});
	}

	var URLPATH =
	window.location ? (
		window.location.protocol
		+ "//"
		+ window.location.hostname
		+ (window.location.port ? (':' + window.location.port) : '')
		+ window.location.pathname
	) : 'index.html'
	;

	$(window).on('readepub', function(e, ebookURL){
		readerView(ebookURL);
		
        var ebookURL_filepath = Helpers.getEbookUrlFilePath(ebookURL);
		
		pushState(
			{epub: ebookURL},
			"Readium Viewer",
			URLPATH + '?epub=' + encodeURIComponent(ebookURL_filepath)
		);
	});

	$(window).on('loadlibrary', function(e, ebook){

		libraryView();
		
		if (ebook) {
			setTimeout(function() {
				EpubLibrary.importEpub(ebook);
			}, 800);
		}
		
		pushState(null, "Readium Library", URLPATH);
	});

	$(document.body).tooltip({
		selector : tooltipSelector,
		placement: 'auto',
		container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted
	}).on('show.bs.tooltip', function(e){
		$(tooltipSelector).not(e.target).tooltip('destroy');
	});
	
	
	
	if (window.File
	 	//&& window.FileReader
	 ) {
		var fileDragNDropHTMLArea = $(document.body);
		fileDragNDropHTMLArea.on("dragover", function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
			
			//$(ev.target)
			fileDragNDropHTMLArea.addClass("fileDragHover");
		});
		fileDragNDropHTMLArea.on("dragleave", function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
			
			//$(ev.target)
			fileDragNDropHTMLArea.removeClass("fileDragHover");
		});
		fileDragNDropHTMLArea.on("drop", function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
			
			//$(ev.target)
			fileDragNDropHTMLArea.removeClass("fileDragHover");
			
			var files = ev.target.files || ev.originalEvent.dataTransfer.files;
			if (files.length) {
				var file = files[0];
				console.log("File drag-n-drop:");
				console.log(file.name);
				console.log(file.type);
				console.log(file.size);
				
				if (file.type == "application/epub+zip" || (/\.epub$/.test(file.name))) {
					
					if (isChromeExtensionPackagedApp) {
						
            			$(window).triggerHandler('loadlibrary', file);
								
					} else {
						
						$(window).triggerHandler('readepub', [file]);
					}
					
					// var reader = new FileReader();
					// reader.onload = function(e) {
						
					// 	console.log(e.target.result);
						
					// 	var ebookURL = e.target.result;
					// 	$(window).triggerHandler('readepub', [ebookURL]);
					// }
					// reader.readAsDataURL(file);
				}
			}
		});
	}

});
