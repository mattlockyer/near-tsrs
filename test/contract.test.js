const test = require('ava');
const { getAccount, init, getAccountBalance, stateCost } = require('./test-utils');
const getConfig = require("./config");
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

test('users initialized', async (t) => {
	aliceId = 'alice.' + contractId;
	bobId = 'bob.' + contractId;
	alice = await getAccount(aliceId);
	bob = await getAccount(bobId);

	t.true(true);
});

test('create an event', async (t) => {
	event_name = 'event-' + Date.now();
	console.log(event_name, event_name.length)

	const balanceBefore = await getAccountBalance(contractId)

	const res = await contractAccount.functionCall({
		contractId,
		methodName: 'create_event',
		args: {
			event_name,
		},
		gas,
		attachedDeposit,
	});

	const balanceAfter = await getAccountBalance(contractId)
	console.log('event storage cost:', stateCost(balanceBefore, balanceAfter))

	t.is(res?.status?.SuccessValue, '');
});

test('get events', async (t) => {
	const res = await contractAccount.viewFunction(
		contractId,
		'get_events',
		{}
	);

	console.log(res)

	t.true(res.length >= 1);
});

test('create a connection', async (t) => {
	console.log(bobId, bobId.length)

	const balanceBefore = await getAccountBalance(contractId)

	const res = await alice.functionCall({
		contractId,
		methodName: 'create_connection',
		args: {
			event_name,
			new_connection_id: bobId,
		},
		gas,
		attachedDeposit,
	});

	const balanceAfter = await getAccountBalance(contractId)
	console.log('connection storage cost:', stateCost(balanceBefore, balanceAfter))

	t.is(res?.status?.SuccessValue, '');
});

test('create another connection', async (t) => {
	const carolId = 'car.' + contractId
	console.log(carolId, carolId.length)

	const balanceBefore = await getAccountBalance(contractId)

	const res = await alice.functionCall({
		contractId,
		methodName: 'create_connection',
		args: {
			event_name,
			new_connection_id: carolId,
		},
		gas,
		attachedDeposit,
	});

	const balanceAfter = await getAccountBalance(contractId)
	console.log('another connection storage cost:', stateCost(balanceBefore, balanceAfter))

	t.is(res?.status?.SuccessValue, '');
});

test('create another connection 2', async (t) => {
	let daveId = 'dav0000.' + contractId
	console.log(daveId, daveId.length)

	const balanceBefore = await getAccountBalance(contractId)

	const res = await alice.functionCall({
		contractId,
		methodName: 'create_connection',
		args: {
			event_name,
			new_connection_id: daveId,
		},
		gas,
		attachedDeposit,
	});

	const balanceAfter = await getAccountBalance(contractId)
	console.log('another connection 2 storage cost:', stateCost(balanceBefore, balanceAfter))

	t.is(res?.status?.SuccessValue, '');
});

test('create another connection 3', async (t) => {
	let daveId = 'dav00000000.' + contractId
	console.log(daveId, daveId.length)

	const balanceBefore = await getAccountBalance(contractId)

	const res = await alice.functionCall({
		contractId,
		methodName: 'create_connection',
		args: {
			event_name,
			new_connection_id: daveId,
		},
		gas,
		attachedDeposit,
	});

	const balanceAfter = await getAccountBalance(contractId)
	console.log('another connection 3 storage cost:', stateCost(balanceBefore, balanceAfter))

	t.is(res?.status?.SuccessValue, '');
});

test('get connections', async (t) => {
	const res = await alice.viewFunction(
		contractId,
		'get_connections',
		{
			event_name,
			network_owner_id: aliceId,
		}
	);

	console.log(res)

	t.true(res.length >= 1);
});