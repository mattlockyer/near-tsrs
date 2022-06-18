import './utils.js'
import * as fs from 'fs';
import ts, {
} from 'typescript';
import {
	indexNodes
} from './traverse.js'
import {
	removeSyntax,
	transformConsoleCall,
	transformEnvCall,
	transformMethod,
	transformLoops,
	straightReplace,
} from './helpers.js'

import { ARGS_BASE } from './libs/args.js';
import { SYS_BASE } from './libs/sys.js';
import { LIB_BASE } from './libs/lib.js';
import { TYPES_BASE } from './libs/types.js';

import './utils.js'

let nodes
const emptyNodes = {
	import: [],
	classDef: [],
	envCall: [],
	forLoop: [],
	forInLoop: [],
	forOfLoop: [],
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
		code = transform(code, transformLoops)
		code = transform(code, straightReplace)
		code = transform(code, removeSyntax)

		// write files
		const argsData = ARGS_BASE
		const sysData = SYS_BASE

		const libData = `
		${LIB_BASE}
		${TYPES_BASE}
		${code}
		`;

		fs.writeFileSync('./contract/src/args.rs', argsData);
		fs.writeFileSync('./contract/src/sys.rs', sysData);
		fs.writeFileSync('./contract/src/lib.rs', libData);
		
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