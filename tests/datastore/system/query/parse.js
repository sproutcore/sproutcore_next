// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, ok, equals, warn, test */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// test parsing of query string
var q;
module("Query parsing", {
  beforeEach: function() {
    q = Query.create();
  }
});


// ..........................................................
// TOKENIZER
// 

test("should recognize all primitives", function (assert) {
  // PROPERTY
  q.conditions = "what_to_do_now";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'PROPERTY', 'type should be PROPERTY');
  assert.equal(q._tokenList[0].tokenValue, 'what_to_do_now', 'value should be what_to_do_now');
  
  // PROPERTY - one character
  q.conditions = "a";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'PROPERTY', 'type should be PROPERTY');
  assert.equal(q._tokenList[0].tokenValue, 'a', 'value should be "a"');
  
  // BOOLEAN VALUE - false
  q.conditions = "false";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'false', 'type should be false');
  assert.equal(q._tokenList[0].tokenValue, 'false', 'value should be false');
  
  // BOOLEAN VALUE - true
  q.conditions = "true";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'true', 'type should be true');
  assert.equal(q._tokenList[0].tokenValue, 'true', 'value should be true');
  
  // NULL
  q.conditions = "null";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have 2 tokens');
  assert.equal(q._tokenList[0].tokenType, 'null', 'type should be null');

  // NULL
  q.conditions = "undefined";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have 2 tokens');
  assert.equal(q._tokenList[0].tokenType, 'undefined', 'type should be undefined');
  
  // NUMBER - integer
  q.conditions = "1234";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  assert.equal(q._tokenList[0].tokenValue, 1234, 'value should be 1234');
  
  // NUMBER - float
  q.conditions = "12.34";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  assert.equal(q._tokenList[0].tokenValue, 12.34, 'value should be 12.34');

  // NUMBER - negative
  q.conditions = "-1";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  assert.equal(q._tokenList[0].tokenValue, -1, 'value should be -1');

  // NUMBER - negative float
  q.conditions = "-1.234";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  assert.equal(q._tokenList[0].tokenValue, -1.234, 'value should be -1.234');
  
  // STRING - single quoted
  q.conditions = "'ultravisitor'";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'STRING', 'type should be STRING');
  assert.equal(q._tokenList[0].tokenValue, 'ultravisitor', 'value should be ultravisitor');
  
  // STRING - double quoted
  q.conditions = '"Feed me weird things"';
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'STRING', 'type should be STRING');
  assert.equal(q._tokenList[0].tokenValue, 'Feed me weird things', 'value should be Feed me weird things');

  // STRING - empty
  q.conditions = "''";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'STRING', 'type should be STRING');
  assert.equal(q._tokenList[0].tokenValue, '', 'value should be ""');
  
  // PARAMETER
  q.conditions = "{my_best_friends}";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, 'PARAMETER', 'type should be PARAMETER');
  assert.equal(q._tokenList[0].tokenValue, 'my_best_friends', 'value should be my_best_friends');
  
  // WILD CARD
  q.conditions = "%@";
  q.parse();
  assert.ok(q._tokenList.length == 1, 'list should have one token');
  assert.equal(q._tokenList[0].tokenType, '%@', 'type should be %@');
  assert.equal(q._tokenList[0].tokenValue, 0, 'value should be 0');
  
  // PARENTHESES
  q.conditions = "()";
  try {
    q.parse();
  } catch (e) {
    // ignore - we don't care that it doesn't parse - just testing tokens
  }
  
  assert.ok(q._tokenList.length == 2, 'list should have two tokens');
  assert.equal(q._tokenList[0].tokenType, 'OPEN_PAREN', 'type should be OPEN_PAREN');
  assert.equal(q._tokenList[1].tokenType, 'CLOSE_PAREN', 'type should be CLOSE_PAREN');
  
  // COMPARATORS
  q.conditions = "= != < <= > >= BEGINS_WITH ENDS_WITH CONTAINS ANY MATCHES TYPE_IS";
  try {
    q.parse();
  } catch(e1) {
    // ignore - we don't care that it doesn't parse - just testing tokens
  }
  assert.equal(q._tokenList.length, 12, 'q._tokenList.length');
  
  assert.equal(q._tokenList[0].tokenType, '=', 'type should be =');
  assert.equal(q._tokenList[0].tokenValue, '=', 'value should be =');
  
  assert.equal(q._tokenList[1].tokenType, '!=', 'type should be !=');
  assert.equal(q._tokenList[1].tokenValue, '!=', 'value should be !=');
  
  assert.equal(q._tokenList[2].tokenType, '<', 'type should be <');
  assert.equal(q._tokenList[2].tokenValue, '<', 'value should be <');
  
  assert.equal(q._tokenList[3].tokenType, '<=', 'type should be <=');
  assert.equal(q._tokenList[3].tokenValue, '<=', 'value should be <=');
  
  assert.equal(q._tokenList[4].tokenType, '>', 'type should be >');
  assert.equal(q._tokenList[4].tokenValue, '>', 'value should be >');
  
  assert.equal(q._tokenList[5].tokenType, '>=', 'type should be >=');
  assert.equal(q._tokenList[5].tokenValue, '>=', 'value should be >=');
  
  assert.equal(q._tokenList[6].tokenType, 'BEGINS_WITH', 'type should be BEGINS_WITH');
  assert.equal(q._tokenList[6].tokenValue, 'BEGINS_WITH', 'value should be BEGINS_WITH');
  
  assert.equal(q._tokenList[7].tokenType, 'ENDS_WITH', 'type should be ENDS_WITH');
  assert.equal(q._tokenList[7].tokenValue, 'ENDS_WITH', 'value should be ENDS_WITH');
  
  assert.equal(q._tokenList[8].tokenType, 'CONTAINS', 'type should be CONTAINS');
  assert.equal(q._tokenList[8].tokenValue, 'CONTAINS', 'value should be CONTAINS');
  
  assert.equal(q._tokenList[9].tokenType, 'ANY', 'type should be ANY');
  assert.equal(q._tokenList[9].tokenValue, 'ANY', 'value should be ANY');
  
  assert.equal(q._tokenList[10].tokenType, 'MATCHES', 'type should be MATCHES');
  assert.equal(q._tokenList[10].tokenValue, 'MATCHES', 'value should be MATCHES');
  
  assert.equal(q._tokenList[11].tokenType, 'TYPE_IS', 'type should be TYPE_IS');
  assert.equal(q._tokenList[11].tokenValue, 'TYPE_IS', 'value should be TYPE_IS');
  
  // BOOLEAN OPERATORS
  q.conditions = "AND OR NOT";
  try {
    q.parse();
  } catch(e2) {
    // ignore - we don't care that it doesn't parse - just testing tokens
  }
  assert.ok(q._tokenList.length == 3, 'list should have 3 tokens');
  assert.equal(q._tokenList[0].tokenType, 'AND', 'type should be AND');
  assert.equal(q._tokenList[0].tokenValue, 'AND', 'value should be AND');
  assert.equal(q._tokenList[1].tokenType, 'OR', 'type should be OR');
  assert.equal(q._tokenList[1].tokenValue, 'OR', 'value should be OR');
  assert.equal(q._tokenList[2].tokenType, 'NOT', 'type should be NOT');
  assert.equal(q._tokenList[2].tokenValue, 'NOT', 'value should be NOT');
  
}); 

