const fileLocation = './client/src/temp/BehodlerABIAddressMapping.json'
const fs = require('fs')
const ABIJson = JSON.parse(fs.readFileSync(fileLocation))


const tokens = ['MockToken1', 'MockToken2', 'MockWeth', 'Scarcity']
const findPredicate = t => (value) => value == t.contract

let addresses = ABIJson.filter(j => j.name == "development")[0]
    .list
    .filter(t => tokens.findIndex(findPredicate(t)) !== -1)
    .map((v) => v.address)

const baseTokenLocation = './client/src/blockchain/behodlerUI/baseTokens.json'
const baseTokenJSON = JSON.parse(fs.readFileSync(baseTokenLocation))
baseTokenJSON.private = addresses
const baseTokenString = JSON.stringify(baseTokenJSON, null, 4)
fs.writeFileSync(baseTokenLocation, baseTokenString)

const path = require('path');
const imageDirectory = './client/src/blockchain/behodlerUI/images/private'
const files = fs.readdirSync(imageDirectory).map(file => path.join(imageDirectory, file))

for (let i = 0; i < files.length; i++) {
    const newPath = path.join(imageDirectory, i + '.png')
    fs.renameSync(files[i], newPath)
}

for (let i = 0; i < files.length; i++) {
    const oldPath = path.join(imageDirectory, i + '.png')
    const newPath = path.join(imageDirectory, addresses[i] + '.png')
    fs.renameSync(oldPath, newPath)
}
