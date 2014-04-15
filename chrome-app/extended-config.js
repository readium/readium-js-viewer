require.config({
	config : {
        'workers/WorkerProxy' : {'workerUrl' : '/scripts/readium-worker.js'},
        'EpubLibraryManager' : {
        							'canHandleUrl' : true, 
        							'canHandleDirectory' : true
    						   },
    	'EpubReader' : {
    		'annotationCssUrl' : self.location.origin  + '/css/annotations.css',
    		'mathJaxUrl' : self.location.origin  + '/scripts/mathjax/MathJax.js?config=readium-iframe'
    	}
    }
});