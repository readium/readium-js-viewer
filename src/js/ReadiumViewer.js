define(['jquery', './EpubLibrary', './EpubReader', 'readium_shared_js/helpers'], function($, EpubLibrary, EpubReader, Helpers){


	var initialLoad = function(){

		var urlParams = Helpers.getURLQueryParams();

		var epubUrl = urlParams['epub'];

		if (epubUrl){
			// embedded, epub
      EpubReader.loadUI(urlParams); //{epub: epubUrl}
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

	var readerView = function(url){
		$(tooltipSelector).tooltip('destroy');
		EpubLibrary.unloadUI();
		EpubReader.loadUI({epub: url});
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

	$(window).on('readepub', function(e, url){
		readerView(url);
		pushState({epub: url}, "Readium Viewer",
				URLPATH + '?epub=' + encodeURIComponent(url)
		);
	});

	$(window).on('loadlibrary', function(e){
		libraryView();
		pushState(null, "Readium Library", URLPATH);
	});

	$(document.body).tooltip({
		selector : tooltipSelector,
		placement: 'auto',
		container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted
	}).on('show.bs.tooltip', function(e){
		$(tooltipSelector).not(e.target).tooltip('destroy');
	});

});
