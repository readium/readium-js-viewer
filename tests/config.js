
console.log('process.env.npm_package_config_MODE:');
console.log(process.env.npm_package_config_MODE);
if (process.env.npm_package_config_MODE)
		process.env['MODE'] = process.env.npm_package_config_MODE;


console.log('process.env.npm_package_config_USE_SAUCE:');
console.log(process.env.npm_package_config_USE_SAUCE);
if (process.env.npm_package_config_USE_SAUCE)
		process.env['USE_SAUCE'] = process.env.npm_package_config_USE_SAUCE;

console.log("process.env.USE_SAUCE:");
console.log(process.env.USE_SAUCE);

console.log("process.env.MODE:");
console.log(process.env.MODE);

console.log("process.env.GITHUB_TOKEN:");
console.log(process.env.GITHUB_TOKEN);

console.log("process.env.TRAVIS_COMMIT:");
console.log(process.env.TRAVIS_COMMIT);

console.log("process.env.TRAVIS_JOB_NUMBER:");
console.log(process.env.TRAVIS_JOB_NUMBER);

var config;

if (process.env.npm_package_config_MODE == 'chromeApp'){
	config = {
		chromeExtension: true,
		browser: {
			browserName:'chrome',
			chromeOptions: {'args' : ['--load-extension=' + process.cwd() + '/dist/chrome-app']}
		}
	};


	if (process.env.npm_package_config_USE_SAUCE){
		console.log('using sauce');
		var fs = require('fs');

		var buf = fs.readFileSync('dist/Readium.crx');
		var base64Ext = buf.toString('base64');

		delete config.browser.chromeOptions.args;

		config.browser.chromeOptions.extensions = [base64Ext];
		config.browser.version = '42';
		console.log('...');
	}
}
else {
	config = {
		browser : {
			browserName: process.env.npm_package_config_MODE,
		},
		url: 'http://127.0.0.1:8080/index.html'
	};
}

module.exports = config;
