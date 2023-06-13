## Wow that was intense
Async state management in React is no joke. It seems that if you're creating anything with state that is more complex than a few flat primitives and which relies on async updates AND has to be in a valid state, you're in a for a wild ride through the treacherous valleys of javascript.

I now have appreciation for why (unnamed) popular AMM front ends are so lethargic in loading.

### Libraries required to make this commit successful
1. Lodash for deep cloning and deep comparison
2. Jotai for a safer assignment of state than hooks and to reduce the impact of sharing state

## Why did this commit take an eternity? Where is Jason???? Wen???

"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton

This commit was a headfirst dive into cache invalidation alas. It's fairly hard to explain why this takes long and is hard when making analogies for non programmers but I'll try:

There are some events in life for which the cause and effect are almost instaneously proximate. For instance, when dealing with light on the scale of Earth distances, we think of light of getting from A to B as instantaneous. If I turn on a flashlight while pointing at a wall, the wall lights up immediately. When I turn off the flashlight, the light vanishes. I can repeat the experiment a few more times before discovering the relationship between the flashlight and the light on the wall.

Now let's switch to sound: two people stand 500 meters apart. One of them has a brass bell. The one without the bell sends a signal such as waving his hand and the one with the bell clangs it the moment he sees the signal. The moment the signaller signals his intent, he starts a stop watch. As soon as he hears the clang, he stops. They can repeat this experiment a few times to extrapolate the speed of sound.

Now suppose that while this bell experiment is going on, someone else nearby hides behind a tree the same bell and rings their bell at random intervals. The signaller now has a source of noise that reduces the confidence of the whole experiment. When he hears a clang, he can't be sure that it was in response to his signal or just random noise created by the tree dwelling troll.

You can see this effect in play during the onset of an approaching thunderstorm. When the lightning begins flashing, many seconds pass before thunder is heard. If there are many flashes, it's very difficult to attribute thunder peals to the correct lightning flash. Things get out of sync in your mental cause and effect monitoring.

So we can see that when there is a distance in time or space between cause and effect, unrelated but similar events create a chaotic prediction environment.

### Caching
In a web application, information retrieved from the web or from the blockchain is often stored in the local browser of the user. This process of taking information from distant sources and storing it locally is known in computer science as caching. For instance, an AMM may fetch the prices of various tokens. Not only that but user balances and a whole bunch of other related info. This is all stored in a big memory representation called a view model.
One of the values stored is the input amount. The user can update this value and when they do, a bunch of results are calculated such as the resultant output amount. These results are all stored in the view model.

We can call the user input the independent value and the output that is calculated the dependent value. The dependent value is dependent on the user input as well as all the other info such as the exchange rate, slippage and so on. If all the dependent info is fixed we can easily deduce if the resultant output is correct. It's a flashlight on and off scenario. But the blockchain is always updating and so when we type an input value and get an unexpected amount, we don't know if this is because of a bug or because the blockchain info has changed. And so we need to monitor for changes in current prices and so on and have a diagnostic confirmation of this update. It would be like tracking lightning flashes, writing them down and then listening for thunder peals and making the correct associations. Not too hard. 
It gets harder when you start adding in unrelated noise data that has an impact on the view model. For instance, if the user performs a transaction on another dapp, we should monitor for their balances and update those. Then when we add context dependency, things get even hairier. For pyro tokens, the rules of minting are different for redeeming. It's not just a matter of changing the ethereum function. So when minting changes, the same base data has to be interpreted and calculated against differently. 
So when a user enters an input, we have to check if the context is being interpreted correctly. 
In the bell experiment, we may have two types of bells, each with a different tone. The signaller has to signal both to ring a bell and which bell to ring. If there's a misunderstanding between signal sender and receiver, the signaller will expect to hear one sound and will hear another instead. The signaller then has to decide if the bell sound they hear is even valid.

### Add React state issues
With React, we run into non trivial issues of receiving new state and deciding if it is actually new, of changing it in such a way that React knows it's new and of telling the receiving components that read this state that they should update themselves.
For complex state, this is non trivial. It's like we have the bell experiment but this time, the bell holder is holding a whole array of instruments, the signaller can't see which instrument is being rung and is unsure of the delay. Adding in the blockchain is like placing someone behind a tree with the same collection of instruments and telling them to randomly clang them. The signaller raises a flag (or whatever the signal is) and hears sounds but also hears sounds when the flag isn't raised. The signaller then later learns that the signal receiver has been ignoring some of his signals.

If there's a misunderstanding in which signal is for which instrument (bug), the process of discovering the truth enters into the mystical.

## TODO
1. PyroWeth minting and redeeming
2. Mass migration

## In response to predicted objections

### Objections

1. Behodler will only be ready in 2058 during the final days of the reign of the antichrist!
2. hire a million devs!1!
3. If this took so long, does your TODO list mean anything.
4. We need more updates. Perhaps an update every half hour would help. Also could we install 3 webcams so as to construct a 3D model of Jason as he codes?

### Responses

1. This caching issue is an example of why there's no relationship between features remaining and time estimated. So the fact that this commit took long has no bearing, positive or negative on the release. For example, the entire suite of PyroToken contract code was written in 2 weeks. quicker than a C4 audit.
2. The work here had to happen, regardless of who did it. The assumption here is either that I'm really bad at this or that two people working on the same narrow set of files even makes sense. The only reason to hire multiple devs is if multiple pieces of work need parceling out. This is actually becoming a possiblity but budget and legal issues have to be investigated. We can't just OTC a bunch of EYE willy nilly. There's a regulatory risk and a risk that the EYE will be dumped that has to be considered. Transitioning to a multi dev house is something Behodler has to do soon but I'd argue that doing it now would consume far more time than it saves. Beginning that process when Limbo is more imminent, on the contrary will accelerate development.
The best of both worlds right now would be to create an incentive for the UI dev to join us full time and take ownership of the dev process.
3. See 1. Also the caching situation has now been definitively contained by the prudent use of redux and jotai atoms. The viewModel is finally mature.
4. This is a common management temptation. In the face of opacity, those waiting on devs such as managers think that updates every 5 minutes combined with half hour meetings will bring more linearity to the process, as though the dev caught in the midst of difficult debugging is like Denethor clutching a Palantir for days on end, slowly losing their mind. The reality is that until the caching problem is fixed or close to fixed, the dev can't even be sure that it's caching that is the problem. The dev has to run many experiments, most of which fail So there's truly nothing to say that wouldn't be a lie of some sort or some sort of marketing. If I have a hypothesis and am close to confirming or denying it and report that I'm making good progress, only to have the hypothesis fail then I'm in a position where it looks like I'm providing false promises. Because I am.
On the contrary, many features are linear and well understood and providing timely updates is easy. Outside advice is also not very helpful because no one is close to the problem. I've seen people compare Behodler to planning nuclear power plants. And truly I say to you, there is nothing in common between the two types of projects so the comparison is entirely unhelpful. But having a thousand voices express constant doubt and concern is hard to ignore for the non-psychopathic. Yet a thousand votes of No doesn't make a Yes invalid. So in these moments, the best thing I can do for the sake of truth and sanity is flee to the wilderness, both to not cave to pressure which drowns out my judgment with social pressure, and to not feel the need to lie or tell soft lies to the community to "keep the price up".

Final closing note:
While code is timestamped, it's harder to roll back in time on telegram without tedium. Let it be recorded on Github that the Behodler community during these hard times of waiting has been amazing, patient and even generous in wanting to help financially. Once again, I'm amazed that we seem to have the best community in DeFi.