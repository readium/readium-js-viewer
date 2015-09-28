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

	var processOPDS = function(data, dataSuccess, dataFail) {

		if (typeof data === "string") {
			data = $.parseXML(data);
		}
		
		$xml = $(data);
		
		var json = [];
		
		$xml.find('entry').each(function() {
			var $entry = $(this);
			var title = $entry.find('title').text();
			var author = $entry.find('author').find('name').text();
			var rootUrl = undefined;
			var coverHref = undefined;
			var coverHref_thumb = undefined;
			$entry.find('link').each(function() {
				var $entry = $(this);
				var href  = $entry.attr('href');
				if (href) {
					var t  = $entry.attr('type');
					var rel  = $entry.attr('rel');
					
					if (!rootUrl
						&& t == "application/epub+zip"
						&& rel && rel.indexOf("http://opds-spec.org/acquisition") == 0
						) {
						rootUrl = href;
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
			
			if (!coverHref || coverHref_thumb) {
				coverHref = coverHref_thumb;
			}
			
			if (rootUrl
				&& json.length < 50 // TODO: library view pagination!
			) {
				if (rootUrl.indexOf("http://") != 0 && rootUrl.indexOf("https://") != 0) {
					
					var thisRootUrl = window.location.origin + window.location.pathname;
					
					var indexUrlAbsolute = indexUrl; 
					if (indexUrlAbsolute.indexOf("http://") != 0 && indexUrlAbsolute.indexOf("https://") != 0) {
						try {
							indexUrlAbsolute = new URI(indexUrl).absoluteTo(thisRootUrl).toString();
						} catch(err) {
							console.error(err);
							console.log(indexUrlAbsolute);
						}
					}
					
					try {
						rootUrl = new URI(rootUrl).absoluteTo(indexUrlAbsolute).toString();
					} catch(err) {
						console.error(err);
						console.log(rootUrl);
					}
				}
				
				json.push({
					rootUrl: rootUrl,
					title: title,
					author: author,
					coverHref: coverHref 
				});
			}
		});

		if (json.length) {
			dataSuccess(json);
		} else {
			dataFail();
		}
	};
	
	return {
		tryParse: function(indexUrl, dataSuccess, dataFail) {
			
            if (indexUrl.indexOf("opds://") == 0) {
                indexUrl = indexUrl.replace("opds://", "http://");
            }
            
			$.get(indexUrl, function(data){
				try {
					processOPDS(data, dataSuccess, dataFail);
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
