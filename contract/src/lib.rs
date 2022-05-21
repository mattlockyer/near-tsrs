

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
		print(owner_id);
		printNumber(a + b);
	}

	fn print(owner_id: AccountId) {
		log(&format!("The arguments are {:?}",  owner_id));
	}

	fn printNumber(v: u128) {
		log(&format!("Number:  {:?}",  v));
	}


