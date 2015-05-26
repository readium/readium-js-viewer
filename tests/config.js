var config;


console.log('process.env.MODE:');
console.log(process.env.MODE);


console.log('process.env.USE_SAUCE:');
console.log(process.env.USE_SAUCE);


if (process.env.MODE == 'chromeApp'){
	config = {
		chromeExtension: true,
		browser: {
			browserName:'chrome',
			chromeOptions: {'args' : ['--load-extension=' + process.cwd() + '/dist/chrome-app']}
		}
	};


	if (process.env.USE_SAUCE){
		console.log('using sauce')
		var fs = require('fs');

		var buf = fs.readFileSync('dist/Readium.crx');
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
		url: 'http://127.0.0.1:8080'
	};
}

module.exports = config;
