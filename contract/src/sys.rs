
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

pub(crate) fn stringify(data: &[u8]) -> &str {
    expect(alloc::str::from_utf8(&data).ok())
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

/// helper function to write storage
pub(crate) fn storage_write(key: &str, value: &str) {
    //* SAFETY: Assumes valid storage_write implementation.
    unsafe {
        near_sys::storage_write(
            key.len() as u64,
            key.as_ptr() as u64,
            value.len() as u64,
            value.as_ptr() as u64,
            TEMP_REGISTER,
        );
    }
}

/// helper function to read storage
pub(crate) fn storage_read(key: &str) -> Vec<u8> {
    let key_exists =
        unsafe { near_sys::storage_read(key.len() as u64, key.as_ptr() as u64, TEMP_REGISTER) };
    if key_exists == 0 {
        // Return code of 0 means storage key had no entry.
        sys::panic()
    }
    register_read(TEMP_REGISTER)
}

/// helper function to read env values that are u64 only
pub(crate) fn env_read(key: &str) -> u64 {
    unsafe {
        match key.as_bytes() {
            b"block_index" => near_sys::block_index(),
b"block_timestamp" => near_sys::block_timestamp(),
b"prepaid_gas" => near_sys::prepaid_gas(),
b"used_gas" => near_sys::used_gas(),
b"storage_usage" => near_sys::storage_usage(),
            _ => panic(),
        }
    }
}

/// helper function to read env values that need register read
pub(crate) fn env_read_register(key: &str) -> Vec<u8> {
    unsafe {
        match key.as_bytes() {
            b"predecessor_account_id" => near_sys::predecessor_account_id(TEMP_REGISTER),
b"current_account_id" => near_sys::current_account_id(TEMP_REGISTER),
b"signer_account_id" => near_sys::signer_account_id(TEMP_REGISTER),
b"signer_account_pk" => near_sys::signer_account_pk(TEMP_REGISTER),
b"random_seed" => near_sys::random_seed(TEMP_REGISTER),
            _ => panic(),
        };
    }
    register_read(TEMP_REGISTER)
}
