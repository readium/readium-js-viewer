// chrome.app.runtime.onLaunched.addListener(function() {

//     chrome.storage.local.get(null, function(data) {
//         chromeStorageObj = data || {};
//         chrome.app.window.create('index.html', {
//             'width': 1200,
//             'height': 900
//         }, function(appWindow) {
//             appWindow.contentWindow.chromeStorageObj = chromeStorageObj;
//             appWindow.maximize();

//         });
//     });

// });

var db = openDatabase('records', '1.0.0', 'records', 65536);

if (db){
    db.transaction(function(t){
        t.executeSql("select count(*) as c from records", [], function(xxx, results){
            if (results.rows.length){
                var count = results.rows.item(0).c;
                if (count > 0){
                    chrome.storage.local.set({needsMigration: "true"}, function(){});
                }
            }
        });
    });
}