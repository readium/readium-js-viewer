define(['text!version.json'], function(versionTxt, Readium){
    var version = JSON.parse(versionTxt);

	var PackagedVersioning = {
        getVersioningInfo : function(callback){
            var versionInfo = {};
            
            versionInfo = version;
            versionInfo.dateTimeString = new Date(version.readiumJsViewer.timestamp).toString();

            callback(versionInfo);
        }
	}
	return PackagedVersioning;
});