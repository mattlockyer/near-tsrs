import fs from 'fs';

import './utils.js';
import { ARGS_BASE, READ_ARGS, toJsonKey, toArgFunc } from './args.js';
import { SYS_BASE } from './sys.js';
import { LIB_BASE } from './lib.js';
import { stripQuotes } from './types.js';

const CONSOLE_LOG = 'console.log'

try {
	let data = fs.readFileSync('./src/index.ts', 'utf8');

	/// transforms all console.log("some string", arg, arg, arg)
	/// into log("some string {:?} {:?} {:?}", arg, arg, arg)
	while (data.indexOf(CONSOLE_LOG) > -1) {
		let match = data.substring(data.indexOf(CONSOLE_LOG))
		match = match.substring(0, match.indexOf(`)`) + 1)
		const inner = match.substring(match.indexOf(`(`) + 1, match.length - 1)
		let newInner = `"`
		let newInnerArgs = []
		inner.split(`,`).forEach((v, i) => {
			if (i > 0) {
				newInner += ` {:?}`
				newInnerArgs.push(v)
			} else {
				newInner += stripQuotes(v)
			}
		})
		newInner += `"` + (newInnerArgs.length > 0 ? `, ${newInnerArgs.join(',')}` : ``)

		data = data.replace(match, `log(&format!(${newInner}))`)
	}

	/// parse public functions
	const methodSignatureMatches = data.match(/public\s+.+\(.*\)\s*\{/gi).map((v) => v.trim())
	methodSignatureMatches.forEach((v, i) => {

		if (i === 0) {
			data = data.substring(data.indexOf(v), data.lastIndexOf('}'))
		}

		const methodName = v.substring(0, v.indexOf('('))
		data = data.replace(methodName,
`
	#[no_mangle]
	pub fn ${methodName.replace('public', '')}`
		)

		const paramMatch = v.substring(v.indexOf('('), v.indexOf('{') + 1)
		data = data.replace(paramMatch, READ_ARGS)
		/// loop all params
		paramMatch.split(',').forEach((p) => {
			const [argName, argType] = p.split(':').map((v) => v.replace(/\(|\)|\{/gi, ``).trim())

			console.log(toArgFunc(argType))

			data = data.insertAfter(READ_ARGS, `
		let ${argName} = get_arg!(${toArgFunc(argType)}, args, ${toJsonKey(argName)});`
			)
		})

	})

	/// write files

	const argsData = ARGS_BASE
	const sysData = SYS_BASE

	const libData = `
${LIB_BASE}

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
  