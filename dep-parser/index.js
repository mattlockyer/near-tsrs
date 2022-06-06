import fs from 'fs';
import ts from "typescript";

import './utils.js';
import { ARGS_BASE } from './args.js';
import { SYS_BASE } from './sys.js';
import { LIB_BASE } from './lib.js';
import { TYPES_BASE } from './types.js';
import {
	parseInto,
	parseComments,
	parseReturnParams,
	parseVariables,
	parseLogic,
	parseLoops,
	parseEnvCalls,
	parseConsole,
	parseMethods,
	parseMethodCalls,
	parsePublicMethods,
} from './helpers.js';

const init = async () => {

	try {
		const data = fs.readFileSync('./src/index.ts', 'utf8');
		const ast = ts.createSourceFile('', data, ts.ScriptTarget.Latest)

		let ret = ``
		const contract = ast.statements.find(s => s.ClassDeclaration)
		const methods = contract.members.filter(m => typeof m === m.Meth)

		return
		
		// optional parse comments (they get parsed into Rust and might be mangled)
		data = parseComments(data)

		// extract contract body only
		data = data.substring(data.indexOf('implements NearContract'), data.lastIndexOf('}'))
		data = data.substring(data.indexOf('{') + 1)

		return ast
		// main helpers to translate TS -> RS
		data = parseInto(data)
		data = parseReturnParams(data)
		data = parseLogic(data)
		data = parseLoops(data)
		data = parseVariables(data)
		data = parseConsole(data)
		data = parseEnvCalls(data)
		data = parseMethods(data)
		data = parseMethodCalls(data)
		data = parsePublicMethods(data)
		// console.log(data)

		// write files
		const argsData = ARGS_BASE
		const sysData = SYS_BASE

		const libData = `
${LIB_BASE}
${TYPES_BASE}
${data}
`;

		try {
			fs.writeFileSync('./contract/src/args.rs', argsData);
			fs.writeFileSync('./contract/src/sys.rs', sysData);
			fs.writeFileSync('./contract/src/lib.rs', libData);
			// file written successfully
		} catch (err) {
			console.error(err);
		}

	} catch (err) {
		console.error(err);
	}

}

init()