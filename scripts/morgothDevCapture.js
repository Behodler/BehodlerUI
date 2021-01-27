const endFileLocation = './client/src/blockchain/behodler2UI/Morgoth/Addresses.json'
const devLocation = './temp/DevAddresses.json'
const fs = require('fs')

let block = JSON.parse(fs.readFileSync(endFileLocation,'utf8'))
const devBlock = JSON.parse(fs.readFileSync(devLocation,'utf8'))
block.development = devBlock

fs.writeFileSync(endFileLocation,JSON.stringify(block,null,4))