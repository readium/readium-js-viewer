
var app = require('app');
var BrowserWindow = require('browser-window');

//require('crash-reporter').start();

// global reference (keep alive, prevents garbage collection)
var mainWindow = null;

app.on('window-all-closed', function() {
  // OSX Cmd+Q
  //if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {

  mainWindow = new BrowserWindow({width: 1024, height: 768, "node-integration": false});

  //mainWindow.loadUrl('file://' + __dirname + '/../../dev/index_RequireJS_no-optimize.html');
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    // free reference (ensures garbage collection))
    mainWindow = null;
  });
});
