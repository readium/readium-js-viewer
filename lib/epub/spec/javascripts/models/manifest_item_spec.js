describe("Epub.ManifestItem", function() {

    describe("initialization", function() {

        beforeEach(function() {

            this.manifestItemJson = {
                href: "Font/Helvetica-0850.otf",
                id: "id4",
                media_overlay: "mo.smil",
                media_type: "image/svg+xml",
                properties: "arbitrary string"
            };
            this.manifestItem = new Epub.ManifestItem(this.manifestItemJson);
        });

        it("instantiates a model", function() {

            expect(this.manifestItem).toBeDefined();
        });
    });

    describe("attributes", function () {
        
        beforeEach(function() {

            this.manifestItemJson = {
                href: "Font/Helvetica-0850.otf",
                id: "id4",
                media_overlay: "mo.smil",
                media_type: "image/svg+xml",
                properties: "arbitrary string"
            };
            this.manifestItem = new Epub.ManifestItem(this.manifestItemJson);
        });

        it("creates href", function () {
            expect(this.manifestItem.get("href")).toBe("Font/Helvetica-0850.otf");
        });

        it("creates id", function () {
            expect(this.manifestItem.get("id")).toBe("id4");
        });

        it("creates media_overlay", function () {
            expect(this.manifestItem.get("media_overlay")).toBe("mo.smil");
        });

        it("creates media_type", function () {
            expect(this.manifestItem.get("media_type")).toBe("image/svg+xml");
        });

        it("creates properties", function () {
            expect(this.manifestItem.get("properties")).toBe("arbitrary string");
        });
    });

    describe("isImage()", function() {

        beforeEach(function() {

            this.manifestItemJson = {
                href: "Font/Helvetica-0850.otf",
                id: "id4",
                media_overlay: "mo.smil",
                media_type: "image/svg+xml",
                properties: "arbitrary string"
            };
            this.manifestItem = new Epub.ManifestItem(this.manifestItemJson);
        });

        it("is not an image if it is svg", function() {

            this.manifestItem.set("media_type", "image/svg+xml");
            expect(this.manifestItem.isImage()).toBeFalsy();
        });

        it("is not an image if it is not an image", function() {
          
            this.manifestItem.set("media_type", "application/xhtml+xml");
            expect(this.manifestItem.isImage()).toBeFalsy();
        });

        it("is an image if it has a jpeg mime", function() {
            
            this.manifestItem.set("media_type", "image/jpeg");
            expect(this.manifestItem.isImage()).toBeTruthy();
        });

        it("is an image if it has a png mime", function () {

            this.manifestItem.set("media_type", "image/png");
            expect(this.manifestItem.isImage()).toBeTruthy();
        });
    });

    describe("isSvg()", function() {

        beforeEach(function() {

            this.manifestItemJson = {
                href: "Font/Helvetica-0850.otf",
                id: "id4",
                media_overlay: "mo.smil",
                media_type: "image/svg+xml",
                properties: "arbitrary string"
            };
            this.manifestItem = new Epub.ManifestItem(this.manifestItemJson);
        });

        it("is svg if it has an svg mime", function() {

            expect(this.manifestItem.isSvg()).toBeTruthy();
        });
        
        it("is not svg if it does not have an svg mime", function() {

            this.manifestItem.set("media_type", "application/xhtml+xml");
            expect(this.manifestItem.isSvg()).toBeFalsy();
        });
    });
});

