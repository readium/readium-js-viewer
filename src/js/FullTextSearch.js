define(['./Dialogs', 'i18nStrings', './Keyboard', 'jquery', 'jquery.ui.autocomplete'], function (Dialogs, Strings, Keyboard, $) {

    var newSearch;
    var cfis = [];

    var curCfi;
    var currentCfiIndex = 0;
    var PREVIOUS = "previous";
    var NEXT = "next";
    var direction;
    var host = window.location.protocol + '//' + window.location.hostname + ':8081';
    //var host = 'http://localhost:8081';
    
    var FullTextSearch = function (readium) {
        readium = readium;

        this.init = function () {

            Keyboard.scope('reader');

            $("#searchbox").keydown(function (event) {

                if (event.which === 13) { // enter key

                    $("#search-btn-next").trigger("click");
                }
                event.stopPropagation();
            });

            $("#searchbox").keyup(function (event) {

                if (event.which === 13)
                    return;

                instantSearch();
                newSearch = true;
                event.stopPropagation();
            });

            Keyboard.on(Keyboard.FullTextSearchForwards, 'reader', fullTextSearchForwards);
            Keyboard.on(Keyboard.FullTextSearchBackwards, 'reader', fullTextSearchBackwards);

            $("#search-btn-next").click(fullTextSearchForwards);
            $("#search-btn-previous").click(fullTextSearchBackwards);


            Keyboard.on(Keyboard.FullTextSearch, 'reader', function(){$('#search-btn').trigger("click"); setFocusOnSearchInput});

            $('#search-btn').on('click', setFocusOnSearchInput);

            $('#search-menu').click(function(e) {e.stopPropagation();});
            
            readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function contentLoadedHandler() {

                highlightCfi(curCfi);
            });

        };

        function fullTextSearchForwards() {

            direction = NEXT;

            var q = $("#searchbox").val();

            if (q === "") { //no search string entered
                errorNoSearchText();
            } else {

                if (newSearch) {
                    searchRequest(q);
                    newSearch = false;
                } else {
                    findNext(q)
                }

            }
        }

        function fullTextSearchBackwards() {

            direction = PREVIOUS;

            var q = $("#searchbox").val();

            if (q === "") { //no search string entered
                errorNoSearchText();
            } else {

                if (newSearch) {
                    searchRequest(q);
                    newSearch = false;
                } else {
                    findPrevious(q)
                }

            }
        }


        function searchRequest(pattern) {

            var epubTitle = $('#book-title-header').text();
            var request = host + '/search?q=' + pattern + '&t=' + epubTitle;

            $.getJSON(request, '', {})
                .done(function (hits) {

                    if (hits) {

                        //console.log("found " + hits.length + ' hits');
                        setCFIs(hits);
                        setCurrentCFI(hits);
                        highlightCurrentCFI();
                        //highlightCfi("/6/20[id-id2635343]!/4/2[building_a_better_epub]/10/36/22/2,/1:0,/1:4");

                    } else {
                        console.debug("no search result");
                    }
                    console.debug("search request ready");
                })
                .fail(function () {
                    console.error("error fulltext search request");
                });
        }

        function instantSearch() {

            var matcher = "/matcher?beginsWith=" + $("#searchbox").val();
            var request = host + matcher;

            //console.debug(request);

            $.getJSON(request, '', {})
                .done(function (data) {

                    $("#searchbox").autocomplete({
                        source: data,
                        select: function (event) {
                            event.stopPropagation();
                            $("#search-btn-next").trigger("click");
                        }
                    });

                })
                .fail(function () {
                    console.log("error fulltext search request");
                });
        }

        function findNext() {

            setNextCfi();

            if (isSameSpineItem())
                highlightCfi(curCfi);

            readium.reader.openSpineItemElementCfi(getIdref(curCfi), getPartialCfi(curCfi));

        }

        function findPrevious(pattern) {

            if (pattern === "") {
                errorNoSearchText();
                return;
            }
            setPreviousCfi();

            if (isSameSpineItem())
                highlightCfi(curCfi);

            readium.reader.openSpineItemElementCfi(getIdref(curCfi), getPartialCfi(curCfi));
        }

        function highlightCurrentCFI() {

            if (cfis.length !== 0) {

                readium.reader.openSpineItemElementCfi(getIdref(curCfi), getPartialCfi(curCfi));

                var curIdref = readium.reader.getLoadedSpineItems()[0].idref;
                var idref = getIdref(curCfi);
                if (curIdref === idref)
                    highlightCfi(curCfi)
                //console.debug("curCfi: " + curCfi)
            }
        }

        function setCurrentCFI(hits) {

            var curIdref = readium.reader.getLoadedSpineItems()[0].idref;

            for (hit in hits) {

                if (curIdref === hits[hit].id) {

                    if (hits[hit].cfis.length > 0) {
                        curCfi = hits[hit].cfis[0];
                        currentCfiIndex = cfis.indexOf(curCfi);
                    }
                    else
                        console.error("found hit " + hits[hit].id + " without cfi");
                }

            }
        }


        function highlightCfi(cfi) {

            if (!cfi) {
                console.error("cfi not defined");
                return;
            }

            try {
                console.debug("try to hightlight: " + cfi);

                var idref = getIdref(cfi);
                var partialCfi = getPartialCfi(cfi);

                
                // addHightlight() need here a small delay to work correctly 
                // I don`t why 
                setTimeout(function () {

                    readium.reader.plugins.annotations.removeHighlight(999999);
                    readium.reader.plugins.annotations.addHighlight(
                        idref,
                        partialCfi,
                        999999,// Math.floor((Math.random() * 1000000)),
                        "highlight", //"underline"
                        undefined  // styles
                    )
                        ,200
                });
                
                console.debug("hightlight of cfi: " + cfi + " ready");
            } catch (e) {

                console.error(e);
            }
        }

        function setNextCfi() {

            // wrap around:
            // end of the book, we are continue at begin of the book 
            if (currentCfiIndex === (cfis.length - 1))
                currentCfiIndex = 0;

            curCfi = cfis[++currentCfiIndex];
            return curCfi;
        }

        function setPreviousCfi() {


            if (currentCfiIndex === 0)
                currentCfiIndex = cfis.length - 1;

            curCfi = cfis[--currentCfiIndex];
            return curCfi;
        }


        function setCFIs(hits) {

            cfis = [];

            for (hit in hits) {

                if (hits[hit].cfis.length > 0)
                    cfis.push.apply(cfis, hits[hit].cfis);
            }

        }

        function getPartialCfi(cfi) {

            return cfi.split('!')[1];
        }

        function getIdref(cfi) {

            return cfi.split('!')[0].match(/\[(.*?)\]/)[1];
        }


        function isSameSpineItem() {

            var curIdref = readium.reader.getLoadedSpineItems()[0].idref;
            var idref = getIdref(curCfi);

            return curIdref === idref;
        }

        var errorNoSearchText = function () {

            var firstKeyDown = true;
            var KeyUpAfterFocusingInput = true;

            $('#searchbox').attr("placeholder", Strings.enter_text);
            $('#searchbox').attr("role", "alert");
            $('#searchbox').addClass("error");

            $('#searchbox').on("keydown", function (event) {

                if (event.keyCode != 13 && firstKeyDown) {
                    removeErrorNoSearchText();
                }

                firstKeyDown = false;
                KeyUpAfterFocusingInput = false;

            });

            $('#searchbox').on("keyup", function () {
                if (KeyUpAfterFocusingInput) {
                    $('#searchbox').val("");
                }
                KeyUpAfterFocusingInput = false;
            });

            $("#app-navbar").click(function () {
                removeErrorNoSearchText();
            });

            $('#searchbox').focus();

        }

        var removeErrorNoSearchText = function () {
            $('#searchbox').removeClass("error");
            $('#searchbox').attr("placeholder", Strings.full_text_search);
            $('#searchbox').removeAttr("role");

        }

        var setFocusOnSearchInput = function() {
            setTimeout(function(){ $('#searchbox')[0].focus(); }, 100);
        }
    };
    return FullTextSearch;
});


