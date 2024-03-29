// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global ActiveXObject */

import { SC } from '../../core/core.js';
import { SCEvent } from '../../event/event.js';
import { platform } from '../../responder/responder.js';
// import { Request } from './request.js';
let Request;
import('./request.js').then(r => {
  Request = r.Request;
});

/**
  @class

  A response represents a single response from a server request and handles the communication to
  the server.  An instance of this class is returned whenever you call `Request.send()`.

  SproutCore only defines one concrete subclass of `Response`,`XHRResponse`. In order to
  use `Request` with a non-XHR request type you should create a custom class that extends
  `Response` and set your custom class as the value of `responseClass` on all requests.

  For example,

      var request = Request.getUrl(resourceAddress)
                              .set('responseClass', MyApp.CustomProtocolResponse)
                              .send();

  To extend `Response`, please look at the property and methods listed below. For more examples,
  please look at the code in `XHRResponse`.

  
  @since SproutCore 1.0
*/
export const Response = SC.Object.extend(
/** @scope Response.prototype */ {

  /**
    Walk like a duck

    @type Boolean
  */
  isResponse: true,

  /**
    Becomes true if there was a failure.  Makes this into an error object.

    @type Boolean
    @default false
  */
  isError: false,

  /**
    Always the current response

    @field
    @type Response
    @default `this`
  */
  errorValue: function() {
    return this.get('isError') ? SC.val(this.get('errorObject')) : null;
  }.property().cacheable(),

  /**
    The error object generated when this becomes an error

    @type Error
    @default null
  */
  errorObject: null,

  /**
    Request used to generate this response.  This is a copy of the original
    request object as you may have modified the original request object since
    then.

    To retrieve the original request object use originalRequest.

    @type Request
    @default null
  */
  request: null,

  /**
    The request object that originated this request series.  Mostly this is
    useful if you are looking for a reference to the original request.  To
    inspect actual properties you should use request instead.

    @field
    @type Request
    @observes request
  */
  originalRequest: function() {
    var ret = this.get('request');
    while (ret.get('source')) { ret = ret.get('source'); }
    return ret;
  }.property('request').cacheable(),

  /**
    Type of request. Must be an HTTP method. Based on the request.

    @field
    @type String
    @observes request
  */
  type: function() {
    return this.getPath('request.type');
  }.property('request').cacheable(),

  /**
    URL of request.

    @field
    @type String
    @observes request
  */
  address: function() {
    return this.getPath('request.address');
  }.property('request').cacheable(),

  /**
    If set then will attempt to automatically parse response as JSON
    regardless of headers.

    @field
    @type Boolean
    @default false
    @observes request
  */
  isJSON: function() {
    return this.getPath('request.isJSON') || false;
  }.property('request').cacheable(),

  /**
    If set, then will attempt to automatically parse response as XML
    regardless of headers.

    @field
    @type Boolean
    @default false
    @observes request
  */
  isXML: function() {
    return this.getPath('request.isXML') || false;
  }.property('request').cacheable(),

  /**
    Returns the hash of listeners set on the request.

    @field
    @type Hash
    @observes request
  */
  listeners: function() {
    return this.getPath('request.listeners');
  }.property('request').cacheable(),

  /**
    The response status code.

    @type Number
    @default -100
  */
  status: -100, // READY

  /**
    Headers from the response. Computed on-demand

    @type Hash
    @default null
  */
  headers: null,

  /**
    The response body or the parsed JSON. Returns a Error instance
    if there is a JSON parsing error. If isJSON was set, will be parsed
    automatically.

    @field
    @type {Hash|String|Error}
  */
  body: function() {
    // TODO: support XML
    // TODO: why not use the content-type header?
    var ret = this.get('encodedBody');
    if (ret && this.get('isJSON')) {
      try {
        ret = SC.json.decode(ret);
      } catch(e) {
        return SC.Error.create({
          message: e.name + ': ' + e.message,
          label: 'Response',
          errorValue: this.get('status') });
      }
    }
    return ret;
  }.property('encodedBody').cacheable(),

  /**
    @private
    @deprecated Use body instead.

    Alias for body.

    @type Hash|String
    @see #body
  */
  response: function() {
    return this.get('body');
  }.property('body').cacheable(),

  /**
    Set to true if response is cancelled

    @type Boolean
    @default false
  */
  isCancelled: false,

  /**
    Set to true if the request timed out. Set to false if the request has
    completed before the timeout value. Set to null if the timeout timer is
    still ticking.

    @type Boolean
    @default null
  */
  timedOut: null,

  /**
    The timer tracking the timeout

    @type Number
    @default null
  */
  timeoutTimer: null,


  // ..........................................................
  // METHODS
  //

  /**
    Called by the request manager when its time to actually run. This will
    invoke any callbacks on the source request then invoke transport() to
    begin the actual request.
  */
  fire: function() {
    var req = this.get('request'),
        source = req ? req.get('source') : null;

    // first give the source a chance to fixup the request and response
    // then freeze req so no more changes can happen.
    if (source && source.willSend) { source.willSend(req, this); }

    req.set('requestTime', Date.now());
    req.freeze();

    // if the source did not cancel the request, then invoke the transport
    // to actually trigger the request.  This might receive a response
    // immediately if it is synchronous.
    if (!this.get('isCancelled')) { this.invokeTransport(); }

    // If the request specified a timeout value, then set a timer for it now.
    var timeout = req.get('timeout');
    if (timeout) {
      var timer = SC.Timer.schedule({
        target: this,
        action: 'timeoutReached',
        interval: timeout,
        repeats: false
      });
      this.set('timeoutTimer', timer);
    }

    // if the transport did not cancel the request for some reason, let the
    // source know that the request was sent
    if (!this.get('isCancelled') && source && source.didSend) {
      source.didSend(req, this);
    }
  },

  /**
    Called by `Response#fire()`. Starts the transport by invoking the
    `Response#receive()` function.
  */
  invokeTransport: function() {
    this.receive(function(proceed) { this.set('status', 200); }, this);
  },

  /**
    Invoked by the transport when it receives a response. The passed-in
    callback will be invoked to actually process the response. If cancelled
    we will pass false. You should clean up instead.

    Invokes callbacks on the source request also.

    @param {Function} callback the function to receive
    @param {Object} context context to execute the callback in
    @returns {Response} receiver
  */
  receive: function(callback, context) {
    if (!this.get('timedOut')) {
      // If we had a timeout timer scheduled, invalidate it now.
      var timer = this.get('timeoutTimer');
      if (timer) { timer.invalidate(); }
      this.set('timedOut', false);
    }

    var req = this.get('request');
    var source = req ? req.get('source') : null;

    SC.run(function() {
      // invoke the source, giving a chance to fixup the response or (more
      // likely) cancel the request.
      if (source && source.willReceive) { source.willReceive(req, this); }

      // invoke the callback.  note if the response was cancelled or not
      callback.call(context, !this.get('isCancelled'));

      // if we weren't cancelled, then give the source first crack at handling
      // the response.  if the source doesn't want listeners to be notified,
      // it will cancel the response.
      if (!this.get('isCancelled') && source && source.didReceive) {
        source.didReceive(req, this);
      }

      // notify listeners if we weren't cancelled.
      if (!this.get('isCancelled')) { this.notify(); }
    }, this);

    // no matter what, remove from inflight queue
    Request.manager.transportDidClose(this);
    return this;
  },

  /**
    Default method just closes the connection. It will also mark the request
    as cancelled, which will not call any listeners.
  */
  cancel: function() {
    if (!this.get('isCancelled')) {
      this.set('isCancelled', true);
      this.cancelTransport();
      Request.manager.transportDidClose(this);
    }
  },

  /**
    Default method just closes the connection.

    @returns {Boolean} true if this response has not timed out yet, false otherwise
  */
  timeoutReached: function() {
    // If we already received a response yet the timer still fired for some
    // reason, do nothing.
    if (this.get('timedOut') === null) {
      this.set('timedOut', true);
      this.cancelTransport();

      // Invokes any relevant callbacks and notifies registered listeners, if
      // any. In the event of a timeout, we set the status to 0 since we
      // didn't actually get a response from the server.
      this.receive(function(proceed) {
        if (!proceed) { return; }

        this.set('status', 0);
        this.set('isError', true);
        this.set('errorObject', SC.$error("HTTP Request timed out", "Request", 0));
      }, this);

      return true;
    }

    return false;
  },

  /**
    Override with concrete implementation to actually cancel the transport.
  */
  cancelTransport: function() {},

  /**
    @private

    Will notify each listener. Returns true if any of the listeners handle.
  */
  _notifyListeners: function(listeners, status) {
    var notifiers = listeners[status], args, target, action;
    if (!notifiers) { return false; }

    var handled = false;
    var len = notifiers.length;

    for (var i = 0; i < len; i++) {
      var notifier = notifiers[i];
      args = (notifier.args || []).copy();
      args.unshift(this);

      target = notifier.target;
      action = notifier.action;
      if (SC.typeOf(action) === SC.T_STRING) { action = target[action]; }

      handled = action.apply(target, args);
    }

    return handled;
  },

  /**
    Notifies any saved target/action. Call whenever you cancel, or end.

    @returns {Response} receiver
  */
  notify: function() {
    var listeners = this.get('listeners'),
        status = this.get('status'),
        baseStat = Math.floor(status / 100) * 100,
        handled = false;

    if (!listeners) { return this; }

    handled = this._notifyListeners(listeners, status);
    if (!handled && baseStat !== status) { handled = this._notifyListeners(listeners, baseStat); }
    if (!handled && status !== 0) { handled = this._notifyListeners(listeners, 0); }

    return this;
  },

  /**
    String representation of the response object

    @returns {String}
  */
  toString: function toStr () {
    var ret = toStr.base.apply(this, arguments);
    return "%@<%@ %@, status=%@".fmt(ret, this.get('type'), this.get('address'), this.get('status'));
  }

});

