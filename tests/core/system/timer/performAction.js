// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// Timer Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

import { SC } from '../../../../core/core.js';

var objectA, objectB, object;

module("Timer.fireTime + Timer.performAction ",{
  	beforeEach: function() {
    	objectA = {} ;
    	objectB = {} ;
		
		object = SC.Object.create({			
			performActionProp:'',
		  	callAction:function(){
		    	this.set('performActionProp','performAction');
		    }	
		});	
  	}

});

test("performAction() should call the specified method ", function (assert) {
	var timerObj;
    timerObj = SC.Timer.create(); //created a timer object
 	timerObj.action = object.callAction();	
	timerObj.performAction();
	assert.equal('performAction',object.performActionProp);
});



test("fireTime() should return the next time the timer should fire", function (assert) {
	var timerObj;	
	
	timerObj = SC.Timer.create();

	assert.equal(-1,timerObj.fireTime(),'for isValid true');	
	assert.equal(-1,timerObj.fireTime(),'for startTime not set');	
	
	timerObj.startTime = 10;
	timerObj.interval = 10;	
	timerObj.lastFireTime = 5;
	assert.equal(20,timerObj.fireTime(),'next fire time');	
	
});

test("fire() should call the action", function (assert) {
	const cb = assert.async();
	var count = 0;
	SC.RunLoop.begin() ;
	var start = SC.RunLoop.currentRunLoop.get('startTime') ;
	var t = SC.Timer.schedule({
		target: this,
		action: function() {
			count++;
		},
		interval: 100
	});
	t.fire();
	SC.RunLoop.end() ;
	// stop(2500) ; // stops the test runner, fails after 2500ms
	setTimeout(function() {
		assert.equal(2, count) ;
		// window.start() ; // starts the test runner
		cb();
		}, 1500);
});



