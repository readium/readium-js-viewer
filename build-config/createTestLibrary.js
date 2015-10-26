
'use strict';

var testbooksUrl = 'http://epubtest.org/epubs/TestSuiteDocuments.zip';

var httpreq = require('httpreq');
var fs = require('fs');
var path = require('path');
var parseString = require('xml2js').parseString;

//var unzip = require('unzip');
var DecompressZip = require('decompress-zip');

var count = 0;
var booksMetadata = [];

var processUnzippedBook = function(rootLibPath, books, epubName, rootBookPath) {
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
            }
        });
    });
};

var processUnzipped = function() {
    var books = fs.readdirSync('dist/testlibrary');

    books.forEach(function(book){
        var epubName = book.substring(0, book.length - 4);
        var rootLibPath = 'dist/cloud-reader/epub_content';
        var rootBookPath = path.join(rootLibPath, epubName);

        var epubPath = path.join('dist/testlibrary', book);

        //var reader = fs.createReadStream(epubPath);
        //reader.pipe(unzip.Extract({ path:  rootBookPath})).on('close', function(){
        //    processUnzippedBook(rootLibPath, books, epubName, rootBookPath);
        //});

        var bookUnzipper = new DecompressZip(epubPath);

        bookUnzipper.on('error', function (err) {
                     console.log("DecompressZip: extract ERROR - " + epubPath);
                     console.log(err);
           });

        bookUnzipper.on('extract', function (log) {
               console.log("DecompressZip: extract OK - " + epubPath);
                     //console.log(log);

                     processUnzippedBook(rootLibPath, books, epubName, rootBookPath);
           });

        bookUnzipper.extract({
                     path: rootBookPath,
                     filter: function (file) {
                            return file.type !== "SymbolicLink";
                     }
           });
    });
};

var processZip = function() {

//var reader = fs.createReadStream('dist/testbooks.zip');
//var writer = unzip.Extract({ path: 'dist/testlibrary' });
    //reader.pipe(writer);
    // writer.on('close', function(){
    //         processUnzipped();
// });

    var unzipper = new DecompressZip('dist/testbooks.zip');
       
       unzipper.on('error', function (err) {
              console.log("DecompressZip: extract ERROR");
              console.log(err);
       });
       
       unzipper.on('extract', function (log) {
              console.log("DecompressZip: extract OK");
              console.log(log);
       
              processUnzipped();
       });
       
       unzipper.extract({
              path: 'dist/testlibrary',
              filter: function (file) {
                     return file.type !== "SymbolicLink";
              }
       });
};

// DEBUG ONLY!
var zipAlreadyExists = false;
try {
       fs.accessSync(path.join(process.cwd(), 'dist', 'testbooks.zip'));
       zipAlreadyExists = true;
} catch (e) {
        // ignored
}
if (zipAlreadyExists) {
       console.log('ALREADY DOWNLOADED: dist/testbooks.zip');
       processZip();
       return;
}

console.log('DOWNLOADING: dist/testbooks.zip ...');

httpreq.get(testbooksUrl, {binary: true}, function (err, res){
    if (err){
        console.error(err);
        return;
    }

    fs.writeFileSync('dist/testbooks.zip', res.body);

       processZip();
});
