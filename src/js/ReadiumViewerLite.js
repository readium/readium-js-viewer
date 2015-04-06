define(['jquery', 'EpubReader'], function($, EpubReader){

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