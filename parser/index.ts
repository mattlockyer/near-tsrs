import './utils.js'
import * as fs from 'fs';
import ts, {
} from 'typescript';
import {
	indexNodes
} from './traverse.js'
import {
	transformConsoleCall,
	transformEnvCall,
	transformMethod,
} from './helpers.js'
import './utils.js'

let nodes
const emptyNodes = {
	envCall: [],
	consoleCall: [],
	call: [],
	method: [],
};
const resetNodes = () => {
	nodes = global.nodes = JSON.parse(JSON.stringify(emptyNodes))
}
resetNodes()

const transform = (code, cb) => {
	resetNodes()
	const sf = ts.createSourceFile('', code, ts.ScriptTarget.Latest)
	ts.transform(sf, [indexNodes]);
	code = cb(code, sf)
	return code
}

const init = async () => {

	try {
		let code = fs.readFileSync('./src/index.ts', 'utf8');

		/// transform from inside calls out

		// code = parseConsole(code)

		code = transform(code, transformConsoleCall)
		code = transform(code, transformEnvCall)
		code = transform(code, transformMethod)
		
		console.log(code)
		
		// // Create a Printer
		// const printer = ts.createPrinter({
		// 	newLine: ts.NewLineKind.LineFeed,
		// 	removeComments: false,
		// 	omitTrailingSemicolon: true
		// });
		// const output = printer.printFile(result.transformed[0])
		// 	// return
		// 	.replace(/\)\s*:/gi, ') ->')
		// 	// variables
		// 	.replace(/var/gi, 'let mut')
		// 	.replace(/let/gi, 'let mut')
		// 	.replace(/const/gi, 'let')
		// 	.replace(/:\s*string/gi, '')
		// 	.replace(/Array</gi, 'Vec<')

		// setTimeout(() => console.log(output), 2000)

		// if (!ast) {
		// 	return console.warn('ast could not be parsed for file')
		// }



		// const contract: ClassDeclaration = ast.statements
		// 	.find((s: Statement) => ts.isClassDeclaration(s)) as ClassDeclaration;
		// if (!contract) {
		// 	return console.warn('no contract class definition found')
		// }

		// const methods: MethodDeclaration[] = contract.members
		// 	.filter((m: ClassElement) => ts.isMethodDeclaration(m))
		// 	.map((m: ClassElement) => m as MethodDeclaration)
		// if (!methods.length) {
		// 	return console.warn('no contract methods were found')
		// }

		// data = parseMethods(data, methods)


	} catch (err) {
		console.error(err);
	}

}

init()