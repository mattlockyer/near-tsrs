

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
use near_sys;
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

		printNumber(a + b as u128);

		let randomSeed2 = env_read_register("random_seed");
		for unit in randomSeed2 {
			printNumber(unit.into());
		}
		
		let pk = env_read_register("signer_account_pk");

		unsafe {
			let tmp612105059450 = "testnet";
			let tmp583830901173 = "create_account";
			let tmp706875769979 = "{\"new_account_id\":\"something\",\"new_account_pk\":\"pk\"}";
			let tmp352957425572 = 1000000000000000000000000 as u128;
			let tmp665788205747 = 100000000000000 as u64;
		
			near_sys::promise_create(
				tmp612105059450.len() as u64,
				tmp612105059450.as_ptr() as u64,
				tmp583830901173.len() as u64,
				tmp583830901173.as_ptr() as u64,
				tmp706875769979.len() as u64,
				tmp706875769979.as_ptr() as u64,
				tmp352957425572.to_le_bytes().as_ptr() as u64,
				tmp665788205747,
			)
		};



		



	}

	
	#[no_mangle]
	pub fn checkOwner() {let tmp412909936913 = &storage_read("owner_id");
		if stringify(&env_read_register("predecessor_account_id")) != stringify(tmp412909936913) {
			panic();
		}
	}

	
	#[no_mangle]
	pub fn viewOwner() {let tmp279173316759 = &storage_read("owner_id");
		let owner = stringify(tmp279173316759);
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










