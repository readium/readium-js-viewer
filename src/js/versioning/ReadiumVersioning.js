/*
Note that "unpackaged versioning" (see code snippet below)
is a less viable option in the refactored RequireJS build process,
as the relative paths of 'package.json', '.git/HEAD', and other '.git/[SHA1]' files
are not based upon the root of the repository source tree anymore
(for example: dist/cloud-reader/index.html vs. dev/index_RequireJS_single-bundle_LITE.html etc.)

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
*/

define(['readium_js/Readium'], function(Readium){

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
