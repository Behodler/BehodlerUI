# Pyrotoken V3 functionality complete

This commit signals the completion of all features. Tokens can be migrated en mass and redeemed. 
Note that some transactions, by the nature of Ethereum and the design of ERC20 tokens, cannot be executed atomically. When a user clicks approve all tokens for migrations and that user has 5 V2 PyroTokens, then 5 metamask windows will popup. 
But the migration is one transaction. So it's still more gas to do it manually than through the migration contract. However, it's always more prudent to not use new contracts and do it yourself.

TODO before unveiling to the mob:

1. Test code against sepolia testnet (redeploy testnet to account for the new test data).
2. Test some edge cases that may involve unpleasant UX (eg. clicking too many times on the migrate button)
3. Some margin issues in the menu.