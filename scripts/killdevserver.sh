#!/bin/bash
echo "killing dev server"
input="ganacheID.txt"
while IFS= read -r line
do
  kill $line
done < "$input"
killall node
echo "dev server shutdown"
rm ganacheID.txt
rm  ./client/src/temp/BehodlerABIAddressMapping.json
rm ./client/src/temp/sisyphusAddress.json
cp ./client/src/temp/ProductionMappings.json ./client/src/temp/BehodlerABIAddressMapping.json
cp ./client/src/temp/productionsis.json ./client/src/temp/sisyphusAddress.json