// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js'; 
import { Validator } from "./validator.js";

// sc_require('validators/validator');


/**
  This validates a DateTime, used in DateFieldView.
  
  @class
  @author Juan Pablo Goldfinger
  @version 1.0
*/
export const DateTimeValidator = Validator.extend({

  /**
    The standard format you want the validator to convert dates to.
  */
  format: '%d/%m/%Y',

  /**
    if we have a number, then convert to a date object.
  */
  fieldValueForObject: function(object, form, field) {
    if (SC.kindOf(object, SC.DateTime)) {
      object = object.toFormattedString(this.get('format'));
    } else {
      object = null;
    }
    return object;
  },

  /**
    Try to pass value as a date. convert into a number, or return null if
    it could not be parsed.
  */
  objectForFieldValue: function(value, form, field) {
    if (value) {
      value = SC.DateTime.parse(value, this.get('format'));
    }
    return value;
  }

});
