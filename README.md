# Behodler UI
The UI for Behodler is divided into a swap page and a dapps subdomain. This project is exclusively concerned with the swap sectiom

## Developers
If you would like to submit a pull request, it's required that you test and run the dapp through the docker containers specified in docker-compose. 

To start up the UI container,
```
npm start
```

To tear down the containers
```
npm stop
```

Do not try to install the node_modules manually. Instead run 
```
    npm run install:docker
```
which will run the container in the specified version of node known to work with the dependencies. It will then populate your local node_modules.