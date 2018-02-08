# Using the Cloud / Web Reader to test EPUB publications

The Readium Chrome App has become a popular choice to test/check EPUB2 and EPUB3 publications on desktop platforms (Windows, MacOS, Linux, and ChromeOS). Unfortunately, Google is deprecating the "apps" framework in the Chrome web browser, so the Readium app will soon be removed from the Chrome Web Store (during the first half of 2018). That being said, even if the Readium Chrome App remained available, there would be other limitations inherent to the Chrome "apps" model (such as Content Security Policy restrictions on inline Javascript, which breaks a number of existing interactive EPUB3 publications).

Thankfully, the Readium Cloud / Web Reader shares the majority of its codebase with the Chrome App, so they are functionally equivalent apart from how EPUB files are stored and accessed. The Readium Cloud / Web Reader can therefore also be used to test EPUB2 and EPUB3 publications, with the benefit of cross-browser support (not just Chrome). As this is a reading system designed to be deployed on the web (publications uploaded in the "cloud"), the workflow is slightly more complicated. It is however possible to configure it for "offline" use, by running a local web server. Follow these instructions:

1) Make sure NodeJS is installed on your computer ( https://nodejs.org )
2) Open a command window, and type or copy/paste: `npm install -g http-server`
3) Download the file `Readium_cloud-reader-lite.zip` from https://github.com/readium/readium-js-viewer/releases
4) Unzip `Readium_cloud-reader-lite.zip` on your filesystem, for instance: `/PATH/TO/FOLDER/cloud-reader-lite/`
5) In the command window, type `cd /PATH/TO/FOLDER/cloud-reader-lite/` to move into this new folder
6) Open the filesystem explorer and navigate to `/PATH/TO/FOLDER/cloud-reader-lite/`
7) Create a subfolder called `epub_content` (full path: `/PATH/TO/FOLDER/cloud-reader-lite/epub_content`
8) Copy publications into this folder, for example `MY_BOOK.epub`
9) Ideally, unzip the `MY_BOOK.epub` file (rename it with the `.zip` extension first), so that the publication contents reside in the `epub_content/MY_BOOK/` folder
10) Now back into the command window, invoke the following: `http-server -a 127.0.0.1 -p 8080 -c-1 .`
11) ... and open your web browser to: `http://127.0.0.1:8080/?epub=epub_content/MY_BOOK` (change `MY_BOOK` to your publication filename). If you skipped step (9), change `MY_BOOK` to `MY_BOOK.epub`, but remember: for best results publications should be extracted / unzipped first (because of performance / memory issues, and broken features such as audio and video playback)
12) Optionally, you may also drag and drop EPUB files onto the browser window, but once again: ideally publications should be extracted / unzipped beforehand!
13) In fact, for quick-testing simple and small EPUBs, you can also drag and drop files on the browser window at https://readium.firebaseapp.com (but once again: not the recommended practice!)

To conclude, note that a new desktop app is being developed, as part of the Readium2 project. This should be ready for public use later in 2018.
