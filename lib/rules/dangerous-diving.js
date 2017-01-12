var Utils = require('../utils');

//TODO: Add static chain checking

module.exports = {
  meta: {
    docs: {
      description: "Test dangerous object access",
      category: "Analyze",
      recommended: true
    },
    fixable: "code",
    schema: [] // no options
  },
  create: function(context) {
    //console.log(context.getSourceCode());
    return {
      'MemberExpression:exit': function(node) {
        if (node.object && node.object.type === 'MemberExpression')
          return;

        var chain = Utils.getMemberExpressionKeyChain(node);
        if (chain.length > 2) {
          context.report({
            message: 'Unchecked deep diving into object chain is dangerous',
            node: node
          });  
        }
      }
    };
  }
};
