import test from 'ava'
import {
	contractAccount,
} from './test-utils.js'
import getConfig from "../utils/config.js";
const {
	contractId,
	gas,
	attachedDeposit,
} = getConfig();

// test.beforeEach((t) => {
// });

/// try to call new on contract
test('contract is deployed', async (t) => {
	try {
		await contractAccount.functionCall({
			contractId,
			methodName: 'init',
			args: {
				age: 42,
				owner_id: "someone.near",
			},
			gas
		});
		t.true(true);
	} catch (e) {
		console.warn(e)
		t.true(false);
	}
});
