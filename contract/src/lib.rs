

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



	#[no_mangle]
	pub fn init	() {
		unsafe { near_sys::input(TEMP_REGISTER) };
		let data = register_read(TEMP_REGISTER);
		let (_, owner_id_1) = expect(expect(alloc::str::from_utf8(&data).ok()).split_once("\"owner_id\":\""));
		let (owner_id, _) = expect(owner_id_1.split_once("\""));
		log(&format!("The owner of this contract will be... {:?}",  owner_id));
	}


