
		
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
use alloc::string::String;
use alloc::vec;
use alloc::vec::Vec;

mod sys;
use sys::*;
mod args;
use args::*;

		
pub type AccountId<'a> = &'a str;

		




#[no_mangle]

	pub fn init()  {
			
        unsafe { near_sys::input(TEMP_REGISTER) };
        let data = register_read(TEMP_REGISTER);
        let args = expect(alloc::str::from_utf8(&data).ok());

			let b = get_arg!(get_uint, args, "\"b\":");
			let a = get_arg!(get_uint, args, "\"a\":");
			let owner_id = get_arg!(get_string, args, "\"owner_id\":");

		let temp = owner_id;
		print(temp);
		storage_write("owner_id", temp);

		printNumber(a + b as u128);

		// let randomSeed2 = env.random_seed();
		// for (let unit of randomSeed2) {
		// 	printNumber(unit.into());
		// }
		

				let mut tmp_1888427484079 = env_read_register("signer_account_pk");
				tmp_1888427484079.remove(0);
				let mut tmp_2534813217114 = String::from("11111111111111111111111111111111111111111111");
				bs58::encode(&tmp_1888427484079).into(tmp_2534813217114.as_mut_str());
				

		let pk = tmp_2534813217114;

		log(&format!("{:?}", pk));


				unsafe {
					

let tmp_1660025143946 = "testnet";

let tmp_1842354673873 = "create_account";

let tmp_2633018514522 = format!("{{\"new_account_id\":\"abc-92845698376453.testnet\",\"new_public_key\":{:?},\"temp\":10000}}", pk);

let tmp_2049098496083 = 1000000000000000000000000 as u128;

let tmp_2521703196423 = 100000000000000 as u64;


					near_sys::promise_create(
						tmp_1660025143946.len() as u64,
						tmp_1660025143946.as_ptr() as u64,
						tmp_1842354673873.len() as u64,
						tmp_1842354673873.as_ptr() as u64,
						tmp_2633018514522.len() as u64,
						tmp_2633018514522.as_ptr() as u64,
						tmp_2049098496083.to_le_bytes().as_ptr() as u64,
						tmp_2521703196423,
					);
				}

		


		
		// print(owner_id);
		// printNumber(env.storage_usage().into());
		// print(env.predecessor_account_id());
		// print(env.current_account_id());
		// print(env.signer_account_id());
		// printArray(env.signer_account_pk());
		// printNumber(env.block_index().into());
		// printNumber(env.block_timestamp().into());
		// printNumber(env.used_gas().into());
		// printNumber(env.prepaid_gas().into());

		// let randomSeed = env.random_seed();
		// for (let mut i = 0; i < randomSeed.length; i+=4) {
		// 	// use .into() because randomSeed<u8> and printNumber takes u128
		// 	printNumber(randomSeed[i].into());
		// }

		// let randomSeed3 = env.random_seed();
		// for (let mut index in randomSeed3) {
		// 	printNumber(randomSeed3[index].into());
		// }

	



		}

	// public checkOwner() {
	// 	if (env.predecessor_account_id() != env.storage_read("owner_id")) {
	// 		env.panic();
	// 	}
	// }

#[no_mangle]

	fn print(owner_id: AccountId)  {
			
		log(&format!("String {:?}",  owner_id));
	
		}

#[no_mangle]

	fn printNumber(v: u128)  {
			
		log(&format!("Number {:?}",  v));
	
		}

	// printArray(v: Array<u8>) {
	// 	console.log("String", v);
	// }

	// public viewOwner(): AccountId {
	// 	let owner = env.storage_read("owner_id");
	// 	console.log(owner);
	// 	return owner;
	// }


		