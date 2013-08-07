describe("Epub.PageSpreadProperty", function () {

    describe("inferiBooksPageSpread()", function () {

        beforeEach(function () {

            this.pageSpreadDelegate = new Epub.PageSpreadProperty();
        });        

        it("centers the first page", function () {

            var spineIndex = 0;
            var numSpineItems = 10;
            var pageSpreadClass = this.pageSpreadDelegate.inferiBooksPageSpread(spineIndex, numSpineItems);

            expect(pageSpreadClass).toBe("center_page");
        });

        it("centers the last page if it is an even-numbered page", function () {

            var spineIndex = 9;
            var numSpineItems = 10;
            var pageSpreadClass = this.pageSpreadDelegate.inferiBooksPageSpread(spineIndex, numSpineItems);

            expect(pageSpreadClass).toBe("center_page");
        });

        it("assigns right_page to an even-numbered page", function () {

            var spineIndex = 2;
            var numSpineItems = 10;
            var pageSpreadClass = this.pageSpreadDelegate.inferiBooksPageSpread(spineIndex, numSpineItems);

            expect(pageSpreadClass).toBe("right_page");
        });

        it("assigns left_page to an odd-numbered page", function () {
            
            var spineIndex = 3;
            var numSpineItems = 10;
            var pageSpreadClass = this.pageSpreadDelegate.inferiBooksPageSpread(spineIndex, numSpineItems);

            expect(pageSpreadClass).toBe("left_page");
        });
    });

    describe("getPageSpreadFromProperties()", function () { 

        beforeEach(function () {

            this.pageSpreadDelegate = new Epub.PageSpreadProperty();
        });

        it("assigns left_page if property is 'left'", function () {

            var pageSpreadProperty = "left";
            var pageSpreadClass = this.pageSpreadDelegate.getPageSpreadFromProperties(pageSpreadProperty);

            expect(pageSpreadClass).toBe("left_page");
        });

        it("assigns right_page if property is 'right'", function () {

            var pageSpreadProperty = "right";
            var pageSpreadClass = this.pageSpreadDelegate.getPageSpreadFromProperties(pageSpreadProperty);

            expect(pageSpreadClass).toBe("right_page");
        });

        it("assigns center_page if property is 'center'", function () {
            
            var pageSpreadProperty = "center";
            var pageSpreadClass = this.pageSpreadDelegate.getPageSpreadFromProperties(pageSpreadProperty);

            expect(pageSpreadClass).toBe("center_page")
        });

        it("assigns '' for all other property values", function () {
            
            var pageSpreadProperty = "unspecified property value";
            var pageSpreadClass = this.pageSpreadDelegate.getPageSpreadFromProperties(pageSpreadProperty);

            expect(pageSpreadClass).toBe("");
        });
    });

    describe("inferUnassignedPageSpread()", function () {

        describe("page-spread is unspecified on all spine items", function () {

            beforeEach(function () {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document_for_page_spread.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
                this.pageSpreadProperty = new Epub.PageSpreadProperty();
            });

            describe("LTR", function () {

                it("infers first page is left if page prog direction is NOT specified", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(0, this.packageDocument.spine, undefined);
                    expect(pageSpreadClass).toBe("left_page");
                });

                // Based on fixture with 5 spine items
                it("infers page-1 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(0, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-2 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(1, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-3 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(2, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-4 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(3, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-5 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(4, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("left_page");
                });
            });

            describe("RTL", function () {

                // Based on fixture with 5 spine items
                it("infers page-1 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(0, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-2 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(1, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-3 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(2, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-4 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(3, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-5 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(4, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("right_page");
                });
            });
        });

        describe("page-spread is specified on SOME spine items", function () {

            beforeEach(function () {

                var packageDocumentJson = JSON.parse(jasmine.getFixtures().read("package_document_for_page_spread_specified.json"));
                this.packageDocument = new Epub.PackageDocument({ packageDocumentObject : packageDocumentJson });
                this.pageSpreadProperty = new Epub.PageSpreadProperty();
            });

            describe("LTR; page-2 == left; page-4 == right", function () {

                 // Based on fixture with 5 spine items
                it("infers page-1 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(0, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-2 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(1, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-3 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(2, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-4 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(3, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-5 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(4, this.packageDocument.spine, "ltr");
                    expect(pageSpreadClass).toBe("left_page");
                });
            });

            describe("RTL; page-2 == left; page-4 == right", function () {

                // Based on fixture with 5 spine items
                it("infers page-1 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(0, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-2 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(1, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("left_page");
                });

                it("infers page-3 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(2, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-4 is right", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(3, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("right_page");
                });

                it("infers page-5 is left", function () {

                    var pageSpreadClass = this.pageSpreadProperty.inferUnassignedPageSpread(4, this.packageDocument.spine, "rtl");
                    expect(pageSpreadClass).toBe("left_page");
                });
            });
        });
    });
});