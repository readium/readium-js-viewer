define(['storage/StorageManager', 'storage/EpubUnzipper', 'workers/Messages'], function(StorageManager, EpubUnzipper, Messages){
	
	var LibraryWriter = function(){

	}

	LibraryWriter.prototype = {
        _getFullUrl : function(packageUrl, relativeUrl){
            if (!relativeUrl){
                return null;
            }

            var parts = packageUrl.split('/');
            parts.pop();
            
            var root = parts.join('/');

            return root + (relativeUrl.charAt(0) == '/' ? '' : '/') + relativeUrl
        },

        _saveLibraryIndex : function(success, error){
            var blob = new Blob([JSON.stringify(this.libraryData)]);
            StorageManager.saveFile('/epub_library.json', blob, success, error);
        },
        _saveEpubToIndex : function(options, epubObj){
            this.libraryData.push(epubObj);
            this._saveLibraryIndex(function(){
                options.success(epubObj);
            }, options.error);
        },
        _addEpub : function(options, packageObj, packagePath){
            // create a random root folder name 
            var rootDirName = new Date().getTime() + '' + Math.floor(Math.random() * 1000),
                self = this,
                files = this.files;

            var commitEpubToLibrary = function(){

                var epubObj = {
                    id: packageObj.id,
                    rootDir : rootDirName,
                    packagePath : packagePath,
                    title: packageObj.title,
                    author: packageObj.author,
                    rootUrl : StorageManager.getPathUrl(rootDirName)
                    //coverPath : packageObj.coverHref,
                    //packageUrl : StorageManager.getPathUrl(rootDirName + '/' + packagePath),
                    //coverHref : StorageManager.getPathUrl(rootDirName + '/' + self._getFullUrl(packagePath, packageObj.coverHref))

                }
                if (packageObj.coverHref){
                    epubObj.coverPath = packageObj.coverHref;
                    epubObj.coverHref = StorageManager.getPathUrl(rootDirName + '/' + self._getFullUrl(packagePath, packageObj.coverHref));
                }
                self._saveEpubToIndex(options, epubObj);
            }


            var max = 0;
            var count = 0;
            for (var name in files){
                var path = rootDirName + '/' + name;
                max++;
                (function(name){
                    StorageManager.saveFile(path, files[name], function(){
                        options.progress(75 + Math.round(count/max * 25), Messages.PROGRESS_WRITING, name);
                        if (++count == max) commitEpubToLibrary();
                    }, options.error)
                })(name);
            } 
        },
        _replaceEpub : function(toReplace, packageObj, packagePath){
            
            var self = this;
            
            var deleteThenCallback = function(newItem){
                self.deleteEpub(toReplace, function(){
                    self.callbacks.success(newItem);
                }, self.callbacks.error);
            }

            var wrappedOptions = {
                success: deleteThenCallback,
                error: this.callbacks.error,
                progress: this.callbacks.progress
            }

            this._addEpub(wrappedOptions, packageObj, packagePath);
        },
        _checkForConflict : function(packageObj, packagePath){
            // for (var i = 0; i < this.libraryData.length; i++){
            //     if (this.libraryData[i].id === packageObj.id){
            //         //duplicate found, prompt for confirmation
            //         var callback = this._replaceEpub.bind(this, this.libraryData[i], packageObj, packagePath);
            //         var sidebyside = this._addEpub.bind(this, this.callbacks, packageObj, packagePath);
            //         this.callbacks.overwrite(this.libraryData[i], callback, sidebyside);
            //         return;
            //     }
            // }
            this._addEpub(this.callbacks, packageObj, packagePath);
        },
        _deleteEpubWithIndex : function(i, success, error){
            var libraryItem = this.libraryData[i];
            this.libraryData.splice(i, 1);
            this._saveLibraryIndex(function(){
                StorageManager.deleteFile(libraryItem.rootDir, success, error);
            }, error);
        },
        _loadFileAsString : function(path, callback){
            var error = this.callbacks.error,
                fileReader = new FileReader(),
                blob = this.files[path];

            if (!blob){
                this.callbacks.error(Messages.ERROR_EPUB);
                console.error('Epub archive or directory missing a required  file: ' + path);
            }

            fileReader.onload = function() {
                // var xmlDom = (new DOMParser()).parseFromString(this.result, "text/xml");
                callback(this.result);
            };

            fileReader.readAsText(blob);
        },
        _findPackagePath : function(containerStr, callback){
            findPackageResponse = function(data){
                findPackageResponse = null;
                callback(data.path);
            }
            postMessage({msg: Messages.FIND_PACKAGE, containerStr: containerStr});
        },
        _parsePackageData : function(packageStr, callback){
            parsePackageResponse = function(data){
                parsePackageResponse = null;
                callback(data.packageObj);
            }
            postMessage({msg: Messages.PARSE_PACKAGE, packageStr: packageStr});
        },
        _addEpubToLibrary : function(files){
            this.files = files;
            var self = this;

            
            this._loadFileAsString('META-INF/container.xml', function(containerStr){
                self._findPackagePath(containerStr, function(packagePath){
                    self._loadFileAsString(packagePath, function(packageStr){
                        self._parsePackageData(packageStr, function(packageObj){
                            self._checkForConflict(packageObj, packagePath);
                        });
                    });
                });
                
                // var $rootfile = $('rootfile', containerDom);
                // if (!$rootfile.length){
                //     this.options.error(Messages.ERROR_EPUB);
                //     console.error('Epub container.xml missing rootfile element');
                // }
                
               
            });
            //self.client.storeFile(self._getMimeType(entry.filename),  '/' + entry.filename, this.result);
        },
        deleteEpubWithId : function(id, success, error){
            for (var i = 0; i < this.libraryData.length && this.libraryData[i].rootDir != id; i++);

            if (i < this.libraryData.length){
                this._deleteEpubWithIndex(i, success, error);
            }
            else{
                success();
            }
        },
        // necessary to have this in addition to delete by id because at some point during an overwrite there will be two 
        // epubs in the index with the same id. 
        deleteEpub : function(libraryItem, success, error){
            for (var i = 0; i < this.libraryData.length && this.libraryData[i] != libraryItem; i++);

            if (i < this.libraryData.length){
                this._deleteEpubWithIndex(i, success, error);
            }
            else{
                success();
            }
        },
        importZip : function(blob, callbacks){
            this.callbacks = callbacks;
        	var unzipper = new EpubUnzipper({
        		buf: blob,
        		success: this._addEpubToLibrary.bind(this),
        		error: callbacks.error,
        		progress: callbacks.progress
        	});
            unzipper.extractAll();
        },
        importFileList : function(files, callbacks){
            this.callbacks = callbacks;
            // var files = {};
            // for (var i = 0; i < rawFiles.length; i++){
            //     var path = rawFiles[i].webkitRelativePath,
            //         shiftPath = path.split('/').shift().join('/');
                
            //     files[shiftPath] = rawFiles[i];
            // }
            this._addEpubToLibrary(files);
        },
        importUrl : function(url, callbacks){
            // I don't want jquery in the worker so go old school
            var xhr = new XMLHttpRequest();
                self = this, 
                error = function(){callbacks.error(Messages.ERROR_AJAX);};

            xhr.open('GET', url, true);
            xhr.responseType = 'blob';

            xhr.onload = function(e) {
              if (this.status == 200) {
                // Note: .response instead of .responseText
                var blob = new Blob([this.response], {type: 'application/epub'});
                self.importZip(blob, callbacks);
              }
              else{
                error();
              }
            };
            xhr.onerror = error;

            xhr.send();
        }
	}

	var writer = new LibraryWriter(),
        overwriteContinue, overwriteSideBySide, findPackageResponse, parsePackageResponse;

	return function(){
	   onmessage = function(evt){
			var data = evt.data,
				msg = data.msg;

			var success = function(){
				postMessage({msg: Messages.SUCCESS, library: writer.libraryData});
			}
			var progress = function(percent, type, data){
				postMessage({msg: Messages.PROGRESS, percent: percent, progressType: type, progressData: data});
			}
			var error = function(errorCode, data){
				postMessage({msg: Messages.ERROR, errorMsg: errorCode, errorData: data});
			}
			var overwrite = function(item, kontinue, sidebyside){
				postMessage({msg: Messages.OVERWRITE, item: item});
                overwriteContinue = function(){
                    overwriteContinue = null;
                    overwriteSideBySide = null;
                    kontinue();
                }
                overwriteSideBySide = function(){
                    overwriteContinue = null;
                    overwriteSideBySide = null;
                    sidebyside();
                }
			}

            switch(msg){
    			case Messages.IMPORT_ZIP : 
                    writer.libraryData = data.libraryItems;
    				var buf = data.buf;
                    StorageManager.initStorage(function(){
    				    writer.importZip(buf, {success: success, progress: progress, error: error, overwrite: overwrite});
                    }, error);
    			    break;
                case Messages.DELETE_EPUB:
                    writer.libraryData = data.libraryItems;
                    var id = data.id;
                    StorageManager.initStorage(function(){
                        writer.deleteEpubWithId(id, success, error);
                    }, error);
                    break;
                case Messages.IMPORT_DIR:
                    writer.libraryData = data.libraryItems;
                    var files = data.files;
                    StorageManager.initStorage(function(){
                        writer.importFileList(files, {success: success, progress: progress, error: error, overwrite: overwrite});
                    }, error);
                    break;
                case Messages.IMPORT_URL:
                    writer.libraryData = data.libraryItems;
                    var url = data.url;
                    StorageManager.initStorage(function(){
                        writer.importUrl(url, {success: success, progress: progress, error: error, overwrite: overwrite});
                    }, error);
                    break;
                case Messages.MIGRATE : 
                    StorageManager.initStorage(function(){
                        var wrapProgress = function(percent, data){
                            progress(percent, Messages.PROGRESS_MIGRATING, data);
                        }
                        StorageManager.migrateLegacyBooks(success, error, wrapProgress);
                    }, error);
                case Messages.OVERWRITE_CONTINUE :
                    overwriteContinue && overwriteContinue(data);
                    break;
                case Messages.OVERWRITE_SIDE_BY_SIDE:
                    overwriteSideBySide && overwriteSideBySide(data);
                    break;
                case Messages.FIND_PACKAGE_RESPONSE :
                    findPackageResponse && findPackageResponse(data);
                    break;
                case Messages.PARSE_PACKAGE_RESPONSE :
                    parsePackageResponse && parsePackageResponse(data);
                    break;
            }

		}


	}
});
(require('workers/EpubLibraryWriter'))();