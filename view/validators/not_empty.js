// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require('validators/validator') ;
import { SC } from '../../core/core.js'; 
import { Validator } from "./validator.js";

/**
  Requires some content in field, but does not check the specific content.
  
  @class
  @author Charles Jolley
  @version 1.0
*/
export const NotEmptyValidator = Validator.extend(
/** @scope Validator.NotEmpty.prototype */ {
  
  validate: function(form, field) {
    var value = field.get('fieldValue');
    if (SC.none(value)) { return false; }
    if (! SC.none(value.length)) { return value.length > 0; }
    return true;
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error(SC.String.loc("Invalid.NotEmpty(%@)", SC.String.capitalize(label)), field.get('errorLabel'));
  }

}) ;
