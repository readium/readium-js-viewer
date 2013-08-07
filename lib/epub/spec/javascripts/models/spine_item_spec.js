describe("Epub.SpineItem", function() {

    beforeEach(function() {

        this.spineItemObject = {
            id: "ch9",
            idref: "ch9",
            properties: "arbitrary property string",
            linear: "arbitrary linear string"
        };

        this.spineItem = new Epub.SpineItem(this.spineItemObject);
    });

    describe("initialization", function() {

        it("instantiates a model", function() {

            expect(this.spineItem).toBeDefined();
        });

        describe("attributes", function () {

            it("creates id", function () {
                expect(this.spineItem.get("id")).toBe("ch9");
            });

            it("creates idref", function () {
                expect(this.spineItem.get("idref")).toBe("ch9");
            });

            it("creates properties", function () {
                expect(this.spineItem.get("properties")).toBe("arbitrary property string");
            });

            it("creates linear", function () {
                expect(this.spineItem.get("linear")).toBe("arbitrary linear string");
            });
        });
    });

    // These'll all get moved to the package document spec

    // describe("isFixedLayout()", function() {

    //     beforeEach(function() {

    //         this.spine_item = new Epub.SpineItem(this.spine_item_attrs);
    //         return this.spine_item.set("media_type", "application/xhtml+xml");
    //     });

    //     it("is fixed layout it it is an image", function() {

    //         spyOn(this.spine_item, "isImage").andReturn(true);
    //         return expect(this.spine_item.isFixedLayout()).toBeTruthy();
    //     });

    //     it("is fixed layout if it is svg", function() {

    //         spyOn(this.spine_item, "isSvg").andReturn(true);
    //         return expect(this.spine_item.isFixedLayout()).toBeTruthy();
    //     });

    //     it("it defaults to checking what the books is", function() {

    //         var collection;
    //         collection = {
    //           isBookFixedLayout: jasmine.createSpy()
    //         };
    //         this.spine_item.collection = collection;
    //         this.spine_item.isFixedLayout();
    //         return expect(collection.isBookFixedLayout).toHaveBeenCalled();
    //     });

    //     it("is fixed layout if its fixed_flow property is set", function() {

    //         this.spine_item.set("fixed_flow", true);
    //         return expect(this.spine_item.isFixedLayout()).toBeTruthy();
    //     });
    // });
});
