## React 17 update incoherence

In a swap interface, there are plenty of fields that need to be updated simultaneously (eg. flipping the input/output addresses) and some that trigger a cascade of dependent changes. Managing all of this with state hooks can be cumbersome and error prone for 2 reasons:

1. Prior to React 18, a sequence of state hook updates are triggered as they roll in, even if you group them in a block.
2. Because of 1, you might be tempted to use viewModels and update entire viewModels at once but then we're back to old state management styles and it feels like a Java app.

While point 1 might tempt us into upgrading, it leaves the code in a bit of a smelly state. Furthermore, the upgrade process for a mature project is fraught with bugs and time sapping.

Back in the day before hooks, I used redux for state management in React. It was a trend at the time to use Redux plugins to allow for complex state management. However, when combined with typescript it lead to immense boilerplate code. If you forgo the boilerplate, you're left to pure javascript with absolutely no type checking because your payloads are just objects of type any and your actions are magic strings.
When React hooks came about, I like many others breathed a sigh of relief. It was declarative, simple and statically typed. I ignored the useReducer hook because I detected boilerplate hell and hissed.

To some extent I was right but the boilerplating is actually pretty mild and the pyroToken UI upgrade has necessesitated a re-look at state management. The flow between owning V2 and minting V3 can get a bit tangled when employing useEffect to manage all side effects.

Unfortunately once I'd written the reducer code, I realized, I'd have to re-write it for clean code reasons. Thankfully, GPT4 came to the rescue and there were a number of occasions where I could describe in English what I wanted to do and then offload a big chunk of code. What's more, I would have "meetings" with GPT4 where I'd discuss overall strategy and ask for opinions on tradeoffs. That's how I landed on using redux techniques in the end. So in the role of junior grunt dev and as software engineer co-worker, GPT4 really earned its monthly subscription fee.

### Immediate next steps
1. The exchange rate string is not working for PyroV2
2. Eth redemption with proxies.
3. Wire up popup for mass migrations.

## After Limbo
1. BehodlerProxies.