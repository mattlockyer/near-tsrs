import { AccountId, u128, u64, u8 } from './lib/types'
import { NearContract, env } from './lib/NearContract'

export class Contract implements NearContract {

	public init(owner_id: AccountId, a: u128, b: u128) {

		const temp = owner_id;
		this.print(temp);
		env.storage_write("owner_id", temp);

		this.printNumber(a + b as u128);

		const randomSeed2 = env.random_seed();
		for (const unit of randomSeed2) {
			this.printNumber(unit.into_u128());
		}
		
		const pk = env.signer_account_pk();

		env.promise({
			contractId: "testnet",
			methodName: "create_account",
			args: {
				new_account_id: "something",
				new_account_pk: pk,
			},
			amount: '1000000000000000000000000',
			gas: 100000000000000 as u64,
		});

		// const id = env.promise_batch_create("testnet");
		// env.promise_batch_action_function_call(
		// 	id,
		// 	"create_account",
		// 	{
		// 		new_account_id: "something",
		// 		new_account_pk: "something",
		// 	},
		// 	100000000000000000 as u128,
		// 	gas
		// )


		/*
		this.print(owner_id);
		this.printNumber(env.storage_usage());
		this.print(env.predecessor_account_id());
		this.print(env.current_account_id());
		this.print(env.signer_account_id());
		this.printArray(env.signer_account_pk());
		this.printNumber(env.block_index());
		this.printNumber(env.block_timestamp());
		this.printNumber(env.used_gas());
		this.printNumber(env.prepaid_gas());
		this.printNumber(env.storage_usage());
		*/

		// const randomSeed = env.random_seed();
		// for (let i = 0; i < randomSeed.length; i+=4) {
		// 	// use .into() because randomSeed<u8> and printNumber takes u128
		// 	this.printNumber(randomSeed[i].into());
		// }

		// const randomSeed3 = env.random_seed();
		// for (let index in randomSeed3) {
		// 	this.printNumber(randomSeed3[index].into());
		// }

	}

	public checkOwner() {
		if (env.predecessor_account_id() != env.storage_read("owner_id")) {
			env.panic();
		}
	}

	public viewOwner(): AccountId {
		const owner = env.storage_read("owner_id");
		console.log(owner);
		return owner;
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