/**
  @class

  Concrete implementation of `Response` that implements support for using XHR requests. This is
  the default response class that `Request` uses and it is able to create cross-browser
  compatible XHR requests to the address defined on a request and to notify according to the status
  code fallbacks registered on the request.

  You will not typically deal with this class other than to receive an instance of it when handling
  `Request` responses. For more information on how to create a request and handle an XHR response,
  please @see Request.

  
  @since SproutCore 1.0
*/
export const XHRResponse = Response.extend(
/** @scope XHRResponse.prototype */{

  /**
    Implement transport-specific support for fetching all headers
  */
  headers: function() {
    var xhr = this.get('rawRequest'),
        str = xhr ? xhr.getAllResponseHeaders() : null,
        ret = {};

    if (!str) { return ret; }

    str.split("\n").forEach(function(header) {
      var idx = header.indexOf(':'),
          key, value;

      if (idx >= 0) {
        key = header.slice(0,idx);
        value = header.slice(idx + 1).trim();
        ret[key] = value;
      }
    }, this);

    return ret;
  }.property('status').cacheable(),

  /**
    Returns a header value if found.

    @param {String} key The header key
    @returns {String}
  */
  header: function(key) {
    var xhr = this.get('rawRequest');
    return xhr ? xhr.getResponseHeader(key) : null;
  },

  /**
    Implement transport-specific support for fetching tasks

    @field
    @type String
    @default #rawRequest
  */
  encodedBody: function() {
    var xhr = this.get('rawRequest');

    if (!xhr) { return null; }
    if (this.get('isXML')) { return xhr.responseXML; }

    return xhr.responseText;
  }.property('status').cacheable(),

  /**
    Cancels the request.
  */
  cancelTransport: function() {
    var rawRequest = this.get('rawRequest');
    if (rawRequest) { rawRequest.abort(); }
    this.set('rawRequest', null);
  },


  /**
    Starts the transport of the request

    @returns {XMLHttpRequest|ActiveXObject}
  */
  invokeTransport: function() {
    var listener, listeners, listenersForKey,
      rawRequest,
      request = this.get('request'),
      transport, handleReadyStateChange, async, headers;

    rawRequest = this.createRequest();
    this.set('rawRequest', rawRequest);

    // configure async callback - differs per browser...
    async = !!request.get('isAsynchronous');

    if (async) {
      if (platform.get('supportsXHR2ProgressEvent')) {
        // XMLHttpRequest Level 2

        // Add progress event listeners that were specified on the request.
        listeners = request.get("listeners");
        if (listeners) {
          for (var key in listeners) {

            // Make sure the key is not an HTTP numeric status code.
            if (isNaN(parseInt(key, 10))) {
              // We still allow multiple notifiers on progress events, but we
              // don't try to optimize this by using a single listener, because
              // it is highly unlikely that the developer will add duplicate
              // progress event notifiers and if they did, it is also unlikely
              // that they would expect them to cascade in the way that the
              // status code notifiers do.
              listenersForKey = listeners[key];
              for (var i = 0, len = listenersForKey.length; i < len; i++) {
                listener = listenersForKey[i];

                var keyTarget = key.split('.');
                if (SC.none(keyTarget[1])) {
                  SCEvent.add(rawRequest, keyTarget[0], listener.target, listener.action, listener.args);
                } else {
                  SCEvent.add(rawRequest[keyTarget[0]], keyTarget[1], listener.target, listener.action, listener.args);
                }
              }
            }
          }
        }

        if (platform.get('supportsXHR2LoadEndEvent')) {
          SCEvent.add(rawRequest, 'loadend', this, this.finishRequest);
        } else {
          SCEvent.add(rawRequest, 'load', this, this.finishRequest);
          SCEvent.add(rawRequest, 'error', this, this.finishRequest);
          SCEvent.add(rawRequest, 'abort', this, this.finishRequest);
        }
      } else if (window.XMLHttpRequest && rawRequest.addEventListener) {
        // XMLHttpRequest Level 1 + support for addEventListener (IE prior to version 9.0 lacks support for addEventListener)
        SCEvent.add(rawRequest, 'readystatechange', this, this.finishRequest);
      } else {
        transport = this;
        handleReadyStateChange = function() {
          if (!transport) { return null; }
          var ret = transport.finishRequest();
          if (ret) { transport = null; }
          return ret;
        };
        rawRequest.onreadystatechange = handleReadyStateChange;
      }
    }

    // initiate request.
    rawRequest.open(this.get('type'), this.get('address'), async);

    // headers need to be set *after* the open call.
    headers = this.getPath('request.headers');
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]);
    }

    // Do we need to allow Cookies for x-domain requests?
    if (!this.getPath('request.isSameDomain') && this.getPath('request.allowCredentials')) {
      rawRequest.withCredentials = true;
    }

    // now send the actual request body - for sync requests browser will
    // block here
    rawRequest.send(this.getPath('request.encodedBody'));
    if (!async) { this.finishRequest(); }

    return rawRequest;
  },

  /**
    Creates the correct XMLHttpRequest object for this browser.

    You can override this if you need to, for example, create an XHR on a
    different domain name from an iframe.

    @returns {XMLHttpRequest|ActiveXObject}
  */
  createRequest: function() {
    var rawRequest;

    // check native support first
    if (window.XMLHttpRequest) {
      rawRequest = new XMLHttpRequest();
    } else {
      // There are two relevant Microsoft MSXML object types.
      // See here for more information:
      // http://www.snook.ca/archives/javascript/xmlhttprequest_activex_ie/
      // http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
      // http://msdn.microsoft.com/en-us/library/windows/desktop/ms763742(v=vs.85).aspx
      try { rawRequest = new ActiveXObject("MSXML2.XMLHTTP.6.0");  } catch(e) {}
      try { if (!rawRequest) rawRequest = new ActiveXObject("MSXML2.XMLHTTP");  } catch(e) {}
    }

    return rawRequest;
  },

  /**
    @private

    Called by the XHR when it responds with some final results.

    @param {XMLHttpRequest} rawRequest the actual request
    @returns {Boolean} true if completed, false otherwise
  */
  finishRequest: function(evt) {
    var listener, listeners, listenersForKey,
      rawRequest = this.get('rawRequest'),
      readyState = rawRequest.readyState,
      request;

    if (readyState === 4 && !this.get('timedOut')) {
      this.receive(function(proceed) {
        if (!proceed) { return; }

        // collect the status and decide if we're in an error state or not
        var status = rawRequest.status || 0;
        // IE mangles 204 to 1223. See http://bugs.jquery.com/ticket/1450 and many others
        status = status === 1223 ? 204 : status;

        // if there was an error - setup error and save it
        if ((status < 200) || (status >= 300)) {
          this.set('isError', true);
          this.set('errorObject', SC.$error(rawRequest.statusText || "HTTP Request failed", "Request", status));
        }

        // set the status - this will trigger changes on related properties
        this.set('status', status);
      }, this);

      // Avoid memory leaks
      if (platform.get('supportsXHR2ProgressEvent')) {
        // XMLHttpRequest Level 2

        if (platform.get('supportsXHR2LoadEndEvent')) {
          SCEvent.remove(rawRequest, 'loadend', this, this.finishRequest);
        } else {
          SCEvent.remove(rawRequest, 'load', this, this.finishRequest);
          SCEvent.remove(rawRequest, 'error', this, this.finishRequest);
          SCEvent.remove(rawRequest, 'abort', this, this.finishRequest);
        }

        request = this.get('request');
        listeners = request.get("listeners");
        if (listeners) {
          for (var key in listeners) {

            // Make sure the key is not an HTTP numeric status code.
            if (isNaN(parseInt(key, 10))) {
              listenersForKey = listeners[key];
              for (var i = 0, len = listenersForKey.length; i < len; i++) {
                listener = listenersForKey[i];

                var keyTarget = key.split('.');
                if (SC.none(keyTarget[1])) {
                  SCEvent.remove(rawRequest, keyTarget[0], listener.target, listener.action, listener.args);
                } else {
                  SCEvent.remove(rawRequest[keyTarget[0]], keyTarget[1], listener.target, listener.action, listener.args);
                }
              }
            }
          }
        }
      } else if (window.XMLHttpRequest && rawRequest.addEventListener) {
        // XMLHttpRequest Level 1 + support for addEventListener (IE prior to version 9.0 lacks support for addEventListener)
        SCEvent.remove(rawRequest, 'readystatechange', this, this.finishRequest);
      } else {
        rawRequest.onreadystatechange = null;
      }

      return true;
    }
    return false;
  }

});
