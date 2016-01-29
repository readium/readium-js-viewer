		// Global variables.
		var curTime	       = 0;                             // Current time, in seconds
		var Depths          = [ 0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0 ];
		var nDepth         = 10;
        var	Temps	       = new Array(10);		            // for each depth

		var	diffus         = 1e-04;
		var	timeStep       = 3600.0;
		var	amplitudeDay   = 10.0;
		var	amplitudeYear  = 10.0;
		var	meanTemp       = 0.0;
		var	airTemperature = 0.0;			                // today's air temperature
		var	diurnalAmplitude = 0.0;			                // today's temperature amplitude, i.e. (max-min)/2
		var	omegaDay       = 1.0 / (24.0 * 3600.0);			// seconds in a day, so temp cycles in one day
		var	omegaDayRad    = omegaDay * Math.PI * 2.0;
		var	omegaYear      = 1.0 / (24.0 * 3600.0 * 365.0);	// seconds in a year, so temp cycles in one year
		var	omegaYearRad   = omegaYear * Math.PI * 2.0;
		var	damping        = Math.sqrt(2.0 * diffus / omegaDay);
		var	rateValue	   = 2;						        // stepping rate of simulation

		var intervalID;

		function on_load(evt) {
			// This makes the next_update function available to JavaScript functions
			// defined outside of the SVG document. This is needed so that the
			// setInterval function can find and call next_update when needed.
			window.TempWaveJS_next_update = next_update;

			window.TempWaveJS_svgdoc = evt.target.ownerDocument;
       }

		// This function implements the animation. 
		function next_update ()	{

			updateAirTemp();

			// Update the profile
			updateProfile();

            publishTemps();

            curTime += timeStep * rateValue;
		}

		// update the air temp based on diurnal and annual cycle. Note returns delta from mean temp
		function updateAirTemp () {
			diurnalAmplitude = amplitudeDay * (0.6667 + Math.random() * 0.333);
			airTemperature   = meanTemp + (0.8 + Math.random() * 0.2) * amplitudeYear * Math.cos(curTime * omegaYearRad);
		}

		// calculate the temperature for each depth at the current time and build 
		// up an SVG-style points string
		function updateProfile () {
			for ( j=0; j<nDepth; j++ ) {
				dampingDepth    = Depths[j] / damping;
				dampedAmplitude = diurnalAmplitude * Math.exp(-dampingDepth);
				Temps[j]     = airTemperature + dampedAmplitude * Math.sin(curTime * omegaDayRad - dampingDepth);
                //Temps[j]     = 10.0;
			}
		}

        function stopModel () {
            window.clearInterval( intervalID );
            curTime  = 0;
            //nCurTemp = 0;
            //nTotTemp = 0;
        }

        function pauseModel () {
            window.clearInterval( intervalID );
        }

        function playModel () {
            intervalID = window.setInterval('TempWaveJS_next_update()', 50);
        }

        function restartModel() {
            stopModel();
            playModel();
        }

        epubsc.subscribe("tw-controls", function(msg) {
            var ID  = msg.data.widgetId;
            var cmd = msg.data.topicData.command;
            console.log( "======  Widget-Handler: [tw-controls] " + " ESC: "+ ID.substr(0,9) + ",  cmd: " + cmd + " ===========");

            if (cmd == "play")
                playModel();
            else if (cmd == "stop")
                stopModel();
            else if (cmd == "pause")
                pauseModel();
            else if (cmd == "restart")
                restartModel();
            else
                console.log("Error!! unknown command from tw-controls: " + cmd);
        });

        function packageTempData () {

            var data = {"time": curTime, "airTemp" : airTemperature, "temps": [] };
            for (var j = 0; j < nDepth; j++) {
                data.temps.push({
                    t: Temps[j],
                    d: Depths[j]
                });
            }

            return data;
        }

        function publishTemps() {
            epubsc.publish("tempwave", packageTempData());
        }
