define(['Readium'], function(Readium){
	
	var PackagedVersioning = {
		getVersioningInfo : function(callback){
			var versionInfo = {};
            
            versionInfo = Readium.version;
            versionInfo.dateTimeString = new Date(Readium.version.readiumJsViewer.timestamp).toString();

			callback(versionInfo);
		}
	}
	return PackagedVersioning;
});