
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

                            return api.start (
                              function(){console.log("arguments:");console.log(arguments);} ,

                              false,
                              //true, // HEADLESS (PhantomJS)

                            options );



                } else {
                    console.log(err);
                }
            }
        );
