# Software Engineering

## Adapter pattern for future compatibility going forward

In the context of PyroTokens, while the UI provides a common mint/redeem interface, the underlying contracts are either PyroV2, PyroV3, PyroV2WethProxy or PyroV3WethProxy.
In the future, PyroCliffFace proxy will be added.

Similarly, the BehodlerSwap UI is going to face proxy divergence.

Having a standard UI with multiple implementations of common functions calls to mind the adapter software engineering pattern.

So for this commit, we have a common interface with the functions mint,redeem and redeemRate. In the adapter pattern this is called the *target*.

Each one has the union of paramters across all implementations. For instance if PyroV2 mint has paramers p1,p2 and p3 and PyroV3 has paramters p3 and p4 then the target mint function has p1,p2,p3 and p4.

Each version of contract will have a corresponding implementation of the target called the *adapter*. So PyroV2 will have PyroV2_adapter.

There will be a mapping function called an adapter factory which takes in the current context of the user interface and produces the correct adapter.

For instance, if the user selects eth and is minting V3 pyroweth, then the factory will produce the PyroWethV3_adapter.
Since this is context is triggered by the user, the factory will simply instantiate a the top level of the react component for which these context variables are controlled. Every time the UI selection is changed, the factory will automatically produce the correct target.

(I keep reverting to present tense because I'm writing this commit message as a plan in advance of implementation. Apologies to grammar death squads).

## Speeding up dev

Since the swap interface also faces the same problem, it will be helpful to bring this across. Indeed, we're approaching the point where there may be very little difference between swap and pyro on the code level (reunification? reconcilliation?)

# Still TODO before launch

Everything appears to be working which is oddly unsettling. Now we just need to hook up the mass migration functionality. This may take a bit of upfront thought to prevent it from taking long. My initial guess is to make another adapter and to add approve as a target function. Then the mass migration can approve all.