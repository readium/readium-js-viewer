var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

var config = require('./config.js');

chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var asserters = wd.asserters;

chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var extensionUrl = '';
//var extensionUrl = 'http://google.com';
describe("chrome extension tests", function() {
  var browser;


  var addLibraryItemForApp = function(filePath){
      console.log(filePath);
      
      return this
              .waitForElementByCss('.icon-add-epub',asserters.isDisplayed, 10000)
              .click()
              .waitForElementByCss('#add-epub-dialog', asserters.isDisplayed, 10000)
              .elementByCss('#epub-upload')
              .sendKeys(filePath)
              //.waitForElementByCss('.progress-bar', asserters.isDisplayed, 10000)
              .waitForElementByCss('.library-item', asserters.isDisplayed, 20000)
              .sleep(500);//wait for the modal dialog backdrop to fade
  }

  var addLibraryItemForBrowser = function(filePath){
    return this.noop();
  }

  var switchToReaderFrameOnTransition = function(){
    return this
            .waitFor(asserters.jsCondition('document.querySelectorAll("#reading-area .spinner").length == 0 && document.querySelectorAll("#epubContentIframe").length == 1'), 10000)
            .frame('epubContentIframe');

  }

  var openExtensionUrl = function(){
      // this is necessary because it seems that chrome won't load the extension immediately after startup.
      return this.get(extensionUrl).sleep(1000).get(extensionUrl);
  }

  wd.addPromiseChainMethod('addLibraryItem', config.chromeExtension ? addLibraryItemForApp : addLibraryItemForBrowser);
  wd.addPromiseChainMethod('openExtensionUrl', openExtensionUrl);
  wd.addPromiseChainMethod('switchToReaderFrameOnTransition', switchToReaderFrameOnTransition);

  beforeEach(function() {
    if (process.env.USE_SAUCE){
      var url = "ondemand.saucelabs.com",
          port = 80;

      if (process.env.TRAVIS_JOB_NUMBER){
        config.browser["tunnel-identifier"] = process.env.TRAVIS_JOB_NUMBER;
        url = 'localhost';
        port = 4445;
      }

      browser = wd.promiseChainRemote(url, port, 'readium', 'a36ebc10-e514-4da6-924c-307aec513550');

    }
    else{
         browser = wd.promiseChainRemote();
    }

console.log(config.browser.browserName);

    var retVal = browser.init(config.browser).setAsyncScriptTimeout(30000);
    
            browser.on('status', function(info) {
               //console.log('STATUS >', info);
           });

            browser.on('command', function(meth, path, data) {
               //console.log('COMMAND >', meth, path, (data || ''));
           });

            browser.on('http', function(meth, path, data) {
               //console.log('HTTP >', meth, path, (data || ''));
           });
    
//console.log(retVal);
    if (process.env.TRAVIS_JOB_NUMBER){
      return retVal.sauceJobUpdate({name: process.env.TRAVIS_JOB_NUMBER});
    }
    else{
      return retVal;
    }
  });

  afterEach(function() {
    return browser
        //.log('browser')
        //.then(function(logs) { console.log(logs);})
      .quit();
  });

  if (config.chromeExtension){
    it('confirm install and find url', function(){
      var extensionsHome = 'chrome://inspect/#extensions'
      return browser.get(extensionsHome).sleep(500).get(extensionsHome)
              .elementByXPath("//div[starts-with(text(), 'Readium')]/following-sibling::*")
              .text().then(function(url){
                var pathStart = url.lastIndexOf('/');
                extensionUrl = url.substring(0, pathStart) + '/index.html'
              });

    })
  }
  else{
    extensionUrl = config.url;
    console.log(extensionUrl);
  }
  it('should display library navbar', function(){
      return browser.openExtensionUrl()
          .waitForElementByCss('.navbar',  asserters.isDisplayed , 10000)
          .waitForElementByCss('.icon-add-epub', asserters.isDisplayed , 10000)
          .should.eventually.be.ok;
  });

  it('add epub from zip', function(){

      var testFile = process.cwd() + '/tests/epubs/accessible_epub_3.epub';

      return browser.openExtensionUrl()
          .addLibraryItem(testFile)
          .elementByCss('.library-item .title')
          .text()
          .should.become('Accessible EPUB 3')
          .elementByCss('.library-item .author')
          .text()
          .should.become('Matt Garrish');
  });

  describe ('common library tests', function(){
    it('view details', function(){
        var testFile = process.cwd() + '/tests/epubs/accessible_epub_3.epub';
        return browser.openExtensionUrl()
            .addLibraryItem(testFile)
            .elementByCss('button.details').isVisible()
            .should.eventually.be.false // verify details button is hidden at this point
            .elementByCss('.icon-list-view')//change to list view
            .click()
            .elementByCss('button.details').isVisible()
            .should.eventually.be.true
            .elementByCss('button.details')
            .click()
            .waitForElementByCss('.details-dialog', asserters.isDisplayed , 10000)
            .waitForElementByCss('.modal-book-info .modal-detail', asserters.isDisplayed , 10000)// the book info is loaded dynamically after the dialog opens
            .elementByCss('.modal-book-info .modal-detail:nth-of-type(1)').text()
            .should.become('Author: Matt Garrish')
            .elementByCss('.modal-book-info .modal-detail:nth-of-type(2)').text()
            .should.become('Publisher: O’Reilly Media, Inc.')
            .elementByCss('.modal-book-info .modal-detail:nth-of-type(3)').text()
            .should.become('Pub Date: 2012-02-20')
            .elementByCss('.modal-book-info .modal-detail:nth-of-type(4)').text()
            .should.become('Modified Date: 2012-10-24T15:30:00Z')
            .elementByCss('.modal-book-info .modal-detail:nth-of-type(5)').text()
            .should.become('ID: urn:isbn:9781449328030')
            .elementByCss('.modal-book-info .modal-detail:nth-of-type(6)').text()
            .should.become('EPUB version: 3.0');
    });

    it('read book from details dialog', function(){
      var testFile = process.cwd() + '/tests/epubs/accessible_epub_3.epub';
      return browser.openExtensionUrl()
        .addLibraryItem(testFile)
        .elementByCss('.icon-list-view')//change to list view
        .click()
        .elementByCss('button.details')
        .click()
        .waitForElementByCss('.details-dialog button.read', asserters.isDisplayed , 10000)
        .click()
        .switchToReaderFrameOnTransition()
        .waitForElementByCss('h1.title', asserters.isDisplayed , 10000)
        .text()
        .should.become('Accessible EPUB 3');
    });
  });

  describe('common reader tests', function(){

    var openSettingsDialog = function(){
      return this.elementByCss('.icon-settings')
              .click()
              .waitForElementByCss('#settings-dialog', asserters.isDisplayed , 10000)
              .sleep(500);
              //.sleep(500);
    }

    wd.addPromiseChainMethod('openSettingsDialog', openSettingsDialog);

    beforeEach(function() {
      var testFile = process.cwd() + '/tests/epubs/accessible_epub_3.epub';

      return browser.openExtensionUrl()
              .addLibraryItem(testFile)
              .elementByCss('.library-item button.read')
              .click()
              .switchToReaderFrameOnTransition()
              .waitForElementByCss('h1.title', asserters.isDisplayed , 10000)
              .frame()
    });

    it('turn page', function(){
      return browser
              .elementByCss('#right-page-btn')
              .click()
              .switchToReaderFrameOnTransition()
              .waitForElementByCss('h2.title', asserters.isDisplayed , 10000)
              .text()
              .should.become('Preface');
    });

    it ('table of contents', function(){
      return browser
              .elementByCss('.icon-toc')
              .click()
              .waitForElementByCss('#readium-toc-body', asserters.isDisplayed , 10000)
              .elementByCss('a[href="ch01.xhtml"]')
              .text()
              .should.become('1. Introduction')
              .elementByCss('a[href="ch01.xhtml"]')
              .click()
              .switchToReaderFrameOnTransition()
              .waitForElementByCss('#introduction h2.title')
              .text()
              .should.become('Chapter 1. Introduction');


    });

    it ('test font size', function(){
      return browser
              .openSettingsDialog()
              .elementByCss('#font-size-input')
              .getValue()
              .should.become('100')
              .execute('$("#font-size-input").val(160).change();')
              .elementByCss('#font-size-input')
              .getValue()
              .should.become('160')
              .execute('return $(".preview-text")[0].style.fontSize')
              .should.become('1.6em')
              .elementByCss('#settings-dialog .btn-primary')
              .click()
              .sleep(500)
              .frame('epubContentIframe')
              .execute('return document.querySelector("html").style.fontSize')
              .should.become('160%');

    });

    it('test layout options', function(){
      return browser
              .openSettingsDialog()
              .execute('return $("#spread-default-option input").prop("checked")')
              .should.eventually.be.true
              .execute('return $("#two-up-option input").prop("checked")')
              .should.eventually.be.false
              .execute('return $("#one-up-option input").prop("checked")')
              .should.eventually.be.false
              .execute('$("#one-up-option input").prop("checked", true)')
              .elementByCss('#settings-dialog .btn-primary')
              .click()
              .sleep(500)
              .execute('return $("iframe").css("width")').then(function(width){
                return browser
                  .frame('epubContentIframe')
                  .execute('return document.querySelector("html").style.width')
                  .should.become(width)
                  .frame()
                  .openSettingsDialog()
                  .execute('$("#two-up-option input").prop("checked", true)')
                  .elementByCss('#settings-dialog .btn-primary')
                  .click()
                  .sleep(500)
                  .frame('epubContentIframe')
                  .execute('return document.querySelector("html").style.width')
                  .should.not.become(width);
              })



    });

    // it('test margins', function(){
    //   return browser
    //           .openSettingsDialog()
    //           .elementByCss('#tab-butt-layout')
    //           .click()
    //           .elementByCss('#margin-size-input')
    //           .isDisplayed()
    //           .should.eventually.be.true
    //           .elementByCss('#margin-size-input')
    //           .getValue()
    //           .should.become('60');

    // });
    it('test page width', function(){
      return browser
              .openSettingsDialog()
              .elementByCss('#tab-butt-layout')
              .click()
              .elementByCss('#column-max-width-input')
              .isDisplayed()
              .should.eventually.be.true
              .elementByCss('#column-max-width-input')
              .getValue()
              .should.become('550');

    });


      it('READIUM HTTP EXIT...', function(){
        var url = "http://127.0.0.1:8080/exit-request_READIUMHTTPEXIT_.html";
        console.log(url);
        return browser.get(url, function() {
          browser.done();
        });
      });



  });



 });
