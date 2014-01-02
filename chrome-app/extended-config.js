require.config({
	config : {
        'workers/WorkerProxy' : {'workerUrl' : '/scripts/readium-worker.js'},
        'EpubLibraryManager' : {
        							'canHandleUrl' : true, 
        							'canHandleDirectory' : true
    						   }
    },
})