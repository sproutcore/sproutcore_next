// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { SCEvent } from '../../event/event.js';
import { Control } from "../mixins/control.js";
import { Validatable } from "../mixins/validatable.js";
import { View } from "./view.js";

// sc_require('mixins/validatable') ;


/** @class

  Base view for managing a view backed by an input element.  Since the web
  browser provides native support for editing input elements, this view
  provides basic support for listening to changes on these input elements and
  responding to them.

  Generally you will not work with a FieldView directly.  Instead, you should
  use one of the subclasses implemented by your target platform such as
  CheckboxView, RadioView, TextFieldView, and so on.

  @since SproutCore 1.0
*/
export const FieldView = View.extend(Control, Validatable,
/** @scope FieldView.prototype */ {

  /**
  _field_isMouseDown: false,

  /**
    The raw value of the field itself.  This is computed from the 'value'
    property by passing it through any validator you might have set.  This is
    the value that will be set on the field itself when the view is updated.

    @type String
  */
  fieldValue: function() {
    var value = this.get('value');
    if (SC.typeOf(value) === SC.T_ERROR) value = value.get('errorValue');
    return this.fieldValueForObject(value);
  }.property('value', 'validator').cacheable(),

  // ..........................................................
  // PRIMITIVES
  //

  /**
    Override to return an CoreQuery object that selects the input elements
    for the view.  If this method is defined, the field view will
    automatically edit the attrbutes of the input element to reflect the
    current isEnabled state among other things.
  */
  $input: function() {
    var elementTagName = this._inputElementTagName(); // usually "input"
    return this.$(elementTagName).addBack().filter(elementTagName);
  },

  /** @private
    Override to specify the HTML element type to use as the field. For
    example, "input" or "textarea".
  */
  _inputElementTagName: function() {
    return 'input';
  },

  /**
    Override to set the actual value of the field.

    The default implementation will simple copy the newValue to the value
    attribute of any input tags in the receiver view.  You can override this
    method to provide specific functionality needed by your view.

    @param {Object} newValue the value to display.
    @returns {FieldView} receiver
  */
  setFieldValue: function(newValue) {
    if (SC.none(newValue)) newValue = '' ;
    var input = this.$input();

    // Don't needlessly set the element if it already has the value, because
    // doing so moves the cursor to the end in some browsers.
    if (input.val() !== newValue) {
      input.val(newValue);
    }
    return this ;
  },

  /**
    Override to retrieve the actual value of the field.

    The default implementation will simply retrieve the value attribute from
    the first input tag in the receiver view.

    @returns {String} value
  */
  getFieldValue: function() {
    return this.$input().val();
  },

  _field_fieldValueDidChange: function(evt) {
    SC.run(function() {
      this.fieldValueDidChange(false);
    }, this);
  },

  /**
    Your class should call this method anytime you think the value of the
    input element may have changed.  This will retrieve the value and update
    the value property of the view accordingly.

    If this is a partial change (i.e. the user is still editing the field and
    you expect the value to change further), then be sure to pass true for the
    partialChange parameter.  This will change the kind of validation done on
    the value.  Otherwise, the validator may mark the field as having an error
    when the user is still in mid-edit.

    @param partialChange (optional) true if this is a partial change.
    @returns {Boolean|Error} result of validation.
  */
  fieldValueDidChange: function(partialChange) {
    // collect the field value and convert it back to a value
    var fieldValue = this.getFieldValue();
    var value = this.objectForFieldValue(fieldValue, partialChange);
    this.setIfChanged('value', value);


    // ======= [Old code -- left here for concept reminders. Basic validation
    // API works without it] =======

    // validate value if needed...

    // this.notifyPropertyChange('fieldValue');
    //
    // // get the field value and set it.
    // // if ret is an error, use that instead of the field value.
    // var ret = this.performValidate ? this.performValidate(partialChange) : true;
    // if (ret === VALIDATE_false_CHANGE) return ret ;
    //
    // this.propertyWillChange('fieldValue');
    //
    // // if the validator says everything is OK, then in addition to posting
    // // out the value, go ahead and pass the value back through itself.
    // // This way if you have a formatter applied, it will reformat.
    // //
    // // Do this BEFORE we set the value so that the valueObserver will not
    // // overreact.
    // //
    // var ok = $ok(ret);
    // var value = ok ? this._field_getFieldValue() : ret ;
    // if (!partialChange && ok) this._field_setFieldValue(value) ;
    // this.set('value',value) ;
    //
    // this.propertyDidChange('fieldValue');
    //
    // return ret ;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private
    invoked when the value property changes.  Sets the field value...
  */
  _field_valueDidChange: function() {
    this.setFieldValue(this.get('fieldValue'));
  }.observes('fieldValue'),

  /**
    View view state callback.

    After the layer is created, set the field value and begin observing
    change events on the input field.
  */
  didCreateLayer: function() {
    this.setFieldValue(this.get('fieldValue'));
    this._addChangeEvent();
  },

  /**
    View state callback.

    Removes the change event from the input field.
  */
  willDestroyLayer: function() {
    SCEvent.remove(this.$input(), 'change', this, this._field_fieldValueDidChange);
  },

  // ACTIONS
  // You generally do not need to override these but they may be used.

  /**
    Called to perform validation on the field just before the form
    is submitted.  If you have a validator attached, this will get the
    validators.
  */
  // validateSubmit: function() {
  //   var ret = this.performValidateSubmit ? this.performValidateSubmit() : true;
  //   // save the value if needed
  //   var value = $ok(ret) ? this._field_getFieldValue() : ret ;
  //   if (value != this.get('value')) this.set('value', value) ;
  //   return ret ;
  // },

  // OVERRIDE IN YOUR SUBCLASS
  // Override these primitives in your subclass as required.

  /**
    RootResponder event handler.

    Allow the browser to do its normal event handling for the mouse down
    event.  But first, set isActive to true.
  */
  mouseDown: function(evt) {
    this._field_isMouseDown = true;
    evt.allowDefault();
    return true;
  },

  /**
    RootResponder event handler.

    Remove the active class on mouseExited if mouse is down.
  */
  mouseExited: function(evt) {
    if (this._field_isMouseDown) this.set('isActive', false);
    evt.allowDefault();
    return true;
  },

  /**
    RootResponder event handler.

    If mouse was down and we renter the button area, set the active state again.
  */
  mouseEntered: function(evt) {
    this.set('isActive', this._field_isMouseDown);
    evt.allowDefault();
    return true;
  },

  /**
    RootResponder event handler.

    On mouse up, remove the isActive class and then allow the browser to do
    its normal thing.
  */
  mouseUp: function(evt) {
    // track independently in case isEnabled has changed
    if (this._field_isMouseDown) this.set('isActive', false);
    this._field_isMouseDown = false;
    evt.allowDefault();
    return true ;
  },

  /**
    RootResponder event handler.

    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {

    // handle tab key
    if (evt.which === 9 || evt.keyCode===9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder(evt);
      else evt.allowDefault();
      return true ; // handled
    }

    // validate keyDown...
    if (this.performValidateKeyDown(evt)) {
      this._isKeyDown = true ;
      evt.allowDefault();
    } else {
      evt.stop();
    }

    return true;
  },

  /**
    Override of Responder.prototype.acceptsFirstResponder.

    Tied to the `isEnabledInPane` state.
  */
  acceptsFirstResponder: function() {
    if (SC.getSetting('FOCUS_ALL_CONTROLS')) { return this.get('isEnabledInPane'); }
    return false;
  }.property('isEnabledInPane'),

  /** @private */
  _addChangeEvent: function() {
    SCEvent.add(this.$input(), 'change', this, this._field_fieldValueDidChange);
  },

  /** @private */
  // these methods use the validator to convert the raw field value returned
  // by your subclass into an object and visa versa.
  _field_setFieldValue: function(newValue) {
    this.propertyWillChange('fieldValue');
    if (this.fieldValueForObject) {
      newValue = this.fieldValueForObject(newValue) ;
    }
    var ret = this.setFieldValue(newValue) ;
    this.propertyDidChange('fieldValue');
    return ret ;
  },

  /** @private */
  _field_getFieldValue: function() {
    var ret = this.getFieldValue() ;
    if (this.objectForFieldValue) ret = this.objectForFieldValue(ret);
    return ret ;
  }
});
