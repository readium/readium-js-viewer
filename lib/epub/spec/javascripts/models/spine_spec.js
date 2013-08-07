describe("Epub.Spine", function () {

    beforeEach(function () {

        var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document.json"));
        this.spineJson = packageDocumentJson.spine;
        this.spine = new Epub.Spine(this.spineJson);
    });

    describe("module structure", function () {

        it("exists in namespace", function () {

            expect(Epub.Spine).toBeDefined();
        });
    });

    describe("initialization", function () {

        it("adds each spine item", function () {

            var spineItemsInFixture = 4;
            expect(this.spine.length).toBe(spineItemsInFixture);
        });
    });
});