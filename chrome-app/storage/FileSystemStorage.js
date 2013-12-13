define(['workers/Messages'], function(Messages){
	

	var FileUtils = (function(){
		
		var toArray = function(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		
		var makeFile = function(root, filename, contents, callback, error){
			root.getFile(filename, {create:true}, function(fileEntry){
				fileEntry.createWriter(function(writer){
					writer.onwriteend = function(){
						// strange piece of the FileWriter api. Writing to an 
						// existing file just overwrites content in place. Still need to truncate
						// which triggers onwritend event...again. o_O
						if (writer.position < writer.length){
							writer.truncate(writer.position);	
						}
						else if (callback)
							callback(fileEntry);

					}
					writer.onerror = function(e){
						throw(e);
					}
					if (contents instanceof ArrayBuffer){
						contents = new Uint8Array(contents);
					}
					writer.write(new Blob([contents]));
				}, error);
			}, error);
		}
		
		var makeDir = function(root, dirname, callback, error){
			root.getDirectory(dirname, {create:true},callback, error);
		}
		
		return {
			mkdirs : function(root, dirname, callback, error){
				var pathParts;
				if (dirname instanceof Array){
					pathParts = dirname;
				}
				else{
					pathParts = dirname.split('/');
				}
				
				var makeDirCallback = function(dir){
					if (pathParts.length){
						makeDir(dir, pathParts.shift(), makeDirCallback, error);
					}
					else{
						if (callback)
							callback(dir);
					}
				}
				makeDirCallback(root);
			},
			rmDir : function (root, dirname, callback, error){
				root.getDirectory(dirname, {create:true}, function(dirEntry){
					dirEntry.removeRecursively(callback, error);
				});
			},
			rmFile : function(root, filename, callback, error){
				root.getFile(filename, {create:true}, function(fileEntry){
					fileEntry.remove(callback, error);
				});
			},
			mkfile : function(root, filename, contents, callback, error){
				if (filename.charAt(0) == '/'){
					filename = filename.substring(1);
				}
				var pathParts = filename.split('/');
				if (pathParts.length > 1){
					FileUtils.mkdirs(root, pathParts.slice(0, pathParts.length - 1), function(dir){
						makeFile(dir, pathParts[pathParts.length - 1], contents, callback, error);
					}, error);
				}
				else{
					makeFile(root, filename, contents, callback, error);
				}
			},
			ls: function(dir, callback, error){
				var reader = dir.createReader();
				var entries = [];
				
				var readEntries = function() {
					reader.readEntries (function(results) {
						if (!results.length) {
							callback(entries);
						} else {
							entries = entries.concat(toArray(results));
							readEntries();
						}
					}, error);
				}
				readEntries();
				
			},
			readBlob: function(blob, dataType, callback){
				var reader = new FileReader();
				reader.onloadend = function(e){
					callback(reader.result);
				}
				reader["readAs" + dataType](blob);
			},
			readFileEntry : function(fileEntry, dataType, callback){
				fileEntry.file(function(file){
					FileUtils.readBlob(file, dataType, callback);
				});
			},
			readFile : function(root, file, dataType, callback, error) {
				
				root.getFile(file, {create:false}, function(fileEntry){
					FileUtils.readFileEntry(fileEntry, dataType, callback, error);
				}, error);
			}
		
		};
	}
	)();
	var rootDir;

	var wrapErrorHandler = function(op, path, handler){
		return function(err){
			var data = {path: path, error: err.name, op: op};
			handler(Messages.ERROR_STORAGE, data);
			console.error(data);
		}
	};

	self.requestFileSystem  = self.requestFileSystem || self.webkitRequestFileSystem;
	
	var StaticStorageManager = {
		
		
		saveFile : function(path, blob, success, error){
			FileUtils.mkfile(rootDir, path, blob, success, wrapErrorHandler('save', path, error));
		},
		
		deleteFile : function(path, success, error){
			var errorHandler = wrapErrorHandler('delete', path, error);
			if (path == '/'){
				FileUtils.ls(rootDir, function(entries){
					var count = entries.length;
					var checkDone = function(){
						if (--count == 0){
							success();
						}
					}
					entries.forEach(function(entry){
						if (entry.isDirectory){
							entry.removeRecursively(checkDone, errorHandler)
						}
						else{
							entry.remove(checkDone, errorHandler);
						}
					});
				}, error);
			}	
			else{
				FileUtils.rmDir(rootDir, path, success, errorHandler);
			}
			
		},

		getPathUrl : function(path){
			if (path.charAt(0) == '/') 
				path = path.substring(1);

			return rootDir.toURL() + path
		},
		initStorage : function(success, error){
			if (rootDir){
				success();
				return;
			}
			requestFileSystem(self.PERSISTENT, 5*1024*1024*1024, function(fs){
				rootDir = fs.root;
				success();
			}, wrapErrorHandler('init', '/', error));
		}
	}

	//$(window).bind('libraryUIReady', function(){
	
		

	return StaticStorageManager;
});