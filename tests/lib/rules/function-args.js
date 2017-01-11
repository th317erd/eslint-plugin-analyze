/**
 * @fileoverview Tests for function-args rule.
 * @author Wyatt Greenway
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/function-args'),
  	RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run('function-args', rule, {
  valid: [
  	{
    	code: 'function test(hello) { var a = {...hello, state: true}; return a; }',
    	parser: "babel-eslint"
    }
  ],
  invalid: [
    {
      code: 'function test(hello) { return hello.world.test; }',
      errors: ['Code failure when passed arguments ["undefined"]: Cannot read property \'world\' of undefined']
    }
  ]
});