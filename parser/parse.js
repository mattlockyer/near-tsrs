import fs from 'fs';

const CONTRACT_BASE = `
#![cfg_attr(target_arch = "wasm32", no_std)]
#![cfg_attr(target_arch = "wasm32", feature(alloc_error_handler))]

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[cfg(target_arch = "wasm32")]
#[panic_handler]
#[no_mangle]
pub unsafe fn on_panic(_info: &::core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}

#[cfg(target_arch = "wasm32")]
#[alloc_error_handler]
#[no_mangle]
pub unsafe fn on_alloc_error(_: core::alloc::Layout) -> ! {
    core::arch::wasm32::unreachable()
}

const TEMP_REGISTER: u64 = 0;

extern crate alloc;
use alloc::format;
use alloc::vec;
use alloc::vec::Vec;

fn panic() -> ! {
    //* SAFETY: Assumed valid panic host function implementation
    unsafe { near_sys::panic() }
}

fn log(message: &str) {
    unsafe {
        near_sys::log_utf8(message.len() as _, message.as_ptr() as _);
    }
}

/// helper function to read registers
fn register_read(id: u64) -> Vec<u8> {
    let len = unsafe { near_sys::register_len(id) };
    if len == u64::MAX {
        // Register was not found
        panic()
    }
    let data = vec![0u8; len as usize];

    //* SAFETY: Length of buffer is set dynamically based on "register_len" so it will always
    //* 		be sufficient length.
    unsafe { near_sys::read_register(id, data.as_ptr() as u64) };
    data
}

/// helper function to panic on None types.
fn expect<T>(v: Option<T>) -> T {
    if cfg!(target_arch = "wasm32") {
        // Allowing because false positive
        #[allow(clippy::redundant_closure)]
        v.unwrap_or_else(|| panic())
    } else {
        v.unwrap()
    }
}
`

const CONSOLE_LOG = 'console.log'

try {
	let data = fs.readFileSync('./src/index.ts', 'utf8');
	let newData = CONTRACT_BASE

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
				newInner += v.replace(/`|"|'/gi, ``)
			}
		})
		newInner += `"` + (newInnerArgs.length > 0 ? `, ${newInnerArgs.join(',')}` : ``)

		data = data.replace(match, `log(&format!(${newInner}))`)
	}

	/// parse functions
	const contractData = data.substring(data.indexOf(`implements NearContract {`))
	const methodSignatureMatches = data.match(/\s+.+\(.*\)\s*\{/gi).map((v) => v.trim())
	methodSignatureMatches.forEach((v, i) => {

		if (i === 0) {
			data = data.substring(data.indexOf(v), data.length - 1)
		}

		const methodName = v.substring(0, v.indexOf('('))
		data = data.replace(methodName,
`
	#[no_mangle]
	pub fn ${methodName}`
		)

		const argMatch = v.substring(v.indexOf('('), v.indexOf('{') + 1)
		const [argName, argType] = argMatch.split(':').map((v) => v.trim().replace(/\(|\)/gi, ``))
		data = data.replace(argMatch,
`	() {
		unsafe { near_sys::input(TEMP_REGISTER) };
		let data = register_read(TEMP_REGISTER);
		let (_, ${argName}_1) = expect(expect(alloc::str::from_utf8(&data).ok()).split_once("\\"${argName}\\":\\""));
		let (${argName}, _) = expect(${argName}_1.split_once("\\""));`
		)
	})

	const content = `
${CONTRACT_BASE}

${data}
`;

	try {
		fs.writeFileSync('./contract/src/lib.rs', content);
		// file written successfully
	} catch (err) {
		console.error(err);
	}

} catch (err) {
	console.error(err);
}
  