// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { Query } from "./query.js";
import { Store } from "./store.js";
import { Record } from '../models/record.js';

// sc_require('system/store');


/**
  @class

  A nested store can buffer changes to a parent store and then commit them
  all at once.  You usually will use a `NestedStore` as part of store chaining
  to stage changes to your object graph before sharing them with the rest of
  the application.

  Normally you will not create a nested store directly.  Instead, you can
  retrieve a nested store by using the `chain()` method.  When you are finished
  working with the nested store, `destroy()` will dispose of it.

  
  @since SproutCore 1.0
*/
export const NestedStore = Store.extend(
/** @scope NestedStore.prototype */ {

    /**
      This is set to true when there are changes that have not been committed
      yet.
  
      @type Boolean
      @default false
    */
    hasChanges: false,

    /**
      The parent store this nested store is chained to.  Nested stores must have
      a parent store in order to function properly.  Normally, you create a
      nested store using the `Store#chain()` method and this property will be
      set for you.
  
      @type Store
      @default null
    */
    parentStore: null,

    /**
      `true` if the store is nested. Walk like a duck
  
      @type Boolean
      @default true
    */
    isNested: true,

    /**
      If true, then the attribute hash state will be locked when you first
      read the data hash or status.  This means that if you retrieve a record
      then change the record in the parent store, the changes will not be
      visible to your nested store until you commit or discard changes.
  
      If `false`, then the attribute hash will lock only when you write data.
  
      Normally you want to lock your attribute hash the first time you read it.
      This will make your nested store behave most consistently.  However, if
      you are using multiple sibling nested stores at one time, you may want
      to turn off this property so that changes from one store will be reflected
      in the other one immediately.  In this case you will be responsible for
      ensuring that the sibling stores do not edit the same part of the object
      graph at the same time.
  
      @type Boolean
      @default true
    */
    lockOnRead: true,

    /** @private
      Array contains the base revision for an attribute hash when it was first
      cloned from the parent store.  If the attribute hash is edited and
      committed, the commit will fail if the parent attributes hash has been
      edited since.
  
      This is a form of optimistic locking, hence the name.
  
      Each store gets its own array of locks, which are selectively populated
      as needed.
  
      Note that this is kept as an array because it will be stored as a dense
      array on some browsers, making it faster.
  
      @type Array
      @default null
    */
    locks: null,

    /** @private
      An array that includes the store keys that have changed since the store
      was last committed.  This array is used to sync data hash changes between
      chained stores.  For a log changes that may actually be committed back to
      the server see the changelog property.
  
      @type Set
      @default true
    */
    chainedChanges: null,

    // ..........................................................
    // STORE CHAINING
    //

    /**
      `find()` cannot accept REMOTE queries in a nested store.  This override will
      verify that condition for you.  See `Store#find()` for info on using this
      method.
  
      @param {Query} query query object to use.
      @returns {Record|RecordArray}
    */
    find: function find(query) {
      if (query && query.isQuery && query.get('location') !== Query.LOCAL) {
        throw new Error("Store#find() can only accept LOCAL queries in nested stores");
      }
      return find.base.apply(this, arguments);
    },

    /**
      Propagate this store's changes to its parent.  If the store does not
      have a parent, this has no effect other than to clear the change set.
  
      @param {Boolean} force if true, does not check for conflicts first
      @returns {Store} receiver
    */
    commitChanges: function (force) {
      if (this.get('hasChanges')) {
        var pstore = this.get('parentStore');
        pstore.commitChangesFromNestedStore(this, this.get('chainedChanges'), force);
      }

      // clear out custom changes - even if there is nothing to commit.
      this.reset();
      return this;
    },

    /**
      An array of store keys for all conflicting records with the parent store. If there are no
      conflicting records, this property will be null.
  
      @readonly
      @field
      @type Array
      @default null
    */
    conflictedStoreKeys: function () {
      var ret = null;

      if (this.get('hasChanges')) {
        var pstore = this.get('parentStore'),
          locks = this.locks,
          revisions = pstore.revisions;

        if (locks && revisions) {
          var changes = this.get('chainedChanges');

          for (var i = 0, len = changes.length; i < len; i++) {
            var storeKey = changes[i],
              lock = locks[storeKey] || 1,
              revision = revisions[storeKey] || 1;

            // If the same revision for the item does not match the current revision, then someone has
            // changed the data hash in this store and we have a conflict.
            if (lock < revision) {
              if (!ret) ret = [];
              ret.push(storeKey);
            }
          }
        }
      }

      return ret;
    }.property('chainedChanges').cacheable(),

    /**
      Propagate this store's successful changes to its parent (if exists). At the end, it clears the
      local, private status of the committed records therefore the method can be called several times
      until the full transaction is successful or editing is abandoned
  
      @param {Boolean} force if true, does not check for conflicts first
      @returns {Store} receiver
    */
    commitSuccessfulChanges: function (force) {
      var chainedChanges = this.get('chainedChanges');

      if (this.get('hasChanges') && chainedChanges) {
        var dataHashes = this.dataHashes,
          revisions = this.revisions,
          statuses = this.statuses,
          editables = this.editables,
          locks = this.locks;

        var successfulChanges = chainedChanges.filter(function (storeKey) {
          var state = this.readStatus(storeKey);

          return state === Record.READY_CLEAN || state === Record.DESTROYED_CLEAN;
        }, this);

        var pstore = this.get('parentStore');

        pstore.commitChangesFromNestedStore(this, successfulChanges, force);

        // remove the local status so these records that have been successfully committed on the server
        // are no longer retrieved from this nested store but from the parent
        for (var i = 0, len = successfulChanges.get('length'); i < len; i++) {
          var storeKey = successfulChanges.objectAt(i);

          if (dataHashes && dataHashes.hasOwnProperty(storeKey)) { delete dataHashes[storeKey]; }
          if (revisions && revisions.hasOwnProperty(storeKey)) { delete revisions[storeKey]; }
          if (editables) { delete editables[storeKey]; }
          if (locks) { delete locks[storeKey]; }
          if (statuses && statuses.hasOwnProperty(storeKey)) { delete statuses[storeKey]; }

          chainedChanges.remove(storeKey);
        }

        // Indicate that chainedChanges has changed.
        if (successfulChanges.length > 0) { this.notifyPropertyChange('chainedChanges'); }
      }

      return this;
    },

    /**
      Discard the changes made to this store and reset the store.
  
      @returns {Store} receiver
    */
    discardChanges: function () {
      // any locked records whose rev or lock rev differs from parent need to
      // be notified.
      var records, locks;
      if ((records = this.records) && (locks = this.locks)) {
        var pstore = this.get('parentStore'), psRevisions = pstore.revisions;
        var revisions = this.revisions, storeKey, lock, rev;
        for (storeKey in records) {
          if (!records.hasOwnProperty(storeKey)) continue;
          if (!(lock = locks[storeKey])) continue; // not locked.

          rev = psRevisions[storeKey];
          if ((rev !== lock) || (revisions[storeKey] > rev)) {
            this._notifyRecordPropertyChange(parseInt(storeKey, 10));
          }
        }
      }

      this.reset();
      this.flush();
      return this;
    },

    /**
      When you are finished working with a chained store, call this method to
      tear it down.  This will also discard any pending changes.
  
      @returns {Store} receiver
    */
    destroy: function destroy() {
      this.discardChanges();

      var parentStore = this.get('parentStore');
      if (parentStore) parentStore.willDestroyNestedStore(this);

      destroy.base.apply(this, arguments);
      return this;
    },

    /**
      Resets a store's data hash contents to match its parent.
    */
    reset: function () {
      // requires a pstore to reset
      var parentStore = this.get('parentStore');
      if (!parentStore) Store.NO_PARENT_STORE_ERROR.throw();

      // inherit data store from parent store.
      this.dataHashes = SC.beget(parentStore.dataHashes);
      this.revisions = SC.beget(parentStore.revisions);
      this.statuses = SC.beget(parentStore.statuses);

      // also, reset private temporary objects
      this.set('hasChanges', false);
      this.chainedChanges = this.locks = this.editables = null;
      this.changelog = null;

      // TODO: Notify record instances
    },

    /** @private
  
      Chain to parentstore
    */
    refreshQuery: function (query) {
      var parentStore = this.get('parentStore');
      if (parentStore) parentStore.refreshQuery(query);
      return this;
    },

    /**
      Returns the `Error` object associated with a specific record.
  
      If this is an autonomous nested store call the base class, otherwise
      delegate the call to the parent store.
  
      @param {Number} storeKey The store key of the record.
  
      @returns {Error} Error or null if no error associated with the record.
    */
    readError: function readError(storeKey) {
      if (this.get("dataSource")) {
        return readError.base.apply(this, arguments);
      }
      else {
        var parentStore = this.get('parentStore');
        return parentStore ? parentStore.readError(storeKey) : null;
      }
    },

    /**
      Returns the `Error` object associated with a specific query.
  
      If this is an autonomous nested store call the base class, otherwise
      delegate the call to the parent store.
  
      @param {Query} query The Query with which the error is associated.
  
      @returns {Error} Error or null if no error associated with the query.
    */
    readQueryError: function readQueryError(query) {
      if (this.get("dataSource")) {
        // return sc_super();
        return readQueryError.base.apply(this, arguments);
      }
      else {
        var parentStore = this.get('parentStore');
        return parentStore ? parentStore.readQueryError(query) : null;
      }
    },

    /** @private - adapt for nested store */
    chainAutonomousStore: function (attrs, newStoreClass) {
      Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    // ..........................................................
    // CORE ATTRIBUTE API
    //
    // The methods in this layer work on data hashes in the store.  They do not
    // perform any changes that can impact records.  Usually you will not need
    // to use these methods.

    /**
      Returns the current edit status of a storekey.  May be one of `INHERITED`,
      `EDITABLE`, and `LOCKED`.  Used mostly for unit testing.
  
      @param {Number} storeKey the store key
      @returns {Number} edit status
    */
    storeKeyEditState: function (storeKey) {
      var editables = this.editables, locks = this.locks;
      return (editables && editables[storeKey]) ? Store.EDITABLE : (locks && locks[storeKey]) ? Store.LOCKED : Store.INHERITED;
    },

    /**  @private
      Locks the data hash so that it iterates independently from the parent
      store.
    */
    _lock: function (storeKey) {
      var locks = this.locks, rev, editables,
        pk, pr, path, tup, obj, key;

      // already locked -- nothing to do
      if (locks && locks[storeKey]) return this;

      // create locks if needed
      if (!locks) locks = this.locks = [];

      // fixup editables
      editables = this.editables;
      if (editables) editables[storeKey] = 0;


      // if the data hash in the parent store is editable, then clone the hash
      // for our own use.  Otherwise, just copy a reference to the data hash
      // in the parent store. -- find first non-inherited state
      var pstore = this.get('parentStore'), editState;
      while (pstore && (editState = pstore.storeKeyEditState(storeKey)) === Store.INHERITED) {
        pstore = pstore.get('parentStore');
      }

      if (pstore && editState === Store.EDITABLE) {

        if (!editables) editables = this.editables = [];
        editables[storeKey] = 1; // mark as editable

      } else this.dataHashes[storeKey] = pstore.dataHashes[storeKey];

      // also copy the status + revision
      this.statuses[storeKey] = this.statuses[storeKey];
      rev = this.revisions[storeKey] = this.revisions[storeKey];

      // save a lock and make it not editable
      locks[storeKey] = rev || 1;

      return this;
    },

    /** @private - adds chaining support */
    readDataHash: function (storeKey) {
      if (this.get('lockOnRead')) this._lock(storeKey);
      return this.dataHashes[storeKey];
    },

    /** @private - adds chaining support */
    readEditableDataHash: function readEditableDataHash(storeKey) {

      // lock the data hash if needed
      this._lock(storeKey);

      // return sc_super();
      return readEditableDataHash.base.apply(this, arguments);
    },

    /** @private - adds chaining support -
      Does not call sc_super because the implementation of the method vary too
      much.
    */
    writeDataHash: function (storeKey, hash, status) {
      var locks = this.locks, didLock = false, rev;

      // Update our dataHash and/or status, depending on what was passed in.
      // Note that if no new hash was passed in, we'll lock the storeKey to
      // properly fork our dataHash from our parent store.  Similarly, if no
      // status was passed in, we'll save our own copy of the value.
      if (hash) {
        this.dataHashes[storeKey] = hash;
      }
      else {
        this._lock(storeKey);
        didLock = true;
      }

      if (status) {
        this.statuses[storeKey] = status;
      }
      else {
        if (!didLock) this.statuses[storeKey] = (this.statuses[storeKey] || Record.READY_NEW);
      }

      if (!didLock) {
        rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref

        // make sure we lock if needed.
        if (!locks) locks = this.locks = [];
        if (!locks[storeKey]) locks[storeKey] = rev || 1;
      }

      // Also note that this hash is now editable.  (Even if we locked it,
      // above, it may not have been marked as editable.)
      var editables = this.editables;
      if (!editables) editables = this.editables = [];
      editables[storeKey] = 1; // use number for dense array support

    return this ;
  },

    /** @private - adds chaining support */
    removeDataHash: function removeDataHash(storeKey, status) {

      // record optimistic lock revision
      var locks = this.locks;
      if (!locks) locks = this.locks = [];
      if (!locks[storeKey]) locks[storeKey] = this.revisions[storeKey] || 1;

      // return sc_super();
      return removeDataHash.base.apply(this, arguments);
    },

    /** @private - bookkeeping for a single data hash. */
    dataHashDidChange: function (storeKeys, rev, statusOnly, key) {
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

      var changes = this.get('chainedChanges');
      if (!changes) changes = this.chainedChanges = SC.Set.create();

    var didAddChainedChanges = false;

      for (idx = 0; idx < len; idx++) {
        if (isArray) storeKey = storeKeys[idx];

        this._lock(storeKey);
        this.revisions[storeKey] = rev;

        if (!changes.contains(storeKey)) {
          changes.add(storeKey);
          didAddChainedChanges = true;
        }

        this._notifyRecordPropertyChange(storeKey, statusOnly, key);

    }

      this.setIfChanged('hasChanges', true);
      if (didAddChainedChanges) {
        this.notifyPropertyChange('chainedChanges');
      }

      return this;
    },

    // ..........................................................
    // SYNCING CHANGES
    //

    /** @private - adapt for nested store */
    commitChangesFromNestedStore: function commitChangesFromNestedStore(nestedStore, changes, force) {

      // sc_super();
      commitChangesFromNestedStore.base.apply(this, arguments);

      // save a lock for each store key if it does not have one already
      // also add each storeKey to my own changes set.
      var pstore = this.get('parentStore'), psRevisions = pstore.revisions, i;
      var myLocks = this.locks,
        myChanges = this.get('chainedChanges'),
        len,
        storeKey;

      if (!myLocks) myLocks = this.locks = [];
      if (!myChanges) myChanges = this.chainedChanges = SC.Set.create();

      len = changes.length;
      for (i = 0; i < len; i++) {
        storeKey = changes[i];
        if (!myLocks[storeKey]) myLocks[storeKey] = psRevisions[storeKey] || 1;
        myChanges.add(storeKey);
      }

      // Finally, mark store as dirty if we have changes
      this.setIfChanged('hasChanges', myChanges.get('length') > 0);
      this.notifyPropertyChange('chainedChanges');

      this.flush();

      return this;
    },

    // ..........................................................
    // HIGH-LEVEL RECORD API
    //


    /** @private - adapt for nested store */
    queryFor: function (recordType, conditions, params) {
      return this.get('parentStore').queryFor(recordType, conditions, params);
    },

    // ..........................................................
    // CORE RECORDS API
    //
    // The methods in this section can be used to manipulate records without
    // actually creating record instances.

    /** @private - adapt for nested store
  
      Unlike for the main store, for nested stores if isRefresh=true, we'll throw
      an error if the record is dirty.  We'll otherwise avoid setting our status
      because that can disconnect us from upper and/or lower stores.
    */
    retrieveRecords: function (recordTypes, ids, storeKeys, isRefresh, callbacks) {
      var pstore = this.get('parentStore'), idx, storeKey,
        len = (!storeKeys) ? ids.length : storeKeys.length,
        K = Record, status;

      // Is this a refresh?
      if (isRefresh) {
        for (idx = 0; idx < len; idx++) {
          storeKey = !storeKeys ? pstore.storeKeyFor(recordTypes, ids[idx]) : storeKeys[idx];
          status = this.peekStatus(storeKey);

          // We won't allow calling retrieve on a dirty record in a nested store
          // (although we do allow it in the main store).  This is because doing
          // so would involve writing a unique status, and that would break the
          // status hierarchy, so even though lower stores would complete the
          // retrieval, the upper layers would never inherit the new statuses.
          if (status & K.DIRTY) {
            Store.NESTED_STORE_RETRIEVE_DIRTY_ERROR.throw();
          }
          else {
            // Not dirty?  Then abandon any status we had set (to re-establish
            // any prototype linkage breakage) before asking our parent store to
            // perform the retrieve.
            var dataHashes = this.dataHashes,
              revisions = this.revisions,
              statuses = this.statuses,
              editables = this.editables,
              locks = this.locks;

            var changed = false;
            var statusOnly = false;

            if (dataHashes && dataHashes.hasOwnProperty(storeKey)) {
              delete dataHashes[storeKey];
              changed = true;
            }
            if (revisions && revisions.hasOwnProperty(storeKey)) {
              delete revisions[storeKey];
              changed = true;
            }
            if (editables) delete editables[storeKey];
            if (locks) delete locks[storeKey];

            if (statuses && statuses.hasOwnProperty(storeKey)) {
              delete statuses[storeKey];
              if (!changed) statusOnly = true;
              changed = true;
            }

            if (changed) this._notifyRecordPropertyChange(storeKey, statusOnly);
          }
        }
      }

      return pstore.retrieveRecords(recordTypes, ids, storeKeys, isRefresh, callbacks);
    },

    /** @private - adapt for nested store */
    commitRecords: function fn(recordTypes, ids, storeKeys) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    commitRecord: function fn(recordType, id, storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    cancelRecords: function fn(recordTypes, ids, storeKeys) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    cancelRecord: function fn(recordType, id, storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    // ..........................................................
    // DATA SOURCE CALLBACKS
    //
    // Methods called by the data source on the store

    /** @private - adapt for nested store */
    dataSourceDidCancel: function fn(storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    dataSourceDidComplete: function fn(storeKey, dataHash, newId) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    dataSourceDidDestroy: function fn(storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    dataSourceDidError: function fn(storeKey, error) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    // ..........................................................
    // PUSH CHANGES FROM DATA SOURCE
    //

    /** @private - adapt for nested store */
    pushRetrieve: function fn(recordType, id, dataHash, storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    pushDestroy: function fn(recordType, id, storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    },

    /** @private - adapt for nested store */
    pushError: function fn(recordType, id, error, storeKey) {
      if (this.get("dataSource"))
        // return sc_super();
        return fn.base.apply(this, arguments);
      else
        Store.NESTED_STORE_UNSUPPORTED_ERROR.throw();
    }

  });

