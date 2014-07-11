//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

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