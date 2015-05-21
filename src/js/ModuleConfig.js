define(['module'], function(module) {

		var config = module.config();
		return {
			'imagePathPrefix': config.imagePathPrefix || "",
			
			'epubLibraryPath': config.epubLibraryPath || "",

			'canHandleUrl': config.canHandleUrl || false,
			'canHandleDirectory': config.canHandleDirectory || false,


			'epubReadingSystemUrl': config.epubReadingSystemUrl || "/EPUBREADINGSYSTEM.js",

			'workerUrl': config.workerUrl || "/READIUMWORKER.js",

			'annotationCSSUrl': config.annotationCSSUrl || "/ANNOTATIONS.css",
			'mathJaxUrl': config.mathJaxUrl || "/MATHJAX.js",
			'jsLibRoot': config.jsLibRoot || "/ZIPJS/",

			'useSimpleLoader': config.useSimpleLoader || false

		};
});
