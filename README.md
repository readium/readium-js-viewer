# readium-js-viewer

**EPUB reader written in HTML, CSS and Javascript.**

This Readium software component implements the Readium Chrome extension / app for offline reading ( https://chrome.google.com/webstore/detail/readium/fepbnnnkkadjhjahcafoaglimekefifl ),
and the "cloud reader" for online e-books ( http://readium-cloudreader.divshot.io ).

Please see https://github.com/readium/readium-shared-js for more information about the underlying rendering engine.

## License

**BSD-3-Clause** ( http://opensource.org/licenses/BSD-3-Clause )

See license.txt ( https://github.com/readium/readium-js-viewer/blob/develop/license.txt )


## Prerequisites

* A decent terminal. On Windows, GitShell works great ( http://git-scm.com ), GitBash works too ( https://msysgit.github.io ), and Cygwin adds useful commands ( https://www.cygwin.com ).
* NodeJS ( https://nodejs.org )


## Development

**Initial setup:**

* `git submodule update --init --recursive` to ensure that the readium-js-viewer chain of dependencies is initialised (readium-js, readium-shared-js and readium-cfi-js)
* `npm run prepare` (to perform required preliminary tasks, like patching code before building)

Note that the above command executes the following:

* `npm install` (to download dependencies defined in `package.json` ... note that the `--production` option can be used to avoid downloading development dependencies, for example when testing only the pre-built `build-output` folder contents)
* `npm update` (to make sure that the dependency tree is up to date)

**Git branch initialization:**

* Simply `cd` inside each repository / submodule, and manually enter the desired branch name: `git checkout BRANCH_NAME` (Git should automatically track the corresponding branch in the 'origin' remote).


Otherwise, the commands below automate some of the process (this requires a recent Bash shell scripted command line environment):

* `for remote in `` `git branch -r | grep -v \> | grep -v master` ``; do git branch --track ${remote#origin/} $remote; done` to ensure that all Git 'origin' remotes are tracked by local branches.
* `git checkout `` `git for-each-ref --format="%(refname:short) %(objectname)" 'refs/heads/' | grep $(git rev-parse HEAD) | cut -d " " -f 1` `` ` to ensure that Git checks-out actual branch names (as by default Git initializes submodules to match their registered Git SHA1 commit, but in detached HEAD state)

(repeat for each repository / submodule)


**Typical workflow:**

No RequireJS optimization:

* `npm run http` (to launch an http server, automatically opens a web browser instance to the HTML files in the `dev` folder)
* Hack away! (e.g. source code in the `src/js` folder)
* Press F5 (refresh / reload) in the web browser

Or to use optimized Javascript bundles (single or multiple):

* `npm run build` (to update the RequireJS bundles in the build output folder)
* `npm run http:watch` (to launch an http server, automatically opens a web browser instance to the HTML files in the `dev` folder)
* `npm run http` (same as above, but without watching for file changes (no automatic rebuild))

And finally to update the distribution packages:

* `npm run dist` (Chrome extension and cloud reader)
* `npm run dist:all` (same as above, plus the "lite" cloud reader without the ebook library feature)

Note that the `dist` build task only creates the 'single' RequireJS bundle (not the 'single-LITE' version, and not the 'multiple' one). This is to speed-up the build process at development / testing time. The `dist:all` task builds everything (useful to update the NPM package).

## NPM (Node Package Manager)

All packages "owned" and maintained by the Readium Foundation are listed here: https://www.npmjs.com/~readium

Note that although Node and NPM natively use the CommonJS format, Readium modules are currently only defined as AMD (RequireJS).
This explains why Browserify ( http://browserify.org ) is not used by this Readium project.
More information at http://requirejs.org/docs/commonjs.html and http://requirejs.org/docs/node.html

* Make sure `npm install readium-js-viewer` completes successfully ( https://www.npmjs.com/package/readium-js-viewer )
* Execute `npm run http`, which opens a web browser to a basic RequireJS bootstrapper located in the `dev` folder (this is *not* a production-ready minified application)

Note: the `--dev` option after `npm install readium-js-viewer` can be used to force the download of development dependencies,
but this is kind of pointless as the code source and RequireJS build configuration files are missing.
See below if you need to hack the code.


## How to use (RequireJS bundles / AMD modules)

The `build-output` directory contains common CSS styles, as well as two distinct folders:

### Single bundle

The `_single-bundle` folder contains `readium-js-viewer_all.js` (and its associated source-map file, as well as a RequireJS bundle index file (which isn't actually needed at runtime, so here just as a reference)),
which aggregates all the required code (external library dependencies included, such as Underscore, jQuery, etc.),
as well as the "Almond" lightweight AMD loader ( https://github.com/jrburke/almond ).

This means that the full RequireJS library ( http://requirejs.org ) is not actually needed to bootstrap the AMD modules at runtime,
as demonstrated by the HTML file in the `dev` folder (trimmed for brevity):

```html
<html>
<head>

<!-- main code bundle, which includes its own Almond AMD loader (no need for the full RequireJS library) -->
<script type="text/javascript" src="../build-output/_single-bundle/readium-js-viewer_all.js"> </script>

<!-- index.js calls into the above library -->
<script type="text/javascript" src="./index.js"> </script>

</head>
<body>
<div id="viewport"> </div>
</body>
</html>
```

### Multiple bundles


The `_multiple-bundles` folder contains several Javascript bundles (and their respective source-map files, as well as RequireJS bundle index files):


* `readium-external-libs.js`: aggregated library dependencies (e.g. Underscore, jQuery, etc.)
* `readium-shared-js.js`: shared Readium code (basically, equivalent to the `js` folder of the "readium-shared-js" submodule)
* `readium-js.js`: the core Readium code (basically, equivalent to the `js` folder of the "readium-js" submodule)
* `readium-js-viewer.js`: this Readium code (mainly, the contents of the `js` folder)
* `readium-plugin-example.js`: simple plugin demo
* `readium-plugin-annotations.js`: the annotation plugin (DOM selection + highlight), which bundle actually contains the "Backbone" library, as this dependency is not already included in the "external libs" bundle.
)

In addition, the folder contains the full `RequireJS.js` library ( http://requirejs.org ), as the above bundles do no include the lightweight "Almond" AMD loader ( https://github.com/jrburke/almond ).

Usage is demonstrated by the HTML file in the `dev` folder (trimmed for brevity):

```html
<html>
<head>

<!-- full RequireJS library -->
<script type="text/javascript" src="../build-output/_multiple-bundles/RequireJS.js"> </script>



<!-- individual bundles: -->

<!-- readium CFI library -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-cfi-js.js"> </script>

<!-- external libraries -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-external-libs.js"> </script>

<!-- readium itself -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-shared-js.js"> </script>

<!-- simple example plugin -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-plugin-example.js"> </script>

<!-- annotations plugin -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-plugin-annotations.js"> </script>

<!-- readium js -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-js.js"> </script>

<!-- readium js viewer -->
<script type="text/javascript" src="../build-output/_multiple-bundles/readium-js-viewer.js"> </script>


<!-- index.js calls into the above libraries -->
<script type="text/javascript" src="./index.js"> </script>

</head>
<body>
<div id="viewport"> </div>
</body>
</html>
```


Note how the "external libs" set of AMD modules can be explicitly described using the `bundles` RequireJS configuration directive
(this eliminates the apparent opacity of such as large container of library dependencies):


```html

<script type="text/javascript">
requirejs.config({
    baseUrl: '../build-output/_multiple-bundles'
});
</script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-cfi-js.js.bundles.js"> </script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-external-libs.js.bundles.js"> </script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-shared-js.js.bundles.js"> </script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-plugin-example.js.bundles.js"> </script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-plugin-annotations.js.bundles.js"> </script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-js.js.bundles.js"> </script>

<script type="text/javascript" src="../build-output/_multiple-bundles/readium-js-viewer.js.bundles.js"> </script>

```




## CSON vs. JSON (package.json)

CSON = CoffeeScript-Object-Notation ( https://github.com/bevry/cson )

Running the command `npm run cson2json` will re-generate the `package.json` JSON file.
For more information, see comments in the master `package.cson` CSON file.

Why CSON? Because it is a lot more readable than JSON, and therefore easier to maintain.
The syntax is not only less verbose (separators, etc.), more importantly it allows *comments* and *line breaking*!

Although these benefits are not so critical for basic "package" definitions,
here `package.cson/json` declares relatively intricate `script` tasks that are used in the development workflow.
`npm run SCRIPT_NAME` offers a lightweight technique to handle most build tasks,
as NPM CLI utilities are available to perform cross-platform operations (agnostic to the actual command line interface / shell).
For more complex build processes, Grunt / Gulp can be used, but these build systems do not necessarily offer the most readable / maintainable options.

Downside: DO NOT invoke `npm init` or `npm install --save` `--save-dev` `--save-optional`,
as this would overwrite / update the JSON, not the master CSON!
