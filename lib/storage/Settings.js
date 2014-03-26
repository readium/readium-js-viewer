define(function(){
	Settings = {
		put : function(key, val, callback){
			localStorage[key] = JSON.stringify(val);
			if (callback){
				callback();
			}
		},
		get : function(key, callback){
			var val = localStorage[key];
			if (val){
				callback(JSON.parse(val));
			}
			else{
				callback(null);
			}
			
		},
		getMultiple : function(keys, callback){
			var retVal = {};
			for (var i = 0; i < keys.length; i++){
				if (localStorage[keys[i]]){
					retVal[keys[i]] = localStorage[keys[i]];
				}
			}
			callback(retVal);
		}
	}
	return Settings;
})