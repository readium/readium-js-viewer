
var fs = require('fs');
fs.exists(process.cwd() + '/open_webbrowser.js',
function(exists) {
    if (!exists) {
        console.log('web browser already open.');
        process.exit(-1);
    } else {
        console.log('web browser opening...');
        
        // var i = 0;
        // var MAX = 10;
        // while (i < MAX && !fs.existsSync(process.cwd() + '/dist/index.html')) {
            // i++;
            // console.log('.');
        // }
        
        // console.log('./dist/index.html is ready.');
    }
});