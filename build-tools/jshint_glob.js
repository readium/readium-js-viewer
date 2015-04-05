
var args = process.argv.slice(2);

console.log("jshint.js arguments: ");
console.log(args);


var glob = require("glob");
var jshint = require("jshint");
var fs = require('fs');

var lint = function(files, i, ok) {
	if (i >= files.length) {
		if (!ok) {
			process.exit(2);
		}
		return;
	}
	
	var file = files[i];

	fs.readFile(file, function(err, fileContents) {
		
		if(err) {
			console.log(err);
			lint(files, ++i, ok);
			return;
		}
		
		var okay = jshint.JSHINT(fileContents.toString());
		if (!okay) {
			ok = false;
			console.log("!!! " + file);
			
			var out = jshint.JSHINT.data();
			var errors = out.errors;

			for(var j = 0; j < errors.length; j++) {
				console.log(errors[j].line + ':' + errors[j].character + ' ' + errors[j].reason + ' (' + errors[j].evidence + ')');
			}
			
			process.exit(2);
		} else {
			console.log("... " + file);
		}
		
		lint(files, ++i, ok);
	});
};

glob(args[0], {}, function (er, files) {
	if (er) console.log(er);
	
	lint(files, 0, true);
});