// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require('models/record');
import { SC } from '../../core/core.js';
import { RecordArray } from './record_array.js';
import { CascadeDataSource } from '../data_sources/cascade.js';
import { Query } from './query.js';
import { Record } from '../models/record.js';

let NestedStore;

import('./nested_store.js').then(r => {
  NestedStore = r.NestedStore;
});

/**
  @class


  The Store is where you can find all of your dataHashes. Stores can be
  chained for editing purposes and committed back one chain level at a time
  all the way back to a persistent data source.

  Every application you create should generally have its own store objects.
  Once you create the store, you will rarely need to work with the store
  directly except to retrieve records and collections.

  Internally, the store will keep track of changes to your json data hashes
  and manage syncing those changes with your data source.  A data source may
  be a server, local storage, or any other persistent code.

  @since SproutCore 1.0
*/
export const Store = SC.Object.extend( /** @scope Store.prototype */ {

  /**
    An (optional) name of the store, which can be useful during debugging,
    especially if you have multiple nested stores.

    @type String
  */
  name: null,

  /**
    An array of all the chained stores that current rely on the receiver
    store.

    @type Array
  */
  nestedStores: null,

  /**
    The data source is the persistent storage that will provide data to the
    store and save changes.  You normally will set your data source when you
    first create your store in your application.

    @type DataSource
  */
  dataSource: null,

  /**
    This type of store is not nested.

    @default false
    @type Boolean
  */
  isNested: false,

  /**
    This type of store is not nested.

    @default false
    @type Boolean
  */
  commitRecordsAutomatically: false,

  // ..........................................................
  // DATA SOURCE SUPPORT
  //

  /**
    Convenience method.  Sets the current data source to the passed property.
    This will also set the store property on the dataSource to the receiver.

    If you are using this from the `core.js` method of your app, you may need to
    just pass a string naming your data source class.  If this is the case,
    then your data source will be instantiated the first time it is requested.

    @param {DataSource|String} dataSource the data source
    @returns {Store} receiver
  */
  from: function(dataSource) {
    this.set('dataSource', dataSource);
    return this ;
  },

  // lazily convert data source to real object
  _getDataSource: function() {
    var ret = this.get('dataSource');
    if (typeof ret === SC.T_STRING) {
      ret = SC.requiredObjectForPropertyPath(ret);
      if (ret.isClass) ret = ret.create();
      this.set('dataSource', ret);
    }
    return ret;
  },

  /**
    Convenience method.  Creates a `CascadeDataSource` with the passed
    data source arguments and sets the `CascadeDataSource` as the data source
    for the receiver.

    @param {DataSource...} dataSource one or more data source arguments
    @returns {Store} receiver
  */
  cascade: function(dataSource) {
    var dataSources;

    // Fast arguments access.
    // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
    dataSources = new Array(arguments.length); //  A(arguments)
    for (var i = 0, len = dataSources.length; i < len; i++) { dataSources[i] = arguments[i]; }

    dataSource = CascadeDataSource.create({
      dataSources: dataSources
    });
    return this.from(dataSource);
  },

  // ..........................................................
  // STORE CHAINING
  //

  /**
    Returns a new nested store instance that can be used to buffer changes
    until you are ready to commit them.  When you are ready to commit your
    changes, call `commitChanges()` or `destroyChanges()` and then `destroy()`
    when you are finished with the chained store altogether.

        store = MyApp.store.chain();
        .. edit edit edit
        store.commitChanges().destroy();

    @param {Object} attrs optional attributes to set on new store
    @param {Class} newStoreClass optional the class of the newly-created nested store (defaults to NestedStore)
    @returns {NestedStore} new nested store chained to receiver
  */
  chain: function(attrs, newStoreClass) {
    if (!attrs) attrs = {};
    attrs.parentStore = this;

    if (newStoreClass) {
      // Ensure the passed-in class is a type of nested store.
      if (SC.typeOf(newStoreClass) !== 'class') throw new Error("%@ is not a valid class".fmt(newStoreClass));
      if (!SC.kindOf(newStoreClass, NestedStore)) throw new Error("%@ is not a type of NestedStore".fmt(newStoreClass));
    }
    else {
      newStoreClass = NestedStore;
    }

    var ret    = newStoreClass.create(attrs),
        nested = this.nestedStores;

    if (!nested) nested = this.nestedStores = [];
    nested.push(ret);
    return ret ;
  },

  /**
    Creates an autonomous nested store that is connected to the data source.

    Use this kind of nested store to ensure that all records that are committed into the main store
    are first of all committed to the server.

    For example,

        nestedStore = store.chainAutonomousStore();

        // ... commit all changes from the nested store to the remote data store
        nestedStore.commitRecords();

        // or commit the changes of a nested store's record to the remote data store ...
        nestedRecord.commitRecord();

    ## Resolving nested store commits with the main store

    When the committed changes are deemed successful (either by observing the status of the modified
    record(s) or by using callbacks with commitRecord/commitRecords), the changes can be passed back
    to the main store.

    In the case that the commits are all successful, simply commit to the main store using
    `commitSuccessfulChanges`. Note, that using `commitSuccessfulChanges` rather than the standard
    `commitChanges` ensures that only clean changes propagate back to the main store.

    For example,

        nestedStore.commitSuccessfulChanges();

    In the case that some or all of the commits fail, you can still use `commitSuccessfulChanges` to
    update only those commits that have succeeded in the main store or wait until all commits have
    succeeded. Regardless, it will be up to your application to act on the failures and work with
    the user to resolve all failures until the nested store records are all clean.


    @param {Object} [attrs] attributes to set on new store
    @param {Class} [newStoreClass] the class of the newly-created nested store (defaults to NestedStore)
    @returns {NestedStore} new nested store chained to receiver
  */
  chainAutonomousStore: function(attrs, newStoreClass) {
    var newAttrs = attrs ? SC.clone( attrs ) : {};
    var source  = this._getDataSource();

    newAttrs.dataSource = source;
    return this.chain( newAttrs, newStoreClass );
  },

  /** @private

    Called by a nested store just before it is destroyed so that the parent
    can remove the store from its list of nested stores.

    @returns {Store} receiver
  */
  willDestroyNestedStore: function(nestedStore) {
    if (this.nestedStores) {
      this.nestedStores.removeObject(nestedStore);
    }
    return this ;
  },

  /**
    Used to determine if a nested store belongs directly or indirectly to the
    receiver.

    @param {Store} store store instance
    @returns {Boolean} true if belongs
  */
  hasNestedStore: function(store) {
    while(store && (store !== this)) store = store.get('parentStore');
    return store === this ;
  },

  // ..........................................................
  // SHARED DATA STRUCTURES
  //

  /** @private
    JSON data hashes indexed by store key.

    *IMPORTANT: Property is not observable*

    Shared by a store and its child stores until you make edits to it.

    @type Object
  */
  dataHashes: null,

  /** @private
    The current status of a data hash indexed by store key.

    *IMPORTANT: Property is not observable*

    Shared by a store and its child stores until you make edits to it.

    @type Object
  */
  statuses: null,

  /** @private
    This array contains the revisions for the attributes indexed by the
    storeKey.

    *IMPORTANT: Property is not observable*

    Revisions are used to keep track of when an attribute hash has been
    changed. A store shares the revisions data with its parent until it
    starts to make changes to it.

    @type Object
  */
  revisions: null,

  /**
    Array indicates whether a data hash is possibly in use by an external
    record for editing.  If a data hash is editable then it may be modified
    at any time and therefore chained stores may need to clone the
    attributes before keeping a copy of them.

    Note that this is kept as an array because it will be stored as a dense
    array on some browsers, making it faster.

    @type Array
  */
  editables: null,

  /**
    A set of storeKeys that need to be committed back to the data source. If
    you call `commitRecords()` without passing any other parameters, the keys
    in this set will be committed instead.

    @type SC.Set
  */
  changelog: null,

  /**
    An array of `Error` objects associated with individual records in the
    store (indexed by store keys).

    Errors passed form the data source in the call to dataSourceDidError() are
    stored here.

    @type Array
  */
  recordErrors: null,

  /**
    A hash of `Error` objects associated with queries (indexed by the GUID
    of the query).

    Errors passed from the data source in the call to
    `dataSourceDidErrorQuery()` are stored here.

    @type Object
  */
  queryErrors: null,

  // ..........................................................
  // CORE ATTRIBUTE API
  //
  // The methods in this layer work on data hashes in the store.  They do not
  // perform any changes that can impact records.  Usually you will not need
  // to use these methods.

  /**
    Returns the current edit status of a store key.  May be one of
    `EDITABLE` or `LOCKED`.  Used mostly for unit testing.

    @param {Number} storeKey the store key
    @returns {Number} edit status
  */
  storeKeyEditState: function(storeKey) {
    var editables = this.editables;
    return (editables && editables[storeKey]) ? Store.EDITABLE : Store.LOCKED ;
  },

  /**
    Returns the data hash for the given `storeKey`.  This will also 'lock'
    the hash so that further edits to the parent store will no
    longer be reflected in this store until you reset.

    @param {Number} storeKey key to retrieve
    @returns {Object} data hash or null
  */
  readDataHash: function(storeKey) {
    return this.dataHashes[storeKey];
  },

  /**
    Returns the data hash for the `storeKey`, cloned so that you can edit
    the contents of the attributes if you like.  This will do the extra work
    to make sure that you only clone the attributes one time.

    If you use this method to modify data hash, be sure to call
    `dataHashDidChange()` when you make edits to record the change.

    @param {Number} storeKey the store key to retrieve
    @returns {Object} the attributes hash
  */
  readEditableDataHash: function(storeKey) {
    // read the value - if there is no hash just return; nothing to do
    var ret = this.dataHashes[storeKey];
    if (!ret) return ret ; // nothing to do.

    // clone data hash if not editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    if (!editables[storeKey]) {
      editables[storeKey] = 1 ; // use number to store as dense array
      ret = this.dataHashes[storeKey] = SC.clone(ret, true);
    }
    return ret;
  },

  /**
    Reads a property from the hash - cloning it if needed so you can modify
    it independently of any parent store.  This method is really only well
    tested for use with toMany relationships.  Although it is public you
    generally should not call it directly.

    @param {Number} storeKey storeKey of data hash
    @param {String} propertyName property to read
    @returns {Object} editable property value
  */
  readEditableProperty: function(storeKey, propertyName) {
    var hash      = this.readEditableDataHash(storeKey),
        editables = this.editables[storeKey], // get editable info...
        ret       = hash[propertyName];

    // editables must be made into a hash so that we can keep track of which
    // properties have already been made editable
    if (editables === 1) editables = this.editables[storeKey] = {};

    // clone if needed
    if (!editables[propertyName]) {
      ret = hash[propertyName];
      if (ret && ret.isCopyable) ret = hash[propertyName] = ret.copy(true);
      editables[propertyName] = true ;
    }

    return ret ;
  },

  /**
    Replaces the data hash for the `storeKey`.  This will lock the data hash
    and mark them as cloned.  This will also call `dataHashDidChange()` for
    you.

    Note that the hash you set here must be a different object from the
    original data hash.  Once you make a change here, you must also call
    `dataHashDidChange()` to register the changes.

    If the data hash does not yet exist in the store, this method will add it.
    Pass the optional status to edit the status as well.

    @param {Number} storeKey the store key to write
    @param {Object} hash the new hash
    @param {String} status the new hash status
    @returns {Store} receiver
  */
  writeDataHash: function(storeKey, hash, status) {
    var records = this.records;
    // update dataHashes and optionally status.
    if (hash) this.dataHashes[storeKey] = hash;
    if (status) {
      this.statuses[storeKey] = status;
    }

    // also note that this hash is now editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    editables[storeKey] = 1 ; // use number for dense array support

    var records = this.records, rec;
    if (records && (rec = records[storeKey])) {
      if (rec.isParentRecord) rec.notifyChildren(['status']);
    }

    return this ;
  },

  /**
    Removes the data hash from the store.  This does not imply a deletion of
    the record.  You could be simply unloading the record.  Either way,
    removing the dataHash will be synced back to the parent store but not to
    the server.

    Note that you can optionally pass a new status to go along with this. If
    you do not pass a status, it will change the status to `RECORD_EMPTY`
    (assuming you just unloaded the record).  If you are deleting the record
    you may set it to `Record.DESTROYED_CLEAN`.

    Be sure to also call `dataHashDidChange()` to register this change.

    @param {Number} storeKey
    @param {String} status optional new status
    @returns {Store} receiver
  */
  removeDataHash: function(storeKey, status) {
     // don't use delete -- that will allow parent dataHash to come through
    this.dataHashes[storeKey] = null;
    this.statuses[storeKey] = status || Record.EMPTY;

    // hash is gone and therefore no longer editable
    var editables = this.editables;
    if (editables) editables[storeKey] = 0 ;

    return this ;
  },

  /**
    Reads the current status for a storeKey.  This will also lock the data
    hash.  If no status is found, returns `RECORD_EMPTY`.

    @param {Number} storeKey the store key
    @returns {Number} status
  */
  readStatus: function(storeKey) {
    // use readDataHash to handle optimistic locking.  this could be inlined
    // but for now this minimized copy-and-paste code.
    this.readDataHash(storeKey);
    return this.statuses[storeKey] || Record.EMPTY;
  },

  /**
    Reads the current status for the storeKey without actually locking the
    record.  Usually you won't need to use this method.  It is mostly used
    internally.

    @param {Number} storeKey the store key
    @returns {Number} status
  */
  peekStatus: function(storeKey) {
    return this.statuses[storeKey] || Record.EMPTY;
  },

  /**
    Writes the current status for a storeKey.  If the new status is
    `Record.ERROR`, you may also pass an optional error object.  Otherwise
    this param is ignored.

    @param {Number} storeKey the store key
    @param {String} newStatus the new status
    @param {Error} error optional error object
    @returns {Store} receiver
  */
  writeStatus: function(storeKey, newStatus) {
    // use writeDataHash for now to handle optimistic lock.  maximize code
    // reuse.
    var records = this.records, rec;
    var ret = this.writeDataHash(storeKey, null, newStatus);
    // status changed, make sure any children of this record know
    if (records && (rec = records[storeKey])) {
      if (rec.isParentRecord) rec.notifyChildren(['status']);
    }
    return ret;
  },

  /**
    Call this method whenever you modify some editable data hash to register
    with the Store that the attribute values have actually changed.  This will
    do the book-keeping necessary to track the change across stores including
    managing locks.

    @param {Number|Array} storeKeys one or more store keys that changed
    @param {Number} rev optional new revision number. normally leave null
    @param {Boolean} statusOnly (optional) true if only status changed
    @param {String} key that changed (optional)
    @returns {Store} receiver
  */
  dataHashDidChange: function(storeKeys, rev, statusOnly, key) {
    // update the revision for storeKey.  Use generateStoreKey() because that
    // guarantees a universally (to this store hierarchy anyway) unique
    // key value.
    if (!rev) rev = Store.generateStoreKey();
    var isArray, len, idx, storeKey;

    isArray = SC.typeOf(storeKeys) === SC.T_ARRAY;
    if (isArray) {
      len = storeKeys.length;
    } else {
      len = 1;
      storeKey = storeKeys;
    }

    for(idx=0;idx<len;idx++) {
      if (isArray) storeKey = storeKeys[idx];
      this.revisions[storeKey] = rev;
      this._notifyRecordPropertyChange(storeKey, statusOnly, key);

    }

    return this ;
  },

  /** @private
    Will push all changes to a the recordPropertyChanges property
    and execute `flush()` once at the end of the runloop.
  */
  _notifyRecordPropertyChange: function(storeKey, statusOnly, key) {

    var records      = this.records,
        nestedStores = this.get('nestedStores'),
        K            = Store,
        rec, editState, len, idx, store, status, keys;

    // pass along to nested stores
    len = nestedStores ? nestedStores.length : 0 ;
    for(idx=0;idx<len;idx++) {
      store = nestedStores[idx];
      status = store.peekStatus(storeKey); // important: peek avoids read-lock
      editState = store.storeKeyEditState(storeKey);

      // when store needs to propagate out changes in the parent store
      // to nested stores
      if (editState === K.INHERITED) {
        store._notifyRecordPropertyChange(storeKey, statusOnly, key);

      } else if (status & Record.BUSY) {
        // make sure nested store does not have any changes before resetting
        if(store.get('hasChanges')) K.CHAIN_CONFLICT_ERROR.throw();
        store.reset();
      }
    }

    // store info in changes hash and schedule notification if needed.
    var changes = this.recordPropertyChanges;
    if (!changes) {
      changes = this.recordPropertyChanges =
        { storeKeys:      SC.CoreSet.create(),
          records:        SC.CoreSet.create(),
          hasDataChanges: SC.CoreSet.create(),
          propertyForStoreKeys: {} };
    }

    changes.storeKeys.add(storeKey);

    if (records && (rec=records[storeKey])) {
      changes.records.push(storeKey);

      // If there are changes other than just the status we need to record
      // that information so we do the right thing during the next flush.
      // Note that if we're called multiple times before flush and one call
      // has `statusOnly=true` and another has `statusOnly=false`, the flush
      // will (correctly) operate in `statusOnly=false` mode.
      if (!statusOnly) changes.hasDataChanges.push(storeKey);

      // If this is a key specific change, make sure that only those
      // properties/keys are notified.  However, if a previous invocation of
      // `_notifyRecordPropertyChange` specified that all keys have changed, we
      // need to respect that.
      if (key) {
        if (!(keys = changes.propertyForStoreKeys[storeKey])) {
          keys = changes.propertyForStoreKeys[storeKey] = SC.CoreSet.create();
        }

        // If it's '*' instead of a set, then that means there was a previous
        // invocation that said all keys have changed.
        if (keys !== '*') {
          keys.add(key);
        }
      }
      else {
        // Mark that all properties have changed.
        changes.propertyForStoreKeys[storeKey] = '*';
      }
    }

    this.invokeOnce(this.flush);
    return this;
  },

  /**
    Delivers any pending changes to materialized records.  Normally this
    happens once, automatically, at the end of the RunLoop.  If you have
    updated some records and need to update records immediately, however,
    you may call this manually.

    @returns {Store} receiver
  */
  flush: function() {
    if (!this.recordPropertyChanges) return this;

    var changes              = this.recordPropertyChanges,
        storeKeys            = changes.storeKeys,
        hasDataChanges       = changes.hasDataChanges,
        records              = changes.records,
        propertyForStoreKeys = changes.propertyForStoreKeys,
        recordTypes = SC.CoreSet.create(),
        rec, recordType, statusOnly, keys;

    storeKeys.forEach(function(storeKey) {
      if (records.contains(storeKey)) {
        statusOnly = hasDataChanges.contains(storeKey) ? false : true;
        rec = this.records[storeKey];
        keys = propertyForStoreKeys ? propertyForStoreKeys[storeKey] : null;

        // Are we invalidating all keys?  If so, don't pass any to
        // storeDidChangeProperties.
        if (keys === '*') keys = null;

        // remove it so we don't trigger this twice
        records.remove(storeKey);

        if (rec) rec.storeDidChangeProperties(statusOnly, keys);
      }

      recordType = Store.recordTypeFor(storeKey);
      recordTypes.add(recordType);

    }, this);

    if (storeKeys.get('length') > 0) this._notifyRecordArrays(storeKeys, recordTypes);

    storeKeys.clear();
    hasDataChanges.clear();
    records.clear();
    // Provide full reference to overwrite
    this.recordPropertyChanges.propertyForStoreKeys = {};

    return this;
  },

  /**
    Resets the store content.  This will clear all internal data for all
    records, resetting them to an EMPTY state.  You generally do not want
    to call this method yourself, though you may override it.

    @returns {Store} receiver
  */
  reset: function() {

    // create a new empty data store
    this.dataHashes = {} ;
    this.revisions  = {} ;
    this.statuses   = {} ;
    this.records = {};

    // also reset temporary objects and errors
    this.chainedChanges = this.locks = this.editables = null;
    this.changelog = null ;
    this.recordErrors = null;
    this.queryErrors = null;

    var dataSource = this.get('dataSource');
    if (dataSource && dataSource.reset) { dataSource.reset(); }

    var records = this.records, storeKey;
    if (records) {
      for(storeKey in records) {
        if (!records.hasOwnProperty(storeKey)) continue ;
        this._notifyRecordPropertyChange(parseInt(storeKey, 10), false);
      }
    }

    // Also reset all pre-created recordArrays.
    var ra, raList = this.get('recordArrays');
    if (raList) {
      while ((ra = raList.pop())) {
        ra.destroy();
      }
      raList.clear();
      this.set('recordArrays', null);
    }

    this.set('hasChanges', false);
  },

  /** @private
    Called by a nested store on a parent store to commit any changes from the
    store.  This will copy any changed dataHashes as well as any persistent
    change logs.

    If the parentStore detects a conflict with the optimistic locking, it will
    raise an exception before it makes any changes.  If you pass the
    force flag then this detection phase will be skipped and the changes will
    be applied even if another resource has modified the store in the mean
    time.

    @param {Store} nestedStore the child store
    @param {Set} changes the set of changed store keys
    @param {Boolean} force
    @returns {Store} receiver
  */
  commitChangesFromNestedStore: function (nestedStore, changes, force) {
    // first, check for optimistic locking problems
    if (!force && nestedStore.get('conflictedStoreKeys')) {
      Store.CHAIN_CONFLICT_ERROR.throw();
    }

    // OK, no locking issues.  So let's just copy them changes.
    // get local reference to values.
    var len = changes.length, i, storeKey, myDataHashes, myStatuses,
      myEditables, myRevisions, chDataHashes, chStatuses, chRevisions;

    myRevisions     = this.revisions;
    myDataHashes    = this.dataHashes;
    myStatuses      = this.statuses;
    myEditables     = this.editables;

    // setup some arrays if needed
    if (!myEditables) myEditables = this.editables = [] ;
    chDataHashes    = nestedStore.dataHashes;
    chRevisions     = nestedStore.revisions;
    chStatuses      = nestedStore.statuses;

    for(i=0;i<len;i++) {
      storeKey = changes[i];

      // now copy changes
      myDataHashes[storeKey]    = chDataHashes[storeKey];
      myStatuses[storeKey]      = chStatuses[storeKey];
      myRevisions[storeKey]     = chRevisions[storeKey];

      myEditables[storeKey] = 0 ; // always make dataHash no longer editable

      this._notifyRecordPropertyChange(storeKey, false);
    }

    // add any records to the changelog for commit handling
    var myChangelog = this.changelog, chChangelog = nestedStore.changelog;
    if (chChangelog) {
      if (!myChangelog) myChangelog = this.changelog = SC.CoreSet.create();
      myChangelog.addEach(chChangelog);
    }
    this.changelog = myChangelog;

    // immediately flush changes to notify records - nested stores will flush
    // later on.
    if (!this.get('parentStore')) this.flush();

    return this ;
  },

  // ..........................................................
  // HIGH-LEVEL RECORD API
  //

  /**
    Finds a single record instance with the specified `recordType` and id or
    an  array of records matching some query conditions.

    Finding a Single Record
    ---

    If you pass a single `recordType` and id, this method will return an
    actual record instance.  If the record has not been loaded into the store
    yet, this method will ask the data source to retrieve it.  If no data
    source indicates that it can retrieve the record, then this method will
    return `null`.

    Note that if the record needs to be retrieved from the server, then the
    record instance returned from this method will not have any data yet.
    Instead it will have a status of `Record.READY_LOADING`.  You can
    monitor the status property to be notified when the record data is
    available for you to use it.

    Find a Collection of Records
    ---

    If you pass only a record type or a query object, you can instead find
    all records matching a specified set of conditions.  When you call
    `find()` in this way, it will create a query if needed and pass it to the
    data source to fetch the results.

    If this is the first time you have fetched the query, then the store will
    automatically ask the data source to fetch any records related to it as
    well.  Otherwise you can refresh the query results at anytime by calling
    `refresh()` on the returned `RecordArray`.

    You can detect whether a RecordArray is fetching from the server by
    checking its status.

    Examples
    ---

    Finding a single record:

        MyApp.store.find(MyApp.Contact, "23"); // returns MyApp.Contact

    Finding all records of a particular type:

        MyApp.store.find(MyApp.Contact); // returns RecordArray of contacts


    Finding all contacts with first name John:

        var query = Query.local(MyApp.Contact, "firstName = %@", "John");
        MyApp.store.find(query); // returns RecordArray of contacts

    Finding all contacts using a remote query:

        var query = Query.remote(MyApp.Contact);
        MyApp.store.find(query); // returns RecordArray filled by server

    @param {Record|String} recordType the expected record type
    @param {String} id the id to load
    @returns {Record} record instance or null
  */
  find: function(recordType, id) {

    // if recordType is passed as string, find object
    if (SC.typeOf(recordType)===SC.T_STRING) {
      recordType = SC.objectForPropertyPath(recordType);
    }

    // handle passing a query...
    if ((arguments.length === 1) && !(recordType && recordType.get && recordType.get('isRecord'))) {
      if (!recordType) throw new Error("Store#find() must pass recordType or query");
      if (!recordType.isQuery) {
        recordType = Query.local(recordType);
      }
      return this._findQuery(recordType, true, true);

    // handle finding a single record
    } else {
      return this._findRecord(recordType, id);
    }
  },

  /** @private */
  _findQuery: function(query, createIfNeeded, refreshIfNew) {

    // lookup the local RecordArray for this query.
    var cache = this._scst_recordArraysByQuery,
        key   = SC.guidFor(query),
        ret, ra ;
    if (!cache) cache = this._scst_recordArraysByQuery = {};
    ret = cache[key];

    // if a RecordArray was not found, then create one and also add it to the
    // list of record arrays to update.
    if (!ret && createIfNeeded) {
      cache[key] = ret = RecordArray.create({ store: this, query: query });

      ra = this.get('recordArrays');
      if (!ra) this.set('recordArrays', ra = SC.Set.create());
      ra.add(ret);

      if (refreshIfNew) this.refreshQuery(query);
    }

    this.flush();
    return ret ;
  },

  /** @private */
  _findRecord: function(recordType, id) {

    var storeKey ;

    // if a record instance is passed, simply use the storeKey.  This allows
    // you to pass a record from a chained store to get the same record in the
    // current store.
    if (recordType && recordType.get && recordType.get('isRecord')) {
      storeKey = recordType.get('storeKey');

    // otherwise, lookup the storeKey for the passed id.  look in subclasses
    // as well.
    } else storeKey = id ? recordType.storeKeyFor(id) : null;

    if (storeKey && (this.peekStatus(storeKey) === Record.EMPTY)) {
      storeKey = this.retrieveRecord(recordType, id);
    }

    // now we have the storeKey, materialize the record and return it.
    return storeKey ? this.materializeRecord(storeKey) : null ;
  },

  // ..........................................................
  // RECORD ARRAY OPERATIONS
  //

  /**
    Called by the record array just before it is destroyed.  This will
    de-register it from receiving future notifications.

    You should never call this method yourself.  Instead call `destroy()` on
    the `RecordArray` directly.

    @param {RecordArray} recordArray the record array
    @returns {Store} receiver
  */
  recordArrayWillDestroy: function(recordArray) {
    var cache = this._scst_recordArraysByQuery,
        set   = this.get('recordArrays');

    if (cache) delete cache[SC.guidFor(recordArray.get('query'))];
    if (set) set.remove(recordArray);
    return this ;
  },

  /**
    Called by the record array whenever it needs the data source to refresh
    its contents.  Nested stores will actually just pass this along to the
    parent store.  The parent store will call `fetch()` on the data source.

    You should never call this method yourself.  Instead call `refresh()` on
    the `RecordArray` directly.

    @param {Query} query the record array query to refresh
    @returns {Store} receiver
  */
  refreshQuery: function(query) {
    if (!query) throw new Error("refreshQuery() requires a query");

    var cache    = this._scst_recordArraysByQuery,
        recArray = cache ? cache[SC.guidFor(query)] : null,
        source   = this._getDataSource();

    if (source && source.fetch) {
      if (recArray) recArray.storeWillFetchQuery(query);
      source.fetch.call(source, this, query);
    }

    return this ;
  },

  /** @private
    Will ask all record arrays that have been returned from `find`
    with an `Query` to check their arrays with the new `storeKey`s

    @param {IndexSet} storeKeys set of storeKeys that changed
    @param {Set} recordTypes
    @returns {Store} receiver
  */
  _notifyRecordArrays: function(storeKeys, recordTypes) {
    var recordArrays = this.get('recordArrays');
    if (!recordArrays) return this;

    recordArrays.forEach(function(recArray) {
      if (recArray) recArray.storeDidChangeStoreKeys(storeKeys, recordTypes);
    }, this);

    return this ;
  },


  // ..........................................................
  // LOW-LEVEL HELPERS
  //

  /**
    Array of all records currently in the store with the specified
    type.  This method only reflects the actual records loaded into memory and
    therefore is not usually needed at runtime.  However you will often use
    this method for testing.

    @param {Record} recordType the record type
    @returns {Array} array instance - usually RecordArray
  */
  recordsFor: function(recordType) {
    var storeKeys     = [],
        storeKeysById = recordType.storeKeysById(),
        id, storeKey, ret;

    // collect all non-empty store keys
    for(id in storeKeysById) {
      storeKey = storeKeysById[id]; // get the storeKey
      if (this.readStatus(storeKey) !== Record.EMPTY) {
        storeKeys.push(storeKey);
      }
    }

    if (storeKeys.length>0) {
      ret = RecordArray.create({ store: this, storeKeys: storeKeys });
    } else ret = storeKeys; // empty array
    return ret ;
  },

  /** @private */
  _CACHED_REC_ATTRS: {},

  /** @private */
  _CACHED_REC_INIT: function() {},

  /**
    Given a `storeKey`, return a materialized record.  You will not usually
    call this method yourself.  Instead it will used by other methods when
    you find records by id or perform other searches.

    If a `recordType` has been mapped to the storeKey, then a record instance
    will be returned even if the data hash has not been requested yet.

    Each Store instance returns unique record instances for each storeKey.

    @param {Number} storeKey The storeKey for the dataHash.
    @returns {Record} Returns a record instance.
  */
  materializeRecord: function(storeKey) {
    var records = this.records,
      ret, recordType, attrs;

    // look up in cached records
    if (!records) records = this.records = {}; // load cached records
    ret = records[storeKey];
    if (ret) return ret;

    // not found -- OK, create one then.
    recordType = Store.recordTypeFor(storeKey);
    if (!recordType) return null; // not recordType registered, nothing to do

    // Populate the attributes.
    attrs = this._CACHED_REC_ATTRS ;
    attrs.storeKey = storeKey ;
    attrs.store    = this ;

    // We do a little gymnastics here to prevent record initialization before we've
    // received and cached a copy of the object. This is because if initialization
    // triggers downstream effects which call materializeRecord for the same record,
    // we won't have a copy of it cached yet, causing another copy to be created
    // and resulting in a stack overflow at best and a really hard-to-diagnose bug
    // involving two instances of the same record floating around at worst.

    // Override _object_init to prevent premature initialization.
    var _object_init = recordType.prototype._object_init;
    recordType.prototype._object_init = this._CACHED_REC_INIT;
    // Create the record (but don't init it).
    ret = records[storeKey] = recordType.create();
    // Repopulate the _object_init method and run initialization.
    recordType.prototype._object_init = ret._object_init = _object_init;
    ret._object_init([attrs]);

    return ret ;
  },

  // ..........................................................
  // CORE RECORDS API
  //
  // The methods in this section can be used to manipulate records without
  // actually creating record instances.

  /**
    Creates a new record instance with the passed `recordType` and `dataHash`.
    You can also optionally specify an id or else it will be pulled from the
    data hash.

    Example:

      MyApp.Record = Record.extend({
        attrA: Record.attr(String, { defaultValue: 'def' }),
        isAttrB: Record.attr(Boolean, { key: 'attr_b' }),
        primaryKey: 'pKey'
      });

      // If you don't provide a value and have designated a defaultValue, the
      // defaultValue will be used.
      MyApp.store.createRecord(MyApp.Record).get('attributes');
      > { attrA: 'def' }

      // If you use a key on an attribute, you can specify the key name or the
      // attribute name when creating the record, but if you specify both, only
      // the key name will be used.
      MyApp.store.createRecord(MyApp.Record, { isAttrB: true }).get('attributes');
      > { attr_b: true }
      MyApp.store.createRecord(MyApp.Record, { attr_b: true }).get('attributes');
      > { attr_b: true }
      MyApp.store.createRecord(MyApp.Record, { isAttrB: false, attr_b: true }).get('attributes');
      > { attr_b: true }

    Note that the record will not yet be saved back to the server.  To save
    a record to the server, call `commitChanges()` on the store.

    @param {Record} recordType the record class to use on creation
    @param {Object} dataHash the JSON attributes to assign to the hash.
    @param {String} id (optional) id to assign to record

    @returns {Record} Returns the created record
  */
  createRecord: function(recordType, dataHash, id) {
    var primaryKey, prototype, storeKey, status, K = Record, changelog, defaultVal, ret;

    //initialize dataHash if necessary
    dataHash = (dataHash ? dataHash : {});

    // First, try to get an id.  If no id is passed, look it up in the
    // dataHash.
    if (!id && (primaryKey = recordType.prototype.primaryKey)) {
      id = dataHash[primaryKey];
      // if still no id, check if there is a defaultValue function for
      // the primaryKey attribute and assign that
      defaultVal = recordType.prototype[primaryKey] ? recordType.prototype[primaryKey].defaultValue : null;
      if(!id && SC.typeOf(defaultVal)===SC.T_FUNCTION) {
        id = dataHash[primaryKey] = defaultVal();
      }
    }

    // Next get the storeKey - base on id if available
    storeKey = id ? recordType.storeKeyFor(id) : Store.generateStoreKey();

    // now, check the state and do the right thing.
    status = this.readStatus(storeKey);

    // check state
    // any busy or ready state or destroyed dirty state is not allowed
    if ((status & K.BUSY)  ||
        (status & K.READY) ||
        (status === K.DESTROYED_DIRTY)) {
      (id ? K.RECORD_EXISTS_ERROR : K.BAD_STATE_ERROR).throw();

    // allow error or destroyed state only with id
    } else if (!id && (status=== K.DESTROYED_CLEAN || status=== SC.ERROR)) {
      K.BAD_STATE_ERROR.throw();
    }

    // Store the dataHash and setup initial status.
    this.writeDataHash(storeKey, dataHash, K.READY_NEW);

    // Register the recordType with the store.
    Store.replaceRecordTypeFor(storeKey, recordType);
    this.dataHashDidChange(storeKey);

    // If the attribute wasn't provided in the dataHash, attempt to insert a
    // default value.  We have to do this after materializing the record,
    // because the defaultValue property may be a function that expects
    // the record as an argument.
    ret = this.materializeRecord(storeKey);
    prototype = recordType.prototype;
    for (var prop in prototype) {
      var propPrototype = prototype[ prop ];
      if (propPrototype && propPrototype.isRecordAttribute) {
        // Use the record attribute key if it is defined.
        var attrKey = propPrototype.key || prop;

        if (!dataHash.hasOwnProperty(attrKey)) {
          if (dataHash.hasOwnProperty(prop)) {
            // If the attribute key doesn't exist but the name does, fix it up.
            // (i.e. the developer has a record attribute `endDate` with a key
            // `end_date` on a record and when they created the record they
            // provided `endDate` not `end_date`)
            dataHash[ attrKey ] = dataHash[ prop ];
            delete dataHash[ prop ];
          } else {
            // If the attribute doesn't exist in the hash at all, check for a
            // default value to use instead.
            defaultVal = propPrototype.defaultValue;
            if (defaultVal) {
              if (SC.typeOf(defaultVal)===SC.T_FUNCTION) dataHash[ attrKey ] = SC.copy(defaultVal(ret, attrKey), true);
              else dataHash[ attrKey ] = SC.copy(defaultVal, true);
            }
          }
        } else if (attrKey !== prop && dataHash.hasOwnProperty(prop)) {
          // If both attrKey and prop are provided, use attrKey only.
          delete dataHash[ prop ];
        }
      }
    }

    // Record is now in a committable state -- add storeKey to changelog
    changelog = this.changelog;
    if (!changelog) changelog = SC.Set.create();
    changelog.add(storeKey);
    this.changelog = changelog;

    // if commit records is enabled
    if(this.get('commitRecordsAutomatically')){
      this.invokeLast(this.commitRecords);
    }

    // Propagate the status to any aggregate records before returning.
    if (ret) ret.propagateToAggregates();
    return ret;
  },

  /**
    Creates an array of new records.  You must pass an array of `dataHash`es
    plus a `recordType` and, optionally, an array of ids.  This will create an
    array of record instances with the same record type.

    If you need to instead create a bunch of records with different data types
    you can instead pass an array of `recordType`s, one for each data hash.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} dataHashes array of data hashes
    @param {Array} ids (optional) ids to assign to records
    @returns {Array} array of materialized record instances.
  */
  createRecords: function(recordTypes, dataHashes, ids) {
    var ret = [], recordType, id, isArray, len = dataHashes.length, idx ;
    isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
    if (!isArray) recordType = recordTypes;
    for(idx=0;idx<len;idx++) {
      if (isArray) recordType = recordTypes[idx] || Record;
      id = ids ? ids[idx] : undefined ;
      ret.push(this.createRecord(recordType, dataHashes[idx], id));
    }
    return ret ;
  },


  /**
    Unloads a record, removing the data hash from the store.  If you try to
    unload a record that is already destroyed then this method will have no effect.
    If you unload a record that does not exist or an error then an exception
    will be raised.

    @param {Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {Store} receiver
  */
  unloadRecord: function(recordType, id, storeKey, newStatus) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), K = Record;
    newStatus = newStatus || K.EMPTY;
    // handle status - ignore if destroying or destroyed
    if ((status === K.BUSY_DESTROYING) || (status & K.DESTROYED)) {
      return this; // nothing to do

    // error out if empty
    } else if (status & K.BUSY) {
      K.BUSY_ERROR.throw();

    // otherwise, destroy in dirty state
    } else status = newStatus ;

    // remove the data hash, set the new status and remove the cached record.
    this.removeDataHash(storeKey, status);
    this.dataHashDidChange(storeKey);
    delete this.records[storeKey];

    return this ;
  },

  /**
    Unloads a group of records.  If you have a set of record ids, unloading
    them this way can be faster than retrieving each record and unloading
    it individually.

    You can pass either a single `recordType` or an array of `recordType`s. If
    you pass a single `recordType`, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record
    type in the array.

    You can optionally pass an array of `storeKey`s instead of the `recordType`
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  You will not usually
    unload records this way.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} [ids] ids to unload
    @param {Array} [storeKeys] store keys to unload
    @param {String} [newStatus]
    @returns {Store} receiver
  */
  unloadRecords: function(recordTypes, ids, storeKeys, newStatus) {
    var len, isArray, idx, id, recordType, storeKey;

    if (storeKeys === undefined) {
      isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
      if (!isArray) recordType = recordTypes;
      if (ids === undefined) {
        len = isArray ? recordTypes.length : 1;
        for (idx = 0; idx < len; idx++) {
          if (isArray) recordType = recordTypes[idx];
          storeKeys = this.storeKeysFor(recordType);
          this.unloadRecords(undefined, undefined, storeKeys, newStatus);
        }
      } else {
        len = ids.length;
        for (idx = 0; idx < len; idx++) {
          if (isArray) recordType = recordTypes[idx] || Record;
          id = ids ? ids[idx] : undefined;
          this.unloadRecord(recordType, id, undefined, newStatus);
        }
      }
    } else {
      len = storeKeys.length;
      for (idx = 0; idx < len; idx++) {
        storeKey = storeKeys ? storeKeys[idx] : undefined;
        this.unloadRecord(undefined, undefined, storeKey, newStatus);
      }
    }

    return this;
  },

  /**
    Destroys a record, removing the data hash from the store and adding the
    record to the destroyed changelog.  If you try to destroy a record that is
    already destroyed then this method will have no effect.  If you destroy a
    record that does not exist or an error then an exception will be raised.

    @param {Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {Store} receiver
  */
  destroyRecord: function(recordType, id, storeKey) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, K = Record;

    // handle status - ignore if destroying or destroyed
    if ((status === K.BUSY_DESTROYING) || (status & K.DESTROYED)) {
      return this; // nothing to do

    // error out if empty
    } else if (status === K.EMPTY) {
      K.NOT_FOUND_ERROR.throw();

    // error out if busy
    } else if (status & K.BUSY) {
      K.BUSY_ERROR.throw();

    // if new status, destroy in clean state
    } else if (status === K.READY_NEW) {
      status = K.DESTROYED_CLEAN ;
      this.removeDataHash(storeKey, status) ;

    // otherwise, destroy in dirty state
    } else status = K.DESTROYED_DIRTY ;

    // remove the data hash, set new status
    this.writeStatus(storeKey, status);
    this.dataHashDidChange(storeKey);

    // add/remove change log
    changelog = this.changelog;
    if (!changelog) changelog = this.changelog = SC.Set.create();

    if (status & K.DIRTY) { changelog.add(storeKey); }
    else { changelog.remove(storeKey); }
    this.changelog=changelog;

    // if commit records is enabled
    if(this.get('commitRecordsAutomatically')){
      this.invokeLast(this.commitRecords);
    }

    return this ;
  },

  /**
    Destroys a group of records.  If you have a set of record ids, destroying
    them this way can be faster than retrieving each record and destroying
    it individually.

    You can pass either a single `recordType` or an array of `recordType`s. If
    you pass a single `recordType`, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record
    type in the array.

    You can optionally pass an array of `storeKey`s instead of the `recordType`
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  You will not usually
    destroy records this way.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Store} receiver
  */
  destroyRecords: function(recordTypes, ids, storeKeys) {
    var len, isArray, idx, id, recordType, storeKey;
    if(storeKeys===undefined){
      len = ids.length;
      isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
      if (!isArray) recordType = recordTypes;
      for(idx=0;idx<len;idx++) {
        if (isArray) recordType = recordTypes[idx] || Record;
        id = ids ? ids[idx] : undefined ;
        this.destroyRecord(recordType, id, undefined);
      }
    }else{
      len = storeKeys.length;
      for(idx=0;idx<len;idx++) {
        storeKey = storeKeys ? storeKeys[idx] : undefined ;
        this.destroyRecord(undefined, undefined, storeKey);
      }
    }
    return this ;
  },

  /**
    Notes that the data for the given record id has changed.  The record will
    be committed to the server the next time you commit the root store.  Only
    call this method on a record in a READY state of some type.

    @param {Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @param {String} key that changed (optional)
    @param {Boolean} if the change is to statusOnly (optional)
    @returns {Store} receiver
  */
  recordDidChange: function(recordType, id, storeKey, key, statusOnly) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, K = Record;

    // BUSY_LOADING, BUSY_CREATING, BUSY_COMMITTING, BUSY_REFRESH_CLEAN
    // BUSY_REFRESH_DIRTY, BUSY_DESTROYING
    if (status & K.BUSY) {
      K.BUSY_ERROR.throw();

    // if record is not in ready state, then it is not found.
    // ERROR, EMPTY, DESTROYED_CLEAN, DESTROYED_DIRTY
    } else if (!(status & K.READY)) {
      K.NOT_FOUND_ERROR.throw();

    // otherwise, make new status READY_DIRTY unless new.
    // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
    } else {
      if (status !== K.READY_NEW) this.writeStatus(storeKey, K.READY_DIRTY);
    }

    // record data hash change
    this.dataHashDidChange(storeKey, null, statusOnly, key);

    // record in changelog
    changelog = this.changelog ;
    if (!changelog) changelog = this.changelog = SC.Set.create() ;
    changelog.add(storeKey);
    this.changelog = changelog;

    // if commit records is enabled
    if(this.get('commitRecordsAutomatically')){
      this.invokeLast(this.commitRecords);
    }

    return this ;
  },

  /**
    Mark a group of records as dirty.  The records will be committed to the
    server the next time you commit changes on the root store.  If you have a
    set of record ids, marking them dirty this way can be faster than
    retrieving each record and destroying it individually.

    You can pass either a single `recordType` or an array of `recordType`s. If
    you pass a single `recordType`, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record
    type in the array.

    You can optionally pass an array of `storeKey`s instead of the `recordType`
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Store} receiver
  */
  recordsDidChange: function(recordTypes, ids, storeKeys) {
     var len, isArray, idx, id, recordType, storeKey;
      if(storeKeys===undefined){
        len = ids.length;
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
        if (!isArray) recordType = recordTypes;
        for(idx=0;idx<len;idx++) {
          if (isArray) recordType = recordTypes[idx] || Record;
          id = ids ? ids[idx] : undefined ;
          storeKey = storeKeys ? storeKeys[idx] : undefined ;
          this.recordDidChange(recordType, id, storeKey);
        }
      }else{
        len = storeKeys.length;
        for(idx=0;idx<len;idx++) {
          storeKey = storeKeys ? storeKeys[idx] : undefined ;
          this.recordDidChange(undefined, undefined, storeKey);
        }
      }
      return this ;
  },

  /**
    Retrieves a set of records from the server.  If the records has
    already been loaded in the store, then this method will simply return.
    Otherwise if your store has a `dataSource`, this will call the
    `dataSource` to retrieve the record.  Generally you will not need to
    call this method yourself. Instead you can just use `find()`.

    This will not actually create a record instance but it will initiate a
    load of the record from the server.  You can subsequently get a record
    instance itself using `materializeRecord()`.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to retrieve
    @param {Array} storeKeys (optional) store keys to retrieve
    @param {Boolean} isRefresh
    @param {Function|Array} callback function or array of functions
    @returns {Array} storeKeys to be retrieved
  */
  retrieveRecords: function(recordTypes, ids, storeKeys, isRefresh, callbacks) {

    var source  = this._getDataSource(),
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        hasCallbackArray = SC.typeOf(callbacks) === SC.T_ARRAY,
        len     = (!storeKeys) ? ids.length : storeKeys.length,
        ret     = [],
        rev     = Store.generateStoreKey(),
        K       = Record,
        recordType, idx, storeKey, status, ok, callback;

    if (!isArray) recordType = recordTypes;

    // if no storeKeys were passed, map recordTypes + ids
    for(idx=0;idx<len;idx++) {

      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordTypes[idx];
        storeKey = recordType.storeKeyFor(ids[idx]);
      }
      //collect the callback
      callback = hasCallbackArray ? callbacks[idx] : callbacks;

      // collect status and process
      status = this.readStatus(storeKey);

      // K.EMPTY, K.ERROR, K.DESTROYED_CLEAN - initial retrieval
      if ((status === K.EMPTY) || (status === K.ERROR) || (status === K.DESTROYED_CLEAN)) {
        this.writeStatus(storeKey, K.BUSY_LOADING);
        this.dataHashDidChange(storeKey, rev, true);
        ret.push(storeKey);
        this._setCallbackForStoreKey(storeKey, callback, hasCallbackArray, storeKeys);
      // otherwise, ignore record unless isRefresh is true.
      } else if (isRefresh) {
        // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
        if (status & K.READY) {
          this.writeStatus(storeKey, K.BUSY_REFRESH | (status & 0x03)) ;
          this.dataHashDidChange(storeKey, rev, true);
          ret.push(storeKey);
          this._setCallbackForStoreKey(storeKey, callback, hasCallbackArray, storeKeys);
        // K.BUSY_DESTROYING, K.BUSY_COMMITTING, K.BUSY_CREATING
        } else if ((status === K.BUSY_DESTROYING) || (status === K.BUSY_CREATING) || (status === K.BUSY_COMMITTING)) {
          K.BUSY_ERROR.throw();

        // K.DESTROY_DIRTY, bad state...
        } else if (status === K.DESTROYED_DIRTY) {
          K.BAD_STATE_ERROR.throw();

        // ignore K.BUSY_LOADING, K.BUSY_REFRESH_CLEAN, K.BUSY_REFRESH_DIRTY
        }
      }
    }

    // now retrieve storeKeys from dataSource.  if there is no dataSource,
    // then act as if we couldn't retrieve.
    ok = false;
    if (source) ok = source.retrieveRecords.call(source, this, ret, ids);

    // if the data source could not retrieve or if there is no source, then
    // simulate the data source calling dataSourceDidError on those we are
    // loading for the first time or dataSourceDidComplete on refreshes.
    if (!ok) {
      len = ret.length;
      rev = Store.generateStoreKey();
      for(idx=0;idx<len;idx++) {
        storeKey = ret[idx];
        status   = this.readStatus(storeKey);
        if (status === K.BUSY_LOADING) {
          this.writeStatus(storeKey, K.ERROR);
          this.dataHashDidChange(storeKey, rev, true);

        } else if (status & K.BUSY_REFRESH) {
          this.writeStatus(storeKey, K.READY | (status & 0x03));
          this.dataHashDidChange(storeKey, rev, true);
        }
      }
      ret.length = 0 ; // truncate to indicate that none could refresh
    }
    return ret ;
  },

  _TMP_RETRIEVE_ARRAY: [],

  _callback_queue: {},

  /**
    @private
    stores the callbacks for the storeKeys that are inflight
  **/
  _setCallbackForStoreKey: function(storeKey, callback, hasCallbackArray, storeKeys){
    var queue = this._callback_queue;
    if(hasCallbackArray) queue[storeKey] = {callback: callback, otherKeys: storeKeys};
    else queue[storeKey] = callback;
  },

  /**
    @private
    Retrieves and calls callback for `storeKey` if exists, also handles if a single callback is
    needed for one key..
  **/
  _retrieveCallbackForStoreKey: function(storeKey){
    var queue = this._callback_queue,
        callback = queue[storeKey],
        allFinished, keys;
    if(callback){
      if(SC.typeOf(callback) === SC.T_FUNCTION){
        callback.call(); //args?
        delete queue[storeKey]; //cleanup
      }
      else if(SC.typeOf(callback) === SC.T_HASH){
        callback.completed = true;
        keys = callback.storeKeys;
        keys.forEach(function(key){
          if(!queue[key].completed) allFinished = true;
        });
        if(allFinished){
          callback.callback.call(); // args?
          //cleanup
          keys.forEach(function(key){
            delete queue[key];
          });
        }

      }
    }
  },

  /*
    @private

  */
  _cancelCallback: function(storeKey){
    var queue = this._callback_queue;
    if(queue[storeKey]){
      delete queue[storeKey];
    }
  },


  /**
    Retrieves a record from the server.  If the record has already been loaded
    in the store, then this method will simply return.  Otherwise if your
    store has a `dataSource`, this will call the `dataSource` to retrieve the
    record.  Generally you will not need to call this method yourself.
    Instead you can just use `find()`.

    This will not actually create a record instance but it will initiate a
    load of the record from the server.  You can subsequently get a record
    instance itself using `materializeRecord()`.

    @param {Record} recordType class
    @param {String} id id to retrieve
    @param {Number} storeKey (optional) store key
    @param {Boolean} isRefresh
    @param {Function} callback (optional)
    @returns {Number} storeKey that was retrieved
  */
  retrieveRecord: function(recordType, id, storeKey, isRefresh, callback) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret;

    if (storeKey) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }

    ret = this.retrieveRecords(recordType, id, storeKey, isRefresh, callback);
    array.length = 0 ;
    return ret[0];
  },

  /**
    Refreshes a record from the server.  If the record has already been loaded
    in the store, then this method will request a refresh from the
    `dataSource`. Otherwise it will attempt to retrieve the record.

    @param {Record} recordType the expected record type
    @param {String} id to id of the record to load
    @param {Number} storeKey (optional) optional store key
    @param {Function} callback (optional) when refresh completes
    @returns {Boolean} true if the retrieval was a success.
  */
  refreshRecord: function(recordType, id, storeKey, callback) {
    return !!this.retrieveRecord(recordType, id, storeKey, true, callback);
  },

  /**
    Refreshes a set of records from the server.  If the records has already been loaded
    in the store, then this method will request a refresh from the
    `dataSource`. Otherwise it will attempt to retrieve them.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @param {Function} callback (optional) when refresh completes
    @returns {Boolean} true if the retrieval was a success.
  */
  refreshRecords: function(recordTypes, ids, storeKeys, callback) {
    var ret = this.retrieveRecords(recordTypes, ids, storeKeys, true, callback);
    return ret && ret.length>0;
  },

  /**
    Commits the passed store keys or ids. If no `storeKey`s are given,
    it will commit any records in the changelog.

    Based on the current state of the record, this will ask the data
    source to perform the appropriate actions
    on the store keys.

    @param {Array} recordTypes the expected record types (Record)
    @param {Array} ids to commit
    @param {Set} storeKeys to commit
    @param {Object} params optional additional parameters to pass along to the
      data source
    @param {Function|Array} callback function or array of callbacks

    @returns {Boolean} if the action was succesful.
  */
  commitRecords: function(recordTypes, ids, storeKeys, params, callbacks) {
    var source    = this._getDataSource(),
        isArray   = SC.typeOf(recordTypes) === SC.T_ARRAY,
        hasCallbackArray = SC.typeOf(callbacks) === SC.T_ARRAY,
        retCreate= [], retUpdate= [], retDestroy = [],
        rev       = Store.generateStoreKey(),
        K         = Record,
        recordType, idx, storeKey, status, ret, len, callback;

    // If no params are passed, look up storeKeys in the changelog property.
    // Remove any committed records from changelog property.

    if(!recordTypes && !ids && !storeKeys){
      storeKeys = this.changelog;
    }

    len = storeKeys ? storeKeys.get('length') : (ids ? ids.get('length') : 0);

    for(idx=0;idx<len;idx++) {

      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordTypes[idx] || Record;
        else recordType = recordTypes;
        storeKey = recordType.storeKeyFor(ids[idx]);
      }

      //collect the callback
      callback = hasCallbackArray ? callbacks[idx] : callbacks;

      // collect status and process
      status = this.readStatus(storeKey);

      if (status === K.ERROR) {
        K.NOT_FOUND_ERROR.throw();
      }
      else {
        if(status === K.READY_NEW) {
          this.writeStatus(storeKey, K.BUSY_CREATING);
          this.dataHashDidChange(storeKey, rev, true);
          retCreate.push(storeKey);
          this._setCallbackForStoreKey(storeKey, callback, hasCallbackArray, storeKeys);
        } else if (status === K.READY_DIRTY) {
          this.writeStatus(storeKey, K.BUSY_COMMITTING);
          this.dataHashDidChange(storeKey, rev, true);
          retUpdate.push(storeKey);
          this._setCallbackForStoreKey(storeKey, callback, hasCallbackArray, storeKeys);
        } else if (status === K.DESTROYED_DIRTY) {
          this.writeStatus(storeKey, K.BUSY_DESTROYING);
          this.dataHashDidChange(storeKey, rev, true);
          retDestroy.push(storeKey);
          this._setCallbackForStoreKey(storeKey, callback, hasCallbackArray, storeKeys);
        } else if (status === K.DESTROYED_CLEAN) {
          this.dataHashDidChange(storeKey, rev, true);
        }
        // ignore K.EMPTY, K.READY_CLEAN, K.BUSY_LOADING, K.BUSY_CREATING, K.BUSY_COMMITTING,
        // K.BUSY_REFRESH_CLEAN, K_BUSY_REFRESH_DIRTY, KBUSY_DESTROYING
      }
    }

    // now commit storeKeys to dataSource
    if (source && (len>0 || params)) {
      ret = source.commitRecords.call(source, this, retCreate, retUpdate, retDestroy, params);
    }

    //remove all committed changes from changelog
    if (ret && !recordTypes && !ids) {
      if (storeKeys === this.changelog) {
        this.changelog = null;
      }
      else {
        this.changelog.removeEach(storeKeys);
      }
    }
    return ret ;
  },

  /**
    Commits the passed store key or id.  Based on the current state of the
    record, this will ask the data source to perform the appropriate action
    on the store key.

    You have to pass either the id or the storeKey otherwise it will return
    false.

    @param {Record} recordType the expected record type
    @param {String} id the id of the record to commit
    @param {Number} storeKey the storeKey of the record to commit
    @param {Object} params optional additional params that will passed down
      to the data source
    @param {Function|Array} callback function or array of functions
    @returns {Boolean} if the action was successful.
  */
  commitRecord: function(recordType, id, storeKey, params, callback) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret ;
    if (id === undefined && storeKey === undefined ) return false;
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }

    ret = this.commitRecords(recordType, id, storeKey, params, callback);
    array.length = 0 ;
    return ret;
  },

  /**
    Cancels an inflight request for the passed records.  Depending on the
    server implementation, this could cancel an entire request, causing
    other records to also transition their current state.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Store} the store.
  */
  cancelRecords: function(recordTypes, ids, storeKeys) {
    var source  = this._getDataSource(),
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        K       = Record,
        ret     = [],
        status, len, idx, id, recordType, storeKey;

    len = (storeKeys === undefined) ? ids.length : storeKeys.length;
    for(idx=0;idx<len;idx++) {
      if (isArray) recordType = recordTypes[idx] || Record;
      else recordType = recordTypes || Record;

      id = ids ? ids[idx] : undefined ;

      if(storeKeys===undefined){
        storeKey = recordType.storeKeyFor(id);
      }else{
        storeKey = storeKeys ? storeKeys[idx] : undefined ;
      }
      if(storeKey) {
        status = this.readStatus(storeKey);

        if ((status === K.EMPTY) || (status === K.ERROR)) {
          K.NOT_FOUND_ERROR.throw();
        }
        ret.push(storeKey);
        this._cancelCallback(storeKey);
      }
    }

    if (source) source.cancel.call(source, this, ret);

    return this ;
  },

  /**
    Cancels an inflight request for the passed record.  Depending on the
    server implementation, this could cancel an entire request, causing
    other records to also transition their current state.

    @param {Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Store} the store.
  */
  cancelRecord: function(recordType, id, storeKey) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret ;

    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }

    ret = this.cancelRecords(recordType, id, storeKey);
    array.length = 0 ;
    return this;
  },

  /**
    Convenience method can be called by the store or other parts of your
    application to load a record into the store.  This method will take a
    recordType and a data hashes and either add or update the
    record in the store.

    The loaded records will be in an `Record.READY_CLEAN` state, indicating
    they were loaded from the data source and do not need to be committed
    back before changing.

    This method will check the state of the storeKey and call either
    `pushRetrieve()` or `dataSourceDidComplete()`.  The standard state constraints
    for these methods apply here.

    The return value will be the `storeKey` used for the push.  This is often
    convenient to pass into `loadQuery()`, if you are fetching a remote query.

    If you are upgrading from a pre SproutCore 1.0 application, this method
    is the closest to the old `updateRecord()`.

    @param {Record} recordType the record type
    @param {Array} dataHash to update
    @param {Array} id optional.  if not passed lookup on the hash
    @returns {String} store keys assigned to these id
  */
  loadRecord: function(recordType, dataHash, id) {
    var K       = Record,
        ret, primaryKey, storeKey;

    // save lookup info
    recordType = recordType || Record;
    primaryKey = recordType.prototype.primaryKey;


    // push each record
    id = id || dataHash[primaryKey];
    ret = storeKey = recordType.storeKeyFor(id); // needed to cache

    if (this.readStatus(storeKey) & K.BUSY) {
      this.dataSourceDidComplete(storeKey, dataHash, id);
    } else this.pushRetrieve(recordType, id, dataHash, storeKey);

    // return storeKey
    return ret ;
  },

  /**
    Convenience method can be called by the store or other parts of your
    application to load records into the store.  This method will take a
    recordType and an array of data hashes and either add or update the
    record in the store.

    The loaded records will be in an `Record.READY_CLEAN` state, indicating
    they were loaded from the data source and do not need to be committed
    back before changing.

    This method will check the state of each storeKey and call either
    `pushRetrieve()` or `dataSourceDidComplete()`.  The standard state
    constraints for these methods apply here.

    The return value will be the storeKeys used for each push.  This is often
    convenient to pass into `loadQuery()`, if you are fetching a remote query.

    If you are upgrading from a pre SproutCore 1.0 application, this method
    is the closest to the old `updateRecords()`.

    @param {Record} recordTypes the record type or array of record types
    @param {Array} dataHashes array of data hashes to update
    @param {Array} [ids] array of ids.  if not passed lookup on hashes
    @returns {Array} store keys assigned to these ids
  */
  // TODO: No reason for first argument to be an array. The developer can just call loadRecords multiple times with different record type each time. Would save us the need to check if recordTypes is an Array or not.
  loadRecords: function (recordTypes, dataHashes, ids) {
    var isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        len     = dataHashes.get('length'),
        ret     = [],
        recordType,
        id, primaryKey, idx, dataHash;

    // save lookup info
    if (!isArray) {
      recordType = recordTypes || Record;
      primaryKey = recordType.prototype.primaryKey;
    }

    // push each record
    for (idx = 0; idx < len; idx++) {
      dataHash = dataHashes.objectAt(idx);
      if (isArray) {
        recordType = recordTypes.objectAt(idx) || Record;
        primaryKey = recordType.prototype.primaryKey ;
      }

      id = (ids) ? ids.objectAt(idx) : dataHash[primaryKey];

      ret[idx] = this.loadRecord(recordType, dataHash, id);
    }

    // return storeKeys
    return ret;
  },

  /**
    Returns the `Error` object associated with a specific record.

    @param {Number} storeKey The store key of the record.

    @returns {Error} Error or undefined if no error associated with the record.
  */
  readError: function(storeKey) {
    var errors = this.recordErrors ;
    return errors ? errors[storeKey] : undefined ;
  },

  /**
    Returns the `Error` object associated with a specific query.

    @param {Query} query The Query with which the error is associated.

    @returns {Error} Error or undefined if no error associated with the query.
  */
  readQueryError: function(query) {
    var errors = this.queryErrors ;
    return errors ? errors[SC.guidFor(query)] : undefined ;
  },

  // ..........................................................
  // DATA SOURCE CALLBACKS
  //
  // Mathods called by the data source on the store

  /**
    Called by a `dataSource` when it cancels an inflight operation on a
    record.  This will transition the record back to it non-inflight state.

    @param {Number} storeKey record store key to cancel
    @returns {Store} receiver
  */
  dataSourceDidCancel: function(storeKey) {
    var status = this.readStatus(storeKey),
        K      = Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      K.BAD_STATE_ERROR.throw(); // should never be called in this state
    }

    // otherwise, determine proper state transition
    switch(status) {
      case K.BUSY_LOADING:
        status = K.EMPTY;
        break ;

      case K.BUSY_CREATING:
        status = K.READY_NEW;
        break;

      case K.BUSY_COMMITTING:
        status = K.READY_DIRTY ;
        break;

      case K.BUSY_REFRESH_CLEAN:
        status = K.READY_CLEAN;
        break;

      case K.BUSY_REFRESH_DIRTY:
        status = K.READY_DIRTY ;
        break ;

      case K.BUSY_DESTROYING:
        status = K.DESTROYED_DIRTY ;
        break;

      default:
        K.BAD_STATE_ERROR.throw() ;
    }
    this.writeStatus(storeKey, status) ;
    this.dataHashDidChange(storeKey, null, true);
    this._cancelCallback(storeKey);

    return this ;
  },

  /**
    Called by a data source when it creates or commits a record.  Passing an
    optional id will remap the `storeKey` to the new record id.  This is
    required when you commit a record that does not have an id yet.

    @param {Number} storeKey record store key to change to READY_CLEAN state
    @param {Object} dataHash optional data hash to replace current hash
    @param {Object} newId optional new id to replace the old one
    @returns {Store} receiver
  */
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    var status = this.readStatus(storeKey), K = Record, statusOnly;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      K.BAD_STATE_ERROR.throw(); // should never be called in this state
    }

    // otherwise, determine proper state transition
    if(status === K.BUSY_DESTROYING) {
      K.BAD_STATE_ERROR.throw();
    } else status = K.READY_CLEAN;

    this.writeStatus(storeKey, status);
    if (dataHash) this.writeDataHash(storeKey, dataHash, status);
    if (newId) { Store.replaceIdFor(storeKey, newId); }

    statusOnly = dataHash || newId ? false : true;
    this.dataHashDidChange(storeKey, null, statusOnly);

    // Force record to refresh its cached properties based on store key
    var record = this.materializeRecord(storeKey);
    if (record !== null) {
      // If the record's id property has been computed, ensure that it re-computes.
      if (newId) { record.propertyDidChange('id'); }
      record.notifyPropertyChange('status');
    }
    //update callbacks
    this._retrieveCallbackForStoreKey(storeKey);

    return this ;
  },

  /**
    Called by a data source when it has destroyed a record.  This will
    transition the record to the proper state.

    @param {Number} storeKey record store key to cancel
    @returns {Store} receiver
  */
  dataSourceDidDestroy: function(storeKey) {
    var status = this.readStatus(storeKey), K = Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      K.BAD_STATE_ERROR.throw(); // should never be called in this state
    }
    // otherwise, determine proper state transition
    else{
      status = K.DESTROYED_CLEAN ;
    }
    this.removeDataHash(storeKey, status) ;
    this.dataHashDidChange(storeKey);

    // Force record to refresh its cached properties based on store key
    var record = this.materializeRecord(storeKey);
    if (record !== null) {
      record.notifyPropertyChange('status');
    }

    this._retrieveCallbackForStoreKey(storeKey);

    return this ;
  },

  /**
    Converts the passed record into an error object.

    @param {Number} storeKey record store key to error
    @param {Error} error [optional] an Error instance to associate with storeKey
    @returns {Store} receiver
  */
  dataSourceDidError: function(storeKey, error) {
    var status = this.readStatus(storeKey), errors = this.recordErrors, K = Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) { K.BAD_STATE_ERROR.throw(); }

    // otherwise, determine proper state transition
    else status = K.ERROR ;

    // Add the error to the array of record errors (for lookup later on if necessary).
    if (error && error.isError) {
      if (!errors) errors = this.recordErrors = [];
      errors[storeKey] = error;
    }

    this.writeStatus(storeKey, status) ;
    this.dataHashDidChange(storeKey, null, true);

    // Force record to refresh its cached properties based on store key
    var record = this.materializeRecord(storeKey);
    if (record) {
      record.notifyPropertyChange('status');
    }

    this._retrieveCallbackForStoreKey(storeKey);
    return this ;
  },

  // ..........................................................
  // PUSH CHANGES FROM DATA SOURCE
  //

  /**
    Call by the data source whenever you want to push new data out of band
    into the store.

    @param {Class} recordType the Record subclass
    @param {Object} id the record id or null
    @param {Object} dataHash data hash to load
    @param {Number} storeKey optional store key.
    @returns {Number|Boolean} storeKey if push was allowed, false if not
  */
  pushRetrieve: function(recordType, id, dataHash, storeKey) {
    var K = Record, status;

    if(storeKey===undefined) storeKey = recordType.storeKeyFor(id);
    status = this.readStatus(storeKey);
    if(status === K.EMPTY || status === K.ERROR || status === K.READY_CLEAN || status === K.DESTROYED_CLEAN) {

      status = K.READY_CLEAN;
      if(dataHash === undefined) this.writeStatus(storeKey, status) ;
      else this.writeDataHash(storeKey, dataHash, status) ;

      if (id && this.idFor(storeKey) !== id) {
        Store.replaceIdFor(storeKey, id);

        // If the record's id property has been computed, ensure that it re-computes.
        var record = this.materializeRecord(storeKey);
        record.propertyDidChange('id');
      }
      this.dataHashDidChange(storeKey);

      return storeKey;
    }
    //conflicted (ready)
    return false;
  },

  /**
    Call by the data source whenever you want to push a deletion into the
    store.

    @param {Class} recordType the Record subclass
    @param {Object} id the record id or null
    @param {Number} storeKey optional store key.
    @returns {Number|Boolean} storeKey if push was allowed, false if not
  */
  pushDestroy: function(recordType, id, storeKey) {
    var K = Record, status;

    if(storeKey===undefined){
      storeKey = recordType.storeKeyFor(id);
    }
    status = this.readStatus(storeKey);
    if(status === K.EMPTY || status === K.ERROR || status === K.READY_CLEAN || status === K.DESTROYED_CLEAN){
      status = K.DESTROYED_CLEAN;
      this.removeDataHash(storeKey, status) ;
      this.dataHashDidChange(storeKey);
      return storeKey;
    }
    //conflicted (destroy)
    return false;
  },

  /**
    Call by the data source whenever you want to push an error into the
    store.

    @param {Class} recordType the Record subclass
    @param {Object} id the record id or null
    @param {Error} error [optional] an Error instance to associate with id or storeKey
    @param {Number} storeKey optional store key.
    @returns {Number|Boolean} storeKey if push was allowed, false if not
  */
  pushError: function(recordType, id, error, storeKey) {
    var K = Record, status, errors = this.recordErrors;

    if(storeKey===undefined) storeKey = recordType.storeKeyFor(id);
    status = this.readStatus(storeKey);

    if(status === K.EMPTY || status === K.ERROR || status === K.READY_CLEAN || status === K.DESTROYED_CLEAN){
      status = K.ERROR;

      // Add the error to the array of record errors (for lookup later on if necessary).
      if (error && error.isError) {
        if (!errors) errors = this.recordErrors = [];
        errors[storeKey] = error;
      }

      this.writeStatus(storeKey, status) ;
      this.dataHashDidChange(storeKey, null, true);
      return storeKey;
    }
    //conflicted (error)
    return false;
  },

  // ..........................................................
  // FETCH CALLBACKS
  //

  // **NOTE**: although these method works on RecordArray instances right now.
  // They could be optimized to actually share query results between nested
  // stores.  This is why these methods are implemented here instead of
  // directly on `Query` or `RecordArray` objects.

  /** @deprecated

    @param {Query} query the query you are loading.  must be remote.
    @param {Array} storeKeys array of store keys
    @returns {Store} receiver
  */
  loadQueryResults: function(query, storeKeys) {
    //@if(debug)
    if (query.get('location') === Query.LOCAL) {
      throw new Error("Developer Error: You should not call loadQueryResults with a local query.  You need to use dataSourceDidFetchQuery instead.");
    } else {
      SC.warn("Developer Warning: loadQueryResults has been deprecated in favor of using dataSourceDidFetchQuery for both local and remote queries.  With remote queries, include the store keys when calling dataSourceDidFetchQuery.");
    }
    //@endif

    return this.dataSourceDidFetchQuery(query, storeKeys);
  },

  /**
    Called by your data source whenever you finish fetching the results of a
    query.  This will put the record array for the query into a READY_CLEAN
    state if it was previously loading or refreshing.

    # Handling REMOTE queries

    Note that if the query is REMOTE, then you must first load the results
    into the store using `loadRecords()` and pass the ordered array of store
    keys returned by `loadRecords()` into this method.

    For example,

        storeKeys = store.loadRecords(MyApp.SomeType, body.contacts);
        store.dataSourceDidFetchQuery(query, storeKeys);

    # Automatic updates

    When you call this method the record array for the query will notify that
    its contents have changed.  If the query is LOCAL then the contents will
    update automatically to include any new records you added to the store.
    If the query is REMOTE the contents will update to be the ordered records
    for the passed in store keys.

    # Incremental loading for REMOTE queries

    If you want to support incremental loading, then pass an SparseArray
    object to hold the store keys.  This will allow you to load results
    incrementally and provide more store keys as you do.

    See the SparseArray documentation for more information.

    @param {Query} query The query you fetched
    @param {Array} [storeKeys] Ordered array of store keys as returned by a remote query.  NOTE: Required for remote queries.
    @returns {Store} receiver
  */
  dataSourceDidFetchQuery: function (query, storeKeys) {
    var recArray = this._findQuery(query, true, false);

    // Set the ordered array of store keys for remote queries.
    if (recArray && query.get('isRemote')) {
      //@if(debug)
      // Prevent confusion between local and remote requests.
      if (SC.none(storeKeys)) {
        throw new Error("Developer Error: The storeKeys argument in dataSourceDidFetchQuery is not optional for remote queries.  For a remote query you must include the ordered array of store keys for the loaded records (even if it's an empty array).");
      }
      //@endif

      recArray.set('storeKeys', storeKeys);
    }

    return this._scstore_dataSourceDidFetchQuery(query);
  },

  /** @private */
  _scstore_dataSourceDidFetchQuery: function (query) {
    var recArray     = this._findQuery(query, false, false),
        nestedStores = this.get('nestedStores'),
        loc          = nestedStores ? nestedStores.get('length') : 0;

    // fix query if needed
    if (recArray) recArray.storeDidFetchQuery(query);

    // notify nested stores
    while(--loc >= 0) {
      nestedStores[loc]._scstore_dataSourceDidFetchQuery(query);
    }

    return this ;
  },

  /**
    Called by your data source if it cancels fetching the results of a query.
    This will put any RecordArray's back into its original state (READY or
    EMPTY).

    @param {Query} query the query you cancelled
    @returns {Store} receiver
  */
  dataSourceDidCancelQuery: function(query) {
    return this._scstore_dataSourceDidCancelQuery(query, true);
  },

  _scstore_dataSourceDidCancelQuery: function(query, createIfNeeded) {
    var recArray     = this._findQuery(query, createIfNeeded, false),
        nestedStores = this.get('nestedStores'),
        loc          = nestedStores ? nestedStores.get('length') : 0;

    // fix query if needed
    if (recArray) recArray.storeDidCancelQuery(query);

    // notify nested stores
    while(--loc >= 0) {
      nestedStores[loc]._scstore_dataSourceDidCancelQuery(query, false);
    }

    return this ;
  },

  /**
    Called by your data source if it encountered an error loading the query.
    This will put the query into an error state until you try to refresh it
    again.

    @param {Query} query the query with the error
    @param {Error} error [optional] an Error instance to associate with query
    @returns {Store} receiver
  */
  dataSourceDidErrorQuery: function(query, error) {
    var errors = this.queryErrors;

    // Add the error to the array of query errors (for lookup later on if necessary).
    if (error && error.isError) {
      if (!errors) errors = this.queryErrors = {};
      errors[SC.guidFor(query)] = error;
    }

    return this._scstore_dataSourceDidErrorQuery(query, true);
  },

  _scstore_dataSourceDidErrorQuery: function(query, createIfNeeded) {
    var recArray     = this._findQuery(query, createIfNeeded, false),
        nestedStores = this.get('nestedStores'),
        loc          = nestedStores ? nestedStores.get('length') : 0;

    // fix query if needed
    if (recArray) recArray.storeDidErrorQuery(query);

    // notify nested stores
    while(--loc >= 0) {
      nestedStores[loc]._scstore_dataSourceDidErrorQuery(query, false);
    }

    return this ;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  init: function init () {
    init.base.apply(this, arguments);
    this.reset();
  },


  toString: function toStr () {
    // Include the name if the client has specified one.
    var name = this.get('name');
    if (!name) {
      return toStr.base.apply(this, arguments);
    }
    else {
      var ret = toStr.base.apply(this, arguments);
      return "%@ (%@)".fmt(name, ret);
    }
  },


  // ..........................................................
  // PRIMARY KEY CONVENIENCE METHODS
  //

  /**
    Given a `storeKey`, return the `primaryKey`.

    @param {Number} storeKey the store key
    @returns {String} primaryKey value
  */
  idFor: function(storeKey) {
    return Store.idFor(storeKey);
  },

  /**
    Given a storeKey, return the recordType.

    @param {Number} storeKey the store key
    @returns {Record} record instance
  */
  recordTypeFor: function(storeKey) {
    return Store.recordTypeFor(storeKey) ;
  },

  /**
    Given a `recordType` and `primaryKey`, find the `storeKey`. If the
    `primaryKey` has not been assigned a `storeKey` yet, it will be added.

    @param {Record} recordType the record type
    @param {String} primaryKey the primary key
    @returns {Number} storeKey
  */
  storeKeyFor: function(recordType, primaryKey) {
    return recordType.storeKeyFor(primaryKey);
  },

  /**
    Given a `primaryKey` value for the record, returns the associated
    `storeKey`.  As opposed to `storeKeyFor()` however, this method
    will **NOT** generate a new `storeKey` but returned `undefined`.

    @param {Record} recordType the record type
    @param {String} primaryKey the primary key
    @returns {Number} a storeKey.
  */
  storeKeyExists: function(recordType, primaryKey) {
    return recordType.storeKeyExists(primaryKey);
  },

  /**
    Finds all `storeKey`s of a certain record type in this store
    and returns an array.

    @param {Record} recordType
    @returns {Array} set of storeKeys
  */
  storeKeysFor: function(recordType) {
    var ret = [],
        isEnum = recordType && recordType.isEnumerable,
        recType, storeKey, isMatch ;

    if (!this.statuses) return ret;
    for(storeKey in Store.recordTypesByStoreKey) {
      recType = Store.recordTypesByStoreKey[storeKey];

      // if same record type and this store has it
      if (isEnum) isMatch = recordType.contains(recType);
      else isMatch = recType === recordType;

      if(isMatch && this.statuses[storeKey]) ret.push(parseInt(storeKey, 10));
    }

    return ret;
  },

  /**
    Finds all `storeKey`s in this store
    and returns an array.

    @returns {Array} set of storeKeys
  */
  storeKeys: function() {
    var ret = [], storeKey;
    if(!this.statuses) return ret;

    for(storeKey in this.statuses) {
      // if status is not empty
      if(this.statuses[storeKey] !== Record.EMPTY) {
        ret.push(parseInt(storeKey, 10));
      }
    }

    return ret;
  },

  /**
    Returns string representation of a `storeKey`, with status.

    @param {Number} storeKey
    @returns {String}
  */
  statusString: function(storeKey) {
    var rec = this.materializeRecord(storeKey);
    return rec.statusString();
  }

}) ;

