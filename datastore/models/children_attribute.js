// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { ChildArray } from '../system/child_array.js';
import { ChildAttribute } from "./child_attribute.js";

// sc_require('models/record');
// sc_require('models/record_attribute');
// sc_require('models/child_attribute');
// sc_require('system/child_array');

/** @class

  ChildrenAttribute is a subclass of ChildAttribute and handles to-many
  relationships for child records.

  When setting ( `.set()` ) the value of a toMany attribute, make sure
  to pass in an array of Record objects.

  There are many ways you can configure a ChildrenAttribute:

      contacts: ChildrenAttribute.attr('Child');

  @since SproutCore 1.0
*/
export const ChildrenAttribute = ChildAttribute.extend(
  /** @scope ChildrenAttribute.prototype */ {

  // ..........................................................
  // LOW-LEVEL METHODS
  //

  /**  @private - adapted for to many relationship */
  toType: function (record, key, value) {
    var attrKey   = this.get('key') || key,
        arrayKey  = '__kidsArray___ ' + SC.guidFor(this),
        ret       = record[arrayKey],
        recordType  = this.get('typeClass'),
        rel;

    // lazily create a ChildArray one time.  after that always return the
    // same object.
    if (!ret) {
      ret = SC.ChildArray.create({
        parentObject: record,
        parentAttribute: attrKey,
        defaultRecordType: recordType
      });

      record[arrayKey] = ret; // cache on record

      // Make sure the child array gets notified of changes to the parent record.
      rel = record.get('relationships');
      if (!rel) record.set('relationships', rel = []);
      rel.push(ret);
    }

    return ret;
  },

  // Default fromType is just returning itself
  fromType: function (record, key, value) {
    var sk, store,
        arrayKey = '__kidsArray___' + SC.guidFor(this),
        ret = record[arrayKey];

    if (record) {
      record.writeAttribute(key, value);

      // If the ChildArray already exists, indicate that its backing content has changed.
      if (ret) ret = ret.recordPropertyDidChange();
    }

    return ret;
  }

  /** UNUSED. This seems to have no effect on ChildArray usage. Kept here for quick reference.
    The core handler.  Called from the property.
    @param {Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  // call: function(record, key, value) {
  //   var attrKey = this.get('key') || key, cRef,
  //       cacheKey = '__kid___' + guidFor(this);
  //   if (value !== undefined) {
  //     value = this.fromType(record, key, value) ; // convert to attribute.
  //   } else {
  //     value = record.readAttribute(attrKey);
  //     if (SC.none(value) && (value = this.get('defaultValue'))) {
  //       if (typeof value === T_FUNCTION) {
  //         value = this.defaultValue(record, key, this);
  //         // write default value so it doesn't have to be executed again
  //         if (record.attributes()) {
  //           // Check for an array
  //           if (value instanceof Array) {
  //             // Instantiate the construct and replace all of the content.
  //             value = this.toType(record, key, value).replace(0, value.length, value);
  //           } else {
  //             record.writeAttribute(attrKey, value, true);
  //           }
  //         }
  //       }
  //     } else value = this.toType(record, key, value);
  //   }

  //   return value ;
  // }

});


