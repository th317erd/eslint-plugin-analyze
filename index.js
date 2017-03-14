/**
 * @fileoverview Rule to enforce parentheses around ternary conditional expressions
 * @author Wyatt Greenway
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
  rules: {
    'dangerous-diving': require('./lib/rules/dangerous-diving'),
    'function-args': require('./lib/rules/function-args'),
    'invalid-imports': require('./lib/rules/invalid-imports')
  },
  rulesConfig: {
    'dangerous-diving': 1,
    'function-args': 2,
    'invalid-imports': 0
  }
};

