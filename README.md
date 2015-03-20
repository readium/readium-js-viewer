# ReadiumJS Viewer
Welcome to the ReadiumJS viewer project. This project encapsulates several applications.

  * A basic EPUB viewer
  * A Chrome packaged app for managing an EPUB library and reading EPUBs.
  * A generic EPUB library management and viewer application that requires you to implement your own backend

The viewer is the default viewer for Readium.js, a JS library for rendering EPUB files on any modern browser, via any web server. If you'd like to learn more, check out the ReadiumJS website](http://readium.org/projects/readiumjs), and/or [source on Github](https://github.com/readium/readium-js). ReadiumJS is in early development and it is not yet recommended that you use it for production deployment of EPUB files.

## Getting started
  * [Basic EPUB viewer](#basic-epub-viewer)
  * [Embeddable EPUB Viewer](#embeddable-epub-viewer)
  * [Chrome packaged app](#chrome-packaged-app)
  * [Custom EPUB management system](#custom-epub-management-and-viewer-application)
  * [Running the Tests](#running-the-tests)

### Initialize your repository

ReadiumJS uses git submodules to embed other repositories and it uses [Node.js](http://nodejs.org/) and associated tools and libraries. Do the following steps to be up and running:

  * Install [Node.js](http://nodejs.org) (details depend on your operating system)
  * Install the Grunt build tool using the command line: `npm install -g grunt-cli` (requires at least version 0.4.4)
  * From the command line run `git clone https://github.com/readium/readium-js-viewer.git`
  * From the command line run `cd readium-js-viewer`
  * From the command line run `git submodule update --init --recursive`
  * install Node.JS
  * From the command line run `npm install -g grunt-cli`
  * From the command line run `npm install` (in the readium-js-viewer directory)
  * From the command line run `cd readium-js`
  * From the command line run `npm install` (a second time in the readium-js directory)
  * From the command line run `cd ..`
  * You should now be able to run the grunt commands specified below.

### Basic EPUB Viewer

#### Visit online demo
~~You can visit the hosted [version](http://readium.github.io/readium-js-viewer).~~ Currently running an older version

#### Clone into your own web server

To test the ReadiumJS viewer on any static web server: 

   * Perform the above steps and clone https://github.com/readium/readium-js-viewer.git into a content directory in your web server (e.g. into a "www/readium-js-viewer" folder)
   * For zipped EPUB files support, configure your web server for [HTTP Byte Serving](http://en.wikipedia.org/wiki/Byte_serving) so that Readium.js library can fetch only the necessary portions of a zipped EPUB file that contain content for the displayed page
   * Visit yourdomain/readium-js-viewer/simpleviewer.html?epub=epub_content/moby_dick and enjoy! 
   * There is no step three! (but it is not recommended to deploy the build-related files onto a publicly-accessible server)

#### Clone and run an embedded Node.JS web server

You can also use the Grunt build configuration contained in cloned sources to run an embedded Node.JS + Express web server that serves the demo application:

  * Initialize your repository as described above
  * Run the embedded webserver by running `grunt` (this is the default task)
  * Visit [http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick](http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick) in your browser
   * Quit the webserver by pressing Ctrl-C on the console

One of advantages of the embedded Node.JS + Express web server is that it supports HTTP Byte Serving out of the box, without additional configuration, required for efficient handling of zipped EPUB files.
   
#### Add additional EPUBs

The viewer uses the `epub` url query parameter to find the ebook to display. The project comes with several epubs already (look under the epub_content directory).  To add a new EPUB simply unzip an epub to be anywhere on the same server as the viewer. Example steps: 

   * unzip any <strong>`(*)`</strong> valid <strong>`(**)`</strong> .epub file (EPUB 2 or EPUB 3 version) in the "epub_content" directory
   * navigate to http://localhost:8080/simpleviewer.html?epub=epub_content/new_book_directory

<strong>`(*)`</strong> NOTE1: This is somewhat aspirational; as Readium.js is still in early development not all EPUB 3 features are yet supported in  - see issues trackers for the consituent sub-projects for more info

<strong>`(**)`</strong> NOTE2: "valid" means EPUBCHeck 3.0 reports zero errors. At this time Readium.js does not have robust error handling
   
#### Use the latest Readium.js library version

The Grunt build configuration also contains an optional task that builds the latest versions of Readium.js library files and places them in the `lib/` directory.

Assuming that you have Grunt and project's dependencies already installed (see above), in order to run this task, execute the following command:

    grunt update-readium

### Embeddable EPUB Viewer

You can host an embeddable epub viewer using the same instructions as the [Basic EPUB viewer](#basic-epub-viewer). For example, if you wanted to add epub content to a blog or similar.

Follow the same instructions as setting up the [Basic EPUB viewer](#basic-epub-viewer) then embed the epub reader using an iframe like so

```html
<iframe width="600" height="400" src="http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick&amp;embedded=true" style="border:1px #ddd solid;" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe>
```

Note the `embedded=true` query parameter. This adds a special UI and handling for a smaller screen. See the `embed.html` file in the root of the source tree for a complete example that works with the [Basic EPUB viewer](#basic-epub-viewer) setup.

### Chrome Packaged App
To run the chrome packaged app, you will need to initialize your repository and then:

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
  
   * Install [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/home) for your platform and ensure it's on your system path somewhere.
   * Install the Google Chrome browser or have it already installed in the default install location for your platform.
   * run `grunt test`

Licensing info
----------------
Licensing information can be found in the file license.txt in the root of the repo, as well as in the source code itself.
