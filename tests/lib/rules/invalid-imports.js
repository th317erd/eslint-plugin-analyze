/**
 * @fileoverview Tests for invalid-imports rule.
 * @author Wyatt Greenway
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/invalid-imports'),
    RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run('invalid-imports', rule, {
  valid: [
    {
      code: 'require("test");import eslint from "eslint";import invalidImports from "../../../lib/rules/invalid-imports";',
      parser: "babel-eslint",
      filename: __filename
    }
  ],
  invalid: [
    {
      code: 'import { utils } from "../utils/utils";',
      parser: "babel-eslint",
      errors: ['Unchecked deep diving into object chain is dangerous'],
      filename: __filename
    }
  ]
});