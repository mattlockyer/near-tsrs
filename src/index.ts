import { AccountId, u128, u8 } from './lib/types'
import { NearContract, env } from './lib/NearContract'

export class Contract implements NearContract {

	public init(owner_id: AccountId, a: u128, b: u128) {
		this.printNumber(a + b);
		this.print(owner_id);
		this.printNumber(env.storage_usage());
		env.storage_write("test", owner_id);
		const test: string = env.storage_read("test");
		this.print(test);
		this.print(env.predecessor_account_id());
		this.print(env.current_account_id());
		this.print(env.signer_account_id());
		this.printArray(env.signer_account_pk());
		this.printArray(env.random_seed());
		this.printNumber(env.block_index());
		this.printNumber(env.block_timestamp());
		this.printNumber(env.used_gas());
		this.printNumber(env.prepaid_gas());
		this.printNumber(env.storage_usage());
	}

	print(owner_id: AccountId) {
		console.log("String", owner_id);
	}

	printArray(v: Array<u8>) {
		console.log("String", v);
	}

	printNumber(v: u128) {
		console.log("Number", v);
	}

}

