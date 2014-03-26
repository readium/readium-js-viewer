var webdriver = require('selenium-webdriver');
var extensionUrl = 'chrome-extension://mgknhofkmkhdmjgjjbbcdcipolnmgipj/index.html';
var driver;

exports.setUp  = function(callback){
	var capabilities = webdriver.Capabilities.chrome();
	capabilities.set('chromeOptions', {'args' : 'load-extension=' + process.cwd() + '/build/chrome-app'});
	driver = new webdriver.Builder().
		withCapabilities(capabilities).
		build();
	callback();
}
exports.tearDown = function(callback){
	//driver.close();
	driver.quit();
	callback();
	
}

var testErrback = function(test, msg){
	debugger;
	var msg = msg || 'Required element is not present or visible'
	test.ok(false, msg);
	test.done();
}
var waitForPresent = function(test, locator, msg, timeout){
	
	return driver.wait(function(){
		return driver.isElementPresent(locator);
	}, timeout || 5000).addErrback(testErrback.bind(null, test, msg));
}

var waitForVisible = function(test, element, msg, timeout){
	return driver.wait(function(){
		return element.isDisplayed().then(function(displayed){
			return displayed;
		});	
	}, timeout || 5000).addErrback(testErrback.bind(null, test, msg));
}

var initAddToLibTests = function(test){
	driver.get(extensionUrl);
	driver.sleep(3000);
	driver.get(extensionUrl);

	var err = testErrback.bind(null, test);
	var btn = driver.findElement({className : 'icon-add-epub'});
	btn.addErrback(err);
	btn.click();
	
	var dlg = driver.findElement({id: 'add-epub-dialog'});
	waitForVisible(test, dlg, 'The add epub dialog didn\'t appear when the button was clicked');
}

exports.testLibraryNavbar = function(test){
	driver.get(extensionUrl);
	driver.sleep(3000);
	driver.get(extensionUrl);

	waitForPresent(test, {className : 'navbar'}, 'navbar not present');

	waitForPresent(test, {className : 'icon-add-epub'}, 'epub button not present').then(function(){
		//test.ok(present, 'Add epub button not present');
		test.done();
	});

}
	
var verifyProgressBar = function(test){
	var progressBar = driver.findElement({className: 'progress-bar'});
	progressBar.addErrback(testErrback.bind(null, test, 'The progress dialog didn\'t get created'));
	waitForVisible(test, progressBar, 'The progress bar was never made visible');
};
var verifyLibraryItem = function(test, expectedTitle, expectedAuthor){
	waitForPresent(test, {className:'library-item'}, 'The item was not imported into the library', 80000);

	var titleElement = driver.findElement({css: '.library-item .title'});
	titleElement.addErrback(testErrback.bind(null, test, 'The imported book has no title element'));
	titleElement.getText().then(function(text){
		test.equal(text, expectedTitle, 'Incorrect title');
	});

	var authorElement = driver.findElement({css: '.library-item .author'});
	authorElement.addErrback(testErrback.bind(null, test, 'The imported book has no author element'));
	authorElement.getText().then(function(text){
		test.equal(text, expectedAuthor);
	});

	return driver.executeScript("var naturalWidth = $('img.read').prop('naturalWidth');\
						 return $('img.read').prop('complete') && typeof naturalWidth != 'undefined' && naturalWidth > 0").then(function(goodImg){
						 	test.ok(goodImg, "Cover image is broken");
						 });
}
exports.addToLibTests = 
{

	// testAddEpubFromWeb : function(test){
	// 	var err = testErrback.bind(null, test);
	// 	// have to reload because it seems like some chrome.* APIs don't get initialized unless I do.
	// 	initAddToLibTests(test);

	// 	var urlUpload = driver.findElement({id: 'url-upload'});
	// 	urlUpload.addErrback(err);

	// 	var testUrl = 'http://www.gutenberg.org/ebooks/30971.epub.images';
	// 	urlUpload.sendKeys(testUrl).then(function(){
	// 		var dlgSubmit = driver.findElement({className: 'add-book'});
	// 		dlgSubmit.addErrback(err);
	// 		dlgSubmit.click();
	// 	});


	// 	verifyProgressBar(test);
	// 	verifyLibraryItem(test, 'Industrial Revolution', 'Poul William Anderson').then(function(){
	// 		test.done();
	// 	})
	// },

	testAddEpubFromZipFile : function(test){
		initAddToLibTests(test);

		var  epubUpload = driver.findElement({id: 'epub-upload'});
		epubUpload.addErrback(testErrback.bind(null, test, 'file upload control does not exist'));

		var testFile = process.cwd() + '/chrome-app/tests/epubs/cc-shared-culture.epub';

		epubUpload.sendKeys(testFile);

		verifyProgressBar(test);
		verifyLibraryItem(test, 'Creative Commons - A Shared Culture', 'Jesse Dylan').then(function(){
			test.done();
		});
	},

	testAddEpubFromDirectory : function(test){

		// can't really test directory selects because of https://code.google.com/p/chromedriver/issues/detail?id=183
		// leaving it in but commented out because it may be fixed one day.

		test.done();

		// initAddToLibTests(test);

		// var dirUpload = driver.findElement({id: 'dir-upload'});
		// dirUpload.addErrback(testErrback.bind(null, test, 'directory upload control does not exist'));

		// var testDir = process.cwd() + '/chrome-app/tests/epubs/accessible_epub_3'

		// driver.sleep(3000);
		// dirUpload.sendKeys(testDir);

		// verifyProgressBar(test);
		// verifyLibraryItem(test, 'asdasd', 'adadad').then(function(){
		// 	test.done();
		// })
	}

}
var uploadTestFile = function(test, path){
	var  epubUpload = driver.findElement({id: 'epub-upload'});
	epubUpload.addErrback(testErrback.bind(null, test, 'file upload control does not exist'));

	var testFile = process.cwd() + path;

	epubUpload.sendKeys(testFile);
};

