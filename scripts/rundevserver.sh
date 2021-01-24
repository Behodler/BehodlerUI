#!/bin/bash
clear
ganache-cli -l "0x6691b7" -q --account 0xcf4a9e84114acde4e307c37c27f91ea161516b83e70a8fe2096a97100beaedd9,100000000000000000000  --account 0xa84f68fd91d392d37fce35c6321e7374791401ae9dc8225fbd0c94b14b0228f2,100000000000000000000  --account 0x42228327bdf022414550a2408fc85c9fa9ab265caed99d152a47e352bc0f7402,100000000000000000000  --account 0xb581e78ac5a49da650c18da2129b1fffac4356841f7042f31861c6d0fb26693f,100000000000000000000  --account 0xbaee90ba02a49adc571a18a29d3f4c892b7ee3557bcc168ac69aa98cacddccf5,100000000000000000000  --account 0xb167f1093f00e1bb5648f600349dd8a6ef624c9192360bf90e2714ac4925d624,100000000000000000000  --account 0xafffe404f02fc452a6ec5660f317292d0dddf6ddd8cafe54374963beeed97d6b,100000000000000000000  --account 0xdf3b27a44ce588fcefce6f2a3092dcbfdaa59f00c3bd41a62eb8aee8d355ed08,100000000000000000000  --account 0xc3c7bda060ce60f6e812fe1f3fadc3980115f2cc92c7c4e8e3003671488d693e,100000000000000000000  --account 0xf48a7ae66e06d2cab86ade579fbd0e88014f1cfcedf6544e84a28492aa29a5f8,100000000000000000000 &
ganacheBID=$!
echo $ganacheBID > ganacheID.txt
sleep 2
echo "**************MIGRATING WEIDAI***********"
cd '/home/justin/weidai ecosystem/weidai'
truffle migrate
echo "**************MIGRATING BEHODLER***********"
echo ""
cd '/home/justin/weidai ecosystem/behodler'
truffle migrate
cp BehodlerABIAddressMapping.json ../behodlerUI/client/src/temp/
echo "**************MIGRATING BEHODLER 2**********"
cp BehodlerABIAddressMapping.json ../behodler2/Behodler1mappings.json
cd ../behodler2
cp '/home/justin/weidai ecosystem/weidai/client/src/tokenLocation.json' weidai.json
truffle migrate
cp ./build/contracts/Behodler.json ../behodlerUI/client/src/blockchain/behodler2UI/
# echo "**************MIGRATING SISYPHUS***********"
# echo ""
# cd ../Sisyphus
# truffle migrate
# cp sisyphusAddress.json ../behodlerUI/client/src/temp/
# echo "**************MIGRATING NIMRODEL***********"
# echo ""
# cd ../nimrodel
# truffle migrate
# cd ../
# node behodlerUI/scripts/nimrodelTokenTransfer.js
echo "**************CAPTURE DEV TRADING TOKENS***********"
echo ""
cd ../behodlerUI
node scripts/captureDevTokens.js
cd ../morgoth-dao
truffle migrate