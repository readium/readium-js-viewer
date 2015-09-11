define(['jquery', 'jxpath'], function($, JXPath){
    var resolver = function( prefix ) {
            var mappings = { 
                def: "http://www.idpf.org/2007/opf",
                    dc: "http://purl.org/dc/elements/1.1/"
            };
            return mappings[ prefix ];
    };

    PackageParser = {
        parsePackageDom : function(data){
            
            var jsonObj = {

                metadata:  { 
                        id: $.xpath(data, "//def:metadata/dc:identifier", resolver).text(),
                        epub_version: $.xpath(data, "//def:package/@version", resolver).val(),
                        title: $.xpath(data, "//def:metadata/dc:title", resolver).text(),
                        author: $.xpath(data, "//def:metadata/dc:creator", resolver).text(),
                        publisher: $.xpath(data, "//def:metadata/dc:publisher", resolver).text(),
                        description: $.xpath(data, "//def:metadata/dc:description", resolver).text(),
                        rights: $.xpath(data, "//def:metadata/dc:rights", resolver).text(),
                        language: $.xpath(data, "//def:metadata/dc:language", resolver).text(),
                        pubdate: $.xpath(data, "//def:metadata/dc:date", resolver).text(),
                        modified_date: $.xpath(data, "//def:metadata/def:meta[@property='dcterms:modified']", resolver).text(),
                        layout: $.xpath(data, "//def:metadata/def:meta[@property='rendition:layout']", resolver).text(),
                        spread: $.xpath(data, "//def:metadata/def:meta[@property='rendition:spread']", resolver).text(),
                        orientation: $.xpath(data, "//def:metadata/def:meta[@property='rendition:orientation']", resolver).text(),
                        ncx: $.xpath(data, "//def:spine/@toc", resolver).val(),
                        page_prog_dir: $.xpath(data, "//def:spine/@page-progression-direction", resolver).val(),
                        active_class: $.xpath(data, "//def:metadata/def:meta[@property='media:active-class']", resolver).text()
                 }
/* UNUSED
                manifest:
                (function() {
                    var array = [];
                    $.xpath(data, "//def:item", resolver).each(function(item) {
                        array.push({
                            id: $.xpath(item, "@id", resolver).val(),
                            href: $.xpath(item, "@href", resolver).val(),
                            media_type: $.xpath(item, "@media-type", resolver).val(),
                            properties: $.xpath(item, "@properties", resolver).val(),
                            media_overlay: $.xpath(item, "@media-overlay", resolver).val()
                        });
                    });
                    return array;
                })(),
                
                spine:
                (function() {
                    var array = [];
                    $.xpath(data, "//def:itemref", resolver).each(function(item) {
                        array.push({
                            idref: $.xpath(item, "@idref", resolver).val(),
                            properties: $.xpath(item, "@properties", resolver).val(),
                            linear: $.xpath(item, "@linear", resolver).val()
                        });
                    });
                    return array;
                })(),
                
                bindings:
                (function() {
                    var array = [];
                    $.xpath(data, "//def:bindings/def:mediaType", resolver).each(function(item) {
                        array.push({
                            handler: $.xpath(item, "@handler", resolver).val(),
                            media_type: $.xpath(item, "@media-type", resolver).val()
                        });
                    });
                    return array;
                })()
*/
            };
    
            jsonObj = jsonObj.metadata;

//console.debug(JSON.stringify(jsonObj));
            
            jsonObj.coverHref = PackageParser.getCoverHref(data);
            return jsonObj;
        },
        getCoverHref : function(dom) {
            var manifest; var $imageNode;
            manifest = dom.getElementsByTagName('manifest')[0];

            // epub3 spec for a cover image is like this:
            /*<item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />*/
            $imageNode = $('item[properties~="cover-image"]', manifest);
            if($imageNode.length === 1 && $imageNode.attr("href") ) {
                return $imageNode.attr("href");
            }

            // some epub2's cover image is like this:
            /*<meta name="cover" content="cover-image-item-id" />*/
            // PragProg ebooks have two cover entries in meta, both
            // referencing the same cover id from items; metaNode.length
            // does not have to be just 1
            var metaNode = $('meta[name="cover"]', dom);
            var contentAttr = metaNode.attr("content");
            if(metaNode.length >= 1 && contentAttr) {
                $imageNode = $('item[id="'+contentAttr+'"]', manifest);
                if($imageNode.length === 1 && $imageNode.attr("href")) {
                    return $imageNode.attr("href");
                }
            }

            // that didn't seem to work so, it think epub2 just uses item with id=cover
            $imageNode = $('#cover', manifest);
            if($imageNode.length === 1 && $imageNode.attr("href")) {
                return $imageNode.attr("href");
            }

            // seems like there isn't one, thats ok...
            return null;
        },
    }
    return PackageParser;
})