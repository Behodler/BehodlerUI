#!/bin/bash
clear
redis-server --port 9019 &
cd client/
npm run ganache
cd ../
sleep 2
echo "**************MIGRATING WEIDAI***********"
cd '/home/justin/weidai ecosystem/weidai'
rm -rf build
truffle migrate
echo "**************MIGRATING BEHODLER***********"
echo ""
cd '/home/justin/weidai ecosystem/behodler'
rm -rf build
truffle migrate
cp BehodlerABIAddressMapping.json ../behodlerUI/client/src/temp/
echo "**************MIGRATING BEHODLER 2**********"
cp BehodlerABIAddressMapping.json ../behodler2/Behodler1mappings.json
cd ../behodler2
cp '/home/justin/weidai ecosystem/weidai/client/src/tokenLocation.json' weidai.json
rm -rf build
truffle migrate
cp ./build/contracts/Behodler.json ../behodlerUI/client/src/blockchain/behodler2UI/
cp behodler2DevAddresses.json ../behodlerUI/temp/
cp weth10.txt ../behodlerUI/temp/
cd ../behodlerUI
node ./scripts/behodler2DevCapture.js
echo "**************CAPTURE DEV TRADING TOKENS***********"
echo ""
node scripts/captureDevTokens.js
cd ../morgoth-dao
echo "*************MIGRATING MORGOTH*********************"
rm -rf build
truffle migrate
cp DevAddresses.json ../behodlerUI/temp/
cd ../behodlerUI
node scripts/morgothDevCapture.js
echo "*************LIQUID QUEUE*********************"
cd ../LiquidQueue
rm -rf build
truffle migrate
cp deploymentObject.json ../behodlerUI/client/src/blockchain/liquidQueue/Addresses.json