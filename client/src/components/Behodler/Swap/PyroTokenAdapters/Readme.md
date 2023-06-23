# Need for adapter pattern

The PyroToken UI deals with many variants of PyroTokens but abstracts that away to the end user. In order to not have buggy code bloat, the UI should not have to consider variants either. To achieve this we use the adapter pattern.

The Target is the set of common functions, each containing the union of parameters across implementations.
A factory takes in variables that correspond to user choices so that as the UI updates, the correct adapters are utilized, giving a kind of dependency injection feel to this, even if blockchain realities prevent true DI.
