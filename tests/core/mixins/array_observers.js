import { SC } from '../../../core/core.js';


module("SC.Array mixin - Array observers");

(function(root) {
  test("notifies entire array has changed when arrayContentDidChange() is called with no arguments", function() {
    var content = [1, 2, 3, 4, 5];
    var start, added, removed;

    content.addArrayObservers({
      didChange: function(s, r, a) {
        start = s;
        added = a;
        removed = r;
      }
    });

    content.arrayContentDidChange();

    assert.equal(start, 0, "change starts at index 0");
    assert.equal(removed, 5, "five items were removed");
    assert.equal(added, 0, "zero items were added");
  });

})(this);
