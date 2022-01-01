mod utils;

use crate::utils::*;

use near_sdk::{
	env, near_bindgen, Balance, AccountId, BorshStorageKey, PanicOnDefault, Promise,
	borsh::{self, BorshDeserialize, BorshSerialize},
	collections::{LookupMap, UnorderedMap, UnorderedSet},
	json_types::{U128},
};

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
	EventsByName,
    NetworksByOwner { event_name: String },
    Connections { network_owner_id: AccountId },
}

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Network {
	connections: UnorderedSet<AccountId>,
}

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Event {
	networks_by_owner: LookupMap<AccountId, Network>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
	owner_id: AccountId,
	events_by_name: UnorderedMap<String, Event>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
			owner_id,
			events_by_name: UnorderedMap::new(StorageKey::EventsByName),
        }
    }
	
    #[payable]
    pub fn create_event(&mut self, event_name: String) {
		let initial_storage_usage = env::storage_usage();

		assert_eq!(env::predecessor_account_id(), self.owner_id, "owner only");
		
        assert!(self.events_by_name.insert(&event_name.clone(), &Event{
			networks_by_owner: LookupMap::new(StorageKey::NetworksByOwner { event_name }),
		}).is_none(), "event exists");

        refund_deposit(env::storage_usage() - initial_storage_usage);
    }
	
    #[payable]
    pub fn create_connection(&mut self, event_name: String, new_connection_id: AccountId) {
		let initial_storage_usage = env::storage_usage();

		let network_owner_id = env::predecessor_account_id();
		let mut event = self.events_by_name.get(&event_name).expect("no event");
		let mut network = event.networks_by_owner.get(&network_owner_id);
		if network.is_none() {
			network = Some(Network{
				connections: UnorderedSet::new(StorageKey::Connections { network_owner_id: network_owner_id.clone() })
			})
		}
		let mut unwrapped_network = network.unwrap();

		unwrapped_network.connections.insert(&new_connection_id);
		event.networks_by_owner.insert(&network_owner_id, &unwrapped_network);

        refund_deposit(env::storage_usage() - initial_storage_usage);
    }

	/// views
	
    pub fn get_connections(&self, event_name: String, network_owner_id: AccountId, from_index: Option<U128>, limit: Option<u64>) -> Vec<AccountId> {
		let event = self.events_by_name.get(&event_name).expect("no event");
		let network = event.networks_by_owner.get(&network_owner_id).expect("no network");
		unordered_set_pagination(&network.connections, from_index, limit)
    }
}