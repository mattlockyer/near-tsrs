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

test('contract init', async (t) => {
	try {
		await contractAccount.functionCall({
			contractId,
			methodName: 'init',
			args: {
				a: 21,
				b: 21,
				owner_id: contractId,
			},
			gas
		});
		t.true(true);
	} catch (e) {
		console.warn(e)
		t.true(false);
	}
});

test('contract checkOwner', async (t) => {
	try {
		await contractAccount.functionCall({
			contractId,
			methodName: 'checkOwner',
			args: {},
			gas
		});
		t.true(true);
	} catch (e) {
		console.warn(e)
		t.true(false);
	}
});

test('contract viewOwner', async (t) => {
	try {
		const owner = await contractAccount.viewFunction(contractId, 'viewOwner')
		t.is(owner, contractId)
	} catch (e) {
		console.warn(e)
		t.true(false);
	}
});