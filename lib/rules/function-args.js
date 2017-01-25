var Utils = require('../utils');

function getDebugInfo(e) {
	var p = ('' + e.stack.split('\n')[1]).match(/(\d+):(\d+)\D+$/);

	return (p) ? {
		line: parseInt(p[1]),
		column: parseInt(p[2])
	} : undefined;
}

function runTests(func, argCount, simple) {
	var invalidArgs = [undefined, null, NaN, Infinity, ''],
	    len = invalidArgs.length,
	    currentLen,
			funcArgs = new Array(argCount);

	for (var j = 0, jl = Math.pow(len, argCount); j < jl; j++) {
	    currentLen = len;
	    o = j % len;

	    for (var i = 0, il = argCount; i < il; i++) {
        funcArgs[i] = invalidArgs[o];
	      o = Math.floor(j / currentLen) % len;
        currentLen *= currentLen;
	    }

	  try {
	  	func.apply(this, funcArgs);	
	  } catch(e) {
	  	var info = getDebugInfo(e);
	  	return {
	  		error: e.message,
	  		info: info,
	  		args: funcArgs
	  	};
	  }
	}
}

function runSimpleTests(func, argCount, simple) {
	var invalidArgs = [undefined, null, NaN, Infinity, ''],
	    len = invalidArgs.length,
	   	funcArgs = new Array(argCount);

	for (var j = 0, jl = len; j < jl; j++) {
    for (var i = 0, il = argCount; i < il; i++)
      funcArgs[i] = invalidArgs[j];

	  try {
	  	func.apply(this, funcArgs);	
	  } catch(e) {
	  	var info = getDebugInfo(e);
	  	return {
	  		error: e.message,
	  		info: info,
	  		args: funcArgs
	  	};
	  }
	}
}

function getCallExpressions(node) {
	var callExpressions = [];
	Utils.walkNode(node, function(node) {
		if (node.type !== 'CallExpression')
			return;

		callExpressions.push(node);
	});

	callExpressions = callExpressions.sort(function(a, b) {
		var x = (a.callee.property || a.callee).start,
				y = (b.callee.property || b.callee).start;

		return (x == y) ? 0 : (x < y) ? 1 : -1;
	});

	return callExpressions;
}

function getIdentifiers(node) {
	var identifiers = [];
	Utils.walkNode(node, function(node, key, parent) {
		if (node.type === 'MemberExpression' && node.object && node.object.type === 'Identifier')
			identifiers.push(node.object);
		else if (node.type === 'Identifier' && !node.parent)
			identifiers.push(node);
	});

	return identifiers;
}

function functionHasArgument(node, name) {
	if (!node.params)
		return false;

	for (var i = 0, il = node.params.length; i < il; i++) {
		var arg = node.params[i];
		if (arg.name === name)
			return true;
	}

	return false;
}

function scopeHasVariable(scope, name) {
	if (!scope.variables)
		return false;

	for (var i = 0, il = scope.variables.length; i < il; i++) {
		var arg = scope.variables[i];
		if (arg.name === name)
			return true;
	}

	return false;
}

function sandboxify(functionNode, testFuncName, _code) {
	var code = _code,
			ce = getCallExpressions(functionNode),
			funcStart = functionNode.start;

	for (var i = 0, il = ce.length; i < il; i++) {
		var v = ce[i],
				c =(v.callee.property || v.callee),
				s = c.start - funcStart,
				e = c.end - funcStart;

		code = code.substring(0, s) + testFuncName + code.substring(e);
	}

	return code;
}

function prepareFunctionArguments(context, functionNode) {
	var scope = context.getScope(),
			me = getIdentifiers(functionNode.body.body);

	var argList = [];
	for (var i = 0, il = me.length; i < il; i++) {
		var v = me[i],
				name = v.name;

		if (argList.indexOf(name) < 0 && !functionHasArgument(functionNode, name) && !scopeHasVariable(scope, name))
			argList.push(name);
	}

	return argList;
}

function prepareFunctionEvaluation(context, functionNode, testFuncName, tranformer, opts) {
	var sourceCode = context.getSourceCode(),
			funcName = functionNode.id.name,
      paramCount = functionNode.params.length,
      code = sandboxify(functionNode, testFuncName, sourceCode.getText(functionNode)),
      argList = prepareFunctionArguments(context, functionNode),
			funcStr = '(function(' + testFuncName + ((argList.length) ? (',' + argList.join(',')) : '') + '){' + code + 'return run' + ((opts.simple) ? 'Simple' : '') + 'Tests(' + funcName + ',' + paramCount + ')})';

	if (tranformer)
		funcStr = tranformer(funcStr);	
	
	var args = new Array(argList.length + 1);
	args[0] = function(){return ''};
	for (var i = 0, il = argList.length; i < il; i++)
		args[i + 1] = {};

	return {
		paramCount: paramCount,
		funcName: funcName,
		funcCode: funcStr,
		funcCallArgs: args
	};
}

module.exports = {
  meta: {
    docs: {
      description: "Test handling all function argument types",
      category: "Analyze",
      recommended: true
    },
    schema: [
	    {
        "type": "object",
        "properties": {
          "simple": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
	    }
    ]
  },
  create: function(context) {
  	var tranformer = null,
  			testFuncName = 'T' + Math.round(Math.random() * 1000000),
  			opts = context.options[0] || {simple: true};

  	Object.defineProperty(Object.prototype, testFuncName, {
  		configurable: false,
  		writable: false,
  		enumerable: false,
  		value: function(){return '';}
  	});

  	if (context.parserPath === 'babel-eslint') {
  		var babel = require("babel-core");
  		tranformer = function(code) {
  			return babel.transform(code, {
  				plugins: [
  					"transform-decorators-legacy",
  					"transform-class-properties",
  					"transform-object-rest-spread"
  				]
  			}).code;
  		}
  	}

    return {
      'FunctionDeclaration': function(node) {
      	var funcName = node.id.name,
      			paramCount = node.params.length;

      	if (paramCount) {
      		try {
      			var funcObj = prepareFunctionEvaluation(context, node, testFuncName, tranformer, opts),
	      				ret = eval((new Array(node.loc.start.line)).join('\n') + funcObj.funcCode).apply(this, funcObj.funcCallArgs);

	      		if (ret) {
	      			context.report({
	      				message: 'Code failure' + ((ret.info) ? (' on line ' + ret.info.line) : '') + ' when passed arguments ' + funcName + JSON.stringify(ret.args, function(k, v) {
	    						if (!v)
	    							return ('') + v;
	    						return v;
	      				}).replace(/\[/g, '(').replace(/\]/g, ')').replace(/\"(.+?)\"/g, '$1') + ': ' + (('' + ret.error).replace(/\s'.+'/g, '')),
	      				node: node
	      			});
	      		}	
      		} catch(e) {}
      	}
      }
    };
  }
};
