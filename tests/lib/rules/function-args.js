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
      code: 'function test(hello) { var fs = require(\'fs\'); fs.writeFileSync(\'test.txt\', \'Testing!!\');return (hello.world.test(function(){})).toString(); }',
      errors: ['Code failure on line 1 when passed arguments test(undefined): Cannot read property of undefined']
    }
  ]
});