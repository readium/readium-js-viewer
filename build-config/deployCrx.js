var path = require('path');
var fs = require("fs");

var versionPath = path.join(process.cwd(), 'build-output/version.json');
var versionStr = fs.readFileSync(versionPath, {encoding: 'utf-8'});
var versionJson = JSON.parse(versionStr);
if (versionJson.readiumJsViewer.branch !== "develop") {
    console.log("Branch [" + versionJson.readiumJsViewer.branch + "] => skipping upload CRX, etc. to GitHub release.");
    return;
}


if (!process.env.GITHUB_TOKEN)//process.env.MODE == 'chromeApp')
{
    console.log("process.env.GITHUB_TOKEN not defined => skipping upload CRX, etc. to GitHub release.");
    return;
}

var owner = 'readium';
var repo = 'readium-js-viewer';

console.log('deploying crx to github');

var GitHubApi = require("github");
var https = require('https');

var github = new GitHubApi({
    // required
    version: "3.0.0"
});

var packagePath = path.join(process.cwd(), 'package.json');
var packageStr = fs.readFileSync(packagePath, {encoding: 'utf-8'});
var packageObj = JSON.parse(packageStr);
var version = packageObj.version;

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
    
    github.repos.getReleases({user: owner, repo: repo}, function(error, releases){
        for (var i = 0; i < releases.length; i++){
            if (releases[i].tag_name == version){
                break;
            }
        }
        if (i < releases.length){
            console.log('found existing release, deleting');
            github.repos.deleteRelease({user: owner, repo: repo, id: releases[i].id}, function(error, response){
                if (error){
                    console.error(JSON.stringify(error));
                    return;
                }
                createRelease();
            });
        }
        else{
            createRelease();
        }
    });
};

var createRelease = function(){

    var upload = function(releaseId, fileName, filePath, contentType, error, success) {
        
        console.log("UPLOAD TO RELEASE: [" + fileName + "] from [" + filePath + "] (" + contentType + ")");
        
        //var url = 'https://uploads.github.com/repos/readium/readium-js-viewer/releases/' + releaseId + '/assets?name=Readium.crx'

        var stats = fs.statSync(filePath);
        var fileSizeInBytes = stats["size"];

        var httpOptions = {
            hostname: 'uploads.github.com',
            port: 443,
            path: '/repos/'+ owner + '/' + repo + '/releases/' + releaseId + '/assets?name=' + fileName,
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileSizeInBytes,
                'Authorization' : 'token ' + oauthToken
            }
        };
        //console.log(httpOptions);

        var req = https.request(httpOptions, function(res){
            if (res.statusCode < 400){
                console.log('binary uploaded successfully');
                if (success) success();
            }
            else{
                console.log('error uploading binary: ' + res.statusCode);
                if (error) error(res.statusCode);
            }
        });

        fs.createReadStream(filePath).pipe(req);

        //req.end();
    };
    
    
    
    var releaseDate = new Date().toUTCString();
    console.log("BUILD DATE/TIME: "+releaseDate);
    
    console.log("BUILD tag: "+version);
    
    console.log("TRAVIS_BRANCH: "+process.env.TRAVIS_BRANCH);
    console.log("TRAVIS_COMMIT: "+process.env.TRAVIS_COMMIT);
    
    console.log("TRAVIS_JOB_NUMBER: "+process.env.TRAVIS_JOB_NUMBER);
    console.log("TRAVIS_BUILD_ID: "+process.env.TRAVIS_BUILD_ID);
    console.log("TRAVIS_BUILD_NUMBER: "+process.env.TRAVIS_BUILD_NUMBER);
    
    var releaseTitle = "Pre-release v" + version + " ('develop' branch)";
    var releaseDescription = "Automated build on " + releaseDate + "\n" +
    "TravisCI ["+process.env.TRAVIS_BUILD_NUMBER+"] https://travis-ci.org/readium/readium-js-viewer/builds/" + process.env.TRAVIS_BUILD_ID + "\n" +
    "\n\n\nCloud / web reader app (main deployment at Firebase):\nhttps://readium.firebaseapp.com\n\nCloud / web reader app (secondary deployment at Surge):\nhttps://readium.surge.sh/?epubs=https%3A%2F%2Freadium.firebaseapp.com%2Fepub_content%2Fepub_library.opds\n\n\nDO NOT DOWNLOAD THE SOURCE CODE LINKS BELOW (ZIP AND TAR.GZ files), AS GITHUB DOES NOT INCLUDE SUBMODULES!";
    
    
    var releaseData = {
        tag_name: version,
        //target_commitish: process.env.TRAVIS_COMMIT,
        user: owner,
        repo: repo,
        name: releaseTitle,
        body: releaseDescription,
        prerelease: true
    };
    
    github.repos.createRelease(releaseData, function(error, result){
        if (error){
            console.error(JSON.stringify(error));
            return;
        }
        console.log('release created');
        //console.log(result);

        var releaseId = result.id;
        
        var fileName = 'Readium.crx';
        var filePath = path.join(process.cwd(), 'dist/' + fileName);
        var contentType = 'application/x-chrome-extension';
        upload(releaseId, fileName, filePath, contentType, undefined, function() {

            fileName = 'Readium_cloud-reader.zip';
            filePath = path.join(process.cwd(), 'dist/' + fileName);
            contentType = 'application/zip';
            upload(releaseId, fileName, filePath, contentType, undefined, function() {

                fileName = 'Readium_cloud-reader-lite.zip';
                filePath = path.join(process.cwd(), 'dist/' + fileName);
                contentType = 'application/zip';
                upload(releaseId, fileName, filePath, contentType, undefined, undefined); 
            }); 
        });
    });
};

var tagRef = {
    user: owner,
    repo: repo,
    ref: 'tags/' + version
};

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
