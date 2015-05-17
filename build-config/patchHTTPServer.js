
var args = process.argv.slice(2);

console.log("patchHTTPServer.js arguments: ");
console.log(args);


console.log(process.cwd());
//process.exit(-1);

var fs = require("fs");

var filePath = process.cwd() + "/node_modules/http-server/lib/http-server.js";

fs.readFile(
    filePath,
    {encoding: 'utf-8'},
    function(err, fileContents) {
        if (!err) {

            fileContents = fileContents.replace(
                " this.headers['Access-Control",
                " //this.headers['Access-Control"
                );

            fileContents = fileContents.replace(
                " this.headers['Access-Control",
                " //this.headers['Access-Control"
                );

            fileContents = fileContents.replace(
                ' before.push(corser.create());',
                'this.headers["Access-Control-Allow-Methods"] = "GET, HEAD, POST";this.headers["Access-Control-Allow-Origin"] = "*";this.headers["Access-Control-Allow-Credentials"] = "true";this.headers["Access-Control-Allow-Headers"] = "Range, Content-Type, Origin, X-Requested-With, Accept, Accept-Language, Content-Language";this.headers["Access-Control-Expose-Headers"] = "Accept-Ranges, Content-Encoding, Content-Type, Content-Length, Content-Range, Content-Language, Cache-Control, Expires, Last-Modified, Pragma";before.push(corser.create());'
                );

            fs.writeFile(
                filePath,
                fileContents,
                function(error) {
                    if (error) throw error;
                }
            );
        } else {
            console.log(err);
        }
    }
);
