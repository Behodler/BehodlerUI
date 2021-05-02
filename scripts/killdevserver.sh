#!/bin/bash
cd client/
npm run stop
cd ../
rm  ./client/src/temp/BehodlerABIAddressMapping.json
rm ./client/src/temp/sisyphusAddress.json
cp ./client/src/temp/ProductionMappings.json ./client/src/temp/BehodlerABIAddressMapping.json
cp ./client/src/temp/productionsis.json ./client/src/temp/sisyphusAddress.json