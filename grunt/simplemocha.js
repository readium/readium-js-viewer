'use strict';

module.exports = function(grunt) {
	return {
		options: {
	      timeout: 60000,
	      ui: 'bdd',
	      reporter: 'XUnit'
	    },

	    chromeApp: { src: ['build/tests/chrome-app/tests.js'] }
	}
}