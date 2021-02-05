// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok isObj equals expects */
import { SC, GLOBAL } from '../../../core/core.js';

// Note that these unit tests are calling SC.String.fmt directly, which has a different
// signature than String.prototype.fmt does.

module("String Formatting");
test("Passing ordered arguments", function() {
  assert.equal(SC.String.fmt("%@, %@%@", ["Hello", "World", "!"]), "Hello, World!");
});

test("Passing indexed arguments", function() {
  assert.equal(SC.String.fmt("%@2, %@3%@1", ["!", "Hello", "World"]), "Hello, World!");
});

test("Passing named arguments", function() {
  // NOTE: usually, "str".fmt() would be called. Because we are calling String.fmt,
  // which takes an array of arguments, we have to pass the arguments as an array.
  assert.equal(SC.String.fmt("%{first}, %{last}%{punctuation}", [
    { first: "Hello", last: "World", "punctuation": "!" }
  ]), "Hello, World!");
});

test("Passing named arguments with a SC.Object instance", function() {
  var t = SC.Object.create({
    prop: 'Hello',
    computedProp: function () {
      return 'World';
    }.property().cacheable(),
    unknownProperty: function (key, value) {
      if (key === "unknownProp") return "!";
    }
  });
  assert.equal(SC.String.fmt("%{prop}, %{computedProp}%{unknownProp}", [t]), "Hello, World!");
});

test("Passing incomplete named arguments", function() {
  assert.equal( SC.String.fmt("%{first}, %{last}%{punctuation}", [{first: 'Hello', punctuation: '!'}]), "Hello, %{last}!", "Formatting a string with an incomplete set of named arguments should leave unspecified named arguments in place." );
})

test("Passing arguments with formatters", function() {
  var F = function(value) {
    return "$" + value;
  };

  assert.equal(SC.String.fmt("%{number}", [{ number: 12, numberFormatter: F }]), "$12", "Formatter was applied");
});

test("Passing formatting strings with formatters", function() {
  var F = function(value, arg) {
    return "$" + value + ";" + arg;
  };

  assert.equal(SC.String.fmt("%{number:blah}", [{ number: 12, numberFormatter: F }]), "$12;blah", "Formatter was applied with argument");
});

// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same should_throw*/
var LocaleObject;

var defaultLocale;
module('SC.Object', {
  before: function() {
    // Cache the current locale.
    defaultLocale = SC.Locale.currentLocale;

    // Force it to English
    String.preferredLanguage = 'en';
    SC.Locale.currentLocale = SC.Locale.createCurrentLocale();

    LocaleObject = SC.Locale.create({
      init: function init (){
        init.base.apply(this, arguments);
        //hash of new languages
        var newLocales = { deflang: 'dl', empty: '' };

        //Added the new languages to the existing list of locales
        SC.Locale.addStrings(newLocales);
      }
    });
    this.currentLocale = LocaleObject;

    SC.stringsFor('English', {
      'Test': '%@',
      'Test.Multiple': '%@ %@'
    });

    SC.metricsFor('English', {
      'Button.left': 10,
      'Button.top': 20,
      'Button.width': 80,
      'Button.height': 30
    });
  },

  after: function () {
    // Return the current locale.
    SC.Locale.currentLocale = defaultLocale;
  }

});

test("'one two three'.w() => ['one','two','three']", function (assert) {
  assert.deepEqual('one two three'.w(), ['one','two','three'], "should be equal");
});

test("'one    two    three'.w() with extra spaces between words => ['one','two','three']", function (assert) {
  assert.deepEqual('one    two    three'.w(), ['one','two','three'], "should be equal");
});

test("Trim ' spaces on both sides '", function (assert) {
  assert.deepEqual(' spaces on both sides '.trim(), 'spaces on both sides', "should be equal");
});

test("Trim ' spaces on both sides ' on left only", function (assert) {
  assert.deepEqual(' spaces on both sides '.trimLeft(), 'spaces on both sides ', "should be equal");
});

test("Trim ' spaces on both sides ' on right only", function (assert) {
  assert.deepEqual(' spaces on both sides '.trimRight(), ' spaces on both sides', "should be equal");
});

