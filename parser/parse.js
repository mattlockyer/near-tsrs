import fs from 'fs';

import './utils.js';
import { ARGS_BASE } from './args.js';
import { SYS_BASE } from './sys.js';
import { LIB_BASE } from './lib.js';
import { TYPES_BASE } from './types.js';
import {
	parseConsole,
	parseMethods,
	parseMethodCalls,
	parsePublicMethods,
	parseVariables,
	parseSysCalls,
} from './helpers.js';


try {
	let data = fs.readFileSync('./src/index.ts', 'utf8');

	data = parseVariables(data)
	data = parseConsole(data)
	data = parseMethods(data)
	data = parseMethodCalls(data)
	data = parseSysCalls(data)
	data = parsePublicMethods(data)
	// console.log(data)

	/// write files

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
  