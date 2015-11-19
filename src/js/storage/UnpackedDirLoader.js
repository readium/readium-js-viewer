define(function(){

    var UnpackedDirLoader = function(files) {
        this.files = files;
    }

    UnpackedDirLoader.prototype = {
        isZipFile : function() {
            return false;
        },
        loadFile : function(path, callback) {
            callback(this.files[path]);
        },
        loadAllFiles : function(excludeList, startAtIndex, progress){
            for (var i = 0; i < excludeList.length; i++) {
                delete this.files[excludeList[i]];
            }
            
            var count = 0;
            for (var fn in this.files) {
                if (count++ < startAtIndex) {
                    continue;
                }
                setTimeout(progress.bind(null, null, fn, this.files[fn]), 0);
            }
            return count;
        }
    }
    return UnpackedDirLoader;
});