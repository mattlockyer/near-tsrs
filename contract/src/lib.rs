use std::collections::HashMap;
use near_sdk::{
	env, near_bindgen, serde_json::json, Balance, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue,
	borsh::{self, BorshDeserialize, BorshSerialize},
	collections::{LazyOption, LookupMap, UnorderedMap, UnorderedSet},
	serde::{Deserialize, Serialize},
	json_types::{U64, U128},
};

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
	Items
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
	owner_id: AccountId,
	items: LookupMap<AccountId, String>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
			owner_id,
			items: LookupMap::new(StorageKey::Items),
        }
    }
}
	
/// from https://github.com/near/near-sdk-rs/blob/e4abb739ff953b06d718037aa1b8ab768db17348/near-contract-standards/src/non_fungible_token/utils.rs#L29

pub fn refund_deposit(storage_used: u64) {
    let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit();

    assert!(
        required_cost <= attached_deposit,
        "Must attach {} yoctoNEAR to cover storage",
        required_cost,
    );

    let refund = attached_deposit - required_cost;
	// log!("refund_deposit amount {}", refund);
    if refund > 1 {
        Promise::new(env::predecessor_account_id()).transfer(refund);
    }
}