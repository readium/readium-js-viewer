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

define(['text!i18n/_locales/en_US/messages.json'], function(en_US){
	var i18nObj = {};

	var baseObj = JSON.parse(en_US);

	var dynamicProp = function(propName){
		Object.defineProperty(i18nObj, prop, {get : function(){return chrome.i18n.getMessage(propName);}});
	}
	for(var prop in baseObj){
		dynamicProp(prop);
	}
	return i18nObj;
});