var config;




if (process.env.MODE == 'chromeApp'){
	config = {
		chromeExtension: true,
		browser: {
			browserName:'chrome', 
			chromeOptions: {'args' : ['--load-extension=' + process.cwd() + '/build/chrome-app']}
		}
	};


	if (process.env.USE_SAUCE){
		console.log('using sauce')
		var fs = require('fs');

		var buf = fs.readFileSync('build/Readium.crx');
		var base64Ext = buf.toString('base64');

		delete config.browser.chromeOptions.args;

		config.browser.chromeOptions.extensions = [base64Ext];
		config.browser.version = '36';

	}
}
else {
	config = {
		browser : {
			browserName: process.env.MODE,
		},
		url: 'http://localhost:8080/index.html'
	};
}

module.exports = config; 