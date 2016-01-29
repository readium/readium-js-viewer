		// Global variables.
		var Month          = ["January","February","March","April","May","June","July", "August","September","October","November","December"];
        var statusDiv;

        window.onload = function() {
		
			initIDs();
		};

		// get the month from a a Julian value
		function GetMonth ( julianDay, year ) {
			mois = Math.floor(julianDay / 30.42) + 1;
			if ((julianDay == 60)  &&  ((year % 4) != 0))  mois++;
			if ((julianDay == 91) || (julianDay == 121) || (julianDay == 152) || (julianDay == 182))  mois++;
			if (julianDay == 31)   mois--;

			return mois;
		}

		// get the day of the month from a Julian date
		function GetDayOfMonth ( julianDay, year ) {
			var mois = 	GetMonth( julianDay, year );

			return Math.floor(julianDay - Julian(1, Math.floor(mois), year) + 1);
		}

		// get a Julian date from the dddmmyy value
		function Julian ( jour, mois, annee ) {
			var   j = Math.floor( (30.42 * (mois - 1)) + jour);

			if (mois == 2)  j++;
			if ((mois > 2)  &&  (mois < 8))  j--;
			if ((mois > 2)  &&  ((annee % 4) == 0)  &&  (annee != 0))  j++;

			return Math.floor(j);
		}

		// Do the init of the various objects
		function initIDs () {

            // Get a reference to the <div> on the page that will display the message text.
            statusDiv = document.getElementById('statusDiv');
		}

		// update the date info
		function updateDateAndTemp ( data ) {

			// update the day number, from seconds
			var dayNumber = 182 + data.topicData.time * 1.0 / (24.0 * 3600.0);
			while (dayNumber > 365)
				dayNumber -= 365;

			var		jour = GetDayOfMonth( dayNumber, 0);
			var		mois = GetMonth( dayNumber, 0);
			var		dateStr = jour + ' ' + Month[mois-1];

            logMsg( statusDiv, "Date: " + dateStr + "  -  airTemp: " + data.topicData.airTemp.toFixed(1));
		}

        epubsc.subscribe("tempwave", function(msg) {
            updateDateAndTemp(msg.data);
        });

        epubsc.subscribe("tw-controls", function(msg) {

            if (msg.data.topicData.command == "restart" || msg.data.topicData.command == "stop") {
                while (statusDiv.firstChild) {
                    statusDiv.removeChild(statusDiv.firstChild);
                }
            }
        });