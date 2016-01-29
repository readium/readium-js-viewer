
		var profileID;

		function on_load(evt) {

			window.TempWaveJS_svgdoc = evt.target.ownerDocument;
		
			initID();
		}

        // Do the init of the various objects
        function initID ()	{
            profileID = window.TempWaveJS_svgdoc.getElementById('P_Profile');
        }

        // update the points attribute of the specified polyline
        function updatePolyline ( elmID, pointStr )	{
            // Update the profile
            elmID.setAttribute("points", pointStr );
        }

		// calculate the temperature for each depth at the current time and build 
		// up an SVG-style points string
		function updateProfile ( data )	{
			var pointStr = '';
			var temps = data.topicData.temps;

			for (var j = 0; j < temps.length; j++ ) {

				pointStr += temps[j].t + ',' + temps[j].d + ' ';
			}

			updatePolyline( profileID, pointStr );
		}

		epubsc.subscribe("tempwave", function(msg) {
			var ID = msg.data.widgetId;
			var time = formatTimeString( new Date(msg.data.topicData.time));
			//console.log( "Profile-Handler: [tempwave] " + " ESC: "+ ID.substr(0,9) + ",  temp: " + msg.data.topicData.airTemp + " at: " + time);
			updateProfile(msg.data);
		});

		//======================== end of Javascript ============================================
