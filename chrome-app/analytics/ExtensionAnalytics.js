define(function(){
	window._gaq = window._gaq || [];
	_gaq.push(['_setAccount', 'UA-29665823-1']);
	

	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = 'https://ssl.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	return {
		trackView : function(viewName){
			_gaq.push(['_trackPageview', viewName]);
		},
		sendEvent : function(category, action, label, value){
			_gaq.push(['_trackEvent', category, action, label, value]);
		}
	}
});