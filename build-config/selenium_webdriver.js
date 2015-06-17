
var args = process.argv.slice(2);

console.log("http-server arguments: ");
console.log(args);

if (args.length) {

var path = require('path');
var child_process = require('child_process');

args.unshift(path.join(process.cwd(), 'node_modules', 'http-server', 'bin', 'http-server'));

var child = child_process.spawn('node', args);
child.stdout.on('data', function(data) {
    console.log(data.toString());
});
child.stderr.on('data', function(data) {
    console.log(data.toString());
});
child.on('close', function(code) {
  console.log('HTTP child process exit code: ' + code);
});
child.on('exit', function() {
  setTimeout(function(){
      console.log('exit');
      process.exit(0);
  }, 5000);
});
}

        var filePath = process.cwd()
            + "/"
            + "node_modules/grunt-selenium-webdriver/tasks/selenium_webdriver.js"

        var fs = require("fs");
        fs.readFile(
            filePath,
            {encoding: 'utf-8'},
            function(err, fileContents) {
                if (!err) {
                    var func = eval("( function(){"+fileContents+"; return {start: start, stop: stop}; } )");
                    var api = func();


                            var options = {
                              timeout: false, // set to integer if required
                              host: '127.0.0.1',
                              port: 4444,
                              maxSession: false,
                              ignoreSslErrors: false,


                              cwd: null,
                              phantomPort: 8181
                            };

                            //        http://127.0.0.1:4444/selenium -server/driver/?cmd=shutDownSeleniumServer
                            //        http://127.0.0.1:4444/wd/hub

                            api.start (
                              function(){console.log("SELENIUM arguments:");console.log(arguments);} ,

                              false,
                              //true, // HEADLESS (PhantomJS)

                            options );

                            console.log("SELENIUM STARTED");

                } else {
                    console.log(err);
                }
            }
        );


                                    console.log("SELENIUM ...");
