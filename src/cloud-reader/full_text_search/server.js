var express = require('express');
var bodyParser = require('body-parser');
var SearchEngine = require('epub-full-text-search');


var SampleService = function () {

    var self = this;
    self.app = express();

    function setupVariables() {

        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;

        //if (typeof self.ipaddress === "undefined")
        //    self.ipaddress = "127.0.0.1";
    }

//watchForUpdateIndex(service, index, epubs);

    function createRoutes() {
        self.routes = {};

        self.routes['/search'] = function (req, res) {

            if (!req.query['q']) {
                res.status(500).send('Can`t found query parameter q -> /search?q=word');
                return;
            }

            var q = req.query['q'].toLowerCase().split(/\s+/);
            var bookTitle = req.query['t'];
            bookTitle = bookTitle || '*'; // if bookTitle undefined return all hits

            self.se.search(q, bookTitle, function (result) {
                res.send(result);
            });
        };


        self.routes['/matcher'] = function (req, res) {

            if (!req.query['beginsWith']) {
                res.status(500).send('Can`t found query parameter beginsWith -> /matcher?beginsWith=word');
                return;
            }

            var bookTitle = req.query['t'];
            self.se.match(req.query['beginsWith'], bookTitle, function (err, matches) {
                res.send(matches);
            });
        };
    }

    function initServer() {

        createRoutes();
        self.app.use(bodyParser.urlencoded({extended: true}));
        self.app.use(bodyParser.json());
        
        //var servingPath = process.cwd() + '/dist/cloud-reader';
        var servingPath = process.cwd();
        console.log("serving static files: " + servingPath);
        // serving readium
        self.app.use(express.static(servingPath));


        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    }

    function terminator(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating service ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    }


    function setupTerminationHandlers() {
        //  Process on exit and signals.
        process.on('exit', function () {
            terminator();
        });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
                process.on(element, function () {
                    terminator(element);
                });
            });
    }

    self.startIndexing = function () {
        var epubs = 'epub_content';
        self.se = new SearchEngine();

        self.se.indexing(epubs, function (info) {
            console.log(info);
        });

    };

    self.init = function () {
        setupVariables();
        setupTerminationHandlers();
        initServer();
    };


    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

};

var sase = new SampleService();
sase.startIndexing();
sase.init();
sase.start();


//function watchForUpdateIndex(se, index, epubContent) {
//
//    var chokidar = require('chokidar'); // watch for changes in directory
//
//    chokidar.watch(epubContent, {
//        ignored: /[\/\\]\./,
//        persistent: true
//    }).on('all', function (event, path) {
//
//        se.indexing(epubContent, function (info) {
//            console.log(info);
//        });
//
//    });
//}
