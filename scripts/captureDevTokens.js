const fileLocation = './client/src/temp/BehodlerABIAddressMapping.json'
const fs = require('fs')
const ABIJson = JSON.parse(fs.readFileSync(fileLocation))


const tokens = ['MockToken1', 'MockToken2', 'MockWeth', 'Scarcity']
const findPredicate = t => (value) => value == t.contract

let addresses = ABIJson.filter(j => j.name == "development")[0]
    .list
    .filter(t => tokens.findIndex(findPredicate(t)) !== -1)
    .map(v => (
        {
            name: v.contract,
            address: v.address
        }))



const baseTokenLocation = './client/src/blockchain/behodlerUI/baseTokens.json'
const baseTokenJSON = JSON.parse(fs.readFileSync(baseTokenLocation))

const weidaiTokens = JSON.parse(fs.readFileSync('./client/src/tokenLocation.json'))
addresses.push({name:'dai',address:weidaiTokens['dai']})
addresses.push({name:'weidai',address:weidaiTokens['weiDai']})

baseTokenJSON.private = addresses
const baseTokenString = JSON.stringify(baseTokenJSON, null, 4)
fs.writeFileSync(baseTokenLocation, baseTokenString)