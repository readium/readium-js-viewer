define(['readium_js/Readium'], function(Readium){

	var PackagedVersioning = {
		getVersioningInfo : function(callback){

			Readium.getVersion(function(version){

				var versionInfo = {};

				versionInfo = version;
				versionInfo.dateTimeString = new Date(version.readiumJsViewer.timestamp).toString();

				callback(versionInfo);
			});
		}
	}
	return PackagedVersioning;
});
