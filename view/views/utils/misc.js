// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { pointInRect } from './rect.js';
import { CoreQuery } from '../../../event/event.js';
import { offset } from './utils.js';

let _downloadFrames = 0; // count of download frames inserted into document

  /**
    Starts a download of the file at the named path.

    Use this method when you want to cause a file to be downloaded to a users
    desktop instead of having it display in the web browser.  Note that your
    server must return a header indicating that the file  is intended for
    download also.
  */
export const download = function(path) {
  var tempDLIFrame=document.createElement('iframe'),
      frameId = 'DownloadFrame_' + this._downloadFrames;
  CoreQuery(tempDLIFrame).attr('id',frameId);
  tempDLIFrame.style.border='10px';
  tempDLIFrame.style.width='0px';
  tempDLIFrame.style.height='0px';
  tempDLIFrame.style.position='absolute';
  tempDLIFrame.style.top='-10000px';
  tempDLIFrame.style.left='-10000px';
  // Don't set the iFrame content yet if this is Safari
  if (!SC.browser.isSafari) {
    CoreQuery(tempDLIFrame).attr('src',path);
  }
  document.getElementsByTagName('body')[0].appendChild(tempDLIFrame);
  if (SC.browser.isSafari) {
    CoreQuery(tempDLIFrame).attr('src',path);
  }
  _downloadFrames = _downloadFrames + 1;
  if (!SC.browser.isSafari) {
    var r = function() {
      document.body.removeChild(document.getElementById(frameId));
      frameId = null;
    } ;
    r.invokeLater(null, 2000);
  }
  //remove possible IE7 leak
  tempDLIFrame = null;
};

  // Get the computed style from specific element. Useful for cloning styles
export const getStyle = function(oElm, strCssRule){
  var strValue = "";
  if(document.defaultView && document.defaultView.getComputedStyle){
    strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
  }
  else if(oElm.currentStyle){
    strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
    return p1.toUpperCase();
    });
    strValue = oElm.currentStyle[strCssRule];
  }
  return strValue;
};

  // Convert double byte characters to standard Unicode. Considers only
  // conversions from zenkaku to hankaky roomaji
export const uniJapaneseConvert = function (str){
  let nChar, cString= '', j, jLen;
  //here we cycle through the characters in the current value
  for (j=0, jLen = str.length; j<jLen; j++){
    nChar = str.charCodeAt(j);

    //here we do the unicode conversion from zenkaku to hankaku roomaji
    nChar = ((nChar>=65281 && nChar<=65392)?nChar-65248:nChar);

    //MS IME seems to put this character in as the hyphen from keyboard but not numeric pad...
    nChar = ( nChar===12540?45:nChar) ;
    cString = cString + String.fromCharCode(nChar);
  }
  return cString;
};

  /**
    Determines if the given point is within the given element.

    The test rect will include the element's padding and can be configured to
    optionally include the border or border and margin.

    @param {Object} point the point as an Object (ie. Hash) in the form { x: value, y: value }.
    @param {DOMElement|CoreQuery|String} elem the element to test inclusion within.
      This is passed to `CoreQuery()`, so any value supported by `CoreQuery()` will work.
    @param {String} includeFlag flag to determine the dimensions of the element to test within.
      One of either: 'padding', 'border' or 'margin' (default: 'border').
    @param {String} relativeToFlag flag to determine which relative element to determine offset by.
      One of either: 'document', 'viewport' or 'parent' (default: 'document').
    @returns {Boolean} true if the point is within the element; false otherwise
  */

  // Note: This method is the most correct way to test the inclusion of a point within a DOM element.
  // First, it uses offset which is a slightly improved version of CoreQuery's offset and much more reliable
  // than writing your own offset determination code.
  // Second, the offset must be adjusted to account for the element's left and top border
  // if not including the border or to account for the left and top margins when including the margins.
export const pointInElement = function (point, elem, includeFlag, relativeToFlag) {
  let offset,
      width,
      height,
      rect;

  elem = CoreQuery(elem);
  includeFlag = includeFlag || 'border';

  // Find the offset
  offset = offset(elem, relativeToFlag);

  // Find the dimensions
  if (includeFlag === 'padding') {
    width = elem.innerWidth();
    height = elem.innerHeight();

    // Adjust offset to account for top & left borders
    offset.x += window.parseInt(elem.css('border-left-width').replace('px', ''));
    offset.y += window.parseInt(elem.css('border-top-width').replace('px', ''));
  } else {
    width = elem.outerWidth(includeFlag === 'margin');
    height = elem.outerHeight(includeFlag === 'margin');

    if (includeFlag === 'margin') {
      // Adjust offset to account for top & left margins
      offset.x -= window.parseInt(elem.css('margin-left').replace('px', ''));
      offset.y -= window.parseInt(elem.css('margin-top').replace('px', ''));
    }
  }

  rect = {
    x: offset.x,
    y: offset.y,
    width: width,
    height: height
  };

  return pointInRect(point, rect);
};


  /**
    Switch the scale of your app. Useful when visualizing apps not designed
    for iphone.
  */
export const switchScale = function() {
  CoreQuery('head meta[name=viewport]').remove();
  if(window.innerWidth === window.screen.width){
    CoreQuery('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=0" />');
  }else{
    CoreQuery('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0" />');
  }
}
