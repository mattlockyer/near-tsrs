declare global {
	interface Number {
		into(): u8|u64|u128;
	}
}

Number.prototype.into = function(): u8|u64|u128 {
	return this.valueOf()
}

export type AccountId = string;
export type u8 = number;
export type u64 = number;
export type u128 = number;