// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals throws */

import { SC, GLOBAL } from '../../../../core/core.js';

var root, content, controller, extra, flattened;

var TestObject = SC.Object.extend({
  toString: function() { return "TestObject(%@)".fmt(this.get('title')); }
});


module("TreeController - tree_case", {
  beforeEach: function() {
    
    // setup a basic tree 
    content = [
      TestSC.Object.create({
        title: "A",
        isExpanded: true,
        outline: 0,
        
        children: [
          TestSC.Object.create({ title: "A.i", outline: 1 }),

          TestSC.Object.create({ title: "A.ii",
            outline: 1,
            isExpanded: false,
            children: [
              TestSC.Object.create({ title: "A.ii.1", outline: 2 }),
              TestSC.Object.create({ title: "A.ii.2", outline: 2 }),
              TestSC.Object.create({ title: "A.ii.3", outline: 2 })]
          }),

          TestSC.Object.create({ title: "A.iii", outline: 1 })]
      }),

      TestSC.Object.create({
        title: "B",
        isExpanded: true,
        outline: 0,
        children: [
          TestSC.Object.create({ title: "B.i",
            isExpanded: true,
            outline: 1,
            children: [
              TestSC.Object.create({ title: "B.i.1", outline: 2 }),
              TestSC.Object.create({ title: "B.i.2", outline: 2 }),
              TestSC.Object.create({ title: "B.i.3", outline: 2 })]
          }),

          TestSC.Object.create({ title: "B.ii", outline: 1 }),
          TestSC.Object.create({ title: "B.iii", outline: 1 })]
      }),

      TestSC.Object.create({
        outline: 0,
        title: "C"
      })];

    root = TestSC.Object.create({
      title: "ROOT",
      children: content,
      isExpanded: true
    });
    
    flattened = [
      content[0],
      content[0].children[0],
      content[0].children[1],
      content[0].children[2],
      content[1],
      content[1].children[0],
      content[1].children[0].children[0],
      content[1].children[0].children[1],
      content[1].children[0].children[2],
      content[1].children[1],
      content[1].children[2],
      content[2]];

    controller = SC.TreeController.create({ 
      content: root,
      treeItemChildrenKey: "children",
      treeItemIsExpandedKey: "isExpanded",
      treeItemIsGrouped: true 
    });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("arrangedObjects", function (assert) {
  assert.ok(controller.get('arangedObjects') !== controller, 'should have its own arrangedObjects');
  
  var ao = controller.get('arrangedObjects');
  assert.equal(ao.get('length'), flattened.get('length'), 'arrangedObjects should have expected length');
  
  var idx, len = flattened.get('length');
  for(idx=0;idx<len;idx++) {
    assert.equal(ao.objectAt(idx), flattened[idx], 'arrangedObjects.objectAt(%@) should be expected object in flattened[%@]'.fmt(idx,idx));
  }
});
