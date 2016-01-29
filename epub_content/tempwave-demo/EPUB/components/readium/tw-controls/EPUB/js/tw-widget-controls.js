/**
 *  Simple JS to handle the button pushes. All it does is publish a command
 *  corresponding to the button pushed.
 *
 *  @creator: Ric Wright, July 2015
 */

		function on_load(evt)
		{
			//document.addEventListener("touchstart", touchHandler, true);

		}

		/*
		function touchHandler()
		{
			alert('touchHandler');
		}
		*/

		function OnStopButton(evt) {
            publishCommand("stop");
		}

		function OnPauseButton(evt)	{
            publishCommand("pause");
		}

		function OnPlayButton(evt) {
			publishCommand("play");
		}

		function OnRestartButton(evt) {
          publishCommand("restart");
		}

        function publishCommand ( commandStr ) {
            var data = { command : commandStr };
            epubsc.publish("tw-controls", data);
        }
