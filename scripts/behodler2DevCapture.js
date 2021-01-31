const fs = require('fs')
const destination = './client/src/blockchain/behodler2UI/Addresses.json'
const origin = './temp/behodler2DevAddresses.json'

let destinationObject = JSON.parse(fs.readFileSync(destination))
let originObject = JSON.parse(fs.readFileSync(origin))
destinationObject.development = originObject
console.log('destination object: ' + JSON.stringify(destinationObject, null, 4))
fs.writeFileSync(destination, JSON.stringify(destinationObject, null, 4))