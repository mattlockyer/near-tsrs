import { AccountId, u128, u8 } from './lib/types'
import { NearContract, env } from './lib/NearContract'

export class Contract implements NearContract {

	public init(owner_id: AccountId, a: u128, b: u128) {

		const temp = owner_id;
		this.print(temp);

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
		this.printNumber(env.block_index());
		this.printNumber(env.block_timestamp());
		this.printNumber(env.used_gas());
		this.printNumber(env.prepaid_gas());
		this.printNumber(env.storage_usage());


		const randomSeed = env.random_seed();
		// for (let i = 0; i < randomSeed.length; i+=4) {
		// 	// use .into() because randomSeed<u8> and printNumber takes u128
		// 	this.printNumber(randomSeed[i].into());
		// }

		// for (const unit of randomSeed) {
		// 	this.printNumber(unit.into());
		// }

		for (let index in randomSeed) {
			this.printNumber(randomSeed[index].into());
		}

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

