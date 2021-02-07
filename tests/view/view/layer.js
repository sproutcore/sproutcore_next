// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, context, ok, same, precondition */

// falseTE: it is very important to make sure that the layer is not created
// until the view is actually visible in the window.
import { SC } from '../../../core/core.js';
import { View, Pane } from '../../../view/view.js';


module("View#layer");

test("returns null if the view has no layer and no parent view", function (assert) {
  var view = View.create() ;
  assert.equal(view.get('parentView'), null, 'precond - has no parentView');
  assert.equal(view.get('layer'), null, 'has no layer');
});

test("returns null if the view has no layer and parent view has no layer", function (assert) {
  var parent = View.create({
     childViews: [ View.extend() ]
  });
  var view = parent.childViews[0];

  assert.equal(view.get('parentView'), parent, 'precond - has parent view');
  assert.equal(parent.get('layer'), null, 'parentView has no layer');
  assert.equal(view.get('layer'), null, ' has no layer');
});

test("returns layer if you set the value", function (assert) {
  var view = View.create();
  assert.equal(view.get('layer'), null, 'precond- has no layer');

  var dom = document.createElement('div');
  view.set('layer', dom);

  assert.equal(view.get('layer'), dom, 'now has set layer');

  dom = null;
});

var parent, child, parentDom, childDom ;
module("View#layer - autodiscovery", {
  beforeEach: function() {

    parent = View.create({
       childViews: [ View.extend({
         // redefine this method in order to isolate testing of layer prop.
         // simple version just returns firstChild of parentLayer.
         findLayerInParentLayer: function(parentLayer) {
           return parentLayer.firstChild;
         }
       }) ]
    });
    child = parent.childViews[0];

    // setup parent/child dom
    parentDom = document.createElement('div');
    childDom = document.createElement('div');
    parentDom.appendChild(childDom);

    // set parent layer...
    parent.set('layer', parentDom);
  },

  afterEach: function() {
    parent = child = parentDom = childDom = null ;
  }
});

test("discovers layer if has no layer but parent view does have layer", function (assert) {
  assert.equal(parent.get('layer'), parentDom, 'precond - parent has layer');
  assert.ok(!!parentDom.firstChild, 'precond - parentDom has first child');

  assert.equal(child.get('layer'), childDom, 'view discovered child');
});

test("once its discovers layer, returns the same element, even if you remove it from the parent view", function (assert) {
  assert.equal(child.get('layer'), childDom, 'precond - view discovered child');
  parentDom.removeChild(childDom) ;

  assert.equal(child.get('layer'), childDom, 'view kept layer cached (i.e. did not do a discovery again)');
});

module("View#layer - destroying");

// test("returns null again if it has layer and layer is destroyed");

// test("returns null again if parent view's layer is destroyed");

var pane, view ;
module("View#$", {
  beforeEach: function() {
    pane = Pane.design()
      .childView(View.design({
        render: function(context, firstTime) {
          context.push('<span></span>');
        }
      })).create();

    view = pane.childViews[0];

    SC.RunLoop.begin();
    pane.append(); // add to create layer...
    SC.RunLoop.end();
  },

  afterEach: function() {
    SC.RunLoop.begin();
    pane.remove();
    SC.RunLoop.end();
  }
});

test("returns an empty CQ object if no layer", function (assert) {
  var v = View.create();
  assert.ok(!v.get('layer'), 'precond - should have no layer');
  assert.equal(v.$().length, 0, 'should return empty CQ object');
  assert.equal(v.$('span').length, 0, 'should return empty CQ object even if filter passed');
});

test("returns CQ object selecting layer if provided", function (assert) {
  assert.ok(view.get('layer'), 'precond - should have layer');

  var cq = view.$();
  assert.equal(cq.length, 1, 'view.$() should have one element');
  assert.equal(cq.get(0), view.get('layer'), 'element should be layer');
});

test("returns CQ object selecting element inside layer if provided", function (assert) {
  assert.ok(view.get('layer'), 'precond - should have layer');

  var cq = view.$('span');
  assert.equal(cq.length, 1, 'view.$() should have one element');
  assert.equal(cq.get(0).parentNode, view.get('layer'), 'element should be in layer');
});

test("returns empty CQ object if filter passed that does not match item in parent", function (assert) {
  assert.ok(view.get('layer'), 'precond - should have layer');

  var cq = view.$('body'); // would normally work if not scoped to view
  assert.equal(cq.length, 0, 'view.$(body) should have no elements');
});

var parentView;

module("Notifies that layer has changed whenever re-render", {

  beforeEach: function () {
    parentView = View.create({
      childViews: ['a', 'b', View],

      containerLayer: function () {
        return this.$('._wrapper')[0];
      }.property('layer').cacheable(),

      a: View,
      b: View,

      render: function (context) {
        context = context.begin().addClass('_wrapper');
        this.renderChildViews(context);
        context = context.end();
      }
    });
  },

  afterEach: function () {
    parentView.destroy();
    parentView = null;
  }

});

/**
  If the containerLayer property is cached, then when the view re-renders and the original container layer
  element is lost, the containerLayer property will be invalid.  Instead, whenever the view updates,
  we have to indicate that the 'layer' property has changed.
  */
test("containerLayer should be able to be dependent on layer so that it invalidates when updated", function (assert) {
  var containerLayer;

  // Render the parent view and attach.
  parentView.createLayer();
  parentView._doAttach(document.body);

  // Get the container layer.
  containerLayer = parentView.get('containerLayer');

  // Rerender the view.
  SC.run(function () {
    parentView.displayDidChange();
  });

  assert.ok(containerLayer !== parentView.get('containerLayer'), "The container layer should not be the same anymore.");
});