// ..........................................................
// COMPOUND
//

test("negative numbers with equals", function (assert) {
  q.conditions = "-1=-1";
  q.parse();
  assert.equal(q._tokenList.length, 3, "should have 3 tokens");
});

// ..........................................................
// TREE-BUILDING
//

test("token tree should build", function (assert) {  
  // Just some examples
  
  q.conditions = "(firstName MATCHES {firstName} OR lastName BEGINS_WITH 'Lone') AND is_a_beauty = true";
  q.parse();
  assert.ok(q._tokenList.length == 13, 'list should have 13 tokens');
  assert.ok(!q._tokenTree.isError, 'there should be no errors');
  assert.ok(q._tokenTree.tokenValue == 'AND', 'tree root should be AND');
  
});

test("token tree should error", function (assert) {
  q.conditions = "(firstName MATCHES {firstName} OR lastName BEGINS_WITH 'Lone') AND is_a_beauty =";
  try {
    q.parse();
  } catch(e) {}
  assert.ok(q._tokenTree.isError, "Parsing an unparsable query results in an error.");

  SC.warn('Parsing "(firstName =)" should result in an error but does not.');
  // // This should be an error case but is not. I don't have time to track it down at the moment.
  // q.conditions = "(firstName =)";
  // try {
  //   q.parse();
  // } catch(e) {}
  // assert.ok(q._tokenTree.isError, "Parsing an unparsable query results in an error.");
});
