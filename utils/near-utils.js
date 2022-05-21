import fs from 'fs'
import * as nearAPI from 'near-api-js'
import getConfig from './config.js'
const { nodeUrl, walletUrl, networkId, contractId, isBrowser } = getConfig();

const {
	keyStores: { InMemoryKeyStore, BrowserLocalStorageKeyStore },
	Near,
	Account,
	Contract,
	KeyPair,
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

let credentials, keyStore;

if (isBrowser) {
	keyStore = new BrowserLocalStorageKeyStore();
} else {
	/// nodejs (for tests)
	try {
		console.log(`Loading Credentials: ${process.env.HOME}/.near-credentials/${networkId}/${contractId}.json`);
		credentials = JSON.parse(
			fs.readFileSync(
				`${process.env.HOME}/.near-credentials/${networkId}/${contractId}.json`
			)
		);
	} catch(e) {
		console.warn(`Loading Credentials: ./neardev/${networkId}/${contractId}.json`);
		credentials = JSON.parse(
			fs.readFileSync(
				`./neardev/${networkId}/${contractId}.json`
			)
		);
	}
	keyStore = new InMemoryKeyStore();
	keyStore.setKey(
		networkId,
		contractId,
		KeyPair.fromString(credentials.private_key)
	);
}

const near = new Near({
	networkId,
	nodeUrl,
	walletUrl,
	deps: { keyStore },
});
const { connection } = near;
const contractAccount = new Account(connection, contractId);

export {
	near,
	credentials,
	keyStore,
	connection,
	contractId,
	contractAccount,
};
