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

'use strict';

module.exports = function(grunt) {
	
	var testbooksUrl = 'http://epubtest.org/epubs/TestSuiteDocuments.zip';

    grunt.registerTask("createTestLibrary", function() {
    	var httpreq = require('httpreq');
    	var done = this.async();

    	var unzip = require('unzip2');
    	var fs = require('fs');
    	var path = require('path');
    	var parseString = require('xml2js').parseString;

    	httpreq.get(testbooksUrl, {binary: true}, function (err, res){
    		if (err){
    			console.error(err);
    			done();
    			return;
    		}

    		fs.writeFileSync('build/testbooks.zip', res.body);

	    	var reader = fs.createReadStream('build/testbooks.zip');
	    	var writer = unzip.Extract({ path: 'build/testlibrary' });

	    	var booksMetadata = [];
	    	reader.pipe(writer);
	    	writer.on('close', function(){
	    		var books = fs.readdirSync('build/testlibrary');

	    		var count = 0;
	    		books.forEach(function(book){
	    			var epubName = book.substring(0, book.length - 4);
	    			var reader = fs.createReadStream(path.join('build/testlibrary', book));
	    			var rootLibPath = 'build/cloud-reader/epub_content';
	    			var rootBookPath = path.join(rootLibPath, epubName);

	    			reader.pipe(unzip.Extract({ path:  rootBookPath})).on('close', function(){
	    				var containerXml = fs.readFileSync(path.join(rootBookPath, 'META-INF/container.xml'), {encoding: 'utf-8'});
	    				parseString(containerXml, function(err, result){
	    					var pkgLocation = result.container.rootfiles[0].rootfile[0]['$']['full-path'];
	    					var packageXml = fs.readFileSync(path.join(rootBookPath, pkgLocation));
	    					parseString(packageXml, function(err, result){
	    						var obj = {};
	    						var metadata = result['package'].metadata[0];
	    						obj.title = metadata['dc:title'][0]['_'];
	    						obj.author = metadata['dc:creator'][0]['_'];
	    						obj.rootUrl = 'epub_content/' + epubName;
	    						booksMetadata.push(obj);

	    						count++;
		    					if (count == books.length){
		    						var libIndex = path.join(rootLibPath, 'epub_library.json');
		    						var libJson = fs.readFileSync(libIndex, {encoding: 'utf-8'});
		    						var libObj = JSON.parse(libJson);
		    						
		    						fs.writeFileSync(libIndex, JSON.stringify(libObj.concat(booksMetadata)));
		    						done();
		    					}
	    					});
	    					
	    				});
	    			});
	    		});
	    	});	
		});


    });
}