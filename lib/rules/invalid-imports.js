var Utils = require('../utils'),
    path = require('path');

//TODO: Add static chain checking

module.exports = {
  meta: {
    docs: {
      description: "Test invalid import / require paths",
      category: "Analyze",
      recommended: true
    },
    schema: [] // no options
  },
  create: function(context) {
    //console.log(context.getSourceCode().ast);
    var fileName = context.getFilename();
    console.log('FILE: ', fileName);
    return {
      'ImportDeclaration': function(node) {
        if (!node.source)
          return;

        var importPath = node.source.value;
        console.log('GOT IMPORT!!', importPath, path.resolve(fileName, importPath));
      },
      'CallExpression': function(node) {
        if (node.callee && node.callee.name !== 'require')
          return;

        if (!node.arguments || !node.arguments[0])
          return;

        var importPath = node.arguments[0].value;
        console.log('GOT REQUIRE', importPath, path.resolve(fileName, importPath));
      }
    };
  }
};
