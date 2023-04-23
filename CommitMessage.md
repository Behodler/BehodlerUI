# Massive Refactor of PyroToken UI

## Motivation

The UI projects of Behodler have been accumulating quite a bit of technical debt over the years. For the swap and pyro projects, they were extended from the original WeiDai project which itself predated many of the norms now employed and was one of my first forays into React.

It was originally intended that entirely new code bases would be written for the new designs that were commissioned. In the exuberance of the new era, UI devs enthusiastically threw their energies into contribution. However, as deadlines approached, and after many months of no delivery, devs failed to deliver and attrition took over. At this point, my hand was forced and I jumped in and took the codebase I knew well (weidai) and, in one month, produced the current UI for swap and pyro, conforming to the new designs. The new UI works smoothly and predictalby with no performance issues to speak of. However, it's a bit of a lipstick on a pig situation. If I can brag somewhat, I'm fairly impressed that the weidai stack held up so well, especially given that I pumped out 2 brand new UIs in a month. What looked like overengineering at the time of WeiDai's deployment turned out to be a dependable javascript foundation in the new era.

Eventually the current UI dev threw his hat in the ring and has proven to be a backbone of both reliability and quality. Much to his sadness, he had to inherit the rushed to market stack I was forced to produce at short notice with all it's idiosyncratic oddities (eg. I break React conventions often simply because I didn't take time to master React).

To safeguard the new incoming code against all bugs, he took a detour to produce a wonderful, sleak local testnet API to consume the deployment script I'd recently created so that UI devs can, in real time, test against the current contract architecture. However, the legacy UI was just not ready to consume a well formed API of mostly new contracts.

Getting the existing UI projects to consume the API required a fairly in depth knowledge of the contract stack. So at this point, it made more sense to ask him to pause and work on Limbo UI while I worked on wedding the UI to the new API.

In the process, I engaged in a bunch of code cleanup and refactoring in order to breath new life into this project.

The great challenge here will now be porting these changes across to the swap UI. Hopefully the changes here have been such that copy and pasting will be the primary means of bringing across the new.

## Code changes in this commit

**AllEcosystemAddresses** is the abstraction layer that handles address fetching. For local testnet, a call to the dev-env API is made. For all other networks, a (semi) hardcoded list is fetched.

All ABIs are now found in one file, **ABIs.json**
The old json files with all their truffle junk are scrapped.

*Sidenote on typechain*
Typechain doesn't really work nicely with web3. So in an ideal world, we'd move away from Web3 to ethersjs but this is a mammoth undertaking. We can do this a bit later. Doing so will breath a lot of vitality and life into the project. It will allow us to get rid of all those handrolled interfaces.

Legacy Behodler1, Liquid Queue and some other ghosts of the past have been removed.

Explicity PyroV3 vs V2 infrastructure has been added.

Many of the hooks for token fetching have been refactored to more closely match the Ecosystem and make consuming the API easier.

State hooks in the main trading page that update together have been joined into a single class so that updates happen atomically. New versions of React allow for atomic batch updates but not this version. Nonetheless, it's easier on the developer's mind if related properties are clustered together and updated as one. For instance, if the input address changes, the output address has to change. Similarly if either address changes, we have to investigate if the baseToken has a pyroV2 balance. So all 3 of these properties must update together always. This cuts down on having 3 useEffect blocks all vying for update-ness.

## Complete in this commit

The PyroToken UI can now gracefully handle a user who has both PyroV2 and PyroV3 balances. The flow is as follows:

1. Users can only mint PyroV3 from the front end. Minting PyroV2 will no longer be possible from the UI.
2. If the user flips from mint mode to redeem mode then
    a) if they have a pyroV2 balance, they will only be able to redeem PyroV2 until they no longer have a V2 balance. This forces the user to flush their old pyrotokens
    b) If they do not have a V2 balance, only then can they redeem PyroV3

## Still to do

Support for PyroWeth has not been added because of the Proxy support.

The migration popup for migrating many tokens still needs to be hooked up. However, now that the other components are working without bugs, this is trivial.

## Next steps

1. Add PyroWeth V2<->V3 support.
2. Migration popup
3. Test this thorougly on a public testnet.
4. Deploy PyroV3 to mainnet
5. Update PyroToken UI such that anyone can access V3 with migration UI in both mainnet and sepolia.
6. Celebrate (while praying for no bugs on mainnet).
