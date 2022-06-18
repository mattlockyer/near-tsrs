import ts, {
	Node,
	Visitor,
	SourceFile,
	TransformerFactory,
} from 'typescript';

const map = [
	{ is: ts.isImportDeclaration, arr: 'import' },
	{ is: ts.isClassDeclaration, arr: 'classDef' },
	{ is: ts.isMethodDeclaration, arr: 'method' },
	{ is: ts.isForOfStatement, arr: `forOfLoop`},
	{ is: ts.isForInStatement, arr: `forInLoop`},
	{ is: ts.isForStatement, arr: `forLoop`},
]

export const indexNodes: TransformerFactory<SourceFile> = (ctx) => {
	
	const { factory: f } = ctx
	const nodes = global.nodes

	const visit: Visitor = (node: Node) => {
		// console.log(node.getText(sf))

		map.forEach(({ is, arr }) => {
			if (is(node)) {
				nodes[arr].push(node)
			}
		})

		if (ts.isCallExpression(node)) {
			const text = node.getText(sf)
			if (/console\./gi.test(text)) nodes.consoleCall.push(node);
			else if (/env\./gi.test(text)) nodes.envCall.push(node);
			else nodes.call.push(node);	
		}

		return ts.visitEachChild(node, visit, ctx)
	}
	
	let sf
	return (_sf) => {
		sf = _sf
		return ts.visitEachChild(_sf, visit, ctx)
	}
}
    


// if (ts.isMethodDeclaration(node)) {

// 	// console.log(node.getText(sf))

// 	let newName = node.name.getText(sf).prefix('fn ');

// 	/// mut
// 	node.modifiers?.forEach((s) => {
// 		if (s.getText(sf) !== 'public') return
// 		newName = newName.prefix('pub ')
// 	});

// 	node = f.updateMethodDeclaration(
// 		node,
// 		node.decorators,
// 		null,
// 		node.asteriskToken,
// 		f.createIdentifier(newName),
// 		node.questionToken,
// 		node.typeParameters,
// 		node.parameters,
// 		node.type,
// 		node.body
// 	)

// 	return node
// }