test("Localize a string", function (assert) {
  //Based on the input passed it should return the default locale
  assert.equal("en".loc(), "en", "Using String.prototype.loc") ;
  assert.equal(SC.String.loc("en"), "en", "Using SC.String.loc");

  assert.equal("jp".locWithDefault("Japanese"), "Japanese", "Using String.prototype.locWithDefault") ;
  assert.equal(SC.String.locWithDefault("jp", "Japanese"), "Japanese", "Using SC.String.locWithDefault") ;

  assert.equal('deflang'.loc(), "dl", "Using String.prototype.loc") ;
  assert.equal(SC.String.loc('deflang'), "dl", "Using SC.String.loc") ;
});

test("Localize a string with mutliple parameters", function (assert) {

  assert.equal("Test".loc('parameter1'), 'parameter1', "Localizing with one parameter - using String.prototype.loc");
  assert.equal(SC.String.loc("Test", 'parameter1'), 'parameter1', "Localizing with one parameter - using SC.String.loc");

  assert.equal("Test.Multiple".loc('parameter1', 'parameter2'), 'parameter1 parameter2', "Localizing with multiple parameters - using String.prototype.loc");
  assert.equal(SC.String.loc("Test.Multiple", 'parameter1', 'parameter2'), 'parameter1 parameter2', "Localizing with multiple parameters - using SC.String.loc");
});

test("Localize a string with null or missing parameters", function (assert) {
  assert.equal("Test".loc(null), "null", "Localizing with null parameter - using String.prototype.loc");
  assert.equal(SC.String.loc("Test", null), "null", "Localizing with null parameter - using SC.String.loc");

  assert.equal("Test".loc(), "", "Localizing with missing parameter - using String.prototype.loc");
  assert.equal(SC.String.loc("Test"), "", "Localizing with missing parameter - using SC.String.loc");

  assert.equal("Test.Multiple".loc("p1", null), "p1 null", "Localizing multiple with null parameter - using String.prototype.loc");
  assert.equal(SC.String.loc("Test.Multiple", "p1", null), "p1 null", "Localizing with null parameter - using SC.String.loc");

  assert.equal("Test.Multiple".loc("p1"), "p1 ", "Localizing multiple with missing parameter - using String.prototype.loc");
  assert.equal(SC.String.loc("Test.Multiple", "p1"), "p1 ", "Localizing with missing parameter - using SC.String.loc");
});

test("Localize a string even if localized version is empty", function (assert) {
  assert.equal("empty".loc(), "", "Using String.prototype.loc");
  assert.equal(SC.String.loc("empty"), "", "Using SC.String.loc");

  assert.equal("empty".locWithDefault("Empty"), "", "Using String.prototype.locWithDefault");
  assert.equal(SC.String.locWithDefault("empty", "Empty"), "", "Using SC.String.locWithDefault");
});

test("Access a localized metric", function (assert) {
  assert.equal(10, "Button.left".locMetric());
  assert.equal(20, "Button.top".locMetric());
  assert.equal(undefined, "Button.notThere".locMetric());
});

test("Access a localized layout hash", function (assert) {
  // Simple case (if we ever get a full hash comparison function, we should use
  // it here).
  var layout = "Button".locLayout();
  assert.equal(10, layout.left);
  assert.equal(20, layout.top);
  assert.equal(80, layout.width);
  assert.equal(30, layout.height);
  assert.equal(undefined, layout.right);    // No localized key


  // Slightly more involved case:  allow the user to specify an additional hash.
  layout = "Button".locLayout({right:50});
  assert.equal(10, layout.left);
  assert.equal(20, layout.top);
  assert.equal(80, layout.width);
  assert.equal(30, layout.height);
  assert.equal(50, layout.right);    // No localized key


  // Sanity-check case:  Since we have both a localized key for 'left' and we'll
  // pass it in, an exception should be thrown.
  assert.throws(function() {
    "Button".locLayout({left:10});
  }, Error, "locLayout():  There is a localized value for the key 'Button.left' but a value for 'left' was also specified in the non-localized hash");
});

test("Multiply string", function (assert) {
  assert.equal('a'.mult(0), null);
  assert.equal('a'.mult(1), 'a');
  assert.equal('a'.mult(2), 'aa');
  assert.equal('xyz'.mult(1), 'xyz');
  assert.equal('xyz'.mult(2), 'xyzxyz');
});

test('CSS escaping a string', function (assert) {
  assert.equal('AnHtmlId...WithSome:Problematic::Characters'.escapeCssIdForSelector(), 'AnHtmlId\\.\\.\\.WithSome\\:Problematic\\:\\:Characters', 'should be escaped');
  assert.equal('AnHtmlIdWithNormalCharacters'.escapeCssIdForSelector(), 'AnHtmlIdWithNormalCharacters', 'should be escaped, with no effect');
});
