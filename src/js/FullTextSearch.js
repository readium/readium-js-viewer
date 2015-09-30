define(['./Dialogs',
        'i18nStrings',
        './Keyboard',
        'jquery',
        'hgn!readium_js_viewer_html_templates/search.html',
        'spin',
        'jquery.ui.autocomplete'
    ],

    function (Dialogs,
              Strings,
              Keyboard,
              $,
              SearchDialog,
              Spinner) {

        var newSearch;
        var cfis = [];

        var curCfi;
        var currentCfiIndex = 0;
        var PREVIOUS = "previous";
        var NEXT = "next";
        var direction;


        // todo: host should be configurable 
        //var host = window.location.protocol + '//' + window.location.hostname + ':8081';
        var host = window.location.origin;
        //var host = 'http://localhost:8080';
        var spinner;
        var readium;
        var epubTitle = "";

        var FullTextSearch = function (readiumRef, title) {

            readium = readiumRef;
            epubTitle = title;

            this.init = function () {

                // add search dialog icon to navbar
                $('.navbar-right').prepend(
                    $(SearchDialog({
                    strings: Strings,
                    dialogs: Dialogs,
                    keyboard: Keyboard
                })));

                Keyboard.scope('reader');

                //$("#searchbox").keydown(function (event) {
                //
                //    if (event.which === 13) { // enter key
                //
                //        $("#search-btn-next").trigger("click");
                //    }
                //    event.stopPropagation();
                //});

                $("#searchbox").keyup(function (event) {

                    if (event.which === 13)
                        return;

                    instantSearch();
                    newSearch = true;
                    event.stopPropagation();
                });

                Keyboard.on(Keyboard.FullTextSearchForwards, 'reader', forwards);
                Keyboard.on(Keyboard.FullTextSearchBackwards, 'reader', backwards);

                $("#search-btn-next").click(forwards);
                $("#search-btn-previous").click(backwards);


                Keyboard.on(Keyboard.FullTextSearch, 'reader', function () {
                    $('#search-btn').trigger("click");
                    setFocusOnSearchInput
                });

                $('#search-btn').on('click', setFocusOnSearchInput);

                $('#search-menu').click(function (e) {
                    e.stopPropagation();
                });

                readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function contentLoadedHandler() {

                    if (curCfi)
                        highlightCfi(curCfi);
                });

                setUpSpinner();

            };

            // search forwards
            function forwards() {

                direction = NEXT;

                var q = $("#searchbox").val();

                if (q === "") { //no search string entered
                    signalNoQuery();
                } else {

                    if (newSearch) {
                        sendSearchRequest(q);
                        newSearch = false;
                    } else
                        hightlightNextHit(q);
                }
            }

            // search backwards
            function backwards() {

                direction = PREVIOUS;

                var q = $("#searchbox").val();

                if (q === "") { //no search string entered
                    signalNoQuery();
                } else {

                    if (newSearch) {
                        sendSearchRequest(q);
                        newSearch = false;
                    } else
                        highlightPreviousHit(q);

                }
            }


            function sendSearchRequest(pattern) {

                var request = host + '/search?q=' + pattern + '&t=' + epubTitle;

                spinner.radius = 4;
                spinner.spin($('#search-spinner')[0]);

                $.getJSON(request, '', {})
                    .done(function (hits) {
                        spinner.stop();

                        if (hits && hits.length > 0) {

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

            // looking for suggestions 
            function instantSearch() {

                var q = $("#searchbox").val();
                if (q === '')
                    return;

                var matcher = "/matcher?beginsWith=" + q;
                var title = '&t=' + epubTitle;
                var request = host + matcher + title;

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

            function hightlightNextHit() {

                setNextCfi();

                if (isSameSpineItem())
                    highlightCfi(curCfi);

                readium.reader.openSpineItemElementCfi(getIdref(curCfi), getPartialCfi(curCfi));

            }

            function highlightPreviousHit(pattern) {

                if (pattern === "") {
                    signalNoQuery();
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
                        highlightCfi(curCfi);
                    //console.debug("curCfi: " + curCfi)
                }
            }

            function setCurrentCFI(hits) {

                var curIdref = readium.reader.getLoadedSpineItems()[0].idref;

                for (hit in hits) {

                    if (hits[hit].cfis.length > 0) {

                        if (hit === "0")
                            curCfi = hits[hit].cfis[0];

                        // Try to start hit highlighting (in/near) current spine item.
                        // This realise only "in". How can it realise "near"? 
                        if (curIdref === hits[hit].id) {
                            curCfi = hits[hit].cfis[0];
                            currentCfiIndex = cfis.indexOf(curCfi);
                        }
                    } else
                        console.error("found hit " + hits[hit].id + " without cfi(s)");
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
                            , 600
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

            // refactoring 
            var signalNoQuery = function () {

                var firstKeyDown = true;
                var KeyUpAfterFocusingInput = true;

                $('#searchbox').attr("placeholder", Strings.enter_text);
                $('#searchbox').attr("role", "alert");
                $('#searchbox').addClass("error");

                $('#searchbox').on("keydown", function (event) {

                    if (event.keyCode != 13 && firstKeyDown) {
                        setToDefault();
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
                    setToDefault();
                });

                $('#searchbox').focus();

            };

            function setToDefault() {
                $('#searchbox').removeClass("error");
                $('#searchbox').attr("placeholder", Strings.full_text_search);
                $('#searchbox').removeAttr("role");

            };

            function setFocusOnSearchInput() {
                setTimeout(function () {
                    $('#searchbox')[0].focus();
                }, 100);
            }

            function setUpSpinner() {

                var opts = {
                    lines: 8, // The number of lines to draw
                    length: 2, // The length of each line
                    width: 4, // The line thickness
                    radius: 8, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    direction: 1, // 1: clockwise, -1: counterclockwise
                    color: '#000', // #rgb or #rrggbb or array of colors
                    speed: 1, // Rounds per second
                    trail: 66, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: '72%', // Top position relative to parent in px
                    left: '69%' // Left position relative to parent in px
                };
                spinner = new Spinner(opts);
            }
        };


        return FullTextSearch;
    }
)
;


