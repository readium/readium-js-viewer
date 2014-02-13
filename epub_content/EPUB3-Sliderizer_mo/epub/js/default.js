/* global Hammer: false */
/* global escape: false */
/* global unescape: false */

/* jshint browser: true */
/* jshint devel: true */
/* jshint jquery: true */

// REQUIRES:
// addEventListener.js
// screenfull.js
// classList.js
// hammer.js + fakemultitouch + showtouches
// jquery.js
// jquery.mousewheel.js
// jquery.blockUI.js

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

var host = {};

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function()
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    if(window.performance)
    {
        if (window.performance.now)
        {
            return;
        }
        
        var vendors = ['webkitNow', 'mozNow', 'msNow', 'oNow'];
        
        for (var i = 0; i < vendors.length; i++)
        {
            if (vendors[i] in window.performance)
            {
                window.performance.now = window.performance[vendors[i]];
                return;
            }
        }
    }
    else
    {
        window.performance = {};
        
    }
    
    if(Date.now)
    {
        window.performance.now = function()
        {
            return Date.now();
        };
        return;
    }
    
    window.performance.now = function()
    {
        return +(new Date());
    };
})();

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// USAGE
// (function animloop(){
//   window.requestAnimationFrame(animloop);
//   render();
// })();

(function(now)
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";

    var ios6 = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent);

    var vendors = ['webkit', 'moz', 'ms', 'o'];
        
    var requestAnimationFrame = window.requestAnimationFrame;
    for(var i = 0; i < vendors.length && !requestAnimationFrame; i++)
    {
        requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
    }
        
        
    var cancelAnimationFrame =
        window.cancelAnimationFrame ||
        window.cancelRequestAnimationFrame;
    for(var j = 0; j < vendors.length && !cancelAnimationFrame; j++)
    {
        cancelAnimationFrame = window[vendors[j] + 'CancelAnimationFrame'] ||
                                window[vendors[j] + 'CancelRequestAnimationFrame'];
    }
        
    if (!ios6 && requestAnimationFrame && cancelAnimationFrame)
    {
        window.requestAnimationFrame = requestAnimationFrame;
        window.cancelAnimationFrame = cancelAnimationFrame;
    }
    else
    {
        var queue = [],
            processing = [],
            id = 0,
            interval;

        window.requestAnimationFrame = function(callback)
        {
            queue.push([++id, callback]);
            
            if (!interval)
            {
                interval = setInterval(function()
                {
                    if (queue.length)
                    {
                        var time = now();
                        
                        var temp = processing;
                        processing = queue;
                        queue = temp;
                        
                        while (processing.length)
                        {
                            processing.shift()[1](time);
                        }
                    }
                    else
                    {
                        clearInterval(interval);
                        interval = undefined;
                    }
                }, 1000 / 60);  // 60 FPS, 16.67ms
            }
            
            return id;
        };
        
        window.cancelAnimationFrame = function(requestId)
        {
            var i;
            
            for (i = 0; i < queue.length; i++)
            {
                if (queue[i][0] === requestId)
                {
                    queue.splice(i, 1);
                    return;
                }
            }
            
            for (i = 0; i < processing.length; i++)
            {
                if (processing[i][0] === requestId)
                {
                    processing.splice(i, 1);
                    return;
                }
            }
        };
    }
})(window.performance.now);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function()
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    if (!window.console)
    {
        window.console = {};
    }

    if (!window.console.log)
    {
        window.console.log = function () { };
    }
    
})();

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function()
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    /* jshint unused: false */
    var v = !String.prototype.trim &&
    (String.prototype.trim = function()
    {
        return this.replace(/^\s+|\s+$/g, '');
    });
    
})();

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function(hozt)
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    hozt.getUrlQueryParam = function(name)
    {
        var urlQueryParams = hozt.urlQueryParams ||
        (function()
        {
            var urlQueryParams_ = {};
        
            var regexp = /\??([^=^&^\?]+)(?:=([^&]*))?&?/gi;
        
            var match;
            while ((match = regexp.exec(window.location.search)) !== null)
            {
                if (!match || match.length < 3)
                {
                    break;
                }
            
                urlQueryParams_[decodeURIComponent(match[1])] = match[2] === "" ? null : decodeURIComponent(match[2]);
            }
        
            hozt.urlQueryParams = urlQueryParams_;
            return urlQueryParams_;
        })();
    
        if (typeof urlQueryParams[name] === "undefined")
        {
            return null;
        }
        else
        {
            var value = urlQueryParams[name];
        
            return value === null ? "" : value;
        }
    };
    
})(host);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// https://github.com/documentcloud/underscore/blob/master/underscore.js
//
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

(function(hozt)
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    /* jshint unused: false */
    hozt.debounce = function(func, wait, immediate)
    {
        var result;
        var timeout = null;
    
        return function()
        {
            var context = this, args = arguments;
            var later = function()
            {
                timeout = null;
                if (!immediate)
                {
                    result = func.apply(context, args);
                }
            };
        
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
            {
                result = func.apply(context, args);
            }
            return result;
        };
    };


    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time.
    hozt.throttle = function(func, wait, immediate)
    {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        var later = function()
        {
            previous = new Date();
            timeout = null;
            result = func.apply(context, args);
        };

        return function()
        {
            var now = new Date();
            if (!previous && immediate === false)
            {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
        
            if (remaining <= 0)
            {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            }
            else if (!timeout)
            {
                timeout = setTimeout(later, remaining);
            }
        
            return result;
        };
    };
    
})(host);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function()
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    if (!Function.prototype.bind)
    {
        Function.prototype.bind = function(that)
        {
            if (typeof this !== "function")
            {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var functionToBind = this;
         
            var args = Array.prototype.slice.call(arguments, 1);

            var Function_NOP = function () {};
            Function_NOP.prototype = this.prototype;
        
            var Function_BOUND = function ()
            {
                return functionToBind.apply(
                
                    //this instanceof Function_NOP && that ? this : that,
                    this instanceof Function_NOP ? this : that || window,
                
                    args.concat(Array.prototype.slice.call(arguments))
                    );
            };
            Function_BOUND.prototype = new Function_NOP();
        
            return Function_BOUND;
        };
    }
    
})();

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function(hozt)
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    /* jshint unused: false */
    hozt.STACK_TRACE = function(obj)
    {
        if (obj)
        {
            console.log(obj);
        }
    
        try
        {
            throw new Error("STACK TRACE DEBUG");
        }
        catch(ex)
        {
            console.log(ex.stack);
        }
    };
    
})(host);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(function(hozt)
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    hozt.querySelectorZ = (HTMLElement.prototype.querySelectorZ = function(selector)
    {
        return this.querySelector(selector);
    }).bind(document);

    hozt.querySelectorAllZ = (HTMLElement.prototype.querySelectorAllZ = function(selector)
    {
        return this.querySelectorAll(selector);
    }).bind(document);

})(host);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
/*\
|*|
|*|    :: cookies.js ::
|*|
|*|    A complete cookies reader/writer framework with full unicode support.
|*|
|*|    https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|    This framework is released under the GNU Public License, version 3 or later.
|*|    http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|    Syntaxes:
|*|
|*|    * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|    * docCookies.getItem(name)
|*|    * docCookies.removeItem(name[, path])
|*|    * docCookies.hasItem(name)
|*|    * docCookies.keys()
|*|
\*/

(function(hozt)
{
/* jshint strict: true */
/* jshint -W034 */
    "use strict";
    
    var docCookies = {
        getItem: function (sKey) {
        return unescape(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
            case Number:
                sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                break;
            case String:
                sExpires = "; expires=" + vEnd;
                break;
            case Date:
                sExpires = "; expires=" + vEnd.toGMTString();
                break;
            }
        }
        document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");

        return true;
        },
        removeItem: function (sKey, sPath) {
        if (!sKey || !this.hasItem(sKey)) { return false; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
        return true;
        },
        hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
        return aKeys;
        }
    };

    hozt.getCookie = function(name)
    {
        return docCookies.getItem(name);
    };

    hozt.setCookie = function(name, value)
    {    
        if (docCookies.hasItem(name))
        {
            docCookies.removeItem(name, "");
            docCookies.removeItem(name, "/");
        }

        var date = new Date();
        date.setDate(date.getDate() + 365);
    
        docCookies.setItem(name, value, date.toUTCString(), "/");
    };

})(host);

//####################################################################################################
//####################################################################################################

(function(STACK_TRACE, querySelectorZ, querySelectorAllZ, getUrlQueryParam, throttle, debounce, getCookie, setCookie, undefined) {

/* jshint scripturl: true */

/* jshint strict: true */
/* jshint -W034 */
"use strict";

var UNDEF = typeof undefined;

function isDefinedAndNotNull(obj)
{
    return typeof obj !== UNDEF && obj !== null;
}

// ----------

function loadScript(that, src)
{
    var head = document.head ? document.head : document.getElementsByTagName('head')[0];
    var script = document.createElementNS("http://www.w3.org/1999/xhtml", 'script');
    script.setAttribute("type", 'text/javascript');
    
//    script.setAttribute("data-aloha-plugins", "common/ui,common/format,common/link,common/list,common/paste,common/horizontalruler,common/dom-to-xhtml,common/contenthandler,common/commands,common/align,common/block");
    
    src = "js/" + src;
    
    var hasNavOrBack = false;
    if (!that)
    {
        Array.prototype.forEach.call(
            querySelectorAllZ("head > link"),
            function(link)
            {
                if (link.attributes.length <= 0 ||
                    !isDefinedAndNotNull(link.getAttribute('href')) ||
                    !isDefinedAndNotNull(link.getAttribute('rel'))
                )
                {
                    return;
                }

                var href = link.getAttribute('href');
                var rel = link.getAttribute('rel');
                if ((rel === "nav" || rel === "back") && href !== "")
                {
                    hasNavOrBack = true;
                }
            }
        );
    }
    else if (that.toc && that.toc !== "" || that.back && that.back !== "")
    {
        hasNavOrBack = true;
    }
    if (hasNavOrBack)
    {
        src = "../" + src;
    }
    
    script.setAttribute("src", src);
    head.appendChild(script);
}

// ----------

var Epub3Sliderizer = {
    onResizeThrottled: null,
    epubReadingSystem: null,
    readium: false,
    kobo: false, //DELAYED !! typeof window.KOBO_TAG !== UNDEF, //typeof window.nextKoboSpan !== UNDEF || 
    ibooks: false,
    playbooks: false,
    azardi: navigator.userAgent.toLowerCase().indexOf('azardi') > -1,
    staticMode: false,
    authorMode: false,
    htmlNotXHTML: false,
    basicMode: false,
    epubMode: false,
    prev: "",
    next: "",
    first: "",
    last: "",
    toc: "",
    back: "",
    epub: "",
    slideCount: -1,
    slideIndex: -1,
    reverse: false,
    thisFilename: null,
    from: null,
    hash: null,
    incrementals: null,
    increment: -1,
    bodyRoot: null,
    transforms: [],
    totalZoom: 1,
    pauseEvents: false,
    defaultFontSize: null,
    reflow: false,
    cookieFontSize: "Epub3Sliderizer_FontSize",
    cookieReflow: "Epub3Sliderizer_Reflow",
    firefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
    android: navigator.userAgent.toLowerCase().indexOf('android') > -1,
    opera: isDefinedAndNotNull(window.opera) || navigator.userAgent.toLowerCase().indexOf(' opr/') >= 0,
    IE: navigator.userAgent.indexOf('MSIE') >= 0 && navigator.userAgent.toLowerCase().indexOf('opera') < 0,
    mobile: navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile)/)
    // && navigator.userAgent.match(/AppleWebKit/)
};

// ----------

Epub3Sliderizer.updateFontSize = function(size)
{
    document.body.style.fontSize = Math.round(size) + "px";
    setCookie(this.cookieFontSize, document.body.style.fontSize);
};

// ----------

Epub3Sliderizer.resetFontSize = function()
{
    this.updateFontSize(this.defaultFontSize);
};

// ----------

Epub3Sliderizer.decreaseFontSize = function()
{
    if (this.defaultFontSize)
    {
        var fontSizeIncrease = 5.0;

        var size = Math.round(parseFloat(document.body.style.fontSize));
        
        var fontSizeIncreaseFactor = (size - this.defaultFontSize) / fontSizeIncrease;

        fontSizeIncreaseFactor --;
        
        if (fontSizeIncreaseFactor < 0)
        {
            fontSizeIncreaseFactor = 0;
        }

        this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
    }    
};

// ----------

Epub3Sliderizer.increaseFontSize = function()
{    
    if (this.defaultFontSize)
    {
        var fontSizeIncrease = 5.0;

        var size = Math.round(parseFloat(document.body.style.fontSize));
        
        var fontSizeIncreaseFactor = (size - this.defaultFontSize) / fontSizeIncrease;

        fontSizeIncreaseFactor ++;
        
        if (fontSizeIncreaseFactor > 9)
        {
            fontSizeIncreaseFactor = 9;
        }

        this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
    }
};

// ----------

Epub3Sliderizer.toggleControlsPanel = function()
{
    var controls = document.getElementById("epb3sldrzr-controls");

    if (!controls.style.display || controls.style.display === "none")
    {
        controls.style.display = "block";

        /*
        setTimeout(function()
        {
            controls.style.display = "none";
        }, 5000);
        */
    }
    else
    {
        controls.style.display = "none";
        
        /*
        setTimeout(function()
        {
            controls.style.display = "none";
        }, 600);
        */
    }
};

// ----------

Epub3Sliderizer.AUTHORized = false;

