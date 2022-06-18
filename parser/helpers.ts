
// import { READ_ARGS, toJsonKey, toArgFunc } from './args.js';
export const stripQuotes = (v) => v.replace(/`|"|'/gi, ``)
const randVar = () => `tmp_${Math.floor(Math.random()*1000000000000 + Date.now())}`

/// TODO bring back dJSON

export const tryJSON = (str) => {
	try {
		return JSON.parse(str)
	} catch(e) {
		return str
	}
}

const removeMap = ['import', 'classDef']
export const removeSyntax = (code, sf) => {
	removeMap.forEach((arr) => {
		global.nodes[arr].forEach((node) => {
			let text = node.getText(sf)
			text = text.split('\n')[0]
			code = code.replace(text, ``)
		})
	})
	return code
}

export const straightReplace = (code, sf) => {
	code = code
	.replace(/let/gi, `let mut`)
	.replace(/const/gi, `let`)
	.replace(/this\./gi, ``)

	code = code.substring(0, code.lastIndexOf(`}`))

	return code
}

export const transformConsoleCall = (code, sf) => {

	global.nodes.consoleCall.forEach((node) => {
		const text = node.getText(sf)

		const inner = text.substring(text.indexOf(`(`) + 1, text.length - 1)
		let newText = `"`
		let newTextArgs = []
		inner.split(`,`).forEach((v, i) => {
			if (i == 0 && !/"|'|`/gi.test(v.trim().charAt(0))) {
				newText += `{:?}`
				newTextArgs.push(v)
			} else if (i > 0) {
				newText += ` {:?}`
				newTextArgs.push(v)
			} else {
				newText += stripQuotes(v)
			}
		})
		newText += `"` + (newTextArgs.length > 0 ? `, ${newTextArgs.join(',')}` : ``)

		code = code.replace(text, `log(&format!(${newText}))`)
	})

	return code

}

export const transformLoops = (code, sf) => {
	global.nodes.forLoop.forEach((node) => {
		let text = node.getText(sf)
		text = text.split(`\n`)[0]

		let newLoop = ''
		const bits = text.split(';')
		const name = bits[0].split('let')[1].split('=')[0].trim()
		const start = bits[0].split('=')[1].trim()
		const end = bits[1].split('<')[1].trim()
		const step = /\+\+/.test(bits[2]) ? 1 : bits[2].split('=')[1].split(')')[0].trim()
		newLoop = `for ${name} in (${start}..${end}).step_by(${step}) {`.replace(/length/gi, 'len()');

		code = code.replace(text, newLoop)
	})

	global.nodes.forOfLoop.forEach((node) => {
		let text = node.getText(sf)
		text = text.split(`\n`)[0]

		let newLoop = ''
		const bits = text.split(' of ')
		const name = bits[0].split('(')[1].trim().split(' ')[1]
		const arr = bits[1].split(')')[0].trim()
		newLoop = `for ${name} in ${arr} {`;

		code = code.replace(text, newLoop)
	})

	global.nodes.forInLoop.forEach((node) => {
		let text = node.getText(sf)
		text = text.split(`\n`)[0]

		let newLoop = ''
		const bits = text.split(' in ')
		const name = bits[0].split('(')[1].trim().split(' ')[1]
		const arr = bits[1].split(')')[0].trim()
		newLoop = `for (${name}, _x) in ${arr}.iter().enumerate() {`;

		code = code.replace(text, newLoop)
	})

	return code
}


