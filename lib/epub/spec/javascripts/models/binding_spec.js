describe("Epub.Binding", function() {

    beforeEach(function() {

        this.bindingObject = {
            handler : "figure-gallery-impl",
            media_type : "application/x-epub-figure-gallery"
        };

        this.binding = new Epub.Binding(this.bindingObject);
    });

    describe("initialization", function() {

        it("instantiates a model", function() {

            expect(this.binding).toBeDefined();
        });

        describe("attributes", function () {

            it("creates handler", function () {
                expect(this.binding.get("handler")).toBe("figure-gallery-impl");
            });

            it("creates media_type", function () {
                expect(this.binding.get("media_type")).toBe("application/x-epub-figure-gallery");
            });
        });
    });
});
