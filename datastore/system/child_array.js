// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';

/**
  @class

  A `ChildArray` is used to map an array of `ChildRecord` objects.

  @since SproutCore 1.0
*/

export const ChildArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope ChildArray.prototype */ {

  //@if(debug)
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /* @private */
  toString: function toStr () {
    var propertyName = this.get('propertyName'),
      length = this.get('length');
    const sup = toStr.base.apply(this, arguments);
    return "%@({  propertyName: '%@',  length: %@,  … })".fmt(sup, propertyName, length);
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  //@endif

  isChildArray: true,

  /**
    If set, it is the default record `recordType`

    @default null
    @type String
  */
  defaultRecordType: null,

  /**
    If this array changes, the parentObject will be notified in order to
    change its state. Always set.

    @default null
    @type {Record}
  */
  parentObject: null,

    /**
      The name of the attribute in the parent record's datahash that represents
      this child array's data.
  
      @default null
      @type String
    */
  parentAttribute: null,

  /**
    The store that owns this child array's parent record.

    @type {Store}
    @readonly
  */
  store: function() {
    return this.getPath('parentObject.store');
  }.property('parentObject').cacheable(),

  /**
    The storeKey for the parent record of this child array.

    @type Number
    @readonly
  */
  storeKey: function() {
    return this.getPath('parentObject.storeKey');
  }.property('parentObject').cacheable(),

  /**
    Returns the original child array of JavaScript Objects.

    Note: Avoid modifying this array directly, because changes will not be
    reflected by this ChildArray.

    @type Array
    @property
  */
  readOnlyChildren: function() {
    return this.get('parentObject').readAttribute(this.get('parentAttribute'));
  }.property(),

  /**
    Returns an editable child array of JavaScript Objects.

    Any changes to this array will not affect the parent record's datahash.

    @type {Array}
    @property
  */
  editableChildren: function() {
    var parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute'),
        ret;

    ret = parent.readEditableAttribute(parentAttr);
    if (!ret) {
      ret = [];
      this.recordPropertyDidChange();
    }

    return ret;
  }.property(),

  /**
     Convenience method to create a new subrecord.
     @type {SC.Record} Record model
     @type {hash} hash to create record from
     @property
   */
  createNestedRecord: function (recType, hash) {
    var parent = this.get('parentObject'),
        pattr = this.get('parentAttribute'),
        rec;

    // add ourselves as parent
    rec = parent.createNestedRecord(recType, hash, pattr, this);
    // update the cache while we can to prevent materializing of the same record
    if (this._records) {
      this._records.push(rec);
    }
    else this._records = [rec];
    this.arrayContentDidChange(this.get('length'), 0, 1);
    return rec;
  },

  /**
   * Convenience method to create a series of new subrecords
   * @param  {Record} recType
   * @param  {[type]} hashes  hashes of the records to create
   * @return {Array}         [description]
   */
  createNestedRecords: function (recType, hashes) {
    var pattr = this.get('parentAttribute');
    return hashes.map(function (h) {
      return this.createNestedRecord(recType, h, pattr, this);
    }, this);
  },

  /**
     Read the attribute key on the parent
   */
  readAttribute: function (key) {
    var parent = this.get('parentObject');
    if (!parent) throw new Error('ChildArray without a parentObject, this has to be a bug.');
    return parent.readAttribute(key);
  },

  /**
     Internal method for updating the underlying data hash
     @param {Array} keyStack: the stack with keys until now
     @param {any} value: value that needs to be written
     @param {boolean} ignoreDidChange: don't trigger observers
     @return {boolean} whether write did succeed.
   */

  _writeAttribute: function (keyStack, value, ignoreDidChange) {
    var parent = this.get('parentObject');
    if (!parent) throw new Error('ChildArray without a parentObject, this has to be a bug.');
    return parent._writeAttribute(keyStack, value, ignoreDidChange);
  },

  /**
     Called whenever a record did change
   */

  recordDidChange: function (key) {
    var parent = this.get('parentObject');
    if (!parent) throw new Error('ChildArray without a parentObject, this has to be a bug.');
    return parent.recordDidChange(key);
  },

  /**
     Returns attributes of the underlying array
   */

  attributes: function () {
    var parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute'),
        attrs;

    if (!parent) if (!parent) throw new Error('ChildArray without a parentObject, this has to be a bug.');
    attrs = parent.get('attributes');
    if (attrs) return attrs[parentAttr];
    else return attrs;
  }.property(),

  /**
     Returns the status of the underlying record
     @return {Number} enumerated in SC.Record
   */
  status: function () {
    return this.getPath('parentObject.status');
  }.property(),

  // ..........................................................
  // ARRAY PRIMITIVES
  //

  /** @private
    Returned length is a pass-through to the storeIds array.

    @type Number
    @property
  */
  length: function() {
    var children = this.get('readOnlyChildren');
    return children ? children.length : 0;
  }.property('readOnlyChildren'),

  /**
    Looks up the store id in the store ids array and materializes a
    records.

    @param {Number} idx index of the object to retrieve.
    @returns {Record} The nested record if found or undefined if not.
  */
  objectAt: function(idx) {
    var recs = this._records,
        children = this.get('readOnlyChildren'),
        hash, ret, pname = this.get('parentAttribute'),
        parent = this.get('parentObject'),
        len = children ? children.length : 0;

    if (!children) return undefined; // nothing to do
    if (recs && (ret = recs[idx])) return ret ; // cached
    if (!recs) this._records = recs = []; // create cache

    // If not a good index return undefined
    if (idx >= len) return undefined;
    hash = children.objectAt(idx);
    if (!hash) return undefined;

    // not in cache, materialize
    recs[idx] = ret = parent.materializeNestedRecord(hash, pname, this);

    return ret;
  },

  /**
    Pass through to the underlying array.  The passed in objects should be
    nested Records, which can be converted to JavaScript objects or
    JavaScript objects themselves.

    @param {Number} idx index of the object to replace.
    @param {Number} amt number of objects to replace starting at idx.
    @param {Number} recs array with records to replace. These may be JavaScript objects or nested Record objects.
    @returns {ChildArray}
  */
  replace: function(idx, amt, recs) {
    var children = this.get('editableChildren'),
        len = recs ? SC.get(recs, 'length'): 0,
        record = this.get('parentObject'), newRecs,
        pname = this.get('parentAttribute');

    newRecs = this._processRecordsToHashes(recs);
    // calling replace on the children would result in KVO activity on
    // an attribute hash and we don't want that.
    if (!recs || len === 0) {
      children.splice(idx, amt);
    } else {
      var args = [idx, amt].concat(newRecs);
      children.splice.apply(children, args);
    }

    this.arrayContentWillChange(idx, amt, len);
        // remove item from _records cache, to leave them to be materialized the
    // next time.
    if (this._records) {
      // we can do replace here as _records consists of SC.Record instances.
      this._records.replace(idx, amt);
    }
    record.writeAttribute(pname, children);
    // notify that the record did change
    record.recordDidChange(pname);
    this._childrenContentDidChange(idx, amt, len);
    // TODO: add comment to show which of the actions above
    // calls this.arrayContentDidChange
    return this;
  },

  /**
    returns the first object on the
   */

  shiftObject: function () {
    var ret, obj;
    if (this.get('length') === 0) return null;
    else {
      obj = this.objectAt(0);
      if (obj) {
        ret = obj.get('attributes');
        SC.Array.shiftObject.apply(this);
        return ret;
      }
    }
    return ret || null;
  },

  /**
    Unregisters a child record from its parent record.

    Since accessing a child (nested) record creates a new data hash for the
    child and caches the child record and its relationship to the parent record,
    it's important to clear those caches when the child record is overwritten
    or removed.  This function tells the store to remove the child record from
    the store's various child record caches.

    You should not need to call this function directly.  Simply setting the
    child record property on the parent to a different value will cause the
    previous child record to be unregistered.

    @param {Number} idx The index of the child record.
  */
  // unregisterNestedRecord: function(idx) {
  //   var childArray, childRecord, csk, store,
  //       record   = this.get('record'),
  //       pname    = this.get('propertyName');
  //
  //   store = record.get('store');
  //   childArray = record.getPath(pname);
  //   childRecord = childArray.objectAt(idx);
  //   csk = childRecord.get('storeKey');
  //   store.unregisterChildFromParent(csk);
  // },

  /**
    Calls normalize on each object in the array
  */
  normalize: function(){
    this.forEach(function (rec) {
      if (rec.normalize) rec.normalize();
    });
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private Converts any Records in the array into an array of hashes.

    @param {Array} recs records to be converted to hashes.
    @returns {Array} array of hashes.
  */
  _processRecordsToHashes: function (recs) {
    return recs.map(function (me) {
      if (me.isRecord) {
        if (me.isChildRecord) {
          return me.get('attributes');
        }
        else {
          var store = me.get('store');
          var sk = me.get('storeKey');
          return store.readDataHash(sk);
        }
      }
      else return me;
    });
  },

  

  /** @private
    This is called by the parent record whenever its properties change. It is
    also called by the ChildrenAttribute transform when the attribute is set
    to a new array.
  */
  recordPropertyDidChange: function (keys) {
    if (keys && !keys.contains(this.get('parentAttribute'))) return this;
    var start = 0, removedCount = 0, addedCount = 0;
    if (!keys) {
      removedCount = addedCount = this.get('length');
    }
    this.arrayContentWillChange(start, removedCount, addedCount);
    this._childrenContentDidChange(start, removedCount, addedCount);
    return this;
  },

  /**
     Invoked whenever the children array changes from the store

     @param {Array} keys Optional list of keys that have changed.

   */

  notifyChildren: function (keys) {

    var i, len = this.get('length');
    var j, numkeys = keys? keys.length : null;
    var obj;
    for (i = 0; i < len; i += 1) {
      obj = this.objectAt(i);
      if (obj) {
        if (!keys && obj.allPropertiesDidChange) obj.allPropertiesDidChange();
        else if (keys && obj.notifyPropertyChange) {
          for (j = 0; j < numkeys; j += 1) {
            obj.notifyPropertyChange(keys[j]);
          }
          obj.notifyPropertyChange('status');
        }
        if (obj.notifyChildren) {
          obj.notifyChildren(keys);
        }
      }
    }

    this.recordPropertyDidChange(keys);
  },

  _childrenContentDidChange: function (start, removedCount, addedCount) {
    // we cannot destroy the cache, we have to update it to not lose the
    // references to the materialized child records.
    // this._records = null;
    this.arrayContentDidChange(start, removedCount, addedCount);
  }

}) ;
