

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
            ${
                [
                    'block_index',
                    'block_timestamp',
                    'prepaid_gas',
                    'used_gas',
                    'storage_usage',
                ].map((v) => `b"${v}" => near_sys::${v}()`).join(',\n')
            },
            _ => panic(),
        }
    }
}

/// helper function to read env values that need register read
pub(crate) fn env_read_register(key: &str) -> Vec<u8> {
    unsafe {
        match key.as_bytes() {
            ${
                [
                    'predecessor_account_id',
                    'current_account_id',
                    'signer_account_id',
                    'signer_account_pk',
                    'random_seed'
                ].map((v) => `b"${v}" => near_sys::${v}(TEMP_REGISTER)`).join(',\n')
            },
            _ => panic(),
        };
    }
    register_read(TEMP_REGISTER)
}
`
