require(['jquery', 'EpubLibrary', 'EpubReader'], function($, EpubLibrary, EpubReader){
	
	var getEpubQueryParam = function(){
        var query = window.location.search;
        if (query && query.length){
            query = query.substring(1);
        }
        if (query.length){
            var keyParams = query.split('&');
            for (var x = 0; x < keyParams.length; x++)
            {
                var keyVal = keyParams[x].split('=');
                if (keyVal[0] == 'epub' && keyVal.length == 2){
                    return keyVal[1];
                }
            }

        }
        return null;
    }

	var initialLoad = function(){
		var epubUrl = getEpubQueryParam();
		if (epubUrl){
			EpubReader.loadUI({epub: decodeURIComponent(epubUrl)});
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
            if (e.keyCode === 9)
                $(document.body).addClass("keyboard");
        });
	}

	$(initialLoad);
	
	var pushState = $.noop;
	if (window.history && window.history.pushState){
		$(window).on('popstate', function(){
			var state = history.state;
			if (state && state.epub){
				EpubLibrary.unloadUI();
				EpubReader.loadUI({epub: state.epub});
			}
			else{
				EpubReader.unloadUI();
				EpubLibrary.loadUI();
			}
		});
		pushState = function(data, title, url){
			history.pushState(data, title, url);
		};
	}

	$(window).on('readepub', function(e, url){
		EpubLibrary.unloadUI();
		EpubReader.loadUI({epub: url});
		pushState({epub: url}, "Readium Viewer", '?epub=' + encodeURIComponent(url));
	});

	$(window).on('loadlibrary', function(e){
		EpubReader.unloadUI();
		EpubLibrary.loadUI();
		pushState(null, "Readium Library", 'index.html');
	});
});