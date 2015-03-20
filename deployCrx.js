if (true)//process.env.MODE == 'chromeApp')
{

	var owner = 'readium',
		repo = 'readium-js-viewer';

	console.log('deploying crx to github');
	
	var GitHubApi = require("github");
	var https = require('https');
	var fs = require("fs");


	var github = new GitHubApi({
	    // required
	    version: "3.0.0",
	});

	var packageStr = fs.readFileSync('package.json', {encoding: 'utf-8'}),
		packageObj = JSON.parse(packageStr),
		version = packageObj.version;




	var oauthToken = process.env.GITHUB_TOKEN;
	github.authenticate({
	    type: "oauth",
	    token: oauthToken//process.env.GITHUB_TOKEN
	});
	var deleteOldRelease = function(error, response){
		if (error){
			console.error(JSON.stringify(error));
			return;
		}
		github.releases.listReleases({owner: owner, repo: repo}, function(error, releases){
			for (var i = 0; i < releases.length; i++){
				if (releases[i].tag_name == version){
					break;
				}
			}
			if (i < releases.length){
				console.log('found existing release, deleting');
				github.releases.deleteRelease({owner: owner, repo: repo, id: releases[i].id}, function(error, response){
					if (error){
						console.error(JSON.stringify(error));
						return;
					}
					createRelease();
				});
			}
			else{
				createRelease()
			}
		})
	}
	var createRelease = function(){
		

		var releaseData = {
			tag_name: version,
			//target_commitish: process.env.TRAVIS_COMMIT,
			owner: owner,
			repo: repo,
			name: 'Automated build on ' + new Date().toString(),
			prerelease: true

		}
		github.releases.createRelease(releaseData, function(error, result){
			if (error){
				console.error(JSON.stringify(error));
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
				path: '/repos/'+ owner + '/' + repo + '/releases/' + releaseId + '/assets?name=Readium.crx',
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
	
	var tagRef = {
		user: owner,
		repo: repo,
		ref: 'tags/' + version
	}
	github.gitdata.getReference(tagRef, function(error, result){
		
		var func;
		tagRef.sha = process.env.TRAVIS_COMMIT;
		if (error){
			console.log(version + ' tag does not exist, creating.');
			tagRef.ref = 'refs/' + tagRef.ref;
			github.gitdata.createReference(tagRef, deleteOldRelease);
		}	
		else{
			console.log('updating previous "' + version + '" release tag');
			github.gitdata.updateReference(tagRef, deleteOldRelease);
		}
		
	});


	
	
}

