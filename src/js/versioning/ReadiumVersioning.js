define(['readium_js/Readium'], function(Readium){

    var PackagedVersioning = {
        getVersioningInfo : function(callback){

            Readium.getVersion(function(version){

                var versionInfo = {};
                versionInfo = version;
                
                var date = new Date(version.readiumJsViewer.timestamp);
                versionInfo.dateTimeString = date.toUTCString ? date.toUTCString() : date.toString();
                
                callback(versionInfo);
            });
        }
    }
    return PackagedVersioning;
});
