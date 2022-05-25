

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
	pub fn init() {
        unsafe { near_sys::input(TEMP_REGISTER) };
        let data = register_read(TEMP_REGISTER);
        let args = expect(alloc::str::from_utf8(&data).ok());

			let b = get_arg!(get_uint, args, "\"b\":");
			let a = get_arg!(get_uint, args, "\"a\":");
			let owner_id = get_arg!(get_string, args, "\"owner_id\":");

		let temp = owner_id;
		print(temp);
		storage_write("owner_id",  temp);

		printNumber(a + b);





	}

	
	#[no_mangle]
	pub fn checkOwner() {
		let tmp735666324057 = &storage_read("owner_id");
		if stringify(&env_read_register("predecessor_account_id")) != stringify(tmp735666324057) {
			panic();
		}
	}

	
	#[no_mangle]
	pub fn viewOwner() {
		let tmp284629443140 = &storage_read("owner_id");
		let owner = stringify(tmp284629443140);
		log(&format!("{:?}", owner));
		return_string(owner);
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