Epub3Sliderizer.AUTHORize = function()
{
    if (!isDefinedAndNotNull($))
    {
        return;
    }
   
    var $root = $("#epb3sldrzr-content-wrap");
   
    var elems = $(".epb3sldrzr-author, img", $root[0]);
    elems.addClass("epb3sldrzr-author-toMove");
    
    var thiz = this;
    
    var canMove = function(e, $el)
    {
        var can = $el[0].nodeName && $el[0].nodeName.toLowerCase().indexOf("img") == 0 || e.metaKey && ($el.hasClass("epb3sldrzr-author") || $el.parents().hasClass("epb3sldrzr-author"));
        if (can)
        {
            $el.addClass('epb3sldrzr-author-canMove');
        }
        else
        {
            $el.removeClass('epb3sldrzr-author-canMove');
        }
        
        return can;
    };
    
    var onMouseMove = function(e)
    {
        if (!e.data)
        {
            var $el = $(e.target);
            canMove(e, $el);
            return;
        }
        
        if (true || canMove(e, e.data.that))
        {
            thiz.AUTHORized = true;
            
            e.data.that
            .offset(
            {
                top: e.pageY + e.data.pos_y - e.data.drg_h,
                left: e.pageX + e.data.pos_x - e.data.drg_w
            });
        }
    };
    
    $root.on("mousemove", undefined, onMouseMove);
    
    elems.on("mousedown", function(e)
    {
        var $that = $(this);

        if (canMove(e, $that))
        {
            $that.removeClass('epb3sldrzr-author-toMove');
            $that.addClass('epb3sldrzr-author-moving');
        
            var drg_h = $that.outerHeight();
            var drg_w = $that.outerWidth();
            var pos_y = $that.offset().top + drg_h - e.pageY;
            var pos_x = $that.offset().left + drg_w - e.pageX;
        
            $(document.body).on("mousemove", {that: $that, drg_h: drg_h, drg_w: drg_w, pos_y: pos_y, pos_x: pos_x}, onMouseMove);
            
            e.preventDefault();
        }
    });
            
    elems.on("mouseup", function()
    {
        var $that = $(this);
        
        $that.removeClass('epb3sldrzr-author-moving');
        $that.removeClass('epb3sldrzr-author-canMove');
        $that.addClass('epb3sldrzr-author-toMove');
        
        $(document.body).off("mousemove", onMouseMove);


//        thiz.convertContentToMarkdownAndUpdateLocalStorageTextArea_Throttled();
    });
    
    
    elems.on("dblclick", function(e)
    {
        if (!e.metaKey) return;
        
        var $that = $(this);
        
        // console.log($that[0].style);
        //console.log($that[0].style.top);
        //console.log($that[0].style["top"]);

        console.log($that.css("position"));
        console.log($that.css("top"));
        console.log($that.css("left"));
        
        var pos = $that.css("position");
        
        var top = $that.css("top");
        top = (!top || top === "auto") ? "auto" : (Math.floor(parseInt(top)*100.0)/100.0) + "px";
        
        var left = $that.css("left");
        left = (!left || left === "auto") ? "auto" : (Math.floor(parseInt(left)*100.0)/100.0) + "px";
        
        alert("COPY+PASTE CSS:\n\n\nposition: "+pos+";\nleft: "+left+";\ntop: "+top+";\n");
        
        e.preventDefault();
    });
};

// ----------

Epub3Sliderizer.isEpubReadingSystem = function()
{
    return this.epubReadingSystem !== null || this.readium || this.kobo || this.ibooks || this.playbooks || this.azardi;
};

// ----------

Epub3Sliderizer.urlParams = function(includeNewFrom)
{
    var params = "?";
    
    if (this.staticMode)
    {
        params += "static&";
    }
    if (this.authorMode)
    {
        params += "author&";
    }
    if (this.basicMode)
    {
        params += "basic&";
    }
    if (this.epubMode)
    {
        params += "epub&";
    }

    if (includeNewFrom && this.thisFilename !== null)
    {
        var noext = this.thisFilename;
        var i = noext.indexOf('.');
        if (i >= 0)
        {
            noext = noext.substring(0, i);
        }
        
        params += ("from=" + encodeURIComponent(noext) + "&");
    }
    
    return params;
};

// ----------

Epub3Sliderizer.reloadSlide = function(mode)
{    
    if (!this.thisFilename || this.thisFilename === "")
    {
        return;
    }
    
    window.location = this.thisFilename + "?" + mode + "&" + (this.from !== null ? "from=" + encodeURIComponent(this.from) + "&" : "");
};

// ----------

Epub3Sliderizer.gotoToc = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (this.toc === "") 
    {
        return;
    }
    
    window.location = this.toc + this.urlParams(true);
};

// ----------

Epub3Sliderizer.gotoNext_ = function()
{
    if (this.reflow && this.mobile)
    {
        this.nextIncremental(false);
    }
    else
    {
        this.gotoNext();
    }
};

// ----------

Epub3Sliderizer.gotoPrevious_ = function()
{
    if (this.reflow && this.mobile)
    {
        this.nextIncremental(true);
    }
    else
    {
        this.gotoPrevious();
    }
};

// ----------

Epub3Sliderizer.gotoPrevious = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (this.prev === "") 
    {
        return;
    }
    
    window.location = this.prev + this.urlParams(true);
};

// ----------

Epub3Sliderizer.gotoNext = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (this.next === "") 
    {
        return;
    }
    
    window.location = this.next + this.urlParams(true);
};

// ----------

Epub3Sliderizer.gotoFirst = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (this.first === "") 
    {
        return;
    }
    
    window.location = this.first + this.urlParams(true);
};

// ----------

Epub3Sliderizer.gotoLast = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (this.last === "") 
    {
        return;
    }
    
    window.location = this.last + this.urlParams(true);
};

// ----------

Epub3Sliderizer.transition = function(on, milliseconds)
{
    if (on)
    {
        if (!this.basicMode && !this.opera)
        {
            var transition = "all "+milliseconds+"ms ease-in-out";
            this.bodyRoot.style.MozTransition = transition;
            this.bodyRoot.style.WebkitTransition = transition;
            this.bodyRoot.style.OTransition = transition;
            this.bodyRoot.style.msTransition = transition;
            this.bodyRoot.style.transition = transition;
        }
    }
    else
    {
        var that = this;
        setTimeout(function()
        {
            that.bodyRoot.style.MozTransition = null;
            that.bodyRoot.style.WebkitTransition = null;
            that.bodyRoot.style.OTransition = null;
            that.bodyRoot.style.msTransition = null;
            that.bodyRoot.style.transition = null;
        }, milliseconds + 10);
    }
};

// ----------

Epub3Sliderizer.pan = function(x, y)
{
    this.transition(true, 500);
    
    this.transforms.push({
        rotation: 0,
        zoom: 1,
        left: 0,
        top: 0,
        transX: x,
        transY: y
    });

    this.onResize();

    this.transition(false, 500);
};

// ----------

Epub3Sliderizer.resetTransforms = function()
{
    if (this.transforms)
    {
        this.transforms.length = 0;
    }
    else
    {
        this.transforms = [];
    }
};

// ----------

Epub3Sliderizer.toggleZoom = function(x, y)
{
    this.transition(true, 500);

    if (this.totalZoom !== 1)
    {
        this.resetResize();
    }
    else
    {
        this.totalZoom = 2;

        this.resetTransforms();
        this.transforms.push({
            rotation: 0,
            zoom: this.totalZoom,
            left: x,
            top: y,
            transX: 0,
            transY: 0
        });

        this.onResize();
    }

    this.transition(false, 500);
};


// ----------

Epub3Sliderizer.zoomTo = function(element)
{
    if (this.totalZoom !== 1)
    {
        this.transition(true, 500);
        
        this.resetResize();
        
        this.transition(false, 500);
        return;
    }
    
    if (element === null || !isDefinedAndNotNull(element.getBoundingClientRect))
    {
        alert(element !== null ? "UNDEFINED" : "NULL");
        
        return;
    }
    
    var border = element.style.border;
    element.style.border = "4px solid #ff00ff";
    
    var rect = element.getBoundingClientRect();
    var rectX = rect.left + document.documentElement.scrollLeft;
    var rectY = rect.top + document.documentElement.scrollTop;
    var rectFit = this.getRectFit(rect.width, rect.height, false);
    
//    var rectBody = this.bodyRoot.getBoundingClientRect();
//    var bodyFit = this.getElementFit(rectBody.width, rectBody.height, true);

    var rotation = 0;
    var zoom = rectFit.ratio;
    var left = Math.round(rectX + rect.width / 2); // - rectBody.left;
    var top = Math.round(rectY + rect.height / 2); // - rectBody.top;
    var transX = -(left - window.innerWidth / 2);
    var transY = -(top - window.innerHeight / 2);

    this.totalZoom = zoom;
    
    this.transition(true, 500);

    this.resetTransforms();
    this.transforms.push({
        rotation: rotation,
        zoom: zoom,
        left: left,
        top: top,
        transX: transX,
        transY: transY
    });

    this.onResize();

    this.transition(false, 500);
    
    setTimeout(function()
    {
        element.style.border = border;
    }, 500);
};

// ----------

Epub3Sliderizer.toggleReflow = function()
{
    if (this.defaultFontSize)
    {
        var fontSizeIncrease = 5.0;

        var size = Math.round(parseFloat(document.body.style.fontSize));
        
        var fontSizeIncreaseFactor = (size - this.defaultFontSize) / fontSizeIncrease;
    
        this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
    }

    var viewport = querySelectorZ("head > meta[name=viewport]");
    if (this.reflow)
    {    
        this.reflow = false;
        document.body.classList.remove("reflow");

        if (viewport !== null)
        {
            viewport.removeAttribute("content");
            viewport.setAttribute('content', this.viewportBackup);
        }
        
        this.onResize();
    }
    else
    {
        this.reflow = true;
        document.body.classList.add("reflow");
        
        this.resetOnResizeTransform();

        if (viewport !== null)
        {
            this.viewportBackup = viewport.getAttribute("content");
            
            viewport.removeAttribute("content");
            viewport.setAttribute('content',
                'width=device-width' +
                ',user-scalable=yes'
                /*
                + ',initial-scale='
                + '1'
                + ',minimum-scale='
                + '0.5'
                + ',maximum-scale=4'
                */
                );
        }
    }

    /* INFINITE LOOP!
    setTimeout(function()
    {
        window.location.reload(true);
    }, 100);
    */
    
    setCookie(this.cookieReflow, this.reflow ? "TRUE" : "FALSE");
};

// ----------

Epub3Sliderizer.NOMARKDOWN_MARKER = "NO-MARKDOWN";
Epub3Sliderizer.imgSrcPrefix = "../img/custom/";

Epub3Sliderizer.updateSlideContent = function(xml)
{
    var contentWrap = document.getElementById("epb3sldrzr-content-wrap");
    if (!contentWrap)
    {
        return;
    }

    var that = this;
    
    var NOMARKDOWN = xml.indexOf(Epub3Sliderizer.NOMARKDOWN_MARKER) == 0;
    if (NOMARKDOWN)
    {
        xml = xml.substr(Epub3Sliderizer.NOMARKDOWN_MARKER.length);
    }
    
    try
    {
        xml = HTMLtoXML(xml);
    }
    catch (ex)
    {
        console.log("PRE-MARKDOWN XML cleanup error, let's try without...");
    }

    if (NOMARKDOWN)
    {
        var cleaned = xml.replace(/&nbsp;/g, " ");
        try
        {
            contentWrap.innerHTML = cleaned;
        }
        catch(ex)
        {
            console.error(ex);
            console.log(cleaned);
        
            alert("NO-MARKDOWN: Oops, invalid XHTML :(\n\n(next message will show the output)");
            alert(cleaned);
        }
    }
    else
    {
        marked.setOptions({
          gfm: false,
          tables: false,
          breaks: false,
          highlight: function (code, lang, callback)
          {
              callback(null, code);
          },
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          langPrefix: 'lang-'
        });
        marked(xml, function (err, content)
        {
          if (err)
          {
              throw err;
          }
      
          var cleaned = HTMLtoXML(content).replace(/&nbsp;/g, " ");
          try
          {
              contentWrap.innerHTML = cleaned;
          }
          catch(ex)
          {
              console.error(ex);
              console.log(cleaned);
          
              alert("POST-MARKDOWN: Oops, invalid XHTML :(\n\n(next message will show cleaned-up Markdown parser result)");
              alert(cleaned);
          }
        });
    }
    
    $("img", contentWrap).each(function(index)
    {
        var $that = $(this);
        var src = $that.attr("src");
        if (!src) return;
        
        if (src.indexOf(Epub3Sliderizer.imgSrcPrefix) == 0) return;
        
        $that.attr("src", Epub3Sliderizer.imgSrcPrefix + src);
    });

    if (this.authorMode)
    {
        setTimeout(function()
        {
            that.AUTHORize();
        }, 300);
    }
    
    this.setModifiedStatus(true);
}

// ----------

Epub3Sliderizer.mod = "[[ MODIFIED ]] ";

Epub3Sliderizer.isModifiedStatus = function()
{
    return document.title.indexOf(this.mod) === 0;
}

Epub3Sliderizer.setModifiedStatus = function(modified)
{
    if (modified) //this.AUTHORized
    {
        if (document.title.indexOf(this.mod) !== 0)
        {
            document.title = this.mod + document.title;
        }
        document.body.style.backgroundColor = "#500000";
    }
    else
    {
        if (document.title.indexOf(this.mod) === 0)
        {
            document.title = document.title.substr(this.mod.length);
        }
        document.body.style.backgroundColor = undefined;
    }
}

// ----------

Epub3Sliderizer.fetchLocalStorageTextArea = function()
{
    if (hasLocalStorage())
    {
        var data = undefined;
        for (var i = 0; i < localStorage.length; i++)
        {
            var key = localStorage.key(i);
            if (key === this.thisFilename)
            {
                data = localStorage.getItem(key);
                break;
            }
        }
        if (!data)
        {
            return false;
        }

        console.log(":::: LOCALSTORAGE FETCH: " + this.thisFilename);
        
        var txtArea = document.getElementById('epb3sldrzr-markdown-src');
        if (txtArea)
        {
            txtArea.value = data;
        }
        
        this.updateSlideContent(data);
        
        return true;
    }
    
    return false;
}

// ----------