export const transformEnvCall = (code, sf) => {

	global.nodes.envCall.forEach((node) => {
		const text = node.getText(sf)
		const name = node.expression?.name?.getText(sf)
		const args = node.arguments?.map((n) => tryJSON(n.getText(sf).toString()))

		// we don't want to convert this. method calls
		if (/this./gi.test(text)) return

		let newText = `env::${name}(`

		switch (name) {
			// storage
			case 'storage_read': {
				const tmp = randVar()
				code = code.insertLineBefore(text, `let ${tmp} = &storage_read(${args[0]});`)
				newText = `stringify(${tmp})`
			}
			break;
			case 'storage_write': {
				newText = `storage_write(${args[0]}, ${args[1]})`
			}
			break;
			// reading string env vars from registers
			case 'predecessor_account_id':
			case 'current_account_id':
			case 'signer_account_id': {
				newText = `stringify(&env_read_register("${name}"))`
			}
			break;
			// reading vec env vars from registers
			case 'signer_account_pk':
			case 'random_seed': {
				newText = `env_read_register("${name}")`
			}
			break;
			// reading u64 env vars
			case 'block_index': 
			case 'block_timestamp': 
			case 'used_gas': 
			case 'prepaid_gas': 
			case 'storage_usage': {
				newText = `env_read("${name}").into()`
			}
			break;

			case 'promise': {
				newText = ''

				code = code.insertLineBefore(text, `
				unsafe {
					near_sys::promise_create(
						
					)
				}`)


				// data = data.insertLineBefore(m, `
				// unsafe {`)
				// 			const vars = []
			
				// 			Object.entries(args).forEach(([k, v]) => {
				// 				const tmp = randVar()
				// 				vars.push(tmp)
				// 				let insert = `
				// 	let ${tmp} = `
				// 				switch (k) {
				// 					case 'args': insert += `"${JSON.stringify(v).replaceAll(`"`, `\\"`)}"`; break;
				// 					case 'amount': insert += `${v} as u128`; break;
				// 					case 'gas': insert += `${v} as u64`; break;
				// 					default: insert += `"${v}"`
				// 				}
				// 				insert += ';'
				// 				data = data.insertLineBefore(m, insert)
				// 			})
			
				// 			let insert = `
				// 	near_sys::promise_create(`
				// 				for (let i = 0; i < 3; i++) {
				// 					insert += `
				// 		${vars[i]}.len() as u64,
				// 		${vars[i]}.as_ptr() as u64,`
				// 				}
				// 				insert += `
				// 		${vars[3]}.to_le_bytes().as_ptr() as u64,
				// 		${vars[4]},
				// 	)
				// }`
				// 			data = data.replace(m, insert)
			
							
			}
			break;

	// 		break;
	// 		// promise calls
	// 		case 'promise_batch_create': {
	// 			const tmp = randVar()
	// 			data = data.insertLineBefore(m, `
	// let ${tmp} = ${args[0]};`)
	// 			data = data.insertLineBefore(m, `
	// unsafe {`);
	// 			data = data.insertLineAfter(m, `
	// }`);
	// 			data = data.replace(v, `near_sys::promise_batch_create(${tmp}.len() as u64, ${tmp}.as_ptr() as u64)`)
	// 		}
	// 		break;

			default:
				newText += `)`
		}

		if (!newText.length) {
			code = code.replace(text + ';', text)
		}
		code = code.replace(text, newText)
	})
	
	return code
}



export const transformMethod = (code, sf) => {
	global.nodes.method.forEach((node) => {
		const text = node.getText(sf)
		const newText = /public/.test(text) ? text.replace(/public/gi, 'pub fn') : text.prefix('fn ')
		code = code.replace(text, newText)
	})
	return code
}


// export const parseConsole = (data) => {

// 	/// transforms all console.log("some string", arg, arg, arg)
// 	/// into log("some string {:?} {:?} {:?}", arg, arg, arg)
// 	while (data.indexOf(CONSOLE_LOG) > -1) {
// 		let match = data.substring(data.indexOf(CONSOLE_LOG))
// 		match = match.substring(0, match.indexOf(`)`) + 1)
// 		const inner = match.substring(match.indexOf(`(`) + 1, match.length - 1)
// 		let newInner = `"`
// 		let newInnerArgs = []
// 		inner.split(`,`).forEach((v, i) => {
// 			if (i == 0 && !/"|'|`/gi.test(v.trim().charAt(0))) {
// 				newInner += `{:?}`
// 				newInnerArgs.push(v)
// 			} else if (i > 0) {
// 				newInner += ` {:?}`
// 				newInnerArgs.push(v)
// 			} else {
// 				newInner += stripQuotes(v)
// 			}
// 		})
// 		newInner += `"` + (newInnerArgs.length > 0 ? `, ${newInnerArgs.join(',')}` : ``)

// 		data = data.replace(match, `log(&format!(${newInner}))`)
// 	}

// 	return data
// }



// /// parse helpers
// const randVar = () => `tmp${Math.floor(Math.random()*1000000000000)}`
// const getMethodBody = (data, v) => {
// 	let body = data.substring(data.indexOf(v))
// 	body = body.substring(body.indexOf('{') + 1)
// 	body = body.substring(0, body.indexOf(body.match(/\}\s+.+\(.*\)\s*\{/gi)[0]))
// 	return body
// }

