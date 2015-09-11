//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define(['readium_js_viewer/workers/Messages'], function(Messages){


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
						if (!writer.error && writer.position < writer.length){
							writer.truncate(writer.position);
						}
						else if (callback) {
							callback(fileEntry);
						}

					}
					writer.onerror = function(e){
						console.error('failed: ' + filename);
						error(writer.error);
					}
					if (contents instanceof ArrayBuffer){
						contents = new Uint8Array(contents);
					}
					var blob = contents instanceof Blob ? contents : new Blob([contents]);
					writer.write(blob);
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
			var data = {original: err, path: path, error: err.name, op: op};
			handler(Messages.ERROR_STORAGE, data);
			console.error(data);
		}
	};
	var copyDir = function(from, to, success, error){
		FileUtils.ls(from, function(entries){
			var counter = 0;
			var checkFinished = function(){
				if (++counter == entries.length){
					success();
				}
			}
			entries.forEach(function(entry){
				if (entry.isFile){
					entry.file(function(file){
						FileUtils.mkfile(to, entry.name, file, checkFinished);
					});
				}
				else{
					FileUtils.mkdirs(to, entry.name, function(dir){
						copyDir(entry, dir, checkFinished);
					}, error);

				}
			});
		}, error);
	}
	var migrateBook = function(tempRoot, ebookData, success, error){
		var rootDirName = ebookData.key;
        tempRoot.getDirectory(rootDirName, {create: false}, function(oldBookRoot){

        	var nextStep = function(){
        		rootDir.getDirectory(rootDirName, {create: true}, function(newBookRoot){
        			copyDir(oldBookRoot, newBookRoot, success, error);

        		}, error);
        	}

        	rootDir.getDirectory(rootDirName, {create: false}, function(newBookRoot){
        		newBookRoot.removeRecursively(nextStep, error);
        	}, nextStep);
        }, error);
	}

	var migrateBookFiles = function(existingBooks, db, results, success, error, progress){
		var extensionId = self.location.hostname;
		requestFileSystem(self.TEMPORARY, 5*1024*1024*1024, function(fs){
    		var tempRoot = fs.root;
    		var ebooks = [];
    		for (var i = 0; i < results.rows.length; i++){
		        var ebookData = JSON.parse(results.rows.item(i).value);

		        // not all records contain books
		        if (ebookData.id){
		            ebooks.push(ebookData);
		        }
		    }
		    var count = 0;
		    var checkFinished = function(ebook){
		    	if (++count == ebooks.length){
		    		success();
		    	}
		    	else{
		    		progress(Math.round(count/ebooks.length * 100), ebook.title);
		    	}
		    }
		    ebooks.forEach(function(ebook){
		    	migrateBook(tempRoot, ebook, function(){
		    		var oldRootUrl = "filesystem:chrome-extension://" + extensionId + '/temporary/',
		    			coverPath = ebook.cover_href ? ebook.cover_href.substring(oldRootUrl.length) : null;

		    		var newObj = {
		    			id: ebook.id,
		    			rootDir: ebook.key,
		    			rootUrl : StaticStorageManager.getPathUrl(ebook.key),
		    			packagePath: ebook.package_doc_path.substring(ebook.key.length + 1),
		    			title: ebook.title,
		    			author: ebook.author,
		    			coverHref: (coverPath ? StaticStorageManager.getPathUrl(coverPath) : null)
		    		}

		    		existingBooks.push(newObj);
		    		var blob = new Blob([JSON.stringify(existingBooks)]);
            		StaticStorageManager.saveFile('/epub_library.json', blob, function(){
            			db.transaction(function(t){
            				t.executeSql('delete from records where id=? or id=?', [ebook.key, ebook.key + '_epubViewProperties'], checkFinished.bind(null, ebook), error);
            			});
            		}, error);
		    	});
		    });
    	}, error);
	}

	var migrateBooks = function(success, error, progress){
		var db = openDatabase('records', '1.0.0', 'records', 65536);

        if (db){
            db.transaction(function(t){ t.executeSql("select id, value from records", [],
                function(xxx, results){
                    if (results.rows.length) {

                    	var nextStep = function(data){
                    		var library = [];
                    		if (typeof data == 'string' || data instanceof String){
                    			library = JSON.parse(data);
                    		}
                    		migrateBookFiles(library, db, results, success, error, progress);
                    	}

                    	FileUtils.readFile(rootDir, '/epub_library.json', 'Text', nextStep, nextStep)
					}
					else{
						success();
					}
				}, error);
            });
        }
	}

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
		},

		migrateLegacyBooks : function(success, error, progress){
			var errorWrap = function(){
				var data = JSON.stringify(arguments);
				var errorMsg = 'Unexpected error while migrating. ' +  data;
				console.error(errorMsg)
				error(errorMsg);
			}
			migrateBooks(success, errorWrap, progress);
		}
	}

	//$(window).bind('libraryUIReady', function(){



	return StaticStorageManager;
});