var loadDetailsDialog = function(test){
	waitForPresent(test, {className:'details'}, 'The item was not imported into the library', 40000);
	driver.sleep(1000);
	var detailsBtn = driver.findElement({className: 'details'});
	detailsBtn.click();

	waitForPresent(test, {className: 'details-dialog'}, 'The details dialog did not appear', 2000);
	waitForPresent(test, {className: 'details-body'}, 'The details never loaded');
};

exports.libViewTests = {
	testViewDetails : function(test){
		initAddToLibTests(test);
		
		uploadTestFile(test, '/chrome-app/tests/epubs/accessible_epub_3.epub');

		loadDetailsDialog(test);
		

		var title = driver.findElement({css: '.modal-book-info .modal-title'});
		title.addErrback(testErrback.bind(null, test, 'The details title does not exist'));

		title.getText().then(function(text){
			test.equal(text, 'Accessible EPUB 3');
		});

		driver.findElements({css: '.modal-book-info .modal-detail'}).then(function(items){
			test.equal(items.length, 6, "There should be 6 detail items");
			
			items[0].getText().then(function(text){
				test.equal(text, 'Author: Matt Garrish', 'author detail is wrong');
			});
			items[1].getText().then(function(text){
				test.equal(text, 'Publisher: O’Reilly Media, Inc.', 'publisher detail is wrong');
			})
			items[2].getText().then(function(text){
				test.equal(text, 'Pub Date: 2012-02-20', 'publish date is wrong');
			})
			items[3].getText().then(function(text){
				test.equal(text, 'Modified Date: 2012-10-24T15:30:00Z', 'modified date is wrong');
			})
			items[4].getText().then(function(text){
				test.equal(text, 'ID: urn:isbn:9781449328030', 'id detail is wrong');
			})
			items[5].getText().then(function(text){
				test.equal(text, 'EPUB version: 3.0', 'EPUB version detail is wrong');
			})

		}).then(function(){
			test.done();
		});
	},
	testReadFromDetails : function(test){
		initAddToLibTests(test);
		
		uploadTestFile(test, '/chrome-app/tests/epubs/accessible_epub_3.epub');
		loadDetailsDialog(test);

		var readBtn = driver.findElement({css: '.details-body .btn.read'});
		readBtn.addErrback(testErrback.bind(null, test, 'The read button does not exist'));
		driver.sleep(500);
		readBtn.click();

		waitForPresent(test, {id: 'epubContentIframe'}, 'The reader never loaded after trying to open it from the details dialog');
		//driver.sleep(1000);

		driver.switchTo().frame('epubContentIframe').addErrback(testErrback.bind(null, test, 'The reader frame does not exist'));

		waitForPresent(test, {id: 'cover-image'}, 'The book was not loaded into the reader').then(function(){
			test.done();
		});

	},

	testSwitchViews : function(test){
		initAddToLibTests(test);
		
		uploadTestFile(test, '/chrome-app/tests/epubs/accessible_epub_3.epub');
		waitForPresent(test, {className:'details'}, 'The item was not imported into the library', 40000);
		driver.sleep(500);

		var thumbnailButton = driver.findElement({className: 'icon-thumbnails'});
		thumbnailButton.addErrback(testErrback.bind(null, test, 'The thumbnail button does not exist'));

		thumbnailButton.isDisplayed().then(function(displayed){
			test.ok(!displayed, 'The thumbnail button should be hidden');
		});

		var listViewButton = driver.findElement({className: 'icon-list-view'});
		thumbnailButton.addErrback(testErrback.bind(null, test, 'The list view button does not exist'));

		listViewButton.isDisplayed().then(function(displayed){
			test.ok(displayed, 'the list view button should be visible');
		});

		listViewButton.click();

		waitForPresent(test, {css: 'body.list-view'}, 'The list view was not enabled');

		listViewButton.isDisplayed().then(function(displayed){
			test.ok(!displayed, 'the list view button should not be visible');
		});

		thumbnailButton.isDisplayed().then(function(displayed){
			test.ok(displayed, 'The thumbnail button should be visible');
		});

		thumbnailButton.click();

		driver.isElementPresent({css: 'body.list-view'}).then(function(present){
			test.ok(!present, 'The thumbnail view was not enabled');
			test.done();
		});
	}

}
var switchToReaderFrame = function(test){
	driver.switchTo().frame('epubContentIframe').addErrback(testErrback.bind(null, test, 'The reader frame does not exist'));
}
var switchToDefaultFrame = function(){
	driver.switchTo().defaultContent();
}
var findElement = function(test, locator, msg){
	var element = driver.findElement(locator);
	element.addErrback(testErrback.bind(null, test, msg));
	return element;
}
var readerSetUp = function(callback){
	driver.get(extensionUrl);
	driver.sleep(2000);
	driver.get(extensionUrl);

	err = callback;
	var btn = driver.findElement({className : 'icon-add-epub'});
	btn.addErrback(err);
	btn.click();
	
	driver.sleep(1000);

	var  epubUpload = driver.findElement({id: 'epub-upload'});
	epubUpload.addErrback(callback);

	var testFile = process.cwd() + '/chrome-app/tests/epubs/accessible_epub_3.epub';

	epubUpload.sendKeys(testFile);

	driver.wait(function(){
		return driver.isElementPresent({className: 'read'});
	}, 40000).addErrback(callback);
	driver.sleep(500);
	var read = driver.findElement({className: 'read'}).click();
	driver.wait(function(){
		return driver.isElementPresent({id: 'reading-area'});
	}, 6000).addErrback(callback);
	callback();
}
exports.readerTests = {
	setUp : readerSetUp,

	testTurnPage : function(test){
		
		switchToReaderFrame(test);
		waitForPresent(test, {id: 'cover-image'}, 'The book was not loaded into the reader');

		//driver.sleep(2000);
		switchToDefaultFrame();

		var nextBtn = driver.findElement({id: 'next-page-btn'});
		nextBtn.addErrback(testErrback.bind(null, test, 'next button does not exist'));
		nextBtn.click();

		driver.sleep(2000);
		switchToReaderFrame(test);
		waitForPresent(test, {css: 'h1.title'}, 'The next page did not appear.');
		var title = driver.findElement({css: 'h1.title'});

		// getText does not seem to work in the frame
		driver.executeScript('return arguments[0].innerText;', title).then(function(text){
			test.equal(text, 'Accessible EPUB 3');
		});
		

		driver.sleep(2000);
		switchToDefaultFrame();
		var prevBtn = driver.findElement({id: 'previous-page-btn'});
		prevBtn.addErrback(testErrback.bind(null, test, 'prev button does not exist'));
		prevBtn.click();

		switchToReaderFrame(test);
		waitForPresent(test, {id: 'cover-image'}, 'The previous page did not appear').then(function(){
			test.done();
		});


	},

	testTableOfContents : function(test){
		var tocBtn = driver.findElement({className: 'icon-toc'});
		tocBtn.addErrback(testErrback.bind(null, test, 'toc button does not exist'));

		tocBtn.click();

		var tocBody = driver.findElement({id: 'readium-toc-body'});
		tocBody.addErrback(testErrback.bind(null, test, 'toc body does not exist'));

		waitForVisible(test, tocBody, 'table of contents did not appear after clicking on the button');

		// just test the preface and the last link
		var firstLink = driver.findElement({css: 'a[href="pr01.xhtml"]'});
		firstLink.addErrback(testErrback.bind(null, test, 'the first toc link did not exist'));

		firstLink.getText().then(function(text){
			test.equal(text, 'Preface');
		});

		firstLink.click();

		switchToReaderFrame(test);

		waitForPresent(test, {css: '#_preface > h2.title'}, 'The preface title header did not appear');

		var prefaceTitle = driver.findElement({css: '#_preface > h2.title'});
		driver.executeScript('return arguments[0].innerText;', prefaceTitle).then(function(text){
			test.equal(text, 'Preface');
		});

		switchToDefaultFrame();

		driver.executeScript('$("#readium-toc-body").scrollTop(10000)');

		var lastLink = driver.findElement({css: 'a[href="ch04.xhtml#_about_the_book"]'});
		lastLink.addErrback(testErrback.bind(null, test, 'the last toc link did not exist'));

		lastLink.isDisplayed().then(function(displayed){
			test.ok(displayed, 'The last link in the toc is not displayed after scrolling to the bottom');
		});

		lastLink.click();

		switchToReaderFrame(test);

		waitForPresent(test, {id: '_about_the_book'}, 'The last section title never appeared');

		var title = driver.findElement({id: '_about_the_book'});
		driver.executeScript('return arguments[0].innerText;', title).then(function(text){
			test.equal(text, 'About the Book');
			test.done();
		});

	},
	tearDown : exports.tearDown
}

