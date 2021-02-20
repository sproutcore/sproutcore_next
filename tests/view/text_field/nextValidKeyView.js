// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */

import { SC } from '../../../core/core.js';
import { TextFieldView, Pane, View } from '../../../view/view.js';

var pane, textfield_view1, textfield_view2, textfield_view3, view1, view2, view3, view4, view5;

var OLD;
    
module("View#nextValidKeyView", {
  beforeEach: function() {
    SC.RunLoop.begin();
    
    pane = Pane.design()
    .layout({ top: 0, left: 0, bottom:0, right: 0 })
    .childView(TextFieldView.design())
    .childView(View.design())
    .childView(View.design()
      .childView(View.design()
        .childView(View.design()
          .childView(View.design()
            .childView(TextFieldView.design())
          )
        )
      )
    )
    .childView(View.design())
    .childView(View.design())
    .childView(View.design())
    .childView(View.design()
      .childView(TextFieldView.design())
    )
    .childView(View.design())
    .create();
    pane.append();
    SC.RunLoop.end();
    
    textfield_view1 = pane.childViews[0];
    textfield_view2 = pane.childViews[2].childViews[0].childViews[0].childViews[0].childViews[0];
    textfield_view3 = pane.childViews[6].childViews[0];
    view1 = pane.childViews[1];
    view2 = pane.childViews[3]; 
    view3 = pane.childViews[4];
    view4 = pane.childViews[5];
    view5 = pane.childViews[7];
    
    OLD = {
      FOCUS_ALL_CONTROLS: SC.getSetting('FOCUS_ALL_CONTROLS'),
      TABBING_ONLY_INSIDE_DOCUMENT: SC.getSetting('TABBING_ONLY_INSIDE_DOCUMENT')
    };

    // FOCUS_ALL_CONTROLS = FOCUS_ALL_CONTROLS;
    SC.setSetting('TABBING_ONLY_INSIDE_DOCUMENT', false);
    
  },
  

  afterEach: function() { 
    
    // restore old settings
    SC.setSetting('FOCUS_ALL_CONTROLS', OLD.FOCUS_ALL_CONTROLS);
    SC.setSetting('TABBING_ONLY_INSIDE_DOCUMENT', OLD.TABBING_ONLY_INSIDE_DOCUMENT);

    SC.RunLoop.begin();
    pane.remove();
    pane = textfield_view1 = textfield_view2 = textfield_view3 = view1 = view2 = view3 = null;
    SC.RunLoop.end();
  }
});

test("Navigate between textfields- going forward", function (assert) {
  SC.setSetting('FOCUS_ALL_CONTROLS', true);
  SC.setSetting('TABBING_ONLY_INSIDE_DOCUMENT', false);
  
  var v = view2.nextValidKeyView();
  assert.deepEqual(v, textfield_view3, "The next view should be " + textfield_view3.toString());
  
  v = textfield_view3.nextValidKeyView();
  assert.deepEqual(v, null, "The next view should be null");
});

test("Navigate between textfields- going backwards", function (assert) {
  SC.setSetting('FOCUS_ALL_CONTROLS', true);
  var v = view2.previousValidKeyView();
  assert.deepEqual(v, textfield_view2, "The previous key view should be " + textfield_view2.toString());

});


test("Navigate forward with view that have a nextKeyView set", function (assert) {
  SC.setSetting('FOCUS_ALL_CONTROLS', true);
  var v = view2.nextValidKeyView();
  assert.deepEqual(v, textfield_view3, "The next view should be " + textfield_view3.toString());
  view3.set('nextKeyView', textfield_view1);
  v = view2.nextValidKeyView();
  assert.deepEqual(v, textfield_view1, "The next view should be " + textfield_view1.toString());
});


test("Navigate backwards with view that have a previousKeyView set", function (assert) {
  SC.setSetting('FOCUS_ALL_CONTROLS', true);
  var v = view2.previousValidKeyView();
  assert.deepEqual(v, textfield_view2, "The next view should be " + textfield_view2.toString());
  view4.set('previousKeyView', textfield_view1);
  v = textfield_view3.previousValidKeyView();
  assert.deepEqual(v, textfield_view1, "The next view should be " + textfield_view1.toString());
});
