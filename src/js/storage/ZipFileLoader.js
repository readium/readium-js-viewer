// inflate is required by zip,
// but inflate must be loaded *after* zip
define(['zip', '../workers/Messages', 'inflate'], function(zip, Messages){

	var largeFileThreshold = 150 * 1024 * 1024; // 150MB

	zip.useWebWorkers = false;

	ZipFileLoader = function(options){
		this.options = options;
			//this.client = new RemoteStorage.BaseClient(remoteStorage, '/readium/');
	}

	ZipFileLoader.prototype = {
		init : function(success) {
			if (this.entries){
				success();
				return;
			}
			var buf = this.options.buf;

			this.entries = {};
			var thiz = this;

			zip.createReader(new zip.BlobReader(buf), function(reader){
				reader.getEntries(function(entries){
					for (var i = 0; i < entries.length; i++){
						if (!entries[i].directory){
							thiz.entries[entries[i].filename] = entries[i];
						}
					}
					success();
				});
			}, this.options.error);
		},
		isZipFile : function() {
			return true;
		},
		getZipBlob : function() {
			return this.options.buf;
		},
		loadFile : function(path, callback){
			if (!this.entries){
				throw "you need to call ZipFileLoader.init first";
			}

			var entry = this.entries[path];
			if (entry) {
				entry.getData(new zip.BlobWriter(), callback);
			}
			else {
				callback(null);
			}
		},
		loadAllFiles : function(excludeList, startAtIndex, progress){
			if (!this.entries){
				throw "you need to call ZipFileLoader.init first";
			}
			var entries = this.entries;
			for (var i = 0; i < excludeList.length; i++) {
				delete entries[excludeList[i]];
			}
			var pending = [];
			var continueCallback = function() {
				if (pending.length){
					setTimeout(inflateAndProcess.bind(null, pending.shift()), 0);
				}
			}

			var inflateAndProcess = function(entry) {
				entry.getData(new zip.BlobWriter(), progress.bind(null, continueCallback, entry.filename));
			}

			var buf = this.options.buf,
			    count = 0;

			// for large files we want to extract only one file at a time
		    var concurrent = buf.size > largeFileThreshold ? 1 : 200;

			for (var fn in entries) {
				var entry = entries[fn];
				if (count++ < startAtIndex){
					continue;
				}
				else if (count <= (startAtIndex + concurrent))
				{
					console.log('starting: ' + entry.filename);
					inflateAndProcess(entry);
				}
				else{
					pending.push(entry);
				}
			}
			return count;
		},

	}
	return ZipFileLoader;
})
