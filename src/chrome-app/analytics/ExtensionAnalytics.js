//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define(function(){

	//https://github.com/readium/readium-js-viewer/issues/340
	//
	//Refused to load the script 'https://ssl.google-analytics.com/ga.js'
	//because it violates the following Content Security Policy directive:
	//"default-src 'self' chrome-extension-resource:".
	//Note that 'script-src' was not explicitly set,
	//so 'default-src' is used as a fallback.
	//
	// window._gaq = window._gaq || [];
	// _gaq.push(['_setAccount', 'UA-29665823-1']);
	//
	//
	// (function() {
	//   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	//   ga.src = 'https://ssl.google-analytics.com/ga.js';
	//   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	// })();

	return {
		trackView : function(viewName){
			//_gaq.push(['_trackPageview', viewName]);
		},
		sendEvent : function(category, action, label, value){
			//_gaq.push(['_trackEvent', category, action, label, value]);
		}
	}
});