Epub3Sliderizer.convertContentToMarkdownAndUpdateLocalStorageTextArea = function()
{
    var txtArea = document.getElementById('epb3sldrzr-markdown-src');
    if (!txtArea) return;
    
    var markdown = txtArea.value;
    var NOMARKDOWN = markdown.indexOf(Epub3Sliderizer.NOMARKDOWN_MARKER) == 0;

    markdown = this.convertContentToMarkdown(NOMARKDOWN);
    
    this.updateLocalStorageTextArea(markdown);
}       

//Epub3Sliderizer.convertContentToMarkdownAndUpdateLocalStorageTextArea_Throttled = undefined;

// ----------
        
Epub3Sliderizer.updateLocalStorageTextArea = function(content)
{
    var txtArea = document.getElementById('epb3sldrzr-markdown-src');
    if (txtArea)
    {
        txtArea.value = content;
    }
    
    if (hasLocalStorage())
    {
        for (var i = 0; i < localStorage.length; i++)
        {
            var key = localStorage.key(i);
            if (key === this.thisFilename)
            {
                //var data = localStorage.getItem(key);
                localStorage.removeItem(key);
                break;
            }
        }
        
        localStorage.setItem(this.thisFilename, content);
        
        console.log(":::: LOCALSTORAGE UPDATED: " + this.thisFilename);
    }
}

// ----------

Epub3Sliderizer.convertContentToMarkdown = function(NOMARKDOWN)
{
    var contentWrap = document.getElementById("epb3sldrzr-content-wrap");
    
    if (!contentWrap)
    {
        return;
    }
    
    console.log("Content was changed,\nattempting conversion from HTML to Markdown...");
  
    $("img", contentWrap).each(function(index)
    {
        var $that = $(this);
        var src = $that.attr("src");
        if (!src) return;
      
        if (src.indexOf(Epub3Sliderizer.imgSrcPrefix) != 0) return;
      
        $that.attr("src", src.substr(Epub3Sliderizer.imgSrcPrefix.length));
    });
    
    var options = {
        link_list:    false,            // render links as references, create link list as appendix
    //  link_near:                    // cite links immediately after blocks
        h1_setext:    true,            // underline h1 headers
        h2_setext:    true,            // underline h2 headers
        h_atx_suf:    false,            // header suffix (###)
    //    h_compact:    true,            // compact headers (except h1)
        gfm_code:    false,            // render code blocks as via ``` delims
        li_bullet:    "*-+"[0],        // list item bullet style
    //    list_indnt:                    // indent top-level lists
        hr_char:    "-_*"[0],        // hr style
        indnt_str:    ["    ","\t","  "][0],    // indentation string
        bold_char:    "*_"[0],        // char used for strong
        emph_char:    "*_"[1],        // char used for em
        gfm_del:    true,            // ~~strikeout~~ for <del>strikeout</del>
        gfm_tbls:    false,            // markdown-extra tables
        tbl_edges:    false,            // show side edges on tables
        hash_lnks:    false,            // anchors w/hash hrefs as links
        br_only:    false,            // avoid using "  " as line break indicator
        col_pre:    "col ",            // column prefix to use when creating missing headers for tables
        //    comp_style: false,            // use getComputedStyle instead of hardcoded tag list to discern block/inline
        unsup_tags: {                // handling of unsupported tags, defined in terms of desired output style. if not listed, output = outerHTML
        force_preserve: "", //e.g. img
        // no output
        ignore: "script style noscript",
        // eg: "<tag>some content</tag>"
        inline: "span sup sub i u b", //span sup sub i u b center big
        // eg: "\n<tag>\n\tsome content\n</tag>"
    //    block1: "",
        // eg: "\n\n<tag>\n\tsome content\n</tag>"
        block2: "", //div form fieldset dl header footer address article aside figure hgroup section
        // eg: "\n<tag>some content</tag>"
        block1c: "", //dt dd caption legend figcaption output
        // eg: "\n\n<tag>some content</tag>"
        block2c: "", //canvas audio video iframe
    /*    // direct remap of unsuported tags
        convert: {
            i: "em",
            b: "strong"
        }
    */
        }
    };
    var reMarker = new reMarked(options);

    $(".epb3sldrzr-author-toMove", contentWrap).removeClass("epb3sldrzr-author-toMove");
    $(".epb3sldrzr-author-canMove", contentWrap).removeClass("epb3sldrzr-author-canMove");
    $(".auto", contentWrap).removeClass("auto");
    $(".incremental", contentWrap).removeClass("incremental");
//console.log(contentWrap);
    var markdown = reMarker.render(contentWrap);
    
    markdown = markdown.replace(/><\/img>/g, "/>").replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, "").replace(/ class=""/g, "");

    if (NOMARKDOWN)
    {
        markdown = Epub3Sliderizer.NOMARKDOWN_MARKER + "\n\n" + markdown;
    }
    
    return markdown;
}

// ----------

Epub3Sliderizer.ACE = true;
Epub3Sliderizer.aceEditor = undefined;
Epub3Sliderizer.aceChanged = false;


Epub3Sliderizer.keyboardAuthoring = function(keyboardEvent)
{
    var that = this;

    var txtArea = undefined;
    var txtAreaEditor = undefined;
    var fetchElems = function()
    {
        if (!txtArea)
        {
            txtArea = document.getElementById('epb3sldrzr-markdown-src');
        }
        if (!txtAreaEditor)
        {
            txtAreaEditor = querySelectorZ('.ace_text-input');
        }
    };

    var contentEditableActive = this.isContentWrapDescendant(keyboardEvent.target);
    var contentHasProbablyChanged = contentEditableActive &&
                                    keyboardEvent.keyCode != 37 && // left arrow
                                    keyboardEvent.keyCode != 38 && // up arrow
                                    keyboardEvent.keyCode != 33 && // page up
                                    keyboardEvent.keyCode != 39 && // right arrow
                                    keyboardEvent.keyCode != 40 && // down arrow
                                    keyboardEvent.keyCode != 34 && // page down
                                    keyboardEvent.keyCode != 27 // ESC
                                    ;
    that.AUTHORized = that.AUTHORized || contentHasProbablyChanged;

    fetchElems();
    var editing = keyboardEvent.target === txtArea || keyboardEvent.target === txtAreaEditor || contentEditableActive;
    
    if (keyboardEvent.keyCode === 37 || // left arrow
    // keyboardEvent.keyCode === 38 // up arrow
    keyboardEvent.keyCode === 33 // page up
    )
    {
        if (editing)
        {
            return;
        }
        keyboardEvent.preventDefault();
        this.gotoPrevious();
        return;
    }
    else if (keyboardEvent.keyCode === 39 || // right arrow
        // keyboardEvent.keyCode === 40 // down arrow
        keyboardEvent.keyCode === 34 // page down
    )
    {
        if (editing)
        {
            return;
        }
        keyboardEvent.preventDefault();
        this.gotoNext();
        return;
    }

    if (keyboardEvent.keyCode !== 27) // ESC
    {
        if (contentHasProbablyChanged)
        {
//            this.convertContentToMarkdownAndUpdateLocalStorageTextArea_Throttled();
        }
        return;
    }

    fetchElems();
    
    if (!txtArea)
    {
        alert('Author mode is not active for this slide.\n\nNote that it is disabled by default with XHTML slides,\nunless content field is explicitly MARKDOWN.\n\n Perhaps try the HTML slide instead?\n(just change the file extension in the address bar).\n\n[' + this.thisFilename + "]");
        return;
    }

    var contentWrap = document.getElementById("epb3sldrzr-content-wrap");
    var root = document.getElementById("epb3sldrzr-root");
    var divEditor = document.getElementById('epb3sldrzr-markdown-editor');

    if ($(root).css("display") === "block")
    {
        var markdown = txtArea.value;
        
        if (this.AUTHORized)
        {
            this.AUTHORized = false;

            var NOMARKDOWN = markdown.indexOf(Epub3Sliderizer.NOMARKDOWN_MARKER) == 0;
    
            markdown = this.convertContentToMarkdown(NOMARKDOWN);
        }
        
        markdown = markdown.replace(/<!--XML-->/g, "").replace(/<!--SOUP-->/g, "").trim();

        //.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        this.updateLocalStorageTextArea(markdown);

                
        window.scrollTo(0, 0);
        
        root.style.display = "none";
        document.body.style.overflow = "hidden";
        
        if (this.ACE)
        {
            divEditor.style.visibility = "hidden";
            divEditor.style.display = "block";
            
            if (!this.aceEditor)
            {
                this.aceEditor = ace.edit(divEditor);
            
                this.aceEditor.renderer.setShowGutter(true);
                //this.aceEditor.renderer.setPadding(200);

                this.aceEditor.setDisplayIndentGuides(true);
                this.aceEditor.setHighlightActiveLine(true);
                this.aceEditor.setHighlightSelectedWord(true);
                this.aceEditor.setShowPrintMargin(false);
                this.aceEditor.setShowInvisibles(false);

                this.aceEditor.setBehavioursEnabled(true);
                this.aceEditor.getSession().setUseWrapMode(true);
                
                this.aceEditor.getSession().setUseSoftTabs(true);
                this.aceEditor.getSession().setTabSize(2);

                this.aceEditor.getSession().setMode("ace/mode/markdown");
                this.aceEditor.setTheme("ace/theme/solarized_dark");
            
                if (this.aceEditor.require == undefined)
                {
                    this.aceEditor.require = ace.require;
                }
                var markdownEditor = new Markdown.Editor();
                markdownEditor.run(this.aceEditor);
                
                this.aceChanged = false;
                
                this.aceEditor.on('blur', function(e)
                {
                    var src = that.aceEditor.getSession().getValue();
                    that.updateLocalStorageTextArea(src);
                    
                    that.aceChanged = markdown !== src;
                });
            }

            fetchElems();
            
            divEditor.style.fontSize = '0.6em';

            setTimeout(function()
            {
                that.aceEditor.getSession().setValue(markdown);
                setTimeout(function()
                {
                    divEditor.style.visibility = "visible";
                    txtAreaEditor.focus();
                }, 30);

                setTimeout(function()
                {
                    that.aceEditor.resize(true);
                }, 100);
            }, 300);
        }
        else
        {
            setTimeout(function()
            {
                txtArea.style.display = "block";

                setTimeout(function()
                {
                    txtArea.focus();
                }, 30);
            }, 300);
        }
    }
    else
    {
        if (txtAreaEditor)
        {
            txtAreaEditor.blur();
        }
        txtArea.blur();
        
        
        // var parser = new DOMParser();
        // var doc = parser.parseFromString(txtArea.value, "text/html");
        // var inner = doc.innerHTML;

        //.replace(/<hr><\/hr>/g, "<hr/>").replace(/<br><\/br>/g, "<br/>");
        //.replace(/<hr>/g, "<hr/>").replace(/<br>/g, "<br/>").replace(/<img ([^>]*)([^\/])>/g, "<img $1$2 />");

        setTimeout(function()
        {
            var wasModified = that.isModifiedStatus();
            
            var xml = txtArea.value;
            that.updateSlideContent(xml);

            if (!that.aceChanged && !wasModified)
            {
                that.setModifiedStatus(false);
            }
            that.aceChanged = false;

            setTimeout(function()
            {
                document.body.style.overflow = "auto";
                root.style.display = "block";
            
                txtArea.style.display = "none";
                divEditor.style.display = "none";
            }, 200);
        }, 200);
    }
    

    keyboardEvent.preventDefault();
}

// ----------

Epub3Sliderizer.isContentWrapDescendant = function(el)
{
    var contentWrap = document.getElementById("epb3sldrzr-content-wrap");
    var found = false;
    var parent = el;
    while (parent)
    {
        if (parent === contentWrap)
        {
            found = true;
            break;
        }

        parent = parent.parentNode;
    }
    //var parents = $(keyboardEvent.target).parents('#epb3sldrzr-content-wrap');
    return found;
}

// ----------

function hasLocalStorage()
{
    try
    {
        return 'localStorage' in window && window['localStorage'] !== null;
    }
    catch (e)
    {
        return false;
    }
}

// ----------

