if (process.env.MODE == 'chromeApp')
{
	console.log('deploying crx to github');
	
	var GitHubApi = require("github");
	var https = require('https');
	var fs = require("fs");


	var github = new GitHubApi({
	    // required
	    version: "3.0.0",
	});

	var oauthToken = process.env.GITHUB_TOKEN;
	github.authenticate({
	    type: "oauth",
	    token: oauthToken//process.env.GITHUB_TOKEN
	});

	var dateString = new Date().toJSON();
	var tagName = dateString.replace(/\:/g, '-');
	console.log(tagName);
	var releaseData = {
		tag_name: tagName,
		target_commitish: process.env.TRAVIS_COMMIT,
		owner: 'readium',
		repo: 'readium-js-viewer',
		name: 'Automated build on ' + dateString,
		prerelease: true

	}
	github.releases.createRelease(releaseData, function(error, result){
		if (error){
			console.log(JSON.stringify(error));
			return;
		}
		console.log('release created');
		//console.log(result);

		var releaseId = result.id,
			contentType = 'application/x-chrome-extension',
			fileName = 'build/Readium.crx';

		//var url = 'https://uploads.github.com/repos/readium/readium-js-viewer/releases/' + releaseId + '/assets?name=Readium.crx'


		var stats = fs.statSync(fileName)
	 	var fileSizeInBytes = stats["size"]

		var httpOptions = {
			hostname: 'uploads.github.com',
			port: 443,
			path: '/repos/readium/readium-js-viewer/releases/' + releaseId + '/assets?name=Readium.crx',
			method: 'POST',
			headers: {
				'Content-Type': contentType,
				'Content-Length': fileSizeInBytes,
				'Authorization' : 'token ' + oauthToken
			}
		}
		//console.log(httpOptions);

		var req = https.request(httpOptions, function(res){
			if (res.statusCode < 400){
				console.log('binary uploaded successfully');
			}
			else{
				console.log('error uploading binary: ' + res.statusCode);

			}
		});

		fs.createReadStream(fileName).pipe(req);

		//req.end();



	});
}

