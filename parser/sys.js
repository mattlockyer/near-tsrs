export const SYS_BASE = `
use crate::*;

pub(crate) fn panic() -> ! {
    //* SAFETY: Assumed valid panic host function implementation
    unsafe { near_sys::panic() }
}

pub(crate) fn log(message: &str) {
    unsafe {
        near_sys::log_utf8(message.len() as _, message.as_ptr() as _);
    }
}

/// helper function to panic on None types.
pub(crate) fn expect<T>(v: Option<T>) -> T {
    if cfg!(target_arch = "wasm32") {
        // Allowing because false positive
        #[allow(clippy::redundant_closure)]
        v.unwrap_or_else(|| panic())
    } else {
        v.unwrap()
    }
}

/// helper function to read registers
pub(crate) fn register_read(id: u64) -> Vec<u8> {
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
`