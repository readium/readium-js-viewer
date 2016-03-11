             
results = function () {
    // var rsoSupported = typeof navigator.epubReadingSystem != 'undefined';
    var rso = navigator.epubReadingSystem;
    if (!rso) {
        //bail out, all tests default to fail in the html
        return;
    }
    
    var ele = document.getElementById('rso-010-result')
    if (ele)
        ele.innerHTML = 'PASS';
    
    var name = navigator.epubReadingSystem.name;
    if (name) {
        ele = document.getElementById('rso-020-result');
        if (ele) ele.innerHTML = "The name field is '" + name + "'.";
    }
    
    var version = navigator.epubReadingSystem.version;
    if (version) {
        ele = document.getElementById('rso-030-result');
        if (ele) ele.innerHTML = "The version field is '" + version + "'.";
    }
    
    var layoutStyle = navigator.epubReadingSystem.layoutStyle;
    if (layoutStyle) {
        ele = document.getElementById('rso-040-result');
        if (ele) ele.innerHTML = "The layoutStyle field is '" + layoutStyle + "'.";
    }
    
    var features10 = [ "dom-manipulation", "layout-changes", "touch-events",
    "mouse-events", "keyboard-events", "spine-scripting"];
    
    for (var i = 0; i < features10.length; i++) {
        var feature = features10[i];
        var ret = navigator.epubReadingSystem.hasFeature(feature);
        ele = document.getElementById(feature);
        if (ele) ele.innerHTML = ret;
    }
}
results();