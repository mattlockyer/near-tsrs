import { AccountId, u128 } from './lib/types'
import { NearContract, storage_write, storage_read } from './lib/NearContract'

export class Contract implements NearContract {

	public init(owner_id: AccountId, a: u128, b: u128) {
		this.printNumber(a + b);
		this.print(owner_id);
		storage_write("test", owner_id);
		const test: string = storage_read("test");
		this.print(test);
	}

	print(owner_id: AccountId) {
		console.log("The arguments are", owner_id);
	}

	printNumber(v: u128) {
		console.log("Number: ", v);
	}

}

