define(['jquery', './ModuleConfig', 'zip-ext', 'i18nStrings', './Dialogs', './workers/Messages'], function($, moduleConfig, zip, Strings, Dialogs, Messages){

	var explode = function(file, success, failure) {
		
		var requestFileSystem = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.msRequestFileSystem || window.requestFileSystem;
		if (!requestFileSystem) {
			failure();
			return;
		}
					
console.log("--- HTML5 Filesystem unzip...");				

		var filesystem;
		
		// The Web Worker requires standalone z-worker/inflate/deflate.js files in libDir (i.e. cannot be aggregated/minified/optimised in the final generated single-file build)
		zip.useWebWorkers = true; // (true by default)
		zip.workerScriptsPath = moduleConfig.jsLibRoot;
		
		var zipFs = new zip.fs.FS();

		function onerror() {
			console.error(arguments);
			failure();
		}
			
		function removeRecursively(entry, onend, onerror) {
			var rootReader = entry.createReader();
			rootReader.readEntries(function(entries) {
				var i = 0;
		
				function next() {
					i++;
					removeNextEntry();
				}
		
				function removeNextEntry() {
					var entry = entries[i];
					if (entry) {
						if (entry.isDirectory) {
							removeRecursively(entry, next, onerror);
						}
						else if (entry.isFile) {
console.debug("DELETE: " + entry.toURL());
							entry.remove(next, onerror);
						}
					} else {
						onend();
					}
				}
		
				removeNextEntry();
			}, onerror);
		}
		
		function listFilesystem(entry, onend, onerror) {
			var rootReader = entry.createReader();
			rootReader.readEntries(function(entries) {
				var i = 0;
		
				function next() {
					i++;
					listNextEntry();
				}
				
				function listNextEntry() {
					var entry = entries[i];
					if (entry) {
						if (entry.isDirectory) {
//console.debug("DIR: " + entry.toURL());
							listFilesystem(entry, next, onerror);
						}
						else if (entry.isFile) {
console.debug("UNZIPPED: " + entry.toURL());
							next();
						}
					} else {
						onend();
					}
				}
		
				listNextEntry();
			}, onerror);
		}
		
		function after() {
			console.log("--- UNZIP...");
			
			Dialogs.showModalProgress(Strings.import_dlg_title, Strings.import_dlg_message);
			
			Dialogs.updateProgress(0, Messages.PROGRESS_EXTRACTING, file.name, false);
			
			var callback = function() {
				listFilesystem(filesystem.root,
				function(){
					console.log(arguments);
					success(filesystem.root.toURL());
				},
				onerror);
			};
		
			zipFs.root.getFileEntry(
				filesystem.root,
				callback,
				function(current, total){
					var percent = (current / total) * 100;
					
					Dialogs.updateProgress(percent, //Math.round(percent,2)
					Messages.PROGRESS_EXTRACTING, file.name, false);
				},
				onerror
			);
		}
		
			
		var blobReader = new zip.BlobReader(file);
		
		//zipFs.importBlob(file,
		zipFs.root.importZip(blobReader,
			function() {
						
				zip.createReader(
					blobReader,
					function(reader) {
						reader.getEntries(
							function(entries) {
								var subTotal = 0;
								
								// for (var i = 0; i < entries.length; i++) {
								// 	var entry = entries[i];
								entries.forEach(function(entry) {
					
									if (!entry.directory) {
										
										console.debug(entry.filename);
										console.debug(entry.compressedSize);
										console.debug(entry.uncompressedSize);
										
										subTotal += entry.uncompressedSize;
									}
								}
								);
								
								reader.close(function() {});
												
								var SIZE = subTotal;
								console.debug("ZIPPED / UNZIPPED SIZE: " + file.size + " / " + SIZE);
								
								
								requestFileSystem(
									TEMPORARY,
									SIZE + (1024 * 1024), // 1MB safety margin
									function(fs) {
										filesystem = fs;
										removeRecursively(filesystem.root, after, after);
									}, onerror);
							}
						);
					},
					onerror
				);
				
			},
			onerror
		);
	};
	
	return {explode:explode};
});
