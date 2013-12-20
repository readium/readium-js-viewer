require(['jquery', 'EpubReader'], function($, EpubReader){
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

    $(function(){
    	var epubUrl = getEpubQueryParam();
    	EpubReader.loadUI({url: decodeURIComponent(epubUrl)});
    });
});