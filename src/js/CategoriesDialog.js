define(['./ModuleConfig',
'StorageManager',
'./EpubLibraryManager',
        'hgn!readium_js_viewer_html_templates/categories-dialog-body.html', './ReaderSettingsDialog_Keyboard', 'i18nStrings', './Dialogs', 'Settings', './Keyboard'], function(moduleConfig,StorageManager, LibraryManager,  CategoriesDialogController, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){

    var initDialog = function(loadLibraryItems) {

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

            //get the book's unique identifier
            var rootDir = $("#rootDirHolder").attr("value");

            function addCategoryThenUpdateLibrary(epubObject){
                //if the categories array doesn't already exist
                if (!epubObject.hasOwnProperty("categories")) {
                    epubObject.categories = [];
                }
                //if the category isn't in the array already
                if ($.inArray(categoryToAdd,epubObject.categories) == -1)
                {
                    epubObject.categories.push(categoryToAdd);
                    LibraryManager.updateEpubWithId(rootDir,epubObject,updateCategoryDialog,function(){});
                }
                else
                {
                    //TODO - handle this with a message to the user
                    console.log("there was already such a category");
                }
            }//function addCategoryThenUpdateLibrary(epubObject)


            function updateCategoryDialog() {
                //update the current views to reflect the new category 
                //TODO - handle this in the general library view
                $("#bookCurrentCategories").append("<li data-category='"+categoryToAdd+"'>"+categoryToAdd+"<span class='removeCategory'>&times;</span></li>");

                //we want to bind the newly shown category, but don't want a double bind. 
                //clear and rebind
                $(".removeCategory").unbind("click");
                $(".removeCategory").click(function() {
                    removeCategory($(this));
                });
                //reload the library to reflect the new changes
                LibraryManager.retrieveAvailableEpubs(loadLibraryItems);
            }
            //start the whole updating epub process 
            LibraryManager.getEpubWithId(rootDir, addCategoryThenUpdateLibrary);
        });

        /**
         * Removes a book's category from the xml in the app
         * @param   removeCategoryButton    The button that was clicked to run this function
         */
        function removeCategory(removeCategoryButton) {
            var categoryToRemove = removeCategoryButton.parent().attr("data-category");

            //get the book's unique identifier
            var rootDir = $("#rootDirHolder").attr("value");

            //start the removal process
            LibraryManager.getEpubWithId(rootDir, removeCategoryThenUpdateLibrary);

            function removeCategoryThenUpdateLibrary(epubObject){

                //remove the category from the epub's categories array
                epubObject.categories.splice($.inArray(categoryToRemove,epubObject.categories),1);
                //update the library with this new epub info
                LibraryManager.updateEpubWithId(
                        rootDir,
                        epubObject,
                        updateCategoryDialogCategoryRemoved,
                        function(){}
                        );
            }
            function updateCategoryDialogCategoryRemoved() {
                //remove that category item from the HTML
                $("#bookCurrentCategories li[data-category=\""+categoryToRemove+"\"]").remove();
                //reload the library to reflect the new changes
                LibraryManager.retrieveAvailableEpubs(loadLibraryItems);
            }

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
