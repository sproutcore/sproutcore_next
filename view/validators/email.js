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
  Requires a valid email format.
  
  @class
  @version 1.0
*/

export const EmailValidator = Validator.extend(
/** @scope Validator.Email.prototype */ {
  
  validate: function(form, field) { 
    return (field.get('fieldValue') || '').match(/.+@.+\...+/) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return SC.$error(SC.String.loc("Invalid.Email(%@)", label), label) ;
  }  
    
}) ;

/**
  This variant allows an empty field as well as an email address.
  
  @class
  
  @author Charles Jolley
  @version 1.0
*/
export const EmailOrEmptyValidator = EmailValidator.extend(
/** @scope Validator.EmailOrEmpty.prototype */ {
  validate: function(form, field) {
    var value = field.get('fieldValue') ; 
    return (value && value.length > 0) ? value.match(/.+@.+\...+/) : true ;
  }
}) ;
