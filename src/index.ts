import { AccountId } from './lib/types'
import { NearContract } from './lib/NearContract'

export class Contract implements NearContract {

	init(owner_id: AccountId) {
		console.log("The owner of this contract will be...", owner_id);
	}

}

