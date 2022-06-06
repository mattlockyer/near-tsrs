export type AccountId = string;

type uint8<K, T> = K & ({ __uint8: T })
type uint64<K, T> = K & ({ __uint64: T })
type uint128<K, T> = K & ({ __uint128: T })

export type u8 = uint8<number, "u8">
export type u64 = uint64<number, "u64">
export type u128 = uint128<number, "u128">

declare global {
	interface Number {
		into_u8(): u8;
		into_u64(): u64;
		into_u128(): u128;
	}
}

Number.prototype.into_u8 = function(): u8 {
	return this.valueOf() as u8
}

Number.prototype.into_u64 = function(): u64 {
	return this.valueOf() as u64
}

Number.prototype.into_u128 = function(): u128 {
	return this.valueOf() as u128
}
