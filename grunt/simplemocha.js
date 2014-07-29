'use strict';

module.exports = function(grunt) {
	return {
		options: {
	      timeout: 60000,
	      ui: 'bdd'
	    },

	    all: { src: ['tests/tests.js'] }
	}
}