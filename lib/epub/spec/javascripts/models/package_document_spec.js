describe('Epub.PackageDocument', function() {
    
    describe("module structure", function () {

        it("exists in the namespace", function() {
            
            expect(Epub.PackageDocument).toBeDefined();
        });
    });

    describe("initialization", function() {

        beforeEach(function() {

            var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
            this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
        });

        it("sets the package document object", function () {

            expect(this.packageDocument.get("packageDocumentObject")).toBeDefined();
        });

        it("creates a spine model", function () {

            expect(this.packageDocument.spine).toBeDefined();
        });

        it("adds all the spine items", function () {

            var numSpineItemsInFixture = 4;
            expect(this.packageDocument.spine.length).toBe(numSpineItemsInFixture);
        });

        it("creates a manifest model", function () {

            expect(this.packageDocument.manifest).toBeDefined();
        });

        it("adds all the manifest items", function () {

            var numManifestItemsInFixture = 12;
            expect(this.packageDocument.manifest.length).toBe(numManifestItemsInFixture);
        });

        it("creates a metadata model", function () {

            expect(this.packageDocument.metadata).toBeDefined();
        });
    });

    describe("public interface", function () {

        beforeEach(function() {

            var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
            this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
        });

        describe("getSpineInfo()", function () {

            it("generates the spine info", function () {

                var spineInfo = this.packageDocument.getSpineInfo();

                expect(spineInfo.spine[0].contentDocumentURI).toBe("path/to/Page_1.html");
                expect(spineInfo.spine[2].contentDocumentURI).toBe("path/to/Page_3.html");
                expect(spineInfo.bindings[0].handler).toBe("figure-gallery-impl");
            });
        });

        describe("getManifestItemById()", function () {

            it("finds a manifest item", function () {

                var manifestItemIdFromFixture = "Page_1";
                var manifestItem = this.packageDocument.getManifestItemById(manifestItemIdFromFixture);

                expect(manifestItem).toBeDefined();
                expect(manifestItem.id).toBe(manifestItemIdFromFixture);
            });

            it("is undefined when manifest item is not found", function () {

                var nonExistentId = "this id does not exist";
                var manifestItem = this.packageDocument.getManifestItemById(nonExistentId);

                expect(manifestItem).not.toBeDefined();
            });
        });

        describe("getManifestItemByIdref()", function () {

            it("finds a manifest item with idref", function () {

                var manifestItemIdrefFromFixture = "Page_1";
                var manifestItem = this.packageDocument.getManifestItemById(manifestItemIdrefFromFixture);

                expect(manifestItem).toBeDefined();
                expect(manifestItem.id).toBe(manifestItemIdrefFromFixture);
            });
        });

        describe("getSpineItem()", function () {

            it("is undefined for: spineIndex < 0", function () {

                var spineItem = this.packageDocument.getSpineItem(-1);

                expect(spineItem).not.toBeDefined();
            });

            it("gets the first spine item for: spineIndex = 0", function () {

                var spineItem = this.packageDocument.getSpineItem(0);
                var firstSpineItemIdrefInFixture = "Page_1";

                expect(spineItem.idref).toBe(firstSpineItemIdrefInFixture);
            });

            it("gets the last spine item for: spineIndex = length - 1", function () {

                var spineItem = this.packageDocument.getSpineItem(3);
                var lastSpineItemIdrefInFixture = "htmltoc";

                expect(spineItem.idref).toBe(lastSpineItemIdrefInFixture);
            });

            it("is undefined for: spineIndex > length - 1", function () {

                var spineItem = this.packageDocument.getSpineItem(4);

                expect(spineItem).not.toBeDefined();
            });
        });

        describe("spineLength()", function () {

            it("gets the spine length", function () {

                var spineLengthInFixture = 4;
                var spineLength = this.packageDocument.spineLength();

                expect(spineLength).toBe(spineLengthInFixture);
            });
        });

        describe("getNextLinearSpinePosition()", function () {

            beforeEach(function () {

                var packageDocumentObject = JSON.parse(jasmine.getFixtures().read("package_document_for_linear.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentObject });
            });

            it("gets the next linear position", function () {

                var startSpineIndex = 1;
                var expectedSpineIndex = 2;
                var foundSpineIndex = this.packageDocument.getNextLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).toBe(expectedSpineIndex);
            });

            it("is undefined if there is no next spine item", function () {

                var startSpineIndex = 7;
                var foundSpineIndex = this.packageDocument.getNextLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).not.toBeDefined();
            });

            it("finds the next linear position for: spineIndex < 0", function () {

                var startSpineIndex = -1;
                var expectedSpineIndex = 0;
                var foundSpineIndex = this.packageDocument.getNextLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).toBe(expectedSpineIndex);
            });

            it("is undefined for: spineIndex > spineLength - 1", function () {

                var startSpineIndex = 8;
                var foundSpineIndex = this.packageDocument.getNextLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).not.toBeDefined();
            });

            it("ignores non-linear positions", function () {

                var startSpineIndex = 2;
                var expectedSpineIndex = 4;
                var foundSpineIndex = this.packageDocument.getNextLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).toBe(expectedSpineIndex);
            });
        });

        describe("getPrevLinearSpinePosition()", function () {

            beforeEach(function () {

                var packageDocumentObject = JSON.parse(jasmine.getFixtures().read("package_document_for_linear.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentObject });
            });

            it("gets the previous linear position", function () {

                var startSpineIndex = 2;
                var expectedSpineIndex = 1;
                var foundSpineIndex = this.packageDocument.getPrevLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).toBe(expectedSpineIndex);
            });

            it("is undefined if there is no previous spine item", function () {

                var startSpineIndex = 0;
                var foundSpineIndex = this.packageDocument.getPrevLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).not.toBeDefined();
            });

            it("is undefined for: spineIndex < 0", function () {

                var startSpineIndex = -1;
                var foundSpineIndex = this.packageDocument.getPrevLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).not.toBeDefined();
            });

            it("finds the previous position for: spineIndex > spineLength - 1", function () {

                var startSpineIndex = 8;
                var expectedSpineIndex = 7;
                var foundSpineIndex = this.packageDocument.getPrevLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).toBe(expectedSpineIndex);
            });

            it("ignores non-linear positions", function () {

                var startSpineIndex = 4;
                var expectedSpineIndex = 2;
                var foundSpineIndex = this.packageDocument.getPrevLinearSpinePosition(startSpineIndex);

                expect(foundSpineIndex).toBe(expectedSpineIndex);
            });
        });

        describe("pageProgressionDirection()", function () {

        });

        describe("hasNextSection()", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("has a next section if one exists", function () {

                var hasNextSection = this.packageDocument.hasNextSection(0);
                expect(hasNextSection).toBe(true);
            });

            it("does not if current section is invalid", function () {

                var hasNextSection = this.packageDocument.hasNextSection(undefined);
                expect(hasNextSection).toBe(false);
            });

            it("does not if at last section", function () {

                var hasNextSection = this.packageDocument.hasNextSection(3);
                expect(hasNextSection).toBe(false);
            });
        });

        describe("hasPrevSection()", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("has a previous section if one exists", function () {

                var hasPrevSection = this.packageDocument.hasPrevSection(1);
                expect(hasPrevSection).toBe(true);
            });

            it("does not if current section is invalid", function () {

                var hasPrevSection = this.packageDocument.hasPrevSection(undefined);
                expect(hasPrevSection).toBe(false);
            });

            it("does not if at first section", function () {

                var hasPrevSection = this.packageDocument.hasPrevSection(0);
                expect(hasPrevSection).toBe(false);
            });
        });

        describe("getSpineItemByIdref()", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("finds a spine item with idref", function () {

                var manifestItemIdrefFromFixture = "Page_1";
                var spineItem = this.packageDocument.getSpineItemByIdref(manifestItemIdrefFromFixture);

                expect(spineItem).toBeDefined();
                expect(spineItem.idref).toBe(manifestItemIdrefFromFixture);
            });
        });

        describe("getSpineIndex()", function () {
            
            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("gets the index of a spine item", function () {

                var spineItem = this.packageDocument.spine.at(1);
                expect(this.packageDocument.getSpineIndex(spineItem)).toBe(1);
            });
        });

        describe("getSpineIndexByHref()", function () {
            
            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("get the index of a spine item", function () {

                var manifestHref = "Page_1.html";
                expect(this.packageDocument.getSpineIndexByHref(manifestHref)).toBe(0);
            });
        });

        describe("getBindingByHandler()", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("gets the binding", function () {

                var handler = "figure-gallery-impl";
                var foundHandler = this.packageDocument.getBindingByHandler(handler);
                expect(foundHandler.handler).toBe(handler);
            });

            it("is undefined when binding doesn't exist", function () {

                var handler = "";
                var foundHandler = this.packageDocument.getBindingByHandler(handler);
                expect(foundHandler).not.toBeDefined(); 
            });
        });

        describe("getBindingByIdref()", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("gets the binding", function () {

                var handler = "figure-gallery-impl";
                var foundHandler = this.packageDocument.getBindingByHandler(handler);
                expect(foundHandler.handler).toBe(handler);
            });

            it("is undefined when binding doesn't exist", function () {

                var handler = "";
                var foundHandler = this.packageDocument.getBindingByHandler(handler);
                expect(foundHandler).not.toBeDefined(); 
            });
        });

        describe("getPackageDocumentDOM", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                var packageDocumentXML = jasmine.getFixtures().read("package_document.xml");
                this.packageDocument = new Epub.PackageDocument({ 
                    packageDocumentObject : packageDocumentJson,
                    packageDocument : packageDocumentXML
                });
            });

            it("gets the package document dom", function () {

                var packageDocumentDOM = this.packageDocument.getPackageDocumentDOM();
                expect(packageDocumentDOM).toBeDefined();
            });
        });

        describe("getToc", function () {

            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("gets the url of toc", function () {
                
                var handler = "path/to/bk01-toc.xhtml";
                var tocUrl = this.packageDocument.getToc();
                expect(tocUrl).toBe(handler);
            });
        });

        describe("generateTocListDOM()", function () {

            var packageDocument;
            beforeEach(function() {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
            });

            it("generates DOM TOC from NCX XML", function () {

                var ncxTocXML = jasmine.getFixtures().read("wasteland.ncx");
                var orderedList = packageDocument.generateTocListDOM(ncxTocXML);

                expect($("a", orderedList).length).toBe(6);
            });

            it("generates DOM TOC from nested NCX XML", function () {

                var ncxTocXML = jasmine.getFixtures().read("nested_wasteland.ncx");
                var orderedList = packageDocument.generateTocListDOM(ncxTocXML);

                expect($("a", orderedList).length).toBe(6);
                expect($("ol", orderedList).length).toBe(2); // Two internal ordered lists of nested elements
            });
        });

        describe("tocIsNcx()", function () {

            it("is true when TOC is NCX", function () {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document_ncx.json"));
                var packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });

                expect(packageDocument.tocIsNcx()).toBe(true);
            });

            it("is false when TOC is XHTML", function () {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
                var packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });

                expect(packageDocument.tocIsNcx()).toBe(false);
            });
        });
    });

    describe("private helpers", function () {

        // These are basic tests, as each of these cases is tested more thoroughly for the page spread property delegate
        describe("assignPageSpreadClass()", function () {

             describe("FXL epub is Apple fixed", function () {

                beforeEach(function () {

                    var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document_apple_fixed.json"));
                    this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
                    this.packageDocument.assignPageSpreadClass();
                });

                it("infers page-1 is right", function () {

                    this.packageDocument.spine.at(0).get("pageSpreadClass") === "right_page";
                });

                it("infers page-2 is left", function () {

                    this.packageDocument.spine.at(1).get("pageSpreadClass") === "left_page";
                });

                it("infers page-3 is right", function () {

                    this.packageDocument.spine.at(2).get("pageSpreadClass") === "right_page";
                });
             });

             describe("FXL epub; page-1:right; page-2:right; page-3:left", function () {

                beforeEach(function () {

                    var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document_FXL_specified.json"));
                    this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
                    this.packageDocument.assignPageSpreadClass();
                });

                it("infers page-1 is right", function () {

                    this.packageDocument.spine.at(0).get("pageSpreadClass") === "right_page";
                });

                it("infers page-2 is right", function () {

                    this.packageDocument.spine.at(1).get("pageSpreadClass") === "right_page";
                });

                it("infers page-3 is left", function () {

                    this.packageDocument.spine.at(2).get("pageSpreadClass") === "left_page";
                });
             });

             describe("FXL epub has no page-spread specified", function () {

                beforeEach(function () {

                    var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document_FXL_not_specified.json"));
                    this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
                    this.packageDocument.assignPageSpreadClass();
                });

                it("infers page-1 is left", function () {

                    this.packageDocument.spine.at(0).get("pageSpreadClass") === "left_page";
                });

                it("infers page-2 is right", function () {

                    this.packageDocument.spine.at(1).get("pageSpreadClass") === "right_page";
                });

                it("infers page-3 is left", function () {

                    this.packageDocument.spine.at(2).get("pageSpreadClass") === "left_page";
                });
             });
        });      
    });
});
