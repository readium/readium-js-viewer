chrome.app.runtime.onLaunched.addListener(function() {

    chrome.storage.local.get(null, function(data) {
        chromeStorageObj = data || {};
        chrome.app.window.create('index.html', {
            'width': 1200,
            'height': 900
        }, function(appWindow) {
            appWindow.contentWindow.chromeStorageObj = chromeStorageObj;
            appWindow.maximize();

        });
    });

});