const fileLocation = './client/src/temp/BehodlerABIAddressMapping.json'
const fs = require('fs')
const ABIJson = JSON.parse(fs.readFileSync(fileLocation))


const tokens = ['MockToken1', 'MockToken2', 'MockWeth', 'MockToken3', 'MockToken4', 'Scarcity','FeeOnTransferToken']
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

const getItemByName = (name)=>addresses.filter(a=>a.name===name)[0]

let reorderedAddresses = []
tokens.forEach(token => {
    reorderedAddresses.push(getItemByName(token))
});

const daiItem = { name: 'dai', address: weidaiTokens['dai'] }
const weidaiItem = { name: 'weidai', address: weidaiTokens['weiDai'] }
reorderedAddresses.splice(2, 0, daiItem)
reorderedAddresses.splice(5, 0, weidaiItem)
console.log(JSON.stringify(reorderedAddresses,null,4))
baseTokenJSON.private = reorderedAddresses
const baseTokenString = JSON.stringify(baseTokenJSON, null, 4)
fs.writeFileSync(baseTokenLocation, baseTokenString)