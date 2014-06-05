
define(['module','jquery', 'bootstrap', 'Readium', 'Spinner', 'storage/Settings', 'i18n/Strings', 'Dialogs', 'Keyboard'], 
        function (module, $, bootstrap, Readium, spinner, Settings, Strings, Dialogs, Keyboard) {

    var init = function(readium) {

        var _spineItemIframeMap = {};
    
        var $audioTrackDiv = $("#backgroundAudioTrack-div");
    
        var $playAudioTrackBtn = $("#backgroundAudioTrack-button-play");
        var $pauseAudioTrackBtn = $("#backgroundAudioTrack-button-pause");
    
        var _wasPlaying = false;
    
        function playPauseAudioTrack(doPlay)
        {
            if (doPlay)
            {
                $audioTrackDiv.addClass('isPlaying');
        
                $playAudioTrackBtn.removeAttr("accesskey");
                $pauseAudioTrackBtn.attr("accesskey", Keyboard.BackgroundAudioPlayPause);
            }
            else
            {
                $audioTrackDiv.removeClass('isPlaying');

                $pauseAudioTrackBtn.removeAttr("accesskey");
                $playAudioTrackBtn.attr("accesskey", Keyboard.BackgroundAudioPlayPause);
            }

            try
            {
                var $iframe = undefined;
        
                for (var prop in _spineItemIframeMap)
                {
                    if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;

                    var data = _spineItemIframeMap[prop];
                    if (!data || !data.active) continue;

                    if ($iframe) console.error("More than one active iframe?? (pagination)");
                    
                    $iframe = data["$iframe"];
                    if (!$iframe) continue;
        
                    var $audios = $("body > audio", $iframe[0].contentDocument);

                    $.each($audios, function() {

                        var attr = this.getAttribute("epub:type") || this.getAttribute("type");

                        if (!attr) return true; // continue

                        if (attr !== "ibooks:soundtrack") return true; // continue
            
                        if (doPlay && this.play)
                        {
                            this.play();
                        }
                        else if (this.pause)
                        {
                            this.pause();
                        }
                    
                        return true; // continue (more than one track?)
                    });
                }
            }
            catch (err)
            {
                console.error(err);
            }
        };
        
        Keyboard.on(Keyboard.BackgroundAudioPlayPause, 'reader', function()
        {
            _wasPlaying = !$audioTrackDiv.hasClass('isPlaying');
            playPauseAudioTrack(_wasPlaying);
        });
    
        $playAudioTrackBtn.on("click", function () {

            var wasFocused = document.activeElement === $playAudioTrackBtn[0];
        
            _wasPlaying = true;
            playPauseAudioTrack(true);
        
            if (wasFocused) setTimeout(function(){ $pauseAudioTrackBtn[0].focus(); }, 50);
        });
    
        $pauseAudioTrackBtn.on("click", function () {

            var wasFocused = document.activeElement === $pauseAudioTrackBtn[0];
        
            _wasPlaying = false;
            playPauseAudioTrack(false);
        
            if (wasFocused) setTimeout(function(){ $playAudioTrackBtn[0].focus(); }, 50);
        });
    
        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem)
        {
            try
            {
                if (spineItem && spineItem.idref && $iframe && $iframe[0])
                {
                    // console.log("CONTENT_DOCUMENT_LOADED");
                    // console.debug(spineItem.href);
                    // console.debug(spineItem.idref);
                    
                    _spineItemIframeMap[spineItem.idref] = {"$iframe": $iframe, href: spineItem.href};
                }
            }
            catch (err)
            {
                console.error(err);
            }
        });
        
        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData)
        {
            // console.log("PAGINATION_CHANGED");
            // console.debug(pageChangeData);
            // 
            // if (pageChangeData.spineItem)
            // {
            //     console.debug(pageChangeData.spineItem.href);
            //     console.debug(pageChangeData.spineItem.idref);
            // }
            // else
            // {
            //     //console.error(pageChangeData);
            // }
            // 
            // if (pageChangeData.paginationInfo && pageChangeData.paginationInfo.openPages && pageChangeData.paginationInfo.openPages.length)
            // {
            //     for (var i = 0; i < pageChangeData.paginationInfo.openPages.length; i++)
            //     {
            //         console.log(pageChangeData.paginationInfo.openPages[i].idref);
            //     }
            // }

            var atLeastOneAudioBackgroundSoundtrack = false;
            
            try
            {
                for (var prop in _spineItemIframeMap)
                {
                    if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;

                    var isActive = pageChangeData.spineItem && pageChangeData.spineItem.idref === prop;
                    
                    var isDisplayed = false;

                    if (pageChangeData.paginationInfo && pageChangeData.paginationInfo.openPages.length)
                    {
                        var allSame = true;
                        
                        for (var i = 0; i < pageChangeData.paginationInfo.openPages.length; i++)
                        {
                            if (pageChangeData.paginationInfo.openPages[i].idref === prop)
                            {
                                isDisplayed = true;
                            }
                            else
                            {
                                allSame = false;
                            }
                        }
                        
                        if (!isActive && allSame) isActive = true;
                    }
                    
                    if (isActive || isDisplayed)
                    {
                        var data = _spineItemIframeMap[prop];
                        if (!data) continue;
                    
                        _spineItemIframeMap[prop]["active"] = isActive;
                    
                        var $iframe = data["$iframe"];
                        var href = data.href;

                        var $audios = $("body > audio", $iframe[0].contentDocument);
                        $.each($audios, function() {

                            var attr = this.getAttribute("epub:type") || this.getAttribute("type");

                            if (!attr) return true; // continue

                            if (attr !== "ibooks:soundtrack") return true; // continue
        
                            this.setAttribute("loop", "loop");
                            this.removeAttribute("autoplay");

                            // DEBUG!
                            //this.setAttribute("controls", "controls");

                            if (isActive)
                            {
                                // DEBUG!
                                //$(this).css({border:"2px solid green"});
                            }
                            else
                            {
                                if (this.pause) this.pause();
                                
                                // DEBUG!
                                //$(this).css({border:"2px solid red"});
                            }
        
                            atLeastOneAudioBackgroundSoundtrack = true;

                            return true; // continue (more than one track?)
                        });
                        
                        continue;
                    }
                    else
                    {
                        if (_spineItemIframeMap[prop]) _spineItemIframeMap[prop]["$iframe"] = undefined;
                        _spineItemIframeMap[prop] = undefined;
                    }
                }
            }
            catch (err)
            {
                console.error(err);
            }


            if (atLeastOneAudioBackgroundSoundtrack)
            {
                $audioTrackDiv.removeClass("none");
                
                if (_wasPlaying)
                {
                    playPauseAudioTrack(true);
                }
                else
                {
                    playPauseAudioTrack(false); // ensure correct paused state
                }
            }
            else
            {                
                $audioTrackDiv.addClass("none");
                
                playPauseAudioTrack(false); // ensure correct paused state
            }
        });
        
        readium.reader.on(ReadiumSDK.Events.MEDIA_OVERLAY_STATUS_CHANGED, function (value)
        {
            if (!value.smilIndex) return;
            var package = readium.reader.package();
            var smil = package.media_overlay.smilAt(value.smilIndex);
            if (!smil || !smil.spineItemId) return;

            var needUpdate = false;
            for (var prop in _spineItemIframeMap)
            {
                if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;
                
                var data = _spineItemIframeMap[prop];
                if (!data) continue;
                
                if (data.active)
                {
                    if (prop !== smil.spineItemId)
                    {
                        playPauseAudioTrack(false); // ensure correct paused state
                        data.active = false;
                        needUpdate = true;
                    }
                }
            }

            if (needUpdate)
            {
                for (var prop in _spineItemIframeMap)
                {
                    if (!_spineItemIframeMap.hasOwnProperty(prop)) continue;
                
                    var data = _spineItemIframeMap[prop];
                    if (!data) continue;
                
                    if (!data.active)
                    {
                        if (prop === smil.spineItemId)
                        {
                            data.active = true;
                        }
                    }
                }
            
                if (_wasPlaying)
                {
                    playPauseAudioTrack(true);
                }
            }
        });
    };

    return {
        init : init
    };
});
