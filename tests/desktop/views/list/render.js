// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global CoreTest, module, test */

import { SC } from "../../../../core/core.js";
import { run } from "../../../../core/system/runloop.js";
import { ListView } from "../../../../desktop/desktop.js";
import { ListItemView } from "../../../../desktop/views/list_item.js";
import { CoreTest } from '../../../../testing/core.js';
import { Pane } from "../../../../view/view.js";
// LOG_BINDINGS = true;
// LOG_DEFERRED_CALLS = true;

var view, content, pane;

var renderFunc = CoreTest.stub("render", function () {
  ListItemView.prototype.render.apply(this, arguments);
});

module("ListView.render", {

  beforeEach: function () {
    run(function () {
      content = "1 2 3 4 5 6 7 8 9 10".w().map(function (x) {
        return SC.Object.create({ value: x });
      });

      view = ListView.create({
        content: content,

        layout: { top: 0, left: 0, width: 300, height: 500 },

        layoutForContentIndex: function (idx) {
          return { left: 0, right: 0, top: idx * 50, height: 50 };
        },

        _cv_nowShowingDidChange: CoreTest.stub("_cv_nowShowingDidChange", function () {
          ListView.prototype._cv_nowShowingDidChange.apply(this, arguments);
        }),

        exampleView: ListItemView.extend({
          render: renderFunc
        }),

        // reset stubs
        reset: function () {
          this._cv_nowShowingDidChange.reset();
          renderFunc.reset();
        }

      });

      pane = Pane.create({
        layout: { width: 200, height: 400 }
      });
      pane.appendChild(view);
      pane.append();
    });
  },

  afterEach: function () {
    run(function () {
      view.reset();
      pane.remove();
      pane.destroy();
    });
  }

});

// ..........................................................
// BASIC TESTS
//

test("list item render() should only be called once per item view a static content array", function (assert) {
  renderFunc.expect(10);
});

test("_cv_nowShowingDidChange() should only be called once with a static content array", function (assert) {
  view._cv_nowShowingDidChange.expect(3); // currently is 3... could it be once?
});
