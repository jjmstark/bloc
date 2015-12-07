var lw = require('ethlightjs');
var fs = require('fs');
var faucet = require("blockapps-js").routes.faucet;

module.exports = {
    writeKeyToDisk : writeKeyToDisk,
    generateKeyPreFaucet : generateKeyPreFaucet,
    generateKey : generateKey,
    readKeystore : readKeystore
}

function writeKeyToDisk (store) {
    return fs.writeFileSync('key.json', store.serialize()); // return for testing purposes, writeFileSync normally doesn't return anything
}

function generateKeyPreFaucet (password) {
    var seed = lw.keystore.generateRandomSeed();
    var store = new lw.keystore(seed, password);
    store.generateNewAddress(password);
    writeKeyToDisk(store);
    return store;
}
function generateKey (password) {
    var store = generateKeyPreFaucet(password);
    return faucet(store.addresses[0]);
}

function readKeystore() {
  return new lw.keystore.deserialize(fs.readFileSync('key.json'));
}
