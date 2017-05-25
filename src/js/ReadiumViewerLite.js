define(['jquery', './EpubReader', 'readium_shared_js/helpers'], function($, EpubReader, Helpers){

    $(function(){

        var urlParams = Helpers.getURLQueryParams();
    
        // embedded, epub
        // (epub is ebookURL)
      EpubReader.loadUI(urlParams);

        $(document.body).on('click', function()
        {
            $(document.body).removeClass("keyboard");
        });

        $(document).on('keyup', function(e)
        {
            $(document.body).addClass("keyboard");
        });
    });

    $(document.body).tooltip({
        selector : EpubReader.tooltipSelector(),
        placement: function(tip, element){
          var placeValue = 'auto';
          if (element.id == 'left-page-btn'){
            placeValue = 'right';
          } else if (element.id == 'right-page-btn') {
            placeValue = 'left'
          }
          return placeValue;
        },
        container: 'body' // do this to prevent weird navbar re-sizing issue when the tooltip is inserted
    }).on('show.bs.tooltip', function(e){
        $(EpubReader.tooltipSelector()).not(e.target).tooltip('destroy');
        var target = e.target; 
        setTimeout(function(){
            $(target).tooltip('destroy');
        }, 8000);
    });
    
    
    
    
    if (window.File
         //&& window.FileReader
     ) {
        var fileDragNDropHTMLArea = $(document.body);
        fileDragNDropHTMLArea.on("dragover", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            
            //$(ev.target)
            fileDragNDropHTMLArea.addClass("fileDragHover");
        });
        fileDragNDropHTMLArea.on("dragleave", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            
            //$(ev.target)
            fileDragNDropHTMLArea.removeClass("fileDragHover");
        });
        fileDragNDropHTMLArea.on("drop", function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            
            //$(ev.target)
            fileDragNDropHTMLArea.removeClass("fileDragHover");
            
            var files = ev.target.files || ev.originalEvent.dataTransfer.files;
            if (files.length) {
                var file = files[0];
                console.log("File drag-n-drop:");
                console.log(file.name);
                console.log(file.type);
                console.log(file.size);
                
                if (file.type == "application/epub+zip" || (/\.epub[3?]$/.test(file.name))) {
                      EpubReader.loadUI({epub: file});
                }
            }
        });
    }

});
