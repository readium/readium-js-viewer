
describe("EpubParser.PackageDocumentParser", function() {

    describe("epub_parser_module.js", function () {

        it("can be instantiated", function () {

            var xmlString = jasmine.getFixtures().read("package_document.xml");
            var parser = new EpubParserModule("path/to/packageDocument.xml", xmlString);

            expect(typeof parser).toEqual("object");
        });

        it("parses", function () {

            var xmlString = jasmine.getFixtures().read("package_document.xml");
            var parser = new EpubParserModule("path/to/packageDocument.xml", xmlString);
            var parsingResult = parser.parse();

            expect(typeof parsingResult).toEqual("object");
        });
    });

    beforeEach(function() {

        this.xml_string = jasmine.getFixtures().read('package_document.xml');
        this.parser = new EpubParser.PackageDocumentParser({ 
            packageDocumentURI : "path/to/packageDocument.xml",
            packageDocumentXML : this.xml_string 
        });
    });
  
    describe("initialization", function() {

        it('exists in the proper namespace', function() {
            expect(EpubParser.PackageDocumentParser).toBeDefined();
        });

        it('can be initialized', function() {
            expect(typeof this.parser).toEqual("object");
        });

        it('assigns the package document xml', function() {
            expect(this.parser.get("packageDocumentXML")).toEqual(this.xml_string);
        });
    });

    describe("getJsonSpine", function () {

        beforeEach(function () {
            this.spine = this.parser.getJsonSpine();
            this.arbitrarySpineItemToTest = this.spine[0];
        });

        it('parses the number of spine nodes', function() {
            expect(this.spine.length).toEqual(3);
        });

        it("parses the idref property", function () {
            expect(this.arbitrarySpineItemToTest.idref).toEqual("Page_1");
        });

        it("parses the linear property", function () {
            expect(this.arbitrarySpineItemToTest.linear).toEqual("");
        });

        it("parses the properties property", function () {
            expect(this.arbitrarySpineItemToTest.properties).toEqual("page-spread-right rendition:layout-pre-paginated");
        });
    });

    describe("getJsonMetadata", function () {

        beforeEach(function () {
            this.metadata = this.parser.getJsonMetadata();
        });

        it("parses the active class property", function () {
            expect(this.metadata.active_class).toEqual("-epub-media-overlay-active")
        });

        it("parses the author property", function () {
            expect(this.metadata.author).toEqual("");
        });

        it("parses the description property", function () {
            expect(this.metadata.description).toEqual("Lorem Ipsum Dolor sed");
        });

        it('parses the epub version number', function() {
            expect(this.metadata.epub_version).toEqual("2.0");
        });

        it('parses the identifier', function() {
            expect(this.metadata.id).toEqual("9782035862464");
        });

        it("parses the language property", function () {
            expect(this.metadata.language).toEqual("fr");
        });

        it("parses the layout property", function () {
            expect(this.metadata.layout).toEqual("");
        });

        it("parses the modified_date property", function () {
            expect(this.metadata.modified_date).toEqual("");
        });

        it("parses the ncx property", function () {
            expect(this.metadata.ncx).toEqual("ncx");
        });

        it("parses the orientation property", function () {
            expect(this.metadata.orientation).toEqual("");
        });

        it("parses page_prog_dir property", function () {
            expect(this.metadata.page_prog_dir).toEqual("");
        });

        it("parses the pubdate property", function () {
            expect(this.metadata.pubdate).toEqual("");
        });

        it("parses the publisher property", function () {
            expect(this.metadata.publisher).toEqual("Larousse");
        });

        it("parses the rights property", function () {
            expect(this.metadata.rights).toEqual("");
        });

        it("parses the spread property", function () {
            expect(this.metadata.spread).toEqual("");
        });

        it('parses the title', function() {
            expect(this.metadata.title).toEqual("L'espagnol dans votre poche");
        });
    });

    describe("getJsonManifest", function () {

        beforeEach(function () {
            this.manifest = this.parser.getJsonManifest();
            this.arbitraryManifestItemToTest = this.manifest[3];
        });

        it("parses the entire manifest", function () {
            expect(this.manifest.length).toEqual(10);
        });

        it("parses the href property", function () {
            expect(this.arbitraryManifestItemToTest.href).toEqual("Page_4.html");
        });

        it("parses the contentDocumentUri property", function () {
            expect(this.arbitraryManifestItemToTest.contentDocumentURI).toEqual("path/to/Page_4.html");
        });

        it("parses the id property", function () {
            expect(this.arbitraryManifestItemToTest.id).toEqual("Page_4");
        });

        it("parses the media overlay property", function () {
            expect(this.arbitraryManifestItemToTest.media_overlay).toEqual("Page_4_MO");
        });

        it("parses the media type property", function () {
            expect(this.arbitraryManifestItemToTest.media_type).toEqual("application/xhtml+xml");
        });

        it("parses the manifest properties", function () {
            expect(this.arbitraryManifestItemToTest.properties).toEqual("");
        });
    });

    describe("getJsonBindings", function () {

        beforeEach(function () {
            this.bindings = this.parser.getJsonBindings();
            this.arbitraryBindingToTest = this.bindings[0];
        });

        it("parses the bindings", function() {
            expect(this.bindings.length).toEqual(1);
        });

        it("parses the handler property", function () {
            expect(this.arbitraryBindingToTest.handler).toEqual("figure-gallery-impl");
        });

        it("parses the media_type property", function () {
            expect(this.arbitraryBindingToTest.media_type).toEqual("application/x-epub-figure-gallery");
        });
    });

    describe("parse", function() {

        it("returns a javascript object", function() {
            var type;
            // TODO: callback required?
            this.result = this.parser.parse();
            type = typeof this.result;
            expect(type).toEqual("object");
        });

        it("parses spine item properties", function() {
            var res;
            spyOn(this.parser, "parseSpineProperties");
            // TODO: callback required?
            res = this.parser.parse();
            expect(this.parser.parseSpineProperties).toHaveBeenCalled();
        });

        it("parses the media:active-class metadata", function() {
            // TODO: callback required?
            var res = this.parser.parse();
            expect(res.metadata.active_class).toEqual("-epub-media-overlay-active");
        });
    });

    describe("parseSpineProperties()", function() {

        beforeEach(function() {
            this.spine = [
            {
                idref: 'Page_1',
                properties: 'page-spread-right rendition:layout-pre-paginated'
            }, {
                idref: 'Page_2',
                properties: ''
            }, {
                idref: 'Page_3',
                properties: ''
            }
            ];
            this.res = this.parser.parseSpineProperties(this.spine);
        });

        it("returns an array", function() {
            expect(this.res.length).toBeDefined();
        });

        it("add properties to the spine item if they exist", function() {
            expect(this.res[0].page_spread).toEqual('right');
            expect(this.res[0].fixed_flow).toEqual(true);
        });

        it("leaves the properties string entact", function() {
            expect(this.res[0].properties).toEqual('page-spread-right rendition:layout-pre-paginated');
        });
    });

    describe("paginateBackwards()", function() {

        it("returns false the page-progression-direction attr is not present", function() {

            this.xml_string = jasmine.getFixtures().read('package_document.xml');
            this.parser = new EpubParser.PackageDocumentParser({ packageDocumentXML : this.xml_string });
            var result = this.parser.paginateBackwards();
            expect(result).toBe(false);
        });

        it("returns false if the page-progression-direction attr is ltr", function() {

            this.xml_string = jasmine.getFixtures().read('package_document_ltr.xml');
            this.parser = new EpubParser.PackageDocumentParser({ packageDocumentXML : this.xml_string });
            var result = this.parser.paginateBackwards();
            expect(result).toBe(false);
        });

        it("returns true if the page-progression-direction attr is rtl", function() {

            this.xml_string = jasmine.getFixtures().read('package_document_rtl.xml');
            this.parser = new EpubParser.PackageDocumentParser({ packageDocumentXML : this.xml_string });
            var result = this.parser.paginateBackwards();
            expect(result).toBe(true);
        });
    });

    describe("resolveURI", function () {

        beforeEach(function() {

            this.xml_string = jasmine.getFixtures().read('package_document.xml');
            this.parser = new EpubParser.PackageDocumentParser({ 
                packageDocumentURI : "path/to/packageDoc.xml",
                packageDocumentXML : this.xml_string 
            });
        });

        it("produces absolute path to epub resource", function () {

            var absURI = this.parser.resolveURI("something/something/resource.xhtml");
            expect(absURI).toBe("path/to/something/something/resource.xhtml");
        });

        it("produces absolute path with backward path steps", function () {

            var absURI = this.parser.resolveURI("../../resource.xhtml");
            expect(absURI).toBe("resource.xhtml");
        });
    });
});