// /// parsing the TS data

// export const parseInto = (data) => data.replace(/\.into_u\d+\(\)/gi, '.into()')

// export const parseComments = (data) => {
// 	data = data.split('\n')
// 		.filter((l) => !/\/\//gi.test(l))
// 		.join('\n')

// 	data = data.replace(/\/\*(.*)\*\//gs, '')

// 	return data
// }

// export const parseReturnParams = (data) => {
// 	data.match(/\w*\s*\(.*\):\s*\w*\s*{/gi)
// 	?.forEach((l) => {
// 		let body = getMethodBody(data, l)
// 		const replace = body

// 		data = data.replace(l, l.replace(/:.*\{/gi, ' {'))
// 		const isNumber = /u8|u64|u128/gi.test(l)
		
// 		body = body.split('\n').map((l) => {
// 			if (!/return/.test(l)) return l
// 			return l.replace('return ', 'return_string(').replace(';', ');')
// 		}).join('\n')
// 		data = data.replace(replace, body)
// 	})
// 	return data
// }

// export const parseMethodCalls = (data) => data
// .replace(/this\./gi, '')

// export const parseVariables = (data) => {

	
// 	return data
// 		.replace(/var/gi, 'let mut')
// 		.replace(/let/gi, 'let mut')
// 		.replace(/const/gi, 'let')
// 		.replace(/:\s*string/gi, '')
// 		.replace(/Array</gi, 'Vec<')
// }

// export const parseLogic = (data) => {
// 	const logicMatches = data.match(/if\s*\(.*\)\s{/gi)
// 	if (!logicMatches) return data

// 	logicMatches.forEach((l) => {
// 		const newLine = l.replace(/if\s*\(/gi, 'if ').replace(/\)\s*\{/gi, ' {')
// 		data = data.replace(l, newLine)
// 	})

// 	return data
// }

// export const parseLoops = (data) => {
// 	const loopMatches = data.match(/for\s*\(.*\)\s{/gi)
// 	if (!loopMatches) return data

// 	loopMatches.forEach((l) => {

// 		let newLoop = ''

// 		// for (let i = 0; i < randomSeed.length; i+=4) {
// 		if (/for\s*\(\s*let\s*.*=\s*\d+;/gi.test(l)) {
// 			const bits = l.split(';')
// 			const name = bits[0].split('let')[1].split('=')[0].trim()
// 			const start = bits[0].split('=')[1].trim()
// 			const end = bits[1].split('<')[1].trim()
// 			const step = /\+\+/.test(bits[2]) ? 1 : bits[2].split('=')[1].split(')')[0].trim()
// 			newLoop = `for ${name} in (${start}..${end}).step_by(${step}) {`.replace(/length/gi, 'len()');
// 		}

// 		// for (const unit of randomSeed) {
// 		if (/for\s+\(.*of.*\)/gi.test(l)) {
// 			const bits = l.split(' of ')
// 			const name = bits[0].split('(')[1].trim().split(' ')[1]
// 			const arr = bits[1].split(')')[0].trim()

// 			newLoop = `for ${name} in ${arr} {`;
// 		}

// 		// for (let index in randomSeed) {
// 		if (/for\s+\(.*in.*\)/gi.test(l)) {
// 			const bits = l.split(' in ')
// 			const name = bits[0].split('(')[1].trim().split(' ')[1]
// 			const arr = bits[1].split(')')[0].trim()

// 			newLoop = `for (${name}, _x) in ${arr}.iter().enumerate() {`;
// 		}

// 		data = data.replace(l, newLoop)
// 	})

// 	return data
// }

// export const parsePublicMethods = (data) => {
// 	/// parse public functions
// 	const methodSignatureMatches = data.match(/public\s+.+\(.*\)\s*.*\s*\{/gi).map((v) => v.trim())
// 	methodSignatureMatches.forEach((v, i) => {
// 		let body = getMethodBody(data, v)
// 		const replace = body

// 		const methodName = v.substring(0, v.indexOf('('))
// 		data = data.replace(methodName,
// `
// 	#[no_mangle]
// 	pub fn${methodName.replace('public', '')}`
// 		)

// 		const paramMatch = v.substring(v.indexOf('('), v.indexOf('{') + 1)

// 		if (!/\(\)/gi.test(paramMatch)) {
// 			data = data.replace(paramMatch, '')
// 			body = READ_ARGS + body