//http://www.sceneonthe.net/unicode.htm
//http://www.w3.org/2002/09/tests/keys.html
Epub3Sliderizer.onKeyboard = function(keyboardEvent)
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    
    // Filter out keyboard shortcuts
    if (keyboardEvent.altKey ||
        keyboardEvent.ctrlKey ||
        keyboardEvent.metaKey ||
        keyboardEvent.shiftKey)
    {
        return;
    }

    var that = this;

    var fontSizeIncrease = 5;

    if (keyboardEvent.keyCode === 65) // A
    {
        var notEditing = !this.authorMode ||
            $("#epb3sldrzr-root").css("display") === "block" && !this.isContentWrapDescendant(keyboardEvent.target);
        if (notEditing)
        {
            keyboardEvent.preventDefault();
            this.reloadSlide(this.authorMode ? "" : "author");
        }
    }
    
    if (this.authorMode)
    {
        this.keyboardAuthoring(keyboardEvent);
    }
    else if (!this.reflow && keyboardEvent.keyCode === 90) // Z
    {
        keyboardEvent.preventDefault();
        var rectBody = this.bodyRoot.getBoundingClientRect();
        this.toggleZoom(rectBody.left,rectBody.top);
    }
    else if (!this.reflow && keyboardEvent.keyCode === 27) // ESC
    {
        if (this.totalZoom !== 1)
        {
            keyboardEvent.preventDefault();
            this.toggleZoom(0,0);
        }
    }
    else if (keyboardEvent.keyCode === 67) // C
    {
        keyboardEvent.preventDefault();
        this.toggleControlsPanel();
    }
    else if (keyboardEvent.keyCode === 82) // R
    {
        keyboardEvent.preventDefault();
        this.toggleReflow();
    }
    else if (keyboardEvent.keyCode >= 48 && keyboardEvent.keyCode <= 57) // 0,1,2,3..,9
    {
        if (this.defaultFontSize)
        {
            keyboardEvent.preventDefault();
            
            var fontSizeIncreaseFactor = keyboardEvent.keyCode-48;
            
            this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
        }
    }
    /*
    else if (keyboardEvent.keyCode === 13) // RETURN / ENTER
    {
        keyboardEvent.preventDefault();    
    }
    */
    /*
    else if (keyboardEvent.keyCode === 70) // F
    {
        if (isDefinedAndNotNull(screenfull))
        {
            keyboardEvent.preventDefault();
            screenfull.toggle();
        }
    }
    else if (keyboardEvent.keyCode === 27) // ESC
    {
        if (isDefinedAndNotNull(screenfull))
        {
            keyboardEvent.preventDefault();
            screenfull.exit();
        }
    }
    */
    else if (!this.reflow && this.totalZoom !== 1)
    {
        var offset = 100;
    
        if (keyboardEvent.keyCode === 37 // left arrow
        )
        {
            keyboardEvent.preventDefault();
            this.pan(offset, 0);
        }
        else if (keyboardEvent.keyCode === 39 // right arrow
        )
        {
            keyboardEvent.preventDefault();
            this.pan(-offset, 0);
        }
        else if (keyboardEvent.keyCode === 38 || // up arrow
            keyboardEvent.keyCode === 33 // page up
        )
        {
            keyboardEvent.preventDefault();
            this.pan(0, offset);
        }
        else if (keyboardEvent.keyCode === 40 || // down arrow
            keyboardEvent.keyCode === 34 // page down
        )
        {
            keyboardEvent.preventDefault();
            this.pan(0, -offset);
        }
    }
    else if (keyboardEvent.keyCode === 37 || // left arrow
        // keyboardEvent.keyCode === 38 // up arrow
        keyboardEvent.keyCode === 33 // page up
    )
    {
        keyboardEvent.preventDefault();
        this.gotoPrevious();
    }
    else if (keyboardEvent.keyCode === 39 || // right arrow
        // keyboardEvent.keyCode === 40 // down arrow
        keyboardEvent.keyCode === 34 // page down
    )
    {
        keyboardEvent.preventDefault();
        this.gotoNext();
    }
    else if (keyboardEvent.keyCode === 40) // down arrow
    {
        keyboardEvent.preventDefault();
        this.nextIncremental(false);
    }
    else if (keyboardEvent.keyCode === 38) // up arrow
    {
        keyboardEvent.preventDefault();
        this.nextIncremental(true);
    }
    else if (keyboardEvent.keyCode === 32) // SPACE
    {
        keyboardEvent.preventDefault();
        this.nextIncremental(false);
    }
    else if (keyboardEvent.keyCode === 77) // M
    {
        if (this.toc && this.toc !== "")
        {
            keyboardEvent.preventDefault();
            this.gotoToc();
        }
    }
    else if (keyboardEvent.keyCode === 70 || keyboardEvent.keyCode === 36) // F or HOME
    {
        if (this.first && this.first !== "")
        {
            keyboardEvent.preventDefault();
            this.gotoFirst();
        }
    }
    else if (keyboardEvent.keyCode === 76 || keyboardEvent.keyCode === 35) // L or END
    {
        if (this.last && this.last !== "")
        {
            keyboardEvent.preventDefault();
            this.gotoLast();
        }
    }
    else if (keyboardEvent.keyCode === 83) // S
    {
        //keyboardEvent.preventDefault();
        //TODO this.toggleSlideStrip();
    }
    else if (keyboardEvent.keyCode === 84) // T
    {
        //keyboardEvent.preventDefault();
        //TODO this.toggleTwoPageSpread();
    }
};

// ----------

Epub3Sliderizer.initTouch = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (!isDefinedAndNotNull(Hammer))
    {
        return;
    }
    
    var that = this;

    
    var scrolling = false;

    function onSwipeLeft(
        /* jshint unused: false */
        hammerEvent
    )
    {
        /* jshint validthis: true */
    
        if (this.reflow)
        {
            return;
        }
        
        if (this.totalZoom !== 1)
        {
            return;
        }
        
        this.gotoNext();
    }
    
    function onSwipeRight(
        /* jshint unused: false */
        hammerEvent
    )
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (this.totalZoom !== 1)
        {
            return;
        }
        
        this.gotoPrevious();
    }
    
    function onSwipeUp(
        /* jshint unused: false */
        hammerEvent
    )
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (this.totalZoom !== 1)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }
        //hammerEvent.gesture.preventDefault();
        
        this.nextIncremental(true);
    }
    
    function onSwipeDown(
        /* jshint unused: false */
        hammerEvent
    )
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (this.totalZoom !== 1)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }
        //hammerEvent.gesture.preventDefault();
        
        this.nextIncremental(false);
    }
    
    
    /*
    var totalDragX = 0;
    var totalDragY = 0;

    var rotationStart = 0;
    var totalRotation = 0;
    */
    
    var zoomStart = 1;
    var dragXStart = 0;
    var dragYStart = 0;
    
    function resetTransform()
    {
        that.bodyRoot.style.opacity = "1";
        
        var b = that.totalZoom <= 1 || that.totalZoom >= 18;
        
        if (b)
        {
            /*
            totalRotation = 0;
            totalDragX = 0;
            totalDragY = 0;
            */
            
            that.resetResize();
        }
        
        return b;
    }
    
    var firstTransform = true;
    
    function onTransform(hammerEvent)
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }
        
        if (hammerEvent.gesture)
        {
            this.totalZoom = zoomStart * hammerEvent.gesture.scale;
            //totalRotation = rotationStart + hammerEvent.gesture.rotation;

            if (this.totalZoom <= 1 || !resetTransform())
            {
                if (!firstTransform)
                {
                    this.transforms.pop();
                }
                firstTransform = false;
                
                this.transforms.push({
                    rotation: hammerEvent.gesture.rotation,
                    zoom: hammerEvent.gesture.scale,
                    left: hammerEvent.gesture.center.pageX,
                    top: hammerEvent.gesture.center.pageY,
                    transX: (hammerEvent.gesture.center.pageX - dragXStart) * hammerEvent.gesture.scale,
                    transY: (hammerEvent.gesture.center.pageY - dragYStart) * hammerEvent.gesture.scale
                });

                /*
                if (this.totalZoom < 1)
                {
                    this.bodyRoot.style.opacity = this.totalZoom;
                }
                */
                
                this.onResizeThrottled();
//                this.onResize();
            }
        }
    }
    
    function onTransformEnd(
        /* jshint unused: false */
        hammerEvent
    )
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }

        if (this.totalZoom <= 1)
        {
            this.transition(true, 500);
        
            resetTransform();
            
            this.transition(false, 500);
        }
    }
    
    function onTransformStart(hammerEvent)
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }
        
        firstTransform = true;
        
        if (hammerEvent.gesture)
        {
            zoomStart = this.totalZoom;
            
            dragXStart = hammerEvent.gesture.center.pageX;
            dragYStart = hammerEvent.gesture.center.pageY;
            
            /*
            rotationStart = totalRotation;
            */
            
            hammerEvent.gesture.preventDefault();
        }
        else
        {
            zoomStart = 1;
            
            dragXStart = 0;
            dragYStart = 0;
            
            /*
            rotationStart = 0;
            */
        }
    }
    
    var firstDrag = true;
    
    function onDragEnd(
        /* jshint unused: false */
        hammerEvent
    )
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }
        
        var that = this;
        
        if (this.totalZoom === 1)
        {
            setTimeout(function()
            {
                that.transition(true, 500);
        
                resetTransform();
            
                that.transition(false, 500);
            }, 100);
        }
    }
    
    function onDrag(hammerEvent)
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (scrolling)
        {
            return;
        }
        
        if (hammerEvent.gesture)
        {            
            if (this.totalZoom === 1 && this.basicMode)
            {
                return;
            }
            
            var xOffset = hammerEvent.gesture.center.pageX - dragXStart;

            var opacity = 1;
            if (this.totalZoom === 1)
            {
                var off = Math.abs(xOffset);
                if (off < 60)
                {
                    // to allow swipe up/down
                    return;
                }
                
                opacity = 1 - (off / window.innerWidth); //this.bodyRoot.clientWidth
                
//                this.bodyRoot.style.opacity = opacity;
            }
            
            //$("h1#epb3sldrzr-title").html(this.totalZoom + " - " + opacity);
            
            if (!firstDrag)
            {
                this.transforms.pop();
            }
            firstDrag = false;
            
            this.transforms.push({
                rotation: 0,
                zoom: 1, //opacity,
                left: hammerEvent.gesture.center.pageX,
                top: hammerEvent.gesture.center.pageY,
                transX: xOffset,
                transY: this.totalZoom === 1 ? 0 : hammerEvent.gesture.center.pageY - dragYStart
            });

            this.onResizeThrottled();
            //this.onResize();
        }
    }
    
    function onDragStart(hammerEvent)
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        firstDrag = true;
        
        if (hammerEvent.gesture)
        {
            dragXStart = hammerEvent.gesture.center.pageX;
            dragYStart = hammerEvent.gesture.center.pageY;
            
            hammerEvent.gesture.preventDefault();
        }
        else
        {
            dragXStart = 0;
            dragYStart = 0;
        }
        
        scrolling = false;

        if (this.totalZoom !== 1)
        {
            return;
        }

        var scroll = document.getElementById("epb3sldrzr-root");
        
        var target = hammerEvent.target;
        while (target)
        {
            if(target === scroll)
            {
                if (scroll.offsetHeight < scroll.scrollHeight)
                {
                    if (scroll.scrollTop <= 0 &&
                        hammerEvent.gesture && hammerEvent.gesture.direction === "down")
                    {
                        /* jshint unused: false */
                        var nop1 = null;
                    }
                    else if (scroll.scrollTop >= (scroll.scrollHeight - scroll.offsetHeight) &&
                            hammerEvent.gesture && hammerEvent.gesture.direction === "up")
                    {
                        /* jshint unused: false */
                        var nop2 = null;
                    }
                    else
                    {
                        scrolling = true;
                        /*
                        if (hammerEvent.gesture)
                        {
                            hammerEvent.gesture.stopPropagation();
                        }
                        */
                        return;
                    }
                }
            }
            target = target.parentNode;
        }
    }
    
    this.hammer.on("dragstart",
        onDragStart.bind(this)
    );
    
    this.hammer.on("dragend",
        onDragEnd.bind(this)
    );
    
    this.hammer.on("drag",
        onDrag.bind(this)
    );
    
    this.hammer.on("transformstart",
        onTransformStart.bind(this)
    );
    
    this.hammer.on("transformend",
        onTransformEnd.bind(this)
    );
    
    this.hammer.on("transform",
        onTransform.bind(this)
    );
    
    this.hammer.on("swipeleft",
        onSwipeLeft.bind(this)
    );
    
    this.hammer.on("swiperight",
        onSwipeRight.bind(this)
    );
    
    this.hammer.on("swipeup",
        onSwipeUp.bind(this)
    );
    
    this.hammer.on("swipedown",
        onSwipeDown.bind(this)
    );

    function onDoubleTap(hammerEvent)
    {
        /* jshint validthis: true */
        
        if (this.reflow)
        {
            return;
        }
        
        if (hammerEvent.gesture)
        {    
            hammerEvent.gesture.preventDefault();
            hammerEvent.gesture.stopPropagation();

            if (this.totalZoom !== 1)
            {
                this.transition(true, 500);
                
                this.resetResize();
                
                this.transition(false, 500);
                //this.toggleZoom(hammerEvent.gesture.center.pageX, hammerEvent.gesture.center.pageY);
            }
            else
            {
                var done = false;

                var target = hammerEvent.target;
                while (target)
                {
                    if (target === this.bodyRoot)
                    {
                        break;
                    }
                    
                    var name = target.nodeName.toLowerCase();
                    if (name === "p" || name === "img" || name === "video" || name === "svg" || name === "td" || name === "div" || name === "h1" || name === "h2" || name === "h3" || name === "h4" || name === "li" || name === "ul" || name === "ol")
                    {
                        done = true;
                        this.zoomTo(target);
                        break;
                    }
            
                    target = target.parentNode;
                }
        
                if (!done)
                {
                    this.toggleZoom(hammerEvent.gesture.center.pageX, hammerEvent.gesture.center.pageY);
                }
            }
        }
    }

    function onTap(hammerEvent)
    {
        /* jshint validthis: true */
        
        if (hammerEvent.gesture)
        {
            var controls = document.getElementById("epb3sldrzr-controls");
            
            var target = hammerEvent.target;
            while (target)
            {
                if (target === controls)
                {
                    return;
                }
                if (target.nodeName && target.nodeName.toLowerCase() === "a")
                {
                    return;
                }
                target = target.parentNode;
            }
        }

        this.toggleControlsPanel();
    }
    
    
    /*
    function onHold(hammerEvent)
    {
        if (hammerEvent.gesture)
        {
        }
        
    }
    
    this.hammer.on("hold",
        onHold.bind(this)
    );
    */

    
    
    
    
    
    
    
    
    
    var hammer = new Hammer(document.documentElement,
        {
            prevent_default: true,
            css_hacks: false
        });
    
    hammer.on("doubletap",
        onDoubleTap.bind(this)
    );

    hammer.on("tap",
        onTap.bind(this)
    );
    
    
    
    
    document.addEventListener('touchstart', function(e)
    {
        if (that.reflow)
        {
            return;
        }
        
        var t2 = e.timeStamp;
        var t1 = document.documentElement.getAttribute('data-touchStart') || t2;
        var dt = t2 - t1;
        var fingers = e.touches.length;
        document.documentElement.setAttribute('data-touchStart', t2);
        
        if (!dt || dt > 500 || fingers > 1)
        {
            /*
            console.log("===");
            console.log(that.left);
            console.log(that.top);
            */
            return;
        }
        
        e.preventDefault();
    }, true );
};

// ----------

