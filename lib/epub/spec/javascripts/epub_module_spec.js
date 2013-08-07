describe("EpubModule.js", function () {

    beforeEach(function() {

        var packageDOCXML = jasmine.getFixtures().read("package_document.xml");
        var packageDocumentObject = JSON.parse(jasmine.getFixtures().read("package_document.json"));
        this.currEpub = new EpubModule(packageDocumentObject, packageDOCXML);
    });

    describe("initialization", function () {
        
        it("can be instantiated", function () {
            
            expect(typeof this.currEpub).toBe("object");
        });
    });

    describe("public interface", function () {

        it("can return a dom version of the package document", function () {

            expect(this.currEpub.getPackageDocumentDOM()).toBeDefined();
        }); 
    });
});