'use strict';

module.exports = function(grunt) {
	return {
		options: {
	      timeout: 60000,
	      ui: 'bdd',
	      reporter: 'XUnit'
	    },

	    all: { src: ['tests/tests.js'] }
	}
}