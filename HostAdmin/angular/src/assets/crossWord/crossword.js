
/**
* Jesse Weisbeck's Crossword Puzzle (for all 3 people left who want to play them)
*
*/



function buildCrosswordPuzzle(inputData, identifier) {
    (function ($) {
        $(function () {
            $(identifier).empty();
            $(identifier).crossword(inputData, identifier);
        })
    })(jQuery)
}

(function ($) {
    $.fn.crossword = function (inputData, identifier) {
        /*
            Qurossword Puzzle: a javascript + jQuery crossword puzzle
            "light" refers to a white box - or an input

            DEV NOTES:
            - activePosition and activeClueIndex are the primary vars that set the ui whenever there's an interaction
            - 'Entry' is a puzzler term used to describe the group of letter inputs representing a word solution
            - This puzzle isn't designed to securely hide answerers. A user can see answerers in the js source
                - An xhr provision can be added later to hit an endpoint on keyup to check the answerer
            - The ordering of the array of problems doesn't matter. The position & orientation properties is enough information
            - Puzzle authors must provide a starting x,y coordinates for each entry
            - Entry orientation must be provided in lieu of provided ending x,y coordinates (script could be adjust to use ending x,y coords)
            - Answers are best provided in lower-case, and can NOT have spaces - will add support for that later
        */
        puzz = {}
        outpuzz = {}
        // put data array in object literal to namespace it into safety
        outpuzz.data = JSON.parse(JSON.stringify(inputData));
        outpuzz.data.sort(function (a, b) {
            return a.position - b.position;
        })
        puzz.data = inputData;
        // append clues markup after puzzle wrapper div
        // This should be moved into a configuration object
        $('#puzzle-clues').remove();

        var acrossCount = inputData.filter(function (item) { return item.orientation === 'across'; }).length;
        var downCount = inputData.filter(function (item) { return item.orientation === 'down'; }).length;

        if ((acrossCount === 1 || acrossCount > 1) && downCount === 0) {
            this.after('<div id="puzzle-clues"><div id="acc"><h2>Across</h2><ul id="across"></ul></div></div>');
        }

        if ((downCount === 1 || downCount > 1) && acrossCount === 0) {
            this.after('<div id="puzzle-clues"><div id="do"><h2>Down</h2><ul id="down"></ul></div></div>');
        }

        if (acrossCount >= 1 && downCount >= 1) {
            this.after('<div id="puzzle-clues"><h2>Across</h2><ol id="across"></ol><h2>Down</h2><ol id="down"></ol></div>');
        }

        // intialize some variables

        var tbl = ['<table id="puzzle">'],
            puzzEl = this,
            clues = $('#puzzle-clues'),
            clueLiEls,
            coords,
            entryCount = puzz.data.length,
            entries = [],
            rows = [],
            cols = [],
            solved = [],
            tabindex,
            $actives,
            activePosition = 0,
            activeClueIndex = 0,
            currOri,
            targetInput,
            mode = 'interacting',
            solvedToggle = false,
            z = 0,
            relativePostitions = [],
            currentCoOrds = "",
            currentValue = "";

        var puzInit = {

            init: function () {
                // window.alert('init')
                currOri = 'across'; // app's init orientation could move to config object

                // Reorder the problems array ascending by POSITION
                if (puzz.data.length > 1) {
                    puzz.data.sort(function (a, b) {
                        return a.position - b.position;
                    });
                }

                // Set keyup handlers for the 'entry' inputs that will be added presently
                puzzEl.delegate('input', 'keyup', function (e) {
                    mode = 'interacting';

                    var inputValue = $(this).val().toLowerCase();
                    $(this).val(inputValue);
                    // need to figure out orientation up front, before we attempt to highlight an entry
                    switch (e.which) {
                        case 39:
                        case 37:
                            currOri = 'across';
                            break;
                        case 38:
                        case 40:
                            currOri = 'down';
                            break;
                        default:
                            break;
                    }

                    if (e.keyCode === 9) {
                        return false;
                    } else if (
                        e.keyCode === 37 ||
                        e.keyCode === 38 ||
                        e.keyCode === 39 ||
                        e.keyCode === 40 ||
                        e.keyCode === 8 ||
                        e.keyCode === 46) {



                        if (e.keyCode === 8 || e.keyCode === 46) {

                            puzInit.checkAnswer(e, true);
                        } else {
                            nav.nextPrevNav(e);
                        }

                        e.preventDefault();
                        return false;
                    } else {

                        // console.log('input keyup: ' + solvedToggle);

                        puzInit.checkAnswer(e, false);

                    }

                    e.preventDefault();
                    return false;
                });

                // tab navigation handler setup
                puzzEl.delegate('input', 'keydown', function (e) {

                    if (e.keyCode === 9) {

                        mode = "setting ui";
                        if (solvedToggle) solvedToggle = false;

                        //puzInit.checkAnswer(e)
                        nav.updateByEntry(e);

                    } else {
                        return true;
                    }

                    e.preventDefault();

                });

                // tab navigation handler setup
                puzzEl.delegate('input', 'click', function (e) {
                    mode = "setting ui";
                    if (solvedToggle) solvedToggle = false;

                    //console.log('input click: ' + solvedToggle);

                    nav.updateByEntry(e);
                    e.preventDefault();

                });


                // click/tab clues 'navigation' handler setup
                clues.delegate('li', 'click', function (e) {
                    mode = 'setting ui';

                    if (!e.keyCode) {
                        nav.updateByNav(e);
                    }
                    e.preventDefault();
                });


                // highlight the letter in selected 'light' - better ux than making user highlight letter with second action
                puzzEl.delegate('#puzzle', 'click', function (e) {
                    $(e.target).focus();
                    $(e.target).select();
                });

                // DELETE FOR BG
                puzInit.calcCoords();

                // Puzzle clues added to DOM in calcCoords(), so now immediately put mouse focus on first clue
                clueLiEls = '#puzzle-clues li';
                $('#' + currOri + ' li').eq(0).addClass('clues-active').focus();

                // DELETE FOR BG
                puzInit.buildTable();
                puzInit.buildEntries();

            },

            /*
                - Given beginning coordinates, calculate all coordinates for entries, puts them into entries array
                - Builds clue markup and puts screen focus on the first one
            */
            calcCoords: function () {
                /*
                    Calculate all puzzle entry coordinates, put into entries array
                */
                for (var i = 0, p = entryCount; i < p; ++i) {
                    // set up array of coordinates for each problem
                    entries.push(i);
                    entries[i] = [];

                    for (var x = 0, j = puzz.data[i].answerlength; x < j; ++x) {
                        entries[i].push(x);
                        coords = puzz.data[i].orientation === 'across' ? "" + puzz.data[i].startx++ + "," + puzz.data[i].starty + "" : "" + puzz.data[i].startx + "," + puzz.data[i].starty++ + "";
                        entries[i][x] = coords;
                    }

                    // while we're in here, add clues to DOM!
                    $('#' + puzz.data[i].orientation).append('<li tabindex="1" data-position="' + i + '">' + puzz.data[i].clue + '</li>');
                }

                // Calculate rows/cols by finding max coords of each entry, then picking the highest
                for (var i = 0, p = entryCount; i < p; ++i) {
                    for (var x = 0; x < entries[i].length; x++) {
                        cols.push(entries[i][x].split(',')[0]);
                        rows.push(entries[i][x].split(',')[1]);
                    };
                }

                rows = Math.max.apply(Math, rows) + "";
                cols = Math.max.apply(Math, cols) + "";

            },

            /*
                Build the table markup
                - adds [data-coords] to each <td> cell
            */
            buildTable: function () {
                for (var i = 1; i <= rows; ++i) {
                    tbl.push("<tr>");
                    for (var x = 1; x <= cols; ++x) {
                        tbl.push('<td data-coords="' + x + ',' + i + '"></td>');
                    };
                    tbl.push("</tr>");
                };

                tbl.push("</table>");
                puzzEl.append(tbl.join(''));
            },

            /*
                Builds entries into table
                - Adds entry class(es) to <td> cells
                - Adds tabindexes to <inputs>
            */
            buildEntries: function () {
                // window.alert('build entries')
                var puzzCells = '#puzzle td',
                    light,
                    $groupedLights,
                    hasOffset = false,
                    positionOffset = entryCount - puzz.data[puzz.data.length - 1].position; // diff. between total ENTRIES and highest POSITIONS

                for (var x = 1, p = entryCount; x <= p; ++x) {

                    for (var i = 0; i < entries[x - 1].length; ++i) {
                        light = $(puzzCells + '[data-coords="' + entries[x - 1][i] + '"]');

                        // check if POSITION property of the entry on current go-round is same as previous.
                        // If so, it means there's an across & down entry for the position.
                        // Therefore you need to subtract the offset when applying the entry class.
                        if (x > 1) {
                            if (puzz.data[x - 1].position === puzz.data[x - 2].position) {
                                hasOffset = true;
                            };
                        }

                        if (identifier == "#questionnaire-reviewer-puzzle-wrapper" || identifier == "#create-Question-puzzle-wrapper") {
                            if ($(light).empty()) {
                                $(light)
                                    .addClass('entry-' + (hasOffset ? x - positionOffset : x) + ' position-' + (x - 1))
                                    .append('<input maxlength="1" disabled val="" type="text" tabindex="-1" />');
                            }
                        }
                        else {
                            if ($(light).empty()) {
                                $(light)
                                    .addClass('entry-' + (hasOffset ? x - positionOffset : x) + ' position-' + (x - 1))
                                    .append('<input maxlength="1" val="" type="text" tabindex="-1" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" /> ');
                            }
                        }

                    };

                };

                if (identifier == '#test-taker-puzzle-wrapper') {
                    for (var x = 1, p = entryCount; x <= p; ++x) {
                        var letters = puzz.data[x - 1].useranswer.split('');
                        if (letters.length > 0) {
                            for (var i = 0; i < entries[x - 1].length && i < letters.length; ++i) {
                                light = $(puzzCells + '[data-coords="' + entries[x - 1][i] + '"] input');
                                $(light).val(letters[i])
                            };
                        }
                    };
                }
                else if (identifier == '#create-Question-puzzle-wrapper' || identifier == '#questionnaire-reviewer-puzzle-wrapper') {
                    for (var x = 1, p = entryCount; x <= p; ++x) {
                        var letters = puzz.data[x - 1].answer.split('');
                        if (letters.length > 0) {
                            for (var i = 0; i < entries[x - 1].length && i < letters.length; ++i) {
                                light = $(puzzCells + '[data-coords="' + entries[x - 1][i] + '"] input');
                                $(light).val(letters[i])
                            };
                        }
                    };
                }

                var filteredArray = $.grep(puzz.data, function (obj, index) {
                    return jQuery.inArray(obj.position, $.map(puzz.data, function (obj2) {
                        return obj2.position;
                    })) === index;
                });
                if (entryCount > filteredArray.length) {
                    for (var i = 0, j = 0, p = entryCount; i < p; ++i) {
                        $groupedLights = $('.position-' + i);
                        if (!$('.position-' + i + ':eq(0) span').length) {
                            $groupedLights.eq(0)
                                .append('<span>' + filteredArray[j++].position + '</span>');
                        }
                    }
                }
                else {
                    for (var i = 0, j = 0, p = entryCount; i < p; ++i) {
                        $groupedLights = $('.position-' + i);
                        if (!$('.position-' + i + ':eq(0) span').length) {
                            $groupedLights.eq(0)
                                .append('<span>' + filteredArray[j++].position + '</span>');
                        }
                    }
                }            // Put entry number in first 'light' of each entry, skipping it if already present

                util.highlightEntry();
                util.highlightClue();
                $('.active').eq(0).focus();
                $('.active').eq(0).select();

            },


            /*
                - Checks current entry input group value against answer
                - If not complete, auto-selects next input for user
            */
            checkAnswer: function (e, status) {

                var currVal;

                util.getActivePositionFromClassGroup($(e.target));


                currVal = $('.position-' + activePosition + ' input')
                    .map(function () {
                        let value = $(this).val().toLowerCase();
                        return value !== '' ? $(this)
                            .val()
                            .toLowerCase() : ' ';

                    })
                    .get()
                    .join('');

                //console.log(currVal + " " + valToCheck);
                // if (valToCheck === currVal) {
                //     $('.active')
                //         .addClass('done')
                //         .removeClass('active');

                //     $('.clues-active').addClass('clue-done');

                //     solved.push(valToCheck);
                //     solvedToggle = true;
                //     return;
                // }
                if (status) {
                    currOri === 'across' ? nav.nextPrevNav(e, 37) : nav.nextPrevNav(e, 38);
                }
                else {
                    currOri === 'across' ? nav.nextPrevNav(e, 39) : nav.nextPrevNav(e, 40);
                }

                if (currVal.trim().length > 0) {
                    outpuzz.data[activePosition].useranswer = currVal;
                }
                else {
                    outpuzz.data[activePosition].useranswer = "";
                }
                if (identifier == '#test-taker-puzzle-wrapper') {
                    for (i = 0; i < relativePostitions.length; i++) {
                        var index = $.inArray(currentCoOrds, entries[relativePostitions[i]]);
                        if (outpuzz.data[relativePostitions[i]].useranswer == "") {
                            var newString = outpuzz.data[relativePostitions[i]].useranswer + " ".repeat(outpuzz.data[relativePostitions[i]].answerlength);
                            var outArray = newString.split('');
                            outArray[index] = currentValue;
                            outpuzz.data[relativePostitions[i]].useranswer = outArray.join('');
                        }
                        else {
                            var outArray = outpuzz.data[relativePostitions[i]].useranswer.split('');
                            outArray[index] = currentValue;
                            outpuzz.data[relativePostitions[i]].useranswer = outArray.join('');
                        }
                    }

                    var element = document.querySelector('app-crossword-puzzle');
                    element.dispatchEvent(new CustomEvent('crosswordpuzzleEvent', { detail: outpuzz.data }));
                }

                //z++;
                //console.log(z);
                //console.log('checkAnswer() solvedToggle: '+solvedToggle);

            }


        }; // end puzInit object


        var nav = {

            nextPrevNav: function (e, override) {

                var len = $actives.length,
                    struck = override ? override : e.which,
                    el = $(e.target),
                    p = el.parent(),
                    ps = el.parents(),
                    selector;

                util.getActivePositionFromClassGroup(el);
                util.highlightEntry();
                util.highlightClue();

                $('.current').removeClass('current');

                selector = '.position-' + activePosition + ' input';

                //console.log('nextPrevNav activePosition & struck: '+ activePosition + ' '+struck);

                // move input focus/select to 'next' input
                switch (struck) {
                    case 39:
                        p
                            .next().hasClass('position-' + activePosition) ?
                            p
                                .next()
                                .find('input')
                                .addClass('current')
                                .select() : p;

                        break;

                    case 37:
                        p
                            .prev().hasClass('position-' + activePosition) ?
                            p
                                .prev()
                                .find('input')
                                .addClass('current')
                                .select() : p;

                        break;

                    case 40:
                        ps
                            .next('tr')
                            .find(selector)
                            .addClass('current')
                            .select();

                        break;

                    case 38:
                        ps
                            .prev('tr')
                            .find(selector)
                            .addClass('current')
                            .select();

                        break;

                    default:
                        break;
                }

            },

            updateByNav: function (e) {
                var target;

                $('.clues-active').removeClass('clues-active');
                $('.active').removeClass('active');
                $('.current').removeClass('current');
                currIndex = 0;

                target = e.target;
                activePosition = $(e.target).data('position');

                util.highlightEntry();
                util.highlightClue();

                $('.active').eq(0).focus();
                $('.active').eq(0).select();
                $('.active').eq(0).addClass('current');

                // store orientation for 'smart' auto-selecting next input
                currOri = $('.clues-active').parent('ol').prop('id');

                activeClueIndex = $(clueLiEls).index(e.target);
                //console.log('updateByNav() activeClueIndex: '+activeClueIndex);

            },

            // Sets activePosition var and adds active class to current entry
            updateByEntry: function (e, next) {
                var classes, next, clue, e1Ori, e2Ori, e1Cell, e2Cell;

                if (e.keyCode === 9 || next) {
                    // handle tabbing through problems, which keys off clues and requires different handling
                    activeClueIndex = activeClueIndex === clueLiEls.length - 1 ? 0 : ++activeClueIndex;

                    $('.clues-active').removeClass('.clues-active');

                    next = $(clueLiEls[activeClueIndex]);
                    currOri = next.parent().prop('id');
                    activePosition = $(next).data('position');

                    // skips over already-solved problems
                    util.getSkips(activeClueIndex);
                    activePosition = $(clueLiEls[activeClueIndex]).data('position');


                } else {
                    activeClueIndex = activeClueIndex === clueLiEls.length - 1 ? 0 : ++activeClueIndex;

                    util.getActivePositionFromClassGroup(e.target);

                    clue = $(clueLiEls + '[data-position=' + activePosition + ']');
                    activeClueIndex = $(clueLiEls).index(clue);

                    currOri = clue.parent().prop('id');

                }

                util.highlightEntry();
                util.highlightClue();

                //$actives.eq(0).addClass('current');
                //console.log('nav.updateByEntry() reports activePosition as: '+activePosition);
            }

        }; // end nav object


        var util = {
            highlightEntry: function () {
                // this routine needs to be smarter because it doesn't need to fire every time, only
                // when activePosition changes
                $actives = $('.active');
                $actives.removeClass('active');
                $actives = $('.position-' + activePosition + ' input').addClass('active');
                $actives.eq(0).focus();
                $actives.eq(0).select();
            },

            highlightClue: function () {
                var clue;
                $('.clues-active').removeClass('clues-active');
                $(clueLiEls + '[data-position=' + activePosition + ']').addClass('clues-active');

                if (mode === 'interacting') {
                    clue = $(clueLiEls + '[data-position=' + activePosition + ']');
                    activeClueIndex = $(clueLiEls).index(clue);
                };
            },

            getClasses: function (light, type) {
                if (!light.length) return false;

                var classes = $(light).prop('class').split(' '),
                    classLen = classes.length,
                    positions = [];

                // pluck out just the position classes
                for (var i = 0; i < classLen; ++i) {
                    if (!classes[i].indexOf(type)) {
                        positions.push(classes[i]);
                    }
                }

                return positions;
            },

            getActivePositionFromClassGroup: function (el) {

                classes = util.getClasses($(el).parent(), 'position');

                if (classes.length > 1) {
                    // get orientation for each reported position
                    e1Ori = $(clueLiEls + '[data-position=' + classes[0].split('-')[1] + ']').parent().prop('id');
                    e2Ori = $(clueLiEls + '[data-position=' + classes[1].split('-')[1] + ']').parent().prop('id');

                    // test if clicked input is first in series. If so, and it intersects with
                    // entry of opposite orientation, switch to select this one instead
                    e1Cell = $('.position-' + classes[0].split('-')[1] + ' input').index(el);
                    e2Cell = $('.position-' + classes[1].split('-')[1] + ' input').index(el);

                    if (mode === "setting ui") {
                        currOri = e1Cell === 0 ? e1Ori : e2Ori; // change orientation if cell clicked was first in a entry of opposite direction
                    }

                    if (e1Ori === currOri) {
                        activePosition = classes[0].split('-')[1];
                    } else if (e2Ori === currOri) {
                        activePosition = classes[1].split('-')[1];
                    }
                } else {
                    activePosition = classes[0].split('-')[1];
                }
                currentCoOrds = "";
                currentValue = "";
                relativePostitions = [];
                currentCoOrds = $(el).parent().attr("data-coords").toString();
                currentValue = $(el).val().toString();
                for (var n = 0; n < classes.length; n++) {
                    if (activePosition != parseInt(classes[n].split('-')[1])) {
                        relativePostitions.push(parseInt(classes[n].split('-')[1]));
                    }
                }
                //console.log('getActivePositionFromClassGroup activePosition: ' + activePosition);

            },

            checkSolved: function (valToCheck) {
                for (var i = 0, s = solved.length; i < s; i++) {
                    if (valToCheck === solved[i]) {
                        return true;
                    }

                }
            },

            getSkips: function (position) {
                if ($(clueLiEls[position]).hasClass('clue-done')) {
                    activeClueIndex = position === clueLiEls.length - 1 ? 0 : ++activeClueIndex;
                    util.getSkips(activeClueIndex);
                } else {
                    return false;
                }
            }

        }; // end util object


        puzInit.init();


    }

})(jQuery);
