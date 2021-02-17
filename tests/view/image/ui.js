// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test ok equals stop */
import { ControlTestPane } from '../test_support/control_test_pane.js';
import { ImageView, View } from '../../../view/view.js';

// NOTE: it is a bit annoying that ImageView tests depend on LabelView...

(function () {
  // var logoURL = sc_static('test-image.png');
  var logoURL = "../../resources/test-image.png";

  var pane = ControlTestPane.design()
    .add("image_loaded", ImageView, {
      value: logoURL,
      layout : { width: 200, height: 300 },
      useImageQueue: false,
      useCanvas: false
    })
    .add('sprite_image', ImageView, {
      layout: { width: 200, height: 300 },
      value: 'sprite-class',
      useCanvas: false
    })
    .add('sprite_image_canvas', ImageView, {
      layout: { width: 200, height: 300 },
      value: 'sprite-class'
      // Must use default calculated-property version of useCanvas.
    })
    .add('image_canvas', ImageView, {
      layout: { width: 200, height: 300 },
      useCanvas: true,
      value: logoURL
    })
    .add('canvas_not_loaded', ImageView, {
      layout: { width: 200, height: 300 },
      useCanvas: true
    })
    .add("image_not_loaded", ImageView, {
      value: null,
      layout : { width: 200, height: 300 },
      useCanvas: false
    })
    .add("empty_image", ImageView, {
      value: null,
      layout : { width: 200, height: 300 }
    })
    .add('image_holder', View, {
      layout: { width: 200, height: 200 }
    });

  module('ImageView ui', pane.standardSetup());

  test("Verify that all the rendering properties of an image that is being loaded are correct", function (assert) {
    var imageView = pane.view('image_not_loaded'),
        url;

    assert.ok(imageView.get('isVisibleInWindow'), 'image_not_loaded is visible in window');

    run(function () {
      imageView.set('value', logoURL);
    });
    assert.ok(imageView.get('status') !== IMAGE_STATE_LOADED, 'PRECOND - status should not be loaded (status=%@)'.fmt(imageView.get('status')));
    assert.ok(imageView.get('status') === IMAGE_STATE_LOADING, 'PRECOND - status should be loading (status=%@)'.fmt(imageView.get('status')));

    url = imageView.$('img').attr('src');
    assert.ok((url.indexOf('base64')!=-1) || (url.indexOf('blank.gif')!=-1), "The src should be blank URL. url = %@".fmt(url));
  });

  test("Verify that all the rendering properties of an image that is loaded are correct", function (assert) {
    var imageView = pane.view('image_loaded'),
        imgEl;

    assert.ok(imageView.get('isVisibleInWindow'), 'image_loaded is visible in window');

    imageView.addObserver('status', this, function () {
      assert.equal(IMAGE_STATE_LOADED, imageView.get('status'), 'status should be loaded');

      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function () {
        imgEl = imageView.$('img');
        assert.ok(imgEl.attr('src').indexOf(logoURL) !== 0, "img src should be set to logoURL");

        window.start(); // continue the tests
        }, 100);
    });

    stop();
  });

  test("Verify that the tooltip is correctly being set as both the title and attribute (disabling localization for this test)", function (assert) {
    var imageView = pane.view('image_loaded'),
        testToolTip = 'This is a test tooltip',
        imgEl;

    run(function () {
      imageView.set('localization', false);
      imageView.set('toolTip', testToolTip);
    });

    imageView.addObserver('status', this, function () {
      setTimeout(function () {
        imgEl = imageView.$('img');
        assert.equal(imgEl.attr('title'), testToolTip, "title attribute");
        assert.equal(imgEl.attr('alt'), testToolTip, "alt attribute");

        window.start(); // continue the tests
      }, 100);
    });

    stop();
  });


  test("Verify canvas rendering and properties", function (assert) {
    var view = pane.view('image_canvas'),
        canvasEl = view.$();

    assert.equal(canvasEl.attr('width'), 200, "The width of the canvas element should be set");
    assert.equal(canvasEl.attr('height'), 300, "The height of the canvas element should be set");
  });

  test("Using imageQueue", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView1,
        imageView2,
        lastMod1,
        lastMod2;

    stop();

    // Only allow 1 image at a time
    imageQueue.loadLimit = 1;

    // Add a random value so that the images appear as unique
    lastMod1 = Math.round(Math.random() * 100000);
    lastMod2 = Math.round(Math.random() * 100000);

    // Set the first view to load in the background (ie. it should load last although it was created first)
    imageView1 = ImageView.create({
      value: logoURL + "?lastmod=" + lastMod1,
      canLoadInBackground: true
    });
    imageView2 = ImageView.create({
      value: logoURL + "?lastmod=" + lastMod2,
      canLoadInBackground: false
    });

    // The second image should load first and the first not be loaded yet
    imageView2.addObserver('status', this, function () {
      assert.equal(imageView2.get('status'), IMAGE_STATE_LOADED, 'imageView2 status on imageView2 status change');
      assert.equal(imageView1.get('status'), IMAGE_STATE_LOADING, 'imageView1 status on imageView2 status change');
    });

    imageView1.addObserver('status', this, function () {
      assert.equal(imageView2.get('status'), IMAGE_STATE_LOADED, 'imageView2 status on imageView1 status change');
      assert.equal(imageView1.get('status'), IMAGE_STATE_LOADED, 'imageView1 status on imageView1 status change');

      window.start(); // starts the test runner
    });

    imageHolder.appendChild(imageView1);
    imageHolder.appendChild(imageView2);
  });

  function testScale(imageView, isImg) {
    stop();

    // Default is FILL
    imageView.addObserver('status', this, function () {

      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function () {
        var imgEl,
            innerFrame,
            testImg = !imageView.get('useCanvas');

        // Default is FILL
        innerFrame  = imageView.get('innerFrame');
        assert.equal(innerFrame.width, 588, "FILL width");
        assert.equal(innerFrame.height, 90, "FILL height");
        if (testImg) {
          imgEl = imageView.$('img');

          assert.equal(imgEl.css('width'), "588px", "FILL width");
          assert.equal(imgEl.css('height'), "90px", "FILL height");
        }

        run(function () {
          imageView.set('scale', SCALE_falseNE);
        });

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.width, 271, "SCALE_falseNE width");
        assert.equal(innerFrame.height, 60, "SCALE_falseNE height");
        if (testImg) {
          assert.equal(imgEl.css('width'), "271px", "SCALE_falseNE width");
          assert.equal(imgEl.css('height'), "60px", "SCALE_falseNE height");
        }

        run(function () {
          imageView.set('scale', BEST_FILL);
        });

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.width, 588, "BEST_FILL width");
        assert.equal(innerFrame.height, 130, "BEST_FILL height");
        if (testImg) {
          assert.equal(imgEl.css('width'), "588px", "BEST_FILL width");
          assert.equal(imgEl.css('height'), "130px", "BEST_FILL height");
        }

        run(function () {
          imageView.set('scale', BEST_FIT);
        });

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.width, 407, "BEST_FIT width");
        assert.equal(innerFrame.height, 90, "BEST_FIT height");
        if (testImg) {
          assert.equal(imgEl.css('width'), "407px", "BEST_FIT width");
          assert.equal(imgEl.css('height'), "90px", "BEST_FIT height");
        }

        run(function () {
          imageView.set('scale', BEST_FIT_DOWN_ONLY);
        });

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.width, 271, "BEST_FIT_DOWN_ONLY width (larger frame)");
        assert.equal(innerFrame.height, 60, "BEST_FIT_DOWN_ONLY height (larger frame)");
        if (testImg) {
          assert.equal(imgEl.css('width'), "271px", "BEST_FIT_DOWN_ONLY width (larger frame)");
          assert.equal(imgEl.css('height'), "60px", "BEST_FIT_DOWN_ONLY height (larger frame)");
        }

        run(function () {
          if (!imageView.get('useStaticLayout')) {
            imageView.set('layout', { top: 0, left: 0, width: 147, height: 90 });

            innerFrame = imageView.get('innerFrame');
            assert.equal(innerFrame.width, 147, "BEST_FIT_DOWN_ONLY width (smaller size frame)");
            assert.equal(innerFrame.height, 33, "BEST_FIT_DOWN_ONLY height (smaller size frame)");
            if (testImg) {
              assert.equal(imgEl.css('width'), "147px", "BEST_FIT_DOWN_ONLY width (smaller size frame)");
              assert.equal(imgEl.css('height'), "33px", "BEST_FIT_DOWN_ONLY height (smaller size frame)");
            }
          }
        });


        window.start(); // starts the test runner
      }, 150);
    });
  }

  test("Scaling images (img)", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 271x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      layout: { top: 0, left: 0, width: 588, height: 90 },
      useCanvas: false
    });

    testScale(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("Scaling images (img) with static layout", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 271x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      // layout: { top: 0, left: 0, width: 588, height: 90 },
      useCanvas: false,
      useStaticLayout: true,

      render: function (context) {
        context.setStyle({ width: 588, height: 90 });

        sc_super();
      }
    });

    testScale(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("Scaling images (canvas)", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 271x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      layout: { top: 0, left: 0, width: 588, height: 90 }
    });

    testScale(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("Scaling images (canvas) with static layout", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 271x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      useStaticLayout: true,

      render: function (context) {
        context.setStyle({ width: 588, height: 90 });

        sc_super();
      }
    });

    testScale(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  function testAlign(imageView) {
    stop();

    // Default is FILL
    imageView.addObserver('status', this, function () {
      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function () {
        var imgEl,
            innerFrame,
            testImg = !imageView.get('useCanvas');

        // Default is ALIGN_CENTER
        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 30, "ALIGN_CENTER top");
        assert.equal(innerFrame.x, 158.5, "ALIGN_CENTER left");
        if (testImg) {
          imgEl = imageView.$('img');
          assert.equal(imgEl.css('top'), "30px", "ALIGN_CENTER top");
          assert.equal(imgEl.css('left'), "159px", "ALIGN_CENTER left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_TOP_LEFT);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 0, "ALIGN_TOP_LEFT top");
        assert.equal(innerFrame.x, 0, "ALIGN_TOP_LEFT left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "0px", "ALIGN_TOP_LEFT top");
          assert.equal(imgEl.css('left'), "0px", "ALIGN_TOP_LEFT left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_TOP);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 0, "ALIGN_TOP top");
        assert.equal(innerFrame.x, 158.5, "ALIGN_TOP left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "0px", "ALIGN_TOP top");
          assert.equal(imgEl.css('left'), "159px", "ALIGN_TOP left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_TOP_RIGHT);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 0, "ALIGN_TOP_RIGHT top");
        assert.equal(innerFrame.x, 317, "ALIGN_TOP_RIGHT left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "0px", "ALIGN_TOP_RIGHT top");
          assert.equal(imgEl.css('left'), "317px", "ALIGN_TOP_RIGHT left");
        }
        RunLoop.begin();
        imageView.set('align', ALIGN_RIGHT);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 30, "ALIGN_RIGHT top");
        assert.equal(innerFrame.x, 317, "ALIGN_RIGHT left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "30px", "ALIGN_RIGHT top");
          assert.equal(imgEl.css('left'), "317px", "ALIGN_RIGHT left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_BOTTOM_RIGHT);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 60, "ALIGN_BOTTOM_RIGHT top");
        assert.equal(innerFrame.x, 317, "ALIGN_BOTTOM_RIGHT left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "60px", "ALIGN_BOTTOM_RIGHT top");
          assert.equal(imgEl.css('left'), "317px", "ALIGN_BOTTOM_RIGHT left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_BOTTOM);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 60, "ALIGN_BOTTOM top");
        assert.equal(innerFrame.x, 158.5, "ALIGN_BOTTOM left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "60px", "ALIGN_BOTTOM top");
          assert.equal(imgEl.css('left'), "159px", "ALIGN_BOTTOM left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_BOTTOM_LEFT);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 60, "ALIGN_BOTTOM_LEFT top");
        assert.equal(innerFrame.x, 0, "ALIGN_BOTTOM_LEFT left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "60px", "ALIGN_BOTTOM_LEFT top");
          assert.equal(imgEl.css('left'), "0px", "ALIGN_BOTTOM_LEFT left");
        }

        RunLoop.begin();
        imageView.set('align', ALIGN_LEFT);
        RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        assert.equal(innerFrame.y, 30, "ALIGN_LEFT top");
        assert.equal(innerFrame.x, 0, "ALIGN_LEFT left");
        if (testImg) {
          assert.equal(imgEl.css('top'), "30px", "ALIGN_LEFT top");
          assert.equal(imgEl.css('left'), "0px", "ALIGN_LEFT left");
        }

        window.start(); // starts the test runner
      }, 100);
    });
  }

  test("Aligning images (img)", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 294x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      layout: { top: 0, left: 0, width: 588, height: 120 },
      useCanvas: false,
      scale: SCALE_falseNE
    });

    testAlign(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("Aligning images (img) with static layout", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 294x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      layout: { top: 0, left: 0, width: 588, height: 120 },
      useCanvas: false,
      useStaticLayout: true,
      scale: SCALE_falseNE
    });

    testAlign(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("Aligning images (canvas)", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 294x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      layout: { top: 0, left: 0, width: 588, height: 120 },
      scale: SCALE_falseNE
    });

    testAlign(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("Aligning images (canvas) with static layout", function (assert) {
    var imageHolder = pane.view('image_holder'),
        imageView;

    // The logo is 294x60
    imageView = ImageView.create({
      value: logoURL + "?lastmod=" + Math.round(Math.random() * 100000),
      layout: { top: 0, left: 0, width: 588, height: 120 },
      useStaticLayout: true,
      scale: SCALE_falseNE
    });

    testAlign(imageView);

    run(function () {
      imageHolder.appendChild(imageView);
    });
  });

  test("CSS class is applied for ImageView using a sprite for value", function (assert) {
    var view = pane.view('sprite_image'),
        viewElem = view.$('img');

    assert.ok(viewElem.hasClass('sprite-class'), "element given correct class");

    run(function () {
      view.set('value', 'another-sprite');
    });

    assert.ok(!viewElem.hasClass('sprite-class'), "When value changed, element has old class removed");
    assert.ok(viewElem.hasClass('another-sprite'), "When value changed, element has new class added");

    run(function () {
      view.set('value', null);
    });

    viewElem = view.$('img');
    assert.ok(!viewElem.hasClass('another-sprite'), "When value removed, element has old class removed");
  });

  test("CSS class is applied for ImageView using a sprite for value while using canvas", function (assert) {
    var view = pane.view('sprite_image_canvas'),
        viewElem = view.$();

    assert.ok(viewElem.hasClass('sprite-class'), "element given correct class");

    run(function () {
      view.set('value', 'another-sprite');
    });

    assert.ok(!viewElem.hasClass('sprite-class'), "When value changed, element has old class removed");
    assert.ok(viewElem.hasClass('another-sprite'), "When value changed, element has new class added");

    run(function () {
      view.set('value', null);
    });

    viewElem = view.$();
    assert.ok(!viewElem.hasClass('another-sprite'), "When value removed, element has old class removed");
  });


  test("Changing the type of image view updates the layer appropriately (with canvas)", function (assert) {
    var view = pane.view('canvas_not_loaded'),
      jqEl = view.$(),
      el = jqEl[0],
      jqImgEl,
      imgEl;

    assert.equal(el.innerHTML, '', "The empty image should have no inner HTML.");
    assert.equal(el.tagName, 'CANVAS', "The empty image should be a CANVAS");

    // Set a sprite value.
    run(function () {
      view.set('value', 'sprite-class');
    });

    jqEl = view.$();

    assert.ok(jqEl.hasClass('sprite-class'), "The sprite image should have sprite-class class.");
    assert.equal(el.innerHTML, '', "The sprite image should have no inner HTML.");

    // Set a URL value.
    run(function () {
      view.set('value', logoURL);
    });

    jqEl = view.$();
    el = jqEl[0];

    assert.ok(!jqEl.hasClass('sprite-class'), "The url image should no longer have sprite-class class.");
    assert.equal(el.innerHTML, '', "The url image should have no inner HTML.");
    assert.equal(el.tagName, 'CANVAS', "The url image should be a CANVAS");
  });

  test("Changing the type of image view updates the layer appropriately (without canvas)", function (assert) {
    var view = pane.view('image_not_loaded'),
      jqEl = view.$('img'),
      el = jqEl[0],
      jqImgEl,
      imgEl;
    
    assert.ok(!jqEl.attr('class'), "The empty image should have no class.");
    assert.equal(el.tagName, 'IMG', "The empty image should be a IMG");

    // Set a sprite value.
    run(function () {
      view.set('value', 'sprite-class');
    });

    jqEl = view.$('img');

    assert.ok(jqEl.hasClass('sprite-class'), "The sprite image should have sprite-class class.");

    // Set a URL value.
    run(function () {
      view.set('value', logoURL);
    });

    jqEl = view.$('img');

    assert.ok(!jqEl.hasClass('sprite-class'), "The url image should no longer have sprite-class class.");
  });
})();

