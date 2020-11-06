// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ==========================================================================
// SC.Logger Unit Test
// ==========================================================================

/*globals module test equals */
import { SC, GLOBAL } from '../../../core/core.js';


// Test console needed because testing for null functions,
// ie. setting the actual console.log = null means setting up
// and tearing down no longer work properly.

function testConsole() {
  return {
    log: function() { return true; },
    alert: function() { return true; },
    debug: function() { return true; },
    dir: function() { return true; },
    dirxml: function() { return true; },
    error: function() { return true; },
    group: function() { return true; },
    groupEnd: function() { return true; },
    info: function() { return true; },
    profile: function() { return true; },
    profileEnd: function() { return true; },
    time: function() { return true; },
    timeEnd: function() { return true; },
    trace: function() { return true; },
    warn: function() { return true; }
  };
}

module("SC.Logger", {
  beforeEach: function() {
    SC.Logger.set('reporter', testConsole());
    
    SC.Logger.debugEnabled = true;
    SC.Logger.format = true;
    SC.Logger.fallBackOnLog = true;
    SC.Logger.fallBackOnAlert = false;
  },
  afterEach: function() {
  }
});


// We'll use these a lot.
var debugMessage    = "Test debug message",
    infoMessage     = "Test informational message",
    warnMessage     = "Test warning message",
    errorMessage    = "Test error message",
    debugGroupTitle = "Test debug group title",
    infoGroupTitle  = "Test informational group title",
    warnGroupTitle  = "Test warning group title",
    errorGroupTitle = "Test error group title";

var outputAll = function() {
  // Outputs a log message for each possible level.
  SC.Logger.debugGroup(debugGroupTitle);
  SC.Logger.debug(debugMessage);
  SC.Logger.debugGroupEnd();

  SC.Logger.infoGroup(debugGroupTitle);
  SC.Logger.info(infoMessage);
  SC.Logger.infoGroupEnd();

  SC.Logger.warnGroup(debugGroupTitle);
  SC.Logger.warn(warnMessage);
  SC.Logger.warnGroupEnd();

  SC.Logger.errorGroup(debugGroupTitle);
  SC.Logger.error(errorMessage);
  SC.Logger.errorGroupEnd();
};
    


test("exists", function() {
  assert.equal(SC.Logger.get('exists'), true, "Reporter does exist check");
  
  SC.Logger.set('reporter', null);
  assert.equal(SC.Logger.get('exists'), false, "Reporter does not exist check");
});

test("profile", function() {
  assert.equal(SC.Logger.profile(), true, "profile() function is defined");
  
  SC.Logger.get('reporter').profile = null;
  assert.equal(SC.Logger.profile(), false, "profile() function is null");
});

test("profileEnd", function() {
  assert.equal(SC.Logger.profileEnd(), true, "profileEnd() function is defined");
  
  SC.Logger.get('reporter').profileEnd = null;
  assert.equal(SC.Logger.profileEnd(), false, "profileEnd() function is null");
});

test("time", function() {
  assert.equal(SC.Logger.time('mytime'), true, "time() function is defined");
  
  SC.Logger.get('reporter').time = null;
  assert.equal(SC.Logger.time('mytime'), false, "time() function is null");
});

test("timeEnd", function() {
  assert.equal(SC.Logger.timeEnd('mytime'), true, "timeEnd() function is defined");
  
  SC.Logger.get('reporter').timeEnd = null;
  assert.equal(SC.Logger.timeEnd('mytime'), false, "timeEnd() function is null");
});

test("trace", function() {
  assert.equal(SC.Logger.trace(), true, "trace() function is defined");
  
  SC.Logger.get('reporter').trace = null;
  assert.equal(SC.Logger.trace(), false, "trace() function is null");
});

test("_argumentsToString", function() {
  assert.equal(SC.Logger._argumentsToString.apply(SC.Logger, ["test", "test2"]), "test" + SC.LOGGER_LOG_DELIMITER + "test2", "Formatting using default delimiter");
  
  SC.LOGGER_LOG_DELIMITER = "|";
  assert.equal(SC.Logger._argumentsToString.apply(SC.Logger, ["test", "test2"]), "test|test2", "Formatting using custom delimiter");
});


// ..........................................................
// LOG LEVELS
//
// Since we can't really test whether or not things are output to the console,
// we'll do all of our log level testing based on the log recording mechanism.
//
// In case anybody else has recorded a log message, all of these tests will
// start out by clearing the recorded log messages array.

test("Ensure that log levels function properly:  none", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_NONE);
  outputAll();

  // If it was null before, it should be still be null, since no messages
  // should have been logged.
  assert.equal(SC.Logger.get('recordedLogMessages'), null, "recordedLogMessages remains null");

  // If it was an empty array before, it should still be an empty array.
  SC.Logger.set('recordedLogMessages', []);
  outputAll();
  assert.equal(SC.Logger.getPath('recordedLogMessages.length'), 0, "recordedLogMessages remains an empty array");
});

test("Ensure that log levels function properly:  debug", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_DEBUG);
  outputAll();

  // All four messages (plus group begin / end directives) should have been
  // logged.
  assert.equal(SC.Logger.getPath('recordedLogMessages.length'), 12, "recordedLogMessages should have all twelve entries");

  assert.equal(SC.Logger.getPath('recordedLogMessages.1').message, debugMessage,  "recordedLogMessages[1] should be the debug message");
  assert.equal(SC.Logger.getPath('recordedLogMessages.4').message, infoMessage,   "recordedLogMessages[4] should be the info message");
  assert.equal(SC.Logger.getPath('recordedLogMessages.7').message, warnMessage,   "recordedLogMessages[7] should be the warn message");
  assert.equal(SC.Logger.getPath('recordedLogMessages.10').message, errorMessage, "recordedLogMessages[10] should be the error message");  
});

