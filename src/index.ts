import { AccountId, u128 } from './lib/types'
import { NearContract } from './lib/NearContract'

export class Contract implements NearContract {

	public init(owner_id: AccountId, a: u128, b: u128) {
		this.print(owner_id);
		this.printNumber(a + b);
	}

	print(owner_id: AccountId) {
		console.log("The arguments are", owner_id);
	}

	printNumber(v: u128) {
		console.log("Number: ", v);
	}

}

