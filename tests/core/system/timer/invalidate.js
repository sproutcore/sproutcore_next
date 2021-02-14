// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// Timer Tests
// ========================================================================
/*globals module test ok isObj equals expects */

// import { SC } from '../../../../core/core.js';
import { SC } from '../../../../core/core.js';


/**
  Exercises timer invalidation on the Timer class.
*/
module("Timer.invalidate") ;

/**
  A timer scheduled and then invalidated before the end of the run loop should 
  not fire.
  
  @author Erich Ocean
  @since 6e7becdfb4e7f22b340eb5e6d7f3b4df4ea65060
*/
test("invalidate immediately should never execute", function (assert) {
  
  var fired = false ;
  
  SC.RunLoop.begin() ;
  var start = SC.RunLoop.currentRunLoop.get('startTime') ;
  var t = SC.Timer.schedule({
    target: this,
    action: function() { fired = true ; },
    interval: 100
  });
  t.invalidate() ;
  SC.RunLoop.end() ;
  
  const cb = assert.async();
  assert.timeout(2500);
  // stop(2500) ; // stops the test runner, fails after 2500ms
  setTimeout(function() {
    assert.equal(false, fired) ;
    // window.start() ; // starts the test runner
    cb();
  }, 1500);
  
});
