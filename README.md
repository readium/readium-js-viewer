@@ -14,6 +14,23 @@ The viewer is the default viewer for Readium.js, a JS library for rendering EPUB
  * [Custom EPUB management system](#custom-epub-management-and-viewer-application)
  * [Running the Tests](#running-the-tests)

### Initialize your repository

ReadiumJS uses git submodules to embed other repositories and it uses [Node.js](http://nodejs.org/) and associated tools and libraries. Do the following steps to be up and running:

  * Install [Node.js](http://nodejs.org) (details depend on your operating system)
  * Install the Grunt build tool: `npm install -g grunt-cli` (requires at least version 0.4.4)
  * git clone https://github.com/readium/readium-js-viewer.git
  * cd readium-js-viewer
  * git submodule update --init --recursive
  * install Node.JS
  * npm install -g grunt-cli
  * npm install (in the readium-js-viewer directory)
  * cd readium-js
  * npm install (a second time in the readium-js directory)
  * cd ..
  * You should now be able to run the grunt commands specified below.

### Basic EPUB Viewer

#### Visit online demo
@@ -23,21 +40,19 @@ The viewer is the default viewer for Readium.js, a JS library for rendering EPUB

To test the ReadiumJS viewer on any static web server: 

   * clone https://github.com/readium/readium-js-viewer.git into a content directory in your web server (e.g. into a "www/readium-js-viewer" folder)
   * for zipped EPUB files support, configure your web server for [HTTP Byte Serving](http://en.wikipedia.org/wiki/Byte_serving) so that Readium.js library can fetch only the necessary portions of a zipped EPUB file that contain content for the displayed page
   * visit yourdomain/readium-js-viewer/simpleviewer.html?epub=epub_content/moby_dick and enjoy! 
   * there is no step three! (but it is not recommended to deploy the build-related files onto a publicly-accessible server)
   * Perform the above steps and clone https://github.com/readium/readium-js-viewer.git into a content directory in your web server (e.g. into a "www/readium-js-viewer" folder)
   * For zipped EPUB files support, configure your web server for [HTTP Byte Serving](http://en.wikipedia.org/wiki/Byte_serving) so that Readium.js library can fetch only the necessary portions of a zipped EPUB file that contain content for the displayed page
   * Visit yourdomain/readium-js-viewer/simpleviewer.html?epub=epub_content/moby_dick and enjoy! 
   * There is no step three! (but it is not recommended to deploy the build-related files onto a publicly-accessible server)

#### Clone and run an embedded Node.JS web server

You can also use the Grunt build configuration contained in cloned sources to run an embedded Node.JS + Express web server that serves the demo application:

   * install [Node.JS](http://nodejs.org) (details depend on your operating system)
   * install the Grunt build tool: `npm install -g grunt-cli` (Currently requires v0.4.4)
   * install the project's dependencies: `npm install`
   * run the embedded web server using the Grunt build system: `grunt`
   * visit [http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick](http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick) in your browser
   * when done, on the console press CTRL-C to interrupt Grunt build process and the embedded web server
  * Initialize your repository as described above
  * Run the embedded webserver by running `grunt` (this is the default task)
  * Visit [http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick](http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick) in your browser
   * Quit the webserver by pressing Ctrl-C on the console

One of advantages of the embedded Node.JS + Express web server is that it supports HTTP Byte Serving out of the box, without additional configuration, required for efficient handling of zipped EPUB files.
   
@@ -73,18 +88,20 @@ Follow the same instructions as setting up the [Basic EPUB viewer](#basic-epub-v
Note the `embedded=true` query parameter. This adds a special UI and handling for a smaller screen. See the `embed.html` file in the root of the source tree for a complete example that works with the [Basic EPUB viewer](#basic-epub-viewer) setup.

### Chrome Packaged App
To run the chrome packaged app, you will need to do the following:
To run the chrome packaged app, you will need to initialize your repository and then:

   * install [Node.JS](http://nodejs.org) (details depend on your operating system)
   * install the Grunt build tool: `npm install -g grunt-cli`
   * install the project's dependencies: `npm install`
   * Build the application `grunt chromeApp`
   * Load the app as an unpacked extension from `(project-root)/build/chrome-app`. [Directions here](http://developer.chrome.com/extensions/getstarted.html#unpacked)
   * Open the App in Chrome.
  * Build the application with `grunt chromeApp`
  * Load the app as an unpacked extension from `(project-root)/build/chrome-app`. [Directions here](http://developer.chrome.com/extensions/getstarted.html#unpacked)
  * Open the App in Chrome under chrome://apps

### Custom EPUB management and viewer application
The code that runs the chrome packaged app can also be run on a web server. However, it requires a backend to store and retrieve EPUB files. You would have to implement this yourself. You can see this in action by following the directions to [run a node web server](#clone-and-run-an-embedded-nodejs-web-server) and then navigating to http://localhost:8080/index.html. The backend the example uses is just static files so it doesn't support updating. 

Alternatively you can build a package using either of the following two commands:

	grunt cloudReader
	grunt cloudReaderWithEpub; # Comes with ePubs bundled

### Running the Tests
The viewer project contains some basic regression tests. These are run using [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/home), [Selenium WebdriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs), and [nodeunit](https://github.com/caolan/nodeunit/). The tests target the chrome packaged app. **Assuming you have already followed the steps above to run the packaged app**, these are the additional steps if you want to run the tests
  
