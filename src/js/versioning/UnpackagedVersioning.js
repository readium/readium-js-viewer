define(['jquery', 'readium_js/Readium'], function($, Readium){
	var UnpackagedVersioning = {
		getVersioningInfo: function(callback){

			var obj = {
				release: false,
				clean: false,
				devMode: true
			}
			var readiumVersion = Readium.version,
				versionInfo = {};
            versionInfo.viewer = obj;
            versionInfo.viewer.version = readiumVersion.readiumJsViewer.version;
            versionInfo.viewer.chromeVersion = readiumVersion.readiumJsViewer.chromeVersion;
            versionInfo.viewer.dateTimeString = new Date().toString();
            versionInfo.readiumJs = readiumVersion.readiumJs;
            versionInfo.readiumSharedJs = readiumVersion.readiumSharedJs;
            versionInfo.readiumCfiJs = readiumVersion.readiumCfiJs;


			$.getJSON('package.json', function(data){
				obj.version = data.version;
				obj.chromeVersion = '2.' + data.version.substring(2);

				if (obj.sha){
					callback(versionInfo);
				} else {
        			$.get('.git/HEAD', function(data){
        				var ref = data.substring(5, data.length - 1);
        				$.get('.git/' + ref, function(data){
        					var sha = data.substring(0, data.length - 1);
        					obj.sha = sha;
        					if (obj.version){
        						callback(versionInfo);
        					}
        				})
        			});
				}
			});
		}

	}
	return UnpackagedVersioning;
});
