describe("Epub.Manifest", function () {

    beforeEach(function () {

        var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
        this.manifestJson = packageDocumentJson.manifest;
        this.manifest = new Epub.Manifest(this.manifestJson);
    });

    describe("initialization", function () {

        it("exists in namespace", function () {

            expect(Epub.Manifest).toBeDefined();
        });

        it("adds each manifest item", function () {

            var manifestItemsInFixture = 12;
            expect(this.manifest.length).toBe(manifestItemsInFixture);
        });
    });
});