function runTests(func, argCount) {
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
	  	return {
	  		error: e.message,
	  		args: funcArgs
	  	};
	  }
	}
}

module.exports = {
  meta: {
    docs: {
      description: "Test handling all function argument types",
      category: "Analyze",
      recommended: true
    },
    fixable: "code",
    schema: [] // no options
  },
  create: function(context) {
  	var sourceCode = context.getSourceCode(),
  			tranformer = null;

  	//console.log(context);

  	if (context.parserPath === 'babel-eslint') {
  		var babel = require("babel-core");
  		tranformer = function(code) {
  			return babel.transform(code, {
  				plugins: [
  					"transform-decorators-legacy",
  					"transform-class-properties",
  					"transform-object-rest-spread"
  				]
  			});
  		}
  	}

    return {
      'FunctionDeclaration': function(node) {
      	var funcName = node.id.name,
      			paramCount = node.params.length;

      	if (paramCount) {
      		var code = sourceCode.getText(node),
      				funcStr;

      		if (tranformer)
      			code = tranformer(code).code;

      		funcStr = '(function(){' + runTests + code + 'return runTests(' + funcName + ',' + paramCount + ')})();';
      		var ret = eval(funcStr);
      		if (ret) {
      			context.report({
      				message: 'Code failure when passed arguments ' + JSON.stringify(ret.args, function(k, v) {
    						if (!v)
    							return ('') + v;
    						return v;
      				}) + ': ' + ret.error,
      				node: node
      			});
      		}
      	}
      }
    };
  }
};