Epub3Sliderizer.resetOnResizeTransform = function()
{
    if (!this.reflow && !this.isEpubReadingSystem())
    {
        return;
    }

    this.totalZoom = 1;
    this.resetTransforms();
    
    this.bodyRoot.style.MozTransformOrigin = null;
    this.bodyRoot.style.WebkitTransformOrigin = null;
    this.bodyRoot.style.OTransformOrigin = null;
    this.bodyRoot.style.msTransformOrigin = null;
    this.bodyRoot.style.transformOrigin = null;

    this.bodyRoot.style.MozTransform = null;
    this.bodyRoot.style.WebkitTransform = null;
    this.bodyRoot.style.OTransform = null;
    this.bodyRoot.style.msTransform = null;
    this.bodyRoot.style.transform = null;
};


Epub3Sliderizer.resetResize = function()
{
    this.totalZoom = 1;
    this.resetTransforms();
    
    this.onResizeThrottled();
    //this.onResize();
};

// ----------

Epub3Sliderizer.getElementFit = function(element, fitWidth)
{
    return this.getRectFit(element.clientWidth, element.clientHeight, fitWidth);
};

// ----------

Epub3Sliderizer.getRectFit = function(w, h, fitWidth)
{
    var sx = w / window.innerWidth;
    var sy = h / window.innerHeight;
    var ratio = fitWidth ? 1.0 / sx : 1.0 / Math.max(sx, sy);

    var newWidth = w * ratio;
    var offsetX = 0;
    if (window.innerWidth > newWidth)
    {
        offsetX = (window.innerWidth - newWidth) / 2;
    }
    offsetX = Math.round( offsetX * 1000.0 ) / 1000.0;
    offsetX = Math.round(offsetX);

    var newHeight = h * ratio;
    var offsetY = 0;
    if (window.innerHeight > newHeight)
    {
        offsetY = (window.innerHeight - newHeight) / 2;
    }
    offsetY = Math.round( offsetY * 1000.0 ) / 1000.0;
    offsetY = Math.round(offsetY);

    return { "ratio": ratio, "offsetX": offsetX, "offsetY": offsetY };
};

// ----------

// ratio 1.29:1
// 1290 x 1000
// 1900 x 1470
// 2048 x 1536 (Retina)
// 2400 x 1860

Epub3Sliderizer.onResize = function()
{
    if (this.isEpubReadingSystem() || this.reflow)
    {
        return;
    }

    var transformOrigin = "0px 0px";
    
    this.bodyRoot.style.MozTransformOrigin = transformOrigin;
    this.bodyRoot.style.WebkitTransformOrigin = transformOrigin;
    this.bodyRoot.style.OTransformOrigin = transformOrigin;
    this.bodyRoot.style.msTransformOrigin = transformOrigin;
    this.bodyRoot.style.transformOrigin = transformOrigin;
    
    var bodyFit = this.getElementFit(this.bodyRoot, false); //this.authorMode);
    var ratio = bodyFit.ratio;
    var offsetX = bodyFit.offsetX;
    var offsetY = bodyFit.offsetY;
    
    var is3D = this.opera || this.firefox || this.mobile || this.IE ? false : true; // this leaves WebKit with 3D ...
    
    is3D = false;
    
    var transformCSS = "";
    
    for (var i = this.transforms.length-1; i >= 0; i--)
    {
        var transform = this.transforms[i];
        
        if (transform.rotation !== 0)
        {
            transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.left + "px," + transform.top + "px"+(is3D?", 0":"")+") ";
        
            transformCSS += " rotate"+(is3D?"3d":"")+"(" + (is3D? "0,0,1,":"") + transform.rotation + "deg) ";
            
            transformCSS += " translate"+(is3D?"3d":"")+"(" + -transform.left + "px," + -transform.top + "px"+(is3D?", 0":"")+") ";
        }

        transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.transX + "px," + transform.transY + "px"+(is3D?", 0":"")+") ";

        if (transform.zoom !== 1)
        {
            transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.left + "px," + transform.top + "px"+(is3D?", 0":"")+") ";
            
            transformCSS += " scale"+(is3D?"3d":"")+"(" + transform.zoom + (is3D? "," + transform.zoom + ",1":"") + ") ";

            transformCSS += " translate"+(is3D?"3d":"")+"(" + -transform.left + "px," + -transform.top + "px"+(is3D?", 0":"")+") ";
        }
    }
    
    transformCSS += " translate"+(is3D?"3d":"")+"(" + offsetX    + "px," + offsetY + "px"+(is3D?", 0":"")+") ";
    
    transformCSS += " scale"+(is3D?"3d":"")+"(" + ratio + (is3D? "," + ratio + ",1":"") + ") ";
    
    
    this.bodyRoot.style.MozTransform = transformCSS;
    this.bodyRoot.style.WebkitTransform = transformCSS;
    this.bodyRoot.style.OTransform = transformCSS;
    this.bodyRoot.style.msTransform = transformCSS;
    this.bodyRoot.style.transform = transformCSS;
};

// ----------

Epub3Sliderizer.onOrientationChange = function()
{
    if (this.isEpubReadingSystem() || this.reflow)
    {
        return;
    }

    var viewport = querySelectorZ("head > meta[name=viewport]");
    if (viewport !== null)
    {
        /*
        var sx = this.bodyRoot.clientWidth / window.innerWidth;
        var sy = this.bodyRoot.clientHeight / window.innerHeight;
        var ratio = 1.0 / Math.max(sx, sy);

        var adjustedWidth = this.bodyRoot.clientWidth * ratio;
        var adjustedHeight = this.bodyRoot.clientHeight * ratio;

        var rounded = Math.round( ratio * 1000000.0 ) / 1000000.0;

        var width = Math.round( Math.round( adjustedWidth * 1000000.0 ) / 1000000.0 );
        
        var height = Math.round( Math.round( adjustedHeight * 1000000.0 ) / 1000000.0
        // - (this.staticMode ? 0 : 300)
        );
        */

        var content = viewport.getAttribute('content');
        console.log(content);
                    
//        content = 'width=' + width + ',height=' + height;
//        console.log(content);

        if (content.indexOf('user-scalable') < 0)
        {
            console.log("VIEWPORT");

            viewport.removeAttribute("content");

            viewport.setAttribute('content',
                'width=device-width' +
                ',user-scalable=no' +
                ',initial-scale=' +
                '1' + //rounded
                ',minimum-scale=' +
                '1' + //rounded
                ',maximum-scale=1' //2
                );
                 
            // viewport.setAttribute('content',
            //     content +
            //     ',user-scalable=no' +
            //     ',initial-scale=' +
            //     '1' + //rounded
            //     ',minimum-scale=' +
            //     '1' + //rounded
            //     ',maximum-scale=1' //2
            //     );
        }
    }

    var that = this;
    setTimeout(function()
    {
        that.resetResize();
    }, 20);
};

// ----------

Epub3Sliderizer.initReverse = function()
{
    if (this.thisFilename === null || this.thisFilename === "")
    {
        this.reverse = false;
        return;
    }

    function getRank(fileName)
    {
        var rank = 0;
        
        if (fileName === null || fileName === "")
        {
            return rank;
        }
        
        var unit = 1;
        for (var i = fileName.length-1; i >= 0; i--)
        {
            var c = fileName[i];
            var val = 0;
            var nan = false;
            
            if (c === '0')
            {
                val = 0;
            }
            else if (c === '1')
            {
                val = 1;
            }
            else if (c === '2')
            {
                val = 2;
            }
            else if (c === '3')
            {
                val = 3;
            }
            else if (c === '4')
            {
                val = 4;
            }
            else if (c === '5')
            {
                val = 5;
            }
            else if (c === '6')
            {
                val = 6;
            }
            else if (c === '7')
            {
                val = 7;
            }
            else if (c === '8')
            {
                val = 8;
            }
            else if (c === '9')
            {
                val = 9;
            }
            else
            {
                nan = true;
            }
            
            if (!nan)
            {
                rank += unit * val;
                unit *= 10;
            }
        }
        
        return rank;
    }

    var thisRank = getRank(this.thisFilename);
    var prevRank = this.from === null ? 0 : getRank(this.from);
    
    /*
    console.log("RANK this: " + thisRank);
    console.log("RANK prev: " + prevRank);
    */
    
    if (prevRank >= thisRank)
    {
        this.reverse = true;
        //document.body.classList.add("epb3sldrzr-reverse");
    }
};

// ----------

Epub3Sliderizer.initLinks = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }

    var that = this;

    var nav = document.getElementById("epb3sldrzr-NavDoc");
    if (nav !== null)
    {
        Array.prototype.forEach.call(
            querySelectorAllZ("#epb3sldrzr-content a"),
            function(link)
            {
                if (link.attributes.length <= 0 ||
                    !isDefinedAndNotNull(link.getAttribute('href'))
                )
                {
                    return;
                }

                var href = link.getAttribute('href');
                
                var updatedHref = href + that.urlParams(false);

                link.setAttribute("href", updatedHref);
            }
        );
    }
    
    //    var links = Array.prototype.slice.call(querySelectorAllZ("head > link"));
    //    if (links !== null)
    //    {        
    //        for (var i = 0; i < links.length; i++) { links[i] }


    Array.prototype.forEach.call(
        querySelectorAllZ("head > link"),
        function(link)
        {
            if (link.attributes.length <= 0 ||
                !isDefinedAndNotNull(link.getAttribute('href')) ||
                !isDefinedAndNotNull(link.getAttribute('rel'))
            )
            {
                return;
            }

            var href = link.getAttribute('href');
            var rel = link.getAttribute('rel');
            if (rel === "prev")
            {
                that.prev = href;
            }
            else if (rel === "next")
            {
                that.next = href;
            }
            else if (rel === "first")
            {
                that.first = href;
            }
            else if (rel === "last")
            {
                that.last = href;
            }
            else if (rel === "epub")
            {
                that.epub = href;
            }
            else if (rel === "nav")
            {
                that.toc = href;
            }
            else if (rel === "back")
            {
                that.back = href;
            }
        }
    );


    var slideIndex = querySelectorZ("head > meta[name=slideIndex]");
    if (slideIndex !== null)
    {
        this.slideIndex = parseInt(slideIndex.getAttribute('content'));
    }
    var slideCount = querySelectorZ("head > meta[name=slideCount]");
    if (slideCount !== null)
    {
        this.slideCount = parseInt(slideCount.getAttribute('content'));
    }
    

    var controls = document.getElementById("epb3sldrzr-controls");
        
    var anchor = controls; //this.bodyRoot


    var aa = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
    if (anchor.childNodes.length === 0)
    {
        anchor.appendChild(aa);
    }
    else
    {
        anchor.insertBefore(aa, anchor.childNodes[0]);
    }
    aa.id = "epb3sldrzr-link-toc";
    aa.setAttribute("id", aa.id);
    aa.setAttribute("title", "Slide menu");
    aa.setAttribute("href", "javascript:Epub3Sliderizer.gotoToc();");

    if (this.first !== "")
    {
        var az1 = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
        anchor.insertBefore(az1, anchor.childNodes[0]);
        
        az1.id = "epb3sldrzr-link-first";
        az1.setAttribute("id", az1.id);
        az1.setAttribute("title", "First slide");
        az1.setAttribute("href", "javascript:Epub3Sliderizer.gotoFirst();");
    }
    
    if (this.prev !== "")
    {
        var a1 = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
        anchor.insertBefore(a1, anchor.childNodes[0]);
        
        a1.id = "epb3sldrzr-link-previous";
        a1.setAttribute("id", a1.id);
        a1.setAttribute("title", "Previous slide");
        a1.setAttribute("href", "javascript:Epub3Sliderizer.gotoPrevious_();");
    }
    
    if (this.slideIndex !== -1 && this.slideCount !== -1)
    {
        var sp = document.createElementNS("http://www.w3.org/1999/xhtml", 'span');
        anchor.insertBefore(sp, anchor.childNodes[0]);

        sp.id = "epb3sldrzr-slide-indexCount";
        sp.setAttribute("id", sp.id);
        
        var txt = document.createTextNode(this.slideIndex + '/' + this.slideCount);
        sp.appendChild(txt);
    }
    
    if (this.next !== "")
    {
        var a2 = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
        anchor.insertBefore(a2, anchor.childNodes[0]);

        a2.id = "epb3sldrzr-link-next";
        a2.setAttribute("id", a2.id);
        a2.setAttribute("title", "Next slide");
        a2.setAttribute("href", "javascript:Epub3Sliderizer.gotoNext_();");
    }

    if (this.last !== "")
    {
        var az2 = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
        anchor.insertBefore(az2, anchor.childNodes[0]);
        
        az2.id = "epb3sldrzr-link-last";
        az2.setAttribute("id", az2.id);
        az2.setAttribute("title", "Last slide");
        az2.setAttribute("href", "javascript:Epub3Sliderizer.gotoLast();");
    }
   
        
        
    if (nav !== null && this.epub !== "")
    {
        var a3 = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
        this.bodyRoot.insertBefore(a3, this.bodyRoot.childNodes[0]);
        
        a3.id = "epb3sldrzr-link-epub";
        a3.setAttribute("id", a3.id);
        a3.setAttribute("title", "Download EPUB file");
        a3.setAttribute("href", this.epub);
    }
};


// ----------

Epub3Sliderizer.reAnimateElement = function(elem)
{
    var elm = elem;
    var newOne = elm.cloneNode(true);
    elm.parentNode.replaceChild(newOne, elm);
    
    if (elm === this.bodyRoot)
    {
        this.bodyRoot = newOne;
    }
    else
    {
        for (var i = 0; i < this.incrementals.length; i++)
        {
            if (elm === this.incrementals[i])
            {
                this.incrementals[i] = newOne;
                break;
            }
        }
    }
};

// ----------

Epub3Sliderizer.reAnimateAll = function(element)
{
    var list = [];
    
    var that = this;
    
    Array.prototype.forEach.call(
        element.querySelectorAllZ(".animated"),
        function(elem)
        {
            list.push(elem);
            that.reAnimateElement(elem);
        }
    );

    Array.prototype.forEach.call(
        element.querySelectorAllZ(".epb3sldrzr-animated"),
        function(elem)
        {
            if (list.indexOf(elem) < 0)
            {
                that.reAnimateElement(elem);
            }
        }
    );
};