// 			/// loop all params
// 			paramMatch.split(',').forEach((p) => {
// 				const [argName, argType] = p.split(':').map((v) => v.replace(/\(|\)|\{/gi, ``).trim())
// 				body = body.insertAfter(READ_ARGS, `
// 			let ${argName} = get_arg!(${toArgFunc(argType)}, args, ${toJsonKey(argName)});`
// 				)
// 			})
// 		}

// 		data = data.replace(replace, body)
// 	})

// 	return data
// }

// export const parseMethods = (data) => {
// 	/// parse public functions
// 	data.match(/\s+.+\(.*\)\s*.*\s*\{/gi)
// 		.filter((v) => !/public|for|if|switch/gi.test(v))
// 		.map((v) => v.trim())
// 		.forEach((v, i) => {
// 			data = data.insertBefore(v, 'fn ')
// 		})

// 	return data
// }

// export const parseEnvCalls = (data) => {
// 	data.match(/env\.\w*\([^\)]*/gim)
// 		.map((m) => (m + ')').trim())
// 		.forEach((m, i) => {
// 			const call = m.split('.')[1].split('(')[0]
// 			let args = m.split('(')[1].split(')')[0].trim()
// 			if (args.indexOf('{') === 0) {
// 				args = args.replace(/\s+as\s+u\d+/gi, '')
// 				args = dJSON.parse(args)
// 			} else {
// 				args = args.split(',')
// 			}

// 			switch (call) {
// 				// panic
// 				case 'panic': {
// 					data = data.replace(m, 'panic()')
// 				}
// 				break;
// 				// env_read_register
// 				case 'predecessor_account_id':
// 				case 'current_account_id':
// 				case 'signer_account_id': {
// 					data = data.replace(m, `stringify(&env_read_register("${call}"))`)
// 				}
// 				break;
// 				case 'signer_account_pk':
// 				case 'random_seed': {
// 					data = data.replace(m, `env_read_register("${call}")`)
// 				}
// 				break;
// 				// env_read (u64)
// 				case 'block_index': 
// 				case 'block_timestamp': 
// 				case 'used_gas': 
// 				case 'prepaid_gas': 
// 				case 'storage_usage': {
// 					data = data.replace(m, `env_read("${call}").into()`)
// 				}
// 				break;
// 				// more complex sys calls
// 				case 'storage_read': {
// 					const tmp = randVar()
// 					data = data.insertLineBefore(m, `let ${tmp} = &storage_read(${args[0]});`)
// 					data = data.replace(m, `stringify(${tmp})`)
// 				}
// 				break;
// 				case 'storage_write': {
// 					data = data.replace(m, `storage_write(${args[0]}, ${args[1]})`)
// 				}
// 				break;
// 				// promise calls
// 				case 'promise_batch_create': {
// 					const tmp = randVar()
// 					data = data.insertLineBefore(m, `
// 		let ${tmp} = ${args[0]};`)
// 					data = data.insertLineBefore(m, `
// 		unsafe {`);
// 					data = data.insertLineAfter(m, `
// 		}`);
// 					data = data.replace(v, `near_sys::promise_batch_create(${tmp}.len() as u64, ${tmp}.as_ptr() as u64)`)
// 				}
// 				break;
// 				case 'promise': {

// 					data = data.insertLineBefore(m, `
// 		unsafe {`)
// 					const vars = []

// 					Object.entries(args).forEach(([k, v]) => {
// 						const tmp = randVar()
// 						vars.push(tmp)
// 						let insert = `
// 			let ${tmp} = `
// 						switch (k) {
// 							case 'args': insert += `"${JSON.stringify(v).replaceAll(`"`, `\\"`)}"`; break;
// 							case 'amount': insert += `${v} as u128`; break;
// 							case 'gas': insert += `${v} as u64`; break;
// 							default: insert += `"${v}"`
// 						}
// 						insert += ';'
// 						data = data.insertLineBefore(m, insert)
// 					})

// 					let insert = `
// 			near_sys::promise_create(`
// 						for (let i = 0; i < 3; i++) {
// 							insert += `
// 				${vars[i]}.len() as u64,
// 				${vars[i]}.as_ptr() as u64,`
// 						}
// 						insert += `
// 				${vars[3]}.to_le_bytes().as_ptr() as u64,
// 				${vars[4]},
// 			)
// 		}`
// 					data = data.replace(m, insert)

					
// 				}
// 			}

// 		})

// 	return data
// }