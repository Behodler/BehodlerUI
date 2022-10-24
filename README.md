# Behodler UI: Pyrotokens dapp
The UI for Behodler Pyrotokens dapp. The codebase is used for building and publishing `@behodler/pyrotokens-legacy` npm package.

## Development

### Requirements
* `nodejs` >= 14
* `yarn`
* `docker` and `docker-compose` - optional for the fron-end dev, required to use Behodler local ganache dev blockchain

### Getting started

The fastest way to get started is to run the following command:
```
cd client && yarn install && yarn dev
```
It will install the front-end dependencies and start both the local Ganache dev environment with Behodler contracts pre-deployed (dev env is run inside a  `docker` container) and the front-end app development server. While the dev env is running, frontend can connect with the local chain using MetaMask (or any other web3 wallet supporting custom chains). Chain params: 
```
Network URL RPC: http://localhost:8545
Chain ID: 1337
```

`yarn behodler-dev-env:stop` should be used to stop the dev env.

### Publishing new package version

In order to publish a new version of `@behodler/pyrotokens-legacy` npm package, the `version` field of `client/package.json` file must be updated along with any other modifications that was made to the app. When `pyrotokens-package` branch is updated, the Github `publish` workflow will be run and given no errors occur, new package version wil be built and published automatically.

### Npm scripts overview
All scripts have to be run from within the `client/` directory.
* `yarn dev` - described in the Getting started section
* `yarn client:dev` - starts a front-end development server
* `yarn package:build` - creates a js bundle used when publishing new versions of `@behodler/pyrotokens-legacy` npm package
* `behodler-dev-env:start` - modifies contracts ABIs for dev network and starts a "dokerized" local Ganache dev chain with Behodler contracts deployed. 
* `yarn behodler-dev-env:stop` - terminates the Ganache docker container and restores the production ABI mappings.
* `yarn docker:dev` - starts both the Ganache dev env and the fron-end app inside docker containers
* `yarn docker:install` - installs dependencies using docker
* `yarn docker:dev-client` - same as `yarn client:dev` but using docker to start the dev server
* `docker:stop` - stopping the docker containers
