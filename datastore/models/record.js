// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { FixturesDataSource } from '../data_sources/fixtures.js';
import { ManyArray } from '../system/many_array.js';
import { Query } from '../system/query.js';
import { ChildrenAttribute } from './children_attribute.js';
import { ChildAttribute } from './child_attribute.js';
import { FetchedAttribute } from './fetched_attribute.js';
import { ManyAttribute } from './many_attribute.js';
import { RecordAttribute } from './record_attribute.js';
import { SingleAttribute } from './single_attribute.js';

let Store;

import('../system/store.js').then(s => {
  Store = s.Store;
});

// sc_require('system/query');

/**
  @class

  A Record is the core model class in SproutCore. It is analogous to
  NSManagedObject in Core Data and EOEnterpriseObject in the Enterprise
  Objects Framework (aka WebObjects), or ActiveRecord::Base in Rails.

  To create a new model class, in your SproutCore workspace, do:

      $ sc-gen model MyApp.MyModel

  This will create MyApp.MyModel in clients/my_app/models/my_model.js.

  The core attributes hash is used to store the values of a record in a
  format that can be easily passed to/from the server.  The values should
  generally be stored in their raw string form.  References to external
  records should be stored as primary keys.

  Normally you do not need to work with the attributes hash directly.
  Instead you should use get/set on normal record properties.  If the
  property is not defined on the object, then the record will check the
  attributes hash instead.

  You can bulk update attributes from the server using the
  `updateAttributes()` method.

  # Polymorphic Records

  Record also supports polymorphism, which allows subclasses of a record type to share a common
  identity. Polymorphism is similar to inheritance (i.e. a polymorphic subclass inherits its parents
  properties), but differs in that polymorphic subclasses can be considered to be "equal" to each
  other and their superclass. This means that any memmber of the polymorphic class group should be
  able to stand in for any other member.

  These examples may help identify the difference. First, let's look at the classic inheritance
  model,

      // This is the "root" class. All subclasses of MyApp.Person will be unique from MyApp.Person.
      MyApp.Person = Record.extend({});

      // As a subclass, MyApp.Female inherits from a MyApp.Person, but is not "equal" to it.
      MyApp.Female = MyApp.Person.extend({
        isFemale: true
      });

      // As a subclass, MyApp.Male inherits from a MyApp.Person, but is not "equal" to it.
      MyApp.Male = MyApp.Person.extend({
        isMale: true
      });

      // Load two unique records into the store.
      MyApp.store.createRecord(MyApp.Female, { guid: '1' });
      MyApp.store.createRecord(MyApp.Male, { guid: '2' });

      // Now we can see that these records are isolated from each other.
      var female = MyApp.store.find(MyApp.Person, '1'); // Returns an Record.EMPTY record.
      var male = MyApp.store.find(MyApp.Person, '2'); // Returns an Record.EMPTY record.

      // These records are MyApp.Person only.
      SC.kindOf(female, MyApp.Female); // false
      SC.kindOf(male, MyApp.Male); // false

  Next, let's make MyApp.Person a polymorphic class,

      // This is the "root" polymorphic class. All subclasses of MyApp.Person will be able to stand-in as a MyApp.Person.
      MyApp.Person = Record.extend({
        isPolymorphic: true
      });

      // As a polymorphic subclass, MyApp.Female is "equal" to a MyApp.Person.
      MyApp.Female = MyApp.Person.extend({
        isFemale: true
      });

      // As a polymorphic subclass, MyApp.Male is "equal" to a MyApp.Person.
      MyApp.Male = MyApp.Person.extend({
        isMale: true
      });

      // Load two unique records into the store.
      MyApp.store.createRecord(MyApp.Female, { guid: '1' });
      MyApp.store.createRecord(MyApp.Male, { guid: '2' });

      // Now we can see that these records are in fact "equal" to each other. Which means that if we
      // search for "people", we will get "males" & "females".
      var female = MyApp.store.find(MyApp.Person, '1'); // Returns record.
      var male = MyApp.store.find(MyApp.Person, '2'); // Returns record.

      // These records are MyApp.Person as well as their unique subclass.
      SC.kindOf(female, MyApp.Female); // true
      SC.kindOf(male, MyApp.Male); // true

  @see RecordAttribute
  @since SproutCore 1.0
*/
export const Record = SC.Object.extend(
/** @scope Record.prototype */ {

  //@if(debug)
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /** @private
    Creates string representation of record, with status.

    @returns {String}
  */
  toString: function () {
    // We won't use 'readOnlyAttributes' here because accessing them directly
    // avoids a clone() -- we'll be careful not to edit anything.
    var attrs = this.get('store').readDataHash(this.get('storeKey'));
    return "%@(%@) %@".fmt(this.constructor.toString(), SC.inspect(attrs), this.statusString());
  },

  /** @private
    Creates string representation of record, with status.

    @returns {String}
  */

  statusString: function () {
    var ret = [], status = this.get('status');

    for(var prop in Record) {
      if(prop.match(/[A-Z_]$/) && Record[prop]===status) {
        ret.push(prop);
      }
    }

    return ret.join(" ");
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  //@endif

  /**
    Walk like a duck

    @type Boolean
    @default true
  */
  isRecord: true,

  /**
    If you have nested records

    @type Boolean
    @default NO
  */
  isParentRecord: false,

  /**
   Indicates whether this SC.Record is nested within another SC.Record

    @property {Boolean}
    */

  isChildRecord: false,

  // ----------------------------------------------------------------------------------------------
  // Properties
  //

  /**
    Returns the id for the record instance.  The id is used to uniquely
    identify this record instance from all others of the same type.  If you
    have a `primaryKey set on this class, then the id will be the value of the
    `primaryKey` property on the underlying JSON hash.

    @type String
    @property
    @dependsOn storeKey
  */
  id: function(key, value) {
    const pk = this.get('primaryKey');
    const parent = this.get('parentObject');
    if (value !== undefined) {
      this.writeAttribute(pk, value);
      return value;
    }
    else {
      if (parent) {
        return this.readAttribute(pk);
      }
      else return Store.idFor(this.storeKey);
    }
  }.property('storeKey').cacheable(),

  /**
    This is the primary key used to distinguish records.  If the keys
    match, the records are assumed to be identical.

    @type String
    @default 'guid'
  */
  primaryKey: 'guid',

  /**
    All records generally have a life cycle as they are created or loaded into
    memory, modified, committed and finally destroyed.  This life cycle is
    managed by the status property on your record.

    The status of a record is modelled as a finite state machine.  Based on the
    current state of the record, you can determine which operations are
    currently allowed on the record and which are not.

    In general, a record can be in one of five primary states:
    `Record.EMPTY`, `Record.BUSY`, `Record.READY`,
    `Record.DESTROYED`, `Record.ERROR`.  These are all described in
    more detail in the class mixin (below) where they are defined.

    @type Number
    @property
    @dependsOn storeKey
  */
  status: function() {
    var parent = this.get('parentObject');
    if (parent) {
      if (this._sc_nestedrec_isDestroyed) return SC.Record.DESTROYED;
      else return parent.get('status');
    }
    else return this.store.readStatus(this.storeKey);
  }.property('storeKey'),

  /**
    The store that owns this record.  All changes will be buffered into this
    store and committed to the rest of the store chain through here.

    This property is set when the record instance is created and should not be
    changed or else it will break the record behavior.

    @type Store
    @default null
  */
  store: function () {
    return this.getPath('parentObject.store');
  }.property().cacheable(),

  /**
    This is the store key for the record, it is used to link it back to the
    dataHash. If a record is reused, this value will be replaced.

    You should not edit this store key but you may sometimes need to refer to
    this store key when implementing a Server object.

    @type Number
    @default null
  */
  storeKey: function () {
    return this.getPath('parentObject.storeKey');
  }.property().cacheable(),

  /**
    This is the record type for the record.

    @type Record
    @property
  */
  recordType: function() {
    return this.constructor;
  }.property().cacheable(),

  /**
    private indicator
   */
  _sc_nestedrec_isDestroyed: false,

  /**
    true when the record has been destroyed

    @type Boolean
    @property
    @dependsOn status
  */
  isDestroyed: function (key, value) {
    var parent = this.get('parentObject');
    if (parent) {
      if (value !== undefined) {
        this._sc_nestedrec_isDestroyed = value; // setting for destroyed nested recs
      }
      else if (this._sc_nestedrec_isDestroyed) {
        return true;
      }
      else {
        return !!(parent.get('status') & Record.DESTROYED);
      }
    }
    else {
      return !!(this.get('status') & Record.DESTROYED);
    }
  }.property('status').cacheable(),

  /**
    `true` when the record is in an editable state.  You can use this property to
    quickly determine whether attempting to modify the record would raise an
    exception or not.

    This property is both readable and writable.  Note however that if you
    set this property to `true` but the status of the record is anything but
    `Record.READY`, the return value of this property may remain `false`.

    @type Boolean
    @property
    @dependsOn status
  */
  isEditable: function(key, value) {
    if (value !== undefined) this._screc_isEditable = value;
    if (this.get('status') & Record.READY) return this._screc_isEditable;
    else return false;
  }.property('status').cacheable(),

  /**
    @private

    Backing value for isEditable
  */
  _screc_isEditable: true, // default

  /**
    `true` when the record's contents have been loaded for the first time.  You
    can use this to quickly determine if the record is ready to display.

    @type Boolean
    @property
    @dependsOn status
  */
  isLoaded: function() {
    const status = this.get('status');
    return !((status===Record.EMPTY) || (status===Record.BUSY_LOADING) || (status===Record.ERROR));
  }.property('status').cacheable(),

  /**
    If set, this should be an array of active relationship objects that need
    to be notified whenever the underlying record properties change.
    Currently this is only used by toMany relationships, but you could
    possibly patch into this yourself also if you are building your own
    relationships.

    Note this must be a regular Array - NOT any object implementing Array.

    @type Array
    @default null
  */
  relationships: null,

  /**
    This will return the raw attributes that you can edit directly.  If you
    make changes to this hash, be sure to call `beginEditing()` before you get
    the attributes and `endEditing()` afterwards.

    @type Hash
    @property
  **/
  attributes: function() {
    var store, storeKey, attrs, idx,
        parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute');

    if (parent) {
      if (this.get('isDestroyed')) return null;
      else {
        attrs = parent.get('attributes');
        if (attrs) {
          if (parent.isChildArray) {
            idx = parent.indexOf(this);
            return attrs[idx];
          }
          else return attrs[parentAttr];
        }
        else return attrs;
      }
    }
    else {
      store = this.get('store');
      storeKey = this.get('storeKey');
      return store.readEditableDataHash(storeKey);
    }
  }.property(),

  /**
    This will return the raw attributes that you cannot edit directly.  It is
    useful if you want to efficiently look at multiple attributes in bulk.  If
    you would like to edit the attributes, see the `attributes` property
    instead.

    @type Hash
    @property
  **/
  readOnlyAttributes: function() {
    var parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute'),
        attrs, idx;

    if (parent) {
      if (this.get('isDestroyed')) return null;
      else {
        attrs = parent.readAttribute(parentAttr);
        if (parent.isChildArray) {
          idx = parent.indexOf(this);
          return attrs[idx];
        }
        return attrs;
      }
    }
    else {
      var store = this.get('store');
      var storeKey = this.get('storeKey');
      var ret = store.readDataHash(storeKey);
      if (ret) ret = SC.clone(ret, true);
      return ret;
    }
  }.property(),


  /**
    Whether or not this is a nested Record.

    @type Boolean
    @property
  */
  isNestedRecord: false,

  /**
    The parent record if this is a nested record.

    @type Boolean
    @property
  */
  parentObject: null,

  /**
    The property where the data hash for this SC.Record is stored
    in the parentObject's data hash. In the event that this attribute was defined
    using .toOne() it will be a String. If defined using .toMany, it will be
    a number corresponding to the index in the SC.ChildArray.

    @type Boolean
    @property
  */
  parentAttribute: null,

  /**
    Computed property for backwards compatibility
   */
  parentRecord: function () {
    var ret = this.get('parentObject');
    if (ret && ret.isChildArray) {
      ret = ret.objectAt(ret.indexOf(this));
    }
    return ret;
  }.property('parentObject').cacheable(),

  // ...............................
  // CRUD OPERATIONS
  //

  /**
    Refresh the record from the persistent store.  If the record was loaded
    from a persistent store, then the store will be asked to reload the
    record data from the server.  If the record is new and exists only in
    memory then this call will have no effect.

    @param {boolean} recordOnly optional param if you want to only THIS record
      even if it is a child record.
    @param {Function} callback optional callback that will fire when request finishes

    @returns {Record} receiver
  */
  refresh: function(recordOnly, callback) {
    var store = this.get('store'), rec, ro,
        sk = this.get('storeKey'),
        parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute');

    // If we only want to commit this record or it doesn't have a parent record
    // we will commit this record
    ro = recordOnly || (SC.none(recordOnly) && SC.none(parent));
    if (ro) {
      store.refreshRecord(null, null, sk, callback);
    } else if (parent){
      parent.refresh(recordOnly, callback);
    }

    return this;
  },

  /**
    Deletes the record along with any dependent records.  This will mark the
    records destroyed in the store as well as changing the isDestroyed
    property on the record to true.  If this is a new record, this will avoid
    creating the record in the first place.

    @param {boolean} recordOnly optional param if you want to only THIS record
      even if it is a child record.

    @returns {Record} receiver
  */
  destroy: function(recordOnly) {
    var store = this.get('store'), rec, ro,
        sk = this.get('storeKey'),
        isParent = this.get('isParentRecord'),
        parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute');

    // If we only want to commit this record or it doesn't have a parent record
    // we will commit this record
    ro = recordOnly || (SC.none(recordOnly) && SC.none(parent));
    if (ro) {
      store.destroyRecord(null, null, sk);
      this.notifyPropertyChange('status');
      // If there are any aggregate records, we might need to propagate our new
      // status to them.
      this.propagateToAggregates();

    } else if (parent) {
      if (parent.isChildArray) parent.removeObject(this);
      else {
        parent.writeAttribute(parentAttr, null); // remove from parent hash
      }
      this._sc_nestedrec_isDestroyed = true;
      this.notifyPropertyChange('status');
      this.notifyPropertyChange('isDestroyed');
    }
    if (isParent) this.notifyChildren(['status']);

    return this;
  },

  /**
   Helper method to destroy the children of this record when this record is
   being destroyed.
  */

  _destroyChildren: function () {
    var i, item, io = SC.instanceOf;
    for (i in this) {
      item = this[i];
      if (item && (io(item, ChildAttribute) || io(item, ChildrenAttribute))) {
        this.get(i).destroy();
      }
    }
  },

  /**
     Notifies the children of this record of a property change on the underlying
     hash

     @param {Array} keys
   */
  notifyChildren: function (keys) {
    var i, item, obj;
    for (i in this) {
      item = this[i];
      if (item && (item.isChildAttribute || item.isChildrenAttribute)) {
        obj = this.get(i);
        if (obj) {
          if (!keys && obj.allPropertiesDidChange) {
            obj.allPropertiesDidChange();
          }
          else {
            if (obj.notifyPropertyChange) {
              obj.notifyPropertyChange(keys);
              obj.notifyPropertyChange('status');
            }
          }
          if (obj.notifyChildren) {
            obj.notifyChildren(keys);
          }
        }
      }
    }
    if (this.isChildRecord) {
      // this makes sure the cache on the status property is invalidated whenever a change
      // from either the store or somewhere else in the nested record structure is propagated.
      this.notifyPropertyChange('status');
    }

  },

  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be committed when you `commitChanges()`
    on the underlying store.

    If you use the `writeAttribute()` primitive, this method will be called
    for you.

    If you pass the key that changed it will ensure that observers are fired
    only once for the changed property instead of `allPropertiesDidChange()`

    @param {String} key key that changed (optional)
    @returns {Record} receiver
  */
  recordDidChange: function(key) {

    // If we have a parent, they changed too!
    var p = this.get('parentObject');
    if (p) p.recordDidChange();
    else {
      this.get('store').recordDidChange(null, null, this.get('storeKey'), key);
    }

    this.notifyPropertyChange('status');

    // If there are any aggregate records, we might need to propagate our new
    // status to them.
    this.propagateToAggregates();

    return this;
  },

  toJSON: function(){
    return this.get('attributes');
  },

  // ...............................
  // ATTRIBUTES
  //

  /**
     This function is included specifically to make it easier to compare records through
     SC.isEqual. Because of this function, it will compare records based on a string representation
     of their attributes. If this is the same, they are regarded to be equal.
     This is especially useful to compare child records with "normal" records.
     @return {String} hashified JSON string of the contents of this record.
   */
  hash: function () {
    return "%" + JSON.stringify(this.get('attributes'));
  },

  /** @private
    Current edit level.  Used to defer editing changes.
  */
  _editLevel: 0 ,

  /**
    Defers notification of record changes until you call a matching
    `endEditing()` method.  This method is called automatically whenever you
    set an attribute, but you can call it yourself to group multiple changes.

    Calls to `beginEditing()` and `endEditing()` can be nested.

    @returns {Record} receiver
  */
  beginEditing: function() {
    this._editLevel++;
    return this;
  },

  /**
    Notifies the store of record changes if this matches a top level call to
    `beginEditing()`.  This method is called automatically whenever you set an
    attribute, but you can call it yourself to group multiple changes.

    Calls to `beginEditing()` and `endEditing()` can be nested.

    @param {String} key key that changed (optional)
    @returns {Record} receiver
  */
  endEditing: function(key) {
    if(--this._editLevel <= 0) {
      this._editLevel = 0;
      this.recordDidChange(key);
    }
    return this;
  },

  /**
    Reads the raw attribute from the underlying data hash.  This method does
    not transform the underlying attribute at all.

    @param {String} key the attribute you want to read
    @returns {Object} the value of the key, or undefined if it doesn't exist
  */
  readAttribute: function(key) {
    var parent = this.get('parentObject'),
        store, storeKey, attrs, idx, parentAttr;

    if (!parent) {
      store = this.get('store');
      storeKey = this.get('storeKey');
      attrs = store.readDataHash(storeKey);
    }
    else { // get the datahash from the parent record
      parentAttr = this.get('parentAttribute');
      attrs = parent.readAttribute(parentAttr);
      if (parent.isChildArray) {
        // this assumes the order of the nested records in the child
        // array is the same as in the underlying hash. This doesn't
        // need to be the case when things change from the store side.
        // needs a test somehow
        idx = parent.indexOf(this);
        attrs = attrs[idx];
      }
    }

    return attrs ? attrs[key] : undefined;
  },

  /**
    Reads the raw attribute from the underlying data hash
    @param {String} the key of the attribute you want to read
    @returns {Object} the value of the key, or undefined if it
                      doesn't exist.
   */

  readEditableAttribute: function (key) {
    var attr = this.readAttribute(key);
    return SC.clone(attr);
  },

  /**
    Helper method to recurse down the attributes to the data hash we are changing

    @param attrs
    @param keyStack
    @return {Object}
    @private
    */

  _retrieveAttrs: function (attrs, keyStack) {
    var newattrs, newkey;
    if (2 >= keyStack.length) { // retrieveAttrs runs one time too many
      if (keyStack.length === 2) {
        newkey = keyStack.pop();
        newattrs = attrs[newkey];
      }
      else newattrs = attrs;
      if (newattrs === null || newattrs === undefined) {
        keyStack.push(newkey); // push back on
        return newattrs;
      }
      else return newattrs;
    }
    else {
      newkey = keyStack.pop();
      newattrs = attrs[newkey];
      if (newattrs) {
        return this._retrieveAttrs(newattrs, keyStack);
      }
    }
    if (newattrs === null || newattrs === undefined) {
      keyStack.pusn(newkey);
    }
    return newattrs;
  },

  /**
    A helper to actually write the attribute to the record hash.

    The keyStack has a bottom up approach: the deepest level key name
    is its first element:

    {
      user: {
        addresses: [
          { street_name: 'something' }
        ]
      }
    }

    keyStack: ['street_name', 0, 'addresses', 'user']
    */

  _writeAttribute: function (keyStack, value, ignoreDidChange) {
    var parent = this.get('parentObject'), parentAttr, store, storeKey,
        attrs, attrsToChange, lastKey, curAttr, i, didChange = false;

    if (parent) {
      // if there is a parent, we need to get the editable hash from
      // the parent record push the parentAttribute onto the keyStack
      // and call this function on the parent.
      if (parent.isChildArray) {
        keyStack.push(parent.indexOf(this));
      }
      parentAttr = this.get('parentAttribute');
      keyStack.push(parentAttr);
      didChange = parent._writeAttribute(keyStack, value, ignoreDidChange);
    }
    else {
      // we have reached the top, now grabbing the editable hash from the store
      // and update it.
      store = this.get('store');
      storeKey = this.get('storeKey');
      attrs = store.readEditableDataHash(storeKey);
      // no attrs? not good
      if (!attrs) throw Record.BAD_STATE_ERROR;

      attrsToChange = attrs;
      // down from the last key but don't take the first
      for (i = keyStack.length - 1; i > 0; i -= 1) {
        curAttr = attrsToChange[keyStack[i]];
        if (!curAttr) {
          // current attr doesn't exist? check whether next is a number, and
          // if yes, current is an array
          if (SC.typeOf(keyStack[i - 1]) === SC.T_NUMBER) {
            attrsToChange[keyStack[i]] = [];
          }
          else {
            attrsToChange[keyStack[i]] = {};
          }
        }
        attrsToChange = attrsToChange[keyStack[i]];
      }
      lastKey = keyStack[0];

      // TODO: we need to throw an exception if we run out of keys or
      // attributes.

      // if the value is the same as the one we are setting, do not flag
      // the record as dirty.

      var prevValue = attrsToChange[lastKey];
      if (value !== prevValue) {
        // NOTE: the public method, writeAttribute, will call
        // beginEditing and endEditing for us.
        attrsToChange[lastKey] = value;
        didChange = true;
      }
      else if (SC.typeOf(value) === SC.T_ARRAY) {
        // we cannot discover whether a change has taken place, so
        // assume that when someone writes the array, the array itself has been
        // changed
        didChange = true;
      }
    }

    return didChange;
  },


  /**
    Updates the passed attribute with the new value.  This method does not
    transform the value at all.  If instead you want to modify an array or
    hash already defined on the underlying json, you should instead get
    an editable version of the attribute using `editableAttribute()`.

    @param {String} key the attribute you want to read
    @param {Object} value the value you want to write
    @param {Boolean} ignoreDidChange only set if you do NOT want to flag
      record as dirty
    @returns {Record} receiver
  */
  writeAttribute: function(key, value, ignoreDidChange) {
    var keyStack = [], didChange, store = this.get('store'),
        storeKey = this.get('storeKey');

    if (!ignoreDidChange) this.beginEditing();

    keyStack.push(key);
    didChange = this._writeAttribute(keyStack, value, ignoreDidChange);

    if (didChange) {
      if (key === this.get('primaryKey')) {
        Store.replaceIdFor(storeKey, value);
        this.propertyDidChange('id'); // Reset computed value
      }

      if (!ignoreDidChange) this.endEditing(key);
      else {
        // We must still inform the store of the change so that it can track the change across stores.
        store.dataHashDidChange(storeKey, null, undefined, key);
      }
    }

    return this;
  },

  /**
    This will also ensure that any aggregate records are also marked dirty
    if this record changes.

    Should not have to be called manually.
  */
  propagateToAggregates: function() {
    var storeKey   = this.get('storeKey'),
      // Don't use the recordType computed property as it may have been overridden
      recordType = Store.recordTypeFor(storeKey),
      aggregates = recordType.__sc_aggregate_keys,
      idx, len, key, prop, val, recs;

    // if recordType aggregates are not set up yet, make sure to
    // create the cache first
    if (!aggregates) {
      aggregates = [];
      for (key in this) {
        prop = this[key];
        if (prop  &&  prop.isRecordAttribute  &&  prop.aggregate === true) {
          aggregates.push(key);
        }
      }
      recordType.__sc_aggregate_keys = aggregates;
    }

    // now loop through all aggregate properties and mark their related
    // record objects as dirty
    var K          = Record,
        dirty      = K.DIRTY,
        readyNew   = K.READY_NEW,
        destroyed  = K.DESTROYED,
        readyClean = K.READY_CLEAN,
        iter;

    /**
      @private

      If the child is dirty, then make sure the parent gets a dirty
      status.  (If the child is created or destroyed, there's no need,
      because the parent will dirty itself when it modifies that
      relationship.)

      @param {Record} record to propagate to
    */
    iter =  function(rec) {
      var childStatus, parentStore, parentStoreKey, parentStatus;

      if (rec) {
        childStatus = this.get('status');
        if ((childStatus & dirty)  ||
            (childStatus & readyNew)  ||  (childStatus & destroyed)) {

          // Since the parent can cache 'status', and we might be called before
          // it has been invalidated, we'll read the status directly rather than
          // trusting the cache.
          parentStore    = rec.get('store');
          parentStoreKey = rec.get('storeKey');
          parentStatus   = parentStore.peekStatus(parentStoreKey);
          if (parentStatus === readyClean) {
            // Note:  storeDidChangeProperties() won't put it in the
            //        changelog!
            rec.get('store').recordDidChange(rec.constructor, null, rec.get('storeKey'), null, true);
          }
        }
      }
    };

    for(idx=0,len=aggregates.length;idx<len;++idx) {
      key = aggregates[idx];
      val = this.get(key);
      recs = SC.kindOf(val, ManyArray) ? val : [val];
      recs.forEach(iter, this);
    }
  },

  /**
    Called by the store whenever the underlying data hash has changed.  This
    will notify any observers interested in data hash properties that they
    have changed.

    @param {Boolean} statusOnly changed
    @param {String} key that changed (optional)
    @returns {Record} receiver
  */
  storeDidChangeProperties: function(statusOnly, keys) {
    // TODO:  Should this function call propagateToAggregates() at the
    //        appropriate times?
    var isParent = this.get('isParentRecord');
    if (statusOnly) {
      this.notifyPropertyChange('status');
      if (isParent) this.notifyChildren(['status']);
    }
    else {
      if (keys) {
        this.beginPropertyChanges();
        if (isParent) {
          // if we would call notifyPropertyChange on this when the current record is a
          // parent, the materialized child records would disappear from the cache
          this.notifyChildren(keys);
        }
        else {
          keys.forEach(function(k) {
            this.notifyPropertyChange(k);
          }, this);
        }
        this.notifyPropertyChange('status');
        this.endPropertyChanges();
      } else {
        if (isParent) {
          // this is an alternative to allPropertiesDidChange() which would invalidate the cache on
          // all the child record and child array properties. Perhaps move to notifyChildren?
          // Suspicion is that this problem also plays at nested records.
          var p;
          for (var i in this) {
            p = this[i];
            if (p && p.isRecordAttribute && (!p.isChildAttribute || p.isChildrenAttribute)) {
              this.notifyPropertyChange(i);
            }
          }
          this.notifyChildren();
          this.notifyPropertyChange('status');
        }
        else this.allPropertiesDidChange();
      }

      // also notify manyArrays
      var manyArrays = this.relationships,
          loc        = manyArrays ? manyArrays.length : 0;
      while(--loc>=0) {
        manyArrays[loc].recordPropertyDidChange(keys);
      }
    }
  },

  /**
    Normalizing a record will ensure that the underlying hash conforms
    to the record attributes such as their types (transforms) and default
    values.

    This method will write the conforming hash to the store and return
    the materialized record.

    By normalizing the record, you can use `.attributes()` and be
    assured that it will conform to the defined model. For example, this
    can be useful in the case where you need to send a JSON representation
    to some server after you have used `.createRecord()`, since this method
    will enforce the 'rules' in the model such as their types and default
    values. You can also include null values in the hash with the
    includeNull argument.

    @param {Boolean} includeNull will write empty (null) attributes
    @returns {Record} the normalized record
  */

  normalize: function(includeNull) {
    var primaryKey = this.primaryKey,
        recordId = this.get('id'),
        store = this.get('store'),
        storeKey = this.get('storeKey'),
        keysToKeep = {},
        key, valueForKey, typeClass, recHash, attrValue, isRecord,
        normChild, isChild, defaultVal, keyForDataHash, attr;

    var dataHash = this.get('attributes') || {};
    if (!this.get('parentObject')) {
      // only apply on top
      dataHash[primaryKey] = recordId;
    }
    recHash = this.get('attributes');

    // For now we're going to be agnostic about whether ids should live in the
    // hash or not.
    keysToKeep[primaryKey] = true;

    for (key in this) {
      // make sure property is a record attribute.
      valueForKey = this[key];
      if (valueForKey) {
        typeClass = valueForKey.typeClass;
        if (typeClass) {
          keyForDataHash = valueForKey.get('key') || key; // handle alt keys

          // As we go, we'll build up a key —> attribute mapping table that we
          // can use when purging keys from the data hash that are not defined
          // in the schema, below.
          keysToKeep[keyForDataHash] = true;

          isRecord = SC.typeOf(typeClass.call(valueForKey)) === SC.T_CLASS;
          isChild  = valueForKey.isNestedRecordTransform;
          if (!isRecord && !isChild) {
            attrValue = this.get(key);
            if (attrValue !== undefined && (attrValue !== null || includeNull)) {
              attr = this[key];
              // if record attribute, make sure we transform with the fromType
              if (SC.instanceOf(attr, SC.RecordAttribute)) {
                attrValue = attr.fromType(this, key, attrValue);
              }
              dataHash[keyForDataHash] = attrValue;
            }
            else if (!includeNull) {
              keysToKeep[keyForDataHash] = false;
            }

          } else if (isChild) {
            attrValue = this.get(key);

            // Sometimes a child attribute property does not refer to a child record.
            // Catch this and don't try to normalize.
            if (attrValue && attrValue.normalize) {
              attrValue.normalize();
            }
          } else if (isRecord) {
            attrValue = recHash[keyForDataHash];
            if (attrValue !== undefined) {
              // write value already there
              dataHash[keyForDataHash] = attrValue;
            } else {
              // or write default
              defaultVal = valueForKey.get('defaultValue');

              // computed default value
              if (SC.typeOf(defaultVal) === SC.T_FUNCTION) {
                dataHash[keyForDataHash] = defaultVal(this, key, defaultVal);
              } else {
                // plain value
                dataHash[keyForDataHash] = defaultVal;
              }
            }
          }
        }
      }
    }

    // Finally, we'll go through the underlying data hash and remove anything
    // for which no appropriate attribute is defined.  We can do this using
    // the mapping table we prepared above.
    for (key in dataHash) {
      if (!keysToKeep[key]) {
        // Deleting a key doesn't seem too common unless it's a mistake, so
        // we'll log it in debug mode.
        SC.Logger.debug("%@:  Deleting key from underlying data hash due to normalization:  %@", this, key);
        delete dataHash[key];
      }
    }

    return this;
  },



  /**
    If you try to get/set a property not defined by the record, then this
    method will be called. It will try to get the value from the set of
    attributes.

    This will also check is `ignoreUnknownProperties` is set on the recordType
    so that they will not be written to `dataHash` unless explicitly defined
    in the model schema.

    @param {String} key the attribute being get/set
    @param {Object} value the value to set the key to, if present
    @returns {Object} the value
  */
  unknownProperty: function(key, value) {

    if (value !== undefined) {

      // first check if we should ignore unknown properties for this
      // recordType
      var storeKey = this.get('storeKey'),
        // Don't use the recordType computed property as it may have been overridden
        recordType = Store.recordTypeFor(storeKey);

      if(recordType.ignoreUnknownProperties===true) {
        this[key] = value;
        return value;
      }

      // if we're modifying the PKEY, then `Store` needs to relocate where
      // this record is cached. store the old key, update the value, then let
      // the store do the housekeeping...
      var primaryKey = this.get('primaryKey');
      this.writeAttribute(key,value);

      // update ID if needed
      if (key === primaryKey) {
        Store.replaceIdFor(storeKey, value);
      }

    }
    return this.readAttribute(key);
  },

  /**
    Lets you commit this specific record to the store which will trigger
    the appropriate methods in the data source for you.

    @param {Object} params optional additional params that will passed down
      to the data source
    @param {boolean} recordOnly optional param if you want to only commit a single
      record if it has a parent.
    @param {Function} callback optional callback that the store will fire once the
    datasource finished committing
    @returns {Record} receiver
  */
  commitRecord: function(params, recordOnly, callback) {
    var store = this.get('store'), rec, ro,
        sk = this.get('storeKey'),
        parent = this.get('parentObject');

    // If we only want to commit this record or it doesn't have a parent record
    // we will commit this record
    ro = recordOnly || (SC.none(recordOnly) && SC.none(parent));
    if (ro) {
      store.commitRecord(undefined, undefined, this.get('storeKey'), params, callback);
    } else if (parent) {
      parent.commitRecord(params, recordOnly, callback);
    }
    return this;
  },

  // ..........................................................
  // EMULATE ERROR API
  //

  /**
    Returns `true` whenever the status is Record.ERROR.  This will allow you
    to put the UI into an error state.

    @type Boolean
    @property
    @dependsOn status
  */
  isError: function() {
    return !!(this.get('status') & Record.ERROR);
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record is in an error state.  Returns null
    otherwise.

    @type Record
    @property
    @dependsOn isError
  */
  errorValue: function() {
    return this.get('isError') ? SC.val(this.get('errorObject')) : null;
  }.property('isError').cacheable(),

  /**
    Returns the current error object only if the record is in an error state.
    If no explicit error object has been set, returns Record.GENERIC_ERROR.

    @type Error
    @property
    @dependsOn isError
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readError(this.get('storeKey')) || Record.GENERIC_ERROR;
    } else return null;
  }.property('isError').cacheable(),

  // ...............................
  // PRIVATE
  //

  /** @private
    Sets the key equal to value.

    This version will first check to see if the property is an
    `RecordAttribute`, and if so, will ensure that its isEditable property
    is `true` before attempting to change the value.

    @param key {String} the property to set
    @param value {Object} the value to set or null.
    @returns {Record}
  */
  set: function set (key, value) {
    var func = this[key];

    if (func && func.isProperty && func.get && !func.get('isEditable')) {
      return this;
    }
    return set.base.apply(this,arguments);
  },

  /**
    Registers a child record with this parent record.

    If the parent already knows about the child record, return the cached
    instance. If not, create the child record instance and add it to the child
    record cache.

    @param {Object} value The hash of attributes to apply to the child record.
    @param {Integer} key The store key that we are asking for
    @param {String} path The property path of the child record
    @returns {Record} the child record that was registered
   */
  registerNestedRecord: function(value, key, path) {
    var childRecord;

    // if a record instance is passed, simply use the storeKey.  This allows
    // you to pass a record from a chained store to get the same record in the
    // current store.
    if (value && value.get && value.get('isRecord')) {
      childRecord = value;
    }
    else {
      childRecord = this.materializeNestedRecord(value, key, this);
    }
    if (childRecord) {
      this.isParentRecord = true;
    }

    return childRecord;
  },

    /**
     Materializes a nested record or nested array.
   */

  materializeNestedRecord: function (value, key, parentObject) {
    var childRecord, recordType, attrkey,
        attribute = this[key];

    // don't return anything for destroyed records
    if (this.get('status') & Record.DESTROYED) return null;

    if (value && value.get && value.get('isRecord')) {
      childRecord = value;
    }
    else {
      if (attribute && attribute.isNestedRecordTransform) {
        attrkey = this[key].key || key;
      }
      else attrkey = key;
      recordType = this._materializeNestedRecordType(value, key);
      if (!recordType) {
        // try the attribute
        if (attribute) recordType = attribute.get('typeClass');
        if (!recordType) return null;
      }
      if (recordType.kindOf && recordType.kindOf(Record)) {
        childRecord = recordType.create({
          parentObject: parentObject || this,
          parentAttribute: attrkey,
          isChildRecord: true
        });
      }
      else childRecord = value;
    }
    if (childRecord) this.isParentRecord = true;

    return childRecord;
  },

  _findRecordAttributeFor: function (hashkey) {
    var i, item;
    for (i in this) {
      item = this[i];
      if (item && item.get && item.key === hashkey) {
        return item;
      }
    }
  },

  /**
    @private

     private method that retrieves the `recordType` from the hash that is
     provided.

     Important for use in polymorphism but you must have the following items
     in the parent record:

     `nestedRecordNamespace` <= this is the object that has the `Records`
     defined

     @param {Object} value The hash of attributes to apply to the child record.
     @param {String} key the name of the key on the attribute
     @param {Record} the record that was materialized
    */
  _materializeNestedRecordType: function(value, key){
    var childNS, recordType;

    // Get the record type, first checking the "type" property on the hash.
    if (SC.typeOf(value) === SC.T_HASH) {
      // Get the record type.
      childNS = this.get('nestedRecordNamespace');
      if (value.type && !SC.none(childNS)) {
        recordType = childNS[value.type];
      }
      // check to see if we have a record type at this point
      // and call for the typeClass if we don't
      if (!recordType && key && this[key]) {
        recordType = this[key].get('typeClass');
      }

      // reverse lookup, we have the hash key, but no direct available attributes
      if (!recordType && key && !this[key]) {
        var item = this._findRecordAttributeFor(key);
        if (item) {
          recordType = item.get('typeClass');
        }
      }

      // if all else fails, throw an exception
      if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
        this._throwUnlessRecordTypeDefined(recordType, 'nestedRecord');
      }
    }

    return recordType;
  },

  /**
    Creates a new nested record instance.

    @param {Record} recordType The type of the nested record to create.
    @param {Object} hash The hash of attributes to apply to the child record.
    (may be null)
    @returns {Record} the nested record created
   */
  createNestedRecord: function(recordType, hash, key, parentObject) {
    var attrkey, cr, attrval, attrIsToMany = false,
        attribute, po;

    if (!key && SC.typeOf(recordType) === SC.T_STRING) {
      key = recordType;
      recordType = this._materializeNestedRecordType(hash, key);
    }
    attribute = this[key] || this._findRecordAttributeFor(key);

    if (attribute && attribute.isNestedRecordTransform) {
      attrkey = attribute.key || key;
      if (attribute.isChildrenAttribute) attrIsToMany = true;
    }
    else attrkey = key;

    hash = hash || {}; // init if needed

    // check whether the child records hash already exists at the parents hash,
    // because if not, it should be created
    if (recordType.kindOf && recordType.kindOf(Record)) {
      po = this.get(key);
      if (attrIsToMany && !parentObject && po && po.isChildArray) {
        parentObject = po;
      }
      cr = recordType.create({
        parentObject: parentObject || this,
        parentAttribute: attrkey,
        isChildRecord: true
      });
    }
    else cr = hash;

    attrval = this.readAttribute(attrkey);
    this.propertyWillChange(key);
    if (!attrval) { // create if it doesn't exist
      if (attrIsToMany) {
        this.writeAttribute(attrkey, [hash]); // create the array as well
      }
      else {
        this.writeAttribute(attrkey, hash);
      }
    }
    else { // update
      if (attrIsToMany) {
        attrval.push(hash);
        this.writeAttribute(attrkey, attrval);
      }
      else {
        this.writeAttribute(attrkey, hash);
      }
    }
    this.propertyDidChange(key);

    return cr;
  },

  _nestedRecordKey: 0,

  /**
    Override this function if you want to have a special way of creating
    ids for your child records

    @param {Record} childRecord
    @returns {String} the id generated
   */
  generateIdForChild: function(childRecord){}

});

// Class Methods
Record.mixin( /** @scope Record */ {

  /**
    Whether to ignore unknown properties when they are being set on the record
    object. This is useful if you want to strictly enforce the model schema
    and not allow dynamically expanding it by setting new unknown properties

    @static
    @type Boolean
    @default false
  */
  ignoreUnknownProperties: false,

  // ..........................................................
  // CONSTANTS
  //

  /**
    Generic state for records with no local changes.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0001
  */
  CLEAN:            0x0001, // 1

  /**
    Generic state for records with local changes.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0002
  */
  DIRTY:            0x0002, // 2

  /**
    State for records that are still loaded.

    A record instance should never be in this state.  You will only run into
    it when working with the low-level data hash API on `Store`. Use a
    logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0100
  */
  EMPTY:            0x0100, // 256

  /**
    State for records in an error state.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x1000
  */
  ERROR:            0x1000, // 4096

  /**
    Generic state for records that are loaded and ready for use

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0200
  */
  READY:            0x0200, // 512

  /**
    State for records that are loaded and ready for use with no local changes

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0201
  */
  READY_CLEAN:      0x0201, // 513


  /**
    State for records that are loaded and ready for use with local changes

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0202
  */
  READY_DIRTY:      0x0202, // 514


  /**
    State for records that are new - not yet committed to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0203
  */
  READY_NEW:        0x0203, // 515


  /**
    Generic state for records that have been destroyed

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0400
  */
  DESTROYED:        0x0400, // 1024


  /**
    State for records that have been destroyed and committed to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0401
  */
  DESTROYED_CLEAN:  0x0401, // 1025


  /**
    State for records that have been destroyed but not yet committed to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0402
  */
  DESTROYED_DIRTY:  0x0402, // 1026


  /**
    Generic state for records that have been submitted to data source

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0800
  */
  BUSY:             0x0800, // 2048


  /**
    State for records that are still loading data from the server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0804
  */
  BUSY_LOADING:     0x0804, // 2052


  /**
    State for new records that were created and submitted to the server;
    waiting on response from server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0808
  */
  BUSY_CREATING:    0x0808, // 2056


  /**
    State for records that have been modified and submitted to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0810
  */
  BUSY_COMMITTING:  0x0810, // 2064


  /**
    State for records that have requested a refresh from the server.

    Use a logical AND (single `&`) to test record status.

    @static
    @constant
    @type Number
    @default 0x0820
  */
  BUSY_REFRESH:     0x0820, // 2080


  /**
    State for records that have requested a refresh from the server.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0821
  */
  BUSY_REFRESH_CLEAN:  0x0821, // 2081

  /**
    State for records that have requested a refresh from the server.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0822
  */
  BUSY_REFRESH_DIRTY:  0x0822, // 2082

  /**
    State for records that have been destroyed and submitted to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0840
  */
  BUSY_DESTROYING:  0x0840, // 2112


  // ..........................................................
  // ERRORS
  //

  /**
    Error for when you try to modify a record while it is in a bad
    state.

    @static
    @constant
    @type Error
  */
  BAD_STATE_ERROR: SC.$error("Internal Inconsistency"),

  /**
    Error for when you try to create a new record that already exists.

    @static
    @constant
    @type Error
  */
  RECORD_EXISTS_ERROR: SC.$error("Record Exists"),

  /**
    Error for when you attempt to locate a record that is not found

    @static
    @constant
    @type Error
  */
  NOT_FOUND_ERROR: SC.$error("Not found "),

  /**
    Error for when you try to modify a record that is currently busy

    @static
    @constant
    @type Error
  */
  BUSY_ERROR: SC.$error("Busy"),

  /**
    Generic unknown record error

    @static
    @constant
    @type Error
  */
  GENERIC_ERROR: SC.$error("Generic Error"),

  /**
    If true, then searches for records of this type will return subclass instances. For example:

        Person = Record.extend();
        Person.isPolymorphic = true;

        Male = Person.extend();
        Female = Person.extend();

    Using Store#find, or a toOne or toMany relationship on Person will then return records of
    type Male and Female. Polymorphic record types must have unique GUIDs across all subclasses.

    @type Boolean
    @default false
  */
  isPolymorphic: false,

  /**
    @private
    The next child key to allocate.  A nextChildKey must always be greater than 0.
  */
  _nextChildKey: 0,

  // ..........................................................
  // CLASS METHODS
  //

  /**
    Helper method returns a new `RecordAttribute` instance to map a simple
    value or to-one relationship.  At the very least, you should pass the
    type class you expect the attribute to have.  You may pass any additional
    options as well.

    Use this helper when you define Record subclasses.

        MyApp.Contact = Record.extend({
          firstName: Record.attr(String, { isRequired: true })
        });

    @param {Class} type the attribute type
    @param {Object} opts the options for the attribute
    @returns {RecordAttribute} created instance
  */
  attr: function(type, opts) {
    return RecordAttribute.attr(type, opts);
  },

  /**
    Returns an `RecordAttribute` that describes a fetched attribute.  When
    you reference this attribute, it will return an `RecordArray` that uses
    the type as the fetch key and passes the attribute value as a param.

    Use this helper when you define Record subclasses.

        MyApp.Group = Record.extend({
          contacts: Record.fetch('MyApp.Contact')
        });

    @param {Record|String} recordType The type of records to load
    @param {Object} opts the options for the attribute
    @returns {RecordAttribute} created instance
  */
  fetch: function(recordType, opts) {
    return FetchedAttribute.attr(recordType, opts);
  },

  /**
    Will return one of the following:

     1. `ManyAttribute` that describes a record array backed by an
        array of guids stored in the underlying JSON.
     2. `ChildrenAttribute` that describes a record array backed by a
        array of hashes.

    You can edit the contents of this relationship.

    For `ManyAttribute`, If you set the inverse and `isMaster: false` key,
    then editing this array will modify the underlying data, but the
    inverse key on the matching record will also be edited and that
    record will be marked as needing a change.

    @param {Record|String} recordType The type of record to create
    @param {Object} opts the options for the attribute
    @returns {ManyAttribute|ChildrenAttribute} created instance
  */
  toMany: function(recordType, opts) {
    opts = opts || {};
    var isNested = opts.nested || opts.isNested;
    var attr;

    this._throwUnlessRecordTypeDefined(recordType, 'toMany');

    if(isNested){
      //@if(debug)
      // Let's provide a little developer help for a common misunderstanding.
      if (!SC.none(opts.inverse)) {
        SC.error("Developer Error: Nested attributes (toMany and toOne with isNested: true) may not have an inverse property. Nested attributes shouldn't exist as separate records with IDs and relationships; if they do, it's likely that they should be separate records.\n\nNote that if your API nests separate records for convenient requesting and transport, you should separate them in your data source rather than improperly modeling them with nested attributes.");
      }
      //@endif
      attr = ChildrenAttribute.attr(recordType, opts);
    }
    else {
      attr = ManyAttribute.attr(recordType, opts);
    }
    return attr;
  },

  /**
    Will return one of the following:

     1. `SingleAttribute` that converts the underlying ID to a single
        record.  If you modify this property, it will rewrite the underlying
        ID. It will also modify the inverse of the relationship, if you set it.
     2. `ChildAttribute` that you can edit the contents
        of this relationship.

    @param {Record|String} recordType the type of the record to create
    @param {Object} opts additional options
    @returns {SingleAttribute|ChildAttribute} created instance
  */
  toOne: function(recordType, opts) {
    opts = opts || {};
    var isNested = opts.nested || opts.isNested;
    var attr;

    this._throwUnlessRecordTypeDefined(recordType, 'toOne');

    if(isNested){
      //@if(debug)
      // Let's provide a little developer help for a common misunderstanding.
      if (!SC.none(opts.inverse)) {
        SC.error("Developer Error: Nested attributes (toMany and toOne with isNested: true) may not have an inverse property. Nested attributes shouldn't exist as separate records with IDs and relationships; if they do, it's likely that they should be separate records.\n\nNote that if your API nests separate records for convenient requesting and transport, you should separate them in your data source rather than improperly modeling them with nested attributes.");
      }
      //@endif
      attr = ChildAttribute.attr(recordType, opts);
    }
    else {
      attr = SingleAttribute.attr(recordType, opts);
    }
    return attr;
  },

  _throwUnlessRecordTypeDefined: function(recordType, relationshipType) {
    if (!recordType) {
      throw new Error("Attempted to create " + relationshipType + " attribute with " +
            "undefined recordType. Did you forget to sc_require a dependency?");
    }
  },

  /**
    Returns all storeKeys mapped by Id for this record type.  This method is used mostly by the
    `Store` and the Record to coordinate.  You will rarely need to call this method yourself.

    Note that for polymorpic record classes, all store keys are kept on the top-most polymorphic
    superclass. This ensures that store key by id requests at any level return only the one unique
    store key.

    @see Record.storeKeysById
  */
  storeKeysById: function() {
    var superclass = this.superclass,
      key = 'storeKey_' + SC.guidFor(this),
      ret = this[key];

    if (!ret) {
      if (this.isPolymorphic && superclass.isPolymorphic && superclass !== Record) {
        ret = this[key] = superclass.storeKeysById();
      } else {
        ret = this[key] = {};
      }
    }

    return ret;
  },

  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  If the primaryKey has not been assigned a storeKey yet, it
    will be added.

    For the inverse of this method see `Store.idFor()` and
    `Store.recordTypeFor()`.

    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyFor: function(id) {
    var storeKeys = this.storeKeysById(),
        ret = storeKeys[id];

    if (!ret) {
      ret = Store.generateStoreKey();
      Store.idsByStoreKey[ret] = id;
      Store.recordTypesByStoreKey[ret] = this;
      storeKeys[id] = ret;
    }

    return ret;
  },

  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  As opposed to `storeKeyFor()` however, this method
    will NOT generate a new storeKey but returned undefined.

    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyExists: function(id) {
    var storeKeys = this.storeKeysById(),
        ret = storeKeys[id];

    return ret;
  },

  /**
    Returns a record with the named ID in store.

    @param {Store} store the store
    @param {String} id the record id or a query
    @returns {Record} record instance
  */
  find: function(store, id) {
    return store.find(this, id);
  },

  /** @private - enhance extend to notify Query and ensure polymorphic subclasses are marked as polymorphic as well. */
  extend: function() {
    var ret = SC.Object.extend.apply(this, arguments);

    if (Query) Query._scq_didDefineRecordType(ret);

    // All subclasses of a polymorphic class, must also be polymorphic.
    if (ret.prototype.hasOwnProperty('isPolymorphic')) {
      ret.isPolymorphic = ret.prototype.isPolymorphic;
      delete ret.prototype.isPolymorphic;
    }

    return ret;
  }

});


/**
  Default fixtures instance for use in applications.

  @property {FixturesDataSource}
*/
Record.fixtures = FixturesDataSource.create();