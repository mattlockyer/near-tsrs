const DOUBLE_QUOTE = `\\"`
export const toJsonKey = (key) => `"${DOUBLE_QUOTE}${key}${DOUBLE_QUOTE}:"`
export const toString = (key) => `"${key}"`
export const toArgFunc = (key) => {
    switch (key) {
        case 'u128': return 'get_uint';
        default: return 'get_string'
    }
}

export const ARGS_BASE = `
use crate::*;

pub const DOUBLE_QUOTE: &str = "${DOUBLE_QUOTE}";
pub const COMMA: &str = ",";
pub const END_JSON: &str = "}";

pub fn get_string<'a>(data: &'a str, key: &str) -> &'a str {
    let (_, value) = expect(data.split_once(key));
    let (_, value) = expect(value.split_once(DOUBLE_QUOTE));
    let (value, _) = expect(value.split_once(DOUBLE_QUOTE));
    value
}

pub fn get_uint(data: &str, key: &str) -> u128 {
    let (_, value) = expect(data.split_once(key));
    let comma_value = value.split_once(COMMA);
    let value = if let Some(comma_value) = comma_value {
        let (value, _) = comma_value;
        value
    } else {
        let (value, _) = expect(value.split_once(END_JSON));
        value
    };
    expect(value.parse().ok())
}

#[macro_export]
macro_rules! get_arg {
    ($def:ident, $data:expr, $key:expr) => {
        $def($data, $key)
    };
}
`

export const READ_ARGS = `() {
        unsafe { near_sys::input(TEMP_REGISTER) };
        let data = register_read(TEMP_REGISTER);
        let args = expect(alloc::str::from_utf8(&data).ok());
`
