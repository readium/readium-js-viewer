# Readium.js demo application
Welcome to the Readium.js demonstration application. This application is designed to provide a simple demonstration of Readium.js. At present, it only demonstrates a subset of the functionality and flexibility of Readium.js. If you'd like to learn more, check out the [Readium.js website](http://readium.github.io/Readium-Web-Components/), and/or [source on Github](https://github.com/readium/Readium-Web-Components)!

## To get started: 

* You can visit the hosted [version](http://readium.github.io/readium-viewer-demo1).

* To get a version of this application to run locally you'll need a few tools (this is OSX-specific): 
    * Ruby
    * RVM
    * Bundler
    * Rake

If you've got those ready to go, follow these steps:
    * Download the source from Github
    * Run "bundle" at the command line
    * Run "rake server" at the command line
    * Point your browser to "localhost:3000"

## Adding additional EPUBs

To add a new EPUB: 
   * unzip your .epub file in the /simple-epub-3/epub_content directory
   * open up "epub_library.json"
   * add a json object with two attributes. 
        * "url_to_package_document", which contains the path to the EPUB's package document
           from the server root, which is the simple-epub-3/ directory. 
        * A title for the EPUB, at your
           discretion. 
   * Start up your server, or run "rake server" at the command line and access your sample from the toolbar (the rightmost button)!