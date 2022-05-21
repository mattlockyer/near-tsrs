

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

		let age = get_arg!(get_uint, args, "\"age\":");
		let owner_id = get_arg!(get_string, args, "\"owner_id\":");
		print(owner_id, age)
	}

	fn print(owner_id: AccountId, age: u128) {
		log(&format!("The arguments are {:?} {:?}",  age, owner_id));
	}


