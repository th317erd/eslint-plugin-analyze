function walkNode(node, cb, _alreadyVisited) {
	if (!node)
		return;

	var alreadyVisited = _alreadyVisited || [],
			keys = Object.keys(node);

	for (var i = 0, il = keys.length; i < il; i++) {
		var key = keys[i],
				value = node[key];

		if (key === 'parent')
			continue;

		if (value && value instanceof Object && alreadyVisited.indexOf(value) < 0) {
			if (value.type) {
				cb(value, key, node);
			}

			alreadyVisited.push(value);
			walkNode(value, cb, alreadyVisited);
		}
	}
}

function getMemberExpressionKeyChain(node, _chainArray) {
	var chainArray = _chainArray || [];

  if (node.object && node.object.name)
    chainArray.push(node.object.name);

  if (node.property && node.property.name)
    chainArray.push(node.property.name);

  if (node.parent && node.parent.type === 'MemberExpression')
    getMemberExpressionKeyChain(node.parent, chainArray);

  return chainArray;
}

function debugObj(obj) {
	var alreadyVisited = [];
	console.log(JSON.stringify(obj, function(key, value) {
		if (value instanceof Object) {
			if (alreadyVisited.indexOf(value) > -1)
				return;
			alreadyVisited.push(value);
		}

		return value;
	}, 2));
}

module.exports = {
	debugObj: debugObj,
	walkNode: walkNode,
	getMemberExpressionKeyChain: getMemberExpressionKeyChain
};