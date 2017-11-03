define([
'./ModuleConfig',
'jquery',
'readium_shared_js/helpers',
'URIjs'
],

function(
moduleConfig,
$,
Helpers,
URI){

    var processOPDS = function(opdsURL, data, dataSuccess, dataFail) {

        var CORS_PROXY_HTTP_TOKEN = "/http://";
        var CORS_PROXY_HTTPS_TOKEN = "/https://";
        
        // Ensures URLs like http://crossorigin.me/http://domain.com/etc
        // do not end-up loosing the double forward slash in http://domain.com
        // (because of URI.absoluteTo() path normalisation)
        var CORS_PROXY_HTTP_TOKEN_ESCAPED = "/http%3A%2F%2F";
        var CORS_PROXY_HTTPS_TOKEN_ESCAPED = "/https%3A%2F%2F";
        
        // case-insensitive regexp for percent-escapes
        var regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED = new RegExp("/(http[s]?):%2F%2F", "gi");
        
        var xOriginProxy = undefined;
        
        var origin = window.location.origin; 
        if (!origin) {
            origin = window.location.protocol + '//' + window.location.host;
        }
        var thisRootUrl = origin + window.location.pathname;
        
        var opdsURLAbsolute = opdsURL; 

        var opdsURLAbsoluteUri = undefined;
        try {
            opdsURLAbsoluteUri = new URI(opdsURLAbsolute);
        } catch(err) {
            console.error(err);
            console.log(opdsURLAbsolute);
        }
        
        if (opdsURLAbsoluteUri && !opdsURLAbsoluteUri.is("absolute")) { // "http://", "https://", "data:", etc.

            try {
                opdsURLAbsolute = opdsURLAbsoluteUri.absoluteTo(thisRootUrl).toString();
            } catch(err) {
                console.error(err);
                console.log(opdsURLAbsolute);
            }
        } else {
        
            var ihttp = opdsURLAbsolute.indexOf(CORS_PROXY_HTTP_TOKEN);
            if (ihttp < 0) {
                ihttp = opdsURLAbsolute.indexOf(CORS_PROXY_HTTPS_TOKEN);
            }
            if (ihttp > 0) {
                xOriginProxy = opdsURLAbsolute.substr(0, ihttp);
                console.log("-- Detected CORS proxy: " + xOriginProxy);
            }
        }
        
        if (typeof data === "string") {
            data = $.parseXML(data);
        }
        
        $xml = $(data);
        
        var json = [];
        
        $xml.find('entry').each(function() {
            var $entry = $(this);
            
            var title = $entry.find('title').text();
            var author = $entry.find('author').find('name').text();
            
            var coverHref = undefined;
            var coverHref_thumb = undefined;
            
            var rootUrl_EPUBAcquisition = undefined;
            var rootUrl_EPUBAcquisitionIndirect = undefined;
            var rootUrl_SubOPDS = undefined;
                    
            $entry.find('link').each(function() {
                var $link = $(this);
                
                var href  = $link.attr('href');
                if (href) {
                    if (href.indexOf("//") == 0) {
                        href = "http:" + href;
                    }
                    
                    var t  = $link.attr('type');
                    var rel  = $link.attr('rel');
                
                    var hasAcquisition = rel && rel.indexOf("http://opds-spec.org/acquisition") == 0;
                    
                    if (hasAcquisition) {
                        if (t) {
                            if (t.indexOf("application/epub") >= 0) {
                                rootUrl_EPUBAcquisition = href;
                            }
                            if (t.indexOf("text/html") >= 0) {
                                rootUrl_EPUBAcquisitionIndirect = href;
                            }
                        } else {
                            if (/\.epub[3?]$/.test(href)) {
                                rootUrl_EPUBAcquisition = href;
                            }
                        }
                    } else {
                        if (t && t.indexOf("application/epub") >= 0) {
                            rootUrl_EPUBAcquisition = href;
                        }
                    }
                    
                    if (t && t.indexOf("application/atom+xml") >= 0) {
                        if (!rootUrl_SubOPDS || rel == "subsection")
                        {
                            rootUrl_SubOPDS = href;
                        }
                    }
                    
                    if (t && t.indexOf("image/") == 0) {
                        
                        if (rel == "http://opds-spec.org/image" || rel == "x-stanza-cover-image") {
                            coverHref = href;
                        } else if (rel == "http://opds-spec.org/image/thumbnail" || rel == "x-stanza-cover-image-thumbnail") {
                            coverHref_thumb = href;
                        }
                    }
                }
            });
            
            if (rootUrl_EPUBAcquisition || rootUrl_EPUBAcquisitionIndirect) {
                rootUrl_SubOPDS = undefined;
            }
            
            if (rootUrl_EPUBAcquisition) {
                rootUrl_EPUBAcquisitionIndirect = undefined;
            }
            
            if (!author && rootUrl_SubOPDS) {
                $xml.find('author').each(function() {
                    var $author = $(this);
                    
                    var name = $author.find('name').text();
                    if (name) {
                        author = name;
                    }
                });
            }
            
            if (!coverHref || coverHref_thumb) {
                coverHref = coverHref_thumb;
            }
            
            if (coverHref) {
                
                var coverHrefUri = undefined;
                try {
                    coverHrefUri = new URI(coverHref);
                } catch(err) {
                    console.error(err);
                    console.log(coverHref);
                }
                
                if (coverHrefUri && !coverHrefUri.is("absolute")) { // "http://", "https://", "data:", etc.

                    var opdsURLAbsolute_ = opdsURLAbsolute;
                    if (xOriginProxy) {
                        //console.log("Removing CORS proxy from URL: " + opdsURLAbsolute_);
                        opdsURLAbsolute_ = opdsURLAbsolute_.replace(xOriginProxy + "/", "");
                    }
                    
                    try {
                        coverHref = coverHrefUri.absoluteTo(opdsURLAbsolute_).toString();
                    } catch(err) {
                        console.error(err);
                        console.log(coverHref);
                    }
                }
            }
            
            var rootUrl = rootUrl_EPUBAcquisition || rootUrl_EPUBAcquisitionIndirect || rootUrl_SubOPDS;
            if (rootUrl) {
                console.log("OPDS entry URL: " + rootUrl);
                
                var isExternalLink = (typeof rootUrl_EPUBAcquisitionIndirect) != "undefined"; //(rootUrl == rootUrl_EPUBAcquisitionIndirect);
                var isSubLibraryLink = (typeof rootUrl_SubOPDS) != "undefined"; //(rootUrl == rootUrl_SubOPDS);

                var rootUrlUri = undefined;
                try {
                    rootUrlUri = new URI(rootUrl);
                } catch(err) {
                    console.error(err);
                    console.log(rootUrl);
                }
                
                if (rootUrlUri && !rootUrlUri.is("absolute")) { // "http://", "https://", "data:", etc.

                    var opdsURLAbsolute_ = opdsURLAbsolute;
                    if (xOriginProxy) {
                        if (isExternalLink) {
                            console.log("Removing CORS proxy from URL: " + opdsURLAbsolute_);
                            opdsURLAbsolute_ = opdsURLAbsolute_.replace(xOriginProxy + "/", "");
                        } else {
                            opdsURLAbsolute_ = opdsURLAbsolute_.replace(CORS_PROXY_HTTP_TOKEN, CORS_PROXY_HTTP_TOKEN_ESCAPED);
                            opdsURLAbsolute_ = opdsURLAbsolute_.replace(CORS_PROXY_HTTPS_TOKEN, CORS_PROXY_HTTPS_TOKEN_ESCAPED);
                        }
                    }

                    try {
                        rootUrl = rootUrlUri.absoluteTo(opdsURLAbsolute_).toString();
                    } catch(err) {
                        console.error(err);
                        console.log(rootUrl);
                        console.log(opdsURLAbsolute_);
                    }
                    
                    if (xOriginProxy) {
                        if (!isExternalLink) {
                            rootUrl = rootUrl.replace(regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED, "/$1://");
                        }
                    }
                    
                    console.log("OPDS entry URL (absolute): " + rootUrl);
                    
                } else if (!isExternalLink) { 
                    if (xOriginProxy) {
                        rootUrl = xOriginProxy + "/" + rootUrl;
                        console.log("Adding CORS proxy to URL: " + rootUrl);
                    }
                }

                if (json.length < 50) { // TODO: library view pagination! (better list / grid UI)
                    json.push({
                        rootUrl: rootUrl,
                        title: title,
                        author: author,
                        coverHref: coverHref,
                        
                        isSubLibraryLink: isSubLibraryLink ? true : undefined,
                        isExternalLink: isExternalLink ? true : undefined
                    });
                }
            }
        });

        if (json.length) {
            dataSuccess(json);
        } else {
            dataFail();
        }
    };
    
    return {
        tryParse: function(opdsURL, dataSuccess, dataFail) {
            
            if (opdsURL.indexOf("opds://") == 0) {
                opdsURL = opdsURL.replace("opds://", "http://");
            } else if (opdsURL.indexOf("/opds://") > 0) {
                opdsURL = opdsURL.replace("/opds://", "/http://");
            }
            
            $.get(opdsURL, function(data){
                try {
                    processOPDS(opdsURL, data, dataSuccess, dataFail);
                } catch(err) {
                    console.error(err);
                    dataFail();
                }
            }).fail(function(){
                dataFail();
            });
        }
    };
});