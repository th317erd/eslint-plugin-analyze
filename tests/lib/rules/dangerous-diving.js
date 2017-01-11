/**
 * @fileoverview Tests for dangerous-diving rule.
 * @author Wyatt Greenway
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/dangerous-diving'),
    RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run('dangerous-diving', rule, {
  valid: [
    'function test(hello) { return hello.world; }',
    'function test(hello) { return hello; }'
  ],
  invalid: [
    {
      code: 'function test(hello) { return hello.world.test; }',
      errors: ['Unchecked deep diving into object chain is dangerous']
    },
    {
      code: 'function test(hello) { return hello.world.test.really.deep.diving; }',
      errors: ['Unchecked deep diving into object chain is dangerous']
    }
  ]
});