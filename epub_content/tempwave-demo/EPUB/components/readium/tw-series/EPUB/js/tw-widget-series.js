		// Global variables.
		var	DepthID        = new Array(10);
		var nDepth         = 10;
		var	TempSeries     = new Array(10);		    // for each depth
		var	TimeSeries     = new Array(10);		    // for each depth
		var nCurTemp       = 0;
		var	rateValue	   = 2;						// stepping rate of simulation
		var nMaxTemp       = 24 * 7 / rateValue;	// one week's worth	of hours / rateValue
		var	nTotTemp       = 0;
		var timeOffset     = 0.0;

		function on_load(evt) {

			window.TempWaveJS_svgdoc = evt.target.ownerDocument;
		
			getIDs();

            for ( n=0; n<nDepth; n++ )
            {
                TempSeries[n] = new Array(200);  // 24 times a day for a week
                TimeSeries[n] = new Array(200);
            }
		}

		// Do the init of the various objects
		function getIDs () {
			var svgDoc   = window.TempWaveJS_svgdoc;

			DepthID[0] = svgDoc.getElementById('B_Depth0');
			DepthID[1] = svgDoc.getElementById('B_Depth1');
			DepthID[2] = svgDoc.getElementById('B_Depth2');
			DepthID[3] = svgDoc.getElementById('B_Depth3');
			DepthID[4] = svgDoc.getElementById('B_Depth4');
			DepthID[5] = svgDoc.getElementById('B_Depth5');
			DepthID[6] = svgDoc.getElementById('B_Depth6');
			DepthID[7] = svgDoc.getElementById('B_Depth7');
			DepthID[8] = svgDoc.getElementById('B_Depth8');
			DepthID[9] = svgDoc.getElementById('B_Depth9');
		}

		// Update the temperature for each depth at the current time and concat
		// the new value onto the string
		function updateAllDepths ( data ) {
            var tNow = data.topicData.time;

			if (nTotTemp >= nMaxTemp)
			{
				timeOffset = tNow / 3600.0 - 24.0 * 7.0;
			}

            //console.log("time: " + tNow + " nCurTemp: " + nCurTemp + " nTotTemp: " + nTotTemp);

			// for ( j=0; j<2; j++ )
			for ( j=0; j<nDepth; j++ )
			{
				updateTempAtDepth( j, DepthID[j], data.topicData );
			}

			nTotTemp++;
			nCurTemp++;
			if (nCurTemp >= nMaxTemp)
				nCurTemp = 0;
		}

		// Update the temperature for each depth at the current time and concat
		// the new value onto the string
		function updateTempAtDepth ( depthNum, depthID, topicData ) {

			TempSeries[depthNum][nCurTemp] = topicData.temps[depthNum].t;

			TimeSeries[depthNum][nCurTemp] = topicData.time / 3600.0;   // get time in hours

			// find the first index in our ring buffer
			index = nCurTemp - nMaxTemp;
			if (index < 0) {
				if ((nTotTemp < nMaxTemp) || (nTotTemp % nMaxTemp) == (nMaxTemp - 1))
					index = 0;
				else
					index += nMaxTemp + 1;
			}

			// now build the string from the values in the buffer
			var	pointStr = '';
			for ( k=0; k<nMaxTemp && k<=nTotTemp; k++ )	{
				if (isNaN(TempSeries[depthNum][index]))
					alert('NAN');

				var dTime = TimeSeries[depthNum][index] - timeOffset;
				pointStr += dTime + ',' + TempSeries[depthNum][index] + ' ';

				// increment the index and wrap around in the ring buffer, if need be
				index++;
				if (index >= nMaxTemp)
					index = 0;
			}

			updatePolyline( depthID, pointStr );
		}

		// update the points attribute of the specified polyline
		function updatePolyline ( elmID, pointStr )	{
			// Update the profile
			elmID.setAttribute("points", pointStr );
		}

		epubsc.subscribe("tempwave", function(msg) {
            updateAllDepths(msg.data);
		});

        epubsc.subscribe("tw-controls", function(msg) {

            if (msg.data.topicData.command == "restart" || msg.data.topicData.command == "stop") {
                nTotTemp = 0;
                nCurTemp = 0;
                timeOffset = 0;
            }
        });
