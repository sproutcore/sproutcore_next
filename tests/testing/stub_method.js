import { CoreTest } from '../../testing/testing.js';
module('CoreQuery.stubMethod');

test('returns a set value when the stubbed method is called', function() {
  var object = {method: function() {}};
  var value = 'something';
  CoreTest.stubMethod(object, 'method').andReturn(value);

  assert.equal(object.method(), value, 'returns a set value when the stubbed method is called');
});