Store.mixin(/** @scope Store.prototype */{

  /**
    Standard error raised if you try to commit changes from a nested store
    and there is a conflict.

    @type Error
  */
  CHAIN_CONFLICT_ERROR: SC.$error("Nested Store Conflict"),

  /**
    Standard error if you try to perform an operation on a nested store
    without a parent.

    @type Error
  */
  NO_PARENT_STORE_ERROR: SC.$error("Parent Store Required"),

  /**
    Standard error if you try to perform an operation on a nested store that
    is only supported in root stores.

    @type Error
  */
  NESTED_STORE_UNSUPPORTED_ERROR: SC.$error("Unsupported In Nested Store"),

  /**
    Standard error if you try to retrieve a record in a nested store that is
    dirty.  (This is allowed on the main store, but not in nested stores.)

    @type Error
  */
  NESTED_STORE_RETRIEVE_DIRTY_ERROR: SC.$error("Cannot Retrieve Dirty Record in Nested Store"),

  /**
    Data hash state indicates the data hash is currently editable

    @type String
  */
  EDITABLE:  'editable',

  /**
    Data hash state indicates the hash no longer tracks changes from a
    parent store, but it is not editable.

    @type String
  */
  LOCKED:    'locked',

  /**
    Data hash state indicates the hash is tracking changes from the parent
    store and is not editable.

    @type String
  */
  INHERITED: 'inherited',

  /** @private
    This array maps all storeKeys to primary keys.  You will not normally
    access this method directly.  Instead use the `idFor()` and
    `storeKeyFor()` methods on `Record`.
  */
  idsByStoreKey: [],

  /** @private
    Maps all `storeKey`s to a `recordType`.  Once a `storeKey` is associated
    with a `primaryKey` and `recordType` that remains constant throughout the
    lifetime of the application.
  */
  recordTypesByStoreKey: {},

  /** @private
    Maps some `storeKeys` to query instance.  Once a `storeKey` is associated
    with a query instance, that remains constant through the lifetime of the
    application.  If a `Query` is destroyed, it will remove itself from this
    list.

    Don't access this directly.  Use queryFor().
  */
  queriesByStoreKey: [],

  /** @private
    The next store key to allocate.  A storeKey must always be greater than 0
  */
  nextStoreKey: 1,

  /**
    Generates a new store key for use.

    @type Number
  */
  generateStoreKey: function() { return this.nextStoreKey++; },

  /**
    Given a `storeKey` returns the `primaryKey` associated with the key.
    If no `primaryKey` is associated with the `storeKey`, returns `null`.

    @param {Number} storeKey the store key
    @returns {String} the primary key or null
  */
  idFor: function(storeKey) {
    return this.idsByStoreKey[storeKey] ;
  },

  /**
    Given a `storeKey`, returns the query object associated with the key.  If
    no query is associated with the `storeKey`, returns `null`.

    @param {Number} storeKey the store key
    @returns {Query} query query object
  */
  queryFor: function(storeKey) {
    return this.queriesByStoreKey[storeKey];
  },

  /**
    Given a `storeKey` returns the `Record` class associated with the key.
    If no record type is associated with the store key, returns `null`.

    The Record class will only be found if you have already called
    storeKeyFor() on the record.

    @param {Number} storeKey the store key
    @returns {Record} the record type
  */
  recordTypeFor: function(storeKey) {
    return this.recordTypesByStoreKey[storeKey];
  },

  /**
    Swaps the `primaryKey` mapped to the given storeKey with the new
    `primaryKey`.  If the `storeKey` is not currently associated with a record
    this will raise an exception.

    @param {Number} storeKey the existing store key
    @param {String} newPrimaryKey the new primary key
    @returns {Store} receiver
  */
  replaceIdFor: function(storeKey, newId) {
    var oldId = this.idsByStoreKey[storeKey],
        recordType, storeKeys;

    if (oldId !== newId) { // skip if id isn't changing

      recordType = this.recordTypeFor(storeKey);
       if (!recordType) {
        throw new Error("replaceIdFor: storeKey %@ does not exist".fmt(storeKey));
      }

      // map one direction...
      this.idsByStoreKey[storeKey] = newId;

      // then the other...
      storeKeys = recordType.storeKeysById() ;
      delete storeKeys[oldId];
      storeKeys[newId] = storeKey;
    }

    return this ;
  },

  /**
    Swaps the `recordType` recorded for a given `storeKey`.  Normally you
    should not call this method directly as it can damage the store behavior.
    This method is used by other store methods to set the `recordType` for a
    `storeKey`.

    @param {Integer} storeKey the store key
    @param {Record} recordType a record class
    @returns {Store} receiver
  */
  replaceRecordTypeFor: function(storeKey, recordType) {
    this.recordTypesByStoreKey[storeKey] = recordType;
    return this ;
  }

});