// ----------

Epub3Sliderizer.checkIncrementalAncestorChain = function(element, active)
{
    var parent = element.parentNode;
    while (parent)
    {
        if (parent.classList && parent.classList.contains("incremental"))
        {
            if (active)
            {
                parent.setAttribute("incremental-active", "true");
            }
            else
            {
console.error("REMOVE");
                parent.removeAttribute("incremental-active");
            }
        }
        
        parent = parent.parentNode;
    }
}

// ----------

Epub3Sliderizer.invalidateIncremental = function(enableAuto, reanimate, auto)
{
    if (this.isEpubReadingSystem())
    {
        return;
    }

    if (this.increment < 0 || this.increment > (this.incrementals.length - 1))
    {
        this.increment = -1;
        
        Array.prototype.forEach.call(
            this.incrementals,
            function(elem)
            {
                elem.parentNode.removeAttribute("incremental-active");
                elem.removeAttribute("aria-selected");
                elem.removeAttribute("aria-activedescendant");
            }
        );
        
        return;
    }

    var scroll = document.getElementById("epb3sldrzr-root");
    
    var fontSize = Math.round(parseFloat(document.body.style.fontSize));
    
    var i = -1;
    var that = this;
    Array.prototype.forEach.call(
        this.incrementals,
        function(elem)
        {
            i++;
    
            if (i < that.increment)
            {
                elem.parentNode.setAttribute("incremental-active", "true");
                that.checkIncrementalAncestorChain(elem.parentNode, true);
                
                elem.removeAttribute("aria-selected");
                elem.setAttribute("aria-activedescendant", "true");
            }
            else if (i > that.increment)
            {
                var thatInc = that.incrementals[that.increment];
                
                var found = false;
                for (var j = 0; j < elem.parentNode.childNodes.length; j++)
                {
                    if (elem.parentNode.childNodes[j] === thatInc)
                    {
                        found = true;
                        break;
                    }
                }
                if (!found)
                {
                    var incParent = thatInc.parentNode;
                    while (incParent)
                    {
                        if (incParent === elem.parentNode)
                        {
                            found = true;
                            break;
                        }
                        
                        incParent = incParent.parentNode;
                    }
                    
                    if (!found)
                    {
                        elem.parentNode.removeAttribute("incremental-active");
                    }
                    //that.checkIncrementalAncestorChain(elem.parentNode, false);
                }
                else
                {
                    elem.parentNode.setAttribute("incremental-active", "true");
                    that.checkIncrementalAncestorChain(elem.parentNode, true);
                }
                
                elem.removeAttribute("aria-selected");
                elem.removeAttribute("aria-activedescendant");
                
                if (enableAuto && (i === that.increment + 1))
                {
                    var previousSiblingWasAuto = true;
                                                
                    var incAdjusted = -1; //that.increment;
                    for (var j = 0; j < elem.parentNode.childNodes.length; j++)
                    {
                        var child = elem.parentNode.childNodes[j];
                        if (child.nodeType != 1)
                        {
                            continue;
                        }
                        
                        if (child.classList && child.classList.contains("auto"))
                        {
                            previousSiblingWasAuto = true;
                        }
                        
                        if (child === elem)
                        {
                            break;
                        }
                    
                        incAdjusted++;
                    }

                    var goAuto =  elem.classList.contains("auto") || (incAdjusted === 0 && elem.parentNode.classList.contains("auto"));
                    
                    if (auto || goAuto)
                    {
                        var cancel = false;    
                        if (!goAuto)
                        {
                            //auto from previous timeout...do we have to break the progression?
                        
                            var par = elem.parentNode;
                            while (par)
                            {
                                if (par.classList && par.classList.contains("incremental"))
                                {
                                    cancel = !par.classList.contains("auto");
                                    break;
                                }
                            
                                par = par.parentNode;
                            }
                            
                            if (cancel && previousSiblingWasAuto)
                            {
                                cancel = false;
                            }
                        }
                    
                        if (!cancel)
                        {
                            var delay = elem.parentNode.getAttribute('data-incremental-delay') || 500;
    
                            var current = i;
                            setTimeout(function()
                            {
                                if (current === that.increment + 1)
                                {
                                    that.incrementIncrementalIndex(false);
                                    that.invalidateIncremental(enableAuto, reanimate, true);
                                }
                            }, delay);
                        }
                    }
                }
            }
            else if (i === that.increment)
            {                
                elem.parentNode.setAttribute("incremental-active", "true");
                that.checkIncrementalAncestorChain(elem.parentNode, true);
                
                elem.setAttribute("aria-selected", "true");
                elem.removeAttribute("aria-activedescendant");

                
                if (fontSize === that.defaultFontSize)
                {
                    var topAlign = false;
                    var center = false;

                    var target = elem;
                    while (target)
                    {
                        if(target === scroll) // || target === document.body || target === document.documentElement)
                        {
                            if (target.offsetHeight < target.scrollHeight)
                            {
                                var totalTop_Elem = 0;
                                var totalTop_Target = 0;
                                
                                var target_ = elem;
                                while (target_)
                                {
                                    totalTop_Elem += target_.offsetTop;
                                    target_ = target_.offsetParent;
                                }
                                
                                target_ = target;
                                while (target_)
                                {
                                    totalTop_Target += target_.offsetTop;
                                    target_ = target_.offsetParent;
                                }
                                
                                //var toScroll = elem.offsetTop - target.offsetTop;
                                var toScroll = totalTop_Elem - totalTop_Target;
                            
                                if (topAlign)
                                {
                                    target.scrollTop = toScroll;
                                }
                                else
                                {
                                    toScroll = 0.0 + toScroll - (target.offsetHeight - elem.offsetHeight) / (center ? 2 : 1);

                                    if (toScroll > 0.0)
                                    {
                                        target.scrollTop = toScroll;
                                    }
                                }
                            }

                            break;
                        }

                        target = target.parentNode;
                    }
                
                    /*
                    if (isDefinedAndNotNull(elem.scrollIntoView))
                    {
                        elem.scrollIntoView(false);
                    
                        setTimeout(function()
                        {
                        }, 0);
                    }
                    */
                }
            
                if (reanimate)
                {
                    that.reAnimateAll(elem);
                }
            }
        }
    );
};

// ----------

Epub3Sliderizer.lastIncremental = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }

    this.increment = this.incrementals.length - 1;

    this.invalidateIncremental(false, false, false);
};

// ----------

Epub3Sliderizer.firstIncremental = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }

    this.increment = 0;
    
    this.invalidateIncremental(true, false, false);
};

// ----------

Epub3Sliderizer.incrementIncrementalIndex = function(reverse)
{
    //var current = this.incrementals[this.increment];
        
    var newInc = this.increment + (reverse ? -1 : 1);
    
    while (newInc > 0 && newInc < (this.incrementals.length - 1))
    {
        var candidate = this.incrementals[newInc];
        if (candidate.classList && candidate.classList.contains("incremental"))
        {
            newInc += (reverse ? -1 : 1);
            continue;
        }
        
        if (!reverse)
        {
            var allChildrenAreIncrementalRoot = true;
            for (var j = 0; j < candidate.childNodes.length; j++)
            {
                var child = candidate.childNodes[j];
                if ((child.nodeType == 3 && child.textContent && child.textContent.replace(/\s/g, "").length !== 0)
					|| (child.nodeType == 1 && (!child.classList || !child.classList.contains("incremental"))))
                {
                    allChildrenAreIncrementalRoot = false;
                    break;
                }
            }
			
            if (allChildrenAreIncrementalRoot)
            {
                newInc++;
                continue;
            }
        }
        
        break;
    }
    
    this.increment = newInc;
}

// ----------

Epub3Sliderizer.nextIncremental = function(backward)
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    if (backward && this.increment < 0)
    {
        this.gotoPrevious();
        return;
    }
    
    if (!backward && this.increment >= (this.incrementals.length - 1))
    {
        this.gotoNext();
        return;
    }

    //this.increment = (backward ? (this.increment - 1) : (this.increment + 1));
    this.incrementIncrementalIndex(backward);
    
    this.invalidateIncremental(!backward, !backward, false);
};

// ----------

Epub3Sliderizer.initAnimations = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    var that = this;
    
    Array.prototype.forEach.call(
        this.bodyRoot.querySelectorAllZ(".epb3sldrzr-animated"),
        function(elem)
        {
//            elem.classList.remove("epb3sldrzr-animated");

//            elem.classList.add("animated"); // STOPPED BY DEFAULT IN CSS (animation-iteration-count: 0) ...
                
            elem.classList.add("epb3sldrzr-animateStart"); // ... THEN, ANIMATES (animation-iteration-count: N)
            
            if (that.bodyRoot !== elem && (that.opera || that.firefox || that.IE))
            {
                that.reAnimateElement(elem);
            }
        }
    );
};

// ----------

Epub3Sliderizer.initSlideTransition = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }

    var animate = !this.opera; //&& !this.IE;
    if (animate &&
        !this.mobile
    )
    {
        if (!this.reverse)
        {
            //this.bodyRoot.classList.add("enterInRight");
            this.bodyRoot.classList.add("fadeIn");
        }
        else
        {
            //this.bodyRoot.classList.add("enterInLeft");
            this.bodyRoot.classList.add("fadeIn");
        }
    
        this.bodyRoot.classList.add("epb3sldrzr-animated");
    //    this.bodyRoot.classList.add("animated");
        this.bodyRoot.classList.add("epb3sldrzr-animateStart");
        

        /*
        if (this.firefox || this.opera)
        {
            this.reAnimateElement(this.bodyRoot);
        }
        */
    }
    else
    {
        this.bodyRoot.style.visibility = "visible";
    }
};

// ----------

Epub3Sliderizer.initMediaOverlays = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    Array.prototype.forEach.call(
        this.bodyRoot.querySelectorAllZ(".epb3sldrzr-epubMediaOverlayActive"),
        function(elem)
        {
            elem.classList.remove("epb3sldrzr-epubMediaOverlayActive");
            
            elem.classList.add("-epub-media-overlay-active");
        }
    );
};

// ----------

Epub3Sliderizer.initIncrementals = function()
{
    if (this.isEpubReadingSystem())
    {
        return;
    }
    
    this.incrementals = this.bodyRoot.querySelectorAllZ(".incremental > *");

    if (this.reverse)
    {
        this.lastIncremental();
    }
    else
    {
        this.firstIncremental();
    }
};

// ----------

Epub3Sliderizer.initLocation = function()
{
    if (!isDefinedAndNotNull(window.location) ||
    !isDefinedAndNotNull(window.location.href))
    {
        return;
    }

    console.log("window.location: " + window.location);
    console.log("window.location.href: " + window.location.href);
    console.log("window.location.search: " + window.location.search);

    var i = window.location.href.lastIndexOf('/');

    var from = null;
    var hash = null;
    var thisFilename = null;

    var len = window.location.href.length;

    if (i >= 0 && i < len-1)
    {
        thisFilename = window.location.href.substring(i+1, len);
    }

    if (thisFilename === null)
    {
        this.thisFilename = thisFilename;
        this.from = from;
        this.hash = hash;
        return;
    }

    i = thisFilename.indexOf('#');
    if (i < 0)
    {
        i = 9999;
    }
    else
    {
        if (i < thisFilename.length-1)
        {
            hash = thisFilename.substring(i+1, thisFilename.length);
        }
    }
    
    var ii = thisFilename.indexOf('?');
    if (ii < 0)
    {
        ii = 9999;
    }

    var iii = thisFilename.indexOf('&');
    if (iii < 0)
    {
        iii = 9999;
    }

    i = Math.min(i, Math.min(ii, iii));

    if (i >= 0 && i < 9999)
    {
        thisFilename = thisFilename.substring(0, i);
    }

    this.thisFilename = thisFilename;
    
    this.hash = hash;
    if (this.hash !== null && this.hash === "")
    {
        this.hash = null;
    }
    
    this.from = getUrlQueryParam("from");
    if (this.from !== null && this.from === "")
    {
        this.from = null;
    }

    console.log("THIS: " + this.thisFilename);
    console.log("FROM: " + this.from);
    console.log("HASH: " + this.hash);
};

// ----------

