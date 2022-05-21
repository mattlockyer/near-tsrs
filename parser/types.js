
export const TYPES_BASE = `
pub type AccountId<'a> = &'a str;
`
export const stripQuotes = (v) => v.replace(/`|"|'/gi, ``)