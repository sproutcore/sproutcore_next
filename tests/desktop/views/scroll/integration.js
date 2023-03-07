import { run } from "../../../../core/system/runloop.js";
import { ScrollView } from "../../../../desktop/desktop.js";
import { MainPane, View } from "../../../../view/view.js";

module("ScrollView integration");

test("should work with views that have static layout applied", function (assert) {
  var pane;
  try {
    run(function () {
      pane = MainPane.create({
        childViews: ['scrollView'],

        scrollView: ScrollView.design({
          layout: { width: 400, height: 600 },

          contentView: View.design({
            useStaticLayout: true
          })
        })
      });

      pane.append();
    });

    assert.ok(true, "displays scroll view without throwing an exception");
  } finally {
    if (pane) {
      run(function () {
        pane.remove();
      });
    }
  }
});
