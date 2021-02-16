// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { VALIDATE_NO_CHANGE, VALIDATE_OK } from '../system/constants.js';

/**
  @namespace

  Views that include the Validatable mixin can be used with validators to
  ensure their values are valid.

*/
export const Validatable = {

  /** @private */
  initMixin: function() {
    this._validatable_validatorDidChange() ;
  },

  /**
    The validator for this field.

    Set to a validator class or instance.  If this points to a class, it will
    be instantiated when the validator is first used.

    @type Validator
    @default null
  */
  validator: null,

  /**
    This property must return the human readable name you want used when
    describing an error condition.  For example, if set this property to
    "Your Email", then the returned error string might be something like
    "Your Email is not valid".

    You can return a loc string here if you like.  It will be localized when
    it is placed into the error string.

    @type String
    @default null
  */
  errorLabel: null,

  /**
    true if the receiver is currently valid.

    This property watches the value property by default.  You can override
    this property if you want to use some other method to calculate the
    current valid state.

    @field
    @type Boolean
    @default true
  */
  isValid: function() {
    return SC.typeOf(this.get('value')) !== SC.T_ERROR;
  }.property('value'),

  /**
    The form that the view belongs to.  May be null if the view does not
    belong to a form.  This property is usually set automatically by an
    owner form view.

    @type View
    @default null
  */
  ownerForm: null,

  /**
    Attempts to validate the receiver.

    Runs the validator and returns VALIDATE_OK, VALIDATE_false_CHANGE,
    or an error object.  If no validator is installed, this method will
    always return VALIDATE_OK.

    @param {Boolean} partialChange true if this is a partial edit.
    @returns {String} VALIDATE_OK, error, or VALIDATE_false_CHANGE
  */
  performValidate: function(partialChange) {
    var ret = VALIDATE_OK ;

    if (this._validator) {
      var form = this.get('ownerForm') ;
      if (partialChange) {
        ret = this._validator.validatePartial(form,this) ;

        // if the partial returned false_CHANGE, then check to see if the
        // field is valid anyway.  If it is not valid, then don't update the
        // value.  This way the user can have partially constructed values
        // without the validator trying to convert it to an object.
        if ((ret == VALIDATE_NO_CHANGE) && (this._validator.validateChange(form, this) == VALIDATE_OK)) {
          ret = VALIDATE_OK;
        }
      } else ret = this._validator.validateChange(form, this) ;
    }
    return ret ;
  },

  /**
    Runs validateSubmit.  You should use this in your implementation of
    validateSubmit.  If no validator is installed, this always returns
    VALIDATE_OK

    @returns {String}
  */
  performValidateSubmit: function() {
    return this._validator ? this._validator.validateSubmit(this.get('ownerForm'), this) : VALIDATE_OK;
  },

  /**
    Runs a keydown validation.  Returns true if the keydown should be
    allowed, false otherwise.  If no validator is defined, always returns true.

    @param {String} charStr the key string
    @returns {Boolean}
  */
  performValidateKeyDown: function(evt) {
    // ignore anything with ctrl or meta key press
    var charStr = evt.getCharString();
    if (!charStr) return true ;
    return this._validator ? this._validator.validateKeyDown(this.get('ownerForm'), this, charStr) : true;
  },

  /**
    Returns the validator object, if one has been created.

    @field
    @type Validator
  */
  validatorObject: function() {
    return this._validator;
  }.property(),

  /**
    Invoked by the owner form just before submission.  Override with your
    own method to commit any final changes after you perform validation.

    The default implementation simply calls performValidateSubmit() and
    returns that value.

    @type Boolean
  */
  validateSubmit: function() { return this.performValidateSubmit(); },

  /**
    Convert the field value string into an object.

    This method will call the validators objectForFieldValue if it exists.

    @param {Object} fieldValue the raw value from the field.
    @param {Boolean} partialChange
    @returns {Object}
  */
  objectForFieldValue: function(fieldValue, partialChange) {
    return this._validator ? this._validator.objectForFieldValue(fieldValue, this.get('ownerForm'), this) : fieldValue ;
  },

  /**
    Convert the object into a field value.

    This method will call the validator's fieldValueForObject if it exists.

    @param object {Object} the objec to convert
    @returns {Object}
  */
  fieldValueForObject: function(object) {
    return this._validator ? this._validator.fieldValueForObject(object, this.get('ownerForm'), this) : object ;
  },

  /** @private */
  _validatable_displayObserver: function() {
    this.displayDidChange();
  }.observes('isValid'),

  /** @private */
  renderMixin: function(context) {
    context.setClass('invalid', !this.get('isValid'));
  },

  /** @private
    Invoked whenever the attached validator changes.
  */
  _validatable_validatorDidChange: function() {
    var form = this.get('ownerForm') ;
    var val = Validator.findFor(form, this, this.get('validator')) ;
    if (val != this._validator) {
      this.propertyWillChange('validatorObject');
      if (this._validator) this._validator.detachFrom(form, this) ;
      this._validator = val;
      if (this._validator) this._validator.attachTo(form, this) ;
      this.propertyDidChange('validatorObject');
    }
  }.observes('validator', 'ownerForm')

};