Epub3Sliderizer.init = function()
{
    var that = this;
            
    console.log("Epub3Sliderizer");
    console.log(window.navigator.userAgent);    

    var fakeEpubReadingSystem = false;

    if (isDefinedAndNotNull(navigator.epubReadingSystem))
    {
        this.epubReadingSystem = navigator.epubReadingSystem;
    }
    else
    {    
        if (!this.basicMode && !this.staticMode && !this.authorMode && this.epubMode)
        {
            fakeEpubReadingSystem = true;
            this.epubReadingSystem = {name: "FAKE epub reader", version: "0.0.1"};
        }
    }
    
    this.kobo = isDefinedAndNotNull(window.KOBO_TAG); // window.nextKoboSpan
    
    if (this.epubReadingSystem !== null)
    {
        console.log(this.epubReadingSystem.name);
        console.log(this.epubReadingSystem.version);
    }
    else
    {
        console.log("!this.epubReadingSystem");
        
        // one last chance (500ms delay)
        if (this.readium || this.kobo || this.ibooks || this.playbooks || this.azardi)
        {
            setTimeout(function()
            {
                if (isDefinedAndNotNull(navigator.epubReadingSystem))
                {
                    that.epubReadingSystem = navigator.epubReadingSystem;
                    console.log(that.epubReadingSystem.name);
                    console.log(that.epubReadingSystem.version);
                }
                else
                {
                    console.log("STILL !this.epubReadingSystem");
                }
            }, 1000);
        }
    }
    
            
    console.log("Readium: " + this.readium);
    console.log("Kobo: " + this.kobo);
    console.log("Apple iBooks: " + this.ibooks);
    console.log("Google Playbooks: " + this.playbooks);
    console.log("Azardi: " + this.azardi);
    
    console.log("htmlNotXHTML: " + this.htmlNotXHTML);
    
    console.log("staticMode: " + this.staticMode);
    console.log("authorMode: " + this.authorMode);
    console.log("basicMode: " + this.basicMode);
    console.log("epubMode: " + this.epubMode);
    console.log("reflow: " + this.reflow);
    
    console.log("mobile: " + this.mobile);
    console.log("android: " + this.android);
    console.log("opera: " + this.opera);
    console.log("IE: " + this.IE);
    

    // document.getElementById("epb3sldrzr-body").style.visibility = "visible";
    // 
    // var root = document.getElementById("epb3sldrzr-content");
    // var info = document.createElementNS("http://www.w3.org/1999/xhtml", 'p');
    // root.insertBefore(info, root.childNodes[0]);
    // 
    // setTimeout(function()
    // {
    //     info.style.backgroundColor = "white";
    //     info.style.color = "black";
    //     info.style.padding = "0.2em";
    // }, 500);
    // 
    // var txt = document.createTextNode(window.location.href.replace(/\//g, " ")); //
    // info.appendChild(txt);
    // 
    // var brk = document.createElementNS("http://www.w3.org/1999/xhtml", 'br');
    // info.appendChild(brk);
    // 
    // var obj = window; //.navigator
    // var str = "";
    // for (var prop in obj) {
    //     if (true || obj.hasOwnProperty(prop)) {
    //         
    //         var p = prop.toLowerCase();
    //         
    //         if (//true ||
    //             (p.indexOf("webkit") < 0
    //             && (
    //             p.indexOf("kobo") >= 0
    //             || p.indexOf("ibooks") >= 0
    //             || p.indexOf("sdk") >= 0
    //             || p.indexOf("bk") >= 0
    //             || p.indexOf("apple") >= 0
    //             || p.indexOf("google") >= 0
    //             || p.indexOf("edition") >= 0
    //             || p.indexOf("book") >= 0
    //             || p.indexOf("page") >= 0
    //         || p.indexOf("epub") >= 0
    //         || p.indexOf("azardi") >= 0
    //         || p.indexOf("igp") >= 0
    //         || p.indexOf("read") >= 0
    //         || p.indexOf("back") >= 0
    //         || p.indexOf("launcher") >= 0
    //         //|| p.indexOf("readium") >= 0
    //         ))
    //     )
    //         {
    //             str += ("\n" + prop);
    //             
    //             var tx = document.createTextNode(prop + " ");
    //             info.appendChild(tx);
    //             
    //             var br = document.createElementNS("http://www.w3.org/1999/xhtml", 'br');
    //             info.appendChild(br);
    //         }
    //     }
    // }
    // //alert(str);
    
    
    
    /*
    TOO SLOW! :(
    (despite CSS HW acceleration)
    
    var scroll = document.getElementById("epb3sldrzr-root");

    if (scroll.offsetHeight < scroll.scrollHeight)
    {
        var iScroll = new IScroll(scroll, { fadeScrollbar: false, bounce: false, preventDefault: false, useTransition: true, useTransform: false });
    }
    */

    /*
    var aa_ = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
    aa_.id = "epb3sldrzr-link-firebug";
    aa_.title = "Firebug";
    aa_.href = "javascript:(function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g+T);E[r](b,u);(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new%20Image;E[r]('src','../js/firebug-lite.js');})(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','https://getfirebug.com/','#startOpened,enableTrace');";
    aa_.innerHTML = "FIREBUG";
    aa_.style.position= "absolute";
    aa_.style.top="0px";
    aa_.style.left="0px";
    aa_.style.zIndex="1000";

    this.bodyRoot.insertBefore(aa_, this.bodyRoot.childNodes[0]);
    */

    
    
    if (document.defaultView && document.defaultView.getComputedStyle)
    {
        var style = document.defaultView.getComputedStyle(document.body,null);
        if (style)
        {
            var fontSize = style.getPropertyValue("font-size");
            
            if (fontSize && fontSize !== "")
            {
                console.log("fontSize (COMPUTED): " + fontSize);

                var size = Math.round(parseFloat(fontSize));
                Epub3Sliderizer.defaultFontSize = size;
                
                if (!this.isEpubReadingSystem())
                {
                    document.body.style.fontSize = fontSize;
    //                console.log(document.body.style.fontSize);
                
                    fontSize = getCookie(Epub3Sliderizer.cookieFontSize);
                    console.log("fontSize (COOKIE): " + fontSize);
                
                    if (fontSize !== null && fontSize !== "")
                    {
                        document.body.style.fontSize = fontSize;
                    }
                    else
                    {
                        setCookie(Epub3Sliderizer.cookieFontSize, document.body.style.fontSize);
                    }
                }
            }
        }
    }

    
//    this.convertContentToMarkdownAndUpdateLocalStorageTextArea_Throttled = throttle(this.convertContentToMarkdownAndUpdateLocalStorageTextArea, 1000, false).bind(this);
    

    if (!this.staticMode && (fakeEpubReadingSystem || !this.isEpubReadingSystem()))
    {
        loadScript(undefined, 'keymaster.js');
        
        loadScript(undefined, 'marked.js');
        loadScript(undefined, 'htmlparser.js');
        setTimeout(function()
        {
            var fetched = that.fetchLocalStorageTextArea();

            if (!fetched && that.authorMode)
            {
                that.AUTHORize();
            }

            key('⌘+d, ctrl+d', function()
            {
                if (hasLocalStorage())
                {
                    for (var i = 0; i < localStorage.length; i++)
                    {
                        var key = localStorage.key(i);
                        if (key === that.thisFilename && confirm("Discard changes to [" + that.thisFilename + "] ?"))
                        {
                            //var data = localStorage.getItem(key);
                            localStorage.removeItem(key);
        
                            console.log(":::: LOCALSTORAGE DELETED: " + key);
                            that.reloadSlide(that.authorMode ? "author" : "");
        
                            return false;
                        }
                    }
                }
            
                return false;
            });
        }, 200);
    }

    if (this.isEpubReadingSystem())
    {
        if (!fakeEpubReadingSystem)
        {
            this.resetOnResizeTransform();
        }

        document.body.classList.add("epb3sldrzr-epubReadingSystem");

//         var controls = document.getElementById("epb3sldrzr-controls");
//         var anchor = controls; //this.bodyRoot
// 
//         if (!anchor)
//         {
//             console.error("cannot find #epb3sldrzr-controls");
//         }
//         else
//         {
//             var a = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
// 
//             if (anchor.childNodes.length === 0)
//             {
//                 anchor.appendChild(a);
//             }
//             else
//             {
//                 anchor.insertBefore(a, anchor.childNodes[0]);
//             }
//         
//             a.id = "epb3sldrzr-link-epubReadingSystem";
//             a.setAttribute("id", a.id);
//             a.setAttribute("title", "EPUB Reading System info");
//         
//             if (this.epubReadingSystem === null)
//             {
//                 if (this.readium)
//                 {
//                     a.setAttribute("href", "javascript:window.alert('Readium')");
//                     a.innerHTML = "Readium";
//                 }
//                 else if (this.kobo)
//                 {
//                     a.setAttribute("href", "javascript:window.alert('Kobo')");
//                     a.innerHTML = "Kobo";
//                 }
//                 else if (this.ibooks)
//                 {
//                     a.setAttribute("href", "javascript:window.alert('iBooks')");
//                     a.innerHTML = "iBooks";
//                 }
//                 else if (this.playbooks)
//                 {
//                     a.setAttribute("href", "javascript:window.alert('Google Play Books')");
//                     a.innerHTML = "Google Play Books";
//                 }
//                 else if (this.azardi)
//                 {
//                     a.setAttribute("href", "javascript:window.alert('Azardi')");
//                     a.innerHTML = "Azardi";
//                 }
//                 else
//                 {
//                     a.setAttribute("href", "javascript:window.alert('??')");
//                     a.innerHTML = "??";
//                 }
//             }
//             else
//             {
//                 a.setAttribute("href", "javascript:window.alert(window.Epub3Sliderizer.epubReadingSystem.name + '_' + window.Epub3Sliderizer.epubReadingSystem.version)");
//                 a.innerHTML = this.epubReadingSystem.name + '_' + this.epubReadingSystem.version;
//             }
//         }

        this.bodyRoot.style.visibility = "visible";
    }
    else if (this.staticMode || this.authorMode)
    {   
        document.body.classList.add("epb3sldrzr-epubReadingSystem");
        
        if (true || this.authorMode)
        {
            if (isDefinedAndNotNull(window.orientation))
            {
                window.onorientationchange = this.onOrientationChange.bind(this);
                this.onOrientationChange();
            }
            else
            {
                window.onresize = this.resetResize.bind(this);
            
                //this.resetResize();
                this.onOrientationChange();
            }
        }
        else
        {
            if (isDefinedAndNotNull(window.orientation))
            {
                this.onOrientationChange();
            }
            else
            {
                //this.resetResize();
                this.onOrientationChange();
            }
        }
        
        this.bodyRoot.style.visibility = "visible";

        if (this.authorMode)
        {
            this.initReverse();
        
            this.initLinks();
        
            window.onkeyup = this.onKeyboard.bind(this);

            if (Epub3Sliderizer.htmlNotXHTML)
            {
                key('⌘+s, ctrl+s', function()
                {
                    var root = document.getElementById("epb3sldrzr-root");
                    root.style.display = "none";
                    Epub3Sliderizer.convertContentToMarkdownAndUpdateLocalStorageTextArea();

                    setTimeout(function()
                    {
                        var contentWrap = document.getElementById("epb3sldrzr-content-wrap");
    
                        $("img", contentWrap).each(function(index)
                        {
                            var $that = $(this);
                            var src = $that.attr("src");
                            if (!src) return;
                            
                            if (src.indexOf(Epub3Sliderizer.imgSrcPrefix) == 0) return;
                            
                            $that.attr("src", Epub3Sliderizer.imgSrcPrefix + src);
                        });
    
                        root.style.display = "block";

                        setTimeout(function()
                        {
                            that.AUTHORize();
                        }, 300);
                    }, 200);
    
                    that.setModifiedStatus(true);
                    
                    return false;
                });
            }
        }
    }
    else
    {
        if (this.basicMode)
        {
            document.body.classList.add("epb3sldrzr-epubReadingSystem");
        }
        
        this.initReverse();
        
        this.initLinks();
        
        //this.toggleControlsPanel();

        window.onkeyup = this.onKeyboard.bind(this);
        
        loadScript(that, 'hammer.min.js');
        window.setTimeout(
            function()
            {
                loadScript(that, 'hammer.fakemultitouch.js');
                loadScript(that, 'hammer.showtouches.js');
                window.setTimeout(
                    function()
                    {
                        if (isDefinedAndNotNull(Hammer))
                        {
                            if (!that.mobile)
                            {
                                if (false && isDefinedAndNotNull(Hammer.plugins.showTouches))
                                {
                                    Hammer.plugins.showTouches();
                                }
                                if (isDefinedAndNotNull(Hammer.plugins.fakeMultitouch))
                                {
                                    Hammer.plugins.fakeMultitouch();
                                }
                            }
    
                            delete Hammer.defaults.stop_browser_behavior.userSelect;
    
                            that.hammer = new Hammer(that.bodyRoot,
                                {
                                    prevent_default: false,
                                    css_hacks: false,
                                    swipe_velocity: 1
                                });
                        }
    
                        that.initTouch();
                    }, 100);
            }, 100);
    
        if (isDefinedAndNotNull(window.orientation))
        {
            window.onorientationchange = this.onOrientationChange.bind(this);
            this.onOrientationChange();
        }
        else
        {
            window.onresize = this.resetResize.bind(this);
            
            //this.resetResize();
            this.onOrientationChange();
        }

        var reflow = getCookie(Epub3Sliderizer.cookieReflow);
        console.log("reflow (COOKIE): " + reflow);
        
        if (reflow !== null && reflow === "TRUE")
        {
            this.toggleReflow();
        }

        this.initMediaOverlays();

        if (!this.basicMode)
        {
            if (this.reflow)
            {
                this.bodyRoot.style.visibility = "visible";
            }
            else
            {
                this.initSlideTransition();
            }

            setTimeout(function()
            {
                that.initIncrementals();
                that.initAnimations();
            }, 500);
        }
        else
        {
            this.initIncrementals();
            this.bodyRoot.style.visibility = "visible";
        }
        
        if (isDefinedAndNotNull($))
        {
            loadScript(that, 'jquery.mousewheel.js');
            window.setTimeout(
                function()
                {
                    if (!isDefinedAndNotNull($(window).mousewheel))
                    {
                        return;
                    }

                    if (!navigator.userAgent.match(/Macintosh/))
                    {
                        return;
                    }

                    $(window).mousewheel(function (event, delta, deltaX, deltaY)
                    {
                        if (that.reflow)
                        {
                            return;
                        }
            
                        deltaY = -deltaY;
    
                        var parents = $(event.target).parents();
    
                        var canScrollLeft = false;
                        var canScrollRight = false;
    
                        var canScrollUp = false;
                        var canScrollDown = false;
            
                        var scrollableX = false;
                        var scrollableY = false;
    
                        var func = function()
                        {
                            var elem = $(this)[0];

                            scrollableX = scrollableX || elem.scrollLeft !== 0;
                            scrollableY = scrollableY || elem.scrollTop !== 0;

                            canScrollLeft = canScrollLeft || deltaX < 0 && (elem.scrollLeft + deltaX) > 0;
        
                            canScrollUp = canScrollUp || deltaY < 0 && (elem.scrollTop + deltaY) > 0;
        
                            canScrollRight = canScrollRight || deltaX > 0 && (elem.scrollLeft + deltaX) < (elem.scrollWidth - elem.offsetWidth);
        
                            canScrollDown = canScrollDown || deltaY > 0 && (elem.scrollTop + deltaY) < (elem.scrollHeight - elem.offsetHeight);
                        };
    
                        $(event.target).each(func);
                        parents.each(func);
    
                        var hasScroll = canScrollLeft || canScrollUp || canScrollRight || canScrollDown;
    
                        if (!hasScroll)
                        {
                            //console.log("MOUSE WHEEL SCROLL");
                            event.preventDefault();
                            event.stopPropagation();
                        }

                        /*
                        console.log("deltaX: "+deltaX);
                        console.log("deltaY: "+deltaY);
    
                        console.log("canScrollLeft: "+canScrollLeft);
                        console.log("canScrollRight: "+canScrollRight);
    
                        console.log("canScrollUp: "+canScrollUp);
                        console.log("canScrollDown: "+canScrollDown);
                        */
    
    
                        var left = deltaX < 0 && deltaX < deltaY;
                        var right = deltaX > 0 && deltaX > deltaY;
                        var up = deltaY < 0 && deltaY < deltaX;
                        var down = deltaY > 0 && deltaY > deltaX;
    
                        if (that.totalZoom === 1)
                        {
                            if (false && // Interferes! :(
                                (
                                    scrollableX && (up || down) ||
                                    scrollableY && (left || right) ||
                                    !scrollableY && !scrollableX
                                ) &&
                                (Math.abs(deltaX) > 40 || Math.abs(deltaY) > 40)
                            )
                            {
                                if (!that.pauseEvents)
                                {
                                    that.pauseEvents = true;
                                    setTimeout(function()
                                    {
                                        that.pauseEvents = false;
                                    }, 1000);
                    
                                    if (left)
                                    {
                                        that.gotoPrevious();
                                    }
                                    else if (right)
                                    {
                                        that.gotoNext();
                                    }
                                    else if (up)
                                    {
                                        that.nextIncremental(true);
                                    }
                                    else if (down)
                                    {
                                        that.nextIncremental(false);
                                    }
                                }
                            }
                        }
                        /*
                        else
                        {
                            //TODO: pan
                        }
                        */
                    });
                }, 100);
        }
    }
};

