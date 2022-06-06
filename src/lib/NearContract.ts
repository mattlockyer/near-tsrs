import { AccountId, u8, u64, u128 } from './types'

export interface NearContract {
	init(...args: any[]): void;
}

export const env = {
	// helper functions
	panic: (): void => {},
	// storage
	storage_write: (key: string, value: string | number) => {},
	storage_read: (key: string): string => '',
	// env_read_register
	predecessor_account_id: (): string => '',
	current_account_id: (): string => '',
	signer_account_id: (): string => '',
	signer_account_pk: (): Array<u8> => [],
	random_seed: (): Array<u8> => [],
	// env_read (u64)
	block_index: (): u64 => 0 as u64,
	block_timestamp: (): u64 => 0 as u64,
	prepaid_gas: (): u64 => 0 as u64,
	used_gas: (): u64 => 0 as u64,
	storage_usage: (): u64 => 0 as u64,
	// env promises
	promise_batch_create: (account: AccountId): u64 => 0 as u64,
	promise_batch_action_function_call: (
		promise_index: u64,
		method_name: string,
		args: object,
		amount: u128,
		gas: u64,
	) => {},
	// trying a simple promise
	promise: (args: {
		contractId: AccountId,
		methodName: string,
		args: object,
		amount: string,
		gas: u64,
	}) => {}
}