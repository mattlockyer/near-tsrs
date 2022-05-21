import test from 'ava'
import {
	init,
} from './test-utils.js'
import getConfig from "../utils/config.js";
const {
	contractId,
	gas,
	attachedDeposit,
} = getConfig();

// test.beforeEach((t) => {
// });

let contractAccount, event_name, aliceId, bobId, alice, bob;

test('contract is deployed', async (t) => {
	contractAccount = await init();

	t.is(contractId, contractAccount.accountId);
});
