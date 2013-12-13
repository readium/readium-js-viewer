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
			
		}
	}
	return Settings;
})