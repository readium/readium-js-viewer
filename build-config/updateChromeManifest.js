var fs = require('fs'),
    path = require('path');

var manifest = require(path.join(process.cwd(), 'dist/chrome-app/manifest.json')),
    version = require(path.join(process.cwd(), 'build-output/version.json'));

manifest.version = version.readiumJsViewer.chromeVersion;

console.log(manifest.version);

manifest.version = manifest.version.replace(/(.+)(-alpha)(.*)/g, "$1.1$3");
manifest.version = manifest.version.replace(/(.+)(-beta)(.*)/g, "$1.2$3");
manifest.version = manifest.version.replace(/(.+)(-rc)(.*)/g, "$1.3$3");
manifest.version = manifest.version.replace(/[^\d^\.]/g, "");

manifest.version = manifest.version.replace(/(.+)(-.*)/g, "$1");

console.log(manifest.version);

var finish = function(){
    console.log(manifest.name);
    fs.writeFileSync('dist/chrome-app/manifest.json', JSON.stringify(manifest));
};

if (!version.readiumJsViewer.release){
    manifest.name = 'Readium (Development Build)';

    var mediumStream = fs.createReadStream('src/chrome-app/icons/devBuild/medium.png');
    mediumStream.pipe(fs.createWriteStream('dist/chrome-app/icons/medium.png'));
    mediumStream.on('end', function(){
        var largeStream = fs.createReadStream('src/chrome-app/icons/devBuild/large.png');
        largeStream.pipe(fs.createWriteStream('dist/chrome-app/icons/large.png'));
        largeStream.on('end', finish);
    });
}
else{
    finish();
}
