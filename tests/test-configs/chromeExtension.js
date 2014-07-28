module.exports = {
	chromeExtension: true,
	browser: {
		browserName:'chrome', 
		chromeOptions: {'args' : ['--load-extension=' + process.cwd() + '/build/chrome-app']}
	}
};

