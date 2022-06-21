import ts, { PropertyAssignment } from 'typescript';
import { READ_ARGS, toJsonKey, toArgFunc } from './libs/args.js';
export const stripQuotes = (v) => v.replace(/`|"|'/gi, ``)
const randVar = () => `tmp_${Math.floor(Math.random()*1000000000000 + Date.now())}`


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
	.replace(/.into_u\d+\(\)/gi, `.into()`)

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

export const parseJsonArgs = (node, sf, obj = {}): any => {
	node.properties.forEach((p) => {
		const prop = p as PropertyAssignment
		if (ts.isObjectLiteralExpression(prop.initializer)) {
			return obj[prop.name.getText(sf)] = parseJsonArgs(prop.initializer, sf)
		}
		if (ts.isIdentifier(prop.initializer)) {
			return obj[prop.name.getText(sf)] = '__IDENTIFIER__' + prop.initializer.getText(sf)
		}
		if (ts.isStringLiteral(prop.initializer)) {
			return obj[prop.name.getText(sf)] = '__STRING__' + prop.initializer.getText(sf)
		}
		return obj[prop.name.getText(sf)] = prop.initializer.getText(sf)
	})
	return obj
}

export const formatArg = (arg) => arg.replace(/__IDENTIFIER__|__STRING__/gi, ``)

export const formatJson = (json) => {
	let res = `format!("{{`;
	let vars: string[] = [];
	Object.entries(json).forEach(([k, v]) => {
		let val = stripQuotes(v)
		if (/__IDENTIFIER__/.test(val)) {
			vars.push(formatArg(val))
			val = `{:?}`
		}
		if (/__STRING__/.test(val)) {
			val = `\\"${formatArg(val)}\\"`
		}
		res += `\\"${k}\\":${val},`
	})
	res = res.substring(0, res.length - 1)
	return res += `}}", ${vars.join(',')})`
}


export const transformEnvCall = (code, sf) => {

	global.nodes.envCall.forEach((node) => {
		const text = node.getText(sf)
		const name = node.expression?.name?.getText(sf)
		let args = node.arguments?.map((n) => {
			if (ts.isObjectLiteralExpression(n)) {
				return parseJsonArgs(n, sf)
			}
			return n.getText(sf).toString()
		})

		// we don't want to convert this. method calls
		if (/this.|into_/gi.test(text)) return

		// default cases
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
			case 'signer_account_pk_string': {
				const tmp = randVar()
				const tmp2 = randVar()
				code = code.insertLineBefore(text, `
				let mut ${tmp} = env_read_register("signer_account_pk");
				${tmp}.remove(0);
				let mut ${tmp2} = String::from("11111111111111111111111111111111111111111111");
				bs58::encode(&${tmp}).into(${tmp2}.as_mut_str());
				`)
				newText = tmp2
			}


// let mut pk_read = env_read_register("signer_account_pk");
// pk_read.remove(0);
// log(&format!("{:?}", pk_read.len()));

// let mut tmp_2378767290755 = String::from("6E8sCci9badyRkXb3JoRpBj5p8C6Tw41ELDZoiihKEtp||||");
// bs58::encode(pk_read).into(tmp_2378767290755.as_mut()).ok();
// let pk = format!("ed25519:{}", tmp_2378767290755.replace("|", ""));
// log(&format!("{:?}", pk.len()));

// log(&format!("{:?}", pk));


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
				newText = `env_read("${name}")`
			}
			break;

			case 'promise': {
				newText = ''
				code = code.insertLineBefore(text, `
				unsafe {
					`)

				args = args[0]
				const tmp = randVar()
				code = code.insertLineBefore(text, `let ${tmp} = ${formatArg(args.contractId)};`)
				const tmp2 = randVar()
				code = code.insertLineBefore(text, `let ${tmp2} = ${formatArg(args.methodName)};`)
				const tmp3 = randVar()
				code = code.insertLineBefore(text, `let ${tmp3} = ${formatJson(args.args)};`)
				const tmp4 = randVar()
				code = code.insertLineBefore(text, `let ${tmp4} = ${stripQuotes(formatArg(args.amount))} as u128;`)
				const tmp5 = randVar()
				code = code.insertLineBefore(text, `let ${tmp5} = ${stripQuotes(formatArg(args.gas))};`)


				code = code.insertLineBefore(text, `
					near_sys::promise_create(
						${tmp}.len() as u64,
						${tmp}.as_ptr() as u64,
						${tmp2}.len() as u64,
						${tmp2}.as_ptr() as u64,
						${tmp3}.len() as u64,
						${tmp3}.as_ptr() as u64,
						${tmp4}.to_le_bytes().as_ptr() as u64,
						${tmp5},
					);
				}`)
			}
			break;
			
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
		code = code.insertLineBefore(text, `#[no_mangle]`)
		let newText = /public/.test(text) ? text.replace(/public/gi, 'pub fn') : text.prefix('fn ')
		newText = newText.split('\n')[0].replace(/\{|\}/gi, ``)
		let newBody = node.body.getText(sf)
		newBody = newBody.substring(newBody.indexOf('{') + 1, newBody.lastIndexOf('}'))

		if (/pub/.test(newText)) {
			newText = newText.replace(/\(.*\)/gi, `()`)

			if (node.parameters.length) {
				newBody = READ_ARGS + newBody
			}

			node.parameters.forEach((param) => {
				const p = param.getText(sf)
				const [argName, argType] = p.split(':').map((v) => v.replace(/\(|\)|\{/gi, ``).trim())
				newBody = newBody.insertLineAfter(READ_ARGS, `
			let ${argName} = get_arg!(${toArgFunc(argType)}, args, ${toJsonKey(argName)});`
				)
			})
		}

		code = code.replace(text, `${newText} {
			${newBody}
		}`)
	})
	return code
}
