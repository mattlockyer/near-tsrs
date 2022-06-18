
		
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

		




	pub fn init(owner_id: AccountId, a: u128, b: u128) {

		let temp = owner_id;
		print(temp);
		storage_write(owner_id, temp);

		printNumber(a + b as u128);

		let randomSeed2 = env_read_register("random_seed");
		for unit in randomSeed2 {
			printNumber(unit.into_u128());
		}
		
		let pk = env_read_register("signer_account_pk");


				unsafe {
					near_sys::promise_create(
						
					)
				}

		


		
		print(owner_id);
		printNumber(env::into_u128());
		print(stringify(&env_read_register("predecessor_account_id")));
		print(stringify(&env_read_register("current_account_id")));
		print(stringify(&env_read_register("signer_account_id")));
		printArray(env_read_register("signer_account_pk"));
		printNumber(env::into_u128());
		printNumber(env::into_u128());
		printNumber(env::into_u128());
		printNumber(env::into_u128());
		printNumber(env_read("storage_usage").into().into_u128());

		let randomSeed = env_read_register("random_seed");
		for i in (0..randomSeed.len()).step_by(4) {
			// use .into() because randomSeed<u8> and printNumber takes u128
			printNumber(randomSeed[i].into_u128());
		}

		let randomSeed3 = env_read_register("random_seed");
		for (index, _x) in randomSeed3.iter().enumerate() {
			printNumber(randomSeed3[index].into_u128());
		}

	}

	pub fn checkOwner() {
let mut tmp_2478418482491 = &storage_read(owner_id);

		if (stringify(&env_read_register("predecessor_account_id")) != stringify(tmp_2478418482491)) {
			env::panic();
		}
	}

	pub fn viewOwner(): AccountId {
let mut tmp_2642473192552 = &storage_read(owner_id);

		let owner = stringify(tmp_2642473192552);
		log(&format!("{:?}", owner));
		return owner;
	}

	fn print(owner_id: AccountId) {
		log(&format!("String {:?}",  owner_id));
	}

	fn printArray(v: Array<u8>) {
		log(&format!("String {:?}",  v));
	}

	fn printNumber(v: u128) {
		log(&format!("Number {:?}",  v));
	}


		