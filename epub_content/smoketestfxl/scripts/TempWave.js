		// Global variables.
		var curTime	       = 0;  // Current time, in seconds
		var Depth          = Array(10);
		var	DepthID        = Array(10);
		var nDepth         = 10;
		var	diffus         = 1e-04;
		var	timeStep       = 3600.0;
		var	amplitudeDay   = 10.0;
		var	amplitudeYear  = 10.0;
		var	meanTemp       = 0.0;
		var	airTemperature = 0.0;			// today's air temperature
		var	diurnalAmplitude = 0.0;			// today's temperature amplitude, i.e. (max-min)/2
		var	omegaDay       = 1.0 / (24.0 * 3600.0);			// seconds in a day, so temp cycles in one day
		var	omegaDayRad    = omegaDay * Math.PI * 2.0;
		var	omegaYear      = 1.0 / (24.0 * 3600.0 * 365.0);	// seconds in a year, so temp cycles in one year
		var	omegaYearRad   = omegaYear * Math.PI * 2.0;
		var	damping        = Math.sqrt(2.0 * diffus / omegaDay);
		var	bInitID        = 0;
		var profileID;
		var airTempID;
		var dateID;
		var	Temps	       = Array(10);		// for each depth
		var	Times	       = Array(10);		// for each depth
		var nCurTemp       = 0;
		var	rateValue	   = 2;						// stepping rate of simulation
		var nMaxTemp       = 24 * 7 / rateValue;	// one week's worth	of hours / rateValue
		var	nTotTemp        = 0;
		var timeOffset     = 0.0;
		var Month          = Array(12);
		var	dateObj		   = Date(1970,7,1);	// 1 July 1970
		var intervalID;

		function  getSVGDoc(node) 
		{ 
			if (node.getNodeType()==9) 
				return node; 
			else 
				return node.getOwnerDocument(); 
		}

		function    on_load(evt)
		{
			var dummy = 42;
			
			document.addEventListener("touchstart", touchHandler, true);
			 
			// This makes the next_update function available to JavaScript functions
			// defined outside of the SVG document. This is needed so that the
			// setInterval function can find and call next_update when needed.
			window.TempWaveJS_next_update = next_update;

			window.TempWaveJS_svgdoc = evt.target.ownerDocument; // getSVGDoc(evt.target);
		
			InitSimulation();
		}

		function touchHandler()
		{
			alert('touchHandler');
		}
		
		function OnStopButton(evt)
		{
			window.clearInterval( intervalID );
			curTime  = 0;
			// nMaxTemp = 0;
			nCurTemp = 0;
			nTotTemp = 0;
		}

		function OnPauseButton(evt)
		{
			window.clearInterval( intervalID );
		}

		function OnPlayButton(evt)
		{
			intervalID = window.setInterval('TempWaveJS_next_update()', 50);
		}

		function OnRestartButton(evt)
		{
			OnStopButton(evt);
			OnPlayButton(evt);
		}

		// Set up the various parameters of the simulation
		function InitSimulation ()
		{
			// the depths in metres
			Depth[0] = 0;
			Depth[1] = 0.5;
			Depth[2] = 1.0;
			Depth[3] = 1.5;
			Depth[4] = 2.0;
			Depth[5] = 3.0;
			Depth[6] = 4.0;
			Depth[7] = 5.0;
			Depth[8] = 7.5;
			Depth[9] = 10.0;

			Month[0]  = "January";
			Month[1]  = "February";
			Month[2]  = "March";
			Month[3]  = "April";
			Month[4]  = "May";
			Month[5]  = "June";
			Month[6]  = "July";
			Month[7]  = "August";
			Month[8]  = "September";
			Month[9]  = "October";
			Month[10] = "November";
			Month[11] = "December";

			// these hold the IDs of the depth elements
			DepthID[0] = '';
			DepthID[1] = '';
			DepthID[2] = '';
			DepthID[3] = '';
			DepthID[4] = '';
			DepthID[5] = '';
			DepthID[6] = '';
			DepthID[7] = '';
			DepthID[8] = '';
			DepthID[9] = '';

			for ( n=0; n<nDepth; n++ )
			{
				Temps[n] = Array(200);  // 24 times a day for a week
				Times[n] = Array(200);
			}
		}

		// get the month from a a Julian value
		function GetMonth ( julianDay, year )
		{
			mois = Math.floor(julianDay / 30.42) + 1;
			if ((julianDay == 60)  &&  ((year % 4) != 0))  mois++;
			if ((julianDay == 91) || (julianDay == 121) || (julianDay == 152) || (julianDay == 182))  mois++;
			if (julianDay == 31)   mois--;

			return mois;
		}

		// get the day of the month from a Julian date
		function GetDayOfMonth ( julianDay, year )
		{
			var mois = 	GetMonth( julianDay, year );

			return Math.floor(julianDay - Julian(1, Math.floor(mois), year) + 1);
		}

		// get a Julian date from the dddmmyy value
		function Julian ( jour, mois, annee )
		{
			var   j = Math.floor( (30.42 * (mois - 1)) + jour);

			if (mois == 2)  j++;
			if ((mois > 2)  &&  (mois < 8))  j--;
			if ((mois > 2)  &&  ((annee % 4) == 0)  &&  (annee != 0))  j++;

			return Math.floor(j);
		}

		// Do the init of the various objects
		function InitIDs ()
		{
			var svgDoc   = window.TempWaveJS_svgdoc;

			profileID = svgDoc.getElementById('P_Profile');

			airTempID = svgDoc.getElementById("B_AirTemp");
			dateID    = svgDoc.getElementById("B_Date");

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

			bInitID = 1;
		}

		// This function implements the animation. 
		function next_update ()
		{
			var svgDoc   = window.TempWaveJS_svgdoc;

			if ( bInitID == 0 )
			{
				InitIDs();
			}

			UpdateAirTemp();

			// Update the profile
			UpdateProfile();

			// then all the depths through time
			UpdateAllDepths();

			curTime += timeStep * rateValue;

			UpdateDate();
		}

		// update the date info
		function UpdateDate ()
		{
			// update the day number
			var dayNumber = 182 + curTime * omegaDay;
			while (dayNumber > 365)
				dayNumber -= 365;

			var		jour = GetDayOfMonth( dayNumber, 0);
			var		mois = GetMonth( dayNumber, 0);
			var		dateStr = jour + ' ' + Month[mois-1];

			dateID.firstChild.nodeValue = dateStr;
		}

		// update the air temp based on diurnal and annual cycle. Note returns delta from mean temp
		function UpdateAirTemp ()
		{
			diurnalAmplitude = amplitudeDay * (0.6667 + Math.random() * 0.333);
			airTemperature   = meanTemp + (0.8 + Math.random() * 0.2) * amplitudeYear * Math.cos(curTime * omegaYearRad);

			airTempID.firstChild.nodeValue = Math.floor(airTemperature+0.5);
		}

		// calculate the temperature for each depth at the current time and build 
		// up an SVG-style points string
		function UpdateProfile ()
		{
			var pointStr = '';
			for ( j=0; j<nDepth; j++ )
			{
				dampingDepth    = Depth[j] / damping;
				dampedAmplitude = diurnalAmplitude * Math.exp(-Depth[j] / damping);
				temperature     = airTemperature + dampedAmplitude * Math.cos(curTime * omegaDayRad - dampingDepth);

				pointStr += temperature + ',' + Depth[j] + ' ';
			}

			UpdatePolyline( profileID, pointStr );

			return pointStr;
		}

		// Update the temperature for each depth at the current time and concat
		// the new value onto the string
		function UpdateAllDepths ()
		{
			if (nTotTemp >= nMaxTemp)
			{
				timeOffset = curTime / 3600.0 - 24.0 * 7.0;
			}

			// for ( j=0; j<2; j++ )
			for ( j=0; j<nDepth; j++ )
			{
				UpdateTempAtDepth( j, DepthID[j] );
			}

			nTotTemp++;
			nCurTemp++;
			if (nCurTemp >= nMaxTemp)
				nCurTemp = 0;
		}

		// Update the temperature for each depth at the current time and concat
		// the new value onto the string
		function UpdateTempAtDepth ( depthNum, depthID )
		{
			dampingDepth    = Depth[depthNum] / damping;
			dampedAmplitude = diurnalAmplitude * Math.exp(-Depth[depthNum] / damping);
			Temps[depthNum][nCurTemp] = airTemperature + dampedAmplitude * Math.cos(curTime * omegaDayRad - dampingDepth);

			Times[depthNum][nCurTemp] = curTime / 3600.0;   // get time in hours 

			// find the first index in our ring buffer
			index = nCurTemp - nMaxTemp;
			if (index < 0)
			{
				if ((nTotTemp < nMaxTemp) || (nTotTemp % nMaxTemp) == (nMaxTemp - 1))   //nTotTemp < nMaxTemp )
					index = 0;
				else
					index += nMaxTemp + 1;
			}

			// now build the string from the values in the buffer
			var	pointStr = '';
			for ( k=0; k<nMaxTemp && k<=nTotTemp; k++ )
			{
				if (isNaN(Temps[depthNum][index]))
					alert('NAN');
					
				var dTime = Times[depthNum][index] - timeOffset;
				pointStr += dTime + ',' + Temps[depthNum][index] + ' ';

				// increment the index and wrap around in the ring buffer, if need be
				index++;
				if (index >= nMaxTemp)
					index = 0;
			}

			UpdatePolyline( depthID, pointStr );
		}

		// update the points attribute of the specified polyline
		function UpdatePolyline ( elmID, pointStr )
		{
			// Update the profile
			elmID.setAttribute("points", pointStr );
			
			// the following line exists only to force the object to be Updated - SVG bug!
			elmID.style.setProperty('stroke-linecap', 'round');
		}

	//======================== end of Javascript ============================================
