

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