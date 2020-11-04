// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, ok, assert.equal, assert.deepEqual, test */

import { SC } from '../../../core/core.js';

// test parsing of query string
var v = [];
module("SC.compare()", {
  beforeEach: function() {
    // setup dummy data
    v[0]  = null;
    v[1]  = false;
    v[2]  = true;
    v[3]  = -12;
    v[4]  = 3.5;
    v[5]  = 'a string';
    v[6]  = 'another string';
    v[7]  = 'last string';
    v[8]  = [1,2];
    v[9]  = [1,2,3];
    v[10] = [1,3];
    v[11] = {a: 'hash'};
    v[12] = SC.Object.create();
    v[13] = function (a) {return a;};
  }
});


// ..........................................................
// TESTS
//

test("ordering should work", function(assert) {
  var j;
  for (j=0; j < v.length; j++) {
    assert.equal(SC.compare(v[j],v[j]), 0, j +' should equal itself');
    var i;
    for (i=j+1; i < v.length; i++) {
      assert.equal(SC.compare(v[j],v[i]), -1, 'v[' + j + '] (' + SC.typeOf(v[j]) + ') should be smaller than v[' + i + '] (' + SC.typeOf(v[i]) + ')' );
    }

  }
});

