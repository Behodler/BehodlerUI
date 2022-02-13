# Behodler UI: Swap dapp
The UI for Behodler Swap dapp. The codebase is used for building and publishing `@behodler/swap-legacy` npm package.

## Development

`yarn` should be used as the main package manager for the repo. Using `npm` to install dependencies will most probably fail.

The app can be run either in a `docker` container or using the local environment.

To start the app locally, run:
```
yarn start:dev
```

To start up the app in a `docker` container, run:
```
yarn start
```

To tear down the `docker` containers
```
yarn stop
```
One of the dependencies is a package on Behodler's github. You'll need to log in to github packages in order to install it. First, create an access token on github. The value in the access token is your password.
Run 
```
 npm login --registry=https://npm.pkg.github.com --scope=@behodler
```
In the prompt, password refers to the password above. Unfortunately logging into gihub package manager as a local user doesn't extend to the context of docker so you'll need to install running outside of docker: 

```
yarn
```
This will run the container in the specified version of node known to work with the dependencies. It will then populate your local node_modules.

## Dev server
So as to simulate the mechanics of Behodler, a dev instance of ganache has been included with contracts pre deployed. To run the dev ganache as well as the dev server
```
yarn start:dev
```
In order to get free eth, you'll need to use the following seed phrase

```
eight fun oak spot hip pencil matter domain bright fiscal nurse easy 
```
Do note that the images of the tokens will be out of sync because they don't correspond to mainnet images. This is normal.

## Publishing new package version

In order to publish a new version of `@behodler/swap-legacy` npm package, the `version` field of `client/package.json` file must be updated along with any other modifications that was made to the app. When `swap-package` branch is updated, the Github `publish` workflow will be run and given no errors occur, new package version wil be built and published automatically. 