var loadSettingsDialog = function(test){
	var settingsBtn = driver.findElement({className: 'icon-settings'});
	settingsBtn.addErrback(testErrback.bind(null, test, 'settings button does not exist'));

	settingsBtn.click();

	var settingsDlg = driver.findElement({id: 'settings-dialog'})
	settingsDlg.addErrback(testErrback.bind(null, test, 'settings dialog does not exist'));

	waitForVisible(test, settingsDlg, 'settings dialog did not appear');

}
var saveSettings = function(test){
	var saveBtn = findElement(test, {css: '#settings-dialog .btn-primary'}, 'save settings button not present');
	saveBtn.click();
}

exports.settingsTests = {
	setUp : readerSetUp,
	testFontSize : function(test){
		
		loadSettingsDialog(test);
		
		var fontSlider = driver.findElement({id: 'font-size-input'});
		fontSlider.isDisplayed().then(function(displayed){
			test.ok(displayed, 'font slider is not visible');
		});

		driver.executeScript('return $(arguments[0]).val()', fontSlider).then(function(val){
			test.equal(val, 100, "Font size default value is wrong")
		});

		driver.executeScript('$(arguments[0]).val(160); $(arguments[0]).change();', fontSlider);

		var previewText = findElement(test, {className: 'preview-text'}, 'preview text does not exist');

		driver.executeScript('return arguments[0].style.fontSize;',previewText).then(function(fontSize){
			test.equal(fontSize, '1.6em');
		});

		saveSettings(test);

		driver.sleep(2000);

		switchToReaderFrame(test);

		var htmlElement = findElement(test, {css: 'html'}, 'No content in reader frame');
		driver.executeScript('return arguments[0].style.fontSize;', htmlElement).then(function(fontSize){
			test.equal(fontSize, '160%');
			test.done();
		});
	},
	testLayoutOptions : function(test){
		loadSettingsDialog(test);

		var twoPageOption = findElement(test, {css: '#two-up-option input'}, 'two page option not present');
		var onePageOption = findElement(test, {css: '#one-up-option input'}, 'one page option not present');

		var checkChecked = function(ele, expect, msg){
			driver.executeScript('return $(arguments[0]).prop("checked");', ele).then(function(checked){
				test.equal(checked, expect, msg);
			});
		}
		checkChecked(twoPageOption, true, "The two page options should be selected by default");
		checkChecked(onePageOption, false, "The one page option should be unselected by default");

		var selectRadio = function(ele){
			driver.executeScript('$(arguments[0]).prop("checked", true);', ele);
		}

		selectRadio(onePageOption);
		saveSettings(test);

		driver.sleep(2000);

		var iframeWidth;
		driver.executeScript('return $("iframe").css("width");').then(function(width){
			iframeWidth = width;
		});



		switchToReaderFrame(test);

		var htmlElement = findElement(test, {css: 'html'}, 'No content in reader frame');
		driver.executeScript('return arguments[0].style.width;', htmlElement).then(function(width){
			test.equal(width, iframeWidth, 'Did not switch to one column');		
		});

		switchToDefaultFrame();

		loadSettingsDialog(test);

		selectRadio(twoPageOption);
		driver.sleep(1000);
		saveSettings(test);

		driver.sleep(2000);
		switchToReaderFrame(test);
		driver.executeScript('return arguments[0].style.width;', htmlElement).then(function(width){
			test.notEqual(width, iframeWidth, 'Did not switch to two column');
			test.done();			
		});
	},

	testThemes : function(test){
		loadSettingsDialog(test);

		var previewText = findElement(test, {className: 'preview-text'}, 'preview text does not exist');


		driver.findElements({className: 'theme-option'}).then(function(themes){
			themes.forEach(function(theme){
				var themeColor,
					themeBg;

				theme.getCssValue('color').then(function(color){
					themeColor = color;
				});
				theme.getCssValue('backgroundColor').then(function(bgcolor){
					themeBg = bgcolor;
				});
				
				theme.click();
				
				previewText.getCssValue('color').then(function(color){
					test.equal(color, themeColor);
				});
				previewText.getCssValue('backgroundColor').then(function(bgcolor){
					test.equal(bgcolor, themeBg);
				});

			});
		});

		var nightTheme = findElement(test, {css: '#theme-radio-group .night-theme'}, 'Cannot find night theme button');
		nightTheme.click();
		
		var nightThemeColor,
			nightThemeBg;

		nightTheme.getCssValue('color').then(function(color){
			nightThemeColor = color;
		});
		nightTheme.getCssValue('backgroundColor').then(function(bgcolor){
			nightThemeBg = bgcolor;
		});

		driver.sleep(1000);

		saveSettings(test);

		switchToReaderFrame(test);

		var body = findElement(test, {css: 'body'}, 'Cannot find reader body');

		body.getCssValue('color').then(function(color){
			test.equal(color, nightThemeColor);
		});

		body.getCssValue('backgroundColor').then(function(bg){
			test.equal(bg, nightThemeBg);
			test.done();
		});
	},

	testMargins : function(test){
		loadSettingsDialog(test);

		var marginSlider = driver.findElement({id: 'margin-size-input'});
		marginSlider.isDisplayed().then(function(displayed){
			test.ok(displayed, 'margin slider is not visible');
		});

		driver.executeScript('return $(arguments[0]).val()', marginSlider).then(function(val){
			test.equal(val, 20, "Font size default value is wrong")
		});

		driver.executeScript('$(arguments[0]).val(80);', marginSlider);

		saveSettings(test);

		driver.sleep(2000);

		switchToReaderFrame(test);

		var htmlElement = findElement(test, {css: 'html'}, 'No content in reader frame');
		driver.executeScript('return arguments[0].style.webkitColumnGap;', htmlElement).then(function(gap){
			test.equal(gap, '80px');
		});

		switchToDefaultFrame();

		var container = findElement(test, {id: "epub-reader-container"}, 'Cannot locate reader container');

		container.getCssValue('margin').then(function(margin){
			test.equal(margin, '80px');
			test.done();
		})


	}
}
