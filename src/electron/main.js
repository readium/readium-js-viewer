
var app = require('app');
var BrowserWindow = require('browser-window');

var name = app.getName();
console.log(name);

//require('crash-reporter').start();

// global reference (keep alive, prevents garbage collection)
var mainWindow = null;

app.on('window-all-closed', function() {
  // OSX Cmd+Q
  //if (process.platform != 'darwin')
    app.quit();
});

app.on('open-file', function(event, path) {
    event.preventDefault();
});

app.on('browser-window-blur', function() {
    
});

app.on('browser-window-focus', function() {
    
});

app.on('ready', function() {

  mainWindow = new BrowserWindow({width: 1024, height: 768, "node-integration": false});

    // CTRL SHIFT i
  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    // free reference (ensures garbage collection))
    mainWindow = null;
  });
  
  //mainWindow.loadUrl('file://' + __dirname + '/../../dev/index_RequireJS_no-optimize.html');
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
 mainWindow.show();
});





var template = [
//   {
//     label: 'Edit',
//     submenu: [
//       {
//         label: 'Undo',
//         accelerator: 'CmdOrCtrl+Z',
//         role: 'undo'
//       },
//       {
//         label: 'Redo',
//         accelerator: 'Shift+CmdOrCtrl+Z',
//         role: 'redo'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Cut',
//         accelerator: 'CmdOrCtrl+X',
//         role: 'cut'
//       },
//       {
//         label: 'Copy',
//         accelerator: 'CmdOrCtrl+C',
//         role: 'copy'
//       },
//       {
//         label: 'Paste',
//         accelerator: 'CmdOrCtrl+V',
//         role: 'paste'
//       },
//       {
//         label: 'Select All',
//         accelerator: 'CmdOrCtrl+A',
//         role: 'selectall'
//       },
//     ]
//   },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
//   {
//     label: 'Window',
//     role: 'window',
//     submenu: [
//       {
//         label: 'Minimize',
//         accelerator: 'CmdOrCtrl+M',
//         role: 'minimize'
//       },
//       {
//         label: 'Close',
//         accelerator: 'CmdOrCtrl+W',
//         role: 'close'
//       },
//     ]
//   },
//   {
//     label: 'Help',
//     role: 'help',
//     submenu: [
//       {
//         label: 'http://readium.org',
//         click: function() { require('shell').openExternal('http://readium.org') }
//       },
//     ]
//   }
];

if (process.platform == 'darwin') {
  var name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  });
//   // Window menu.
//   template[3].submenu.push(
//     {
//       type: 'separator'
//     },
//     {
//       label: 'Bring All to Front',
//       role: 'front'
//     }
//   );
}

var Menu = require('menu');
var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);