test("Ensure that log levels function properly:  info", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_INFO);
  outputAll();

  // Three messages (plus group begin / end directives) should have been
  // logged.
  assert.equal(SC.Logger.getPath('recordedLogMessages.length'), 9, "recordedLogMessages should have nine entries");

  assert.equal(SC.Logger.getPath('recordedLogMessages.1').message, infoMessage,  "recordedLogMessages[1] should be the info message");
  assert.equal(SC.Logger.getPath('recordedLogMessages.4').message, warnMessage,  "recordedLogMessages[4] should be the warn message");
  assert.equal(SC.Logger.getPath('recordedLogMessages.7').message, errorMessage, "recordedLogMessages[7] should be the error message");
});

test("Ensure that log levels function properly:  warn", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_WARN);
  outputAll();

  // Two messages (plus group begin / end directives) should have been logged.
  assert.equal(SC.Logger.getPath('recordedLogMessages.length'), 6, "recordedLogMessages should have 6 entries");

  assert.equal(SC.Logger.getPath('recordedLogMessages.1').message, warnMessage,  "recordedLogMessages[1] should be the warn message");
  assert.equal(SC.Logger.getPath('recordedLogMessages.4').message, errorMessage, "recordedLogMessages[4] should be the error message");
});

test("Ensure that log levels function properly:  error", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_ERROR);
  outputAll();

  // Only the error message (plus group begin / end directives) should have
  // been logged.
  assert.equal(SC.Logger.getPath('recordedLogMessages.length'), 3, "recordedLogMessages should have three entries");

  // That message should be equal to the error message.
  assert.equal(SC.Logger.getPath('recordedLogMessages.1').message, errorMessage, "recordedLogMessages[1] should be the error message");
});


test("Ensure that log messages via the “will format” methods actually format", function() {
  SC.Logger.set('recordedLogMessages', null);
  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_DEBUG);

  var format   = "This message should be formatted:  %@:%@",
      expected = format.fmt(null, 1);

  SC.Logger.debug(format, null, 1);
  SC.Logger.info(format, null, 1);
  SC.Logger.warn(format, null, 1);
  SC.Logger.error(format, null, 1);

  assert.equal(SC.Logger.getPath('recordedLogMessages.0').message, expected, "debug() should call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.1').message, expected, "info() should call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.2').message, expected, "warn() should call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.3').message, expected, "error() should call String.fmt");
});

test("Ensure that log messages via the “will not format” methods don’t format, but are still recorded", function() {
  SC.Logger.set('recordedLogMessages', null);
  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_DEBUG);

  var message = "This message should not be formatted:  %@:%@";
  SC.Logger.debugWithoutFmt(message, null, 1);
  SC.Logger.infoWithoutFmt(message, null, 1);
  SC.Logger.warnWithoutFmt(message, null, 1);
  SC.Logger.errorWithoutFmt(message, null, 1);

  // They should still be recorded and identified as a message.
  assert.equal(SC.Logger.getPath('recordedLogMessages.0').message, true, "debugWithoutFmt() should still record");
  assert.equal(SC.Logger.getPath('recordedLogMessages.1').message, true, "infoWithoutFmt() should still record");
  assert.equal(SC.Logger.getPath('recordedLogMessages.2').message, true, "warnWithoutFmt() should still record");
  assert.equal(SC.Logger.getPath('recordedLogMessages.3').message, true, "errorWithoutFmt() should still record");

  assert.equal(SC.Logger.getPath('recordedLogMessages.0').originalArguments[0], message, "debugWithoutFmt() should not call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.0').originalArguments[1], null, "debugWithoutFmt() should record all the arguments (1)");
  assert.equal(SC.Logger.getPath('recordedLogMessages.0').originalArguments[2], 1, "debugWithoutFmt() should record all the arguments (2)");

  assert.equal(SC.Logger.getPath('recordedLogMessages.1').originalArguments[0], message, "infoWithoutFmt() should not call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.1').originalArguments[1], null, "infoWithoutFmt() should record all the arguments (1)");
  assert.equal(SC.Logger.getPath('recordedLogMessages.2').originalArguments[2], 1, "infoWithoutFmt() should record all the arguments (2)");

  assert.equal(SC.Logger.getPath('recordedLogMessages.2').originalArguments[0], message, "warnWithoutFmt() should not call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.2').originalArguments[1], null, "warnWithoutFmt() should record all the arguments (1)");
  assert.equal(SC.Logger.getPath('recordedLogMessages.2').originalArguments[2], 1, "warnWithoutFmt() should record all the arguments (2)");

  assert.equal(SC.Logger.getPath('recordedLogMessages.3').originalArguments[0], message, "errorWithoutFmt() should not call String.fmt");
  assert.equal(SC.Logger.getPath('recordedLogMessages.3').originalArguments[1], null, "errorWithoutFmt() should record all the arguments (1)");
  assert.equal(SC.Logger.getPath('recordedLogMessages.3').originalArguments[2], 1, "errorWithoutFmt() should record all the arguments (2)");
});



// ..........................................................
// LOG MESSAGE PREFIX
//
test("Ensure that the log message prefix is respected", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_DEBUG);

  SC.Logger.set('messagePrefix', "prefix: ");
  SC.Logger.debug("message");

  assert.equal(SC.Logger.getPath('recordedLogMessages.0').message, "prefix: message", "The message should have the specified prefix");
});
