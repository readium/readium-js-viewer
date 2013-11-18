# ReadiumJS Viewer
Welcome to the ReadiumJS viewer web application. This application is the default viewer for Readium.js, a JS library for rendering EPUB files on any modern browser, via any web server. At present, the ReadiumJS viewer only demonstrates a subset of the functionality and flexibility of the underlying Readium.js library. If you'd like to learn more, check out the [ReadiumJS website](http://readium.org/projects/readiumjs), and/or [source on Github](https://github.com/readium/readium-js). ReadiumJS is in early development and it is not yet recommended that you use it for production deployment of EPUB files.

## Getting started
There are a few ways you can try out the sample application. 

### Visit online demo
You can visit the hosted [version](http://readium.github.io/readium-js-viewer).

### Clone into your own web server

To test the ReadiumJS viewer on any static web server: 

   * clone https://github.com/readium/readium-js-viewer.git into a content directory in your web server (e.g. into a "www/readium-js-viewer" folder)
   * for zipped EPUB files support, configure your web server for [HTTP Byte Serving](http://en.wikipedia.org/wiki/Byte_serving) so that Readium.js library can fetch only the necessary portions of a zipped EPUB file that contain content for the displayed page
   * visit yourdomain/readium-js-viewer/index.html and enjoy! (access additional sample EPUB files with the rightmost button)
   * there is no step three! (but it is not recommended to deploy the build-related files onto a publicly-accessible server)

### Clone and run an embedded Node.JS web server

You can also use the Grunt build configuration contained in cloned sources to run an embedded Node.JS + Express web server that serves the demo application:

   * install [Node.JS](http://nodejs.org) (details depend on your operating system)
   * install the Grunt build tool: `npm install -g grunt-cli`
   * install the project's dependencies: `npm install`
   * run the embedded web server using the Grunt build system: `grunt`
   * visit [http://localhost:8080](http://localhost:8080) in your browser
   * when done, on the console press CTRL-C to interrupt Grunt build process and the embedded web server

One of advantages of the embedded Node.JS + Express web server is that it supports HTTP Byte Serving out of the box, without additional configuration, required for efficient handling of zipped EPUB files.
   
### Add additional EPUBs

To add a new EPUB (NOTE: this process will be streamlined in the near future): 

   * unzip any <strong>`(*)`</strong> valid <strong>`(**)`</strong> .epub file (EPUB 2 or EPUB 3 version) in the "epub_content" directory
   * edit "epub_library.json" in that same directory to add a json object with two attributes:
    * "url_to_package_document", which contains the path to the EPUB's package document
           from the server root, which is the simple-epub-3/ directory. 
    * A title for the EPUB, at your
           discretion. 

<strong>`(*)`</strong> NOTE1: This is somewhat aspirational; as Readium.js is still in early development not all EPUB 3 features are yet supported in  - see issues trackers for the consituent sub-projects for more info

<strong>`(**)`</strong> NOTE2: "valid" means EPUBCHeck 3.0 reports zero errors. At this time Readium.js does not have robust error handling
   
### Use the latest Readium.js library version

The Grunt build configuration also contains an optional task that downloads the latest versions of Readium.js library files and places them in the `lib/` directory.

Assuming that you have Grunt and project's dependencies already installed (see above), in order to run this task, execute the following command:

    grunt update-readium

