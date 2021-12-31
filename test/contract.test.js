const test = require('ava');
const { contractId } = require('./near-utils');
const { getAccount, init } = require('./test-utils');

// test.beforeEach((t) => {
// });

test('contract is deployed', async (t) => {
	/// users
	const aliceId = 'alice.' + contractId, bobId = 'bob.' + contractId;
	const alice = await getAccount(aliceId), bob = await getAccount(bobId);
	
	const contractAccount = await init()

	t.is(contractId, contractAccount.accountId)
});