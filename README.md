# Proxy-Swap-Upgrade

## Motivation for branch

The swap branch was created prior to Limbo and the proxy infrastructure. We need a new swap page that seamlessly detects if an input or output token in a swap is linked to a proxy and to orchestrate the swap through the proxy.

### But why branch off pyrotokens and not swap

PyroTokens already uses the adapter pattern for managing context dependent minting. In src/components/Behodler/Swap/PyroTokenAdapters the adapterFactory instantiates a PyroToken adapter which can be passed on to the UI components without requiring they manage PyroToken logic.

In PyroTokens, if the holder of a given token has both V2 and V3 balances and they wish to redeem then the adapter automatically wraps the V2 version, forcing the holder to first clear their V2 balance.

### How behodler proxies work

The status quo on Behodler is that when a new token is listed, Behodler approves trading for that token and the holder directly trades the token in and out of Behodler. Behodler then maintains a balance. This behaviour is pretty similar to Uniswap LPs except that Behodler can list unlimited tokens and consequently and has no router. To sell, a holder call the Behodler swap function, setting the input token address to the token that will be sold. To mint SCX (Behodler's version of an LP token), the addLiquidity function is called.

The danger to this approach is if a malicious token is listed or one that rapidly loses value is listed. In this case, holders of the bad token will rapidly sell onto Behodler, draining its value until it becomes simply a wrapper for the bad token.

In response, a protective guardrails contract was created called CliffFace which wraps the underlying tradeable token. Here, rather than Behodler approving and listing the underlying token, it lists the CliffFace proxy token. The proxy has swapAsInput and swapAsOutput functions. 

Eg. Suppose we wish to list a memecoin called DumpsterFire. To contain the risk that DumpsterFire fails, we deploy a CliffFace proxy contract which wraps DumsterFire and approve the cliffFace on Behodler. A holder wishing to sell into Behodler will call the CliffFace.swapAsInput which will deduct DumpsterFire from the holder and mint DumpsterFire according to the prevailing redeem rate. It will then swap the newly minted CliffFace tokens into Behodler and transfer the output token to the DumpsterFire seller.

The redeem rate remains static until a large selloff occurs. CliffFace proxies can detect abnormally large sales and automatically increase the redeem rate for the seller. This sudden increase in the marginal redeem rate, pushes the burden of a sudden dump back onto the seller by essentially giving unusually high slippage.

The average redeem rate for all users increases after this trade.

### Back to PyroToken adapters

The TokenProxyRegistry contract maintains a list of known proxies.
When a user selects a token for trade from the selection list, the UI should first consult the TokenProxyRegistry for a known BehodlerProxy address. If one exists, then the UI should consult Behodler to see if the proxy is listed for trade. If it hasn't then it's likely the token hasn't been migrated from Limbo yet.
If TokenProxyRegistry has no known address for the base token then the UI should consult Behodler for having approved the base token.

Rather than handling this at the React component level, the enquiries should be passed as parameters into a tokenadapter factory which can then select the appropriate proxy wrapping in exactly the same way that PyroTokens currently manages it.

### What about slippage

If a swap is expected to trigger CliffFace protections then the UI should infer the expected output and calculate the slippage correctly so that a user looking to dump will be presented with a startlingly high slippage.

Using the correct proxy, the UI should allow a user to swap either in or out without ever knowing of underlying proxies.

### How the UI should look

The UI must look and feel just like the current Behodler UI, including subtle functionality like button greying etc.

### What happens to the PyroToken UI?

After a cliffFace is migrated to Behodler, a new PyroToken will exist. However, the PyroToken will technically be of the CliffFace.

So if, we list Dumpster via Cliff, the Pyro will technically be PyroCliff. However the user will not want to deal with or see PyroCliff and the redeem rate will mean nothing to them.
So we want PyroTokens to appear as if there is no intermediary CliffFace. To this end, we created the ProxyHandler contract which handles direct base to Pyro minting and redeeming via proxies if needs be.
If 1 PyroDump is worth 2 Cliff and 1 Cliff is worth 3 Dumpster then we can use this ProxyHandler on the UI to calculate the redeem rate of PyroDumpster to correctly be 6 Dump

To achiever this seamlessly, the PyroTokenAdapter will need to get a new CliffFace adapter which makes use of the ProxyHandler contract.

### Testing locally

The Limbo project has a dev server that presents an API for retrieving deployed addresses. It supports declarative deployment so that we can specify recipes of deployment to more carefully suit a given dev need (such as PyroCliff face tokens). Speak to Justin for how to set that up locally for rapid iteration.