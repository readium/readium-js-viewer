define(['jquery', './EpubReader', 'readium_shared_js/helpers'], function($, EpubReader, Helpers){

    $(function(){

	    var urlParams = Helpers.getURLQueryParams();

			// embedded, epub
      EpubReader.loadUI(urlParams);

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
