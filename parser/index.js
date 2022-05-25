import fs from 'fs';

import './utils.js';
import { ARGS_BASE } from './args.js';
import { SYS_BASE } from './sys.js';
import { LIB_BASE } from './lib.js';
import { TYPES_BASE } from './types.js';
import {
	parseVariables,
	parseLoops,
	parseEnvCalls,
	parseConsole,
	parseMethods,
	parseMethodCalls,
	parsePublicMethods,
} from './helpers.js';

const init = async () => {

	try {
		let data = fs.readFileSync('./src/index.ts', 'utf8');

		data = data.split('\n')
		.filter((l) => !/\/\//gi.test(l))
		.join('\n')

		data = parseLoops(data)
		data = parseVariables(data)
		data = parseEnvCalls(data)
		data = parseConsole(data)
		data = parseMethods(data)
		data = parseMethodCalls(data)
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

}

init()