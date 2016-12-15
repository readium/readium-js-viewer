var _fontFaces =
[
    {
        displayName: "Open Dyslexic",
        fontFamily: "OpenDyslexic",
        url: "OpenDyslexic/OpenDyslexic.css"
    },
    {
        displayName: "Go (sans-serif)",
        fontFamily: "Go",
        url: "Go/Go.css"
    },
    {
        displayName: "Go Mono (serif)",
        fontFamily: "Go Mono",
        url: "Go/GoMono.css"
    },
    {
        displayName: "Open Sans (sans-serif) [online]",
        fontFamily: "Open Sans",
        url: "https://fonts.googleapis.com/css?family=Open+Sans"
    },
    {
        displayName: "Old Standard TT (serif) [online]",
        fontFamily: "Old Standard TT",
        url: "https://fonts.googleapis.com/css?family=Old+Standard+TT"
    },
    {
        displayName: "Noto Serif (serif) [online]",
        fontFamily: "Noto Serif",
        url: "https://fonts.googleapis.com/css?family=Noto+Serif"
    },
    {
        displayName: "Bitter (serif) [online]",
        fontFamily: "Bitter",
        url: "https://fonts.googleapis.com/css?family=Bitter"
    }
];

// function exported to global context (window or self) when this fonts.js file is linked from index.html of cloud reader, Chrome app, etc.
var getFontFaces = function(URLprefix) {

    var fontsArray = [];

    for (var i = 0; i < _fontFaces.length; i++) {
        var fontFace = _fontFaces[i];
        
        var font = {};
        font.displayName = fontFace.displayName;
        font.fontFamily = fontFace.fontFamily;
        
        var isOnlineWebFont = (fontFace.url.indexOf("http://") == 0) || (fontFace.url.indexOf("https://") == 0);
        font.url = isOnlineWebFont ? fontFace.url : (URLprefix + fontFace.url);

        fontsArray.push(font);
    }

    return fontsArray;
};