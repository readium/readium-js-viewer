/*************************************************************
 *
 *  MathJax/config/readium-iframe.js
 *  
 *  Configuration file for Readium project
 *  
 *  ---------------------------------------------------------------------
 *  
 *  Copyright (c) 2013 MathJax Consortium
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

MathJax.Hub.Config({
  jax: ["input/MathML","output/SVG"],
  extensions: ["mml2jax.js","MathEvents.js"],
  MathML: {
    extensions: ["content-mathml.js"]
  },
  SVG: {
    font: "STIX-Web",
    mtextFontInherit: true,
    linebreaks: { automatic: true }
  },
  MathMenu: {
    showRenderer: false
  },
  menuSettings: {
    zoom: "Click"
  },
  MatchWebFonts: {
    matchFor: {
      SVG: true
    },
    fontCheckDelay: 500,
    fontCheckTimeout: 15 * 1000
  },
  messageStyle: "none"
});

MathJax.Hub.Register.StartupHook("SVG Jax Ready",function () {
  var SVG = MathJax.OutputJax.SVG, GLYPH = SVG.BBOX.GLYPH;
  GLYPH.Augment({
    Init: function (scale,id,h,d,w,l,r,p) {
      var t = SVG.config.blacker,
          def = {"stroke-width":t};
      if (p !== "") {def.d = "M"+p+"Z"}
      if (scale !== 1) {def.transform = "scale("+scale+")"}
      this.SUPER(arguments).Init.call(this,def);
      this.h = (h+t) * scale; this.d = (d+t) * scale; this.w = (w+t/2) *scale;
      this.l = (l+t/2) * scale; this.r = (r+t/2) * scale;
      this.H = Math.max(0,this.h); this.D = Math.max(0,this.d);
      this.x = this.y = 0; this.scale = scale;
    }
  });
});

MathJax.Ajax.loadComplete("[MathJax]/config/readium-iframe.js");
