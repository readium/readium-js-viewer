define(['./ModuleConfig',
'StorageManager',
        'hgn!readium_js_viewer_html_templates/categories-dialog-body.html', './ReaderSettingsDialog_Keyboard', 'i18nStrings', './Dialogs', 'Settings', './Keyboard'], function(moduleConfig,StorageManager,  CategoriesDialogController, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){

    var initDialog = function(whatever) {

        //ADD CATEGORY HANDLER
        $(".addCategory").on("click", function() {

            //If we're adding a custom category
            if ($(this).hasClass("addCustomCategory")) {
                var categoryToAdd = $("#customCategory").val();
            }
            //Else a preset category (eKitabu version only) TODO - remove
            else {
                var categoryToAdd = $(this).html();
            }

            //load the xml data
            jQuery.get(StorageManager.getPathUrl("/categories.xml"), function(xmlData) {
                //get category XML data as traversable/parsed jQuery object
                xmlDoc = $.parseXML(xmlData);
                categoriesXml = $(xmlDoc);

                //get the book's unique identifier
                var rootDir = $("#rootDirHolder").attr("value");

                //find the book in the xml
                var justTheBookWereLookingFor = categoriesXml.find("rootDirAsId:contains("+rootDir+")").parent();

                //add the category node 
                justTheBookWereLookingFor.append("<category>" +categoryToAdd +" </category>")
                var serializer = new XMLSerializer();

                //save the newly created xml
                StorageManager.saveFile("/categories.xml",serializer.serializeToString(xmlDoc));

                //update the current views to reflect the new category
                $("#bookCurrentCategories").append("<li data-category='"+categoryToAdd+"'>"+categoryToAdd+"<span class='removeCategory'>&times;</span></li>");

                //we want to bind the newly shown category, but don't want a double bind. 
                //clear and rebind
                $(".removeCategory").unbind("click");
                $(".removeCategory").click(function() {
                    removeCategory($(this));
                });
            });

        });

        /**
         * Removes a book's category from the xml in the app
         * @param   removeCategoryButton    The button that was clicked to run this function
         */
        function removeCategory(removeCategoryButton) {
            var categoryToRemove = removeCategoryButton.parent().attr("data-category");

            //load XML data
            jQuery.get(StorageManager.getPathUrl("/categories.xml"), function(xmlData) {
                //get category XML data as traversable/parsed jQuery object
                xmlDoc = $.parseXML(xmlData);
                categoriesXml = $(xmlDoc);

                //get the book's unique identifier
                var rootDir = $("#rootDirHolder").attr("value");
                var justTheBookWereLookingFor = categoriesXml.find("rootDirAsId:contains("+rootDir+")").parent();
                //find the category node we are removing and remove it
                var theCategoryNode = justTheBookWereLookingFor.find("category:contains(\""+categoryToRemove +"\")");
                theCategoryNode.remove();
                var serializer = new XMLSerializer();


                //save changes
                StorageManager.saveFile("/categories.xml",serializer.serializeToString(xmlDoc));
                
                //remove that category item from the HTML
                $("#bookCurrentCategories li[data-category=\""+categoryToRemove+"\"]").remove();
            });
        }

        //bind remove category buttons
        $(".removeCategory").click(function() {
            console.log("clicked a remove category button");
            removeCategory($(this));
        });
    }


    //make these functions available where mustache has included this JS file
    return{
        initDialog : initDialog
    }
});
