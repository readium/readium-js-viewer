describe("Epub.Bindings", function () {

    beforeEach(function () {

        var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
        this.bindingsJson = packageDocumentJson.bindings;
        this.bindings = new Epub.Bindings(this.bindingsJson);
    });

    describe("module structure", function () {

        it("exists in namespace", function () {

            expect(Epub.Binding).toBeDefined();
        });
    });

    describe("initialization", function () {

        it("adds each binding item", function () {

            var bindingsInFixture = 1;
            expect(this.bindings.length).toBe(bindingsInFixture);
        });
    });
});