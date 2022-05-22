

#![cfg_attr(target_arch = "wasm32", no_std)]
#![cfg_attr(target_arch = "wasm32", feature(alloc_error_handler))]

#![allow(non_snake_case)]

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

mod sys;
use sys::*;
mod args;
use args::*;


pub type AccountId<'a> = &'a str;


	#[no_mangle]
	pub fn  init() {
        unsafe { near_sys::input(TEMP_REGISTER) };
        let data = register_read(TEMP_REGISTER);
        let args = expect(alloc::str::from_utf8(&data).ok());

		let b = get_arg!(get_uint, args, "\"b\":");
		let a = get_arg!(get_uint, args, "\"a\":");
		let owner_id = get_arg!(get_string, args, "\"owner_id\":");
		printNumber(a + b);
		print(owner_id);
		printNumber(env_read("storage_usage").into());
		storage_write("test",  owner_id);
		let tmp1653236079834 = &storage_read("test");let test = stringify(tmp1653236079834);
		print(test);
		print(stringify(&env_read_register("predecessor_account_id")));
		print(stringify(&env_read_register("current_account_id")));
		print(stringify(&env_read_register("signer_account_id")));
		printArray(env_read_register("signer_account_pk"));
		printArray(env_read_register("random_seed"));
		printNumber(env_read("block_index").into());
		printNumber(env_read("block_timestamp").into());
		printNumber(env_read("used_gas").into());
		printNumber(env_read("prepaid_gas").into());
		printNumber(env_read("storage_usage").into());
	}

	fn print(owner_id: AccountId) {
		log(&format!("String {:?}",  owner_id));
	}

	fn printArray(v: Vec<u8>) {
		log(&format!("String {:?}",  v));
	}

	fn printNumber(v: u128) {
		log(&format!("Number {:?}",  v));
	}


