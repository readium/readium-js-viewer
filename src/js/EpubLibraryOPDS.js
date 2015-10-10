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

		var thisRootUrl = window.location.origin + window.location.pathname;
		
		var opdsURLAbsolute = opdsURL; 
		if (opdsURLAbsolute.indexOf("http://") != 0 && opdsURLAbsolute.indexOf("https://") != 0) {
			try {
				opdsURLAbsolute = new URI(opdsURL).absoluteTo(thisRootUrl).toString();
			} catch(err) {
				console.error(err);
				console.log(opdsURLAbsolute);
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
					var t  = $link.attr('type');
					var rel  = $link.attr('rel');
				
					var hasAcquisition = rel && rel.indexOf("http://opds-spec.org/acquisition") == 0;
					
					if (hasAcquisition && t) {
						if (t.indexOf("application/epub+zip") >= 0) {
							rootUrl_EPUBAcquisition = href;
						}
						if (t.indexOf("text/html") >= 0) {
							rootUrl_EPUBAcquisitionIndirect = href;
						}
					}
					
					if (t && t.indexOf("application/atom+xml") >= 0) {
						rootUrl_SubOPDS = href;
					}
					
					if (t && t.indexOf("image/") == 0) {
						
						if (rel == "http://opds-spec.org/image") {
							coverHref = href;
						} else if (rel == "http://opds-spec.org/image/thumbnail") {
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
				if (coverHref.indexOf("http://") != 0 && coverHref.indexOf("https://") != 0) {
					
					try {
						coverHref = new URI(coverHref).absoluteTo(opdsURLAbsolute).toString();
					} catch(err) {
						console.error(err);
						console.log(coverHref);
					}
				}
			}
			
			var rootUrl = rootUrl_EPUBAcquisition || rootUrl_EPUBAcquisitionIndirect || rootUrl_SubOPDS;
			
			if (rootUrl) {
				if (rootUrl.indexOf("http://") != 0 && rootUrl.indexOf("https://") != 0) {
					
					try {
						rootUrl = new URI(rootUrl).absoluteTo(opdsURLAbsolute).toString();
					} catch(err) {
						console.error(err);
						console.log(rootUrl);
					}
				}
				
				if (json.length < 50) { // TODO: library view pagination!
					json.push({
						rootUrl: rootUrl,
						title: title,
						author: author,
						coverHref: coverHref,
						
						isSubLibraryLink: rootUrl_SubOPDS ? true : undefined,
						isExternalLink: rootUrl_EPUBAcquisitionIndirect ? true : undefined
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
