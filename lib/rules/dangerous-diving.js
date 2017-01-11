function getMemberExpressionKeyChain(node, chainArray) {
  if (node.object && node.object.name)
    chainArray.push(node.object.name);

  if (node.property && node.property.name)
    chainArray.push(node.property.name);

  if (node.parent && node.parent.type === 'MemberExpression')
    getMemberExpressionKeyChain(node.parent, chainArray);

  return chainArray;
}

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

        //console.log(node);

        var chain = getMemberExpressionKeyChain(node, []);
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
