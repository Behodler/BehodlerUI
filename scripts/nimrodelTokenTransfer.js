const fs = require("fs")
const { Console } = require("console")

const fileLocation = './nimrodelAddresses.json'

const addressJson = JSON.parse(fs.readFileSync(fileLocation))

const existingLocation = 'weidai/client/src/blockchain/nimrodelUI/nimrodelAddresses.json'
let existingJSON = JSON.parse(fs.readFileSync(existingLocation))

existingJSON.development = addressJson.development

fs.writeFileSync(existingLocation, JSON.stringify(existingJSON, null, 4))