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
    'dangerous-diving': require('./lib/rules/dangerous-diving')
  },
  rulesConfig: {
    'dangerous-diving': 1,
    'function-args': 2
  }
};

