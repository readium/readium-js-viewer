define(['text!version.json', 'Readium'], function(versionTxt, Readium){
	var version = JSON.parse(versionTxt);

	var PackagedVersioning = {
		getVersioningInfo : function(callback){
			var versionInfo = {};
			var readiumVersion = Readium.version;
            versionInfo.viewer = version;
            versionInfo.viewer.dateTimeString = new Date(version.timestamp).toString();
            versionInfo.readiumJs = readiumVersion.readiumJs;
            versionInfo.readiumSharedJs = readiumVersion.readiumSharedJs;
			callback(versionInfo);
		}

	}
	return PackagedVersioning;
});