define(['text!i18n/_locales/de/messages.json', 
		'text!i18n/_locales/en_US/messages.json', 
		'text!i18n/_locales/fr/messages.json', 
		'text!i18n/_locales/id/messages.json', 
		'text!i18n/_locales/it/messages.json', 
		'text!i18n/_locales/ja/messages.json',
		'text!i18n/_locales/ko/messages.json',
		'text!i18n/_locales/pt_BR/messages.json',
		'text!i18n/_locales/zh_CN/messages.json',
		'text!i18n/_locales/zh_TW/messages.json'], 
function(de, en_US, fr, id, it, ja, ko, pt_BR, zh_CN, zh_TW){
	var Strings = {};

	Strings['de'] = de;
	Strings['en_US'] = en_US;
	Strings['fr'] = fr;
	Strings['id'] = id;
	Strings['it'] = it;
	Strings['ja'] = ja;
	Strings['ko'] = ko;
	Strings['pt_BR'] = pt_BR;
	Strings['zh_CN'] = zh_CN;
	Strings['zh_TW'] = zh_TW;

	var language = navigator.userLanguage || navigator.language;
    console.log("Language: [" + language + "]");
    
    var allowEnglishFallback = true;
    
	var i18nStr = Strings[language] || en_US;

	var i18nObj = JSON.parse(i18nStr);
    var i18nObj_en = i18nStr === en_US ? i18nObj : JSON.parse(en_US);

	for(var prop in i18nObj_en){
        var okay = prop in i18nObj;
        if (!okay) console.log("Language [" + language + "], missing string: [" + prop + "]");
        
		i18nObj[prop] = okay ? i18nObj[prop].message : (allowEnglishFallback ? ("* " + i18nObj_en[prop].message + " *") : "");
	}
	return i18nObj;

});