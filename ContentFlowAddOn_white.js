/*  ContentFlowAddOn_white, version 2.0 
 *  (c) 2008 - 2010 Sebastian Kutsch
 *  <http://www.jacksasylum.eu/ContentFlow/>
 *
 *  This file is distributed under the terms of the MIT license.
 *  (see http://www.jacksasylum.eu/ContentFlow/LICENSE)
 */

new ContentFlowAddOn ('white', {

    init: function () {
        this.addStylesheet();
    },
	
	ContentFlowConf: {
        reflectionColor: "#ffffff" // none, transparent, overlay or hex RGB CSS style #RRGGBB
	}

});
