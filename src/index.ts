import { AccountId, u128 } from './lib/types'
import { NearContract } from './lib/NearContract'

export class Contract implements NearContract {

	public init(owner_id: AccountId, age: u128) {
		console.log("The arguments are", age, owner_id);
	}

}

