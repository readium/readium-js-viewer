    /**
     *  Append a message to the speciiied elm
     *
     * @param elm
     * @param msg
     */
	function logMsg( elm, msg ) {
        // Need to reduce the size of the scrollable area by one line-height
        var fontSize = getComputedStyle(elm).getPropertyValue("font-size");
        fontSize = fontSize.substr(0,fontSize.indexOf("px"));

		elm.style.height = (window.frameElement.offsetHeight - fontSize) + "px";
    	var newMsg = document.createTextNode(msg);
    	elm.appendChild(newMsg);
    	elm.appendChild(document.createElement("br"));
    	elm.scrollTop = elm.scrollHeight;
	}

    /**
     * Pad an integer with the specified number of leading zeroes.
     *
     * @param num
     * @param places
     * @returns {string}
     */
    function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }

    /**
     *  Return a nicely formatted, UNIX-style string
     *
     * @returns {string}
     */
    function formatTimeString( date ) {
        var hours = zeroPad(date.getHours(), 2);
        var minutes = zeroPad(date.getMinutes(), 2);
        var seconds = zeroPad(date.getSeconds(), 2);
        var ms = zeroPad(date.getMilliseconds(), 3);
        var day = zeroPad(date.getDate(), 2);
        var month = zeroPad((date.getMonth() + 1), 2);
        var year = date.getFullYear().toString();
        var timeDate = year + month + day + "-" + hours + ":" + minutes + ":" + seconds + "." + ms;

        return timeDate;
    }

