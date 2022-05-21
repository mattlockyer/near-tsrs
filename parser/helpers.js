
import { READ_ARGS, toJsonKey, toArgFunc } from './args.js';
import { stripQuotes } from './types.js';
const CONSOLE_LOG = 'console.log'

export const parseConsole = (data) => {

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

	return data
}

export const parsePublicMethods = (data) => {
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
			data = data.insertAfter(READ_ARGS, `
		let ${argName} = get_arg!(${toArgFunc(argType)}, args, ${toJsonKey(argName)});`
			)
		})

	})

	return data
}

export const parseMethods = (data) => {
	/// parse public functions
	const methodSignatureMatches = data.match(/\s+.+\(.*\)\s*\{/gi)
		.filter((v) => v.indexOf('public') === -1)
		.map((v) => v.trim())

	methodSignatureMatches.forEach((v, i) => {
		data = data.insertBefore(v, 'fn ')
	})

	return data
}

export const parseMethodCalls = (data) => data
.replace(/this\./gi, '')

export const parseSysCalls = (data) => data
.replace(/storage_read/gi, '&storage_read')

export const parseVariables = (data) => data
.replace(/let/gi, 'let mut')
.replace(/const/gi, 'let')
.replace(/:\s*string/gi, '')