// ----------

function readyDelayed()
{
    if (Epub3Sliderizer.staticMode || Epub3Sliderizer.basicMode || Epub3Sliderizer.ibooks || Epub3Sliderizer.readium || Epub3Sliderizer.playbooks || Epub3Sliderizer.azardi)
    {
        return;
    }

    Epub3Sliderizer.init();
}

// ----------

function readyFirst()
{
    Epub3Sliderizer.initLocation();

    Epub3Sliderizer.htmlNotXHTML = Epub3Sliderizer.thisFilename && Epub3Sliderizer.thisFilename.indexOf(".html") > 0;
    
    if (window.Element && Element.prototype.attachEvent && !Element.prototype.addEventListener)
    {
        loadScript(undefined, 'addEventListener.js');
    }
    
    if (typeof document !== "undefined" && !("classList" in document.createElementNS("http://www.w3.org/1999/xhtml", "a")))
    {
        loadScript(undefined, 'classList.js');
    }
    
    Epub3Sliderizer.onResizeThrottled = throttle(Epub3Sliderizer.onResize, 60, false).bind(Epub3Sliderizer);
    
    
    Epub3Sliderizer.bodyRoot = document.getElementById("epb3sldrzr-body");
    
    var controls = document.createElementNS("http://www.w3.org/1999/xhtml", 'div');

    //Epub3Sliderizer.bodyRoot.insertBefore(controls, Epub3Sliderizer.bodyRoot.childNodes[0]); BREAKS CFI even node/element indices
    Epub3Sliderizer.bodyRoot.appendChild(controls);
    
    controls.id = "epb3sldrzr-controls";
    controls.setAttribute("id", controls.id);
    //$(controls).attr("id", controls.id);

    var aa = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
    if (controls.childNodes.length === 0)
    {
        controls.appendChild(aa);
    }
    else
    {
        controls.insertBefore(aa, controls.childNodes[0]);
    }
    aa.id = "epb3sldrzr-link-textsize-plus";
    aa.setAttribute("id", aa.id);
    aa.setAttribute("title", "Increase font size");
    aa.setAttribute("href", "javascript:Epub3Sliderizer.increaseFontSize();");

    var az = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
    if (controls.childNodes.length === 0)
    {
        controls.appendChild(az);
    }
    else
    {
        controls.insertBefore(az, controls.childNodes[0]);
    }
    az.id = "epb3sldrzr-link-textsize-reset";
    az.setAttribute("id", az.id);
    az.setAttribute("title", "Reset font size");
    az.setAttribute("href", "javascript:Epub3Sliderizer.resetFontSize();");
    
    var aaa = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
    if (controls.childNodes.length === 0)
    {
        controls.appendChild(aaa);
    }
    else
    {
        controls.insertBefore(aaa, controls.childNodes[0]);
    }
    aaa.id = "epb3sldrzr-link-textsize-minus";
    aaa.setAttribute("id", aaa.id);
    aaa.setAttribute("title", "Decrease font size");
    aaa.setAttribute("href", "javascript:Epub3Sliderizer.decreaseFontSize();");

    var a = document.createElementNS("http://www.w3.org/1999/xhtml", 'a');
    if (controls.childNodes.length === 0)
    {
        controls.appendChild(a);
    }
    else
    {
        controls.insertBefore(a, controls.childNodes[0]);
    }
    a.id = "epb3sldrzr-link-reflow";
    a.setAttribute("id", a.id);
    a.setAttribute("title", "Toggle reflow");
    a.setAttribute("href", "javascript:Epub3Sliderizer.toggleReflow();");
    
    Epub3Sliderizer.readium = isDefinedAndNotNull(window.LauncherUI) || isDefinedAndNotNull(window.ReadiumSDK);
    if (!Epub3Sliderizer.readium)
    {
        var annotationCSS = querySelectorZ("head > link[href='/css/annotations\.css']");
        if (annotationCSS)
        {
            Epub3Sliderizer.readium = true;
        }
        else
        {
            try
            {
                Epub3Sliderizer.readium = isDefinedAndNotNull(window.parent.ReadiumSDK);
            }
            catch(e)
            {
                console.error(e);
            }
        }
    }
    Epub3Sliderizer.ibooks = isDefinedAndNotNull(window.iBooks) || window.location.href && window.location.href.toLowerCase().indexOf("com.apple.bkagentservice") >= 0;
    Epub3Sliderizer.playbooks = isDefinedAndNotNull(window.editions);

    if (Epub3Sliderizer.opera)
    {
        document.body.classList.add("opera");
    }
    if (Epub3Sliderizer.firefox)
    {
        document.body.classList.add("firefox");
    }

    if (Epub3Sliderizer.IE)
    {
        document.body.classList.add("IE");
        
        var ua = navigator.userAgent;
        var re    = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
        if (re.exec(ua) !== null)
        {
            var ver = parseFloat( RegExp.$1 );
            if (ver <= 9.0)
            {
                document.body.classList.add("IE9");
            }
        }
    }
    if (Epub3Sliderizer.mobile)
    {
        document.body.classList.add("mobile");
    }
    
    if (getUrlQueryParam("epub") !== null)
    {
        Epub3Sliderizer.epubMode = true;
    }
    
    if (getUrlQueryParam("static") !== null)
    {
        Epub3Sliderizer.staticMode = true;
        document.body.classList.add("static");
    }
    else if (getUrlQueryParam("author") !== null)
    {
        Epub3Sliderizer.authorMode = true;
        document.body.classList.add("author");

        if (Epub3Sliderizer.ACE)
        {
            loadScript(undefined, 'ace.js');

            setTimeout(function()
            {
                loadScript(undefined, 'mode-markdown.js');
                loadScript(undefined, 'theme-solarized_dark.js');

                loadScript(undefined, 'Markdown.Editor.js');
            }, 200);
        }
        
        loadScript(undefined, 'reMarked.js');
        
        if (Epub3Sliderizer.htmlNotXHTML)
        {
            console.log("AUTHOR MODE, HTML (WYSIWYG CONTENT EDITABLE)");
            
            var contentWrap = document.getElementById("epb3sldrzr-content-wrap");
            contentWrap.setAttribute("contentEditable", 'true');

            // contentWrap.addEventListener("blur", function() { document.designMode = 'off'; }, false);
            // contentWrap.addEventListener("focus", function() { document.designMode = 'on'; }, false);

        
            loadScript(undefined, 'keymaster.js');

            // loadScript(undefined, 'wysiwyg.js');
            // setTimeout(function()
            // {
            //     var wysiwyg = new Wysiwyg();
            //     //$(contentWrap).before(wysiwyg.el);
            //     wysiwyg.el.insertBefore(contentWrap);
            // }, 500);
            
            // loadScript(undefined, 'medium.js');
            // setTimeout(function()
            // {
            //     new Medium({
            //         debug: true,
            //         element: contentWrap,
            //         modifier: 'auto',
            //         placeholder: "",
            //         autofocus: false,
            //         autoHR: false,
            //         mode: 'rich', // inline, partial, rich
            //         maxLength: -1,
            //         modifiers: {
            //             66: 'bold',
            //             73: 'italicize',
            //             85: 'underline',
            //             86: 'paste'
            //         },
            //         tags: {
            //             paragraph: 'p',
            //             outerLevel: ['pre','blockquote', 'figure', 'hr'],
            //             innerLevel: ['a', 'b', 'u', 'i', 'img', 'strong'] // Todo: Convert strong to b (IE)
            //         },
            //         cssClasses: {
            //             editor: 'Medium',
            //             pasteHook: 'Medium-paste-hook',
            //             placeholder: 'Medium-placeholder'
            //         },
            //         attributes: {
            //             remove: ['style','class']
            //         }
            //     });
            // }, 500);
            // 
            // 
            // loadScript(undefined, 'rangy-core.js');
            // loadScript(undefined, 'jquery-ui.min.js');
            // loadScript(undefined, 'hallo.js');
            // 
            // setTimeout(function()
            // {            
            //     $('#epb3sldrzr-content-wrap').hallo(
            //     {
            //         plugins:
            //         {
            //             'halloformat':
            //             {
            //                 "formattings":
            //                 {
            //                     "bold": true,
            //                     "italic": true,
            //                     "strikethrough": true,
            //                     "underline": true
            //                 }
            //             },
            //             'halloheadings':
            //             {
            //                 "headers": [1,2,3,4]
            //             },
            //             "hallojustify":
            //             {
            //             
            //             },
            //             "hallolists":
            //             {
            //                 "lists":
            //                 {
            //                     "ordered": true,
            //                     "unordered": true
            //                 }
            //             },
            //             "halloreundo":
            //             {}
            //       }
            //     });
            // 
            // }, 500);
            // 
            // 
            
// 
// //            loadScript(undefined, 'aloha/lib/vendor/jquery-1.7.2.js');        
// //            loadScript(undefined, 'aloha/lib/require.js');
//             loadScript(undefined, 'aloha/lib/aloha-full.js');
// 
//             // var Aloha = window.Aloha || {};
//             // Aloha.settings = Aloha.settings || {};
//             // // Restore the global $ and jQuery variables of your project's jQuery
//             // Aloha.settings.jQuery = window.jQuery.noConflict(true);
// 
//             setTimeout(function()
//             {
//                 Aloha.jQuery('#epb3sldrzr-content-wrap').aloha();
//             }, 500);

            // loadScript(undefined, 'ckeditor/ckeditor.js');
            // setTimeout(function()
            // {
            //     CKEDITOR.disableAutoInline = true;
            //     
            //     CKEDITOR.inline(contentWrap);
            //     
            //     //var data = CKEDITOR.instances.editable.getData();
            // }, 500);
       }
       else
       {
           console.log("AUTHOR MODE, XHTML (NON-WYSIWYG EDITOR)");
       }
    }
    else if (Epub3Sliderizer.android ||
        (getUrlQueryParam("basic") !== null)
    )
    {
        Epub3Sliderizer.basicMode = true;
        document.body.classList.add("basic");
    }

    if (Epub3Sliderizer.staticMode)
    {
        loadScript(Epub3Sliderizer, 'jquery.blockUI.js');
        
        window.setTimeout(
            function()
            {
                Epub3Sliderizer.init();

                if (isDefinedAndNotNull($) && isDefinedAndNotNull($.blockUI))
                {
                    //$.blockUI.defaults.css = { cursor: "default" };
                    $.blockUI.defaults.overlayCSS.opacity = 0;
                    $.blockUI.defaults.overlayCSS.cursor = "default";
                    $.blockUI({ message: null, css: { border: "none", cursor: "default" } });
                }
            }, 100);
    }
    else if (Epub3Sliderizer.basicMode)
    {
        Epub3Sliderizer.init();
    }
    else
    {
        if (Epub3Sliderizer.ibooks || Epub3Sliderizer.readium || Epub3Sliderizer.playbooks || Epub3Sliderizer.azardi) // KOBO needs delayed
        {
            Epub3Sliderizer.init();
        }
        else
        {
            Epub3Sliderizer.resetResize();
        }
    }
}


window.Epub3Sliderizer = Epub3Sliderizer;
    

// ----------

//window.onload = readyFirst;
document.addEventListener("DOMContentLoaded", function() { readyFirst(); }, false);

// ----------

// Note: the epubReadingSystem object may not be ready when directly using the
// window.onload callback function (from within an (X)HTML5 EPUB3 content document's Javascript code)
// To address this issue, the recommended code is:
// -----
//function readyDelayed() { console.log(navigator.epubReadingSystem); };
// 
// // With jQuery:
// $(document).ready(function () { setTimeout(readyDelayed, 200); });
// 
// // With the window "load" event:
// window.addEventListener("load", function () { setTimeout(readyDelayed, 200); }, false);
// 
// // With the modern document "DOMContentLoaded" event:
document.addEventListener("DOMContentLoaded", function() { setTimeout(readyDelayed, 200); }, false);

})(host.STACK_TRACE, host.querySelectorZ, host.querySelectorAllZ, host.getUrlQueryParam, host.throttle, host.debounce, host.getCookie, host.setCookie);

//####################################################################################################
//####################################################################################################
