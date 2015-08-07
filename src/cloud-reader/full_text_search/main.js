// security ???

'use strict';

var epubContent = 'epub_content/';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');


// search engine ----------------------
var SearchEngine = require('epub-full-text-search');
var se = new SearchEngine();
se.indexing(epubContent, function (info) {
    console.log(info);
});
// -----------------------------------


// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//var servingPath = process.cwd() + '/dist/cloud-reader';
var servingPath = process.cwd();
console.log("serving static files: " + servingPath);
// serving readium
app.use(express.static(servingPath));

var port = process.env.PORT || 8081;  // set our port

setFullTextSearchRoutes(app, se);

app.listen(port);
console.log('Listen on port: ' + port);

//watchForUpdateIndex(service, index, epubContent);


function setFullTextSearchRoutes(app, se) {

    app.get('/search', function (req, res) {

        if (!req.query['q']) {
            res.status(500).send('Can`t found query parameter q -> /search?q=word');
            return;
        }

        var q = req.query['q'].toLowerCase().split(/\s+/);
        var bookTitle = req.query['t'];
        bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits

        se.search(q, bookTitle, function (result) {
            res.send(result);
        });
    });

    app.get('/matcher', function (req, res) {

        if (!req.query['beginsWith']) {
            res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
            return;
        }

        se.match(req.query['beginsWith'], function (err, matches) {
            res.send(matches);
        });
    });
}

function watchForUpdateIndex(se, index, epubContent) {

    var chokidar = require('chokidar'); // watch for changes in directory

    chokidar.watch(epubContent, {
        ignored: /[\/\\]\./,
        persistent: true
    }).on('all', function (event, path) {

        se.indexing(epubContent, function (info) {
            console.log(info);
        });

    });
}
